<!-- run-cost: the Cost tab of a run -->

## Model fit

Model fit reads this one run and says whether its model and its effort setting were the right size for the work.

### Purpose
You opened the Cost tab because a run cost more, or less, than you expected. The first question is whether the agent is set up wrong: a model heavier than the job needed, or an effort setting so low that the run had to be corrected. Model fit answers that for this run and, when the record argues for a change, offers the pull request that makes it.

### Rationale
The model an agent runs on is the largest single lever on what its runs cost. It is set in the agent definition, so a change is a pull request against `.oxagen/agents/<slug>.toml`, never a write from this page. The reading changes nothing on its own. Nothing moves until that pull request merges, and a run that already sealed keeps the model and effort it ran with. The panel carries the badge "Generated estimate" because the reading is computed from the record by fixed rules. No model writes it, and it is an argument for a pull request, never a verdict or a score (`docs/fleet-operations-ia.md`, Run, Cost). The footer line lists the facts the reading used, so you can check it against the stat row.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Model reading | `runFit()` over `runMetrics()`, `runWaste()`, `MODEL_LADDER` | no contract. The app computes it in `apps/app/src/features/run/fit.ts` | partial |
| Effort value | `runEffort()` over `RUNS[].effort`, `TIER_RANK` | `effort`, `run.list.ts:380`, as the harness reported it | partial |
| Prompts, turns, output tokens, failed calls | `runPrompts()`, `RUNS[].turn`, `runMetrics()` | `get_run_cost` (`run.cost.ts:44-49`), `get_run_transcript` | live |
| Price a rung down or up | `PRICE`, `MODEL_LADDER[].out` | the price book | partial |

### Logic
1. `runEffort()` returns the effort only where Oxagen read it: the tier is `gateway` or `contained` (`TIER_RANK` 2 or more) and the run carries `effort`. A gateway run that sent no setting reads "model default". Below the gateway the model call never passed through Oxagen, so the request body was never read and the value is "not captured".
2. `runFit()` marks a run as redone when it took more than one prompt or any tool call failed.
3. The model card. "Heavier model than needed" when the run was not redone, was small (3 turns or fewer, or 12 steps or fewer), a lighter rung exists on `MODEL_LADDER` (Haiku 4.5, Sonnet 5, Opus 5), and pricing the same tokens on that rung saves at least $0.005. "Lighter model than needed" when the run took follow-up prompts that cost money (`runWaste().usd` above zero) and a heavier rung exists. The line prices the heavier rung on the same tokens, less the rework it would likely have avoided. Otherwise "Model fits this work". "Small" reads the run's own `R.steps`. A build reads the steps from `get_run_cost`.
4. The effort card. "No effort setting" or "Effort not captured" when the value was not read. The card names the reason and offers no action. "More effort than needed" when the run was not redone, effort is above `low`, and reasoning took more than 20% of output. "Less effort than needed" when the run was redone and effort is below `high`. Otherwise "Effort fits this run".
5. A fit reading draws a green badge in the header rig strip. An over or under reading draws an approval-coloured badge and a button, "Move this agent to <model>" or "Set effort to <value>", that opens `fitchange` with the argument `<run id>:model` or `<run id>:effort`.
6. The footer line is `fit.read`: prompts, turns, output tokens and the reasoning share, and the failed tool calls.

### States
The catalog run `run_01K5RS7M2E8FJ3QW` reads "Model fits this work" and "Less effort than needed" at effort `medium`. The halted run `run_01K5RH3G8K5PAS7D` reads "Lighter model than needed" on `claude-haiku-4-5`. A `harness` or `observe` run shows "Effort not captured" with no button. On a phone the two cards stack and `fitchange` rises as a sheet. The page's loading, error and denied panels replace the whole tab.

## Instruments

Six tiles give one run's cost, time, tokens, steps, tool calls and productive ratio, each with its basis and a small chart.

### Purpose
You want the shape of the run at a glance before you read any table: where the money went turn by turn, what the clock was spent on, how the tokens split, how busy each turn was, which tool families it called, and how much of the work moved the task forward. Each tile answers one of those and hands you a figure to compare with the agent's other runs.

