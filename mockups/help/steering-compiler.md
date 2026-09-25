## Inputs

The agent and the brief the Compiler resolves, with the brief chips that fill the text area.

### Purpose

You pick one agent and write or pick one brief, and the envelope below re-resolves for that pair. You use it to ask what an agent would receive for a given task before any work order sends one.

### Rationale

The Compiler replaced Preview. It runs the same resolver that builds an agent's Steering tab and a run's Decision trace envelope, so for the same sources, agent and brief the three cannot disagree. It has no clock and no model: the same inputs give the same envelope every time.

The Compiler sends nothing. No brief reaches an agent from this page, no run starts, and no frame, record or audit event is written. A brief becomes an `invocation` frame only when a work order sends it, which is why the Prompt point stays empty here.

The agent option reads "<name> · <harness>". The page spec calls that mid-dot a design defect, not a pattern to copy.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent options | `AGENTS` in the workspace via `stgAgent()` | The agent registry (`list_agents`) | shipped |
| Tier | `AGENTS[].tier` via `tierBadge()` | `enforcementTier` from the latest session | shipped |
| Repository | `STEERING_PREVIEW.agents[].repo`, else the workspace's main repository | The repository the agent works in | future-only |
| Standing brief per agent | `STEERING_PREVIEW.agents[].prompt` | A standing brief per agent | future-only |
| Brief chips | `STEERING_PREVIEW.prompts` | A work order's brief | future-only |

### Logic

- `stgCompilerTab` lists every agent in the workspace, one option each. If the address names an agent outside the workspace, it selects the first agent and that agent's standing brief.
- Under the select: "Tier: <badge> · Repository: <repository>". `stgAgent` supplies the repository from `STEERING_PREVIEW.agents`, or `a-intel/billing`, `a-intel/mobile` or `a-intel/platform` by the agent's workspace.
- Changing the agent calls `pvAgent`. While the text area is untouched (`S.pv.text` is null) it selects the agent's standing brief. It then writes `/steering/compiler/<slug>` into the address.
- The Brief text area has the placeholder "What a work order would send". Typing calls `pvInput`, which repaints `#pvOut` alone, so the caret stays where it is. On a phone it re-runs `cardTables`.
- `pvPrompt` answers the brief in order: the typed text, the chosen chip's text, then `agentBrief(slug)`.
- The chips come from `STEERING_PREVIEW.prompts` for the workspace, six in Core platform. The one in use carries `aria-pressed`. A chip calls `pvPreset`, which clears the typed text.
- No control on the panel is gold. The header's New source keeps the gold.

### States

- A workspace with no agent renders "No agent is registered in this workspace." in place of the whole tab body.
- Loaded only otherwise. The page's loading, error and denied panels come from `pSteering`.
- In a build, the agent select and the tier are the only live data until #3879 ships. The repository line, the standing briefs and the chips render as not recorded.
- Mobile: the Agent and Brief fields stack, and the chips wrap one to a line. The Brief text area is 16 px so it does not zoom.

## Envelope

Every SteeringFrame the assembler resolves for this agent and brief, grouped by where it would enter the run.

### Purpose

It answers what this agent would receive for this brief, frame by frame: its type, its body, its source at a version, its force and its cost. You use it to check a new record's landing, to see why a prefix is full, or to trace a frame back to the source that emits it.

### Rationale

A Steering Source and a SteeringFrame are two objects (D4). Sources list durable material. The envelope lists what the assembler resolved from those sources for one run shape. Every frame names its source, the source version and its hash (D6), and every row links to the source at the version it names.

Every frame has one of eight types (D5), and the type says what the frame is for. Force (`must`, `should`, `may`, `info`) decides where it goes. `must` and `should` fill the session-start prefix, which the harness receives in the signed bundle. `may` and `info` compete for the per-prompt selection, ranked by relevance to the brief. A skill's files arrive in the checkout (D12), and the toolbelt's tools arrive as `capability` frames in the tool list. A harness's own tools are not frames, because Oxagen did not put them there.

