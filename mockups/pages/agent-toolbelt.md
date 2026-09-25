# Agent, Toolbelt

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents/triage/toolbelt` |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D5 and the Emissions row for Toolbelt (one `capability` frame per tool the belt shows the model; a harness's own tools are not frames), and D17. `docs/fleet-operations-ia.md` (Agents: “The computed belt, each tool's decision, and what is off the belt”). The belt itself: `docs/mission-control-spec.md` §6.6. The agent header and the tab bar are specified in `agent.md` |
| Design | `mockups/src/engine.js` → `aToolbelt()` inside `pAgent()`, with `beltOf()`, `beltTotal()`, `beltPresentation()`, `beltOutside()`, `beltMember()`, `BELT`, `iamWire()`, `namesToggle()`, `catChips()`, `toolCell()`, `gate()`, `hazard()`, `finBadge()` and the dialogs `tool` and `toolcats`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / Agents / Toolbelt`: Loaded, Loading, Error, Access denied, and each of them · mobile |
| Audit | `agent-toolbelt.audit-prompt.md` |

## Job

The only tool list the agent's model is ever shown, and how it was computed. The tab answers what the agent can reach, what each call on the belt will be answered before it is made, what the model sees in its request, and what is off the belt and why. It grants nothing: a belt says what the model is shown, and the roles, the policy on the tool and the mandate ledger decide whether a call survives.

## What is on the page

The agent header and the tab bar are as `agent.md` specifies, with Toolbelt selected and its count (52) equal to the belt's width. The body is five panels.

**Belt computation.** Subtext: “At run start, cached with the bundle version, recomputed on any deny-generation bump.” The header badge reads “pol_v41 · deny gen 118”: the active policy and the deny generation. The body is a wire of four inputs joined by ∩ into the belt: “grants” (“1,204 versions reachable”), “delegation ceiling” (the operator, “Marcus Bell”), “policy bundle” (“pol_v41”), “kill switches” (“2 flipped”), then “=” and “belt” (“52 tool versions”). Under it: “The registry holds 703 tool versions across 19 servers. This agent's model is shown 52 of them. A call by name to anything outside the belt is rejected before lookup, recorded as unknown_tool, and counted toward an automatic halt.”

**Model view.** The subtext states the belt's width against the workspace's full-belt limit and the presentation it earns: “The belt is 52 tools, over this workspace's full-belt limit of 40, so it is presented as a searchable belt.” A two-button group labelled “Belt presentation”, **Searchable belt** and **Full belt**, each with `aria-pressed`. The group previews a presentation; it changes nothing about how the agent runs and resets when another agent opens.

- Searchable belt: a note that the request carries the two meta-tools plus the tools pinned as always present (6 definitions instead of 52), and that both meta-tools are governed calls recorded as frames, so the record shows what the model looked for and what it was shown. Then the tools block of the next model request, verbatim, headed “// the tools block of the next model request, verbatim”: `search_tools`, `load_tools` and the pinned tools, each with its description and a machine-readable trailer (“[oxagen] risk=low approval=never ceiling=the index covers the belt only schema=sha256:aa01f3…”). Then: “Every definition carries a fixed, machine-readable trailer: the risk grade, whether the call will be held for approval, and any budget or mandate ceiling. A model that knows a call will be held plans differently than one that does not. The schema digest lets a run's frames prove exactly which schema the model saw.”
- Full belt: a note that every definition is in the request with no meta-tools, and, for this belt, that it is shown for comparison because 52 is over the limit of 40. The block is headed “// 52 definitions · 16,796 tokens of tool definitions” and lists the first six definitions with their input schema digest and trailer, then “… 46 more”.

**Belt search.** Subtext: “This is search_tools running against the same index the model queries.” A field written as a call, `search_tools(` … `)`, with the placeholder “release notes” and **Run** (Enter runs too). “Try:” and five example queries: pull request, Steering record, stripe payment, delete repository, graph.

