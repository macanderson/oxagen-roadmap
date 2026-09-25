# Work in flight

| | |
|---|---|
| **Status** | Spec v1, for design review. No code is written against it yet. |
| **Date** | 2026-09-24 |
| **Owner** | Mac Anderson |
| **Extends** | `tasks-spec.md` (providers, the task record, the definition of done, work orders, and workflows). §2 lists every line of it this spec changes. |
| **Builds on** | ADR-043 (Oxagen governs agents, it does not run them), ADR-162 (a run resolves an issue when dispatch, PR link, and merge agree), ADR-101 (four first-class harnesses), ADR-113 (the product name, and "Dispatch" reserved), ADR-025 (verb-first capability names, no aliases) |
| **Related** | `mission-control-spec.md` §6.7 (taint), §7.3 (delivery modes), §7.6 (messages between agents), `creation-spec.md` (every definition is a file), `dod-spec.md` |
| **Pages** | None yet. The In flight tab (§8.7) and the Scope section of the work order screen (§7.2) need mockup pages and audit prompts before the build. |

## 1. The situation

You have more ready tasks than one agent can work, and several agents that could work them. Send
them all at once and two agents edit the same file, both stamp a migration with the same timestamp,
and each opens a pull request that conflicts with the other. Send them one at a time and every agent
but one sits idle. The agents cannot ask each other anything, because each runs in its own harness on
its own host, and nothing carries a question from one to another except a person. Nobody knows how
long a task will take, so nobody can say whether the budget covers the work before it starts.

`tasks-spec.md` reads tasks from six providers, certifies a definition of done for each, and sends
ready tasks to one agent or one workflow in a work order. This spec adds what running many work
orders at once needs:

1. **CSV upload**, a seventh source for work that lives in no tracker (§3).
2. **Four task fields**: provider id, source url, priority, and estimated agent minutes. Actual agent
   minutes is derived from the record, never imported (§4, §5).
3. **Messages between agents** on different runtimes, carried and recorded by Oxagen (§6).
4. **Scope claims**, which say what each work order may change and find the work orders that would
   collide (§7).
5. **The plan**, which places ready tasks into work orders that run in parallel where they do not
   collide and in order where they do (§8).
6. **One record of handed-off work.** ADR-162's dispatch and the work order become the same record (§9).

Nothing here runs an agent. Oxagen records, orders, and gates work orders, and each runtime starts its
own runs (ADR-043, tasks-spec §9.6).

## 2. What this changes in tasks-spec.md

| tasks-spec.md | Change |
|---|---|
| §2 Scope | CSV upload joins day 1. |
| §4 Issue provider | Seven sources: the six providers and CSV upload. A CSV connection holds no token (§3). |
| §6.1 Fields | Thirteen fields become seventeen: provider id, source url, priority, and estimated agent minutes (§4). Actual agent minutes shows beside them and is never imported. |
| §6.4 Labels | The Priority group gains an order, and the priority field reads its rank (§4.3). |
| §9.3 The work order screen | Gains a **Scope** section between Repositories and Spend cap (§7.2), and shows the estimate and the projected cost (§5.4). |
| §9.4 Mentions | Unchanged: work reaches another agent only through a work order or a workflow stage. A message (§6) carries no work. |
| §9.6 Delivery | `oxagen work start` sets `OXAGEN_WORK_ORDER_ID`, and the first run to claim it wins (§9). |
| §10.3 Running one | A handoff note stays the channel between stages. Messages add a channel between runs that work at the same time. |
| §12, §13, §14 | Gain the capabilities, storage, and permissions in §10, §11, and §12. |
| §19 | The field item reads seventeen fields. |

`tasks-spec.md` already carries five of these changes: its header names this spec, and §3, §4
(Task), §6.1, and §19 read seventeen fields. The other rows take effect through this document.

## 3. CSV upload

Some work lives in no tracker Oxagen reads: a spreadsheet of audit findings, an export from a tool
with no API, or a list a customer sent. CSV upload reads it into tasks like any provider.

### 3.1 The wizard

CSV is the seventh card on step 1 of the connection wizard (tasks-spec §5.1), in a third group,
**Files**. Its steps:

1. **Provider.** CSV upload.
2. **Upload.** One file, at most 10 MB and 20,000 rows, in UTF-8, parsed under RFC 4180. The first
   row is the header. Oxagen stores the file in Blob and records its SHA-256. There is no token, so
   the step shows no **Create values** switch and no **What Oxagen needs** table.
3. **Columns.** Replaces Scope. Each task field lists the column the assistant suggested through
   `suggest_connection_mappings`, marked `suggested`. Subject is required. The id column is optional,
   and it decides what the next upload does (§3.2). A column mapped to no field is not read.
