# Work order

<!-- work-order: one work order, dispatched or direct, and the four dialogs its header opens -->

## Header

The header names the work order, says who sent it or why Oxagen opened it, and carries the actions its state allows.

### Purpose
You arrive from the Work orders tab, from a work item, from a run, or from the toast after a send. The first questions are which work order this is, who sent it to whom, and what you can do with it now. The eyebrow gives the id and the kind. The h1 gives the title. The subtext gives the sender, the time and the target. The actions on the right are the only controls on the page that change the work order itself.

### Rationale
A run is a child record of exactly one work order (D2), so every run in the workspace leads here, including a run an operator started from their own terminal. That is why the page has two kinds. A dispatched work order is one a person sent from Work. A direct work order is the one Oxagen opens at a run's first frame, titled from the run's task reference or first prompt, with the run's operator as its sender (wedge spec, Work › Objects). The kind badge keeps the two apart, because a direct work order has no brief and no definition of done and must not look as if it had. The action set follows the state because each action is only safe in some states: Withdraw applies before the start receipt, Stop after it, and Send again only once nothing can start (`docs/work-graph-spec.md` §6.2, §6.4, §7.4).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Id, kind, title, sender, time, target | `WORKORDERS[]` (`fixtures/tasks.json` `workOrders`), or `fileDirect()` over `RUNS` | `tasks.work_orders`; `get_work_order` | none |
| Direct sender and task reference | `R.op`, `R.task` | `operatorName` with `operatorAttribution` (`run.list.ts:242-260`); `taskRef` (`run.list.ts:285-291`) | partial |
| Send index, retry links | `woSubMore()` over `SENDS`, `retryOf`, `retriedAs` | `tasks.sends`, `tasks.work_orders` `retry_of` | none |
| Copy brief | `woPromptText()`, `copyWoPrompt()` | `get_work_order` | none |
| Stop | `woStop()` | `stop_work_order` through `dispatch_command` (`tacho.command.dispatch.ts:107-134`) | partial |
| Accept all items | `woAccept()` | `accept_work_order` | none |
| Attach to a work item | none | attaching a direct work order to a backlog item | none |

### Logic
1. `pWorkOrder()` looks the id up with `woById()`. An unknown id renders "No work order has this id" with **Back to work orders**.
2. The eyebrow holds the id in mono and `woKindBadge()`: `dispatched` titled "A person sent it from Work", or `direct` titled "Oxagen opened it for a run started outside Oxagen", marked future-only.
3. The subtext has three forms. Direct: "Oxagen opened it on <time> for a run <operator> started outside Oxagen", plus the task reference when the run has one. Queued: "Queued by <sender> on <time> for <target>. It is sent when <blockers> is done, or expires on <date>." Otherwise: "Sent by <sender> on <time> to <target>." `woSubMore()` appends "1 of 2 in send snd_…", "Retries wo_…" or "Retried as wo_…".
4. **Copy brief** shows on every dispatched work order. `woPromptText()` copies the brief as sent, then References: the work order with its link and digest, each work item with its provider link and Oxagen link, and the pull request.
5. The actions follow `w.status`. `queued` shows **Send now** (opens `worelease`) and **Withdraw** (opens `wowithdraw`). `sent` with no start receipt and no run shows **Withdraw**. `stopped` or `expired` shows **Send again**, which calls `woRetry()` and opens the work order dialog with the same items, target, brief and repositories, unless the work order was already retried. Any other open state shows **Stop work order** (opens `wostop`).
6. A dispatched work order then shows **Accept all items**, gold only when every item is claimed and the work order is open, otherwise disabled with the title "Every item must be claimed first". A direct work order shows **Attach to a work item**, disabled, with the title "A direct work order has no definition of done until you attach it to a backlog item".

### States
Loaded only in this design. Loading, error and denied replace the page with the shell's panels, and denied names `work_order.read on core-platform`. On a phone the actions wrap and the gold one keeps its own line. A build leaves out **Copy brief**, **Accept all items** and **Attach to a work item** until their contracts ship, and renders the header fields as `not recorded`.

## Tiles

Four tiles give the work order's state, how many items the agents claimed, how many a person accepted, and what it has spent.

### Purpose
You want to know in one glance whether this work order needs you. State says where it is. Items claimed and Items accepted say how close it is to done. Spend says what it has cost so far against its cap.

