# The work graph: dependencies, parallel stages, and queued sends

| | |
|---|---|
| **Status** | Spec v1, for design review. No code is written against it yet. It amends `tasks-spec.md` and cites it by section, and it keeps that spec's word for a unit of work, a task. The pages it lands on are the Work pages of the fleet operations wedge, which reached `main` on 2026-09-24 and call a task a work item. The ARP brand spec bans "task" as a user-facing noun (`ARP-Brand-spec.md` line 37). Which word the product keeps is decision 1 in §16, for Mac. |
| **Date** | 2026-09-24 |
| **Owner** | Mac Anderson |
| **Source** | `mockups/src/wedge.js` (`backlogTab`, `workOrdersTab`) and `mockups/src/engine.js` (`tkBlockedByCell`, `tkLayers`, `tkGraph`, `tkDepsPanel`, `tkWhyNot`, `stageChain`, `wfDepths`, `woOrderPanel`, `woSendPanel`, `pTask`, `pWorkOrder`, `DLG_EXT.wo`, `DLG_EXT.wfnew`, `DLG_EXT.tklink`, `DLG_EXT.worelease`, `DLG_EXT.wowithdraw`), `mockups/fixtures/tasks.json`, rendered in `mockups/missioncontrol.html` |
| **Builds on** | `tasks-spec.md` (the task record, the definition of done, work orders, workflows). ADR-043 (Oxagen governs agents and does not run them), ADR-101 (four first-class harnesses), ADR-157 (ARP carries an operator-authored brief), ADR-052 (the governed action is the billable unit) |
| **Inspiration** | The Oxagen ARP document pack, `macanderson/oxagen-arp` at `7d9af52`: `ARP-design.md`, `ARP-Schema-spec.md`, `ARP-API-spec.md`, `ARP-Brand-spec.md`. Each borrowed idea is marked "ARP:" with its line. ARP has no dependency graph of its own. It fans one work request out to a fixed set of targets and never joins them (`ARP-design.md` lines 323 to 333). The graph in this spec is new design. |
| **Related** | `creation-spec.md` (a workflow is a file, changed by pull request), `dod-spec.md` (the run dod, a different object), `mission-control-spec.md` §1 (the operator) |
| **Pages** | `mockups/pages/work-backlog.md`, `work-orders.md`, `work-item.md`, `work-order.md`, `work-workflows.md`, each with its audit prompt |
| **Check** | `node tools/check-tasks.mjs` walks the flows in §15 in the built mockup |

## 1. The situation

Your tracker holds forty open issues. Twelve of them cannot start until another one lands: the
migration before the handler, the handler before the docs, the docs before the release notes. Your
tracker knows some of this. GitHub has sub-issues and blocked-by links, Linear has `blockedBy`, Jira has
the Blocks link. The Tasks page of `tasks-spec.md` reads none of it. It lists every certified task as
`ready`, lets you send any of them, and leaves the order in your head. When you send the handler before
the migration, the agent reads a schema that does not exist yet, claims nothing, and spends the cap.

The same gap sits inside a work order. A workflow is a chain: Fix, then Validate, then Document, then
Review. Document and Validate do not depend on each other, and running them one after the other costs
an hour and a second run of the fixer's context. Nothing in the file can say "Document runs after Fix,
beside Validate".

This spec adds the missing order, in three places, and nothing else changes.

1. **Dependencies between tasks.** Oxagen reads the links your provider already holds, lets a person add
   more, and derives from them which ready tasks can be sent now and which wait. The Tasks page shows the
   graph as a list and as a drawing.
2. **Stages that run beside each other.** A workflow stage names the stages it needs. Two stages that
   need the same one run at the same time, as two runs by two agents under one cap.
3. **Sends that wait.** You can send a blocked task now. Oxagen queues the work order, releases it to the
   runtime when the blockers are done, and expires it if they never are.

Oxagen still runs no agent (ADR-043). It orders work, hands each agent its brief when the order allows,
and keeps the record.

## 2. Scope

| Day 1 | Later |
|---|---|
| One dependency kind, `blocks`, between two tasks in one workspace | Dependencies across workspaces, and kinds such as `relates to` |
| Provider links read from GitHub, Linear, Jira, ServiceNow, Salesforce Service Cloud, and Zendesk (§4.2) | Writing a link a person adds in Oxagen back to the provider, behind a fifth write-back switch (§4.4) |
| A person adds or removes a dependency in Oxagen | The assistant suggesting dependencies from the text |
| A derived reason on every blocked task, and a Graph view of the workspace's tasks | Critical path, estimates, and dates. Oxagen records no estimate, so it draws none. |
| A queued work order that Oxagen releases when its tasks are unblocked, with an expiry | Rules that queue without a person |
| `needs` on a workflow stage, so stages run beside each other | A stage that needs a stage of another workflow |
| A send to several agents, one work order per agent (§7) | A send whose targets split the tasks between them |
| A retry as a new work order that names the one it retries (§7.4) | Automatic retries |

