# Agents

## Page header {#agents/header}

The header names the workspace and the page, and carries the three actions that direct the fleet or add to it.

### Purpose
The eyebrow names the workspace ("Core platform") and the h1 reads "Agents". The actions are the three things a person does to the population as a whole: **Steer agents…** sends one message to every selected agent, **Write a new agent…** drafts the definition of an agent that does not exist yet, and **Register agent** wraps an agent that already runs on a machine or in CI.

### Rationale
The Fleet page retired (D3 in `docs/fleet-operations-wedge.md`). Its population view, Steer and Register agent moved here, and its runs moved to each work order and each agent's Activity tab (`docs/fleet-operations-collapse.md`). So this header carries Steer and Register, and nothing links back to a Fleet page.

The header has no subtext. The page holds every actor in this workspace and what it is made of, and the Composition column set shows that without a sentence to say so.

Register agent is the one gold action on the screen. Write a new agent… and Register agent both end on a pull request, from opposite ends: Register starts from a running agent and mints its identity, and Write a new agent… starts from a description and writes a file that becomes an agent when it merges.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow | `ws().name` over `WS` | The workspace record | live |
| Steer agents… | `openSteerFleet()`, then `steerSend()` | `dispatch_command` `steer` (`tacho.command.dispatch.ts:107`) | live |
| Write a new agent… | `wzOpen('agent')` | `propose_agent` (`agent.propose.ts:276`) | live |
| Register agent | `regStart()` | `register_agent` (`agent.register.ts:17`) and `create_tacho_enrollment` (`tacho.enrollment.create.ts:25`) | live |

### Logic
- **Steer agents…** calls `openSteerFleet()`. It sets Delivery back to At the boundary (`S.steerInt=false`), clears any draft text (`S.steerText=null`), selects every agent `fleetAgents()` returns for this workspace, and opens `steerfleet`.
- **Write a new agent…** calls `wzOpen('agent')`. It builds a fresh draft in `S.wz` (harness `claude-code`, model class `complex`, no tools picked) and opens the five-step wizard on Describe.
- **Register agent** calls `regStart()`. It leaves the page for the gate at `#/a-intel/core-platform/register/name`, specified in `register-name.md`, `register-wrap.md` and `register-run.md`. `openDialog('wrap')` routes to the same gate.
- Each action is a governed write recorded in Audit. `dispatch_command` admits org Owner or Admin and workspace Owner or Member. `propose_agent` and `register_agent` admit org Owner or Admin. A build gates each on the server, not only by hiding the button.

### States
The catalog designs the loaded state only. In the mockup, loading renders `skeleton()`, error renders `errorState("Agents","503 iam_principals_unavailable")`, and denied renders `deniedState()` naming `agent.read on core-platform`; each replaces the header with the page body. On a phone the three actions wrap under the h1, and Register agent stays the one gold button.

## Tiles {#agents/tiles}

Four tiles give the fleet in four numbers: live runs, what waits on you, spend against the workspace budget, and delegations held.

### Purpose
Before the roster, the tiles answer the four questions a person brings to the population: is anything running, what needs me, how does spend stand against the budget, and which agents hold delegated authority. Three tiles open the place where you act on their number: Work orders, the Approvals drawer, and Spend › Budgets.

### Rationale
These are the tiles the Fleet page held, rewritten for the population when Fleet retired (D3; `fleet-tiles.tsx` moves to the Agents tiles in `docs/fleet-operations-collapse.md`). Each tile is a rollup of records a build can read, so an auditor can recount it, and a tile reads the same count as the page it opens. Live runs and Work read one count, and Waiting on you counts the same approvals the drawer lists.

No tile scores a person or an agent (D15). Delegations held opens nothing, because a mandate is a Steering Source managed on the agent's Permissions tab and there is no mandate page (D11 and the Cuts table).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Live runs | `RUNS` and `WORKORDERS` via `wsRunCounts()` | `list_runs` (`run.list.ts:476`) with each run's parent work order | partial |
| Parked on a person | `wsRunCounts().parked` | A run a pending approval names (`list_approvals`, `agent.approval.list.ts:80`) | partial |
| Agents registered | `AGENTS` in this workspace | `list_agents` `totals.identities` (`agent.list.ts:175-178`) | live |
| Waiting on you, approvals | `APPROVALS` with `apState()` | `list_approvals`, pending | live |
| Waiting on you, questions | `skWaiting(w)` | No contract named in the page spec | future |
| Spend against budget | `SPEND.budgets`, scope `workspace · <ws>` | `get_spend_budget` for scope `workspace` (`billing.budget.get.ts:51`) | live |
| Delegations held | `MANDATES`, active, agent in this workspace | `list_mandates` status `active` (`mandate.list.ts:28`); `list_agents` `totals.mandateHolders` | live |