### Rationale
A work order is done when a person accepts every item (wedge spec, Work › Objects), so the two item tiles carry the whole progress story: claims are the agents' word, acceptances are a person's. They sit side by side so nobody reads a claim as an acceptance. Spend adds the runs' own costs and leaves each run on its own basis, because a work order can mix a gateway-observed run with a client-attested one, and a sum must not claim a basis its parts lack. Every tile is a rollup of a panel below it: the item tiles count the Definition of done rows, and Spend sums the Runs panel.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| State and its caption | `w.status`, `WO_ST`, `woStageWords()`, `woWaitsOnText()` | `tasks.work_orders` state | none |
| Items claimed | `woClaimed()` over `w.claims`, `woItems()` | `tasks.item_claims`, `tasks.work_order_items` | none |
| Items accepted | `w.claims[].ok` | `tasks.item_claims` accepted | none |
| Spend | `woSpend()` over `RUNS[].cost` | each run's cost and basis (`run.list.ts:277`) | partial |
| Cap | `w.cap` | `tasks.work_orders` cap | none |

### Logic
1. State shows `woBadge(w)`, one of Queued, Sent, In progress, Waiting on you, Sent back, Parked for you, Stopped, Expired, Accepted or Closed.
2. The State caption reads "waits on #633" while queued, "expired on <date>" after expiry, "every item is claimed" while waiting on you, "Accepted on <date>" once accepted, and "one run, started outside Oxagen" on a direct work order.
3. Otherwise the caption is `woStageWords()`. `woActiveStages()` finds every stage whose latest run is live. Two live stages read "stages 2 and 3 of 4". One reads "stage 1 of 1". With none live, it falls back to `w.stage`.
4. Items claimed reads "3 / 4" from `woClaimed()` over `woItems()`, or "none" when the work order has no items. Its caption is "by the agents, with evidence".
5. Items accepted counts claims with an `ok`, as "0 / 4" or "none", captioned "by a person".
6. Spend is `woSpend()`, the sum of each run's `cost`, or "$0.00". With a cap the caption reads "of a $10.00 cap · the runs' own basis". Without one it reads "across its runs, each on its own basis".
7. The whole row is marked future-only.

### States
On a phone the tiles sit two by two. A build renders each tile as `not recorded` until the work order record ships. Spend is the one tile a build could partly fill today, from the runs' costs, once a run names its work order (wedge spec, Open decisions 5).

## Stages

The stage chain shows who has the work now: one card per stage, then a last card where a person accepts.

### Purpose
You want to see the path the work takes and where it is on that path. Each card names a role, the agent that fills it, the agent's tier, and the stage's latest run. The outline tells you which stage is running now and whether the work waits on you.

### Rationale
A workflow runs nothing itself. Oxagen sequences a work order through the stages, and each stage is its own run by its own agent on its own runtime (`docs/tasks-spec.md` §10.3). The chain draws that sequence from the file and nothing else, so the page never draws an order the file did not name. Stages that name the same `needs` run beside each other as separate runs under one cap, and the chain puts them in one column (`docs/work-graph-spec.md` §8.2). The last card is always a person, because every item is accepted by you and every pull request is merged by a person. Each card shows the agent's recorded tier, because a repository limit or a cap holds only as far as that tier enforces it. A work order sent to one agent draws one stage, so a single agent and a workflow read the same way.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Stages, roles, what each owns, `needs` | `WORKFLOWS[].stages` | `.oxagen/workflows/*.toml`, `tasks.work_order_stages` | none |
| Layers | `wfDepths()`, `stageNeeds()` | `tasks.work_order_stages` `needs` and state | none |
| Agent harness, name and tier | `AGENTS[]` | `list_agents` (`agent.list.ts:24-31`, `:63`, `:83`) | live |
| Latest run per stage | `w.runs[]` by `stage` | a `work_order_id` and a stage on each run | none |

### Logic
1. `pWorkOrder()` reads the workflow with `wfById()`. A work order sent to one agent gets a one-stage workflow built on the spot: its role is the agent's name, and it owns every tag in `DOD_TAGS`.
2. `stageChain()` draws each card with its step number, its role, the harness mark, the avatar, the name and `tierBadge()`.
3. `stageNeeds()` returns a stage's `needs`, or the stage before it when it names none, so a `oxagen-workflow/v0.1` file draws as a straight line. `wfDepths()` puts each stage one layer after the deepest stage it needs. Stages in one layer share a column, and a card that needs two stages adds "after Validate and Document".
4. The `stSub` closure writes each card's sub line from the stage's latest run: `Running` and the run link while live, `Sent back` when that run returned the work, `Done` otherwise, and "2 runs" when the stage ran more than once. A stage with no run reads "Waiting".
5. The `stState` closure outlines the cards. Accepted marks every card done. The Accept card is outlined while every item is claimed. Queued, stopped and expired outline nothing. Otherwise a live stage is outlined in gold, a sealed stage that did not return the work is marked done, and a work order with no run yet outlines its current stage.
6. The Accept card reads "a person accepts every item", by You.
7. On `wo_01K6T9QX`, Validate and Document share a column after Fix, and Review follows both.

