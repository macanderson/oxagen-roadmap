# Work item

<!-- work-item: one work item, its definition of done, its dependencies, its work orders, and the three dialogs it opens (certify, dodreopen, tklink) -->

## Header

The header names the work item, where it came from, when it last changed, and the one action its readiness allows next.

### Purpose
You arrive from a Backlog row, a work order, a finding or a pasted link, and you need to know which item this is and what to do with it. The eyebrow gives the provider mark and the number, the h1 gives the subject, and the subtext says where the item came from and when it last changed. The gold button is the next step: draft it, certify it, send it, or open the work order that already carries it.

### Rationale
A work item is ready only when a person certifies its definition of done (`tasks-spec.md` §8), and it reaches an agent only inside a work order (D1, D2). The header therefore follows readiness and never offers a step the item cannot take. The page keeps one gold action, so the readiness primary is the only gold control while no dialog is open. **Copy prompt** exists for a harness Oxagen does not deliver to: the pasted text names every work order that carries the item, and the work order's **Copy brief** names every item it carries, so a pasted prompt leads from either record to the other. A draft never reads as certified in that text, because an agent that reads it would treat an uncertified list as the agreed scope.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Number, subject, provider, update time | `TASKS[]` (`fixtures/tasks.json`), `wiLogo()`, `IP_KIND` | `tasks.tasks`; `get_task` | none |
| Finding the item came from | `TASKS[].finding` | the work item's source finding | none |
| Blocked clause | `tkOpenBlockers()` over `TASKS[].blockedBy` | `tasks.task_dependencies`; `list_tasks` `blockedBy` | none |
| Readiness primary | `TASKS[].ready`, `tkSelectable()`, `tkQueuedWo()` | readiness from `tasks.dod_certifications` | none |
| Copy prompt | `taskPromptText()`, `taskWorkOrders()` | `get_task`, `list_work_orders` | none |
| Provider link | `providerUrl()` over `IP_KIND[kind].url` | the provider's own URL for the item | none |

### Logic
1. `pTask()` draws the eyebrow from `wiLogo(t,13)` and the number. An item written in Oxagen (`kind` `oxagen`) carries the Oxagen mark. An item whose provider was disconnected adds the `disconnected` badge (`tkDiscBadge()`), because its values are as last read.
2. The subtext reads "Imported from <provider>. Updated <time>." An item written in Oxagen reads "Written in Oxagen", with "from finding `<id>`" when it came from one. A `ready` item that `tkGraphBlocked()` reports as blocked adds "Blocked by #612 and #618."
3. **Copy prompt** calls `copyTaskPrompt()`, which copies `taskPromptText()` and toasts "Prompt copied, with 2 work orders." or "with no work order". The text says "Certified by <name> on <time>, <digest>" for a certified list, "before the description changed" for a `changed` one, and "A draft. Nobody has certified it." otherwise.
4. **Open in <provider>** opens `providerUrl(t)` in a new tab. An item from a finding shows **Open the finding** instead, which goes to Work › Findings with `?finding=<id>` and opens the evidence.
5. The primary follows readiness. `drafting` shows **Draft it now**, disabled while `S.tkDrafting` holds the item. `draft` shows **Certify definition of done** and `changed` shows **Certify again**, both disabled with no items. `ready` shows **Open the work order** when `tkQueuedWo()` finds a queued one, `dispatchButton([t.id])` when `tkSelectable()` allows it, and otherwise a plain disabled **Send to an agent…** titled with `tkWhyNot()`. An item with a work order shows **Open the work order**. `closed` shows no primary.

### States
Loading shows `skeleton()`. Error shows "503 work_index_unavailable". Denied names `work.read on core-platform`. An unknown id renders "No work item has this id" with **Back to Work** inside the shell. On a phone the actions wrap and the gold one takes its own line.

## Changed banner

The banner says a certified work item changed upstream, who changed it, and that it is no longer ready.

