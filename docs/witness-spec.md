# Oxagen Witness: outcome verification

| | |
|---|---|
| **Status** | Spec, for build |
| **Date** | 2026-09-13 |
| **Owner** | Mac Anderson |
| **Related** | `dod-spec.md` (the definition of done that gates a run; the witness is one of its checks), `mission-control-spec.md` §8.5, `scope-review.md` |

Witness is a working name. The spec assumes Oxagen's existing metering service, capability contracts, and lifecycle agent toolkit.

## Every trace ends in a stamp or a reason

Witness turns requirements into oracles before an agent runs. When a trace finishes, deterministic evaluators either stamp it as a verified outcome, which releases the funds metered against it, or reject it with a reason code. No model sits in the path that decides.

```text
trace_id      tr_01J8ZK7Q4M
witness_id    WR-0042  refund-under-50-auto-approve
verdict       STAMPED
oracles       predicate:pass  invariant:pass  policy:pass  budget:pass
evidence      sha256:4c1f…9e02
evaluator_env sha256:b77a…13d4  (pinned, no egress)
prev_stamp    sha256:0a9d…77c1
funded        true   unit outcome:refund.approved
signature     ed25519:MEUCIQ…
```

A certificate is a pure function of the trace, the fixtures, and the witness record. Run it twice, get the same bytes.

- **Prompt to fund.** A trace starts when a prompt enters Oxagen and ends when its outcome is verified and metered. Nothing in between may declare success.
- **No witness, no requirement.** A requirement with no executable witness is not finished. The authoring tool refuses to mark it ready.
- **Models propose, oracles decide.** An LLM may draft witnesses and explain rejections. It never issues a verdict.

## Everyone else's oracle is another model

"AI writes your tests" starts from a prose spec. Prose underdetermines behavior, so the model writing the test fills the gaps with the same assumptions the model writing the code will make. The tests pass by construction and prove nothing. Oxagen already bills on outcomes; the missing piece is a verification layer customers, auditors, and insurers can trust because it is mechanically reproducible.

Witness moves the disambiguation to requirements time, when a human is still in the loop and precision is cheap. It makes the requirement and the oracle the same object, so verification stays deterministic even when the implementer is not.

- **For the customer.** They buy verified outcomes, not tokens. Every invoice line links to a signed certificate with the evidence that earned it. Disputes become a hash comparison, not an argument.
- **For Oxagen.** Stamps are the billable unit, so metering is defensible. Every stamped or rejected trace is a labeled example for the oracle-flip pipeline. Certificates are the artifact an auditor can actually read.
- **For the builder.** "Looks right" stops being a completion state. Rejections carry a reason code and a pointer into the trace, so the fix loop runs unattended.

## Fourteen deterministic ways to stamp a trace

An oracle class enters the stamp path only if its evaluator is a pure function of the trace, the fixtures, and the witness record. Anything that fails that test is judgment-gated: a human can sign it, but it never stamps, and it is labeled separately in exports.

| Class | Checks | Why it is deterministic |
|---|---|---|
| example | Concrete inputs against an expected output, compared by hash or structural equality. | The expected value is fixed at authoring time; the comparison is exact. |
| predicate | Assertions over end state: rows, files, emitted events, responses, queue depth. | Evaluated against a captured snapshot, not a live system. |
| invariant | What must hold across the whole trace: totals reconcile, a record is never deleted. | Compares pre- and post-state snapshots already captured at ingest. |
| schema | Output conforms to a JSON schema, protobuf, or type signature. | Validation is syntactic. |
| executable | A pinned command exits zero: tests, build, typecheck, migration apply and rollback. | Runs in a pinned image, no network, fixed seed, enforced by the engine. |
| differential | Output agrees with a reference: a prior release, or N implementations voting. | Reference outputs are captured once and compared by hash. |
| property | Relations across runs: sort twice equals sort once, doubling the input doubles the total. | The generator is seeded; outputs are stored, not live. |
| replay | Re-run with recorded tool responses and pinned model outputs; artifact hash must match. | Every external call is answered from the recording. |
| policy | Every tool call stayed inside the contracted capability set; no secret left the sandbox. | A set-membership check over the recorded call log. |
| budget | Cost, tokens, wall time, tool calls, and retries stayed under the declared limits. | The counters are part of the trace. |
| provenance | Every citation resolves to a retrieved chunk in the trace; artifacts hash-chain to inputs. | Verifies references, not content. |
| structural | The PR merges clean, the diff touches only allowed paths, the file count matches. | Shape checks are mechanical. |
| convergence | A looped agent stopped for an allowed reason and the iteration count is under cap. | Loop state is recorded per iteration. |
| formal | A solver proves a property of the produced code against a specification. | Pinned solver, fixed timeout; a timeout counts as rejection. |
| judgment‑gated | Taste, tone, "feels right," anything scored by a model. | Not an oracle, a human signature, kept out of the stamp path on purpose. |

