# Work orders

<!-- work-orders: the Work orders tab. Its header and tab bar fall back to work-backlog/header and work-backlog/tabs. -->

## Work orders

The Work orders panel lists every work order in the workspace, dispatched and direct, with its latest run, its claims, its state and its spend.

### Purpose
You come here to see what the agents are doing and what they did, from the side of the work. Each row answers five questions: what was sent, to whom, which run carries it now, how many items the agents claimed, and what it cost. A row opens the work order, where you stop it, read its brief or accept it. The run link on a row opens the run without opening the work order, so this list is also the way to any run in the workspace.

### Rationale
D2 makes a run a child record of exactly one work order. Every run belongs to one, and a run started outside Oxagen gets a direct work order. That is why the Fleet page's runs table retired into this tab (D3): when every run has a parent, a list of parents reaches every run without a second table. Oxagen opens a direct work order at the run's first frame so that no run stands alone, and so Spend and Audit can attribute every run to a unit of work (wedge spec, Work › Rules 1 and 4, Open decisions 5).

The kind badge separates two different things. A person sent a dispatched work order from Work. Oxagen opened a direct one for a run an operator started from their own terminal. The completion rule sat in a note under the table and lives here now. An agent claims an item with evidence, and a person accepts it. A work order is done when you accept every item, and nothing merges without a person. A direct work order has no definition of done until you attach it to a backlog item, so its Items claimed reads a dash. Items claimed is a fraction so the gap between the agent's word and a person's acceptance stays visible in the list.

A send to several targets makes one work order per target (`docs/work-graph-spec.md` §7). The group row exists to compare the same brief on two agents. It shows no rank, no score and no winner (D15).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Dispatched work orders: title, id, items, target, state, sent by | `WORKORDERS` kind `dispatched` (`fixtures/tasks.json` `workOrders`) | `tasks.work_orders`, `tasks.work_order_tasks`; `list_work_orders` | none |
| Direct work orders, one per run started outside Oxagen | `fileDirect()` over `RUNS` | a work order opened at the run's first frame, and `work_order_id` on the run | none |
| A direct work order's title and task reference | `R.taskTitle`, `R.task` | `taskRef` (`run.list.ts:291`), the run `name` (`run.list.ts:425-426`), the first prompt from `get_run_transcript` | partial |
| Kind badge | `w.kind`, `woKindBadge()` | the work order's kind | none |
| Sent to, for a direct work order | `R.agent` | `agentKey` (`run.list.ts:240`) | live |
| Latest run, `live`, run count | `w.runs`, `woLive()` | `list_runs` id and status (`run.list.ts:477`, `:52`) with no work order link | partial |
| Items claimed | `woClaimed()`, `woItems()` | `tasks.item_claims`, `tasks.work_order_items` | none |
| State | `w.status`, `WO_ST` | the work order's state | none |
| Spend | `woSpend()` | each run's cost and basis (`run.list.ts:277`, `spend.shared.ts:13-17`), summed by work order | partial |
| Sent by, for a direct work order | `R.op` | `operatorName` with `operatorAttribution` (`run.list.ts:242-260`) | live |
| Chip counts | rollups over the rows | rollups over `list_work_orders` | none |
| `queued`, `expired`, and what a queued one waits on | `w.status`, `w.expires`, `woWaitsOn()` | `tasks.work_orders` `queued`, `expired`, `expires_at` | none |
| A send and its children | `SENDS`, `WORKORDERS[].send` | `tasks.sends`; `list_sends` | none |

### Logic
1. `pWork()` calls `fileRuns()` on every render. It runs `fileDirect()` for each run with no parent, because runs can arrive after load (the onboarding smoke session). A direct work order takes the id `wo_` plus the run id's tail, the title from `R.taskTitle`, `R.task` or "Run on <agent>", the sender `R.op`, and the state `in progress` for a live, parked or paused run, `stopped` for a halted one and `closed` otherwise.
2. `workOrdersTab()` reads `wsWorkOrders()`, drops what `woShown()` rejects (a direct work order whose run a scenario removed), and sorts by `sent`, newest first.
3. The chips set `S.woFilter`: All, Dispatched (`kind` `dispatched`), Direct (`kind` `direct`) and Live (`woLive()`, true when one of its runs is live). Each chip's count is its number of rows.
4. A work order with a `send` draws a group row first, marked future-only: the title, the send id, "2 work orders", the targets' harness marks, "one per target", and the state from `woSendState()`, which is `partial` while the children's states differ. `woSiblings()` lists the children, each with "1 of 2 in this send".
5. Latest run is the last entry of `w.runs`, linked when the run is in view, with `live` from the work order's own record and "N runs" when there are more. State draws `WO_ST` through `woBadge()`, and a queued one adds "waits on" and `woWaitsOnHtml()`. Spend is `woSpend()` in USD, or a dash at zero.
6. The Work orders tab count is `woWaiting()`, the work orders in `waiting on you`.

### States
Loaded only. Loading, error (`503 work_index_unavailable`) and denied (`work.read on core-platform`) replace the page with the shell's panels. In the first-run view (`obFirstRun()` finds the smoke run in `S.firstRun`), Work opens on this tab, `obFirstBanners()` draws the provisional and first run banners, and the list holds one row, the smoke run's direct work order. Every chip counts that one row. On a phone the table becomes labelled cards and the chips wrap.

## Onboarding offer

The Onboarding offer panel shows the conversion discount beside what the first run cost and what Oxagen billed for it.

### Purpose
You have just finished onboarding and one run is live. The panel tells you the deadline for the discount, 7 days from the first run, and grounds it in a real number: this run cost $0.02 on your own provider, and Oxagen billed $0.00 for it. You either open Billing with **See plans** or put the panel away with **Not now**.

### Rationale
The offer sits on the first screen a new operator reads because the run it prices is on the same screen. Showing the run's cost with its basis follows the rule that every number that is money shows its basis. The panel says Oxagen billed nothing because the included monthly allowance covers a first run, and a person deciding whether to pay should see that before the price. The panel's claim that Oxagen never marks up tokens holds for the agent's own model calls, which Oxagen does not bill. A build must not let it read as covering in-app AI usage, which carries a meter markup (`mission-control-spec.md` §12.10, decision 17). The 7-day offer is deferred in the build (§12.1 and §20), and the app says the offer is not recorded yet.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Discount and deadline | `BILLING.discount`, `OB_OFFER_DAYS`, `obDate()` | a recorded onboarding offer | none |
| The first run's cost and basis | `fr.cost`, `fr.basis` | the run's cost (`run.list.ts:277`) | live |
| What Oxagen billed | `BILLING.tier2`, `BILLING.runsIncluded` | the governed actions billed for one run | none |

### Logic
1. `obOfferCard(fr)` renders only in the first-run view and only while `S.obOfferOff` is false.
2. The deal text is the "N% off usage for N months" phrase read out of `BILLING.discount`. The deadline is `obDate(OB_OFFER_DAYS)`, 7 days after `OB_DAY`, 18 Sep 2026.
3. The billed amount is `max(0, 1 - BILLING.runsIncluded)` times the block price parsed from `BILLING.tier2`, which is $0.00 while the allowance covers the run.
4. **Not now** sets `S.obOfferOff` for the session. **See plans** opens Billing.

### States
Present only on the first run. **Show the seeded workspace** on the first run banner clears `S.firstRun`, and the panel goes with it. On a phone the panel runs full width.
