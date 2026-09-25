# Spend overview

| | |
|---|---|
| Route | `#/a-intel/core-platform/spend`, with `?by=work\|operator\|agent\|model\|tool\|cost_center` (default `work`, which the hash leaves out) and `&key=` for the side panel: `?by=operator&key=marcus`, `?by=agent&key=a-intel.core.triage`, `?by=cost_center&key=ENG-1001`, `?by=work&key=wo_01K5RS7M4N`. Old routes rewritten here in place (`fleet-operations-routes.md`, Spend): `/spend/operator`, `/spend/agent`, `/spend/model` and `/spend/tool` to `?by=` the same kind; `/spend/task` to `?by=work`; `/spend/cost_center` to `?by=cost_center`; `/spend/pricing` to `?by=model`; `/spend/<operator\|agent\|tool>/<key>` to `?by=<kind>&key=<key>` (the mockup also takes a key after `cost_center`, `model` and `task`). There are no drill pages. `/spend/tokens`, `/spend/coaching` and `/spend/waste` land on Optimization (`spend-optimization.md`), and `/spend/findings` and `/spend?finding=<id>` on Work, Findings, with that finding's dialog open |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D10 (three views, no drill pages), D15 (no person scored or ranked), Work rule 4 (Spend attributes a run to its work order), the Cuts rows for the Spend drill pages and for operator scores, and Open decision 5 (`work_order_id` on the run). `docs/fleet-operations-ia.md`, Spend. `docs/fleet-operations-routes.md`, Spend. In `macanderson/oxagen`: the operator review in `docs/VISION.md` and ADR-142 (cost centers). `docs/mission-control-spec.md` §12.3 (rounding once), §12.6 (token classes), §12.7 (attribution) and §12.9 (statements) |
| Design | `mockups/src/wedge.js`: `pSpend()`, `spendOverview()`, `spendDayChart()`, `spendDays()`, `spendRows()`, `spendTable()`, `spendSide()`, `ccOf()`, `wasteShareText()`, `spendHref2()`. `mockups/src/engine.js`: the `spend` branch of `route()`, `spendMonthTotal()`, `spendModelRows()`, `spendKeyOf()`, `wsTok()`, `operatorTok()`, `agentTok()`, `coachAgent()`, and the `spendexport` and `budget` dialogs. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Spend / Overview`: Loaded, Loaded · mobile, Loaded · future-only fields marked |
| Audit | `spend.audit-prompt.md` |

This spec covers the Spend header, the four tiles and the three tabs, which every Spend view shares, and the Overview tab. `spend-budgets.md` and `spend-optimization.md` cover the other two tabs.

## Job

Say what this workspace's month cost and where the money went. One table groups the month by work order, operator, agent, model, tool or cost center, and a row opens a side panel on the same page. The page reports the record. It scores no person, ranks no person and gives no verdict (D15). For one operator the side panel follows the operator review in `docs/VISION.md`: spend cut by the person who started the run, and outcome per dollar for bounded tasks, with the person's prompt habits one link away on Optimization.

## What is on the page

**Shell.** The sidebar lists Work (8), Agents, Tools (29), Steering (9), Runtimes (2), Spend and Repositories (5), then Organization, Billing and Audit (3). Spend is lit and carries no count, because nothing on it waits on a person. The foot holds the Stella launcher and the connection badge. The top bar holds the breadcrumbs (Anderson Intelligence Corp. / Core platform / Spend), ⌘K search, notifications, the Approvals button with its count, and the account avatar.

**Header.** Eyebrow the workspace name ("Core platform"), h1 "Spend", subtext "What the tokens bought, with the basis on every number." Actions: **Export report** (opens `spendexport`) and **Set a budget** (gold, opens `budget`, specified in `spend-budgets.md`).

**Tiles**, four in a row, each one number and one line beneath it:

| Tile | Number | Line beneath |
|---|---|---|
| Spend | $439,498.34 | `gateway_observed` + `client_attested` · USD |
| Tokens | 20,503,823,758 | 80% served from cache |
| Observed by the gateway | 92% | of tokens counted by the proxy |
| Wasted | $3,591.92, in the critical ink | 0.8% of spend · Optimization |

The Wasted tile opens Optimization. Its share is computed from the Wasted and Spend figures, so it cannot disagree with them.

**Tabs**: Overview · Budgets (4) · Optimization. Each is a path segment: `/spend`, `/spend/budgets`, `/spend/optimization`. Changing the tab drops the grouping and the key.

**September by day.** A panel with the caption "From the daily rollup, rebuilt from frames. Weekends run lighter." and, at its right, "$439,498.34 to date". One bar per day from 1 to 24 September, in one image (`role="img"`, labelled "Spend by day, 1 to 24 September"). Each bar's tooltip reads "Sep <day> · <amount>". The axis reads Sep 1, Sep 12 and Sep 24.

**Group by.** A segmented control (`role="group"`, labelled "Group by") with the caption "Group by" and six buttons, the current one `aria-pressed`: Work order · Operator · Agent · Model · Tool · Cost center. A button writes `?by=` and closes any open side panel.

**The table.** Heading "By <grouping>" ("By work order", "By operator", "By agent", "By model", "By tool", "By cost center") and the subtext "Select a row to open it here. There is no drill page." The shell's list tools sit above the rows: the search field "Search this list", up to three filters, each on a column of two to eight short values (such as "All · Kind" on By work order and "All · Provider key" on By model), Rows (5, 10, 25, 50 or All, with 10 by default), sortable column headers, and a pager that counts the rows (1,166 work orders, ten to a page). Rows open ordered by spend, largest first.

Columns, in order:

| Group by | Columns |
|---|---|
| Work order | Work order (the id in mono over the title) · Kind (`direct` or `dispatched`) · Sent by · Runs · Items accepted ("N of M", or a dash) · Per accepted item (a dash when none was accepted) · Spend |
| Operator | Operator (the name over the role, such as `workspace.owner · core-platform`) · Agents · Runs · Tokens · Cache hit · Budget position (a bar, red above 80%, over "N% of $X") · Spend · Share |
| Agent | Agent (the agent card) · Runs · Tokens per run · Cache hit · Trend (a badge, such as "-4%" or "+5%") · Spend · Share |
| Model | Model (the id in mono, and each of Oxagen's own routes adds "Oxagen’s own work · <provider>") · Provider key · Model calls · Cache hit (a dash where the route reports no cache) · Spend · Share |
| Tool | Tool (the name in mono over its kind, such as `harness`, `jira` or `stripe`) · Calls · Runs · Per call · Spend · Share |
| Cost center | Cost center (the label in mono, and `~none` adds "no agent or workspace label"; a label deleted since its runs rolled up keeps its row and adds a `deleted` badge) · Agents · Workspaces · Spend · Share |

Two groupings end on a note. By work order: "1,166 work orders in view, most of them direct: a run started from an operator’s own terminal. The rest of the month’s runs roll up the same way." By cost center: "A run with no label is charged to ~none, so the centers sum to the month (ADR-142)."

Selecting a row writes `&key=`, marks the row (`aria-selected`) and opens the side panel. Selecting the open row again closes it. While a panel is open, the table narrows to the name column, Spend and, on every grouping but By work order, Share. The panel takes the right column (340 px).

**The side panel** is an `aside` labelled with its title, with **Close** at its top right (`aria-label="Close"`). One per grouping:

- **Operator** (`?by=operator&key=marcus`): heading "Marcus Bell". Role `workspace.owner · core-platform`. Agents "24 operated, 28 in view". Runs "14,225". Spend "$49,545.43". Budget "87% of $57,000.00". Bounded tasks "4 work orders sent, 2 items accepted, $2.07 per accepted item" (future-only). Beneath, the caption "The record, not a grade. Habits and the rules they suggest are on Optimization." and **Open the habits**, which opens `/spend/optimization?part=habits`.
- **Agent** (`?by=agent&key=a-intel.core.triage`): the compact agent card is the heading ("a-intel.core.triage", "Codex CLI · 1,340 runs 30d · $402.11"). Runs "1,340". Spend "$402.11, +9% on last month". Tokens per run "93,217". Cache hit "83%". Tool definitions "34% of every request". Cost center `ENG-1001`. Beneath: "2 recommendations for this agent on Optimization.", **Open the agent**, and **Recommendations**, which opens `/spend/optimization?part=agents`.
- **Model** (`?by=model&key=claude-opus-5`): heading the model id. Model calls "1,201,471". Spend "$272,442.52". Cache hit "84%". Provider key `Anthropic · pk_9f21`. **Model routes** opens Organization.
- **Tool** (`?by=tool&key=claude_code__Bash`): heading the tool name. Kind "harness". Calls "164,664 in 35,611 runs". Per call "$0.70". Per run "$3.25". Record "result bodies average 4.1k tokens; 31% of calls are re-runs of the same command". No action.
- **Cost center** (`?by=cost_center&key=ENG-1001`): heading the label. Agents "64". Spend "$107,722.08". Resolved from "the agent’s label, else its workspace’s", or for `~none` "no label on the agent or its workspace". **Export the statement** (opens `ccexport`).
- **Work order** (`?by=work&key=wo_01K5RS7M4N`): heading the title, "Cut 4.11.0 release notes". Work order `wo_01K5RS7M4N` (a link to the work order) with its `dispatched` badge. Sent by "Marcus Bell". Runs `run_01K5RS7M2E8FJ3QW` (one link per run). Spend "$4.13 of a $10.00 cap". **Open the work order**.

**Dialogs this page opens:** `spendexport`, `ccexport` and `budget`.

- **`spendexport`**, "Export a spend report". Timeframe: This month · September 2026 (to date), Last month · August 2026, Last 30 days, Last 90 days, Quarter to date · Q3 2026, Year to date · 2026, Custom range, with From and To dates beneath. Include: four choices, the first naming everything on the page, then "By operator and agent only", "By tool only" and "Unproductive spend only". The note "Delivered as CSV and a signed PDF to marcus@a-intel.example. Every figure carries its basis; the report is built from frames, so a large range takes a few minutes." Footer: **Cancel**, **Generate report** (gold).
- **`ccexport`**, "Export the chargeback statement", subtitle "CSV · every workspace". Month: September 2026 (to date), August 2026, July 2026. Columns, as badges: `line`, `cost_center`, `runs`, `unpriced_runs`, `cost_micros`, `cost_cents`, `currency`, `basis`, `run_ids` (`FIXTURES.COST_CENTERS.columns`). The note "One line per cost center, one for ~none (spend with no label), and the organization total they sum to. Each line lists the run ids behind it, and cost is in micros and in cents." Footer: **Cancel**, **Export CSV** (gold). Exporting writes `cost_center_statement_exported` to Audit and toasts "Exported cost-centers-<month>.csv. In the product this downloads the file. A mockup writes nothing to disk."
- **`budget`**, "Set a budget": see `spend-budgets.md`.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. The mockup collection is a file in `mockups/fixtures/` (as `SPEND`, `WORKORDERS` and so on) or a function in the mockup source. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Spend tile | `SPEND.spend` plus Oxagen's own routes, through `spendMonthTotal()` | `get_spend` total for the month (`cost.daily_totals`) | `packages/oxagen/src/contracts/spend.get.ts:34-73`; the tile, `apps/app/src/features/spend/summary.tsx:36-49` | ✅ |
| Tokens tile and its cache share | `wsTok()` | the token classes on every `get_spend` row | `packages/oxagen/src/contracts/spend.shared.ts:107-116`; `apps/app/src/features/spend/summary.tsx:26-28, 50-59` | ✅ |
| Observed by the gateway | `wsTok().observed` | the share of tokens by basis | No read counts tokens by basis. The app prints "not recorded" (`apps/app/src/features/spend/summary.tsx:60-62`) | ❌ |
| Wasted tile | `SPEND.wasteTotal`, `wasteShareText()` | `list_waste`: `wasted` and `share` | `packages/oxagen/src/contracts/spend.waste.ts:26-56`, with one cause, `cache_write_never_read` (line 14); `apps/app/src/features/spend/summary.tsx:63-78` | 🟡 |
| September by day | `spendDays()`, seeded from the month's total | `cost.daily_totals`, one row per UTC day and group | The table keeps a row per day (`packages/database/src/schema/cost.ts:388-395`). No contract answers the workspace's month by day. `get_spend_drill` answers a daily series for one operator, agent or tool (`packages/oxagen/src/contracts/spend.drill.ts:59-117`) | 🟡 |
| By work order | `WORKORDERS`, `woSpend()`, `woItems()` | `work_order_id` on the run record, and the work order store | Nothing stores a work order. The run's `taskRef` is free text and null for wrapped runs (wedge, Work, Shipped today). The shipped `task` level keys on the run's goal (ADR-142 §5; `apps/app/src/features/spend/tables.tsx:557-591`) | ❌ |
| By operator | `SPEND.byOperator`, `operatorTok()` | `get_spend` at `operator` | Operator, Role, Runs, Spend, Tokens and Cache hit ship (`apps/app/src/features/spend/tables.tsx:177-268`). Agents and Budget position print "not recorded" (lines 243-245, 259-261) | 🟡 |
| By agent | `SPEND.byAgent`, `agentTok()` | `get_spend` at `agent` | Runs, Spend, Tokens, Per run and Cache hit ship (`tables.tsx:270-347`). Trend prints "not recorded" (lines 337-339) | 🟡 |
| By model | `spendModelRows()`, `PROVIDER_KEYS` | `get_spend` at `model` | Model, Model calls, Spend, Cache hit rate, Basis and the Total row ship (`tables.tsx:349-436`). The provider key prints "not recorded" and the provider sits beneath it (lines 388-397) | 🟡 |
| By tool | `SPEND.byTool` | `get_spend` at `tool` | Calls, Runs, spend, Share, Avg per call and Avg per run ship (`tables.tsx:439-555`). The server and what the frames say print "not recorded" (lines 500-502, 536-538) | 🟡 |
| By cost center | `SPEND.byAgent` through `ccOf()`, which reads `CC.rolledBy` after `ccReady()` resolves each agent from `FIXTURES.COST_CENTERS` | `get_spend` at `cost_center`; `cost.cost_centers`; the agent and workspace labels | The level and the `~none` key (`packages/oxagen/src/contracts/spend.shared.ts:124-140`). The table prints `~none` as "No cost center" (`apps/app/src/features/spend/cost-centers.tsx:29-97`). `set_cost_center` sets the labels (`packages/oxagen/src/contracts/cost_center.set.ts:38`). The level answers runs, so the Agents and Workspaces columns are in no read | 🟡 |
| Operator side panel | `PEOPLE`, `SPEND.byOperator`, `WORKORDERS` | `get_spend_drill` for one operator; the operator review | Role, Runs and Spend come from the `operator` rows. `get_spend_drill` answers the person's daily series, averages, share and tools (`packages/oxagen/src/contracts/spend.drill.ts:59-117`). Agents, Budget and Bounded tasks are in no read | 🟡 |
| Agent side panel | `SPEND.byAgent`, `agentTok()`, `coachAgent()`, `ccOf()` | `get_spend_drill` for one agent; `get_agent` | Runs, Spend, Tokens per run and Cache hit come from the rollup. The agent's cost-center label comes from `get_agent` (`packages/oxagen/src/contracts/agent.get.ts:136`). The trend, the tool definition share and the recommendation count are in no read | 🟡 |
| Model side panel | `spendModelRows()`, `spendKeyOf()` | `get_spend` at `model` | Calls, spend and cache hit ship. The provider key does not | 🟡 |
| Tool side panel | `SPEND.byTool` | `get_spend` at `tool` | Calls, runs, per call and per run ship (`tables.tsx:451-459`). Kind (the server) and Record do not | 🟡 |
| Cost center side panel | `SPEND.byAgent`, `ccOf()` | `get_spend` at `cost_center`; `export_cost_center_statement` | Spend ships. The statement exports the organization's month, one line per center plus `~none` (`packages/oxagen/src/contracts/spend.cost_center_statement.export.ts:48-89`). The agent count is in no read | 🟡 |
| Work order side panel | `WORKORDERS` | the work order store | none | ❌ |
| Export report | the `spendexport` dialog | `export_statement` | A calendar month as CSV (`packages/oxagen/src/contracts/spend.statement.export.ts:31-65`). A date range, a signed PDF and email delivery are not built | 🟡 |

In the app an operator key is the principal's public id (`prn_…`, `packages/oxagen/src/contracts/spend.shared.ts:101-104`). The mockup keys a person by a handle such as `marcus`.

## Future-only fields

The view carries these `data-future` marks. `?future=1` outlines them.

| Mark | Reason | What a build shows today |
|---|---|---|
| The By work order panel | work orders | No work order grouping. The app groups by task reference, the run's goal text, under `/spend/task`, which the route map sends to `?by=work`. Until `work_order_id` ships, the build names the grouping and prints its rows as not recorded |
| Each `direct` badge in Kind | direct work orders | Nothing: no run is filed under a work order |
| Bounded tasks on the operator panel | work orders | not recorded |

The design leaves these fields unmarked, although no contract carries them today. A build prints each as not recorded until its contract ships:

- the September by day chart (the store holds the days, and no contract answers them)
- the Observed by the gateway tile
- Agents and Budget position on By operator
- Trend on By agent
- Provider key on By model
- the tool's kind and its Record
- Agents and Workspaces on By cost center
- Agents, Budget and Bounded tasks on the operator panel
- the trend, Tool definitions and the recommendation count on the agent panel
- the whole work order side panel

## Functionality

- **One page, no drill.** The grouping and the key live in the query (`?by=`, `&key=`), so a side panel is a URL. `/spend/<kind>/<key>` rewrites to it in place. Changing the grouping closes the panel.
- **The month.** Every figure covers the calendar month to date in UTC, as `get_spend` reads it (`apps/app/src/features/spend/view.ts:100-104`). Every figure reads this workspace's runs. The one organization-wide read is the cost-center statement (ADR-142).
- **Partitions.** The Spend tile is the month's total and equals the Total row of By model. By operator, By agent and By cost center each partition the same month: every run lands in exactly one row at its full cost and basis, `~none` included, so each grouping's rows sum to the tile. By work order partitions it too once every run carries `work_order_id`. Until then it lists the work orders in view. By tool does not partition: a tool's spend is the tokens of the turn that called it plus the turn that read its result, so a turn counts toward every tool it called.
- **Share** is the row's spend over the month's spend on the Spend tile, on the basis beside each figure. By work order has no Share column.
- **Attribution.** Every run has exactly one operator. A run that arrived without one is charged to the agent's owning operator and flagged, never dropped and never spread (§12.7). A run's spend belongs to its parent work order (wedge, Work rule 4). A run with no parent from Oxagen is filed under a direct work order, titled from its task reference or first prompt.
- **Cost centers** (ADR-142). A run is charged to its agent's label if the label is live, else to its workspace's, else to `~none`. A run keeps the cost center its first rollup resolved, so a statement for a closed month stays where finance booked it. **Export the statement** downloads the organization's month as CSV: one line per center and one for `~none`, each with its run count, unpriced runs, cost in micros and cents, basis and run ids, and a total line. Micros reconcile, and cents are rounded once per line, half to even.
- **The operator panel** is the operator review's record for one person. It shows spend cut by the person who started the run, and outcome per dollar for bounded tasks: items accepted from the work orders the person dispatched, and spend per accepted item. It links to the person's prompt habits on Optimization. It carries no score, no rank, no severity and no verdict. The review also splits the person's spend by agent and by workspace. The design's panel shows the totals, and the split waits on a read that carries it.
- **The agent panel** counts the recommendations Optimization lists for the agent and links to them.
- **Money.** Every amount carries its basis (`gateway_observed`, `client_attested`, both, or `estimated`) as the record states it. Amounts are integer micros on the wire and are rounded once, at display or at a statement line. A figure no frame priced prints "not recorded", never a zero.
- **Actions.** **Set a budget** opens `budget`. **Export report** opens `spendexport` and exports the month's statement as CSV. **Export the statement** needs org Owner, Admin or Billing. For anyone else it opens no dialog and shows a toast that names who holds the role (`ccDenied()`). Neither export changes anything.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed. The renderer's standard panels read as follows. Empty: "No spend to report yet", "Rollups are rebuilt from frames. With no model call recorded there is nothing to roll up, and nothing billable.", with **Open Work**. Error: "Spend could not be loaded" with `504 rollup_rebuild_in_progress`, **Try again**, **Open an incident** and the trace line. Denied: "You cannot see this workspace’s spend", naming `spend.read on core-platform`, with **Request access** and **Back to Work**.

## Mobile

The thumb bar holds Work (8), Agents, Tools, Spend and More (3), with Spend lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The top bar collapses to the menu button, the page name, search, notifications, Approvals and the avatar.

The header actions sit under the subtext, and the four tiles form a two by two grid. The tabs stay one row. The Group by buttons wrap. The table becomes one card per row, each cell labelled with its column, under the search field, the filter and Rows. With a key open, the side panel stacks below the table and its pager: for `?by=operator&key=marcus` it starts about 2,400 px down the page, and picking a card does not scroll to it. The selected card is shaded. Dialogs rise from the bottom edge as sheets. Nothing scrolls sideways at 390 px.

## Permissions

- Read: `spend.read`, the permission the denied panel names, as the app names it too (`apps/app/src/data/read.ts:94-97`). Shipped roles: `get_spend`, `get_spend_drill` and `list_waste` allow org Owner, Admin, Billing and Member, and workspace Owner and Member.
- Export report: `export_statement`, the same roles as the reads.
- Export the statement: `export_cost_center_statement`, org Owner, Admin or Billing (`packages/oxagen/src/contracts/spend.cost_center_statement.export.ts:61-64`).
- Set a budget: `set_spend_budget`, org Owner, Admin or Billing, and workspace Owner or Admin (see `spend-budgets.md`).
- Setting a cost-center label is `set_cost_center` (org Owner, Admin or Billing). It is not an action on this page.

## Backend gaps this page depends on

- `work_order_id` on the run record and a work order store (wedge Open decision 5): By work order, the work order panel and Bounded tasks.
- A day-by-day series for the workspace's month. The store holds `cost.daily_totals` by day, and no contract answers it.
- Tokens by basis, for the Observed by the gateway tile.
- An operator's agent count, and a ceiling scoped to one operator (the staged `set_budget` in `packages/oxagen/src/contracts/v2/set-budget.ts` is inert until cutover, `v2/_define.ts:5-15`).
- The agent's month against the month before (Trend).
- The provider key a model call was billed to.
- The server a tool belongs to, and what its frames say.
- The agents and workspaces behind a cost center.
- The prompt composition shares on the rollup (the agent panel's Tool definitions).
- The operator review as one read: one person's spend by agent and by workspace, and outcome per dollar.
- A statement for a date range, and the signed PDF §12.9 names.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. When the tool panel says what the frames say, it means recorded frames.
- This view shows no Steering Source and no SteeringFrame, so neither can be shown as the other here.
- Every figure reads the record: the rollup, rebuilt from frames. No inference, no score, no estimate presented as recorded, and no model-written account of why the money went where it did.
- No person is scored or ranked. The operator grouping and panel carry no rank number, severity, grade or verdict, and the panel says it reports the record. Habits appear on Optimization in alphabetical order.
- Every money figure states its basis, and every enforcement claim states its tier. A budget holds only for model calls routed through Oxagen.
- Headers are rollups of the rows beneath them. The Spend tile equals the Total of By model and the sum of every partitioning grouping. The Tokens tile equals the token class total on Optimization.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: **Set a budget** in the header.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- Every figure on the page reads the same scope, this workspace. The cost-center statement is the one organization-wide export.