## The witness record

A requirement is collected in this shape from the start. The authoring tool drafts it from a conversation, but the record is what gets reviewed, versioned, and executed. If a field cannot be filled, the requirement is not ready and the tool says so.

```yaml
witness:
  id: WR-0042
  title: refund-under-50-auto-approve
  requirement: >
    A refund request for a delivered order under $50 is approved
    without human review and the customer is notified once.
  owner: ops@customer.example
  oracle_classes: [predicate, invariant, policy, budget]

  pre:
    fixtures:
      - db: snapshots/orders-2026-09-01.sql        # content-addressed
      - order: {id: o-1187, amount: 42.00, status: delivered}
    tool_recordings: recordings/refund-happy.jsonl  # replay source

  act:
    prompt: "Customer 8812 asks for a refund on order o-1187"
    capability_set: [cap:orders.read, cap:refunds.write, cap:notify.email]

  post:
    - db: "select status, amount from refunds where order_id='o-1187'"
      equals: {status: approved, amount: 42.00}
    - event: refund.approved
      count: 1
    - event: email.sent
      count: 1
      where: {to: customer_8812}

  invariants:
    - db: "select total from orders where id='o-1187'"
      unchanged: true
    - no_tool_call_outside: act.capability_set

  budget: {max_cost_usd: 0.20, max_tool_calls: 6, max_wall_ms: 30000}

  witnesses:                       # concrete examples, at least one required
    - name: happy-path
      inputs: fixtures/refund-happy.json
      expected: sha256:9f2c…a17e
    - name: exactly-50-is-not-under
      inputs: fixtures/refund-50.json
      expect_verdict: REJECTED
      reason: POST_MISMATCH

  judgment_gated:                  # optional, never stamps
    - "Email tone matches brand voice"

  funding:
    unit: outcome:refund.approved
    release_on: STAMPED
```

A negative witness, an input that must be rejected, is required whenever the requirement names a threshold or the word "only". The model that drafted a record is never the model that implements the feature it covers.

## Components

| Component | Responsibility |
|---|---|
| Witness Studio | Conversational authoring. Lints records; refuses to mark a requirement ready with no executable witness. Stores records in git alongside the customer's code. |
| Oracle Registry | Catalog of evaluators, one per oracle class, published as pinned container digests. New evaluators must pass the determinism gate before listing. |
| Trace Ingest | Captures prompt, model calls, tool calls with arguments and responses, state snapshots, artifacts, counters. Everything content-addressed. |
| Fixture Vault | Immutable pre-states: database snapshots, filesystem trees, recorded tool responses. Referenced by hash. |
| Stamp Engine | Runs evaluators in sandboxes with no egress, no clock, fixed seed. Aggregates verdicts, emits the certificate. Re-runs a sample and halts a registry entry if bytes differ. |
| Certificate Ledger | Append-only, hash-chained, signed. Publishes `stamp.issued` and `stamp.rejected` to metering. |
| Judgment Queue | Routes judgment-gated items to a human; records the signature with a distinct type. |
| Dataset Exporter | Emits stamped and rejected traces with reason codes as training labels, drafting and implementing model kept separate. |

## Determinism rules

