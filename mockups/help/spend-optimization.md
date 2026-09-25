# Spend optimization

## Parts

A segmented control that picks one of the four parts of Optimization.

### Purpose
It answers "which kind of saving do I want to look at": money the frames show bought nothing, where the tokens went, what to change on each agent, or which prompt habits cost money. The person picks a part and reads one list at a time.

### Rationale
D10 gives Spend three views and no drill pages. Optimization absorbs the old Waste, Tokens and Coaching tabs, so each of them became a part of one view instead of a tab of its own (`fleet-operations-routes.md`, Spend). Findings, the costed problems with evidence, moved to Work under D9 and are not a part here. A segmented control, and not a second tab bar, keeps the page to one tab row.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The four parts | a literal list in `spendOptimization()` | none, a view choice | shipped |
| Recommendations count | `coachAgent()` over the workspace's agents | a recommendations contract (`list_coaching` in the app's notes) | future-only |
| Operator habits count | `operatorHabits()` over each operator | the operator review | future-only |

### Logic
1. `spendOptimization()` reads `S.spendPart`, which the route sets from `?part=`. With no `part` it shows Unproductive spend, and the hash leaves `part` out.
2. The buttons are Unproductive spend, Tokens and cache, Recommendations and Operator habits. The current one carries `aria-pressed="true"`.
3. A button calls `spendPartGo(x)`, which writes `#/<org>/<ws>/spend/optimization?part=<x>`. A part is a link, so the Spend Overview side panels can open one directly (`Open the habits`, `Recommendations`).
4. The Recommendations count is the rows that part lists. The Operator habits count is its cards. Neither part can disagree with its count, because both read the same array.
5. The old routes `/spend/waste`, `/spend/tokens` and `/spend/coaching` rewrite here in place.

### States
Loaded only. The Spend loading, error, empty and denied panels replace the whole body. On a phone the four buttons wrap to two rows.

## By cause

One meter per cause of unproductive spend, with its run count, its amount and one line from the frames.

### Purpose
It answers "what kind of waste costs the most this month". The person reads the largest cause first and opens the runs below it to see an example.

### Rationale
Mission-control-spec §12.8 names the patterns the findings job detects from frames. This part prints the month's totals per pattern and makes no claim about outcomes. The meters use the critical ink because the money is gone.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Cause, runs, amount, line | `SPEND.wasteByCause` | `list_waste` causes | partial |

Only one cause ships: `cache_write_never_read`, printed "cache written and never read", with its runs and up to ten proving run ids (`packages/oxagen/src/contracts/spend.waste.ts:14-24`). The six causes the design meters are not recorded (`apps/app/src/features/spend/waste.tsx:101`).

### Logic
1. `spendWaste("body")` draws the meters. The `"body"` argument leaves out its own four tiles, because the Spend header already shows the Unproductive spend tile.
2. Each bar's width is the cause's amount over the largest cause's amount.
3. The six causes are cache misses, corrective prompts, retry loops, context bloat, idle while parked, and halted early, in the fixture's order.
4. The amounts sum to the Unproductive spend tile, $85,768.79.
5. A run can show two causes. It counts toward both run counts, so the run counts do not sum to the runs figure.

### States
Loaded only. A build prints each cause it cannot read as not recorded, and shows the shipped cause with its runs. The meters stack at full width on a phone.

## Runs with unproductive spend

One card per run whose frames show tokens that bought nothing, with the amount and the pattern.

### Purpose
It gives the person a concrete run behind each cause. They open the run to read its Decision trace, or ask for the frames that show the waste.

### Rationale
A total with no example is hard to act on. Each card names the run, the agent, the operator and the pattern, so a person can check the claim against the record. Unproductive spend means the frames show the tokens bought nothing: a repeated call, a cold prefix, a turn spent waiting, or a chain that broke. Work a person accepted is never counted here. That definition sat in a note under the list. It lives here now.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Run id, agent, operator, start | `SPEND.wasteRunsList` joined to `RUNS` | `list_waste` run ids per cause | partial |
| Unproductive amount, badges, what bought nothing | `SPEND.wasteRunsList` | the waste record per run | future-only |
| Show the frames | a notice from `act()` | the frames behind the waste | future-only |

The run ids ship (`apps/app/src/features/spend/waste.tsx:50`). What each run wasted, its title and its steps are not on the waste record (`waste.tsx:167`).

### Logic
1. `spendWaste()` reads each entry of `SPEND.wasteRunsList` and looks up its run in `RUNS`. An entry whose run is missing renders nothing.
2. The bar is the unproductive amount over the run's cost, capped at 100%.
3. The footer line prints frames, steps, cache hit and model from the run.
4. **Open the run** goes to `#/<org>/<ws>/runs/<run>`. **Show the frames** shows a notice in the mockup. A build opens the frames the waste record cites.
5. A startup patch corrects one entry's text so it names the tool the parked invoice run actually waits on.

