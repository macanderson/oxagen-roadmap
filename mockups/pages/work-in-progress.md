# In progress

| | |
|---|---|
| Route | `#/a-intel/core-platform/work/in-progress` (app `/{org}/{ws}/work/in-progress`) |
| Scope | workspace |
| Spec | `docs/work-in-flight-spec.md` §8.7 (the In progress tab), §8.8 (work order states); `docs/work-graph-spec.md` §6.2 (states), §11.1; `docs/fleet-operations-wedge.md`: D1 (Work is the primary surface), D2 (a run is a child of one work order), D17 (future-only marks); Vocabulary › Work. `docs/tasks-spec.md` §9.5, §11 (claims and acceptance) |
| Design | `mockups/src/wedge.js` → `pWork()`, `workStats()`, `inProgressTab()`, `woCell()`, `woOf()`, `wiLogo()`; `mockups/src/engine.js` → `woTargetCell()`, `woBadge()` and `WO_ST`, `woClaimed()`, `woItems()`, `lblChips()`, `tkPerson()`, `ltMulti()`, `ltMultiFacets()`; data `mockups/fixtures/tasks.json` (`tasks` with readiness `sent`, `workOrders`). Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Work / In progress`: Loaded, Loaded · mobile, Loaded · future-only fields marked |
| Audit | `work-in-progress.audit-prompt.md` |

## Job

Every work item that is in a work order right now, with where it went and how far it got. A send moves a work item off the Backlog and onto this tab. It stays here until a person accepts every item of its work order, and then it returns to the Backlog as Accepted.

## What is on the page

**Header.** As `work-backlog.md`: eyebrow the workspace name and h1 “Work”, with no subtext. The In progress tab has no header action.

**Scope and stat cards.** As `work-backlog.md`: **All work** and **My work** over the Open, In progress, In review and Pending approvals cards. In progress and In review both open this tab, and together they count its rows.

**Tabs**: Backlog `7` · In progress · Work orders `1` · Workflows · Findings `36`, with In progress selected. In progress carries no count, because the work orders waiting on you are counted on Work orders.

**In progress panel.** Heading “In progress”, with no subtext. The shared list bar: a search field (“Search this list”), the Labels filter, the Owner filter, the State select (“Any state”), and Rows (5, 10, 25, 50, All). The Labels and Owner filters work as on the Backlog (`work-backlog.md`): each takes several values and draws them as the table does. Every column header sorts. A row click opens the work item (`work-item.md`).

Columns, in order:

| Column | Content |
|---|---|
| Work item | The provider’s logo as an SVG (or the Oxagen mark for an item written in Oxagen), the number in mono, and the subject under it |
| Labels | Color chips in the colors the Intake dialog sets |
| Owner | The mapped member with avatar. An account that is not mapped reads as its provider handle with the provider’s logo and a `not mapped`, `bot` or `requester` badge |
| Work order | The work order’s id as a link, with `live` beside it while one of its runs is live. Outlined as future-only |
| Sent to | The agent’s harness mark, avatar and name, or the workflow’s stage marks and name. Outlined as future-only |
| State | The work order’s state badge: sent, in progress, waiting on you, returned, parked for you or stopped. Outlined as future-only |
| Items claimed | “claimed / items” for the work order’s definition of done, or a dash. Outlined as future-only |
| Updated | The provider’s update time, in mono |

The provider’s own status stays on the Backlog and the work item page. It is left off this table because a provider’s “In review” is not the In review card, which counts work orders waiting on a person to accept.

The demo record holds 4 rows: #482 (`wo_01K5RS7M4N` to Release manager, in progress, live, 3 / 4), #647 (`wo_01K6TC5A` to Bug fixer, in progress, live, 0 / 3), #599 (`wo_01K6TA2M` to stella CI, waiting on you, 3 / 3) and #587 (`wo_01K6T9QX` to the Fix, validate, document, review workflow, in progress, live, 2 / 4). #647 is in a send with two targets: its row shows the work order the Backlog showed, and `wo_01K6TC5B` is on Work orders.

No note sits under the table. When an item leaves this tab, and why the provider’s status is left off, is in the component help (`mockups/help/work-in-progress.md`, In progress).

**Dialogs and layers this page opens:** none. The Pending approvals card opens the Approvals drawer (`approvals-drawer.md`).

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Nothing in `macanderson/oxagen` stores a work item or a work order (wedge spec, Work › Shipped today).

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Rows: work items in a work order | `TASKS` with readiness `sent` | `tasks.tasks` joined to `tasks.work_order_tasks`; `list_tasks` | none | ❌ |
| Labels and owner | `TASKS[].labels`, `TASKS[].owner`, `TLABELS`, `TPEOPLE` | `tasks.task_labels`, `tasks.provider_people` | none | ❌ |
| Work order and `live` | `TASKS[].wo`, `woLive()` | `tasks.work_order_tasks`; the run’s parent work order | none. No run names a work order (`work-backlog.md`) | ❌ |
| Sent to | `WORKORDERS[].target` | `tasks.work_orders` target | none | ❌ |
| State | `WORKORDERS[].status`, `WO_ST` | `evaluateWorkOrder()` (`work-in-flight-spec.md` §8.8) | none | ❌ |
| Items claimed | `woClaimed()`, `woItems()` | `tasks.item_claims`, `tasks.work_order_items` | none | ❌ |

## Future-only fields

The mockup marks the Work order, Sent to, State and Items claimed cells with `data-future` (“work orders”), and the Open, In progress and In review cards as `work-backlog.md` says. Every row is future-only too (wedge spec, Work › Shipped today). A build renders each value as `not recorded` until the contracts in Backend gaps ship.

## Functionality

- A row is a work item whose readiness is `in a work order`. A send adds rows, and accepting every item of a work order removes its rows.
- The In progress card counts the rows whose work order does not wait on a person to accept, and the In review card counts the rest. My work keeps a row whose owner is mapped to you or whose work order you sent.
- The Labels and Owner filters match a row that carries any value you picked. The State select narrows to one work order state.
- Nothing on this tab sends, accepts or stops. Those happen on the work order (`work-order.md`).

## States

Loaded only. The build uses the shell’s standard loading, error, empty and denied panels until they are designed. A workspace with nothing in a work order shows the table’s “No rows match.”

## Mobile

As `work-backlog.md`: the thumb bar, the tab strip that scrolls inside itself, and the stat cards two by two. The table becomes labelled cards, each cell labelled with its column header. The Labels and Owner filters are 44 px tall with 16 px text, and each option in their lists is 44 px tall. The page never scrolls sideways.

## Permissions

The design names these. None exists in `packages/iam` today.

- Read: `work.read`

## Backend gaps this page depends on

- The work item record and its work order (`list_tasks`, `list_work_orders`)
- A work order id on the run record beside `taskRef` (wedge spec, Open decisions 5), so `live` reads runs by work order
- The work order state function (`work-in-flight-spec.md` §8.8) and item claims (`tasks-spec.md` §11)

## Rules every build of this page must keep

- Headers are rollups of the rows beneath them. The In progress and In review cards sum to this tab’s rows.
- The provider’s status and the work order’s state are two things, never one column.
- No person is scored or ranked. Owners are listed, never ordered by output.
- Every harness shows its own mark.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