## 3. Vocabulary

New terms only. Every term of `tasks-spec.md` §4 keeps its meaning.

| Term | Meaning |
|---|---|
| **Dependency** | A directed link between two tasks in one workspace: the blocker and the blocked. "#481 blocks #482" and "#482 is blocked by #481" name the same dependency. Day 1 has one kind, `blocks`. |
| **Source** of a dependency | `provider`, when Oxagen read it from the tracker, or `oxagen`, when a person added it here. |
| **Work graph** | Every open task in a workspace and every dependency between them. It is acyclic: Oxagen refuses a dependency that would close a cycle. |
| **Upstream** and **downstream** | A task's blockers, and their blockers, are upstream of it. The tasks it blocks are downstream. |
| **Unblocked** | A task is unblocked when it has no upstream task that is still open (§5.2). A task with no blockers is unblocked. |
| **Blocked** (by the graph) | A task with an open upstream task. This is a derived reason, not a readiness state and not a status. The provider's status category `blocked` (`tasks-spec.md` §6.2) is a different thing and keeps its own column. |
| **Layer** | The longest path from an unblocked task to this one, counted in dependencies. Unblocked tasks are layer 0. The Graph view draws one column per layer. |
| **Send** | One submission of a set of ready tasks to a fixed set of targets. It creates one work order per target (§7). ARP: a work request "is not a run" and "creates one child request per target" (`ARP-Brand-spec.md` line 21; `ARP-design.md` line 323). |
| **Target** | The agent or workflow one work order of a send goes to. |
| **Queued** work order | A work order a person sent while one of its tasks was blocked. Oxagen holds it and releases it when every task is unblocked, or expires it. |
| **Released** | The moment Oxagen hands a queued work order to the runtime. From then on it reads like any sent work order. |
| **Start receipt** | The runtime's record that a run started for a work order: the run id, the host, and the time. A work order is `in progress` from its start receipt, not from its send. ARP: "Acceptance of `work.submit` is not enough. Success requires a trusted RunStartReceipt" (`ARP-design.md` line 276). |
| **Needs** | The stages a workflow stage runs after. A stage with no `needs` runs after the stage before it in the file, so every v0.1 file keeps its meaning. |
| **Ready stage** | A stage whose every needed stage has handed off. Oxagen starts every ready stage at once. |
| **Retry** | A new work order for the same tasks that names the work order it retries. ARP: "Each retry gets a new attempt and a fresh approval" (`ARP-design.md` line 962). |

## 4. Dependencies

### 4.1 The record

A dependency has:

| Part | Values |
|---|---|
| Blocker | A task id, `tsk_<ULID>` |
| Blocked | A task id in the same workspace, never the blocker |
| Kind | `blocks`. The only kind on day 1. |
| Source | `provider` with the provider's own link id, or `oxagen` with the person who added it and when |
| Removed | When and by whom, for a dependency a person removed. A removed dependency stays in the record and never blocks again. |

A dependency between the same two tasks in the same direction exists once. Adding it again changes nothing
and records nothing.

### 4.2 Reading dependencies from a provider

Each provider holds links of its own. Oxagen reads the ones below on every read of a task (`tasks-spec.md`
§5.3) and creates, updates, or removes the matching `provider` dependency. A provider link to a task
outside the connection's scope is not read, because the other end is not in Oxagen. It is counted, and
the task page says "1 link to an issue outside the scope of this connection".

| Provider | Read as "A blocks B" | Not read |
|---|---|---|
| GitHub | An issue dependency where A is listed as blocking B. A sub-issue: the parent B is blocked by each child A. | Cross-references in comments, `closes #N` in a pull request |
| Linear | A `blocks` relation from A to B, and its inverse `blockedBy`. A sub-issue: the parent is blocked by each child. | `related`, `duplicate` |
| Jira Cloud | An issue link of type Blocks, outward from A to B. A subtask: the parent is blocked by each subtask. | Relates, Clones, Duplicates, and epic membership |
| ServiceNow | An incident whose `parent_incident` is A is blocked by A. | Related records, problem links |
| Salesforce Service Cloud | A case whose `ParentId` is A is blocked by A. | Related cases |
| Zendesk | An incident ticket whose `problem_id` is A is blocked by A. | Linked tickets in custom fields |

