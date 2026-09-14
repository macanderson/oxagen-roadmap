# Oxagen DoD: the definition of done for agent runs

| | |
|---|---|
| **Status** | Spec v2, for build |
| **Date** | 2026-09-14 |
| **Owner** | Mac Anderson |
| **Source** | `macanderson/oxagen` as of 2026-09-14: the run ledger, the capability registry, governed-action metering and the Stella engine client as they exist there |
| **Builds on** | ADR-041 (one canonical JSON rule), ADR-043 (Oxagen governs, it does not run), ADR-052 (the governed action is the billable unit), ADR-049 (the repository's `dod` GitHub check) |
| **Related** | `mission-control-spec.md` §8.6 and §12.1; `scope-review.md` |

DoD is a working name.

## An agent cannot finish until the dod says so

You type a prompt into Claude Code. Before the agent moves, Oxagen writes the acceptance checks for that prompt and locks them. The agent works. When it tries to stop, the checks run. If they fail, the agent gets the failing ids and keeps going. If they pass, Oxagen signs a certificate against the sealed run and meters one governed action. Humans can write the checks by hand for repeatable tasks. Either way, the file is the only definition of done.

1. **Prompt.** The `UserPromptSubmit` hook. Oxagen drafts the set, or loads a hand-written one. Locked by digest, written to `.oxagen/dod/<run>.yaml`.
2. **Work.** The agent reads its definition of done. `PreToolUse` logs every call and refuses the ones the set denies.
3. **Stop.** The `Stop` hook runs every check plus hidden holdouts. `decide()` returns a verdict.
4. **Block or seal.** BROKEN with attempts left: the stop is blocked and the agent sees the failing ids. Otherwise the evidence is submitted.
5. **Settle.** Oxagen re-runs `decide()`, binds to the sealed attempt, signs, stores, and meters `dod.held`.

## Three decisions do all the work

**The file is the contract.** One YAML file, six check kinds, locked by digest before the agent starts. The agent can read it and cannot change it. A human can write it instead of the model. A template can supply it for a task that repeats.

**One pure function decides.** `decide(evidence)` has no clock, network, filesystem, or model. The harness and the cloud run the same function on the same evidence and get the same bytes. That is the whole determinism claim, and it is testable.

**Oxagen never runs anything.** Checks execute where the agent executes. Oxagen validates evidence, re-decides, binds the outcome to the run ledger's sealed attempt, and signs. This matches ADR-043 and keeps the platform's cost flat.

This is the runtime counterpart of the repository's existing `dod` GitHub check (ADR-049). That one gates a pull request on an issue checklist. This one gates a run on mechanical evidence. Later, `dod` can read a DoD certificate instead of a checklist.

## Six check kinds, nothing else

A model drafts this from the prompt. A person can write it in an editor. Both go through the same schema, and the schema rejects a set with no executable check. Anything not covered by these six kinds is a `run` check that calls a script.

```yaml
# .oxagen/dod/run_01J9AB3K.yaml   (locked; the agent may read it, never edit it)
dod: 1
task: Add per-key rate limiting to POST /v1/keys
run: run_01J9AB3K
locked: sha256:4c1f9e02b77a13d4a1f0c0de5a91b26e7e4c8a0d3f1e2b9c7d6a5f4e3d2c1b0a

checks:
  - id: unit
    run: pnpm --filter @oxagen/api test:unit -- keys

  - id: typecheck
    run: pnpm --filter @oxagen/api typecheck

  - id: scope
    diff:
      allow: [apps/api/**, packages/rules/**]
      deny:  [packages/database/migrations/**, "**/.env*"]

  - id: wired
    file:
      path: apps/api/src/routes/v1/keys.ts
      contains: "rateLimit("

  - id: no-secrets
    tools:
      deny: ["Read(**/.env*)", "Bash(cat *.env*)", "Bash(curl *)"]

  - id: budget
    budget: { usd: 3.00, tool_calls: 120, minutes: 20, stop_attempts: 3 }

  - id: reviewer
    human: Endpoint behavior matches issue #2701
```

| Kind | Passes when | Evidence recorded |
|---|---|---|
| `run` | The command exits 0 inside the timeout, with credentials scrubbed from the environment. | sha256 of stdout and stderr |
| `file` | The path exists, contains the string, or matches the digest. | sha256 of the file bytes |
| `diff` | Every changed or new file matches an allow glob and no deny glob. | sha256 of the diff manifest |
| `tools` | No tool call matched a deny pattern. Enforced live by the `PreToolUse` hook, not after the fact. | sha256 of the tool log |
| `budget` | Cost, tool calls, and minutes stay under the limits. `stop_attempts` caps how many times the Stop hook may block. | the usage counters |
| `human` | A named person signs it after the run. It never blocks the agent; it withholds the certificate. | the signature |

**Hidden checks.** At lock time the cloud may keep some drafted checks back. They never appear in the file. The Stop hook fetches them and runs them alongside the visible ones. An agent that games the visible set, for example by editing the tests it was told to pass, meets the hidden one.

## Three verdicts, eight reasons

| Verdict | Meaning |
|---|---|
| **HELD** | Every executable check passed, no tool was denied, budget held, no human check outstanding. Signed. Metered as a governed action. |
| **PENDING** | Every executable check passed. One or more human checks are waiting for a signature. Becomes HELD on `oxagen dod sign`. Metered at a lower tier. |
| **BROKEN** | One of the eight reasons. The certificate records which checks failed. Not metered. |

State is carried by shape, not color: double border, dashed border, single border. The reason list is closed. Adding a reason means amending the ADR.

```ts
// packages/dod/src/reasons.ts
// Closed. A reason not in this list is a bug, not a new reason.
export const REASONS = {
  CHECK_FAILED: "a check in the locked set did not pass",
  TOOL_DENIED: "the agent called a tool the set forbids",
  BUDGET_EXCEEDED: "cost, time, or tool-call budget exceeded",
  ATTEMPTS_EXHAUSTED: "the agent tried to finish more times than the set allows",
  LOCK_MISMATCH: "the dod file on disk does not match the locked digest",
  EVIDENCE_INVALID: "evidence did not validate or its digests do not chain",
  HUMAN_PENDING: "every executable check passed; a human signature is outstanding",
  HARNESS_ERROR: "the harness could not run a check; never treated as a pass",
} as const;

export type Reason = keyof typeof REASONS;
export type Verdict = "HELD" | "PENDING" | "BROKEN";
```

## Two new packages, four capabilities, three hooks

Everything else is an edit to a file that already exists. The pure package has no dependency on the harness, and the API never imports the harness.

```text
oxagen/
├── packages/
│   ├── dod/                       pure: language, verdict, lock. Executes nothing. No deps beyond zod + run-evidence.
│   │   └── src/
│   │       ├── schema.ts              six check kinds, Dod
│   │       ├── reasons.ts             closed reason enum, three verdicts
│   │       ├── verdict.ts             decide(evidence) → outcome
│   │       ├── lock.ts                lockDigest, assertLocked
│   │       ├── draft-prompt.ts        the authoring prompt (cloud uses it; humans can ignore it)
│   │       └── index.ts
│   ├── dod-harness/               runs beside the agent. Ships inside the CLI. Never imported by apps/api.
│   │   └── src/
│   │       ├── checks/{run,file,diff}.ts
│   │       ├── collect.ts             run checks, fold usage from the tool log, build Evidence
│   │       ├── store.ts               .oxagen/dod/*.yaml and .oxagen/runs/<run>/tools.jsonl
│   │       ├── hooks.ts               onPrompt, onTool, onStop
│   │       └── api.ts                 draft, lock, hidden, settle
│   ├── oxagen/src/contracts/
│   │   ├── dod.draft.ts           capability: draft a set from a prompt (calls @oxagen/ai)
│   │   ├── dod.lock.ts            capability: register a locked set (visible + hidden)
│   │   ├── dod.settle.ts           capability: decide, bind, sign, meter
│   │   └── dod.sign.ts            capability: human signature on a PENDING run
│   ├── handlers/src/dod.*.ts      the four handlers
│   ├── database/src/schema/dod.ts dod_sets, dod_certificates
│   └── billing/src/actions.ts         + "dod.held" governed action (ADR-052)
├── apps/
│   ├── api/src/routes/v1/dod.*.ts Hono routes, one per capability, same pattern as agent.*
│   └── cli/src/commands/dod.ts    oxagen dod hook|new|lock|run|sign|status
├── .claude/settings.json              three hooks
├── .oxagen/dod/                   locked sets (committed), templates/ for repeatable tasks
└── docs/adr/ADR-055-dod-gates-runs-not-only-pull-requests.md
```

## The code that matters

These are the load-bearing files. The rest is wiring in the existing shapes: `registerCapability`, Hono routes, commander commands, drizzle tables with the org mixin.

### The language

```ts
// packages/dod/src/schema.ts
// The whole dod language. Six check kinds; everything else composes from `run`.
import { z } from "zod";

const id = z.string().regex(/^[a-z0-9][a-z0-9-]{0,39}$/);

export const RunCheck = z.object({ id, run: z.string().min(1), timeout_s: z.number().int().positive().default(600) });
export const FileCheck = z.object({
  id,
  file: z.object({
    path: z.string().min(1),
    exists: z.boolean().optional(),
    contains: z.string().optional(),
    sha256: z.string().regex(/^sha256:[0-9a-f]{64}$/).optional(),
  }),
});
export const DiffCheck = z.object({
  id,
  diff: z.object({ allow: z.array(z.string()).default(["**"]), deny: z.array(z.string()).default([]) }),
});
export const ToolsCheck = z.object({ id, tools: z.object({ deny: z.array(z.string()).min(1) }) });
export const BudgetCheck = z.object({
  id,
  budget: z.object({
    usd: z.number().positive().optional(),
    tool_calls: z.number().int().positive().optional(),
    minutes: z.number().positive().optional(),
    stop_attempts: z.number().int().min(1).max(10).default(3),
  }),
});
export const HumanCheck = z.object({ id, human: z.string().min(1) });

export const Check = z.union([RunCheck, FileCheck, DiffCheck, ToolsCheck, BudgetCheck, HumanCheck]);
export type Check = z.output<typeof Check>;

export const Dod = z.object({
  dod: z.literal(1),
  task: z.string().min(1),
  run: z.string().regex(/^run_[0-9A-HJKMNP-TV-Z]{8,}$/),
  locked: z.string().regex(/^sha256:[0-9a-f]{64}$/).optional(),
  checks: z.array(Check).min(1).max(40),
}).superRefine((set, ctx) => {
  const ids = set.checks.map((c) => c.id);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "check ids must be unique" });
  if (!set.checks.some((c) => "run" in c || "file" in c || "diff" in c))
    ctx.addIssue({ code: "custom", message: "at least one executable check (run, file, or diff) is required" });
});
export type Dod = z.output<typeof Dod>;
```

### The decision

```ts
// packages/dod/src/verdict.ts
// Pure. No clock, no network, no filesystem. Same evidence in, same bytes out.
import type { Reason, Verdict } from "./reasons";
import type { Dod } from "./schema";

export interface CheckResult {
  id: string;
  ok: boolean;
  evidence: `sha256:${string}`;   // digest of stdout/stderr, file bytes, diff manifest, or tool log
  error?: true;                    // harness could not run it
}
export interface Evidence {
  set: Dod;                 // as locked
  lockOnDisk: string;              // digest of the file the harness actually read
  results: CheckResult[];
  usage: { usd: number; toolCalls: number; minutes: number; stopAttempts: number };
  denials: string[];               // tool calls refused by the guard hook
  signatures: string[];            // human check ids that carry a signature
}
export interface Outcome { verdict: Verdict; reasons: Reason[]; failed: string[] }

export function decide(e: Evidence): Outcome {
  const reasons: Reason[] = [];
  const failed: string[] = [];

  if (e.set.locked !== e.lockOnDisk) reasons.push("LOCK_MISMATCH");
  if (e.denials.length > 0) reasons.push("TOOL_DENIED");

  const budget = e.set.checks.find((c) => "budget" in c);
  if (budget && "budget" in budget) {
    const b = budget.budget;
    if ((b.usd && e.usage.usd > b.usd) || (b.tool_calls && e.usage.toolCalls > b.tool_calls) || (b.minutes && e.usage.minutes > b.minutes))
      reasons.push("BUDGET_EXCEEDED");
    if (e.usage.stopAttempts > b.stop_attempts) reasons.push("ATTEMPTS_EXHAUSTED");
  }

  for (const c of e.set.checks) {
    if ("human" in c || "tools" in c || "budget" in c) continue;
    const r = e.results.find((x) => x.id === c.id);
    if (!r) { failed.push(c.id); reasons.push("HARNESS_ERROR"); continue; }
    if (r.error) { failed.push(c.id); reasons.push("HARNESS_ERROR"); continue; }
    if (!r.ok) { failed.push(c.id); reasons.push("CHECK_FAILED"); }
  }

  if (reasons.length > 0) return { verdict: "BROKEN", reasons: dedupe(reasons), failed };

  const humans = e.set.checks.filter((c) => "human" in c).map((c) => c.id);
  const unsigned = humans.filter((h) => !e.signatures.includes(h));
  if (unsigned.length > 0) return { verdict: "PENDING", reasons: ["HUMAN_PENDING"], failed: unsigned };

  return { verdict: "HELD", reasons: [], failed: [] };
}

const dedupe = <T,>(xs: T[]) => [...new Set(xs)];
```

```ts
// packages/dod/src/lock.ts
// One digest rule for the whole repo (ADR-041): RFC 8785 canonical JSON, then sha256.
import { digestJcs, type Sha256Digest } from "@oxagen/run-evidence";
import { Dod } from "./schema";

/** Digest of the set with `locked` removed, so the value cannot depend on itself. */
export function lockDigest(set: Dod): Sha256Digest {
  const { locked: _omit, ...rest } = set;
  return digestJcs(rest);
}

export function assertLocked(set: Dod, onDisk: Sha256Digest): void {
  if (!set.locked) throw new Error("dod is not locked");
  if (set.locked !== onDisk) throw new Error("LOCK_MISMATCH");
}
```

### The harness

Runs beside the agent. Ships inside the CLI. Three hook handlers, each a thin adapter over the pure package.

```ts
// packages/dod-harness/src/hooks.ts
// Three Claude Code hooks. Each reads the hook JSON on stdin and answers on stdout.
// Nothing here decides anything; `decide()` in @oxagen/dod does.
import { decide, Dod, lockDigest, type Evidence } from "@oxagen/dod";
import { api } from "./api";                 // thin client over apps/api /v1/dod/*
import { collect } from "./collect";         // runs checks, folds usage, reads the tool log
import { readLocked, writeLocked, appendToolEvent, toolDenied } from "./store";

/** UserPromptSubmit: draft (or load) the set, lock it, hand the agent its definition of done. */
export async function onPrompt(input: { session_id: string; prompt: string; cwd: string }) {
  const existing = readLocked(input.cwd, input.session_id);
  const set = existing ?? (await api.draft({ prompt: input.prompt, cwd: input.cwd, run: input.session_id }));
  if (!existing) {
    const locked = Dod.parse({ ...set, locked: lockDigest(set) });
    await api.lock(locked);                  // the cloud keeps a copy; hidden checks stay there
    writeLocked(input.cwd, locked);
  }
  return {
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext:
        `Definition of done is locked at .oxagen/dod/${input.session_id}.yaml. ` +
        `You cannot finish until every check passes. Do not edit that file.`,
    },
  };
}

/** PreToolUse: refuse tools the set denies; log every call for the budget and evidence. */
export function onTool(input: { session_id: string; cwd: string; tool_name: string; tool_input: unknown }) {
  const set = readLocked(input.cwd, input.session_id);
  appendToolEvent(input.cwd, input.session_id, input.tool_name, input.tool_input);
  const rule = set && toolDenied(set, input.tool_name, input.tool_input);
  if (!rule) return {};
  return { hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: `dod: ${rule}` } };
}

/** Stop: run the checks. Block the stop with the failures, or settle and let it end. */
export async function onStop(input: { session_id: string; cwd: string; stop_hook_active: boolean }) {
  const set = readLocked(input.cwd, input.session_id);
  if (!set) return {};                                            // no dod, no opinion
  const hidden = await api.hidden(set.run);                       // holdout checks the agent never saw
  const evidence: Evidence = await collect(input.cwd, { ...set, checks: [...set.checks, ...hidden] });
  const outcome = decide(evidence);

  const exhausted = outcome.reasons.includes("ATTEMPTS_EXHAUSTED");
  if (outcome.verdict === "BROKEN" && !exhausted) {
    return { decision: "block", reason: `dod: ${outcome.reasons.join(", ")}. Failed: ${outcome.failed.join(", ")}` };
  }
  await api.settle({ run: set.run, evidence, outcome });           // sealed, signed, metered in the cloud
  return {};                                                       // HELD, PENDING, or exhausted: the run ends honestly
}
```

```ts
// packages/dod-harness/src/checks/run.ts
// The only check that executes anything. It runs where the agent runs, never in Oxagen.
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import type { CheckResult } from "@oxagen/dod";

export function runCheck(id: string, cmd: string, cwd: string, timeoutS: number): Promise<CheckResult> {
  return new Promise((resolve) => {
    const hash = createHash("sha256");
    const child = spawn(cmd, { cwd, shell: true, env: scrubbed(process.env), stdio: ["ignore", "pipe", "pipe"] });
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutS * 1000);
    child.stdout.on("data", (d) => hash.update(d));
    child.stderr.on("data", (d) => hash.update(d));
    child.on("error", () => { clearTimeout(timer); resolve({ id, ok: false, error: true, evidence: `sha256:${hash.digest("hex")}` }); });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      if (signal) return resolve({ id, ok: false, error: true, evidence: `sha256:${hash.digest("hex")}` });
      resolve({ id, ok: code === 0, evidence: `sha256:${hash.digest("hex")}` });
    });
  });
}

/** Keep the toolchain, drop credentials. A check that needs a secret is not a dod check. */
function scrubbed(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const keep = ["PATH", "HOME", "SHELL", "LANG", "TERM", "NODE_OPTIONS", "PNPM_HOME", "CI"];
  return Object.fromEntries(keep.filter((k) => env[k]).map((k) => [k, env[k]]));
}
```

```ts
// packages/dod-harness/src/checks/diff.ts
// Scope is a diff manifest, not a database snapshot. Cheap, and it works on a live repo.
import { execFileSync } from "node:child_process";
import { digestJcs } from "@oxagen/run-evidence";
import { matchesAny } from "@oxagen/glob";
import type { CheckResult } from "@oxagen/dod";

export function diffCheck(id: string, cwd: string, base: string, allow: string[], deny: string[]): CheckResult {
  const out = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { cwd, encoding: "utf8" });
  const untracked = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], { cwd, encoding: "utf8" });
  const files = [...out.split("\n"), ...untracked.split("\n")].filter(Boolean).sort();
  const outside = files.filter((f) => !matchesAny(f, allow) || matchesAny(f, deny));
  return { id, ok: outside.length === 0, evidence: digestJcs({ base, files, outside }) };
}
```

### The install

The whole harness, from the developer's side, is three lines in `.claude/settings.json`. Stella can call the same CLI from its own hook points.

```jsonc
// .claude/settings.json   (the harness is three hook lines; the CLI does the rest)
{
  "hooks": {
    "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "oxagen dod hook prompt", "timeout": 60 }] }],
    "PreToolUse":       [{ "matcher": "", "hooks": [{ "type": "command", "command": "oxagen dod hook tool" }] }],
    "Stop":             [{ "hooks": [{ "type": "command", "command": "oxagen dod hook stop", "timeout": 900 }] }]
  }
}
```

```ts
// apps/cli/src/commands/dod.ts   (wired in program.ts like `cost` and `budget`)
import { Command } from "commander";
import { onPrompt, onTool, onStop } from "@oxagen/dod-harness/hooks";
import { readStdinJson, writeJson } from "../lib/output.js";

export function dodCommand(): Command {
  const cmd = new Command("dod").description("Definition of done for agent runs");

  cmd.command("hook <event>")
    .description("Claude Code hook adapter: prompt | tool | stop (reads hook JSON on stdin)")
    .action(async (event: "prompt" | "tool" | "stop") => {
      const input = await readStdinJson();
      const out = event === "prompt" ? await onPrompt(input) : event === "tool" ? onTool(input) : await onStop(input);
      writeJson(out);
    });

  cmd.command("new <task>")
    .description("Author a dod by hand (opens .oxagen/dod/<run>.yaml unlocked)")
    .action(async (task: string) => { /* scaffold, open $EDITOR, do not lock */ });

  cmd.command("lock [file]").description("Lock a hand-written set and register it").action(async () => { /* … */ });
  cmd.command("run [file]").description("Run checks locally and print the outcome (no certificate)").action(async () => { /* … */ });
  cmd.command("sign <run> <check>").description("Add a human signature to a PENDING run").action(async () => { /* … */ });
  cmd.command("status <run>").description("Show verdict, reasons, and the certificate").action(async () => { /* … */ });
  return cmd;
}
```

### The cloud

One capability per verb, same shape as `agent.approval.resolve`. The settle handler is the only one with logic; it re-decides, binds to the sealed attempt, signs, and meters.

```ts
// packages/oxagen/src/contracts/dod.settle.ts   (same shape as every other capability)
import { z } from "zod";
import { registerCapability } from "../registry";
import { Dod } from "@oxagen/dod";

export const dodSettle = registerCapability({
  name: "settle_dod",
  domain: "dod",
  description: "Verify a run's evidence against its locked dod and mint a signed certificate",
  mode: "sync",
  surfaces: ["api", "cli"],
  layers: ["schema", "api", "unit", "docs"],
  scoped: true,
  agent: { requiresApproval: false, riskLevel: "low", category: "verification" },
  sensitivity: "medium",
  defaultEffect: "deny",
  defaultRoles: { org: { Owner: "allow", Admin: "allow" }, workspace: { Owner: "allow", Member: "allow" } },
  input: z.object({
    run: z.string(),
    evidence: z.object({
      set: Dod,
      lockOnDisk: z.string(),
      results: z.array(z.object({ id: z.string(), ok: z.boolean(), evidence: z.string(), error: z.literal(true).optional() })),
      usage: z.object({ usd: z.number(), toolCalls: z.number(), minutes: z.number(), stopAttempts: z.number() }),
      denials: z.array(z.string()),
      signatures: z.array(z.string()),
    }),
  }),
  output: z.object({
    certificate: z.string(),                 // dodc_…
    verdict: z.enum(["HELD", "PENDING", "BROKEN"]),
    reasons: z.array(z.string()),
    attempt: z.string(),                     // arat_… the sealed attempt this certificate is bound to
    signature: z.string(),                   // ed25519 over the canonical certificate
  }),
});
```

```ts
// packages/handlers/src/dod.settle.ts
// The cloud executes nothing (ADR-043). It re-decides from evidence, binds to the sealed
// attempt, signs, stores, and meters one governed action (ADR-052).
import { decide, lockDigest } from "@oxagen/dod";
import { digestJcs } from "@oxagen/run-evidence";
import { sign } from "@oxagen/crypto";
import { meterGovernedAction } from "@oxagen/billing";
import { insertCertificate, loadLockedSet } from "@oxagen/database/dod";
import { sealedAttemptFor } from "@oxagen/run-ledger";

export async function settleDod(input: DodSettleInput, ctx: CapabilityContext) {
  const stored = await loadLockedSet(ctx, input.run);                       // what the harness registered at lock
  if (!stored || stored.locked !== lockDigest(input.evidence.set)) {
    return reject(ctx, input, ["LOCK_MISMATCH"]);
  }
  const outcome = decide(input.evidence);                                    // same function the harness ran
  const attempt = await sealedAttemptFor(ctx, input.run);                    // arat_…, with its stream digest
  const body = {
    run: input.run, attempt: attempt.publicId, streamDigest: attempt.eventStreamDigest,
    lock: stored.locked, verdict: outcome.verdict, reasons: outcome.reasons,
    results: input.evidence.results, issuedAt: ctx.now().toISOString(),
  };
  const certificate = { id: publicId("dodc_"), body, digest: digestJcs(body) };
  const signature = await sign(ctx.org.signingKey, certificate.digest);
  await insertCertificate(ctx, { ...certificate, signature });
  if (outcome.verdict !== "BROKEN") {
    await meterGovernedAction(ctx, { action: "dod.held", ref: certificate.id, tier: outcome.verdict });
  }
  return { certificate: certificate.id, verdict: outcome.verdict, reasons: outcome.reasons, attempt: attempt.publicId, signature };
}
```

```ts
// packages/database/src/schema/dod.ts   (two tables; RLS by org like everything else)
import { pgSchema, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { orgScoped } from "./_mixins";

export const dod = pgSchema("dod");

export const dodSets = dod.table("dod_sets", {
  ...orgScoped,
  run: text("run").notNull(),
  locked: text("locked").notNull(),                 // sha256:…  the lock digest
  visible: jsonb("visible").notNull(),              // the set the agent can read
  hidden: jsonb("hidden").notNull().default([]),    // holdout checks; sent to the harness only at Stop
  lockedAt: timestamp("locked_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("dod_sets_run_idx").on(t.orgId, t.run)]);

export const dodCertificates = dod.table("dod_certificates", {
  ...orgScoped,
  publicId: text("public_id").notNull().unique(),   // dodc_…
  run: text("run").notNull(),
  attempt: text("attempt").notNull(),               // arat_…  sealed attempt (run-ledger)
  streamDigest: text("stream_digest").notNull(),
  lock: text("lock").notNull(),
  verdict: text("verdict").notNull(),               // HELD | PENDING | BROKEN
  reasons: jsonb("reasons").notNull(),
  body: jsonb("body").notNull(),
  digest: text("digest").notNull(),
  signature: text("signature").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull(),
}, (t) => [index("dod_certificates_run_idx").on(t.orgId, t.run)]);
```

### The drafting prompt

The model proposes. The schema decides whether the proposal is a dod at all. The drafting model is recorded on the row and is never the model running the task.

```ts
// packages/dod/src/draft-prompt.ts
// The LLM proposes. The schema decides whether the proposal is even a dod.
export const DRAFT_SYSTEM = `
You write acceptance checks for a coding task. Output YAML only, matching the dod schema.

Rules:
- Every check must be mechanically decidable by one of: run, file, diff, tools, budget, human.
- Prefer \`run\` checks that call the repository's own test, typecheck, and lint commands.
- Add a \`diff\` check that limits changed paths to the task's scope.
- If the task names a threshold, boundary, or the word "only", add a negative check
  (a run or file check that fails when the boundary is crossed).
- Use \`human\` only for judgment that no command can settle. It never blocks the run; it withholds the certificate.
- Never reference secrets, network, or the current date.
- Ids: lowercase, short, unique.
`.trim();

export function draftUserPrompt(task: string, repo: { scripts: string[]; topDirs: string[] }): string {
  return [
    `Task: ${task}`,
    `Package scripts available: ${repo.scripts.join(", ")}`,
    `Top-level directories: ${repo.topDirs.join(", ")}`,
    `Write the dod.`,
  ].join("\n");
}
```

## What a held dod warrants, and what it does not

**A held dod warrants** that the evidence the harness submitted decides to HELD under the locked set, that the lock digest matches what was registered before the run, that the certificate is bound to the run ledger's sealed attempt and its stream digest, and that the org key signed it. Anyone with the evidence and `decide()` can recompute the verdict.

**A held dod does not warrant** that the dod was the right set, that the harness was not tampered with on the developer's machine, or that the outcome was worth money. The first is the author's responsibility, the second is the same trust the run ledger already places in the engine build digest, and the third is priced by the customer when they name the outcome unit.

Replay in a cloud sandbox, where Oxagen re-executes run checks itself, is a later tier and a deliberate exception to ADR-043. It is not in this spec.

## Five phases, each gated by DoD itself

No week numbers. A phase ends when its gate settles.

| Phase | Builds | Gate |
|---|---|---|
| 1. The language | `packages/dod`: schema, reasons, verdict, lock, draft prompt, tests. | Thirty fixture evidence files decide to their expected verdict. `decide()` is byte-identical across 100 runs per fixture. |
| 2. The harness and CLI | `packages/dod-harness`, the `oxagen dod` command, the three hooks. | In this repository, a scripted Claude Code session with the prompt "add a failing test, then make it pass" is blocked once with `CHECK_FAILED` and allowed on the second stop with HELD. |
| 3. The cloud | Contracts, handlers, schema and migration, routes, the `dod.held` governed action, signing with the org key. | The phase 2 harness submits evidence and receives a certificate whose `stream_digest` equals the sealed attempt's. A governed action appears in the ledger for that run. |
| 4. Drafting and holdouts | `dod.draft` calls `@oxagen/ai` with the drafting prompt and splits the result into visible and hidden. | Five prompts from `docs/prompts` draft sets that parse first try. An agent that satisfies the visible set by editing tests is rejected by a hidden check. |
| 5. Humans and repeatable tasks | `oxagen dod new` for hand authoring, `dod sign`, templates under `.oxagen/dod/templates` matched by task name. | A hand-written set locks and settles. A PENDING run becomes HELD after a signature. One template settles two different runs of the same task. |

## Build prompt for Claude Code

Run this at the root of the monorepo. It reads the repository's own skills and ADRs first, then builds the five phases and stops only at a gate that fails twice.

```text
You are building DoD inside the macanderson/oxagen monorepo, fully autonomously. The dod is the definition of done for a run: a locked set of mechanical checks that an agent cannot finish without passing. Do not stop to ask questions. Record every non-obvious choice in docs/adr/ADR-055-dod-gates-runs-not-only-pull-requests.md and continue. Halt only when every phase gate below passes, or when one gate fails twice in a row; then write dod/BLOCKED.md with the failing gate, the evidence, and your best hypothesis.

READ FIRST
CLAUDE.md, AGENTS.md, .claude/skills/oxagen-naming, oxagen-capability-contracts, oxagen-testing, quality-gates, oxagen-tenancy. docs/adr/ADR-041 (one canonical JSON rule), ADR-043 (Oxagen governs, does not run), ADR-052 (governed action is the billable unit). packages/run-ledger/README.md and packages/run-evidence/src/digest.ts. Follow what they say over anything below.

THE SYSTEM IN ONE PARAGRAPH
A developer runs Claude Code with three hooks installed. On UserPromptSubmit the harness asks Oxagen to draft a dod for the prompt (or loads a hand-written one), locks it by digest, writes it to .oxagen/dod/<run>.yaml, and tells the agent its definition of done. On PreToolUse the harness logs every tool call and denies the ones the set forbids. On Stop the harness runs the checks plus any hidden holdout checks the cloud kept back, and calls decide(). If BROKEN and attempts remain, it blocks the stop and hands the agent the failing check ids. Otherwise it submits the evidence; the cloud re-runs decide() on the same evidence, binds the outcome to the sealed run-ledger attempt, signs a certificate, and meters one governed action. Three verdicts: HELD (all executable checks pass, no human check outstanding), PENDING (executable checks pass, a human signature is pending), BROKEN (a closed reason code).

HARD CONSTRAINTS
- decide() is pure. No clock, network, filesystem, or model call. The cloud and the harness run the same function on the same evidence and must produce the same bytes.
- Six check kinds only: run, file, diff, tools, budget, human. Do not add a seventh. Anything else composes from run.
- A timeout, crash, or missing result is HARNESS_ERROR, which rejects. Never a pass.
- Reasons are the closed enum in packages/dod/src/reasons.ts. Do not add one without amending the ADR.
- The lock digest is digestJcs over the set with `locked` removed. No second canonicalizer.
- Oxagen executes nothing. apps/api never imports @oxagen/dod-harness. The harness ships only inside apps/cli.
- Hidden checks are stored cloud-side at lock time and sent to the harness only from the Stop hook. They never appear in the file the agent can read.
- The Stop hook must respect stop_attempts. When exhausted, submit BROKEN and let the run end. Never loop forever.
- The model that drafts a set is recorded on the dod_sets row. It is never the model running the task.
- Every human-readable file follows the house prose rules: sentence case headings, no em dashes, short actor-first sentences, Oxagen capitalized in prose.

PACKAGES AND FILES
packages/dod (pure), packages/dod-harness (checks, collect, store, hooks, api), packages/oxagen/src/contracts/dod.{draft,lock,settle,sign}.ts, packages/handlers/src/dod.*.ts, packages/database/src/schema/dod.ts plus migration, apps/api/src/routes/v1/dod.*.ts, apps/cli/src/commands/dod.ts wired into program.ts, .claude/settings.json hooks, docs/adr/ADR-055. Match the existing registerCapability shape, Hono route shape, commander command shape, drizzle schema and _mixins, vitest layout, biome and eslint config. Run pnpm typecheck, lint, and test:unit per package before every commit. One PR per phase on dod/phase-N.

PHASES AND GATES
Phase 1, the language. packages/dod with schema, reasons, verdict, lock, draft-prompt, full unit tests. Gate: 30 fixture evidence files in packages/dod/fixtures decide to the expected verdict, and decide() on each fixture produces byte-identical JSON across 100 runs.
Phase 2, the harness and CLI. packages/dod-harness, apps/cli dod command, the three hooks in .claude/settings.json. Gate: in this repository, a prompt "add a failing test then make it pass" produces a locked set, the Stop hook blocks once with CHECK_FAILED, and the second stop is allowed with HELD, all from a real Claude Code session driven by a script under tools/scripts.
Phase 3, the cloud. Contracts, handlers, schema, migration, routes, billing action, signing with the org key. Gate: the harness from phase 2 submits evidence, the API returns a certificate, the certificate row's stream_digest equals the sealed attempt's stream digest, and a governed action dod.held appears in the ledger for that run.
Phase 4, drafting and holdouts. dod.draft calls @oxagen/ai with DRAFT_SYSTEM, splits the result into visible and hidden, stores both. Gate: five prompts from docs/prompts draft sets that parse first try; an agent that satisfies the visible checks by editing tests instead of code is rejected by a hidden check.
Phase 5, humans and repeatable tasks. dod sign, .oxagen/dod/templates matched by task name, oxagen dod new for hand authoring. Gate: a hand-written set locks and settles; a PENDING run becomes HELD after oxagen dod sign; a template settles two different runs of the same task.

DEFINITION OF DONE
Every gate held with a DoD certificate produced by DoD itself. README in packages/dod under 400 words. ADR-055 written. If any sentence in the docs is not backed by a passing check, delete the sentence.

Begin with Phase 1. Write the fixtures before the code.
```

## How Mission Control shows it

Every run carries its verdict as a badge shaped by state: double border held, dashed pending, single broken, dotted while the set is locked and the run is still working. The Run page has a Done tab (the verdict and its reasons, the certificate and what it binds to, the checks with their evidence digests, the hidden checks that ran, the budget from the tool log, every Stop), a dialog that shows the locked file, and a sign dialog that turns PENDING into HELD. Fleet has a Done column and a tile counting sealed runs whose checks held, and counts outstanding signatures as waiting on a human. Billing prices the held run. The W14 scenario, "Done means done", walks it in `mockups/missioncontrol.html`.