### Logic
`agentsTiles(w,list)` in `wedge.js` renders the row.
- **Live runs**: `wsRunCounts()` counts runs whose `runStatus()` is `live`, plus each workflow stage run in state `live` that only its work order records. The caption opens with "N parked on a person · " only when a run is parked, then "N agents registered", every agent in the workspace. It opens Work › Work orders.
- **Waiting on you**: pending approvals whose run is in this workspace, or that name no run, plus an open question from an agent. The caption reads "N approvals in the drawer", singular at one, then "· 1 question from an agent" while one is open. It opens the Approvals drawer (`apdToggle(true)`).
- **Spend against budget**: the budget whose scope is `workspace · <slug>`, as used over limit in percent. The caption is used, limit, mode and period. With no workspace budget the number is a dash and the caption reads "no workspace budget set". It opens Spend › Budgets.
- **Delegations held**: active mandates held by this workspace's agents. The caption joins the holders' slugs with commas, or reads "no agent here holds a mandate".

On the demo record the tiles read 9, 8, 79% and 0. A build differs in two places. No run status is `parked` today, so a parked run is one a pending approval names. No store holds a work order, so a stage run only its work order records cannot be counted until work orders ship.

### States
Loaded only. On a phone the tiles go two by two. A build shows the shell's loading panel in place of the row and never flashes zeros.

## Registered agents

The roster of every agent registered in the workspace, in one of two column sets.

### Purpose
The heading names the workspace ("Registered in Core platform"). Each row answers who the agent is and either what it is made of (Composition, the default) or what it did and what it cost over the last 30 days (Operations). From a row you open the agent, edit it, assign it a role, or retire it.

### Rationale
The object model in `docs/agent-ontology-ia.md` puts the agent first: it has one principal and runs on one runtime. Its steering, its toolbelts, and its tools are workspace objects it refers to, so changing one changes every agent that refers to it. Composition is built on that rule. Each cell names a reusable object the agent holds a reference to and says nothing the registry that owns the object says. Operations keeps the rev1 columns, so no number was deleted: the default view answers what the agent is, and the second answers how it is doing. Both read the same agent records. Switching changes which columns render and never which agents are listed.

