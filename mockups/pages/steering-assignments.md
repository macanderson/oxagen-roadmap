# Steering › Assignments

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/assignments`. Old route: `/steering/deliveries`, resolved in place to `/steering/assignments` (`docs/fleet-operations-routes.md`, Steering). The mockup rewrites `#/:org/:ws/steering/deliveries` in place |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D4 (a source and a frame are two objects), D5 (eight frame types), D11 (mandates), D12 (skills), D13 (memory and glossary terms); the Steering sections Emissions and Shipped today; the vocabulary row Assignment. `docs/fleet-operations-ia.md` (Steering, Assignments). ADR-093 in `macanderson/oxagen` |
| Design | `mockups/src/wedge.js`: `stgAssignmentsTab`, `steeringSources`, `reachOf`, `typeCounts`, `typeCountStrip`, inside `pSteering`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Steering / Assignments`: Loaded, Loaded · mobile, and Loaded · future-only fields marked |
| Audit | `steering-assignments.audit-prompt.md` |

## Job

Which Steering Sources reach which agents. Nobody assigns a source to an agent by picking it: a source reaches an agent when its scope matches, the organization, the workspace, the repository the agent works in, the agent itself, or a list of named agents. This tab makes that rule visible twice, once per scope and once per agent, with the SteeringFrame types each can emit.

The counts here are eligibility before budget. The Compiler (`steering-compiler.md`) shows what the assembler selects for one agent and one brief, and every agent row links to it.

## What is on the page

**Header, tabs and shell.** As `steering.md`, with Assignments selected. The kind filter does not render on this tab. New source keeps the gold in the header; the body holds no gold.

**By scope** panel.

- Heading "By scope". Caption: "Frames each scope can emit, and the agents in Core platform it reaches. A narrower scope narrows a wider one and never widens it."
- A table with no list controls. Columns, in order: Scope, Sources, Frames by type and Agents.
- Rows, in this order: Organization, then Workspace, then one row per repository in name order, then One agent each, then Named agents. A scope with no emitting source has no row.

| Scope | Sources | Frames by type | Agents |
|---|---|---|---|
| Organization | 7 | `constraint` 5, `context` 2 | 68 |
| Workspace Core platform | 53 | `constraint` 25, `procedure` 8, `context` 23, `capability` 1 | 68 |
| Repository `a-intel/billing` | 1 | `procedure` 1 | 0 |
| Repository `a-intel/mobile` | 2 | `constraint` 2 | 0 |
| Repository `a-intel/platform` | 17 | `goal` 1, `invariant` 1, `constraint` 11, `procedure` 4, `context` 4 | 68 |
| One agent each, with "agent definitions, agent-scoped records and memory, mandates" under it | 74 | `constraint` 2, `procedure` 68, `context` 4 | 68 |
| Named agents, with "toolbelt assignments and kill switches that name agents" under it | 10 | `constraint` 2, `capability` 21 | 4 |

- Sources counts the emitting sources in the scope. The column sums to 164: the 185 sources on Sources less the 21 that emit nothing.
- Frames by type sums what those sources emit, one badge per type with its count.
- Agents counts the agents in the workspace that at least one source in the scope reaches.

**By agent** panel.

- Heading "By agent". Caption: "What each agent is eligible for before budget. The Compiler shows what one brief selects."
- The shared list controls: "Search this list", a Tier filter ("All · Tier", then contained, gateway and harness in Core platform), Rows (5, 10, 25, 50, All; 10 by default) and a pager ("1–10 of 68").
- Columns, in order:
  - **Agent**: the agent chip, its avatar and key in mono (`a-intel.core.release-manager`).
  - **Tier**: the tier badge. An agent on `observe` adds "assembled, not delivered" under it (Data platform has three: `a-intel.data.dbt-runner` among them).
  - **Sources**: the emitting sources whose scope reaches the agent.
  - **Frames by type**: what those sources emit, one badge per type with its count.
  - **Resolve**: a **Compiler** link to `/steering/compiler/<slug>`.
- The first rows in Core platform:

| Agent | Tier | Sources | Frames by type |
|---|---|---|---|
| `a-intel.core.release-manager` | gateway | 88 | `goal` 1, `invariant` 1, `constraint` 43, `procedure` 13, `context` 31, `capability` 19 |
| `a-intel.core.stella-ci` | contained | 83 | `goal` 1, `invariant` 1, `constraint` 41, `procedure` 13, `context` 29, `capability` 16 |
| `a-intel.core.triage` | gateway | 88 | `goal` 1, `invariant` 1, `constraint` 42, `procedure` 13, `context` 30, `capability` 22 |
| `a-intel.core.docs-writer` | harness | 84 | `goal` 1, `invariant` 1, `constraint` 42, `procedure` 13, `context` 30, `capability` 14 |
| `a-intel.core.pr-reviewer` | gateway | 78 | `goal` 1, `invariant` 1, `constraint` 41, `procedure` 13, `context` 29, `capability` 1 |

**Dialogs.** The header's `govmode`, `skcfg` and `newsrc`, as `steering.md` specifies. The tab opens none of its own.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in `macanderson/oxagen` | Status |
|---|---|---|---|---|
| The sources and their scopes | `steeringSources()` over `RECORDS`, `SOURCES`, `SKILLS`, `MEMORY`, `ONTOLOGY`, `GATES`, `MANDATES`, `TOOLBELTS` | Every Steering Source's scope, in one read | A Steering record's sharing scope is `workspace` or `repository` (`packages/oxagen/src/contracts/context.steering.shared.ts:37`). A mandate names its agent (`list_mandates`, `mandate.list.ts:29`). An agent definition is its agent's (`list_agent_defs`, `agent.definition.list.ts:6`). The organization, agent and named-agent scopes of the other kinds have no store (#3830) | 🟡 |
| Sources per scope and per agent | `reachOf()`, `stgAssignmentsTab()` | A count over the same read | Derivable for records, mandates and agent definitions only | 🟡 |
| Frames by type | `typeCounts()` | Frame types on SteeringFrames | `steering.manifest` items carry no type (`packages/tacho/src/wire.ts:626-697`) | ❌ |
| Agents reached per scope | `reachOf()` over `AGENTS` | The agent registry against each scope | `list_agents` (`agent.list.ts:142`). A repository scope needs the repository each agent works in, which the registry does not carry | 🟡 |
| The agents | `AGENTS` in the workspace | The agent registry | `list_agents` returns each agent's key, harness and status (`agent.list.ts:58-75`) | ✅ |
| Tier | `AGENTS[].tier` | The tier the agent's latest session recorded | `list_agents` `enforcementTier` (`agent.list.ts:83`) | ✅ |
| "assembled, not delivered" | `AGENTS[].tier === "observe"` | What the assembler resolved against what a hook delivered | An `observe` run has no hook, so no `steering.manifest` frame is sealed for it. Nothing records an assembly that was not delivered | 🟡 |
| Resolve, the Compiler link | a route | The Compiler for one agent | No capability runs the assembler without delivering (#3879) | ❌ |
| What was delivered, per run | none on this tab | `steering.manifest` frames | `get_steering_deliveries` reports, per recent run, the records a manifest included and cut and the records left undelivered (`context.steering.deliveries.ts:7`). It answers what was delivered, not what a scope makes eligible, and the tab does not render it | ✅ |

## Future-only fields

| Mark | Reason | What a build shows today |
|---|---|---|
| Every Frames by type cell, in both tables | `frame types` | "not recorded" in the cell, never a type list derived from a source's kind |

These are future-only in `macanderson/oxagen` and carry no mark in the mockup: the Sources counts for any scope beyond records, mandates and agent definitions, the organization, agent and named-agent scopes, and the Compiler the Resolve link opens. A build renders each as not recorded until its contract ships. The Compiler the Resolve link opens is future-only as a whole (`steering-compiler.md`).

## Functionality

- Assignment is by scope. No control on the tab attaches a source to an agent, and none is added: a source reaches an agent because the organization, the workspace, the repository, the agent or a named list matches.
- A narrower scope may narrow a wider one and never widen it. The assembler excludes a repository source that tries, as `widens_workspace_scope`.
- The numbers are eligibility before budget, read from the same list Sources shows. By scope's Sources column sums to the emitting sources on Sources.
- An agent on `observe` has no hook, so it is assembled for and receives nothing; its row says so under the tier.
- Compiler opens `/steering/compiler/<slug>` with that agent selected, so a row and its resolved envelope are one link apart.
- The tab is not an agent registry. It carries no spend, run count, incident count or status for an agent.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with More lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The four tabs are one strip that scrolls sideways with Assignments in view. Both tables become stacks of cards: a By scope card leads with the scope and labels Sources, Frames by type and Agents; a By agent card leads with the agent chip and labels Tier, Sources, Frames by type and Resolve. The type badges wrap inside a card. The page never scrolls sideways; touch targets are at least 44 px and inputs are 16 px.

## Permissions

- Read: the Steering read, `steering.read on core-platform` in the mockup's denied panel. `list_agents` allows an organization Owner, Admin or Member and a workspace Owner or Member. `get_steering_deliveries` allows an organization Owner, Admin or Compliance and a workspace Owner, Admin, Member, Viewer or Compliance.
- No write on this tab. Opening an agent needs the agent read; the Compiler needs the Steering read.

## Backend gaps this page depends on

- One read of every source kind with its scope (#3830).
- Frame types on SteeringFrames (wedge spec, Shipped today).
- The repository each agent works in, so a repository scope resolves to agents.
- Organization, agent and named-agent scopes on the source kinds that carry them in the design.
- The Compiler capability, which the Resolve link opens (#3879).

## Rules every build of this page must keep

- A Steering Source and a SteeringFrame are never shown as each other. This tab counts sources and the frame types they can emit; it lists no frame.
- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- A row says what is eligible, and never that an agent was steered. An `observe` agent is assembled for and receives nothing, and the row says so.
- Every enforcement claim states the tier. "Enforced" only for calls routed through Oxagen.
- Headers are rollups of the rows beneath them: the Sources, Frames by type and Agents figures read the same list as Sources.
- No person is scored or ranked, and no agent is either.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing; the mockup's two-sentence captions under By scope and By agent are design defects, not patterns to copy.
- Exactly one gold action per screen: the header's New source. Nothing in the body is gold.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
