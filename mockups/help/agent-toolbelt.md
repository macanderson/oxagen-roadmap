# Agent toolbelt

## How the toolbelt is built

The four inputs that narrow the registry to this agent's toolbelt, and the width that comes out.

### Purpose
It answers where the agent's tool list comes from. A reviewer who sees 52 tools on Triage can read the four terms that produced that number and name the one to change: a role grant, the operator, the policy bundle, or a kill switch. The header badge names the active policy and the kill-switch generation, so a person can tell whether the list they read is current.

### Rationale
`docs/mission-control-spec.md` §6.6 defines the toolbelt as `grants ∩ delegation ceiling ∩ policy bundle ∩ kill switches`, and calls it the only tool list the model is ever shown. The panel draws that formula with `iamWire()`, one box per term joined by "and", so the intersection reads left to right. Each term can only narrow the result. That is why the operator appears as the delegation ceiling: an agent never reaches a tool its operator cannot.

Oxagen builds the toolbelt at run start and rebuilds it when the policy bundle or the kill-switch generation moves. A run reads the same computation this tab shows.

The registry holds 703 tool versions from 19 providers, and Triage's model is shown 52 of them. A call by name to anything outside the toolbelt is rejected before lookup, recorded as `unknown_tool`, and counted toward an automatic halt (§6.7, step 2). That sentence moved off the page because it describes the gateway, not this agent's record.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Grants, versions reachable | `grantReach` in `aToolbelt()` (62% of `verCount()`, floored at the width) | `get_agent_toolbelt` `basis.roleGrants` | partial |
| Delegation ceiling | `PEOPLE[a.operator]` | `basis.humanCeiling` | partial |
| Policy bundle | `activePolicy()` over `POLICIES` | The bundle version the toolbelt was computed under | partial |
| Kill switches | `flippedSwitches()` over `S.switches` | `basis.killSwitches` | live |
| Kill-switch generation | `S.denyGen` | `basis.denyGeneration` | live |
| Toolbelt width | `beltTotal()` | `get_agent_toolbelt` `tools` | live |

### Logic
1. `grantReach` is `min(verCount(), max(width, round(verCount() × 0.62)))`. It is a stand-in. `basis.roleGrants` counts role-grant rows, and a build must label that figure as grants, not versions reachable, until the read returns versions.
2. The delegation ceiling shows the operator's name from `PEOPLE[a.operator]`.
3. The policy bundle is the version whose state is `active` in `POLICIES`, falling back to `pol_v41`. The toolbelt read does not carry it today; a host reports `bundleVersionServed` (`agent.get.ts:53-73`).
4. Kill switches counts the switches flipped in `S.switches`. Flipping one on Tools › Kill switches changes this count on the next render.
5. The output term is `plural(beltTotal(a), "tool version")`. It equals the Toolbelt tab count, the Model view width, and the M in "N of M shown" on Per-tool decision rules.

The panel writes nothing and emits no frame.

### States
- **Loaded**: the wire and the badge.
- **Loading, error, denied**: the agent page replaces the whole body, header included (`agent/header`).
- **Mobile**: the wire wraps onto several lines. Each term stays one box.
- A build shows the policy bundle and versions reachable as not recorded until `get_agent_toolbelt` returns them.

## Model view

What the model receives in its request: the presentation this toolbelt earns and the tools block, verbatim.

### Purpose
It answers what the model actually sees. The subtext states the width against the workspace limit and the presentation that width earns ("52 tools · Searchable (over the limit of 40)."). The code block is the tools block of the next model request, so a reviewer can read the exact names, descriptions, and trailers the model reads.

### Rationale
§6.6 of `docs/mission-control-spec.md` sets two presentations, chosen by width. A toolbelt at or under the workspace limit (40 tools by default) sends every definition in each request. A wider one sends a searchable toolbelt: two meta-tools, `search_tools` and `load_tools`, plus the tools pinned as always present. On Triage that is 6 definitions instead of 52.

Both meta-tools are governed calls, recorded as frames. The record therefore shows what the model looked for and what it was shown.

Oxagen appends a fixed, machine-readable trailer to every definition: the risk grade, whether the call will be held for approval, and any budget or mandate ceiling. A model that knows a call will be held plans differently from one that does not. The trailer also carries the schema digest, so a run's frames can prove which schema the model saw.

Every definition is paid for as input on every call. The tool-definition token count is measured on every model call (§12.6), and the findings job flags a toolbelt wider than the agent uses.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Presentation and limit | `beltPresentation()`, `FULL_BELT_LIMIT` (40) | `get_agent_toolbelt` `presentation` (`mode`, `limit`, `sentToModel`) | live |
| Meta-tools | `BELT` entries with `meta: true` | `search_tools`, `load_tools` | partial |
| Pinned tools | `BELT[].pinned` | Tools pinned as always present | future |
| Trailer | `trailer()` in `aToolbelt()` | A trailer on each definition in the tools block | future |
| Schema digest | `beltMember().dig` from `toolDigest()` | `tools[].schemaDigest` | live |
| Token line | `total × 323` | The measured tool-definition tokens per call | partial |