### States
Loaded only. The design has seven cards. The cards stack on a phone.

## By token class

The month's tokens split into five classes, with each class's share and cost, and four derived figures.

### Purpose
It answers "where did the tokens go, and at what price". The person compares uncached input with cache reads to see how much the cache saves.

### Rationale
Mission-control-spec §12.6 normalizes every provider's usage into a fixed set of classes once, at the gateway's proxy or the collector, so every downstream number derives from the same fields. The four figures below the table are the §12.6 derived metrics:

- **Cache hit rate** is cache reads as a share of all input tokens, token-weighted: `cache_read / (input_uncached + cache_read)`.
- **Cache write cost share** is `cost(cache_write) / cost(model call)`. It runs high when a prefix is written and never read.
- **Effective input price** is the cost of all input classes over all input tokens, per million, across every input class.
- **Unmapped classes** counts the classes Oxagen does not know. Oxagen stores such a class under its raw name and prices it at zero, so the gap stays visible.

These definitions sat beside each value on the page. The page now shows only the value.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tokens, share, cache hit rate | `wsTok()` | the token classes on `get_spend` | shipped |
| Cost per class, cache write cost share, effective input price, unmapped classes | `wsTok()` and constants | priced token classes | future-only |

### Logic
1. `spendTokens(WT)` builds five rows: `input_uncached` (input minus cache reads), `cache_read`, `cache_write`, `output` and `reasoning`. Each class name carries a tooltip saying what it counts.
2. Share is the class over the sum of the five.
3. Cost splits the month's spend by share. `cache_read` is priced at a tenth.
4. The total at the right equals the Tokens tile.
5. Cache write cost share weights writes at 1.25 times input. The effective price is a constant in the mockup.

### States
Loaded only. A build prints the cost column and the three priced figures as not recorded until priced classes ship. The table becomes cards on a phone.

## Prompt composition

One meter per part of the prompt, then output and reasoning, for the workspace's month.

### Purpose
It shows what the model was asked to read on each call: conversation, tool results, context frames, tool definitions, steering and system text. A part that dominates is where a saving starts.

### Rationale
Oxagen measures tool definitions, context frames and steering from the request it assembled. Tool results and conversation are the rest of the input. A part that grows without its citation rate growing is a finding, and the Recommendations part says what to change. That explanation sat in a note under the meters. The fields are `tool_definition_tokens`, `context_frame_tokens` and `steering_tokens` in mission-control-spec §12.6.

The Context frames and Steering meters count SteeringFrame tokens: what Oxagen resolved and injected for a run. A build labels them so they cannot read as recorded frames, the events on a run (D4).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The eight meters | `wsTok().parts`, `tokBars()` | `tool_definition_tokens`, `context_frame_tokens`, `steering_tokens` on the rollup | future-only |

The rollup does not carry these parts today (`apps/app/src/features/spend/tokens.tsx:133-146`).

### Logic
1. `tokBars(WT)` draws one row per entry of `TOK_PARTS`, then Output and Reasoning.
2. Each row prints the tokens and the share of input plus output.
3. Bar width is the row over the largest row.
4. Each meter carries a tooltip that says what the part counts.
5. `wsTok()` sums `agentTok()` over the workspace's agents, so these meters and the By agent columns read one rollup.

### States
Loaded only. A build prints the panel as not recorded until the three measured fields reach the rollup.

## By harness

The month's tokens by harness, with each harness's cache hit rate, spend and basis.

### Purpose
It answers "which harnesses are metered by the gateway, and which only report their own usage". A harness with a mixed basis is where a self-reported number could be wrong or absent.

### Rationale
Every spend number carries its basis (mission-control-spec §12.6 and §12.9). Observed means the gateway's proxy counted the tokens from the bytes that passed through it. Self-reported means the harness's own telemetry said so. A class a harness does not report is marked absent, never zero. A cache hit rate over a mixed fleet is never computed from missing data as if it were zero. That paragraph sat in a note under the table.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Harness, agents, tokens, cache hit, spend, basis | `wsTok().byHarness` | tokens by harness, with the observed share | future-only |
| Observed share badge | `wsTok().observed` | tokens by basis | future-only |

Neither is on the rollup (`apps/app/src/features/spend/tokens.tsx:148-150`).

### Logic
1. `wsTok()` groups the workspace's agents by harness label and sums their tokens, cache reads, input and spend.
2. `spendTokens()` sorts the harnesses by tokens, largest first.
3. The Basis cell reads the observed share of the harness's tokens. At 0.999 or above it prints Observed by gateway. At 0.001 or below it prints Reported by harness. Between the two it prints both chips with each share.
4. The badge at the right prints the observed share over the whole workspace. It matches the Observed by the gateway tile.

### States
Loaded only. The design lists eight harnesses. The table becomes cards on a phone.

## By agent

