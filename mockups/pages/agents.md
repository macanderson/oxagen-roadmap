# Agents

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents`. `#/:org/:ws/tools/mandates` lands here (the app answers `/{org}/{ws}/tools/mandates` with a 308). The Fleet page's tiles, Steer and Register agent moved here; the Fleet route itself lands on Work |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D3 (the Fleet page retires and its population view moves to Agents), D11 (a mandate is a delegation), D15, D16 and D17, and the Cuts table. `docs/fleet-operations-ia.md` (Agents), `docs/fleet-operations-routes.md` (Agents, Tools) and `docs/fleet-operations-collapse.md` (the Fleet tiles and Steer). `docs/agent-ontology-ia.md` for the object model the Composition columns name |
| Design | `mockups/src/wedge.js` → `agentsTiles()` and `wsRunCounts()`; `mockups/src/engine.js` → `pAgents()`, with `agentViewSet()`, `agentHealth()`, `agentSteering()`, `agentRuntime()`, `beltsOfAgent()`, `beltTotal()`, `agentTok()`, `tamperCount()`, `openSteerFleet()`, `steerFleetBody()` and `steerSend()`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Agents / Agents`: Loaded and Loaded · mobile. The catalog gives the view no `future` flag, so it has no future-only story |
| Audit | `agents.audit-prompt.md` |

## Job

The fleet as one population. A person opens Agents to answer five questions about the workspace's agents: which are live now, what waits on them, how spend stands against the workspace budget, who holds delegated authority, and what each agent is made of and did in the last 30 days. From here they steer the fleet, write a new agent, or register one that already runs.

Agents replaces the population half of the Fleet page (D3). Runs are listed under their work orders on Work and under each agent's Activity tab, not here.

## What is on the page

**Header.** Eyebrow: the workspace name (“Core platform”). h1 “Agents”. Subtext: “Every actor in this workspace and what it is made of.” Actions, in this order:

- **Steer** opens the `steerfleet` dialog.
- **New agent** opens the agent wizard (`wzOpen('agent')`), for an agent that does not exist yet.
- **Register agent** (gold) leaves the page for the Register agent gate at `#/a-intel/core-platform/register/name` (`regStart()`), for an agent that already runs on a machine or in CI. Its steps are specified in `register-name.md`, `register-wrap.md` and `register-run.md`.

**Tiles.** Four across, each one number over one caption. These are the tiles the Fleet page held, rewritten for the population.

| Tile | Number | Caption | Opens |
|---|---|---|---|
| Live now | Live runs in this workspace, counted by `wsRunCounts()`: each run's own status, plus a workflow stage run that only its work order records. The same count Work uses | “6 parked on a person · 68 agents registered”. The parked clause appears only when a run is parked; the agent count is every agent registered in the workspace | Work › Work orders (`#/a-intel/core-platform/work/orders`) |
| Waiting on you | Pending approvals whose run is in this workspace, or that name no run | “approvals in the drawer”, singular at one | The Approvals drawer |
| Spend against budget | The workspace budget's used share, as a percent | “$14,213.78 of $18,000.00 · hard · monthly”: used, limit, mode and period. With no workspace budget the number is a dash and the caption is “no workspace budget set” | Spend › Budgets |
| Delegations held | Active mandates held by agents in this workspace | The holders' slugs joined with commas (FinOps: “invoice-bot, cost-reporter, ledger-reconciler”), or “no agent here holds a mandate” | Nothing. Each holder's mandates are on its Permissions tab |

On the demo record the tiles read 7, 7, 79% and 0.

**Registered in Core platform** panel. The heading names the workspace. The subtext follows the column set: “Each row names the reusable objects this agent holds a reference to.” on Composition, and “Each row is what this agent did and what it cost over the last 30 days.” on Operations. The panel header carries, on the right:

- **Columns**: a two-button group (`role=group`, `aria-label` “Columns”), **Composition** (the default) and **Operations**, each with `aria-pressed`. It writes `S.agentView` and re-renders. It is session state, not a route segment, so a link to the page always opens on Composition.
- The mono line `.oxagen/agents/ @ a4c91e2`: the directory the definitions live in, at the commit of the listed agents.

Composition columns, in order:

| Column | Cell |
|---|---|
| Agent | The agent card: harness mark, avatar, agent key (mono), harness label |
| Purpose | The agent's description |
| Owner | The operator's avatar and name |
| Steering | “N items” over “N tok”, with “ · not delivered” appended when the agent earns no hook. A dash when the agent has no standing brief to resolve |
| Toolbelt | “N belts” over “N tools · full” or “N tools · searchable” |
| Runtime | The host id (mono) over the host's kind and the tier, such as “workstation · gateway”. With no host enrolled: a dash over the tier alone |
| Principal | `prn_…`, or `prn_pending` |
| Health | One badge, from `agentHealth()` in this order: `tamper` while a tamper incident against the agent is open, `not enrolled` when no host is enrolled, `observe` on the observe tier, `healthy` otherwise. The mockup counts resolved incidents as open, and `agentTamper()` matches an incident's scope by prefix, so `backlog-groomer-us` and `schema-guard-eu` take on the incidents of `backlog-groomer` and `schema-guard`. Five of the seven `tamper` badges in Core platform rest on resolved incidents (Triage, release-manager, stella-ci, schema-guard, schema-guard-eu). A build counts the open incidents recorded against the agent itself |
| Activity | Runs in 30 days over “runs 30d” |
| (unlabelled) | The row actions |

Operations columns, in order:

| Column | Cell |
|---|---|
| Agent | The agent card (harness mark, avatar, key) with the description beneath |
| Harness | The harness label over its slug (mono) |
| Operator | Avatar and name |
| Status | The lifecycle status badge |
| Tier | One word from the ladder: `observe`, `harness`, `gateway` or `contained` |
| Belt | The tool count over `full` or `searchable` |
| Runs 30d | Count |
| Spend 30d | USD |
| Tokens 30d | Total tokens over “N% cached” |
| Mandates | A count badge, or a dash |
| Incidents | A count badge, or 0 |
| (unlabelled) | The row actions |

The mockup's Status reads `enrolled` for every agent, including the 60 that Composition's Health marks `not enrolled`, and those agents still carry a tier. A build shows the recorded status, so Status and Health agree.

