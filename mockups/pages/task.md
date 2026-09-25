# Task

| | |
|---|---|
| Route | `#/a-intel/core-platform/tasks/<taskId>`, for example `tsk_01K6S7C5PA` |
| Scope | workspace |
| Spec | `docs/tasks-spec.md` §6 (the task record), §8 (the definition of done), §9.1 (selecting); `docs/work-graph-spec.md` §4 (dependencies), §5 (readiness on the graph), §11.2, §12.2 |
| Design | `mockups/src/engine.js` → `pTask()`, `dodRows()`, `tkDraftNow()`, `taskPromptText()`, `tkDepsPanel()`, `tkPathUp()`, `tkLinkAdd()`, `tkUnlink()`, `DLG_EXT.certify`, `DLG_EXT.dodreopen`, `DLG_EXT.tklink`; data `mockups/fixtures/tasks.json` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / Workspace / Task`: one story per state, desktop and mobile |
| Audit | `task.audit-prompt.md` |
| Check | `node tools/check-tasks.mjs` (flows 2, 3, 8, and 13) |

## Job

One task: what the tracker says, what done means for it, who said so, and whether it can be sent. It is where a person reads the assistant's draft, edits it, and certifies it.

## What is on the page

**Header**: eyebrow the provider's logo and the task number in mono ("a-intel/platform#633", "PLAT-231"), h1 the subject, subtext "Imported from <provider>. Updated <time>.", and "Blocked by #481." when an upstream task is open (`work-graph-spec.md` §5).
Actions: **Copy prompt** (plain), **Open in <provider>** (plain; opens the issue), and one primary that follows readiness:

| Readiness | Primary |
|---|---|
| `drafting` | **Draft it now** (gold) |
| `draft` | **Certify definition of done** (gold; disabled with no items) |
| `changed` | **Certify definition of done** (gold) |
| `ready`, open, unblocked | **Send to an agent…** (gold; the send menu of `tasks.md` with this task) |
| `ready`, open, blocked by the graph | the same button, enabled; the work order dialog queues (`tasks.md`, the work order dialog) |
| `ready`, status `blocked` | the same button, disabled, with the reason "Blocked upstream. It can be sent when it is open again." |
| `sent`, `accepted` | **Open the work order** (gold) |

**Copy prompt** copies the task as plain text to paste into an agent session. It carries the number, the subject, and the issue link, the Oxagen task id and link, the description, and the definition of done. The line above the items says who certified them and when, that they were certified before the description changed, or that they are a draft nobody has certified. Then **Work orders**: every work order that carries the task, each with its id, title, when it was sent and to whom, its state, its Oxagen link, and its pull request when one exists. A task in no work order says "No work order carries this task." The toast reads "Prompt copied, with N work orders.", or "Prompt copied, with no work order." for a task in none.

**Changed** (readiness `changed` only): a banner, **Changed since certified**, "The description changed after certification", who edited it and when, and "The certification from <time> no longer matches the task, so it’s no longer ready." Then two panels side by side: **Certified against** and **Now**.

Then two columns.

**Left**
- **Description**: the body as plain text with its line breaks.
- **Definition of done**, with one sentence under the heading: "oxagen.assistant is reading the task.", "A draft. Certify it to make this task ready.", "Certified by <name> on <time>.", or "Closed upstream before anybody certified one." In the header: the wand (redraft) while editable, **Edit** while certified, and the digest while certified.
  - While editable (`draft`, `changed`): each item is a numbered row with a text field, a Tag select (code, test, docs, review), a Kind select (check, review), its source (`from the issue`, `oxagen.assistant`, `you`, `edited by you`), and a remove button. Below them **Add an item** with **Add item** (Enter adds too).
  - While certified: the items read-only with their tag, kind, and source.
  - While drafting: a busy line, "Reading the description, the labels and the linked pull requests. Nothing is certified by the assistant."
  - When changed, a line under the list: "oxagen.assistant suggests an item for the new scope" and **Add it**.
- **Assistant notes**: the assumptions and gaps the assistant recorded, one per line. Absent when there are none.

**Right**
- **Dependencies**, with **Add a dependency** (plain) in its header. Two lists, **Blocked by** and **Blocks**. Each row: the provider logo, the number in mono as a link to that task, the subject, the state as a dot and a word (`open`, `in a work order`, `accepted`, `closed as Done`, `closed as Won't do`), and the source: the provider's logo with "from GitHub", or "added here by Marcus Bell on 2026-09-11". An `oxagen` row has **Remove**; a `provider` row's title reads "Read from GitHub. Remove the link there." Under the lists, when any: "1 link to an issue outside the scope of this connection." With no dependency: "None. This task waits on nothing, and nothing waits on it."
- **Fields** with the readiness badge in its header, as a key-value list: Task id (mono), Number (a link to the issue), Status, Resolution, Labels (colour chips), Owner, Created by, Created at, Updated by, Updated at, Closed at. A person is the mapped member with avatar and, beside it, the provider handle with its logo; an account that is not mapped is its handle with `not mapped`; a bot is its handle with `bot`.
- **History**: Imported, Definition of done drafted, Certified, Changed upstream, Dependency added, Dependency removed, Unblocked, Queued in a work order, Sent in a work order, Accepted, each with its time and who.