The workspace's twelve agents with the most tokens, with their prompt composition in columns.

### Purpose
It shows which agent spends its prompt on what. A person scans for tool definitions or tool results that run high, then opens the agent to change its toolbelt or its steering.

### Rationale
Recommendations name a threshold for each signal. This table shows the same numbers per agent, so a person can see how close each agent is to a threshold before a recommendation fires.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Runs, tokens, per run, cache hit, reasoning, basis | `agentTok()` | `get_spend` at `agent` | shipped |
| Tool defs, Context, Tool results | `agentTok().shares` | prompt parts per agent | future-only |

The shipped columns come from `apps/app/src/features/spend/tokens.tsx:151-222`. The three share columns print not recorded there (`tokens.tsx:210-216`).

### Logic
1. The rows are the workspace's agents sorted by tokens, largest first, cut to twelve, ten to a page.
2. Tool defs above 16% prints in the approval ink, the threshold of Narrow the toolbelt.
3. Tool results above 30% prints in the approval ink, the threshold of Page the tool results.
4. Reasoning is reasoning tokens over output tokens.
5. Basis reads Observed by gateway for an agent on the `gateway` or `contained` tier, else Reported by harness.
6. A row opens the agent's page.

### States
Loaded only. The table becomes cards on a phone.

## Recommendations for agents

One row per change the token record says an agent should make, with the signal, the money a month and one action.

### Purpose
It answers "what should I change on which agent, and what is it worth". The person picks the largest row and takes its action, which opens the page where that change is made.

### Rationale
A recommendation is read at request time from the same rollup the Tokens and cache part prints, so the two cannot disagree. It is never a model's opinion. Each one names the signal it came from and the change that moves it. That sentence sat in the panel's subtext, which now keeps only the count. The thresholds follow the findings of mission-control-spec §12.8.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent, title, text, signal, money, action | `coachAgent()` over the workspace's agents | recommendations read from the rollup | future-only |

The app has no record for recommendations, and the signals they read are not on the rollup (`apps/app/src/features/spend/coaching.tsx:1-7`).

### Logic
`coachAgent(a)` raises, from `agentTok(a)`:
1. **Narrow the toolbelt** when tool definitions exceed 16% of every request. Action: Edit the grant.
2. **Keep the prefix stable** when the cache hit rate is under 72%. Action: Open steering.
3. **Page the tool results** when tool result bodies exceed 30% of input. Action: Propose a record.
4. **Lower the context budget** when context exceeds 24% of input and is cited on under half the runs. Action: Open the compiler.
5. **Route classification-shaped work to a light model** when reasoning exceeds 40% of output on a flagship model. Action: Edit the definition.
6. **Stop the retry storms** when more than two runs, and more than 4% of runs, had three or more provider retries in one turn. Action: Open incidents.
7. **Stop writing cache for one-turn runs** when cache writes exceed 6% of input. Action: Edit the definition.

`spendOptimization()` sorts every row by money a month, largest first. The subtext reads "<N> across <M> agents in <workspace>." No action changes an agent by itself.

### States
Loaded only. The design lists 162 rows. The table becomes cards on a phone.

## Operator habits

One card per prompt habit of each operator, written as a rule the operator can adopt.

### Purpose
It tells an operator which habit in their own recorded turns costs money, and gives them one rule that changes it. A person can share the rule or propose the Steering record it suggests.

### Rationale
D15: no person is scored or ranked. Spend reports operator habits as rules to adopt, as the operator review in `docs/VISION.md` requires. The cards are read from the recorded turns and written as rules to adopt. They are listed by name. The record shows what happened, and it never grades the person. That was the panel's subtext. The Cuts in `fleet-operations-wedge.md` retired operator scores and severity ranking for this list.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, habit, record line, rule | `operatorHabits()` over `coachOperator()` and `operatorPrompts()` | the operator review | future-only |
| Share with a person | a notice from `act()` | a governed share action | future-only |

### Logic
1. `spendOptimization()` collects the operators of the workspace's agents, sorts them by name, and asks `operatorHabits(p)` for each.
2. `operatorHabits()` keeps the `prompts` items of `coachOperator(p)`. Two habits exist in the design:
   - **Briefs ask the agent to confirm what it already has**, from repeated reads across the operator's agents. Rule: "Write a fact the agent needs into a Steering record once, and leave it out of the brief." It carries **Propose the record**, which opens the record wizard.
   - **Sessions take more than one prompt**, from more than 1.5 prompts per session. Rule: "Settle the design and write down the missing context before the run, so the first prompt carries the task."
3. Every card carries **Share with <first name>**, whose notice reads "Rule shared with <name>. It quotes the turns it was read from."
4. The list never orders people by money. The review names four habits, and the design draws two.

### States
Loaded only. With no habit to show, the panel reads "No prompt habit stands out in this workspace’s recorded turns." The cards stack on a phone.