4. **Fields.** The same as any provider: the statuses, resolutions, and labels found in the mapped
   columns, each mapped to an Oxagen value or added as one. There is no **Create in <provider>**,
   because a file holds no values to create.
5. **People.** The Owner and Created by columns hold emails or names. Oxagen suggests a member only
   from a verified email that equals the member's (tasks-spec §7), and never from a name.
6. **Review.** The row count, every rejected row with its reason (the first 20 on screen and all of
   them in a download), and what uploading does.

### 3.2 Identity

- **With an id column**, a task is unique by connection and the id, as with any provider id. Uploading
  a new file to the same connection updates the tasks whose ids match and adds the rest. A file in
  which one id repeats is rejected on step 2, with the repeated ids listed.
- **Without one**, the provider id is the upload id and the row number, so every upload adds new
  tasks. Step 3 says so before you continue: "No id column. Uploading this file again adds its rows
  as new tasks."
- **A task the new file leaves out** stays as it was. Review offers **Close the tasks this file
  leaves out**, off by default, which closes them with resolution `Other`.
- **Order.** Each row takes the upload's time as its `updated at` unless a column maps to Updated at.
  The newer upload wins.

### 3.3 Limits

- A CSV connection has no events and no reconcile. Its tasks change only when a person uploads again.
- It has no write-back, so the four switches of tasks-spec §5.4 are absent, and accepting the work
  closes the task in Oxagen alone.
- The file stays in Blob for 30 days, so a person can see what was read. Then Oxagen deletes it and
  keeps the digest on the upload record.

### 3.4 Safety

- **The text is untrusted.** A row reaches an agent's brief the way an issue body does, as quoted
  evidence, and a tool call built from it is taint-marked (mission-control-spec §6.7).
- **Formulas.** Oxagen stores every cell as text and evaluates none. When the Tasks tab exports to
  CSV, a cell that begins with `=`, `+`, `-`, `@`, a tab, or a carriage return gets a leading `'`, so
  a spreadsheet opens it as text.
- **Personal data.** A help-desk export can carry requester names and emails. Review flags each column
  whose values look like email addresses that match no member, and offers to leave it unmapped.

## 4. Fields

The task record gains four fields, for seventeen in all. The source id you see is still **Number**
(tasks-spec §6.1). Provider id is the key Oxagen matches on.

| Field | GitHub | Linear | Jira |
|---|---|---|---|
| Provider id | record type and database id (ADR-121) | issue `id` | issue `id` |
| Source url | `html_url` | `url` | `https://<site>/browse/<key>` |
| Priority | the Priority label's rank | the Priority label's rank | the Priority label's rank |
| Estimated agent minutes | drafted (§5.2) | drafted | drafted |

| Field | ServiceNow | Salesforce Service Cloud | Zendesk | CSV |
|---|---|---|---|---|
| Provider id | `sys_id` | case `Id` | ticket `id` | the id column, or the upload id and row |
| Source url | `https://<instance>/nav_to.do?uri=incident.do?sys_id=<sys_id>` | `https://<My Domain>/lightning/r/Case/<Id>/view` | `https://<subdomain>.zendesk.com/agent/tickets/<id>` | a mapped column |
| Priority | the Priority label's rank | the Priority label's rank | the Priority label's rank | the Priority label's rank |
| Estimated agent minutes | drafted | drafted | drafted | a mapped column, or drafted |

### 4.1 Provider id

The key tasks-spec §5.3 already matches on, now stored and shown on the task page so a person can find
the record in the provider. It never changes for the life of the task.

### 4.2 Source url

The link to the record in its provider. Oxagen reads it where the API returns the page a person opens
(GitHub `html_url`, Linear `url`) and builds it from the site where the API returns only its own
address (Jira, ServiceNow, Salesforce, Zendesk). Oxagen renders a source url as a link only when its
scheme is `https`, and shows any other value as text. A CSV column is the usual way a non-`https`
value arrives.

### 4.3 Priority

A task's priority is its highest-ranked label in the Priority group (tasks-spec §6.4). The group gains
an order, P0 first, and the field is the rank. A task with no Priority label has priority `none` and
ranks after every label.

- **One scale.** The ten default labels already map every provider's priority. A second scale would
  need a second mapping on seven sources. A workspace that wants five levels adds `P4` to the group,
  and the rank follows the group's order.
- **The provider's word.** Oxagen keeps the provider value the label came from (`priority_raw`), so the
  task page reads "P1, from Jira priority High".
- **Planning priority.** A person may set a task's priority in Oxagen for planning with
  `set_task_priority`, which records who and why. The task page then reads "P0 for planning, P2 in
  Linear". Oxagen writes no priority back to a provider.

### 4.4 Estimated agent minutes

