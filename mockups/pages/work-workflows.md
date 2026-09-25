# Workflows

| | |
|---|---|
| Route | `#/a-intel/core-platform/work/workflows` (app `/{org}/{ws}/work/workflows`). One workflow opens as a dialog over the tab: `?workflow=<id>`, for example `?workflow=fix-validate-document-review`. Old route that lands here: the mockup’s `#/:org/:ws/tasks/workflows`, rewritten in place |
| Scope | workspace |
| Spec | `docs/work-graph-spec.md` §8 (stages that run beside each other); `docs/fleet-operations-wedge.md`: Vocabulary › Work (Workflow, Stage), Work › Objects (a workflow stage starts one run per attempt) and Shipped today, Steering › Emissions (a workflow stage emits an `invocation`, the `constraint` items it owns, and the previous stage’s handoff as quoted `context`), D17. `docs/fleet-operations-ia.md` › Work. `docs/fleet-operations-routes.md` › Work. `docs/tasks-spec.md` §10 (the file, building one, running one, the rules), §12 (`propose_workflow`), §14, §17.2. `docs/creation-spec.md` (a definition is a file, and a wizard ends on a pull request) |
| Design | `mockups/src/engine.js` → `wfLayerText()`, `wfDepths()`, `stageNeeds()`; `mockups/src/wedge.js` → `pWork()`; `mockups/src/engine.js` → `tkWfTab()`, `wzChecks()`, `stageChain()`, `DLG_EXT.wfview`, `wfzOpen()`, `wfWand()`, `wfSet()`, `wfAddStage()`, `wfDelStage()`, `wfMove()`, `wfToml()`, `DLG_EXT.wfnew`, `wfOpenPr()`, `myAgents()`; data `mockups/fixtures/tasks.json` (`workflows`, `agents`). Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Work / Workflows`: Loaded, Loaded · mobile, Loaded · future-only fields marked |
| Audit | `work-workflows.audit-prompt.md` |

## Job

The workflows a work order can be sent to, and how to write a new one. A workflow is a file in `.oxagen/workflows/` that names stages in order, each an agent you operate, and ends with a person. It runs nothing itself: Oxagen sequences the work order through the stages, each stage is its own run by its own agent, and you accept the result. A workflow exists when the pull request that adds its file merges.

## What is on the page

**Header.** As `work-backlog.md`: eyebrow the workspace name, h1 “Work”, subtext “What the agents work on, and what waits on you.” On Workflows the action is **New workflow** (gold; opens the builder).

**Tabs**: Backlog `7` · In progress · Work orders `1` · Workflows · Findings `36`, with Workflows selected. Workflows carries no count.

The tab body is two panels side by side, the first two thirds wide. The mockup outlines the whole body as future-only.

**Workflows panel.** Heading “Workflows”, subtext “A workflow is a file in .oxagen/workflows that names its stages in order.” The shared list bar: a search field and Rows, with a pager (“1–3 of 3”). Columns, in order:

| Column | Content |
|---|---|
| Workflow | The name in bold and the file path in mono |
| Stages | Each stage’s harness mark and role, joined by arrows between the layers and by ∥ between stages that run beside each other (“Fix → Validate ∥ Document → Review → You”), ending in “You” |
| State | `published` with its commit in mono, or `pull request open` with its number, as a dot and a word |
| Work orders | How many work orders were sent to it |

A row opens the workflow’s dialog, `wfview`. The demo record holds three:

| Workflow | File | Stages | State | Work orders |
|---|---|---|---|---|
| Fix, validate, document, review | `.oxagen/workflows/fix-validate-document-review.toml` | Fix → Validate → Document → Review → You | `published` `a4c91e2` | 4 |
| Fix and review | `.oxagen/workflows/fix-and-review.toml` | Fix → Review → You | `published` `a4c91e2` | 9 |
| Docs pass | `.oxagen/workflows/docs-pass.toml` | Document → Review → You | `pull request open` `a-intel/platform#526` | 0 |

**How a workflow runs**, five numbered facts:

