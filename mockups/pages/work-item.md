# Work item

| | |
|---|---|
| Route | `#/a-intel/core-platform/work/items/<item>`, for example `tsk_01K5RS482Q` (app `/{org}/{ws}/work/items/{item}`). Old route that lands here: the mockup’s `#/:org/:ws/tasks/<item>`, rewritten in place |
| Scope | workspace |
| Spec | `docs/work-graph-spec.md` §4 (dependencies), §5 (readiness on the graph), §11.2, §12.2; `docs/fleet-operations-wedge.md`: Vocabulary › Work (Work item, Definition of done), Work › Objects and Shipped today, D9 (a finding becomes a work item when a person picks it up), D17. `docs/fleet-operations-ia.md` › Work, detail views. `docs/tasks-spec.md` §6 (the work item record), §7 (people), §8 (the definition of done: drafting, editing, certification, a certified item that changes, readiness), §9.1 (selecting) |
| Design | `mockups/src/engine.js` → `pTask()`, `tkDepsPanel()`, `tkPathUp()`, `tkLinkAdd()`, `tkUnlink()`, `DLG_EXT.tklink`, `dodRows()`, `tkDraftNow()`, `dodCertify()`, `dodReopen()`, `taskPromptText()`, `copyTaskPrompt()`, `DLG_EXT.certify`, `DLG_EXT.dodreopen`, and `dispatchButton()` for a ready item; `mockups/src/wedge.js` → `wiOrdersPanel()`, `wiLogo()`; data `mockups/fixtures/tasks.json`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Work / Work item`: Loaded, Loaded · mobile, Loaded · future-only fields marked |
| Audit | `work-item.audit-prompt.md` |

## Job

One work item: what the provider says, what done means for it, who said so, whether it can be sent, and the work orders it went out in. It is where a person reads the assistant’s draft of the definition of done, edits it, and certifies it. A certified item is ready, and a ready item goes to an agent only inside a work order.

## What is on the page

**Header.** Eyebrow: the provider’s logo and the number in mono (“a-intel/platform#482”, “PLAT-231”), or the Oxagen mark and “WI-14” for an item written in Oxagen. h1: the subject (“Cut 4.11.0 release notes”). Subtext: “Imported from GitHub. Updated 2026-09-11 09:12.”, or for an item written in Oxagen “Written in Oxagen from finding `fnd_01K5RT2A`. Updated 2026-09-11 08:52.” A `ready` item with an open blocker adds “Blocked by #612 and #618.”

Actions: **Copy prompt** (plain; title “Copy the work item and its work orders as text”), **Open in GitHub** (plain; opens the provider’s page in a new tab), or **Open the finding** for an item written from a finding (opens Work › Findings on that finding’s evidence), then one primary that follows readiness:

| Readiness | Primary |
|---|---|
| `drafting` | **Draft it now** (gold; disabled while the draft runs) |
| `draft` | **Certify definition of done** (gold; disabled with no items) |
| `changed` | **Certify again** (gold) |
| `ready`, open, unblocked | **Send to an agent…** (gold; the send menu of `work-backlog.md` with this one item) |
| `ready`, open, blocked by the graph | the same button, enabled. The work order dialog queues (`work-backlog.md`) |
| `ready`, in a queued work order | **Open the work order** (gold) |
| `ready`, blocked | **Send to an agent…**, plain and disabled, titled “Blocked upstream. It can be sent when it is open again.” |
| `in a work order`, `accepted` | **Open the work order** (gold) |
| `closed` | none |

**Changed banner** (readiness `changed` only): the `changed` badge, “The description changed after certification”, and “Priya Natarajan edited it in GitHub on 2026-09-10 17:44. The certification from 2026-09-03 09:15 no longer matches the work item, so it is no longer ready.” Under it, two panels side by side: **Certified against** (the text the certification read) and **Now** (the text today).

Then two columns, the main column two thirds wide.

**Main column**

- **Description**: the body as plain text with its line breaks.
- **Definition of done**, with one sentence under the heading: “oxagen.assistant is reading the work item.” (drafting), “A draft. Certify it to make this work item ready.” (draft and changed), “Certified by Marcus Bell on 2026-09-11 09:12.” (ready, in a work order, accepted), or “Closed upstream before anybody certified one.” (closed). In the header: the wand (`aria-label` “Redraft with the assistant”) while the list is editable, **Edit** while the item is ready (opens `dodreopen`), and the digest in mono while certified (`sha256:c3a17e05b9d24f81`).
  - Editable (`draft`, `changed`): each item is a numbered row with a text field (`aria-label` “Item 1”), a Tag select (code, test, docs, review; “Tag of item 1”), a Kind select (check, review; “Kind of item 1”), its source (`from the issue`, `oxagen.assistant`, `you`, `edited by you`), and a remove button (“Remove item 1”). Below them an input (“Add an item”) with **Add item**. Enter adds too. An empty item toasts “Write the item first.”
  - Certified: the items read-only, each with its tag chip, its kind and its source.
  - Drafting: a busy line, “Reading the description, the labels and the linked pull requests. Nothing is certified by the assistant.”
  - Changed: under the list, “oxagen.assistant suggests an item for the new scope: **Notes added after an incident closes are exported too**” with **Add it**.
  - No items: “No items yet.”
- **Assistant notes**: the assumptions and gaps the assistant recorded, one per line (“The issue names the range and the output. The house format is ctx.release.notes-format.”). Absent when there are none.

**Side column**

- **Dependencies**, with **Add a dependency** (plain) in its header. Two lists, **Blocked by** and **Blocks**. Each row: the provider logo, the number in mono as a link to that item, the subject, the state as a dot and a word (`open`, `in a work order`, `accepted`, `closed as Done`, `closed as Won’t do`), and the source: the provider’s logo with “from GitHub”, or “added here by Marcus Bell on 2026-09-11 10:02”. An `oxagen` row has **Remove**; a `provider` row’s title reads “Read from GitHub. Remove the link there.” Under the lists, when any: “1 link to an issue outside the scope of this connection.” With no dependency: “None. This task waits on nothing, and nothing waits on it.” The demo item #640 (`tsk_01K6SG4R8T`) is blocked by #612 from GitHub and by #618 added here. Outlined as future-only.
- **Fields**, with the readiness badge in the header (`in a work order`). A key-value list, in order: Work item id (mono), Number (a link to the provider’s page, or plain mono for an item written in Oxagen), Status, Resolution (a dash while open), Labels (colour chips), Owner, Created by, Created at, Updated by, Updated at, Closed at. A person is the mapped member with avatar and, beside it, the provider handle with its logo (“Marcus Bell mbell-ai”). An account that is not mapped is its handle with `not mapped`, and a bot its handle with `bot`.
- **Work orders**: every work order that carries the item, each with its id as a link, its state badge, its title, and its runs (“run”, the run id as a link, `live` while live). With none: “Not sent yet. A certified item goes to an agent inside a work order.” The mockup outlines this panel as future-only. On the demo record #482 lists `wo_01K5RS7M4N` (in progress, its run live) and the direct `wo_01K5RQ4B9C7XTN2P` (closed).
- **History**: Imported (or Written), Definition of done drafted, Certified, Changed in <provider>, Dependency added, Dependency removed, Unblocked, Queued in a work order, Sent in a work order, Accepted, each with its time and who (“from GitHub”, “from finding fnd_01K5RT2A”, “oxagen.assistant”, “Marcus Bell”, “No longer ready”, the work order’s id). Only what happened is listed.

**Copy prompt** copies the work item as plain text to paste into an agent session: “Work item a-intel/platform#482: Cut 4.11.0 release notes”, the provider link, “Oxagen work item tsk_01K5RS482Q: https://app.oxagen.sh/a-intel/core-platform/work/items/tsk_01K5RS482Q”, the description, the definition of done (“Definition of done. Certified by Marcus Bell on 2026-09-11 09:12, sha256:c3a17e05b9d24f81.”, “Definition of done. A draft. Nobody has certified it.”, or the line for a changed, drafting or closed item) with each item as “1. [docs] <text>”, and **Work orders**: each one’s id, title, when it was sent and to whom, its state, and its link, or “No work order carries this work item.” The toast reads “Prompt copied, with 2 work orders.” or “Prompt copied, with no work order.” Once the clipboard accepts the text, the button turns green with a check and reads “Copied” for 1.6 seconds, then returns to its label (`.btn.copied`, see the [button](../components/button.html) reference). A refused copy leaves the button as it was, and the toast reads “The browser refused the clipboard. Nothing was copied.”

### Dialogs

- **`certify`**: title “Certify the definition of done”, subtitle the number and subject. The items as a numbered list with tag and kind. Note: “Certifying records `certify_task_dod` with your name, the digest of these 4 items, and the version of the work item in GitHub they were read against. If the work item changes upstream, the certification is marked changed and the work item is no longer ready.” When the connection writes back: “Oxagen posts the list as a comment on a-intel/platform#633, because the GitHub connection allows it.” In a regulated workspace, a warning: “Regulated workspace. The person who certifies cannot send this work item in a work order.” The checkbox **I read every item**, “These items are what done means for this work item.” Footer “needs `task.certify` on core-platform”, **Cancel**, **Certify** (gold; disabled until the box is ticked). Certifying makes the item ready and toasts in gold “Certified. certify_task_dod recorded with the digest of 4 items, and the list posted as a comment on a-intel/platform#633.”
- **`tklink`**: title “Add a dependency”, subtitle the number and subject. A direction select (`aria-label` “Direction”), “#612 is blocked by” or “#612 blocks”. A search field (“Search open tasks”) over the workspace’s open items, each result (`role=option`) with its logo, number, subject and readiness badge. Picking one shows “#612 is blocked by #618. #612 can be sent when #618 is accepted, or closed as Done.” A pick that would close a cycle shows “Refused. #612 already blocks #640.” (with “through …” naming the path when it is longer) and disables the footer. Footer “needs `task.link`”, **Cancel**, **Add** (gold). Adding toasts “Dependency added. link_tasks recorded.” and the row appears with “added here by you”.
- **`dodreopen`**: “Edit a certified definition of done?”, “a-intel/platform#612 is no longer ready and returns to draft. It is ready again when somebody certifies it.”, and the note “Work orders already sent keep the list they were sent with. The certification on 2026-09-10 16:05 stays in the work item’s history.” Footer **Keep it certified**, **Edit it** (gold). Editing toasts “a-intel/platform#612 is a draft again. It is ready when somebody certifies it.”
- From a ready item, the send menu and the work order dialog (`wo`) of `work-backlog.md`, with this item alone.

**Draft it now** runs the assistant’s draft and toasts in gold “oxagen.assistant drafted 4 items for PLAT-244. Read them, then certify.”

**Shell.** The sidebar with Work lit and its count. Breadcrumbs “Anderson Intelligence Corp. / Core platform / Work / a-intel/platform#482”, the last in mono. ⌘K, notifications, the Approvals button with the organization’s count, and the avatar.

**Demo items**, one per readiness: `tsk_01K5RS482Q` (#482, in a work order, the catalog’s story), `tsk_01K6SA3G9Z` (PLAT-244, drafting), `tsk_01K6S7C5PA` (#633, draft, four items and two notes), `tsk_01K6SC1Y5M` (#590, changed), `tsk_01K6S2M4QF` (#612, ready), `tsk_01K6SD8R3B` (PLAT-219, draft and Blocked), `tsk_01K6SH7C2F` (WI-14, written from a finding, draft), `tsk_01K6RW9A2L` (#571, accepted), `tsk_01K6RX4C8T` (PLAT-201, closed).

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Checked against `macanderson/oxagen` `origin/main` at `1ba160dbc`. Nothing in the repository stores a work item (wedge spec, Work › Shipped today), so every field on this page is future-only. Nothing on the page ships today.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Header: number, subject, provider, update time | `TASKS[]` | `tasks.tasks`; `get_task` | No work item record. The GitHub, Linear, Zendesk and Salesforce connectors read issues, tickets and cases into the graph (`packages/ingestion/src/connectors/github/index.ts:126`, `linear/index.ts:81`, `zendesk/index.ts:167-168`, `salesforce/index.ts:49-50`), not into a work item | ❌ |
| Description | `TASKS[].body` | `tasks.tasks` | as above | ❌ |
| Fields: status, resolution, labels, dates | `TASKS[]`, `TSTATUS`, `TRES`, `TLABELS` | `tasks.tasks`, `tasks.field_settings` | none | ❌ |
| People on the item (owner, created by, updated by) | `TPEOPLE` | `tasks.provider_people` | none. Connectors store the provider’s login string | ❌ |
| Definition of done items and their sources | `TASKS[].dod`, `TK_DRAFTS` | `tasks.dod_items`; `draft_task_dod`, `update_task_dod` | none. `ask_assistant` exists (`packages/oxagen/src/contracts/assistant.ask.ts:61`) and drafts nothing here | ❌ |
| Assistant notes | `TASKS[].notes` | `tasks.dod_items` notes from `draft_task_dod` | none | ❌ |
| Certification: who, when, digest | `TASKS[].certifiedBy`, `.certifiedAt`, `.digest` | `tasks.dod_certifications`; `certify_task_dod` | none | ❌ |
| Readiness and the changed banner | `TASKS[].ready`, `.was` | readiness derived from the certification and the provider version | none | ❌ |
| Work orders panel | `WORKORDERS` filtered by item | `tasks.work_order_tasks`; `list_work_orders` | none | ❌ |
| Runs in the Work orders panel | `WORKORDERS[].runs` | the runs of each work order | Runs ship (`list_runs`, `packages/oxagen/src/contracts/run.list.ts:477`), and no run names a work order (`taskRef`, `run.list.ts:285-291`) | ❌ |
| History | derived from the item and its work orders | `task.imported`, `dod.drafted`, `dod.certified`, `task.changed`, `work_order.sent`, `work_order.accepted` events (`tasks-spec.md` §13) | none | ❌ |
| Copy prompt | `taskPromptText()` | `get_task` and `list_work_orders` | none | ❌ |
| Dependencies, their source, and the blocked reason | `TASKS[].blockedBy`, `tkBlocks()` | `tasks.task_dependencies`; `link_tasks`, `unlink_tasks`; `list_tasks` `blockedBy` (`work-graph-spec.md` §9, §10) | none. No connector reads a link between records | ❌ |
| Links outside the connection’s scope | `TASKS[].outsideLinks` | the count on the item read (§4.2) | none | ❌ |

## Future-only fields

The mockup marks one element with `data-future` (`?future=1` outlines it):

| Mark | Reason in the mockup | What a build shows instead today |
|---|---|---|
| The Work orders panel | “work orders” | `not recorded`. No `/work/items` route exists in `apps/app` today, and no page shows an issue with its definition of done |

The mockup marks nothing else, but every field on the page is future-only (wedge spec, Work › Shipped today). A build renders each as `not recorded` and leaves out **Draft it now**, **Certify definition of done**, **Edit** and the send until their contracts ship. The issue a run touched is visible today on the Run’s Issues tab (`apps/app/src/features/run/issues-tab.tsx`), which reads the tracker, not a work item.

## Functionality

- The assistant drafts and never certifies. Only a signed-in person certifies. A checklist already in the description arrives first, marked `from the issue`.
- The wand redrafts and keeps every item a person wrote or edited. Editing an item’s text marks it `edited by you`.
- Certifying records `certify_task_dod` with the certifier, the time, the digest (SHA-256 over the items’ RFC 8785 canonical JSON) and the provider version the items were read against. The item becomes `ready`.
- A certified list is read-only. **Edit** asks first, because editing returns the item to `draft` until somebody certifies it again. Work orders already sent keep the list they were sent with.
- A provider change to the subject, description or labels of a certified item marks it `changed`, shows both texts, and offers the assistant’s suggestion for the new scope. A comment, an assignee, or a status change inside one category does not.
- A ready item in the `open` category can be sent. A blocked one can be certified and cannot be sent until it is open again.
- The copied prompt says whether the definition of done is certified. A draft never reads as certified.
- `node tools/check-tasks.mjs` walks flows 2 (draft, edit and certify), 3 (a certified item that changes) and 8 (the copied prompt names its work orders) on this page.

- A provider’s dependency cannot be removed here, and the row says where to remove it. An `oxagen` dependency records `link_tasks` and `unlink_tasks`.
- Oxagen refuses a cycle and names the path. Nothing is written on a refusal.
- The graph’s blocked reason names the items. It never replaces the provider’s status word, and it never disables the send button.
- `node tools/check-tasks.mjs` walks flow 13 (a cycle is refused) on this page.

## States

Loaded only. This change designs the loaded state. The build uses the shell’s standard loading, error, empty and denied panels until they are designed.

Within loaded, an unknown id renders, inside the shell, “No work item has this id” and “Nothing in Core platform is called `tsk_nope`. It may belong to a provider that was disconnected.”, with **Back to Work** (gold).

## Mobile

The thumb bar holds Work (lit, with its count), Agents, Tools, Spend and More. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The top bar shows the current crumb, the number. The header actions wrap, the gold one on its own line. The two columns stack, the main column first. The item rows keep their selects on one wrapping line. The Certified against and Now panels stack. Dialogs are bottom sheets with full-width footer buttons. Touch targets are at least 44 px and inputs 16 px. Nothing scrolls sideways.

## Permissions

The design names these, from `tasks-spec.md` §14. None exists in `packages/iam` today.

- Read: `work.read`
- Writes, each a governed action recorded in Audit: `task.edit_dod` (edit a draft), `task.certify` (certify), `work_order.send` (send or queue), `task.link` (add or remove a dependency)

## Backend gaps this page depends on

- The work item record and its read (`get_task`), with the thirteen fields of `tasks-spec.md` §6.1 and the people map
- The definition of done: `draft_task_dod` (as `oxagen.assistant`), `update_task_dod`, `certify_task_dod`, and readiness with the provider version (§8)
- The work orders that carry an item (`list_work_orders`) and a work order id on each run
- A link from a work item written in Oxagen to the finding it came from

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. The page shows runs by id and neither by name.
- A Steering Source and a SteeringFrame are never shown as each other. A Steering record named in the assistant’s notes is a source, and it is named by its id.
- Nothing on the page is a model’s account of why. The assistant’s draft and notes are labelled as the assistant’s, and the certification is a person’s.
- No person is scored or ranked.
- Every enforcement claim states the tier. The page makes none: it shows no agent’s tier and claims nothing about what a run may do.
- Headers are rollups of the rows beneath them: the digest is the digest of the listed items, and “4 items” counts them.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: the readiness primary, or the gold button of the open dialog.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- The assistant drafts and never certifies.
- A certified list is read-only until a person chooses to edit it, and editing returns the item to draft.
- An item’s source is always shown. An item a person edited says so.
- An account that is not mapped is shown as itself.
- A dependency’s source is always shown. Read from a provider and added here are never shown as each other.