The minutes of agent work a task needs to reach its definition of done, including tests, docs, and
the response to review. It counts neither wall-clock time nor human hours. §5 says how it is drafted
and what it is compared against.

## 5. Estimates

### 5.1 The agent minute

An agent minute is a minute of an agent's active work: the model generating and the agent's tools
running. Idle time, time waiting on a person, and time parked in Approvals do not count.

Oxagen reads a run's minutes from `tacho.sessions`, in this order:

1. `active_time_s`, where the harness reports it.
2. Otherwise `api_duration_ms` plus `tool_duration_ms`.
3. Otherwise the run's minutes are `unknown`.

The two sources can differ for the same work: tool calls that run at once count once in active time
and once each in the sum. The task page names the source each run used. A work order whose runs
include an `unknown` shows its total as a lower bound: "at least 52 agent minutes".

### 5.2 Drafting

The assistant drafts the estimate in the same turn that drafts the definition of done (tasks-spec
§8.2), because the items are what the minutes pay for. It stores a point value and a range, and writes
its basis under **Assistant notes**:

> 45 agent minutes, likely 30 to 80. Four items: a fix, a regression test, a docs line, and review.
> Six accepted Bug tasks in `acme/api` took a median of 38.

- **Comparables.** The assistant compares against accepted work orders in the workspace whose tasks
  share a label and a repository, with their actual minutes (§5.3). With fewer than three comparables
  it says so and widens the range.
- **Editing.** A person edits the estimate with `set_task_estimate`. The estimate is planning data, so
  an edit does not send a certified task back to draft. Certification records the estimate beside the
  digest of the items, and the digest does not cover it.
- **Provider estimates.** Jira's `timeoriginalestimate` and Linear's `estimate` are shown as the
  provider's estimate and never converted, because story points and human hours are not agent minutes.
- **A work order's estimate** is the sum of its tasks' estimates. In a workflow, each stage's share
  follows the share of items it owns.

### 5.3 Actual agent minutes

A work order's actual minutes are the sum of the minutes of every run bound to it (§9), across every
stage and every return. A task in a work order with several tasks shows the work order's total and
says the total is shared. When a person accepts a work order, Oxagen records its actual minutes on
it, so the figures below never rescan the runs.

### 5.4 Projected cost

The work order screen shows a projected cost: the estimate times the agent's cost per agent minute
over its last 20 sealed runs.

- With fewer than 5 sealed runs, the screen shows "Too few runs to project" and no figure.
- A stage on Cursor has no projection, because Cursor's model calls do not pass through the Oxagen
  gateway and its cost is not metered (tasks-spec §9.3).
- The projection sits beside the spend cap and each target agent's remaining mandate budget for the
  period. A projection over the cap is a warning, and the cap still binds. A projection over the
  mandate's remaining budget parks the send in the Approvals drawer under the workspace's decision
  rules (`packages/rules`).

### 5.5 Calibration

Every accepted work order holds its estimate and its actual minutes. The Work orders tab shows, for
each agent, the median of actual over estimate across its last 20 accepted work orders, and the
assistant reads the same figures when it drafts (§5.2). An accepted work order has a certified
definition of done, a person's acceptance, and a cost, so the operator review reads it as a bounded
task when it reports outcome per dollar.

## 6. Messages between agents

### 6.1 The need

Two agents working related tasks at once need to ask each other things. "Are you changing the `Run`
type?" "I renamed `task_ref`. Rebase before you push." Today the question reaches the other agent only
if a person carries it.

`mission-control-spec.md` §7.6 defines the message: queued for a run, delivered at a boundary,
entered as quoted evidence with the sender named, and bounded. This section adds who may message whom
while work is in flight, how a message crosses runtimes, and what a message can and cannot change.

### 6.2 Capabilities

`send_agent_message` and `list_agent_messages`, on the `mcp` and `agent` surfaces for an agent and on
`api` and `cli` for an operator. §7.6 calls them `send_message` and `list_messages`. Oxagen already
registers `send_message` for chat (`packages/oxagen/src/contracts/chat.message.send.ts`), and ADR-025
allows no alias, so the agent message takes the longer name.

| Input | Meaning |
|---|---|
| `to` | A run id, a work order id (every live run of it), or an agent slug (every live run of that agent, §7.6) |
| `kind` | `question`, `answer`, or `notice` |
| `body` | Markdown, at most 4,000 characters |
| `in_reply_to` | The message an `answer` replies to. It joins the answer to the thread. |
| `delivery` | A delivery mode from mission-control-spec §7.3. The default is `next_step`. |
| `expires_in` | The default is one hour, and the most is 24 hours. |

