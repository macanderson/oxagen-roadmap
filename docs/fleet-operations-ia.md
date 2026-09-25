# Fleet operations information architecture

| | |
|---|---|
| **Status** | Draft for review |
| **Date** | 2026-09-24 |
| **Owner** | Mac Anderson |
| **Design authority** | `fleet-operations-wedge.md` |
| **Related** | `fleet-operations-routes.md`, `fleet-operations-collapse.md`, `mockups/pages/README.md`, `mockups/catalog.mjs` |

## The shape

An operator comes to Oxagen with one of four questions, and each has one home.

| Question | Home |
|---|---|
| What should the agents work on, and what are they working on now? | Work |
| Who are the agents, and what are they allowed to do? | Agents, Tools |
| What do they know, and what are they told? | Steering |
| What did it cost, and where does the money go? | Spend |

Runtimes and Repositories are where the agents run and where their files live. Approvals and Stella are drawers, so a decision or a question never needs a page of its own.

## Workspace navigation

The sidebar lists the workspace areas in this order. A count appears only where something waits on a person.

| Item | Route | Count | Opens on |
|---|---|---|---|
| Work | `/{org}/{ws}/work` | Definitions of done waiting for certification, plus work orders waiting on you | Backlog |
| Agents | `/{org}/{ws}/agents` | none | The roster |
| Tools | `/{org}/{ws}/tools` | Observed schemas waiting for approval | Tools |
| Steering | `/{org}/{ws}/steering` | Open proposals and Steering record pull requests | Sources |
| Runtimes | `/{org}/{ws}/runtimes` | Runtimes whose health is not ok | The runtime list |
| Spend | `/{org}/{ws}/spend` | none | Overview |
| Repositories | `/{org}/{ws}/repositories` | Open pull requests Oxagen opened | Repositories |

The organization group follows, unchanged: Organization, Billing and Audit. The workspace root `/{org}/{ws}` opens Work. The foot of the sidebar keeps the Stella launcher and the connection badge.

**Phone.** The thumb bar holds Work, Agents, Tools, Spend and More. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers.

**Command menu.** ⌘1 to ⌘5 open Work, Agents, Tools, Steering and Spend. Its groups are Go, Stella, Create, Work orders, Runs, Agents, Approvals, Actions and Tools.

## Drawers

| Drawer | Opens from | Holds |
|---|---|---|
| Approvals | The shield button in the top bar, on every page, with the count of everything waiting on you | Every call parked for a person across the organization, and every open question. Picking one shows the full approval card, the same one the run shows. Each row names the run's work order |
| Stella | The launcher at the foot of the sidebar, More on a phone, and ⌘K | The in-app agent. It reads the page it was opened from (`ask_assistant` `pageContext`), so on a run it can answer from that run's Decision trace. Its changes go through the same governed actions a person uses |

## Work

The primary surface. Every run is a child of one work order, so everything live in the workspace is reachable from here.

| Tab | Route | Holds | Primary action |
|---|---|---|---|
| Backlog | `/{org}/{ws}/work` | Every open work item: its provider and number, subject, labels, status, owner, readiness, and the work order it is in. Tiles: ready, drafts waiting on you, in work orders, live now | Create work order and send to agent |
| Work orders | `/{org}/{ws}/work/orders` | Every work order, dispatched and direct: target, stage, runs, items claimed, state and spend | none |
| Workflows | `/{org}/{ws}/work/workflows` | The published workflow files and their stages | New workflow |
| Findings | `/{org}/{ws}/work/findings` | Each finding with the money behind it and its evidence. A finding becomes a work item | Create a work item from a finding |

Detail views:

| View | Route | Holds |
|---|---|---|
| Work item | `/{org}/{ws}/work/items/{item}` | The item as the provider holds it, its definition of done and who certified it, the work orders it was sent in, and their runs |
| Work order | `/{org}/{ws}/work/orders/{order}` | The stage chain, the definition of done with claims and evidence, the brief as sent, the SteeringFrames the send emitted, and the runs it started |

The Intake dialog opens from the Backlog header. It holds the provider connections, the field mapping and the people mapping that were the Providers, Fields and People tabs.

## Run

A run is a child record. Its route stays flat, `/{org}/{ws}/runs/{run}`, and its header and breadcrumb name its work order.