`envelopeHtml`, `frameTable`, `POINTS` and `stgMeter` are shared with the run's Decision trace. The meter sub-lines and the point descriptions are the run page's to change, and this section follows whatever that page ships.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The envelope | `resolveEnvelope()` over `assembleSteering()` and `stgItems()` | A read-only capability that runs the assembler without delivering (#3879) | future-only |
| Frame type, source version and hash | `frameOf()`, `srcCell()` | `type`, `source.version` and `hash` on every SteeringFrame | future-only |
| Session-start meter | `STEERING_PREVIEW.budget` (16,384 bytes at 4 bytes a token) | The prefix budget in each run's `steering.manifest` | partial |
| Per-prompt meter | `STEERING_PREVIEW.budget.volatileTok` (430) | A per-prompt budget for `may` and `info` | future-only |
| Candidates | `RECORDS`, `STEERING_PREVIEW.instructions`, `SKILLS`, `ONTOLOGY`, `MEMORY`, `GATES`, `SOURCES`, `MANDATES`, `TOOLBELTS` | The assembler's source adapters | partial |

### Logic

- `compilerOut` calls `resolveEnvelope(S.pv.agent, pvPrompt(), {})`. The caption reads "44 SteeringFrames for release-manager in a-intel/platform." With a type picked, it reads "<n> <type> of 44 SteeringFrames".
- The resolution, in order: scope, then lineage and precedence, then gate notices and `must` and `should` sources into the prefix. Then `may` and `info` candidates, with each registered document's sections, are ranked by `stgScore` against the brief's words and packed under 430 tokens. The agent definition adds a `procedure` at `should`, and each active mandate a `delegation` at `must`. Each synced skill adds `SKILL.md` as a `procedure`, each reference as a `context` and each entrypoint as a `capability` descriptor. The toolbelt adds one `capability` per tool it shows the model.
- The meters: "Session-start prefix" is the 38-token compile header plus the Session start frames, out of 4,096 ("1,102 of 4,096 tok"). "Per-prompt selection" is the Prompt submit frames, out of 430 ("419 of 430 tok"). Checkout files and the Tool list are not metered.
- The type strip is one button per type present with its count. Pressing one calls `dtType(type, "cmp")` and filters the envelope and the exclusions to that type. "Show every type" clears it.
- One block per injection point that carries frames, in `POINTS` order: Session start, Prompt, Prompt submit, Model request, Checkout files, Tool list. Each shows its name and "<n> frames · <tok> tok", with no caption. The Envelope section of the run help (`mockups/help/run.md`) says what reaches the model at each point. For the release manager: 14, 8, 9 and 13 frames. Prompt and Model request stay empty, because the Compiler sends no brief and no steer.
- Each block is a `frameTable`: Type, SteeringFrame (with "enforced by <gate>" where a gate enforces it), Source, Force and Tokens (a dash for a descriptor). It shows four rows and "Show all <n>" until a type is picked.
- Rows sort by type, then force, then id.
- The mockup outlines this section with the `frame types and per-frame provenance` future mark.

### States

- A point with no frames has no block.
- In a build the whole section renders "not recorded", naming #3879. It never presents a run's manifest as this envelope.
- Mobile: the meters stack, the type strip wraps, and every table becomes a stack of labeled cards.

## Exclusions

Every frame the assembler resolved and did not deliver, with the reason from a closed vocabulary and the numbers that decided it.

### Purpose

It answers why something you expected is missing. Each row names the frame, the injection point it would have entered, its source, the reason and the figures behind the reason. You use it to see that a record lost on budget, a memory yielded to a `must`, or a skill was withheld.

### Rationale

An exclusion is deterministic. The same sources, agent, brief and budget give the same exclusions, and each one names what decided it: the budget, what was already spent, the frame's cost, its score or the newer version. The reason comes from the closed vocabulary in `docs/fleet-operations-wedge.md` (Exclusion reasons), never from free text, so a person can match a row to a manifest. No model decides a reason, and no score is added past the relevance count the assembler uses.

Only `tier`, `over_budget` (recorded as `budget`) and `superseded` are recorded in `steering.manifest` today, so every other reason badge carries a future mark.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Excluded frames | `resolveEnvelope()` `cut` | The exclusions a read-only assembler run returns (#3879) | future-only |
| Reasons `tier`, `over_budget`, `superseded` | `mapCut()`, `XR_SHIPPED` | The cut reasons in `steering.manifest` | partial |
| Every other reason | `XR` | The closed vocabulary of the wedge spec | future-only |
| The numbers behind a reason | `why` on each cut frame | The figures the assembler used | future-only |

### Logic

- `exclusionsHtml(E, "cmp")` draws one `frameTable` with the columns Type, SteeringFrame (with the injection point under the body), Source, Reason and Tokens.
- `xrBadge` shows the reason in words ("Below relevance floor") with its key and meaning as the title.
- `mapCut` turns the assembler's cuts into the vocabulary: out of scope to `out_of_scope`, superseded to `superseded`, lower precedence to `overridden_by_must`, and an over-budget cut to `below_relevance_floor` when it scored 0, else `over_budget`.
- `resolveEnvelope` repacks the per-prompt candidates with the documents' sections. A candidate that scores 0 is `below_relevance_floor` ("relevance 0 for this brief"). One that does not fit is `over_budget`, with its rank, its cost and what was left ("rank 5 of 11 · needs 231 tok, 141 left" is the shape).
- A withheld skill is excluded before ranking as `unapproved_digest` or `out_of_scope`, in Checkout files. A tool the toolbelt denies is `overridden_by_gate`, with the rule that denies it.
- For the release manager and "Cut the 4.11.0 release notes": 24 exclusions. 7 `below_relevance_floor`, 8 `out_of_scope`, 4 `over_budget`, 2 `overridden_by_gate`, 1 `overridden_by_must`, 1 `superseded` and 1 `unapproved_digest`.
- Rows sort by reason, then type, force and id. The table shows six rows and "Show all <n>" until a type is picked.
- The section carries the future mark "a capability that resolves without delivering (#3879)".

### States

- Nothing excluded: "Nothing was excluded." With a type picked and none of it excluded: "Nothing of this type was excluded."
- In a build, a reason other than `tier`, `over_budget` and `superseded` reads "not recorded", and the section as a whole waits on #3879.
- Mobile: each row becomes a card with its fields labeled.
