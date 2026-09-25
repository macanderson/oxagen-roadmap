# Audit prompt: Backlog

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Backlog** tab of Work in Oxagen (`/a-intel/core-platform/work`), with its send menu and the work order dialog, for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarize what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/work-backlog.md` (read it first, in full).
2. The design, rendered: the stories `Oxagen / Work / Backlog` (Loaded, Loaded · mobile, Loaded · future-only fields marked) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>[&future=1]#/a-intel/core-platform/work`. The flow check is `node tools/check-tasks.mjs` (flows 4, 5 and 6).
3. The product specs: `docs/fleet-operations-wedge.md` (D1, D2, D3, D9, D16, D17; Work), `docs/fleet-operations-ia.md` (Work), `docs/tasks-spec.md` §6.2, §7, §8.6, §9, §14.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/work`.

5. The work graph: `docs/work-graph-spec.md` §5, §6, §11.1.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/a-intel/core-platform/work`. The workspace root `/a-intel/core-platform` answers 307 to it. The sidebar lists Work, Agents, Tools, Steering, Runtimes, Spend and Repositories, with Work lit and its count equal to the definitions of done waiting on a person plus the work orders waiting on you, absent at zero. The breadcrumbs read “Anderson Intelligence Corp. / Core platform / Work”. ⌘K, notifications, the Approvals button with the organization-wide count, and the avatar are present.
2. **Header.** Eyebrow the workspace name, h1 “Work”, the subtext “What the agents work on, and what waits on you.” On Backlog the actions are **Intake** (plain) and **Send to an agent…** (gold), the second disabled with the title “Select one or more ready work items” while nothing is selected. A second gold control anywhere on the screen is a FAIL.
3. **Tabs.** Backlog · In progress · Work orders · Workflows · Findings, in that order, with `role=tablist` and `aria-selected`, each a path segment that a reload keeps. Counts: Backlog the drafts and changed certifications, Work orders the work orders waiting on you, Findings the open findings nobody picked up, In progress and Workflows none. A zero shows no number.
4. **Scope and stat cards.** **All work** and **My work** (`aria-pressed`) sit above four cards: Open (“N ready to send”), In progress (“N with a live run”), In review (“waiting on a person to accept”, or “waiting on you to accept” in My work) and Pending approvals (“calls waiting on an approver”, or “calls you can approve” in My work, in the approval colour above zero). Recompute each from the rows, the work orders and the approvals under both scopes: a figure that is typed or disagrees with its rows is a FAIL. Each card is a button. Open opens Backlog, In progress and In review open In progress, and Pending approvals opens the Approvals drawer.
5. **Changed banner.** Present exactly while a certified work item changed upstream, with the `changed` badge, the count, the number and time of the edit, the sentence on leaving ready, and **Review changes** opening that item.
6. **Table.** Heading “Backlog”, with no subtext. Columns in order: select · Work item · Labels · Status · Blocked by · Owner · Readiness · Work order · Updated. No work item in a work order is listed: those are on In progress. The provider logo is an SVG with a text alternative, and an item written in Oxagen carries the Oxagen mark. Labels are colour chips. Status reads Open, In review, Blocked or Closed. Readiness uses exactly `drafting`, `draft`, `changed`, `ready`, `in a work order`, `accepted`, `closed`. Owner shows a mapped member with avatar, and an unmapped account as its handle with its provider logo and `not mapped`, `bot` or `requester`. The Work order cell links the work order and shows `live` while one of its runs is live. The list bar has search, the Labels filter, the Status and Blocked by selects, the Owner filter, Rows and a pager. Labels and Owner take several values. Their lists draw each label as its colour chip and each owner with the avatar, and a row matches any value picked. Missing or renamed columns are FAILs.
7. **Selection.** Only a `ready` item in the `open` category has an enabled checkbox. Each disabled checkbox carries the reason from the spec’s table, word for word. Try to select a blocked, draft, changed, sent, accepted and closed item in the DOM **and** through the server’s send: each must be refused. A row click opens the work item. A checkbox click does not. The panel header shows “N selected” and **Clear** while a selection exists.
8. **Send menu.** Disabled with nothing selected. The header counts the selection (“Send 2 work items to”) with “agents where you are the registered operator”. It lists **only** agents whose operator is the signed-in person: confirm that an agent another person operates (the demo’s Docs writer, operated by Priya Natarajan) is absent and that the server refuses a work order addressed to it. Each agent row shows its harness mark as an SVG, avatar, name, harness and host, and its recorded tier. Claude Code, Codex, Cursor and Stella each have their own mark. Only published workflows appear, each with its stages’ marks and “N stages then you”. Search narrows both groups. `role=menu` and `role=menuitem` are present.
9. **Work order dialog.** Six sections in order: Work items, Sent to, Definition of done, Prompt, Repositories, Spend cap.
   - Work items: one chip per item, removable while more than one remains, and the hint.
   - Sent to: the select holds agents you operate and published workflows only. The agent card says `operator: you` and shows the tier. A workflow shows every stage and ends in Accept by You.
   - Definition of done: every certified item of every selected work item, one row per distinct item, tagged with its source items. Two items with the same text make one row with two tags. Certified items cannot be edited. An added item is marked as the work order’s.
   - Prompt: drafted, editable, **Draft it again** resets it, and the label turns from `drafted by oxagen.assistant` to `edited by you` on the first keystroke. Typing does not move the caret or re-render the dialog.
   - Mentions: `@` opens the list (`role=listbox`, `role=option`). Enter or Tab inserts the first, a click inserts any, Escape closes. **References** lists each resolved mention with its kind and flags an unresolved one `not found`, but not the one still being typed. Verify on the server that a profile mention is stored as a reference, never as a recipient, and grants that agent nothing.
   - Repositories: pre-checked from the items; one outside the agent’s toolbelt is disabled with the reason. **I confirm the repositories** names the agents and the repositories. Changing a repository or the target clears it.
   - Spend cap: a USD field, the hint, and the Cursor warning whenever a stage runs on Cursor.
   - **Send** is disabled until the confirmation is ticked, a repository is checked and the brief is not empty, in the DOM **and** on the server. The footer names `work_order.send`.