### Rationale
The six tiles replace the player's frame-by-frame view with one derivation. `runMetrics()` feeds the stat row, these tiles, Spend by area, Tool calls, the Waterfall and the token classes, so no two panels can disagree (`run-cost.md`, Functionality). Every money figure shows its basis, `gateway_observed` or `client_attested`, because the mission control spec requires every spend number to carry it (`docs/mission-control-spec.md` §12.6). The Turns and steps tile keeps two words apart: a step is one model call or one tool call, and a frame is one recorded event. A run of 41 steps can hold 186 frames, because each call writes a request, a decision, a result and more.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Cost, basis, cost per turn, cache saving | `RUNS[].cost`, `RUNS[].basis`, `runSeries()`, `RUN_TURNS` | `get_run_cost` (`run.cost.ts:124`), `get_run_turns` (`run.turns.get.ts:76`) | live |
| Median run, 30-day ratio | `AGENTS[].spend30`, `AGENTS[].runs30`, `AGENTS[].ratio` | none | none |
| Wall clock split | `runMetrics()`, `runFrameClock()` over `FRAMES_BY_RUN` | derived from `get_run_transcript` (`apps/app/src/features/run/metrics.ts`) | partial |
| Tokens by class | `runMetrics()` over `PRICE` | `get_run_cost` (`run.cost.ts:37-98`) | live |
| Turns, steps, frames | `RUNS[].turn`, `RUNS[].steps`, `RUNS[].frames` | `get_run_cost` (`run.cost.ts:44-49`) | live |
| Families, batches | `runMetrics()` over `TOOLPOOL`, `toolMeta()`, `TCAT` | derived from the transcript | partial |
| Productive ratio | `RUNS[].ratio`, `runSeries()` | `productiveRatio` on `get_run_cost` | live |

### Logic
1. Cost. One column per turn from `runSeries()`. The catalog run reads its turns from `RUN_TURNS`, and every other run spreads its cost across turns with a generator seeded from the run id, so the numbers hold still between renders. The dearest turn carries its label. The line gives cost per turn and the delta against the agent's median run (`spend30 / runs30`). The foot gives the cache saving. On a live run the tile reads "Cost so far" and the last column is marked current.
2. Wall clock. `runFrameClock()` times the run from its own frames when the authored list reaches the last frame. Otherwise model time, tool time, waiting on a person (10 minutes per parked call) and harness overhead are estimated and then fitted inside the span from start to seal, waiting first. A batch costs its slowest call, so the foot compares parallel time with the serial sum.
3. Tokens. Input is one third of the cost at the effective input price of $1.88 per million, and output is two thirds at list. Cache read is input times the cache hit rate. Reasoning is 34% of output on a complex model and 5% on a light one.
4. Turns and steps. Steps per turn split into model calls and tool calls, 56% model.
5. Tool calls. Calls come from the agent's `TOOLPOOL`, grouped by family and ranked by count. The foot counts batches that ran more than one call.
6. Productive ratio. Steps that advanced the task are `steps × ratio`. The rest split into retries, re-reads and waits. The marker is the agent's 30-day ratio.
7. Every column and segment shows its figures on hover and focus through `tipAttr()`. A cost column opens the Cost tab and a step column opens the Decision trace.

### States
A sealed run reads "Cost" and "start to seal". A run with one turn draws one column. On a phone the six tiles stack to one column. In a build the median run and the 30-day ratio render as not recorded until a contract carries them.

## Spend by area

Spend by area splits the run's cost across what its tokens were spent on, then names the dearest tools.

### Purpose
You know what the run cost. Now you want to know what to cut. This panel shows how much went to the first prompt, follow-up prompts, retrieved context, tool definitions, tool results, the system prompt and the model's own output, so you can tell a prompting problem from a context problem from a tool problem.

