# Tasks

| | |
|---|---|
| Route | `#/a-intel/core-platform/tasks[/<tab>]`, tabs `tasks` (default), `work-orders`, `workflows`, `providers`, `fields`, `people` |
| Scope | workspace |
| Spec | `docs/tasks-spec.md` §3, §8.6, §9, §10; `docs/work-graph-spec.md` §5 (readiness on the graph), §6 (queued sends), §7 (sends and targets), §8 (stages that run beside each other), §11.1; `providers`, `fields` and `people` are specified in `tasks-providers.md` |
| Design | `mockups/src/engine.js` → `pTasks()`, `tkTaskTab()`, `tkWoTab()`, `tkWfTab()`, `dispatchButton()`, `dispatchMenu()`, `tkBlockedByCell()`, `tkReadySub()`, `tkLayers()`, `tkGraph()`, `tkWhyNot()`, `woQueued()`, `woSendState()`, `wfLayerText()`, `wfToml()`, `DLG_EXT.wo`, `DLG_EXT.wfview`, `DLG_EXT.wfnew`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs`; data `mockups/fixtures/tasks.json` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / Workspace / Tasks`, `Tasks · Work orders`, `Tasks · Workflows`: one story per state, desktop and mobile; the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0\|1>#<route>` |
| Audit | `tasks.audit-prompt.md` |
| Check | `node tools/check-tasks.mjs` |

## Job

Where an operator sees every task from every tracker, which of them are ready, and where each one went. It is the only place work leaves Oxagen for an agent: you select ready tasks and send them, in a work order, to an agent you operate or to a workflow of such agents.

## What is on the page

**Header**: eyebrow the workspace name ("Core platform"), h1 "Tasks", subtext "Work from your issue trackers and help desks, the definition of done for each task, and the work orders that send it to agents."
Actions: on the Tasks tab, **Connect an issue provider** (plain) and **Create work order and send to agent** (gold, disabled until a task is selected). On Workflows, **Connect an issue provider** (plain) and **New workflow** (gold). On every other tab, **Connect an issue provider** (gold).

- **Tabs**: Tasks (N) · Work orders (N) · Workflows · Providers (N) · Fields · People (N). Tasks counts drafts and changed certifications waiting on a person. Work orders counts those waiting on you. Providers counts connections. People counts suggestions waiting for confirmation. A tab with nothing waiting shows no count.

### Tasks

