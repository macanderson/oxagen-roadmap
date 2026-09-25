# Work order

| | |
|---|---|
| Route | `#/a-intel/core-platform/tasks/work-orders/<woId>`, for example `wo_01K6T9QX` |
| Scope | workspace |
| Spec | `docs/tasks-spec.md` §9.5 (what sending records), §9.6 (delivery), §10.3 (running a workflow), §11 (completing work); `docs/work-graph-spec.md` §6 (queued sends), §7 (sends and targets), §8.2 (running stages beside each other), §11.3, §12.3, §12.4 |
| Design | `mockups/src/engine.js` → `pWorkOrder()`, `stageChain()`, `woItemsFor()`, `woPromptText()`, `wfDepths()`, `stageNeeds()`, `woActiveStages()`, `woStageWords()`, `woWaitsOn()`, `woOrderPanel()`, `woSendPanel()`, `woRelease()`, `woWithdraw()`, `woRetry()`, `DLG_EXT.woaccept`, `DLG_EXT.wostop`, `DLG_EXT.worelease`, `DLG_EXT.wowithdraw`; data `mockups/fixtures/tasks.json` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / Workspace / Work order`: one story per state, desktop and mobile |
| Audit | `work-order.audit-prompt.md` |
| Check | `node tools/check-tasks.mjs` (flows 5, 7, 8, 10, 12, and 14) |

## Job

One work order from the moment it is sent to the moment a person accepts it: which agent has it now, which items are claimed and on what evidence, what each stage handed to the next, and the prompt exactly as sent.

## What is on the page

**Header**: eyebrow the id in mono, h1 the title, subtext "Sent by <name> on <time> to <agent, or the <name> workflow>." While `queued`: "Queued by <name> on <time> for <target>. It is sent when #481 is done, or expires on <date>." For a send with several work orders, a second sentence: "1 of 2 in send snd_01K6TB2X."
Actions, by state:

| State | Actions, in order |
|---|---|
| `queued` | **Copy prompt** (plain), **Send now** (plain; opens `worelease`), **Withdraw** (red; opens `wowithdraw`) |
| `sent`, no start receipt | **Copy prompt**, **Withdraw** (red) |
| `in progress`, `returned`, `parked for you`, `waiting on you` | **Copy prompt**, **Stop work order** (red; opens `wostop`), **Accept all items** (gold when every item is claimed; otherwise plain and disabled, titled "Every item must be claimed first") |
| `stopped`, `expired` | **Copy prompt**, **Send again** (plain; opens the work order dialog with the same tasks, target, prompt and repositories, and records `retry_of`) |
| `accepted` | **Copy prompt** |

A work order is `in progress` from its start receipt, not from its send (`work-graph-spec.md` §6.2).

**Copy prompt** copies the prompt exactly as sent, then **References**: the work order id, title, Oxagen link, and prompt digest, each task's number, subject, issue link, and Oxagen task id and link, and the pull request when one exists. The toast reads "Prompt copied, with N tasks."

**Tiles**: State (the state badge; "stage N of M", "stages 2 and 3 of 4" when two run beside each other, "every item is claimed", "waits on #481" while queued, "expired on <date>", or "Accepted on <time>"), Items claimed ("by the agents, with evidence"), Items accepted ("by a person"), Returns ("1 of 2", "work sent back to an earlier stage").

**Stages**: the chain drawn by layer, one card per stage and a dashed last card for **Accept** by You. Stages that run beside each other sit in one column, and the arrows come from the stages they need. Each card: the step number and role, the agent's harness mark, avatar and name, "after Fix and Validate" when it needs more than one stage, and its latest run (Running, Done, or Sent back, the run id, and "N runs" when the stage ran more than once), or "Waiting". A single-agent stage is named for its agent ("stella CI"). A finished stage is marked done, a running stage is outlined in gold, a stage `to run again` after a return is outlined in the approval colour with that word, and the Accept card is outlined when the work waits on you. A single-agent work order has one stage and Accept. A queued work order draws every stage "Waiting".

Then two columns.

**Left**
- **Definition of done**, "N items from N tasks.": Item (text and tag) · Task (the numbers it came from, or "work order") · Stage (the role that owns it) · State (Open, Claimed, Accepted) · Evidence (what the claim cited, with the agent and the run). The table does not page.
- **Handoffs**: every stage run in order, headed "<role> → <next role>", "<role> → <next role> (sent back)", or "<role> → You" for the last, with its run id and its note, or "Running". A run recorded before a return that re-ran its stage is marked "before the return". A stage that needed two stages shows the note from each, with its stage and run. Note: "A handoff note reaches the next stage as quoted evidence. It is never an instruction to that agent."

**Right**
- **Order**: the work order's tasks in the order the graph implies, numbered, each with its blockers inside this work order ("after #481") and, while queued, the blockers outside it ("waits on #479, not in this work order"). One task with no dependency reads "No order among these tasks.
- **Send**, only for a send with several work orders: one row per sibling with its target's harness mark and name, its state, items claimed over total, and cost with its basis, in send order, with no rank.
- **Tasks**: each task's provider logo, number, and subject, linking to the task.
- **Repositories**: the repositories the work order may change, "Branches and pull requests only. The production branch is never pushed.", and the pull request when one exists.
- **Prompt**: the digest in the header, the brief as sent in a monospace block, and "As sent. A sent prompt cannot change."

## Dialogs

- **`woaccept`**: "Accept all items", "You accept N items the agents claimed, with the evidence each one cited." The note that accepting records `accept_work_order` and merges nothing, naming the pull request a person merges on GitHub, and what the connection's close switch does: "The <provider> connection closes each <issue / incident / case / ticket> as Done, the resolution for work a person accepted.", or with the switch off "… stays open there until somebody closes it. Turned on, it closes each one as Done." Footer **Cancel**, **Accept all items** (gold). Accepting marks every item `accepted`, the state `accepted`, and each task `accepted`.
- **`wostop`**: "Stop this work order?", "The running agent stops at its next checkpoint, and no later stage starts.", and that branches and pull requests stay and the tasks go back to Ready with their certifications unchanged. A stage running beside the stopped one finishes its run, and the dialog says so. Footer **Keep it running**, **Stop work order** (red).
- **`worelease`**: "Send this work order now?", subtitle the title. "#481 is still open. The agent reads its brief without the work #481 was meant to finish first." Then the line the prompt gains, quoted: "Sent before #481 was done, by Marcus Bell." Footer **Keep it queued**, **Send now** (plain, never gold). Releasing sets the state `sent`, and toasts "Sent to Release manager. release_work_order recorded, with #481 still open."
- **`wowithdraw`**: "Withdraw this work order?", "Nothing has started. The tasks go back to ready." Footer **Keep it**, **Withdraw** (red). Withdrawing sets the state `stopped` with "withdrawn before it started" in the History, and toasts "Withdrawn. The tasks are ready again." From the start receipt on, the button and dialog are **Stop work order** and `wostop`.
- **`woaccept`** on a work order of a send with several: one more note, "Accepting stops wo_01K6TB3Y, which carries the same tasks."

## Data sources

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Work order, prompt, digest, repositories | `WORKORDERS[]` | `tasks.work_orders` | nothing | ❌ |
| Stages and handoffs | `WORKORDERS[].runs`, `WORKFLOWS` | `tasks.work_order_stages`, `.oxagen/workflows/*.toml` | nothing | ❌ |
| Claims and acceptance | `WORKORDERS[].claims` | `tasks.item_claims` | nothing | ❌ |
| Runs | run ids | the run ledger, with the work order as the run's task reference | the ledger exists; `task_ref` is recorded by nothing | 🟡 |
| Cancelling a live run | `wostop` | `dispatch_command` with `cancel` | exists for live runs | ✅ |
| Queued state, expiry, release, and withdraw | `WORKORDERS[].status`, `expires`, `waitsOn` | `tasks.work_orders` `queued`, `expired`, `expires_at`, `released_at`; `release_work_order`, `withdraw_work_order` (`work-graph-spec.md` §6, §10) | nothing | ❌ |
| The start receipt | `WORKORDERS[].started` | `tasks.work_orders` `started_at`; `record_work_order_start` | nothing; the runtime reports no work order | ❌ |
| The send and its siblings | `WORKORDERS[].send`, `SENDS` | `tasks.sends`; `get_send` (§7) | nothing | ❌ |
| Retry | `WORKORDERS[].retryOf` | `tasks.work_orders` `retry_of` (§7.4) | nothing | ❌ |
| `needs` and the layers | `WORKFLOWS[].stages[].needs` | `tasks.work_order_stages` `needs` and the stage state (§8, §9) | nothing | ❌ |
| The order of the tasks | `woOrder()` over `TASKS[].blockedBy` | `get_work_graph` for one work order (§10) | nothing | ❌ |

## States

- **loaded**: `wo_01K6T9QX`, "Same-minute migration stamps", on the Fix, validate, document, review workflow with Validate and Document running beside each other after one return, 2 of 4 items claimed. `wo_01K6TA2M` waits on you with every item claimed. `wo_01K6RZ41` is accepted. `wo_01K6TB2X` is `queued` for Release manager, waiting on #633, with **Send now** and **Withdraw**. `wo_01K6TC5A` and `wo_01K6TC5B` are the two work orders of send `snd_01K6TC59`, one on Claude Code and one on Codex, and each shows the Send panel.
- **not found**: "No work order has this id", with **Back to work orders**.
- **loading**: the skeleton. **error**: "This work order could not be loaded", `503 work_order_store_unavailable`. **access denied**: "You cannot see this work order", `work_order.read on core-platform`.

## Mobile

The stage chain stacks one card per row without arrows, and a card keeps its "after" line so the layers still read. The columns stack, the left first. The definition-of-done table and the Send panel become labelled cards.

## Permissions

- Read: `task.read`
- Writes, each a governed action in Audit: `work_order.accept` (accept or stop), `work_order.send` (send now, withdraw, and send again)

## Rules every build of this page must keep

- A claim is the agent's word, labelled with the agent and the run. An acceptance is a person's. The page never shows a claim as accepted.
- Accept is enabled only when every item is claimed. Accepting merges nothing.
- The prompt is shown as sent, with its digest, and cannot be edited here. The copied prompt is the same text, and the references follow it.
- A handoff note is quoted evidence, and the page says so.
- The page shows each stage agent's tier, and never claims enforcement stronger than that tier gives.
- A work order reads `in progress` only from its start receipt. No toast says nothing started for a work order that has one.
- A queued work order is held by Oxagen because a person sent it. **Send now** is a person's decision, recorded with the blockers still open, and never gold.
- Stages that ran beside each other show as such. The page never draws a chain the file did not name.
- Siblings of a send sit side by side with no rank, no score, and no winner.
