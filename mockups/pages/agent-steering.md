# Agent › Steering

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents/release-manager/steering` |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D4 (a Steering Source and a SteeringFrame are two objects), D5 (eight frame types), D6 (source, version and hash on every frame), D7, D17, and the Steering sections Two objects, Frame types, Emissions, Provenance, Exclusion reasons and Shipped today. `docs/fleet-operations-ia.md` (Agents: “The SteeringFrames this agent receives by type, and the sources they come from”). ADR-093 in `macanderson/oxagen` for force and the assembler. The agent header and the tab bar are specified in `agent.md` |
| Design | `mockups/src/wedge.js` → `aSteering()` and `agentBrief()`, over `resolveEnvelope()`, `envelopeHtml()`, `exclusionsHtml()`, `frameTable()`, `frameRow()`, `srcCell()`, `srcHref()`, `typeStrip()`, `xrBadge()` and `ftBadge()`; the one assembler `assembleSteering()` in `mockups/src/engine.js`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Agents / Steering`: Loaded, Loaded · mobile, and Loaded · future-only fields marked |
| Audit | `agent-steering.audit-prompt.md` |

## Job

What steers this agent, as the frames it receives and the sources they come from. The tab resolves the agent's envelope for its standing brief: every SteeringFrame the agent would receive, by injection point and type, what was resolved and not delivered with the reason, and the Steering Sources behind the frames. Nothing is authored here. Each source is managed where it lives, and the Compiler takes any brief.

The Compiler, this tab and a run's Decision trace read one resolver, so for the same agent, brief and sources they cannot disagree.

## What is on the page

The agent header and the tab bar are as `agent.md` specifies, with Steering selected. The body is three numbered sections.

**Delivery warning.** On an agent whose tier is `observe`, a warning comes first: “Assembled, not delivered. This agent is on the observe tier. No hook is installed, so nothing below reaches it.” The demo agent is on `gateway`, so the demo does not show it.

**1 · What it receives.** The sentence: “44 SteeringFrames for its standing brief, “Cut the 4.11.0 release notes”.” **Open in the Compiler** on the right opens `#/a-intel/core-platform/steering/compiler/release-manager`. The standing brief is the agent's preview prompt, or its description when no prompt is set up. On pr-reviewer the description ends in a full stop inside the quotation marks and the sentence adds its own after them, a copy defect a build avoids.

- Two meters. **Session-start prefix**: “1,102 of 4,096 tok”, captioned “16 KiB in the signed bundle, header included”. **Per-prompt selection**: “419 of 430 tok”, captioned “picked for this brief under the workspace budget”.
- The type strip: one button per frame type present, in type order, each the type badge and its count, with `aria-pressed`. The demo reads goal 1, invariant 1, constraint 9, procedure 10, context 9, capability 14. Pressing one filters the frames and the exclusions to that type and adds **Show every type**.
- The injection points that carry frames, in this order, each with its name, its caption and a tally:

| Injection point | Caption | Demo tally |
|---|---|---|
| Session start | “the stable prefix, delivered in the signed bundle” | “14 frames · 1,064 tok” |
| Prompt submit | “the per-prompt selection, picked for this prompt” | “8 frames · 419 tok” |
| Checkout files | “synced into the checkout, loaded by the harness” | “9 frames · 9,140 tok” |
| Tool list | “the tool definitions the toolbelt shows the model” | “13 frames · 977 tok” |

  Prompt and Model request do not appear: the standing brief is not a work order's send and carries no steer.