1. “Each stage is its own run, by its own agent, on the runtime that agent is enrolled on.”
2. “A stage owns the definition-of-done items with its tags. Its brief names those items and the handoff it received.”
3. “When a stage hands off, Oxagen sends the next stage its brief. The handoff note arrives as quoted evidence, never as an instruction.”
4. “A stage may return the work to an earlier stage, up to the number of returns the file allows. After that the work order parks for you in Approvals.”
5. “The last stage is always a person. Every item is accepted by you, and every pull request is merged by a person.”

Then the note: “Every agent in a workflow must be one you operate. A workflow that names an agent somebody else operates cannot be sent by you.”

### The workflow dialog (`wfview`)

Opened by a row, or by the address `?workflow=<id>`. Title: the workflow’s name. Subtitle: its description (“A bug fix passes through a validator, a documenter and an architect before you accept it.”). The stage chain: one card per stage with its step number and role, the agent’s harness mark, avatar, name and tier badge, “owns” with its tag chips, and what happens on failure (“on failure it stops and asks you”, or “on failure it returns to stage 1, at most 2 times”), then the **Accept** card by You, “a person accepts every item”. Under the chain, the file path as a label and the file as committed:

```toml
# .oxagen/workflows/fix-validate-document-review.toml
schema = "oxagen-workflow/v0.1"
name = "Fix, validate, document, review"

[[stage]]
role = "Fix"
agent = "a-intel.core.bug-fixer"
owns = ["code"]
on_fail = "stop"
…
[accept]
by = "operator"   # the last stage is always a person
```

The note: “Published at a4c91e2. A change to this file is a pull request.”, or for a workflow in review “In a-intel/platform#526. It can be used when it merges.” Footer **Close**, **Change it** (opens the builder on this workflow).

### The workflow builder (`wfnew`)

Title “New workflow”, or “Change a workflow” from **Change it**. Subtitle “Stages in order, each an agent you operate, and a person last”.

- **In your own words**: a two-line text area with the placeholder “A bug fixer passes a fix to a validator, which passes it to a documenter, which passes it to an architect for final review.”, and the wand (`aria-label` “Have the assistant draft the stages”).
- **Name**: a text field.
- **Stages**: one block per stage. Its number; a role field (`aria-label` “Role of stage 1”); an agent select (“Agent of stage 1”) that lists only agents you operate, each “Name (Harness)”; the agent’s harness mark; **↑**, **↓** and **×** (“Move stage 1 up”, “Move stage 1 down”, “Remove stage 1”, the last absent on the only stage); **Owns** checkboxes for code, test, docs and review; **On failure**, a select of “stop and ask you” and “return to stage N” for each earlier stage; and with a return, “at most 1”, “at most 2” or “at most 3”. Arrows join the blocks. Every stage after the first carries **After**: checkboxes over the earlier stages (`aria-label` “Stage N runs after <role>”), the previous stage ticked by default. Ticking two makes the stage wait for both. Unticking every box is refused inline: “A stage runs after at least one other stage.” The file shows `schema = \"oxagen-workflow/v0.2\"` and `needs = [...]` on each stage that names one; a workflow with no After change stays `v0.1`. `return_to` names a role.
- The fixed last stage: its number, **Accept**, your avatar, and “You accept every item. This stage cannot be removed.”
- **Add a stage**.
- The file as it will be committed, under its path (`.oxagen/workflows/<slug>.toml`, or `workflow.toml` before the workflow has a name).
- The note: “A workflow is a file. It exists when the pull request merges, and a reviewer can stop it there.”

Footer “needs `context.propose` on core-platform”, **Cancel**, **Open pull request** (gold; disabled without a name).

A new builder starts with one stage: Fix, Bug fixer, owning code and test, stopping on failure. The wand reads the roles in the order the sentence names them: the placeholder’s sentence gives Fix (Bug fixer, owns code, stops), Validate (Validator, owns test, returns to stage 1 at most 2 times), Document (Documenter, owns docs, stops) and Review (Architect, owns review, returns to stage 1 at most once), and names the workflow “Fix, validate, document, review” when the name is empty. It toasts in gold “oxagen.assistant drafted 4 stages from your sentence. Read them before anybody reviews them.” With no sentence it toasts “Write a sentence first. The assistant turns it into stages; it does not decide what the workflow is.” With no role it knows: “No role the assistant knows appears in that sentence. Add the stages by hand.”