**Row actions**, in both column sets: **Edit** (the agent's Source tab; the mockup opens the Overview instead), **Roles** (opens `assignrole` for that agent), **Retire** (danger; opens `delagent`). Clicking anywhere else on a row opens the agent's Overview.

**List controls**, added by `listify()`: a search field (“Search this list”), sortable headers with `aria-sort`, facet selects derived from the columns in view (“All · Health” and “All · Runtime” on Composition, “All · Tier” and “All · Harness” on Operations), Rows (5, 10, 25, 50, All; 10 by default) and a pager (“1–10 of 68”). The Runtime facet lists each host and a bare dash for the agents with no host; a build words that option as no host. The Harness facet lists the harness labels, so it carries the fixture values the Harness data-source row flags.

**Panel note**, verbatim: “An agent has one principal and runs on one runtime. Its steering, its toolbelts and its tools are workspace objects it refers to, so changing one changes every agent that refers to it.”

**Dialogs this page opens.**

- `steerfleet`, titled “Steer the fleet”. A field labelled “Agents · 68 of 68 selected” with **All** and **None**, then one checkbox row per agent in the workspace, every one selected by default. A row shows the agent card with its run in flight (“run_01K5RS7M2E8FJ3QW · turn 7 · Cut 4.11.0 release notes”) and the run's status, or “no run in flight · reads this at its next model call” and an `idle` badge. The hint under the list: “Every agent in Core platform, selected by default. Steering the fleet is a grant you hold by role, not a default.” **Steering text** is a textarea filled with “Skip the mobile repo this cycle; 4.11.0 is platform only.” **Delivery** shows **At the boundary** (“Each agent finishes the turn it is on, then reads this before its next model call. Nothing in flight is cut. Idle agents read it at their next run.”) and an **Interrupt** switch (`role=switch`). Two hints follow: “Interrupt cuts the call in flight at the proxy on the gateway and contained tiers. On the harness tier a steer lands at the next checkpoint.” and “Recorded per run as a control.steer frame attributed to you.” A note closes the body: “Oxagen never executes steering as an instruction; it enters as evidence at the steering position with operator authority.” The footer reads “68 agents · 12 in flight · at the boundary” with **Cancel** and **Steer** (gold). With Interrupt on, the mode reads “Interrupt now”, the footer ends “interrupt” and the send button is **Send & Interrupt** (danger). **Steer** is disabled with no agent selected, and an empty text is refused with “A steer needs text. It is what the agent reads.”
- `deliveryreport` opens when the steer is sent. Title: the counts (“0 applied, 67 queued, 1 undelivered”). Subtitle: “Delivery report · 68 recipients · sent <time> · at the boundary”. Three stat boxes (Applied, Queued, Undelivered), the text as sent with its digest and token count, and a table: Agent and run · Status · Mode used · Time · Why. `applied` is the only success; `expired`, `cancelled` and `failed` count as undelivered. A recipient behind an armed kill switch, a muted agent, an agent that is not enrolled, and an `observe`-tier run are refused before anything is queued, each with its reason.
- `wz`, the agent wizard, titled “Create an agent”, with five steps: Describe, Identity, Definition, Toolbelt, Pull request. It ends on a pull request that adds `.oxagen/agents/<slug>.toml`. Its spec is `docs/creation-spec.md`.
- `assignrole`, titled “Assign a role”, for the row's agent: the agent-kind roles, each marked held where the agent holds it, and the line that effective permission stays the agent's roles intersected with its operator's grants.
- `delagent`, titled “Retire agent”: what is kept, what ends (roles, mandates, the host enrollment) and what is in flight, a confirmation checkbox, and **Retire agent** (danger).

New agent is not Register agent. Register wraps an agent that already runs; New agent writes one that does not exist yet. Both end on a pull request, from opposite ends.

**Shell.** The sidebar holds the organization and workspace switchers, the Workspace nav (Work, Agents, Tools, Steering, Runtimes, Spend, Repositories), the Organization nav (Organization, Billing, Audit), and at its foot the Stella launcher, the line “278 agents · shared plane” and the connection badge. Agents is lit and carries no count. The top bar holds the menu button, the breadcrumbs (Anderson Intelligence Corp. / Core platform / Agents), “Search or run an action” with ⌘K, notifications (`aria-label` “Notifications, 4 unread”), the Approvals button (`aria-label` “Approvals, 17 waiting”) that opens the drawer, and the account avatar.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. The mockup collection is a file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or a constant in `mockups/src/`. Backing today is `macanderson/oxagen` `main`; contract paths are under `packages/oxagen/src/contracts/`.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Live now | `RUNS` and `WORKORDERS` via `wsRunCounts()` | The run index with each run's status, and each run's parent work order | `list_runs` (`run.list.ts:476`) records `live`, `sealed` or `halted` (`run.list.ts:52`). No run status is `parked`: a parked run is one a pending approval names (`list_approvals`, `agent.approval.list.ts:80`). No store holds a work order, so a stage run that only its work order records cannot be counted | 🟡 |
| Agents registered | `AGENTS` | `list_agents` `totals.identities` | `agent.list.ts:175-178` | ✅ |
| Waiting on you | `APPROVALS` with `S.ap` | `list_approvals`, pending | `agent.approval.list.ts:80` | ✅ |
| Spend against budget | `SPEND.budgets`, scope `workspace · <ws>` | `get_spend_budget` for scope `workspace`: limit, spent, ratio, period | `billing.budget.get.ts:51`; scopes `org` and `workspace` (`billing.budget.get.ts:9`) | ✅ |
| Delegations held | `MANDATES` (active, agent in this workspace) | `list_mandates` with status `active`; `list_agents` `mandates` per row and `totals.holdingMandate`, `totals.mandateHolders` | `mandate.list.ts:28`; `agent.list.ts:117-121` and `:187-193`; table `tools.mandates` (`packages/database/src/schema/tools.ts:30`) | ✅ |
| Agent card, purpose, owner, principal | `AGENTS` (`mockups/fixtures/agents.json`) | `list_agents` `slug`, `name`, `agentKey`, `description`, `principalId`, `operatorName` | `agent.list.ts:61-74` | ✅ |
| Harness | `AGENTS` `harness`, `harnessLabel` | `list_agents` `harness` | Enum `stella`, `claude-code`, `codex`, `cursor`, `claude-agent-sdk`, `custom` (`agent.list.ts:24-31`). The mockup's `codex-cli`, `langgraph` and `openai-agents-sdk` are not values of it | 🟡 |
| Status | `AGENTS` `status` | `list_agents` `status`: `unenrolled`, `enrolled`, `suspended`, `retired` | `agent.list.ts:34-48`, `:75` | ✅ |
| Tier | `AGENTS` `tier` | `list_agents` `enforcementTier`, the tier the agent's latest root wrapped session recorded | `agent.list.ts:52-58`, `:78-83` | ✅ |
| Steering column | `STG_PREVIEW` via `agentSteering()` | The agent's envelope for its standing brief: SteeringFrames and tokens | No capability resolves an envelope without a run (#3879). `get_steering_deliveries` reports included and cut counts per recent run (`context.steering.deliveries.ts:6`) | ❌ |
| Toolbelt column, belts | `TOOLBELTS`, `TOOLBELT_ASSIGN` via `beltsOfAgent()` | A stored toolbelt and its assignments | No toolbelt table exists. The belt is computed per agent | ❌ |
| Toolbelt column and Belt, tool count and presentation | `belt`, `beltMode`, `beltTotal()` | `get_agent_toolbelt` `tools` and `presentation.mode` | `agent.toolbelt.get.ts:94-158`. `list_agents` leaves `beltSize` null (`agent.list.ts:84-85`), so a row needs one belt read per agent | 🟡 |
| Runtime column | `RUNTIMES` via `agentRuntime()` | `list_agents` `host`, `hosts`; `list_tacho_hosts` | `agent.list.ts:133-136`; `tacho.host.list.ts:6`. A host records its platform, OS and harnesses but no kind such as workstation or CI runner (`packages/oxagen/src/tacho/schemas.ts:50-124`) | 🟡 |
| Health | `agentHealth()` over `INCIDENTS`, `enrolled` and `tier` | Derived from `status`, `enforcementTier` and `tamperIncidents` (open tamper incidents) | `agent.list.ts:122-125` | ✅ |
| Activity, Runs 30d | `runs30` | `list_agents` `runs30d` | `agent.list.ts:86-87` | ✅ |
| Spend 30d | `spend30` | `list_agents` `spend30d`; `get_spend` grouped by agent | `agent.list.ts:88-94` sums wrapped sessions, `client_attested` only; gateway-observed spend is in `get_spend` (`spend.get.ts:34`) | 🟡 |
| Tokens 30d and cached share | `agentTok(a)` | `list_agents` `tokens30d` (`total`, `cacheReadRate`) | `agent.list.ts:95-116`, wrapped sessions only | 🟡 |
| Mandates | `a.mandates` | `list_agents` `mandates` | `agent.list.ts:117-121` | ✅ |
| Incidents | `tamperCount(a)` over `INCIDENTS` | `list_agents` `tamperIncidentsRecorded`; `list_incidents` | `agent.list.ts:126-130`; `tacho.incident.list.ts:66` | ✅ |
| `.oxagen/agents/ @ <commit>` | `a.commit` | The commit of the definitions of record | `get_agent` `definition.commitSha`, one agent at a time (`agent.get.ts:75-89`); no list field | 🟡 |
| Steer | `steerSend()` | `dispatch_command` `steer`, target `agent` or `workspace`, with a delivery mode; the per-recipient delivery report | `tacho.command.dispatch.ts:107`; modes `next_step`, `interrupt`, `turn_boundary` (`packages/tacho/src/wire.ts:566-570`); statuses (`wire.ts:536-546`). Wrapped runs only | ✅ |
| New agent | `wzOpen('agent')` | `propose_agent` | `agent.propose.ts:276` | ✅ |
| Register agent | `regStart()` | `register_agent`, `create_tacho_enrollment` | `agent.register.ts:17`; `tacho.enrollment.create.ts:25` | ✅ |
| Roles | `assignrole` over `S.agentRoles` | `assign_agent_role`, `list_agent_roles` | `agent.role.assign.ts:26`; `agent.role.list.ts:38` | ✅ |
| Retire | `delagent` | `retire_agent`, then a pull request that removes the file | `agent.retire.ts:16`. It retires the identity and leaves the file; removing it is a separate `commit_agent_definition` (`agent.retire.ts:1-9`) | 🟡 |

## Future-only fields

The view carries no `data-future` mark, and the catalog gives it no future story. Two fields the platform cannot back today are therefore unmarked in the design:

- **Steering** (Composition). A per-agent count of SteeringFrames needs a capability that resolves an envelope without a run (#3879). A build renders the cell as not recorded until that contract ships.
- **Toolbelt**, the “N belts” line (Composition). Named, stored toolbelts do not exist; the belt is computed per agent. A build shows the computed tool count from `get_agent_toolbelt` and renders the belt count as not recorded.

## Functionality

- The tiles are rollups of records a build can read. Live now and the Work backlog read one count (`wsRunCounts()`), so the two pages cannot disagree about what is live. Waiting on you counts the same pending approvals the Approvals drawer lists for this workspace.
- Both column sets read the same agent records. Switching changes which columns render and never which agents are listed, and neither set shows a number the other contradicts.
- Every Composition cell names a reusable object and states nothing the registry that owns it states. The row opens the agent, whose Overview links out to Tools, Steering or Runtimes.
- Assigning a toolbelt is not a permission. The belt says what an agent can reach; its roles, mandates and budgets say what it may do. A call has to pass both.
- Steer sends one `steer` command per selected agent, addressed to its live runs, and one per idle agent for its next run. Oxagen records each as a `control.steer` frame and delivers the text as an `invocation` SteeringFrame whose provenance is the command id and the digest of the text. It never runs the text as an instruction.
- New agent writes a pull request that adds `.oxagen/agents/<slug>.toml`; nothing is written to Postgres until the agent is registered after merge. Register agent mints the identity of an agent that already runs.
- Retiring an agent retires its principal and never deletes it, so its runs keep their identity. Removing the definition file is a pull request.
- The Health cell, the Incidents column and the agent's Activity tab read the same incident record the Audit page reads.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The top bar collapses to the menu button, the current crumb, search, notifications, Approvals and the avatar. The header actions wrap under the subtext with Register agent still the one gold button. The tiles go two by two. The Columns toggle and the commit line sit on their own rows in the panel header, the facet selects stack, and each table row becomes a card whose cells carry their column header, with the row actions at the foot of the card. Every dialog rises from the bottom edge as a sheet. Touch targets are at least 44 px, inputs are 16 px, and the page never scrolls sideways.

## Permissions

- Read: `list_agents` admits org Owner, Admin and Member, and workspace Owner and Member (`agent.list.ts:159-162`). The mockup names the permission `agent.read`.
- Writes, each a governed action recorded in Audit: Steer (`dispatch_command`: org Owner or Admin, workspace Owner or Member), New agent (`propose_agent`: org Owner or Admin), Register agent (`register_agent`: org Owner or Admin), Roles (`assign_agent_role`: org Owner or Admin, and never above the assigner's own grants), Retire (`retire_agent`: org Owner or Admin).

## Backend gaps this page depends on

- An envelope per agent without a run (#3879), for the Steering column.
- Stored toolbelts with assignments to agents, for the belt count.
- `beltSize` on `list_agents`, so the roster does not read one belt per row.
- A host kind (workstation, CI runner, hosted) on the host record.
- Gateway-observed spend and tokens rolled up per agent on `list_agents`, beside the client-attested figures it carries today.
- Work orders, so Live now can count a stage run its work order records.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- A Steering Source and a SteeringFrame are never shown as each other. The Steering cell counts frames; the sources behind them are on the agent's Steering tab.
- No person is scored or ranked. The operator column names who is accountable and carries no figure about them.
- Every enforcement claim states the tier. “Enforced” only for calls routed through Oxagen.
- Headers are rollups of the rows beneath them. Each tile is computed from the records it names, and the tab counts on the agent page agree with the row.
- Every badge that describes trust (tier, health, cost basis) shows the recorded value and nothing stronger.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. A quoted string above that breaks this rule is a mockup defect to fix, not copy to reproduce.
- Exactly one gold (primary) action per screen: Register agent. Inside an open dialog its primary button is the gold one.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- A count in navigation appears only where something waits on a person, so Agents carries none.
