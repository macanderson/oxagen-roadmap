## By scope

Every emitting source in the workspace, grouped by the scope that decides which agents it reaches.

### Purpose

It answers which scopes steer this workspace and how widely. Each row counts the sources in one scope, the SteeringFrame types they can emit, and the agents in the workspace that scope reaches. You read it to see where steering comes from before you open one agent's row below, or the Compiler.

### Rationale

Nobody assigns a source to an agent by picking it. A source reaches an agent when its scope matches: the organization, the workspace, the repository the agent works in, the agent itself, or a list of named agents. This panel makes that rule visible once per scope. It adds no control that attaches a source to an agent, and none should be added.

A narrower scope narrows a wider one and never widens it. A repository source may tighten what a workspace source allows. One that tries to loosen it is excluded as `widens_workspace_scope`, a reason from the closed vocabulary in `docs/fleet-operations-wedge.md`. The figures are eligibility, read from the same list Sources shows, so they never claim an agent was steered.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Sources and their scopes | `steeringSources()` over `RECORDS`, `SOURCES`, `SKILLS`, `MEMORY`, `ONTOLOGY`, `GATES`, `MANDATES`, `TOOLBELTS` | One read of every source kind with its scope (#3830) | partial |
| Sources per scope | `stgAssignmentsTab()` | A count over that read | partial |
| Frames by type | `typeCounts()`, `typeCountStrip()` | Frame types on SteeringFrames | future-only |
| Agents per scope | `reachOf()` over `wsAgentsOf()` | The agent registry against each scope (`list_agents`) | partial |

### Logic

- The panel counts only sources that emit something (`o.emitN`). The Sources column therefore sums to the Sources tab's rows less those that emit nothing.
- Each source joins one group. A source with a named-agent list (`agentsList`, a toolbelt or a kill switch that names agents) goes to Named agents. Agent scope goes to One agent each. Repository scope goes to a row per repository. `org` goes to Organization. Everything else goes to Workspace.
- The rows sort Organization, Workspace, each repository by name, One agent each, then Named agents. A scope with no emitting source has no row.
- One agent each carries the sub-line "agent definitions, agent-scoped records and memory, mandates". Named agents carries "toolbelt assignments and kill switches that name agents".
- Frames by type sums what the group's sources emit, one badge per type with its count, in the fixed type order. The cell carries the `frame types` future mark.
- Agents counts the workspace's agents that at least one source in the group reaches. `reachOf` matches a named list by slug or key, an agent scope by the agent, and a repository scope by the repository `stgAgent()` gives the agent. Every other scope reaches every agent in the workspace.
- The table is `data-lt="off"`, so it has no list controls.

### States

- Loaded only. The tab uses the Steering page's loading, error and denied panels.
- In a build, every Frames by type cell reads "not recorded" until frame types ship, and the organization, agent and named-agent scopes are not recorded for the kinds with no store.
- Mobile: each row becomes a card that leads with the scope and labels Sources, Frames by type and Agents.

## By agent

One row per agent in the workspace, with the sources whose scope reaches it and a link to resolve its envelope.

### Purpose

It answers what one agent is eligible for: how many sources reach it and which SteeringFrame types they can emit. From a row you open the Compiler to see what one brief would actually select for that agent.

### Rationale

The counts are eligibility before budget. The Compiler shows what the assembler selects for one agent and one brief, after scope, precedence, relevance and the token budgets. So every row ends in a Compiler link, and a row and its resolved envelope are one click apart.

The tier sits beside each agent because steering is delivered through the harness's hooks. An agent on `observe` has no hook: Oxagen assembles its envelope and delivers nothing, and its row says "assembled, not delivered" under the tier. The row never claims an agent was steered.

The tab is not an agent registry. It carries no spend, run count or status, and no agent is scored or ranked.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agents | `wsAgentsOf()` over `AGENTS` | The agent registry (`list_agents`) | shipped |
| Tier | `AGENTS[].tier` via `tierBadge()` | `enforcementTier` from the latest session | shipped |
| "assembled, not delivered" | `AGENTS[].tier === "observe"` | What the assembler resolved against what a hook delivered | partial |
| Sources | `reachOf()` over the emitting `steeringSources()` | A count over one read of every source kind | partial |
| Frames by type | `typeCounts()` | Frame types on SteeringFrames | future-only |
| Resolve | a route to `/steering/compiler/<slug>` | The Compiler capability (#3879) | future-only |

### Logic

- One row per agent in the workspace, in registry order. The Agent cell is the agent chip with its avatar and key in mono.
- Tier is the tier badge. An agent on `observe` adds "assembled, not delivered" under it.
- Sources counts the emitting sources whose scope reaches the agent (`reachOf`). The reach test is the one By scope uses.
- Frames by type sums what those sources emit, one badge per type, and carries the `frame types` future mark.
- Resolve is a **Compiler** link to `/steering/compiler/<slug>`, which opens the Compiler with that agent selected and its standing brief.
- The table takes the shared list controls: "Search this list", a Tier filter, Rows (10 by default) and a pager ("1–10 of 68" in Core platform).
- `get_steering_deliveries` reports what past manifests delivered and cut. It answers a different question and this panel does not render it.

### States

- Loaded only. The tab uses the Steering page's loading, error and denied panels.
- A workspace with no agents renders an empty table.
- In a build, Frames by type reads "not recorded" until frame types ship, and the Resolve link opens a Compiler that renders "not recorded" until #3879 ships.
- Mobile: each row becomes a card that leads with the agent chip and labels Tier, Sources, Frames by type and Resolve.