**Open pull request** adds the workflow to the list as `pull request open` with its number, and toasts in gold “a-intel/platform#527 opened: add .oxagen/workflows/<slug>.toml. It can be used when it merges.”

**Where a workflow is used.** A published workflow appears in the send menu and the work order dialog of `work-backlog.md`, with its stages’ harness marks, and a work order sent to it shows its stage chain on `work-order.md`.

**Shell.** The sidebar with Work lit and its count. Breadcrumbs “Anderson Intelligence Corp. / Core platform / Work”. ⌘K, notifications, the Approvals button with the organization’s count, and the avatar.

### Stages that run beside each other

A stage may name the stages it needs (`docs/work-graph-spec.md` §8). The demo’s Fix, validate, document, review file is `oxagen-workflow/v0.2`: Validate and Document need Fix, and Review needs both. `wfview` draws the chain by layer, with Validate and Document in one column and “after Validate and Document” on Review’s card, and its file carries `needs`. A v0.1 file with no `needs` draws the same chain as before.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Checked against `macanderson/oxagen` `origin/main` at `1ba160dbc`. Nothing in the repository stores or runs a workflow (wedge spec, Work › Shipped today). ADR-043 removed the old `workflow.*` capabilities, which ran agent turns on Oxagen’s workers; this workflow is a different object, a file that orders work orders, and no capability in `packages/oxagen/src/contracts` names one today.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Workflows: name, file, stages, roles, what each owns, on failure | `WORKFLOWS` (`workflows`) | `.oxagen/workflows/*.toml` (`schema = "oxagen-workflow/v0.1"`), read by the send and by `get_work_order` | none | ❌ |
| State: published at a commit, or in a pull request | `WORKFLOWS[].state`, `.commit`, `.pr` | the file’s commit on the production branch, or its open pull request | none | ❌ |
| Work orders per workflow | `WORKFLOWS[].used` | a count over `tasks.work_orders` by target | none | ❌ |
| Each stage agent’s harness, name and tier | `AGENTS[]` | `list_agents` | `harness`, `name`, `enforcementTier` (`packages/oxagen/src/contracts/agent.list.ts:24-31`, `:63`, `:83`) | ✅ |
| The builder’s agent select: agents you operate | `myAgents()` | `list_agents` `operatorId` | `principals.parent_user_id` (`agent.list.ts:71-72`) | ✅ |
| The wand: stages drafted from a sentence | `wfWand()` | `oxagen.assistant` drafting the file | `ask_assistant` exists (`packages/oxagen/src/contracts/assistant.ask.ts:61`) and drafts no workflow | ❌ |
| Open pull request | `wfOpenPr()` | `propose_workflow` (`tasks-spec.md` §12) | none. `open_context_pr` opens a pull request for one Steering record under `.oxagen/rules/` only (`packages/oxagen/src/contracts/context.pr.open.ts:96`) | ❌ |
| How a workflow runs (handoffs, returns, the park) | static copy | `hand_off_work_order`, `return_work_order`, the park in Approvals | none | ❌ |
| `needs` on a stage, the layers, and **After** | `WORKFLOWS[].stages[].needs`, `wfDepths()` | `.oxagen/workflows/*.toml` at `oxagen-workflow/v0.2` (`work-graph-spec.md` §8.1) | none | ❌ |

## Future-only fields

The mockup marks the whole tab body with `data-future` (`?future=1` outlines it):

| Mark | Reason in the mockup | What a build shows instead today |
|---|---|---|
| The Workflows panel and How a workflow runs | “workflows” | Neither. No `/work/workflows` route exists in `apps/app` today, and nothing lists a workflow file |

The `wfview` dialog and the builder carry no mark of their own, and every field in them is future-only too. A build renders the tab’s values as `not recorded` and leaves out **New workflow**, **Change it** and **Open pull request** until `propose_workflow` and the workflow file schema ship. Two things on the tab ship today: each stage agent’s harness, name and tier, and the list of agents you operate.

