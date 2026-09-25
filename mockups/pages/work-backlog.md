# Backlog

| | |
|---|---|
| Route | `#/a-intel/core-platform/work` (app `/{org}/{ws}/work`). Old routes that land here: the workspace root `#/a-intel/core-platform` (app `/{org}/{ws}`, 307), and the mockup's `#/:org/:ws/tasks` and `#/:org/:ws/tasks/tasks` (rewritten in place) |
| Scope | workspace |
| Spec | `docs/work-graph-spec.md` §5 (readiness on the graph), §6 (queued sends), §7 (sends and targets), §11.1; `docs/fleet-operations-wedge.md`: D1 (Work is the primary surface), D2 (a run is a child of one work order), D3 (the Fleet page retires and its waiting count moves here), D9 (a finding becomes a work item), D16 (Approvals is a drawer), D17 (future-only marks); Vocabulary › Work; Work › Objects, Rules and Shipped today. `docs/fleet-operations-ia.md` › Work. `docs/tasks-spec.md` §3, §6.2 (statuses), §7 (people), §8.6 (readiness), §9.1 to §9.5 (selecting, the send menu, the work order screen, mentions, what sending records) |
| Design | `mockups/src/wedge.js` → `pWork()`, `workStats()`, `wiMine()`, `backlogTab()`, `woCell()`, `wiLogo()`; `mockups/src/engine.js` → `ltMulti()`, `ltMultiFacets()` (the Labels and Owner filters); `mockups/src/engine.js` → `tkBlockedByCell()`, `tkReadySub()`, `tkLayers()`, `tkGraph()`, `tkGraphCard()`, `woQueued()`, `woBlockedLine()`, `woExpiresField()`; `mockups/src/engine.js` → `dispatchButton()`, `dispatchMenu()`, `dspList()`, `tkSelectable()`, `tkWhyNot()`, `readyBadge()`, `tkPerson()`, `woOpen()`, `woDraftPrompt()`, `mentCands()`, `mentRefs()`, `DLG_EXT.wo`, `woSend()`; data `mockups/fixtures/tasks.json`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Work / Backlog`: Loaded, Loaded · mobile, Loaded · future-only fields marked |
| Audit | `work-backlog.audit-prompt.md` |

## Job

Every open work item in the workspace, whether it is ready, and where it went. The Backlog is the one place work leaves Oxagen for an agent: you select ready work items and send them, in a work order, to an agent you operate or to a published workflow of such agents. Work opens on this tab, and the workspace root lands here.

A work item arrives from a connected issue tracker, from a finding a person picked up, or from a person writing it in Oxagen. It is ready when a person certifies its definition of done. The Intake dialog (`work-intake.md`) connects the issue trackers.

## What is on the page

**Header.** Eyebrow: the workspace name (“Core platform”). h1 “Work”. Subtext “What the agents work on, and what waits on you.” On the Backlog tab the actions are **Intake** (plain; opens the Intake dialog on Trackers) and **Send to an agent…** (gold, with the agents icon and a ▾). The gold button is disabled with the title “Select one or more ready work items” until a work item is selected. It opens the send menu.

**Scope and stat cards**, under the header on every tab. A two-button group (`role=group`, `aria-label` “Scope”, `aria-pressed`) holds **All work** and **My work**. All work counts the workspace. My work counts a work item whose owner is mapped to you or whose work order you sent, and an approval that names you among its approvers. Under the group, four stat cards across, each a button with one number and one caption. The mockup outlines Open, In progress and In review as future-only.

| Card | All work on the demo record | My work | Caption | Opens |
|---|---|---|---|---|
| Open | 13 | 7 | “3 ready to send”, and “2 ready to send” in My work. A work item is open when it is in no work order and is neither accepted nor closed. Ready to send counts the `ready` items the graph does not block | Backlog |
| In progress | 3 | 3 | “3 with a live run”. Counts the work items in a work order that does not wait on a person to accept | In progress |
| In review | 1 | 1 | “waiting on a person to accept”, and “waiting on you to accept” in My work. Counts the work items whose work order waits on a person to accept | In progress |
| Pending approvals | 7, in the approval colour while above zero | 7 | “calls waiting on an approver”, and “calls you can approve” in My work. Counts the pending approvals in the workspace | the Approvals drawer |

Each card’s `aria-label` names where it goes: “Open the Backlog”, “Open the work items in progress”, “Open the work items in review” and “Open the approvals”. The scope holds as you move between tabs. A work order waits on the person who sent it, so In review follows the sender.

**Tabs** (`role=tablist`, `aria-label` “Work”), each a path segment: Backlog `7` · In progress · Work orders `1` · Workflows · Findings `36`. Backlog counts the definitions of done waiting on a person (drafts and changed certifications). Work orders counts the work orders waiting on you to accept. Findings counts the open findings nobody has picked up. In progress and Workflows carry no count. A tab with nothing waiting shows no number. Backlog is selected.

**Changed banner**, while a certified work item changed upstream: the `changed` badge, “1 work item changed after certification”, “a-intel/platform#590 was edited upstream on 2026-09-10 17:44. It is no longer ready. Certify its definition of done again to send it.”, and **Review changes**, which opens that work item.

**Backlog panel.** Heading “Backlog”, with no subtext. A checkbox that cannot be ticked says why in its title. While a selection exists, the panel header carries the badge “N selected” and **Clear**. The shared list bar: a search field (“Search this list”), then in column order the Labels filter, the Status select (“Any status”), the Blocked by select (“Any blocked by”) and the Owner filter, and Rows (5, 10, 25, 50, All). Every column header sorts. The pager reads “1–10 of 15 (page 1 of 2)”.

**Labels and Owner filters.** Each is a button that reads “Any labels” or “Any owner” until you pick a value. It then shows the first pick as the table draws it, with “+N” for the rest. It opens a list (`role=group`) with one checkbox per value in the list, each drawn as the table draws it: a label as its color chip, an owner with the avatar, and an account that is not mapped with its provider logo and badge. Beside each value is the number of rows that carry it. A row matches when it carries any value you picked. Two accounts mapped to one member are one owner. **Clear** empties the filter, and a click outside the list or Escape closes it. The list opens in the top layer, so the panel does not clip it.

Columns, in order:

| Column | Content |
|---|---|
| select | A checkbox, `aria-label` “Select <number>”. The header cell is the visually hidden word “Select” |
| Work item | The provider’s logo as an SVG (or the Oxagen mark, titled “Written in oxagen”, for an item written in Oxagen), the number in mono, and the subject under it |
| Labels | Color chips in the colors the Intake dialog sets |
| Status | Dot and word: Open, In review, Blocked, Closed |
| Blocked by | Each blocker’s number in mono as a link with its state dot (open, done, or closed without done), “none” with no blocker, and “closed as Won’t do” beside a blocker that closed without done. The provider’s Blocked status stays in the Status column, and the two are never folded into one. Outlined as future-only |
| Owner | The mapped member with avatar. An account that is not mapped reads as its provider handle with the provider’s logo and a `not mapped`, `bot` or `requester` badge |
| Readiness | Drafting, Needs certification, Changed since certified, Ready, In a work order, Accepted and Closed, for `drafting`, `draft`, `changed`, `ready`, `in a work order`, `accepted` and `closed`. A `ready` item with an open blocker reads “blocked by #612, #618” under the badge, and one held by a queued work order reads “queued in wo_01K6TB2X” |
| Work order | The work order’s id as a link, with `live` beside it while one of its runs is live, or a dash. Outlined as future-only |
| Updated | The provider’s update time, in mono |

The demo record holds 15 rows: WI-14 (written in Oxagen from finding `fnd_01K5RT2A`, `draft`), #612, PLAT-231 and #618 (`ready`), #640 (`ready`, blocked by #612 and #618), #644 (`ready`, queued in `wo_01K6TB2X`), #633, PLAT-240, #621 and #604 (`draft`), PLAT-244 (`drafting`), #590 (`changed`), PLAT-219 (`draft`, Blocked), #571 (`accepted`) and PLAT-201 (`closed`). The four work items in a work order (#482, #647, #599 and #587) are on In progress (`work-in-progress.md`).

**List and Graph.** Two chips in the panel header (`aria-pressed`) switch the body. Graph draws the open work items by layer (`docs/work-graph-spec.md` §3): one column per layer, unblocked items in layer 0, each item a card with its logo, number, subject, readiness badge and a checkbox under the same rule as the list. A line joins each blocker to the item it blocks, in the rule colour, and the lines into a selected item in the approval colour. Gold appears nowhere in the drawing and no node is called a frame. A card opens the item. Under the drawing: “Unblocked tasks sit in layer 0. A line joins each blocker to the task it blocks.” On a phone the Graph is a list by layer with a “Layer N” heading between the groups. The demo record draws #640 in layer 1 after #612 and #618, and #644 in layer 1 after #633. Outlined as future-only.

**Selection.** A checkbox is enabled when the readiness is `ready` and the status category is `open`, whether or not the graph blocks the item, unless a queued work order already holds it. A disabled checkbox carries its reason as its title:

| Why | Title |
|---|---|
| `ready` and blocked | “Blocked upstream. It can be sent when it is open again.” |
| `drafting` | “oxagen.assistant is still drafting its definition of done.” |
| `draft` | “Its definition of done is a draft. Certify it first.” |
| `changed` | “The work item changed after it was certified. Certify it again first.” |
| `in a work order` | “Already in a work order.” |
| `ready`, in a queued work order | “Already queued in wo_01K6TB2X. Withdraw it to send elsewhere.” |
| `accepted` | “Accepted and done.” |
| `closed` | “Closed upstream.” |

A selected row is tinted (`aria-selected`). A row click opens the work item (`work-item.md`). A click on the checkbox does not.

**Note** under the table: “oxagen.assistant drafts a definition of done for every work item a provider imports or a finding opens. A person certifies it, and the item is ready from that moment. A ready item goes to an agent only inside a work order, and only to an agent you operate.”

### The send menu

**Send to an agent…** opens a menu under the button (`role=menu`, `aria-label` “Send to”). Header “Send 2 work items to”, sub “agents where you are the registered operator”. A search field (“Search agents and workflows”) narrows both groups.

- **Agents you operate**: every agent in the workspace whose operator is the signed-in person. Each row (`role=menuitem`) shows the harness mark as an SVG, the avatar, the name, “<harness> · <host>” (“no host” when none) and the tier badge. The seven agents the demo seeds come first (Bug fixer, Validator, Documenter, Architect, stella CI, Release manager, Triage), then the rest by name. Twelve are listed, then “16 more. Type to narrow.” With no match: “No agent you operate matches.”
- **Workflows**: every published workflow, each with its stages’ harness marks in order and “4 stages then you”. A workflow still in a pull request is not listed. With no match: “No published workflow matches.”
- An agent somebody else operates is never listed (the demo’s Docs writer, operated by Priya Natarajan). Picking a row opens the work order dialog.
- The design adds a checkbox on each row and **Continue** under the lists, so a send can name several targets and make one work order per target (`docs/work-graph-spec.md` §7). The mockup does not draw the checkboxes; its fixture carries a finished two-target send instead (`work-orders.md`).

### The work order dialog (`wo`)

Title “Work order”, subtitle “2 work items to Bug fixer” (or the workflow’s name). Six sections, in order.

1. **Work items.** One chip per work item: the provider logo, the number, the subject, “blocked by #612, #618” on an item the graph blocks, and a remove button (`aria-label` “Remove <number>”) while more than one remains. Hint “Each work item is tagged to this work order, and each shows it on its own page.” When any item is blocked, one more line: “1 of 1 task is blocked. Oxagen sends this work order when it is unblocked, and expires it on 2026-09-25 if it is not.”
2. **Sent to.** A select (`aria-label` “Sent to”) of the agents you operate, each “Name (Harness)”, and a “Workflows” group of the published workflows. Hint “Agents where you are the registered operator, and the published workflows made of them.” Under it, the agent card (harness mark, avatar, name, “Claude Code on mbell-mbp-16”, tier badge, `operator: you`), or the workflow’s stage chain ending in **Accept** by You.
3. **Definition of done.** “8 items from 2 work items. Certified items are read-only here.” One numbered row per distinct item: its text, its tag chip, one chip per work item it came from (“#612”, “PLAT-231”), and in a workflow the role of the stage that owns it. Two work items that ask for the same thing produce one row with two chips. An input (“Add an item for this work order”) with **Add item**. Enter adds too. Hint “An item you add here is certified by your send, and belongs to this work order only.” An added item carries the chip “work order”.
4. **Prompt.** The label reads `drafted by oxagen.assistant`, and `edited by you` from the first keystroke. **Draft it again** replaces the text with a new draft. A monospace textarea (`aria-label` “Prompt”, 16 rows) holds the drafted brief: “You have a work order from Marcus Bell, your operator, in Core platform.”, the work items with their links, “Definition of done. Each item was certified by a person.” and the numbered items with their tags and source numbers, the workflow’s stages and “Hand off with hand_off_work_order when your items are claimed.” when there is one, the repositories and the branch (“You may change a-intel/platform. Work on the branch wo/s2m4qf. Open one pull request. Never push to a production branch and never merge.”), the `claim_dod_item` instruction, and “Follow @ctx.release.never-merge.” Hint “Type @ to reference a Steering record or an agent profile. A record enters the brief as its statement. A profile enters as the agent’s name, harness and job, and grants it nothing.” **References** lists every mention: a Steering record with its kind glyph, its id and “188 tok”; an agent profile with its harness mark, avatar, name and “profile”; an unresolved one as `@<id>` and “not found”. A mention still being typed is not flagged. With none: “No references yet. Type @ to add a Steering record or an agent profile.”
5. **Repositories.** “The repositories this work order may change. Branches and pull requests only.” One checkbox per main and linked repository, pre-checked from the work items: “a-intel/platform” with “main repo · production branch main”, and each linked repository with “linked repo · production branch <branch>”. One outside the agent’s toolbelt is disabled, with “· outside Bug fixer’s toolbelt”. Then the gold-edged checkbox **I confirm the repositories**: “Bug fixer may push branches and open pull requests on a-intel/platform. Nothing is merged without a person.” Changing a repository or the target clears the confirmation.
6. **Spend cap.** A USD field (`aria-label` “Spend cap in US dollars”), default 12.00. Hint “USD for the whole work order, every stage and every return. Each run also stays inside its own agent’s budget of $2.00 per run.” When any stage runs on Cursor, a warning: “Cursor is not metered. Cursor’s model calls do not pass through the Oxagen gateway, so the cap counts every stage but that one.” When any item is blocked, **Expires** follows: a date (`aria-label` “Expires”), default 14 days from the send and at most 90, with the hint “A queued work order that is still waiting on this date expires, and its tasks go back to ready.”

Footer: “needs `work_order.send` on core-platform”, **Cancel**, **Send to Bug fixer** (gold), or **Queue until unblocked** (gold) when any item is blocked. Send stays disabled until the repositories are confirmed, at least one repository is checked, and the brief is not empty.

**The mention list.** Typing `@` in the brief opens a list under the box (`role=listbox`, `aria-label` “Mentions”; each entry `role=option`): Steering records (kind glyph, `@<id>`, the statement cut at 70 characters, “rule · 188 tok”) and the workspace’s agent profiles (harness mark, avatar, `@<key>`, name, “Claude Code · you operate it”). Enter or Tab inserts the first entry, a click inserts any, and Escape closes the list. With no match: “Nothing matches @<text>.” Typing never moves the caret.

**Dialogs and layers this page opens:** the Intake dialog (`intake`, specified in `work-intake.md`), the send menu, and `wo`.

**Shell.** The sidebar with Work lit and its count, 8: seven definitions of done waiting on a person plus one work order waiting on you. The top bar: breadcrumbs “Anderson Intelligence Corp. / Core platform / Work”, ⌘K “Search or run an action”, notifications, the Approvals button with the organization’s waiting count (17 on the demo record; `approvals-drawer.md`), and the avatar.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Checked against `macanderson/oxagen` `origin/main` at `1ba160dbc`. The wedge spec’s Work › Shipped today holds for every row here: nothing in the repository stores a work item, a work order, a workflow or an intake connection.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Work item rows: number, subject, provider, labels, status, owner, updated | `TASKS`, `TLABELS`, `TSTATUS`, `TPEOPLE` (`fixtures/tasks.json`) | `tasks.tasks`, `tasks.task_labels`, `tasks.field_settings`, `tasks.provider_people`; `list_tasks` | No work item record. The ingestion connectors read GitHub issues (`packages/ingestion/src/connectors/github/index.ts:126`), Linear issues (`linear/index.ts:81`), Zendesk tickets (`zendesk/index.ts:167-168`) and Salesforce cases (`salesforce/index.ts:49-50`) into the graph, not into a work item. No Jira or ServiceNow connector | ❌ |
| A work item written in Oxagen (WI-14) | `TASKS` kind `oxagen`, `finding` | `tasks.tasks` with its finding | none | ❌ |
| Readiness and the checkbox rule | `TASKS[].ready`, `tkSelectable()` | `tasks.dod_certifications`; `certify_task_dod` | none | ❌ |
| Changed banner | `TASKS[].ready` `changed`, `was` | the provider version on the certification | none | ❌ |
| Work order column | `TASKS[].wo`, `WORKORDERS` | `tasks.work_order_tasks`; `list_work_orders` | none | ❌ |
| `live` beside a work order | `woLive()` over `RUNS` | the run’s parent work order and its status | Run status ships (`live`, `sealed`, `halted`: `packages/oxagen/src/contracts/run.list.ts:52`). No run names a work order: `taskRef` is a free-text goal (`run.list.ts:285-291`), null for every wrapped session (`packages/handlers/src/run.list.ts:1278`) | ❌ |
| Open and its ready to send | `workStats()` over `TASKS` | rollups over `tasks.tasks` | none | ❌ |
| In progress, In review, and the live count | `workStats()` over `TASKS` and `WORKORDERS`, `woLive()` | `tasks.work_order_tasks` and `tasks.work_orders` by state; work orders with a live run | none | ❌ |
| Pending approvals | `APPROVALS` pending in the workspace | `list_approvals` | The workspace’s pending approvals ship (`packages/oxagen/src/contracts/agent.approval.list.ts:84`) | ✅ |
| My work | `wiMine()`, `apMine()` | the owner’s member mapping (`tasks.provider_people`), the work order’s sender, and the approvers an approval names | `list_approvals` names no approver | ❌ |
| Send menu: agents you operate | `myAgents()` over `AGENTS` (`operator`) | `list_agents` `operatorId` | `operatorId` is `principals.parent_user_id` (`packages/oxagen/src/contracts/agent.list.ts:71-72`) | ✅ |
| Harness mark, host and tier per agent | `AGENTS[].harness`, `.host`, `.tier` | `list_agents` | `harness` (`agent.list.ts:24-31`, `agents_harness_check` in `packages/database/atlas/migrations/20260918210100_agents_harness_codex_cursor.sql:16-17`), `host` (`agent.list.ts:136`), `enforcementTier` (`agent.list.ts:83`) | ✅ |
| Published workflows in the menu | `WORKFLOWS` state `published` | `.oxagen/workflows/*.toml` | none. ADR-043 removed the old `workflow.*` capabilities | ❌ |
| Merged definition of done | `woItemsFor()` over `TASKS[].dod` | `tasks.dod_items`, `tasks.work_order_items` | none | ❌ |
| Drafted brief | `woDraftPrompt()` | `create_work_order` (drafted by `oxagen.assistant`) | `ask_assistant` exists (`packages/oxagen/src/contracts/assistant.ask.ts:61`). Nothing drafts a brief | ❌ |
| Mentions of Steering records | `RECORDS` | `list_records`; the mention grammar | Records and their statements ship (`packages/oxagen/src/contracts/context.records.list.ts:17`, `context.steering.shared.ts:215`), with no token cost. The grammar has no record or work item type (`packages/ai/src/prompts/mentions.ts:32-42`) | 🟡 |
| Mentions of agent profiles | `AGENTS` in the workspace | the mention grammar’s `agent` type | `agent` is a mention type (`packages/ai/src/prompts/mentions.ts:37`) | ✅ |
| Repositories and the toolbelt refusal | `wsRepos()`, the `grant` constant in `DLG_EXT.wo` | the workspace’s bindings and the agent’s toolbelt | The main and linked repositories ship (`list_repositories`, `packages/oxagen/src/contracts/repository.list.ts:44`; `ingestion.repository_binding_heads`, `packages/database/src/schema/ingestion.ts:542`). No toolbelt names the repositories an agent may write | 🟡 |
| Spend cap and the per-run budget hint | `S.wo.cap`, `AGENTS[].budget` | `tasks.work_orders` cap; a per-run budget | `set_spend_budget` sets an organization or workspace ceiling only (`packages/oxagen/src/contracts/billing.budget.set.ts:55`) | ❌ |
| Sending | `woSend()` | `send_work_order`, a governed action | none | ❌ |
| Waiting count on the Work nav item | `tkWaiting()` + `woWaiting()` | the same rollups | none | ❌ |
| Blocked by column, the reason under a ready badge, and the layers of the Graph | `TASKS[].blockedBy`, `tkLayers()` | `tasks.task_dependencies`; `list_tasks` `blockedBy`; `get_work_graph` (`work-graph-spec.md` §9, §10) | none. No connector reads a link between records | ❌ |
| Queued send: the blocked line, **Expires**, **Queue until unblocked** | `woQueued()`, `S.wo.expires` | `send_work_order` with `when: unblocked` and `expiresAt` (§6) | none | ❌ |
| A queued work order holding an item | `TASKS[].queued` | `tasks.work_orders` in state `queued` (§6.1) | none | ❌ |

## Future-only fields

The mockup marks these with `data-future` (`?future=1` outlines them):

| Mark | Reason in the mockup | What a build shows instead today |
|---|---|---|
| The Open, In progress and In review cards | “work items”, and “work items and work orders” | `not recorded` in each card. No `/work` route exists in `apps/app` today; the workspace root renders Fleet (`apps/app/src/app/[org]/[ws]/(fleet)/page.tsx`), whose tiles count runs, not work |
| Each Work order cell | “work orders” | `not recorded` |

The mockup marks nothing else on this tab, but every Work field here is future-only (wedge spec, Work › Shipped today): the rows, the changed banner, the send menu’s workflows group, the work order dialog and the send. A build renders each value as `not recorded` and leaves out a control whose capability does not exist, until the contracts in Backend gaps ship. Two things on the tab ship today: the agents you operate, with their harness, host and tier, and the agent profiles you can mention.

## Functionality

- Only a work item that is `ready` with a status in the `open` category can be selected. Selecting one on a blocked, draft, changed, sent, accepted or closed item is refused in the DOM and on the server.
- Work reaches an agent only in a work order, and only an agent whose operator is the sender. The send menu and the dialog’s select list no other agent.
- The dialog merges every certified item of every selected work item into one list, one row per distinct item, each tagged with its sources. Certified items cannot be edited in the dialog.
- The brief is the operator’s to edit. A record mention enters the brief as the record’s statement. A profile mention enters as the agent’s name, harness and job, and grants that agent nothing.
- A work order narrows the repositories an agent may write and never widens them. It sends nothing until the repositories are confirmed.
- Sending records one governed action (`send_work_order`) with the brief and its digest, the items with their certification digests, the repositories, the cap and the target. Each work item moves to `in a work order`, leaves the selection and names the work order on its own page. The sender lands on the work order (`work-order.md`), and a gold toast reads “Work order <id> sent to Bug fixer. It starts when mbell-mbp-16 picks it up.”
- Every stat card is a rollup of rows: Open counts the Backlog’s open rows, In progress and In review split the In progress tab’s rows by whether their work order waits on a person to accept, and Pending approvals counts the workspace’s pending approvals. My work applies the same rules to your rows. The Work nav count stays the drafts and changed certifications plus the work orders waiting on you.
- A work item leaves the Backlog when a send puts it in a work order, and it appears on In progress. It returns as Accepted when a person accepts every item of its work order.
- `node tools/check-tasks.mjs` walks flows 4 (selecting and the send menu), 5 (the work order and sending) and 6 (a workflow as the target) on this tab.

- A work item the graph blocks can be selected, and its work order is queued until every upstream item is accepted in Oxagen or closed as Done in the provider (`docs/work-graph-spec.md` §5.2, §6). An item a queued work order holds cannot be selected again.
- The Open card’s ready to send counts `ready` rows the graph does not block. The Blocked by column and the Graph carry the rest.
- `node tools/check-tasks.mjs` walks flows 9 (the blocked reason and the checkbox rule), 10 (queueing) and 11 (the Graph view) on this tab.

## States

Loaded only. This change designs the loaded state. The build uses the shell’s standard loading, error, empty and denied panels until they are designed.

Within loaded, a workspace with no connected provider and no written work item (the demo’s `finops`) shows one panel instead of the scope group, the stat cards and the table: “No issue tracker is connected to this workspace”, “Connect one to import its issues as work items, or write a work item here.”, and **Connect an issue tracker** (gold), which opens Intake on Trackers.

## Mobile

The thumb bar holds Work (lit, with its count, 8), Agents, Tools, Spend and More (its count is the open critical incidents, 3). More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The two header actions stack, the gold one at full width. The tab strip scrolls sideways inside itself, and the page never does. The stat cards sit two by two under the scope group. The Labels and Owner filters are 44 px tall with 16 px text, and each option in their lists is 44 px tall. The banner stacks its badge, its text and **Review changes**. The table becomes labelled cards, each cell labelled with its column header and the checkbox at the top of the card. The send menu opens at full width under the button and scrolls inside itself above the thumb bar. The work order dialog is a bottom sheet with a drag handle and full-width footer buttons, and a workflow’s stage chain stacks one stage per row without arrows. Touch targets are at least 44 px and inputs 16 px.

## Permissions

The design names these. None exists in `packages/iam` today.

- Read: `work.read`
- Writes, each a governed action recorded in Audit: `work_order.send` (send or queue a work order to agents you operate)

## Backend gaps this page depends on

- The work item record with readiness and certification (`tasks-spec.md` §6, §8; `list_tasks`, `certify_task_dod`)
- The work order record and its send (`create_work_order`, `send_work_order`, `list_work_orders`), and delivery to the agent’s runtime (§9.6)
- A work order id on the run record beside `taskRef` (wedge spec, Open decisions 5), so `live` and the live count on In progress read runs by work order
- The workflow file schema (`.oxagen/workflows/*.toml`) and its ADR (`tasks-spec.md` §17.2)
- `context_record` and `task` types in the mention grammar (§17.6), and a token cost on a Steering record
- The repositories an agent’s toolbelt may write, and a per-run budget per agent

- A dependency between two work items, read from the provider or added by a person, and the derived blocked reason (`docs/work-graph-spec.md` §4, §5)
- A queued work order with an expiry, its release in the transaction that unblocks its last item, and a send with several targets (§6, §7)

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. The send creates SteeringFrames (`work-order.md`), not frames.
- A Steering Source and a SteeringFrame are never shown as each other. A record mention in the brief names the record, the source. The frames the send emits are shown on the work order.
- Nothing on this tab infers, scores or explains. The drafted brief is labelled `drafted by oxagen.assistant` until a person edits it, and the assistant never certifies.
- No person is scored or ranked. Owners are listed, never ordered by output.
- Every enforcement claim states the tier. Each agent in the send menu and the dialog shows its recorded tier, and nothing on the tab says a repository limit is enforced beyond what that tier enforces.
- Headers are rollups of the rows beneath them. The stat cards and the Work nav count are sums of the rows, never typed twice.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: **Send to an agent…**, or the dialog’s **Send to <target>** while `wo` is open.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- An agent somebody else operates is never offered as a target.
- A provider account that is not mapped is shown as itself, never as a member.
- Every harness shows its own mark, and no harness is the default in a list.
- The provider’s `blocked` status and the graph’s blocked reason are two columns, never one.
- The Graph draws state in the `--st-*` hues and the rule colour, never gold, and calls no node a frame.
- A queued work order is a person’s send held by Oxagen. Nothing on this tab queues on its own.