### Logic
1. `beltPresentation(a)` returns `S.beltMode` when the toggle set it, else `a.beltMode`, else `searchable` when `a.belt` exceeds `FULL_BELT_LIMIT`, else `full`.
2. The subtext follows the width, not the toggle: "N tools · Searchable (over the limit of 40)." above the limit, "N tools · All tools sent (under the limit of 40)." at or under it.
3. **Searchable** and **All tools sent** form a preview group (`aria-pressed`). It writes `S.beltMode` and changes nothing about how the agent runs. `pAgent()` resets it when another agent opens (`S.beltFor`).
4. Searchable renders the pinned members of `beltOf(a)`, meta-tools first, each as a name and a description with `trailer(x)` on a new line.
5. All tools sent renders the first six non-meta members with their schema digest and trailer, then "… N more". The header comment gives the definition count and `total × 323` tokens, a fixed estimate per definition.
6. `trailer(x)` writes `risk`, `approval` (`required`, `denied`, `mandate + required`, or `never` from the decision), `ceiling` (the first clause of the scope), and `schema`.

The mockup pins `github__merge_pull_request`, which the definition denies and the Steering tab excludes as `overridden_by_gate`. A build leaves a denied tool out of the block, so the block always equals the `capability` frames on the Steering tab.

### States
- **Loaded**: subtext, toggle, block.
- **Mobile**: the toggle keeps its row beside the subtext. The block scrolls sideways inside its own box, and the page does not.
- A build renders the trailer and the pinned tools as not recorded until they ship. It never draws them from fixtures.

## Toolbelt search

A field that runs `search_tools` against this agent's toolbelt and shows what the model would get back.

### Purpose
It answers whether the model can find a tool, and what it gets when it asks. A reviewer types a query and sees the same answer the model would: tool names and one-line descriptions, drawn from the toolbelt only. A miss that names a registry tool says why that tool is out.

### Rationale
The field runs `search_tools` against the same index the model queries, written as a call (`search_tools(` … `)`) so the reviewer reads it as the meta-tool and not as a page filter.

A search returns names and one-line descriptions only. The model must call `load_tools` to see a schema, and Oxagen records both calls as frames.

A search never returns a tool outside the toolbelt. What the model cannot call, it cannot find, and so it cannot be prompt-injected into calling it (§6.6). The miss state proves this in place: search "delete repository" and `github__delete_repository@1` comes back as a registry tool that is not on the toolbelt, with its reason, and never as a hit.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Query | `S.beltQuery`, `S.beltRan` | `search_tools(query, kinds?)` scoped to the agent | partial |
| Hits | `beltOf(a)` filtered in `aToolbelt()` | `search_tools` results over the toolbelt index | partial |
| Miss reason | `beltOutside(a)`, `BELT_OUTSIDE` | `get_agent_toolbelt` `cannotSee` | partial |
| Hazard and decision on a hit | `hazard()`, `gate()` over `BELT` | `tools[].riskLevel`, `tools[].decision` | partial |

`search_tools` takes a query and kinds and no agent today (`tools.search.ts:58-65`). An agent-scoped search is a backend gap.

### Logic
1. The query is lower-cased and split on spaces. Each word must appear.
2. Each candidate's text (name, description, provider) is lower-cased and `_`, `@`, and `.` become spaces, so "stripe payment" finds `stripe__create_payment` and "delete repository" does not settle for `delete_branch`.
3. Run or Enter sets `S.beltRan` and renders. Typing alone does not search.
4. A hit lists at most 8 tools, each with its label, id, description, hazard, and decision, then "N of M tools matched.".
5. A miss reads "Zero results." When a tool in `beltOutside(a)` matches by the same rule, it names that tool and its reason. Otherwise it reads "Nothing on this agent's toolbelt matches that."
6. The five **Try** chips (pull request, Steering record, stripe payment, delete repository, graph) fill the query and run it. Two of them are built to miss.

The search writes nothing and emits no frame from this page.

### States
- **Before a run**: the field and the chips only.
- **Hit**, **miss**: as above.
- **Mobile**: the chips wrap. The field keeps its call syntax.
- A build without an agent-scoped `search_tools` renders the field as not recorded rather than searching the whole registry.

## Per-tool decision rules

What the policy engine will answer for each tool on this toolbelt, before any call is made, with the rule that produced each answer.

### Purpose
It answers what happens when the model calls a given tool: allowed, held for approval, blocked, or held for a mandate. Each row names the rule, so a reviewer who disagrees with a decision knows which grant, definition line, or policy rule to change. The counts above the table give the shape of the risk at a glance.

### Rationale
§6.7 of `docs/mission-control-spec.md` places the decision at step 5 of the call pipeline. The decision is deterministic, versioned, and replayable. No model takes part. Because the answer is a function of the toolbelt's inputs, Oxagen can state it before the call is made, and this panel does.