A parent and child read as "the parent is blocked by the child" because a parent is done when its
children are. A workspace that reads parents the other way round removes the dependency on the task page.
The scopes and fields in this table were read from each provider's documentation on 2026-09-24 and not
tested against a live tenant, the same caveat as `tasks-spec.md` §18.

A `provider` dependency cannot be removed in Oxagen. Removing the link in the provider removes it on the
next read. The task page says so on the row.

### 4.3 Adding a dependency in Oxagen

**Add a dependency** on the task page opens a dialog (`tklink`, §12.2). A person picks the direction
("this task is blocked by" or "this task blocks"), searches the workspace's open tasks, and adds one.
Adding records `link_tasks`, a governed action, with both ids, the direction, and the person.

Oxagen refuses a dependency that would close a cycle, in the same transaction that would write it. The
refusal names the path: "Refused. #482 already blocks #481 through #479 and #480." Nothing is written.

**Remove** on an `oxagen` row records `unlink_tasks`. The dependency keeps its row with its removal.

### 4.4 Writing back

Day 1 writes nothing to a provider about dependencies. The design reserves a fifth write-back switch in
the pattern of `tasks-spec.md` §5.4, off by default: "Post a dependency a person adds here as a
<link> in <provider>". The connection wizard shows the switch marked `later`, disabled, so nobody is
surprised by it. Where a provider has no link type Oxagen can write (ServiceNow, Salesforce), the switch
is absent.

## 5. Readiness on the graph

### 5.1 What changes

Readiness (`tasks-spec.md` §8.6) keeps its seven values. The graph adds a derived reason, shown beside
readiness and never stored in it:

| Readiness | Status category | Graph | Can be selected | The reason on a disabled checkbox |
|---|---|---|---|---|
| `ready` | `open` | unblocked | yes, and **Send** | none |
| `ready` | `open` | blocked | yes, and **Queue** (§6) | none. The row shows "Blocked by #481" |
| `ready` | `blocked` | any | no | "Blocked upstream. It can be sent when it is open again." (unchanged) |
| anything else | any | any | no | unchanged from `tkWhyNot` |

The provider's `blocked` status and the graph's blocked reason stay apart on the page: the Status column
keeps the provider's word, and the Blocked by column names the tasks.

### 5.2 Unblocked

A task is unblocked when every upstream task is one of:

- `accepted` in Oxagen (`tasks-spec.md` §11), or
- closed in the provider with the resolution `Done` (`tasks-spec.md` §6.3), whether or not a work order
  ever carried it.

An upstream task closed as `Won't do`, `Duplicate`, `Cancelled`, or `Other` does not unblock. The blocked
task's row says "Blocked by #481, closed as Won't do", and a person removes the dependency or accepts the
outcome by removing it. Oxagen does not guess that a cancelled prerequisite was not needed.

Unblocking is computed, never written: a change to any task's readiness or resolution, or to any
dependency, re-evaluates every downstream task in the workspace. A workspace of ten thousand open tasks
re-evaluates in one query over the transitive closure, and the Graph view reads the result.

### 5.3 What a blocked task can do

A blocked task can be drafted, edited, and certified. Certification does not read the graph. A certified
blocked task is `ready` and shows "Blocked by #481". It can be selected and queued (§6). Only the release
to a runtime waits.

## 6. Queued sends

### 6.1 Sending a blocked task

The send menu and the work order dialog (`tasks-spec.md` §9.2, §9.3) accept a selection that includes
blocked tasks. The dialog's Tasks section marks each blocked chip "blocked by #481", and section 1 gains one
line: "2 of 3 tasks are blocked. Oxagen sends this work order when they are unblocked, and expires it on
<date> if they are not." The footer button reads **Queue until unblocked** instead of **Send to <target>**.
The prompt, the repositories, the cap, and the confirmation are the same, because the brief is fixed at
the send. A queued brief cannot change either.

A task in a queued work order keeps the readiness `ready`, because it has not reached a runtime. Its row
on the Tasks tab reads `ready` with "queued in wo_01K6TB2X" under it, and its checkbox is disabled with
"Already queued in wo_01K6TB2X. Withdraw it to send elsewhere." Readiness keeps its seven values.

Section 6 gains **Expires**, a date, default 14 days from the send, at most 90. ARP: a work order "names
allowed tools and context, rule versions, budget, expiry, and review points" and a request carries a "queue
expiry" (`ARP-design.md` lines 52 and 1497).

### 6.2 States

`tasks-spec.md` §9.5 and §11 give a work order these states: `sent`, `in progress`, `waiting on you`,
`returned`, `parked for you`, `stopped`, `accepted`. The graph adds three.

