# Spend

## Header

The Spend header names the workspace and the page and holds the page's two actions: Export report and Set a budget.

### Purpose
It tells you which workspace's money you are reading and gives you the two things a person does from any Spend tab: take the month away as a report, or put a ceiling on it. Every Spend tab shares this header, so Budgets and Optimization read it from here.

### Rationale
Spend answers one question: what the tokens bought. The page used to say so in a subtitle, "What the tokens bought, with the basis on every number." That sentence explained the page to a reviewer, so it moved here. The second half is a rule every Spend part keeps: each amount carries its basis (`gateway_observed`, `client_attested`, or `estimated`), as mission-control-spec §12.6 and §12.9 require.

**Set a budget** is the one gold action on every Spend tab. A ceiling is the only write Spend owns. The exports read and change nothing. The fleet operations wedge left Spend with three views and no drill pages (D10), so the header carries the same two actions on all three.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow | `ws().name` | the workspace record | shipped |
| Export report | `openDialog('spendexport')` | `export_statement` (`packages/oxagen/src/contracts/spend.statement.export.ts:31-65`) | partial |
| Set a budget | `openDialog('budget')` | `set_spend_budget` (`packages/oxagen/src/contracts/billing.budget.set.ts`) | partial |

### Logic
- `pSpend()` renders the header above the tiles, the tab bar and the tab body.
- The eyebrow is the workspace name. The h1 is "Spend".
- **Export report** opens `spendexport`. It is a plain button.
- **Set a budget** opens `budget`, specified in `spend-budgets.md`. It is gold on every tab. The Budgets panel's own **Set a budget** is plain, so the screen keeps one gold action.
- Neither action writes anything until its dialog is confirmed.

### States
- **Loaded**: as above.
- **Loading**: `skeleton()` replaces the whole page body, header included.
- **Error**: "Spend could not be loaded", with `504 rollup_rebuild_in_progress`, **Try again** and **Open an incident**. The header is gone.
- **Denied**: "You cannot see this workspace’s spend", naming `spend.read on core-platform`.
- **Empty**: "No spend to report yet", with **Open Work**.
- The catalog lists only the loaded state for the three Spend views. The build uses the shell's standard panels for the others until they are designed.
- **Mobile**: the two actions wrap under the h1.

## Tiles

Four tiles give the month's totals: Organization spend, Tokens, Observed by the gateway, and Unproductive spend.

### Purpose
The tiles answer how much the month cost, how many tokens it used, how much of that Oxagen counted itself, and how much bought nothing. Unproductive spend is the one you act on, so its tile opens Optimization.

### Rationale
A tile is a rollup of rows elsewhere on the page. The Spend tile equals the Total of By model and the sum of every partitioning grouping on Overview. The Tokens tile equals the By token class total on Optimization. The Unproductive tile equals the sum of By cause. A tile that cannot be traced to rows beneath it is a claim the record cannot back. The tiles sit above the tabs, so Budgets and Optimization share them.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Organization spend | `spendMonthTotal()`: `SPEND.spend` plus `orgRoutesOffSpendTotal()` | `get_spend` month total over `cost.daily_totals` (`packages/oxagen/src/contracts/spend.get.ts:34-73`) | shipped |
| Its basis line | `basisChip("gateway_observed")`, `basisChip("client_attested")` | the basis on each cost record (§12.3) | shipped |
| Tokens and cache share | `wsTok(w.slug).total`, `.cacheRate` | the token classes on every `get_spend` row (`spend.shared.ts:107-116`) | shipped |
| Observed by the gateway | `wsTok().observed` | tokens by basis | future-only |
| Unproductive spend | `SPEND.wasteTotal`, `wasteShareText()` | `list_waste`: `wasted` and `share` (`spend.waste.ts:26-56`) | partial |

### Logic
- **Organization spend** is `spendMonthTotal()`: the agents' spend and the Oxagen line in `SPEND.spend`, plus Oxagen's own light, embed and rerank routes from `ORG_ROUTES`. The demo reads $439,705.21. The line beneath names both bases and the currency.
- **Tokens** is the workspace's token total from `wsTok()`, 20,503,823,758 in the demo. The line beneath is `cacheRead ÷ tokIn`, "80% served from cache".
- **Observed by the gateway** is the share of tokens from agents on the `gateway` or `contained` tier, where the proxy counted the bytes. The demo reads 92%.
- **Unproductive spend** prints `SPEND.wasteTotal` in the critical ink. `wasteShareText()` divides it by `spendMonthTotal()`, so the share cannot disagree with the two figures it relates. The tile calls `spendView('optimization')`.

