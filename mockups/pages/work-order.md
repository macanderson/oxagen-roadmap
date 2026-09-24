# Work order

| | |
|---|---|
| Route | `#/a-intel/core-platform/tasks/work-orders/<woId>`, for example `wo_01K6T9QX` |
| Scope | workspace |
| Spec | `docs/tasks-spec.md` §9.5 (what sending records), §9.6 (delivery), §10.3 (running a workflow), §11 (completing work) |
| Design | `mockups/src/engine.js` → `pWorkOrder()`, `stageChain()`, `woItemsFor()`, `DLG_EXT.woaccept`, `DLG_EXT.wostop`; data `mockups/fixtures/tasks.json` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / Workspace / Work order`: one story per state, desktop and mobile |
| Audit | `work-order.audit-prompt.md` |
| Check | `node tools/check-tasks.mjs` (flows 5 and 7) |

## Job

One work order from the moment it is sent to the moment a person accepts it: which agent has it now, which items are claimed and on what evidence, what each stage handed to the next, and the prompt exactly as sent.

## What is on the page

**Header**: eyebrow the id in mono, h1 the title, subtext "Sent by <name> on <time> to <agent, or the <name> workflow>."
Actions: **Stop the work order** (red, while it is not accepted or stopped) and **Accept the work** (gold when every item is claimed and the work order is not accepted; otherwise plain and disabled, titled "Every item must be claimed first").

**Tiles**: State (the state badge; "stage N of M", "every item is claimed", or "on <time>"), Items claimed ("by the agents, with evidence"), Items accepted ("by a person"), Returns ("1 of 2", "work sent back to an earlier stage").

**Stages**: the chain, one card per stage and a dashed last card for **Accept** by You. Each card: the step number and role, the agent's harness mark, avatar and name, and its latest run (`live` or `sealed`, the run id, and "N runs" when the stage ran more than once), or "waiting". A finished stage is marked done, the current stage is outlined in gold, and the Accept card is outlined when the work waits on you. A single-agent work order has one stage and Accept.

Then two columns.

**Left**
- **Definition of done**, "N items from N tasks.": Item (text and tag) · Task (the numbers it came from, or "work order") · Stage (the role that owns it) · State (`open`, `claimed`, `accepted`) · Evidence (what the claim cited, with the agent and the run). The table does not page.
- **Handoffs**: every stage run in order, "<role>" or "<role> returned the work", its run id, and its note, or "running". Note: "A handoff note reaches the next stage as quoted evidence. It is never an instruction to that agent."

**Right**
- **Tasks**: each task's provider logo, number, and subject, linking to the task.
- **Repositories**: the repositories the work order may change, "Branches and pull requests only. The production branch is never pushed.", and the pull request when one exists.
- **Prompt**: the digest in the header, the brief as sent in a monospace block, and "As sent. A sent prompt cannot change."

## Dialogs

- **`woaccept`**: "Accept the work", "You accept N items the agents claimed, with the evidence each one cited." The note that accepting records `accept_work_order` and merges nothing, naming the pull request a person merges on GitHub, and what the connection's close switch does. Footer **Cancel**, **Accept every item** (gold). Accepting marks every item `accepted`, the state `accepted`, and each task `accepted`.
- **`wostop`**: "Stop this work order?", "The live run gets a cancel at its next boundary, and no later stage starts.", and that branches and pull requests stay and the tasks go back to ready with their certifications unchanged. Footer **Keep it running**, **Stop it** (red).

## Data sources

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Work order, prompt, digest, repositories | `WORKORDERS[]` | `tasks.work_orders` | nothing | ❌ |
| Stages and handoffs | `WORKORDERS[].runs`, `WORKFLOWS` | `tasks.work_order_stages`, `.oxagen/workflows/*.toml` | nothing | ❌ |
| Claims and acceptance | `WORKORDERS[].claims` | `tasks.item_claims` | nothing | ❌ |
| Runs | run ids | the run ledger, with the work order as the run's task reference | the ledger exists; `task_ref` is recorded by nothing | 🟡 |
| Cancelling a live run | `wostop` | `dispatch_command` with `cancel` | exists for live runs | ✅ |

## States

- **loaded**: `wo_01K6T9QX`, "Same-minute migration stamps", on the Fix, validate, document, review workflow at stage 2 after one return, 2 of 4 items claimed. `wo_01K6TA2M` waits on you with every item claimed. `wo_01K6RZ41` is accepted.
- **not found**: "No work order has this id", with **Back to work orders**.
- **loading**: the skeleton. **error**: "This work order could not be loaded", `503 work_order_store_unavailable`. **access denied**: "You cannot see this work order", `work_order.read on core-platform`.

## Mobile

The stage chain stacks one card per row without arrows. The columns stack, the left first. The definition-of-done table becomes labelled cards.

## Permissions

- Read: `task.read`
- Writes, each a governed action in Audit: `work_order.accept` (accept or stop)

## Rules every build of this page must keep

- A claim is the agent's word, labelled with the agent and the run. An acceptance is a person's. The page never shows a claim as accepted.
- Accept is enabled only when every item is claimed. Accepting merges nothing.
- The prompt is shown as sent, with its digest, and cannot be edited here.
- A handoff note is quoted evidence, and the page says so.
- The page shows each stage agent's tier, and never claims enforcement stronger than that tier gives.
