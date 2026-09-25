# In progress

## In progress

Every work item that is in a work order right now, with where it went and how far it got.

### Purpose
It answers what the agents are working on for you: which item went to which agent or workflow, in which work order, in what state, and how many of its definition of done items the agent has claimed. A row opens the work item. From there you follow its work order, or accept the work when it waits on you.

### Rationale
A send moves a work item off the Backlog, so the Backlog lists only what is left to send. Before this tab, a sent item stayed on the Backlog marked `in a work order`, and the list mixed work to do with work out. The tab gives work out a home until a person accepts every item of its work order. Then the item returns to the Backlog as Accepted (`docs/work-in-flight-spec.md` §8.7, `docs/work-graph-spec.md` §6.2).

The table leaves off the provider's own status. A provider's "In review" is not the In review card, which counts work orders waiting on a person to accept, and two review words in one row would read as one fact. The provider's status stays on the Backlog and on the work item page.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Rows | `TASKS` with readiness `sent` | `tasks.tasks` joined to `tasks.work_order_tasks`; `list_tasks` | none |
| Labels, owner | `TASKS[].labels`, `TASKS[].owner`, `TLABELS`, `TPEOPLE` | `tasks.task_labels`, `tasks.provider_people` | none |
| Work order and `live` | `TASKS[].wo`, `woLive()` | `tasks.work_order_tasks`; the run's parent work order | none |
| Sent to | `WORKORDERS[].target`, `woTargetCell()` | `tasks.work_orders` target | none |
| State | `WORKORDERS[].status`, `woBadge()`, `WO_ST` | `evaluateWorkOrder()` (`work-in-flight-spec.md` §8.8) | none |
| Items claimed | `woClaimed()`, `woItems()` | `tasks.item_claims`, `tasks.work_order_items` | none |

### Logic
1. `inProgressTab()` lists `wsTasks()` rows whose readiness is `sent`, one row per work item.
2. Columns in order: Work item (logo, number, subject), Labels, Owner, Work order, Sent to, State, Items claimed, Updated.
3. Work order is the id as a link, with `live` beside it while one of its runs is live (`woCell()`).
4. Sent to is the agent's harness mark, avatar and name, or the workflow's stage marks and name.
5. State is the work order's badge: sent, in progress, waiting on you, returned, parked for you or stopped.
6. Items claimed reads "claimed / items" for the work order's definition of done, or a dash.
7. The shared list bar filters by Labels and Owner (multi-select, `data-facet="multi"`), by State, and by a search, and pages by Rows.
8. A row click opens the work item. The tab has no header action.
9. The Work order, Sent to, State and Items claimed columns carry `data-future`.

### States
Loaded only. With no work item out, the table shows the list's empty row. On a phone the table becomes labelled cards and the list bar stacks.