- **Tiles**: Ready for work ("certified and unblocked"), Drafts waiting on you ("certify to make them ready", blue when above zero), Blocked by other tasks ("ready and waiting on a task upstream"), In work orders ("sent to an agent or a workflow"). Being drafted left the tiles (`work-graph-spec.md` §16, decision 10) and stays as the `drafting` readiness badge.
- **Banner** when a certified task changed upstream: `changed`, "N task(s) changed after certification", the task number and when it was edited, "It left ready until somebody certifies its definition of done again.", **Review it**.
- **Tasks** panel, subtext "Only a ready task can be selected and sent.", with "N selected" and **Clear** in its header while a selection exists, and a **List** and **Graph** switch (two chips, the chosen one marked, `aria-pressed`). Search, facets and Rows come from the shared list bar. Columns: select · Task (provider logo, number in mono, subject) · Labels (colour chips) · Status (dot and word: Open, In review, Blocked, Closed) · Blocked by (each blocker's number in mono as a link with its state dot; "none" for a task with no blocker; "closed as Won't do" beside a blocker that closed without done) · Owner (the mapped member with avatar, or the provider handle with its logo and `not mapped` or `bot`) · Readiness (`drafting`, `draft`, `changed`, `ready`, `in a work order`, `accepted`, `closed`; a `ready` task with an open blocker reads "blocked by #481" under the badge, and one in a queued work order reads "queued in wo_01K6TB2X") · Updated. The Status column keeps the provider's word. The Blocked by column is the graph's, and the two are never folded into one.
- **Selection**. A checkbox is enabled on a task whose readiness is `ready` and whose status category is `open`, whether or not the graph blocks it, unless a queued work order already holds it. A disabled checkbox carries the reason as its title ("Its definition of done is a draft. Certify it first.", "Blocked upstream. It can be sent when it is open again.", "Already queued in wo_01K6TB2X. Withdraw it to send elsewhere."). A selected row is tinted. A row click opens the task (`task.md`); the checkbox click does not.
- **Graph**. The same open tasks drawn by layer (`work-graph-spec.md` §3): one column per layer, left to right, unblocked tasks in layer 0. Each task is a card with its provider logo, number, subject, readiness badge, and a checkbox under the same rule as the list. A line joins each blocker to the task it blocks, in the rule colour, and the lines into a selected task in the approval colour. Gold appears nowhere in the drawing, and no node is called a frame. A card click opens the task. The Graph draws open tasks only. The panel's search filters the cards, and the tiles do not change with the view.
- **Note**: "oxagen.assistant drafts a definition of done for every task a provider imports. A person certifies it, and the task is ready from that moment. A ready task goes to an agent only inside a work order, and only to an agent you operate."

### The send menu

**Create work order and send to agent** opens a menu under the button. Header "Send N tasks to", "agents where you are the registered operator". A search field narrows both groups.

- **Agents you operate**: every agent in the workspace whose operator is the signed-in person, each row with a checkbox, its harness mark (Claude Code, Codex, Cursor, Stella, the Agent SDK), its avatar, its name, "harness · host", and its tier badge. The four seeded workflow agents come first, then the rest by name; twelve are shown and the rest are counted.
- **Workflows**: every published workflow, each with a checkbox, its stages' harness marks in order (stages that run beside each other joined by ∥) and "N stages then you".
- An agent somebody else operates is never listed. Clicking a row opens the work order dialog for that one target. Ticking more than one and pressing **Continue** under the lists opens the dialog for a send with that many targets (`work-graph-spec.md` §7): one work order per target, each its own record.

### The work order dialog (`wo`)

Title "Work order", subtitle "N tasks to <agent or workflow>". Six sections.

1. **Tasks**: one chip per task (provider logo, number, subject), removable while more than one remains. A blocked task's chip carries "blocked by #481". Hint: "Each task is tagged to this work order, and each shows it on its own page." When any task is blocked, one more line: "2 of 3 tasks are blocked. Oxagen sends this work order when they are unblocked, and expires it on 2026-09-25 if they are not."
2. **Sent to**: a select of the agents you operate and the published workflows. Below it the agent card (harness mark, avatar, name, "harness on host", tier, `operator: you`), or the workflow's stage chain ending in **Accept** by You, drawn by layer when stages run beside each other. With several targets the title reads "Work order, 2 targets" and this section lists each target's card in turn.
3. **Definition of done**: "N items from N tasks. Certified items are read-only here." One row per distinct item with its tag, a chip per task it came from, and in a workflow the stage that owns it. **Add an item for this work order** with **Add item**; hint "An item you add here is certified by your send, and belongs to this work order only."
4. **Prompt**: the label reads `drafted by oxagen.assistant` or `edited by you`; **Draft it again**; a monospace textarea with the drafted brief (tasks with links, the numbered items with tags and task numbers, the workflow stages when there is one, the repositories and the branch, the `claim_dod_item` instruction, and `Follow @ctx.release.never-merge.`). Typing `@` opens the mention list under the box: context records (kind glyph, `@id`, statement, kind and tokens) and agent profiles in the workspace (harness mark, avatar, `@key`, name, harness, "you operate it"). Enter or Tab inserts the first; click inserts any; Escape closes. **References** lists every mention in the prompt: a record with its token cost, a profile with "profile", and an unresolved one as `not found`. A mention still being typed is not flagged.
5. **Repositories**: the main and linked repositories as checkboxes, the tasks' repositories pre-checked; one outside the agent's toolbelt is disabled with "outside <agent>'s toolbelt". Then **I confirm the repositories** (gold-edged), "<agents> may push branches and open pull requests on <repos>. Nothing is merged without a person." Changing a repository or the target clears the confirmation.
6. **Spend cap**: a USD field, default 12.00, and the hint on per-run budgets. When a stage runs on Cursor, a warning: "Cursor is not metered." With several targets, one cap per work order, and the hint says so. Then **Expires**, a date, default 14 days from today and at most 90, shown only when a task is blocked, with the hint "A queued work order that is still waiting on this date expires, and its tasks go back to ready."

Footer: "needs `work_order.send` on core-platform", **Cancel**, **Send to <target>** (gold), or **Queue until unblocked** (gold) when any task is blocked, or **Send to 2 targets** with several targets. Send is disabled until the repositories are confirmed, at least one is checked, and the prompt is not empty. Sending tags the tasks `in a work order`, clears them from the selection, opens the work order page (`work-order.md`), and toasts "Work order <id> sent to <target>. It starts when <host> picks it up." Queueing toasts "Work order <id> queued for <target>. It is sent when #481 is done." A send to several targets opens the first work order and toasts "2 work orders sent, one per target."

### Work orders

The **Work orders** panel, subtext "Each one carries tasks, their definition of done, a prompt, and the repositories it may change." Columns: Work order (title and id; "1 of 2 in this send" under the id when a send made more than one) · Tasks (logo and number, one per line) · Sent to (harness marks and name, or the workflow) · Stage ("2 of 4 Validate", "2 of 4 Validate and Document" when two stages run beside each other, "1 of 1", or "done") · Items claimed (claimed / total) · State (`queued` with "waits on #481" under it, `sent`, `in progress`, `waiting on you`, `returned`, `parked for you`, `stopped`, `expired`, `accepted`) · Sent by (avatar, name, time). A row opens the work order. A send with several work orders is one row, "2 work orders", its state `partial` while their states differ, and it opens to its children. Note: "An agent claims an item with evidence. A person accepts it. A work order is done when you accept every item, and nothing merges without a person." With none sent, the panel says so and points at the Tasks tab.

### Workflows

Two columns. Left, the **Workflows** panel, subtext "A workflow is a file in .oxagen/workflows that names its stages in order." Columns: Workflow (name and file path) · Stages (harness mark and role, arrows between the layers and ∥ between stages that run beside each other, ending in You) · State (`published` with its commit, or `pull request open` with its number) · Work orders. A row opens `wfview`. Right, **How a workflow runs**: five numbered facts (a stage is its own run; a stage owns items by tag; a handoff note arrives as quoted evidence; returns are bounded and then the work parks for you in Approvals; the last stage is a person), and the note that every agent in a workflow must be one you operate.

- **`wfview`**: the stage chain drawn by layer, each card with what the stage owns, "after Fix and Validate" when it needs more than one stage, and what happens on failure, the file as committed, and whether it is published or in a pull request. Footer **Close**, **Change it**.
- **`wfnew`** (the builder): **In your own words** with the wand, **Name**, **Stages** (each: number, role, agent select of agents you operate with the harness mark, up, down, remove; Owns checkboxes for code, test, docs, review; **After**, checkboxes over the earlier stages with the previous one ticked by default and absent on the first stage; On failure: stop and ask you, or return to a stage upstream of this one, with at most 1 to 3), the fixed **Accept** stage for You, **Add a stage**, the TOML file as it will be committed at `oxagen-workflow/v0.2` with `needs` on each stage that names one, and "A workflow is a file. It exists when the pull request merges, and a reviewer can stop it there." Unticking every After box is refused inline: "A stage runs after at least one other stage." Footer "needs `context.propose`", **Cancel**, **Open pull request** (gold, disabled without a name). The wand turns "A bug fixer passes a fix to a validator, which passes it to a documenter, which passes it to an architect for final review." into four stages in that order, and "A bug fixer passes a fix to a validator and a documenter at the same time, and an architect reviews both." into four stages with Document after Fix and Review after Validate and Document.

**Shell.** As `steering.md`: the sidebar with Tasks lit under Fleet, its count the drafts and changed certifications waiting on a person plus work orders waiting on you; the top bar with breadcrumbs (organization / workspace / Tasks), ⌘K, notifications, the Approvals button, and the avatar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production).

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Tasks and their fields | `TASKS` (`tasks.json`) | `tasks.tasks`, `tasks.task_labels` | GitHub and Linear connectors write records to the graph; nothing is a task | 🟡 |
| Readiness and certification | `TASKS[].ready`, `certifiedBy`, `digest` | `tasks.dod_certifications` | nothing | ❌ |
| Agents you operate | `AGENTS` filtered by `operator` | `list_agents` `operatorId` | the operator is derived from `principals.parent_user_id` | ✅ |
| Harness of each agent | `AGENTS[].harness` | `agents.harness` | `agents_harness_check` (stella, claude-code, codex, cursor, claude-agent-sdk, custom) | ✅ |
| Work orders | `WORKORDERS` | `tasks.work_orders` and children | nothing | ❌ |
| Workflows | `WORKFLOWS` | `.oxagen/workflows/*.toml` | nothing; ADR-043 removed the old `workflow.*` | ❌ |
| Mentions | `RECORDS`, `AGENTS` | context records, agent profiles | records exist; the mention grammar has no context-record type | 🟡 |
| Dependencies and the Blocked by column | `TASKS[].blockedBy` (`tasks.json`) | `tasks.task_dependencies`; `list_tasks` `blockedBy`; `get_work_graph` (`work-graph-spec.md` §9, §10) | nothing; the connectors read no links between records | ❌ |
| Layers in the Graph view | `tkLayers()` over `TASKS[].blockedBy` | `get_work_graph` | nothing | ❌ |
| Queued and expired work orders, and the expiry | `WORKORDERS[].status`, `expires` | `tasks.work_orders` `queued`, `expired`, `expires_at` (§6) | nothing | ❌ |
| Sends with several targets | `WORKORDERS[].send` | `tasks.sends` (§7) | nothing | ❌ |
| `needs` on a stage | `WORKFLOWS[].stages[].needs` | `.oxagen/workflows/*.toml` at `oxagen-workflow/v0.2` (§8.1) | nothing | ❌ |

