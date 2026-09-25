# Work orders

| | |
|---|---|
| Route | `#/a-intel/core-platform/work/orders` (app `/{org}/{ws}/work/orders`). Old routes that land here: the mockup’s `#/:org/:ws/tasks/work-orders` (rewritten in place), and the app’s Fleet runs at a later page, `/{org}/{ws}?cursor=…` (308, the cursor dropped). The end of onboarding lands here too |
| Scope | workspace |
| Spec | `docs/work-graph-spec.md` §6.2 (states), §7 (sends and targets), §11.1; `docs/fleet-operations-wedge.md`: D1 (Work is the primary surface), D2 (a run is a child of exactly one work order, and a run started outside Oxagen is filed under a direct work order), D3 (the Fleet runs table becomes each work order’s runs), D17; Vocabulary › Work (Work order, Dispatched work order, Direct work order); Work › Objects, Rules 1 to 4, Shipped today. `docs/fleet-operations-ia.md` › Work. `docs/fleet-operations-routes.md` › Workspace and Work. `docs/tasks-spec.md` §9.5, §9.6, §11. The first run: `onboarding-run.md` ends here, and ADR-099 in `macanderson/oxagen` sets the 14-day provisional window |
| Design | `mockups/src/wedge.js` → `pWork()`, `workOrdersTab()`, `woSiblings()`, `woSend_()`, `woSendIndex()`, `woSendState()`, `woWaitsOnHtml()`, `woKindBadge()`, `fileDirect()`, `fileRuns()`, `runParent()`, `woShown()`, `woLive()`, `woSpend()`; `mockups/src/engine.js` → `woTargetCell()`, `woBadge()` and `WO_ST`, `woClaimed()`, `woItems()`, `obFirstRun()`, `obFirstBanners()`, `obOfferCard()`, `obBind()`, `regFinish()`; data `mockups/fixtures/tasks.json` (`workOrders`), the runs in `mockups/fixtures/runs.json` (each run no dispatched work order holds is filed under a direct one at load), and `BILLING` for the offer. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Work / Work orders`: Loaded, Loaded · mobile, Loaded · future-only fields marked |
| Audit | `work-orders.audit-prompt.md` |

## Job

Every work order in the workspace, the ones a person sent and the ones Oxagen opened for runs started outside it, with what each is doing now. A run is a child record of exactly one work order, so every run in the workspace is reachable from here: this tab replaces the Fleet page’s runs table. Straight after onboarding it is also where a new operator lands, on the one run the installer started.

## What is on the page

Component help for this tab lives in `mockups/help/work-orders.md`.

**Header.** As `work-backlog.md`: eyebrow the workspace name and h1 “Work”, with no subtext. The explanation is in `mockups/help/work-backlog.md`, Header. The Work orders tab has no header action.

**Tabs**: Backlog `7` · In progress · Work orders `1` · Workflows · Findings `36`, with Work orders selected. Its count is the work orders waiting on you to accept.

**Work orders panel.** Heading “Work orders”, with no subtext. The explanation is in `mockups/help/work-orders.md`, Work orders. Filter chips in the panel header, each with its count, the chosen one marked: **All** `282` · **Dispatched** `4` · **Direct** `278` · **Live** `7`. Live keeps the work orders with a live run. The shared list bar: a search field (“Search this list”), a State facet (“All · State”, over the states present), Rows (5, 10, 25, 50, All), and a pager (“1–10 of 282”). Rows sort newest first, by when the work order was sent or opened.

Columns, in order:

| Column | Content |
|---|---|
| Work order | The title in bold, the id in mono, and the kind badge: `dispatched` (title “A person sent it from Work”) or `direct` (title “Oxagen opened it for a run started outside Oxagen”, outlined as future-only) |
| Work items | The logo and number of each work item, one per line. A direct work order with none attached shows the run’s task reference in mono (“LIN-4432”), or “none” |
| Sent to | The agent’s harness mark, avatar and name, or a workflow’s stage marks and its name |
| Latest run | The run id as a link to the run, `live` while it is live, and “4 runs” under it when the work order started more than one. “none yet” before the first run |
| Items claimed | Claimed over total (“3 / 4”), or a dash when the work order has no items |
| State | A dot and a word: Queued (with “waits on #633” under it), Sent, In progress, Waiting on you, Sent back, Parked for you, Stopped, Expired, Accepted or Closed |
| Spend | The sum of its runs’ cost in USD, or a dash |
| Sent by | Avatar and name, and the time it was sent or opened in mono |

A row opens the work order (`work-order.md`). The run link opens the run without opening the work order.

The demo record holds 282: four dispatched and 278 direct. The dispatched ones are `wo_01K5RS7M4N` “Cut 4.11.0 release notes” (Release manager, in progress, 3 / 4, $4.13), `wo_01K6T9QX` “Same-minute migration stamps” (the Fix, validate, document, review workflow, in progress, 4 runs, 2 / 4), `wo_01K6TA2M` “pnpm 10.18” (Stella CI, waiting on you, 3 / 3) and `wo_01K6RZ41` “Expired approvals in the count” (Bug fixer, accepted, 2 / 2). Each direct one holds one recorded run, titled from it: `wo_01K5RQ4B9C7XTN2P` “Bring #482 up to the release-notes contract” (Stella CI, closed, $2.87).

No note sits under the table. How claims, acceptance and direct work orders work is in `mockups/help/work-orders.md`, Work orders.

### The first run

Straight after onboarding the workspace holds one run, the installer’s smoke session, and Work opens on this tab with that run alone. **Open Oxagen** at the end of onboarding (`regFinish()` in onboard mode) sets the first-run view, goes to `/work/orders`, and toasts in gold “Welcome to Oxagen. First frame received from a-intel.core.release-manager, its run is live under a direct work order, and the organization is out of the gate.” Scenario W1, step 6, stops here. Under the header, in order:

- **Provisional banner**, while no main repository is linked: the badge `provisional`, “Core platform is provisional until 25 Sep 2026.”, “Runs record and spend counts. Steering records and agent definitions stay off until a main repo is linked, because there is nowhere to publish them to.”, and **Link a-intel/platform**, which installs the GitHub App on the repository, removes the banner and toasts.
- **First run banner**: the badge `first run`, “One run so far.”, “This workspace has recorded the installer’s smoke session, `run_01K5RV2N8QH4TZ01X` from `a-intel.core.release-manager`, filed under a direct work order, and nothing else.”, and **Show the seeded workspace**, which puts the first-run view away.
- **Onboarding offer** panel: heading “Onboarding offer”, **Not now** (a ghost button, `aria-label` “Dismiss the onboarding offer”), “**Convert by 18 Sep 2026 for 20% off usage for 12 months.**”, “That is 7 days from your first run. `run_01K5RV2N8QH4TZ01X` cost **$0.02** USD, `client_attested`. Oxagen billed **$0.00** for it: the included monthly allowance covered it, and Oxagen never marks up tokens.”, and **See plans** (opens Billing).
- The tabs, with Work orders selected, and the Work orders panel with one row: “Installer smoke session”, `wo_01K5RV2N8QH4TZ01X`, `direct`, work items “smoke”, Release manager, the run `live`, a dash, `in progress`, $0.02, Marcus Bell 2026-09-11 14:02. The chips read All `1` · Dispatched `0` · Direct `1` · Live `1`.
- Every count reads off the one run. The sidebar and the thumb bar carry no counts, and the sidebar foot reads “1 agent”. The tab counts follow the same rule: nothing waits on a person yet.

**Shell.** The sidebar with Work lit and its count (none on the first run). Breadcrumbs “Anderson Intelligence Corp. / Core platform / Work”. ⌘K, notifications, the Approvals button with the organization’s count, and the avatar.

### A send with several work orders

A send to several targets (`docs/work-graph-spec.md` §7) makes one work order per target. The tab shows them under one row: the title, the send id in mono with “2 work orders”, the work items, the targets’ harness marks with “2 targets”, “one per target” in place of a run, a dash for items claimed, the group state (`partial` while the children’s states differ, else the shared state), a dash for spend, and the sender. Its children follow, indented, each with “1 of 2 in this send” under its id. The design opens the children on a click; the mockup always shows them. The demo record holds send `snd_01K6TC59`, `wo_01K6TC5A` (Bug fixer on Claude Code, `in progress`) and `wo_01K6TC5B` (Validator on Codex, `sent`), so the row reads `partial`. Outlined as future-only.

`wo_01K6TB2X` is `queued` for Release manager, waiting on #633, with an expiry of 2026-09-25.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Checked against `macanderson/oxagen` `origin/main` at `1ba160dbc`. Nothing in the repository stores a work order, dispatched or direct (wedge spec, Work › Shipped today). A direct work order is built from one run, so the run’s own fields ship even though the work order does not.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Dispatched work orders: title, id, items, target, state, sent by | `WORKORDERS` kind `dispatched` | `tasks.work_orders`, `tasks.work_order_tasks`; `list_work_orders` | none | ❌ |
| Direct work orders, one per run started outside Oxagen | `fileDirect()` over `RUNS` | a work order Oxagen opens at a run’s first frame, and a `work_order_id` on the run (wedge spec, Open decisions 5) | none. No run names a work order: `taskRef` is a free-text goal (`packages/oxagen/src/contracts/run.list.ts:285-291`), null for every wrapped session (`packages/handlers/src/run.list.ts:1278`) | ❌ |
| A direct work order’s title and its task reference | `R.taskTitle`, `R.task` | the run’s task reference, or its first prompt | `taskRef` ships for ledger runs (`run.list.ts:291`). A run’s generated `name` ships (`run.list.ts:425-426`). A wrapped run’s first prompt is in its transcript (`get_run_transcript`, `packages/oxagen/src/contracts/run.transcript.get.ts:397`) | 🟡 |
| Kind badge | `w.kind` | the work order’s kind | none | ❌ |
| Sent to, for a direct work order | `R.agent` | the run’s agent | `agentKey` (`run.list.ts:240`) | ✅ |
| Latest run, `live`, and the run count | `w.runs`, `woLive()` | the work order’s runs | Each run’s id and status ship (`list_runs`, `run.list.ts:477`, status at `:52`). Which runs belong to one work order does not | 🟡 |
| Items claimed | `woClaimed()`, `woItems()` | `tasks.item_claims`, `tasks.work_order_items` | none | ❌ |
| State | `w.status`, `WO_ST` | the work order’s state | none. A direct one’s state follows its run’s status, which ships | ❌ |
| Spend | `woSpend()` | the work order’s runs’ cost, each with its basis | Each run’s cost and basis ship (`run.list.ts:277`; `gateway_observed`, `client_attested`, `mixed`, `estimated` in `packages/oxagen/src/contracts/spend.shared.ts:13-17`). `get_spend` rolls up by task reference (`packages/oxagen/src/contracts/spend.get.ts:38`), not by work order | 🟡 |
| Sent by, for a direct work order | `R.op` | the run’s operator | `operatorName` with `operatorAttribution` (`initiator` or `host_enroller`) (`run.list.ts:242-260`) | ✅ |
| Filter chip counts | rollups over the rows | rollups over `list_work_orders` | none | ❌ |
| Provisional banner and Link | `ws().provisional`, `obBind()` | `get_onboarding_state` `provisional`; `bind_main_repository` | `provisional.until` and `mainRepoBoundAt` (`packages/oxagen/src/contracts/onboarding.state.get.ts:77-84`); `bind_main_repository` (`packages/oxagen/src/contracts/repository.main.bind.ts:71`). The banner renders on Fleet today (`apps/app/src/features/onboarding/gate.tsx:132-174`) | ✅ |
| First run banner: the run and its agent | `S.firstRun`, `obFirstRun()` | `get_onboarding_state` `firstRunId` | `firstRunId` (`onboarding.state.get.ts:71`). The banner renders on Fleet today (`gate.tsx:151-154`, copy in `apps/app/messages/onboarding.json:297-303`). “Filed under a direct work order” is future-only | 🟡 |
| Onboarding offer | `BILLING.discount`, `OB_OFFER_DAYS` | a recorded onboarding offer | none. The app says so: “the onboarding offer is not recorded yet (spec §20, deferred)” (`apps/app/messages/billing.json:60`) | ❌ |
| The first run’s cost and basis | `fr.cost`, `fr.basis` | the run’s cost | `run.list.ts:277` | ✅ |
| “Oxagen billed $0.00 for it” | `BILLING.tier2`, `runsIncluded` | the governed actions billed for one run | none. The rate card carries the included allowance (`get_rate_card`, `packages/oxagen/src/contracts/billing.action_rate_card.ts:38` and `:44`), and nothing prices one run’s governed actions | ❌ |
| `queued`, `expired`, and what a queued work order waits on | `WORKORDERS[].status`, `.expires`, `woWaitsOn()` | `tasks.work_orders` `queued`, `expired`, `expires_at` (`work-graph-spec.md` §6, §9) | none | ❌ |
| A send and its children | `SENDS`, `WORKORDERS[].send` | `tasks.sends`; `list_sends` (§7) | none | ❌ |

## Future-only fields

The mockup marks these with `data-future` (`?future=1` outlines them):

| Mark | Reason in the mockup | What a build shows instead today |
|---|---|---|
| Each `direct` kind badge | “direct work orders” | `not recorded`. No `/work/orders` route exists in `apps/app` today. Runs are listed on Fleet (`apps/app/src/app/[org]/[ws]/(fleet)/page.tsx`), with no work order above them |

The mockup marks nothing else on this tab, but every work order field is future-only (wedge spec, Work › Shipped today): the list itself, the dispatched rows, the items claimed, the state, the chips and their counts, the first-run banner’s “filed under a direct work order”, and the onboarding offer. A build renders each as `not recorded` until its contract ships. What a build can show today, from the record: each run with its agent, status, cost and basis, and its operator, which is the Fleet runs table; and the provisional and first-run banners, which the app draws on Fleet.

## Functionality

- Every run in the workspace appears under exactly one work order. A run started outside Oxagen is filed under a direct work order that Oxagen opens at the run’s first frame. No run stands alone.
- A direct work order is titled from the run’s task reference, or from its first prompt when it has none. Its sender is the run’s operator. It has no definition of done until a person attaches it to a backlog item, so its Items claimed reads a dash.
- The chips filter the rows: Dispatched keeps what a person sent, Direct what Oxagen opened, Live what has a live run. The counts are rollups of the rows.
- A work order’s Spend is the sum of its runs’ cost, and each run keeps its own basis.
- On the first run, the list holds the one smoke run under its direct work order, and every count reads off that run. **Show the seeded workspace** puts the first-run view away; in the product the list already holds every run there is, so the button hides the banner and nothing else. **Not now** dismisses the offer for the session. **Link a-intel/platform** links the main repository and ends the provisional window.
- `node tools/check-tasks.mjs` walks the send that lands a new work order at the top of this list (flow 5).

- A work order is `in progress` from its start receipt, not from its send. A released work order with no receipt reads `sent` (`docs/work-graph-spec.md` §6.2).
- Siblings of a send sit side by side with no rank, no score, and no winner.
- `node tools/check-tasks.mjs` walks flow 14 (a send with two work orders) on this tab.

## States

Loaded only. This change designs the loaded state. The build uses the shell’s standard loading, error, empty and denied panels until they are designed.

Within loaded, the first run is the variant described above: the workspace holds one run, the smoke session, under a direct work order.

## Mobile

The thumb bar holds Work (lit, with its count), Agents, Tools, Spend and More. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The tab strip scrolls sideways inside itself. The filter chips wrap. The table becomes labelled cards, each cell labelled with its column header and the title, id and kind at the top of the card. The first-run banners stack their badge, their text and their button, and the offer panel runs full width. Touch targets are at least 44 px. Nothing scrolls sideways.

## Permissions

The design names this. It does not exist in `packages/iam` today.

- Read: `work.read`
- No write on this tab. **Link a-intel/platform** is `bind_main_repository`, which ships and is recorded in Audit.

## Backend gaps this page depends on

- The work order record and its list (`list_work_orders`, `get_work_order`; `tasks-spec.md` §12), in `tasks.work_orders`
- The direct work order: opened at a run’s first frame, titled from the run’s task reference or first prompt, and a `work_order_id` on the run record beside `taskRef` (wedge spec, Open decisions 5)
- Claims per item (`claim_dod_item`, `tasks.item_claims`)
- Spend rolled up by work order, once a run names its work order (wedge spec, Work › Rules 4)
- A recorded onboarding offer, and a read of what Oxagen billed for one run

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. The tab lists runs, not frames.
- A Steering Source and a SteeringFrame are never shown as each other. The tab shows neither.
- Every row reads the record. A direct work order’s title is the run’s own task reference or first prompt, never a model’s summary presented as the operator’s words.
- No person is scored or ranked. Sent by names a person and orders nothing by them.
- Every enforcement claim states the tier. The tab makes none.
- Headers are rollups of the rows beneath them: each chip counts its rows, and Spend is the sum of the runs’ cost.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. This tab has none of its own.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- Every number that is money shows its basis. A work order’s Spend adds runs, and each run keeps the basis it was recorded with.
- On a direct work order, Sent by reads the run’s operator as recorded. Where the record attributes the run to the host’s enroller (`host_enroller`), the build says enrolled by, never started by.
- A run is never shown without its work order, and a work order is never shown without its runs.
- A send row is a rollup of its children and never a work order of its own. No run, claim or cost is typed on it.
