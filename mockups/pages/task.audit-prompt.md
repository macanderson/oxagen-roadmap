# Audit prompt: Task

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Task** page of Oxagen (`#/a-intel/core-platform/tasks/<taskId>`) and its two dialogs, `certify` and `dodreopen`, for conformance to their design. Be exact and adversarial: the design is the spec, and "close enough" is a fail.

## Inputs

1. The page spec: `mockups/pages/task.md` (read it first, in full).
2. The design, rendered: the `task` stories, or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/tasks/<id>` for `tsk_01K6S7C5PA` (draft), `tsk_01K6SC1Y5M` (changed), `tsk_01K6SA3G9Z` (drafting), `tsk_01K6S2M4QF` (ready). The flow check is `node tools/check-tasks.mjs` (flows 2 and 3).
3. The product spec: `docs/tasks-spec.md` §6, §8.
4. The build under audit: `{{APP_ROOT}}`, served at `{{APP_URL}}`.

## Procedure

Record PASS, FAIL, or N/A (with why) for every check, with evidence.

1. **Header.** The provider logo and number as the eyebrow, the subject as h1, the one-sentence subtext. **Open in <provider>** links to the issue. The primary follows the readiness table in the spec exactly; one gold on the screen. **Copy prompt** (plain) copies the task, its definition of done labelled certified, certified before a change, or draft, and every work order that carries the task with its id and link. Check it on a task in a work order (`tsk_01K6SF2W6Q`) and on one in none.
2. **Fields panel.** Exactly Task id, Number, Status, Resolution, Labels, Owner, Created by, Created at, Updated by, Updated at, Closed at, in that order, with the readiness badge in the header. People follow the mapping: a mapped member with avatar and handle, an unmapped account as its handle with `not mapped`, a bot with `bot`.
3. **Drafting.** A `drafting` task shows the busy line and **Draft it now**. Drafting fills the list and the notes, sets `draft`, and records a turn by `oxagen.assistant` that appears in neither Fleet nor Spend. A checklist already in the description arrives first, marked `from the issue`.
4. **Editing a draft.** Each item has its text, Tag (code, test, docs, review), Kind (check, review), source, and remove. **Add item** and Enter add one marked `you`. Editing an item's text marks it `edited by you`. The wand redrafts and keeps every item a person wrote or edited. Typing does not lose the caret.
5. **Certify.** The dialog lists every item, names `certify_task_dod`, the digest, and the provider version, and says what an upstream change does. **Certify** is disabled until **I read every item** is ticked, in the DOM **and** on the server. The stored digest is SHA-256 over the RFC 8785 canonical JSON of the items: recompute it. With the connection's switch on, one comment is posted; with it off, none. In a `regulated` workspace the dialog warns that the certifier cannot send, and the server refuses a work order sent by the certifier.
6. **The assistant cannot certify.** Search the build for any path where `oxagen.assistant`, an agent, or an API key without a person certifies. One is a FAIL.
7. **Certified.** The list is read-only with the digest shown; **Edit** opens `dodreopen`, which says the task returns to draft and that sent work orders keep their list. Confirming sets `draft`.
8. **Changed.** An upstream edit to the subject, description or labels of a certified task sets `changed`, shows the banner and the **Certified against** and **Now** panels, keeps the list editable, offers the assistant's suggested item, and offers **Certify again**. A comment, an assignee change, or a status change within one category does not. Verify each against the sync code.
9. **History.** Imported, Definition of done drafted, Certified, Changed upstream, Dependency added, Dependency removed, Unblocked, Queued in a work order, Sent in a work order, Accepted, each with time and actor, and only those that happened.
10. **Not found.** An unknown id renders "No task has this id" with **Back to Tasks**, inside the shell.
11. **States.** loading (skeleton), error ("This task could not be loaded", `503 issue_index_unavailable`), denied ("You cannot see this task", `task.read on core-platform`).
12. **Trust language.** Items are `open`, `claimed` or `accepted` elsewhere, never `held`, `proven` or `verified`. The source of every item is visible.
13. **Plain nouns, mobile, accessibility.** Headings plain; the columns stack on a phone; every item input and select has a label naming its number; dialogs are `role=dialog aria-modal`.
14. **Permissions.** `task.edit_dod`, `task.certify` and `task.link` gated server-side. Verify with a role that lacks each.
15. **Dependencies.** The panel sits above Fields with **Blocked by** and **Blocks**. Each row shows the number as a link, the subject, the state as a dot and a word (`open`, `in a work order`, `accepted`, `closed as Done`, `closed as Won't do`) and its source: a provider logo with "from <provider>", or "added here by <name> on <time>". A `provider` row has no **Remove** and its title says where to remove it; an `oxagen` row's **Remove** records `unlink_tasks`. `tklink` searches open tasks, previews the sentence, refuses a cycle with the path ("Refused. #A already blocks #B through …"), writes nothing on a refusal, and records `link_tasks` on Add. The header reads "Blocked by #N." while an upstream task is open, and the send button stays **enabled** for a `ready` open task the graph blocks, while a provider `blocked` status still disables it. History carries Dependency added, Dependency removed, Unblocked and Queued in a work order.
16. **Nothing extra.** List anything not in the spec.

## Output

The report format of `tasks.audit-prompt.md`, titled `# Task: audit {{DATE}}`.

Rules: never mark PASS on an assumption. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