### States
A queued work order draws every stage "Waiting". A direct work order draws one stage and the Accept card. A build draws the Accept card only once the work order holds items. On a phone the chain stacks one card per row without arrows. A build renders the stages as `not recorded` until the workflow file and the stage record ship, and keeps the agent's name and tier, which ship.

## Runs

The Runs panel lists every run this work order started, with its stage, agent, status, tier, cost and start.

### Purpose
You come to a work order to stop or steer what it is doing, and you do that on a run. This panel is the door: one row per run, and a row opens the run page, where Pause, Steer and Cancel live. It also answers how many attempts the work took and what each one cost.

### Rationale
Each is a child record of this work order: a run belongs to exactly one work order (D2), and this panel is where that parent-child link is visible from the parent's side. The Fleet page's runs table retired into this panel and each agent's Activity tab (D3). The panel shows tier and basis on every row because an enforcement claim states its tier and a money figure states its basis. The Runs heading is a count and nothing more, so the page never says a run is healthy or wasteful. That judgment belongs to the run page and its evidence.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Run id, title, agent, status, tier, cost with basis, start | `RUNS` by id, `run()`, `runStatus()` | `list_runs`, `get_run` (`run.list.ts:234-426`, `:477`) | live |
| Which runs belong to this work order, and each one's stage | `w.runs` | a `work_order_id` and a stage on each run | none |
| Sent back | `w.runs[].returned` | `tasks.work_order_stages`; `return_work_order` | none |

### Logic
1. `woRunsPanel()` in `wedge.js` builds one row per entry in `w.runs`, in the order the work order records them.
2. The subtext is the count, "1 run." or "4 runs.".
3. Run shows the id as a link to the run and the run's `taskTitle` under it. A run the fixtures do not hold shows its id in plain mono and the row does not open.
4. Stage shows the stage's role, with "sent back" when that run returned the work to an earlier stage.
5. Agent shows `agentCard()` in its list layout.
6. Status shows `statusBadge(runStatus(R))`, or the work order's own record of the run (`live` or `sealed`) when the run is not in view.
7. Tier shows `tierBadge()`. Cost shows the run's cost in USD with its basis under it. Started shows `runDay()`.
8. A row click goes to `#/<org>/<ws>/runs/<run>`.

### States
With no run yet, the panel reads "No run yet. The runtime starts the first one with `oxagen work start <id>`.", because Oxagen runs no agent and the runtime starts the harness with the brief as its first prompt (`docs/tasks-spec.md` §9.6). On a phone the table becomes labelled cards. A build can fill every cell but Stage from `list_runs` today. It cannot yet say which runs belong to this work order.

## Definition of done

The Definition of done panel lists every item the work order must meet, where each came from, which stage owns it, and whether it is claimed or accepted.

### Purpose
You want to know what done means for this work order and how far the agents got. Each row is one item: its text and tag, the work items it came from, the stage that owns it, its state, and the evidence behind a claim. When every row reads claimed, you can accept the work.

### Rationale
A work item is ready only when a person certifies its definition of done (`docs/tasks-spec.md` §8). A work order merges the certified items of every work item it carries into one list, one row per distinct item, so two work items that ask for the same thing produce one row with two sources. A claim is the agent's word: `claim_dod_item` with the item and its evidence, shown with the agent and the run that made it (§11). The page never shows a claim as accepted. Accepting is a person's act, and it happens only in the accept dialog. The Stage column exists because in a workflow each stage owns the items whose tags it lists, and an item whose tag no stage lists belongs to the last agent stage.

A direct work order has no definition of done until you attach it to a backlog item. Oxagen opened it for a run nobody sent, so nobody certified anything for it.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Items and their tags | `woItems()`, `woItemsFor()` over `TASKS[].dod` and `w.extra` | `tasks.work_order_items` | none |
| Source work items | `it.from` | `tasks.work_order_items` sources | none |
| Owning stage | `woOwner()` over `WORKFLOWS[].stages[].owns` | `tasks.work_order_stages` | none |
| State and evidence | `w.claims[]` (`by`, `run`, `ev`, `ok`) | `tasks.item_claims`; `claim_dod_item` | none |

