# Agent steering

## What it receives

Every SteeringFrame this agent would receive for its standing brief, grouped by injection point and filterable by type.

### Purpose
The section answers "what does this agent actually read before and during a turn". A person checks the frame count, how much of the session-start prefix and the per-prompt budget the frames use, and which frame of which type came from which source at which version. From here they open **Open in the Compiler** to try another brief, or follow a source link to the page that manages it.

### Rationale
A Steering Source and a SteeringFrame are two objects (D4). A source is durable material a person or an agent wrote. A frame is what Oxagen resolved from a source for one run at one injection point. This tab shows frames only, and every frame row links back to its source at the version it names, never the reverse. Every piece of runtime input is one of eight frame types (D5): goal, invariant, constraint, delegation, procedure, context, invocation, and capability. Every frame carries its source, the source version, and a hash over its own body (D6).

Nothing is authored here. The Compiler, this tab, and a run's Decision trace read one resolver, so for the same agent, brief, and sources they cannot disagree.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Delivery warning | `a.tier` | `list_agents` `enforcementTier` | live |
| Standing brief | `STG_PREVIEW.prompts` via `agentBrief()`, else the agent's description | A standing brief per agent | future |
| Frames by injection point and type | `resolveEnvelope()` over `RECORDS`, `SOURCES`, `SKILLS`, `MEMORY`, `ONTOLOGY`, `GATES`, `MANDATES`, `BELT` | A capability that resolves an envelope for a brief and delivers nothing (#3879) | future |
| Frame type | `FT`, `REC_TYPE`, `itemFrame()` | `type` on every SteeringFrame | future |
| Source, version, frame hash | `srcCell()`, `frameOf()` | `source.kind`, `source.id`, `source.version`, `hash` | future |
| Force and tokens | `it.force`, `it.tok` | `steering.manifest` items | partial |
| Session-start prefix meter | `E.prefixTok`, `E.prefixCap` | The prefix cap and what the prefix spends | partial |
| Per-prompt selection meter | `E.volatileTok`, `E.volatileCap` | A per-prompt selection at prompt submit | future |

### Logic
- `aSteering()` resolves `resolveEnvelope(slug, brief)`. The brief is the agent's preview prompt, or its description when none is set up.
- The lead is `ftLead()`: "44 SteeringFrames for its standing brief, "Cut the 4.11.0 release notes"." With a type picked it reads "9 procedure of 44 SteeringFrames".
- `envelopeHtml()` draws two meters. The prefix cap is the 16 KiB bundle over 4 bytes a token, 4,096 tokens. The per-prompt cap is the workspace's volatile budget, 430 tokens on the demo.
- The type strip counts frames by type. Pressing one filters this section and Excluded to that type and adds **Show every type**. The pick lives in `S.ftype.ag` and survives a change of agent. A build resets it with the agent.
- Injection points with frames render in the order Session start, Prompt submit, Checkout files, Tool list. Prompt and Model request never appear here, because a standing brief is no work order's send and carries no steer.
- Rows sort by type, then force (`must`, `should`, `may`, `info`), then id. A table shows 4 rows and **Show all N**.
- One delegation frame appears per active mandate. One capability frame appears per tool Oxagen shows the model. A harness's own tools, such as Bash in Claude Code, are not frames.

### States
On the `observe` tier a warning comes first: "Not delivered. This agent is on the observe tier. No hook is installed, so nothing below reaches it." The whole section carries a future mark. A build renders it as not recorded, naming #3879, and never presents a run's manifest as this envelope.

## Excluded

The frames resolved for this agent that it does not receive, each with a reason from a closed vocabulary and the numbers that decided it.

### Purpose
The section answers "what did Oxagen leave out, and why". A person reads the reason badge and the line under it: a relevance of 0, a rank and the tokens left, the scope that missed, the gate that disagreed, or the newer version that won.

### Rationale
An exclusion is deterministic. It names a reason from the closed vocabulary of spec §10.5 and the numbers that decided it. The same sources, run, and budget give the same exclusions. Showing the cut beside the kept is how a person can trust the selection without reading a model's account of why. Each row carries its reason, so the section lead states only the count.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Exclusions | `resolveEnvelope().cut` | The resolved envelope's cuts for a standing brief | future |
| Reason `tier`, `over_budget`, `superseded` | `mapCut()`, `XR` | `steering.manifest` reasons `tier`, `budget`, `superseded` | partial |
| Other reasons | `XR` | The closed vocabulary. `out_of_scope` and `unapproved_digest` ship only in `preview_skill_search` | future |
| Injection point | `POINT_LABEL` | `injection_point` on the frame | future |

### Logic
- The lead reads "24 resolved for this agent and not delivered." With a type picked it counts that type.
- `exclusionsHtml()` draws one table: Type, SteeringFrame (with the injection point under the body), Source, Reason, Tokens. It shows 6 rows and **Show all N**.
- Rows sort by reason, then type, force, and id.
- `mapCut()` maps the assembler's cut to a reason: out of scope to `out_of_scope`, superseded to `superseded`, lower precedence to `overridden_by_must`, a score of 0 to `below_relevance_floor`, anything else to `over_budget`.
- A tool the definition denies is cut as `overridden_by_gate` with the rule that denied it.
- A withheld skill is cut before ranking. Its body reads "Withheld before ranking. The agent is told the count and the reason, never the name."
- A reason the manifest does not record today carries a future mark. A build shows `over_budget` as the manifest's `budget`.

### States
With nothing excluded: "Nothing was excluded." With a type picked and none of it cut: "Nothing of this type was excluded." A build renders the whole section as not recorded until #3879 ships, because a run's manifest records its own cuts and nothing resolves them for a standing brief.

## Sources

The Steering Sources behind this agent's frames, one row per source, each linked to the page that manages it.

### Purpose
The section answers "where does this agent's steering come from, and where do I change it". A person reads each source's kind, id, and version, the frame types it emits here, and its frame count, then follows the link to edit it where it lives.

### Rationale
A source is managed where it lives: Steering for records, skills, documents, glossary terms, and memory, Tools for policy and toolbelts, Agents for the definition and mandates. This tab is a view, so it links out and never edits. Listing sources apart from frames keeps the two objects of D4 apart on screen. A toolbelt is one row even when it emits 13 capability frames, and a skill whose description line and files both arrive is one row.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Sources that reach the agent | `resolveEnvelope().sel` grouped by source | A read that joins the sources per agent | partial |
| Kind and managed in | `SRC_KIND` | The source kinds of the wedge spec | partial |
| Link | `srcHref()` | The source's own page | partial |
| Frames | count of `sel` per source | Derived from the resolved envelope | future |

### Logic
- `aSteering()` groups the selected frames by source kind and id, in first-seen order, and counts frames and types per source.
- The lead reads "26 sources reach this agent."
- Source renders through `srcCell()`: the kind label, the id as a link from `srcHref()`, and the source version.
- `srcHref()` routes a record, skill, ADR, vision, memory, glossary term, or workspace instructions to its Steering source page. A toolbelt goes to Tools › Toolbelts. A policy gate goes to Kill switches, the record that grants it, or its mandate. A mandate goes to its agent's Permissions tab. An agent definition goes to the agent's Source page.
- Emits here lists the type badges in type order. Frames counts the source's frames in What it receives, so the counts sum to that section's total.
- List controls add "Any managed in" and "Any emits here" facets, Rows, and a pager.

### States
Steering records ship through `list_records`, memory through `list_memories`, and policy gates on Tools › Policy. ADRs and the product vision need `.oxagen/sources.toml`, which does not exist. No read joins them per agent, so a build renders the section as not recorded until one ships.
