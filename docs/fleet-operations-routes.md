# Fleet operations routes

| | |
|---|---|
| **Status** | Draft for review |
| **Date** | 2026-09-24 |
| **Owner** | Mac Anderson |
| **Design authority** | `fleet-operations-wedge.md` |
| **Checked against** | `apps/app/src/shared/safe-path.ts` and `apps/app/src/shared/legacy-routes.ts` in `macanderson/oxagen` `main` at `1ba160dbc`; `route()` in `mockups/src/engine.js` |

## Rules

1. Every view has one canonical path. An old path lands on it, and nothing else points at the old one.
2. A tab or a filter is a path segment only where the view already had one. A kind filter, a grouping and a key are query values, as `ARCHITECTURE.md` §1.2 sets for filters.
3. A path that named a page this change deletes lands on the view that absorbed it. None of them becomes a 404.
4. The app answers an old path with a 308 through `responseRedirect` (`proxy.ts`, INV-13), or in place where the page already resolves aliases without a redirect (`AGENT_SECTION_ALIASES`, `STEERING_SEGMENTS`). The workspace root is a landing, so it answers 307.
5. The mockup rewrites an old hash in place with `history.replaceState`, the way it already moves `#/:org/:ws/skills` under Steering, so every scenario, doc and bookmark keeps working.

How each row lands:

| Kind | Meaning |
|---|---|
| same | The path is unchanged. Its content may change |
| 308 | Permanent redirect to the canonical path |
| 307 | Temporary redirect. Used for the workspace landing only |
| in place | The page resolves the alias without a redirect, as tab aliases do today |
| lookup 308 | The server reads one record to build the target, then answers 308 |

## Workspace

| Old path | Canonical path | Kind | Note |
|---|---|---|---|
| `/{org}/{ws}` (Fleet) | `/{org}/{ws}/work` | 307 | The workspace opens on Work. `routes.fleet` becomes `routes.work`, and `landing.ts` sends a new session to it |
| `/{org}/{ws}?cursor=…` (Fleet runs, a later page) | `/{org}/{ws}/work/orders` | 308 | Runs are listed under their work orders. The cursor is dropped |

### Work

| Old path | Canonical path | Kind | Note |
|---|---|---|---|
| none | `/{org}/{ws}/work` | new | Backlog |
| none | `/{org}/{ws}/work/items/{item}` | new | One work item |
| none | `/{org}/{ws}/work/orders` | new | Work orders |
| none | `/{org}/{ws}/work/orders/{order}` | new | One work order |
| none | `/{org}/{ws}/work/workflows` | new | Workflows. A workflow opens as a dialog over this tab, `?workflow={id}` |
| none | `/{org}/{ws}/work/findings` | new | Findings. A finding's evidence opens as a dialog, `?finding={fnd}` |
| `/{org}/{ws}/spend/findings` | `/{org}/{ws}/work/findings` | 308 | Findings are work |
| `/{org}/{ws}/spend?finding={fnd}` | `/{org}/{ws}/work/findings?finding={fnd}` | 308 | The evidence dialog keeps its query value |

The mockup drew Tasks at `#/:org/:ws/tasks…`. The app never built it, so these rows exist in the mockup alone.

| Old mockup hash | Canonical hash | Kind |
|---|---|---|
| `#/:org/:ws/tasks` | `#/:org/:ws/work` | in place |
| `#/:org/:ws/tasks/{task}` | `#/:org/:ws/work/items/{task}` | in place |
| `#/:org/:ws/tasks/work-orders` | `#/:org/:ws/work/orders` | in place |
| `#/:org/:ws/tasks/work-orders/{wo}` | `#/:org/:ws/work/orders/{wo}` | in place |
| `#/:org/:ws/tasks/workflows` | `#/:org/:ws/work/workflows` | in place |
| `#/:org/:ws/tasks/providers`, `…/fields`, `…/people` | `#/:org/:ws/work`, with the Intake dialog open on that section | in place |

### Runs