### Logic
1. `woItems()` calls `woItemsFor()` with the work order's tasks and its extra items.
2. `woItemsFor()` walks each work item's `dod` in order. It keys each item on its text in lower case with the spaces folded. A repeated key adds the work item to the existing row's `from` list.
3. Each item the send added (`w.extra`) becomes a row with the tag `code` and the chip "work order".
4. The subtext reads "4 items from 1 work item.", counted from the rows and the tasks.
5. Item shows the text and its tag chip. Work item shows each source number with the `a-intel/platform` prefix cut, so it reads "#482".
6. Stage shows the role `woOwner()` returns: the first stage that owns the item's tag, or the last stage when none does.
7. State reads `Accepted` when the claim at that index carries `ok`, `Claimed` when a claim exists, and `Open` otherwise. Claims are stored by item index.
8. Evidence shows the claim's text, then the agent's name and the run in mono, or a dash.
9. The table does not page.

### States
A direct work order with no work item attached shows "None." in the panel. `wo_01K5RQ4B9C7XTN2P` is the exception in the mockup: its run's task reference names #482, so `fileDirect()` attaches that item and the table shows its four items, all `Open`. On a phone the table becomes labelled cards. A build renders the panel as `not recorded` until the item and claim records ship.

## Handoffs

The Handoffs panel lists each stage run in order, with the note it handed to the next stage or the reason it sent the work back.

### Purpose
In a workflow the work passes between agents, and you want to read what each one said when it passed it on. Each line names the stage, the run and its note. A line that reads "sent the work back" tells you a later stage found an earlier item unmet.

### Rationale
A stage hands off with `hand_off_work_order` and a note, and Oxagen sends the next stage its brief with that note attached (`docs/tasks-spec.md` §10.3). A handoff note reaches the next stage as quoted evidence. It is never an instruction to that agent. That rule stops one agent from steering another through a note. The note enters the next run as a `context` SteeringFrame with the work order, the stage and the prior run as its provenance (wedge spec, Steering › Emissions). A stage that finds an earlier stage's item unmet calls `return_work_order`, up to the number of returns the file allows. When a stage exhausts its returns, the work order parks for the operator in the Approvals drawer. This panel is the only place on the page that shows those notes, so a person can check what each agent claimed it passed on.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Stage runs in order | `w.runs[]` | `tasks.work_order_stages` | none |
| Note and return | `w.runs[].note`, `.returned` | `hand_off_work_order`, `return_work_order` | none |
| Run link | `runLink()` | `list_runs` | live |

### Logic
1. `pWorkOrder()` draws one line per entry in `w.runs`.
2. Each line names the stage's role, with "sent the work back" when the run returned the work.
3. `runLink()` links the run id when the run is in view, and prints it in mono when not.
4. The note follows, or "Running" when the run has none yet.
5. A stage that needed two stages lists one line per upstream run, each with its own note, stage and run (`docs/work-graph-spec.md` §8.2).

### States
A direct work order has one run and no handoff. The mockup still draws the panel there, with the run and "Running" even once the run is sealed. A build leaves the panel out of a direct work order. A queued work order has no run, so the list is empty. A build renders the notes as `not recorded` until `hand_off_work_order` ships.

## Order

The Order panel lists the work order's work items in the order the dependency graph implies.

### Purpose
When one work order carries several work items that depend on each other, the agent should finish them in order. This panel shows that order, which item comes after which, and, while the work order is queued, which blockers outside it it waits on.

### Rationale
Dependencies between work items come from the provider or from a person adding them in Oxagen (`docs/work-graph-spec.md` §4). A send may carry an item and its blocker together, and then the order inside the work order matters to the agent. The agent reads the same order through `get_work_graph` for one work order (§10). While the work order is queued, the panel also names the blockers it waits on that are not in it, because those are what release it (§6.3). Nothing here ranks the items. The order is the graph's, and a layer holds items with no order between them.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Items and their layers | `woOrderPanel()`, `tkLayers()` over `TASKS[].blockedBy` | `get_work_graph` for one work order | none |
| Blockers inside and outside | `tkBlockers()`, `tkOpenBlockers()` | `tasks.task_dependencies` | none |