| State | Meaning | Next |
|---|---|---|
| `queued` | Sent by a person, held by Oxagen because a task is blocked | `sent` when every task is unblocked, `expired` at the expiry, `stopped` on withdraw |
| `sent` | Released to the runtime, no start receipt yet | `in progress` on the start receipt |
| `expired` | The expiry passed while queued. Nothing started. | none. **Send again** makes a retry (§7.4) |

`sent` is not new, but its meaning narrows: a work order is `in progress` only from its start receipt. ARP:
"Mark a request started only after that start is recorded" (`ARP-design.md` line 327).

### 6.3 Release

When the last blocker of a queued work order's tasks is accepted or closed `Done`, Oxagen releases the
work order in the same transaction: its state becomes `sent`, its tasks `sent`, the runtime is told the
way §9.6 of `tasks-spec.md` says, and `work_order.released` is recorded. A task sits in at most one
queued work order at a time (§6.1), so two queued work orders never wait on the same task.

**Send now** on a queued work order releases it before its blockers are done. It is a person's decision,
recorded as `release_work_order` with the person and the blockers still open, and the brief gains one
line the agent reads: "Sent before #481 was done, by Marcus Bell." The blocked tasks stay blocked in the
graph. Only this work order moved.

### 6.4 Withdraw and expiry

**Withdraw** on a queued work order stops it before anything started. The tasks go back to `ready` with
their certifications intact. ARP: "A cancel committed before launch authorization blocks startup. A
launch authorized first may already be starting. In that case cancellation becomes a stop request for the
linked run" (`ARP-design.md` line 1519). The button reads **Withdraw** while the work order is `queued` or
`sent` without a start receipt, and **Stop the work order** from the start receipt on. The toast never
reads "withdrawn, nothing started" for a work order that has a start receipt.

Expiry runs once a minute. An expired work order records `work_order.expired`, releases its tasks to
`ready`, and shows the blockers that were still open.

## 7. Sends and targets

### 7.1 One send, one work order per target

The send menu (`tasks-spec.md` §9.2) gains a second way to pick: tick more than one agent. A send to
several targets creates one work order per target, each with the same tasks, the same definition of done,
the same brief, the same repositories, and its own cap. Each is its own record with its own state, its
own runs, and its own claims. ARP: "Each child has a stable ID, its own state, and a link to the group
request" and "A group may partly succeed. One target's success must not hide another's failure"
(`ARP-design.md` lines 323 and 329).

The send has an id, `snd_<ULID>`, shown on each of its work orders as "1 of 2 in this send". The Work
orders tab groups them under one row that opens to its children, with the group's state `partial` while
the children's states differ. A send to one target draws no group, which is every send today.

### 7.2 Why send to two agents

To compare. The same brief on Claude Code and on Codex, or the same brief to two agents with two
toolbelts, produces two pull requests and two claims lists. A person accepts one. The Work orders tab shows
both costs and both claim counts side by side, and reports nothing else: no score, no winner. The record
shows what each did.

### 7.3 Accepting one of two

Accepting one work order of a send accepts its tasks. The sibling work orders that carry those tasks are
then stopped at their next boundary, with the reason "#482 was accepted in wo_01K6TB2X". The accept
dialog says so before the person confirms: "Accepting stops wo_01K6TB3Y, which carries the same tasks."
Nothing merges.

### 7.4 Retry

**Send again** on a stopped or expired work order opens the work order dialog with the same tasks, the
same target, the brief as sent, and the repositories pre-checked. The new work order records `retry_of`
with the old id, and the old one shows "Retried as wo_…". Its runs, claims, and cost stay on the old
record. Cost is never moved. ARP: "Child agents, forks, retries, and a change of owner cannot shed old
costs" (`ARP-design.md` line 968).

A work order that is `queued`, `sent`, or `in progress` has no **Send again**. Duplicate delivery must
not create a second run for the same work order. ARP: "Repeated delivery must not create extra runs.
Each child request may have at most one active run" (`ARP-design.md` line 333).

## 8. Stages that run beside each other

### 8.1 The file

`oxagen-workflow/v0.2` adds one key to a stage, `needs`, a list of stage roles. A stage with `needs`
runs when every stage it names has handed off. A stage without `needs` runs after the stage before it in
the file, so every v0.1 file reads the same under v0.2. `[accept]` needs every stage nothing else needs.