| Tab | Route | Holds |
|---|---|---|
| Decision trace | `/{org}/{ws}/runs/{run}` | Envelope, exclusions, choices, frames, plan changes when recorded, self-reported uncertainty when reported, and evidence |
| Transcript | `/{org}/{ws}/runs/{run}/transcript` | The recorded conversation and calls, with search and kind filters. Returned thinking is labelled as the provider's text |
| Cost | `/{org}/{ws}/runs/{run}/cost` | Tokens by class, spend by area, the per-turn waterfall and the model fit |
| Evidence | `/{org}/{ws}/runs/{run}/evidence` | The definition-of-done claims, the run's approvals, the issues it touched, linked work, and the chain and seal. The outputs stay in the right column on every tab |

The header keeps Pause, Resume, Steer, Cancel and Export by the run's state. Fork replay and Bisect are gone. The right column keeps the repository panel and the outputs.

## Agents

| View | Route | Holds |
|---|---|---|
| Agents | `/{org}/{ws}/agents` | The fleet as one population: tiles for live runs, what waits on you, spend against budget and delegations held; the roster with its Composition and Operations column sets; Steer and Register agent |
| Agent | `/{org}/{ws}/agents/{agent}` | Overview: composition, current work, tokens and recommendations |
| Identity | `/{org}/{ws}/agents/{agent}/identity` | Principal, credentials and the run credential |
| Steering | `/{org}/{ws}/agents/{agent}/steering` | The SteeringFrames this agent receives by type, and the sources they come from |
| Toolbelt | `/{org}/{ws}/agents/{agent}/toolbelt` | The computed toolbelt, each tool's decision, and what is off the toolbelt |
| Runtime | `/{org}/{ws}/agents/{agent}/runtime` | Host, harness, hooks, proxy and the tier earned |
| Permissions | `/{org}/{ws}/agents/{agent}/permissions` | Roles, budgets, and Delegation: every mandate the agent holds, as the delegation frames it emits |
| Activity | `/{org}/{ws}/agents/{agent}/activity` | The work orders this agent worked, their runs, tamper incidents and the accounting |
| Source | `/{org}/{ws}/agents/{agent}/source` | The agent definition file in the editor. Saving opens a pull request |

## Tools

Unchanged: Tools, Toolbelts, Providers, Policy and Kill switches, each a path segment under `/{org}/{ws}/tools`. Policy now owns every gate. Each gate's notice appears on Steering as a constraint frame from a policy source.

## Steering

| View | Route | Holds | Primary action |
|---|---|---|---|
| Sources | `/{org}/{ws}/steering` | Every Steering Source in one list: kind, what it emits, scope, version, hash, status, where it is managed, and the agents it reaches. A kind filter replaces the shelves. The header carries the governance mode and the skills setting | New source |
| Source | `/{org}/{ws}/steering/sources/{kind}/{id}` | One source: its file or record, its versions, the frames it emits with their types and hashes, its assignments, the runs that received its frames, and its pull requests. A skill shows its bundle: instructions, references and entrypoints as capability descriptors | Edit, which opens a pull request |
| Assignments | `/{org}/{ws}/steering/assignments` | Which sources reach which agents, by scope, with frame counts by type | none |
| Compiler | `/{org}/{ws}/steering/compiler/{agent}` | Pick an agent and a brief, and see the envelope: selected frames by injection point and type, exclusions with reasons, and the budget. Sends nothing | none |
| Proposals | `/{org}/{ws}/steering/proposals` | Candidates from memory, findings, steers and people, with their support | none |
| Pull requests | `/{org}/{ws}/steering/proposals/prs` | Open Steering record pull requests with their six checks | Merge, when every check passed |

## Spend

| View | Route | Holds |
|---|---|---|
| Overview | `/{org}/{ws}/spend` | Tiles, the month by day, and one table grouped by work order, operator, agent, model or tool. Picking a row opens its side panel. No drill page |
| Budgets | `/{org}/{ws}/spend/budgets` | Budgets by scope, period and mode, with each position |
| Optimization | `/{org}/{ws}/spend/optimization` | Wasted spend by cause, token composition and cache, recommendations for agents, and operator habits written as rules to adopt. Findings live in Work |