### Rationale
The areas map onto the levers a person can pull: write a better first prompt, trim the toolbelt, retrieve less context, page a tool's results. Input is about a third of the money. It splits by the tokens each area added to the context window, and output is the rest. A follow-up prompt re-sends the whole window, so it costs far more than its own words, which is why the Prompts tile and this panel both count them. Tool calls split again by how long each tool ran, so the dearest tool shows by name. Spend across operators, agents and work orders lives on Spend (D10), and this panel is one run.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Model output | `runAreas()` over `runMetrics()` | the `output` and `reasoning` classes on `get_run_cost` | live |
| The six input areas | `runAreas()`, `runContext()`, `frReqComp()` | `tool_definition_tokens`, `context_frame_tokens`, `steering_tokens` on `cost.run_totals` (G3) | none |
| Most expensive tools | `runAreas()` over `runMetrics().calls` | `byTool` on `get_run_cost` (`run.cost.ts:78-85`), names and counts only | partial |
| Basis | `basisChip(R.basis)` | `spend.shared.ts:13-18` | live |

### Logic
1. `runAreas()` takes the mean request from `runContext()` and `frReqComp()`, then multiplies each block by the number of model calls.
2. Initial prompt is the prompt's tokens in every request. Follow-up prompts are 80% of a prompt, re-sent with the window, over the remaining calls. Context retrievals are context frames plus steering. Tool definitions and System prompt are their blocks. Tool calls take whatever input remains, so the six input areas sum to the input tokens.
3. Each input area costs its share of one third of the run's cost. Model output costs the other two thirds.
4. `runSpendByArea()` draws each area as a meter against the dearest area, with its cost and tokens, and a tooltip that says what the area holds.
5. Most expensive tools splits the Tool calls area by each tool's share of tool time, sorts by cost, and shows up to 8.

### States
A run with one prompt shows Follow-up prompts at $0.00 with "none" on hover. A run with no tool calls shows no tool list. On a phone the panel stacks under the instruments. A build shows the six input areas as not recorded, with empty tracks, until G3 ships.

## Tool calls

Tool calls breaks the run's calls down by family, by how many ran together, and by how many reads the harness started early.

### Purpose
You want to know what the agent spent its tool time on and whether it worked in parallel. The panel answers three questions: which families of tools it used and how often each failed, how wide its batches were and how much time batching saved, and how many speculative reads it started and actually used.

### Rationale
A family groups tools by what they act on: read, query, record, message, file, exec, version control, infrastructure, access and finance (`TCAT_ORDER`). It says nothing about risk or policy. Those live on the tool's own record and in the rule's answer on the Decision trace. Batching matters because a batch costs its slowest call, so a run that asks for three reads at once spends a third of the wall clock. Speculative prefetch is a harness feature: the harness starts the reads it expects the model to ask for before the step is final. Only read-only tools are eligible, because a discarded write would be a real effect. Policy checks a prefetched call the same way as any other. A discarded read is still recorded and billed, which is why the hit rate matters.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Calls by family, share, wall clock, failed | `runMetrics().families` over `TOOLPOOL`, `toolMeta()` | derived from `get_run_transcript` (`apps/app/src/features/run/metrics.ts`) | partial |
| Batches, widest, time saved | `runMetrics().batches`, `hist`, `serialMs`, `toolMs` | derived from the transcript | partial |
| Speculative prefetch | `runMetrics()` (`started`, `used`, `discarded`, `savedMs`) | none. No frame records a speculated read | none |

### Logic
1. `callsPanel()` lists every family with its distinct tools, calls, a bar against the busiest family, share of calls, summed wall clock and failures. A failure count above zero is a denied badge.
2. Tools per batch is a histogram of batch widths from `runMetrics().hist`. Batches counts those that ran more than one tool. Time saved by batching is the serial sum less the parallel time.
3. On a run whose authored frames reach its last frame, each call is its own batch, timed from the frames around it, so batching saves nothing.
4. Speculative prefetch counts read and query calls as eligible. The mockup models 72% of them as started and 73% of those as used, and credits 240 to 540 ms per used read.
5. Every bar shows its figures on hover and focus.

### States
A run with no tool call shows empty tables and a zero histogram. On a phone the three parts stack and the family table becomes labelled cards. A build shows Speculative prefetch as not recorded until Oxagen writes a frame for a speculated read.

## Waterfall

The Waterfall charts the run's cost turn by turn, accumulates it to the recorded total, and pins each Spend finding to the turn it points at.

### Purpose
You want to see when the money was spent. The bars show which turns were dear, the dashed line shows how fast the cost built up, and a diamond shows where a known waste pattern landed. The table under the chart gives the same numbers in rows you can read and add.