```toml
# .oxagen/workflows/fix-validate-document-review.toml
schema = "oxagen-workflow/v0.2"
name = "Fix, validate, document, review"

[[stage]]
role = "Fix"
agent = "a-intel.core.bug-fixer"
owns = ["code"]
on_fail = "stop"

[[stage]]
role = "Validate"
agent = "a-intel.core.validator"
owns = ["test"]
needs = ["Fix"]
on_fail = "return"
return_to = "Fix"
max_returns = 2

[[stage]]
role = "Document"
agent = "a-intel.core.documenter"
owns = ["docs"]
needs = ["Fix"]
on_fail = "stop"

[[stage]]
role = "Review"
agent = "a-intel.core.architect"
owns = ["review"]
needs = ["Validate", "Document"]
on_fail = "return"
return_to = "Fix"
max_returns = 1

[accept]
by = "operator"   # the last stage is always a person
```

`return_to` names a role, not a number, and it must be upstream of the returning stage. The rules the
pull request check enforces:

- `needs` names roles in the file, never the stage itself, and forms no cycle.
- `return_to` is upstream of its stage through `needs`. A return is the only backward edge, and it is
  bounded by `max_returns`.
- A role is unique in the file.
- Every stage is reachable from the first, and `[accept]` is reachable from every stage.

### 8.2 Running

`tasks-spec.md` §10.3 says Oxagen sequences work orders and runs nothing. With `needs`:

1. Every stage with no `needs` and no earlier stage is ready at the send. Oxagen sends each its brief.
2. When a stage hands off, Oxagen marks it done and starts every stage that is now ready, each as its own
   run by its own agent, at the same time. A stage that needs two stages receives both handoff notes, each
   quoted with its stage and run.
3. A return to `Fix` from `Review` sends the work back to `Fix`. Every stage downstream of `Fix` that
   already ran is marked `to run again`, and runs again when `Fix` hands off. Its earlier runs stay in
   the record. A stage running when the return lands finishes its run and hands off, and that handoff is
   recorded and marked `before the return`.
4. A stage that parks, stops, or exhausts its returns holds every stage downstream of it. A stage on a
   parallel branch that is already running finishes its run and hands off. Nothing downstream of the held
   stage starts, and the work order is `parked for you` or `stopped`.
5. `[accept]` waits on you when every stage it needs has handed off.

Two stages running at once are two runs with two budget holds against the one cap. ARP: "All children
sharing one cap reserve against that same ledger" (`ARP-design.md` line 1523). The cap is for the whole
work order, and two runs cannot each spend the last dollar.

### 8.3 The builder

The workflow builder (`tasks-spec.md` §10.2) gains **After** on every stage after the first: checkboxes
over the earlier stages, the previous one ticked by default. Ticking two makes the stage wait for both.
Unticking every box is refused with "A stage runs after at least one other stage. The first stage has no
After." The **On failure** select's "return to" lists only the stages upstream of this one. The stage
chain on the page draws the layers (§11.3), and the TOML shows `needs`.

The wand reads "beside" and "at the same time": "A bug fixer passes a fix to a validator and a documenter
at the same time, and an architect reviews both" drafts four stages with `Document` needing `Fix` and
`Review` needing both.

## 9. Storage