The output is the message id and, for each recipient run, its status: `queued`, `applied`,
`expired`, `failed`, or `refused`, with the reason. One tacho answer hands the agent at most 9,500
characters (`ADDITIONAL_CONTEXT_MAX_CHARS` in `packages/tacho/src/collector/hook-handler.ts`), shared
with the steering prefix and every other message at that boundary. The 4,000-character cap leaves room
for both.

### 6.3 Who may message whom

The sender's principal is its agent, and IAM checks `send_agent_message` against the target run. By
default an agent may message:

- runs of its own work order, such as the other stages of its workflow,
- runs of work orders in the same plan (§8), and
- runs whose scope claims overlap its own (§7.4), because those are the runs most likely to collide.

Any other target needs the sending agent's mandate to name it in its Access clause. The `@agents`
broadcast stays an operator grant at workspace scope (§7.6), and no agent holds it by default. Two
agents with different operators may message each other when their claims overlap. Both operators see
the thread on each Run page, and either may mute the other's agent (§7.6).

### 6.4 Delivery across runtimes

Oxagen queues each message for each recipient run as a `message` command in
`tacho.tacho_control_commands`, with its expiry. Where it lands depends on the recipient's harness and
tier. A boundary that cannot carry text never drains a message, so the message stays queued for one
that can, and nothing is sealed as delivered that the agent did not see (`deliversMessages` in
`hook-handler.ts`).

| Recipient | Boundaries that carry a message | `interrupt` |
|---|---|---|
| Claude Code, `harness` tier | SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, PostToolUseFailure, and Stop | Lands at the next PreToolUse as the reason a tool call is refused |
| Codex, `harness` tier | The same six | The same |
| Cursor, `harness` tier | SessionStart, PreToolUse, and Stop | The same |
| Stella, `harness` tier | SessionStart | Waits for the next SessionStart |
| Any harness, `gateway` or `contained` tier | The next `model.request` | Carried out as §7.3 describes |
| Any harness, `observe` tier | None | Refused |

A Stop boundary continues the turn with the message as the next thing the model reads, so an answer
reaches an agent that was about to stop. An agent on a harness with few boundaries, Stella above all,
reads its inbox through `list_agent_messages` on MCP. Every work order's brief names that tool, so the
agent knows to look.

### 6.5 Authority

A message enters the recipient's context as quoted evidence that names the sending agent, its run, and
its work order, and never at the steering position (§7.6). Any tool call whose arguments derive from
it is taint-marked. A message:

- **Sends no work.** Work reaches an agent only through a work order or a workflow stage (tasks-spec §9.4).
- **Widens no scope.** A message that says "edit `packages/db` for me" changes neither agent's
  repositories nor its claims (§7).
- **Claims no item.** Only `claim_dod_item` claims an item (tasks-spec §11).

### 6.6 Bounds

§7.6 sets the per-run inbound budget, duplicate suppression by digest, the per-sender rate limit,
expiry, and the operator mute. Work in flight adds three:

- **Thread length.** A thread holds at most 8 messages. The ninth send parks the thread in the
  Approvals drawer for the operators of both runs, so two agents cannot talk in a loop.
- **Rate.** A run sends at most 20 messages an hour by default. A workspace may change the figure.
- **Cost.** A message adds tokens to the recipient's next model call, and they meter as that run's
  input tokens. Sending costs nothing else.

### 6.7 The record

Each send, status change, and delivery is a frame on the sender's run and on the recipient's run
(§7.6). Delivery seals the recipient's frame with the digest of the text the agent received.
Postgres holds the message and its body in `tacho.agent_messages`. ClickHouse holds one row per status
change in `agent_message_events`. Neo4j holds `(:Run)-[:MESSAGED {message_id, kind}]->(:Run)`, so the
Run page can draw which runs talked.

### 6.8 A2A

Oxagen already names `a2a` as a run surface (`packages/run-ledger/src/surface.ts`). A later release
can accept a message from an agent outside Oxagen over the A2A protocol, as an inbound principal whose
grants are intersected with the target's, and can send one out. Day 1 carries messages only between
runs Oxagen records.

## 7. Scope claims

### 7.1 The claim

A claim states what a work order may change: a repository, a path glob, and a mode.

| Repository | Glob | Mode |
|---|---|---|
| `acme/api` | `packages/billing/**` | `exclusive` |
| `acme/api` | `packages/database/atlas/migrations/**` | `exclusive` (serial, §7.3) |
| `acme/api` | `docs/**` | `shared` |

An `exclusive` claim conflicts with any overlapping claim. Two `shared` claims never conflict. Globs
use the one glob implementation in the codebase, `matchesGlob` in `packages/glob`. A claim always sits
inside the work order's repositories (tasks-spec §9.3), which it narrows and never widens.

### 7.2 Where claims come from

Each claim records its source.

