# Spend optimization

| | |
|---|---|
| Route | `#/a-intel/core-platform/spend/optimization`, with `?part=waste\|tokens\|agents\|habits`. Unproductive spend is the default and the hash leaves `part` out. Old routes rewritten here in place (`fleet-operations-routes.md`, Spend): `/spend/waste` to the bare path, `/spend/tokens` to `?part=tokens`, and `/spend/coaching` to `?part=agents`. Findings moved to Work: `/spend/findings` lands on `/work/findings` |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D9 (findings are work), D10 (three views), D15 (no person scored or ranked, and habits as rules to adopt), and the Cuts rows for the Spend tabs and for operator scores and severity ranking. `docs/fleet-operations-ia.md`, Spend (Optimization). `docs/fleet-operations-routes.md`, Spend. In `macanderson/oxagen`: the operator review in `docs/VISION.md`. `docs/mission-control-spec.md` §12.6 (token classes and prompt composition) and §12.8 (where to optimize) |
| Design | `mockups/src/wedge.js`: `spendOptimization()`, `operatorHabits()`, `spendPartGo()`, inside `pSpend()`. `mockups/src/engine.js`: `spendWaste()`, `spendTokens()`, `tokBars()`, `coachAgent()`, `coachOperator()`, `operatorPrompts()`, `wsTok()`, `agentTok()`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Spend / Optimization`: Loaded, Loaded · mobile |
| Audit | `spend-optimization.audit-prompt.md` |

The Spend header, the four tiles and the tabs are specified in `spend.md`.

## Job

Show where this workspace's money bought nothing and what would change it. Four parts: unproductive spend by cause with the runs that show it, where the tokens went, one recommendation per signal for each agent, and each operator's prompt habits written as rules the operator can adopt. The habits follow the operator review: they report what the recorded turns show, in alphabetical order, with no rank, no score and no verdict. Findings, the costed problems with their evidence, live in Work (D9).

## What is on the page

**Header, tiles and tabs** as `spend.md`, with Optimization selected. The header's **Set a budget** stays the one gold action.

**Parts.** A segmented control (`role="group"`, labelled "Optimization") with four buttons, the current one `aria-pressed`: Unproductive spend · Tokens and cache · Agents (162) · Operator habits (16). A button writes `?part=`. The counts are the rows of the Agents part and the cards of the Operator habits part.

### Unproductive spend

**By cause.** One meter per cause: the cause, its run count, its amount, a bar in the critical ink, and one line saying what the frames show.

| Cause | Runs | Amount | Line beneath |
|---|---|---|---|
| cache misses | 6,284 | $28,757.78 | system-context digest changed mid-conversation; every later turn re-read the prefix at full price |
| corrective prompts | 2,845 | $28,185.89 | a prompt after the first fixed or filled what the first left out, and each one re-ran the window at full price |
| retry loops | 1,126 | $14,615.40 | the same tool call repeated three or more times with the same arguments |
| context bloat | 2,875 | $9,856.23 | tool list or tool results larger than the turn used; the toolbelt was recomputed mid-run |
| idle while parked | 563 | $2,295.66 | turns spent re-checking an approval that had not arrived |
| halted early | 1,097 | $2,057.83 | a policy deny at turn 1 after the prompt was already paid for |

The six amounts sum to the Unproductive spend tile, $85,768.79. A run can show more than one cause.

**Runs with unproductive spend.** One card per run, seven in the design. Each card: the run id (a link to the run), "<agent> · <operator> · <started>", "$<unproductive> unproductive of $<cost>", badges naming what the frames show (such as "chain break", "retry loop ×3", "context bloat +1,900 tok", "idle while parked", "halted turn 1"), a bar of the unproductive share, the work order's title and what bought nothing, "<frames> frames · <steps> steps · cache <N>% · <model>", **Open the run** and **Show the frames**. A note closes the panel. It says that unproductive spend means the frames show the tokens bought nothing, names the four patterns it covers (a repeated call, a cold prefix, a turn spent waiting, and a chain that broke), and says that work a person accepted is never counted.

### Tokens and cache

**By token class**, with the month's total, "20,503,823,758", at the right. Columns: Class · Tokens · Share · Cost. Rows: `input_uncached`, `cache_read`, `cache_write`, `output` and `reasoning`, each with a tooltip saying what it counts. Beneath:

- Cache hit rate: "80% · cache reads as a share of all input tokens, token-weighted"
- Cache write cost share: "6% · high when a prefix is written and never read"
- Effective input price: "$1.88 per million across every input class"
- Unmapped classes: "0 · a class oxagen does not know is stored under its raw name and priced at zero, so the gap stays visible"

**Prompt composition.** One meter per part, each "<tokens> · <share>": Conversation, Tool results, Context frames, Tool definitions, Steering, System, Output and Reasoning. The note says that Oxagen measures tool definitions, context frames and steering from the request it assembled, and that tool results and conversation are the rest of the input.

**By harness**, with the badge "92% of tokens observed by the gateway". Columns: Harness · Agents · Tokens · Cache hit · Spend · Basis. Eight rows: Claude Code, stella, Claude Agent SDK, Codex CLI, LangGraph, Other (SDK-wrapped), OpenAI Agents SDK and Cursor. Basis reads Observed by gateway, Reported by harness, or both with each share, such as "Observed by gateway 60% · Reported by harness 40%" for Codex CLI. The note defines observed (the gateway's proxy counted the bytes) and self-reported (the harness's own telemetry), and says a class a harness does not report is marked absent, never zero.

**By agent.** Columns: Agent · Runs · Tokens · Per run · Cache hit · Tool defs · Context · Tool results · Reasoning · Basis. The twelve agents of this workspace with the most tokens, ten to a page. Tool defs above 16% and Tool results above 30% print in the approval ink. A row opens the agent.

### Agents

**Recommendations for agents**, with the subtext "162 across 68 agents in Core platform. Each names the signal it came from and the change that moves it." Columns: Agent · Recommendation (the title over one paragraph) · The record (the signal, in mono) · A month (money, or a dash) · and the action. Rows open ordered by money a month, largest first.

Seven recommendations, each read from the agent's 30-day token rollup, each with its one action:

| Recommendation | When the design raises it | Action |
|---|---|---|
| Narrow the toolbelt | Tool definitions are over 16% of every request | Edit the grant (the agent's Toolbelt tab) |
| Keep the prefix stable | The cache hit rate is under 72% | Open steering |
| Page the tool results | Tool result bodies are over 30% of input | Propose a record (the record wizard) |
| Lower the context budget | Context is over 24% of input and cited on under half the runs | Open the compiler (`/steering/compiler/<agent>`) |
| Route classification-shaped work to a light model | Reasoning is over 40% of output on a flagship model | Edit the definition (the agent's Source page) |
| Stop the retry storms | More than two runs, and more than 4% of the agent's runs, had three or more provider retries in one turn | Open incidents (the agent's Activity tab) |
| Stop writing cache for one-turn runs | Cache writes exceed 6% of input | Edit the definition |

The record line names the numbers behind each one, for example "24% of every request is tool definitions · 13 of 28 tools never called in 30 days".

### Operator habits

Heading "Operator habits", with the subtext "Read from the recorded turns and written as rules to adopt. Listed by name. The record shows what happened. It never grades the person."

One card per habit, for each operator of an agent in this workspace, in alphabetical order of the name as shown: Anders Adichie, Ayesha Rahimi, Elin Nwosu, Hana Oyelaran, Marcus Bell, Mikael Larsen, Priya Natarajan, Sana Moreau, Sebastian Albrecht. Sixteen cards. Each card holds the person's name and the habit, the record line in mono, the rule set off as a quotation, and its actions.

| Habit | Read from | The record line | The rule |
|---|---|---|---|
| Briefs ask the agent to confirm what it already has | repeated reads of the same input across the operator's agents | "<N> repeated reads across <M> agents · the brief says "confirm" where a record could say "known" · $<amount> in the record" | "Write a fact the agent needs into a Steering record once, and leave it out of the brief." |
| Sessions take more than one prompt | more than 1.5 prompts per session | "<average> prompts per session over <runs> runs · <count> one-shot · $<amount> in the record" | "Settle the design and write down the missing context before the run, so the first prompt carries the task." |

The first habit carries **Propose the record** (opens the record wizard). Every card carries **Share with <first name>**, which reports "Rule shared with <name>. It quotes the turns it was read from." With no habit to show, the panel reads "No prompt habit stands out in this workspace’s recorded turns."

**Dialogs this page opens:** the record wizard (`wz`, from Propose a record and Propose the record), specified in `docs/creation-spec.md`. The header's dialogs are in `spend.md`.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| By cause | `SPEND.wasteByCause` | `list_waste` causes | One cause ships, `cache_write_never_read`, printed "cache written and never read", with its runs and up to ten proving run ids (`packages/oxagen/src/contracts/spend.waste.ts:14-24`). None of the six causes the design meters is recorded (`apps/app/src/features/spend/waste.tsx:101`) | 🟡 |
| Runs with unproductive spend | `SPEND.wasteRunsList`, `RUNS` | `list_waste` run ids per cause | The run ids ship (`waste.tsx:50`). What each run wasted, its title and its steps are not on the waste record (`waste.tsx:167`) | 🟡 |
| Show the frames | a notice in the mockup | the frames that show the waste | none | ❌ |
| By token class: Tokens, Share, Cache hit rate | `wsTok()` | the token classes on `get_spend` | `apps/app/src/features/spend/tokens.tsx:70-132`; the class list, `apps/app/src/features/spend/rollup.ts:17-23` | ✅ |
| Cost per class, Cache write cost share, Effective input price, Unmapped classes | `wsTok()`, constants | priced token classes | The rollup prices a call as a whole, not each class, and does not count unmapped tokens (`tokens.tsx:90-98, 127`) | ❌ |
| Prompt composition | `wsTok().parts`, `tokBars()` | `tool_definition_tokens`, `context_frame_tokens`, `steering_tokens` on the rollup (§12.6) | Not on the rollup (`tokens.tsx:133-146`) | ❌ |
| By harness | `wsTok().byHarness` | tokens by harness, with the observed share | Not on the rollup (`tokens.tsx:148-150`) | ❌ |
| By agent: Runs, Tokens, Per run, Cache hit, Reasoning, Basis | `agentTok()` | `get_spend` at `agent` | `tokens.tsx:151-222` | ✅ |
| By agent: Tool defs, Context, Tool results | `agentTok().shares` | prompt parts per agent | Print "not recorded" (`tokens.tsx:210-216`) | ❌ |
| Recommendations for agents | `coachAgent()` | recommendations read from the rollup at read time | No record, and the signals they read are not on the rollup (`apps/app/src/features/spend/coaching.tsx:1-7`) | ❌ |
| Operator habits | `operatorHabits()`, `coachOperator()`, `operatorPrompts()` | the operator review | none | ❌ |
| The Agents and Operator habits counts | the two lists | the same | none | ❌ |

## Future-only fields

The view carries no `data-future` mark, and the catalog gives it no future story. Most of it is future-only all the same. A build prints each of these as not recorded until its contract ships, and names what it will show:

- the six causes of By cause
- each run's amount, title and steps in Runs with unproductive spend
- Show the frames
- the Cost column and the three figures beneath By token class
- Prompt composition
- By harness
- the Tool defs, Context and Tool results columns of By agent
- Recommendations for agents
- Operator habits
- the two counts on the parts

The one waste cause that ships, a cache written and never read, appears in By cause with its runs.

## Functionality

- **Parts in the URL.** `?part=` names the part, so each is a link. The old Tokens, Coaching and Waste tabs land here.
- **Unproductive spend** is a claim about frames, not about outcomes: the frames show the tokens bought nothing. Work a person accepted is never counted. The By cause amounts sum to the Unproductive spend tile, and a run with two causes counts toward both run counts.
- **Tokens.** The By token class total equals the Tokens tile. The cache hit rate is `cache_read ÷ (input_uncached + cache_read)`, weighted by tokens. A class a harness does not report is marked absent, never zero, and a cache hit rate over a mixed fleet is never computed from missing data as if it were zero (§12.6).
- **Recommendations** are read from the same rollup the Tokens and cache part prints, so the two cannot disagree. Each names its signal, the numbers behind it, the money a month, and one action. An action opens the place where a person makes the change. Nothing on this page changes an agent by itself.
- **Operator habits** follow the operator review in `docs/VISION.md`. A habit is read from the recorded turns of the operator's runs and carries one rule the operator can adopt. The review names four habits: turns to completion, restarts on the same task, steering overridden by hand instead of written as a rule, and routed requests the operator approved every time. The design draws two, prompts per session (turns to completion) and briefs that make the agent re-read. The list is alphabetical by name. It carries no rank number, score, severity, grade or verdict, and it never orders people by money. Sharing a rule sends it to the person with the turns it was read from.
- **Scope.** Every part reads this workspace's runs and agents.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed. The renderer's standard panels are the Spend ones in `spend.md`. Within a part, an empty list says so in one line, as Operator habits does.

## Mobile

The thumb bar holds Work (8), Agents, Tools, Spend and More (3), with Spend lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The tiles form a two by two grid above the tabs, and the four part buttons wrap to two rows. The By cause meters and the Runs with unproductive spend cards stack at full width. Every table (By token class, By harness, By agent and Recommendations for agents) becomes one card per row, each cell labelled with its column. The habit cards stack. Nothing scrolls sideways at 390 px.

## Permissions

- Read: `spend.read` (`apps/app/src/data/read.ts:94-97`). Shipped: `get_spend` and `list_waste` allow org Owner, Admin, Billing and Member, and workspace Owner and Member.
- Each action lands on the page that owns the change and needs that page's permission: the toolbelt grant, steering, the compiler, the agent's Source page, the record wizard.
- Sharing a rule with a person is a governed action and lands in Audit.

## Backend gaps this page depends on

- The six waste causes, and each run's unproductive amount, title and steps on the waste record.
- Cost by token class, and the unmapped class count.
- Prompt composition on the rollup: `tool_definition_tokens`, `context_frame_tokens` and `steering_tokens` (§12.6).
- Tokens by harness, and the share of tokens the gateway observed.
- A contract for recommendations read from the rollup (`list_coaching` in the app's notes).
- The operator review: habits read from the recorded turns (the four VISION names), each with one rule, and the share action.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. The Context frames and Steering parts of Prompt composition count SteeringFrame tokens, so a build labels them in a way that cannot read as recorded frames.
- A Steering Source and a SteeringFrame are never shown as each other. Propose a record opens the record wizard, which ends on a pull request for a Steering record, a source. Prompt composition counts SteeringFrame tokens and names no source.
- Every figure reads the record. No inference, no score, and no model-written account of why. A recommendation or a habit names the recorded numbers it came from.
- No person is scored or ranked. Operator habits are alphabetical by name, with no rank, no severity and no verdict, and the page says the record reports what happened.
- Every money figure states its basis, and every enforcement claim states its tier. Self-reported tokens are labelled Reported by harness (`client_attested`), never observed.
- Headers are rollups of the rows beneath them. By cause sums to the Unproductive spend tile. By token class sums to the Tokens tile. The part counts equal their lists.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: **Set a budget** in the header. Every action in the parts is a plain button.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