- Each injection point is a table, Type · SteeringFrame · Source · Force · Tokens. Type is the type badge. SteeringFrame is the body, with “enforced by <gate>” under a gate-backed frame that is not a capability (“enforced by gate.never-merge”). Source is the source kind (“Product vision”, “ADR”, “Steering record”, “Policy”, “Skill”, “Memory”, “Glossary term”, “Agent definition”, “Toolbelt”), the source id as a link to where it is managed, and the source version with the frame's hash (“a4c91e2 · #bdec8418”). A toolbelt's version is the date it last changed (`tb_context_graph`, “updated 2026-08-30”). Force is `must`, `should`, `may` or `info`. Tokens is the frame's cost, or a dash for a descriptor that costs nothing (a skill entrypoint). Rows sort by type, then force, then id. A table shows four rows and **Show all N**, which turns into **Show the first 4**.
- Two fixture defects show in this section. Three Steering records render with no version (`ctx.release.platform-only`, `ctx.release.semver`, `ctx.release.milestone-4-11`), and frames with different bodies share a hash (`#3f0b8c1d` on both `ctx.release.never-merge` and `gate.never-merge`, `#c02fa77e` on both `ctx.mobile.no-codegen` and `gate.mobile-codegen` in section 2, and a skill's description line and its `SKILL.md` both carry the skill's digest). Every frame carries its source version, and its hash is over its own body (D6).

**2 · Excluded.** The sentence: “24 resolved for this agent and not delivered, each with its reason.” One table, Type · SteeringFrame · Source · Reason · Tokens, with the injection point under each body. Reason is a mono badge from the closed vocabulary, with the numbers that decided it under it:

| Reason | Demo count | What the line under it says |
|---|---|---|
| `below_relevance_floor` | 7 | “relevance 0 for this brief” |
| `out_of_scope` | 8 | The scope that missed: “scoped to a-intel/mobile; this agent works in a-intel/platform”, “scoped to the agent triage”, “applies to triage, docs-writer”, “no agent holds the tool it gates” |
| `over_budget` | 3 | “rank 5 of 11 · needs 231 tok, 141 left” |
| `overridden_by_gate` | 2 | The gate: “definition deny_tools: github__merge_pull_request@*” |
| `overridden_by_must` | 1 | “a published must beats recalled memory: ctx.release.never-merge” |
| `superseded` | 1 | “replaced by ctx.platform.safari-e2e-flake, published 2026-09-02” |
| `unapproved_digest` | 1 | “Its digest changed on 2026-09-09 after Priya Natarajan approved 1.3.2. Nobody has approved the new one.” |

A withheld skill's body reads “Withheld before ranking. The agent is told the count and the reason, never the name.” The withheld mobile skill's scope line says “This run works in a-intel/platform” on a tab that resolves no run; a build says this agent, as the other scope lines do. The table shows six rows and **Show all 24**. With nothing excluded: “Nothing was excluded.” With a type picked and none of it excluded: “Nothing of this type was excluded.”

**3 · Sources.** The sentence: “26 sources reach this agent, each managed where it lives.” One table, Source · Emits here · Frames · Managed in, one row per source. Source is the kind, the id as a link and the version. Emits here is the type badges the source emits for this agent. Frames is the count of its frames in section 1, and the counts sum to 44. Managed in is Steering, Tools or Agents. A toolbelt is one row (five toolbelts, 13 capability frames among them), and a skill whose description line and files both arrive is one row. List controls: “Any managed in” and “Any emits here” facets, the second offering one type per option, Rows (5, 10, 25, 50, All) and a pager (“1–10 of 26”).