- No model call runs in the stamp path. The engine rejects any evaluator that declares network egress.
- Evaluators are pinned by image digest. A certificate names the digest that produced each verdict.
- Each evaluator is a pure function of `(trace, fixtures, witness)`, fixed clock, fixed seed, no filesystem outside the mounted inputs.
- Same inputs produce byte-identical certificates. The engine double-runs 5% of traces and alarms on any diff.
- Evidence is stored, never summarized. Every verdict links to an evidence blob by hash.
- A timeout, crash, or missing fixture is a rejection with its own reason code, never a pass.
- Rejection reasons come from a closed enum: `POST_MISMATCH`, `INVARIANT_BROKEN`, `POLICY_VIOLATION`, `BUDGET_EXCEEDED`, `SCHEMA_INVALID`, `EXEC_FAILED`, `DIFF_DISAGREE`, `PROPERTY_FAILED`, `REPLAY_DIVERGED`, `PROVENANCE_MISSING`, `STRUCTURE_INVALID`, `NO_CONVERGENCE`, `FORMAL_UNPROVEN`, `EVALUATOR_ERROR`, `FIXTURE_MISSING`.
- Certificates are signed with a per-tenant key and chained to the tenant's previous certificate.

## Certificate schema

```json
{
  "trace_id": "tr_01J8ZK7Q4M",
  "witness_id": "WR-0042",
  "witness_hash": "sha256:…",
  "verdict": "STAMPED | REJECTED | JUDGMENT_GATED",
  "reason": null,
  "oracles": [
    {"class": "predicate", "evaluator": "sha256:…", "verdict": "pass",
     "evidence": "sha256:…", "duration_ms": 412}
  ],
  "evaluator_env": "sha256:…",
  "prev_stamp": "sha256:…",
  "funding": {"unit": "outcome:refund.approved", "released": true},
  "issued_at": "2026-09-09T18:02:11Z",
  "signature": "ed25519:…"
}
```

## API surface

| Call | Purpose |
|---|---|
| POST /witnesses | Create or version a witness record; returns lint results and readiness. |
| POST /traces | Ingest a completed trace; triggers stamping for every witness bound to the run. |
| GET /stamps/{trace_id} | Fetch the certificate and evidence index. |
| POST /oracles | Register an evaluator image; runs the determinism gate before listing. |
| POST /stamps/{id}/verify | Recompute from evidence and compare bytes. The auditor and insurer endpoint. |
| Webhooks | `stamp.issued`, `stamp.rejected`, `judgment.requested`, `judgment.signed`. |

Not in v1: partial credit, model-judged quality in the stamp path, cross-tenant fixture sharing.

## Eight weeks, five phases

Each phase gate is itself a witness record, so the system stamps its own build from phase one.

| Phase | Builds | Gate |
|---|---|---|
| 1. Schema and lint (week 1) | Record schema, both enums, and `ox witness lint`, which rejects records missing an executable witness or a negative witness on threshold language. | Twenty real requirements from the design partner pass lint, and the partner confirms each says what they meant. |
| 2. Ingest and first oracles (weeks 2–3) | Trace ingest, fixture vault, sandbox runner, evaluators for example, predicate, schema, executable. Unsigned certificates. | The phase-1 records stamp against real traces. A double run on 100 traces yields 100 byte-identical certificates. |
| 3. Trust and governance (weeks 4–5) | Signing, hash chain, invariant, policy, budget, provenance evaluators, the closed reason enum, the verify endpoint, the determinism gate for new evaluators. | An outside party recomputes a certificate from evidence alone and matches bytes. An out-of-scope tool call rejects with `POLICY_VIOLATION`. |
| 4. Depth and authoring (weeks 6–7) | Differential, property, replay, structural, convergence, formal evaluators. Witness Studio's conversational drafting, with drafting-model tagging and the judgment queue. | Replay catches an injected nondeterminism. A non-engineer drafts a passing record from conversation in under fifteen minutes. |
| 5. Fund and export (week 8) | The metering hook that releases funds on `stamp.issued`, the dataset exporter with provenance separation, a pilot dashboard. | One invoice line links to a certificate. The first export of 10,000 labeled traces lands in the oracle-flip pipeline. |