A toolbelt is not a permission. It says what an agent can see. Its roles, mandates and budgets say what it may do, and a call has to pass both. The toolbelt cell therefore shows width and presentation, and the Permissions tab shows authority.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent card, purpose, owner, principal | `AGENTS` (`fixtures/agents.json`) | `list_agents` `slug`, `name`, `agentKey`, `description`, `principalId`, `operatorName` | live |
| Harness | `AGENTS` `harness`, `harnessLabel` | `list_agents` `harness`; `codex-cli`, `langgraph` and `openai-agents-sdk` are not enum values | partial |
| Status, tier | `status`, `tier` | `list_agents` `status`, `enforcementTier` | live |
| Steering | `STG_PREVIEW` via `agentSteering()` | An envelope per agent without a run (#3879) | future |
| Toolbelt count | `TOOLBELTS`, `TOOLBELT_ASSIGN` via `beltsOfAgent()` | Stored toolbelts and assignments | future |
| Tool count, presentation | `beltTotal()`, `beltMode` | `get_agent_toolbelt` `tools`, `presentation.mode`; `list_agents` leaves `beltSize` null | partial |
| Runtime | `RUNTIMES` via `agentRuntime()` | `list_agents` `host`; `list_tacho_hosts`, which records no host kind | partial |
| Health, Incidents | `agentHealth()`, `tamperCount()` over `INCIDENTS` | `list_agents` `tamperIncidents`, `list_incidents` | live |
| Runs, spend, tokens (30 days) | `runs30`, `spend30`, `agentTok()` | `list_agents` `runs30d`, `spend30d`, `tokens30d`, wrapped sessions only | partial |
| Mandates | `a.mandates` | `list_agents` `mandates` | live |
| `.oxagen/agents/ @ <commit>` | `a.commit` of the first listed agent | `get_agent` `definition.commitSha`, one agent at a time | partial |

### Logic
- **Columns** is a two-button group (`role=group`, "Columns"). It writes `S.agentView` and re-renders. It is session state, so a link always opens on Composition.
- **Steering** reads "N records" (the gates, prefix and volatile items `agentSteering()` assembles) over "N tok", with "· not delivered" when the agent earns no hook. A dash means no standing brief is set up.
- **Toolbelt** reads "N tools" over "N toolbelts · All tools sent" or "· Searchable", with "from role grants" when no named toolbelt is assigned.
- **Health** is one badge from `agentHealth()`, first match wins: Tamper while a tamper incident is recorded, Not enrolled with no host, Observe on the `observe` tier, Healthy otherwise. The mockup counts resolved incidents as open, and `agentTamper()` matches an incident's scope by prefix, so `schema-guard-eu` takes on the incidents of `schema-guard`. A build counts open incidents recorded against the agent itself.
- Status and Health agree: an agent above `observe` is `enrolled`, and an `observe` agent reads `registered` and Not enrolled.
- **Row actions**: Edit (the Source tab; the mockup opens the Overview), Roles (`assignrole`), Retire (`delagent`). A click elsewhere on the row opens the agent.
- `listify()` adds search, sortable headers with `aria-sort`, facets from the columns in view, Rows (10 by default) and a pager.

### States
Loaded only in the catalog. The mockup's empty state reads "No agent registered in Core platform" with Register agent and Show CLI steps. The sentence under it says registering opens a pull request that adds the definition to `.oxagen/agents/`. The reason is that an agent's identity lives in Oxagen's database while its definition is a file in the main repo, and nothing reaches the database before that pull request merges. On a phone each row becomes a card whose cells carry their column header, with the actions at its foot.

## Steer the fleet {#dialog/steerfleet}

One steer, written once, sent to every selected agent in the workspace.

### Purpose
You use it when a change of direction applies to the whole fleet ("Skip the mobile repo this cycle; 4.11.0 is platform only."). You pick the recipients, write the text, choose when it lands, and send. The delivery report that opens next says, per recipient, whether it arrived.

### Rationale
Steer moved here with the Fleet page's population view (D3, `docs/fleet-operations-collapse.md`). Every agent in the workspace starts selected, because the dialog exists to address the fleet. Selecting them all is a default, and sending is a grant a person holds by role: `dispatch_command` admits org Owner or Admin and workspace Owner or Member. A steer enters the run as evidence, quoted and cited, at the steering position with operator authority. Oxagen does not run it as an instruction. It records it as a `control.steer` frame and delivers the text as an `invocation` SteeringFrame whose provenance is the command id and the digest of the text.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Recipients | `fleetAgents()` over `AGENTS` and `RUNS` | `list_agents`; each agent's live run from `list_runs` | live |
| Steering text | `S.steerText`, default `STEER_DEFAULT` | `dispatch_command` `steer` payload | live |
| Delivery mode | `S.steerInt` | Modes `next_step`, `interrupt`, `turn_boundary` (`packages/tacho/src/wire.ts:566-570`) | live |
| Per-recipient status | `steerSend()`, `steerRows()` | Command delivery statuses (`wire.ts:536-546`), wrapped runs only | live |
| Suppressions | `SWITCHES`, `STEER_MUTES` | Kill switches; a mute is a Steering record | partial |

### Logic
1. **Agents** lists each agent with its live or parked run ("run_… · turn 7 · Cut 4.11.0 release notes") and status, or "no run in flight · reads this at its next model call" and `idle`. All and None select every row or none. The hint reads "Every agent in Core platform, selected by default."
2. **Delivery**. At the boundary: each agent finishes its turn and reads the steer before its next model call. With Interrupt on, every selected agent with a run in flight stops where it stands, the in-flight tool call is canceled and recorded, and the steer is the first thing it reads. Interrupt cuts the call at the proxy on the `gateway` and `contained` tiers. On the `harness` tier a steer lands at the next checkpoint. Each run records a `control.steer` frame attributed to you, preceded by a `control.interrupt` frame naming the canceled call when Interrupt is on.
3. The footer reads "68 agents · 12 in flight · at the boundary". **Steer** is disabled with no agent selected, and empty text is refused ("A steer needs text. It is what the agent reads."). With Interrupt on the button is **Send & Interrupt** (danger).
4. `steerSend(true)` sorts each recipient before anything is queued. An armed kill switch or a mute cancels it. An agent that is not enrolled, or a run on `observe`, fails. A run gets a queued `control.steer` frame. An idle agent waits for its next run, and expires after 10 minutes (`STEER_TTL`). Then `deliveryreport` opens. Only `applied` counts as delivered.

The mockup differs from a build in two places. It records every fleet interrupt as a boundary steer with the reason "interrupt is not available on the <tier> tier". Its digest is two 32-bit string hashes printed with a `sha256:` prefix. A build interrupts where the tier allows and computes SHA-256 of the text.

### States
On a phone the dialog rises as a bottom sheet and the agent list scrolls inside it.

## Create an agent {#dialog/wz-agent}

A five-step wizard that turns a plain description into an agent definition and opens the pull request that adds it.

### Purpose
You use it for an agent that does not exist yet. The steps are Describe, Identity, Definition, Toolbelt and Pull request. It ends on a pull request that adds `.oxagen/agents/<slug>.toml`. To wrap an agent that already runs, the first step links to Register.

### Rationale
An agent is a definition in a repository before it is a principal in a database. Merging the pull request creates the principal, the roles the definition asks for, and the toolbelt. Until then the agent does not exist and nothing can be attributed to it. Nothing on these screens writes to the database. The wizard shares its shell with the tool, skill and record wizards (`docs/creation-spec.md`), so every creation in Oxagen reads the same way.

One job per agent: an agent with one job is an agent whose runs you can read, and two jobs in one definition is two agents.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Draft | `S.wz` from `wzNew('agent')` | Held in the browser until the pull request | live |
| Instructions | `assistProse('agent', …)` via `wzWand()` | The `oxagen.assistant` drafting turn | partial |
| Slug and key | `wzAgentSlug()`, `wzAgentKey()` | `propose_agent` input | live |
| Definition file | `wzAgentToml()` in the code editor (`cedHtml`) | `propose_agent` (`agent.propose.ts:276`) | live |
| Toolbelt picks | `WZ_BELT_POOL` with `TOOLS` | Tool patterns in the definition's `tools` | live |
| Pull request | `wzPrStep()` | The pull request on the main repo | live |

### Logic
1. **Describe**. One line in your own words, or one of four examples. **Draft it** stays disabled until the wand has rewritten the text (`wzDescOk()` needs `descAI`), and typing again resets it. The mockup's rewrite is deterministic.
2. **Identity**. Agent name, normalized to lower case, digits and hyphens, defaulting to the first two words of the description. The key is `<org>.<first segment of the workspace slug>.<slug>` and updates as you type. The key cannot change once it merges, and everything the agent does is attributed to it. Avatar, Harness (Claude Code, Stella, Codex CLI, Claude Agent SDK, Other), and Model class (`complex` or `light`). Oxagen generates the harness file beside the definition. A model class is a tier, not a model id, and the route behind it belongs to the organization and can change without touching this file.
3. **Definition**. The drafted TOML in an editor with Revert, parsed live. Chips show the slug, model tier, tool patterns and denied patterns, or the parse error, which blocks the next step. `tools` is a request, not a grant: the agent can reach this list intersected with its roles and your own grants, and never wider than either.
4. **Toolbelt**. Twelve tool versions to pick from. A pick that is irreversible or high or critical risk parks: each call stops at the gateway and waits for an approver, on every call, until someone writes an auto-approval rule. With nothing picked the definition falls back to `search_graph` and `recall_context`, a toolbelt that reads the graph and nothing else. Leaving the step writes the picks into the file unless you edited it by hand (`wzAgentSync()`).
5. **Pull request**. Branch `agents/<slug>` onto the main repo, three files (the definition, the generated harness file, and `.oxagen/workspace.toml`), and the checks: Schema, Key uniqueness, Toolbelt, Authority and Budget.

The footer names the grant the wizard needs (`agent.write`). The mockup names the harness file `.oxagen/agents/<slug>.claude.md` while the Overview shows `.claude/agents/<slug>.md`. A build uses one path.

### States
On a phone the wizard is a bottom sheet and the step rail scrolls.

## Register an agent {#dialog/register}

A short form that opens a pull request adding one agent's definition file.

### Purpose
It collects an agent name, an avatar, a harness and a model class, and opens a pull request that adds `.oxagen/agents/perf-watch.toml`. The Agents empty state and the Runtime tab's no-host state open it from **Show CLI steps**.

### Rationale
Registration writes a file first. The pull request adds the definition and the generated harness file beside it, and merging it creates the principal, the roles the definition asks for, and the toolbelt. Nothing is saved until then.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent name, key | Fixed `perf-watch` | `propose_agent` input | partial |
| Avatar | `newAgentAv()`, `openAvatar('new')` | The definition file | live |
| Harness | Fixed options | `list_agents` `harness` enum (`agent.list.ts:24-31`) | live |
| Model class | `complex`, `light` | `model_tier` in the definition | live |
| Open the pull request | Toast only | `propose_agent` (`agent.propose.ts:276`) | partial |

### Logic
- The hint states the format and the limit: "The agent key becomes `a-intel.core.perf-watch` and can't be changed later." It does not update as you type.
- Harness starts on "Choose the harness". The options are Claude Code, Codex, Cursor, Stella, Claude Agent SDK and Other (SDK-wrapped).
- **Open the pull request** closes the dialog and toasts "a-intel/platform#522 opened." It validates nothing and writes nothing.

The dialog has three known defects that the page specs name (`agent-runtime.md`, `runtimes.md`). The button that opens it reads Show CLI steps, yet it shows no CLI steps. It always proposes `perf-watch`, an agent the workspace already has. A build shows the enrollment command for this agent and the installers that put the CLI on the host's path.

### States
On a phone it rises as a bottom sheet.

## Assign a role {#dialog/assignrole}

Adds one agent-kind role to one agent.

### Purpose
It opens from the row's **Roles** button, the Permissions tab's **Assign a role**, and **Assign role** in Edit identity. You pick a role, a repository when the role is repository-scoped, and a reason, then assign.

### Rationale
A role widens what the agent may call, but never past its operator. The agent can still do only what both its roles and its operator's grants allow, so a role cannot lift an agent above the person accountable for it. A repository-scoped role applies to one repository, which is why the Repository field appears only for such a role.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Roles listed | `ROLES` where `kind` is `agent` | `list_agent_roles` (`agent.role.list.ts:38`) | live |
| Roles held | `S.agentRoles` via `agentRolesOf()` | `list_agent_roles` | live |
| Repository | `ws().main` and `ws().linked` | The workspace's repositories | live |
| Assign | `roleAssign()` | `assign_agent_role` (`agent.role.assign.ts:26`) | live |

### Logic
- The Role select lists every agent-kind role with its description. A held role is marked "· held" and disabled, and the first unheld role is selected. The hint "Only agent-kind roles are listed." links to Manage roles.
- **Assign** builds the full id, `role(repository)` for a repository-scoped role. A role the agent already holds is refused with "<key> already holds <role>." Otherwise the role joins the agent's list and the toast reads "<role> assigned to <key> · “<reason>”. Effective at its next call."
- `assign_agent_role` admits org Owner or Admin, and never above the assigner's own grants. The mockup keeps the reason only in the toast. A build records it with the audit event.

### States
With no agent in `S.dlgArg` the dialog renders empty. On a phone it is a bottom sheet.

## Retire agent {#dialog/delagent}

Ends an agent's identity after one confirmation.

### Purpose
It opens from the row's **Retire** and the agent header's **Retire agent**. It says what retiring ends and what it keeps, then asks you to confirm.

### Rationale
Retiring revokes the credential, kills every run token at the next call, and opens a pull request that archives `.oxagen/agents/<slug>.toml`. The principal is retired and kept, never reused, so every run, frame and receipt keeps its identity and stays in the record. Re-registering creates a new principal. That is why the action needs a checkbox: it cannot be undone.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Roles, mandates | `agentRolesOf()`, `a.mandates` | `list_agent_roles`, `list_agents` `mandates` | live |
| In flight | `RUNS` with status `live` for this agent | `list_runs` | live |
| Retire agent | `agentDelete()` | `retire_agent` (`agent.retire.ts:16`), then `commit_agent_definition` | partial |

### Logic
- The dialog lists Kept (every run, frame and receipt), Ends (N roles, N mandates, the host enrollment), and In flight only when live runs exist ("N live runs, canceled at the next checkpoint and recorded").
- **Retire agent** (danger) stays disabled until "I understand this cannot be undone" is checked.
- `agentDelete()` removes the agent, drops its roles, lowers the workspace's agent count, returns to Agents, and toasts "<key> retired. Credential revoked, definition archived by pull request, every run and frame kept."
- The mockup deletes the agent from `AGENTS`. A build retires the principal and keeps it. `retire_agent` retires the identity and leaves the file, and removing the file is a separate `commit_agent_definition`. `retire_agent` admits org Owner or Admin.

### States
On a phone it is a bottom sheet with the button at its foot.
