# Oxagen Mission Control: Product and Technical Specification

| | |
|---|---|
| **Status** | Draft for review |
| **Date** | 2026-09-11 |
| **Owner** | Mac Anderson |
| **Supersedes** | The `oxagen-platform` and `oxagen` codebases as products. Carries forward the designs named in §16. |
| **Builds on** | Context Graph Protocol `contextgraph/1.0` and the `contextgraph/lifecycle/1.0-draft` profile (repo at `origin/main`, ADRs 0001 to 0018). Stella's context-record and Context PR corpus. Oxagen ADR-024, 025, 042, 043, 051, 052, 053 and the current wrapper spec (in the repo today under `docs/specs/tacho/`, renamed here). |
| **Amended** | 2026-09-14, by the scope review (`scope-review.md`) and the definition of done (`dod-spec.md`). The ontology engine, SSO and SCIM, policy simulation, the assurance suite, two-person mandates, steering effect metrics and retirement, legal holds, crypto-shredding and provider reconciliation are out. The definition of done (§8.6) is in. The review also proposed cutting the in-app agent and Neo4j and pricing the proven run. The maintainer kept the in-app agent (2026-09-14, "dont cut the in app agent"; its shell is the sidebar flyout, 2026-09-15), kept Neo4j in the architecture (2026-09-15), and set governed action units as the one price list (2026-09-14, reaffirmed 2026-09-15). §12.1 carries that price list, the GAU billing of Oxagen ADR-055 (2026-09-13), beside the usage-credit meter for in-app AI usage (two meters, 2026-09-15); proven spend is a report figure. Sections carry each change in place. |
| **Decided** | 2026-09-15, maintainer decisions (§20): billing (credit packs, negotiated enterprise with every feature on for every tier, invoice billing, the Build and Scale upgrade, suspension), the approvals strip on Run, the shell's sidebar flyout, Halt and Cancel on ledger-ingested runs, the create-workspace form and the Spend lane, API key rotation in rev1, Neo4j staying in the architecture, GAU pricing reaffirmed as the governed-action price list, and pricing on two meters: governed actions in GAUs and in-app AI usage in usage credits. Each section carries its change in place with the date. |
| **Amended 2026-09-18** | By the steering, graph and gateway review of 2026-09-18, approved in full by the maintainer on 2026-09-18 (`docs/reviews/2026-09-18-steering-graph-gateway-review.md`). One assembler with a manifest frame, two planes compiled twice, the gateway on loopback in `tachod`, the four-word tier ladder, the contained tier, skills as governed files under Steering, and the six-phase refactor path. Rewritten: §4.2, §7.1 to §7.3, §10.4, §12.5, and the §9 storage paragraph. New: §10.5 to §10.7, §13.6, §17.2 and §21. Corrected in place, where the text described something as present that is not built: §0 rows 6, 7 and 10, §1, §2.1, §3, §4.1, §4.5, §6.2, §6.8, §7.4, §7.5, §8.2, §9.1, §12.6, §14, §15, §17, §18 and Appendix D. Sections marked **Status of this section** describe a target and name the phase that delivers it. |
| **Not built at 2026-09-18** | This specification is written in the present tense as a target. Read against oxagen `main` at `02278c913`, these things it names do not exist yet, wherever a section mentions them: the model proxy, base URL enrollment, run tokens, budgets enforced at a proxy, any sandbox, the witness runner, a skills package or skills tables, `:Record` nodes in the graph, and any delivery of a published record to a wrapped agent. §7.1, §10.4 and §17.2 say what is built and which phase delivers the rest. Phase 0 is in review (oxagen PR #3289, ADR-091) and Phase 4 is in build (branches `gateway-model-proxy` and `desktop-install-hardening`). Neither is on `main`. The ADRs are ADR-091, ADR-093 to ADR-097, in oxagen PR #3289 and draft PR #3294. |
| **Canonical copy** | This file is the canonical copy of this specification. The oxagen monorepo (https://github.com/macanderson/oxagen) carries a copy at `docs/specs/mission-control/spec.md` for build agents. No build step joins the two, so a change is made in both by hand, in the same change set. The sections named in the row above are identical in both copies. The carried copy still predates the scope review of 2026-09-14 and the decisions of 2026-09-15 in the sections its own header lists, and it alone carries ADR-090 (the Skills tools and the `skills` tables) and the de-registered rule of §2.2. |

---

## 0. The call sheet

This table lists every decision that shapes the rest of the document, in one place. Each decision is argued in its own section.

| # | Decision | Section |
|---|---|---|
| 1 | A build from scratch. One control plane, one language (TypeScript), one kernel. A control plane is the one system that sets and enforces the rules for every agent. Onboarding is three screens, configuration is the same agent tools a person clicks, and explanation is the record itself. The in-app agent is in scope: it opens as a flyout from the sidebar, acts through those same agent tools, and its model calls are metered in usage credits, funded by the $5 signup grant and topped up with credit packs (§4.4, §12.1). Model access for Oxagen's own work (reflection, promotion rationale, Context PR bodies, run names and summaries) goes through **OpenRouter**, routed by tier (§4.5). | §4 |
| 2 | The organization is the tenant and the hard isolation boundary. A tenant is one customer whose data stays fully separate from every other customer's data. A workspace is a governance partition inside the organization: a section with its own rules, approvals, and ownership. This is the same model as today, with fewer tables. | §5 |
| 3 | Postgres tenant isolation uses Row-Level Security (RLS). RLS is a database feature that filters every row by rules tied to settings on the current transaction. There is **no bypass setting**. System access uses a separate database role with its own policy. | §5.2 |
| 4 | The run record, context records and the code graph live in Postgres beside the control ledger, under the same row-level security. Neo4j stays in the architecture and holds the ontology graph; no Mission Control surface reads or writes it (row 5). **Amended 2026-09-18:** the graph also holds agent memory, which the Steering hub's Memory tab reads, and from Phase 3 of §17.2 it becomes the steering index behind a port, with Postgres as the fallback (§4.2, §21). | §5.3 |
| 5 | Mission Control writes two stores. Postgres holds the control ledger, the run record, the records and the code graph. Object storage with write-once retention holds frame bodies and the archive. Write-once means a stored object cannot be changed after it is written. ClickHouse is retired. Neo4j stays in the architecture and holds the ontology graph of the platform as it runs today; there is no retirement ADR and no migration off it (2026-09-15, maintainer decision, §20). | §4 |
| 6 | Oxagen's connection to a wrapped agent is the **gateway**, which `tachod` (the daemon enrollment installs on the agent's machine) grows into: a hook adapter, a **loopback model proxy**, an **MCP aggregator** and a control channel. Prompt bodies never leave the machine, and the vendor credential stays on it. Oxagen records the enforcement tier on every run as one of four words, **observe, harness, gateway, contained**, computed from what was actually routed, and the tier can never be over-stated. Status 2026-09-18: the hook adapter and the control channel are built, and the tool gateway is registered only into Claude Desktop. The loopback proxy and the aggregator are Phase 4, which is in build and not on `main`, and the contained tier is Phase 5 (§17.2). | §7 |
| 7 | Intervention is a defined contract: pause, resume, steer, cancel, revoke, approve, and inject. The guarantees are stated for each seam and each tier. At the `harness` tier a command is delivered at the next hook boundary, client-attested, on a tier that is fail-open against the person at the keyboard (§7.1). A halt that does not depend on the agent's machine cooperating needs the `gateway` tier, and only the `contained` tier earns the word "enforced" against the machine's operator. | §7.4 |
| 8 | A run is a hash-chained sequence of **frames**. A hash is a short fingerprint computed from data. A hash chain links each frame to the one before it, so no frame can be altered without detection. A frame is the replay unit. Frame metadata and cost live in the run record. Frame bodies are content-addressed, encrypted blobs. Content-addressed means each body is stored under the hash of its own content. | §8 |
| 9 | Agents learn by appending **context records** (the protocol's record kinds). They never learn by writing frames. Records are canonically hashed and countersigned. Canonical hashing puts a record in one standard form before hashing, so the same content always gives the same hash. Countersigned means a second party adds its own signature. | §9 |
| 10 | A workspace links to one or more GitHub repositories. Exactly one of them is its **main repo**, bound at creation. The main repo is the place where the workspace's steering and configuration are managed in source control. Published steering and every agent definition live there under `.oxagen/`. Stella reads that folder natively through a symlink, a file system pointer to another path. Oxagen mirrors the same folder into each coding harness's own agent format in the same pull request. Linked repos may carry repository-scoped records of their own. A **Context PR** is a GitHub pull request (PR), a proposed change that others review before it is merged. Merge is the promotion event. Nothing steers until it is published. Storage stays plural, with one writer per fact (§4.2). Git is the system of control, which is GitOps: steering changes are managed through git. One assembler decides what reaches an agent and records what it cut (§10.5). | §10 |
| 11 | Oxagen governs the toolbelt. An agent sees only the tools it is granted, and it can search them when the belt is large. The agent holds no credentials at all. Every call passes one pipeline: validate, taint-check, decide (allow, approve, or deny, deterministically), broker a per-call credential, dispatch idempotently, validate output, sign a receipt. A taint-check looks for data marked as untrusted or sensitive. Deterministic means the same input always gives the same decision. Idempotent dispatch means a repeated call has the same effect as a single call. A tool's safety classification describes the tool. The customer's approval rules decide, with auto-approval conditions Oxagen can apply to skip the human. Any consequence the customer marks (money, data destruction, production changes, external communication, access changes) requires a human-granted mandate. The mandate sets limits over the tool's declared measures and keeps a ledger. Kill switches exist at every level. Policy is versioned, signed and tested. | §6.5–6.12 |
| 12 | Oxagen accounts customer spend per model call by normalized token class, including cache reads and writes. It attributes spend up the chain operator → agent → run → turn → step. It reports proven versus unproven spend with a productive ratio and ranked optimization findings. Oxagen charges on two meters (2026-09-15, maintainer decision). Governed actions are priced in **governed action units** (GAUs) on one price list: $5 per 1,000 GAU list, a monthly allowance per tier (Free 5,000, Build 50,000, Scale 300,000, Enterprise negotiated), and 5,000-GAU blocks at $25. `resolve_approval` is the only billable governed action. In-app AI usage, the in-app agent's model calls, is metered in **usage credits** (1 credit = $0.01) at provider cost times the meter markup, funded by the $5 signup grant and topped up with credit packs. Tokens are not passed through at cost. Proven spend is a report figure. | §12 |
| 13 | Audit fidelity: **full bodies, seven years, write-once at seal time**. Seal time is the moment a record is closed and locked against change. Each organization has its own keys. Redaction happens before write. Frame rows stay in the hot table for a window, then compact into the archive segment. The run ledger stays forever. | §13 |
| 14 | Mission Control is nine pages: six in a workspace and three for the organization, down from 70. Everything else is deleted. Appendix F says where each old route went. | §14, App. F |
| 15 | A run is proven only by a **witness** Oxagen wrote. A witness is a test built with one of several deterministic oracles, checkers whose result is fixed for a given input. The witness fails on the PR's target branch and passes on the PR. It runs in a witness runner the worker can never see or reach. The runner reports only pass or fail back to the worker. The flip from fail to pass stamps the run. Stamped runs are the training asset. | §8.5 |
| 16 | An agent cannot finish until its **definition of done** says so. Before the agent moves, Oxagen drafts the acceptance checks for the prompt (or loads hand-written ones) and locks them by digest. At every Stop the checks run, hidden holdouts included, and a pure `decide(evidence)` answers HELD, PENDING or BROKEN with a closed reason. Oxagen never runs a check; it re-decides the evidence, binds the outcome to the sealed attempt, signs a certificate and records one governed action, `dod.held`, which is not billable. | §8.6 |
| 17 | The maintainer decisions of 2026-09-15 bind billing, approvals, the shell, intervention on ledger-ingested runs, Neo4j staying in the architecture, and the rev1 scope of Organization, Spend and API keys. A sentence above that one of them changes carries a dated note. | §20 |

---

## 1. Why this product, in one page

Companies rent intelligence by the token, the unit of text an AI model charges for. They cannot say what a token bought them. Their agents do not know the business. Nobody can limit them. Nobody can explain what they did. Nothing they learn is kept. The investor positioning names four jobs: **Teach, Govern, Explain, Learn**. This specification is the engineering shape of those four jobs as one product.

The wedge is narrow on purpose. A customer wraps the agents they already run (Stella, Claude Code, Claude Agent SDK agents, and custom agents). SDK means software development kit, a set of tools for building software. The customer then gets a mission control, one place to watch and direct every agent, that:

1. records every run frame by frame, with cost to the cent on every frame,
2. lets an operator watch, pause, steer, approve, and halt any run,
3. explains any decision by walking the chain: who asked, what the agent was told, what it did, what proved it, and what it cost,
4. turns what agents learn into reviewed, versioned steering (each change is numbered and kept) that lives in the customer's own repository,
5. teaches every future run from what earlier runs learned, published as records in the repository the team already reviews.

Owned intelligence (training a model per customer on proven runs) is the phase-three business. Nothing in this spec builds it. Nothing in this spec makes it harder, because proven runs are stored in the shape a training set needs.

**What this product is not.** It is not a coding-agent runtime, the system that runs an agent's code. It has no sandbox for agents, no file system, and no browser. A sandbox is an isolated space where code runs. It has no subagent fan-out, no skills engine, no evaluation harness, and no content generation. Subagent fan-out means one agent starting many helper agents. An evaluation harness is a test setup that scores agent output. The one execution plane it operates is the witness runner (§8.5). An execution plane is the place where work runs. The witness runner runs proofs, never agents. ADR-043 already made that cut in the current repo. An ADR is an architecture decision record, a short written note of a design choice. This spec keeps that cut, with one sentence of revision approved on 2026-09-18: "Oxagen does not run turns, but it may contain the process that does. A launcher that confines a process is not an agent runtime." The contained tier (§7.2, Phase 5 of §17.2) launches an agent under an OS sandbox whose only egress is the gateway. It does not exist yet, and neither does the witness runner, which is built on the same launcher. Onboarding is three screens, and every question about the fleet has a page. The in-app agent (§4.4) works through the same agent tools as those pages.

---

## 2. Scope

### 2.1 In scope for v1

- **Two renames, applied everywhere.** The current codebase uses the word *capability* for a registered contract with schemas, IAM defaults, and a handler. IAM is identity and access management, the system that decides who may do what. That contract is now called an **agent tool**. One registry holds Oxagen's own agent tools and the tools imported from MCP servers, APIs, and harnesses. MCP is the Model Context Protocol, a standard way for agents to reach outside tools. An API is an application programming interface, a way for one program to call another. A governed action is one top-level call to an agent tool. The current codebase uses the word *tacho* for the second thing, and that thing has no product name at all. It is simply **wrapping an agent**. In the SDK, the software development kit that developers use to call Oxagen from code, wrapping is `oxagen.agent.wrap({ ... })` in TypeScript and Python and `oxagen.Agent.Wrap(...)` in Go. All of these ship in one `@oxagen/sdk` package. In the CLI, the command-line tool, wrapping is `oxagen agent enroll | status | unenroll`. The runtime pieces are the `oxagend` collector, the `oxagen-hook` binary, and the `oxagen.frame/1.0` envelope. Neither old word appears in the product, the API, the UI (the user interface, the screens people work in), or the docs. Appendix E is the definitive list of agent tools that survive.
- **A free tier with the whole product in it, and one-click wrapping.** Every organization gets every feature, unlimited runs, 5,000 governed action units a month and thirty days of evidence free (§12.1). Governance means the rules, approvals, and records that control what agents do. Wrapping Claude Code or Codex takes one click. That click runs a signed installer on macOS, Windows, or Linux (§7.2). Onboarding is three steps. The app does not open until an agent has talked to Oxagen (§4.4).
- Organizations, workspaces, members, invitations, roles.
- Agent identity, credentials, RBAC down to the tool version, and delegation ceilings. RBAC is role-based access control, where a role decides what each agent may do. A delegation ceiling means an agent can never do more than the person it acts for.
- The gateway. `tachod` grows into it: the hook adapter, the loopback model proxy (the path each model call travels through, on the agent's own machine), the MCP aggregator and the tool gateway, and the control channel (§7.1). The hook adapter and the control channel are built. The rest is Phases 4 and 5 of §17.2.
- One assembler for steering, `assembleSteering`, with its manifest frame, and the Steering hub that shows it (§10.5, §10.7). Phases 0 to 2 of §17.2.
- Run recording, the frame chain (the ordered, linked sequence of frames in a run), checkpoints (saved points a run can be restored from), attestation (a signed statement that a record is what it claims to be), replay in two forms (render and fork), and bisect between two runs (narrowing down the step where two runs start to differ).
- Cost ledger, price book, budgets, and spend views.
- Context records, reflection, promotion, Context PRs (a PR is a pull request, a proposed change submitted for review), and steering delivery.
- The definition of done: drafting, locking, the three hooks in the harness, `decide()`, certificates, human signatures, and templates for repeatable tasks (§8.6).
- Mission Control UI, API, MCP endpoint, and a thin CLI (`oxagen`) for enrollment and administration.
- The in-app agent: a flyout from the sidebar, funded by the $5 signup grant and topped up with credit packs (§4.4, §12.10).
- Audit archive, retention, and export.

### 2.2 Out of scope for v1

- Training pipeline, eval harness (an evaluation harness, a test rig that measures model or agent quality), model serving, and in-firewall installer (phase 3).
- Marketplace, installable plugins, reseller billing, A2A federation (agent-to-agent, where agents from different systems work together), and mobile parity (a mobile app that matches the full product).
- Workflows and playbooks. Automations. Chat as a product interface.
- Connectors beyond GitHub. There is no connector SDK in v1.
- Cut by the scope review of 2026-09-14, and not on the roadmap: the ontology engine, SSO and SCIM, policy simulation against history, the published assurance suite, two-person mandates, steering effect metrics and retirement candidates, legal holds, crypto-shredding, and provider reconciliation to the cent. Each is a Series A question a customer has to ask for. The review also listed the in-app agent and Neo4j. The in-app agent is in scope (2026-09-14 and 2026-09-15, maintainer decisions, §4.4). Neo4j stays in the architecture (2026-09-15, §4.2).

### 2.3 Non-goals stated so they stay out

- No second permission system. IAM decides what is allowed. Every other part only attributes, meaning it records which agent or person an action belongs to without deciding permission.
- No second memory substrate, meaning no second store for what agents remember. Records are the memory model.
- No store of record that can be rebuilt from another store. Rollups (summaries computed from records) and indexes are allowed, and each one is labeled as such.
- No wire semantics of Oxagen's own, meaning no private rules for how data travels between systems. The protocol owns frames and records. Oxagen owns policy, storage, and product.

---

## 3. Vocabulary

This document uses each name exactly as defined here.

| Term | Meaning |
|---|---|
| **Organization** | The tenant, meaning one customer's own space in the system. An organization owns a key-encryption key (the key that protects other encryption keys), a Postgres partition, and a billing account. It may also own a dedicated data plane. |
| **Workspace** | A governance partition inside an organization, meaning a section with its own rules, approvals, and ownership. A workspace owns one **main repo** and any number of linked repos. It also owns one steering set, a set of agents, tool grants, and budgets. |
| **Main repo** | The one linked repository where a workspace keeps its steering and configuration under source control (version-tracked file history). Every workspace has exactly one. |
| **Linked repo** | Any other repository that a workspace's agents work on. Oxagen indexes it into the code graph. It may carry steering records scoped to that one repository. |
| **Principal** | Anything that IAM makes a decision about. IAM is identity and access management, the system that decides who may do what. The three kinds are `human`, `agent`, and `service`. |
| **Agent** | A registered principal of kind `agent`. It has an immutable key, meaning a key that never changes, in the form `org_ns.ws_ns.slug` (ADR-024). It also has a harness type (the software that runs the agent) and credentials. Each agent has one identity. Identity is never per run. |
| **Operator** | The human accountable for an agent's runs. Every run has exactly one operator. That holds even when a schedule or a webhook (an automatic call from another system) started the run. In that case the operator is the person who owns that trigger. The IAM field is `initiating_principal`. The word people see is operator. |
| **Run** | One session of one agent under one operator, from start to stop, on one task. Claude Code and Stella call this a *session*. The run stores the harness's session id, and the two words mean the same thing. A resumed or forked run is the same run with a new attempt. The run is the unit of attribution (who gets credited or charged), replay, and proof. |
| **Turn** | One prompt through to the point where the agent stops. The prompt can come from the operator, a schedule, or a resumed context. This is the same thing Claude Code and the OpenAI Agents SDK (software development kit, a library for building agents) call a turn. |
| **Step** | One model call or one tool call inside a turn. There are exactly two kinds of step, and no others. |
| **Model call** | One request to a model and the model's response. It carries usage counted by token class and a cost. OpenTelemetry (an open standard for activity data) calls this an inference span. |
| **Tool call** | One call to one tool version, with validated input and output. Every harness already uses this name. |
| **Frame** | One recorded event in a run. The frame is the replay unit. Each frame is hash-chained to the frame before it, meaning it stores a hash (a short fingerprint of data) of that earlier frame. A step produces one or more frames. A model call produces a request frame and a response frame. A tool call produces a requested frame and a result frame. A frame is distinct from a **context frame**. |
| **Context frame** | The protocol's atomic retrieval unit (`ContextFrame`), meaning the smallest piece of evidence the system fetches. It is evidence served into a prompt. Each context frame is typed, has a budget, and carries provenance (a record of where the evidence came from). |
| **Context record** | The protocol's immutable record (`ContextRecord`), one that cannot change once written. It holds what an agent or a person asserts, learns, proposes, or decides. There are twelve kinds. |
| **Steering** | What the model reads: everything Oxagen puts into an agent's context. It is advisory, ranked, budgeted, and may be dropped. Every piece of it is a `SteeringItem` (§10.5). |
| **Gating** | What the kernel refuses. It is deterministic, never budgeted, never ranked, and works when Neo4j is down. Steering and gating are two planes that never merge (§10.5). |
| **Steering item** | The one item type everything that can steer is turned into (`SteeringItem`): a record, a skill description, a memory, an ontology note, a gate notice, or the workspace's additional instructions. It carries a `force` of `must`, `should`, `may` or `info`. |
| **Assembler** | `assembleSteering(run, budget)`, the one function where everything competes for Oxagen's slice of the agent's context. It returns a stable prefix, a volatile selection, and a manifest of what was rendered and what was cut (§10.5). |
| **Gate notice** | The one line every gate emits into steering, so the agent does not walk into a denial. |
| **Gateway** | What `tachod` grows into: hook adapter, loopback model proxy, MCP aggregator, control channel (§7.1). |
| **Context PR** | A pull request (PR, a proposed change submitted for review) on the workspace repository. It proposes a change to steering. |
| **Governed action** | One top-level kernel call that passed IAM and the other gates, ran its handler, and wrote an audit record. The kernel is the system's core, a gate is a check a call must pass, and an audit record is a log entry of what happened. GAU billing counts it (§12.1): `resolve_approval` is the only billable governed action, and membership writes are free. Invoices and the UI (user interface) show it as **action**. A governed action is something *Oxagen enforced*. A tool call is something *an agent did*. The two overlap only where an agent's tool call went through the tool gateway. A harness-native tool call under the harness tier is a tool call but not a governed action. Oxagen observed it but did not gate it. A denied tool call is recorded but is not a governed action. Denials are free. Some things are governed actions but are not the worker's tool calls. These include a human granting a role, a Context PR merge, a repo sync, an approval decision, and a dod certificate settling. |
| **Enforcement tier** | What was actually routed through Oxagen on a run. The ladder is four words: `observe`, `harness`, `gateway`, `contained` (§7.1). Only `contained` earns the word "enforced" against the machine's operator. |
| **Replay grade** | The strongest thing a person can do with a run's recording. The grade comes from gaps in how complete the recording is. The grades are `inspect`, `view`, `fork`, and `retry`, ordered weakest first (§8.4). |
| **Delivery mode** | The boundary where a steer (one steering message) or a message enters a run. The modes are `next_step` (the default), `interrupt`, and `turn_boundary` (§7.3). |
| **Interrupt** | A steer that cuts the current step short instead of waiting for it to finish. It redirects a run. It does not stop one. Stopping is `pause`. |
| **Transport** | The player above a run's transcript. Its controls are scrub, step, play, pause, and speed. It moves the viewer, never the run. It has no stop control (§8.4). |
| **Data plane** | The set of data stores bound to one organization. It is shared by default. It is dedicated for customers whose firewall is the boundary (ADR-042). |

**The hierarchy, top to bottom:** organization → workspace → operator → agent → run → turn → step (model call | tool call) → frame. One operator has many agents. One agent has many runs. Every run has one operator. Oxagen attributes spend, progress, and proof to every level of this chain and to nothing else.

**Words the product does not use:** *execution* and *invocation* (say run or step). Also avoid *action event* (say step, or name the kind). Avoid *trace* as a noun for a run (say run, because a run *has* a trace). Avoid *span*, which is internal to OpenTelemetry export only. Avoid *attempt*, which is internal to the ledger (the internal record of run history). Customers see "resumed" instead. Avoid *session* except as the harness's synonym for run. Avoid *@all* as an address (say `@agents`). Avoid *render replay* and *re-run* as replay grades (say `view` and `retry`).

---

## 4. Architecture

### 4.1 Components

```
                    ┌──────────────────────────────────────────────────────┐
  agents            │  GATEWAY (tachod, on the agent's machine, loopback)  │
  ──────            │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
  Stella ──────────▶│  │ model proxy  │  │ tool gateway │  │ control ch │  │
  Claude Code ─────▶│  │ (Phase 4)    │  │ MCP endpoint │  │ bundle,cmd │  │
  Agent SDK ───────▶│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │
  custom ──────────▶│         │  kernel.invoke() with IAM, budget, approval │
                    └─────────┼────────────────┼───────────────┼───────────┘
                              ▼                ▼               ▼
  ┌───────────────────────────────┐   ┌─────────────┐   ┌──────────────┐
  │ Postgres                      │   │ Object store│   │ GitHub repo  │
  │ control ledger: identity, IAM,│   │ WORM, keyed │   │ per workspace│
  │ tools, prices, cost, billing, │   │ frame bodies│   │ published    │
  │ approvals, dod sets and certs │   │ archive     │   │ steering     │
  │ run record: runs, frames,     │   │ segments    │   │ (Context PRs)│
  │ records, the code graph       │   │             │   │              │
  └───────────────────────────────┘   └─────────────┘   └──────────────┘
                              ▲
                    ┌─────────┴──────────────────────────────────────────┐
                    │  SERVICES: recorder, reflector, promoter,           │
                    │  archiver, GitHub app, dod settle                   │
                    └─────────────────────────────────────────────────────┘
                    ┌────────────────────────────────────────────────────┐
                    │  MISSION CONTROL (web), API, MCP, CLI               │
                    └────────────────────────────────────────────────────┘
```

- **Gateway.** `tachod`, the daemon on the agent's machine, grown into four parts: the hook adapter, the loopback model proxy, the MCP aggregator and the control channel (§7.1). It reads the signed policy bundle from the control channel and works from its cached copy offline. It sends frames, digests and usage up to the recorder. Prompt bodies stay on the machine. It is the only path from an agent to a model or a tool at the `contained` tier, and one path among others below it. The hook adapter and the control channel are built. The proxy and the aggregator are Phase 4 (§17.2). The kernel behind the tool gateway runs on Oxagen's servers.
- **Assembler.** `assembleSteering(run, budget)`, the one function that decides what Oxagen puts into an agent's context, and records what it cut (§10.5). Phase 1.
- **Kernel.** One `invoke()` call runs the pipeline that exists today. The steps are: resolve the agent tool, validate the input, enter tenant scope (limit the call to one organization's data), make the IAM decision (IAM is identity and access management, the check of who may do what), which is always audited, admit the call against the budget, pass the approval gate, run the handler, validate the output, and write the audit record. The shape carries over unchanged. The count drops to about seventy agent tools.
- **Recorder.** Consumes batches of frames and checks that each frame chain is intact. Writes frame rows to Postgres and frame bodies to object storage. Prices model frames and updates run rollups (summed totals per run).
- **Reflector.** After a seal (the step that closes a run's record), it produces observation and memory records from the run.
- **Promoter.** Collects records across runs, produces proposals, opens Context PRs, and records promotion events when a Context PR merges. A Context PR is a pull request, a proposed change that reviewers approve before it merges.
- **Archiver.** Seals archive segments, compacts frame rows older than the hot window (the recent period kept in the hot table for fast queries), and enforces retention rules.
- **GitHub App.** Binds repositories, creates Context PRs, runs checks, handles merges, and re-indexes after changes.
- **DoD settle.** The one service with an opinion about done. It registers locked sets, keeps the hidden checks, re-runs `decide()` on submitted evidence, binds the outcome to the sealed attempt, signs the certificate and records the governed action `dod.held` (§8.6). It executes nothing.
- **Model layer.** The one path for every model call Oxagen makes on its own behalf (the reflector, the promoter, the dod drafter, and the run namer). Calls route by tier through OpenRouter (§4.5), a service that forwards model calls to many vendors. Customer agents' model calls never touch this layer. They go to the customer's own vendor with the customer's own credential, through the gateway's loopback proxy once Phase 4 ships (§7.1).

### 4.2 The stores and what belongs where

> **Status of this section (2026-09-18).** This section carries the storage rule approved on 2026-09-18 (the steering, graph and gateway review of 2026-09-18, linked in this document's header; ADR-093 "One assembler decides what reaches the agent, and records what it cut"). The rule is in force now. Two parts of it are targets: the steering index with its `steering_drift` check arrives with the assembler in Phase 1, and the graph projection of steering items arrives in Phase 3 (§17.2). Lines marked **Today** describe oxagen `main` at `02278c913`.

**The rule: storage stays plural, with one writer per fact. Only the assembler and its index are single.** Nothing is collapsed into Neo4j.

"Single source" names three different things, and only two of them have to be single:

| Thing | What it is | How many |
|---|---|---|
| **System of record** | Where a fact is authored. | Plural. Git for what is published. Postgres for what must be transactional or money-grade. The graph for lineage, evidence and entity links. Each fact has exactly one writer. |
| **Index** | Where steering is queried at run time. | One, behind a port (§10.5). First on the Postgres record registry. It moves to the graph in Phase 3, with Postgres kept as the fallback behind the same port. |
| **Assembler** | Where everything competes for Oxagen's slice of the agent's context. | One function, `assembleSteering(run, budget)` (§10.5). |

| Store | Holds | Never holds |
|---|---|---|
| **Git** (the workspace's main repo and its linked repos) | What is published: steering records, skills, agent definitions, the workspace configuration, and the promotion ledger. Each change is approved through a pull request. | Traces, memories, proposals |
| **Postgres** (shared plane, or dedicated for tenant data) | What must be transactional or money-grade (each change lands whole or not at all, and the amounts are exact): identity, tenancy, IAM, the tool registry and its schemas, decision rules and mandates, the price book, the cost ledger and its rollups, billing, budgets, approvals, intervention commands, archive manifests and control-plane audit events. The run record: runs, attempts, and frame metadata with digests and cost. The record registry: records, versions, the promotions ledger and proposals. The registry is the first steering index. | Frame bodies. The authored text of anything git publishes |
| **The graph** (Neo4j, one database per organization) | Lineage, evidence and entity links: the ontology, entities and relationships with provenance, agent memory (`:AgentMemory`), and from Phase 3 the projection of every steering item as a `:Record` node with `ABOUT` edges to files, repositories and entities. | Money of record, credentials, anything a gate needs to decide, bytes larger than a few KB |
| **Object storage** (write-once, per-org key) | Frame bodies (prompts, completions, tool input and output), archive segments, exports | Anything queried directly |

Gating never depends on the graph. A rule, a mandate or a kill switch is decided from Postgres and the signed bundle, so it still decides when Neo4j is down (§10.5, the two planes).

This is not the mirror problem (two copies that drift apart), because every fact has exactly one writer:

| Fact | Written by | Read by | How the copy is kept honest |
|---|---|---|---|
| Published text of a record, a skill or an agent definition | git, on merge | the index stores it by content hash (a short fingerprint computed from the text) at the merged commit | recompute the hash. A mismatch is `steering_drift`, which blocks delivery of that item |
| A record's registry row (`kind`, `force`, scope, status), its lineage, contradictions and promotion events | Postgres | the assembler and Mission Control | never in git |
| A proposal | Postgres | delivered to git as a pull request | one direction only: registry to git |
| Publication | git | flows to the registry on merge | one direction only: git to registry |
| A steering item in the graph (Phase 3) | the projector, from the registry | the assembler's relevance stage | one direction only: registry to graph, verified by hash. On a mismatch, or with the graph off, the assembler reads the Postgres path |
| A memory | the graph (`:AgentMemory`) | the assembler, through the memory adapter | not applicable: one copy |
| A decision rule, a mandate, a kill switch | Postgres | the kernel. The assembler reads them only to write gate notices (§10.5) | not applicable: one copy |
| A locked dod set | the harness, at lock | the cloud keeps a copy and the hidden checks | the digest. A mismatch is `LOCK_MISMATCH` (the dod spec) |

Platform engineers call this pattern GitOps: the desired state lives in git, a controller reconciles the live system to it, and drift is detected and reported. Oxagen is the controller. Steering, skills and definitions are the desired state. The registry, the index and the wrapped agents are the live system.

**Today.** Records live in Postgres (`agent.context_records`, `packages/database/src/schema/agent.ts:1303`) with their versions, promotions ledger and proposals, mirrored in git as `.oxagen/rules/*.toml`. The graph holds no steering: neither `packages/ontology` nor `packages/ingestion` writes a `:Record` node. Memory is in the graph as `:AgentMemory` and reaches only the in-app agent (§10.4). The knowledge graph is off unless `NEO4J_URI` is set. ClickHouse is still in the tree. Retiring it is a target of this specification and is not part of the 2026-09-18 refactor path.

### 4.3 Language and runtime

TypeScript on Node runs the control plane (the part that sets and enforces rules), the gateway, the services, and the UI. Hono handles HTTP and Drizzle handles Postgres access. The official `@contextgraphprotocol/typescript-sdk` is the source of protocol types (ADR-036). An SDK is a software development kit, a library that developers build on. Zod schemas remain the runtime validators at the trust boundary (the point where outside input enters the system). They are compile-checked against the SDK types. Rust stays in Stella and the protocol crates (Rust packages). Stella is deployed as a service, never embedded. The gateway's hot path is streaming pass-through. A Node process adds well under thirty milliseconds at the median for a proxied model call, which is the budget in §15.

### 4.4 Onboarding, and Oxagen's own model calls

The in-app agent is in scope. The scope review of 2026-09-14 proposed cutting it, and the maintainer kept it the same day ("dont cut the in app agent"). It opens as a flyout from the sidebar, as merged into the mockups repository in PR #1; the bottom dock on the `small-approvals-bottom-dock-scenarios` branch is not adopted (2026-09-15, maintainer decision, §20). Each of its turns is a run of its own, and it acts through the same agent tools a person clicks (§6, Appendix E), so what it does passes IAM and lands in the record like an action taken on a page. Its model calls are Oxagen's second meter, metered in usage credits (§12.1): the $5 signup grant in `create_org` funds the balance, and credit packs (`purchase_credits`) top it up (§12.10). Configuration is the same agent tools a person clicks. Explanation is the record: a chain of links to frames, records and commits.

**The engine.** The in-app agent is served by **Stella over HTTP** (2026-09-15, maintainer decision): Oxagen calls a hosted `stella serve` rather than running an agent loop in its own process, which keeps ADR-043's cut intact — Oxagen still governs rather than runs. The engine is a **required service**: nothing falls back to an in-process loop, so a panel that cannot reach it says so by name rather than degrading into something that reads like an answer. Its model calls are spent on the organization's own model key (§4.5), which is what makes a turn reconcilable to the organization that asked for it. With no key there is nothing to spend against, so the panel refuses and nothing is charged.

Stella also stays on the customer's machine as a wrapped agent. The two are different deployments of the same engine and are not confused in the record: a wrapped Stella's runs are the customer's, and the in-app agent's are Oxagen's.

**Its chrome.** The launcher at the foot of the sidebar, a top-bar button, the ⌘K group and the panel itself were removed on 2026-09-14 by the scope review, before the maintainer reversed the cut the same day, and were restored on 2026-09-15 (`scope-review.md`, the In-app agent row). The panel is a host the app reclasses but never rebuilds, so the flyout transition runs and a half-typed message survives a re-render.

Oxagen also makes model calls on its own behalf: the reflector (§9.1), the promoter's rationale and Context PR bodies (§9.2), the dod drafter (§8.6), and the run namer that writes `run.name` and `run.summary` from the frames. Every one of them goes through the model layer (§4.5), runs under a service principal, and is a frame in a run of its own, so its cost is accounted like everything else.

**Onboarding is gated, and it is three steps.** A new organization does not see the app. It sees one screen with three steps: (1) name the organization, (2) wrap an agent, with one click for Claude Code or Codex (the installer, §7.2) or with the five-line `oxagen.agent.wrap({})` snippet for an SDK agent, and (3) start a run. The full app unlocks the moment the first frame from that agent reaches Oxagen. The operator then lands on Fleet looking at their own run. That run is also the installer's smoke test, so there is one path, not two. The installer reads the git remote of the directory it ran in, so binding the main repo is one click.

### 4.5 Model access and routing

Every model call Oxagen makes on its own behalf goes through one model layer. That layer resolves three things, in order: the organization's **funding source**, the **tier** the caller asked for, and the **provider route** for that tier.

**Funding source** (ADR-053, carried; a third value added 2026-09-15, maintainer decision): `platform_minted`, `platform` or `customer_key`.

- `platform_minted` — Oxagen mints **one OpenRouter key per organization** through the provider's key-provisioning API, on Oxagen's own account, and holds it enveloped. Oxagen owns it, pays for it, and can rotate or revoke it, so its tokens are billed exactly as `platform`. What it buys is reconciliation: the provider's own usage report carries one line per provisioned key, so the provider's number and Oxagen's usage-credit ledger can be joined on `provisioned_id` and compared. The monthly cap is set **on the key at the provider**, not only in Oxagen's meter, so a fault in Oxagen's metering cannot spend past it. This is what a new organization starts on.
- `platform` — Oxagen pays on Oxagen's OpenRouter account, on one key shared across customers. Billed back at vendor cost plus a published markup, capped per organization. The provider returns a single undifferentiated total for every customer at once, so Oxagen's meter is the only witness to its own arithmetic; `platform_minted` exists because that is not good enough to reconcile against.
- `customer_key` — the customer's own OpenRouter or vendor key. Its tokens are reported and billed at zero.

In all three the key is stored enveloped (encrypted with a key that is itself encrypted), tested before save, and never returned, and every read of it is audited. What a screen may render is the prefix, the provisioned id, the key hash and the counters, never the secret. Minting, rotating and revoking are governed actions and appear in the audit record by name (`org.model_key.mint`, `.rotate`, `.revoke`). Every tier's month-to-date use (complex, light) is one record, the route table, read by both Organization → Funding (the cap's "used") and Spend (the month total and By model), so the two pages report the same month. Vendor neutrality is preserved: a customer key may point at OpenRouter or directly at a vendor, and the route table below is set per organization.

**Tiers and default routes:**

| Tier | Use | Default route (OpenRouter) | Resolves today to |
|---|---|---|---|
| `complex` | reflection reasoning, promotion rationale, conflict analysis, Context PR bodies, dod drafting | `z-ai/glm-latest` | GLM 5.3 (1.3M context) |
| `light` | classification, labeling, record kind detection, redaction hints, approval summaries, run names and summaries | `z-ai/glm-flash-latest` | GLM 5.3 Flash |

Rules:

1. **Configure the alias, record the concrete model.** Tiers point at OpenRouter's rolling aliases, so "latest" stays current without a deploy. Every `model.response` frame records the concrete model id the provider returned. The cost record prices that concrete id from the price book. A replay therefore names the exact model, and a price is never looked up by alias.
2. **Routes are organization settings** with platform defaults. An organization may pin a concrete id, choose a different vendor per tier, or set a fallback route for when the primary returns a provider error. Every fallback is recorded as a frame.
3. **No call reads the process environment.** Keys and routes come from the model layer's resolver, the same lookup point the data-plane resolver uses. A call path that bypasses it is a defect.
4. **Batch variants** (`:batch`) queue calls to be processed together later, at their own price. They are allowed only for the reflector and promoter, which run asynchronously (outside the request path). They are recorded with their own price entries.
5. **Customer agents are unaffected.** Their model calls go to their own vendor with their own keys and models, through the gateway's loopback proxy once Phase 4 ships (§7.1). The tier table governs Oxagen's own work only.

---

### 4.6 Deployment modes: Oxagen's cloud, or behind the customer's firewall

Oxagen runs as a multi-tenant cloud (one deployment serving many organizations) and, from Series A, behind a customer's firewall, from the same code. Per-organization data planes (§5) already make every store switchable. So the appliance is a deployment mode, not a fork.

- **One deployment artifact.** A signed bundle stands up the gateway, the services, Mission Control, the witness runner, Postgres, and S3-compatible object storage with object lock. The bundle is a Helm chart (an install package) for Kubernetes (the system that runs and scales containers), with a single-node Docker Compose variant (a one-machine setup) for evaluation. Object lock is a storage setting that blocks edits and deletes for a set period. The containers are the same as the cloud's, with a deployment mode flag.
- **Connectivity is outbound only, and optional.** Nothing inbound is required. Outbound is needed only for what the customer chooses: model providers (or none), GitHub or GitHub Enterprise Server, and an optional signed usage report sent to Oxagen for metering (measuring usage). Fully air-gapped, meaning no network path to the outside, is a supported mode, not a degraded one.
- **Air-gapped means in-firewall models.** Model routes (§4.5) point at models the customer serves inside its own network: the owned models on the roadmap, or any OpenAI- or Anthropic-compatible endpoint.
- **Everything the cloud enforces, the appliance enforces.** That includes the witness runner and the dod settle service, whose sealed results the customer hands to its auditor.
- **Updates are signed bundles** that the customer applies on its own schedule. The migration runners already iterate per plane. Licensing is per organization, annual, and invoiced. Stripe is not involved behind a firewall. The two cloud-only assumptions in this document (Stripe, OpenRouter) are deployment-mode settings.

## 5. Tenancy and isolation

### 5.1 The model

The model is exactly today's model. An **organization** holds **workspaces**. A person belongs to an organization with one org role. The same person belongs to workspaces with one workspace role each. Agents belong to a workspace. Only the table count and the enforcement change.

**Organization.** Its `public_id` starts with `org_`. It has a `slug` and an immutable `namespace` of 2 to 6 characters. Immutable means the value is fixed at creation and never changes. The `namespace` is used in agent keys. The organization also has a `plan`, a `status`, and settings. It owns: a KMS key-encryption key, a billing account, an optional dedicated data plane (ADR-042), and its retention policy. KMS is a key management service, a cloud service that stores and guards encryption keys. A key-encryption key is a top-level key that encrypts other keys rather than data.

**Workspace.** Its `public_id` starts with `wrk_`. Its `slug` and immutable `namespace` are unique within the org. It owns: one **main repo** (required at creation, §10.1) plus any number of linked repos, one steering set, agents, tool grants, budgets, a governance mode (`solo` | `team` | `regulated`), and a retention mode (`content_exact` by default, `digest_only` as an opt-down).

**Roles.** Org roles are `owner`, `admin`, `member`, `billing`, `compliance`, and `viewer`. Workspace roles are `owner`, `member`, and `viewer`. Agent roles are `observer`, `contributor`, and `operator`. Custom roles are on for every tier (2026-09-15, maintainer decision: no feature is gated on the enterprise license, §12.10). They are built from the same grant table, not from a second system.

### 5.2 Postgres: Row-Level Security without a bypass switch

Row-Level Security (RLS) is a Postgres feature. It attaches a rule to a table, and the database hides any row the rule rejects. Every tenant table carries `org_id NOT NULL`. Workspace tables also carry `workspace_id NOT NULL`. There are two policy classes, down from six today:

- `org`: rows belong to the organization (memberships, invitations, billing, roles, price overrides, archive manifests).
- `workspace`: rows belong to one workspace (agents, tool grants, budgets, approvals, commands, connector state).

The application sets scope once per transaction with transaction-local settings, exactly as `withTenantDb` does today. A transaction-local setting, also called a GUC in Postgres, is a named value that lives only for the current transaction. The policy reads those settings. Nothing else can widen the scope.

```sql
-- helper functions, STABLE, run as the invoker
create function app.current_org() returns uuid language sql stable as
  $$ select nullif(current_setting('app.current_org_id', true), '')::uuid $$;
create function app.current_workspace() returns uuid language sql stable as
  $$ select nullif(current_setting('app.current_workspace_id', true), '')::uuid $$;

-- class: workspace
alter table wrk.agents enable row level security;
alter table wrk.agents force row level security;
create policy tenant_isolation on wrk.agents
  for all to oxagen_app
  using (org_id = app.current_org()
         and (app.current_workspace() is null or workspace_id = app.current_workspace()))
  with check (org_id = app.current_org() and workspace_id = app.current_workspace());

-- system access is a role, not a setting
create policy system_access on wrk.agents
  for all to oxagen_system using (true) with check (true);
```

Rules:

1. **No `app.rls_bypass`.** Today any logged-in role can set it, and every policy honors it. This design deletes that setting. System paths connect as `oxagen_system` instead. These paths include identity resolution before scope exists, webhooks, cron, and bootstrap. `oxagen_system` is a distinct role with its own policy, its own connection pool, and its own audit counter. `oxagen_app` is not a member of `oxagen_system` and cannot `SET ROLE` to it.
2. **Org-level sessions see all workspaces of their org.** When no workspace is set, the read predicate collapses to `org_id`. Writes to workspace-class tables always require a workspace. This replaces today's nullable-workspace tables.
3. **Startup guards stay.** The app refuses to boot in production if the app role is a superuser or has `BYPASSRLS`. A superuser is a Postgres account that skips every permission check. `BYPASSRLS` is a role attribute that lets a role skip RLS rules. The app also refuses to boot if RLS enforcement is off.
4. **The policy manifest is generated from the schema.** A CI test checks that every `org_id` column appears in it. This rule carries over from today.
5. **Dedicated data planes.** A dedicated Postgres data plane holds tenant data only. Identity, IAM, billing, and the price book stay on the shared data plane (ADR-042). The resolver is the only place that reads a connection string.

### 5.3 The run record and the code graph in Postgres

The run record (runs, attempts, frames, seals), the context records and the code graph are tenant tables in Postgres under the same row-level security as the control ledger (§5.2). Neo4j holds none of them (§4.2), so these tables have no second engine to isolate. Every row carries `org_id` and `ws`; the kernel is the only writer, and a write that omits either is refused before it reaches the database. Cross-tenant reads are refused by the database, not by application code, and the startup guard (no superuser, no `BYPASSRLS`, RLS never off) applies to the whole plane.

Frames are the volume. They live in a hot table for the retention window (§13.3), partitioned by month, and compact into the archive segment after it. A run's rollups (frame count, cost, tier, gaps) are columns on the run row. The code graph (`File`, `Symbol` and their edges, §11) is a set of ordinary tables keyed by repository and commit. Platform catalogs (price books, tool schemas, connector definitions) are platform tables, never tenant rows, so a tenant partition never contains another tenant's data, by construction.

A dedicated data plane (§4.6) is a dedicated Postgres cluster and object-storage bucket. Identity, IAM, billing and the price book stay on the shared plane.

### 5.4 Keys

Each organization has one key-encryption key in KMS. Data-encryption keys are the keys that encrypt the data itself, and the key-encryption key encrypts them. There is one data-encryption key per object (frame bodies, archive segments). The existing envelope-encryption package carries over.

---
## 6. Identity, access, and the toolbelt

### 6.1 Principals

`iam.principals` (IAM means identity and access management) holds `kind ∈ {human, agent, service}`, `org_id`, `workspace_id` (required for agents), `parent_user_id` for an agent that acts on behalf of a person, and `status`. A human principal is bound to `auth.users`. Better Auth carries over. A service principal is a machine identity. Oxagen's own services and customer integrations use it.

### 6.2 Agent identity and credentials

An agent is registered once, in a workspace, with:

- `agent_key`: `org_ns.ws_ns.slug`. It never changes (ADR-024).
- `harness`: `stella` | `claude-code` | `claude-agent-sdk` | `custom`.
- `principal_id`.
- A **long-lived agent credential**. This is an API key issued to the operator once. It is stored as a hash (a one-way fingerprint of the key), locked to one purpose, and revocable.
- **Short-lived run tokens** (target, not built: no run token exists on `main` at 2026-09-18, and they arrive with the gateway in Phase 4, §17.2) minted by the gateway at run start. The default life is fifteen minutes, refreshed on the control channel. Every model-proxy and tool-gateway call carries a run token. Revoking the agent credential or suspending the agent invalidates every run token at the next call. This is what makes a halt stick (§7.4).
- For hook-enrolled hosts (Claude Code), the host device key (Ed25519) from the agent enrollment. It signs checkpoints.

Delegation ceiling: an agent can never do more than the person it acts for. Its effective permission is its own grants intersected with the invoking human's grants. Subagents can only narrow. This carries over from the agent-RBAC spec (RBAC is role-based access control, permissions granted by role).

**Identity in Postgres, definition in git.** An agent has two halves. Its **identity** lives in Postgres: principal, credentials, roles, mandates, the things that must be revocable in one second. Its **definition** is a file in the workspace's main repo under `.oxagen/agents/<slug>.toml`. That file says what the agent is for, its instructions, which tools it may use, which model tier, and harness-specific settings. It is the source of truth for the definition. Two things join the halves. The first is the agent key (`org_ns.ws_ns.slug`, where `slug` is the file name). The second is `definition_digest`, the digest (a fixed-length fingerprint) of the file at the commit the agent last ran from. Runs record that digest as the agent's version.

```toml
# .oxagen/agents/release-manager.toml
schema = "agent-definition/v0.1"
slug = "release-manager"
name = "Release manager"
description = "Prepares release notes and opens the release PR. Never merges."
model_tier = "complex"                     # or a pinned model id
tools = ["github__*", "linear__get_issue", "search_graph", "recall_context"]
deny_tools = ["github__merge_pull_request@*", "github__delete_*@*"]
side_effects = ["read", "write"]           # never "irreversible"
budget = { per_run_micros = 2000000 }
[instructions]
body = """
You prepare releases for this repository. Read the changelog conventions in
.oxagen/rules before writing notes. Open a pull request; a person merges it.
"""
[harness.claude-code]
color = "blue"
[harness.codex-cli]
sandbox = "read-only"
```

**One source, every harness.** Each coding harness keeps agent definitions in its own place and format. Claude Code reads `.claude/agents/<name>.md` (front matter plus instructions). Codex CLI reads its own agent files. Stella reads the canonical format (the single official form). Oxagen generates the harness files from the canonical one, in the same pull request. So the repo carries `.oxagen/agents/release-manager.toml` and beside it `.claude/agents/release-manager.md` and the Codex equivalent. Each generated file has a header naming the source file and its digest, and is marked generated. The set of formats is an adapter table in Oxagen. A harness changing its format is a table change, not a product change. Stella needs no generated file: `.stella/agents` is a symlink to `.oxagen/agents` (§10.2). A pull request that edits a generated file without regenerating it fails the checks. The canonical file is the only one a person or agent edits.

**The loop the operator sees.** Creating or changing an agent in Mission Control (`register_agent`, `update_agent`) does not write Postgres first. It opens a Context PR on the main repo. That PR adds or changes the canonical file and the generated files. The checks validate the definition: the schema, tools that exist in the registry, no `irreversible` without a mandate, and instructions that pass the secret and PII scan. Merge creates or updates the principal, the roles the definition asks for, and the toolbelt. The next time the operator opens their coding agent in that repo, the agent is there. The same works in reverse. An agent definition committed by hand appears in Mission Control on merge. Its identity is created, and its status is `unenrolled` until credentials are issued. Deleting an agent is a PR that removes the file. The principal is retired, never deleted, so its runs keep their identity.

### 6.3 Roles and grants

One grant table: `iam.role_grants(role_id, subject_kind, subject, effect, resource_scope)`.

- `subject_kind ∈ {agent tool, tool}`. An agent tool subject is a kernel agent tool name (verb-first snake case, ADR-025). A tool subject is a tool pattern `server:tool@version` with globs.
- `effect ∈ {allow, deny, require_approval}`. Deny wins. `require_approval` routes to a human (§7.5).
- `resource_scope` is a typed JSON ceiling. It names the record kinds and code-graph tables the agent may read or extend, repositories, the side-effect classes allowed (`read`, `write`, `irreversible`), the egress classes allowed, and spend limits per run and per day.

The resolver keeps the three live rules of today's resolver: role grant, org-owner override, and the agent tool's declared default. The dead condition language is not carried.

### 6.4 Tools: RBAC to the tool version, schemas on both sides

The **tool registry** (`tools.tools`, `tools.tool_versions`, `tools.tool_servers`) is the only source of tools an agent can see. A tool version has:

```json
{
  "tool_id": "tool_…", "server": "github", "name": "create_pull_request", "version": "3",
  "input_schema":  { "$schema": "https://json-schema.org/draft/2020-12/schema", "...": "..." },
  "output_schema": { "$schema": "https://json-schema.org/draft/2020-12/schema", "...": "..." },
  "schema_digest": "sha256:…",
  "risk": "high", "side_effect": "irreversible", "egress": "third_party",
  "price": { "unit": "call", "micros": 0 },
  "consequence_tags": ["moves_money"],
  "measures": { "amount": { "path": "$.amount", "type": "money", "currency_path": "$.currency" }, "counterparty": { "path": "$.recipient", "type": "identifier" } },
  "data_classes": ["payments"],
  "idempotency": { "supported": true, "key_path": "$.idempotency_key" },
  "credential": { "connection_kind": "oauth" | "api_key" | "cloud_role" | "github_app" | "none", "downscope": "token_exchange" | "session_policy" | "restricted_key" | "none" },
  "source": "mcp" | "agent tool" | "http" | "harness",
  "schema_origin": "declared" | "imported" | "observed_approved"
}
```

Tool sources:

- **MCP servers** (MCP is the Model Context Protocol, a standard way for agents to reach tools). Schemas are imported from `tools/list`. Output schemas come from the server's `outputSchema` when declared. When absent, the gateway records observed outputs, infers a schema, and files it as a registry proposal for an admin to approve. Until approval, the output is validated only for size and type, and the run's completeness record says so.
- **Oxagen agent tools.** Input and output are the contract's Zod schemas, exported as JSON Schema (a standard format for describing the shape of JSON data).
- **HTTP tools.** An admin declares them with both schemas.
- **Harness-native tools** (Claude Code's `Bash`, `Write`, `Edit`, and so on). Schemas are known per harness version and validated at the hook payload.

The registry is the catalog. The rest of this section covers what an agent can do with it.

### 6.5 The threat model at the tool call

An agent does its damage at the tool call: the payment it sends, the record it deletes, the data it exports, the message it posts, the branch it force-pushes. Everything above the tool call is words. Oxagen is built so that the following cannot happen to a wrapped agent. Each line names what makes it impossible rather than unlikely:

| Threat | What prevents it |
|---|---|
| The agent calls a tool it was never granted | It cannot see the tool. The toolbelt (§6.6) is built from grants. A call by name to anything outside it is rejected before lookup and recorded as `unknown_tool` |
| The agent uses a credential it holds | It holds none. Credentials live in the broker (§6.8). The agent receives results, never secrets. A leaked run token cannot reach a tool server directly |
| A prompt injection in a document, page, or tool output steers the agent into a harmful call | Tool output is data, wrapped with provenance. Arguments derived from untrusted output are marked as tainted (flagged as coming from untrusted content). Taint on a write, or on a call carrying a consequence tag, raises the decision to approval (§6.7) |
| The agent takes a consequential action beyond its authority: moves money, drops a table, emails customers, deploys to production, changes who has access | Any call carrying a consequence tag requires a **mandate** (§6.9) with limits over the tool's declared measures. Before dispatch, the policy engine compares the call's measures, targets, and period against the mandate's remaining authority. The customer's approval rules decide whether a human must look |
| A retry or a loop double-charges or double-posts | Every call carries an idempotency key (a key that makes a repeated call count only once), derived from its canonical digest. The gateway suppresses a duplicate dispatch within the tool's idempotency window and records it |
| An approval is reused, forged, or applied to a different call | Approval tokens are single-use. Each is bound to the exact call digest, agent, run, and expiry, and verified against the mint key. A mismatch is `token_denied` |
| A human's broad credential is borrowed by an agent (confused deputy) | The delegation ceiling: an agent's effective grants are its own ∩ the operator's. The broker mints a credential scoped to the call, never the operator's session |
| The agent forges or omits its own audit record | The gateway writes the record, not the agent, and chains it into the run. A client-attested call is labeled as such and can never be shown as gateway-enforced |
| An operator cannot answer "who allowed this, under what authority, and what happened" | Every call has a **receipt** (§6.10): decision, policy version, grants and mandate used, approver, credential grant, request and response digests, external effect ids, all signed |
| A tool, server, agent, or workspace needs to be stopped now | Kill switches at every level (§6.11), enforced at the next call boundary by the deny generation, with token revocation behind them |

The enforcement tier (§7.1) states how much of this was in fact enforced, reported as it is, with its source. These guarantees hold at `gateway` tier. At `harness` tier the hook enforces the decision, but Oxagen did not carry the credential. At `observe` tier nothing is enforced. The record says which, on every call, and no report can say more.

### 6.6 The toolbelt and how a model sees it

An agent's **toolbelt** is the built set of tool versions it may call: `grants ∩ delegation ceiling ∩ policy bundle ∩ kill switches`. It is computed at run start, cached with the bundle version, and recomputed on any deny-generation bump. It is the only tool list the model is ever shown.

**Presentation.** Tools are presented to the model in the tool-definition format the harness expects (MCP `tools/list` for MCP clients, native tool definitions through the model proxy). Oxagen adds three properties to every definition's description in a fixed, machine-readable trailer: the risk grade, whether the call will require approval, and any budget or mandate ceiling that applies. A model that knows a call will be held for approval plans differently than one that does not. Names are stable (`server__tool`). Schemas are the registry's. Every definition carries its schema digest, so a run's frames can prove exactly which schema the model saw.

**Two modes, chosen by belt size.**

- **Full belt** (small belts, up to a workspace-set limit that defaults to 40 tools or 12k tokens of definitions): every definition is in the request.
- **Searchable belt** (everything larger): the request carries only two meta-tools plus any tools pinned as always-present. `search_tools(query, kinds?)` returns names and one-line descriptions ranked by relevance, from an index over the belt only. `load_tools(names[])` returns full definitions. Both are themselves governed calls recorded as frames, so the record shows what the model looked for and what it was shown. A search never returns a tool outside the belt. What the model cannot call, it cannot find, so it cannot be prompt-injected into calling it.

The tool-definition token count is measured on every model call (§12.6). The findings job flags belts that are wider than the agent uses.

**Harness-native tools** (a coding harness's shell, file edit, browser) are in the belt as tool versions of the harness's tool set. They are governed at the hook (harness tier), with the same grants, risk grades, and approval rules. A wrapped agent therefore has one belt across the MCP tools it reaches through the gateway and the native tools its harness provides.

### 6.7 The call pipeline

The **tool gateway** is one MCP endpoint per workspace. Every call passes these steps in this order. Each step either advances or ends the call. Each step writes what it decided into the call's frames.

1. **Authenticate.** The run token identifies agent, run, attempt, operator, and bundle version. Expired, revoked, or mismatched tokens end the call as `unauthenticated`.
2. **Resolve.** `server__tool` resolves to one tool version in the belt. Not in the belt: `unknown_tool`, recorded, and counted toward an automatic halt threshold.
3. **Validate input.** Strict validation against `input_schema` (no additional properties, formats enforced, size caps). Failure is `schema_violation`, denied. The canonical input digest is computed here. It is the call's identity for idempotency, approval binding, and receipts.
4. **Taint.** Each argument is checked against the digests of untrusted content the run has seen (tool outputs, retrieved documents, web content, context frames marked untrusted). An argument that contains or derives from such content marks the call `tainted`, with the source frame ids.
5. **Decide.** The policy engine (§6.12) evaluates grants, resource scope, the tool's safety classification, taint, the customer's approval rules and their auto-approval conditions, mandate authority for calls carrying a consequence tag, budgets, rate limits, sequence rules, and kill switches. It returns one of exactly three outcomes with the rules that produced it: **allow**, **approve** (route to a human), **deny**. The decision is deterministic (the same input always gives the same answer), versioned, and replayable. No model participates.
6. **Approve** (when the decision is approve). The call is parked with a timeout. An approval request carries the four-hop chain (operator, agent, call, rule) and the mandate if any. A human resolution mints a single-use approval token bound to the call digest. Expiry or denial ends the call with the human's reason attached, and the reason is what the model reads.
7. **Broker a credential** (§6.8). The broker mints or selects the narrowest credential the tool server needs for this call. It is scoped by the tool's declared scope and the call's arguments where the provider supports it, with a short TTL (time to live, how long it stays valid), bound to the call id. The agent never sees it.
8. **Dispatch** with an idempotency key. Duplicates inside the tool's window return the recorded result and record `duplicate_suppressed`.
9. **Validate output** against `output_schema`. Run redaction detectors when the tool's egress class or the workspace policy requires. Then wrap the result with provenance (tool version, server, response digest, external ids extracted by the tool's declared paths). Output violations are recorded. By policy, they are passed with a warning frame or replaced with a typed error.
10. **Receipt** (§6.10). Written, signed, chained. The result goes to the agent only after the receipt is durable.

Latency budget for steps 1 through 5 and 9 through 10 combined: 20 ms at p99 for schemas under 64 KB (§15). Approval and brokerage are outside the budget by nature. The model sees them as waits with reasons.

### 6.8 The credential broker

**A wrapped agent holds no credentials. Not an API key, not an OAuth token, not a cloud role, not a GitHub token.** (OAuth is the standard for letting one service act on a user's behalf.) It holds one run token that is good for talking to Oxagen and nothing else. One credential is outside this rule by design: the model vendor's own credential (an API key or a subscription login) stays on the agent's machine, and the loopback proxy forwards it without Oxagen ever holding it (§7.1). This paragraph describes tool credentials, and it is a target: the broker and run tokens are not built at 2026-09-18. Most of the threat model rests on this single property. It is what makes a Fortune 500 tool estate governable: every secret stays in one place, under one audit log.

**Connections** are the customer's credentials to tool servers and APIs, stored in the vault (enveloped under the organization's key, every read audited). They include OAuth grants with refresh tokens, API keys, cloud roles Oxagen may assume, and GitHub App installations. A connection is bound to a workspace and to the tool servers it authorizes. It has an owner (a human) and a review date.

**Per-call credentials.** For each dispatched call the broker produces the narrowest credential the provider allows, in this preference order:

| Provider support | What the broker mints | Examples |
|---|---|---|
| Token exchange (trading one token for a narrower one) or downscoping | a short-lived token scoped to the call's resource and action | OAuth 2.0 token exchange (RFC 8693), Google downscoped tokens, Microsoft on-behalf-of with narrowed scopes |
| Session policies (temporary rules attached to one login session) | a temporary session whose policy is the intersection of the connection and the call | AWS STS `AssumeRole` with a session policy naming the bucket or table in the arguments |
| Restricted or installation tokens (a restricted key is limited to set actions and targets) | a key limited to the tool's agent tools and the call's targets | Stripe restricted keys, GitHub App installation tokens limited to the repositories in the call |
| None | the stored credential, used server-side by the gateway for this call only, never transmitted to the agent | legacy API keys |

Each mint is a **credential grant**: connection id, scope, TTL, call id, and the provider's token identifier where one exists, recorded on the call's receipt. TTL defaults to the call's expected duration plus a margin, never more than one hour. Revoking a connection invalidates its grants at the next use.

**Connections behind consequential tools.** A connection is marked `requires_mandate` when any tool it backs carries a consequence tag: payment processors, banking, cloud billing, production databases, deployment systems, customer messaging, identity providers. Such a connection requires a named human owner with a role the workspace names for that consequence. It requires a mandate (§6.9) for every agent that may use it. It requires a restricted or downscoped credential where the provider offers one, and the gateway refuses to expose a full-scope key to such a tool.

### 6.9 Safety classification, approval rules, auto-approval, and mandates

Three things that are easy to confuse are kept apart, in the code and in the interface. Nothing in the product is named after money. Money is one example of a consequence.

**1. Safety classification describes a tool and decides nothing.** Every tool version carries the following. A risk grade. A side-effect class (`read`, `write`, `irreversible`). An egress class. **Consequence tags**, from a starter set the customer extends (`moves_money`, `destroys_data`, `alters_production`, `communicates_externally`, `changes_access`, `changes_entitlement`, and any tag the customer defines). **Measures** the tool exposes, declared as paths into its input with a type and a unit (an amount with a currency path, rows affected, a target environment, a recipient count, a table name). And the data classes it touches, from the data layer (§11.7). Classification is set when a tool is imported or declared, reviewed on the Tools page, and shown to the model in the tool definition. It never allows or denies anything by itself.

**2. Approval rules decide, and they belong to the customer.** An approval rule is policy (§6.12) over any tool, written against the classification and the call: tool pattern, consequence tags, measures, data classes, taint, time window, sequence, environment, operator role, agent, mandate position. Its outcome is allow, approve (a human must look), or deny. **Auto-approval** is an approval rule whose conditions, when met, let Oxagen skip the human. Those conditions can be a measure under a threshold, a counterparty or environment on an allow list, a call inside a mandate's remaining authority, a standing approval (the same call digest approved by a person within a window the rule names), no taint, or business hours. An auto-approved call is recorded as an approval whose approver is `policy:<rule id>`. So the receipt says plainly that no person looked. A rule cannot be saved that would widen an agent past its operator's grants.

**3. A mandate is bounded, expiring authority for a consequence.** A human with the role the workspace names for a consequence tag grants one agent authority to cause that consequence, within limits over the tool's declared measures. Nothing in a grant, a role, or a bundle substitutes for it. A call carrying a consequence tag with no mandate is denied before dispatch. One that exceeds its mandate is denied or routed to a human by the mandate's own approval rule.

```json
{
  "mandate_id": "mnd_…", "agent": "a-intel.finops.invoice-bot", "granted_by": "usr_…", "role_at_grant": "org.billing",
  "consequence_tags": ["moves_money"],
  "limits": {
    "amount": { "per_call": 250000000, "per_period": 2000000000, "currency": "USD", "period": "monthly" },
    "calls":  { "per_day": 50 }
  },
  "targets": { "counterparty": { "allow": ["vendor:aws", "vendor:github"], "deny": ["*"] } },
  "tools": ["stripe__create_payment@*", "aws_billing__purchase_savings_plan@2"],
  "approval": { "human_above": { "amount": 100000000 }, "always_human_for": ["destroys_data"], "approvers": ["role:org.billing"] },
  "purpose": "monthly infrastructure invoices, PO-4471",
  "valid_from": "2026-09-01T00:00:00Z", "valid_to": "2026-12-31T23:59:59Z",
  "status": "active"
}
```

The same shape covers the other consequences. Destroying data: measures `rows_affected` and `tables`, targets limited to named environments, `per_period` on rows, always human for production. External communication: measure `recipients`, `per_day`, targets limited to domains. Production changes: measure `target_environment`, `per_day`, a time window. Access changes: measure `principals_affected`, targets limited to roles below the granter's own.

Rules:

- **Measures are read from the call**, by the tool version's declared paths. A tool that carries a consequence tag but exposes no measure for the limit a mandate names cannot be granted that mandate. It is denied by construction.
- **Remaining authority is tracked in Postgres** as a ledger by measure (`tools.mandate_ledger`: reservations at decision time, settlements at receipt time, releases on failure). So two concurrent calls cannot both fit under the same remaining limit.
- **Every consequential receipt records the external effect id** (a transaction id, a migration id, a message id, a deployment id) and the mandate it drew on. Where a connection reports its own activity by webhook (a payment processor's charge events, a deployment system's history), the gateway matches the event to a receipt. An event attributable to the connection with no receipt is an exception at severity critical: an action Oxagen did not govern.
- **Mandates expire.** They are reviewed on a schedule the organization sets. A person with the finance role grants and changes them; each change is a governed action with a receipt. Revoking a mandate ends in-flight calls that have not dispatched.
- Mandates are visible on the Tools page as a ledger the accountable office can read (finance for money, the platform team for production, security for access). It shows who granted what authority to which agent, how much is used, and what it was for.

### 6.10 Receipts: provenance for every call

A **receipt** is the signed record of one tool call. The gateway assembles it from the call's frames at step 10 and stores it as its own frame. It is what an auditor, a security lead, or a CFO opens.

| Field group | Contents |
|---|---|
| Who | operator, agent, run, turn, step, and the task reference if any |
| What | tool version, schema digest, canonical input digest, and the input (or its redacted form per retention policy) |
| Authority | decision outcome, policy version, rule ids that fired, grants used, delegation ceiling result, mandate id and amount reserved, approval token id and approver with reason, taint sources |
| Credential | credential grant id, connection id, scope, TTL, provider token identifier |
| Effect | dispatch time, tool server, response digest, output validation result, redactions, external effect ids (payment id, PR number, message id, object key), idempotency key and whether a duplicate was suppressed |
| Integrity | frame hash, chain position, gateway signature, enforcement tier |

Receipts can be exported one at a time or in bulk (CSV, JSON, signed bundle). They are the unit the Audit page searches. A receipt for a client-attested call exists too. Its authority group says `observed` where the gateway would have said `enforced`.

### 6.11 Kill switches and blast radius

Deny is available at every level. It takes effect at the next call boundary through the deny generation, with token revocation behind it for anything that keeps calling:

- a **tool version** (a server shipped a bad version), a **tool server**, a **connection** (a credential is suspected leaked, and its grants die with it),
- an **agent**, an **operator's agents**, a **workspace**, an **organization**,
- a **class**: every tool carrying a consequence tag (`moves_money`, `destroys_data`, `alters_production`, or a customer tag), every `irreversible` tool, every tool with `egress: third_party`, across the organization, in one action.

Automatic triggers issue the same denies: repeated `unknown_tool` attempts, taint on a call carrying a consequence tag, a mandate exception, a credential probe, a chain break. Every switch flip is a security event with who, why, and what it stopped. Every flip shows up on the affected runs as `policy.decision` frames.

### 6.12 Policy: deterministic, versioned, tested

Tool policy is written in **Cedar**, an open policy language (the decision the wrapper design already reserved). Simulation of a draft version against the workspace's real history was cut by the scope review; a version ships with its tests, and activation is a governed action with approval. It is compiled from three inputs: role grants and resource scopes (§6.3), mandates (§6.9), and workspace rules authored on the Tools page or as records in the main repo. Policy is:

- **Deterministic.** Same call, same policy version, same answer. No model in the decision path, ever.
- **Versioned and signed.** Every decision cites the policy version. Every bundle carries it. A policy change is a governed action with approval and, in regulated mode, a Context PR.
- **Testable.** Policies ship with test cases (this call must be denied, this one must require approval) that run on every change.

Policy can use these conditions. All come from the call and the record, none from prose: tool version and its safety classification (risk, side effect, egress, consequence tags, measures, data classes), argument values by path (amount, counterparty, repository, path prefix, recipient domain), taint and its sources, time window, rate and sequence (a payment requires a prior quote call in the same run, and a delete requires a prior read of the same object), operator role, enforcement tier, and budget and mandate position.

## 7. The gateway and intervention

### 7.1 The three seams

> **Status of this section (2026-09-18).** §7 describes the approved target (ADR-094 "tachod grows into the gateway: a loopback model proxy and an MCP aggregator"; ADR-095 "The tier ladder is four words, computed from what was routed"; ADR-096 "Oxagen may contain the process that runs turns: the contained tier"). Earlier revisions of this section described the model proxy, base URL enrollment, run tokens and proxy budgets as present. None of them exists on oxagen `main` at `02278c913`. The hook adapter and the control channel are built. The tool gateway is built on the server and is registered only into Claude Desktop. The loopback model proxy and the MCP aggregator are Phase 4, which is in build now on branch `gateway-model-proxy` (oxagen issue #3299) and is not on `main`. The contained tier is Phase 5 (§17.2). Each table below says what is built on `main`.

**The gateway is `tachod`, grown.** `tachod` is the daemon that enrollment installs on the machine where the agent runs. It already exists, already listens on loopback (the machine's own network address, reachable only from that machine), and already receives the harness's hook events and telemetry. The gateway is that daemon with four parts:

| Part | What it does | Built today |
|---|---|---|
| **Hook adapter** | Answers the harness's lifecycle hooks. Five events run as command hooks (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PermissionRequest`, `Stop`, listed in `COMMAND_HOOK_EVENTS` in `packages/tacho/src/host/settings-writer.ts`). Four of them can refuse, and `Stop` is the fifth. The adapter delivers steering as additional context, refuses at the four blocking events, and records the rest | Yes (`packages/tacho/src/collector/hook-handler.ts`) |
| **Loopback model proxy** | Passes Anthropic Messages and OpenAI Responses requests through to the vendor, with streaming. Enrollment writes the harness's base URL setting to point at it | Not on `main`, where there is no source hit for `ANTHROPIC_BASE_URL`, `OPENAI_BASE_URL` or `/v1/messages` outside docs. Phase 4, in build on `gateway-model-proxy` (#3299) |
| **MCP aggregator** | Re-serves the harness's existing MCP servers through loopback, so every tool call to them passes Oxagen. Enrollment displaces the harness's MCP entries and restores them on unenroll | Partly. `packages/tacho/src/collector/mcp-gateway.ts` is real and the server enforces it, but it is registered only into Claude Desktop (`packages/tacho/src/host/claude-desktop-writer.ts`). A wrapped Claude Code or Codex still talks to every other MCP server directly. The aggregator is Phase 4 |
| **Control channel** | Carries the signed policy bundle down and commands (pause, resume, steer, cancel) down, and events up | Yes |

Running the proxy on loopback inside `tachod`, and not as a service in Oxagen's cloud, is the design choice that makes the rest cheap:

- No extra network hop, and no new availability dependency on Oxagen's cloud.
- **Prompt bodies never leave the machine.** Only digests and usage go up. Oxagen does not take custody of a customer's source code in transit.
- **The vendor credential stays on the machine.** The proxy forwards the harness's own credential. Oxagen never holds it.
- Metering becomes **observed** instead of self-reported, for every harness, including Codex and Stella.
- Per-turn steering injection, an enforced `session_limit_usd` and a real `interrupt` become possible (§7.3, §12.5).

Both OpenAI and Anthropic work through a base URL proxy, subscription logins included, and neither vendor's terms explicitly forbid it: validated by the maintainer on 2026-09-18 (ADR-094). The review listed this as its one unverified risk. It is closed, and it does not gate Phase 4.

The seams, and the tier each one earns:

| Seam | What passes through | What Oxagen can do | Tier it earns |
|---|---|---|---|
| **Model proxy** (loopback, in `tachod`) | Every model request and response, streamed | Inject the volatile steering selection, meter the call from the bytes it saw, enforce budgets, halt the run by returning a stop | `gateway` |
| **MCP aggregator** and the tool gateway | Every MCP tool call and result | Check both directions, allow or deny or send for approval, narrow the input, record | `gateway` |
| **Hook adapter** (the wrapper). A hook is a script the harness runs at set points in its lifecycle. | Harness lifecycle events: session start, prompt submit, pre-tool, permission request, stop, compaction, config change | Deliver steering as additional context, refuse at the four blocking events (`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PermissionRequest`), record, detect tampering after the fact. `Stop` is the fifth command hook and refuses nothing | `harness` |
| None of the above | Attested events only | Record and grade | `observe` |

**The tier ladder is four words, computed from what was actually routed: observe → harness → gateway → contained.** The table is ADR-095's, word for word in its first four columns.

| Word | What it means | What it may claim | What it may not claim | On `main` today |
|---|---|---|---|---|
| `observe` | Recorded only | "recorded" | Anything about refusal or delivery | Yes |
| `harness` | Hooks installed; steering is delivered and the four blocking hook events can refuse, client-attested and fail-open | "delivered", "recorded", "client-attested", "fail-open" | "enforced". Never | Yes. This is the tier of every wrapped Claude Code, Codex and Stella run |
| `gateway` | Model and MCP traffic routed through `tachod`; metering observed, budgets enforced | "observed" metering, "enforced" budgets on routed traffic | "enforced" against the machine's operator; anything about traffic that was not routed | Only for a Claude Desktop host's Oxagen MCP calls (below). For a wrapped harness it arrives with Phase 4, in build |
| `contained` | The agent runs under an OS sandbox whose only egress is the gateway | "enforced". This is the only tier that earns the word against the machine's operator | Anything about a run that was not launched by the launcher | No. Phase 5 (§7.2) |

A control claim always carries its scope: "for actions routed through Oxagen".

**Computed, not assigned.** A run's tier is derived from the traffic the record shows: hook events give `harness`; model and MCP requests seen by the gateway for that run give `gateway`; a launcher attestation plus gateway-only egress gives `contained`. What was installed on the host is not evidence of what a run did. The tier is recorded on the run and shown word for word. The UI, exports, and attestation reports cannot show a stronger word than the tier allows. This is the rule from ADR-040 and the wrapper spec, and it must not change. Today the tier is assigned from the harness name (`packages/tacho/src/wire.ts` maps `"claude-desktop"` to `gateway`). Phase 4 makes it computed from routing.

**"Fail-open" describes the tier, not the hook process.** The two senses look like they disagree, so this specification says which one it means every time. The hook process fails closed against its cached bundle: in enforce mode a stale or unverified bundle denies non-read-only tools (`packages/tacho/src/host/bundle.ts`, `hook-handler.ts`). The tier as a whole is fail-open against the person at the keyboard: remove the hook entry, disable hooks or run another build of the harness, and the action proceeds. Where a table says "fail-open" beside the `harness` tier, it means the second sense.

**How today's three words and the connected tier read on the ladder (ADR-095, which amends ADR-078 §1).** The code's tier enum is three words today: `ENFORCEMENT_TIERS` in `packages/tacho/src/envelope.ts:63` is `["gateway", "harness", "observe"]`, and `TACHO_ENFORCEMENT_TIERS` (`packages/database/src/schema/tacho.ts:74`) mirrors it. ADR-078 gave the three values product words: wrapped is `harness`, connected is `gateway`, and `observe` is what a wrapped host reports in observe-only mode. All three keep their value and their meaning. ADR-095 changes two sentences of ADR-078 §1:

- "No fourth value is minted" no longer holds. `contained` is the fourth. `ENFORCEMENT_TIERS` gains it in Phase 5 as a wire-compatible addition, and the column on the run row and the ClickHouse column take the new value without a rename.
- `gateway` is no longer only the connected tier. It is any run whose model or MCP traffic was routed through `tachod`. Today's meaning of the word, a Claude Desktop host connected through the MCP gateway, is the first case of it: that host is on `gateway` for the calls that routed, which are its Oxagen MCP calls and no model traffic, and it is invisible otherwise, exactly as ADR-078 §5 says. From Phase 4 a wrapped Claude Code, Codex or Stella run whose traffic routed through `tachod` earns the same word.

ADR-078 §2 is kept: breadth and certainty are different things. For a wrapped harness the ladder is cumulative, since each rung adds a seam to the ones below. For a connected app it is not: `gateway` there has no `harness` rung under it. So a tier word is never rendered as a score, a percentage or "fully governed", and every surface still states what the tier records and what it does not. ADR-078 §3 to §6 stand unchanged: the routed-around property, the proxy is not a second materialiser, the ledger table, both tiers on one machine.

**Today.** The wrapped tier is a recorder plus a kill switch. The signed bundle carries empty permissions, `budget.mode = "observed"` and `context.system = null` (`packages/handlers/src/lib/tacho-host.ts:269-276`), so `PreToolUse` can deny only on host status or a paused run. A person can step outside the wrapper by deleting the hook entry, setting `disableAllHooks`, killing the daemon, going offline, adding another MCP server, or running the harness somewhere else. Detection is after the fact. With the daemon down, every command hook but `PreToolUse` answers `{}`, which the harness reads as allow, and `PreToolUse` decides from the cached bundle and fails closed on a stale one (`packages/tacho/src/claude-code/hook-client.ts`). Until Phase 4 and Phase 5 land, a surface shows `gateway` for a wrapped harness and `contained` as tiers not yet available, and claims no model proxy, observed metering, enforced budget, real interrupt or sandbox as present (ADR-095).

### 7.2 Adapters and supported agents

Oxagen is vendor-neutral on the agent side as well as the model side. The target proxy speaks the **Anthropic Messages API** and the **OpenAI Responses API**, as a passthrough with streaming, so a harness that reads a base URL setting can be routed through it. That holds for subscription logins as well as API keys: validated by the maintainer on 2026-09-18 (§7.1). The tool side is plain MCP, which every current harness speaks.

| Agent | How it is wrapped today | Tier today | What Phase 4 adds | Tier after Phase 4 |
|---|---|---|---|---|
| **Claude Code** | `oxagen tacho enroll` (or `oxagen agent enroll --token` on a managed fleet) writes hook entries into the harness's settings file and installs `tachod`. Token and cost numbers are the harness's own telemetry, self-reported | `harness` | Enrollment writes `ANTHROPIC_BASE_URL` to the loopback proxy and re-serves the harness's MCP servers through the aggregator | `gateway` for model calls and MCP tools, `harness` for native tools |
| **Codex CLI** (OpenAI) | The same enrollment, through Codex's command hooks (`packages/tacho/src/host/codex-writer.ts`). Codex exports no spend, so its spend is absent from the record today | `harness` | Enrollment writes `OPENAI_BASE_URL` to the loopback proxy and re-serves MCP servers. Spend becomes observed | `gateway` for model calls and MCP tools, `harness` or `observe` for native tools by harness version |
| **Stella** | Wrapped through its hooks until it speaks the control contract natively (ADR-080). It exports no spend today | `harness` | Its model calls route through the same loopback proxy | `gateway` |
| **Claude Desktop** | The Oxagen MCP gateway is registered into its config. Tools it reaches through that gateway are checked on the server. No model traffic is routed | `gateway` for those tools only (ADR-078) | Nothing planned | unchanged |
| **SDK agents** (OpenAI Agents SDK, Claude Agent SDK, custom) | Not built. `oxagen.agent.wrap(agent)` is a target of this specification and is outside the six phases of §17.2 | none | The same loopback proxy and aggregator serve them once a wrapper exists | as routed |
| **Other CLIs** (Gemini CLI and similar) | Observe-only ingestion of their telemetry where they export any | `observe` | Base URL and MCP settings where the harness has them | as routed |

Every adapter records the harness name and version on the run. The tier is computed from what was actually routed, never from what the adapter could do on paper.

**Wrapping is file edits plus a daemon. It is not a supervisor.** Enrollment writes hook entries into the harness's settings file, installs `tachod`, registers it to start at login, and enrolls the host with a device key. No Oxagen command launches the agent. Earlier revisions of this specification call the daemon `oxagend` and the hook binary `oxagen-hook` (§2.1). That rename has not happened in the tree, and this section uses the names in the tree. From Phase 4, enrollment also writes the model base URL into each harness (Claude Code and Codex) with displace-and-restore, and only after the daemon is confirmed listening on loopback. It re-serves the harness's MCP servers through loopback with the displace-and-restore logic `packages/tacho/src/host/mcp-config-writer.ts` already has. Where a vendor offers managed settings, the managed variant pins them. Unenroll and uninstall restore every file they touched before they stop the daemon, so no harness is left pointing at a dead base URL (ADR-094). The installer that carries this to a laptop is Oxagen Desktop (the desktop spec §14, oxagen issue #3301, branch `desktop-install-hardening`).

**The contained tier: `oxagen run -- <agent>`.** Phase 5 adds one command. `oxagen run -- <agent>` is a supervisor that launches the agent under an OS sandbox whose only allowed egress is the gateway. It is the top tier, not the only tier, and hooks stay:

- It is aimed at CI, headless runs, cloud runners and managed devices first. Those are the places where the operator of the machine is not its owner, where unattended risk lives, and where "enforced" means something.
- It is never mandatory on a developer's own laptop. Nothing is enforceable against the owner of a machine, and a mandatory sandbox there breaks toolchains, SSH keys, Docker and local services.
- The witness runner (§8.5, ADR-064) is built on the same launcher.
- The `--` separates the supervisor's own flags from the agent's command line. It is distinct from the read verbs `oxagen run list|show|export` (§14.1).

ADR-043 is revised by one sentence to allow it: **"Oxagen does not run turns, but it may contain the process that does. A launcher that confines a process is not an agent runtime."** No sandbox exists today. ADR-043 removed the last one, and the witness runner is not built.

### 7.3 Steering into the loop

> **Status of this section (2026-09-18).** The five injection points and the delivery modes are the approved design. On oxagen `main` at `02278c913`, operator steer commands are the only live text channel from the server to a running wrapped agent. The bundle's `context.system` is hardcoded `null`, `UserPromptSubmit` carries no steering, and no proxy exists. Phase 0 fills `context.system`, and it is in review as oxagen PR #3289 (ADR-091). Phase 1 adds the per-prompt selection. Phase 4 adds the model request, and it is in build: the proxy ships the seam, and the volatile selection rides it once the Phase 1 assembler exists (§17.2).

**Oxagen does not own the context window. The harness does.** For Claude Code and Codex, the harness composes the prompt. Oxagen controls exactly five injection points, and "competition for the window" means competition for Oxagen's slice of it. That slice is what `assembleSteering` fills (§10.5).

| # | Injection point | What it can carry | Today |
|---|---|---|---|
| 1 | **`SessionStart` additional context**, capped at 16 KiB (`packages/tacho/src/wire.ts:375`) | The stable prefix: `must` and `should` items, compiled into the signed bundle's `context.system`. It is cached in the bundle, so it works offline. Its digest is recorded on the run as `oxagen.context_digest` | The path is built (`packages/tacho/src/collector/hook-handler.ts:322`) and the server always sends `null` (`packages/handlers/src/lib/tacho-host.ts:276`). Nothing is delivered on `main`. Phase 0, in review as PR #3289 (ADR-091) |
| 2 | **`UserPromptSubmit` additional context** | The volatile selection: `may` and `info` items picked for this prompt under a token budget. This hook receives the operator's prompt, so it can retrieve by relevance | Carries operator steer messages only (`hook-handler.ts:383`). Unused for steering. Phase 1 |
| 3 | **MCP tool results** | Context frames and records an agent asks for through Oxagen's MCP tools | Live, and only when the model chooses to call the tool. Nothing is pushed |
| 4 | **Files in the checkout**, including skills | Published records under `.oxagen/rules/` and skills materialized by sync (§10.6). The harness loads them by its own rules | Published records are in the checkout once their pull request merges, and only a harness that reads that path sees them (Stella does). Skills sync is Phase 2 |
| 5 | **The model request itself** | The volatile selection re-landed per turn, right after the cached system block (ADR-051) | Not available on `main`. It exists only once the gateway's proxy exists. Phase 4, in build, ships the seam for it. The selection that rides it arrives with the Phase 1 assembler (ADR-094) |

All five are recorded. Whatever the assembler rendered and whatever it cut is a `steering.manifest` frame on the run (§10.5).

**Operator steer.** A `steer` command carries text delivered at a named boundary as additional context. It is attributed to the operator and recorded as a `control.steer` frame. This channel is built and live for wrapped agents: commands are drained at the next hook boundary (`hook-handler.ts:216`).

Steering is prompt content, so it reaches the model only when the harness next builds a model request. At the `harness` tier Oxagen hands the text to the harness at a hook boundary and the harness places it. At the `gateway` tier the proxy places it in the `model.request` itself. A delivery mode therefore does not choose *where* the steer lands. It chooses *which* boundary the steer rides, and whether Oxagen cuts the current step short to reach one sooner.

| Delivery mode | The event it hangs off, exactly | What it costs | Use it for |
|---|---|---|---|
| `next_step` (**default**) | The current step runs to its terminal frame. For a model call that is a `model.response`. For a tool call it is a `tool_call` result frame. The steer is delivered at the **first boundary after that frame**: the next hook event at the `harness` tier, the first `model.request` at the `gateway` tier. | Nothing. No work is discarded. | Almost everything. Redirecting a plan, adding a constraint, correcting a wrong assumption. |
| `interrupt` | Oxagen does not wait for the current step. At the model proxy an in-flight streaming response is **stopped**. The proxy returns a stop, and the partial output is recorded and **billed**, because the tokens were generated. At the aggregator a pending call is **abandoned** and denied with reason `interrupted`. The run is then forced to a model request carrying the steer. **This needs the proxy, so it becomes real in Phase 4.** | The partial model output, and the work of any abandoned tool call. | Harm in progress. The agent is about to do the wrong thing and the next step is too late. |
| `turn_boundary` | The steer waits for `turn_end` and enters at the **first boundary of the next turn**. | Nothing, but it may wait a long time. | Steering that should not land mid-plan: a change of priority, a new standing constraint. |

**An irreversible tool call in flight is never abandoned.** Nobody can un-publish a package or un-send a payment. So an `interrupt` that arrives while a tool call of side-effect class `irreversible` is executing **degrades to `next_step`**. The call completes, and the frame records `degraded_reason: irreversible_tool_in_flight`. The interface shows the degraded mode, never the requested one.

**Interrupt is not pause.** `pause` stops the run at the next boundary and waits for a human. `interrupt` cuts the current step short and at once hands the agent new context, so it keeps working in a different direction. An operator who wants the agent to stop and think uses `pause`. An operator who wants the agent to change course without losing the run uses `steer` with `interrupt`.

**What each tier can carry out.** At the `gateway` and `contained` tiers all three modes can be carried out, because the proxy is in the path of every request. At the `harness` tier there is no way to stop an in-flight call, so `interrupt` degrades to `next_step` and the command records both the requested mode and the delivered one. That is what every wrapped run does today. At the `observe` tier no steering is possible at all. The command is refused, not queued. The rule in §7.1 applies: the interface shows the mode that was actually achieved.

Steering text is always evidence, quoted and cited. Oxagen itself never executes it as instructions. Whether a harness treats it as instruction is the harness's contract.

### 7.4 Halting and commands

> **Status of this section (2026-09-18).** Commands, their statuses and the hook adapter column are built, and they are what every wrapped run uses today: delivered at the next hook boundary and client-attested, on a tier that is fail-open against the person at the keyboard (§7.1). The model proxy column, run token revocation and automatic halts on a budget breach describe the `gateway` tier and arrive in Phase 4 (§17.2). In the tables below, "tool gateway" reads as the MCP aggregator for a wrapped harness.

Commands are rows in `control.commands`. They travel on the control channel, either by long-poll (a request that stays open until a command is ready) or in the next ingest response. For proxied connection points they are applied inline. **The status vocabulary is closed and shared by commands and messages**, so one delivery report reads the same whatever was sent:

| Status | Meaning | Terminal |
|---|---|---|
| `draft` | Composed in an interface, not yet sent. Never leaves Oxagen and never reaches a run. | no |
| `queued` | Accepted by Oxagen and waiting for a delivery boundary (§7.3). | no |
| `sent` | Pushed onto the control channel or injected into an outbound request. Oxagen has done its part. | no |
| `received` | The wrapper or the proxy took it. The connection point has it. | no |
| `acknowledged` | The harness confirmed it entered the loop. | no |
| `applied` | The effect is visible in the record: the `model.request` carrying the steer was made, or the pause took hold. This is the only success status. | **yes** |
| `cancelled` | Withdrawn by the operator, or superseded by a later command on the same run, before delivery. | **yes** |
| `expired` | The expiry passed with no boundary reached. Nobody withdrew it. Time ran out. | **yes** |
| `failed` | The connection point refused it, or the host was gone. | **yes** |

`applied` and `expired` earn their places against the shorter set. `applied` is the difference between *the harness has it* and *the model saw it*. That is the question §7.6 promises is always answerable. `expired` is the difference between *the operator changed their mind* and *the run never reached a boundary*. That is the difference between an operator's mistake and a fleet problem. Interfaces group `cancelled`, `expired` and `failed` as **undelivered** where a three-way split is all the reader needs.

| Command | Model proxy | Tool gateway | Hook adapter | Guarantee |
|---|---|---|---|---|
| `pause` | next request returns a paused response | next call denied with reason | next prompt and pre-tool denied | at the next boundary |
| `resume` | clears | clears | clears | immediate |
| `steer` (`next_step`, default) | injected into the first request after the current step's terminal frame | n/a | injected at the next prompt submit | after the current step, before the next model call |
| `steer` (`interrupt`) | in-flight response stopped and billed. Steer injected at once | pending call abandoned, denied with reason `interrupted` | degrades to `next_step`. Frame records the degradation | immediate, except behind an irreversible tool call |
| `steer` (`turn_boundary`) | injected on the first request of the next turn | n/a | injected at the next turn's prompt | at `turn_end` |
| `cancel` | every request refused. Run token revoked | every call refused | denied. The collector sends SIGTERM (the standard shutdown signal to a process) where it owns the process | soft cancel guaranteed. Process kill best effort and recorded |
| `revoke` (agent or host) | credential dead. All run tokens dead | same | host suspended in bundle. Denies even if the daemon is down | guaranteed while any connection point is in the path. Visible as `hooks_removed` if hooks were stripped |
| `deny_generation bump` (raises the deny generation, a counter that marks cached policy bundles as stale) | bundle stale. Non-read-only actions re-checked before they run, and fail closed | same | same | guaranteed for non-read-only tools |

Automatic halts are the same commands issued by policy. A budget breach, a schema violation on an irreversible tool, an egress-class violation, a chain break, or a detector hit (a secret in a tool argument, a forbidden path) each produce a `policy.decision` frame. Then, per workspace policy, each produces a `pause` or `cancel`.

**Ledger-ingested runs (2026-09-15, maintainer decision).** A run that reaches Oxagen only through the ledger ingest contract (`ingest_frames`, Appendix E) has no proxy or wrapper in its path to refuse its next call. The ingest contract is built now with a revocable run token: the token is minted at run start (§6.2) and every ingest call carries it. `cancel` and a halt (`revoke`) revoke the token, and the next ingest call under it is refused. Halt and Cancel on Fleet and Run work on ledger-ingested runs as they do on wrapped runs.

### 7.5 Human approval

> **Status of this section (2026-09-18).** Parking a call is built for tools that reach the server-side tool gateway and for the harness's `PermissionRequest` hook. A wrapped harness's other MCP servers bypass it until the aggregator of Phase 4 (§17.2).

`require_approval` on a grant, a tool's risk grade, a budget threshold, or a standing rule routes an action to the **approvals queue**. The gateway parks the call (default timeout ten minutes, set per bundle). It creates an `approvals.requests` row with the canonical action, input digest, requesting span, and trust tier. It then notifies (Mission Control, Slack, email). A resolution mints a single-use **approval token** bound to the agent, run, exact action, expiry, and the approval event. The token is a Biscuit v2 token, a signed token format that can be checked without calling back to Oxagen, as decided in the wrapper design. The adapter verifies it offline and the gateway verifies it inline. Approve, deny, and expiry are all frames. The approver's reason reaches the model as the permission decision reason.

**The run on an approval (2026-09-15, maintainer decision).** In the current repository the request row is `agent.approval_requests`. It gains a nullable `run_id`, set from `ctx.agentRun` when the request is created. `list_approvals` filters on it, and the approvals strip on the Run page reads it. A request raised outside a run has no `run_id` and appears on the Fleet panel only.

### 7.6 Messages between agents, and mass steering

Operators and agents can send messages to other agents in the same workspace. The mechanism is the operator `steer` command made general. A message is queued for a run and injected right after the steering block on the recipient's next model call. What differs is who may send, to whom, and with what authority.

- **Addressing.** `@<agent-slug>` (every active run of that agent), `@agents` (every active run in the workspace), or a run id (exactly one run). **The broadcast address is `@agents`, not `@all`.** `@all` reads as *everyone, including the humans*. This mechanism never reaches a person. It reaches the runs that are live enough to receive prompt content. A sealed run never receives a message. A run at `observe` tier never receives one, because there is no connection point to inject through. Both are recorded as undelivered with that reason. `@agents` is a grant, not a default. Operators hold it by role at **workspace** scope, so holding it in one workspace confers nothing in another. An agent holds it only if a workspace policy says so.
- **Delivery, defined precisely.** A message carries a delivery mode from §7.3. It reaches `applied` when the `model.request` that carries it is made. Otherwise it reaches a terminal undelivered status (`cancelled`, `expired`, `failed`). Every status change is a frame on the sender's run and on the recipient's run. The applied frame names the `seq` of the model request it was injected into. So "did the agent see it" is always answerable by pointing at a frame rather than by asserting it.
- **A broadcast declares a ceiling, and each connection point picks the landing.** The sender cannot know the shape of every recipient's run. One is in the middle of a tool call, one is between turns, and one is at `harness` tier and cannot be interrupted at all. So the mode on a broadcast is a **maximum urgency**, not an instruction. Each recipient's connection point resolves the strongest boundary it can actually carry out at or below that ceiling. The per-recipient frame records both the requested mode and the resolved one. A delivery report therefore reads as a list of runs. For each run it shows the mode that was achieved and the frame that proves it.
- **Authority.** An operator's message enters at the steering position with operator authority. An agent's message enters as quoted evidence with the sender named, never as an instruction. Any tool call whose arguments derive from it is taint-marked, that is, flagged as built from untrusted input (§6.7). A compromised or confused agent cannot steer the fleet into a harmful call.
- **Bounds.** A per-run inbound budget (messages and tokens), duplicate suppression by message digest, a rate limit per sender, expiry on every message, and an operator mute per agent. Every send is a governed action on the toolbelt (`send_message`, `list_messages`). The delivery queue is the commands table with command kind `message`.

### 7.7 Outbound events (Series A)

Customers subscribe to what happens in their runs and receive it in their own systems. Nothing is invented for this. Every event maps to a frame kind or an audit event.

- **Catalog.** `run.started`, `run.sealed`, `run.proven`, `approval.requested`, `approval.resolved`, `tool_call.denied`, `kill_switch.flipped`, `mandate.exception`, `budget.breached`, `incident.raised`, `context_pr.opened`, `context_pr.merged`, `repository.indexed`, `dod.settled`. New kinds are added to the catalog, never emitted ad hoc.
- **Subscriptions** at workspace or organization scope name the event kinds and optional filters (agent, operator, severity). Only those events are emitted. Everything else never leaves.
- **Two delivery modes on one unique endpoint per subscription**, generated at creation. Push: Oxagen sends a signed webhook, an HTTP request to the customer's URL when an event happens. It is signed with HMAC, a keyed hash that proves who sent it, using a rotating secret. It carries a delivery id for safe retries, is ordered per run, and is delivered at least once with backoff. A dead-letter view, the list of deliveries that failed after all retries, sits on the Audit page. Pull: the customer reads from an Oxagen-hosted streaming endpoint unique to the subscription, with a replay window.
- **Payloads** carry ids, kind, time, scope, and a compact body with a link to the run and frame. Never raw prompt or tool bodies. Redaction rules apply.
- **Governed.** Creating or changing a subscription is a governed action with the third-party egress class (`set_event_subscription`, `list_event_subscriptions`). Every delivery is audited.

---

## 8. Runs and frames

### 8.1 Run

A run starts when a wrapped agent opens a session. It also starts when a proxied first call arrives with a fresh run token (a target: no proxy and no run token exist at 2026-09-18, so today every wrapped run starts at the harness's `SessionStart` hook). The run carries a trusted identity that only server code builds (the `RunSpecV2` pattern). That identity holds the operator (`initiating_principal`), the agent principal, the agent version digest (a digest is a hash that names exact content), the authorization snapshot id, the repository and base commit, the retention policy version, the enforcement tier (computed at seal, the signed close of a run), the governance mode, and an optional **task reference**. A task reference is a Linear issue, a GitHub issue or PR, or a free-text goal. It lets spend be reported by what the work was for. Attempts are immutable. A resume or fork creates a new attempt linked to the prior one. Turns and steps are not rows of their own. They are derived from frames and materialized in the rollups (§12.7). `turn_start`/`turn_end` bound a turn. A model request/response pair or a tool requested/result pair is a step.

### 8.2 Frame

A frame is the `oxagen.frame/1.0` envelope, kept as is. Its fields are `event_id` (a ULID, a time-sortable unique id), agent, run, attempt, dense `seq` from 0, `ts` (protocol timestamp profile), `kind`, `fidelity`, `span`, `body`, `content { digest, bytes_ref?, redactions[] }`, `prev_hash`, and `hash`. Kinds are the wrapper vocabulary (`agent_start`, `turn_start`, `tool_requested`, `tool_call`, `llm_call`, `policy_decision`, `approval_request`, `approval_decision`, `token_issued`, `token_use`, `token_denied`, `file_io`, `network`, `command`, `subagent_start`, `subagent_stop`, `agent_stop`, `error`, `telemetry_gap`, `checkpoint`, and the `oxagen:` lifecycle kinds) plus the gateway kinds this spec adds:

| Kind | Emitted by | Body |
|---|---|---|
| `model.request` | model proxy (Phase 4 of §17.2; until then a model call is known only from the harness's own telemetry, client-attested) | provider, model, full request (messages, tools, params), injected steering digests, `injected_steer_ids[]` naming the `control.steer` frames this request carried, context frame ids and usage report, provider request id |
| `model.response` | model proxy | full response, stop reason, usage by token class, latency, **cost record** (§12) |
| `steering.manifest` | the assembler (§10.5) | injection point, bundle and steering versions, prompt digest, budget and spend, the items rendered and the items cut with a reason each, source status, prefix and volatile digests, `fail_open`. Ids, hashes and digests only, never bodies |
| `context.assembled` | model proxy or Stella | budget, context frame ids by `(provider_id, frame_id, content_digest)`, usage report, composition digest |
| `record.appended` | exchange provider | record id, lineage id, record hash, kind |
| `control.command` | control channel | command, issuer, status (§7.4), the boundary it was applied at |
| `control.steer` | control channel | steer text digest, issuer, `requested_mode` and `delivery_mode` (§7.3), `interrupted` (bool) with `interrupted_step {kind, seq}` when true, `degraded_reason` when the requested mode could not be honoured, `delivered_at_seq` (the `model.request` that carried it), status |
| `proof.observed` | witness runner (§8.5), the isolated service that runs witnesses, or Stella's local ladder when the run came through Stella | witness id, oracle kind (the type of check the witness makes), target and PR refs and shas, normalized command digest, verdict, fail fingerprint (a hash of the failure output), tamper exclusion (a check that the witness was not altered), disclosure grain (how much detail the worker is told), runner attestation (the runner's signed statement of what it ran) |

**Bodies are content-addressed blobs**, stored and found by the hash of their bytes. `content.digest` is SHA-256 over the exact bytes. `bytes_ref` points to the encrypted object. The frame row holds everything except the bytes. Redaction runs before the bytes are written. It is recorded per frame with the digest of what was removed. A redacted body can therefore still be verified against its digest.

### 8.3 Chain, checkpoints, attestation

- `hash = SHA256(prev_hash ‖ canonical(envelope without hash))`. This forms a hash chain, where each frame's hash locks in the frame before it. `seq` is dense, with no gaps. A gap is a `telemetry_gap` frame, never a repaired sequence. The same `seq` with a different hash is refused and reported as a security incident. It is never overwritten.
- **Checkpoints**, signed markers that fix the chain so far, are taken every N frames or T seconds. The producer's key signs them (host device key or agent credential fingerprint). Oxagen countersigns them on ingest.
- **Seal** at run end, for every terminal outcome. The seal computes an RFC 6962 Merkle root, one hash that commits to every frame hash. It writes the archive segment (§13). It then produces the **run attestation**: an Ed25519 signature (a public-key signature) by the organization's attester key over `(run_id, attempt_id, frame_count, merkle_root, archive_segment_digest, enforcement_tier, completeness_gaps)`. Keys live in KMS, a managed key storage service. Key ids and validity windows are published per organization, so a customer can verify an export offline.
- **Tamper-evidence, stated precisely.** Gateway-observed frames are Oxagen-attested. Client-attested frames (hooks, SDK emitters, drains) are producer-signed and Oxagen-countersigned at ingest. For those, Oxagen attests receipt and chain integrity, not the truth of the content. Every export and every UI badge says which.

### 8.4 Replay

Every run carries a **replay grade**: the strongest thing a person can do with the recording. It is computed from completeness gaps. The vocabulary is closed and ordered, weakest first. Each word is the verb on the control it unlocks:

| Grade | What you can do | What it needs | Available on |
|---|---|---|---|
| `inspect` | Read the chain: every frame, its kind, its digests, its cost, its policy decision, its timing. A reader can see that the agent called a tool and what it cost, but not what it said. | Frames only. Always true of any run Oxagen recorded. | a `digest_only` workspace, an `observe`-tier run, or any run with gaps in its bodies |
| `view` | Step through the run and read it: what the agent was told (system context, steering, context frames with citations), what it asked, what the model returned, what tool it called with what input, what came back, which policy decided what, and what it had cost by that point. | Frames plus blob bodies. | any run whose bodies were retained |
| `fork` | Re-run from frame N with the recorded context and steering. Tool results are served from the recording as a cassette (a fixed tape of recorded answers), and a new model call is made. This is how to ask "would a different rule have changed this?" and how a failure becomes a test case. | `view`, plus tool result bodies. | any `gateway`-tier run with bodies |
| `retry` | Run the task again from the start on a deterministic ladder. Oxagen records the second run and offers **bisect** between any two runs of the same task. | `fork`, plus a harness that can reproduce a run. | Stella |

The grade names the strongest verb, and every weaker verb comes with it. A `fork` run can also be viewed and inspected. The interface renders the recorded grade and never a stronger word, per the rule in §7.1 that a grade is reported as it is.

`retry` here is a replay grade. It has nothing to do with the provider retries counted on a model call in §12.6. The interface labels those *provider retries* wherever both could be read at once.

**The transport: playing a run back.** Both `view` and `fork` present the run as a transcript with a transport above it. The transport can scrub, step, play, and play at ×1, ×1.5, ×2 and ×4. Four things make that work, and three of them are already in the record:

- **Position** is the frame's dense `seq`. **Elapsed** is its `ts` against the run's first frame. Both exist on every frame, so seeking is a read at a `seq` and needs nothing new.
- **Playback speed** divides the real interval between frames, derived from consecutive `ts`. But **real runs are mostly waiting**. A forty-second tool call is forty seconds of nothing, so literal wall-clock playback is unwatchable. Playback therefore **compresses idle**. Any gap longer than the compression threshold (default two seconds, per workspace) collapses to the threshold. The transport shows true elapsed time beside the position, so compression is never mistaken for speed. A run's real duration is always readable. Only the waiting is skipped.
- **Cumulative cost at a position** is a prefix sum over the cost records on the frames up to that `seq`. The player computes it on load. It is not stored. `cost.run_totals` is the whole-run figure and stays that way. A stored per-frame running total would be a second copy of a number the frames already carry.
- **There is no stop.** The transport moves the *viewer*. The run controls move the *run*. A stop button would sit one pixel from `cancel` and mean something entirely different. So the transport carries play, pause, step, scrub and speed, and nothing that can touch the run. On a live run the transport's play state is *following the head*. Scrubbing backwards detaches from the head, and the interface says so. The run keeps going either way.

### 8.5 Proof: witnesses, oracles, and the flip

A run is **proven** when a **witness** (a check written by Oxagen, not by the worker) **fails on the target branch and passes on the pull request**. The witness runs in an environment the worker never sees. The worker learns nothing from it but the word pass or fail. Those flips stamp the run. Stamped runs are the labeled data that owned intelligence is trained on. The mechanism is Stella's witness protocol (the flip oracle, tamper exclusion, the deterministic-first ladder, the feedback airlock). Oxagen hosts it so it applies to every wrapped agent. Three requirements apply in every case.

**The three invariants**

1. **The flip is measured against the PR's target.** The witness runs twice in the same environment. First it runs on the merge-base of the PR against its target branch (the production branch from §11.4, or whatever branch the PR targets). There it must **fail**. Then it runs on the PR head. There it must **pass**. A witness that passes on both proves nothing about the change and is recorded as `unmoved`. One that fails on both is `unsatisfied`. Only `Failing` on the target followed by `Flipped` on the PR head, for the same normalized command, credits a proof.
2. **The worker never sees the witness or its environment.** Witnesses are authored, stored, and executed in a **witness runner**. That runner is an isolated execution plane with its own credentials, no network path from the worker's run, and no filesystem the worker can reach. The witness artifact is not in the repository, not in the PR, not in any context frame, and not reachable through any tool on the tool gateway. A tool call whose target resolves to witness storage is denied by policy and raises a `witness_probe` incident on the run. The witness runner does not accept the worker's run token.
3. **Only pass or fail comes back.** The witness runner reports to the worker at disclosure grain `L0`. That means verification passed, or it failed, and nothing else. No test name, no assertion, no expected or actual values, no reproduction, no path. A workspace may raise the grain as an explicit policy decision by a human, recorded as a security event. `L1` names the criterion, `L2` describes a symptom, and `L3` hands over a regenerated reproduction. The default is `L0`. Any brief at any grain passes the scrubber. The scrubber degrades a brief one grain rather than emit one containing a test identifier, a literal value, or a witness path. Every brief is recorded beside the sealed material it was redacted from, so disclosure is auditable.

**Oracle kinds.** A witness is an oracle plus a normalized command. Oxagen supports several kinds, ordered by how conclusive a red result is. The ladder is deterministic first, and a deterministic red is terminal on its own:

| Oracle | What it asserts | Typical source |
|---|---|---|
| **Test flip** | a test the witness adds or targets fails on the target, passes on the PR | the task's acceptance criteria, the issue, the PR description |
| **Build or type** | the target fails to compile or typecheck against a new interface the PR must provide, the PR succeeds | a declared API change |
| **Property** | a property-based check over generated inputs fails on the target, passes on the PR | an invariant named in the task |
| **Golden or snapshot** | a captured output differs from the expected artifact on the target and matches on the PR | fixtures, rendered documents, API responses |
| **Contract** | an HTTP or schema contract check fails on the target, passes on the PR | an OpenAPI or JSON Schema change |
| **Metamorphic** | a relation between two runs of the program holds on the PR and not on the target | numerical, data-transform work |
| **Behavioral probe** | a scripted interaction (CLI, browser, service) reaches a state on the PR that the target cannot | user-facing features |

A model's opinion that the change looks right is not an oracle. The witness *author* is a model call (complex tier, §4.5), because it creates the oracle. The *verdict* never is.

**Authoring.** Authoring is demand-driven. A witness is written when a run declares a task with acceptance criteria (an issue, a PR, a spec), or when a workspace policy requires proof for a class of change. The author reads the task, the target-branch code graph (§11.4), and the workspace's steering. It produces a witness with its command, its oracle kind, and its expected fail mode on the target. Before the ladder runs, the witness is **proven to fail on the pristine target**. A witness that does not fail there is discarded and re-authored, and never charged to the worker. The witness's filesystem identity is fingerprinted at that moment (tamper exclusion). So a PR that edits the test infrastructure, adds a skip marker, or otherwise moves the ground under the witness is detected. It is recorded as `tampered` rather than credited.

**Anti-overfitting beyond the airlock.** A task may carry more than one witness. The worker is told only the aggregate verdict, never which one failed. A share of witnesses per workspace is held out and never reported to the worker at all, only to the record. Repeated identical failure fingerprints tighten disclosure further if a grain above `L0` was enabled. Retries against the witness are capped per run by policy. A run that exhausts them is `unsatisfied`, not retried elsewhere.

**Stamping.** Every witness run is a run of its own (agent: the witness runner service principal, operator: the worker's operator). So its cost is attributed and its frames are replayable. Its verdict lands on the worker's run as a `proof.observed` frame:

```json
{
  "kind": "proof.observed",
  "body": {
    "witness_id": "wit_…", "oracle": "test_flip",
    "target_ref": "main", "target_sha": "…", "pr_ref": "refs/pull/482/head", "pr_sha": "…",
    "command_normalized_digest": "sha256:…",
    "target_result": "fail", "pr_result": "pass", "verdict": "flipped",
    "fail_fingerprint": "sha256:…", "pass_output_digest": "sha256:…",
    "tamper_exclusion": "held", "disclosure_grain": "L0",
    "witness_run_id": "run_…", "runner_attestation": { "key_id": "…", "signature": "…" }
  }
}
```

The verdict vocabulary is closed: `flipped`, `failing`, `unmoved`, `unsatisfied`, `tampered`, `unverified` (the runner could not reach a conclusion, never resolved by a model), `waived` (nothing changed and nothing tried, per policy). Only `flipped` marks a run proven. The seal signs the proof frame with the rest of the chain. The witness runner's own attestation is embedded. So a proof can be verified offline without trusting the worker's harness at all.

**What a proven run leaves behind.** For each proven run, the seal stores the tuple a training example needs: the task and its acceptance criteria, the context frame and record ids the worker was given, the diff digest against the target, the witness verdict with its oracle kind, and the cost. That is the labeled example. It is produced as a side effect of the work, with no person reading it. Nothing else about training is built in v1. §12.8's proven spend and productive ratio read the same frame.

**Where this runs.** The witness runner is the one execution plane Oxagen operates. It is not the worker's runtime, and ADR-043 stands. It runs witnesses, not agents. It has no model access except the author call. It is ephemeral per witness run. For customers on a dedicated data plane, it runs inside their plane.

---

### 8.6 Definition of done

An agent cannot finish until its definition of done says so. The full design is `dod-spec.md`; this section is the contract Mission Control renders.

**The file is the contract.** On `UserPromptSubmit` the harness asks Oxagen to draft the acceptance checks for the prompt, or loads a hand-written set (`oxagen dod new`) or a template matched by task name (`.oxagen/dod/templates/`). The set is locked by digest (RFC 8785 canonical JSON of the set with `locked` removed, then sha256), written to `.oxagen/dod/<run>.yaml`, and registered with Oxagen. The agent is told where the file is and that it cannot finish until every check passes. It can read the file and cannot change it: an edit is `LOCK_MISMATCH` at the next Stop.

**Six check kinds, nothing else.** `run` (a command exits 0 inside its timeout, credentials scrubbed from the environment), `file` (a path exists, contains a string, or matches a digest), `diff` (every changed file matches an allow glob and no deny glob), `tools` (no tool call matched a deny pattern; enforced live by the `PreToolUse` hook), `budget` (cost, tool calls and minutes under limits; `stop_attempts` caps how often the Stop hook may block) and `human` (a named person signs after the run; it never blocks the agent, it withholds the certificate). Anything else is a `run` check that calls a script. The schema rejects a set with no executable check. The witness (§8.5) enters as a `run` check that exits 0 only on a flip.

**Hidden checks.** At lock time the cloud may keep some drafted checks back. They never appear in the file. The Stop hook fetches them and runs them beside the visible ones, so an agent that games the visible set, for example by editing the tests it was told to pass, meets the hidden one.

**One pure function decides.** At every Stop the harness collects evidence (the set as locked, the digest of the file on disk, a result per executable check with the sha256 of what it produced, the usage counters from the tool log, the denials, the signatures) and calls `decide(evidence)`. It has no clock, network, filesystem or model. Three verdicts: **HELD** (every executable check passed, no tool denied, budget held, no human check outstanding), **PENDING** (executable checks passed, a signature outstanding) and **BROKEN**, with a closed list of eight reasons: `CHECK_FAILED`, `TOOL_DENIED`, `BUDGET_EXCEEDED`, `ATTEMPTS_EXHAUSTED`, `LOCK_MISMATCH`, `EVIDENCE_INVALID`, `HUMAN_PENDING`, `HARNESS_ERROR`. A timeout, crash or missing result is `HARNESS_ERROR` and never a pass. Adding a reason means amending the ADR.

**Block or settle.** BROKEN with attempts left blocks the stop; the agent sees the failing ids and keeps going. Otherwise the evidence is submitted. Oxagen never runs a check (ADR-043): the settle handler re-runs `decide()` on the same evidence, checks the lock against what was registered, binds the outcome to the run ledger's sealed attempt and its stream digest, signs the certificate (`dodc_…`) with the org key, stores it, and records one governed action, `dod.held`, for HELD. `dod.held` is not billable (§12.1). A PENDING run becomes HELD on `oxagen dod sign`, which adds the signature to the evidence and decides again.

**What a held dod warrants.** That the submitted evidence decides to HELD under the locked set, that the lock matches what was registered before the run, that the certificate is bound to the sealed attempt, and that the org key signed it. Anyone with the evidence and `decide()` can recompute the verdict. It does not warrant that the set was the right set, that the developer's harness was not tampered with (the same trust the run ledger already places in the engine build digest), or that the outcome was worth money. Replay in a cloud sandbox is a later tier and a deliberate exception to ADR-043; it is not in this spec.

**Where it shows.** Every run carries its verdict as a badge shaped by state (double border held, dashed pending, single broken, dotted while locked and running). The Run page has a Done tab: the verdict and its reasons, the certificate and what it binds to, the checks with their evidence digests, the hidden checks that ran, the budget from the tool log, and every Stop. Fleet has a Done column, a tile counting sealed runs whose checks held, and counts outstanding signatures as waiting on a human. Billing reports held runs as a figure beside the GAU meter (§12.1).

**Where it lives.** Two packages (`packages/dod`, pure: schema, reasons, verdict, lock, drafting prompt; `packages/dod-harness`, beside the agent, shipped inside the CLI, never imported by the API), four capabilities (`dod.draft`, `dod.lock`, `dod.settle`, `dod.sign`), two tables (`dod.dod_sets`, `dod.dod_certificates`, Appendix A.11), three hook lines in `.claude/settings.json`, and one CLI command (`oxagen dod hook|new|lock|run|sign|status`). The drafting model is recorded on the set and is never the model running the task.

---


## 9. Context records: how agents learn

Agents do not write frames as memory. When an agent wants to remember something, it appends a **context record**. The record goes through Oxagen's exchange-provider endpoint (`context/append`, lifecycle profile). Any harness can send one. Stella sends records natively. Other agents use the SDK wrapper's `remember()` and `propose()` calls, or an MCP tool on the tool gateway.

- **Kinds accepted from agents:** `observation`, `memory`, `knowledge` (fact, assumption, decision), `evidence`, `record_proposal`, `context_use`, `context_use_feedback`. An agent may only *propose* a `directive`. It becomes active only through a Context PR (§10). The promoter writes `promotion_event`, never an agent.
- **Identity and hash.** A hash is a short fingerprint computed from a record's bytes. `record_hash` is SHA-256 over the RFC 8785 canonical bytes, with the hash member removed. RFC 8785 is the standard that defines one canonical, meaning fixed and repeatable, byte layout for JSON. The protocol and Stella compute it the same way. Oxagen adopts Stella's null-stripping divergence so all three agree. `record_id` is derived from the content. A correction is a new record on the same `lineage_id`. A lineage is the chain of records that revise one idea over time. Superseded is derived, never stored.
- **Attestation.** Oxagen countersigns every accepted record. To countersign means to add its own signature beside any existing one (`RecordAttestation`, detached, Ed25519). An agent that holds a key may sign first. The record keeps both signatures.
- **Scope.** `scope` uses the protocol's portable keys (`organization_id`, `workspace_id`, `repository_id`, `user_id`, `session_id`, `task_id`). `sharing_scope ∈ {user, repository, workspace, organization}` widens visibility. The sharing scope sets how far beyond its author a record can be seen. Oxagen enforces sharing authorization before persistence and on every read, per the profile.
- **Provenance.** Provenance is the trail that shows where a record came from. `provenance.source_refs` point at frames (`frame:<run>/<seq>`) and at other records. `evidence_links` point at frames or tool outputs by digest. An evidence link is a pointer to the proof behind a record. So every learned thing walks back to the exact frame that taught it.
- **Retention.** Oxagen honors or refuses `requested_retention` before persistence. A refusal returns `retention_rejected`. The accepted value is stored on the record.
- **Storage.** A record's system of record is the Postgres registry (`agent.context_records`, its versions, the promotions ledger and proposals), and its published text is in git (§4.2). From Phase 3 every record is also projected into the organization's graph as a `:Record` node, one direction registry to graph, verified by hash. Each node carries `ws`, `kind`, `lineage_id`, `record_hash`, `status`, and temporal fields. Typed edges connect the nodes: `DERIVED_FROM → :Frame|:Record`, `EVIDENCED_BY → :Frame`, `SUPERSEDES`, `REFINES`, `CONTRADICTS`, `PROPOSES → :Record`, `PROMOTED_BY → :Record(promotion_event)`, `ABOUT → :Entity`. The `ABOUT` edges are why the graph earns the index: "records relevant to the files and entities this run touches". **Status 2026-09-18:** no `:Record` node exists. Neither `packages/ontology` nor `packages/ingestion` writes one, and the graph holds no steering.
- **What a record is to an agent.** A published record is one kind of `SteeringItem` (§10.5). Its `force` decides where it competes: `must` and `should` in the stable prefix, `may` and `info` in the volatile selection. Status 2026-09-18: no published record reaches a wrapped agent (§10.4). Phase 0 of §17.2 is the first delivery.

### 9.1 Reflection

After every seal, the reflector reads the run. The reflector is a governed service agent tool, metered like any other. It produces:

- `observation` records for notable events (a rule violated, a tool that failed twice, a file convention discovered). Each carries evidence links to frames.
- `memory` records for what the agent itself asked to remember during the run.
- `context_use_feedback` for each context frame that was rendered, cited, or ignored. This closes the loop on retrieval quality.

Reflection uses a model. It runs through Oxagen's own model layer (§4.5) under a service principal. Its own cost is therefore a frame in a run of its own.

### 9.2 Aggregation and promotion

The promoter aggregates records across runs by lineage and by entity. A candidate becomes a `record_proposal` when the promoter has support to show: the runs it cites, the distinct agents among them, and its own confidence. There are no promotion thresholds; a person reads the support on the Steering page and decides whether to open a Context PR. A person's own proposal goes through the same six checks as the promoter's. A proposal carries `proposed_kind` (a directive kind or knowledge kind), a rationale, the supporting record ids, and the sharing scope it asks for. Proposals appear in Mission Control and become Context PRs (§10.3). Effect metrics (rendered, cited, violated, proof rate before and after) and retirement candidates were cut by the scope review; a published record shows where it landed because every run that renders it cites it in a context frame, and retiring one is an ordinary Context PR that sets `status = "archived"` in place.

## 10. The repository, steering, and Context PRs

People trust pull requests, proposed code changes that named reviewers approve before they merge. Every engineering organization already runs them, with named reviewers, required checks, and a history the customer can verify without Oxagen. So Oxagen governs the records that steer agents the same way teams govern code. Each record is authored in the workspace's main repo, proposed as a pull request, and published on merge. The registry keeps everything about those records. Git decides what is in force. Section 4.2 states the rule. This section describes the mechanism.

### 10.1 Repositories: one main repo, any number of linked repos

A workspace links to one or more GitHub repositories through the Oxagen GitHub App, an installed integration with its own repository access. Each link records the installation, the repository, the **production branch**, whether the repository uses GitHub Issues, and a `role`. The production branch follows §11.4. GitHub's default branch, the branch a repository treats as its primary line, is offered as the suggestion. The customer confirms or changes it. If GitHub's default branch changes later, Oxagen raises a prompt rather than silently moving the binding.

- **`main`**, exactly one per workspace, required at creation. The main repo is where the workspace's steering and configuration are managed in source control. That covers published steering records, the promotion ledger (the log of each promotion event), governance mode, and the workspace's Oxagen configuration file. That file is `.oxagen/workspace.toml`. It declares linked repos, tool servers, and budgets. Oxagen reconciles those declarations against Postgres and reports drift, any gap between the file and the live state. Workspace-scoped Context PRs are opened here. A workspace without a main repo cannot exist. Changing which repo is main is an org-owner action with approval, recorded as a security event.
- **`linked`**, zero or more. These are the repositories the workspace's agents work on. Each is a valid `resource_scope.repositories` target in grants. Each may carry its own `.oxagen/rules/` holding records with `sharing_scope = "repository"`. Those records steer only runs on that repo. Repository-scoped Context PRs are opened on the linked repo itself.

A repository may be linked to more than one workspace in the same organization. It is main for at most one. The repository row is shared across the workspaces that link it. Each link row sets `ws`, so isolation holds per workspace.

### 10.2 On-disk layout: `.oxagen/`

The directory is `.oxagen/`. The word `.stella` never appears in an Oxagen product, in a customer's repository, or in this specification's file names. The file format inside it is the context-record format Stella already implements and validates. Nothing is invented. Only the directory name is Oxagen's.

```
.oxagen/
  workspace.toml             # linked repos, tool servers, budgets (main repo only)
  rules/
    governance.toml          # mode = solo | team | regulated; separation flag
    promotions.jsonl         # hash-chained promotion ledger (regulated mode)
    ctx.<set>.<slug>.toml    # one published record per lineage id
  proposals/*.toml           # candidates; steer nothing
  agents/<slug>.toml         # agent definitions, one per agent (§6.2); harness files are generated beside them
  skills.toml                # which skill sources and skills are in scope; absent means off (§10.6)
  skills/<id>/SKILL.md       # governed skills, delivered to the harness by sync (§10.6)
```

Each record is one TOML file, a plain-text settings format. The file holds `schema = "context-record/v0.1"`, the record's `lineage_id`, kind, statement, steering and enforcement blocks, truth probes, and `record_hash`, a fingerprint of the record's content. Custom agents never parse the file. Oxagen serves published records as context frames and as compiled steering text. So the file format is a publication concern, not an integration concern.

**Stella symlinks, it does not copy.** When Stella initializes in a repository and finds `.oxagen/`, it creates symlinks, pointers to another path rather than copies. The same happens when a workspace is bound after Stella was already initialized there. The symlinks are `.stella/rules → ../.oxagen/rules`, `.stella/proposals → ../.oxagen/proposals`, and `.stella/agents → ../.oxagen/agents`. With them, Stella's loader, its CI validation, and `stella context propose` work unchanged on the Oxagen-governed files. There is no second copy that could drift. `.stella/private/` stays a real, gitignored directory. Oxagen reads `.oxagen/` and nothing else. Whatever sits under `.stella/` is invisible to Oxagen, and Oxagen never inspects it. The symlink is Stella's responsibility (Stella issue #6507). Stella refuses to initialize a second rules directory beside an existing `.oxagen/`.

The layout is the same in the main repo and in a linked repo. What differs is the sharing scope. Records in the main repo carry `sharing_scope = "workspace"` and apply to every run in the workspace. They may instead carry `organization` when the org allows a workspace to publish org-wide. Records in a linked repo carry `sharing_scope = "repository"` and apply only to runs whose repository binding is that repo. A linked-repo record that claims workspace scope fails the checks. Precedence at run time follows Stella's authority rule. Repository records may narrow what workspace records allow. They may never widen it.

**Published** means the record file exists under `.oxagen/rules/` on the default (or context) branch of the main repo. For repository-scoped records, the file exists on that branch of the linked repo. The steering index (§10.5) stores every published record by `record_hash` and by the repo and commit it came from. Oxagen verifies the index against the merged commit. A mismatch is a `steering_drift` incident that blocks delivery of that record until resolved. The index never silently outranks git for steering. Git never holds anything but steering, skills and configuration.

### 10.3 Context PR lifecycle

```
proposal (graph)  →  Context PR (GitHub)  →  checks  →  review per mode  →  merge  →  promotion_event (graph + ledger)  →  published (index)  →  delivered (bundle, frames)
```

1. **Open.** The promoter, a person in Mission Control, or `stella context propose` opens a branch `context/<lineage>` with the single record file. It also opens a PR. The PR body carries the rationale, the supporting record ids, evidence links, and an Oxagen check-run link. One concern per PR. The target is the main repo for workspace-scoped records and the linked repo for repository-scoped ones. The promoter picks the scope from where the evidence came, either all supporting runs on one repo or across repos.
2. **Checks** are Oxagen GitHub App check runs with the same rules as `stella context validate`. They cover schema, lineage uniqueness, `record_hash` recomputation, and a secret and PII scan. They detect conflicts against active records, so a `forbid` against an active `require` on the same subject fails. They run truth probes where declared. They enforce the `constraint_effect ∈ {require, forbid}` rule, which means a record can never grant authority.
3. **Review.** In `solo` mode, the author may merge. In `team` mode, a code-owner review is required. In `regulated` mode, a named approver from a role must approve, and Oxagen records that as an accountable approval. A `promotions.jsonl` entry is appended in the same merge.
4. **Merge** triggers a `promotion_event` record. That record holds `from_status`, `to_status`, subject lineage, approver, PR url, and commit sha. Merge also triggers re-indexing from the merged commit, a bundle version bump for the workspace, and a `steering_published` audit event.
5. **Retirement** is a Context PR that sets `status = "archived"` in place. Files are never deleted.

Oxagen honors enforcement grants only when they appear in the promotion ledger, never from a private local approval. An enforcement grant is a `blocking` directive that arms a tool guard. This rule carries over from Stella's authority rule.

### 10.4 Delivery

> **Status of this section (2026-09-18).** This section describes the target and says plainly what is built. On oxagen `main` at `02278c913`, almost nothing reaches a wrapped agent. A workspace can write a record, pass six checks, get a second-person review under a governance mode, merge a pull request and append a hash-chained ledger row, and no Claude Code or Codex run behaves differently. Phase 0 makes one record steer one agent. Phase 1 builds the assembler of §10.5. **New governance ceremony is frozen until Phase 0 lands** (§17.2).

Everything that can influence a run competes for one finite window, so one function decides that competition: `assembleSteering(run, budget)` (§10.5). Published steering reaches an agent through the five injection points of §7.3 and no others:

| Route | What travels | Injection point (§7.3) | Delivered in |
|---|---|---|---|
| **Bundle context** | The **stable prefix**: `must` and `should` items compiled to text in the signed policy bundle's `context.system`. Cached in the bundle, so it works offline | 1, `SessionStart` | Phase 0 for records. Phase 1 for every kind |
| **Prompt-time selection** | The **volatile selection**: `may` and `info` items picked for this prompt under a token budget | 2, `UserPromptSubmit` | Phase 1 |
| **Context frames** | Oxagen's provider serves published records as `fact` and `memory` context frames through its MCP tools. Each carries provenance to the record and the commit. Valid-from is the merge time, so `as_of` queries are exact | 3, MCP tool results | Built, and pull only: the model has to ask |
| **Files** | Published records and skills as files in the checkout, loaded by the harness's own rules | 4 | Records on merge. Skills sync in Phase 2 (§10.6) |
| **Turn injection** | The volatile selection re-landed on every model request, right after the cached system block (ADR-051) | 5, the model request | Phase 4, with the gateway's proxy |

Every route is recorded. The assembler's **manifest** says what was rendered and what was cut, and it is a frame on the run (`steering.manifest`, §10.5). Without it nobody can measure whether a record had any effect, and effect metrics, retirement and promotion stay unbuildable.

**What is true today, source by source:**

| Source | Where it lives | Reaches an agent? |
|---|---|---|
| Context records | Postgres `agent.context_records` with versions, the promotions ledger and proposals. Mirrored in git as `.oxagen/rules/*.toml` | **No.** No run-time reader exists. ADR-051's injection path was removed by ADR-043 and never re-landed (issue #2592). Only a harness that reads the checkout itself sees them. Phase 0 is the first reader: ADR-091, in review as oxagen PR #3289, and not on `main` |
| Bundle `context.system` | `packages/tacho/src/wire.ts:375`, consumed at `packages/tacho/src/collector/hook-handler.ts:322` | **No.** The server hardcodes `null` (`packages/handlers/src/lib/tacho-host.ts:276`) |
| Bundle permissions, tools and budget | `tacho-host.ts:269-275` | **No.** Always empty, with `budget.mode = "observed"`. Nothing reads `session_limit_usd` |
| Skills | `tacho.sessions.skills_available`, an inventory of what the harness reported (`packages/database/src/schema/tacho.ts:358`) | **No.** Observation only. No skills package, table or loader exists |
| Memory | The graph, `:AgentMemory`, recalled at `packages/agent/src/runtime/assistant-recall.ts` | In-app agent only, capped at 6 items by a constant (`assistant-recall.ts:23`) |
| `packages/engram` and `packages/context-provider` | A second memory system, and the only real token budgeter (`packWithinBudget`, `packages/context-provider/src/budget.ts:37`) | **No.** No application imports either. `@oxagen/engram` is still named by `packages/context-provider`, `tools/scripts/package.json` and `apps/app/next.config.ts`, and `@oxagen/context-provider` only by the env registry (`packages/config/src/registry.ts`). No app, handler or function calls them |
| Decision rules, mandates, auto-approval | `workspaces.settings.decisionRules`, `tools.mandates` | They refuse calls at `kernel.invoke()`. They never produce prompt text, and they are not in the path of a wrapped agent |
| `workspaces.promptConfig.additionalInstructions` | Postgres JSONB | In-app agent only. Appended to every prompt by `resolvePrompt`. An override cannot replace the governance prompt: `chat.system` is append-only, and only `conversation.title` is overridable (`OVERRIDABLE_PROMPT_KEYS`). What remains true is narrower: the appended text is unranked, unbudgeted, and never compared with a rule or a published `must` record (oxagen issue #3303) |
| Operator steer commands | `tacho.control_commands`, drained at `hook-handler.ts:216` | **Yes.** This is the only live text channel from the server to a running wrapped agent |

### 10.5 The assembler contract

> **Status of this section (2026-09-18).** Not built. This is the contract Phase 1 implements (§17.2), decided by ADR-093 "One assembler decides what reaches the agent, and records what it cut" and ADR-097 "Steering and gating are two planes, authored on one surface and compiled twice". Phase 0 ships the smallest slice of it: active records with `force` of `must` or `should`, compiled into `context.system`. Phase 0 is in review as oxagen PR #3289 (ADR-091), and its `compileSteering` is the first version of the stable prefix. Phase 1 moves it behind `assembleSteering` without changing what a host receives for a workspace that has only records (ADR-093 §1). The assembler's home is `packages/context-provider`, which no application imports today.

**Two planes that never merge.** *Steering* is what the model reads: advisory, ranked, budgeted, and it may be dropped. *Gating* is what the kernel refuses: deterministic, never budgeted, never ranked, and it works when Neo4j is down. A deny rule must never compete for context, because a relevance score could then drop it. So there is **one authoring surface and two compilations**:

| Compilation | Input | Output | Properties |
|---|---|---|---|
| **To text** | Every steering item | The assembler's prefix, volatile selection and manifest | Ranked, budgeted, recorded. An item may be cut, and the cut is recorded |
| **To gates** | Only items that carry an enforcement grant, plus the rules, mandates and kill switches authored under Policy | Bundle permissions (`permissions.allow`, `deny`, `ask`) and kernel rules | Deterministic. Never ranked, never budgeted, never cut. A gate that fails to compile fails its publication check. It is never dropped silently. Reads Postgres and the signed bundle only |

The two relate in one direction. **Every gate also emits a one-line gate notice into steering**, so the agent does not spend turns walking into a denial. A gate notice is a `SteeringItem` of kind `policy` and force `must`. Removing the notice never removes the gate. Oxagen honors an enforcement grant only when it appears in the promotion ledger (§10.3). Phase 1 builds the text compilation and the gate notices. Phase 4 fills bundle permissions from the gate compilation.

**One item type.** Everything that can steer is a `SteeringItem`:

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Stable and content-derived: `<kind>:<lineage>@<first 12 hex of hash>` |
| `lineage` | string | The idea this item is a version of: a record's `lineage_id`, a skill id, a memory id, a rule or mandate id, or `instructions:<workspace>` |
| `kind` | `record` \| `skill` \| `memory` \| `ontology` \| `policy` \| `instruction` | It names the source family. `policy` is a gate notice. `instruction` is the workspace's additional instructions. A context record keeps its own six-way classification (`rule`, `constraint`, `procedure`, `fact`, `memory`, `preference`) on its row. The two are different columns with different vocabularies, and the adapter must not conflate them (ADR-093 §2) |
| `force` | `must` \| `should` \| `may` \| `info` | How hard the item steers. `must` and `should` go to the stable prefix. `may` and `info` compete for the volatile selection |
| `scope` | `{ organization_id, workspace_id, repository_id?, agent_slug? }` | Where the item applies. An absent key means "every" |
| `body` | string | The text as it will be rendered. One statement, plain prose |
| `token_cost` | integer | Estimated tokens of `body`, computed once by the adapter |
| `enforcement_grant?` | `{ ledger_ref, effect: require \| forbid, subject }` | Present only when the promotion ledger carries the grant. It is what sends the item to the gate compilation as well |
| `provenance` | `{ source, ref }` | The adapter that produced it and a pointer a person can follow: commit and path, memory node id, rule id |
| `hash` | string | SHA-256 over the canonical `body`. It is what the index verifies against git |
| `valid_from` | timestamp | Merge time for anything published. Creation time for a memory |

**The function.**

```ts
assembleSteering(run: SteeringRun, budget: SteeringBudget): Promise<SteeringAssembly>

interface SteeringRun {
  organization_id: string; workspace_id: string;
  repository_id?: string;        // the run's repository binding
  agent_slug: string; harness: string;
  run_id?: string;               // absent in Preview
  injection_point: "session_start" | "user_prompt_submit" | "model_request" | "in_app_turn" | "preview";
  prompt?: string;               // the query for relevance. Absent at session start
}
interface SteeringBudget {
  prefix_max_bytes: number;      // 16384, the wire cap on context.system
  volatile_max_tokens: number;   // workspace setting, default 1200
  volatile_max_items: number;    // default 12
  deadline_ms: number;           // default 250 at the hook tier
}
interface SteeringAssembly {
  prefix:   { text: string; item_ids: string[]; digest: string };
  volatile: { text: string; item_ids: string[]; digest: string };
  manifest: SteeringManifest;
}
```

`run` carries the prompt because the prompt is the query. The function is pure over its ports: the same items, run and budget give the same assembly, byte for byte. That is what makes Preview (§10.7) truthful and a replay exact.

**Source adapters.** Each adapter turns one source into `SteeringItem`s. An adapter never ranks and never budgets.

| Adapter | Reads | Emits | Notes |
|---|---|---|---|
| Record registry | `agent.context_records` with status `active`, through the index port | `record` | A row with no `force` (one published through `publish_context_record` before the two publish paths collapse) is read as `info` and listed in the manifest as `unclassified` |
| Memory | `:AgentMemory` in the graph | `memory` | Force is never above `may`, whatever the memory's class. With the graph off the adapter returns nothing and the manifest says `source_unavailable` |
| Gate notices | `workspaces.settings.decisionRules`, `tools.mandates`, kill switches, and compiled enforcement grants | `policy`, force `must` | One line each: what will be refused or held, and for whom |
| Skill descriptions | The published skills under `.oxagen/skills/` (§10.6) | `skill` | The description line only. The harness loads the skill body itself |
| Ontology notes | Notes authored under the Ontology tab (§10.7) | `ontology` | A note, not the ontology engine |
| Instructions | `workspaces.promptConfig.additionalInstructions` | `instruction`, force `should` | Today it is appended to every in-app prompt with no check against rules (`packages/ai/src/prompts/registry.ts:82`). An override cannot replace the governance prompt: `chat.system` is append-only, and only `conversation.title` is overridable. In the assembler it is one item among the others, rendered after the prefix and subject to the same precedence |

**The index sits behind a port.** Adapters that read published items go through one interface, so the store can change without the assembler changing:

```ts
interface SteeringIndex {
  prefixItems(scope): Promise<SteeringItem[]>;                            // every active must and should in scope
  candidates(scope, query: string | null, limit: number): Promise<Array<SteeringItem & { score: number }>>;
  verify(item: SteeringItem): Promise<"ok" | "steering_drift">;          // hash against the merged commit
}
```

The first implementation is on the Postgres record registry. In Phase 3 a graph implementation takes the relevance stage (`:Record` nodes with `ABOUT` edges to files, repositories and entities, projected one direction from the registry and verified by hash), with the Postgres implementation kept as the fallback behind the same port. Delivery never waits for the graph.

**Ranking and budgeting**, in this order:

1. **Collect.** Call every adapter in parallel, each under the deadline. An adapter that fails or times out contributes nothing and is named in the manifest. It is not an error.
2. **Scope.** Keep an item when its scope matches the run. Drop the rest with reason `out_of_scope`.
3. **Verify.** Drop any published item whose `verify` says `steering_drift`, with that reason. Drift also raises the incident of §10.2.
4. **Apply precedence** (below).
5. **Build the prefix.** Gate notices first, then `must`, then `should`, then the `instruction` item. Inside each group order by `valid_from`, then `id`, so the text is stable and the bundle's etag moves only when content does. If the text would pass `prefix_max_bytes`, cut from the end (`should` before `must`, never a gate notice) with reason `prefix_overflow`. A workspace whose gate notices and `must` items alone pass the cap fails the publication check that would have caused it (§10.3), so the overflow is caught at the pull request and not at the agent.
6. **Select the volatile items.** Score `may` and `info` candidates against the prompt through the index. With no prompt, or on a host whose retention mode is `digest_only` (the prompt may not leave the machine), the score is the force weight alone and the manifest records `query: none`. Pack best-first with `packWithinBudget` (`packages/context-provider/src/budget.ts`), which skips an item that does not fit and keeps walking, under `volatile_max_tokens` and `volatile_max_items`. Ties break on `id`. Everything not packed is cut with reason `over_budget` or `below_relevance_floor`.
7. **Render.** The prefix opens with a line that says these items govern. The volatile block opens with a line that says its items are advisory and that the governing items win any conflict.
8. **Write the manifest.**

**Precedence, fixed in this one place (ADR-097 §4). The rule lives in the assembler's package and nowhere else:**

1. **A gate beats everything.** No steering text changes what the kernel refuses. When a gate and an item disagree, the gate's notice is rendered and the item is cut with reason `overridden_by_gate`.
2. **A published `must` beats recalled memory.** A memory never enters the prefix and is never rendered as a rule. Today a recalled memory of class `RULE` is rendered with "never violate a RULE" (`assistant-recall.ts:69`) while a published `must` record is never in the same prompt. The assembler ends that.
3. **Repository scope may narrow workspace scope and never widen it.** A record can only `require` or `forbid` (§10.3), so a repository-scoped item can add a constraint. A repository-scoped item on the same lineage as a workspace-scoped item is cut with reason `widens_workspace_scope`.

**The manifest frame.** Frame kind `steering.manifest`, one per assembly that reached an injection point:

| Field | Meaning |
|---|---|
| `assembler_version` | The version of the contract that produced it |
| `injection_point` | One of the five values of `SteeringRun.injection_point` |
| `bundle_version`, `steering_version` | The bundle the prefix came from, and the promotion ledger length it was compiled at |
| `prompt_digest` | A digest of the prompt, or `null`. Never the prompt |
| `query` | `prompt` or `none` |
| `budget`, `spent` | The `SteeringBudget` given, and the bytes and tokens used |
| `rendered[]` | `{ id, lineage, kind, force, hash, token_cost, section: prefix \| volatile, score? }` |
| `cut[]` | The same fields, plus `reason` |
| `sources[]` | `{ adapter, status: ok \| timeout \| unavailable \| error, items, ms }` |
| `prefix_digest`, `volatile_digest` | Digests of the exact text delivered |
| `fail_open` | `null`, or the reason the assembly returned empty |

`reason` is a closed vocabulary: `over_budget`, `below_relevance_floor`, `out_of_scope`, `superseded`, `widens_workspace_scope`, `overridden_by_gate`, `steering_drift`, `prefix_overflow`, `duplicate`, `source_unavailable`. The manifest carries ids, hashes and digests. It never carries bodies or the prompt.

The prefix is compiled on the server when the bundle is built (`unsignedBundle`, `packages/handlers/src/lib/tacho-host.ts:255`), and its manifest is stored with the bundle version. At `SessionStart` the daemon seals a `steering.manifest` frame naming the bundle version and the prefix digest it delivered, beside the `oxagen.context_digest` attribute it already writes. The volatile manifest is sealed at the injection point that used it.

**Failure behaviour.** The assembler call fails open: a slow or failing assembler never blocks a prompt at the hook tier, and the cost is a turn with the prefix and no volatile selection (ADR-093). That is a statement about steering, which is advisory. It is not the hook process's gate path, which fails closed against its cached bundle (§7.1).

- The `UserPromptSubmit` call runs under a tight timeout (`deadline_ms`, default 250). On a timeout or any error the hook answers `{}`, the prompt proceeds with no volatile selection, and a `steering.manifest` frame is sealed with `fail_open` set. A slow assembler never holds a prompt.
- The stable prefix does not depend on that call. It rides in the signed bundle, so it is delivered offline and when the server is slow.
- One adapter failing degrades one source. The rest of the assembly stands.
- The gate compilation shares none of this. A gate never fails open because steering did.

**One assembler, everywhere.** The in-app agent's `packages/agent/src/runtime/assistant-turn.ts` calls the same function with `injection_point: "in_app_turn"`, in place of its own recall cap and its unconditional append. Preview calls it with `injection_point: "preview"`, which seals no frame. From Phase 4 the proxy calls it with `injection_point: "model_request"`. ADR-094 fixes the rule for that tier: prompt bodies never leave the machine, and the proxy ships the seam for the per-turn injection before the Phase 1 assembler exists. Where the ranking runs is a build choice inside that rule. ADR-094 does not name it. `packages/engram` is deleted or folded into `packages/context-provider`, so two memory systems become one. The two publish paths (`packages/handlers/src/context.record.publish.ts` and `packages/handlers/src/context.pr.merge.ts`) collapse, so every row carries `kind` and `force`.

### 10.6 Skills are steering, and they are files

> **Status of this section (2026-09-18).** Not built. On oxagen `main` at `02278c913` the only skills data is `tacho.sessions.skills_available`, an inventory of the skill names a harness reported. ADR-008 describes a skills package, tables and a loader that do not exist. Governed skills delivered by sync arrive in Phase 2 (§17.2). ADR-090 (skill resolution) is checked against this section in the ADR amendments of 2026-09-18. Where that check changes ADR-090, §14 and the `skills` tables of Appendix A follow it.

A skill is a harness-native artifact. The harness loads it by its own progressive disclosure: it reads the skill's description line first, and the body only when it decides the skill applies. Oxagen cannot put a skill in the prompt, and it does not run one. It can do three things, and those are the whole design:

1. **Govern it like a record.** A skill is a file in the repository, under `.oxagen/skills/<id>/SKILL.md`, authored and changed through the same pull request flow as a record (§10.3): checks, review per governance mode, merge, a promotion ledger entry. The workspace's `.oxagen/skills.toml` says which sources and skills are in scope. It is off by default and is itself changed only by pull request (the W13 scenario, ADR-090).
2. **Deliver it by sync.** Sync materializes the published skill files into the place in the checkout where the harness looks for skills, and removes what is no longer published. It is injection point 4 of §7.3. Nothing else delivers a skill.
3. **Let its description compete.** The skill's description line is a `SteeringItem` of kind `skill`, and it competes in the assembler like any other item (§10.5). So a skill that matters for this prompt can be named to the agent even when the harness's own disclosure would not have surfaced it.

Skills live under Steering (§10.7). They have no top-level navigation entry of their own.

### 10.7 One screen: Steering is the hub

> **Status of this section (2026-09-18).** Phase 2 (§17.2). Today Steering lists records, proposals and Context PRs, and Skills is a separate page that shows the reported inventory. The mockups depict Phase 2 complete.

One screen owns everything that can steer. Its tabs, in this order:

| Tab | What it holds |
|---|---|
| **Records** | Published context records, by kind and force, with their lineage and the pull request that published each |
| **Skills** | Governed skills: the published files, their versions and digests, the `.oxagen/skills.toml` config and its history, sync status per agent, and the skill inventory harnesses report |
| **Memory** | What agents remembered (`:AgentMemory`), with provenance to the frame that taught it. Read and retire. A memory becomes a rule only by being proposed as a record |
| **Ontology** | A small home for ontology notes that steer. It is not the ontology engine, which stays cut (the scope review, amended 2026-09-18). The graph becomes the index in Phase 3 |
| **Policy** | Gates: decision rules, mandates, kill switches and enforcement grants, each shown with the one-line gate notice it emits into steering |
| **Proposals** | Candidates and open Context PRs with their checks. Nothing here steers until it merges |
| **Preview** | Pick an agent and a prompt, and see exactly what would be injected, what was cut, and why. It runs the same `assembleSteering` with `injection_point: "preview"` and renders the manifest. It is the page that makes the competition visible |

The route is `/{org}/{ws}/steering/{tab}`, with `records` as the default tab. A view inside a tab is one more segment: the Skills views at `/steering/skills/{view}`, and open Context PRs at `/steering/proposals/prs`. Skills and Ontology have no top-level navigation entry of their own any more. `/{org}/{ws}/skills` redirects to `/{org}/{ws}/steering/skills`.


---

## 11. The code graph

Earlier drafts of this specification described a dynamic, customer-extensible ontology inferred from ingested data, browsable and queryable in plain English, stored in Neo4j. It does not ship. Neo4j, the datastore it needed, stays in the architecture and keeps that graph (§4.2). What remains in Mission Control is the part the witness author reads and the toolbelt policy cites: a fixed, built-in graph of each workspace's main repository, kept in Postgres and kept current by the GitHub App.

### 11.1 What the graph holds

| Layer | Tables | Purpose |
|---|---|---|
| Repository | `repositories`, `commits`, `branches`, `pull_requests`, `issues`, `releases` | The GitHub entities of every linked repository, from the App's events, with the delivery id and payload digest of the event that wrote them |
| Code | `files`, `symbols`, `code_edges` (`DEFINES`, `IMPORTS`, `CALLS`, `REFERENCES`) | The production branch, indexed on every push, each row stamped with the commit that introduced it (`valid_from`) and the one that removed it (`valid_to`) |
| Data | `tables`, `columns`, `data_edges` (`READS`, `WRITES`, `DELETES`, `MIGRATES`) | What the code declares and touches (§11.4) |
| Run | `runs`, `attempts`, `frames`, `seals` and their edges to tasks, PRs and files | The run record (§8) |
| Context | `records` and their lineage (§9) | What was learned, proposed and published |

Every row carries `org_id`, `ws` and `recorded_at`. There are no embeddings and no vector index; retrieval over records and symbols is full-text, and the protocol provider (§11.3) says so in its frames.

### 11.2 GitHub: events in, code graph up to date

Linking a repository does four things, in this order.

**1. Confirm the production branch.** The link dialog shows GitHub's default branch. It asks the customer to confirm that branch as the production branch or pick another (`main`, `release`, `production`, whatever they ship from). The production branch is the only branch whose commits update the code graph. If GitHub's default branch later changes, the App receives the `repository` event, records it, and prompts the workspace owner. The binding never moves on its own.

**2. Subscribe to events.** The App subscribes the repository to every event the product uses and records each delivery, idempotent on GitHub's delivery id. Events used in v1: `push` (commits to the production branch drive the code graph); `pull_request` and its review events (PRs are entities, a merge into the production branch is a verified outcome for the run that opened it, reviews are evidence); `issues`, `issue_comment`, `label`, `milestone` (issues are task references for runs, §8.1); `check_suite`, `check_run`, `workflow_run` (CI results attach to commits and PRs and feed proof and findings); `release`, `create`, `delete`; `commit_comment`; and `repository`, `installation`, `installation_repositories` (renames, default-branch changes, permission changes and uninstalls, each of which prompts and none of which silently alters a binding). Delivery is by webhook into a durable job. There is no polling and no cron. Every `push` carries the previous head; a gap is detected from the events themselves and fetched before the new push. GitHub's own redelivery is the second line.

**3. Import issues.** If the repository has Issues enabled, the link runs a one-time backfill: paginated, rate-limit aware, resumable. After it, issue events keep the rows current. An issue becomes a run's task reference automatically when the run's branch name, PR body or commit message references it (`#123`, `Closes #123`, or the issue URL). Spend then rolls up to the issue.

**4. Build and keep the code graph.** On link, the indexer clones the production branch head (shallow, into ephemeral storage discarded after indexing) and builds the code graph with tree-sitter grammars, the same grammars the protocol's reference provider uses, so symbols agree between Oxagen and Stella. A **manual sync** (`sync_repository`, a governed action) does a full re-index of the production branch head; it is idempotent and archives anything the full pass does not see. An operator reaches for it after a force-push, a history rewrite, or a doubt. It is never scheduled.

Division of labor with Stella: Oxagen holds the production truth of each repository and its history. Stella's local provider serves working-tree context (uncommitted changes, feature branches) as context frames during a run. Both cite the same symbols. A run's frames show which one a piece of context came from.

### 11.3 Oxagen as a protocol provider

Oxagen exposes one provider per workspace on the tool gateway host. The provider offers `context/query` over records, runs and the code graph, with kinds `fact`, `doc`, `memory`, and `episode`, and `context/verify` with the lifecycle operations `append`, `get`, and `resolve`. It declares `data_flow.egress: true` with scope `org-tenant`, so a host gates the provider behind consent as the protocol requires. Frames carry provenance to the row, the event that wrote it, and its digest. `token_cost` is the protocol's exact accounting.


### 11.4 The data layer of the code graph: tables, queries, and storage objects


Code changes are only half of what an agent touches. The other half is the data behind the code. The code graph therefore carries a **data layer** built the same way the code layer is. Parsers run over the repository and resolve what they find into typed nodes, with provenance to the file and line that declared them. The layer is kept current on every push to the production branch and confirmed by what runs actually did.

**What is extracted, and from where.**

| Source in the repository | Parser | Nodes produced |
|---|---|---|
| SQL DDL (statements that define tables and schemas): migration folders (Atlas, Flyway, Liquibase, raw `.sql`), `schema.sql` dumps | tree-sitter SQL grammar for structure. A full SQL parser (dialect-aware: Postgres, MySQL, SQLite, T-SQL, BigQuery, Snowflake) for semantics | `Database`, `Schema`, `Table`, `Column`, `Index`, `Constraint`, `View`, and `Migration` nodes. A migration `DEFINES` or `ALTERS` the objects it touches, in order |
| ORM (a library that maps code classes to tables) and schema-as-code models: Drizzle, Prisma, SQLAlchemy, Alembic, Django, ActiveRecord `schema.rb`, TypeORM, Hibernate annotations, Ecto, GORM | per-framework tree-sitter queries over the host language | The same table and column nodes, `DECLARED_BY` the model class, with the framework recorded |
| Infrastructure as code (config files that declare cloud resources): Terraform, CloudFormation, CDK, Pulumi, SST, Kubernetes manifests, Docker Compose | HCL, YAML, and host-language parsers | `StorageBucket`, `Queue`, `Topic`, `Cache`, `Secret`, `DatabaseInstance` nodes with provider and region |
| Query sites in application code | tree-sitter queries that find SQL string literals, query-builder and ORM call chains, and storage SDK calls (S3, GCS, Azure Blob, SQS, Kafka, Redis clients) | `READS`, `WRITES`, `DELETES`, `MIGRATES` edges from the enclosing `Symbol` to the `Table`, `Column`, or storage object. Each carries `confidence` and `evidence` (file, line, the literal or call) |

Confidence is assigned by how the reference was resolved. `high` means a literal statement the SQL parser resolved to named tables and columns. `medium` means an ORM call resolved through a model declaration. `low` means a dynamically built query where only the table name is recoverable. `unresolved` means a query site was found but nothing could be named. Unresolved sites are still recorded, so coverage is reported as it is. Edges carry the operation (`select`, `insert`, `update`, `delete`, `ddl`) and, where resolvable, the columns.

**Runtime confirmation.** Frames confirm and extend the static picture. A tool call or command frame that executed a query, or a storage SDK call captured as a `network` or `file_io` side effect, produces an `OBSERVED_ACCESS` edge from the run to the data object. A static edge that a run confirms is raised to `confirmed`. An observed access with no static edge is a finding (a dynamic query the parser missed).

**Live schema drift.** Where a Postgres connection is configured for the database the code declares, Oxagen links declared `Table` rows to live tables by name. It then compares columns, types, and indexes. Drift is any gap between what the code declares and what the database has: code references a column the database does not have, a migration is not applied, or a table has nothing referencing it. Drift is offered to the findings job.

**What this buys the governor.** With this layer, the toolbelt policy (§6.12) can say what no static allowlist can. It can deny, or route to approval, any tool call whose resolved effect is a write to a table the customer has classed as sensitive (money, personal data, regulated), whichever code path performs it. It can require an approval when a change touches a symbol that writes a table in that class. It can show a CIO, per agent and per run, which tables and buckets the agent's work reached, with the evidence.
## 12. Cost: accounted to the token, attributed to the operator, charged on two meters

### 12.1 What is tracked, and what is priced

Two different things are tracked, and they are kept apart on purpose:

- **Customer spend**: the money the customer pays to model and tool providers. Oxagen measures it per frame and adds it up into rollups (a rollup is a total built from smaller records). This is a FinOps feature (FinOps is the practice of tracking and managing cloud and AI spend). It is billed at zero (ADR-052). Matching it to the cent against provider statements was cut by the scope review; every figure carries its basis instead (`gateway_observed`, `client_attested`, `estimated`), and the Spend page never claims more than the basis allows.
- **Oxagen revenue**: charged on two meters (2026-09-15, maintainer decision, §12.10). Meter 1 prices governed actions in **governed action units** (GAUs) on one price list, the GAU billing of Oxagen ADR-055 (maintainer decisions of 2026-09-14, reaffirmed 2026-09-15). Meter 2 prices in-app AI usage, the in-app agent's model calls, in **usage credits**. One billable governed action is one GAU. `resolve_approval` is the only billable governed action. Membership writes are free, and every other governed action, `dod.held` included, is recorded in the ledger and not billed. Proven spend (§12.8) and held runs (§8.6) are report figures on Spend and Billing, and nothing is priced per run.

| Tier | Price | GAU included each month | Evidence included | Past the allowance |
|---|---|---|---|---|
| Free | $0 | 5,000 | 30 days | refused until the organization saves a card or the next month opens; with a saved card, auto top-up at list |
| Build | $199 a month | 50,000 | 12 months | auto top-up at list |
| Scale | $999 a month | 300,000 | 12 months | auto top-up at list; eligible for invoice billing |
| Enterprise | negotiated | negotiated | 12 months, extensible | invoice billing |

| Term | Price |
|---|---|
| List rate | $5 per 1,000 GAU (5,000 micro-USD per GAU), the rate every published tier carries |
| Blocks | 5,000 GAU at $25, bought through Stripe Checkout or by auto top-up |
| Volume bands, by annual volume | $5 per 1,000 for the first 1M, $4 from 1M to 5M, $3 from 5M to 25M, $2 above 25M committed |
| Enterprise | negotiated only (2026-09-15, maintainer decision). Each contract is a `billing.contract_terms` row carrying its own rate, block size and monthly allowance; no enterprise plan exists in Stripe or in `SUBSCRIPTION_PLANS`. A contract covers committed use, a dedicated data plane or behind-the-firewall deployment, support with an SLA, and invoicing |

**Every feature on every tier.** No feature is gated on a tier or on the enterprise license (2026-09-15, maintainer decision 3). IAM, SOC 2 controls, the definition of done, the in-app agent and the hosted witness runner are on for Free, Build, Scale and Enterprise alike. Tiers differ in price, allowance, included evidence and billing mode.

**The meter.** Each organization has one bucket a month (`billing.gau_buckets`), and its remaining units are included + purchased + carried − used. At remaining ≤ 0 a prepaid organization's auto top-up charges the saved card for `auto_topup_blocks` blocks; when auto top-up cannot run, further governed actions are refused until a card is saved or the month renews. Purchased and carried units roll into the next month, and included units do not. A platform operator approves invoice billing (`approved_for_invoice_billing`); an invoice-billed organization is never refused for lack of units, and its overage is invoiced at period end or on an interim invoice at `invoice_gau_max` (§12.10). Every block purchase, top-up and invoice is a `billing.gau_settlements` row that records the rate it charged. The Billing page prints the organization's contracted rate: the `billing.contract_terms` row in effect, else its plan's terms.

**Meter 2: in-app AI usage, in usage credits** (2026-09-15, maintainer decision, §12.10). The in-app agent's model calls (§4.4) are metered in usage credits, on a balance separate from the GAU bucket.

| Term | Price |
|---|---|
| Unit | 1 usage credit = $0.01 |
| Rate | provider cost times the meter markup set in `packages/billing/src/pricing.ts`; tokens are not passed through at cost |
| Metering | the credit gate debits each model call from the organization's balance (`billing.credit_balances`, `billing.credit_lots`, `billing.credit_ledger`, App. A.8), carrying fractions of a credit in `meter_carry_micro_credits` |
| Funding | a $5 signup grant (500 credits) written by `create_org` |
| Top-up | credit packs, bought with `purchase_credits` |

GAU blocks buy governed actions and credit packs buy in-app AI usage; neither balance pays for the other. Customer agents' model calls stay customer spend, billed at zero.

Payment is by card, or by invoice for an approved organization, and a subscription can be cancelled any time. Stripe holds customers, subscriptions and invoices; Oxagen holds the meter and mirrors invoices in `billing.invoices`. The 7-day onboarding offer is deferred (§20). The figures are the published terms `billing.plans` carries, set on 2026-09-14 in `macanderson/oxagen` `docs/specs/governed-action-metering.md` §4. Oxagen's marginal cost per GAU is under $0.001, so the margin exceeds 85 percent at every band.

### 12.2 Price book

A price book is the table of prices Oxagen applies to each provider and model. `prices.price_books` and `prices.price_entries` hold: provider, model (canonical id and aliases), region, token class (`input`, `output`, `cache_read`, `cache_write_5m`, `cache_write_1h`, `thinking`, `web_search`, …), unit, **micro-USD per million units as an integer**, `effective_from`, `effective_to`, and source (provider list price, negotiated, customer override). A token class is one kind of token a provider charges for. Micro-USD are millionths of a dollar. Cache read tokens are prompt tokens served from a stored copy. Cache write tokens are prompt tokens saved for later reuse. Reasoning tokens (`thinking`) are tokens the model spends thinking before it answers. Organizations may override prices to record negotiated rates. Every cost record names the price entry id it used. A price correction therefore produces a recomputed record, never a silent change.

### 12.3 Cost record

Oxagen writes a cost record on every `model.response` frame (proxied) or `llm_call` frame (attested):

```json
{
  "usage": { "input": 1834, "output": 412, "cache_read": 12000, "cache_write_5m": 0 },
  "price_entry_ids": ["pe_…", "pe_…", "pe_…"],
  "cost_micros": 41265,
  "cost_basis": "gateway_observed" | "client_attested" | "estimated_unknown_model",
  "provider_request_id": "req_…",
  "provider_key_id": "pk_…"
}
```

Every amount is an integer in micro-USD. Per-frame cost is computed at full precision. Rounding to cents happens once, at the invoice or statement line, using half-even rounding (a value exactly halfway rounds to the nearest even cent). Tool calls with a declared price get the same record. Rollups (`cost.run_totals`, `cost.daily_totals` by agent, workspace, org, model, provider key) are derived indexes in Postgres. They are rebuilt from frames on demand.

### 12.5 Budgets

> **Status of this section (2026-09-18).** No budget is enforced on a wrapped run today. Every bundle carries `budget.mode = "observed"` (`packages/handlers/src/lib/tacho-host.ts:275`), and nothing reads `session_limit_usd`. Enforcement arrives with the gateway in Phase 4 (§17.2).

Budgets live in `billing.spend_budgets`. Each budget belongs to an organization, workspace, operator, or agent, and has a period and a hard or soft mode. A hard budget is enforced where the money is spent: at the gateway's loopback proxy, before the model call. The bundle carries the limit (`session_limit_usd` for the run, and the running counters the recorder keeps in Postgres for the wider scopes), and the proxy refuses the next call once the limit is reached. A breach is a `policy.decision` frame and, by policy, a pause. The claim carries its scope: a budget is enforced for model traffic routed through Oxagen. At the `harness` tier a budget is a recorded number and a notice in steering, never a stop. Only at the `contained` tier can the agent not spend around it.

### 12.6 Token accounting on every model call

Providers name token classes differently. The cost record normalizes them once, at the gateway's proxy or the collector, into a fixed set. Every downstream number derives from these fields and nothing else:

| Field | Meaning | Anthropic | OpenAI | Gemini | OpenRouter |
|---|---|---|---|---|---|
| `input_uncached` | prompt tokens processed fresh | `input_tokens` | `prompt_tokens − cached_tokens` | `promptTokenCount − cachedContentTokenCount` | native usage passed through |
| `cache_read` | prompt tokens served from cache | `cache_read_input_tokens` | `prompt_tokens_details.cached_tokens` | `cachedContentTokenCount` | native |
| `cache_write_5m`, `cache_write_1h` | prompt tokens written to cache, by TTL | `cache_creation.ephemeral_5m/1h_input_tokens` | n/a (implicit) | explicit cache create calls | native |
| `output` | completion tokens excluding reasoning | `output_tokens` | `completion_tokens − reasoning_tokens` | `candidatesTokenCount` | native |
| `reasoning` | thinking or reasoning tokens | `thinking` blocks (counted in output, split when reported) | `completion_tokens_details.reasoning_tokens` | `thoughtsTokenCount` | native |
| `server_tool_requests` | provider-side tool uses priced per request | `server_tool_use.web_search_requests` | built-in tool calls | grounding requests | native |
| `tool_definition_tokens` | tokens spent on the tool list in the prompt | measured by Oxagen from the request | same | same | same |
| `context_frame_tokens` | tokens of context frames Oxagen injected, by protocol accounting | measured | same | same | same |
| `steering_tokens` | tokens of injected steering | measured | same | same | same |

Every field is an integer. Absent classes are zero, never null. When a provider reports a class Oxagen does not know, the record stores it under `unmapped` with the raw name. That class is priced at zero with `cost_basis: estimated_unknown_class`, so the gap stays visible. From these fields, each model call carries the derived metrics customers actually look at:

- **Cache hit rate** `= cache_read / (input_uncached + cache_read)`.
- **Cache write cost share** `= cost(cache_write) / cost(model call)`. This is high when a prefix is written and never read again.
- **Effective input price** `= cost(all input classes) / (input_uncached + cache_read)`, per million.
- **Prompt composition**: the shares of the prompt spent on tool definitions, context frames, steering, and conversation, from the measured fields.
- **Latency**: time to first token, total duration, retries, and the provider error that caused each retry.
- **Provider request id and concrete model id**, so a cost record can be traced to the provider's own log.

**Every spend number carries its basis: `observed` or `self-reported`.** Observed means the gateway's proxy counted it from the bytes that passed through it. Self-reported means the harness's own telemetry said so. Status 2026-09-18: no proxy exists, so every number for a wrapped agent is self-reported. Claude Code reports tokens and cost. Codex and Stella export none, so their spend is absent from the record, and a page must say absent, never zero. Phase 4 makes metering observed for every harness (§17.2).

Client-attested model calls (harness telemetry rather than the proxy) carry the same fields where the harness reports them. The fields the harness does not report are marked as gaps. A cache hit rate over a mixed fleet is therefore never computed from missing data as if it were zero.

### 12.7 Attribution: from a frame to the operator

Every cost record hangs on a frame. Every frame knows its step, turn, run, agent, operator, workspace, and organization. Attribution is therefore a rollup along the hierarchy in §3. Every level adds these keys: model, provider, provider key, funding source, tool (for tool calls), repository, and task reference.

| Level | What is reported | Materialized in |
|---|---|---|
| Model call | usage by class, cost, cache metrics, latency, retries | the frame |
| Tool call | validation result, duration, declared price, side-effect class, approval | the frame |
| Step | one of the above | derived |
| Turn | steps, spend, tokens by class, cache hit rate, prompt composition, outcome of the turn | `cost.turn_totals` |
| Run | turns, spend, tokens, cache hit rate, tool calls by result, proof, productive ratio, enforcement tier, replay grade | `cost.run_totals` |
| Agent | runs, spend, proven spend, productive ratio, spend per proven run, trend | `cost.daily_totals` by agent |
| Operator | agents, runs, spend, proven spend, productive ratio, budget position | `cost.daily_totals` by operator |
| Workspace and organization | the same, plus by model, provider key, repository, task | `cost.daily_totals` |

Rollups are derived indexes rebuilt from frames. The frame is the record. An operator's number is the sum of their agents' runs. An agent's number is the sum of its runs. Nothing is attributed to a level that a frame cannot reach. When a run has no operator recorded (a client-attested run that arrived without one), it is attributed to the agent's owning operator and flagged. It is never dropped or spread.

### 12.8 Value: how much of the money turned into progress

Customers pay for tokens. They want to know what the tokens bought. Oxagen answers with three measures per run, rolled up along the same hierarchy. All three are computed from frames, and none from a model's opinion of itself:

1. **Proven spend.** Spend on runs whose witness verdict is `flipped` (§8.5). Runs whose outcome a human verified without a witness (an approval, a merged PR, a closed task) are reported separately as *accepted*. They are never folded into proven. Everything else is unproven spend, split into *completed but unverified*, *cancelled or halted*, and *failed*.
2. **Productive ratio.** Per run, the share of steps that advanced the task. Where the run came through Stella, Stella's step-grading ladder grades the steps. Elsewhere a deterministic rubric grades them: a tool call that produced a side effect the run kept, a model call whose output led to a kept side effect, or a read whose result was later cited. Repeated identical tool calls, calls denied by policy, retries after provider errors, and steps after a halt are unproductive by definition. This measure is carried from the wrapper design corpus, where it is already specified.
3. **Spend per proven run** and its trend, per agent and per operator. A team can see whether an agent is getting cheaper at producing verified work.

**Where to optimize.** The **findings** job runs beside the recorder. Findings are specific, costed problems an operator can act on. The job runs after each seal and writes `cost.findings` rows. Each row carries the frames that prove it and the money at stake:

| Finding | Detected from | What it tells the operator |
|---|---|---|
| Cache misses after a stable prefix changed | system-context digest differs between consecutive turns while conversation prefix is unchanged | which configuration change (steering publish, tool list change, model switch) invalidated the cache, and its cost |
| Cache writes never read | `cache_write` > 0 on a run's last turn, or a write with no later read in the TTL | shorten the prefix, or stop writing cache for one-turn runs |
| Tool-list bloat | `tool_definition_tokens` above the workspace median for the agent's grants | narrow the agent's grants, listing the exact tools never called in the last N runs |
| Context bloat | `context_frame_tokens` above budget norm with low citation rate (from `context_use_feedback`) | lower the context budget or tighten the retrieval kinds |
| Retry storms | consecutive provider errors with retries in one turn | provider or key health, and the cost of the retries |
| Duplicate tool calls | same tool version and input digest twice in a run | a steering record candidate ("do not re-read X"), opened as a proposal |
| Unproductive tail | steps after the last productive step exceed a threshold | budget or stop rules for the agent |
| Wrong tier | a run whose steps were all classification-shaped on a flagship model, or a proven run on a light model at high retry | model routing per agent |
| Budget headroom | an operator or agent consistently below or above budget | resize the budget |

Each finding names the level it applies to (run, agent, operator, workspace) and the estimated saving in micro-USD from the frames it cites. Findings are ranked by money at stake, and the Spend page leads with them.

### 12.9 Reports and statements

- **Operator view.** For one operator: their agents, runs, spend by model and provider, proven spend, productive ratio, budget position, and their findings. This is the report a team lead reads.
- **Agent view.** For one agent across operators: the same, plus spend per proven run over time and the tool-call mix.
- **Run waterfall.** For one run: turns as bars, steps inside them, cost accumulating left to right, cache hit rate per turn, the proof frame marked, and findings pinned to the frames that caused them.
- **Monthly statement** per workspace and organization: spend by operator, agent, model, provider key, and task. Proven versus unproven. Exported as CSV and as a signed PDF.
- **API and MCP** expose the same rollups, so a customer can pull attribution into their own FinOps tooling. Every number carries its basis (`gateway_observed`, `client_attested`, `estimated`).

### 12.10 Billing decisions of 2026-09-15

Maintainer decisions, dated 2026-09-15. They bind the two meters of §12.1 as `macanderson/oxagen` builds them: for governed actions, a monthly GAU allowance, prepaid GAU blocks with auto top-up, and invoice billing for approved organizations; for in-app AI usage, usage credits. §12.1 and this table carry one set of terms. Each row states the behaviour the build ships.

| # | Decision | Lands in |
|---|---|---|
| 17 | Oxagen charges on two meters (2026-09-15). Governed actions are priced in GAUs on the price list of §12.1. In-app AI usage, the in-app agent's model calls, is priced in usage credits: 1 credit = $0.01, debited by the credit gate at provider cost times the meter markup (`packages/billing/src/pricing.ts`), funded by the $5 signup grant on `create_org` and topped up with credit packs (`purchase_credits`). Tokens are not passed through at cost. | §0 rows 1 and 12, §4.4, §12.1, Billing page |
| Reaffirmed | The GAU pricing of 2026-09-14 is the governed-action price list (§12.1). Proven spend is a report figure and carries no price. | §0 row 12, §12.1, §18, Billing page |
| 2 | Credit packs top up the usage-credit meter, and `purchase_credits` is not retired. The signup grant funds that meter, and credits pay for in-app AI usage at provider cost times the meter markup (row 17). GAU blocks remain the governed-action product. | Billing page, App. E |
| 3 | Enterprise is negotiated only: a `billing.contract_terms` row. `enterprise-v2` is removed from `SUBSCRIPTION_PLANS` and from Stripe. No feature is gated on the enterprise license; every feature, IAM and SOC 2 controls included, is on for every tier. | §6.3, §12.1, App. A.6, App. A.8, Billing page |
| 5 | When invoice billing is switched off for an organization, its `overage_invoiced_gau` is added to `purchased_gau`. The invoice is the purchase. | Billing page |
| 6 | `invoice_gau_max` bounds overage beyond the monthly allowance. The interim invoice fires at unit `invoice_gau_max` + 1. | Billing page |
| 7 | Rev1 keeps an in-app Build and Scale upgrade through Stripe Checkout, so `start_subscription_upgrade` stays. `get_rate_card`, `preview_action_cost` and `get_evidence_retention` retire at cutover. | §14, App. E, Billing page |
| 12 | An invoice-billed organization is suspended 5 days after an invoice is past due. Metering continues while it is suspended. Paying the full outstanding balance reactivates it. | App. A.2, Billing page |

---

## 13. Audit, retention, and the fidelity call

### 13.1 The call

**Keep everything, at full fidelity, for seven years, and make it cheap by writing it once.**

- Every frame's body (prompts, completions, tool input and output, steering, context frames) is retained as an encrypted, content-addressed object from the moment it is recorded. This applies where Oxagen is in the path of the body. A wrapped agent's model calls are the exception, and §13.6 is the rule for them. The retention clock runs seven years from the seal by default. Organizations may set a longer period.
- `digest_only` mode is an opt-down per workspace for customers who cannot store prompt content. The system records it as a completeness gap, and it lowers the replay grade. It is not the default. Replay without bodies grades `inspect`, not `view` (§8.4). That grade gives a chain that can be audited, not a run that can be read. The product's explanation promise depends on bodies.
- The run ledger is retained forever. It holds the run, attempt, seal, attestation (a signed statement that vouches for a seal), and frame metadata with digests and costs.

Seven years is a customer procurement requirement more than a requirement of SOC 2, a security audit standard. SOC 2 itself does not fix a number. The current codebase claims seven years for a Postgres security-event table, while the trace tables expire in a year or less. This spec removes that contradiction with one policy applied to the whole run record.

### 13.2 Cost of the call

Order-of-magnitude figures for the deck's reference customer (fifty agents, five runs per agent per day):

| Quantity | Value |
|---|---|
| Runs per month | 5,000 |
| Frames per run (typical) | 100 to 400 |
| Body bytes per run, compressed | 0.3 to 1 MB |
| Archive growth per month | 1.5 to 5 GB |
| Seven-year archive | 130 to 420 GB |
| Cold storage at roughly a tenth of a cent per GB-month | under $1 per month |
| Frame rows in the hot table over the thirteen-month hot window (the period frames stay there) | 6 to 25 million |

The hot table, not the archive, is the cost that needs a window. That is why frame rows are compacted (§13.3), meaning removed from the hot table once the segment holds them. Bodies are never moved.

### 13.3 Tiers

| Tier | Where | What | Retention |
|---|---|---|---|
| Ledger | Postgres | runs, attempts, seals, attestation, counts, cost, tier, gaps | forever |
| Frames | Postgres, partitioned by month | frame rows with digests, cost, policy decisions | hot window, default 13 months, then compacted into the segment |
| Bodies and segments | Object storage, write-once (data cannot be changed once written) | encrypted bodies and a per-seal archive segment: frame envelopes as NDJSON, a Merkle root (one hash that covers every frame), and an attestation | 7 years default |
| Control-plane audit | Postgres | admin actions, IAM changes, repo bindings, plane changes, key rotations | 7 years |

The archive segment is written **at seal time**. It is never a later copy of the hot table. It is the same bytes the recorder indexed, written once. Compaction removes frame rows and leaves the run row with `frame_count`, `merkle_root`, `segment_ref`, and the rollups. Render replay of a compacted run reads the segment.

### 13.4 Object storage

Each data plane gets its own buckets with object lock, a storage setting that blocks deletion. The lock runs in compliance mode, so no one, not even an admin, can lift it early. Retention is set per object from the organization's policy. Each organization has its own key-encryption key, and each object has its own data key. Exports produce a verifiable bundle: segments, attestations, key ids, and a verifier script. Legal holds were cut by the scope review; the retention clock is the organization's policy and nothing in the product shortens it.

### 13.5 Personal data

Redaction detectors run before write, so personal data does not enter a body in the first place, and the archive has no edit path. A GDPR erasure request (the EU privacy law's right to be forgotten) is handled by support against the retention policy and the redaction record. Crypto-shredding (a per-subject data key destroyed on request, with a tombstone frame keeping the chain verifiable) was cut by the scope review and waits for the customer who blocks on it.

### 13.6 Bodies and the gateway (2026-09-18)

§13.1 says every frame's body is retained. ADR-094 says prompt bodies never leave the machine, and only digests and usage go up. Both hold, because they are about different frames. The rule:

- **Model-call frames from the gateway carry digests and usage only, never bodies.** A `model.request` or `model.response` frame written by the loopback proxy (Phase 4) holds `content.digest`, sizes, the model, the token classes and the cost basis `observed`. It has no `bytes_ref`, and no prompt or completion body is sent to Oxagen's servers. The `steering.manifest` frame is the same: ids, hashes and digests only (§8.2).
- **What hook-tier frames carry today is unchanged.** Hook payloads are digest-first: `tool_input` and `tool_response` are hashed and size-counted at the collector. Raw retention is a per-workspace policy, off by default, and when it is on the bytes pass the collector's redaction detectors before they are encrypted (the Tacho spec §5.4, ADR-058). Phase 4 adds no body to any frame and removes none.
- **§13.1's full bodies apply where Oxagen is itself in the path of the body:** the in-app agent's model calls through Oxagen's own model layer (§4.5), and tool calls that reach the server-side tool gateway.
- **The replay grade follows.** A wrapped run's model frames grade `inspect` (§8.4): a chain that can be audited, not a run that can be read. The record lists it as a completeness gap, the same way `digest_only` does, and no page claims more for a wrapped agent than its frames hold.

ADR-094 decides the first bullet. It does not speak to the other three. They are this specification's reading of it, written so that nothing built today changes.

## 14. Mission Control

Mission Control has nine pages: six at workspace scope and three at organization scope. No other pages ship in v1. Appendix F maps every current route onto these nine. Approvals are not a page of their own. They appear as a panel on Fleet and as a strip on Run, because an approval is always about a run.

| Screen | Job | Primary actions |
|---|---|---|
| **Fleet** | Every run, live and recent, with its enforcement tier, replay grade, verdict, definition-of-done state, cost so far, and pending approvals and signatures | pause, resume, cancel, open |
| **Run** | A frame-by-frame player for one run. It shows the transcript at three zoom levels (turns, steps, everything) under a transport, the playback controls (scrub, step, play, pause, ×1 to ×4). It also shows what the agent was told, each model exchange, tool calls with their validation results, policy decisions, proof, the definition of done (the verdict, the certificate, the checks and every Stop, §8.6), a cost strip, and chain status | steer (with a delivery mode), pause, cancel, approve, sign a human check, fork replay, bisect, export |
| *(panel on Fleet and Run)* **Approvals** | The queue. Each item shows its four-hop chain, the four links behind a request (who asked, which agent, which action, which rule) | approve, deny, add reason |
| **Agents** | Each agent's identity, run credential, roles, its toolbelt (the tools it may call, with schemas and per-tool decision rules), the mandates it holds, budgets, enrollment status, and tamper incidents | register, enroll, revoke, grant, set budget, request mandate |
| **Tools** | The registry (servers, tools, versions, schemas, safety classification), approval rules and auto-approval conditions, connections and their owners, credential grants, the mandates ledger, policy versions with their tests, and kill switches | import server, approve observed schema, add connection, grant mandate, edit policy, flip a switch |
| **Steering** | The hub for everything that can steer. Tabs, in this order: **Records**, **Skills**, **Memory**, **Ontology**, **Policy**, **Proposals**, **Preview** (§10.7). Preview: pick an agent and a prompt, and see exactly what would be injected, what was cut, and why. Skills and Ontology have no top-level navigation entry of their own (2026-09-18). Status: the hub is Phase 2 of §17.2. Today the page lists records, proposals and Context PRs | open Context PR, review, add a skill, retire a memory, preview an agent's steering |
| **Spend** | Findings ranked by the money at stake. Cost by operator, agent, model, provider key, and task. Proven spend versus unproven spend, and the productive ratio. Cache hit rate. Wasted spend. Budgets | act on a finding, set budget, export statement |
| *(org)* **Organization** | People, roles, invitations, workspaces, model funding and routes, the data plane, and API keys | invite, change role, create workspace (an in-app form, rev1), set funding, set route, create, rotate and revoke an API key (rotation ships in rev1) |
| *(org)* **Billing** | The plan, GAU used against the month's allowance, blocks and auto top-up, the contracted rate, the in-app agent's credits, and invoices (§12.1) | change plan (Build or Scale through Stripe Checkout, §12.10), buy GAU blocks, set auto top-up, buy credit packs for the in-app agent |
| *(org)* **Audit** | Control-plane audit events, incidents, receipts, exports, keys, and retention | export, rotate |

Interaction rules: every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger. Every number that is money shows its basis. Every explanation is a chain of links to frames, records, and commits, not a summary.

### 14.1 Surfaces

One agent tool contract drives all four surfaces: the API, MCP (Model Context Protocol, the standard way agents connect to tools), the CLI (the command-line tool), and the UI. The manifest gate that exists today checks that the four stay in parity. The CLI is thin: `oxagen login`, `oxagen agent enroll|status|unenroll`, `oxagen agent register`, `oxagen run list|show|export`, and `oxagen context propose` (which delegates to Stella when Stella is present), and `oxagen dod hook|new|lock|run|sign|status` (§8.6).

---

## 15. Non-functional requirements

| Area | Requirement |
|---|---|
| Gateway latency (target, Phase 4) | The loopback model proxy adds ≤ 30 ms at p50 (the typical request) and ≤ 100 ms at p99 (the slowest 1 in 100 requests) before the first byte. Streaming passes straight through. Tool gateway validation takes ≤ 20 ms at p99 for schemas under 64 KB |
| Fail behavior | Enforcement seams fail **closed**, meaning a missing policy blocks the call. Telemetry seams fail **open**, meaning the call proceeds and the gap is recorded. Recorder backpressure never blocks an agent. The recorder spools instead |
| Availability | Gateway and control channel: 99.9%. Mission Control: 99.5%. The recorder delivers at-least-once (a frame may arrive more than once but is not dropped), with idempotent frame ids so a repeat is stored only once |
| Throughput | 2,000 frames per second per organization, sustained, on the shared plane. Graph writes are batched |
| Isolation | No store can express a query that crosses organizations. A nightly cross-tenant probe on every store verifies this |
| Security | All credentials are hashed or KMS-enveloped (encrypted under a key management service key). Run tokens last ≤ 15 min. Bundle and attestation keys rotate with published validity windows. Secret scanning runs on tool arguments and record bodies |
| Compliance | SOC 2 Type II controls map to the audit tiers. Data residency is set per data plane. Personal data is redacted before write (§13.5) |
| Conformance | Provider conformance and lifecycle fixtures (shared test cases that check an implementation follows the protocol) from the protocol repo run in CI, pinned by commit |
| Currency | Every price entry and cost record carries its currency. The value of record is the provider's billing currency. Conversions use a dated rate table (`cost.fx_rates`), at the frame's time for display and at the statement's time for the monthly statement. Every converted number carries its rate and source. An organization has a display currency and a billing currency, chosen from the set Stripe supports. Mandates are compared in their own currency. The wedge is USD only. The model is built in from the first release |
| Language | No prose is hard-coded. Every string the interface shows lives in a message catalog keyed by a stable message id, in ICU MessageFormat (a standard format for translatable strings with plurals and variables). There is one catalog per locale, with English as the source. Locale is negotiated per person, profile first, then browser. Dates, numbers, currencies, and units format by locale. Layout supports right-to-left (scripts that read from right to left) from the first release. Prose the models generate (findings, explanations, rationales, assistant replies) is generated in the operator's locale and recorded on the frame. Steering records keep their language with a tag. Machine-readable fields in records, receipts, and exports are never translated. The wedge is English only. The first additional locales land in Series A |
| Deployment | The same containers run in Oxagen's cloud and behind a customer's firewall (§4.6). There is no fork |

---

## 16. Carry over, leave behind

This table lists what carries over from the current `oxagen` repository (and its `oxagen-platform` ancestor) and what stays behind:

| Carry over (design and often code) | Leave behind |
|---|---|
| The kernel (the core that runs every call) and its `invoke()` pipeline, the registry, verb-first naming, and the manifest and parity gates. One rename: contracts and agent tools are both called agent tools now | 229 contracts. 68 agent tools in the wedge and 86 for the full product, listed in Appendix E |
| Tenancy seams (`runInTenantScope`, `withTenantDb`), the RLS manifest generator (RLS is row-level security, Postgres rules that hide one tenant's rows from another), and the startup guards | `app.rls_bypass`, six policy classes, and nullable-workspace tables |
| The organization and workspace model, immutable namespaces, and the Better Auth binding | About 110 tables across 20 schemas. 51 tables in 10 schemas remain, listed with their columns in Appendix A |
| IAM principals (IAM is identity and access management, the rules for who may do what), the delegation ceiling, resource-scope ceilings, and the three live resolver rules | Dead condition language, and the enterprise-tier "allow everything" bypass |
| The wrapper (today's tacho package) and its parts: enrollment, device keys, the collector, hooks, the policy bundle, commands, approval tokens, incident kinds, and the event vocabulary | ClickHouse `tacho_events`, and all of ClickHouse |
| The run ledger invariants, the rules that must always hold: dense seq, digest chain, seal fence, and one-shot finalization | Postgres as the run store. The store is the hot table plus segments |
| The run-evidence protocol consumer, pinned fixtures, and SDK types with a Zod drift check | Vendored protocol drafts |
| The two-axis memory concepts: confidence versus enforcement, decay, and citation pressure | The `engram` package, the `rules` engine, and the `:AgentMemory` label. Records replace them |
| The GitHub App and its repository-linking flow | The workspace schema registry entirely: its validation, versions, pin, diff, and export layout, the `schema_registry.*` Postgres tables, and the connectors and ingestion validation that fed it (§11) |
| The crypto envelope (envelope encryption: a data key encrypts the content, and a master key encrypts that data key), the storage adapter, and notifications | The `content`, `cms`, `workflow`, `eval`, `environments`, `plugin`, and `mcp` registry tables |
| The GAU billing of ADR-055 (§12.1): plans and negotiated contract terms, monthly GAU buckets and the settlement ledger, auto top-up and invoice billing, credits for the in-app agent, the Stripe invoice mirror, and spend budgets (App. A.8) | The rate card tools (`get_rate_card`, `preview_action_cost`, `get_evidence_retention` retire at cutover), reseller tables, and spend dashboards as a revenue line |
| Data planes (ADR-042) | Per-store singletons |
| The model layer of ADR-053: one funding source per organization, keys enveloped and never returned, every call a frame. The in-app agent that ADR-053 also described carries over, opening as a flyout from the sidebar (§4.4) | Running a customer's agent loop inside Oxagen's own process |
| The web-app 2.0 information architecture (workspace, org, and account scopes) | 70 page files. Ten pages remain, mapped in Appendix F |

The target Postgres schemas are `auth`, `org`, `wrk`, `iam`, `tools`, `prices`, `cost`, `billing`, `control` (commands, approvals, archive manifests, and audit), `dod`, and the run record's `run`, `ctx` and `code`. Everything else is gone.

---
## 17. Delivery plan

Each milestone has an acceptance test that a customer could run.

> **Status of this section (2026-09-18).** The milestones are the original build order. Where M1 and M2 name the model proxy, run tokens and budgets, and where M3 names steering delivery, none of that is built on oxagen `main` at `02278c913`. §17.2 is the approved path that delivers them, and it says where each of its six phases sits against these milestones. The scope review of 2026-09-14 pulled the ontology and the audit-archive milestones out of the middle of the plan and moved the proof to the front of what remained; the definition of done, which gates the proof, sits beside it. The plan is about fifteen weeks, not twenty-four.

| Milestone | Delivers | Accepted when |
|---|---|---|
| **M0 Foundations** (weeks 1–4) | The repo, the kernel, tenancy, RLS (row-level security) with role-based system access, org and workspace creation including repo binding, IAM, and the tool registry. | A cross-tenant probe (a test that tries to reach one tenant's data from another tenant) finds nothing. A workspace cannot be created without a main repo. A second repo can be linked and unlinked. |
| **M1 Gateway** (weeks 3–8) | The model proxy. The tool gateway with schema validation. Run tokens. Frames, chain, seal, and attestation in Postgres. The Fleet and Run pages with render replay. The model layer with OpenRouter routes and funding sources. The three-step onboarding gate and the installers. | The gateway wraps Stella and Claude Code. A run can be halted mid-loop from the UI. An exported run can be verified offline. A new organization reaches Fleet with its own first run in under a minute. |
| **M2 Control** (weeks 7–11) | Bundles, commands, approvals with tokens, and budgets. The full call pipeline with taint and receipts. The credential broker with at least token exchange and restricted keys. Mandates and the ledger. Kill switches. Cedar policy with tests. The Tools page. Cost records with normalized token classes, the price book, and rollups to operator level. The findings job and the Spend page. | A consequential call that exceeds its mandate is denied, and the ledger does not change. An approval token cannot be replayed. A finding's saving reproduces from the frames it cites. |
| **M3 Done** (weeks 9–13) | The definition of done, in its five gated phases (§8.6, `dod-spec.md`): the language; the harness and CLI; the cloud (contracts, handlers, tables, routes, the `dod.held` governed action, signing); drafting and holdouts; humans and templates. | In this repository, a scripted Claude Code session with the prompt "add a failing test, then make it pass" is blocked once with `CHECK_FAILED` and allowed on the second stop with HELD; the certificate's stream digest equals the sealed attempt's; a governed action `dod.held` is in the ledger; an agent that satisfies the visible set by editing tests is rejected by a hidden check; a PENDING run becomes HELD after a signature. |
| **M4 Prove** (weeks 11–15) | The witness runner. The witness author, with the test-flip and build oracles first. The airlock at `L0`. Tamper exclusion, proof stamping, proven spend in the Spend page, and the witness as a dod check. | A witness the agent never saw proves a PR opened by a wrapped agent. The agent's frames contain only pass or fail. A PR that edits the test harness is recorded as tampered and its dod is BROKEN. The proof verifies offline. |
| **M5 Teach** (weeks 12–15) | The records endpoint, the reflector, the promoter, Context PRs through the GitHub App, and steering delivery. | An agent learns something. The lesson becomes a Context PR. Merging it changes the next run's context, and the frame shows the change. |

Retired from the plan: **Ground** (the knowledge graph, the ontology engine, connectors and embeddings; §11 keeps the code graph only) and **Audit** as a milestone of its own (the archive segment written at seal is in M1 because the chain depends on it; holds, crypto-shredding and provider reconciliation are cut).

### 17.1 Three phases

The milestones above are the build order. The phases below are the business order. Each phase has a trigger that ends it, and the phases match the positioning deck.

| Phase | What ships | Trigger to leave |
|---|---|---|
| **The wedge** | Tenancy and identity. The gateway (the model proxy, the tool gateway, wrapping for Stella, Claude Code, Codex, and SDK agents, and one-click installers on three platforms). The toolbelt with approvals, mandates, and kill switches. Runs and frames with render replay. Main and linked repos. Records, Context PRs, and agent definitions in git. Spend accounted to the operator, with findings. The GitHub link with issues and the code graph. The definition of done. GAU billing (§12.1). The witness runner with the test-flip oracle. The free tier and gated onboarding. Milestones M0 to M5. | Customer 1 in production and paying. Five paying accounts opens the next phase. |
| **Series A** | What a Fortune 500 security review asks for, and only when one asks. More oracles for the witness. Dedicated data planes and running behind the firewall (§4.6). SSO and SCIM. Two-person mandates. Legal holds and crypto-shredding. Provider reconciliation. A replay tier for the definition of done that re-executes checks in a cloud sandbox. Outbound events (§7.7) and agent messaging (§7.6). Fork replay and bisect. Multicurrency and the first non-English locales. | Renewal of the first annual contracts. |
| **Dominate** | The in-firewall installer for owned models. Sovereign and regional planes. A public registry of conformant providers and tool servers. Agent definitions, dod templates and policy packs shared across organizations and by industry. Federation between organizations. Further locales. | None. Growth. |

The wedge ends when Customer 1 is in production, not on a date. M4 produces the labeled runs that the Series A training pipeline consumes, and M3 produces the certificates that say which of them were done.

### 17.2 The steering and gateway refactor path (2026-09-18)

The review of 2026-09-18 found that the design of §4.2, §7 and §10.4 was right and the code had diverged from it: on `main`, almost nothing reaches a wrapped agent. The maintainer approved its refactor path in full on 2026-09-18. It is six phases. Each ships alone and is useful alone. The implementation plan carries each phase's scope, seam, files and dependencies. This table is the summary.

| Phase | Name | What ships | Done when | Sits against the milestones |
|---|---|---|---|---|
| **0** | Make one record steer one agent | Active records with `force` of `must` or `should` are compiled into `context.system` in `unsignedBundle`. Issue #2592 is reopened against this seam. In review as oxagen PR #3289 (ADR-091). **New governance ceremony is frozen until this lands** | A merged record changes what a wrapped Claude Code run is told at `SessionStart`, and the run's `oxagen.context_digest` shows it | The missing half of M3's acceptance test ("merging it changes the next run's context") |
| **1** | One type, one assembler | `SteeringItem`, `assembleSteering`, the source adapters, the index port on Postgres, `UserPromptSubmit` wired with a tight timeout and fail open, precedence fixed, the two publish paths collapsed, the in-app agent on the same assembler, `packages/engram` deleted or folded in (§10.5) | Every run carries a `steering.manifest` frame, and one function produces what both the wrapped agent and the in-app agent are told | Completes M3's steering delivery |
| **2** | One screen | Steering becomes the hub with its seven tabs: Records, Skills, Memory, Ontology, Policy, Proposals, Preview. Skills become governed files delivered by sync (§10.6, §10.7) | Preview shows, for an agent and a prompt, exactly what would be injected, what was cut, and why | §14. Replaces the separate Skills page |
| **3** | The graph becomes the index | Every item is projected as a `:Record` node with `ABOUT` edges, one direction registry to graph, verified by hash. The assembler's relevance stage moves to the graph, with Postgres as the fallback behind the same port | With the knowledge graph on by default, the volatile selection prefers items about the files and entities a run touches, and turning Neo4j off changes ranking only, never delivery | The steering half of M4. It waits for the knowledge graph to be on by default |
| **4** | The gateway | `tachod` gains the loopback model proxy (Anthropic Messages and OpenAI Responses passthrough with streaming, enrollment writes the base URL) and the MCP aggregator (displace-and-restore). Metering becomes observed. `session_limit_usd` is enforced. Per-turn volatile injection re-lands at the proxy. `interrupt` becomes real. Bundle permissions are filled from the gate compilation | A wrapped run earns the word `gateway`, its spend is observed for Claude Code, Codex and Stella alike, and a breached session budget stops the next model call | Delivers what M1 and M2 call the model proxy, run tokens and budgets |
| **5** | The contained tier | `oxagen run -- <agent>` launches the agent under an OS sandbox with egress limited to the gateway. CI, headless runs, cloud runners and managed devices first, never mandatory on a developer's laptop. `contained` becomes the top word of the ladder. The witness runner (ADR-064) is built on the same launcher | A run under the launcher cannot reach a model or a tool server except through the gateway, and its tier reads `contained` | Precedes M6, whose witness runner uses the launcher |

**Build order (2026-09-18).** The phase names and numbers do not change. Only the order of build does: Phase 0 is in review, Phase 4 is in build now in parallel with it, then Phases 1, 2, 3 and 5. The epic is oxagen issue #3295. `main` stays as §7.1 and §10.4 describe it until those branches merge.

| Phase | Issue (macanderson/oxagen) | State at 2026-09-18 | ADR |
|---|---|---|---|
| **0** | #2592 (reopened, P0) | In review: oxagen PR #3289, branch `steering/phase0-one-record-steers` | ADR-091 |
| **4** | #3299 (P0), with the desktop review #3301 | In build. Branch `gateway-model-proxy`: the loopback model proxy in `tachod`, enrollment writes the base URLs, observed metering, the enforced `session_limit_usd`, real `interrupt`, and the seam for per-turn injection. Branch `desktop-install-hardening`: a line-by-line bug review of `apps/desktop`, install and uninstall fixed and proven against a temp-HOME snapshot rig, and the installer updated for the gateway | ADR-094, ADR-095 |
| **1** | #3296 | Next after Phase 4 | ADR-093, ADR-097 |
| **2** | #3297 | After Phase 1 | ADR-097 §5, ADR-093 §6 |
| **3** | #3298 | After Phase 1, and when the knowledge graph is on by default | ADR-093 §5 |
| **5** | #3300 | After Phase 4 | ADR-096, ADR-095 |

Two parts of Phase 4 wait for Phase 1, because Phase 1 writes what they carry. Per-turn volatile injection at the proxy lands when the Phase 1 assembler exists, and the proxy ships the seam for it (ADR-094). Bundle permissions are filled from the second compilation, which Phase 1 writes (ADR-097 §3).

The review's defects are filed on their own: #3302 (the `publish_context_record` path leaves `kind` and `force` NULL), #3303 (`additionalInstructions` is unbudgeted and never checked against a rule), #3304 (Codex and Stella spend is absent) and #3305 (the public decks describe the removed runtime).

**Decided 2026-09-18: subscription logins pass through the proxy.** Both OpenAI and Anthropic work through a base URL proxy, subscription logins included, and neither vendor's terms explicitly forbid it: validated by the maintainer on 2026-09-18 (ADR-094). The review listed this as its one unverified risk. It is closed, and it does not gate Phase 4.

## 18. Risks and open decisions

| Item | Position | What would change it |
|---|---|---|
| Frame write throughput | Batched writes into a month-partitioned hot table, then compaction | If a customer exceeds 2,000 frames/s, add a per-org ingest partition. Never add a second store of truth |
| Claude Code and Codex model calls | From Phase 4, enrollment points the harness's base URL at the loopback proxy in `tachod`, which earns the `gateway` tier for model calls. No proxy exists on `main` at 2026-09-18, and Phase 4 is in build (oxagen issue #3299) | If a harness cannot point at the proxy, the run gets the `harness` tier and the record says so |
| **Decided 2026-09-18: subscription logins through a base URL proxy** | Closed. Both OpenAI and Anthropic work through a base URL proxy, subscription logins included, and neither vendor's terms explicitly forbid it: validated by the maintainer on 2026-09-18 (ADR-094). It was the review's one unverified risk, and it does not gate Phase 4 (§17.2) | A vendor changing its terms or its login flow. A host whose harness cannot be pointed at the proxy stays at the `harness` tier and the record says so |
| Sandbox scope | The sandbox is the top tier, not the only tier, and hooks stay. `oxagen run -- <agent>` targets CI, headless runs, cloud runners and managed devices first | It is never made mandatory on a developer's own laptop. A customer who asks for that gets managed settings and the `gateway` tier first |
| Approval tokens | Biscuit v2 as designed (a Biscuit token is a signed token that its holder can narrow without asking the issuer again) | If SDK support in Python or Go lags, fall back to a signed JWT (JSON Web Token) with the same claims |
| Steering format | `.oxagen/rules`, in the context-record TOML format that Stella implements. Stella symlinks to it | The directory name is fixed. If a second agent needs its own path, it gets a symlink the same way Stella does |
| Protocol trace journal | Export a `contextgraph-trace` journal per run and pass its oracles | The journal is a sketch (`0.1`). Pin its fixtures by commit, like the frame fixtures |
| Rolling model aliases | Tiers point at `z-ai/glm-latest` and `z-ai/glm-flash-latest`. Frames record the concrete model, meaning the exact model id behind the alias | If an alias flips to a model with a different price or behavior mid-month, the price book flags it by concrete id. An organization can pin a model |
| Billable unit | The governed action unit: one billable governed action is one GAU, and `resolve_approval` is the only billable governed action (§12.1). Proven spend and held runs are report figures | GAU pricing was set on 2026-09-14 and reaffirmed on 2026-09-15. Making another governed action billable is a maintainer decision, and the price list stays as it is |
| Witness disclosure grain | `L0` (pass or fail only) by default. The disclosure grain is how much detail a witness reveals about a proof. Stella's own default is `L3` for convergence speed | If `L0` measurably slows convergence for a customer, the workspace can raise the grain as a recorded policy decision. The record keeps the grain per proof, so a training set can be filtered by it |
| Witness runner isolation (not built at 2026-09-18, and built on the Phase 5 launcher of §17.2) | A separate execution plane (the witness runs on its own infrastructure), separate credentials, and no path from the worker's run | Any probe from a worker toward witness storage is a denied tool call and an incident. The proof frame carries the runner's attestation, so isolation is verifiable, not asserted |
| Hidden checks | Kept cloud-side at lock time, sent to the harness only from the Stop hook | If a customer's harness cannot reach the cloud at Stop, the run settles with the visible set only and the certificate says so; a hidden check is never assumed to have passed |
| Harness trust | The harness runs the checks on the developer's machine; the certificate warrants the evidence, not the machine | The same trust the run ledger places in the engine build digest. A replay tier that re-executes checks in a cloud sandbox is Series A and a deliberate exception to ADR-043 |
| Behind the firewall | Same containers, a deployment mode flag, air-gapped supported (§4.6), Series A | If a customer needs it in the wedge, the single-node Compose variant is the early path. The Helm chart follows |
| Agent messaging | Agent-to-agent messages are evidence, not instructions. Taint applies (§7.6), so their content is marked untrusted | If customers need agent messages to carry authority, that is a grant on a named sender, never a default |

---
## 19. Demo Wow! Scenarios

Status: `complete` (2026-09-14; W7 was cut with the ontology, the assistant steps of W11 were removed from the mockups, and W14 was added with the definition of done). The in-app agent is in scope (2026-09-14, maintainer decision), and its shell is the sidebar flyout (2026-09-15, §20).

Each scenario is one moment an investor or a customer should remember. The mockups are the app, screen for screen, in the house brand. The prompts that produced them are in `demo-mockup-prompts.md`, beside this document. Every scenario is a guided walk inside `mockups/missioncontrol.html` and a story in the Storybook catalog.

| Id | Wow moment | Pages covered | Mockup | Status |
|---|---|---|---|---|
| W1 | Sixty seconds to governed: sign up, wrap Claude Code with one click, first run on Fleet | sign-in flows, onboarding gate, installer, Fleet (first run), discount offer | [W1 mockup](https://claude.ai/code/artifact/31579436-1abf-48f8-b320-8740c4029b0f) | mocked |
| W2 | Stop it. Steer it.: watch fifty agents, pause one, steer it, see the frame that received it; mass steer with @agents | Fleet, Run (live), messages | [W2 mockup](https://claude.ai/code/artifact/0b3eae2f-4fd9-45a5-b667-e04367999d1d) | mocked |
| W3 | Money asked, a human answered: a mandate-bound payment parks, is approved with the full chain, and the receipt shows the one-call credential | Approvals panel, Run strip, Agents (mandate), Tools (mandates ledger), receipt | [W3 mockup](https://claude.ai/code/artifact/9a8bcd5c-c66c-462d-992a-a449679801ce) | mocked |
| W4 | The flight recorder: a sealed run replayed frame by frame with cost, fork, bisect, export | Run (sealed, compacted) | [W4 mockup](https://claude.ai/code/artifact/a4b69d0b-715c-434c-9f4e-80534bf2e462) | mocked |
| W5 | Proven, not claimed: the witness flipped on main and the PR; the agent saw only "pass". Disclosure model: the worker never runs or sees the witness. A separate witness-runner run authors, fingerprints and runs it; each `verify@1` call from the worker returns the single word pass or fail at grain L0, so the worker fixes its work, not the oracle | Run (proof, chain), witness run, Spend (proven) | [W5 mockup](https://claude.ai/code/artifact/81725124-b936-4cbb-9e40-79089b5a1e35) | mocked |
| W6 | It learned, you approved, it changed: record to proposal to Context PR to merge to the next run | Steering, Run, Agents (definition in git) | [W6 mockup](https://claude.ai/code/artifact/2bbadccb-92ff-4ade-8f6d-704d9c66dafe) | mocked |
| W8 | Every dollar, every operator: proven spend, findings ranked by money, wasted spend, budgets | Spend, Billing | [W8 mockup](https://claude.ai/code/artifact/6a15975f-6719-4b4c-aae5-4b942dea0bb1) | mocked |
| W9 | The toolbelt, governed: only granted tools visible, no credentials held, approval rules and kill switches | Agents, Tools | [W9 mockup](https://claude.ai/code/artifact/c16a2951-1a79-4c70-b202-ec405c0563dc) | mocked |
| W10 | The CIO's console: who can do what, where data lives, what happened, what can be proven, behind the firewall | Organization, Audit | [The CIO's console](https://claude.ai/code/artifact/403166f6-9216-4d23-86ac-bb3c2aa60b23) | mocked |
| W11 | Whose account it is: security, preferences as governed actions, notifications that map to frame kinds, and a command menu that cannot find a tool outside the belt | Account dialog, notifications, command menu | [W11 mockup](https://claude.ai/code/artifact/317226a1-c2ff-43ce-a439-4a54f8b8288b) | mocked |
| W12 | Coverage audit: every page and state mocked | all | [W12 audit](https://claude.ai/code/artifact/45c5e3f9-82f0-404e-ad69-b3279d84c649), [The Ten Pages](https://claude.ai/code/artifact/3fcf949a-c455-4efd-af36-1c2d1f13088e) | mocked |
| W14 | Done means done: the locked set, one blocked stop, a held certificate, the hidden check that caught a gamed run, a signature that turns PENDING into HELD, and held runs reported on Billing | Fleet (Done column, held tile), Run (Done tab), Billing | in `mockups/missioncontrol.html` | mocked |

**Page coverage.** Every row must carry at least one link before the section is complete.

| Page, panel, dialog, or flow | Route | States required | Mockup |
|---|---|---|---|
| Sign up, verify, log in, two-factor, forgot and reset, accept invite, create organization | `(auth)/*`, `(onboarding)/new-organization` | loaded, error, phone | [W1 mockup](https://claude.ai/code/artifact/31579436-1abf-48f8-b320-8740c4029b0f) |
| Onboarding gate (name, wrap, run) and installer screens | `/{org}` before unlock | loaded, waiting, unlocked, phone | [W1 mockup](https://claude.ai/code/artifact/31579436-1abf-48f8-b320-8740c4029b0f) |
| Fleet | `/{org}/{ws}` | loaded, empty (first run), loading, error, denied, phone | [W1 mockup](https://claude.ai/code/artifact/31579436-1abf-48f8-b320-8740c4029b0f), [W2 mockup](https://claude.ai/code/artifact/0b3eae2f-4fd9-45a5-b667-e04367999d1d), [W5 mockup](https://claude.ai/code/artifact/81725124-b936-4cbb-9e40-79089b5a1e35), [W11 mockup](https://claude.ai/code/artifact/317226a1-c2ff-43ce-a439-4a54f8b8288b), [W3 mockup](https://claude.ai/code/artifact/9a8bcd5c-c66c-462d-992a-a449679801ce), [W12 mockup](https://claude.ai/code/artifact/3fcf949a-c455-4efd-af36-1c2d1f13088e) |
| Approvals panel | on Fleet and Run | loaded, empty, phone | [W2 mockup](https://claude.ai/code/artifact/0b3eae2f-4fd9-45a5-b667-e04367999d1d), [W11 mockup](https://claude.ai/code/artifact/317226a1-c2ff-43ce-a439-4a54f8b8288b), [W3 mockup](https://claude.ai/code/artifact/9a8bcd5c-c66c-462d-992a-a449679801ce), [W12 mockup](https://claude.ai/code/artifact/3fcf949a-c455-4efd-af36-1c2d1f13088e) |
| Run (live, sealed, compacted) | `/{org}/{ws}/runs/{run}` | loaded, loading, error, denied, phone | [W2 mockup](https://claude.ai/code/artifact/0b3eae2f-4fd9-45a5-b667-e04367999d1d), [W5 mockup](https://claude.ai/code/artifact/81725124-b936-4cbb-9e40-79089b5a1e35), [W6 mockup](https://claude.ai/code/artifact/2bbadccb-92ff-4ade-8f6d-704d9c66dafe), [W11 mockup](https://claude.ai/code/artifact/317226a1-c2ff-43ce-a439-4a54f8b8288b), [W3 mockup](https://claude.ai/code/artifact/9a8bcd5c-c66c-462d-992a-a449679801ce), [W4 mockup](https://claude.ai/code/artifact/a4b69d0b-715c-434c-9f4e-80534bf2e462), [W12 mockup](https://claude.ai/code/artifact/3fcf949a-c455-4efd-af36-1c2d1f13088e) |
| Agents (list, detail, mandate detail) | `/{org}/{ws}/agents`, `/{agent}` | loaded, empty, error, denied, phone | [W6 mockup](https://claude.ai/code/artifact/2bbadccb-92ff-4ade-8f6d-704d9c66dafe), [W11 mockup](https://claude.ai/code/artifact/317226a1-c2ff-43ce-a439-4a54f8b8288b), [W9](https://claude.ai/code/artifact/c16a2951-1a79-4c70-b202-ec405c0563dc), [W3 mockup](https://claude.ai/code/artifact/9a8bcd5c-c66c-462d-992a-a449679801ce), [W12 mockup](https://claude.ai/code/artifact/3fcf949a-c455-4efd-af36-1c2d1f13088e) |
| Tools (registry, connections, mandates, policy, kill switches, auto-approvals) | `/{org}/{ws}/tools` | loaded, empty, error, denied, phone | [W5 mockup](https://claude.ai/code/artifact/81725124-b936-4cbb-9e40-79089b5a1e35), [W11 mockup](https://claude.ai/code/artifact/317226a1-c2ff-43ce-a439-4a54f8b8288b), [W9](https://claude.ai/code/artifact/c16a2951-1a79-4c70-b202-ec405c0563dc), [W3 mockup](https://claude.ai/code/artifact/9a8bcd5c-c66c-462d-992a-a449679801ce), [W12 mockup](https://claude.ai/code/artifact/3fcf949a-c455-4efd-af36-1c2d1f13088e) |
| Steering (records, proposals, Context PRs) | `/{org}/{ws}/steering` | loaded, empty, error, denied, phone | [W6 mockup](https://claude.ai/code/artifact/2bbadccb-92ff-4ade-8f6d-704d9c66dafe), [W11 mockup](https://claude.ai/code/artifact/317226a1-c2ff-43ce-a439-4a54f8b8288b), [W12 mockup](https://claude.ai/code/artifact/3fcf949a-c455-4efd-af36-1c2d1f13088e) |
| Spend (findings, operator, agent, tool, wasted spend, budgets) | `/{org}/{ws}/spend` | loaded, empty, loading, error, denied, phone | [W5 mockup](https://claude.ai/code/artifact/81725124-b936-4cbb-9e40-79089b5a1e35), [W11 mockup](https://claude.ai/code/artifact/317226a1-c2ff-43ce-a439-4a54f8b8288b), [W8 mockup](https://claude.ai/code/artifact/6a15975f-6719-4b4c-aae5-4b942dea0bb1), [W12 mockup](https://claude.ai/code/artifact/3fcf949a-c455-4efd-af36-1c2d1f13088e) |
| Organization | `/{org}` | loaded, denied, phone | [W11 mockup](https://claude.ai/code/artifact/317226a1-c2ff-43ce-a439-4a54f8b8288b), [W10](https://claude.ai/code/artifact/403166f6-9216-4d23-86ac-bb3c2aa60b23), [W12 mockup](https://claude.ai/code/artifact/3fcf949a-c455-4efd-af36-1c2d1f13088e) |
| Billing | `/{org}/billing` | loaded, error, denied, phone | [W11 mockup](https://claude.ai/code/artifact/317226a1-c2ff-43ce-a439-4a54f8b8288b), [W8 mockup](https://claude.ai/code/artifact/6a15975f-6719-4b4c-aae5-4b942dea0bb1), [W12 mockup](https://claude.ai/code/artifact/3fcf949a-c455-4efd-af36-1c2d1f13088e) |
| Audit | `/{org}/audit` | loaded, empty, error, denied, phone | [W11 mockup](https://claude.ai/code/artifact/317226a1-c2ff-43ce-a439-4a54f8b8288b), [W3 mockup](https://claude.ai/code/artifact/9a8bcd5c-c66c-462d-992a-a449679801ce), [W10](https://claude.ai/code/artifact/403166f6-9216-4d23-86ac-bb3c2aa60b23), [W12 mockup](https://claude.ai/code/artifact/3fcf949a-c455-4efd-af36-1c2d1f13088e) |
| Account dialog, notifications, command menu | user menu, top bar | loaded, phone | [W5 mockup](https://claude.ai/code/artifact/81725124-b936-4cbb-9e40-79089b5a1e35), [W11 mockup](https://claude.ai/code/artifact/317226a1-c2ff-43ce-a439-4a54f8b8288b), [W3 mockup](https://claude.ai/code/artifact/9a8bcd5c-c66c-462d-992a-a449679801ce), [W4 mockup](https://claude.ai/code/artifact/a4b69d0b-715c-434c-9f4e-80534bf2e462), [W10](https://claude.ai/code/artifact/403166f6-9216-4d23-86ac-bb3c2aa60b23), [W12 mockup](https://claude.ai/code/artifact/3fcf949a-c455-4efd-af36-1c2d1f13088e) |

---

## 20. Maintainer decisions of 2026-09-15

The maintainer decided these items on 2026-09-15. A decision that changes product behaviour or copy is also written into the section and the page spec it changes, with the date. The others change neither, and the table records them so the set reads in one place.

| # | Decision | Lands in |
|---|---|---|
| 1 | The in-app agent's usage-credit balance: the $5 signup grant is restored in `create_org`. | `macanderson/oxagen` |
| 2 | Credit packs top up the usage-credit meter (row 17); `purchase_credits` is not retired. GAU blocks remain the governed-action product. | §12.10, App. E, Billing page |
| 3 | Enterprise is negotiated only (a `billing.contract_terms` row); `enterprise-v2` leaves `SUBSCRIPTION_PLANS` and Stripe. No feature is gated on the enterprise license: every feature, IAM and SOC 2 controls included, is on for every tier. | §6.3, §12.1, §12.10, App. A.6, App. A.8, Billing and Organization pages |
| 4 | Migrate the production database, then run `stripe-sync` and `price-book-sync` against production. Held pending a check: the `app-rebuild` migrations are not purely additive. | operations; held |
| 5 | When invoice billing is switched off, `overage_invoiced_gau` is added to `purchased_gau`. | §12.10, Billing page |
| 6 | `invoice_gau_max` bounds overage beyond the monthly allowance; the interim invoice fires at unit max + 1. | §12.10, Billing page |
| 7 | Rev1 keeps an in-app Build and Scale upgrade through Stripe Checkout (`start_subscription_upgrade` stays). `get_rate_card`, `preview_action_cost` and `get_evidence_retention` retire at cutover. | §12.10, §14, App. E, Billing page |
| 8 | `agent.approval_requests` gains a nullable `run_id` set from `ctx.agentRun`; `list_approvals` filters on it; the Run page strip reads it. | §7.5, App. E, Run and Fleet pages |
| 9 | The shell keeps the sidebar flyout; the `small-approvals-bottom-dock-scenarios` mockup branch is not adopted. | §4.4, §19, the whole-app audit prompt |
| 10 | The witness runner plane is approved with a $200 a month AWS budget cap. | operations |
| 11 | The ledger ingest contract is built now with a revocable run token, so Halt and Cancel work on ledger-ingested runs. | §7.4, App. E, Run and Fleet pages, plan gap G17 |
| 12 | Invoice-billed organizations are suspended 5 days after an invoice is past due; metering continues while suspended; paying the full outstanding balance reactivates the organization. | §12.10, App. A.2, Billing page |
| 13 | Fix `macanderson/oxagen#3029` (the org-only `create_workspace` REST mount fails before its handler), add an in-app create-workspace form, and ship the Spend lane including Fleet's Spend and Cache-hit tiles. | §14, App. E, Organization, Spend and Fleet pages |
| 14 | The metering shadow period is skipped; the waiver is dated 2026-09-15. | operations |
| 15 | Neo4j stays in the architecture. There is no retirement ADR and no removal work. **Amended 2026-09-18 (§21):** the graph also holds agent memory, which the Steering hub's Memory tab reads, and from Phase 3 of §17.2 it is the steering index. The ontology engine stays cut. §0 row 5 and §4.2 state what each store holds. | §0 row 5, §2.2, §4.2, §11, `macanderson/oxagen` |
| 16a | Dependabot re-pins (`macanderson/oxagen#2989`): compare what each pin resolves to, and add Dependabot ignore entries. | `macanderson/oxagen` |
| 16b | The CI ticket-filing scripts retire (`macanderson/oxagen#2980`). | `macanderson/oxagen` |
| 16c | Stella's `SharingScope` gains a `workspace` value; Oxagen steering records stay workspace-scoped. | Stella, `macanderson/oxagen` |
| 16d | A forked run's grade seals when the fork's own attempt seals; the unreachable mint-at-fork path is deleted. | `macanderson/oxagen` |
| Override | API key rotation ships in rev1. | App. E, Organization and API keys pages |
| Confirmed | The agent-adopted defaults stand: `resolve_approval` is the only billable action and membership writes are free; `set_org_billing_terms` is operator-script only; action counters are dropped; the `billing.invoices` mirror is kept; settlement states as designed; steering team mode with N=3, M=2, confidence 0.7; verify-by-link auth, no SAML button, and `governance_mode` not asked at signup; the onboarding gate with the CLI installer and a provisional workspace, with the 7-day offer deferred; the seven-group permission catalogue; the agent definition in git and spend budgets in micros; the fixture adapter deleted; three notification events. | Organization page (membership writes); `macanderson/oxagen` |
| Reaffirmed | The in-app agent stays in scope (2026-09-14, "dont cut the in app agent"). The $5 signup grant funds it (row 1), credit packs top it up (row 2), and the sidebar flyout is its shell (row 9). | §0 row 1, §1, §2, §4.4, §16, App. A.10, `scope-review.md` |
| 17 | 2026-09-15: Oxagen charges on two meters. (1) Governed actions, in GAUs, on the price list below; `resolve_approval` is the billable governed action and membership writes are free. (2) In-app AI usage (the in-app agent's model calls), in usage credits: 1 credit = $0.01, metered by the credit gate at provider cost times the meter markup (`packages/billing/src/pricing.ts`), funded by the $5 signup grant on `create_org` and topped up with credit packs (`purchase_credits`). Tokens are not passed through at cost. Proven spend stays a report figure. | §0 rows 1 and 12, §4.4, §12.1, §12.10, Billing page, `walkthrough.md`, `implementation-plan.md` |
| Reaffirmed | The GAU pricing of 2026-09-14 is the governed-action price list: $5 per 1,000 GAU list, 5,000-GAU blocks at $25, Free with 5,000 GAU a month, Build at $199 with 50,000, Scale at $999 with 300,000, Enterprise negotiated (`billing.contract_terms`) with every feature on every tier, and volume bands of $5, $4, $3 and $2 per 1,000. Proven spend is a report figure and carries no price. | §0 row 12, §12.1, §12.10, §18, Billing page, `scope-review.md` |

## 21. Maintainer decisions of 2026-09-18

The maintainer approved the steering, graph and gateway review of 2026-09-18 in full. Nothing in this table is a proposal or an open question. Row 14 was the review's one open risk, and the maintainer closed it the same day. The ADRs are in oxagen draft PR #3294 (branch `steering-gateway-adrs`), which also amends ADR-008, 043, 051, 056, 064, 078 and 090. The epic is oxagen issue #3295. (§20, the decisions of 2026-09-15, is in the canonical copy of this specification.)

| # | Decision | Where | ADR |
|---|---|---|---|
| 1 | **One assembler.** `assembleSteering(run, budget)` is the one function where everything competes for Oxagen's slice of the agent's context. It returns a stable prefix, a volatile selection and a manifest, recorded as a `steering.manifest` frame | §10.5 | ADR-093 "One assembler decides what reaches the agent, and records what it cut", §1 |
| 2 | **Storage stays plural, one writer per fact.** Git for what is published. Postgres for what must be transactional or money-grade. The graph for lineage, evidence and entity links. Only the assembler and its index are single. Nothing is collapsed into Neo4j | §4.2 | ADR-097 "Steering and gating are two planes, authored on one surface and compiled twice", §1 |
| 3 | **Two planes that never merge.** Steering is what the model reads. Gating is what the kernel refuses. One authoring surface, two compilations, and every gate emits a gate notice into steering | §10.5 | ADR-097 §2 and §3 |
| 4 | **One item type, `SteeringItem`**, with `kind` of record, skill, memory, ontology, policy or instruction, and `force` of `must`, `should`, `may` or `info` | §10.5 | ADR-093 §2 |
| 5 | **Precedence, fixed in one place.** A gate beats everything. A published `must` beats recalled memory. Repository scope may narrow workspace scope and never widen it | §10.5 | ADR-097 §4 |
| 6 | **Oxagen does not own the context window. The harness does.** Oxagen's injection points are exactly five | §7.3 | ADR-093 §4 |
| 7 | **The index sits behind a port.** First on the Postgres registry. It moves to the graph in Phase 3, with Postgres as the fallback. Delivery never waits for the graph | §4.2, §10.5 | ADR-093 §5 |
| 8 | **Skills are steering, and they are files.** Governed through a pull request, delivered by sync, loaded by the harness. The description line competes in the assembler. Skills live under Steering | §10.6 | ADR-093 §6, which amends ADR-008 and ADR-090 |
| 9 | **One screen: Steering is the hub.** Records, Skills, Memory, Ontology, Policy, Proposals, Preview | §10.7, §14 | ADR-097 §5 |
| 10 | **The gateway.** `tachod` grows into it: hook adapter, loopback model proxy, MCP aggregator, control channel. Prompt bodies never leave the machine. The vendor credential stays on the machine. Metering becomes observed. `session_limit_usd` is enforced. `interrupt` becomes real | §7.1 to §7.3, §12.5, §12.6, §13.6 | ADR-094 "tachod grows into the gateway: a loopback model proxy and an MCP aggregator", which amends ADR-051, ADR-056 and ADR-078 |
| 11 | **The tier ladder is four words, computed from what was actually routed:** observe, harness, gateway, contained | §7.1 | ADR-095 "The tier ladder is four words, computed from what was routed", which amends ADR-078 §1 |
| 12 | **The sandbox is the top tier, not the only tier. Hooks stay.** `oxagen run -- <agent>`, aimed at CI, headless runs, cloud runners and managed devices first. The witness runner is built on the same launcher. ADR-043 is revised by one sentence | §1, §7.2 | ADR-096 "Oxagen may contain the process that runs turns: the contained tier", which amends ADR-043 and ADR-064 |
| 13 | **The refactor path is six phases, each ships alone.** Phase 0 carries a freeze on new governance ceremony until it lands. The build order is Phase 0 in review (oxagen PR #3289), Phase 4 in build, then Phases 1, 2, 3 and 5 | §17.2 | ADR-091 for Phase 0. The implementation plan §8 for the rest |
| 14 | **Closed 2026-09-18: subscription logins through a base URL proxy.** Both OpenAI and Anthropic work through a base URL proxy, subscription logins included, and neither vendor's terms explicitly forbid it: validated by the maintainer on 2026-09-18. It does not gate Phase 4 | §7.1, §17.2, §18 | ADR-094 |

---

## Appendix A. Postgres tables (target)

Fifty-one tables in ten schemas in the wedge, fifty-three for the full product (`cost.fx_rates` and `control.event_subscriptions` arrive in Series A), down from about 110 tables in 20 schemas today. This is the definitive list. A table not here does not exist.

### A.0 Conventions that apply to every table

| Column | Type | On which tables | Notes |
|---|---|---|---|
| `id` | uuid (v7) | all | primary key; never shown outside the system |
| `public_id` | citext | all | prefixed (`org_`, `wrk_`, `agt_`, …), unique; the only id shown in the API and the UI |
| `created_at`, `updated_at` | timestamptz | all | |
| `created_by`, `updated_by` | uuid → `auth.users` | tables a person edits | |
| `deleted_at`, `deleted_by` | timestamptz, uuid | tables a person edits | rows are never hard-deleted |
| `org_id` | uuid → `org.organizations` | tenant class `org` and `workspace` | required; enforced by the policies in §5.2 |
| `workspace_id` | uuid → `wrk.workspaces` | tenant class `workspace` | required; enforced by the policies in §5.2 |

Money is `bigint` micro-USD unless a `currency` column says otherwise. Secrets are `bytea` ciphertext with `key_id` and `digest` beside them (the envelope pattern). Every `jsonb` column is validated against a schema in code before it is written. Enumerations are `text` with a check constraint; their values are listed in the Notes column.

### A.1 `auth` (4 tables, platform scope, Better Auth's own tables, unchanged)

**`auth.users`**

| Column | Type | Notes |
|---|---|---|
| `email` | citext | unique |
| `email_verified` | bool | |
| `name`, `image` | text | |
| `two_factor_enabled` | bool | |
| `banned`, `ban_reason`, `ban_expires` | bool, text, timestamptz | |

**`auth.sessions`**

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid → `auth.users` | |
| `token` | text | unique |
| `expires_at` | timestamptz | |
| `ip_address`, `user_agent` | text | |
| `active_org_id`, `active_workspace_id` | uuid | the org and workspace the session last used |
| `impersonated_by` | uuid → `auth.users` | null unless a support impersonation is active |

**`auth.accounts`**

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid → `auth.users` | |
| `provider_id`, `account_id` | text | the identity provider and the id there |
| `access_token`, `refresh_token`, `id_token` | text | provider tokens for Google and GitHub sign-in |
| `expires_at` | timestamptz | |
| `scope` | text | |
| `password` | text | hash, for email and password accounts |

**`auth.verifications`**

| Column | Type | Notes |
|---|---|---|
| `identifier`, `value` | text | |
| `expires_at` | timestamptz | |

### A.2 `org` (3 tables)

**`org.organizations`** (platform scope; the tenant itself)

| Column | Type | Notes |
|---|---|---|
| `name` | text | |
| `slug` | citext | unique |
| `namespace` | citext | 2 to 6 characters, unique, immutable; used in agent keys |
| `status` | text | `active`, `suspended`, `deleted`. An invoice-billed organization is `suspended` 5 days after an invoice is past due; metering continues, and paying the full outstanding balance returns it to `active` (2026-09-15, maintainer decision, §12.10) |
| `plan` | text | `free`, `build`, `scale`, `enterprise`. Enterprise is negotiated: a `billing.contract_terms` row, with no Stripe plan (§12.1) |
| `stripe_customer_id` | text | |
| `display_currency`, `billing_currency` | text | ISO 4217 codes |
| `default_locale` | text | BCP 47 tag |
| `deployment_mode` | text | `cloud`, `self_hosted` |
| `onboarding_state` | text | `gated`, `unlocked` |
| `unlocked_at`, `discount_offered_at` | timestamptz | |
| `kek_key_id` | text | the organization's key-encryption key in KMS |
| `funding_source` | text | `platform`, `customer_key` |
| `funding_connection_id` | uuid → `tools.connections` | the customer's model provider key, when `customer_key` |
| `model_routes` | jsonb | tier → provider, model, fallback (§4.5) |
| `retention_days` | int | default 2555 (seven years) |
| `retention_mode` | text | `content_exact`, `digest_only` |
| `platform_spend_cap_micros` | bigint | cap on tokens Oxagen buys on the organization's behalf |
| `deny_generation` | bigint | bumped to invalidate every cached policy bundle in the organization |
| `settings` | jsonb | |

**`org.org_users`** (class `org`)

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid → `auth.users` | unique with `org_id` |
| `role` | text | `owner`, `admin`, `member`, `billing`, `compliance`, `viewer` |
| `status` | text | `invited`, `active`, `removed` |
| `invited_by` | uuid → `auth.users` | |
| `invite_token_hash`, `invite_expires_at` | text, timestamptz | |
| `joined_at` | timestamptz | |

**`org.data_planes`** (class `org`)

| Column | Type | Notes |
|---|---|---|
| `store` | text | `postgres`, `objects`; unique with `org_id` |
| `mode` | text | `shared`, `dedicated` |
| `config_ciphertext`, `key_id`, `digest` | bytea, text, text | the connection configuration, enveloped |
| `status` | text | `active`, `degraded`, `rotating` |
| `schema_version` | text | the migration version applied on this plane |
| `last_health_at`, `rotated_at` | timestamptz | |

### A.3 `wrk` (3 tables)

**`wrk.workspaces`** (class `org`)

| Column | Type | Notes |
|---|---|---|
| `name` | text | |
| `slug` | citext | unique per organization |
| `namespace` | citext | unique per organization, immutable |
| `governance_mode` | text | `solo`, `team`, `regulated` |
| `retention_mode` | text | override of the organization's, or null |
| `bundle_version` | bigint | bumped on every publish or grant change |
| `deny_generation` | bigint | workspace-level kill switch counter |
| `promotion_policy` | jsonb | support runs, distinct agents, confidence floor (§9.2) |
| `context_branch` | text | null means the default branch |
| `settings` | jsonb | |

**`wrk.workspace_users`** (class `workspace`)

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid → `auth.users` | unique with `workspace_id` |
| `role` | text | `owner`, `member`, `viewer` |
| `status` | text | `invited`, `active`, `removed` |
| `invited_by` | uuid → `auth.users` | |
| `invite_token_hash`, `invite_expires_at` | text, timestamptz | |

**`wrk.repositories`** (class `workspace`; one row per link)

| Column | Type | Notes |
|---|---|---|
| `installation_id` | bigint | the GitHub App installation |
| `github_repo_id` | bigint | unique with `workspace_id` |
| `full_name` | text | `owner/name` |
| `role` | text | `main`, `linked`; a partial unique index enforces one `main` per workspace |
| `default_branch` | text | as GitHub reports it |
| `production_branch` | text | confirmed by the customer (§11.4) |
| `issues_enabled` | bool | |
| `last_indexed_sha`, `last_indexed_at` | text, timestamptz | head of the code graph |
| `indexing_status` | text | `idle`, `indexing`, `failed` |
| `issue_backfill_status`, `issue_backfill_cursor` | text | |
| `event_subscription_id`, `last_event_delivery_id` | text | webhook bookkeeping |

### A.4 `iam` (5 tables)

**`iam.principals`** (class `org`; `workspace_id` required when `kind = 'agent'`)

| Column | Type | Notes |
|---|---|---|
| `kind` | text | `human`, `agent`, `service` |
| `user_id` | uuid → `auth.users` | humans only |
| `agent_key` | citext | `org_ns.ws_ns.slug`, unique; agents only |
| `harness` | text | `stella`, `claude-code`, `codex-cli`, `openai-agents-sdk`, `claude-agent-sdk`, `custom`, `oxagen-service` |
| `harness_version` | text | |
| `parent_user_id` | uuid → `auth.users` | the operator an agent acts for |
| `definition_path` | text | `.oxagen/agents/<slug>.toml` in the main repo (§6.2) |
| `definition_digest`, `definition_commit_sha` | text | at the last merged commit |
| `status` | text | `unenrolled`, `active`, `suspended`, `retired` |
| `display_name` | text | |

**`iam.roles`** (class `org`)

| Column | Type | Notes |
|---|---|---|
| `name` | text | unique per organization |
| `scope_kind` | text | `org`, `workspace`, `agent` |
| `builtin` | bool | the seeded roles cannot be deleted |
| `description` | text | |

**`iam.role_grants`** (class `org`)

| Column | Type | Notes |
|---|---|---|
| `role_id` | uuid → `iam.roles` | |
| `subject_kind` | text | `tool`, `agent_tool` |
| `subject` | text | a name or a glob with version, for example `github__*@*`; unique with `role_id` and `subject_kind` |
| `effect` | text | `allow`, `deny`, `require_approval` |
| `resource_scope` | jsonb | graph labels and relationship types, hop, node, and time budgets, repositories, side-effect classes, egress classes, spend limits (§6.3) |
| `conditions` | jsonb | reference to a Cedar fragment (§6.12) |

**`iam.principal_role_assignments`** (class `org`; `workspace_id` null means organization-wide)

| Column | Type | Notes |
|---|---|---|
| `principal_id` | uuid → `iam.principals` | unique with `role_id` and `workspace_id` |
| `role_id` | uuid → `iam.roles` | |
| `granted_by` | uuid → `auth.users` | |
| `expires_at` | timestamptz | |

**`iam.credentials`** (class `org`)

| Column | Type | Notes |
|---|---|---|
| `principal_id` | uuid → `iam.principals` | |
| `kind` | text | `api_key`, `agent_credential`, `host_device_key`, `service_token` |
| `purpose` | text | `human`, `wrap_host`, `agent`, `service` |
| `prefix` | text | the visible key prefix |
| `secret_hash` | text | |
| `public_key` | text | device keys only |
| `scope` | jsonb | |
| `expires_at`, `last_used_at` | timestamptz | |
| `revoked_at`, `revoked_by` | timestamptz, uuid | |

### A.5 `tools` (7 tables)

**`tools.tool_servers`** (class `workspace`)

| Column | Type | Notes |
|---|---|---|
| `name` | text | unique per workspace |
| `kind` | text | `mcp`, `http`, `harness`, `oxagen` |
| `endpoint` | text | |
| `transport` | text | `streamable_http`, `stdio`, `openapi`, `builtin` |
| `connection_id` | uuid → `tools.connections` | null for servers that need no credential |
| `status` | text | `active`, `disabled`, `killed` |
| `last_import_at`, `last_import_digest` | timestamptz, text | |
| `egress_class` | text | `local`, `org_tenant`, `third_party` |

**`tools.tool_versions`** (class `workspace`)

| Column | Type | Notes |
|---|---|---|
| `server_id` | uuid → `tools.tool_servers` | |
| `name`, `version` | text | unique with `server_id` |
| `description` | text | |
| `input_schema` | jsonb | JSON Schema 2020-12 |
| `output_schema` | jsonb | null until declared or approved |
| `schema_digest` | text | |
| `schema_origin` | text | `declared`, `imported`, `observed_proposed`, `observed_approved` |
| `risk` | text | `low`, `medium`, `high`, `critical` |
| `side_effect` | text | `read`, `write`, `irreversible` |
| `consequence_tags` | text[] | starter set plus customer tags (§6.9) |
| `measures` | jsonb | name → path, type, unit or currency path |
| `data_classes` | text[] | from the data layer (§11.7) |
| `idempotency` | jsonb | supported flag and key path |
| `credential_scope` | jsonb | connection kind and downscope method |
| `price_micros`, `price_unit` | bigint, text | for tools with a declared price |
| `status` | text | `proposed`, `active`, `deprecated`, `killed` |
| `approved_by` | uuid → `auth.users` | |

**`tools.connections`** (class `workspace`)

| Column | Type | Notes |
|---|---|---|
| `name` | text | |
| `kind` | text | `oauth`, `api_key`, `cloud_role`, `github_app`, `model_provider` |
| `provider` | text | |
| `owner_user_id` | uuid → `auth.users` | the accountable person |
| `requires_mandate` | bool | true when any tool it backs carries a consequence tag |
| `secret_ciphertext`, `key_id`, `digest` | bytea, text, text | enveloped |
| `oauth_scopes` | text[] | |
| `downscope_method` | text | `token_exchange`, `session_policy`, `restricted_key`, `none` |
| `review_at` | timestamptz | |
| `status` | text | `active`, `expired`, `revoked` |
| `last_tested_at`, `last_test_result` | timestamptz, text | |

**`tools.credential_grants`** (class `workspace`)

| Column | Type | Notes |
|---|---|---|
| `connection_id` | uuid → `tools.connections` | |
| `tool_call_id` | uuid → `control.tool_calls` | |
| `run_id` | text | graph id |
| `scope` | jsonb | what the minted credential could reach |
| `provider_token_id` | text | the provider's identifier for the token, where one exists |
| `issued_at`, `expires_at`, `revoked_at` | timestamptz | |

**`tools.mandates`** (class `workspace`)

| Column | Type | Notes |
|---|---|---|
| `agent_principal_id` | uuid → `iam.principals` | |
| `granted_by` | uuid → `auth.users` | |
| `role_at_grant` | text | the granter's role at the time |
| `consequence_tags` | text[] | |
| `limits` | jsonb | measure → per_call, per_period, period, currency or unit |
| `targets` | jsonb | measure → allow and deny lists |
| `tools` | text[] | patterns |
| `approval_rules` | jsonb | human_above by measure, always_human_for tags, approvers |
| `purpose` | text | |
| `valid_from`, `valid_to` | timestamptz | |
| `status` | text | `active`, `suspended`, `expired`, `revoked` |
| `revoked_by`, `revoked_reason` | uuid, text | |

**`tools.mandate_ledger`** (class `workspace`; append-only)

| Column | Type | Notes |
|---|---|---|
| `mandate_id` | uuid → `tools.mandates` | |
| `tool_call_id` | uuid → `control.tool_calls` | |
| `kind` | text | `reserve`, `settle`, `release` |
| `measure` | text | |
| `value` | numeric | |
| `unit_or_currency` | text | |
| `external_effect_id` | text | the transaction, migration, message, or deployment id |
| `period_key` | text | for example `2026-09` |
| `balance_after` | numeric | |

**`tools.policy_versions`** (class `workspace`)

| Column | Type | Notes |
|---|---|---|
| `version` | int | unique per workspace |
| `cedar_text` | text | |
| `digest` | text | |
| `tests` | jsonb | the policy's own test cases |
| `test_result` | text | |
| `authored_by`, `approved_by` | uuid → `auth.users` | |
| `activated_at` | timestamptz | |
| `status` | text | `draft`, `active`, `superseded` |

### A.6 `control` (4 tables in the wedge, 5 with event subscriptions)

**`control.enrollments`** (class `workspace`)

| Column | Type | Notes |
|---|---|---|
| `host_principal_id` | uuid → `iam.principals` | |
| `hostname`, `os_user`, `platform` | text | |
| `harness`, `harness_version` | text | `claude-code`, `codex-cli` |
| `device_public_key` | text | |
| `managed` | bool | managed enrollment, on for every tier (2026-09-15, maintainer decision) |
| `enrollment_claims`, `enrollment_signature` | jsonb, text | |
| `bundle_version_served` | bigint | |
| `status` | text | `active`, `paused`, `suspended`, `revoked` |
| `last_seen_at`, `expires_at` | timestamptz | |

**`control.commands`** (class `workspace`)

| Column | Type | Notes |
|---|---|---|
| `target_kind` | text | `run`, `agent`, `host`, `tool_version`, `tool_server`, `connection`, `workspace`, `org`, `class` |
| `target_id` | text | |
| `command` | text | `pause`, `resume`, `steer`, `message`, `cancel`, `revoke`, `kill_switch_on`, `kill_switch_off`, `refresh_bundle` |
| `payload` | jsonb | steer or message text, delivery mode, addressing |
| `issued_by` | uuid → `iam.principals` | |
| `issued_at`, `expires_at` | timestamptz | |
| `delivered_at`, `acknowledged_at`, `applied_at` | timestamptz | |
| `applied_at_seq` | bigint | the frame sequence the effect landed on |
| `status` | text | the closed vocabulary of §7.4: `draft`, `queued`, `sent`, `received`, `acknowledged`, `applied`, `cancelled`, `expired`, `failed` |
| `outcome_detail`, `reason` | text | |

**`control.approvals`** (class `workspace`)

| Column | Type | Notes |
|---|---|---|
| `tool_call_id` | uuid → `control.tool_calls` | |
| `run_id` | text | graph id |
| `agent_principal_id`, `operator_principal_id` | uuid → `iam.principals` | |
| `action` | text | the canonical action |
| `input_digest` | text | |
| `mandate_id` | uuid → `tools.mandates` | |
| `rule_ids` | text[] | the policy rules that required approval |
| `taint_sources` | text[] | |
| `requested_at`, `expires_at`, `resolved_at` | timestamptz | |
| `resolved_by` | text | a user id, or `policy:<rule id>` for an auto-approval |
| `decision` | text | `approved`, `denied`, `expired` |
| `reason` | text | |
| `token_id`, `token_bound_digest`, `token_expires_at` | text, text, timestamptz | the single-use approval token |
| `token_used_at`, `token_use_count` | timestamptz, int | |

**`control.tool_calls`** (class `workspace`)

| Column | Type | Notes |
|---|---|---|
| `run_id`, `attempt_id` | text | graph ids |
| `turn_seq`, `step_seq` | int | |
| `agent_principal_id` | uuid → `iam.principals` | |
| `tool_version_id` | uuid → `tools.tool_versions` | |
| `input_digest` | text | |
| `idempotency_key` | text | unique per workspace within the tool's window |
| `tainted` | bool | |
| `decision` | text | `allow`, `approve`, `deny` |
| `decision_rule_ids` | text[] | |
| `policy_version` | int | |
| `approval_id` | uuid → `control.approvals` | |
| `credential_grant_id` | uuid → `tools.credential_grants` | |
| `status` | text | `decided`, `parked`, `dispatched`, `completed`, `denied`, `failed`, `duplicate` |
| `dispatched_at`, `completed_at` | timestamptz | |
| `output_digest` | text | |
| `external_effect_ids` | jsonb | |
| `receipt_frame_seq` | bigint | |
| `enforcement_tier` | text | `gateway`, `harness`, `observe` |

**`control.event_subscriptions`** (class `org`, `workspace_id` nullable; Series A)

| Column | Type | Notes |
|---|---|---|
| `name` | text | |
| `event_kinds` | text[] | from the catalog in §7.7 |
| `filters` | jsonb | agent, operator, severity |
| `mode` | text | `push`, `pull` |
| `endpoint_id` | text | unique; the generated endpoint |
| `target_url` | text | push mode |
| `secret_ciphertext`, `key_id`, `secret_rotated_at` | bytea, text, timestamptz | the signing secret |
| `status` | text | `active`, `paused`, `dead_lettered` |
| `last_delivery_at`, `failed_deliveries` | timestamptz, int | |

### A.7 `cost` (4 tables in the wedge, 5 with exchange rates)

**`cost.price_entries`** (platform scope; `org_id` nullable, set for an organization's negotiated override)

| Column | Type | Notes |
|---|---|---|
| `provider` | text | |
| `model` | text | canonical model id |
| `model_aliases` | text[] | |
| `region` | text | |
| `token_class` | text | `input_uncached`, `cache_read`, `cache_write_5m`, `cache_write_1h`, `output`, `reasoning`, `server_tool_request`, `rerank` |
| `unit` | text | |
| `currency` | text | ISO 4217 |
| `micros_per_million` | bigint | |
| `effective_from`, `effective_to` | timestamptz | |
| `source` | text | `list`, `negotiated`, `override` |

**`cost.fx_rates`** (platform scope; Series A)

| Column | Type | Notes |
|---|---|---|
| `base_currency`, `quote_currency` | text | unique with `effective_at` |
| `rate` | numeric(18,8) | |
| `source` | text | |
| `effective_at` | timestamptz | |

**`cost.run_totals`** (class `workspace`; a derived rollup, rebuildable from frames)

| Column | Type | Notes |
|---|---|---|
| `run_id` | text | graph id, unique |
| `operator_principal_id`, `agent_principal_id` | uuid → `iam.principals` | |
| `task_ref` | text | issue, PR, or free text |
| `repository_id` | uuid → `wrk.repositories` | |
| `started_at`, `sealed_at` | timestamptz | |
| `turns`, `steps`, `model_calls`, `tool_calls` | int | |
| `tokens` | jsonb | by token class |
| `cost_micros` | bigint | |
| `currency` | text | |
| `cost_basis` | text | `gateway_observed`, `client_attested`, `mixed`, `estimated` |
| `cache_hit_rate` | numeric | |
| `tool_definition_tokens`, `context_frame_tokens`, `steering_tokens` | int | |
| `retries` | int | |
| `verdict` | text | `flipped`, `failing`, `unmoved`, `unsatisfied`, `tampered`, `unverified`, `waived`, `none` |
| `accepted` | bool | a human verified the outcome without a witness |
| `productive_ratio` | numeric | |
| `enforcement_tier` | text | `gateway`, `harness`, `observe` |
| `replay_grade` | text | `inspect`, `view`, `fork`, `retry` |
| `governed_actions` | int | |
| `billed_at` | timestamptz | |

**`cost.provider_usage`** (class `org`)

| Column | Type | Notes |
|---|---|---|
| `connection_id` | uuid → `tools.connections` | |
| `provider`, `provider_key_id` | text | |
| `usage_date` | date | |
| `model`, `token_class` | text | |
| `units` | bigint | |
| `provider_micros` | bigint | |
| `invoice_id`, `invoice_line_ref` | text | |
| `imported_at`, `import_digest` | timestamptz, text | |

### A.8 `billing` (16 tables)

The columns follow `packages/database/src/schema/billing.ts` on the `app-rebuild` branch of `macanderson/oxagen`. A.0's conventions apply, with two differences: a table marked "no `public_id`" is internal and addressed by `org_id` or its own id, and Stripe-facing amounts are integer cents. A GAU rate is micro-USD per GAU.

**`billing.plans`** (platform scope; the published terms of each tier)

| Column | Type | Notes |
|---|---|---|
| `name` | text | |
| `slug` | citext | unique |
| `tier` | text | `free`, `build`, `scale`, `enterprise`. No enterprise plan is catalogued; an enterprise contract is a `billing.contract_terms` row (2026-09-15, maintainer decision, §12.10) |
| `stripe_product_id` | text | |
| `stripe_price_id_monthly`, `stripe_price_id_annual` | text | nullable |
| `monthly_cents`, `annual_cents` | int | `annual_cents` nullable |
| `included_credit_cents` | int | default 0 |
| `included_seats` | int | default 1 |
| `currency` | text | default `usd` |
| `rate_per_gau_micros` | bigint | ≥ 0; 5,000 on every published tier |
| `block_size_gau` | int | > 0; 5,000 on every published tier |
| `included_gau_per_month` | int | ≥ 0; 5,000 Free, 50,000 Build, 300,000 Scale |
| `features` | jsonb | |
| `is_public` | boolean | default true |

A check keeps `rate_per_gau_micros × block_size_gau` a whole number of cents, so a block prices without rounding.

**`billing.contract_terms`** (class `org`; no `public_id`; a negotiated agreement)

| Column | Type | Notes |
|---|---|---|
| `agreement_ref` | text | |
| `currency`, `rate_per_gau_micros`, `block_size_gau`, `included_gau_per_month` | text, bigint, int, int | the same four terms and check as `billing.plans`; a contract replaces all four at once |
| `effective_from` | timestamptz | |
| `effective_to` | timestamptz | nullable; later than `effective_from` |

At most one row per organization has `effective_to` null, and that row is the organization's terms. With no row in effect, the terms are the entitled subscription's plan, else Free. An operator writes the row; the app and `create_org` never do.

**`billing.subscriptions`** (class `org`)

| Column | Type | Notes |
|---|---|---|
| `plan_id` | uuid → `billing.plans` | |
| `stripe_subscription_id` | text | unique |
| `stripe_customer_id` | text | |
| `status` | text | `active`, `past_due`, `canceled`, `trialing`, `unpaid`, `incomplete`, `incomplete_expired`, `paused`; one `active` row per organization |
| `billing_interval` | text | `month`, `year` |
| `current_period_start`, `current_period_end` | timestamptz | |
| `cancel_at_period_end` | boolean | |
| `canceled_at`, `trial_end` | timestamptz | nullable |
| `seat_count` | int | default 1 |

**`billing.payment_methods`** (class `org`)

| Column | Type | Notes |
|---|---|---|
| `stripe_customer_id` | text | |
| `stripe_payment_method_id` | text | unique |
| `type`, `brand`, `last4` | text | |
| `exp_month`, `exp_year` | int | |
| `is_default` | boolean | default false |

**`billing.invoices`** (class `org`; the Stripe invoice mirror, kept by the confirmed defaults of 2026-09-15, §20)

| Column | Type | Notes |
|---|---|---|
| `subscription_id` | uuid → `billing.subscriptions` | nullable for one-off invoices |
| `stripe_invoice_id` | text | unique |
| `number` | text | |
| `status` | text | `draft`, `open`, `paid`, `uncollectible`, `void` |
| `amount_due_cents`, `amount_paid_cents`, `amount_remaining_cents` | int | |
| `currency` | text | default `usd` |
| `period_start`, `period_end` | timestamptz | |
| `due_at`, `paid_at` | timestamptz | |
| `hosted_invoice_url`, `invoice_pdf_url` | text | |

**`billing.credit_balances`** (class `org`; one row per organization)

| Column | Type | Notes |
|---|---|---|
| `balance_cents` | bigint | ≥ 0; one credit is one cent; a cached total of the lots |
| `last_event_at` | timestamptz | |

**`billing.credit_lots`** (class `org`; the credit holdings behind the in-app agent's balance)

| Column | Type | Notes |
|---|---|---|
| `source` | text | `free_grant`, `subscription`, `purchase` |
| `original_cents`, `remaining_cents` | bigint | 0 ≤ remaining ≤ original |
| `granted_at` | timestamptz | |
| `expires_at` | timestamptz | nullable (never expires); lots drain soonest-expiring first |

**`billing.credit_ledger`** (class `org`; append-only; no `public_id`)

| Column | Type | Notes |
|---|---|---|
| `delta_cents` | bigint | ≠ 0 |
| `reason` | text | a `grant_*` reason is written once per reference |
| `reference_type`, `reference_id` | text, uuid | |
| `created_by_user_id` | uuid | |

**`billing.org_billing_settings`** (class `org`; one row per organization; no `public_id`)

| Column | Type | Notes |
|---|---|---|
| `stripe_customer_id` | text | unique |
| `approved_for_invoice_billing` | boolean | default false; set only by a platform operator (`set_org_billing_terms`) |
| `invoice_gau_max` | int | > 0, default 100,000; read only under invoice billing (§12.10) |
| `auto_topup_enabled`, `auto_topup_blocks` | boolean, int | default true and 1; prepaid only; an Owner or Admin sets them |
| `auto_reload_enabled`, `auto_reload_threshold_cents`, `auto_reload_amount_cents`, `auto_reload_payment_method_id`, `last_auto_reload_at` | boolean, bigint, bigint, text, timestamptz | credit auto-reload on the saved card |
| `auto_reload_episode_key`, `auto_reload_episode_started_at` | text, timestamptz | the Stripe idempotency key of the reload in flight |
| `meter_carry_micro_credits` | bigint | ≥ 0; fractional credits owed and not yet debited |
| `low_balance_threshold_cents` | bigint | default 500 |
| `assistant_spend_cap_cents` | bigint | default 2,000; the monthly cap on the in-app agent's tokens the platform key pays for; null is no cap |
| `extended_evidence_retention_enabled` | boolean | default false |
| `dunning_state` | text | `active`, `grace`, `suspended` |
| `delinquent_since`, `grace_ends_at`, `suspended_at`, `last_dunning_notified_at` | timestamptz | |

**`billing.gau_buckets`** (class `org`; one row per organization per month; no `public_id`)

| Column | Type | Notes |
|---|---|---|
| `period_start`, `period_end` | timestamptz | unique with `org_id` on `period_start` |
| `included_gau` | bigint | the terms' `included_gau_per_month` when the row was created |
| `purchased_gau` | bigint | blocks bought this month through Checkout or auto top-up |
| `carried_gau` | bigint | carried from last month: min(purchased + carried, max(0, remaining)) |
| `used_gau` | bigint | GAU used this month |
| `overage_invoiced_gau` | bigint | invoice billing: overage already claimed; ≤ `used_gau` |
| `interim_seq`, `topup_seq` | int | interim invoices and auto top-up episodes claimed this month |
| `open_topup_settlement_id` | uuid | the one auto top-up open at a time |
| `closed_at` | timestamptz | set once the month has ended and its overage is claimed |

Remaining is included + purchased + carried − used. It may go negative: the gate reads it before a handler and the recorder debits after, so concurrent actions can overrun it.

**`billing.gau_settlements`** (class `org`; the settlement ledger; no `public_id`; `id` is the Stripe idempotency key)

| Column | Type | Notes |
|---|---|---|
| `bucket_id` | uuid → `billing.gau_buckets` | |
| `kind` | text | `checkout`, `auto_topup`, `interim_invoice`, `period_close` |
| `seq` | int | null exactly for `checkout`; unique with `bucket_id` and `kind` |
| `quantity_gau` | bigint | > 0 |
| `rate_per_gau_micros`, `currency` | bigint, text | the contracted rate charged, recorded at claim |
| `status` | text | `pending`, `open`, `paid`, `failed`; `paid` is terminal |
| `stripe_checkout_session_id` | text | unique; the checkout grant's idempotency key |
| `stripe_invoice_id` | text | the Stripe invoice behind the settlement |
| `settled_at` | timestamptz | |

**`billing.spend_budgets`** (class `org`; `workspace_id` nullable)

| Column | Type | Notes |
|---|---|---|
| `workspace_id` | uuid | null is the organization's ceiling; at most one per organization and one per workspace |
| `enabled` | boolean | |
| `period` | text | `monthly`, `rolling` |
| `window_days` | int | rolling only, > 0 |
| `limit_micros` | bigint | > 0 |
| `notified_threshold`, `notified_period_start` | int, timestamptz | the highest of 50, 80, 95 and 100 percent already notified this period |

The build holds organization and workspace ceilings. §12.5's operator and agent scopes and its soft mode are not yet columns.

**`billing.spend_counters`** (class `org`; no `public_id`)

| Column | Type | Notes |
|---|---|---|
| `workspace_id` | uuid | nullable |
| `day` | date | unique with `org_id` and `workspace_id` |
| `spent_micros` | bigint | ≥ 0; the running counter the budget gate sums (§12.5) |

**`billing.stripe_events`** (platform scope; append-only; no `public_id`)

| Column | Type | Notes |
|---|---|---|
| `stripe_event_id` | text | unique; a retried webhook is a no-op |
| `event_type`, `api_version` | text | |
| `payload` | jsonb | |
| `received_at` | timestamptz | |

**`billing.stripe_event_processing`** (platform scope; no `public_id`)

| Column | Type | Notes |
|---|---|---|
| `stripe_event_id` | uuid → `billing.stripe_events` | unique |
| `processed_at` | timestamptz | |
| `processing_error` | text | |

**`billing.billing_disputes`** (class `org`)

| Column | Type | Notes |
|---|---|---|
| `stripe_dispute_id` | text | unique |
| `stripe_charge_id`, `payment_intent_id` | text | |
| `amount_cents` | int | |
| `currency` | text | |
| `reason`, `status` | text | Stripe's values |
| `clawed_back_cents` | bigint | credits reversed from the lots when the dispute opened |
| `resolved_at` | timestamptz | |

### A.9 `audit` (3 tables)

**`audit.audit_events`** (class `org`; `workspace_id` nullable; append-only; seven-year retention)

| Column | Type | Notes |
|---|---|---|
| `kind` | text | control-plane action kinds, plus incident kinds: `unobserved_session`, `hooks_removed`, `chain_break`, `token_replay`, `witness_probe`, `mandate_exception`, `steering_drift`, `credential_probe` |
| `severity` | int | 1, 3, or 10 |
| `actor_principal_id` | uuid → `iam.principals` | |
| `target_kind`, `target_id` | text | |
| `run_id` | text | graph id, nullable |
| `detected_by` | text | `gateway`, `collector`, `control_plane`, `human` |
| `evidence` | jsonb | |
| `occurred_at` | timestamptz | |
| `resolved_at`, `resolved_by`, `resolution_note` | timestamptz, uuid, text | incidents only |

**`audit.archive_segments`** (class `org`)

| Column | Type | Notes |
|---|---|---|
| `run_id`, `attempt_id` | text | graph ids |
| `object_key` | text | in the organization's write-once bucket |
| `bytes`, `frame_count` | bigint | |
| `merkle_root`, `segment_digest` | text | |
| `attestation_key_id`, `attestation_signature` | text | |
| `sealed_at` | timestamptz | |
| `retention_until` | timestamptz | |
| `lock_mode` | text | `compliance` |
| `compacted_at` | timestamptz | when the frame rows left the hot table |

### A.10 Where today's tables went

| Today | In the rebuild |
|---|---|
| `agent.agent_runs*`, `agent.agent_executions*`, `tacho_*`, every ClickHouse table | `run.runs`, `run.attempts`, `run.frames` and `run.seals` (App. B), and archive segments |
| `iam.authorization_decisions` | `policy.decision` frames |
| `iam.deny_generations` | the two counters on `org.organizations` and `wrk.workspaces` |
| `schema_registry.*` | gone; the knowledge graph and dynamic ontology it backed do not ship (§11) |
| `billing.reseller_*` | gone. The credit, invoice and payment method tables stay in `billing` (A.8) |
| `security.security_events`, `privacy.*` requests | `audit.audit_events` |
| `ingestion.*` cursors and health | columns on `wrk.repositories` and `tools.tool_servers` |
| `chat.conversations`, `chat.messages` | the in-app agent's conversations; in scope with the in-app agent (§4.4), and not yet written into this appendix |
| `mcp.*`, `plugin.*`, `content.*`, `cms.*`, `environments.*`, `eval.*`, `workflow.*`, `ai.*`, `ratelimit.*`, `engram.*`, `codegraph.*` | gone |

The ten schemas are `auth`, `org`, `wrk`, `iam`, `tools`, `control`, `cost`, `billing`, `audit`, `dod`. Fifty-one tables in the wedge, fifty-three in full. Every tenant table uses one of the two policy classes in §5.2.

### A.11 `dod` (2 tables)

**`dod.dod_sets`** (class `org`)

| Column | Type | Notes |
|---|---|---|
| `run` | text | the run public id |
| `locked` | text | `sha256:…`, the lock digest: RFC 8785 canonical JSON of the set with `locked` removed |
| `visible` | jsonb | the set the agent can read |
| `hidden` | jsonb | holdout checks; sent to the harness only at Stop |
| `drafted_by` | text | the model that drafted the set, or `human`, or the template name; never the model running the task |
| `locked_at` | timestamptz | |

Index `(org_id, run)`.

**`dod.dod_certificates`** (class `org`)

| Column | Type | Notes |
|---|---|---|
| `public_id` | text | `dodc_…`, unique |
| `run`, `attempt` | text | the run and the sealed attempt (`arat_…`) from the run ledger |
| `stream_digest` | text | the sealed attempt's event-stream digest the certificate is bound to |
| `lock` | text | the lock digest the evidence was decided under |
| `verdict` | text | `HELD`, `PENDING`, `BROKEN` |
| `reasons` | jsonb | the closed reason codes |
| `body`, `digest`, `signature` | jsonb, text, text | the canonical certificate, its digest, and the org key's ed25519 signature over it |
| `issued_at` | timestamptz | |

Index `(org_id, run)`. A HELD certificate records the governed action `dod.held`; a PENDING one records it on signature. `dod.held` is not billable (§12.1).


## Appendix B. The run record and code graph (Postgres)

Appendix B once described these shapes in the Neo4j model. They are Postgres tables now, under the schemas `run`, `ctx` and `code`, each with `org_id` and `ws` and the RLS policy of A.0. Neo4j stays in the architecture and holds the ontology graph (§4.2), which is none of these tables.

| Table | Rows | Keys and indexes |
|---|---|---|
| `run.runs` | one per run: agent, operator, workspace, task ref, tier, grade, verdict, status, rollups (`frame_count`, `cost_micros`, `merkle_root`, `segment_ref`) | `(org_id, ws, started_at desc)`, `(org_id, agent_id)` |
| `run.attempts` | one per attempt: `public_id` (`arat_…`), `stream_digest`, sealed at | `(org_id, run_id)` |
| `run.frames` | one per frame in the hot window: seq, kind, tier, digest, prev digest, cost, policy decision, body ref | partitioned by month on `recorded_at`; `(org_id, run_id, seq)` |
| `run.seals` | one per seal: attestation, signer key id, segment ref | `(org_id, run_id)` |
| `ctx.records` | context records and their lineage: kind, statement, rationale, evidence refs, contradiction refs, promotion events, content hash | `(org_id, ws, lineage)`, full-text on statement |
| `code.files`, `code.symbols`, `code.edges` | the code graph of each main repo: path, language, signature, docstring window, `valid_from`, `valid_to` commit, and the `DEFINES`, `IMPORTS`, `CALLS`, `REFERENCES` edges | `(org_id, repo_id, valid_to nulls first)`, full-text on symbol |
| `code.tables`, `code.columns`, `code.data_edges` | the data layer of §11.4 | `(org_id, repo_id)` |

Constraints: a frame's `prev_digest` must equal the previous frame's `digest` (checked by the recorder, asserted by the verifier); `valid_to` is null while a symbol is live; a record's `content_hash` is unique per lineage.


## Appendix C. Frame envelope (gateway kind example)

```json
{
  "v": "oxagen.frame/1.0",
  "event_id": "01J9…",
  "agent": { "agent_id": "a-intel.core.stella-ci", "fleet_id": "wrk_…", "runtime": "stella", "wrapper_version": "1.0.0" },
  "run_id": "run_…", "attempt_id": "arat_…", "seq": 42,
  "ts": "2026-09-11T14:03:22.118Z",
  "kind": "model.response",
  "fidelity": "gateway",
  "span": { "trace_id": "…", "span_id": "…", "parent_span_id": "…" },
  "body": {
    "provider": "anthropic", "model": "claude-fable-5-1", "provider_request_id": "req_…",
    "stop_reason": "tool_use", "latency_ms": 1840,
    "usage": { "input": 1834, "output": 412, "cache_read": 12000 },
    "cost": { "cost_micros": 41265, "price_entry_ids": ["pe_…"], "cost_basis": "gateway_observed" }
  },
  "content": { "digest": "sha256:…", "bytes_ref": "blob://org_…/sha256/…", "redactions": [] },
  "prev_hash": "sha256:…", "hash": "sha256:…"
}
```

| Field | Type | Meaning |
|---|---|---|
| `v` | string | the envelope version, `oxagen.frame/1.0` |
| `event_id` | ULID | unique, time-ordered id of the frame |
| `agent` | object | `agent_id` (the agent key), `fleet_id` (the workspace), `runtime` (the harness), `wrapper_version` |
| `run_id`, `attempt_id` | string | which run and attempt this frame belongs to |
| `seq` | integer | position in the attempt, dense from 0; a gap is a `telemetry_gap` frame, never a repair |
| `ts` | string | UTC timestamp in the protocol's profile (uppercase `T` and `Z`) |
| `kind` | string | the frame kind (§8.2) |
| `fidelity` | string | `gateway`, `sdk`, or `harness`: who observed the event |
| `span` | object | OpenTelemetry trace, span, and parent ids for export |
| `body` | object | the kind-specific payload; for `model.response`: provider, model, provider request id, stop reason, latency, usage by token class, and the cost record (§12.3) |
| `content.digest` | string | SHA-256 of the exact body bytes stored in object storage |
| `content.bytes_ref` | string | where the encrypted body is stored |
| `content.redactions` | array | what was removed before storage, with the digest of the removed text |
| `prev_hash`, `hash` | string | the hash chain: `hash` is SHA-256 over `prev_hash` and the canonical envelope without `hash` |

## Appendix D. Tool grant example

```json
{
  "role": "agent.contributor",
  "grants": [
    { "subject_kind": "tool", "subject": "github:*@*", "effect": "allow",
      "resource_scope": { "side_effects": ["read", "write"], "repositories": ["a-intel/platform"] } },
    { "subject_kind": "tool", "subject": "github:merge_pull_request@*", "effect": "require_approval" },
    { "subject_kind": "tool", "subject": "github:delete_*@*", "effect": "deny" },
    { "subject_kind": "capability", "subject": "recall_context", "effect": "allow",
      "resource_scope": { "graph": { "labels": ["Customer", "Ticket"], "mode": "read", "max_hops": 2 } } }
  ],
  "budget": { "per_run_micros": 5000000, "per_day_micros": 50000000, "mode": "enforced" }
}
```

| Field | Meaning |
|---|---|
| `role` | the role the grants belong to; an agent gets them through a role assignment (§6.3) |
| `grants[].subject_kind` | `tool` for an imported or harness tool, `agent_tool` for one of Oxagen's own (the example's `capability` is today's name and reads as `agent_tool` in the rebuild) |
| `grants[].subject` | a name or a glob with a version: `server:tool@version` |
| `grants[].effect` | `allow`, `deny`, or `require_approval`; deny always wins |
| `grants[].resource_scope` | the ceiling for that grant: side-effect classes, repositories, graph labels and mode, hop budget, egress classes, spend limits |
| `budget` | spend limits per run and per day, `enforced` at the gateway's proxy (Phase 4 of §17.2) or `observed` only. Every bundle says `observed` at 2026-09-18 |

How the four grants combine for this role: every GitHub tool is allowed for reads and writes on one repository, merging a pull request always waits for a human, deleting anything is denied outright, and the code graph and records can be searched. Anything not named is denied, because the default effect is deny.

## Appendix E. The agent tools that survive

The current repository registers 229 real contracts (244 names minus test fixtures). The list below is the definitive set for the rebuild: **86 agent tools** (68 of them in the wedge), grouped by the job they serve. Each row names the new tool, what it absorbs from today's registry, and what it does. Anything not named here is dropped, and the drop is listed by family at the end. Names follow ADR-025 (verb-first snake case, scope as an argument). Every tool has an input schema, an output schema, a risk grade, a default effect, and is exposed on API, MCP, and the UI unless marked headless.

**Organization and workspace (11)**

| Agent tool | Absorbs | Does |
|---|---|---|
| `create_org` | create_org | organization, keys, billing account |
| `update_org` | update_org_settings | name, settings, retention policy |
| `invite_member` | send_workspace_invite, add_org_member | invite to org or workspace with role |
| `respond_to_invite` | accept_member_invite, decline_member_invite | accept or decline |
| `set_member_role` | change_member_role, remove_org_member | set a role or remove (role `none`) at org or workspace |
| `list_members` | list_workspace_members | members with roles at either scope |
| `create_workspace` | create_workspace, configure_repo | workspace plus its main repo binding and production branch; rev1 ships an in-app form for it on Organization (2026-09-15, maintainer decision) |
| `update_workspace` | update_workspace_settings, update_memory_policy, update_budget_policy, set_routing_policy | governance mode, retention mode, promotion thresholds, budgets, model routes |
| `list_workspaces` | list_workspaces, list_orgs | scoped listing |
| `get_data_plane` | get_data_plane | plane binding, DSN never returned |
| `set_data_plane` | set_data_plane | approval-gated |

**Identity and access (10)**

| Agent tool | Absorbs | Does |
|---|---|---|
| `list_api_keys` | list_api_keys | read: the org's keys with principal, grants, last use and expiry; never the secret or its hash (added 2026-09-14 for the API keys page) |
| `create_api_key` | create_api_key | purpose-locked keys for humans and services |
| `rotate_api_key` | rotate_api_key | a new secret, the old one valid for 24 hours; ships in rev1 (2026-09-15, maintainer decision) |
| `revoke_api_key` | revoke_api_key | |
| `register_agent` | create_agent_def, suggest_agent_def, summarize_agent_def | opens a Context PR adding `.oxagen/agents/<slug>.toml` and the generated harness files; identity is created on merge |
| `update_agent` | update_agent_def, revise_agent_def, publish_agent_def, deploy_agent | a Context PR changing the definition; identity and belt update on merge |
| `retire_agent` | delete_agent_def | a Context PR removing the file; principal retired, never deleted |
| `get_agent` | get_agent_def, get_agent_role | identity, roles, belt, mandates |
| `list_agents` | list_agent_defs | |
| `set_agent_role` | assign_agent_role, revoke_agent_role | |
| `set_role_grants` | (new; grants were seeded) | role's grants and resource scopes; `list_roles` is its read side, folded into `get_agent` and the Tools page |

**Wrapping and control (14)**

| Agent tool | Absorbs | Does |
|---|---|---|
| `enroll_host` | create_tacho_enrollment, create_stella_enrollment (today's names) | device key, host agent, bundle, hooks |
| `revoke_enrollment` | revoke_tacho_enrollment | |
| `list_hosts` | list_tacho_hosts | |
| `get_policy_bundle` | get_tacho_bundle, get_registry_config | signed bundle for a host or agent |
| `ingest_frames` | ingest_tacho_events, record_execution, ingest_stella_operational_telemetry, debug_execution | the one evidence ingress; headless; carries a revocable run token, so `cancel` and `revoke` stop a ledger-ingested run (§7.4) |
| `fetch_commands` | fetch_tacho_commands | control channel; headless |
| `dispatch_command` | dispatch_tacho_command | pause, resume, steer, cancel, revoke |
| `list_runs` | list_executions, list_tacho_sessions | by operator, agent, task, tier, verdict |
| `get_run` | get_tacho_session, get_execution_trace, get_message_execution | run with turns, steps, frames, receipts, cost |
| `export_run` | export_data (run part) | signed bundle with verifier |
| `list_approvals` | (new; approvals had no list) | queue with the four-hop chain; filters on `run_id` (§7.5) |
| `resolve_approval` | resolve_approval, resolve_mcp_consent | approve or deny, mints the token |
| `send_message` | (new) | message to `@<agent-slug>`, `@agents`, or a run id, with a delivery mode; reaches `applied` at the model request that carried it (§7.3, §7.6) |
| `list_messages` | (new) | sent and received, with delivery outcome |

**Toolbelt (17)**

| Agent tool | Absorbs | Does |
|---|---|---|
| `register_tool_server` | register_mcp_server, set_mcp_enabled | MCP or HTTP server |
| `remove_tool_server` | delete_mcp_server | |
| `list_tool_servers` | list_mcp_servers, resolve_mcp_servers, list_mcp_consents | |
| `import_tools` | list_tool_declarations, publish_tool_declaration, list_agent_tools | pull `tools/list`, version, store schemas |
| `approve_tool_schema` | (new) | accept an observed output schema |
| `search_tools` | search_command_menu, suggest_commands, list_agent tool_registry, get_agent tool_registry | belt search meta-tool; also the UI's command menu |
| `load_tools` | (new) | belt definitions meta-tool |
| `set_connection` | create_connection (credential part), set_model_credential, verify_model_credential, upsert_secret_key, set_secret_value, set_plugin_secret, reauth_plugin_credential | credential to a tool server or provider, tested before save |
| `delete_connection` | delete_connection, delete_model_credential, delete_secret_key, unset_secret_value, revoke_plugin_credential | |
| `list_connections` | list_connections, list_secret_keys, get_model_credential | never returns secrets |
| `grant_mandate` | (new) | bounded authority for a consequence tag to an agent |
| `set_approval_rules` | (new) | the customer's approval and auto-approval rules, as a policy version |
| `revoke_mandate` | (new) | |
| `list_mandates` | (new) | ledger view |
| `set_policy` | (new) | new policy version with tests |
| `set_kill_switch` | (new) | any level |

**Repositories (3)**

| Agent tool | Absorbs | Does |
|---|---|---|
| `link_repository` | configure_repo, sync_repo, install_integration (GitHub part) | link, role, production branch, issue import |
| `unlink_repository` | pause_repo, delete_integration | |
| `sync_repository` | sync_repo, resume_repo, sync_integration | manual full re-index |

Dropped from this family (§11): `add_source`, `update_source`, `remove_source`, `list_sources` (connector-based ingestion beyond GitHub), `propose_ontology_version`, `get_ontology`, `update_ontology` (the dynamic ontology's proposal and versioning surface), and `search_graph`, `expand_graph`, `query_graph` (the natural-language-to-Cypher graph query surface). None of these ship in core Oxagen.

**Context and steering (9)**

| Agent tool | Absorbs | Does |
|---|---|---|
| `append_record` | write_memory, save_memory, attach_memory_evidence, cite_memory, cite_reference | the protocol's append |
| `get_record` | (new) | |
| `list_records` | list_context_records, list_memories, list_memory_citations, get_citation_stats | by kind, scope, status, lineage |
| `retract_record` | delete_memory, demote_memory | new record on the lineage |
| `recall_context` | recall_memory | the provider's query, as a tool for agents |
| `propose_record` | promote_memory, promote_context_record, suggest_promotion_rationales | a proposal |
| `open_context_pr` | publish_context_record | the pull request |
| `list_proposals` | list_memory_promotions | |
| `dismiss_proposal` | dismiss_memory_promotion | |

**Spend and billing (9)**

| Agent tool | Absorbs | Does |
|---|---|---|
| `get_spend` | get_usage_breakdown, list_routing_stats, get_repo_metrics | rollups at any level with basis |
| `list_findings` | list_error_clusters | ranked optimizations |
| `export_statement` | export_data (billing part) | |
| `set_budget` | set_spend_budget, get_spend_budget, update_user_budget, get_user_budget, get_budget_policy | any level |
| `set_model_route` | update_model_settings, get_model_settings, list_model_agent tools, preview_routing_decision, get_routing_policy | tiers and fallbacks |
| `set_funding_source` | (new; was implicit in credentials) | platform or customer key |
| `get_subscription` | get_subscription | |
| `change_subscription` | start_subscription_upgrade, purchase_credits | in rev1 both absorbed tools stay: `start_subscription_upgrade` (Build or Scale through Stripe Checkout) and `purchase_credits` (credit packs for the in-app agent). `get_rate_card`, `preview_action_cost` and `get_evidence_retention` retire at cutover (2026-09-15, maintainer decision, §12.10) |

**Audit and compliance (7)**

| Agent tool | Absorbs | Does |
|---|---|---|
| `query_audit_log` | query_audit_log, get_auth_alerts | control-plane events, receipts |
| `export_data` | export_data | organization export |
| `list_incidents` | (new; incidents had no list) | tamper, probes, chain breaks, mandate exceptions |
| `set_event_subscription` | (new; Series A) | event kinds, filters, delivery mode; returns the unique endpoint (§7.7) |
| `list_event_subscriptions` | (new; Series A) | with delivery health and dead letters |

**Account (5)**

| Agent tool | Absorbs | Does |
|---|---|---|
| `list_conversations` | list_conversations, rename_conversation, archive_conversation, delete_conversation, export_conversation, purge_conversations, list_conversation_files | with the actions as arguments |
| `set_preferences` | update_user_preferences, get_user_preferences, update_workspace_user_preferences, get_workspace_user_preferences, set_auth_alerts | |
| `list_notifications` | list_notifications | |
| `mark_notification` | mark_notification | |
| `get_install_instructions` | get_install_instructions | per harness |

**Definition of done (4)**

| Agent tool | Absorbs | Does |
|---|---|---|
| `draft_dod` | (new) | draft a set from a prompt through the model layer; splits the result into visible and hidden; the drafting model is recorded on the set |
| `lock_dod` | (new) | register a locked set (visible and hidden) for a run |
| `settle_dod` | (new) | verify submitted evidence against the locked set, re-run `decide()`, bind to the sealed attempt, sign a certificate, record the governed action `dod.held` (not billable, §12.1) |
| `sign_dod` | (new) | a human signature on a PENDING run's human check; decides again |

## Appendix F. The pages that survive

The current web app has 70 page files. Nine remain: six at workspace scope, three at organization scope. Sign-in flows (login, signup, password reset, two-factor, verify, accept an invite, create the first organization) are not screens and are not counted; there are seven of them and they stay as they are. Onboarding is not a page: it is the three-step gate, and the first run inside the workspace.

| # | Page | Route | Absorbs today's routes | Job |
|---|---|---|---|---|
| 1 | **Fleet** | `/{org}/{ws}` | `[ws]` (workspace home), `sessions`, `workbench`, `access/sessions`, `dashboard`, and the approvals queue as a panel | every run, live and recent; pending approvals; pause, resume, cancel |
| 2 | **Run** | `/{org}/{ws}/runs/{run}` | `sessions/*` detail, `knowledge/citations` | what the run produced, told as the story it produced it in (the artifacts, the reads demoted to marks, and the gate at the position it stopped the run); frame-by-frame player, cost strip, approvals on this run, steer, fork, bisect, export |
| 3 | **Agents** | `/{org}/{ws}/agents` and `/{run}`-style detail `/{agent}` | `workbench/agents`, `workbench/agents/[agentId]`, `workbench/agents/new`, `workbench/environments`, `settings/agent-defaults`, `developer/mcp` | identity, credentials, roles, toolbelt, mandates, budgets, enrollment |
| 4 | **Tools** | `/{org}/{ws}/tools` | `workbench/tools`, `workbench/tools/agent tools`, `workbench/tools/mcp`, `settings/mcp-server-registries`, `marketplace`, `marketplace/agent-tools`, `marketplace/integrations`, `marketplace/integrations/[connectorId]`, `governance/agent tools`, `governance/policies`, `access/reviews` | registry, connections, mandates ledger, policy versions with their tests, kill switches, auto-approval rules |
| 5 | **Steering** | `/{org}/{ws}/steering` | `knowledge/memory` | records, proposals, Context PRs |
| 6 | **Spend** | `/{org}/{ws}/spend` | `settings/spend-budgets`, `billing/usage` | findings, spend by operator and agent, proven spend, wasted spend, budgets |
| 7 | **Organization** | `/{org}` | `[orgSlug]` (org home), `members`, `members/pending`, `workspaces`, `new-workspace`, `settings/general`, `settings/model-funding`, `settings/privacy`, `settings/github`, `developer/tokens`, `settings` (workspace general), `settings/general` (workspace) | members and roles, workspaces, model funding and routes, data plane, API keys, workspace settings including repo binding |
| 8 | **Billing** | `/{org}/billing` | `billing`, `billing/subscription`, `billing/invoices` | plan, GAU used against the allowance, blocks and auto top-up, the contracted rate, credit packs, invoices (linked to Stripe) |
| 9 | **Audit** | `/{org}/audit` | `security`, `security/audit`, `security/compliance`, `security/mfa`, `security/trust`, `governance`, `access` | audit events, incidents, receipts search, exports, key rotation, retention |

The routes `knowledge`, `knowledge/graph`, `knowledge/graph/[nodeId]`, `knowledge/ontology`, `knowledge/sources`, and `knowledge/sources/connect` are dropped along with the dynamic knowledge graph they served (§11); nothing absorbs them.

Account pages (`account`, `account/profile`, `account/preferences`, `account/privacy`, `account/security`) collapse into one **Account** dialog reachable from the user menu; it is a dialog, not a page. `cli/authorize` and `github/setup` are callback endpoints, not pages, and stay. Every other route in today's list redirects to the page that absorbed it for one release, then is removed.

