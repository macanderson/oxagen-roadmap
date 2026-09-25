# Steering › Compiler

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/compiler/release-manager`, and `/steering/compiler/<agent>` for any agent. `/steering/compiler` with no agent resolves the first agent with a standing brief and leaves the address bare. Old route: `/steering/preview/{agent}`, resolved in place to `/steering/compiler/{agent}` (`docs/fleet-operations-routes.md`, Steering). The mockup rewrites `#/:org/:ws/steering/preview[/<agent>]` in place |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D4 (a source and a frame are two objects), D5 (eight frame types), D6 (provenance and `steering_drift`), D11 (delegation frames), D12 (capability frames from skill entrypoints); the Steering sections Frame types, Emissions, Provenance, Exclusion reasons and Shipped today ("No capability runs the assembler without delivering (#3879), so the Compiler is future-only"); the vocabulary rows Compiler, Envelope, Injection point and Exclusion. `docs/fleet-operations-ia.md` (Steering, Compiler). ADR-093 in `macanderson/oxagen` (§4, the injection points) |
| Design | `mockups/src/wedge.js`: `stgCompilerTab`, `compilerOut`, `resolveEnvelope`, `envelopeHtml`, `exclusionsHtml`, `frameTable`, `frameRow`, `srcCell`, `srcHref`, `typeStrip`, `xrBadge`, `pvAgent`, `pvInput`; `mockups/src/engine.js`: `assembleSteering`, `stgItems`, `stgMeter`, `pvPrompt`, `pvPreset`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Steering / Compiler`: Loaded, Loaded · mobile, and Loaded · future-only fields marked |
| Audit | `steering-compiler.audit-prompt.md` |

## Job

Pick an agent and a brief, and see the envelope the assembler would resolve: every SteeringFrame by injection point and type, each with its source, version and hash, and every frame it resolved and did not deliver, with the reason and the numbers that decided it. The Compiler sends nothing. No brief reaches an agent from this page, and no run starts.

It runs the same resolver that builds an agent's Steering tab and a run's Decision trace envelope, so for the same sources, agent and brief the three cannot disagree. There is no clock and no model in it: the same inputs give the same envelope and the same exclusions every time.

## What is on the page

**Header, tabs and shell.** As `steering.md`, with Compiler selected. The kind filter does not render on this tab. New source keeps the gold in the header; no control in the body is gold.

**Controls** panel.

- **Agent**: a select labelled "Agent", with one option per agent in the workspace. Each option reads "<name> · <harness>": "Release manager · Claude Code", "stella CI · stella", "Triage · Codex CLI", "Docs writer · Other (SDK-wrapped)", "PR reviewer · Claude Code" and the rest, so an agent named in the address is always in the list. Under the select, the agent's tier badge and "works in a-intel/platform". Changing the agent writes `/steering/compiler/<slug>` into the address.
- **Brief**: a two-line text area labelled "Brief", with the placeholder "What a work order would send". Under it: "Sends nothing. Nothing here reaches an agent."
- Six brief chips in a group labelled "Pick a brief", with `aria-pressed` on the one in use: "Cut the 4.11.0 release notes", "CI is green, merge the release pull request", "Label the flaky checkout e2e test on Safari", "Plan the ledger entries migration for billing", "Tighten the CLI reference style guide" and "Pay the September AWS invoice". Each agent has a standing brief (Release manager's is the first), and choosing an agent selects it while the text area is untouched.

**1 Envelope.** A numbered section, headed "Envelope".

- Caption: "44 SteeringFrames for release-manager in a-intel/platform."
- Two meters, each a bar with `role=img` and a percent label:
  - "Session-start prefix", "1,102 of 4,096 tok", with "16 KiB in the signed bundle, header included" under it. The figure is the compile header (38 tok) plus the Session start frames.
  - "Per-prompt selection", "419 of 430 tok", with "picked for this brief under the workspace budget" under it. The figure is the Prompt submit frames.
- The type strip: a button per frame type present, each the type badge and its count, with `aria-pressed`: `goal` 1, `invariant` 1, `constraint` 9, `procedure` 10, `context` 9 and `capability` 14. Pressing one filters both sections to that type, and "Show every type" clears it.
- One block per injection point that carries frames, in this order, each with its name, its description in dim text, and "<n> frames · <tok> tok" at the right:

| Injection point | Description | Release manager, "Cut the 4.11.0 release notes" |
|---|---|---|
| Session start | "the stable prefix, delivered in the signed bundle" | 14 frames, 1,064 tok |
| Prompt | "the brief the run started with" | No block: the Compiler sends no brief |
| Prompt submit | "the per-prompt selection, picked for this prompt" | 8 frames, 419 tok |
| Model request | "added at the gateway, between turns" | No block: no steer |
| Checkout files | "synced into the checkout, loaded by the harness" | 9 frames, 9,140 tok |
| Tool list | "the tool definitions the toolbelt shows the model" | 13 frames, 977 tok |

- Each block is a table. Columns, in order: Type, SteeringFrame, Source, Force and Tokens.
  - **Type**: the frame-type badge, with the type's description as its title.
  - **SteeringFrame**: the body. A frame a gate enforces adds "enforced by <gate>" under it ("enforced by gate.never-merge", "enforced by decision rule", "enforced by mandate", "enforced by kill switch").
  - **Source**: the source kind in small dim text ("Product vision", "ADR", "Steering record", "Policy", "Agent definition", "Skill", "Memory", "Glossary term", "Mandate", "Toolbelt"), the source id in mono as a link to the source at the version it names, and the version with " · #" and the first 8 hex of the frame's hash (`a4c91e2 · #bdec8418`).
  - **Force**: the force badge.
  - **Tokens**: the frame's cost, or a dash for a capability descriptor.
