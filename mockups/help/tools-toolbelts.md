# Toolbelts

The named sets of tool versions that put tools in front of agents, who carries each set, and the dialogs that open one or create one. The header and tab bar are in `tools.md`.

## Toolbelts

The catalogue of toolbelts in this workspace, each with its tools, the providers behind them, the agents that carry it, and whether every tool on it can be called today.

### Purpose
It answers "which named sets of tools exist, who carries each one, and can those agents call what they are shown". Open a row to see its tool versions and the agents that carry it, or create a new toolbelt.

### Rationale
A toolbelt is a named set of tool versions assigned to agents. It decides which tools a model can see. It grants no permission. Every call from a toolbelt is still checked against the agent's roles, the policy on the tool version, the kill switches and the agent's mandates (`docs/mission-control-spec.md` §6.6). So a toolbelt row can read **Unavailable**: agents that carry it can see a tool they cannot call today.

A toolbelt is the only edge from the registry to an agent. It is a Steering Source of kind `toolbelt` (D4). It emits one `capability` SteeringFrame per tool it shows the model, at the tool list injection point (D5, the Emissions table in `docs/fleet-operations-wedge.md`). A harness's own tools, such as Bash in Claude Code, are not frames, because the harness shows them and Oxagen did not put them there. A toolbelt may still carry them so grants, risk grades and approval rules reach them at the hook. The Workstation toolbelt is that case.