| Old path | Canonical path | Kind | Note |
|---|---|---|---|
| `/{org}/{ws}/runs/{run}` | same | same | Opens the Decision trace. The header and breadcrumb name the work order |
| `?tab=transcript` | `/{org}/{ws}/runs/{run}/transcript` | 308 | In the app a run's tab was a query value. It becomes a segment, as in the mockup |
| `?tab=cost` | `/{org}/{ws}/runs/{run}/cost` | 308 | |
| `?tab=context`, `policy`, `frames`, `player`, `approvals` | `/{org}/{ws}/runs/{run}` | 308 | The Decision trace absorbed the context, policy and governed actions tabs |
| `?tab=issues`, `chain`, `proof`, `dod`, `ladder` | `/{org}/{ws}/runs/{run}/evidence` | 308 | Evidence absorbed the issues and chain and seal tabs |
| `?kinds=`, `?frames=`, `?body=` | the same query values on `/transcript` | 308 | Transcript filters keep their names |
| `?reads=`, `?spine=` | the same query values on `/evidence` | 308 | The outputs spine moved to Evidence |

`routes.run` gains a `tab` of `trace`, `transcript`, `cost` or `evidence`, and `trace` is the bare path.

### Agents

| Old path | Canonical path | Kind | Note |
|---|---|---|---|
| `/{org}/{ws}/agents` | same | same | Gains the fleet tiles |
| `/{org}/{ws}/agents/{agent}/{tab}` | same | same | Tabs: overview, identity, steering, toolbelt, runtime, permissions, activity |
| `…/enrollment`, `…/budgets`, `…/mandates`, `…/incidents`, `…/runs` | runtime, permissions, permissions, activity, activity | in place | Unchanged, `AGENT_SECTION_ALIASES` |
| `/{org}/{ws}/agents/{agent}/definition` | `/{org}/{ws}/agents/{agent}/source` | 308 | One editor for one file |
| `/{org}/{ws}/agents/{agent}/source` | same | same | |
| `/{org}/{ws}/mandates/{mandate}` | `/{org}/{ws}/agents/{agent}/permissions?delegation={mandate}` | lookup 308 | The server reads the mandate for its agent. The Delegation section opens on that mandate. `routes.mandate` retires |
| `#/:org/:ws/agents/{agent}/mandates/{mandate}` (mockup) | `#/:org/:ws/agents/{agent}/permissions` | in place | The delegation is highlighted |
| `/{org}/{ws}/register/{step}` | same | same | |

### Tools

| Old path | Canonical path | Kind | Note |
|---|---|---|---|
| `/{org}/{ws}/tools[/{tab}]` | same | same | Tabs: tools, toolbelts, providers, policy, switches |
| `…/servers`, `…/connections`, `…/registry`, `…/autoapprovals` | providers, providers, tools, policy | in place | Unchanged |
| `/{org}/{ws}/tools/mandates` | `/{org}/{ws}/agents` | 308 | The mandates ledger the app drew on Policy moves to each agent's Delegation section. The roster's Delegation column lists who holds one |

### Steering

| Old path | Canonical path | Kind | Note |
|---|---|---|---|
| `/{org}/{ws}/steering` | same | same | Sources replaces the Library's All shelf |
| `/steering/library` | `/steering` | 308 | |
| `/steering/records` | `/steering?kind=record` | 308 | The shelf becomes a kind filter |
| `/steering/instructions` | `/steering?kind=instruction` | 308 | |
| `/steering/skills` | `/steering?kind=skill` | 308 | |
| `/steering/memory` | `/steering?kind=memory` | 308 | |
| `/steering/ontology` | `/steering?kind=glossary` | 308 | An ontology note is a glossary term |
| `/steering/records/{lineage}` | `/steering/sources/record/{lineage}` | 308 | `routes.steeringRecord` becomes `routes.steeringSource(kind, id)` |
| `/steering/skills/{skill}/source` | `/steering/sources/skill/{skill}` | 308 | The skill's bundle and editor live on its source page |
| `/steering/gates`, `/policy`, `/settings`, `/freshness` | `/{org}/{ws}/tools/policy` | 308 | Tools › Policy owns every gate, the freshness gates included |
| `/steering/assignments`, `/deliveries` | `/steering/assignments` | same, in place | |
| `/steering/compiler[/{agent}]` | same | same | |
| `/steering/preview/{agent}` | `/steering/compiler/{agent}` | in place | Unchanged |
| `/steering/proposals` | same | same | |
| `/steering/proposals/prs`, `/steering/prs` | `/steering/proposals/prs` | same, in place | |
| `/steering?tab={id}` | the path its id names in this table | 308 | Unchanged rule, new targets |
| `/{org}/{ws}/skills`, `/skills/{…}` | `/steering?kind=skill` | 308 | The target moves from `/steering/skills` |

