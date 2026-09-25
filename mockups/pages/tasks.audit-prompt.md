# Audit prompt: Tasks

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Tasks** page of Oxagen (`#/a-intel/core-platform/tasks`, with its Tasks, Work orders and Workflows tabs, the send menu, the work order dialog, and the workflow builder) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/tasks.md` (read it first, in full).
2. The design, rendered: the `tasks`, `tasks-work-orders` and `tasks-workflows` stories in Storybook (`npm run storybook`), one per state, desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/tasks[/<tab>]`. The flow check is `node tools/check-tasks.mjs`.
3. The product spec: `docs/tasks-spec.md` §3, §8.6, §9, §10, §12, §14, and `docs/work-graph-spec.md` §5 to §8, §10, §11.1.
4. The build under audit: `{{APP_ROOT}}`, served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/tasks[/<tab>]`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** Each tab is its own URL segment and a reload keeps it. Tasks is a Workspace nav item directly under Fleet. Its count is the drafts and changed certifications waiting on a person plus the work orders waiting on you, and it is absent at zero. The breadcrumb ends on Tasks. The Approvals button, notifications and ⌘K are present. The document title names the page.
2. **Header.** Eyebrow the workspace, h1 "Tasks", the one-sentence subtext. On the Tasks tab the gold action is **Create work order and send to agent** and **Connect an issue provider** is plain; on Workflows the gold is **New workflow**; elsewhere the gold is **Connect an issue provider**. Two golds anywhere on the screen is a FAIL.
3. **Tabs.** Tasks · Work orders · Workflows · Providers · Fields · People, each with a count only where the spec gives one. A tab with nothing waiting shows no number.
4. **Tiles.** Ready for work, Drafts waiting on you, Blocked by other tasks, In work orders, each a rollup of the rows below, never typed twice.
5. **Tasks table.** Columns in order: select · Task · Labels · Status · Blocked by · Owner · Readiness · Updated. Labels render as colour chips in the configured colours. Owner shows a mapped member with avatar, and an unmapped account as its provider handle with its logo and `not mapped`, a bot with `bot`. Readiness uses exactly the seven words of the spec.
6. **Selection.** Only a `ready` task with an `open` status category that no queued work order holds has an enabled checkbox. Every disabled checkbox carries the reason. Selecting a draft, changed, sent, closed, or queued task, or one whose provider status category is `blocked`, must be impossible. A ready task the graph blocks stays selectable (check 19). in the DOM **and** refused by the server. A row click opens the task; a checkbox click does not.
7. **The send button and menu.** Disabled with nothing selected. The menu header counts the selection. It lists **only agents whose operator is the signed-in person**: verify with a fixture agent operated by somebody else (the demo's Docs writer, operated by Priya Natarajan) that it is absent, and that the server refuses a work order addressed to it. Every agent row shows its harness mark as an SVG, the avatar, name, harness and host, and the tier. Claude Code, Codex, Cursor and Stella each have their own mark, and no harness is pinned first by default. Published workflows appear with their stages' harness marks in order. Search narrows both groups.
8. **The work order dialog.** Six sections in order: Tasks, Sent to, Definition of done, Prompt, Repositories, Spend cap.
   - Tasks: one chip per task, removable while more than one remains.
   - Sent to: the select holds agents you operate and published workflows only. The agent card says `operator: you`. A workflow shows every stage and ends in Accept by You.
   - Definition of done: every certified item of every selected task, one row per distinct item, each tagged with its source tasks. Two tasks with the same item produce one row with two tags. Certified items cannot be edited here. An item added here is marked as the work order's.
   - Prompt: drafted, editable, **Draft it again** resets it, and the label switches from `drafted by oxagen.assistant` to `edited by you` on the first keystroke. Typing does not move the caret or re-render the dialog.
   - Mentions: `@` opens a list of context records and agent profiles; Enter or Tab inserts the first; click inserts any; Escape closes. **References** lists every resolved mention with its kind, and flags an unresolved one `not found`, but not the one still being typed. A profile mention sends nothing to that agent and grants it nothing: verify the server stores it as a reference, not a recipient.
   - Repositories: pre-checked from the tasks; a repository outside the agent's toolbelt is disabled with the reason. **I confirm the repositories** names the agents and repositories. Changing a repository or the target clears the confirmation.
   - Spend cap: a USD field and the per-run budget hint; the Cursor warning appears when any stage runs on Cursor.
   - **Send** is disabled until the confirmation is ticked, a repository is checked, and the prompt is not empty, in the DOM **and** on the server.
9. **Sending.** Records one governed action (`send_work_order`) with the prompt and its digest, the items with their certification digests, the repositories, the cap and the target. The tasks move to `in a work order`, leave the selection, and show the work order on their pages. The sender lands on the work order page. The provider comment is posted only when the connection's switch is on.
10. **Work orders tab.** Columns in order: Work order · Tasks · Sent to · Stage · Items claimed · State · Sent by. States use the spec's words. A row opens the work order.
11. **Workflows tab.** Columns: Workflow · Stages · State · Work orders. State is `published` with its commit or `pull request open` with its number. **How a workflow runs** carries the five facts and the operator note. `wfview` shows the file as committed.
12. **The workflow builder.** The wand turns the sentence in the spec into Fix, Validate, Document, Review in that order. Each stage's agent select lists only agents you operate, with their harness. On failure offers stop or return to an earlier stage only, with at most 1 to 3. The Accept stage cannot be removed. The TOML preview matches the stages. **Open pull request** opens a pull request and writes no row: the workflow is usable only after merge.
13. **States.** empty: "No issue provider is connected to this workspace", the two sentences, **Connect an issue provider**, and no header or tabs. loading: the shell and the skeleton, no zeros. error: "Tasks could not be loaded" with `503 issue_index_unavailable`. denied: "You cannot see this workspace's tasks" naming `task.read on core-platform`.
14. **Trust language.** A claim is never rendered as accepted. No verdict or proof vocabulary (`held`, `proven`, `witness`) appears for task items. Each agent's tier is its recorded value.
15. **Plain nouns.** No heading, panel title, table header or caption carries a comma, a mid-dot, or a not/never contrast. Subtext under each heading is one sentence.
16. **Mobile.** At 390 × 844: Tasks is in the More sheet with its count; the tab strip scrolls within itself and the page never scrolls sideways; tables are labelled cards; the send menu sits above the thumb bar; dialogs are bottom sheets; the stage chain stacks without arrows; tap targets ≥ 44 px; inputs 16 px.
17. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; rows are keyboard-operable with `role=button`, `tabindex=0` and an `aria-label`; each checkbox has an `aria-label` naming the task; the send menu is `role=menu` with `role=menuitem` rows; the mention list is `role=listbox` with `role=option`; harness and provider marks have a text alternative; dialogs are `role=dialog aria-modal`.
18. **Permissions.** `task.read` to see the page; `work_order.send` and `context.propose` gated server-side. Verify with a role that lacks each.
19. **Blocked by and the graph.** The Tasks table carries a Blocked by column after Status, listing each blocker's number as a link with its state dot, "none" with no blocker, and "closed as Won't do" beside a blocker that closed without done. A `ready` task with an open blocker reads "blocked by #N" under its readiness badge and its checkbox is **enabled**; a task whose provider status category is `blocked` is disabled with "Blocked upstream". Verify the two are never one column or one word. The **List** and **Graph** switch draws the open tasks by layer, unblocked tasks in layer 0, edges from blocker to blocked in the rule colour and never gold, no node labelled a frame, and on a phone a list by layer with "Layer N" headings. Unblocked means every upstream task is accepted in Oxagen or closed as Done in the provider; verify a prerequisite closed as Won't do still blocks.
20. **Queued sends.** Selecting a blocked task and sending shows the blocked chip, the "N of M tasks are blocked" line, **Expires** (default 14 days, at most 90), and the footer **Queue until unblocked**. Queueing records `send_work_order` with `when: unblocked` and the expiry, lands on the work order page in state `queued`, and Oxagen releases it in the transaction that unblocks its last task. Verify in the DOM and on the server that a queued work order reaches no runtime before release.
21. **Several targets.** Ticking two agents and pressing **Continue** opens the dialog titled "Work order, 2 targets" with one cap per work order, and sending makes one work order per target under one send. The Work orders tab shows one row, "2 work orders", `partial` while their states differ, opening to its children. No rank, score or winner appears between siblings.
22. **Work orders states.** State includes `queued` with "waits on #N" under it, `expired`, and `partial` on a send row, and the Stage column reads "N of M <role> and <role>" when two stages run beside each other.
23. **Stages that run beside each other.** The Workflows tab joins parallel stages with ∥. `wfview` cards read "after <role> and <role>". The builder's **After** checkboxes exist on every stage after the first, default to the previous stage, refuse an empty set inline, and "return to" lists only upstream stages. The committed TOML is `oxagen-workflow/v0.2` with `needs` on each stage that names one, and a v0.1 file with no `needs` renders the same chain as before. The second wand sentence in the spec yields Document after Fix and Review after Validate and Document.
24. **Nothing extra.** List anything on the built page that is not in the spec.

## Output

Return a single markdown report:

```
# Tasks: audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected NotBacked, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