### Rationale
The mission control spec's run waterfall draws turns as bars with cost accumulating left to right, the cache hit rate per turn, and findings pinned to what caused them (`docs/mission-control-spec.md` §12.9). Findings are work (D9), so the diamond opens the finding's evidence instead of restating it. The total row is the sum of its rows set against the run's recorded cost, "of $4.13 recorded", rather than typed as it, so a mismatch would show. Bar height is the turn's cost on the left scale. The dashed line is the running total, and it ends at the run's cost.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Cost, steps, frames and cache hit per turn | `runSeries()`, `RUN_TURNS`, `wfTurnFrames()` | `get_run_turns` (`run.turns.get.ts:76`) | live |
| Findings and their turn | `FINDINGS`, `wfFindings()` | `list_findings` (`finding.list.ts:24`). No contract names a turn | partial |
| Recorded cost and basis | `RUNS[].cost`, `keyLabel(R.basis)` | `get_run_cost` | live |

### Logic
1. `wfChart()` draws one bar per turn on a scale set by the dearest turn, labelled with its cost, "T<n>" and its cache hit. A turn carrying a finding fills red at full opacity.
2. The dashed line joins the cumulative cost after each turn and ends at the run's cost, labelled "total".
3. `wfFindings()` keeps a finding whose window started on or before the run's day and whose subject is this run's agent, operator, workspace, or a tool the run called. It pins the finding to a turn by kind: a cache finding to the turn with the lowest cache hit, a tail finding to the last turn, a tool finding to the turn with the most tool calls, and anything else to the dearest turn. The diamond's title and the Pinned badge's tooltip say which.
4. A diamond or a Pinned badge opens `evidence` for that finding.
5. `wfTurnFrames()` counts frames per turn when every frame carries its turn. Otherwise it apportions `R.frames` by steps, and the panel says frames per turn are estimated from steps.
6. The table lists Turn, Steps, Frames, Cache hit, Cost, Running total and Pinned, then a total row.

### States
The catalog run carries 4 findings. A run no finding names draws no diamonds and shows a dash under Pinned. On a phone the chart scrolls sideways inside the panel (minimum 520 px) and the table becomes labelled cards.

## Spend by token class

Spend by token class splits the run's tokens and cost across the classes the cost record normalizes every provider into.

### Purpose
You want the cost in the provider's own terms: how many tokens were fresh input, how many came from cache, how many were written to cache, and how many were output and reasoning. The table lets you check the stat row's Tokens and Cost against the classes that make them up.

### Rationale
Providers name token classes differently. Oxagen's cost record normalizes them once into a fixed set, and every downstream number derives from those fields (`docs/mission-control-spec.md` §12.6). Input is about a third of the cost. It is priced at the effective rate across its classes, and a cache read costs a tenth of an uncached token. Output and reasoning are priced at the list rate for the run's model class, complex or light. A class the harness did not report is marked absent, never zero.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tokens by class | `runMetrics()` (`fresh`, `cacheRead`, `cacheWrite`, `tokOut`, `reasoning`) | `get_run_cost` (`run.cost.ts:37-98`), classes in `spend.shared.ts:107-116` | live |
| Cost by class | `costTab()` over `PRICE` | `costByClass` on `get_run_cost` | live |

### Logic
1. `costTab()` sets input cost to one third of the run's cost and derives the unit price so that fresh input plus a tenth of cache reads account for it.
2. `input_uncached` costs its tokens at that unit price. `cache_read` costs a tenth of it. `cache_write_5m` costs nothing in the mockup, which writes no cache.
3. `output` is visible output (output less reasoning) at the list rate, $75 per million on a complex model and $5 on a light one.
4. `reasoning` takes the remainder, so the rows sum to the recorded cost.
5. Share is each class's cost over the total. A class with no tokens shows a dash.
6. The total row shows the run's tokens, its recorded cost and 100.0%.

### States
The rollup records a sixth class, `cache_write_1h`, which a build lists after `cache_write_5m`. On a phone the table becomes labelled cards.

## Prompt composition

Prompt composition shows what the mean model request of this run was made of, block by block.