## Runtimes and Repositories

Unchanged. Runtimes lists the hosts and opens one host. Repositories keeps Repositories, Working copies, Changes and Configuration. Changes lists Steering record pull requests under that name.

## Organization

Unchanged: Organization (People, Roles, Invitations, Workspaces, Model funding and routes, Data plane, API keys), Billing and Audit.

## Links between objects

| From | To |
|---|---|
| Work item | Its work orders, and each one's runs |
| Work order | Its work items, its runs, its workflow, the SteeringFrames its send emitted, and its spend |
| Run | Its work order, its agent, its runtime, its Decision trace, and each frame's source |
| SteeringFrame | Its source at the version it names, and the runs that received it |
| Steering Source | The frames it emits, the agents it reaches, and its pull requests |
| Finding | Its evidence runs, and the work item it became |
| Agent | Its current work order, its runs, its sources, its toolbelt and its delegations |

## Vocabulary

The pages use one term per concept. Mac's copy specification of 2026-09-24 (#87, §2) sets the list. `tools/check-copy.mjs` walks every route and fails on a retired word. Where the wedge's design docs used a different word, the specification wins on the pages and in the page specs. A view id or a file name, such as `run-interjection`, is an identifier and keeps its spelling.

| Concept | Page word | Retired |
|---|---|---|
| A named set of tools on an agent | toolbelt | belt |
| How a toolbelt reaches the model | All tools sent, Searchable | Full belt, Searchable belt |
| Where tools come from | provider | server |
| Where work items come from | issue tracker | issue provider |
| How much a runtime can enforce | tier: observe, harness, gateway, contained | seam, client tier |
| The size of model an agent uses | model class: light, complex | model tier, light tier, Wrong tier |
| A run held for a person's answer | question | interjection |
| The part of steering picked for each prompt | per-prompt selection | volatile selection |
| The part of steering sent on every prompt | stable prefix | shelf, text plane, gate plane |
| A step in a run's record | frame, written out | fr 12 |
| Spend that bought no progress | unproductive spend | wasted spend |
| The amount above which a call waits for a person | auto-approve limit | a call at most, per call |
| A repository's relation to the workspace | main repository, linked repository, not linked | bind, not bound |
| Spend basis `gateway_observed` | Observed by gateway | the raw key |
| Spend basis `client_attested` | Reported by harness | the raw key |
| Where a hard budget or a steer takes effect | the next checkpoint | hook boundary |
| The product and the assistant | oxagen, stella | Oxagen, Stella |

The pages also leave out internal component names: kernel, reflector, archiver, manifest gate, deny generation, belt computation, shared plane, and opt-down. A page names what the component does instead, or defines the name once in a "How it works" disclosure.

## Unique views

Every unique view has a page spec in `mockups/pages/` and a loaded story in Storybook. The catalog is `mockups/catalog.mjs`. The story for a view is `Oxagen / <group> / <title>`.