### Logic
1. `woOrderPanel()` returns nothing when the work order carries no work item. `pWorkOrder()` calls it only for a dispatched work order.
2. `tkLayers()` gives each item the length of its longest path of open blockers among the items drawn. Items sort by layer.
3. Each line shows the provider logo, the number with the `a-intel/platform` prefix cut, and the subject.
4. A blocker inside this work order adds "after #481".
5. While the work order is `queued`, an open blocker outside it adds "waits on #633, not in this work order".
6. A line with neither reads "first".
7. One item with no dependency reads "No order among these work items." in place of the list.
8. The panel is marked future-only.

### States
Absent on a direct work order. On a phone it sits under the main column. A build renders it as `not recorded` until `get_work_graph` ships.

## Send

The Send panel lists every work order of one send side by side: the same work items sent to several targets, one work order per target.

### Purpose
When a person sends the same work to two agents to compare them, you want to see both in one place. This panel lists each sibling's target, state, items claimed and cost, with the current one marked, so you can choose which one to accept.

### Rationale
A send to several targets creates one work order per target, each with the same items, the same brief, the same repositories and its own cap (`docs/work-graph-spec.md` §7.1). Each is its own record with its own state, runs and claims, because one target's success must not hide another's failure. The reason to send to two agents is to compare them: the same brief on Claude Code and on Codex produces two pull requests and two claims lists, and a person accepts one (§7.2). The panel shows cost and claims side by side and reports nothing else. It carries no rank, no score and no winner, because the record shows what each did and the choice is a person's. Accepting one stops its siblings (§7.3).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The send and its work orders | `SENDS` (`fixtures/tasks.json` `sends`), `woSend_()`, `woSiblings()` | `tasks.sends`; `get_send` | none |
| Target, state, items claimed | `woTargetCell()`, `woBadge()`, `woClaimed()` | `tasks.work_orders`, `tasks.item_claims` | none |
| Cost and basis | the latest run's `cost` and `basis` | each run's cost (`run.list.ts:277`) | partial |

### Logic
1. `woSendPanel()` returns nothing unless the work order carries a `send`. On the demo record only `wo_01K6TC5A` and `wo_01K6TC5B` render it, both of send `snd_01K6TC59`.
2. The subtext is the send id in mono.
3. One row per work order of the send, in send order: Target, State, Items claimed as "2 / 4", and Cost from the work order's latest run with its basis under it, or "not recorded".
4. The row of the work order on screen carries `aria-current`.
5. A row click opens that sibling.
6. No column sorts and no row is marked best.
7. The panel is marked future-only.

### States
Absent on a work order that is not part of a multi-target send, which is every send the mockup's send menu makes today. On a phone the table becomes labelled cards. A build renders it as `not recorded` until `tasks.sends` ships.

## Work items

The Work items panel lists each work item this work order carries, and links to it.

### Purpose
You want to go from the work order to the work it is about: the issue, its description, its certified definition of done and its history. Each line is one work item with its provider logo, number and subject, and opens the work item page.

### Rationale
A work order and a work item point at each other: the work item page lists every work order that carries it, and this panel lists every work item the work order carries. The copied brief and the copied work item prompt name each other the same way, so a pasted prompt leads from either to the other. A direct work order carries no work item until a person attaches one. Its run's task reference is the only link to work it has, so the panel shows that reference as recorded rather than inventing a match.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Work items | `w.tasks`, `taskById()` | `tasks.work_order_tasks` | none |
| Provider logo, number, subject | `TASKS[]`, `wiLogo()` | `tasks.tasks` | none |
| Direct work order's task reference | `w.ref` from `R.task` | `taskRef` (`run.list.ts:291`) | partial |