`STEERING_SEGMENTS` in `safe-path.ts` keeps `sources`, `assignments`, `compiler` and `proposals`, and maps every older id to the rows above.

### Spend

| Old path | Canonical path | Kind | Note |
|---|---|---|---|
| `/{org}/{ws}/spend` | same | same | Opens Overview, not Findings |
| `/spend/tokens`, `/spend/coaching`, `/spend/waste` | `/spend/optimization` | 308 | |
| `/spend/operator`, `/agent`, `/model`, `/tool` | `/spend?by=operator`, `agent`, `model`, `tool` | 308 | A grouping is a query value |
| `/spend/task` | `/spend?by=work` | 308 | Spend by work order replaces spend by task reference |
| `/spend/cost_center` | `/spend?by=cost_center` | 308 | ADR-142 stays |
| `/spend/pricing` | `/spend?by=model` | 308 | Each model row names its price and the models the book cannot price |
| `/spend/{operator,agent,tool}/{key}` | `/spend?by={kind}&key={key}` | 308 | The key opens the side panel. There are no drill pages |
| `/spend/budgets` | same | same | |

`routes.spend` takes `{ view: "overview" | "budgets" | "optimization", by?, key? }`.

### Runtimes and Repositories

Unchanged. `/{org}/{ws}/runtimes[/{runtime}]` and `/{org}/{ws}/repositories[/{tab}[/{change}]]` keep every path.

## Organization and sign-in

Unchanged: `/{org}`, `/{org}/roles`, `/{org}/api-keys`, `/{org}/model-funding`, `/{org}/sso`, `/{org}/billing`, `/{org}/audit[/{tab}]`, the sign-in routes, `/invite/{token}`, `/new-organization`, `/welcome/…` and `/cli/…`.

## Appendix F

`legacy-routes.ts` answers the Appendix F table with 308s. Three of its targets move.

| Old target | New target |
|---|---|
| Fleet, for the knowledge and workbench pages | `/{org}/{ws}/work` |
| `/steering?tab=skills`, for the skills pages | `/steering?kind=skill` |
| `/steering`, for `knowledge/memory` | `/steering?kind=memory` |

## Route builders

A design note for the lane that builds this. Nothing here is implemented.

| `routes` today | After |
|---|---|
| `fleet(org, ws, { cursor })` | `work(org, ws, { tab?: "orders" \| "workflows" \| "findings", intake?, finding?, workflow? })` |
| none | `workItem(org, ws, item)`, `workOrder(org, ws, order)` |
| `run(org, ws, run, { tab, kinds, frames, body, reads, spine })` | `run(org, ws, run, { tab?: "transcript" \| "cost" \| "evidence", kinds, frames, body, reads, spine })`, with the tab as a segment |
| `agent(org, ws, agent, { tab })` | Unchanged, with `definition` aliased to the source page |
| `mandate(org, ws, mandate, …)` | Retired. `agent(org, ws, agent, { tab: "permissions", delegation })` |
| `skills(org, ws, { cursor })` | `steering(org, ws, { kind: "skill" })` |
| `steeringRecord(org, ws, lineage)` | `steeringSource(org, ws, kind, id)` |
| `steering(org, ws, { tab, agent, skill, kind, … })` | `steering(org, ws, { tab?: "assignments" \| "compiler" \| "proposals" \| "prs", agent, kind, … })` |
| `spend(org, ws, { tab, drill, finding })` | `spend(org, ws, { view?: "budgets" \| "optimization", by?, key? })` |