- A block shows its first four frames and "Show all <n>"; opened, it offers "Show the first 4". A filtered block shows every frame of the type.
- What the release manager's envelope holds, by point: at Session start, the vision's `goal` and `constraint`, ADR-021's `invariant` (enforced by gate.never-merge), the `must` records (`ctx.release.never-merge`, `ctx.release.platform-only`, `ctx.release.semver`), three gate notices (`gate.never-merge`, `gate.no-mandate`, `gate.rg_0093`), ADR-033's `constraint`, the `should` record `ctx.release.notes-format`, the agent definition's `procedure`, and ADR-014's and ADR-021's `procedure`; at Prompt submit, two skill descriptions, the memory `mem_01K5QX2A`, ADR-014's and the vision's `context`, the record `ctx.release.milestone-4-11` and the glossary terms `ont.release-train` and `ont.surface`; in Checkout files, five skills' `SKILL.md`, three reference files and the entrypoint `group-prs` as a `capability` descriptor; in the Tool list, one `capability` per tool on the toolbelt.

**2 Exclusions.** A numbered section, headed "Exclusions".

- Caption: "24 resolved and not delivered, each with its reason."
- One table. Columns, in order: Type, SteeringFrame (with the injection point it would have entered under the body), Source, Reason and Tokens.
- **Reason** is a badge in mono from the closed vocabulary, with its meaning as its title, and under it the numbers that decided it:

| Reason | Count | Why, as the row gives it |
|---|---|---|
| `below_relevance_floor` | 7 | "relevance 0 for this brief" |
| `out_of_scope` | 8 | "scoped to a-intel/mobile; this agent works in a-intel/platform", "scoped to a-intel/billing; this agent works in a-intel/platform", "scoped to the agent docs-writer", "applies to triage, docs-writer", "no agent holds the tool it gates", or a withheld skill's scope |
| `over_budget` | 3 | "ranked 5 of 11 for this brief, relevance 4. 231 tok did not fit in the 141 left" |
| `overridden_by_gate` | 2 | the rule that denies the tool: "definition deny_tools: github__merge_pull_request@*" |
| `overridden_by_must` | 1 | "a published must beats recalled memory: ctx.release.never-merge" |
| `superseded` | 1 | "replaced by ctx.platform.safari-e2e-flake, published 2026-09-02" |
| `unapproved_digest` | 1 | the withheld skill's reason |

- The table shows its first six rows and "Show all 24". Rows are ordered by reason, then by type, force and id. With nothing excluded it reads "Nothing was excluded."