1. **Predicted.** On the work order screen, a new section, **Scope**, sits between Repositories and
   Spend cap. The assistant fills it from the tasks, the items, and the files that similar accepted
   work orders and the tasks' linked pull requests changed. A person edits it, and the send records it.
2. **Declared.** During the run, the agent calls `claim_scope` for a path it finds it needs. Oxagen
   grants the claim when no live claim conflicts. Otherwise it returns the conflicting work order and
   its agent, so the agent can message that run (§6) or wait.
3. **Observed.** Every file a run writes, edits, or deletes (`tacho.session_files`) is an observed
   claim. An observed path outside every predicted and declared claim is an **undeclared edit**,
   shown on the work order page and on the Run page.

### 7.3 Serial resources

Some paths conflict whatever the tasks say: two migrations stamped in parallel, two lockfile updates,
or two regenerations of one type file. A repository names them in `.oxagen/serial.toml`, changed by
pull request like every other definition (`creation-spec.md`).

```toml
# .oxagen/serial.toml
schema = "oxagen-serial/v0.1"

[[serial]]
name = "Postgres migrations"
paths = ["packages/database/atlas/migrations/**", "packages/database/atlas/atlas.sum"]

[[serial]]
name = "Lockfile"
paths = ["pnpm-lock.yaml"]

[[serial]]
name = "Message types"
paths = ["apps/app/src/i18n/messages.d.ts"]
```

A claim that touches any path in a group is exclusive over the whole group. The plan (§8) never runs
two work orders that touch one group at the same time. A repository with no file gets a suggested one
from the assistant, as a pull request, drawn from its lockfiles and migration directories.

### 7.4 Conflicts

Two claims conflict when they name the same repository, at least one is exclusive, and their globs can
match one path. Deciding that exactly for two globs is costly, so Oxagen compares literal prefixes:
the part of each glob before its first `*`, `?`, `[`, or `{`. Two globs overlap when one prefix starts
with the other. Every path a glob matches begins with its prefix, so two globs whose prefixes diverge
share no path. The test can report an overlap where no file is shared, and it can miss none. A person
can mark such a pair `no conflict` for one plan.

Oxagen checks for conflicts at four points:

- **Planning** (§8), between the plan's predicted claims and the live claims of every work order in
  flight.
- **Declaration.** `claim_scope` refuses a path that a live exclusive claim holds.
- **Observation.** An edit inside another live work order's exclusive claim is a **collision**. It
  shows on both work orders and on the In flight board, and Oxagen sends a `notice` to both runs
  naming the path and the other work order.
- **Pull requests.** When a run records an `oxagen:pr_link` frame, Oxagen reads the pull request's
  changed files and compares them with the open pull requests of other work orders in that repository.
  Two pull requests that change one file are marked on both work orders, so whoever merges second knows
  to rebase.

### 7.5 Enforcement by tier

The page claims no more than the tier enforces, as tasks-spec §9.6 requires.

| Tier | An edit outside the work order's claims | An edit inside another work order's exclusive claim |
|---|---|---|
| `observe` | Recorded as an undeclared edit | Recorded as a collision |
| `harness` | A PreToolUse hook asks the agent to call `claim_scope` first | The PreToolUse hook denies the write and names the other work order |
| `gateway`, `contained` | Refused until claimed, through the same path that refuses a write to another repository (tasks-spec §9.6) | Refused |

At the `harness` tier the hook is client-attested and fails open against the person at the keyboard.
Cursor has no `ask` on preToolUse, so where the hook would ask, it denies with the reason. Oxagen takes
no file locks. A claim is a record and a gate at the tier's boundary, and git and the repository's
merge rules stay the final word on what lands.

### 7.6 Leases

A claim is live while its work order is open, and its lease renews with every frame the run's host
ships. With no frame for 60 minutes, the claim reads `stale`, the threshold at which ADR-162's link
health reads Offline. A stale claim still blocks the plan from sending a work order that conflicts with
it, because an offline laptop may still hold unshipped edits. A person releases it with
`release_scope_claim`, recorded in Audit.

A claim releases on its own when its work order is accepted or stopped, or when the work order's pull
request in that repository merges.

## 8. The plan

### 8.1 What it is

Horsepower here means more work orders in flight at once, sent so they do not collide. A plan takes
ready tasks and the agents you operate, and proposes work orders with an order between them. An edge
from work order A to work order B means B waits for A. Work orders with no path between them run in
parallel.

### 8.2 Inputs

- **Tasks**: priority (§4.3), estimate (§5.2), and predicted claims (§7.2).
- **Conflicts**: overlapping claims (§7.4) and shared serial groups (§7.3), among the plan's tasks and
  against every work order already in flight.
- **Provider order**: a Linear `blocks` relation, a Jira `is blocked by` link, or a GitHub sub-issue or
  tracked-by relation, read at import.