## Functionality

- Only a ready task whose status category is `open` can be selected. A task the graph blocks can be selected, and its work order is queued (`work-graph-spec.md` §6).
- Unblocked means every upstream task is accepted in Oxagen or closed as Done in the provider, and nothing else (§5.2).
- Work reaches an agent only in a work order, and only an agent the sender operates. A send to several targets makes one work order per target (§7).
- A stage runs when every stage it needs has handed off, and stages that are ready together run together as separate runs under one cap (§8.2).
- A work order narrows the agent's repositories and never widens them. It sends nothing until the repositories are confirmed.
- A sent prompt cannot change.
- A workflow exists only when its pull request merges.

## States

- **loaded**: the page as described, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell), with GitHub and Linear connected.
- **empty**: "No issue provider is connected to this workspace". "Tasks arrive from an issue tracker or a help desk: GitHub, Linear, Jira, ServiceNow, Salesforce Service Cloud, or Zendesk. Connect one, choose what it imports, and oxagen.assistant drafts a definition of done for every open task it reads." Action: **Connect an issue provider** (gold). The header and tabs are not rendered. A workspace with no connection renders this state whatever the tab.
- **loading**: the shell stays; the body is the skeleton.
- **error**: "Tasks could not be loaded", `503 issue_index_unavailable`, the three sentences, **Try again**, **Open an incident**, the trace line.
- **access denied**: "You cannot see this workspace's tasks", naming `task.read on core-platform`, **Request access**, **Back to Fleet**, Signed in as, Needed, Decided by.

