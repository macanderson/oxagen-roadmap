# Run cost

| | |
|---|---|
| Route | `#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/cost`. Old routes that land here: in the app, `/{org}/{ws}/runs/{run}?tab=cost` (308 to the segment) |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D10 and D15 (Spend owns the rollups; no person is scored), D17 (future-only marks). `docs/fleet-operations-ia.md` (Run, Cost: tokens by class, spend by area, the per-turn waterfall and the model fit). `docs/mission-control-spec.md` §12.6 (token classes) and §12.9 (the run waterfall). `run.md` owns the header, the Summary, the stat row, the tab bar and the side column this tab shares |
| Design | `mockups/src/engine.js` → `runFitPanel()`, `runFit()`, `runEffort()`, `DLG_EXT.fitchange`, `fitPr()`, `runInstruments()`, `runSpendByArea()`, `runAreas()`, `callsPanel()`, `costTab()`, `wfChart()`, `wfFindings()`, `wfTurnFrames()`, over `runMetrics()` and `runSeries()`, inside `pRun()`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Runs / Cost`: Loaded and Loaded · mobile |
| Audit | `run-cost.audit-prompt.md` |

## Job

Say what one run cost and where the money went: the model and effort it ran on and whether the record argues either was the wrong size, the cost turn by turn, the tokens by class, the areas and tools the tokens were spent on, and the calls. Every figure carries its basis. Spend by operator, agent and work order lives on Spend (D10); this tab is one run.

## What is on the page

**Shared.** The run header, the Summary, the stat row, the tab bar with "Cost" selected, and the side column, as `run.md` specifies them.

**Model fit**, first. Heading "Model fit" and the badge "generated · not the record". Two cards.

- The model card. A fit reading: the title "Model fit" and one line ("Opus 5 matches this shape of work. Nothing in the record argues for moving it either way."). An over or under reading: the title "Wrong model tier", its badge, what the record showed and what the run would have cost a rung down or up, and "Move this agent to <model>".
- The effort card. A reading: the title "Wrong effort setting", its badge, the line ("This run took 2 prompts to land on effort medium. At high the model thinks before it acts, which is cheaper than being told again.") and "Set effort to high". A fit reading states the effort and why it fits. Where the effort was not read, the title "Effort setting" and the reason it was not captured, with no action.
- The footer note: "Read from this run only: 2 prompts · 7 turns · 36,711 output tokens, 34% of them reasoning · no tool call failed. A reading is an argument, not a verdict, and it changes nothing until somebody merges the change to .oxagen/agents/release-manager.toml."

The action opens `fitchange`: the title ("Set effort to high"), the argument, the facts Agent, File (`.oxagen/agents/release-manager.toml`), Today, Proposed and "Effect on this shape of run" ("$0.56 more a run"), the note "Every run the agent has already sealed keeps the model it ran on. This changes the next one.", and "Cancel" and "Open the pull request" (gold). Opening it writes a pull request against the agent definition and never changes a run.

**The instruments**, six tiles. Each has a name, a basis, one figure, one line, a small chart and a foot.

| Tile | Basis | Figure | Line, chart and foot |
|---|---|---|---|
| Cost so far | `gateway_observed` | $4.13 USD | "$0.59 per turn · turn 5 was the dearest · +$1.24 vs this agent’s median run $2.89"; one column per turn, the dearest labelled; "cache hit 83% · saved ≈ $1.71 against an uncached prompt" |
| Wall clock | "so far", or "start to seal" | 13m 3s elapsed | "77% of it waiting on a person · 1 call parked for approval"; a stacked bar of model, tool, waiting on a person and harness with each duration; "Running 12 batches together cost 20s of wall clock against 27s one at a time." |
| Tokens | "in and out" | 768,981 tokens | "732,270 in · 36,711 out · 12,482 of the output was reasoning"; a stacked bar of cache read, fresh input and output; "Cache hit 83% of input · 33,285 tokens per model call · effective input price $1.88 per million · nothing written to cache" |
| Shape of the run | "16 frames in view" | 7 turns · 41 steps · 186 frames | "A step is one model call or one tool call; a frame is one recorded event."; steps per turn split into model and tool calls; "1.6 tools per batch · 0.86 tool calls per model call" |
| Tool calls | "2 families" | 19 calls | one row per family with a bar and a count (Read-only 16, Source control 3); "6 of 12 batches ran in parallel · up to 3 at once" |
| Productive ratio | "steps that advanced the task" | 71%, "+9 pts vs 30-day 62%" | a bar of steps that advanced against steps that did not, with this agent's 30-day ratio marked; "12 steps did not move the task: 7 retries, 3 re-reads, 2 waits." |

Each column and bar segment shows its figures on hover and on focus.

**Spend by area.** Heading "Spend by area" and "$4.13 · gateway_observed". Seven meters, each with its cost and tokens: Initial prompt, Follow-up prompts, Context retrievals, Tool definitions, Tool calls, System prompt and Model output. Then the eyebrow "Dearest tools", up to eight tools with their calls and cost ("github__get_commit 3 calls · $0.19"). The note: "Input is a third of the money, split by the tokens each area put into the window; output is the rest. Tool calls split again by the wall clock each tool held, so the dearest tool is visible. A follow-up prompt re-sends the window, which is why it costs more than its own words."

**Tool calls.** Heading "Tool calls" and "19 calls · 12 batches · 2 families". Three parts:

- "Calls by family": Family · Calls · a bar · Share · Wall clock · Failed. Each family row names its family and its count of distinct tools. The note: "A family says what a tool acts on. It is orthogonal to the hazard and to what the belt decided."
- "Tools per batch": a histogram of batch widths, then Batches ("12 · 6 ran more than one tool"), Widest batch ("3 tools at once"), Mean fan-out ("1.58 tools per batch") and Wall clock won ("7s · 20s together against 27s in turn").
- "Speculative prefetch": "9 of 12 used" with a bar of used against discarded, then Eligible ("16 read-only calls · a write is never speculated"), Hit rate ("75%"), Wall clock saved ("4s"), Billed ("discarded reads are recorded and billed; nothing is hidden"), and a note that only read-only families are eligible.

**Waterfall.** Heading "Waterfall", the badges "4 findings" and "7 turns · $4.13 gateway_observed". The chart: one bar per turn at its cost on the left scale, labelled with the cost, the turn ("T1") and its cache hit; a dashed line of the cost so far ending at "$4.13 total"; a diamond for each Spend finding that names this run, on the turn its pattern points at. The legend: "turn cost", "turn carrying a finding", "cost so far". The caption: "Bar height is the turn’s cost on the left scale; the dashed line is cost accumulating to $4.13. Diamonds are Spend findings that name this run, pinned to the turn their pattern points at. Each mark opens." The table: Turn · Steps · Frames · Cache hit · Cost · Running total · Pinned, with each pinned finding as a badge, and a total row ("total 41 186 83% $4.13 of $4.13 recorded"). Under it, when the frames in view carry no turn: "Frames per turn are apportioned by steps: this run’s frames in view do not carry their turn."

**Spend by token class** beside **Prompt composition**.

- Spend by token class: "768,981 tokens", then Class · Tokens · Cost · Share over `input_uncached`, `cache_read`, `cache_write_5m`, `output` and `reasoning`, and a total row (768,981, $4.13, 100.0%). A class with no tokens shows "—" for its cost. The rollup records a sixth class, `cache_write_1h`, which a build lists after `cache_write_5m`. The note: "Input is a third of the money and priced at the effective rate across its classes, a cache read at a tenth of an uncached token; output and reasoning are priced at the flagship list rate."
- Prompt composition: "33,285 tok", then meters for Conversation, Context frames, Tool definitions, Steering and System, then Effective input price ("$1.88 per million across all input classes"), Cache write cost share, Basis ("gateway_observed · counted by the proxy from the bytes that passed through it") and Productive ratio ("71% · 29 of 41 steps advanced the task").

**Dialogs this tab opens:** `fitchange` from the Model fit cards, `evidence` from a diamond or a Pinned badge (the finding's evidence, specified in `work-findings.md`), and the run dialogs from the header (`run.md`).

## Data sources

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen (file paths) | Status |
|---|---|---|---|---|
| Model fit reading | `runFit()` over `runMetrics()` | a reading over the run's prompts, failed calls, turns and steps | no contract. The app computes it from the run and its cost (`apps/app/src/features/run/fit.ts`); the effort is the harness-reported `effort` (`packages/oxagen/src/contracts/run.list.ts:380`) | 🟡 |
| The fit pull request | `fitPr()`, `OXPRS` | `commit_agent_definition` | `packages/oxagen/src/contracts/agent.definition.commit.ts:47`. The three checks the mockup's pull request shows are the mockup's | 🟡 |
| Cost, basis, estimate | `RUNS[].cost`, `RUNS[].basis` | `get_run_cost` | `packages/oxagen/src/contracts/run.cost.ts:124`; `isEstimate` on the rollup; basis `packages/oxagen/src/contracts/spend.shared.ts:13-18` | ✅ |
| Per-turn cost, steps, frames and cache hit | `runSeries()`, `RUN_TURNS` | `get_run_turns` | `packages/oxagen/src/contracts/run.turns.get.ts:76` (turn, frames, model and tool steps, cost, cumulative cost, cache tokens) | ✅ |
| Median run and 30-day productive ratio of the agent | `AGENTS[].spend30`, `AGENTS[].ratio` | none | not recorded (`apps/app/src/features/run/instruments.tsx` names them not recorded) | ❌ |
| Tokens by class, cache hit, cache saving | `runMetrics()` | `get_run_cost` | tokens by class and `costByClass` per model, `cacheHitRate`, `cacheSaving` (`run.cost.ts:37-98`); classes `input_uncached`, `cache_read`, `cache_write_5m`, `cache_write_1h`, `output`, `reasoning` (`spend.shared.ts:107-116`) | ✅ |
| Turns, steps, model and tool calls, retries, productive ratio | `RUNS[]` | `get_run_cost` | `turns`, `steps`, `modelCalls`, `toolCalls`, `retries`, `productiveRatio` (`run.cost.ts:44-49`) | ✅ |
| Wall clock split, families, batches | `runMetrics()` | the whole-run transcript | derived in the app from `get_run_transcript` at `everything` (`apps/app/src/features/run/metrics.ts`) | 🟡 |
| Speculative prefetch | `runMetrics()` | none | Oxagen writes no frame for a speculated read (`apps/app/src/features/run/tool-calls.tsx`) | ❌ |
| Spend by area: Model output | `runAreas()` | `get_run_cost` | the output and reasoning classes | ✅ |
| Spend by area: the six input areas | `runAreas()` | `tool_definition_tokens`, `context_frame_tokens`, `steering_tokens` on `cost.run_totals` (G3) | not recorded (`apps/app/src/features/run/spend-by-area.tsx`) | ❌ |
| Dearest tools | `runAreas()` | per-tool cost | `byTool` names and call counts only (`run.cost.ts:78-85`); a tool call carries no price | 🟡 |
| Finding diamonds and Pinned | `FINDINGS`, `wfFindings()` | `list_findings`; the turn a finding points at | `packages/oxagen/src/contracts/finding.list.ts:24`, four kinds (`packages/oxagen/src/contracts/finding.shared.ts:15-20`). No contract names a turn, and "Cache misses after a stable prefix changed" is not a recorded kind | 🟡 |
| Prompt composition | `runContext()`, `frReqComp()` | the request split by part (G3) | not recorded (`apps/app/src/features/run/token-classes.tsx`) | ❌ |

## Future-only fields

This tab's own content carries no future-only mark, and the catalog gives it no future story. The one mark on screen is the shared header's work order chip ("work orders"), which a build leaves out until the run records its work order (`run.md`). The ❌ rows above are not marked in the mockup; a build renders each as not recorded, with an empty track where the design draws a bar.

## Functionality

- One derivation feeds the stat row, the instruments, Spend by area, Tool calls, the waterfall and the token classes, so no two panels can disagree. The Tokens tile equals the stat row's Tokens and the total row of Spend by token class. The Shape tile's steps and frames equal the waterfall's total row.
- The waterfall's total row is the sum of its rows, set against the run's recorded cost ("of $4.13 recorded") rather than typed as it.
- The model reading is keyed on what the run record varies: prompts, failed tool calls, turns and steps. It is never keyed on reasoning share, which is a fixed fraction of output per model family.
- The effort reading renders a value only where the record holds the setting. Otherwise the card names the reason and offers nothing. Oxagen never guesses an effort value.
- A reading changes nothing until somebody merges its pull request, and a sealed run keeps the model it ran on.
- Each diamond and each Pinned badge opens that finding's evidence. A pin never asserts more than the finding it cites.
- Every money figure shows its basis. A class the harness did not report is marked absent, never zero.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

- The shell is as `run.md` describes, with Work lit in the thumb bar.
- The six instruments stack to one column. Spend by area, Tool calls and the two last panels stack.
- The waterfall chart scrolls sideways inside its panel (its minimum width is 520 px), and the page never scrolls sideways. Its table and the token class table become labelled cards.
- `fitchange` rises from the bottom as a sheet with full-width buttons.
- Every button and link has a hit area of at least 44 px.

## Permissions

- Read: `get_run_cost` and `get_run_turns`, allowed by default to organization Owner, Admin, Billing and Member and to workspace Owner and Member (`run.cost.ts:136-139`). `list_findings` for the pins.
- Write: `commit_agent_definition` from `fitchange`, which opens a pull request and changes nothing until a person merges it.

## Backend gaps this page depends on

- G3: `tool_definition_tokens`, `context_frame_tokens` and `steering_tokens` on `cost.run_totals`, for Spend by area and Prompt composition.
- A per-tool cost, so the dearest tools are priced rather than counted.
- A frame for a speculated read, for Speculative prefetch.
- The turn a finding points at, for the diamonds.
- The agent's median run cost and 30-day productive ratio, for the deltas.
- The run's work order, for the shared header (`run.md`).

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- The tab reads the record. The Model fit panel is a reading, labelled "generated · not the record", and argues for a pull request. It is never a verdict, a score or a model-written account of why the run behaved as it did.
- No person is scored or ranked. Operator habits live on Spend as rules to adopt.
- Every enforcement claim states the tier, and every money figure states its basis. `gateway_observed` appears only where the proxy counted the call.
- Headers are rollups of the rows beneath them: the instrument figures, the panel tallies and the total rows are sums of their rows, never typed twice.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. This tab has none of its own; `fitchange`'s "Open the pull request" is the gold while it is open.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