### States
- The fixture's month total is the organization's (it equals the `organization · a-intel` budget's Used), while the Tokens tile reads this workspace. The spec scopes every figure to the workspace. A build labels the scope each tile reads and keeps them one scope.
- A basis Oxagen does not hold prints "not recorded", not a zero. Today the app prints Observed by the gateway as "not recorded" (`apps/app/src/features/spend/summary.tsx:60-62`).
- **Mobile**: the four tiles form a two by two grid.

## Tabs

The tab bar switches between the three Spend views: Overview, Budgets and Optimization.

### Purpose
It moves you between where the money went (Overview), where it is capped (Budgets), and where it bought nothing (Optimization). Budgets carries a count of its rows.

### Rationale
Spend used to hold nine tabs and a drill page per operator, agent and tool. The wedge cut it to three views with no drill pages (D10, and the Cuts row "The Spend drill pages and seven of its nine tabs"). Findings moved to Work (D9). Tokens, Coaching and Waste became parts of Optimization. A grouping and a side panel on Overview replaced the drill pages. A count appears only on Budgets, the number of rows its table holds. Nothing on Spend waits on a person, so the sidebar's Spend entry has no count.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Budgets count | `SPEND.budgets.length` | the rows `get_spend_budget` returns | partial |
| Current tab | `tab("spend","overview")`, the path | the route | shipped |

### Logic
- The tabs are a `role="tablist"` row of three buttons. The current one is `aria-selected`.
- A tab calls `spendView(v)`, which writes the path: `/spend`, `/spend/budgets` or `/spend/optimization`.
- `spendHref2()` writes `?by=` and `&key=` only on Overview. Budgets and Optimization carry no grouping and no key, so switching tabs closes any side panel.
- An unknown tab falls back to Overview.
- The old routes land here in place (`docs/fleet-operations-routes.md`, Spend): `/spend/tokens`, `/spend/coaching` and `/spend/waste` on Optimization, `/spend/<kind>/<key>` on Overview with a side panel, and `/spend/findings` on Work, Findings.

### States
- The tab bar renders only in the loaded state. The other states replace the page body.
- **Mobile**: the three tabs stay on one row.

## Month by day

The Month by day panel draws the month to date as one bar per day, with the month's total at the right.

### Purpose
It shows the shape of the month: which days cost the most, and whether spend is climbing. You read it before you pick a grouping below.

### Rationale
A daily series makes a spike visible that a monthly total hides. The panel used to carry the caption "From the daily rollup, rebuilt from frames. Weekends run lighter." The first half states where the data comes from: `cost.daily_totals` is a derived index, rebuilt from frames on demand (mission-control-spec §12.3). The second half described the mockup's seeded shape, not a fact about any record. Both moved here. The heading carries the month's name, so the panel answers the fixed key `month-by-day`.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| One bar per day | `spendDays(total)` | `cost.daily_totals`, one row per UTC day and group (`packages/database/src/schema/cost.ts:388-395`) | partial |
| Total to date | `spendMonthTotal()` | `get_spend` month total | shipped |

The store keeps a row per day, but no contract answers the workspace's month by day. `get_spend_drill` answers a daily series for one operator, agent or tool (`packages/oxagen/src/contracts/spend.drill.ts:59-117`).

### Logic
- `spendDayChart(total)` draws 11 bars, 1 to 11 September, the month to date in the demo.
- `spendDays()` seeds a generator with 11, weights each weekday between 0.8 and 1.25 and each weekend day at 0.45 of that, then scales the weights so the bars sum to the month's total. The bars never move between renders.
- A bar's height is its share of the tallest day, with a floor of 4% so a quiet day stays visible.
- Each bar's tooltip reads "Sep <day> · <amount>". The whole chart is one image, `role="img"`, labelled "Spend by day, 1 to 11 September".
- The axis names the first, middle and last day.
- A build draws the recorded days from `cost.daily_totals` and must not draw a seeded curve.

### States
- Until a contract answers the workspace's days, a build prints the panel as not recorded.
- A day with no recorded spend draws the floor bar and its tooltip reads $0.00.
- **Mobile**: the bars narrow to fit 390 px, and the axis keeps its three labels.

## Group by

The Group by control picks how the table below groups the month: by work order, operator, agent, model, tool or cost center.

### Purpose
It answers "cut the month by what?" and swaps the table below to that cut. Picking a grouping closes any open side panel.

### Rationale
One grouping replaced the seven tabs and the drill pages Spend used to carry (D10). The six cuts follow the attribution hierarchy of mission-control-spec §12.7: every cost record hangs on a frame, and every frame knows its run, agent, operator and workspace. Work order leads because the wedge makes the work order the parent of every run (D2, and Work rule 4: Spend attributes a run to its work order). Cost center follows ADR-142.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The six groupings | `SPEND_BY` | the levels `get_spend` answers | partial |
| The current grouping | `S.spendBy`, `?by=` | the route | shipped |

The work order level waits on `work_order_id` on the run (wedge Open decision 5). The shipped `task` level keys on the run's goal text.

### Logic
- The control is a `role="group"` labelled "Group by", with the caption "Group by" and six buttons. The current button is `aria-pressed`.
- A button calls `spendBy(by)`, which writes `?by=` through `spendHref2()` and drops `&key=`.
- `work` is the default, so the hash leaves it out.
- Old routes land here: `/spend/operator`, `/spend/agent`, `/spend/model` and `/spend/tool` set `?by=` to the same kind, `/spend/task` sets `?by=work`, and `/spend/pricing` sets `?by=model`.

### States
- The control renders on Overview only.
- **Mobile**: the six buttons wrap to a second row.

## Grouped table

The grouped table lists the month's spend by the chosen grouping, one row per work order, operator, agent, model, tool or cost center, largest first.

### Purpose
It answers where the money went, cut the way you picked. You select a row to open its side panel on the same page. Selecting the open row again closes it.

### Rationale
The table replaced six drill pages (D10). A row opens a side panel, so the table and the panel share one URL (`?by=&key=`) and there is no drill page to lose your place on. The panel used to say so in a subtitle, "Select a row to open it here. There is no drill page." That explained the design, so it moved here.

Two groupings used to end on a note. By work order said "<N> work orders in view, most of them direct: a run started from an operator’s own terminal. The rest of the month’s runs roll up the same way." Oxagen files a run that started outside Oxagen under a direct work order it opens for that run (D2), so most rows in the demo are direct. The pager already counts the rows. By cost center said "A run with no label is charged to ~none, so the centers sum to the month (ADR-142)." Both notes explained the rollup, so they moved here. The heading changes with the grouping, so the panel answers the fixed key `grouped-table`.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| By work order | `WORKORDERS`, `woSpend()`, `woItems()` | `work_order_id` on the run and a work order store | future-only |
| By operator | `SPEND.byOperator`, `operatorTok()` | `get_spend` at `operator` (`apps/app/src/features/spend/tables.tsx:177-268`) | partial |
| By agent | `SPEND.byAgent`, `agentTok()` | `get_spend` at `agent` (`tables.tsx:270-347`) | partial |
| By model | `spendModelRows()`, `spendKeyOf()`, `PROVIDER_KEYS` | `get_spend` at `model` (`tables.tsx:349-436`) | partial |
| By tool | `SPEND.byTool` | `get_spend` at `tool` (`tables.tsx:439-555`) | partial |
| By cost center | `SPEND.byAgent` through `ccOf()` and `CC.rolledBy` | `get_spend` at `cost_center`, `cost.cost_centers` (`spend.shared.ts:124-140`) | partial |

### Logic
- `spendRows(by)` builds the rows, and `spendTable(by)` sorts them by spend, largest first, and draws them under `SPEND_HEAD[by]`.
- **Work order**: the id over the title, Kind (`direct` or `dispatched`, from `woKindBadge()`), Sent by, Runs, Items accepted ("N of M" from the work order's accepted claims over `woItems()`), Per accepted item (spend over accepted items), and Spend. It has no Share column. The panel carries the `data-future` mark "work orders".
- **Operator**: the name over the role, Agents, Runs, Tokens, Cache hit, and Budget position, a bar that turns red above 80%, over "N% of $X".
- **Agent**: the agent card, Runs, Tokens per run, Cache hit, and Trend, a badge in the allowed ink when negative and the approval ink when positive.
- **Model**: the model id, with "oxagen’s own work · <provider>" under each of Oxagen's own routes, Provider key, Model calls, and Cache hit (a dash where a route reports no cache).
- **Tool**: the tool name over its kind, Calls, Runs, and Per call. Tools with no per-call price are left out.
- **Cost center**: the label, Agents and Workspaces. `ccOf()` charges an agent's month to its own label, else its workspace's, else `~none`. `~none` adds "no agent or workspace label". A label deleted since its runs rolled up keeps its row with a `deleted` badge.
- Every grouping but By work order adds Share, the row's spend over the table's total.
- A row calls `spendKey(key)`, which writes `&key=` and marks the row `aria-selected`. With a key open, the table narrows to the name, Spend and Share, and the side panel takes the right column.
- **Partitions.** By operator, By agent and By cost center each partition the month: every run lands in one row at its full cost, `~none` included, so each grouping's rows sum to the Spend tile. By work order partitions it once every run carries `work_order_id`. By tool does not partition, because a turn counts toward every tool it called.
- A run with no operator is charged to the agent's owning operator and flagged (§12.7).

### States
- The shell's list tools sit above the rows: search, up to three filters, Rows (10 by default) and a pager.
- A figure no frame priced prints "not recorded", not a zero.
- **Mobile**: one card per row, each cell labelled with its column. The selected card is shaded.

## Side panel

The side panel opens one row of the grouped table on the same page: an operator, agent, model, tool, cost center or work order.

### Purpose
It answers what sits behind one row without leaving the month's table. Each panel ends on the place where you act on that row: the habits, the agent, the model routes, the statement, or the work order.

### Rationale
The side panel replaced the drill pages (D10), so a panel is a URL (`?by=<kind>&key=<key>`) and the table stays in view. The operator panel follows the operator review in `docs/VISION.md`: spend cut by the person who started the run, and outcome per dollar for bounded tasks. It carries no score, rank, severity or verdict (D15). It used to say so in a caption, "The record, not a grade. Habits and the rules they suggest are on Optimization." That sentence explained the design, so it moved here, and the **Open the habits** button stays. The panel's title changes with the record, so it answers the fixed key `side-panel`.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Operator: role, runs, spend | `PEOPLE`, `SPEND.byOperator` | `get_spend` at `operator`, `get_spend_drill` (`spend.drill.ts:59-117`) | partial |
| Operator: agents, budget, bounded tasks | `AGENTS`, `WORKORDERS` | the operator review as one read | future-only |
| Agent: runs, spend, tokens per run, cache hit | `SPEND.byAgent`, `agentTok()` | `get_spend_drill` for one agent | partial |
| Agent: trend, tool definitions, recommendations | `SPEND.byAgent`, `agentTok()`, `coachAgent()` | the rollup's prompt parts, last month | future-only |
| Agent: cost center | `ccOf()` | `get_agent` (`agent.get.ts:136`) | shipped |
| Model: calls, spend, cache hit | `spendModelRows()` | `get_spend` at `model` | shipped |
| Model: provider key | `spendKeyOf()`, `PROVIDER_KEYS` | the key a call billed to | future-only |
| Tool: calls, runs, per call, per run | `SPEND.byTool` | `get_spend` at `tool` (`tables.tsx:451-459`) | shipped |
| Tool: kind, record | `SPEND.byTool[].s`, `.note` | the tool's server and its frames | future-only |
| Cost center | `SPEND.byAgent`, `ccOf()` | `get_spend` at `cost_center` | partial |
| Work order | `WORKORDERS` | the work order store | future-only |

### Logic
`spendSide(by,key)` finds the row in `spendRows(by)` and renders nothing if the key is not in view.
- **Operator**: the heading is the person's name. Role, Agents ("24 operated, 28 in view": the operator's count, then the agents in `AGENTS` they operate), Runs, Spend, Budget ("87% of $57,000.00"), and Bounded tasks, marked `data-future`: the dispatched work orders the person sent, the items accepted, and spend per accepted item. **Open the habits** calls `spendPartGo('habits')`.
- **Agent**: the compact agent card is the heading. Runs, Spend with the trend "on last month", Tokens per run, Cache hit, Tool definitions (the share of every request), and Cost center. Beneath: "<N> recommendations for this agent on Optimization." when `coachAgent()` returns any, **Open the agent**, and **Recommendations**, which opens `?part=agents`.
- **Model**: Model calls, Spend, Cache hit, and Provider key. **Model routes** opens Organization.
- **Tool**: Kind, Calls "in N runs", Per call, Per run, and Record, the recorded note on the tool. No action.
- **Cost center**: Agents, Spend, and Resolved from: "the agent’s label, else its workspace’s", or for `~none` "no label on the agent or its workspace". **Export the statement** opens `ccexport` when `ccCanEdit()` holds, and otherwise calls `ccDenied()`, a toast naming who holds the role.
- **Work order**: the heading is the title. Work order (a link, with its kind badge), Sent by, Runs (one link each), and Spend with its cap. **Open the work order**.
- **Close** calls `spendKey(null)`. Selecting the open row again also closes the panel.

### States
- The panel is an `aside` labelled with its title, 340 px wide beside the narrowed table.
- In the demo Marcus Bell is a workspace owner, so **Export the statement** shows the denied toast.
- **Mobile**: the panel stacks below the table and its pager. For `?by=operator&key=marcus` it starts about 2,400 px down, and picking a card does not scroll to it.

## Spend report export {#dialog/spendexport}

The Export a spend report dialog picks a timeframe and a scope and sends the report as CSV and a signed PDF.

### Purpose
It takes the month, or another range, off the page for finance or a review. You pick the timeframe and what to include, then **Generate report**.

### Rationale
Mission-control-spec §12.9 names a monthly statement per workspace and organization, exported as CSV and a signed PDF, with every number carrying its basis. The dialog used to add "Every figure carries its basis; the report is built from frames, so a large range takes a few minutes." That explained how the report is built, so it moved here. The dialog keeps the one sentence that says where the report goes.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Timeframe and dates | the `spendexport-range` select, From and To | `export_statement` (`spend.statement.export.ts:31-65`) | partial |
| Include | the Include select | the statement's sections | future-only |
| Delivery address | a constant, `marcus@a-intel.example` | the signed-in person's email | future-only |

`export_statement` exports a calendar month as CSV. A date range, a signed PDF and email delivery are not built.

### Logic
- Timeframe offers seven choices, from this month to date through year to date and a custom range, with From and To dates beneath.
- Include offers four: everything on the page, by operator and agent only, by tool only, and unproductive spend only.
- The note reads "Delivered as CSV and a signed PDF to marcus@a-intel.example."
- **Generate report** closes the dialog and shows the toast "The report is being generated and will be sent to your email momentarily". The mockup produces no file.
- **Cancel** closes it.
- A build exports what `export_statement` supports and leaves the other choices out until they ship. Every figure in the file carries its basis.

### States
- Permission: `export_statement`, the same roles as the Spend reads.
- **Mobile**: the dialog rises from the bottom edge as a sheet.

## Chargeback statement export {#dialog/ccexport}
<!-- open: openDialog('ccexport') -->

The Export the chargeback statement dialog downloads the organization's month as CSV, one line per cost center.

### Purpose
Finance books spend to cost centers. This dialog gives them the month in that shape, one line per center and one for `~none`, with the total they sum to.

### Rationale
ADR-142 defines cost centers: a run is charged to its agent's label if it is live, else to its workspace's, else to `~none`. The statement is the one organization-wide read on Spend. Micros reconcile, and cents are rounded once per line, half to even (mission-control-spec §12.3). The dialog used to add "Each line lists the run ids behind it, and cost is in micros and in cents." The Columns badges already show both, so the sentence moved here. The toast used to add "In the product this downloads the file. A mockup writes nothing to disk." That was mockup-only copy, so it went.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Month | the `cc-month` select | `export_cost_center_statement` (`spend.cost_center_statement.export.ts:48-89`) | shipped |
| Columns | `CC.columns` (`FIXTURES.COST_CENTERS`) | the statement's columns | shipped |
| Audit event | `auditEvent("cost_center_statement_exported")` | the audit log | shipped |

### Logic
- `DLG_EXT.ccexport` checks `ccCanEdit()`, which holds for an organization Owner, Admin or Billing member.
- For anyone else the dialog shows one warning, "Only an organization Owner, Admin or Billing member can export the chargeback statement.", and **Close**.
- Otherwise it shows Month (September 2026 to date, August 2026, July 2026), the columns as badges (`line`, `cost_center`, `runs`, `unpriced_runs`, `cost_micros`, `cost_cents`, `currency`, `basis`, `run_ids`), and the note "One line per cost center, one for ~none (spend with no label), and the organization total they sum to."
- **Export CSV** calls `ccExport()`: it writes `cost_center_statement_exported` to Audit, closes the dialog, and toasts "Exported cost-centers-<month>.csv."
- The side panel's **Export the statement** opens this dialog only for a holder of the role. For anyone else it shows the `ccDenied()` toast instead.
- A run keeps the center its first rollup resolved, so a closed month's statement stays where finance booked it.

### States
- In the demo the signed-in person is a workspace owner, so opening the dialog shows the denied variant.
- **Mobile**: the dialog rises from the bottom edge as a sheet.