| Store | What |
|---|---|
| Postgres | `tasks.task_dependencies` (id, org, workspace, blocker task, blocked task, kind, source, provider link id, created by, created at, removed by, removed at; unique on blocker and blocked while not removed; a check that blocker is not blocked). `tasks.sends` (id, workspace, sent by, sent at, expires at, when `now` or `unblocked`, targets, the tasks' certification digests). `tasks.work_orders` gains `send_id`, `retry_of`, `expires_at`, `released_at`, `started_at`, and the states `queued` and `expired`. `tasks.work_order_stages` gains `needs` (stage roles) and a state: `waiting`, `ready`, `running`, `handed off`, `to run again`, `parked`, `stopped`. Every table is tenant-scoped under RLS through `withTenantDb`. |
| The cycle check and the release | Both run inside the transaction that writes. The cycle check walks `task_dependencies` from the blocked task with a recursive query and refuses if it reaches the blocker. The release reads the transitive closure of open upstream tasks for each task of the queued work order and releases when it is empty. Neither reads Neo4j: transactional state stays in Postgres (`AGENTS.md`, Storage boundaries). |
| Neo4j | `(:Task)-[:BLOCKS]->(:Task)` mirrored after the write, beside `(:Task)-[:IN]->(:WorkOrder)` from `tasks-spec.md` §13, so the graph answers "what did this depend on" across runs and pull requests. Never read for a gate. |
| ClickHouse | `task.linked`, `task.unlinked`, `work_order.queued`, `work_order.released`, `work_order.expired`, `work_order.withdrawn`, `work_order.started` (the start receipt), `stage.ready`, `stage.rerun`, `send.created`, `send.partial` |
| Files | `.oxagen/workflows/<slug>.toml` at `oxagen-workflow/v0.2` |

The Postgres tables are a schema change, so the pull request that adds them carries `migration-required`
(SCR-006).

## 10. Capabilities

Every name is verb-first snake_case (ADR-025). Management capabilities carry `noBillingGate: true`.

| Capability | Surfaces | Notes |
|---|---|---|
| `link_tasks`, `unlink_tasks` | api, app, cli | A person. Refuses a cycle and names the path. |
| `get_work_graph` | api, mcp, app, cli, agent | The open tasks of a workspace, or of one work order, with their dependencies, layers, and blocked reasons. The agent reads it to know the order its tasks come in. |
| `list_tasks` | unchanged surfaces | Gains a `blocked` filter and a `blockedBy` list on each task |
| `send_work_order` | api, app, cli | Gains `targets` (one or more), `when` (`now` or `unblocked`), `expiresAt`, and `retryOf`. Creates a send and one work order per target. |
| `release_work_order` | api, app, cli | **Send now** on a queued work order. Records the blockers still open. |
| `withdraw_work_order` | api, app, cli | A queued or sent work order with no start receipt. After the receipt, `stop_work_order` applies. |
| `record_work_order_start` | api, cli | The runtime's start receipt: the work order, the run, the host, the time. `oxagen work start <wo>` calls it once the harness is up (`tasks-spec.md` §9.6). |
| `get_send`, `list_sends` | api, app, cli | A send and its work orders |
| `propose_workflow` | unchanged | Validates `needs` and `return_to` under the rules of §8.1 |
| `hand_off_work_order` | unchanged | Oxagen computes the ready stages after each handoff and starts them |

Existing capabilities it reuses: `sync_issue_provider` reads the provider links, `dispatch_command`
cancels a live run on stop, `send_work_order` and `stop_work_order` keep their names. The agent-facing
tool `get_work_graph` must load in Claude Code, Codex, Cursor, and Stella (ADR-101).

## 11. Pages

Each change lands in an existing page spec of the Work pages. Nothing gains a route.

### 11.1 Backlog, Work orders, and Workflows (`work-backlog.md`, `work-orders.md`, `work-workflows.md`)

- **Tiles.** Ready to send counts the ready tasks the graph does not block, with the caption "certified
  and unblocked". The other three tiles are unchanged. The blocked count is read from the Blocked by
  column and the Graph, because the row holds four tiles and Live now earns its place.
- **Backlog panel.** A **List** and **Graph** switch in the panel header. List adds the column **Blocked by**
  after Status: each blocker's number in mono as a link with its state dot, "none" for a task with no
  blocker, and "closed as Won't do" beside a blocker that closed without done. A blocked ready task's
  checkbox is enabled, and the row's readiness reads `ready` with "blocked by #481" under it.
- **Graph.** The same tasks drawn by layer: one column per layer, left to right, each task a card with
  its provider logo, number, subject, readiness badge, and a checkbox under the same rule as the list.
  Edges are lines from blocker to blocked in the muted rule colour, and the edge into a selected task in
  the approval colour. Gold appears nowhere in the drawing. A card opens the task. The Graph draws open
  tasks only, and a task with no dependency sits in layer 0 with the rest. On a phone the Graph is a list
  by layer with a "Layer 1" heading between the groups, because nothing scrolls sideways.
- **The send menu** lists the same agents and workflows, each with a checkbox, and **Continue** under
  them. One agent ticked is today's flow. More than one is a send with that many work orders (§7).
- **The work order dialog** gains the blocked chips, the queued line, **Expires**, and the
  **Queue until unblocked** footer button (§6.1). With several targets the title reads "Work order, 2
  targets" and section 2 lists them.
- **Work orders tab.** State gains `queued` (with "waits on #481" under it) and `expired`. The Stage
  column reads "2 of 4, Validate and Document" when two stages run beside each other. A send with several
  work orders is one row, "2 work orders", `partial` while their states differ, and opens to its children.
- **Workflows tab.** The Stages column draws layers: "Fix → Validate ∥ Document → Review → You". `wfview`
  shows "after Fix and Validate" on each card. `wfnew` gains **After** (§8.3).

### 11.2 Work item (`work-item.md`)

- **Header.** For `ready` and blocked by the graph, the primary is **Create work order and send to
  agent** as today, enabled, and the dialog queues. Subtext gains "Blocked by #481." when it is.
- **Dependencies** panel, right column, above Fields. Two lists, **Blocked by** and **Blocks**. Each row:
  the provider logo, the number in mono as a link, the subject, the state (a dot and a word: `open`,
  `in a work order`, `accepted`, `closed as Done`, `closed as Won't do`), and the source: the provider's
  logo with "from GitHub", or "added here by Marcus Bell on 2026-09-11". An `oxagen` row has **Remove**.
  A `provider` row's title says "Read from GitHub. Remove the link there." In the header, **Add a
  dependency** opens `tklink`. A task with no dependency shows "None. This task waits on nothing, and
  nothing waits on it." The count of links to issues outside the connection's scope, when any.
- **`tklink`** (§12.2).
- **History** gains "Dependency added", "Dependency removed", "Unblocked", and "Queued in a work order".

### 11.3 Work order (`work-order.md`)

- **Header.** Subtext for `queued`: "Queued by Marcus Bell on 2026-09-11 09:13 for Release manager. It
  is sent when #481 is done, or expires on 2026-09-25." For a send with several work orders: "1 of 2 in
  send snd_01K6TB2X." Actions while `queued`: **Copy prompt**, **Send now** (plain, opens `worelease`),
  **Withdraw** (red). While `sent` without a start receipt: **Withdraw** in place of **Stop the work
  order**. While `expired` or `stopped`: **Send again**.
- **Tiles.** State's caption reads "waits on #481" while queued, and "expired on <date>" after. Returns
  is unchanged.
- **Stages.** The chain becomes layers: stages that run beside each other sit in one column, joined by
  the arrows from the stages they need. A card's sub line reads "after Fix and Validate" when it needs
  more than one. A stage `to run again` is outlined in the approval colour with that word.
- **Order** panel, right column, above Tasks: the work order's tasks in the order the graph implies, each
  with the blockers inside this work order ("after #481") and the blockers outside it ("waits on #479,
  not in this work order") while queued.
- **Handoffs.** A stage that needed two stages lists both notes, each with its stage and run.
- **Send** panel, right column, only for a send with several work orders: each sibling's target, state,
  items claimed, and cost, side by side, no rank.
- **`worelease`** and **`wowithdraw`** (§12.3, §12.4).

## 12. Dialogs

### 12.1 The work order dialog, queued

As `tasks-spec.md` §9.3, with the changes of §6.1 and §7.1 above.

### 12.2 `tklink`

Title "Add a dependency", subtitle the task's number and subject. A direction select: "#482 is blocked
by" or "#482 blocks". A search field over the workspace's open tasks, each result with its logo, number,
subject, and readiness. Picking one shows the line "#482 is blocked by #481. #482 can be sent when #481 is
accepted, or closed as Done." A pick that would close a cycle shows the refusal with the path and disables
the footer. Footer "needs `task.link`", **Cancel**, **Add** (gold). Adding toasts "Dependency added.
link_tasks recorded."

### 12.3 `worelease`

Title "Send this work order now?", subtitle the title. "#481 is still open. The agent reads its brief
without the work #481 was meant to finish first." The line the brief gains, quoted. Footer **Keep it
queued**, **Send now** (plain, never gold: the one gold action on this page is Accept the work).
Releasing toasts "Sent to Release manager. release_work_order recorded, with #481 still open."

### 12.4 `wowithdraw`

Title "Withdraw this work order?", subtitle "Nothing has started. The tasks go back to ready." Footer
**Keep it**, **Withdraw** (red). From the start receipt on, the dialog is `wostop` of `tasks-spec.md`
and the button reads **Stop it**.

## 13. Permissions

| Permission | Allows | Default |
|---|---|---|
| `task.link` | Add or remove a dependency in Oxagen | workspace member |
| `work_order.send` | Unchanged, and now also queue, release, withdraw, and retry | workspace member |
| `work_order.record_start` | The start receipt | the runtime's machine key, never a person |

Every write is gated server-side, whatever the UI hides.

## 14. What exists today

Legend: ✅ exists · 🟡 partial · ❌ missing. Read from `macanderson/oxagen` `origin/main` at `eace53664`
on 2026-09-24.

| Need | Today | Status |
|---|---|---|
| Everything `tasks-spec.md` §16 lists | Unchanged since 2026-09-23 | as there |
| A dependency between two tasks | Nothing names a task | ❌ |
| Provider link reading | The GitHub, Linear, Zendesk, and Salesforce connectors read records into the graph and read no links between them | ❌ |
| A queued or expired work order, a send, a start receipt | Nothing stores a work order | ❌ |
| Parallel stages | `agent.agent_executions` and `agent_execution_steps` hold a step number and a lease, from the runtime ADR-043 removed. Nothing orders steps by need. | ❌ |
| A run's parent | `agent.agent_runs.parent_run_id` and `tacho.sessions.parent_session_uuid` record a tree of runs. Neither names a work order or a stage. | 🟡 |
| A stop that becomes a cancel | `dispatch_command` queues `cancel` for a live run (`packages/oxagen/src/contracts/tacho.command.dispatch.ts`) | 🟡 |

## 15. Flows the check walks

`node tools/check-tasks.mjs` walks these flows in the built mockup:

9. A task with an open blocker shows "blocked by #612, #618" under `ready`, and its checkbox is enabled. A task in a queued work order shows "queued in wo_…" and cannot be selected again.
10. Sending it opens the work order dialog with the queued line and **Queue until unblocked**, and the
    work order page opens `queued` with **Send now** and **Withdraw**.
11. The Graph view draws the task in layer 1 with an edge from #481.
12. A workflow with `needs` draws Validate and Document in one column on the Workflows tab, in `wfview`,
    and on a work order sent to it.
13. Adding a dependency that closes a cycle is refused with the path.
14. A send to two agents opens two work orders under one row on the Work orders tab.

## 16. Decisions this needs

Each becomes an ADR before the code it governs merges.

1. **The word.** `tasks-spec.md` and this spec say task. The Work pages on `main` say work item, since the
   fleet operations wedge landed on 2026-09-24. The ARP brand spec bans task as a user-facing noun
   (`ARP-Brand-spec.md` line 37) and says work order, work request, or run. This spec changes no page
   title and no capability name. Mac decides which word the specs and the contracts settle on.
2. **Unblocked means accepted in Oxagen or closed Done in the provider, and nothing else.** §5.2. A
   cancelled prerequisite does not unblock.
3. **Dependencies are Postgres rows, and the cycle check and the release run in the writing
   transaction.** §9. Neo4j mirrors and never gates.
4. **A provider's dependency is read-only in Oxagen.** §4.2. A person removes it in the provider.
5. **A queued work order is a person's send, held by Oxagen, with an expiry.** §6. Oxagen queues nothing
   on its own.
6. **A work order is in progress from its start receipt.** §6.2, borrowed from ARP's RunStartReceipt.
7. **A send creates one work order per target, and accepting one stops its siblings.** §7.
8. **`needs` is the one forward edge and a bounded return is the one backward edge.** §8.1.
9. **A parent issue is blocked by its children.** §4.2.
10. **Being drafted leaves the tiles.** §11.1. It stays as a badge.

## 17. Open questions

- Should a `provider` dependency on a task outside the connection's scope pull that task in, or stay a
  count? Day 1 it is a count.
- Should a send to two agents share one cap or carry one each? Day 1 each work order has its own cap,
  because each is its own record. ARP shares one ledger across children.
- Should the expiry default be 14 days, or the provider connection's reconcile window?
- When a return re-runs a stage that ran beside the returning one, is its earlier handoff note still
  shown to the next stage? Day 1 both are shown, the earlier one marked "before the return".
- Does the Graph view need a filter by label, or is the List's facet enough?

## 18. Definition of done for the build

- [ ] Every provider in §4.2 reads its links into `provider` dependencies on each read, and a link to a task outside scope is counted, not read.
- [ ] A person adds and removes an `oxagen` dependency on the task page, a cycle is refused with its path, and `link_tasks` and `unlink_tasks` are recorded.
- [ ] Every ready task shows its blockers, the Tasks tab tiles and List show the blocked count and column, and the Graph view draws the open tasks by layer with a list-by-layer on a phone.
- [ ] Unblocked follows §5.2, is recomputed on every change upstream, and never counts a prerequisite closed as anything but Done.
- [ ] A blocked ready task can be queued, the work order is `queued` with an expiry, Oxagen releases it in the transaction that unblocks it, and expiry returns the tasks to ready.
- [ ] **Send now** records the open blockers and adds the line to the brief. **Withdraw** applies before the start receipt and **Stop the work order** after it, and no toast claims nothing started without the receipt.
- [ ] `record_work_order_start` moves a work order to `in progress`, and nothing else does.
- [ ] A send to several agents creates one work order per target, the Work orders tab groups them with `partial`, and accepting one stops its siblings after the dialog says so.
- [ ] **Send again** creates a retry that names the original, and cost never moves.
- [ ] `oxagen-workflow/v0.2` validates `needs` and `return_to` under §8.1, and every v0.1 file reads unchanged.
- [ ] Ready stages start together as separate runs under one cap, a fan-in stage receives every handoff note, and a return marks downstream stages to run again.
- [ ] The builder's **After** and the layered stage chain match §8.3 and §11.3.
- [ ] Every capability in §10 is gated, audited, documented, and tested, and `get_work_graph` loads in all four harnesses.
- [ ] The three page audits in `mockups/pages/` pass against the build, and `check-tasks.mjs` walks flows 9 to 14.