Tool facts are not repeated here. A row carries only what is true of the tool on this toolbelt: the description the model is shown, the decision, the rule, and the ceiling. Risk, side effect, egress, financial class, and schema digest come from the registry entry in `TOOLS`. Approving an observed schema on Tools therefore changes the digest here too.

The table shows 23 catalog members of a 52-tool toolbelt. The other 29 are the same github and harness families at other versions, which is why the badge reads "23 of 52 shown".

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tool, category | `BELT`, `toolMeta()`, `TCAT` | `tools[].name`, `category` | live |
| Decision and rule | `BELT[].dec`, `rule` | `tools[].decision`, `tools[].rule` | partial |
| Hazard | `TOOLS` `risk`, `eff` via `beltMember()` | `tools[].riskLevel`; registry classification | partial |
| Egress, Financial | `TOOLS` `eg`, `fin` | Registry classification | live |
| Schema digest | `toolDigest()` | `tools[].schemaDigest` | live |
| Harness tools as rows | `BELT` `claude_code__*` | None. A harness's own tools are governed at its hooks | future |

Today the decision is `allow` or `require_approval` only (`agent.toolbelt.get.ts:22`). A denied tool sits in `cannotSee`, off the toolbelt. `mandate` is not a toolbelt decision.

### Logic
1. `beltOf(a)` maps each id in `AGENT_BELTS[a.key]` to `beltMember()`, which merges the `BELT` row with the `TOOLS` registry row. A searchable toolbelt adds the meta-tools first.
2. The decision cell is `gate(dec, note or rule)`: "Allowed", "Needs approval", "Blocked", or "Mandate + approval". The rule sits under it in mono, such as "definition deny_tools: github__merge_pull_request@*".
3. Category chips (`catChips()`) filter by `S.beltCat`. The hazard counts (critical, high) and gate counts (need approval, need a mandate, denied) count the rows of the whole toolbelt.
4. **By category** groups rows under a heading per `TCAT_ORDER` category with its meaning and tool count. **Flat** lists them. Both write `S.beltView`.
5. The Tool names group (`namesToggle()`) switches labels and API names across every page.
6. A row opens the `tool` dialog. **What the categories mean** opens `toolcats`.

The mockup draws Claude Code's tools on Triage, a Codex CLI agent, because one catalog serves every agent. A build follows the agent's harness.

### States
- **Loaded**: counts, chips, table.
- **Empty toolbelt catalog**: "No per-tool rule is recorded yet for the N tools on this toolbelt."
- **Mobile**: each row becomes a card with labelled cells. Each category heading stays a card of its own.
- A build renders `denied`, `mandate + approval`, a `critical` hazard, and harness rows as not recorded until the toolbelt read carries them.

## Not on the toolbelt

A sample of the registry tool versions this agent's model cannot see, each with the reason it is out.

### Purpose
It answers why a tool is missing. A person looking for `stripe__create_payment` on Triage finds it here with its reason: a financial tool with no grant and no mandate. The subtext gives the size of what is out ("A sample of the 651 registry versions outside this toolbelt."), and the badge states the consequence: not visible to the model.

### Rationale
The toolbelt is defined by what it includes, so the exclusions are the part a reviewer cannot infer. Naming the reason for each keeps two different fixes apart: a missing grant is fixed with a role, a workspace deny is a policy decision, and a financial tool needs a mandate. The same list backs the miss state of Toolbelt search, so a search and this table always agree.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Excluded tool | `beltOutside(a)` over `BELT`, plus `BELT_OUTSIDE` | `get_agent_toolbelt` `cannotSee` | partial |
| Reason | computed in `beltOutside()`; fixed text in `BELT_OUTSIDE` | `cannotSee[].rule` | partial |
| Sample count | `verCount() − beltTotal(a)` | `list_tool_versions` count less the width | live |

`cannotSee` returns a name, kind, server, and the rule id (`agent.toolbelt.get.ts:85-92`). The reason is a rule id, not a sentence. A build renders the rule and its source, and writes a sentence only where one maps from the rule.

### Logic
1. `beltOutside(a)` takes every catalog member of `BELT` that is not a meta-tool and not in `AGENT_BELTS[a.key]`.
2. Its reason is "Financial tool. No grant reaches it, and this agent holds no mandate." when the registry marks a financial class, "Denied for every agent by the workspace policy." when the catalog row is a deny, and "No grant on this agent's roles reaches this version." otherwise.
3. `BELT_OUTSIDE` appends five registry-wide outsiders, such as `github__delete_repository@1` (denied for every agent at every version) and `okta__deactivate_user` (provider not registered in this organization).
4. The subtext count is the registry versions less the toolbelt width. The table is a sample and does not list them all.
5. Rows and a pager come from `listify()`. A row opens nothing.

### States
- **Loaded**: the table with Rows and a pager ("1–6 of 6").
- **Mobile**: each row becomes a card with Tool and Reason labelled.
- A tool listed here is absent from the decision table and from the tools block. A build that shows it in both fails the page's rules.
