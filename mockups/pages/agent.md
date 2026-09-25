# Agent detail

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents/<slug>/<tab>` (tabs: `overview`, `identity`, `steering`, `toolbelt`, `runtime`, `permissions`, `activity`, `definition`) |
| Scope | workspace |
| Spec | §14 Mission Control; §12.6 token classes; §8 the call pipeline; Appendix F page 3; `docs/agent-ontology-ia.md` for the object model |
| Design | `mockups/src/engine.js` → `pAgent()`, with `IAM_TABS`, `IAM_TAB_ALIAS`, and the tab bodies `aOverview()`, `aIdentity()`, `aSteering()`, `aToolbelt()`, `aRuntime()` with `aRuntimeHost()`, `aPermissions()` with `permRoles()`, `permBudgets()` and `permMandates()`, `aActivity()` with `actRuns()`, `actAccounting()` and `actIncidents()`, and `defForm()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / agent`: one story per tab and per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `agent.audit-prompt.md` |

## Job

One agent, answered in the order a person asks: what it is made of, who it is, what steers it, what it can reach, where it runs, what it may do, what it did, and what file says so. Composition happens here. The registries on Tools, Steering, and Runtimes own the reusable objects; this page assigns a reference and shows what the reference resolved to.

## What is on the page

**Header**: eyebrow “Agent”, then the agent card (avatar, name, key, harness) as the h1. Under it, four badges: the lifecycle status, the enforcement tier, `replay <grade>`, and `operator <name>`. Then the agent description. Actions, all plain: **Edit avatar** (opens `avatar`) · **Rotate credential** · **Suspend** (danger) · **Deregister** (danger; opens `delagent`). No gold action; the one gold action of the workspace is Wrap Claude Code on the Agents page.

**Tabs**, in order, each a route segment: **Overview** · **Identity** · **Steering** · **Toolbelt** (count = `beltTotal`) · **Runtime** · **Permissions** (count = mandates held) · **Activity** (count = tamper incidents) · **Definition in git**. Rev1 tab ids still resolve through `IAM_TAB_ALIAS`, so an old link lands on the tab that absorbed it: `mandates` → `permissions`, `budgets` → `permissions`, `runs` → `activity`, `incidents` → `activity`, `enrollment` → `runtime`. An id that matches nothing falls back to `overview`. The belt search and the presentation override reset when the agent changes, so one agent's query never renders under another's name.

### Overview

What this agent is made of, and the first question the page answers.

- **30-day token use** (`coachStrip`): a badge reading total tokens, dollars, and the cost basis; a stacked bar per token class (Conversation, Tool results, Context frames, Tool definitions, Steering, System, Output, Reasoning); then Cache hit rate, Per run, Per model call, and Basis.
- **Coaching**: up to three items read off the same token record, each with what to change and what it is worth. Empty copy: “Nothing to change. Every share is inside the workspace norm and the cache holds.” Footer: **All coaching for this workspace →**.
- **Composition** panel, badged with the health verdict from `agentHealth()`. Rows, each with an **Open** button to the tab or registry that owns it: Identity (the principal, “minted at registration and never reused”) · Steering (items and token cost, or “no preview prompt is set up”) · Toolbelt (each assigned belt as a link into Tools → Toolbelts, over “N tool versions in all, sent as a full|searchable belt”) · Runtime (host and tier badge, over kind, harness, and OS) · Owner (name, role, “accountable for every run this agent makes”) · Permissions (role count and mandate count, over “a toolbelt says what it can see; its roles and the policy say what it may call”).
- **Last 30 days** panel: four stats (Runs with the last run time, Spend with its basis word, Tokens with the cache rate, Tamper incidents with the health reason) and the note that every tool definition on the belt is paid for as input on every call. **Open activity** in the header.
- **Definition in git** panel: Path, Repo, Commit, `definition_digest`, and the generated file beside it, over “A pull request that edits a generated file without regenerating it fails the checks.” **Open the file** in the header.

### Identity

The principal, and the one property most of the threat model rests on. Roles moved to Permissions; tier delivery moved to Runtime.

- **Identity**: Agent key · Principal · Kind · Harness · Model tier (tier → the model id it routes to) · Operator (`initiating_principal`) · Lifecycle state (“registered → enrolled → active → retired. Deregistering retires the principal and never deletes it, so old runs keep their identity.”) · First frame.
- **Credentials**, badged `none`: API key, OAuth token, Cloud role, GitHub token all read `none`; Run token reads “one, and it reaches Oxagen only”. The paragraph states that every secret a call needs is minted by the broker at dispatch, scoped to that one call, and never transmitted to the agent. **See the connections that mint them** opens Tools → Providers.
- **Run credential**: Key (shown once, stored as a hash) · Purpose lock · Issued · Last used · Run tokens (count, 15 minute TTL) · Host device key. Actions: **Change identity** (opens `identity`), **Revoke credential** (danger).
- **Trust relationships**: Accountable human · Workspace · Runtime · Delegation (“subagents narrow, never widen”) · Replay · Tamper incidents, with **Read them** into Activity when the count is not zero. **Open its permissions** at the foot.

### Steering

The agent-scoped view of the workspace library. Nothing is authored here.

- When no steering is scoped to the agent and no preview prompt is set up, the tab is one panel, “No steering is assembled for this agent”, with **Open the library**.
- On the `observe` tier, a warning bar above everything: nothing below reaches this agent, because no hook is installed, and what follows is what the assembler would deliver on `harness`.
- Two meters: **Stable prefix · SessionStart additional context** in bytes against the 16 KiB cap, and **Volatile selection · token budget** in tokens, with the prompt it was ranked against.
- **What reaches this agent**: Item · Kind · Force · Scope · Body · Source · Where it lands · Token cost. Kind is the kind badge the Library table shows (`steering.md`), and its filter lists the word on the badge. “Where it lands” is the gate plane, the stable prefix, or volatile with its rank. Header actions: **Change what is assigned** (Steering → Assignments) and **Open in the compiler** (Steering → Compiler, seeded with this agent).
- **Cut for this agent**: Item · Kind · Force · Token cost · Cut because · Why, with the count in the panel header.

### Toolbelt

The only tool list the model is ever shown, and the assignment that produced it.

- **Belt computation**: a wire diagram from grants, the delegation ceiling, the policy bundle, and the kill switches to the belt, with the active policy and deny generation in the header. The paragraph names the registry version count, the number this agent's model is shown, and what a call outside the belt does (`unknown_tool`, counted toward an automatic halt).
- **Model view**: a two-button group labelled Belt presentation, **Searchable belt** and **Full belt**, each with `aria-pressed`. The subtext states the belt width against the workspace full-belt limit of 40 and which presentation that earns. The body shows the tools block of the next model request verbatim, with the machine-readable trailer on every definition (risk grade, whether the call is held, the ceiling, the schema digest).
- **Belt search**: `search_tools` running against the index the model queries, with five example queries. A hit list shows names and one-line descriptions only. A miss says whether the tool exists in the registry and why it is off this belt, over “A search never returns a tool outside the belt.”
- **Per-tool decision rules**: Tool · Category · Decision · Hazard · Egress · Financial · Schema digest, grouped by category or flat (a two-button group labelled Layout), with category chips, the critical and high hazard counts, the approval, mandate, and deny counts, and **What the categories mean** (opens `toolcats`). A row opens `tool`.
- **Off the belt**: Tool · Reason, badged “not visible to the model”.

### Runtime

- When no host is enrolled, the tab is the empty state “No runtime is enrolled”, with **Enroll a runtime** (the Register agent gate) and **Show CLI steps** (opens `register`).
- **Host**, read from the runtime record so this page and Runtimes cannot disagree: Runtime · Harness · Device key · Collector · Hook binary · Hooks written · Model proxy · Oxagen MCP endpoint · Settings · Tier earned · First frame · Last checkpoint, plus the runtime's note when it has one. The health badge and **Open the runtime** sit in the header.
- **What this tier delivers**: the tier ladder with this agent's rung marked, then Model calls, Tool calls over MCP, Harness-native tools, Budgets, Steering, and Credentials held by this agent (`none`). Each answer changes with the tier. **All runtimes** in the header.
- **Unenroll this host from the CLI**: the `oxagen agent unenroll` command, the note that hand-stripped hooks record Hooks removed (`hooks_removed` in the tooltip) and drop the tier to `observe`, **Run a test session**, and **Unenroll** (danger).

### Permissions

Roles, ceilings, and mandates, which are all limits on the principal. It never lists tools.

- **Roles**: a wire from the roles held and the operator to the belt, then each role with its permission ids and description, Resource scope, Spend ceiling (per run and per day), and Can move money. **Assign a role** opens `assignrole`. Closing note: “Assigning a toolbelt grants nothing. It widens what the model is shown; every call on it is still decided against these roles, the policy on the tool, and the mandate ledger.”
- **Budgets**: a per-run meter and a per-day meter, then Mode, On a breach, and Delegation ceiling. The subtext states that budgets are checked at each hook boundary on reported spend and fail open, and that the proxy enforces the ceiling before the call on the `gateway` and `contained` tiers. **Set budget** opens `budget`.
- **Mandates held**: Mandate · Effect · Per call · Per period · Remaining · Expires · Status; a row opens the mandate page. With no mandate, the panel is “No mandate”, badged “cannot move money”, with the four-step denial chain (Call, Financial class, Mandate lookup, Decision `no_mandate`) and **Request a mandate** (opens `mandate`).

### Activity

- **Runs**: Run · Status · Tokens · Cost · Frames · Started; a row opens the run. When no run of this agent is in the player's window, the panel says so, gives the 30-day count, and offers **Open the audit record**.
- **Token accounting**: Class · Tokens 30d · Rate · Cost, one row per class plus Tool definitions counted as input, over the cache hit rate and the tool-definition share of input.
- **Last 30 days**: Runs, Spend with its basis, Productive ratio, Tokens with the cache rate, then any finding open against this agent with **Evidence** (opens `evidence`) and **Fix** (opens `fix`). **Open on Spend** in the header.
- **Tamper incidents**: one panel per incident, with What happened, What it stopped, Closed or Owner, the incident id, and **Open on Audit**. With none, the panel lists the detectors that would raise one and offers **Open the incident register**. Closing note: a tamper incident never raises the tier of the frames it touched.

### Definition in git

The form and the file, side by side.

- Panels: **Identity** (Schema and Slug read-only, Name, Description) · **Model and budget** (Model tier, Per-run budget in USD, stored as `per_run_micros`) · **Tools** (`tools` and `deny_tools` as chip lists, Side effects as read, write, and irreversible, where irreversible is disabled without a mandate) · **Instructions** (the `[instructions]` body) · **Harness** (harness read-only, color).
- **Source** panel: the file link into the source editor, Repository, `definition_digest`, At commit, and the generated file beside it.
- **Changing this agent**: the four-step chain (edit, checks, review, merge is the change) and the note that deleting an agent is a pull request that removes the file.
- A bar above the split states the file's condition: a parse error with the failing message, unsaved changes with the diff stat against the commit, or a pending branch with its pull request. **Save changes** and **Open a pull request** both open `commit`.

**Dialogs this page opens:** `avatar`, `delagent`, `identity`, `assignrole`, `budget`, `mandate`, `tool`, `toolcats`, `evidence`, `fix`, `commit`, `register` (from an unenrolled Runtime tab), `request-access` (from denied), `incident` (from error).

**Shell.** Same as the Agents page, with the breadcrumb … / Agents / `<agent name>`. Sidebar Workspace nav: Fleet · Agents · Tools · Steering · Runtimes · Repositories · Spend.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Identity, principal, credentials | `AGENTS` (`mockups/fixtures/agents.json`) | `iam.principals` kind=agent | `iam.principals`; `agent.credential.*` | ✅ |
| Roles held | `S.agentRoles` via `agentRolesOf()`, `ROLES` | `iam.role_grants` | `agent.role.*`, `iam.role.list` | ✅ |
| Steering reaching this agent | `STG_PREVIEW` (`mockups/fixtures/steering-preview.json`) via `agentSteering()` | the assembler’s registry port; `steering.manifest` frames | `agent.context_records`; nothing assembles per agent yet | 🟡 |
| Toolbelt assignments | `TOOLBELTS`, `TOOLBELT_ASSIGN` (`mockups/fixtures/toolbelts.json`) via `beltsOfAgent()` | `tools.toolbelts`, `tools.toolbelt_assignments` | none | ❌ |
| The computed belt and what is off it | `TOOLS` via `beltOf()`, `beltOutside()` | grants × policy at run start | `agent.tools`/`tool_versions`; `policy.evaluate` | 🟡 |
| Runtime, collector, hooks, checkpoint | `RUNTIMES` (`mockups/fixtures/runtimes.json`) via `agentRuntime()` | `control.runtimes`, `control.enrollments` | `tacho.hosts`; `tacho.enrollment.{create,revoke}` | ✅ |
| Tier earned | `tier` | computed per run from what was routed (G6) | none; a stored column today | ❌ (G6) |
| Budgets | `budget`, `budgetUsed`, `budgetDay`, `usedDay` | `cost.budgets` | `agent.budget.set`; enforcement at hook boundaries | 🟡 |
| Mandates | `MANDATES` (`mockups/fixtures/mandates.json`) | `tools.mandates`, `tools.mandate_ledger` | none | ❌ (G1) |
| Runs | `RUNS` (`mockups/fixtures/runs.json`) | `run.runs` | ClickHouse frames + `run.list` | ✅ |
| Token accounting by class | `agentTok(a)`, the class table in `actAccounting()` | `cost.daily_totals` with the §12.6 classes | ClickHouse `token_usage`, totals only | ❌ (G3) |
| Findings | `FINDINGS` (`mockups/fixtures/findings.json`) | `insight.findings` | none | ❌ |
| Tamper incidents | `INCIDENTS` (`mockups/fixtures/audit.json`) via `agentTamper()` | `audit.audit_events` incident kinds | `tacho.incidents` | ✅ |
| Definition file | `agentTomlSeed()`, `S.defBase`/`S.defSrc` | the repo at `.oxagen/agents/<slug>.toml` | `agent.definition.{get,put}`; Context PR | ✅ |

## Functionality

- Every tab is a route segment, so a tab is linkable and the browser back button moves between tabs.
- The tab counts are live: the Toolbelt count is `beltTotal(a)`, Permissions is the mandates held, Activity is the tamper incidents. A count of zero renders no badge.
- Identity is stable and everything else is a reference. The principal does not move when the persona, the belt, the model, or the machine changes, which is why a run from a year ago and a run from this morning are the same actor.
- A toolbelt assignment grants nothing. The belt decides what the model is shown; the roles, the policy on the tool, and the mandate ledger decide whether the call survives. Both have to allow the call.
- The Host panel reads the `RUNTIMES` record, so the collector, the hooks, and the last checkpoint match the Runtimes page exactly. The agent row carries only its own key.
- Belt search runs the same index `search_tools` queries, and it never returns a tool outside the belt. What the model cannot call, it cannot find, so it cannot be prompt-injected into calling it.
- The belt presentation toggle is a preview, not a setting. It is per agent (`S.beltFor`), resets when you open another agent, and changes nothing about how the agent runs.
- Editing the definition never writes to Postgres. Every path ends in a commit on a branch, and the merge is the change.
- Deregister opens a pull request that removes the file. The principal is retired, never deleted.
- Suspend and Revoke credential kill every live run token at the next call, which is what makes a halt stick.

## States

- **loaded**: the page as described above, on the demo record. An agent slug that matches nothing falls back to the first agent.
- **empty**: “This agent has never run”. “It is registered and enrolled, but no frame has arrived. Its belt is computed at run start, so there is nothing yet to show for tools either.” Action: **Back to Fleet**. The Runtime tab carries its own empty state when no host is enrolled, and the Steering tab carries its own when nothing is assembled.
- **loading**: the shell stays; the page body is replaced by the skeleton.
- **error**: “This agent could not be loaded”. “The control plane answered `503 iam_principals_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the trace line beneath.
- **access denied**: “You cannot see this agent”. “Your roles on Anderson Intelligence Corp. do not include `agent.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by*.

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. The five-slot thumb bar replaces the sidebar (Fleet, Agents, Tools, Spend, More). The tab strip scrolls horizontally and keeps the selected tab in view. The header actions wrap under the agent card. Every table becomes a stack of cards, each cell labelled with its column header; the definition split becomes one column, form above source. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `agent.read`
- Writes (each a governed action recorded in Audit): `agent.credential.rotate`, `agent.credential.revoke`, `agent.suspend`, `agent.deregister`, `agent.role.assign`, `budget.set`, `enrollment.revoke`, `agent.write` (the commit on the definition)

## Backend gaps this page depends on

- G1 mandates, including the ledger the mandate table reads
- G3 the token classes of §12.6, which the accounting table and the token panel both read
- G6 the tier computed per run, which every tier answer on the Runtime tab depends on
- toolbelts as a stored object, with assignments to agents
- the per-agent steering assembly the Steering tab renders
- findings, which the Activity tab lists against this agent

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, health, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such, and only `contained` earns the word enforced.
- Identity never mixes with steering. The principal, the credentials, and the lifecycle live on Identity; what influences behaviour lives on Steering and is owned by the workspace library.
- Permissions never lists tools, and Toolbelt never claims a permission.
- A panel that names a reusable object links to the registry that owns it and states no fact that registry owns.
- Every number that is money shows its basis. Every token figure is this agent's own rollup, and the cache rate under it is cache read over input for this agent.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- No gold action on this page; gold is identity and appears once per screen at most.
- No heading carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence or nothing.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- Every rev1 tab id keeps resolving through `IAM_TAB_ALIAS`, so an old link lands on the tab that absorbed it.