- **Agents**: the targets the person picked, each with its capacity (§8.5), or a pool (§8.6).
- **Money**: the plan's spend cap and each agent's remaining mandate budget.

### 8.3 Placement

The assistant supplies the predicted claims and the estimates. A pure function, `planWorkOrders`, does
the placing, so the same inputs always produce the same plan and a test can pin it. Its rules, in
order:

1. **Provider order first.** A blocker comes before what it blocks, whatever their priorities.
2. **Group small conflicts.** Tasks joined by a conflict go into one work order when their estimates
   sum to 120 agent minutes or less, because one agent editing both costs less than two agents
   rebasing.
3. **Sequence large conflicts.** Otherwise the work orders that conflict run in sequence: higher
   priority first, then the smaller estimate, then the lower task number.
4. **Parallelize the rest**, up to each agent's capacity and within the money.

Every placement carries one reason: "Waits for WO-12. Both change
`packages/database/atlas/migrations/**`." or "Grouped with #481. Both change
`apps/app/src/features/runs/**`." A person can move a task, split or merge work orders, or mark a
conflict `no conflict`, and the plan recomputes after each edit.

### 8.4 Sending

**Send the plan** records `send_plan`: every work order with its brief (drafted as in tasks-spec
§9.3), its claims, its estimate, its projected cost, and the order. Work orders with no predecessor
are sent at once. A queued work order is sent when every predecessor's claims release (§7.6), the
target has a free slot, and the projected cost still fits the plan's cap and the mandate's remaining
budget. Otherwise it waits and says what it waits for.

Oxagen sends a queued work order only inside a plan a person sent, and only to the target that
person chose. Rules that send without a person stay out of day 1 (tasks-spec §2). The runtime still
starts each run (tasks-spec §9.6). On day 1 a queued work order that becomes sendable reaches the
host's collector, and Oxagen notifies the person at the host to run `oxagen work start`.

### 8.5 Capacity

Each agent has `max_open_work_orders`, default 1, a field on its registration changed with
`update_agent`. An agent that runs in several checkouts at once may hold more. The planner never
gives an agent more open work orders than its capacity, and a work order over it waits with the reason
"Waits for a free slot on a-intel.core.bug-fixer".

### 8.6 Pools

A work order may target a pool: a named set of agents you operate that can each do the work, such as
three bug fixers on three hosts. The work order reaches every host in the pool. The first run to claim
it wins, by the conditional update ADR-162 specifies for a dispatch. A later claim is refused and
recorded. A pool grants nothing and steers no agent, so it is a row in Postgres rather than a file, as
tasks-spec §6.6 reasons for field settings. On day 1 every agent in a pool is one you operate.

### 8.7 The In flight tab

A fourth tab on the Tasks page, beside Tasks, Work orders, and Workflows. One row per open work order,
grouped by plan:

| Column | Shows |
|---|---|
| Work order | Its number and its tasks |
| Agent | Harness mark, name, host, and tier, or the pool and the agent that claimed it |
| State | §8.8 |
| Scope | The claims, with collisions and undeclared edits flagged |
| Minutes | Estimate and actual so far |
| Cost | Projected and spent so far |
| Waits for | The predecessor, the free slot, or the budget, with the reason |
| Link | Current, Delayed, or Offline, as ADR-162 defines link health |
| Messages | The thread count, with parked threads flagged |

The Tasks nav count (tasks-spec §15) adds collisions, parked threads, and stale claims, because each
waits on a person.

### 8.8 Work order states

| State | Entered when |
|---|---|
| `queued` | The work order is in a sent plan and waits for a predecessor, a free slot, or budget. |
| `sent` | It reached a runtime, and no run has claimed it. |
| `in_progress` | A run claimed it, and the control plane has received a frame from that run sealed after the send. |
| `pr_opened` | A bound run's chain carries an `oxagen:pr_link` frame. |
| `waiting_on_you` | Every item is claimed (tasks-spec §11). |
| `accepted` | A person accepted the work. Terminal. |
| `stopped` | A person stopped the work order. Terminal. |

One pure function, `evaluateWorkOrder(facts)`, derives the state from stored facts, as ADR-162 derives
a dispatch's state. A late WAL, or a webhook that beats the frame it follows, still reads the right
state once both facts are stored. Collisions, parked threads, and stale claims are flags beside the
state, not states of their own.

## 9. Relationship to ADR-162

ADR-162 (accepted 2026-09-23, not built) records a dispatch: one GitHub issue handed to a run or to an
agent, resolved when four facts hold. A work order is the same act for any provider and for several
tasks at once. Building both would give Oxagen two records of "this work was handed to this agent".
An ADR that amends ADR-162 folds them into one.