### Purpose
You want to know how much of each request was conversation you control and how much was fixed overhead: tool definitions, steering, the system prompt and retrieved context. A request that is mostly definitions points at the toolbelt. One that is mostly context points at retrieval.

### Rationale
Prompt composition is one of the derived metrics every model call carries (`docs/mission-control-spec.md` §12.6), read from the measured fields `tool_definition_tokens`, `context_frame_tokens` and `steering_tokens`. The panel also carries the effective input price, the cache write cost share, the basis and the productive ratio, so the three prices on this tab can be checked against one another. The basis says who counted the tokens. `gateway_observed` means the proxy counted them from the bytes that passed through it. `client_attested` means the harness's own telemetry reported them, and a class it did not report is marked absent, never zero.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tokens per request | `runMetrics().perCall` | `get_run_cost` | live |
| Block split | `runContext()`, `frReqComp()` | the request split by part (G3) | none |
| Effective input price, cache write share | `costTab()` over `runMetrics()` | derived from `get_run_cost` | live |
| Basis | `basisChip(R.basis)` | `spend.shared.ts:13-18` | live |
| Productive ratio | `RUNS[].ratio`, `runSeries().adv` | `productiveRatio` on `get_run_cost` | live |

### Logic
1. `runContext()` reads the run's first `model.request` and returns its system, steering and tool blocks. The authored catalog run reads them from `CTXB`.
2. `frReqComp()` sizes the mean request. System, steering and tool definitions keep those figures, scaled down to fit a smaller request. Context frames take up to 62% of the 18,000-token budget or 60% of what is left, and conversation takes the rest. The five meters always sum to the tokens per request.
3. Each meter is drawn against the request total.
4. Cache write cost share reads "0.0%, nothing written this run" when no class was written to cache.

### States
A run with no recorded `model.request` falls back to the gateway's default block sizes. On a phone the panel stacks under Spend by token class. A build shows the block split as not recorded, with empty tracks, until G3 ships.

## Change the model or effort {#dialog/fitchange}
<!-- open: openDialog('fitchange','run_01K5RS7M2E8FJ3QW:effort') -->

The dialog opens a pull request that moves this agent to the model or effort the Model fit reading proposed.

### Purpose
The reading argued for a change, and you agree. The dialog shows the argument again, names the file that changes, sets today's value beside the proposed one with its effect per run, and opens the pull request.

### Rationale
The model and the effort setting live in the agent definition, a file in the main repository. A change to it is a pull request that a person reviews and merges, the same path as any other definition change. The dialog never writes to the agent. A reading changes nothing until somebody merges its pull request. The first run after the merge uses the new value, and a run the agent already sealed keeps the settings it ran with, so the record of past runs never shifts.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Argument, proposed value, effect per run | `runFit()` | computed in the app (`apps/app/src/features/run/fit.ts`) | partial |
| Agent, file, today's value | `AGENTS`, `RUNS[].model`, `runEffort()` | `list_agents`, the agent definition | live |
| The pull request | `fitPr()`, `OXPRS` | `commit_agent_definition` (`agent.definition.commit.ts:47`) | partial |

### Logic
1. `DLG_EXT.fitchange` splits its argument into the run id and `model` or `effort`, and returns "That record is no longer here." when the run is gone.
2. The title reads "Set effort to <value>" or "Move to <model>". The body repeats the reading's line, then Agent, File (`.oxagen/agents/<slug>.toml`), Today, Proposed and Effect per run, in dollars less or more.
3. The note under the facts says the first run after this pull request merges uses the change.
4. "Open the pull request" calls `fitPr()`. It adds a pull request to `OXPRS` on the workspace's main repository, on branch `agents/<slug>-<model or effort>`, that modifies `.oxagen/agents/<slug>.toml` with the new value. It carries three checks, all passing in the mockup: `schema`, `belt_unchanged` (the toolbelt is unchanged, so nothing the agent may do changes) and `budget_fit` (the agent's daily budget covers the new price). The three checks are the mockup's own.
5. The dialog closes and the toast reads "Opened <repo>#<n>."

### States
A reading of fit or unseen offers no button, so the dialog opens only from an over or under reading. On a phone it rises from the bottom as a sheet with full-width buttons. In a build, opening the pull request runs `commit_agent_definition`, which changes nothing until a person merges it.
