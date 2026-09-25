# Backlog

<!-- work-backlog: the Backlog tab, the parts the four Work tabs share (header and tabs), the send menu, and the work order dialog with its six sections -->

## Header

The Work header names the workspace and holds the one or two actions the current Work tab offers.

### Purpose
Work is where you decide what the agents do next, and where you see what waits on you. The header answers which workspace you are in and what you can start from this tab. On Backlog you connect trackers with **Intake** and send ready work items with **Send to an agent…**. On Workflows you start a new workflow file. Work orders and Findings have no header action, because every action there belongs to one row.

### Rationale
D1 makes Work the primary surface: the workspace root lands here, and Backlog, Work orders, Workflows and Findings are its four tabs. The header is shared by all four, so this section answers the header on every tab. The page once carried a subtitle, "What the agents work on, and what waits on you." That sentence described the page rather than the record, so it moved here: it is the purpose of Work in one line. Keeping the header to an eyebrow, a heading and actions matches every other page in the app. Exactly one gold action appears per screen, so **Intake** is plain and **Send to an agent…** is gold on Backlog.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Workspace name (eyebrow) | `ws().name` over `WS` | the workspace record | live |
| Send to an agent… and its enabled state | `dispatchButton()` over `S.tsel` | `tasks.tasks` readiness | none |
| Intake | `openDialog('intake','providers')` | `list_issue_providers` | none |
| New workflow | `wfzOpen()` | `propose_workflow` | none |
| First-run banners and offer | `obFirstRun()`, `obFirstBanners()`, `obOfferCard()` | `get_onboarding_state` (`firstRunId`, `provisional`) | partial |

### Logic
1. `pWork()` builds the header on every Work tab. The eyebrow is the workspace name and the h1 is "Work".
2. The tab decides the actions. Backlog: **Intake** (plain) opens the Intake dialog on Trackers, and `dispatchButton()` draws **Send to an agent…** (gold). The button is disabled, titled "Select one or more ready work items", until `S.tsel` holds at least one work item. Workflows: **New workflow** (gold) calls `wfzOpen()`. Work orders and Findings: no action.
3. Straight after onboarding, `obFirstRun()` finds the installer's smoke run. `pWork()` then forces the Work orders tab, and `obFirstBanners()` and `obOfferCard()` draw the provisional banner, the first-run banner and the onboarding offer between the header and the tabs. `work-orders.md` specifies that view.
4. Loading, error, denied and empty replace the whole page, header included (see States).

### States
Loaded is the designed state. Loading shows `skeleton()`. Error shows "503 work_index_unavailable". Denied names `work.read on core-platform`. Empty reads "No work in Core platform yet" with **Connect an issue tracker** (gold). On a phone the two Backlog actions stack under the heading, the gold one at full width, and each is at least 44 px tall.

## Stat cards {#work-backlog/stat-cards}

A scope switch, **All work** or **My work**, over four cards: Open, In progress, In review and Pending approvals.

### Purpose
You open Work and want the state of the workspace in one glance: how much is open, how much is out with an agent, how much waits on a person to accept, and how many calls wait on an approver. Each card answers one of those with one number and one caption, and each is a way in: Open goes to the Backlog, In progress and In review go to the In progress tab, and Pending approvals opens the Approvals drawer. **My work** narrows every card to what is yours.

### Rationale
D3 retired the Fleet page, whose tiles counted runs. Work counts work, and the cards follow a work item through its life: open on the Backlog, in progress in a work order, in review while its work order waits on a person to accept, and back on the Backlog as accepted. The cards replaced four tiles (Ready to send, Waiting on you, In work orders and Live work orders) when the In progress tab arrived (`docs/work-in-flight-spec.md` §8.7). Ready to send lives on as the Open card's caption. A card is a rollup of the rows under the tabs and is never typed twice, so a card, a tab and the sidebar read the same sums. A work order waits on the person who sent it, so In review follows the sender, and My work counts it for that person.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Open, and ready to send | `wsTasks()` through `wiOpen()`, ready and not `tkGraphBlocked()` | rollup over `tasks.tasks` and `tasks.task_dependencies` | none |
| In progress, and with a live run | `wsTasks()` in `sent` whose work order does not wait on you, `woLive()` | `tasks.work_order_tasks` and `tasks.work_orders` by state | none |
| In review | `wiInReview()`: a `sent` item whose work order is `waiting on you` | `tasks.work_orders` in `waiting on you` | none |
| Pending approvals | `APPROVALS` pending in the workspace, through `apState()` | `list_approvals` | shipped |
| My work | `wiMine()`, `apMine()` | the owner's member mapping, the work order's sender, and the approvers an approval names | none: `list_approvals` names no approver |