- **The record.** `tasks.work_order_bindings` holds one row per work order, task, and run, and
  replaces `tacho.issue_dispatches` before either is built. `tacho.run_pull_requests`,
  `tacho.github_pull_request_facts`, and `tacho.issue_resolutions` stay as ADR-162 specifies, keyed by
  the binding instead of the dispatch.
- **The capabilities.** `send_work_order` replaces `dispatch_issue`, because one task sent to one agent
  is the smallest work order. `get_work_order`, `list_work_orders`, and `stop_work_order` replace
  `get_issue_dispatch`, `list_issue_dispatches`, and `abandon_issue_dispatch`. No capability name then
  carries the word ADR-113 reserves.
- **The claim.** `OXAGEN_WORK_ORDER_ID` replaces `OXAGEN_DISPATCH_ID`, and `oxagen work start` sets it.
  The run's `agent_start` carries `attrs["oxagen.work_order_id"]`, and ingest binds the run with
  ADR-162's first-claim-wins update. Pools use the same update (§8.6).
- **Resolution.** For a GitHub task, the four facts are the evidence of done: the task was sent in the
  work order, the run's chain names the pull request in a `pr_link` frame, the pull request merged, and
  GitHub lists the issue in its `closingIssuesReferences` or the issue's close names the merge commit.
  The work order page shows the evidence beside the agent's claims. Acceptance stays a person's act
  (tasks-spec §11), and resolution is evidence for it. Linear, Jira, the help desks, and CSV have no
  closing-reference source yet, so their tasks rely on acceptance alone until one is specified for
  each.
- **States.** ADR-162's `dispatched` is `sent`, `in_progress` and `pr_opened` keep their names,
  `merged` and `resolved` are facts shown under `pr_opened` and `waiting_on_you`, and `abandoned` is
  `stopped`.
- **The rest.** The webhook branches, the 15-minute reconcile, and link health carry over as ADR-162
  specifies them.

## 10. Capabilities

Every name is verb-first snake_case (ADR-025). Management capabilities carry `noBillingGate: true`.

| Capability | Surfaces | Notes |
|---|---|---|
| `upload_task_csv` | api, app, cli | Stores the file, records its digest, and reads its rows into the connection (§3) |
| `set_task_estimate` | api, app, cli | A person's estimate (§5.2) |
| `set_task_priority` | api, app, cli | Planning priority, in Oxagen only (§4.3) |
| `send_agent_message`, `list_agent_messages` | mcp, agent, api, cli | An agent sends as its principal, and an operator through api or cli (§6) |
| `claim_scope` | mcp, agent | Agent only, inside the work order's repositories (§7.2) |
| `list_scope_claims` | api, mcp, app, cli, agent | The live claims in a repository |
| `release_scope_claim` | api, app, cli | Signed-in person only (§7.6) |
| `create_plan`, `update_plan` | api, app, cli | Runs `planWorkOrders`, with the assistant's predicted claims and estimates (§8.3) |
| `send_plan` | api, app, cli | The sender must operate every target agent (§8.4) |
| `create_agent_pool`, `update_agent_pool` | api, app, cli | §8.6 |

Existing capabilities it changes:

- `send_work_order` gains a pool target and claims, and replaces ADR-162's `dispatch_issue` (§9).
- `get_work_order` returns the claims, the thread count, and the state from §8.8.
- `update_agent` gains `max_open_work_orders` (§8.5).

The agent-facing tools (`send_agent_message`, `list_agent_messages`, `claim_scope`, and
`list_scope_claims`) must load in Claude Code, Codex, Cursor, and Stella (ADR-101).

## 11. Storage

| Store | What |
|---|---|
| Postgres | `tasks.csv_uploads`. New columns on `tasks.tasks`: `provider_id`, `source_url`, `priority_rank`, `priority_raw`, `priority_override`, `estimate_minutes`, `estimate_low`, `estimate_high`, and `estimate_basis`. `actual_minutes` on `tasks.work_orders`, written at acceptance. `tasks.scope_claims`, `tasks.plans`, `tasks.plan_edges`, `tasks.agent_pools`, `tasks.work_order_bindings` (§9), and `tacho.agent_messages`. Every table is tenant-scoped under RLS through `withTenantDb`. |
| ClickHouse | `csv.uploaded`, `estimate.drafted`, `estimate.changed`, `claim.made`, `claim.collided`, `claim.undeclared`, `claim.released`, `plan.sent`, `work_order.released_from_plan`, and `agent_message_events` |
| Neo4j | `(:Run)-[:MESSAGED]->(:Run)`, `(:WorkOrder)-[:WAITS_FOR]->(:WorkOrder)`, and `(:WorkOrder)-[:IN]->(:Plan)` |
| Blob | Uploaded CSV files, kept 30 days |
| Files | `.oxagen/serial.toml` in each repository |