**Dialogs.** The header's `govmode`, `skcfg` and `newsrc`, as `steering.md` specifies. The tab opens none of its own.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in `macanderson/oxagen` | Status |
|---|---|---|---|---|
| The agents in the select | `STEERING_PREVIEW.agents` via `stgAgents()`, `AGENTS` | The agent registry | `list_agents` returns name, harness and key (`packages/oxagen/src/contracts/agent.list.ts:142`, `:58-75`) | ✅ |
| Tier under the select | `AGENTS[].tier` | The tier the latest session recorded | `list_agents` `enforcementTier` (`agent.list.ts:83`) | ✅ |
| "works in <repository>" | `STEERING_PREVIEW.agents[].repo` | The repository the agent works in | The registry carries no repository per agent | ❌ |
| The standing briefs and the chips | `STEERING_PREVIEW.prompts` | A work order's brief, or a standing brief per agent | Nothing stores a work order or a brief (wedge spec, Work, Shipped today) | ❌ |
| The envelope | `resolveEnvelope()` over `assembleSteering()` and `stgItems()` | A read-only capability that runs the assembler for one agent and one brief | None (#3879). `assembleSteering` (`packages/steering-assembler/src/assemble.ts:251`) runs only inside the policy bundle build (`packages/handlers/src/lib/tacho-steering.ts:226`), over Steering records alone (`:195`) | ❌ |
| Frame types, source versions and hashes | `frameOf()`, `srcCell()` | Every SteeringFrame's `type`, `source.version` and `hash` | `steering.manifest` items carry id, kind, force, tokens, outcome and reason (`packages/tacho/src/wire.ts:643-654`) | ❌ |
| The session-start meter | `STEERING_PREVIEW.budget` (16,384 bytes at 4 bytes a token) | The prefix budget | The shipped budget is 2,000 tokens (`assemble.ts:100`; `tacho-steering.ts:89`), because Claude Code reads at most 10,000 characters of a hook answer. Each run's `steering.manifest` records `budget_tokens` and `spent_tokens` (`wire.ts:666-677`). The mockup's 4,096 has no source | 🟡 |
| The per-prompt meter and its 430-token budget | `STEERING_PREVIEW.budget.volatileTok` | A per-prompt budget for `may` and `info` | None. `may` and `info` records are cut as `tier` today (`assemble.ts:60`, `:134`) | ❌ |
| Exclusions `tier`, `over_budget` (recorded as `budget`) and `superseded` | `mapCut()`, `XR_SHIPPED` | The manifest's cut reasons | Recorded per run (`wire.ts:641`). Not resolvable here without #3879 | 🟡 |
| Every other exclusion reason | `XR` | The closed vocabulary of the wedge spec | None | ❌ |
| The candidates: records, instructions, skills, glossary terms, memory, gate notices, documents, mandates, toolbelts | `RECORDS`, `STEERING_PREVIEW.instructions`, `SKILLS`, `ONTOLOGY`, `MEMORY`, `GATES`, `SOURCES`, `MANDATES`, `TOOLBELTS` | The assembler's source adapters | The assembler accepts the kinds `record`, `steer`, `skill`, `memory`, `ontology`, `policy` and `instruction` (`assemble.ts:48-56`); only records are adapted (`tacho-steering.ts:195`) | 🟡 |

## Future-only fields

| Mark | Reason | What a build shows today |
|---|---|---|
| The whole Envelope section | `frame types and per-frame provenance` | The section renders "not recorded", naming #3879. No envelope is built from a run's manifest and presented as this one |
| The " · #<hash>" part of every Source cell | `per-frame provenance` | Nothing after the version |
| Every Reason badge other than `tier`, `over_budget` and `superseded` | `steering.manifest records tier, budget and superseded today` | The reason reads "not recorded" |

The Exclusions section as a whole carries no mark in the mockup and is future-only in `macanderson/oxagen` for the same reason as the envelope (#3879). So are the standing briefs, the brief chips, "works in <repository>" and the per-prompt meter. A build renders each as not recorded; the agent select and the tier are the only live data on the tab until the capability ships.

## Functionality

- The Compiler sends nothing. It resolves an envelope for one agent and one brief and records no run, no frame and no audit event.
- It is deterministic. The same sources, agent and brief give the same envelope and the same exclusions, with the same hashes.
- How the envelope resolves:
  1. Scope first. A source whose scope does not match the agent or its repository is excluded as `out_of_scope`, and so is a gate notice for a tool no agent holds.
  2. Then lineage and precedence. An item a newer version replaced is `superseded`, and recalled memory that a published `must` contradicts is `overridden_by_must`.
  3. Gate notices and the `must` and `should` sources fill the session-start prefix, which a gate notice never gives way in.
  4. The `may` and `info` candidates are ranked by relevance to the brief and packed under the per-prompt budget. A candidate with relevance 0 is `below_relevance_floor`; one that does not fit is `over_budget`, with its rank, its relevance, its cost and what was left.
  5. The agent definition's instructions add a `procedure` at `should`. Each active mandate adds a `delegation` at `must`.
  6. Each synced skill adds its `SKILL.md` as a `procedure`, each reference as a `context` and each entrypoint as a `capability` descriptor, in Checkout files. A withheld skill is excluded as `unapproved_digest` or `out_of_scope`, before ranking.
  7. The toolbelt adds one `capability` per tool it shows the model. A harness's own tools are not frames. A tool the toolbelt denies is excluded as `overridden_by_gate`, with the rule.
- Frames are ordered by type (`goal` to `capability`), then force, then id. Exclusions are ordered by reason, then the same way.
- The meters are sums of the rows beneath them. The session-start figure is the compile header plus the Session start frames; the volatile figure is the Prompt submit frames. Checkout files and the Tool list carry no budget here and are not metered.
- Typing in Brief re-resolves on every keystroke and keeps the caret. A chip sets the brief. Changing the agent writes its address and, while the text area is untouched, selects that agent's standing brief.
- Every Source cell links to the source at the version it names: a Steering record, a document, a memory, a glossary term or the instructions to its page, a skill to its skill page, an agent definition to the agent's Source tab, a policy source to Tools › Policy (a kill switch's notice to Tools › Kill switches, where its switch is flipped), a mandate to the agent's Delegation and a toolbelt to Tools › Toolbelts. The mockup sends every policy source to Tools › Policy and every mandate to Agents; a build links each to where the Sources row's Managed in column points.
- The Prompt and Model request points stay empty here: a brief becomes an `invocation` frame only when a work order sends it, and a steer only when an operator sends one. A run's Decision trace shows both.
- A skill appears in two places in the envelope: its description line competes at Prompt submit as a `procedure`, and its files arrive in Checkout files. The wedge spec's Emissions table names only the frames from the files, and the skill's own page lists only those. The design has to settle whether the description line is a frame; until it does, a build keeps the envelope and the skill's page in agreement. The mockup's Source link on a description-line frame carries a `skill:` prefix and lands on "No skill here"; a build links it to the skill's page.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with More lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The four tabs are one strip that scrolls sideways with Compiler in view. The Agent and Brief controls stack, and the brief chips wrap one to a line. The two meters stack. The type strip wraps. Every frame table becomes a stack of cards: the type badge first, then Frame, Source, Force and Tokens, each labelled. The page never scrolls sideways; touch targets are at least 44 px and inputs are 16 px, so the Brief text area does not zoom.

## Permissions

- Read: the Steering read, `steering.read on core-platform` in the mockup's denied panel. The agent list reads through `list_agents`, which allows an organization Owner, Admin or Member and a workspace Owner or Member.
- No writes. The Compiler reads and resolves.

## Backend gaps this page depends on

- A read-only capability that runs the assembler for one agent and one brief and returns the envelope and the exclusions without delivering (#3879).
- Frame types, source versions and hashes on every SteeringFrame, and the `steering_drift` check against the source version (wedge spec, Provenance).
- The source adapters beyond Steering records: documents, skills and their bundles, memory, glossary terms, gate notices, instructions, mandates as delegation frames and the toolbelt as capability frames (#3830, #3880, #3904).
- The per-prompt selection and its budget, and the exclusion reasons past `tier`, `budget` and `superseded`.
- The repository each agent works in, and a standing brief per agent.

## Rules every build of this page must keep

- The Compiler sends nothing. No control on it starts a run, sends a brief or writes a record.
- A Steering Source and a SteeringFrame are never shown as each other. Every frame row links to its source at the version it names, and no row presents a source as a frame. Every frame the envelope attributes to a source appears on that source's page with the same id.
- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- An exclusion is deterministic. It names a reason from the closed vocabulary and the numbers that decided it: the budget, what was already spent, the frame's cost, its score, or the newer version.
- No model decides anything here, and no inference or score is added to the resolution.
- Every enforcement claim states the tier. The tier sits under the agent select, and "enforced by <gate>" holds only for calls routed through Oxagen.
- Headers are rollups of the rows beneath them: the envelope's count is its frames, each block's figures are its rows, the meters are sums of the blocks, and the exclusions' count is its rows.
- No person is scored or ranked.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing; the mid-dot in each agent option is a design defect, not a pattern to copy.
- Exactly one gold action per screen: the header's New source. No chip, meter or type button is gold.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
