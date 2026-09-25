#!/usr/bin/env node
// Walks the master mockup's routes in headless Chromium and fails on copy that reads wrong: an
// `undefined` in a sentence, a tile with no value, "1 turns", a number glued to its unit, a dollar
// figure with no thousands separator, a retired term, a capitalized brand name, a storage tag, math
// notation, British spelling, or an identifier the eyebrow style uppercased.
//
//   node tools/check-copy.mjs                 # every route, both workspaces, plus the drawer and dialogs
//   node tools/check-copy.mjs --only tools    # routes whose hash contains "tools"
//   node tools/check-copy.mjs --dump out/     # also write each route's visible text to out/
//
// It builds the page from mockups/src and mockups/fixtures first, so it never reads a stale build.
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildMockup } from "./build-mockup.mjs";
import { launchChromium } from "./lib/playwright.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const dump = args.includes("--dump") ? args[args.indexOf("--dump") + 1] : null;
if (dump) mkdirSync(dump, { recursive: true });

const FILE = path.join(os.tmpdir(), `check-copy-${process.pid}.html`);
writeFileSync(FILE, buildMockup());

// One rule per line of the copy review's acceptance list. Each runs over a route's visible text.
const RULES = [
  ["empty value", /\bundefined\b|\bnull\b|NaN/],
  ["plural", /\b1 (turns|prompts|items|lines|files|agents|re-reads|waits|findings|tools)\b/],
  ["unit spacing", /\d(tok|tokens|USD|selapsed|turns|calls)\b/],
  ["thousands separator", /\$\d{4,}\.\d{2}/],
  ["glossary", /test test|\bservers?\b|\bbelts?\b|Deregister|Wrap it|Pr Reviewer|Po Checker| Us\b| Eu\b/],
  ["brand case", /Oxagen|Stella/],
  ["storage tag", /postgres|kms \+|tools\.policy_versions/i],
  ["math notation", /[∩∈≠]/],
  ["US spelling", /colour|behaviour|labelling|cancelled|neighbour/i],
  ["uppercased id", /\b(WO|TSK|RUN)_[0-9A-Z]{6,}\b|A-INTEL\//],
  // The rest of the review's glossary: one term per concept, and no internal names in page copy.
  ["retired term", /\bfr \d|interjection|Wasted spend|[Mm]odel tier|Wrong (model )?tier|light tier|client tier|\bseams?\b|issue provider|Bind it|\bBind\b|not bound|\bunbound\b|[Vv]olatile selection|[Cc]lient-attested|\bshelf\b|text plane|gate plane|a call at most|(^|\n)PER CALL\n/],
  ["internal name", /\bkernel\b|reflector|archiver|player[’']s window|manifest gate|deny generation|hook boundary|shared plane|opt-down|[Bb]elt computation/],
  ["rhetoric", /earns the word|stronger word than|says more than that|refuses to say otherwise|not a verdict|It is not a result/],
  ["empty slot", /Task —\.|\btask —|µUSD/],
  ["orphan pager", /\d+–\d+ of \d[\d,]* \d+\b/],
  ["chip separator", /platformmbell|githuboxagen|cost\.readrun\.read|readerRepository|OpenChange role|EditRoles|\d items\d/],
  ["minus sign", /(^|[\s(])-(\$?\d[\d,]*\.\d{2}\b|\d+(\.\d+)?%)/m],
];
// A raw key may stand in monospace, so this rule reads the page with .mono hidden as well.
const PROSE_ONLY = [
  ["raw key", /gateway_observed|client_attested|moves_funds|commits_spend|third_party|hooks_removed|chain_break|unknown_tool|initiating_principal|policy\.decision|per_run_micros|cache_write_5m|input_uncached|content_exact|deny_tools|above_micros/],
];

const ORG = "a-intel";
const AGENT_TABS = ["overview", "identity", "steering", "toolbelt", "runtime", "permissions", "activity", "definition", "source"];
const RUNS = ["run_01K5RS7M2E8FJ3QW", "run_01K5RQ4B9C7XTN2P", "run_01K5RP2D6H4KLM8V", "run_01K5RN8F3J2GHY6T",
  "run_01K5RM1A5Z9QWE4R", "run_01K5RK7C2V8BNM3X", "run_01K5RH3G8K5PAS7D", "run_01K5RG6H1L4OIU9Y",
  "run_01K5RF2J7M3EDC5F", "run_01K4QJ9E4T6YUI1O", "run_01K5RE9P4Q2WSX6C", "run_01K5RD1X8N7BVF3G", "run_01K6QW3D5N7TYBA2"];

function workspaceRoutes(ws, agents) {
  const b = `#/${ORG}/${ws}`;
  return [
    b,
    ...["tasks", "work-orders", "workflows", "providers", "fields", "people"].map((t) => `${b}/tasks/${t}`),
    `${b}/work/findings`,
    `${b}/tasks/tsk_01K6S7C5PA`, `${b}/tasks/tsk_01K6S2M4QF`,
    ...["wo_01K6T9QX", "wo_01K6TA2M", "wo_01K6RZ41"].map((w) => `${b}/tasks/work-orders/${w}`),
    `${b}/agents`,
    ...agents.flatMap((a) => AGENT_TABS.map((t) => `${b}/agents/${a}/${t}`)),
    ...["tools", "toolbelts", "providers", "policy", "switches"].map((t) => `${b}/tools/${t}`),
    `${b}/steering`,
    ...["library", "records", "memory", "ontology", "assignments", "gates", "proposals", "skills", "compiler/release-manager"]
      .map((t) => `${b}/steering/${t}`),
    `${b}/steering/records/ctx.release.never-merge`,
    `${b}/runtimes`, `${b}/runtimes/mbell-mbp-16`, `${b}/runtimes/ci-runner-08`,
    `${b}/repositories`, ...["copies", "changes", "config"].map((t) => `${b}/repositories/${t}`),
    `${b}/spend`, ...["findings", "tokens", "coaching", "operator", "agent", "model", "tool", "waste", "budgets"].map((t) => `${b}/spend/${t}`),
    `${b}/spend/operator/priya`, `${b}/spend/agent/a-intel.core.release-manager`, `${b}/spend/tool/github__create_pull_request`,
    ...["name", "wrap", "run"].map((s) => `${b}/register/${s}`),
  ];
}

const ROUTES = [
  "#/welcome/signup",
  `#/${ORG}`, `#/${ORG}/roles`, `#/${ORG}/api-keys`, `#/${ORG}/billing`,
  `#/${ORG}/audit`, ...["incidents", "receipts", "exports", "keys", "retention"].map((t) => `#/${ORG}/audit/${t}`),
  ...workspaceRoutes("core-platform", ["triage", "release-manager", "pr-reviewer", "stale-closer-eu", "dependency-bot"]),
  ...workspaceRoutes("finops", ["invoice-bot", "cost-reporter-us"]),
  ...RUNS.map((r) => `#/${ORG}/core-platform/runs/${r}`),
  // The run's other tabs, for a sealed, a halted and a held run: the Transcript, Cost, Memories and
  // Evidence carry frame chips, prices and chain text the Decision trace does not.
  ...["run_01K5RS7M2E8FJ3QW", "run_01K5RH3G8K5PAS7D", "run_01K6QW3D5N7TYBA2"].flatMap((r) =>
    ["transcript", "cost", "memory", "evidence"].map((t) => `#/${ORG}/core-platform/runs/${r}/${t}`)),
  `#/${ORG}/finops/agents/invoice-bot/mandates/mnd_7K2ETQ4`,
].filter((h) => !only || h.includes(only));

// Overlays a route does not open by itself: the approvals drawer, one approval, the assistant, and
// the dialogs that open with no argument.
const OVERLAYS = [
  ["approvals drawer", "apdToggle(true)"],
  ["approval", "apdToggle(true); var p=apdPending()[0]; if(p) apdSelect(p.id)"],
  ["assistant", "asstToggle(true)"],
  ...["create", "newws", "mintkey", "import", "funding", "switch", "budget", "role", "notifs", "plan", "steerfleet", "more"]
    .map((k) => [`dialog ${k}`, `openDialog('${k}')`]),
].filter(([name]) => !only || name.includes(only));

const browser = await launchChromium(root);
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
// The page is a 2 MB file; on a loaded machine its load event can take longer than Playwright's 30 s.
page.setDefaultNavigationTimeout(120000);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e.message || e)));
page.on("dialog", (d) => d.dismiss());

const hits = new Map([...RULES, ...PROSE_ONLY, ["empty tile"]].map(([name]) => [name, []]));
// Code samples (<pre>, <code>) are excluded: a TOML key or an SDK class such as McpServer is the
// language's word, not the page's, so the rules read only the prose around them.
const visibleText = (hide = "pre, code") => {
  const off = document.createElement("style");
  off.textContent = `${hide} { display: none !important; }`;
  document.head.appendChild(off);
  const t = document.body.innerText.replace(/[ \t]+/g, " ");
  off.remove();
  return t;
};
// A tile or a field with a caption and no value reads as a broken page, so each one is a finding.
// An empty value renders "—" and a short reason instead (the copy review's rule 1.12).
const emptyTiles = () =>
  [...document.querySelectorAll(".stat")]
    .filter((t) => t.offsetParent && !(t.querySelector(".v")?.innerText || "").trim())
    .map((t) => `${(t.querySelector(".k")?.innerText || "?").trim()} ⏎ ${(t.querySelector(".s")?.innerText || "").trim()}`);
// A route that rendered no heading would pass every rule by showing nothing, so it fails on its own.
// An empty state inside a page still has the page's heading, so it passes.
const rendered = () => !!document.querySelector("#app h1, #app h2");

async function audit(label, text, prose) {
  for (const tile of await page.evaluate(emptyTiles)) hits.get("empty tile").push([label, tile]);
  if (dump) writeFileSync(path.join(dump, label.replace(/[^a-z0-9._-]+/gi, "_").slice(0, 150) + ".txt"), text);
  for (const [name, re, t] of [...RULES.map((r) => [...r, text]), ...PROSE_ONLY.map((r) => [...r, prose])]) {
    const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    for (const m of t.matchAll(g)) {
      const at = m.index;
      hits.get(name).push([label, t.slice(Math.max(0, at - 50), at + 50).replace(/\n/g, " ⏎ ")]);
    }
  }
}

for (const hash of ROUTES) {
  await page.goto("about:blank");
  await page.goto(`file://${FILE}?product=1${hash}`);
  await page.waitForTimeout(250);
  if (!hash.startsWith("#/welcome") && !(await page.evaluate(rendered))) errors.push(`${hash}: rendered no heading`);
  await audit(hash, await page.evaluate(visibleText), await page.evaluate(visibleText, "pre, code, .mono"));
}
for (const [name, js] of OVERLAYS) {
  await page.goto("about:blank");
  await page.goto(`file://${FILE}?product=1#/${ORG}/core-platform`);
  await page.waitForTimeout(200);
  try { await page.evaluate(js); } catch (e) { errors.push(`${name}: ${e.message}`); continue; }
  await page.waitForTimeout(200);
  await audit(name, await page.evaluate(visibleText), await page.evaluate(visibleText, "pre, code, .mono"));
}
await browser.close();

let total = 0;
// The same text on many routes (the sidebar, a shared panel) is one finding, shown with its first route.
for (const [name, list] of hits) {
  const seen = new Map();
  for (const [label, snip] of list) if (!seen.has(snip)) seen.set(snip, [label, 0]); else seen.get(snip)[1]++;
  total += seen.size;
  console.log(`${name}: ${seen.size}`);
  for (const [snip, [label, more]] of [...seen].slice(0, args.includes("--all") ? Infinity : 25))
    console.log(`  ${label}${more ? ` (+${more} more)` : ""}  …${snip}…`);
}
for (const e of [...new Set(errors)]) console.log("PAGE ERROR " + e);
console.log(`\n${ROUTES.length} routes, ${OVERLAYS.length} overlays, ${total} findings, ${errors.length} page errors`);
process.exit(total || errors.length ? 1 : 0);