The panel caption ("A toolbelt is a named set of tool versions assigned to agents. It decides which tools a model can see. It grants no permission.") and the note under the table moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, purpose, owner, last change, tools | `TOOLBELTS` (`FIXTURES.TOOLBELTS.belts`) | `tools.toolbelts` (#3852) | future |
| Agents assigned | `agentsOfBelt()` over `TOOLBELT_ASSIGN` | `tools.toolbelt_assignments` (#3852) | future |
| Providers | `beltProviders()` over `TOOLS[].s` | derived from each version's provider | future |
| Gates on its tools | `beltGates()`, `beltGateCell()` over `toolGateKind()` | the gate each version meets | future |
| Availability | `beltAvailability()` | derived from the gates | future |
| Badge | `TOOLBELTS.length`, `beltToolCount()` | derived | future |

### Logic
1. The badge reads "9 toolbelts · 22 tool versions". `beltToolCount()` counts distinct versions across every toolbelt, so a version on two toolbelts counts once.
2. Providers lists one badge per provider behind the toolbelt's versions, found through the registry row of each version.
3. Agents assigned lists each agent key's last segment, or "Unassigned".
4. `beltGates()` counts each version by `toolGateKind()`: allowed, needs approval, needs a mandate, stopped. A version missing from the registry counts as missing.
5. Availability reads **Unavailable** exactly when a version is stopped by a live switch or missing from the registry, with the reason ("1 stopped by a kill switch"). Otherwise **All reachable**, with "Some calls wait for a mandate or an approval." or "Every tool version is in the registry and no kill switch covers it."
6. A row opens `belt`. It is keyboard reachable (`rowClick()`), labelled "Open <name>".
7. **New toolbelt** is the tab's gold action and opens `beltnew`.
8. Flipping or clearing a switch that covers a version changes the row on the next render. In the demo, Messaging reads Unavailable because the Slack provider switch is on and stops `slack__post_message@2`.

### States
- **Loaded**: nine toolbelts.
- **Empty, loading, error, denied**: the page is replaced by the Tools state panel (see `tools.md`, Header).
- **Mobile**: the table becomes labelled cards, and the badges wrap in their cell.
- **In the app**: no store holds a named toolbelt (#3852). A build keeps the heading and New toolbelt and says in place of the rows that toolbelts are not recorded. An empty table would read as "no toolbelt exists", which the record cannot say.

## Delivery

Every agent that carries a toolbelt, with the toolbelts it carries, how many tool versions that gives it, the providers they reach, and its tier.

### Purpose
It answers "if I change this toolbelt, which agents feel it". Read it before you edit a toolbelt, then open an agent's Toolbelt tab to see its full tool list.

### Rationale
One toolbelt can reach many agents, so a change to one is a change to all of them at their next session. The Toolbelts panel reads by toolbelt. This panel reads the same assignments by agent, so the reach of a change is visible before anyone saves it. The Tier column is there because a toolbelt's tools are refused at different places by tier: at dispatch for calls routed through Oxagen, at the hook on the `harness` tier, and not at all on `observe`.

The caption "One toolbelt can reach many agents, so review a change to it before you save." moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent | `TOOLBELT_ASSIGN` keys, `agentByKey()` | `tools.toolbelt_assignments` (#3852) | future |
| Toolbelts | `beltsOfAgent()` | `tools.toolbelt_assignments` | future |
| Tool versions | `beltTotal()`, else `AGENT_BELTS[k].length` | `get_agent_toolbelt` | partial |
| Providers | `beltProviders()` over each toolbelt | derived | future |
| Tier | `AGENTS[].tier` via `tierBadge()` | `enforcement_tier` per run, rolled up | partial |

### Logic
1. One row per key in `TOOLBELT_ASSIGN`.
2. Tool versions is `beltTotal(a)`: the larger of the agent's declared width and its computed belt. A searchable agent can be far wider than the toolbelts listed here.
3. Providers is the union of `beltProviders()` over the agent's toolbelts, in first-seen order.
4. A row opens `#/<org>/<ws>/agents/<agent>/toolbelt`.
5. `ltTable()` adds search, the filters Any tier, Any toolbelts and Any providers, and the pager.

### States
- **Empty, loading, error, denied**: replaced by the Tools state panel.
- **Mobile**: labelled cards.
- **In the app**: Tool versions comes from `get_agent_toolbelt`, computed per agent. Tier needs a roll-up per agent.

## Toolbelt {#dialog/belt}
<!-- open: openDialog('belt', TOOLBELTS[0].id) -->

One toolbelt: its owner, providers, the agents that carry it, the gates its tools meet, and each tool version on it.

### Purpose
It answers "what is on this toolbelt, who carries it, and what can those agents not call today". From here you open an agent's Toolbelt tab or any version's tool dialog.

### Rationale
Assigning this toolbelt grants no permission. It adds to what the model can see. Every call from it is still checked against the agent's roles, the policy on the tool version, the kill switches and the agent's mandates (§6.6). The warning at the top exists because a stopped tool on a toolbelt is still shown to the model: agents with this toolbelt can still see it, and each call is blocked when it is sent. The toolbelt's own note, where it has one, is text its owner wrote, and it prints as written.

Assignment is edited on the agent, not here, because the agent's Toolbelt tab is where the union of its toolbelts is visible. A toolbelt cannot be removed while an agent carries it.

The closing note and the last sentence of the warning moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, purpose, owner, last change, note | `beltCatalogById()` over `TOOLBELTS` | `tools.toolbelts` (#3852) | future |
| Agents assigned | `agentsOfBelt()` | `tools.toolbelt_assignments` | future |
| Warning | `beltAvailability()` | derived | future |
| Tool versions | `b.tools`, `toolById()` | `list_tool_versions` | partial |

### Logic
1. A version missing from the registry spans its row and reads "Not in the registry. A call by this name fails as an unknown tool."
2. Each agent in Agents assigned is a button that closes the dialog and opens that agent's Toolbelt tab.
3. **Remove**, **Assign to an agent** and **Edit tools** are stubs that toast what the product would do. Edit tools counts the agents the change reaches at their next session.

### States
- A toolbelt with no agent reads "Unassigned. No agent carries it yet."
- An id that no longer exists reads "That record is no longer here." (`noSuch()`).
- **Mobile**: a bottom sheet, the table as cards.

## New toolbelt {#dialog/beltnew}

A short form that names a new toolbelt, says what it is for, and picks the owning team.

### Purpose
It starts a toolbelt with no tools and no agents. You add tools and assign agents afterwards.

### Rationale
A toolbelt is a job, not a category. Name it after the work an agent does with it ("Release control", "Payments"), so a reviewer can tell from the name alone whether an agent should carry it. The owner is a team because a toolbelt outlives the person who made it. A new toolbelt reaches no agent until one is assigned it.

The subtitle ("A named set of tool versions that many agents can carry.") and the naming note moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, purpose, owner | form fields | `toolbelt.create` (#3852) | future |

### Logic
1. **Create** closes the dialog and toasts "Toolbelt created. No agent carries it yet." The mockup writes nothing to `TOOLBELTS`.
2. Owner offers `platform`, `finops` and `security`.

### States
- **Mobile**: a bottom sheet.
- **In the app**: the app's New toolbelt is a stub dialog offered to an org Owner or Admin (`apps/app/src/features/tools/toolbelts.tsx`).