10. **Sending.** One governed action (`send_work_order`) records the brief and its digest, the items with their certification digests, the repositories, the cap and the target. Confirm the cap is stored and reaches the work order. The items move to `in a work order`, leave the selection and show the work order on their pages. The sender lands on `/work/orders/<id>`, never on an old `/tasks/…` path, and sees the toast naming the work order, the target and the host.
11. **Data sources.** For each row of the spec’s Data sources table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render `not recorded` for the rest. ❌ rows render `not recorded`, never a zero and never a fixture. The agents you operate must come from `list_agents` `operatorId`. A fixture reaching production is a FAIL.
12. **Future-only fields.** Every field the spec lists as future-only (the Open, In progress and In review cards, the Work order column, and every other Work field) renders `not recorded` until its contract ships, and a control whose capability does not exist is left out or says what it will do. A control that silently does nothing is a FAIL.
13. **States.** The design has the loaded state only. Force loading, error, empty and denied: each must be the shell’s standard panel inside the shell, with no zeros and no stale rows. Record which panel the build uses for each.
14. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work (lit, with its count), Agents, Tools, Spend and More, and More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The header actions stack, the tab strip scrolls inside itself, the stat cards sit two by two, the table is labelled cards, the send menu scrolls above the thumb bar, and the work order dialog is a bottom sheet with full-width footer buttons and a stacked stage chain. The page never scrolls sideways. Touch targets are at least 44 px and inputs 16 px.
15. **Rules.** One gold action on the screen. No heading, panel title, table header or caption carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. Stat cards are rollups of the rows. No person is scored or ranked. Every tier shown is the recorded one, and nothing claims a repository limit is enforced beyond that tier. Nothing is labelled a task: the object is a work item. An unmapped account is never shown as a member. No harness is listed first by default.
16. **Accessibility.** Tabs use `role=tablist`/`tab` with `aria-selected`. Rows are keyboard operable. Each checkbox has an `aria-label` naming its item. Marks have text alternatives. Dialogs are `role=dialog aria-modal` with a labelled close. State is never colour alone (dot and word). Focus is visible.
17. **Permissions.** `work.read` to see the tab, and `work_order.send` gated on the server for the send. Verify with a role that lacks each.
18. **Blocked by and the graph.** The table carries a Blocked by column after Status, listing each blocker’s number as a link with its state dot, “none” with no blocker, and “closed as Won’t do” beside a blocker that closed without done. A `ready` item with an open blocker reads “blocked by #N” under its readiness badge and its checkbox is **enabled**; an item a queued work order holds reads “queued in wo_…” and is disabled with “Already queued in …”; an item whose provider status category is `blocked` is disabled with “Blocked upstream”. Verify the provider’s status and the graph’s reason are never one column or one word. The Open card’s ready to send counts only unblocked ready rows. The **List** and **Graph** chips switch the body; Graph draws the open items by layer, unblocked in layer 0, edges from blocker to blocked in the rule colour and never gold, no node labelled a frame, and on a phone a list by layer with “Layer N” headings. Unblocked means every upstream item is accepted in Oxagen or closed as Done in the provider; a prerequisite closed as Won’t do still blocks.
19. **Queued sends.** Selecting a blocked ready item and sending shows the blocked chip, the “N of M … blocked” line, **Expires** (default 14 days, at most 90), and the footer **Queue until unblocked**. Queueing records `send_work_order` with `when: unblocked` and the expiry, lands on the work order page in state `queued`, and Oxagen releases it in the transaction that unblocks its last item. Verify a queued work order reaches no runtime before release, in the DOM and on the server.
20. **Nothing extra.** List anything on the built page that is not in the spec (tiles, columns, buttons, copy). Each is a finding, and the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Backlog audit {{DATE}}
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