## Functionality

- A workflow is a file, changed only by pull request. It can be used when the pull request merges, and a reviewer can stop it there. A workflow in a pull request is listed and cannot be sent.
- Every stage is an agent you operate. A workflow that names an agent somebody else operates is not offered to you in the send menu.
- A stage owns the definition-of-done items whose tag it lists. An item whose tag no stage lists belongs to the last agent stage.
- Each stage is its own run, by its own agent, on its own runtime, under its own mandate and budget. A workflow grants nothing: each stage acts under its agent’s toolbelt and the work order’s repositories.
- A stage hands off with a note, which reaches the next stage as quoted evidence, never as an instruction. A stage may return the work to an earlier stage the file names, at most the number of times the file allows (1 to 3). Past that, the work order parks for the operator in the Approvals drawer. After the last agent stage, the work order waits on you.
- The builder’s file preview follows every change to the stages: role, agent, owned tags, on failure and the return bound.
- The wand drafts stages from the sentence and decides nothing else: a person reads them, changes them, and opens the pull request.
- `node tools/check-tasks.mjs` walks flow 6 (a workflow as a send target, and the builder drafting four stages from the sentence) on this tab.

- A stage runs when every stage it needs has handed off. Stages ready together run together as separate runs under the work order’s one cap. `return_to` must be upstream of its stage, and a return is the only backward edge (`docs/work-graph-spec.md` §8.1).
- `node tools/check-tasks.mjs` walks flow 12 (a fan-in workflow in the table and in `wfview`) on this tab.

## States

Loaded only. This change designs the loaded state. The build uses the shell’s standard loading, error, empty and denied panels until they are designed.

## Mobile

The thumb bar holds Work (lit, with its count), Agents, Tools, Spend and More. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. **New workflow** sits under the subtext. The tab strip scrolls sideways inside itself. The two panels stack, the list first. The table becomes labelled cards, the stages wrapping inside their cell. `wfview` and the builder are bottom sheets with full-width footer buttons, and the stage chain stacks one card per row without arrows. The file previews scroll sideways inside their own block. Touch targets are at least 44 px and inputs 16 px. The page never scrolls sideways.

## Permissions

The design names these. Neither exists in `packages/iam` for a workflow today.

- Read: `work.read`
- Writes, each a governed action recorded in Audit: `context.propose` (open the pull request that adds or changes a workflow file)

## Backend gaps this page depends on

- The workflow file schema (`oxagen-workflow/v0.1`) and its ADR, which names the difference from the `workflow.*` capabilities ADR-043 removed (`tasks-spec.md` §17.2)
- `propose_workflow`, opening the pull request as `open_context_pr` does for a record
- Reading the published workflows for the send menu and the work order
- Sequencing a work order through the stages: `hand_off_work_order`, `return_work_order`, the return bound and the park in Approvals (§10.3)
- The workflow stage’s SteeringFrames: the stage brief as `invocation`, its items as `constraint`, and the prior handoff as quoted `context` (wedge spec, Steering › Emissions)

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. A workflow file is neither.
- A Steering Source and a SteeringFrame are never shown as each other. A stage’s frames name the work order, the stage and the prior run as their provenance, never the workflow file as a frame.
- Nothing on the tab infers or scores. The wand’s draft is the assistant’s until a person opens the pull request, and the tab says what it is.
- No person is scored or ranked.
- Every enforcement claim states the tier. Each stage card shows its agent’s recorded tier.
- Headers are rollups of the rows beneath them: a workflow’s Work orders count is the number of work orders sent to it.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: **New workflow**, or **Open pull request** in the builder.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- A workflow exists only when its pull request merges.
- The last stage is always a person, and it cannot be removed.
- Every agent in a workflow is one you operate.
- A handoff note is quoted evidence, never an instruction.
- Every harness shows its own mark, and none is the default.
- The chain is drawn from `needs`. Two stages in one column ran, or will run, beside each other, and the page never orders them.