### Purpose
You open an item you certified last week and it will not send. The banner says why in one line: a named person edited it in the provider at a named time, and the certification from an earlier time no longer matches. The two panels under it show what changed, and **Certify definition of done** in the header makes it ready again.

### Rationale
A certification is a person's word about one version of the item (`tasks-spec.md` §8.4). When the subject, description or labels change upstream, that word no longer covers the item, so the certification is marked `changed` and the item leaves ready (§8.5). A comment, an assignee change, or a status change inside one category does not change the scope, so it leaves the certification alone. The banner names the editor and both times because the certifier needs to judge whether the change matters before certifying again. The item stays editable, so the certifier can add the items the new scope needs.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Readiness `changed` | `TASKS[].ready` | readiness from the certification and the provider version | none |
| Who edited it | `TASKS[].updatedBy` through `tPerson()` and `PEOPLE` | the actor of the latest change, `tasks.provider_people` | none |
| When it was edited | `TASKS[].updatedAt` | `tasks.tasks` `updated_at`; `task.changed` event | none |
| When it was certified | `TASKS[].certifiedAt` | `tasks.dod_certifications` | none |

### Logic
1. `pTask()` draws the banner only when `t.ready` is `changed`. The demo item is `tsk_01K6SC1Y5M` (#590).
2. The editor is the mapped member's name when `tPerson(t.updatedBy)` maps to one, and the provider handle otherwise.
3. The banner reads "<editor> edited it in <provider> on <time>. The certification from <time> no longer matches the work item, so it is no longer ready."
4. The heading always says "The description changed after certification". A build names the field whose change it detected: subject, description or labels.
5. The Backlog shows the same change as a workspace banner with **Review changes**, which opens this page.

### States
Absent for every readiness but `changed`. Certifying again clears it, because `dodCertify()` sets `ready` and deletes the stored text. On a phone the badge, the text and the panels stack.

## Certified against

The panel shows the description as it read when a person certified the definition of done.

### Purpose
You need to see the text your certification covered before you decide whether the new text changes what done means. This panel holds that text, set beside **Now**, so the difference is in front of you.

### Rationale
A certification records the provider version it was read against (`tasks-spec.md` §8.4), and §8.5 asks the page to show the text it was certified against beside the text now. Without the old text, a person re-certifies on trust or opens the provider's history in another tab. The two panels sit side by side on the same page so the comparison takes one glance.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Text at certification | `TASKS[].was` | the text read at certification, kept with `tasks.dod_certifications` | none |

### Logic
1. `pTask()` draws this panel and **Now** in a two-column grid under the changed banner, only for readiness `changed`.
2. The body is `t.was`, as plain text with its line breaks (`tk-body`).
3. The mockup marks no difference between the two texts.
4. `tasks-spec.md` §8.4 stores the provider version, not the text. A build keeps the text read at certification with the certification, or fetches it by version, or it cannot draw this panel.

### States
Absent for every readiness but `changed`. On a phone it stacks above **Now**.

## Now

The panel shows the description as the provider holds it today.

### Purpose
You compare it with **Certified against** to see what the upstream edit changed, then decide whether the certified items still describe done.

### Rationale
This is the same text the Description panel shows. It sits here, beside the old text, so the comparison does not need scrolling (`tasks-spec.md` §8.5). The provider owns the text. Oxagen never edits a subject or a description, so the only way to change it is in the provider.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Current text | `TASKS[].body` | `tasks.tasks` description, read from the provider (`tasks-spec.md` §6.1) | none |

### Logic
1. `pTask()` draws this panel beside **Certified against**, only for readiness `changed`.
2. The body is `t.body`, as plain text with its line breaks.
3. On the demo item #590 the old text says the export carries incidents without their notes. The new text adds notes written after an incident closes, and the Definition of done panel offers the assistant's item for that scope.

### States
Absent for every readiness but `changed`. On a phone it stacks under **Certified against**.

## Description

The panel shows the work item's body as the provider holds it, or as a person wrote it in Oxagen.

### Purpose
You read what the work item asks for before you read or certify its definition of done. This is the provider's text, unchanged, so you judge the items against the source and not a summary of it.

### Rationale
The assistant drafts the definition of done from the subject, the description, the labels and the linked pull requests (`tasks-spec.md` §8.2). The certifier needs the same source in view. The panel shows the provider's text as read and adds no summary, because the page reads the record and no model-written account stands in for it. Oxagen never edits a description (§5.4), so the panel has no edit control.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Body | `TASKS[].body` | `tasks.tasks` description: GitHub `body`, Linear `description`, Jira `description` converted from ADF to Markdown, ServiceNow `description`, Salesforce `Description`, Zendesk the first comment (`tasks-spec.md` §6.1) | none |
| Body of an item from a finding | `findingToWork()` | the work item written from the finding | none |

### Logic
1. `pTask()` draws the panel first in the main column.
2. The body is `t.body` as plain text with its line breaks (`tk-body`). The mockup renders no Markdown.
3. An item written from a finding reads "Picked up from finding <id>." followed by the finding's one sentence of why (`findingToWork()`).
4. A `changed` item shows the new text here and again in **Now**.

### States
Every readiness shows the panel. A disconnected provider's item keeps the body last read. On a phone it runs full width, first under the header.

## Definition of done

The panel holds the list of items that says what done means for this work item, who drafted each one, and whether a person certified it.

### Purpose
You read the assistant's draft, fix it, and certify it, which makes the item ready to send. Once it is certified you read it as the fixed scope of any work order that carries the item. The sentence under the heading always says where the list stands: being drafted, a draft, certified by whom and when, or closed before anybody certified one.

### Rationale
The definition of done is the contract between the person who sends work and the agent that does it (`tasks-spec.md` §8.1). Each item is one sentence a reviewer can check, with a kind (`check` when evidence can show it, `review` when a person judges it), a tag (`code`, `test`, `docs`, `review`) that a workflow stage owns items by, and a source. It is a different object from the run dod of `docs/dod-spec.md`, which is a locked file of executable checks that gates an agent's stop. Its items are `open`, `claimed` or `accepted`, and none of the run dod's verdict words apply.

`oxagen.assistant` drafts every open item a provider imports (§8.2). A checklist already in the description arrives first, marked `from the issue`. Nothing is certified by the assistant: a draft stays a draft until a signed-in person certifies it, so what done means is always a person's word. Every item shows its source, and an item a person changed says `edited by you`, so a reader can tell the assistant's words from a person's. A certified list is read-only because sent work orders carry its digest. **Edit** asks first, since editing sends the item back to draft. The digest is SHA-256 over the items' RFC 8785 canonical JSON, so the same list always has the same digest.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Items: text, kind, tag, source | `TASKS[].dod`, `TK_DRAFTS` | `tasks.dod_items`; `draft_task_dod`, `update_task_dod` | none |
| Drafting | `tkDraftNow()`, `S.tkDrafting` | `draft_task_dod` as `oxagen.assistant`. `ask_assistant` exists (`assistant.ask.ts:61`) and drafts nothing here | none |
| Certified by, when, digest | `TASKS[].certifiedBy`, `.certifiedAt`, `.digest` | `tasks.dod_certifications`; `certify_task_dod` | none |
| Readiness | `TASKS[].ready`, `READY` | readiness derived from the certification and the provider version | none |
| Suggested item for a changed scope | a fixed string in `pTask()` | `draft_task_dod` on the changed text | none |

### Logic
1. The sentence under the heading follows readiness: "oxagen.assistant is reading the work item." (`drafting`), "A draft. Certify it to make this work item ready." (`draft`, `changed`), "Certified by <name> on <time>." (`ready`, `sent`, `accepted`), "Closed upstream before anybody certified one." (`closed`).
2. `tkEditable()` makes the list editable for `drafting`, `draft` and `changed`. While editable and not drafting, the header carries the wand (`aria-label` "Redraft with the assistant"), which calls `tkDraftNow()`. A `ready` item carries **Edit**, which opens `dodreopen`. A certified list shows its digest in mono.
3. While drafting, the body is a busy line: "Reading the description, the labels and the linked pull requests." **Draft it now** calls `tkDraftNow()`, which waits 900 ms, fills the list and the notes from `TK_DRAFTS[id]` (or one default item), sets `draft`, and toasts "oxagen.assistant drafted 4 items for PLAT-244. Read them, then certify."
4. `dodRows(t,edit)` draws one numbered row per item. Editable rows carry a text field (`dodSet(...,'t',...)`, which marks the source `edited` unless a person wrote the item), a Tag select over `DOD_TAGS`, a Kind select (check, review) and a remove button (`dodDel()`). Read-only rows show the tag chip, the kind and the source. The source reads "from the issue" (the provider's own unit), "oxagen.assistant", "you" or "edited by you".
5. **Add item** and Enter call `dodAdd()`, which appends a `check` item tagged `code` with source `operator`. An empty field toasts "Write the item first."
6. For `changed`, a row under the list reads "oxagen.assistant suggests an item for the new scope:" and the item, with **Add it**, which appends it with source `assistant`. The mockup hardcodes the suggestion for #590. The page spec names the button **Add it**.
7. The mockup's redraft replaces the whole list. A build keeps every item a person wrote or edited (`tasks-spec.md` §8.3).
8. A build drafts at most 60 items a minute per workspace, oldest update first, and never drafts a closed item (§8.2). **Draft it now** moves an item to the front of that queue.

### States
With no items: "No items yet." Drafting disables **Draft it now** and shows the busy line. A `closed` item shows its sentence and no controls. Loading, error and denied follow the page. On a phone each row keeps its selects on one wrapping line, and the wand and remove buttons keep their icons at a 44 px target.

## Assistant notes

The panel lists what the work item leaves open and every assumption `oxagen.assistant` made while drafting.

### Purpose
Before you certify, you need to know where the assistant guessed. Each note names one gap or assumption, so you can confirm it, change an item, or ask the requester before the list becomes the scope.

### Rationale
Drafting step 3 in `tasks-spec.md` §8.2 asks the assistant to list what the item leaves open and every assumption it made. A draft that hides its assumptions invites a certifier to approve a guess. The panel is labelled as the assistant's, and nothing in it is a model's account of why the work matters: it states gaps and assumptions only. A Steering record the notes name is a source and is named by its id.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Notes | `TASKS[].notes`, `TK_DRAFTS[].notes` | notes from `draft_task_dod`, kept with `tasks.dod_items` | none |

### Logic
1. `pTask()` draws the panel under Definition of done only when `t.notes` has at least one entry.
2. Each note is one list item, as plain text.
3. `tkDraftNow()` replaces the notes with the draft's own. On PLAT-244 they read "The issue does not say whether the CSV includes unproductive spend. The assistant left it out and says so in item 2." and "Finance is named as the reader. Nothing in the work item says who may run the export."
4. Certifying leaves the notes in place, so a later reader sees what the certifier was told.

### States
Absent when the item has no notes, including a `drafting` item before its draft lands. On a phone it runs full width under Definition of done.

## Dependencies

The panel lists the work items this one waits on and the work items that wait on it, with where each link came from.

### Purpose
You want to know whether this item can start now, and what starts once it is done. **Blocked by** answers the first and **Blocks** the second. Each row shows the other item's state, so you can see which blocker is still open. **Add a dependency** records an order the provider does not hold.

### Rationale
Work has an order that a flat backlog hides (`work-graph-spec.md` §1). Oxagen reads the links each provider holds, such as a GitHub issue dependency, a Linear `blocks` relation, a Jira Blocks link, or a parent and child (§4.2), and a person adds the rest here (§4.3). A parent reads as blocked by each child, because a parent is done when its children are. Every row shows its source, because a link read from a provider and one added here are removed in different places: a provider link only in the provider, an Oxagen link here. A blocker unblocks this item only when it is `accepted` in Oxagen or closed in the provider as Done (§5.2). A blocker closed as Won't do does not unblock it, and Oxagen does not guess that a cancelled prerequisite was not needed. A blocked item can still be drafted, certified and selected, and its work order queues (§5.3).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Blocked by and Blocks | `TASKS[].blockedBy`, `tkBlockers()`, `tkBlocks()` | `tasks.task_dependencies`; `list_tasks` `blockedBy`; `get_work_graph` | none |
| Each row's state | `tkDepBadge()` over `ready`, `status`, `resolution` | readiness and resolution of the other item | none |
| Source, who and when | `blockedBy[].src`, `.by`, `.at` | `task_dependencies` source, created by, created at | none |
| Remove | `tkUnlink()` | `unlink_tasks` | none |
| Links outside the scope | `TASKS[].outsideLinks` | a count on the item read (`work-graph-spec.md` §4.2) | none |

### Logic
1. `tkDepsPanel(t)` sits first in the side column. **Add a dependency** clears `S.tkl` and opens `tklink`.
2. With no dependency either way, the body reads "None. This work item waits on nothing, and nothing waits on it."
3. Otherwise it draws **Blocked by** from `tkBlockers(t)` and **Blocks** from `tkBlocks(t)`, each list "none" when empty.
4. A row shows the provider logo, the number as a link, the subject and `tkDepBadge()`: `accepted`, `closed as <resolution>`, `in a work order`, or `open`.
5. An `oxagen` row adds "added here by <name> on <time>" and **Remove**, which calls `tkUnlink()` and toasts "Dependency removed. unlink_tasks recorded." A `provider` row shows "from <provider>" titled "Read from GitHub. Remove the link there."
6. `t.outsideLinks` adds "1 link to an issue outside the scope of this connection.", with `plural()` for more than one.
7. **Remove** calls `tkUnlink()`, which marks the dependency removed with who and when and keeps it on the record (§4.1). `tkBlockers()` and `tkBlocks()` skip a removed dependency, so it never blocks again and leaves the panel, and History lists "Dependency removed". Adding the same dependency again adds a new row.
8. The demo item #640 (`tsk_01K6SG4R8T`) is blocked by #612, read from GitHub, and by #618, added here by Marcus Bell on 2026-09-11 10:02.

### States
On a phone the rows wrap and **Remove** keeps a 44 px target.

## Fields

The panel lists the work item's fields as Oxagen reads them from the provider, with its readiness in the header.

### Purpose
You check the facts the provider holds: the number, the status and its resolution, the labels, and the people. The readiness badge in the header says, beside those facts, whether the item can be sent.

### Rationale
Oxagen reads thirteen fields the same way from every provider and nothing else (`tasks-spec.md` §6.1). The subject is the h1 and the description has its own panel, so this panel lists the other eleven. Custom fields are not read: each added field needs a mapping on six providers and a meaning in the brief. Three values are derived. **Updated by** is the actor of the latest change, because GitHub, Linear and Jira store no such field. **Owner** is the first assignee. **Created by** on a help desk is a requester, who is never a workspace member (§7). An account that is not mapped shows as itself with its provider's logo, so nothing pretends it is a member.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Work item id, number, dates | `TASKS[]` | `tasks.tasks`; `get_task` | none |
| Status and its category | `TASKS[].status`, `TSTATUS`, `tStatusBadge()` | `tasks.tasks`, `tasks.field_settings` | none |
| Resolution | `TASKS[].resolution`, `TRES` | `tasks.tasks`, `tasks.field_settings` | none |
| Labels and colors | `TASKS[].labels`, `TLABELS`, `lblChips()` | `tasks.task_labels`, `tasks.field_settings` | none |
| Owner, created by, updated by | `TPEOPLE`, `tkPerson()` | `tasks.provider_people` | none |
| Readiness badge | `readyBadge()` over `READY` | readiness from `tasks.dod_certifications` | none |

### Logic
1. `pTask()` draws the list in this order: Work item id, Number, Status, Resolution, Labels, Owner, Created by, Created at, Updated by, Updated at, Closed at.
2. Number links to `providerUrl(t)` in a new tab. An item written in Oxagen shows it as plain mono.
3. `tStatusBadge()` colors a status by its category: blocked red, closed grey, open green.
4. Resolution and Closed at show a dash while empty.
5. `tkPerson(id,{handle:true})` shows a mapped account as the member's avatar and name, with the provider logo and handle beside it ("Marcus Bell mbell-ai"). An account that is not mapped shows its handle with `not mapped`, `bot` or `requester`.
6. `readyBadge(t)` sits in the panel header.

### States
Every readiness shows the panel. A disconnected provider's item keeps the values last read. On a phone the key and value pairs stack.

## Work orders

The panel lists every work order that carries this work item, with its state and its runs.

### Purpose
You want to know where the item went: which work order carries it, whether a run is live, and what state the work order is in. Each work order and each run is one click away.

### Rationale
A certified item goes to an agent inside a work order, and only there (D1, `tasks-spec.md` §9). A run is a child record of exactly one work order (D2), so this panel is how you walk from the item to the runs that worked on it. An item can sit in more than one work order: a dispatched one a person sent, a retry, or a direct one Oxagen opened for a run whose task reference names this item's number. The page spec calls the panel future-only, and the mockup outlines it under `?future=1`.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Work orders that carry the item | `WORKORDERS` filtered by `tasks` | `tasks.work_order_tasks`; `list_work_orders` | none |
| State | `woBadge()` over `WO_ST` | `tasks.work_orders` state | none |
| Runs of each | `WORKORDERS[].runs`, `runLink()` | the runs of each work order. Runs ship (`list_runs`, `run.list.ts:477`), and no run names a work order (`taskRef`, `run.list.ts:285-291`) | none |

### Logic
1. `wiOrdersPanel(t)` lists every entry of `WORKORDERS` whose `tasks` holds `t.id`, in fixture order.
2. Each entry shows the id as a link to the work order, `woBadge(w)`, the title, and one line per run: "run", the run id through `runLink()`, and `live` while that run's state is live.
3. A direct work order lists the item when `fileDirect()` matched the run's task reference to the item's number.
4. With none: "Not sent yet."
5. On the demo record #482 lists `wo_01K5RS7M4N` (in progress, its run live) and the direct `wo_01K5RQ4B9C7XTN2P` (closed).
6. The mockup draws no kind badge here. A build labels a direct work order as direct.

### States
Empty reads "Not sent yet." On a phone the entries stack and each run line wraps.

## History

The panel lists what happened to the work item, each event with its time and who or what caused it.

### Purpose
You want the item's story in one place: when it arrived, when the draft landed, who certified it, when it changed upstream, when dependencies were added or cleared, and when it was sent and accepted. You read it to answer "who decided this, and when".

### Rationale
Every step of the item is a recorded event. `tasks-spec.md` §13 names `task.imported`, `task.changed`, `dod.drafted`, `dod.certified`, `work_order.sent` and `work_order.accepted`, and `work-graph-spec.md` §9 adds `task.linked`, `task.unlinked` and `work_order.queued`. The panel lists only what happened, so an empty step is absent rather than shown as pending. It names people by name and the assistant as `oxagen.assistant`, so a person's decision and the assistant's draft never read as each other.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Imported or written | `TASKS[].createdAt`, `kind`, `finding` | `task.imported` | none |
| Drafted | `TASKS[].dod`, `createdAt` | `dod.drafted` | none |
| Certified | `certifiedAt`, `certifiedBy` | `dod.certified` | none |
| Changed upstream | `ready` `changed`, `updatedAt` | `task.changed` | none |
| Dependency added, unblocked | `blockedBy[]`, `tkGraphBlocked()` | `task.linked`, `task.unlinked` | none |
| Queued, sent, accepted | `WORKORDERS[]` `sent`, `released`, `accepted` | `work_order.queued`, `work_order.sent`, `work_order.accepted` | none |

### Logic
1. `pTask()` builds the list in a fixed order, and each event appears only when it happened:
   - Imported, or Written, with "from <provider>", "from finding <id>" or "in oxagen"
   - Definition of done drafted, by `oxagen.assistant`, when the item has items
   - Certified, with the certifier
   - Changed in <provider>, with "No longer ready"
   - Dependency added, once per `oxagen` dependency, and Dependency removed, with who removed it, once per removed one
   - Unblocked, when every blocker is done
   - Queued in a work order, or Sent in a work order, with the work order id
   - Accepted
2. The mockup approximates two times: the draft uses the item's creation time and Unblocked uses its update time. Accepted names the work order's sender. A build reads each event's own time and actor, and names the person who accepted.
3. A build lists the events in the order they were recorded.

### States
An item just imported shows one event. On a phone each event's time and actor wrap under its name.

## Certify dialog {#dialog/certify}

The dialog asks a person to read every item and certify the list as what done means for this work item.

### Purpose
You have read and edited the draft, and you want the item to be ready to send. The dialog shows the list one last time, says what certifying records, and makes you tick **I read every item** before **Certify** turns on.

### Rationale
Certification is the step that makes an item ready (`tasks-spec.md` §8.4), and only a signed-in person can take it. The assistant drafts and never certifies. The tick box makes reading an explicit act, because a certified list becomes the scope every work order carries. Certifying records `certify_task_dod` with the certifier, the time, the digest of the items and the provider version they were read against. The digest is SHA-256 over the items' RFC 8785 canonical JSON, so the same list always hashes the same. If the work item changes upstream, the certification is marked changed and the work item is no longer ready (§8.5). In a `regulated` workspace the certifier cannot send the item, so certifying and sending take two people.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Items | `TASKS[].dod` | `tasks.dod_items` | none |
| Certification | `dodCertify()` | `certify_task_dod`, `tasks.dod_certifications` | none |
| Post the list to the provider | `IPROV[].writeback.certify` | the certify write-back (`tasks-spec.md` §5.4) | none |
| Regulated warning | `ws().governance` | the workspace's governance mode | partial |

### Logic
1. `DLG_EXT.certify` titles the dialog "Certify the definition of done", with the number and subject as the subtitle.
2. It lists the items read-only, each with its tag chip and kind.
3. The note reads "Certifying records `certify_task_dod` with your name, the digest of these N items, and the version of the work item in <provider> they were read against." An item written in Oxagen has no provider, so its note ends at "the version of the work item they were read against."
4. When the provider's connection has its certify switch on, a second note says Oxagen posts the list as a comment (or the provider's staff note) on the item.
5. A `regulated` workspace adds the warning that the certifier cannot send the item.
6. **Certify** stays disabled until **I read every item** is ticked. The footer names `task.certify` on the workspace.
7. `dodCertify()` sets `ready`, the certifier, the time and the digest, clears the stored old text, and toasts in gold "Certified. certify_task_dod recorded with the digest of 4 items, and the list posted as a comment on #633."
8. The mockup's digest is a fixed string. A build computes it, and the server refuses a certification whose tick the client skipped.

### States
On an item written in Oxagen (`tsk_01K6SH7C2F`, WI-14) the dialog names no provider and shows no write-back note, because `IP_KIND` has no `oxagen` entry and no connection writes back. On a phone the dialog is a bottom sheet with full-width footer buttons.

## Reopen dialog {#dialog/dodreopen}

The dialog asks before a certified definition of done goes back to draft for editing.

### Purpose
You spotted a missing item after certifying. **Edit** asks first because editing costs the item its readiness: it returns to draft and cannot be sent until somebody certifies it again.

### Rationale
A certified list is read-only (`tasks-spec.md` §8.3), because the certification's digest is what sent work orders carry. Work orders already sent keep the list they were sent with, so reopening never rewrites the scope of work in flight. The certification on its date stays in the work item's history, so the record shows both the old certification and the new one. The dialog exists so that a stray click cannot drop an item out of ready.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Number, certification time | `TASKS[].num`, `.certifiedAt` | `tasks.tasks`, `tasks.dod_certifications` | none |
| Reopen | `dodReopen()` | `update_task_dod` with readiness back to `draft` | none |

### Logic
1. **Edit** in the Definition of done header opens `dodreopen`. It shows only while the item is `ready`.
2. `DLG_EXT.dodreopen` reads "<number> is no longer ready and returns to draft. It is ready again when somebody certifies it."
3. Footer **Keep it certified** and **Edit it** (gold).
4. `dodReopen()` sets `draft`, closes the dialog and toasts "<number> is a draft again. It is ready when somebody certifies it."
5. The mockup keeps the old certifier, time and digest on the item. A build keeps them in the history and clears them from readiness.
6. The mockup shows **Edit** on a `ready` item that a queued work order holds. The specs do not say what reopening does to that queued work order.

### States
The dialog has no loading or error state of its own. On a phone it is a bottom sheet with full-width footer buttons.

## Dependency dialog {#dialog/tklink}

The dialog adds a dependency between this work item and another open one, and refuses one that would close a cycle.

### Purpose
You know this item cannot start until another one lands, and the provider does not hold that link. You pick the direction, search the workspace's open items, pick one, read the line that says what the link means, and add it.

### Rationale
Oxagen reads the links a provider holds (`work-graph-spec.md` §4.2), and a person adds the rest here (§4.3). Oxagen refuses a dependency that would close a cycle, in the same transaction that would write it, because a cycle blocks every item on it forever. The refusal names the path, so the person sees which existing link to remove. Adding records `link_tasks`, a governed action, with both ids, the direction and the person. Day 1 writes nothing about dependencies back to the provider (§4.4).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Open items to pick from | `tklCands()` over `wsTasks()` | `list_tasks` over open items | none |
| Cycle check | `tkPathUp()` | a recursive query over `tasks.task_dependencies` in the write transaction (§9) | none |
| Add | `tkLinkAdd()` | `link_tasks` | none |

### Logic
1. **Add a dependency** clears `S.tkl` and opens the dialog. `DLG_EXT.tklink` starts `S.tkl` with direction `by`, an empty query and no pick.
2. The direction select reads "#612 is blocked by" or "#612 blocks". `tklDir()` changes it and clears the pick.
3. The search field calls `tklQ()`, which repaints the list in place without a full render, so the caret stays. `tklCands()` returns up to 8 of the workspace's items, excluding this one, closed ones and accepted ones, matching the query over number and subject. `tklList()` draws each with its logo, number, subject and readiness badge, or "No open work item matches."
4. Picking one (`tklPick()`) runs `tkPathUp()`. For "is blocked by", a path from the picked item up to this one means the picked item already waits on this one, so the link would close a cycle. The dialog then shows "Refused. #a already blocks #b", with "through" and the items between when the path is longer, and disables **Add**.
5. Otherwise it shows "#612 is blocked by #618. #612 can be sent when #618 is accepted, or closed as Done."
6. **Add** (gold) calls `tkLinkAdd()`, which records the link with source `oxagen`, the person and the time, and toasts in gold "Dependency added. link_tasks recorded." The footer names `task.link`.
7. Adding the same link twice changes nothing and records nothing (§4.1).

### States
Before a pick, **Add** is disabled. On a phone the dialog is a bottom sheet and the result list scrolls inside it.