### Logic
1. `workStats()` draws the cards under the header on every Work tab, from the same rows the tabs render.
2. `S.workScope` holds the scope, `all` by default. It holds as you move between tabs, and it is session state, not a route segment.
3. My work counts a work item whose owner is mapped to you or whose work order you sent (`wiMine()`), and an approval whose approvers name you (`apMine()`).
4. Open counts items in no work order that are neither accepted nor closed. Its caption counts the `ready` ones the graph does not block: "3 ready to send".
5. In progress counts `sent` items whose work order does not wait on a person. Its caption counts those with a live run: "3 with a live run".
6. In review counts `sent` items whose work order waits on a person to accept. Its caption reads "waiting on a person to accept", or "waiting on you to accept" in My work.
7. Pending approvals counts the workspace's pending approvals and turns the approval colour above zero. Its caption reads "calls waiting on an approver", or "calls you can approve" in My work.
8. Each card is a button with an `aria-label` naming where it goes.
9. The Open, In progress and In review cards carry `data-future`, because no contract stores a work item or a work order today.

### States
A build renders the three work cards as `not recorded` until `list_tasks` and `list_work_orders` ship. A workspace with no connected provider and no written work item (the demo's `finops`) shows the empty Backlog panel instead of the scope switch and the cards. On a phone the cards sit two by two.

## Tabs

The tab bar switches between Backlog, Work orders, Workflows and Findings, and counts what waits on a person in each.

### Purpose
You want to know which part of Work needs you before you open it. A number on a tab means something there waits on a person. No number means nothing does. The tabs are shared by all four Work pages, so this section answers the tab bar on each.

### Rationale
D1 names the four tabs, and D9 moved Findings from Spend into Work, because a finding becomes work when a person picks it up. A count appears only where something waits on a person, the same rule the sidebar follows (`fleet-operations-ia.md`, Workspace navigation). Workflows carries no count because nothing about a workflow waits on you on this page. Each tab is a path segment, so every tab has an address and survives a reload.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Backlog count | `tkWaiting()` over `wsTasks()` | rollup over `tasks.tasks` in `draft` or `changed` | none |
| Work orders count | `woWaiting()` over `wsWorkOrders()` | `tasks.work_orders` in `waiting on you` | none |
| Findings count | `findingsOpen()` over `FINDINGS` | `list_findings` open, minus the findings a work item carries | partial |
| Sidebar Work count | `tkWaiting()` + `woWaiting()` | the same rollups | none |

### Logic
1. `pWork()` draws the tab list from `WORK_TABS` with `role=tablist` and `aria-label` "Work". The selected tab carries `aria-selected="true"`.
2. The counts come from one object: backlog `tkWaiting()`, orders `woWaiting()`, workflows 0, findings `findingsOpen().length`. A zero draws no number.
3. Each number carries a title: "7 to certify", "1 to accept", "36 open".
4. A tab calls `go(workHash(tab))`: `/work`, `/work/orders`, `/work/workflows`, `/work/findings`.
5. On the first run the tabs still draw, and every count reads off the one smoke run, so none shows.

### States
The tab bar appears in the loaded state only. On a phone the strip scrolls sideways inside itself and the page never does.

## Changed banner

The banner names a certified work item whose provider text changed after certification, and opens it for review.

### Purpose
A work item you certified last week was edited upstream this morning. Its definition of done may no longer match, so it has left ready, and you need to know before you wonder why you cannot send it. The banner says how many items changed, names the first with its time, and **Review changes** opens that item, where the old and new text sit side by side.

### Rationale
A certification binds a list of items to one version of the work item (`tasks-spec.md` §8.5). When the provider changes the subject, the description or the labels, that binding breaks, and the item moves to `changed`. Oxagen never re-certifies on a person's behalf, and the assistant never certifies at all. The banner exists because the change happens outside Oxagen, in the tracker, where nothing would otherwise tell the person on this page. The text is record data: the number, the time, and the state.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Changed items | `wsTasks()` where `ready==="changed"` | readiness derived from the certification and the provider version | none |
| Number and edit time | `changed[0].num`, `.updatedAt` | `tasks.tasks` | none |

### Logic
1. `backlogTab()` filters the rows to `changed`. With none, no banner draws.
2. The badge reads `changed`. The bold line reads "1 work item changed after certification", plural past one.
3. The body names the first changed item and its update time, and says it is no longer ready and needs certifying again to send.
4. **Review changes** goes to `taskUrl(changed[0])`, the work item page, which shows the Certified against and Now panels.
5. A comment, an assignee change, or a status change inside one category does not mark an item `changed`.

### States
Loaded only. On a phone the badge, the text and the button stack.

## Backlog

The Backlog panel lists every work item in the workspace with its readiness, and is where you select the ready ones to send.

### Purpose
You want to see every work item, whether it can go to an agent now, and where the ones already sent went. Each row answers that: provider and number, labels, status, blockers, owner, readiness and work order. You tick the ready rows and send them with **Send to an agent…**. The List view reads row by row. The Graph view draws the same open items by dependency, so you can see what must land first.

### Rationale
A ready item goes to an agent only inside a work order, and only to an agent you operate (D2, `tasks-spec.md` §9). Readiness is how Oxagen keeps a person between the tracker and the agent. `oxagen.assistant` drafts a definition of done for every work item a provider imports or a finding opens. A person certifies it, and the item is ready from that moment. That sentence once sat in a note under the table. It lives here now. The Blocked by column and the Status column stay apart because the provider's `blocked` status and the graph's blocked reason are different facts (`work-graph-spec.md` §5.1). A blocked ready item can still be selected, because its work order queues until the blockers finish. The Graph exists because order lives in a person's head otherwise: sending the handler before the migration spends the cap on nothing.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Number, subject, provider, labels, status, owner, updated | `TASKS`, `TLABELS`, `TSTATUS`, `TPEOPLE` (`fixtures/tasks.json`) | `tasks.tasks`, `tasks.task_labels`, `tasks.field_settings`, `tasks.provider_people`; `list_tasks` | none |
| Item written in Oxagen | `TASKS` kind `oxagen`, `finding` | `tasks.tasks` with its finding | none |
| Readiness and the checkbox rule | `TASKS[].ready`, `tkSelectable()`, `tkWhyNot()` | `tasks.dod_certifications`; `certify_task_dod` | none |
| Blocked by and the Graph layers | `TASKS[].blockedBy`, `tkLayers()` | `tasks.task_dependencies`; `get_work_graph` | none |
| Queued in a work order | `TASKS[].queued`, `tkQueuedWo()` | `tasks.work_orders` in `queued` | none |
| Work order and `live` | `TASKS[].wo`, `woLive()` over `RUNS` | `tasks.work_order_tasks`; the run's parent work order | none |

### Logic
1. `backlogTab()` reads `wsTasks()`: the items of connected providers plus items written in Oxagen. With no row and no provider it draws one panel, "No issue tracker is connected to this workspace", with **Connect an issue tracker** (gold).
2. The List view draws one row per item. `wiLogo()` shows the provider logo, or the Oxagen mark titled "Written in oxagen". `lblChips()`, `tStatusBadge()`, `tkBlockedByCell()`, `tkPerson()` and `readyBadge()` fill the cells. `tkReadySub()` adds "blocked by #612, #618" or "queued in wo_01K6TB2X" under a ready badge.
3. `tkSelectable()` enables a checkbox when readiness is `ready`, the status category is `open`, and no queued work order holds the item. A disabled checkbox carries `tkWhyNot()` as its title: blocked upstream, still drafting, a draft, changed since certified, already in a work order, already queued, accepted, or closed upstream.
4. `tkToggle()` writes `S.tsel`. The panel header then shows "N selected" and **Clear**. A row click opens the item, and a click on the checkbox does not.
5. **List** and **Graph** set `S.tkView`. `tkGraph()` keeps open items only, and `tkLayers()` places each in a column by its longest path of open blockers among the rows drawn. Unblocked items sit in layer 0. A line joins each blocker to the item it blocks, in the rule colour, and the lines into a selected item take the approval colour. `tkGraphCard()` repeats the checkbox rule.
6. The shared list bar (`listify()`) adds search, the Status, Labels and Blocked by facets, Rows and the pager, and sorts every column.

### States
A build shows `not recorded` for every Work field until `list_tasks` ships. On a phone the table becomes labelled cards with the checkbox on top, and the Graph becomes a list by layer with a "Layer N" heading between groups.

## Send menu

The send menu lists the agents you operate and the published workflows, and picking one opens the work order dialog.

### Purpose
You have selected ready work items and want to choose who does them. The menu lists every agent in this workspace where you are the registered operator, each with its harness, host and tier, and every published workflow whose stages are all agents you operate. Search narrows both lists. Picking a row opens the work order dialog with that target.

### Rationale
Work reaches an agent only through a person who answers for it. The sender must be the agent's registered operator (`tasks-spec.md` §9.2), so the menu never lists an agent somebody else operates. The menu once carried a caption under its header, "agents where you are the registered operator". The group label "Agents you operate" already says it, so the rule lives here. Every harness shows its own mark and none is listed first by default (ADR-101). The design adds a checkbox per row and **Continue**, so one send can go to several targets as one work order per target (`work-graph-spec.md` §7). The mockup does not draw those checkboxes.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agents you operate | `myAgents()` over `AGENTS` (`operator`) | `list_agents` `operatorId` | live |
| Harness mark, host, tier | `AGENTS[].harness`, `.host`, `.tier` | `list_agents` | live |
| Published workflows you may send to | `WORKFLOWS` through `wfSendable()` | `.oxagen/workflows/*.toml` | none |

### Logic
1. `dispatchButton()` stores the selection in `S.dspIds` and toggles the `dispatch` layer. `dispatchMenu()` draws the menu with `role=menu` and `aria-label` "Send to", headed "Send 2 work items to".
2. `dspList()` filters `myAgents()` and the workflows `wfSendable()` accepts by `S.dsq`. `wfSendable()` keeps a workflow that is published and whose every stage agent has you as its operator, so a workflow that names somebody else's agent is never offered. `dsqIn()` repaints the list without a render, so the caret stays.
3. `myAgents()` puts the seven seeded agents first (Bug fixer, Validator, Documenter, Architect, stella CI, Release manager, Triage), then the rest by name. The menu lists twelve, then "16 more. Type to narrow."
4. `dspAgentItem()` shows the harness mark, avatar, name, "<harness> · <host>" and `tierBadge()`. `dspWfItem()` shows the stage marks from `hxRow()` and "4 stages then you".
5. With no match: "No agent you operate matches." or "No published workflow matches."
6. A row calls `woOpen({kind,id})`.

### States
On a phone the menu opens at full width under the button and scrolls inside itself above the thumb bar.

## Work order dialog {#dialog/wo}

The work order dialog turns selected work items into one brief for one agent or workflow, and sends it or queues it.

### Purpose
You have picked a target and want to say exactly what the agent gets: which work items, what done means, the prompt, which repositories it may change, and how much it may spend. The dialog is one screen with six sections in that order. Nothing leaves until you confirm the repositories. The footer sends the work order, or queues it when a work item is still blocked.

### Rationale
A work order is the operator's brief (`tasks-spec.md` §9.3). Oxagen runs no agent (ADR-043): the runtime the agent is enrolled on starts the run from the brief (§9.6). One screen keeps every commitment in view before the send, and the send fixes all of it: a sent brief cannot change, and the SteeringFrames it emits carry its digest. The repository confirmation exists because a work order narrows what an agent may write and never widens it. Queueing exists because a person may send blocked work now and let Oxagen hold it (`work-graph-spec.md` §6). The dialog's section hints that explained these rules moved into the six section entries below.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Draft state | `S.wo` from `woOpen()` | `create_work_order` | none |
| Target list | `myAgents()`, `WORKFLOWS` through `wfSendable()` | `list_agents` `operatorId`; `.oxagen/workflows/*.toml` | partial |
| Merged definition of done | `woItemsFor()` | `tasks.dod_items`, `tasks.work_order_items` | none |
| Drafted brief | `woDraftPrompt()` | `create_work_order`, drafted by `oxagen.assistant` | none |
| Send | `woSend()` | `send_work_order`, a governed action | none |

### Logic
1. Three paths open it. The send menu and a ready work item's own **Send to an agent…** call `woOpen(target)` with `S.dspIds`. **Send again** on a stopped or expired work order calls `woRetry()`, which reopens it with the same items and target, keeps the brief as sent, and records `retryOf`.
2. `woOpen()` pre-checks the repositories the work items name, sets the cap to 12.00, and drafts the brief. With no selection it toasts "Select one or more ready work items first."
3. Title "Work order", subtitle "2 work items to Bug fixer" from `woTargetName()`.
4. The six sections follow in order: Work items, Sent to, Definition of done, Prompt, Repositories, Spend cap. Each has its own entry in this file.
5. The footer names `work_order.send`, then **Cancel** and the gold primary. `woCanSend()` enables it only when the repositories are confirmed, at least one is checked, a work item remains, and the brief is not empty. `woQueued()` turns the label into **Queue until unblocked** when any item is blocked.
6. `woSend()` creates the work order with its brief, digest, extra items, repositories, cap and target, in state `sent` or `queued` with an expiry. Each item moves to `sent` and names the work order, or holds it as `queued`. The sender lands on the work order page.
7. The gold toast reads "Work order <id> sent to Bug fixer. It starts when mbell-mbp-16 picks it up.", or "Work order <id> queued for Release manager. It is sent when #633 is done."

### States
A build needs `create_work_order` and `send_work_order` and leaves the dialog out until they ship. On a phone the dialog is a bottom sheet with a drag handle and full-width footer buttons.

## Work items in the work order {#work-backlog/wo-work-items}

The first section lists the work items this work order carries, one chip each.

### Purpose
You want to confirm which work items you are sending and drop one you picked by mistake. Each chip shows the provider logo, the number and the subject. A chip for an item the graph blocks adds "blocked by #612, #618". While more than one item remains, each chip has a remove button.

### Rationale
Each work item is tagged to this work order and shows it on its own page, in its Work orders panel and its History. That link runs both ways so a person can walk from the tracker's issue to the run that worked on it and back (`tasks-spec.md` §9.5). The dialog once carried that sentence as a hint. It lives here now. The blocked line stays on screen because it states the record: how many items are blocked, and when the work order expires if they stay so (`work-graph-spec.md` §6.1).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Chips | `S.wo.tasks` over `taskById()` | `tasks.work_order_tasks` | none |
| Blocked by | `tkGraphBlocked()`, `tkOpenBlockers()` | `tasks.task_dependencies` | none |
| Expiry date | `S.wo.expires` | `tasks.work_orders.expires_at` | none |

### Logic
1. The section draws one chip per id in `S.wo.tasks`, in selection order.
2. A blocked item's chip names its open blockers with `tkNum()`.
3. `woDropTask()` removes an item while two or more remain, and redrafts the brief when the person has not edited it.
4. `woBlockedLine()` draws "1 of 1 work item is blocked. Oxagen sends this work order when it is unblocked, and expires it on 2026-09-25 if it is not." when any item is blocked. The date follows the Expires field.

### States
On a phone the chips wrap and the remove buttons are 44 px targets.

## Target of the work order {#work-backlog/wo-sent-to}

The second section chooses the agent or workflow the work order goes to, and shows who that is.

### Purpose
You picked a target in the menu and may want another without starting over. The select lists the agents you operate, as "Name (Harness)", and a Workflows group of the published workflows. Under it you see the agent card, or the workflow's stage chain ending with you.

### Rationale
The select lists only agents where you are the registered operator, and the published workflows made of them. That hint once sat under the select. It lives here now. Every stage of a workflow must be an agent the sender operates (`tasks-spec.md` §10.4), and a workflow still in a pull request cannot be sent, because it exists only when it merges. The agent card shows the tier because every enforcement claim states the tier, and the repositories and cap hold only as far as that tier enforces them (§9.6).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agents | `myAgents()` | `list_agents` `operatorId` | live |
| Harness, host, tier | `AGENTS[]` | `list_agents` | live |
| Workflows and stages | `WORKFLOWS`, `stageChain()` | `.oxagen/workflows/*.toml` | none |

### Logic
1. The Workflows group lists the workflows `wfSendable()` accepts, the same rule as the send menu. The select's value is `agent:<key>` or `workflow:<id>`. `woSetTarget()` writes `S.wo.target`, clears the repository confirmation, and redrafts the brief unless the person edited it.
2. For an agent the section draws its harness mark, avatar, name, "Claude Code on mbell-mbp-16", its tier badge and `operator: you`.
3. For a workflow `stageChain()` draws each stage with its role, agent, tier and owned tags, and a last **Accept** card by You.
4. The dialog subtitle follows the target.

### States
On a phone the stage chain stacks one stage per row without arrows.

## Definition of done in the work order {#work-backlog/wo-definition-of-done}

The third section merges the certified items of every work item into one numbered list, and takes items for this work order only.

### Purpose
You want one list of what done means for the whole send, without duplicates. Each row shows the item, its tag, a chip per work item it came from and, in a workflow, the stage that owns it. You can add an item the work items do not carry.

### Rationale
Certified items are read-only here, because a person certified them on the work item and the digest covers them (`tasks-spec.md` §9.3). Two work items that ask for the same thing produce one row with two chips, so an agent claims it once. An item you add here is certified by your send and belongs to this work order only. That hint once sat under the input. It lives here now. In a workflow a stage owns the items whose tags it lists, and an item no stage lists falls to the last agent stage.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Merged items | `woItemsFor()` over `TASKS[].dod` | `tasks.dod_items`, `tasks.work_order_items` | none |
| Extra items | `S.wo.extra` | `tasks.work_order_items` | none |
| Owning stage | `woOwner()` | `tasks.work_order_stages` | none |

### Logic
1. `woItemsFor()` walks each work item's items in order. It keys each item by its lower-cased text with whitespace collapsed. A repeated key adds the work item to the existing row's sources.
2. The hint reads "8 items from 2 work items. Certified items are read-only here."
3. `woAddItem()` appends the input's text to `S.wo.extra` and redrafts the brief unless edited. An empty input toasts "Write the item first." An added item carries the chip "work order".
4. `woOwner()` returns the first stage whose `owns` holds the item's tag, or the last stage.

### States
On a phone the rows wrap their chips under the text.

## Prompt in the work order {#work-backlog/wo-prompt}

The fourth section holds the brief the agent receives, drafted by `oxagen.assistant` and yours to edit, with `@` references.

### Purpose
You want the agent's first prompt to say what you mean. The draft names the work items and links, the merged definition of done, the workflow stages, the repositories and the branch, how to claim an item, and the release rule. You edit it, type `@` to reference a Steering record or an agent profile, and see every reference resolved below the box.

### Rationale
The brief is the operator's (`tasks-spec.md` §9.3). The label says `drafted by oxagen.assistant` until the first keystroke and `edited by you` after, so nobody mistakes a draft for a person's words. A record mention enters the brief as the record's statement. A profile mention enters as the agent's name, harness and job, and grants that agent nothing: work reaches another agent only through a workflow stage (§9.4). The hint once said so. It lives here now. The mention list repaints two regions and never re-renders the dialog, so typing never moves the caret.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Drafted brief | `woDraftPrompt()` | `create_work_order` | none |
| Steering record mentions | `RECORDS` in `mentCands()` | `list_records`; the mention grammar | partial |
| Agent profile mentions | `AGENTS` in the workspace | the mention grammar's `agent` type | live |

### Logic
1. `woDraftPrompt()` writes the brief from the items, `woItemsFor()`, the stages, the repositories and the branch `wo/<last six of the first id>`. It ends with the `claim_dod_item` instruction and "Follow @ctx.release.never-merge."
2. **Draft it again** calls `woRedraft()`, which replaces the text and clears `edited`.
3. `woPromptIn()` stores the text, sets `edited`, and finds an `@` before the caret. `mentListHtml()` lists up to eight matches from `mentCands()`, with `role=listbox`.
4. Enter or Tab inserts the first match, a click inserts any, and Escape closes the list (`mentKey()`, `mentPick()`).
5. `mentRefs()` lists each resolved mention under **References**: a record with its kind glyph and token cost, a profile with its harness and avatar, or `@<id>` "not found". A mention still being typed is not flagged.

### States
With no mention: "No references yet. Type @ to add a Steering record or an agent profile."

## Repositories in the work order {#work-backlog/wo-repositories}

The fifth section chooses the repositories the work order may change and asks you to confirm them.

### Purpose
You want to limit where the agent may push. The section lists the workspace's main and linked repositories, pre-checked from the work items, each with its production branch. You untick any you do not want, then tick **I confirm the repositories**, which names the agents and the repositories.

### Rationale
The section once opened with "The repositories this work order may change." and the confirmation ended with "Nothing is merged without a person." Both moved here. A work order narrows what an agent may write and never widens it: a repository outside the agent's toolbelt shows disabled, with the reason (`tasks-spec.md` §9.3). Branches and pull requests only: the brief tells the agent never to push a production branch and never to merge. A person merges every pull request. The confirmation exists because the repository list is the one limit a send cannot take back. The limit holds as far as the agent's tier enforces it: refused on `gateway` and `contained`, a hook on `harness`, recorded only on `observe` (§9.6).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Main and linked repositories | `wsRepos()` | `list_repositories`; `ingestion.repository_binding_heads` | live |
| Toolbelt write grant | the `grant` constant in `DLG_EXT.wo` | the repositories an agent's toolbelt may write | none |
| Confirmed list | `S.wo.repos`, `S.wo.confirm` | `tasks.work_orders` | none |

### Logic
1. The section lists `wsRepos()` rows whose role is `main` or `linked`: "main repo · production branch main" or "linked repo · production branch <branch>".
2. The mockup's `grant` constant allows `a-intel/platform` and `a-intel/billing`. Any other repository is disabled with "· outside Bug fixer's toolbelt".
3. `woRepo()` toggles a repository, clears the confirmation, and redrafts the brief unless edited.
4. The confirmation checkbox is disabled with no repository checked. `woConfirm()` sets it and repaints the send button.

### States
A build reads the toolbelt's write grant, which no contract carries today. On a phone each checkbox runs full width.

## Spend cap in the work order {#work-backlog/wo-spend-cap}

The sixth section sets a USD cap for the whole work order and, when an item is blocked, the date a queued work order expires.

### Purpose
You want a ceiling on what this send may cost across every stage and every return. The field takes US dollars, default 12.00. When any item is blocked, **Expires** follows, the date after which Oxagen stops waiting.

### Rationale
The cap covers the work order, and each run also stays inside its own agent's per-run budget, shown in the hint (`tasks-spec.md` §9.3). The Cursor warning appears because Cursor's model calls do not pass through the Oxagen gateway, so the cap cannot count that stage. Stating the gap is the honest claim. A queued work order that is still waiting on its expiry date expires, and its work items go back to ready. That hint once sat under the date. It lives here now. The expiry keeps a queued send from holding work forever (`work-graph-spec.md` §6.4).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Cap | `S.wo.cap` | `tasks.work_orders` cap | none |
| Per-run budget | `AGENTS[].budget` | a per-run budget per agent | none |
| Expires | `S.wo.expires`, `woExpiresField()` | `tasks.work_orders.expires_at` | none |

### Logic
1. The cap input writes `S.wo.cap` on change.
2. The hint names the first agent's budget, "$2.00 per run" by default.
3. When `woAgentsOf()` finds a Cursor agent, the warning "Cursor is not metered." draws.
4. `woExpiresField()` draws only while `woQueued()` is true. The date defaults to 2026-09-25, 14 days from the send, and allows 2026-09-12 to 2026-12-10, at most 90 days.
5. Expiry runs once a minute in the build, records `work_order.expired`, and returns the items to `ready`.

### States
A build leaves the field out until the cap is stored. `set_spend_budget` sets organization and workspace ceilings only.