Run minutes are read from `tacho.sessions` and not copied. The Postgres tables are a schema change,
so the pull request that adds them carries `migration-required` (SCR-006).

## 12. Permissions

| Permission | Allows | Default |
|---|---|---|
| `issue_provider.connect` | Create a CSV connection (tasks-spec §14) | workspace owner |
| `task.upload` | Upload a file to an existing CSV connection | workspace owner, and members granted it |
| `task.estimate` | Edit an estimate or a planning priority | workspace member |
| `work_order.send` | Create and send a plan, to agents the sender operates | workspace member |
| `scope_claim.release` | Release a stale claim | the work order's sender, and workspace owners |
| `agent_message.send` | Send a message to a run as an operator | the run's operator, and workspace owners |

An agent's own messages and claims are gated by IAM on its principal (§6.3, §7.2), not by a member
permission. Every write is gated server-side, whatever the UI hides.

## 13. Decisions

Each becomes an ADR before the code it governs merges.

1. **The work order is the dispatch record.** Amends ADR-162 as §9 describes.
2. **The agent message capability is `send_agent_message`.** `send_message` belongs to chat, and
   ADR-025 allows no alias. `mission-control-spec.md` §7.6 adopts the name.
3. **Priority is the rank of a label group.** One scale, mapped once per provider (§4.3).
4. **An agent minute is active model and tool time.** Its sources in order, and a provider's estimate
   shown as the provider's and never converted (§5.1, §5.2).
5. **A claim is a record and a gate at the tier's boundary.** Oxagen takes no file locks (§7.5).
6. **Serial resources are a file in the repository** (§7.3).
7. **A pure function places the plan, and the assistant supplies its inputs** (§8.3).
8. **A plan sends a queued work order only inside the order a person sent** (§8.4).

## 14. Open questions

- Should `shared` claims exist, or should every claim be exclusive and the plan group more?
- Is 120 agent minutes the right limit for grouping conflicting tasks? Measure it against the first 50
  accepted work orders.
- Should a thread between two agents with different operators wait for either operator before the
  first message is delivered?
- Should the planner predict claims from which files past pull requests changed together, at the cost
  of a graph query per task?
- Is 20,000 rows enough for an audit export?
- A Cursor agent never gets a projected cost. Is an estimate without a cost worth showing?
- Should pools span operators once workflows do (tasks-spec §2, Later)?

## 15. Definition of done for the build

- [ ] A workspace uploads a CSV through the wizard, maps its columns with suggestions, and uploads again with and without an id column as §3.2 describes.
- [ ] An export prefixes every cell that begins with `=`, `+`, `-`, `@`, a tab, or a carriage return, with a test for each.
- [ ] Tasks from all seven sources carry provider id, source url, priority, and estimated agent minutes, and only an `https` source url renders as a link.
- [ ] The assistant drafts an estimate with a range and its basis, and a person edits it with `set_task_estimate` without leaving ready.
- [ ] A work order's actual minutes sum its runs from `active_time_s`, fall back to API plus tool duration, and show a lower bound when a run reports neither.
- [ ] Projected cost appears only with 5 or more sealed runs, and a projection over the mandate's remaining budget parks the send in Approvals.
- [ ] `send_agent_message` and `list_agent_messages` load in all four harnesses, and a test covers each row of the delivery table in §6.4.
- [ ] A message enters the recipient as quoted evidence, and a tool call built from it is taint-marked.
- [ ] A thread parks at 8 messages, and the rate limit and expiry hold.
- [ ] Claims come from prediction, declaration, and observation, and `claim_scope` refuses a path a live exclusive claim holds.
- [ ] A property test finds no pair of globs that share a path while the prefix test reads them as separate.
- [ ] `.oxagen/serial.toml` is read, and two work orders that touch one serial group never run at once.
- [ ] A collision shows on both work orders and sends a notice to both runs, and at the `harness` tier the PreToolUse hook denies a write inside another work order's exclusive claim.
- [ ] Two open pull requests from different work orders that change one file are flagged on both.
- [ ] `planWorkOrders` is a pure function with tests for provider order, grouping, sequencing, ties, capacity, and money, and every placement carries a reason.
- [ ] A sent plan sends a queued work order only when its predecessors' claims release and its cost fits, and only to the target the person chose.
- [ ] A pool work order binds to the first run that claims it, and a second claim is refused and recorded.
- [ ] `evaluateWorkOrder` derives the state from stored facts, with a test for each order in which the facts can arrive.
- [ ] The ADR that amends ADR-162 is accepted, and a GitHub work order shows the four facts as evidence.
- [ ] The In flight tab shows every column in §8.7, covered by component tests, and its mockup page passes its audit.
- [ ] Every capability in §10 is gated, audited, documented, and tested.