- A hit lists at most eight belt members, each with its label, id, one-line description, hazard and decision, then “5 of 52 belt members matched. search_tools returned names and one-line descriptions only; the model must call load_tools to see a schema, and both calls are recorded as frames.”
- A miss reads “Zero results.” and, when the tool exists in the registry, names it and why it is off the belt (“github__delete_repository@1 exists in the registry, but it is not on this agent's belt: Denied by the workspace policy for every agent, at every version.”), over “A search never returns a tool outside the belt. What the model cannot call, it cannot find, and so cannot be prompt-injected into calling.”

**Per-tool decision rules.** Subtext: “What the policy engine will answer for each member of this belt, before the call is ever made. Deterministic, versioned, replayable. No model participates.” The header carries a Tool names group (**Labels**, **API names**), a Layout group (**By category**, **Flat**) and a badge “23 of 52 shown”. Under the header: category chips with counts (All 23, Read-only 10, Data query 1, Record write 3, Messaging & authoring 2, File mutation 1, Code execution 1, Source control 5), then the hazard counts (“1 critical”, “5 high”), the gate counts (needs approval 3, denied 2, and mandate when any), and **What the categories mean** (opens `toolcats`).

The table's columns: Tool · Category · Decision · Hazard · Egress · Financial · Schema digest. Tool is the label over the id (a meta-tool says so). Category is its badge. Decision is the gate (“allowed”, “needs approval”, “denied”, or “mandate + approval”) with the rule that produced it under it (“grant:agent.repo.write #1”, “pol_v41 rule rg_0022 (egress:third_party)”, “definition deny_tools: github__merge_pull_request@*”). Hazard is the risk grade and the side effect. Egress is `none` or `third_party`. Financial is `none` or the financial class. Schema digest is mono. Grouped by category, each group has a heading row with the category's name, its one-line meaning and its tool count. A row opens the `tool` dialog. Under the table: “The remaining 29 are the same github and harness families at other versions.”

**Off the belt.** Subtext: “A sample of the 651 registry versions outside this belt, and why each one is out.” Badge “not visible to the model”. Table: Tool · Reason, one row per excluded tool, such as `stripe__create_payment@5` with “Financial tool. No grant reaches it, and this agent holds no mandate.” and `snowflake__run_query@2` with “Server not granted to any role in this workspace.” List controls: Rows and a pager (“1–6 of 6”).

**Dialogs this tab opens.**

- `tool`, titled with the tool's id: its label, id and provider, category, hazard, side effect, decision, egress and financial class, its description, then Schema digest, Schema origin, Credential (“github_app → installation token”, “The agent never sees it.”), Price, and the input schema.
- `toolcats`, titled “Tool categories”: “A category says what a tool acts on. It is orthogonal to the hazard (how bad a wrong call is) and to the gate (what this belt decided). Ordered from least to most consequential.”, then each category with its meaning and example tools.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Contract paths are under `packages/oxagen/src/contracts/` in `macanderson/oxagen` `main`.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| The belt, its width and the tab count | `BELT`, `AGENT_BELTS` via `beltOf()`, `beltTotal()` | `get_agent_toolbelt` `tools` | `agent.toolbelt.get.ts:94-158`; the decision per tool is the runtime's own (`agent.toolbelt.get.ts:1-14`) | ✅ |
| Belt computation: deny generation and kill switches | `S.denyGen`, `flippedSwitches()` | `get_agent_toolbelt` `basis.denyGeneration`, `basis.killSwitches` | `agent.toolbelt.get.ts:130-146` | ✅ |
| Belt computation: grants and delegation ceiling | fixed text, `PEOPLE[a.operator]` | `basis.roleGrants`, `basis.humanCeiling` | `agent.toolbelt.get.ts:132-135`. `roleGrants` counts role-grant rows, not versions reachable | 🟡 |
| Belt computation: policy bundle | `activePolicy()` | The policy bundle version the belt was computed under | Not on the belt read. A host reports `bundleVersionServed` (`agent.get.ts:53-73`) | 🟡 |
| Registry and server counts | `verCount()`, `srvCount()` | `list_tool_versions`; the tool servers | `tool.version.list.ts:48` | ✅ |
| `unknown_tool` and the automatic halt | fixed text | A rejected call by name outside the belt, recorded and counted toward a halt | `unknown_tool` is the name the engine gives a call it never saw (`packages/agent/src/runtime/engine/messages.ts:16-35`). No halt counts it | 🟡 |
| Presentation, limit and what is sent | `beltPresentation()`, `FULL_BELT_LIMIT` | `get_agent_toolbelt` `presentation` (`mode`, `limit`, `sentToModel`) | `agent.toolbelt.get.ts:19-20`, `:147-154` | ✅ |
| Meta-tools | `BELT` meta entries | `search_tools`, `load_tools` | `tools.search.ts:41`, `tools.load.ts:32`, for the in-app agent's capabilities | 🟡 |
| Pinned tools | `BELT[].pinned` | Tools pinned as always present in a searchable belt | No pinning exists | ❌ |
| The verbatim tools block and its trailer | `trailer()` | The tools block of the next request with a machine-readable trailer per definition | Each belt tool carries its input schema and digest (`agent.toolbelt.get.ts:61-81`). No trailer is written anywhere | ❌ |
| Belt search | `S.beltQuery` over `beltOf()` | `search_tools` against this agent's belt | `search_tools` takes a query and kinds, no agent (`tools.search.ts:58-65`) | 🟡 |
| Tool, category, schema digest | `BELT`, `TOOLS` | `get_agent_toolbelt` `tools[].name`, `category`, `schemaDigest` | `agent.toolbelt.get.ts:48-83` | ✅ |
| Decision and rule | `BELT[].dec`, `rule` | `tools[].decision`, `tools[].rule` | Decision is `allow` or `require_approval` (`agent.toolbelt.get.ts:22`); the rule names the resolver step (`agent:7:role_grant`). A denied tool is in `cannotSee`, not on the belt. `mandate` is not a belt decision | 🟡 |
| Hazard | `TOOLS` `risk`, `eff` | Risk grade and side effect | The belt carries `riskLevel` low, medium or high (`agent.toolbelt.get.ts:56`); the registry classification carries `critical` and the side effect class (`tool.classification.ts:37-52`) | 🟡 |
| Egress and Financial | `TOOLS` `eg`, `fin` | The registry classification | Egress class (`tool.classification.ts:42-46`); consequence tags such as `moves_money` (`tool.classification.ts:20-35`) | ✅ |
| Harness tools on the belt | `BELT` `claude_code__*` | None. A harness's own tools are governed at its hooks | The belt holds `capability` and `mcp` tools only (`agent.toolbelt.get.ts:52`) | ❌ |
| Off the belt | `beltOutside()`, `BELT_OUTSIDE` | `get_agent_toolbelt` `cannotSee` | `agent.toolbelt.get.ts:85-92`, `:156`: name, kind, server and the rule. The reason is a rule id, not a sentence | 🟡 |
| `tool` dialog | `TOOLS` | `list_tool_versions`; the price book | `tool.version.list.ts:48`; `cost.price_entry.list.ts` | 🟡 |

## Future-only fields

The tab carries no `data-future` mark, and the catalog gives it no future story. These fields have no contract today and are unmarked in the design. A build renders each as not recorded, or leaves it out, until its contract ships:

- The machine-readable trailer on each definition in the tools block, and the pinned tools.
- A belt search scoped to one agent's belt.
- The `denied` and `mandate + approval` decisions on belt rows. Today a denied tool is off the belt, listed under Off the belt with its rule.
- The `critical` hazard on a belt row (the registry records it; the belt read does not).
- Harness tools as belt rows.

## Functionality

- The belt is computed at run start from the agent's grants, the delegation ceiling of its operator, the policy bundle and the kill switches, and recomputed when the deny generation moves. The tab reads the same computation a run makes.
- A searchable belt carries the two meta-tools, and the model loads a definition on demand. A full belt carries every definition. The width against the workspace's limit (40) decides, and the toggle previews the other.
- A search never returns a tool outside the belt. What the model cannot call, it cannot find.
- The decision column is what the policy answers before the call is made. It is deterministic and versioned; no model takes part.
- Assigning a toolbelt grants nothing. Permissions never lists tools, and this tab never claims a permission.
- Every tool definition on the belt is paid for as input on every call, so a belt wider than the agent uses costs money on every request.
- Each tool the belt shows the model is also a `capability` SteeringFrame on the Steering tab's Tool list. The two tabs list the same tools; a tool excluded there as `overridden_by_gate` is not in the tools block here.

## States

- **loaded**: as described above, on the demo record (agent Triage, a 52-tool searchable belt).
- **loading**: the shell stays; the page body, the agent header included, is the skeleton.
- **error**: “This agent could not be loaded”, with `503 iam_principals_unavailable`, **Try again** (gold) and **Open an incident**, as `agent.md` gives it.
- **access denied**: “You cannot see this agent”, naming `agent.read on core-platform`, with **Request access** (gold) and **Back to Work**, as `agent.md` gives it.

The renderer shares the agent page's empty state with every tab; the catalog lists it on the Overview only.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The wire wraps onto several lines. The Model view's toggle keeps its row beside the subtext, and the tools block scrolls sideways inside its own box while the page does not. The example queries wrap. The decision table and the Off the belt table become cards with labelled cells; grouped by category, each category heading stays a card of its own. Dialogs rise from the bottom edge as sheets. Touch targets are at least 44 px.

## Permissions

- Read: `get_agent_toolbelt` admits org Owner, Admin and Member, and workspace Owner and Member (`agent.toolbelt.get.ts:111-115`). The mockup names the permission `agent.read`.
- No writes on this tab. The presentation toggle and the search change nothing stored.

## Backend gaps this page depends on

- The trailer on each tool definition, and pinned tools for a searchable belt.
- A belt search scoped to one agent.
- The policy bundle version and the versions reachable on the belt read.
- A single vocabulary for a denied tool: on the belt with a deny (the design), or off it with its rule (today).
- A recorded `unknown_tool` rejection and the halt it counts toward.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- A Steering Source and a SteeringFrame are never shown as each other. The toolbelt is a source managed on Tools › Toolbelts; its tools reach the model as `capability` frames, shown on the Steering tab.
- No person is scored or ranked.
- Every enforcement claim states the tier. “Enforced” only for calls routed through Oxagen. A harness tool's decision is enforced only as far as the harness tier's hooks allow.
- Headers are rollups of the rows beneath them: the tab count is the belt's width, the category chips and the hazard and gate counts are counts of the rows, and “N of M shown” names both.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. A quoted string above that breaks this rule is a mockup defect to fix, not copy to reproduce.
- Exactly one gold (primary) action per screen. This tab has none of its own.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- A not-loaded state replaces the page body, never the shell.