## Dialogs

- **`certify`**: title "Certify the definition of done", subtitle the number and subject. The items as a numbered list with tag and kind. The note on what certifying records (`certify_task_dod`, your name, the digest of the N items, the provider version they were read against, and that an upstream change marks it changed). When the connection allows it, "Oxagen posts the list as a comment on <number> …". In a regulated workspace, a warning that the certifier cannot send it. **I read every item**, "These items are what done means for this task." Footer "needs `task.certify`", **Cancel**, **Certify** (gold, disabled until the box is ticked). Certifying toasts and turns the page ready.
- **`tklink`**: title "Add a dependency", subtitle the number and subject. A direction select, "#482 is blocked by" or "#482 blocks". A search field over the workspace's open tasks, each result with its logo, number, subject, and readiness badge. Picking one shows "#482 is blocked by #481. #482 can be sent when #481 is accepted, or closed as Done." A pick that would close a cycle shows "Refused. #482 already blocks #481 through #479 and #480." and disables the footer. Footer "needs `task.link`", **Cancel**, **Add** (gold). Adding toasts "Dependency added. link_tasks recorded." and the row appears with "added here by you".
- **`dodreopen`**: "Edit a certified definition of done?", "<number> is no longer ready and goes back to Needs certification. It’s ready again when somebody certifies it.", and "Work orders already sent keep the list they were sent with." Footer **Keep it certified**, **Edit it**.

## Data sources

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Task fields | `TASKS[]` | `tasks.tasks` | connectors write GitHub and Linear records to the graph | 🟡 |
| People on the task | `TPEOPLE` | `tasks.provider_people` | nothing | ❌ |
| Draft items and notes | `TASKS[].dod`, `.notes`, `TK_DRAFTS` | `tasks.dod_items`, drafted by `draft_task_dod` | nothing; `ask_assistant` exists | ❌ |
| Certification | `certifiedBy`, `certifiedAt`, `digest` | `tasks.dod_certifications` | nothing | ❌ |
| Changed since certification | `was` | the provider version on the certification | nothing | ❌ |
| Dependencies, their source, and the blocked reason | `TASKS[].blockedBy`, `.blocks` | `tasks.task_dependencies`; `link_tasks`, `unlink_tasks`; `list_tasks` `blockedBy` (`work-graph-spec.md` §9, §10) | nothing; no connector reads a link between records | ❌ |
| Links outside the connection's scope | `TASKS[].outsideLinks` | the count on the task read (§4.2) | nothing | ❌ |

## States

- **loaded**: `tsk_01K6S7C5PA`, a-intel/platform#633, a P0 bug with a four-item draft and two assistant notes. `tsk_01K6SC1Y5M` shows `changed`; `tsk_01K6SA3G9Z` shows `drafting`; `tsk_01K6S2M4QF` shows `ready`. `tsk_01K6SG4R8T` shows `ready` blocked by `tsk_01K6S2M4QF` from GitHub, with one dependency added in Oxagen, and its send button enabled.
- **not found**: "No task has this id", naming the id, with **Back to Tasks**.
- **loading**: the skeleton. **error**: "This task could not be loaded", `503 issue_index_unavailable`. **access denied**: "You cannot see this task", `task.read on core-platform`.

## Mobile

The two columns stack, the left first. The item rows keep their selects on one wrapping line. The Dependencies rows wrap, with the state and source on a second line. Dialogs are bottom sheets.

## Permissions

- Read: `task.read`
- Writes, each a governed action in Audit: `task.edit_dod` (edit a draft), `task.certify` (certify), `work_order.send` (send or queue), `task.link` (add or remove a dependency)

## Rules every build of this page must keep

- The assistant drafts and never certifies. Only a signed-in person certifies.
- A certified list is read-only until a person chooses to edit it, and editing returns the task to draft.
- An upstream change to the subject, description, or labels marks a certification changed and shows both texts.
- An item's source is always shown. An item a person edited says so.
- An account that is not mapped is shown as itself.
- The copied prompt says whether the definition of done is certified. A draft never reads as certified.
- A dependency's source is always shown. A provider's dependency cannot be removed here, and the row says where to remove it.
- The graph's blocked reason names the tasks. It never replaces the provider's status word, and it never disables the send button.
- Oxagen refuses a cycle and names the path. Nothing is written on a refusal.