## Measures

| Measure | Target |
|---|---|
| Byte-identical certificates on double run | 100% |
| Requirements with an executable witness before build starts | 100% |
| Traces stamped or rejected with no human involved | Above 90% by week 8 |
| Trace ingest to certificate, p95 | Under 60 seconds |
| Rejections that map to a fix without opening the trace manually | Above 80% |
| Funded outcomes per week at the design partner | Growing week over week from launch |

## Build prompt for Claude Code

Paste this into Claude Code at the root of the Oxagen repository. It runs the five phases without further input and stops only at a gate that fails twice.

```text
You are building Witness, Oxagen's outcome verification layer, fully autonomously in this repository. Do not stop to ask questions. Make reasonable decisions, record them in DECISIONS.md, and continue. Stop only when every phase gate below has passed, or when a single gate has failed twice in a row, in which case write BLOCKED.md with the failing witness, the evidence, and your best hypothesis, then halt.

THESIS
A trace starts when a prompt enters Oxagen and ends when its outcome is verified and metered. Nothing in between may declare success. Requirements are collected as witness records, which are executable oracles. When a trace finishes, deterministic evaluators either stamp it or reject it with a reason code. No model call executes in the stamp path. Models propose; oracles decide.

HOW YOU WORK
1. Before any engine code, write the witness records for every phase gate in ./witness/. These are your definition of done. You are not allowed to change a gate's record after you begin building that phase.
2. Work phase by phase. A phase is complete only when its gate record stamps against a real trace produced by the code you wrote. Do not begin the next phase until the current gate stamps.
3. Use the repository's lifecycle agents where they fit: simplifier before each phase, feature-shipper to implement, test-engineer to write executable oracles, code-reviewer before every PR, debugger on any gate failure, docs-writer at the end of each phase.
4. One PR per phase on a branch named witness/phase-N. Each PR description links the gate certificate.
5. Keep a running log in ./witness/BUILD_LOG.md: what you tried, what failed, what you changed. Write it for a future run that has no memory of this one.
6. Follow the house prose style in every human-readable file: actor-first sentences, concrete verbs, plain language, no marketing fluff, never strengthen a claim beyond what the evidence shows.

HARD CONSTRAINTS
- No evaluator may make a network call, read the wall clock, or use an unseeded random source. The sandbox runner must enforce this, not just document it.
- Every evaluator is pinned by image digest and version, and every certificate names the digests that produced it.
- A timeout, crash, or missing fixture is a rejection with its own reason code. It is never a pass.
- Rejection reasons are a closed enum: POST_MISMATCH, INVARIANT_BROKEN, POLICY_VIOLATION, BUDGET_EXCEEDED, SCHEMA_INVALID, EXEC_FAILED, DIFF_DISAGREE, PROPERTY_FAILED, REPLAY_DIVERGED, PROVENANCE_MISSING, STRUCTURE_INVALID, NO_CONVERGENCE, FORMAL_UNPROVEN, EVALUATOR_ERROR, FIXTURE_MISSING.
- Certificates are signed with a per-tenant ed25519 key and chained to the previous certificate for that tenant.
- Judgment-gated items are recorded as signatures, never as stamps, and are labeled separately in every export.
- The model that drafts a witness record is tagged on the record and is never the model that implements the feature the record covers.

WITNESS RECORD SCHEMA (implement exactly; extend only additively)
witness:
  id, title, requirement, owner
  oracle_classes: subset of [example, predicate, invariant, schema, executable, differential, property, replay, policy, budget, provenance, structural, convergence, formal]
  pre: {fixtures: [content-addressed refs], tool_recordings: ref}
  act: {prompt, capability_set}
  post: [assertions over db, files, events, http, artifacts]
  invariants: [unchanged checks, set-membership checks]
  budget: {max_cost_usd, max_tool_calls, max_wall_ms, max_retries}
  witnesses: [{name, inputs, expected (hash) | expect_verdict + reason}]  at least one required; a negative witness is required if the requirement contains a threshold, a boundary, or the word "only"
  judgment_gated: [strings]
  funding: {unit, release_on}

CERTIFICATE SCHEMA
{trace_id, witness_id, witness_hash, verdict: STAMPED|REJECTED|JUDGMENT_GATED, reason, oracles: [{class, evaluator digest, verdict, evidence hash, duration_ms}], evaluator_env, prev_stamp, funding: {unit, released}, issued_at, signature}

COMPONENTS TO BUILD
Witness Studio (authoring CLI first, conversational drafting in phase 4), Oracle Registry, Trace Ingest (content-addressed), Fixture Vault, Stamp Engine with sandbox runner, Certificate Ledger (append-only, hash-chained, signed), Judgment Queue, Dataset Exporter, and these endpoints: POST /witnesses, POST /traces, GET /stamps/{trace_id}, POST /oracles, POST /stamps/{id}/verify, plus webhooks stamp.issued, stamp.rejected, judgment.requested, judgment.signed.

PHASES AND GATES
Phase 1, schema and lint. Deliver the record schema, both enums, and `ox witness lint`, which rejects records with no executable witness or a missing negative witness on threshold language. Gate: twenty records drawn from existing Oxagen requirements pass lint, and a lint run on a deliberately incomplete record fails with a specific message.
Phase 2, ingest and first oracles. Deliver trace ingest, fixture vault, sandbox runner, and evaluators for example, predicate, schema, executable, and unsigned certificates. Gate: the phase-1 gate record stamps against a real trace, and a double run on 100 traces produces 100 byte-identical certificates.
Phase 3, trust and governance. Deliver signing, hash chain, invariant, policy, budget, and provenance evaluators, the closed reason enum, the verify endpoint, and the determinism gate for registering evaluators. Gate: recompute a certificate from evidence alone via the verify endpoint and match bytes; a trace with an out-of-scope tool call is rejected with POLICY_VIOLATION; an evaluator image that declares egress is refused by the registry.
Phase 4, depth and authoring. Deliver differential, property, replay, structural, convergence, and formal evaluators, conversational drafting in Witness Studio with drafting-model tagging, and the judgment queue. Gate: replay rejects a trace into which you injected nondeterminism with REPLAY_DIVERGED; a witness record drafted from a three-message conversation passes lint without manual edits.
Phase 5, fund and export. Deliver the metering hook that releases funds on stamp.issued, the dataset exporter with provenance separation, and a dashboard of stamped, rejected, and gated counts per witness. Gate: a metering record links to a certificate; an export of 1,000 labeled traces validates against the exporter schema with drafting and implementing model fields populated and distinct.

DEFINITION OF DONE
Every phase gate has stamped. README.md explains Witness to a new engineer in under 600 words. DECISIONS.md lists every non-obvious choice with the reason. The final PR includes the five gate certificates. If any statement in the docs is not backed by a stamped witness, remove the statement.

Begin with Phase 1. Write the gate records first.
```

## The witness record schema

```yaml
witness:
  id: string                 # WR-####
  title: string
  requirement: string
  owner: string
  oracle_classes: [example|predicate|invariant|schema|executable|differential|property|replay|policy|budget|provenance|structural|convergence|formal]
  pre:
    fixtures: [ref]          # content-addressed
    tool_recordings: ref
  act:
    prompt: string
    capability_set: [cap:*]
  post: [assertion]          # db | file | event | http | artifact
  invariants: [check]        # unchanged | no_tool_call_outside | count_never_decreases
  budget: {max_cost_usd, max_tool_calls, max_wall_ms, max_retries}
  witnesses:                 # >=1; negative witness required on thresholds
    - {name, inputs: ref, expected: sha256}
    - {name, inputs: ref, expect_verdict: REJECTED, reason: enum}
  judgment_gated: [string]   # signatures only, never stamps
  funding: {unit: string, release_on: STAMPED}
  drafted_by: model-id       # set by Studio, never the implementer
```