The tab opens no dialog. Every link leaves for the page that manages the source, or for the Compiler.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Contract paths are under `packages/oxagen/src/contracts/` in `macanderson/oxagen` `main`.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Delivery warning | `a.tier` | `list_agents` `enforcementTier` | `agent.list.ts:78-83` | ✅ |
| Standing brief | `STG_PREVIEW.prompts` via `agentBrief()`, or the agent's description | The agent's standing brief | No store records one | ❌ |
| The envelope: frames by injection point and type | `resolveEnvelope()` over `RECORDS`, `SOURCES`, `SKILLS`, `MEMORY`, `ONTOLOGY`, `GATES`, `MANDATES`, `BELT` | A capability that resolves an agent's envelope for a brief and delivers nothing | None (#3879). `assembleSteering` (`packages/steering-assembler/src/assemble.ts:251`) runs only inside the policy bundle build (`packages/handlers/src/lib/tacho-steering.ts:226`), over Steering records alone (`tacho-steering.ts:195`). What a run records is `steering.manifest`: items with id, kind, force, tokens, outcome and reason, and no type, scope, hash or provenance (`packages/tacho/src/wire.ts:626-697`). `get_steering_deliveries` counts included and cut records per recent run (`context.steering.deliveries.ts:6`) | ❌ |
| Frame types | `FT`, `REC_TYPE`, `itemFrame()` | `type` on every SteeringFrame | Item kinds only: `record`, `steer`, `skill`, `memory`, `ontology`, `policy`, `instruction` (`wire.ts:630-638`) | ❌ |
| Source, version and frame hash | `srcCell()`, `frameOf()` | `source.kind`, `source.id`, `source.version`, `hash` | None on a frame. A Steering record's own fields ship: version, checksum, commit, path (`list_records` at `context.records.list.ts:16`, `get_record` at `context.records.get.ts:126`) | ❌ |
| Force and tokens | `it.force`, `it.tok` | `force`, `token_cost` | On `steering.manifest` items (`wire.ts:643-654`) | 🟡 |
| Session-start prefix meter | `E.prefixTok`, `E.prefixCap` | The prefix cap and what the prefix spends | The assembler's budget is 2,000 tokens, sized to the smallest harness limit (`packages/steering-assembler/src/assemble.ts:100`); the manifest records `budget_tokens` and `spent_tokens` (`wire.ts:666-677`). The design's cap is 16 KiB, 4,096 tokens | 🟡 |
| Per-prompt selection meter and Prompt submit frames | `E.volatileTok`, `E.volatileCap` | A per-prompt selection ranked for the brief at prompt submit | The shipped assembler builds the session-start prefix only; `may` and `info` items are cut as `tier` (`assemble.ts:59-60`) | ❌ |
| Checkout files frames | `M.skills`, `SOURCES.bundles` | Skill bundles synced into the checkout | Skill sync and bundles are future-only on Sources | ❌ |
| Tool list frames | `beltOf()` | One `capability` frame per tool the toolbelt shows | The toolbelt ships (`get_agent_toolbelt`, `agent.toolbelt.get.ts:94`); capability frames do not | ❌ |
| Exclusions with reason `tier`, `over_budget`, `superseded` | `mapCut()`, `XR` | Exclusion reasons | Recorded on `steering.manifest` as `tier`, `budget` and `superseded` (`wire.ts:641`) | 🟡 |
| Other exclusion reasons | `XR` | The closed vocabulary of the wedge spec | `out_of_scope` and `unapproved_digest` for skills only, in `preview_skill_search` (`skill.search.preview.ts:13`). The rest are not recorded | ❌ |
| Sources table | `resolveEnvelope().sel` grouped by source | The sources that reach the agent, with what each emits | Steering records ship through `list_records`; ADRs and the product vision need `.oxagen/sources.toml`, which does not exist; memory ships through `list_memories` (`agent.memory.list.ts:24`); policy gates ship on Tools › Policy; no read joins them per agent | 🟡 |
| Open in the Compiler | link | The Compiler | Future-only (#3879) | ❌ |

## Future-only fields

The design marks these with `data-future` (they outline with `?future=1`):

| Mark | Reason in the design | What a build shows today |
|---|---|---|
| Section 1, What it receives, as a whole | “frame types and per-frame provenance” | The section renders not recorded, naming #3879. No envelope is built from a run's manifest and presented as this one |
| Each frame hash after the version (“ · #bdec8418”) | “per-frame provenance” | The source version alone, where the source records one |
| Each exclusion reason other than `tier`, `over_budget` and `superseded` | “steering.manifest records tier, budget and superseded today” | Not recorded. `over_budget` shows as the manifest's `budget` |

The section 1 mark covers everything inside it: the standing brief, **Open in the Compiler**, the meters, the type strip and every injection point. Unmarked in the design, and future-only all the same: section 2 as a whole, because a run's manifest records its own cuts and nothing resolves them for a standing brief, and section 3, because no read joins the sources per agent. A build renders each as not recorded until its contract ships.

## Functionality

- One resolver builds this tab, the Compiler and the Decision trace (`resolveEnvelope()`), so the same agent, brief and sources give the same frames and the same exclusions in all three.
- The tab resolves the standing brief. A work order's brief changes the per-prompt selection, so a run's envelope can differ from this one in Prompt submit, and it adds the Prompt frames of the work order's send and any Model request steer.
- Frames arrive in type order, then force, then id. Force decides between the prefix and the per-prompt selection; type says what the frame is for.
- A frame whose hash does not match its source version is excluded as `steering_drift` and raises an incident.
- An exclusion is deterministic. It names a reason from the closed vocabulary and the numbers that decided it.
- Nothing is authored here. A source row links to the page that manages the source, where its versions and every frame it emits are listed. A frame row links to its source at the version it names.
- A skill reaches the agent twice: its description line competes at Prompt submit as a `procedure`, and its files arrive in Checkout files. Both frames name the same source, so the Sources table lists the skill once.
- The type strip filters this agent's frames. The mockup keeps the pick when another agent's Steering tab opens (`S.ftype.ag` in `dtType()` is not per agent); a build resets it with the agent, as the toolbelt search does.
- A delegation frame appears for each active mandate the agent holds, in Session start (see `agent-permissions.md`). A harness's own tools, such as Bash in Claude Code, are not frames.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The two meters stack, the type strip wraps, and every frame table becomes a stack of cards: the type badge heads each card, and Frame, Source, Force (or Reason) and Tokens are labelled rows beneath it. The Sources table becomes cards the same way. Touch targets are at least 44 px and nothing scrolls sideways.

## Permissions

- Read: the agent read (`get_agent`, as `agent.md` gives it) and the Steering read for the sources. The mockup names `agent.read`.
- No writes on this tab.

## Backend gaps this page depends on

- A capability that resolves an agent's envelope for a brief without starting a run (#3879).
- Frame types and per-frame provenance (source kind, id, version, hash, injection point) on `steering.manifest`.
- `.oxagen/sources.toml` and the vision and ADR source kinds (an ADR beside ADR-093).
- A per-prompt selection at prompt submit, and the exclusion reasons past `tier`, `budget` and `superseded`.
- Capability frames for the toolbelt and for skill entrypoints, and skill bundles synced into the checkout.
- A standing brief per agent, or a rule for which brief the tab resolves.
- The prefix cap: the design reads 16 KiB (4,096 tokens), and the shipped assembler caps the prefix at 2,000 tokens to fit the smallest harness limit. One of them changes, by an ADR.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. This tab shows SteeringFrames only.
- A Steering Source and a SteeringFrame are never shown as each other. A source row links to the source's own page, which lists the frames it emits; a frame row links to its source at the version it names.
- The tab reads the record and the sources at their versions. No inference, no score, no model-written account of why. A ranking score shows only as the number an exclusion names.
- No person is scored or ranked.
- Every enforcement claim states the tier. “Enforced” only for calls routed through Oxagen. On the `observe` tier the warning says nothing below reaches the agent.
- Headers are rollups of the rows beneath them: each injection point's tally is the sum of its rows, the type strip counts are the frames by type, the section 1 total is the sum of the tallies, the Excluded count is its rows, and the Sources frame counts sum to the section 1 total.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. A quoted string above that breaks this rule is a mockup defect to fix, not copy to reproduce.
- Exactly one gold (primary) action per screen. This tab has none.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