### Logic
1. `pWorkOrder()` draws one link per id in `w.tasks`, to `taskUrl()`.
2. Each link shows `wiLogo()` (the provider's logo, or the Oxagen mark for an item written in Oxagen), the number in mono and the subject.
3. With no work item, the panel reads "None attached." and, when the run recorded a task reference, "The run names `<ref>` as its task reference."

### States
On a phone the panel sits in the single column after the main column. A build renders it as `not recorded` until the work order record ships, and can show a direct work order's task reference today.

## Repositories

The Repositories panel lists the repositories this work order may change, and the pull request once one exists.

### Purpose
Before you accept, you want to know where the agent was allowed to write and where its work landed. The panel lists each repository the sender confirmed and names the pull request, which a person merges.

### Rationale
A work order narrows the repositories an agent may write and never widens them: the sender confirms the list in the work order dialog, and it cannot hold a repository outside the agent's toolbelt. The work order allows branches and pull requests only. The production branch is never pushed, and nothing is merged without a person. The limit holds only as far as the agent's tier enforces it (`docs/tasks-spec.md` §9.6). On `gateway` and `contained` a write to another repository is refused. On `harness` the refusal is a hook the harness reports, client-attested and fail-open against the person at the keyboard. On `observe` the write is recorded and nothing refuses it. Each stage card shows its agent's tier, so this panel never claims more than the tier enforces. The same limit reaches the agent as a `constraint` SteeringFrame of the send.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Repositories the work order may change | `w.repos` | the confirmed list on `tasks.work_orders` | none |
| Pull request | `w.runs[].pr` | `get_run_work` (`run.work.get.ts:127`) | live |
| A direct work order's repository | `runRepo()` over `R.task` | a run's recorded checkouts, `get_run_work` | none |

### Logic
1. `pWorkOrder()` draws one row per entry in `w.repos`, with the repository icon and the name in mono.
2. The note under the list reads "Branches and pull requests only."
3. When the latest run has a pull request, "Pull request `<number>`" follows.
4. For a direct work order, `fileDirect()` fills `repos` from `runRepo()`, which reads the repository from the run's task reference and falls back to the workspace's main repository.

### States
A direct work order confirmed no repositories. The mockup shows the repository its run's task reference names, with the same note. A build shows the checkouts the run recorded (`get_run_work`) without the note, because no work order set that limit. A build renders the dispatched list as `not recorded` until the work order record ships.

## Brief

The Brief panel shows the prompt the work order sent, exactly as sent, with its digest.

### Purpose
You want to read what the agent was told. The brief is the prompt the agent's runtime received as its first prompt, and the digest in the header lets you match it to the frames and to what the agent read through `get_work_order`.

### Rationale
The sender drafts and edits the brief in the work order dialog, and `send_work_order` records it with its digest (`docs/tasks-spec.md` §9.5). A sent brief cannot change. Nothing on this page edits it, and **Copy brief** copies the same text followed by its references. The rule matters because the SteeringFrames of the send carry this digest as their version: if the brief could change, the frames would no longer match the record. **Send now** on a queued work order is the one exception the record allows, and it appends one line the agent reads rather than rewriting anything.

A direct work order has no brief. The operator started the run from their own terminal, and the run's first prompt is on the run itself, in its transcript.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Brief | `woSentPrompt()` over `w.prompt`, or `woDraftPrompt()` | `tasks.work_orders` prompt | none |
| Digest | `w.digest` | `tasks.work_orders` digest | none |
| A direct run's first prompt | the run's transcript | `get_run_transcript` (`run.transcript.get.ts:397`) | live |

### Logic
1. The header shows the digest in mono, such as `sha256:5d0e81c27a4b9f36`.
2. `woSentPrompt()` returns the stored prompt, or a draft rebuilt with `woDraftPrompt()` for a fixture that stored none.
3. The brief renders in a monospace block, followed by "As sent."
4. A direct work order shows "None. Its first prompt is on the run." and no digest.

### States
On a phone the block scrolls sideways inside itself. A build renders the panel as `not recorded` until the work order record ships.

## SteeringFrames from this send

The panel lists the SteeringFrames the send put in front of the agent, each with this work order as its source.

### Purpose
You want to know exactly what the agent received from this work order, beside the Steering records and policies it received from elsewhere. Each line is one frame: its type, its text, and its hash. The run's Decision trace shows the same frames, with the same hashes, among everything else the run received.

### Rationale
A Steering Source and a SteeringFrame are two objects (D4). A work order is not a source a person maintains, but its send is a runtime input that emits frames: one `invocation` for the brief, one `goal` per work item, and one `constraint` per definition-of-done item, the repositories and the cap (D5; wedge spec, Steering › Emissions). Each frame carries the work order id as its source and the brief digest as its version. A sent brief cannot change, so these frames cannot either. That fixed provenance is what lets the Decision trace prove a frame came from this send. The heading says SteeringFrames, never frames, because a frame is a recorded event of a run and the two must not share a name on screen.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Frames, types, text, hashes | `woFrames()`, `frameOf()` in `wedge.js` | frames of type `invocation`, `goal` and `constraint` with the work order as source | none |
| Provenance | `w.id`, `w.digest` | `source.kind` `work_order`, `source.version` the digest | none |

### Logic
1. `woFramesPanel()` returns nothing when `woFrames()` returns no frame, which is every direct work order.
2. `woFrames()` builds the frames in this order: one `invocation` over `woSentPrompt()`, one `goal` per work item ("Cut 4.11.0 release notes (a-intel/platform#482)"), one `constraint` per item from `woItems()`, the repository `constraint` ("Change only a-intel/platform, on branches and pull requests. The production branch is never pushed."), and the cap `constraint` ("Spend at most $10.00 across this work order.") when a cap is set.
3. Every frame has force `must` and enters at the `prompt` injection point.
4. `frameOf()` hashes the type, the source kind, the source id and the body with `srcHash()`, so the same send always yields the same hashes.
5. Each line shows `ftBadge()` for the type, the text ("The brief as sent, 103 tokens" for the `invocation`), and the first 12 hex characters of the hash.
6. The note under the list reads "Provenance on every frame: `<id>` and the brief digest `<digest>`."
7. The panel is marked future-only.

### States
Absent on a direct work order. On a phone the lines wrap. A build leaves the panel and its heading out until frames carry a type, a hash and provenance: `steering.manifest` items carry none of the three today (`packages/tacho/src/wire.ts:626-697`).

## Accept dialog {#dialog/woaccept}

The accept dialog confirms that you accept every item the agents claimed, and says what that does in the provider.

### Purpose
Every item is claimed and the work waits on you. The dialog tells you how many items you accept, that accepting merges nothing, what happens to each work item in its provider, and which sibling work orders stop. Then you accept.

### Rationale
A work order is done when a person accepts every item, and accepting is the one step no agent can take (`docs/tasks-spec.md` §11). Accepting records `accept_work_order` with your name, accepts every claimed item, and marks each work item accepted. It merges nothing: a person merges the pull request in the repository. The connection's close switch decides what happens in the provider. On, Oxagen closes each work item there as Done, the resolution for work a person accepted. Off, each work item stays open there until somebody closes it. Turned on, it closes each one as Done. The dialog says which applies before you confirm, because a close in a help desk can email a requester. On a send with several targets, accepting one stops its siblings at their next boundary, because they carry the same work (`docs/work-graph-spec.md` §7.3).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Items to accept | `woItems()` | `tasks.work_order_items` | none |
| Pull request | `w.runs[].pr` | `get_run_work` | live |
| Close switch | `woClose()` over `IPROV[].writeback.close` | `tasks.issue_providers` write-back | none |
| Siblings to stop | `woSiblings()` | `tasks.sends` | none |
| Accept | `woAccept()` | `accept_work_order`; the provider close write-back | none |

### Logic
1. **Accept all items** in the header opens `woaccept` with the work order id. The button is gold and enabled only when every item is claimed.
2. Title "Accept all items", subtitle the work order's title.
3. The body reads "You accept 4 items the agents claimed, with the evidence each one cited."
4. The warning reads "Accepting merges nothing." and, when the latest run has a pull request, "A person merges `<number>` on GitHub."
5. `woClose()` reads the connection of the first work item's provider. On: "The GitHub connection closes each issue as Done." Off: "The GitHub connection has close on accept off, so each issue stays open there." A work item with no connection shows no close note.
6. On a send, a note names each open sibling: "Accepting stops `wo_01K6TC5B`, which carries the same work items."
7. **Accept all items** calls `woAccept()`. It stops each open sibling and records `stoppedFor`, sets the work order `accepted` with the time, marks every claim accepted by you, and sets each work item's readiness to `accepted`.
8. The gold toast reads "Accepted. accept_work_order recorded." then either "oxagen closes <numbers> in GitHub as Done." or "<numbers> stays open in GitHub." The reason the work item stays open sat in the toast. It lives here now: close on accept is off for that connection.

### States
On a phone the dialog is a bottom sheet with full-width footer buttons. A build shows the dialog only once `accept_work_order` ships, and gates it on `work_order.accept` (its sender and workspace owners).

## Send now dialog {#dialog/worelease}

The send now dialog releases a queued work order before its blockers are done.

### Purpose
A queued work order waits for work items it depends on. Sometimes you know the agent can start anyway. The dialog names the blockers still open, says what the agent reads as a result, and lets you send now or keep it queued.

### Rationale
A queued work order is a person's send held by Oxagen until every blocker is accepted or closed as Done (`docs/work-graph-spec.md` §6). **Send now** overrides that hold. It is a person's decision, recorded as `release_work_order` with the person and the blockers still open, and the brief gains one line the agent reads: "Sent before #633 was done, by Marcus Bell." (§6.3). The line is the only change a sent brief can take, and it tells the agent to expect missing work. The blocked items stay blocked in the graph: only this work order moved. The button is plain, never gold, because the one gold action on the page is **Accept all items**.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Blockers still open | `woWaitsOn()`, `woWaitsOnText()` | `get_work_graph` for one work order | none |
| Release | `woRelease()` | `release_work_order` | none |

### Logic
1. **Send now** in the header of a queued work order opens `worelease`.
2. Title "Send this work order now?", subtitle the work order's title.
3. `woWaitsOnText()` names the open blockers outside the work order, joined with "and".
4. The body reads "#633 is still open. The agent reads its brief without the work #633 was meant to finish first."
5. The note quotes the line the brief gains: "Sent before #633 was done, by Marcus Bell."
6. Footer: **Keep it queued** and **Send now**, both plain.
7. `woRelease()` appends the line to the prompt, sets the state `sent`, records `releasedBy` and the time, and moves each work item to `sent` and off the queue.
8. The gold toast reads "Sent to Release manager. release_work_order recorded, with #633 still open."

### States
Only a `queued` work order opens it. On a phone it is a bottom sheet with full-width footer buttons. A build shows it once `release_work_order` ships, gated on `work_order.send`.

## Stop dialog {#dialog/wostop}

The stop dialog cancels the live run at its next boundary and ends the work order.

### Purpose
The work is going wrong, or no longer needed. The dialog says what stopping does to the run and to the work items, and asks you to confirm.

### Rationale
**Stop work order** cancels the live run at its next boundary and starts no later stage (`docs/tasks-spec.md` §11). A boundary is a point where the runtime can stop cleanly, so the stop lands between tool calls rather than in the middle of one. Branches and pull requests stay where they are: stopping deletes nothing a person might want to read or reuse. The work items go back to ready, and their certified definitions of done are unchanged, so they can go out again in a new work order without a new certification. The cancel is `dispatch_command`, which ships and needs its own grant. A work order with no start receipt is withdrawn instead, because nothing has started to stop (`docs/work-graph-spec.md` §6.4).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Stop | `woStop()` | `stop_work_order`, which cancels through `dispatch_command` (`tacho.command.dispatch.ts:107-134`) | partial |
| Work items returned to ready | `TASKS[].ready` | `tasks.tasks` readiness | none |

### Logic
1. **Stop work order** in the header opens `wostop` while the work order is open and has started.
2. Title "Stop this work order?".
3. The body reads "The live run gets a cancel at its next boundary, and no later stage starts."
4. The note reads "The work items go back to ready."
5. Footer: **Keep it running** and **Stop it** (red).
6. `woStop()` sets the state `stopped` and moves each work item that was `sent` back to `ready`. The mockup changes no run. A build sends `cancel` to the live run through `dispatch_command`, and the runtime acts on it at the run's next boundary.
7. The toast reads "Stopped. The work items are ready again."

### States
A stopped work order then shows **Send again**. On a phone the dialog is a bottom sheet with full-width footer buttons. A build shows it once `stop_work_order` ships, gated on `work_order.accept` for the stop and on the `dispatch_command` grant for the cancel.

## Withdraw dialog {#dialog/wowithdraw}

The withdraw dialog takes back a work order before anything has started.

### Purpose
You sent or queued work and changed your mind before the runtime picked it up. The dialog confirms that nothing has started and that the work items go back to ready, and lets you withdraw.

### Rationale
A work order is `in progress` only from its start receipt, the runtime's record that the harness is up (`docs/work-graph-spec.md` §6.2). Before that receipt nothing has run, so taking the work order back is a withdraw, not a stop, and nothing needs a cancel. The work items go back to `ready`. Their certified definitions of done are unchanged, so they can be sent again at once. Withdrawing records `withdraw_work_order`. From the start receipt on, the button and dialog become **Stop work order** and `wostop`, and no toast says nothing started for a work order that has a receipt (§6.4).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Start receipt | `w.started`, `w.runs` | `tasks.work_orders` `started_at`; `record_work_order_start` | none |
| Withdraw | `woWithdraw()` | `withdraw_work_order` | none |

### Logic
1. **Withdraw** shows in the header while the work order is `queued`, or `sent` with no start receipt and no run.
2. Title "Withdraw this work order?", subtitle the work order's title.
3. The body reads "Nothing has started. The work items go back to ready."
4. Footer: **Keep it** and **Withdraw** (red).
5. `woWithdraw()` sets the state `stopped` with the time it was withdrawn, sets each work item's readiness to `ready`, removes its queue hold, and clears its link to this work order.
6. The toast reads "Withdrawn. The work items are ready again."

### States
On a phone the dialog is a bottom sheet with full-width footer buttons. A build shows it once `withdraw_work_order` and the start receipt ship, gated on `work_order.send`.
