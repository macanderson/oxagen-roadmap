# Audit prompt: Work item

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Work item** page of Oxagen (`/a-intel/core-platform/work/items/<item>`) and its two dialogs, `certify` and `dodreopen`, for conformance to their design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarize what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/work-item.md` (read it first, in full).
2. The design, rendered: the stories `Oxagen / Work / Work item` (Loaded, Loaded · mobile, Loaded · future-only fields marked), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>[&future=1]#/a-intel/core-platform/work/items/<id>` for `tsk_01K5RS482Q` (in a work order), `tsk_01K6SA3G9Z` (drafting), `tsk_01K6S7C5PA` (draft), `tsk_01K6SC1Y5M` (changed), `tsk_01K6S2M4QF` (ready), `tsk_01K6SH7C2F` (written from a finding), `tsk_01K6RW9A2L` (accepted) and `tsk_01K6RX4C8T` (closed). The flow check is `node tools/check-tasks.mjs` (flows 2, 3 and 8).
3. The product specs: `docs/fleet-operations-wedge.md` (Work), `docs/tasks-spec.md` §6, §7, §8, §9.1, §14.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

5. The work graph: `docs/work-graph-spec.md` §4, §5, §11.2, §12.2.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/a-intel/core-platform/work/items/<item>`, with Work lit in the sidebar and the breadcrumbs ending “Work / <number>”, the number in mono.
2. **Header.** The provider logo (or the Oxagen mark) and the number as the eyebrow, the subject as h1, the one-sentence subtext naming the provider or the finding. **Copy prompt** and **Open in <provider>** (or **Open the finding**) are plain. The primary follows the spec’s readiness table exactly, for each of the eight demo items. One gold on the screen.
3. **Copy prompt.** It copies the number, subject and provider link, the Oxagen id and link, the description, the definition of done labelled certified (with who, when and the digest), certified before a change, or a draft nobody certified, and every work order that carries the item with its id, title, state and link. Check it on `tsk_01K6SF2W6Q` (in a work order) and `tsk_01K6S7C5PA` (in none), and check the toast. A draft that reads as certified is a FAIL.
4. **Fields panel.** Exactly Work item id, Number, Status, Resolution, Labels, Owner, Created by, Created at, Updated by, Updated at, Closed at, in that order, with the readiness badge in the header. People follow the mapping: a mapped member with avatar and handle, an unmapped account as its handle with `not mapped`, a bot with `bot`.
5. **Drafting.** A `drafting` item shows the busy line “Reading the description, the labels and the linked pull requests.” and **Draft it now**. Drafting fills the list and the notes, sets `draft`, and records a turn by `oxagen.assistant` that appears in neither Work’s runs nor Spend. A checklist already in the description arrives first, marked `from the issue`.
6. **Editing a draft.** Each item has its text, Tag (code, test, docs, review), Kind (check, review), source and remove, each control labelled with the item’s number. **Add item** and Enter add one marked `you`. Editing an item’s text marks it `edited by you`. The wand redrafts and keeps every item a person wrote or edited. Typing does not lose the caret.
7. **Certify.** The dialog lists every item and names `certify_task_dod`, the digest and the provider version in one sentence. What an upstream change does is in `mockups/help/work-item.md`, Certify dialog, not in the dialog. **Certify** is disabled until **I read every item** is ticked, in the DOM **and** on the server. Recompute the stored digest as SHA-256 over the RFC 8785 canonical JSON of the items. With the connection’s certify switch on, one note is posted; with it off, none. In a `regulated` workspace the dialog warns, and the server refuses a work order sent by the certifier. Certify an item written in Oxagen (`tsk_01K6SH7C2F`) too: it has no provider, and the dialog must still open.
8. **The assistant cannot certify.** Search the build for any path where `oxagen.assistant`, an agent, or an API key without a person certifies. One is a FAIL.
9. **Certified.** The list is read-only with the digest shown. **Edit** opens `dodreopen`, which says the item returns to draft, with no note. Verify on the server that sent work orders keep their list. Confirming sets `draft`.
10. **Changed.** An upstream edit to the subject, description or labels of a certified item sets `changed`, shows the banner and the **Certified against** and **Now** panels, keeps the list editable, offers the assistant’s suggestion, and offers **Certify again**. A comment, an assignee change, or a status change within one category does not. Verify each against the sync code.
11. **Work orders panel.** Every work order that carries the item, with its id, state, title and runs, each run linking to the run and marked `live` while live, or “Not sent yet.” A direct work order listed here is labelled as direct wherever the build shows its kind.
12. **History.** Imported (or Written), Definition of done drafted, Certified, Changed upstream, Sent in a work order, Accepted, each with time and actor, and only those that happened.
13. **Data sources.** For each row of the spec’s Data sources table, find what feeds it in the build. Every row is ❌: each must render `not recorded` or be left out, never a zero and never a fixture, until its contract ships. A fixture reaching production is a FAIL.
14. **Future-only fields.** The Work orders panel and every other field the spec lists render `not recorded` until their contracts ship, and **Draft it now**, **Certify definition of done**, **Edit** and the send are left out or say what they will do. A control that silently does nothing is a FAIL.
15. **States.** The design has the loaded state only. Force loading, error, empty and denied: each must be the shell’s standard panel inside the shell. An unknown id renders “No work item has this id” with **Back to Work**, inside the shell.
16. **Mobile.** At 390 × 844: the thumb bar (Work, Agents, Tools, Spend, More); the columns stack with the main column first; the item rows keep their selects on one wrapping line; every icon button (the wand, remove) shows its icon; dialogs are bottom sheets with full-width footer buttons; nothing scrolls sideways; touch targets at least 44 px; inputs 16 px.
17. **Rules.** One gold action. No heading or caption carries a comma, a mid-dot, or a not/never contrast. Item states elsewhere are `open`, `claimed` or `accepted`, never `held`, `proven` or `verified`. The source of every item is visible. The object is a work item, never a task, in every string a person reads, including “None. This work item waits on nothing, and nothing waits on it.” No sentence on the page or in its dialogs explains the design, and the explanations live in `mockups/help/work-item.md`.
18. **Accessibility.** Every item input and select is labelled with its number. Dialogs are `role=dialog aria-modal` with a labelled close. State is never colour alone.
19. **Permissions.** `task.edit_dod`, `task.certify` and `work_order.send` are gated on the server. Verify with a role that lacks each.
20. **Dependencies.** The panel sits above Fields with **Blocked by** and **Blocks**. Each row shows the number as a link, the subject, the state as a dot and a word (`open`, `in a work order`, `accepted`, `closed as Done`, `closed as Won’t do`) and its source: a provider logo with “from <provider>”, or “added here by <name> on <time>”. A `provider` row has no **Remove** and its title says where to remove it; an `oxagen` row’s **Remove** records `unlink_tasks`. `tklink` searches open items (“Search open work items”, and “No open work item matches.” with no result), previews the sentence, refuses a cycle with the path (“Refused. #A already blocks #B …”), writes nothing on a refusal, and records `link_tasks` on Add. The header reads “Blocked by #N.” while an upstream item is open, the send button stays **enabled** for a `ready` open item the graph blocks, and an item a queued work order holds shows **Open the work order**. History carries Dependency added, Dependency removed, Unblocked and Queued in a work order.
21. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding, and the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Work item audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