## Mobile

Tasks is in the **More** sheet with its count. The tabs scroll sideways inside their strip; the page never does. The tiles stack two by two; tables become labelled cards; the send menu is fixed above the thumb bar; the work order dialog is a bottom sheet; the stage chain stacks one stage per row without arrows, and stages that run beside each other keep their "after" line; the Graph view is a list by layer with a "Layer 1" heading between the groups. Touch targets are at least 44 px and inputs 16 px.

## Permissions

- Read: `task.read`
- Writes, each a governed action in Audit: `work_order.send` (send or queue a work order to agents you operate), `context.propose` (open a workflow's pull request)

## Backend gaps this page depends on

- A task record, readiness, and certification
- A work order record, and delivery to the agent's runtime (spec §9.6)
- The workflow file schema and the sequencing of stage work orders
- `context_record` and `task` types in the mention grammar
- A dependency between two tasks, read from the provider or added by a person, and the derived blocked reason (`work-graph-spec.md` §4, §5)
- Queued work orders with an expiry, their release, and a send with several targets (§6, §7)
- `needs` in the workflow file and the start of every ready stage together (§8)

## Rules every build of this page must keep

- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word.
- A count in navigation appears only where something waits on a person.
- An agent somebody else operates is never offered as a target.
- A provider account that is not mapped is shown as itself, never as a member.
- A claim is the agent's word and an acceptance is a person's. Neither is shown as the other.
- Every harness is shown with its own mark, and none is listed first by default.
- The provider's `blocked` status and the graph's blocked reason are two columns, never one.
- The Graph draws state in the `--st-*` hues and the rule colour, never gold, and calls no node a frame.
- A queued work order is a person's send held by Oxagen. Nothing on this page queues on its own.