| Id | View | Mockup route | Spec |
|---|---|---|---|
| `work-backlog` | Work, Backlog | `#/a-intel/core-platform/work` | `work-backlog.md` |
| `work-intake` | Work, Intake dialog | `#/a-intel/core-platform/work?intake=providers` | `work-intake.md` |
| `work-item` | Work item | `#/a-intel/core-platform/work/items/tsk_01K5RS482Q` | `work-item.md` |
| `work-orders` | Work, Work orders | `#/a-intel/core-platform/work/orders` | `work-orders.md` |
| `work-order` | Work order | `#/a-intel/core-platform/work/orders/wo_01K5RS7M4N` | `work-order.md` |
| `work-workflows` | Work, Workflows | `#/a-intel/core-platform/work/workflows` | `work-workflows.md` |
| `work-findings` | Work, Findings | `#/a-intel/core-platform/work/findings` | `work-findings.md` |
| `run` | Run, Decision trace | `#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW` | `run.md` |
| `run-transcript` | Run, Transcript | `#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/transcript` | `run-transcript.md` |
| `run-cost` | Run, Cost | `#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/cost` | `run-cost.md` |
| `run-evidence` | Run, Evidence | `#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/evidence` | `run-evidence.md` |
| `run-interjection` | Run held for an answer | `#/a-intel/core-platform/runs/run_01K6QW3D5N7TYBA2` | `run-interjection.md` |
| `agents` | Agents | `#/a-intel/core-platform/agents` | `agents.md` |
| `agent` | Agent, Overview | `#/a-intel/core-platform/agents/triage` | `agent.md` |
| `agent-identity` | Agent, Identity | `#/a-intel/core-platform/agents/triage/identity` | `agent-identity.md` |
| `agent-steering` | Agent, Steering | `#/a-intel/core-platform/agents/release-manager/steering` | `agent-steering.md` |
| `agent-toolbelt` | Agent, Toolbelt | `#/a-intel/core-platform/agents/triage/toolbelt` | `agent-toolbelt.md` |
| `agent-runtime` | Agent, Runtime | `#/a-intel/core-platform/agents/triage/runtime` | `agent-runtime.md` |
| `agent-permissions` | Agent, Permissions | `#/a-intel/finops/agents/invoice-bot/permissions` | `agent-permissions.md` |
| `agent-activity` | Agent, Activity | `#/a-intel/core-platform/agents/triage/activity` | `agent-activity.md` |
| `agent-source` | Agent source | `#/a-intel/core-platform/agents/release-manager/source` | `agent-source.md` |
| `tools` | Tools | `#/a-intel/core-platform/tools` | `tools.md` |
| `tools-toolbelts` | Tools, Toolbelts | `#/a-intel/core-platform/tools/toolbelts` | `tools-toolbelts.md` |
| `tools-providers` | Tools, Providers | `#/a-intel/core-platform/tools/providers` | `tools-providers.md` |
| `tools-policy` | Tools, Policy | `#/a-intel/core-platform/tools/policy` | `tools-policy.md` |
| `tools-switches` | Tools, Kill switches | `#/a-intel/core-platform/tools/switches` | `tools-switches.md` |
| `steering` | Steering, Sources | `#/a-intel/core-platform/steering` | `steering.md` |
| `steering-source` | Steering source | `#/a-intel/core-platform/steering/sources/record/ctx.release.notes-format` | `steering-source.md` |
| `steering-source-skill` | Steering source, a skill | `#/a-intel/core-platform/steering/sources/skill/a-intel.release-notes-from-prs` | `steering-source-skill.md` |
| `steering-assignments` | Steering, Assignments | `#/a-intel/core-platform/steering/assignments` | `steering-assignments.md` |
| `steering-compiler` | Steering, Compiler | `#/a-intel/core-platform/steering/compiler/release-manager` | `steering-compiler.md` |
| `steering-proposals` | Steering, Proposals | `#/a-intel/core-platform/steering/proposals` | `steering-proposals.md` |
| `steering-prs` | Steering, Pull requests | `#/a-intel/core-platform/steering/proposals/prs` | `steering-prs.md` |
| `runtimes` | Runtimes | `#/a-intel/core-platform/runtimes` | `runtimes.md` |
| `runtime` | Runtime | `#/a-intel/core-platform/runtimes/mbell-mbp-16` | `runtime.md` |
| `spend` | Spend, Overview | `#/a-intel/core-platform/spend` | `spend.md` |
| `spend-budgets` | Spend, Budgets | `#/a-intel/core-platform/spend/budgets` | `spend-budgets.md` |
| `spend-optimization` | Spend, Optimization | `#/a-intel/core-platform/spend/optimization` | `spend-optimization.md` |
| `repositories` | Repositories | `#/a-intel/core-platform/repositories` | `repositories.md` |
| `repositories-copies` | Repositories, Working copies | `#/a-intel/core-platform/repositories/working-copies` | `repositories-copies.md` |
| `repositories-changes` | Repositories, Changes | `#/a-intel/core-platform/repositories/changes` | `repositories-changes.md` |
| `repositories-config` | Repositories, Configuration | `#/a-intel/core-platform/repositories/configuration` | `repositories-config.md` |
| `approvals-drawer` | Approvals drawer | `#/a-intel/core-platform/work`, drawer open | `approvals-drawer.md` |
| `stella-drawer` | Stella drawer | `#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW`, drawer open | `stella-drawer.md` |

The organization pages, Register agent, the sign-in flows and onboarding keep their ids, routes and specs.
