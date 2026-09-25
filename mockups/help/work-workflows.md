# Workflows

<!-- work-workflows: the Workflows tab, its one panel, and the workflow dialog and builder. The header and tab bar fall back to work-backlog/header and work-backlog/tabs. -->

## Workflows

The Workflows panel lists the workflow files in the workspace, their stages in order, whether each is published, and how many work orders went to it.

### Purpose
You come here to see which chains of agents you can send work to, and to write a new one. A row tells you what the workflow does in one line of stages ("Fix → Validate ∥ Document → Review → You"), whether it can be used yet, and how often it has been. A row opens the workflow dialog, where you read the file and change it. **New workflow** in the header opens the builder.

### Rationale
A workflow is a file in `.oxagen/workflows/` that names its stages in order, each an agent you operate, and ends with a person (wedge Vocabulary › Work). It runs nothing itself. Oxagen sequences a work order through the stages, and each stage is its own run. That keeps ADR-043 intact: the old `workflow.*` capabilities ran agent turns on Oxagen's workers and were removed, and this object is a file that orders work orders (`tasks-spec.md` §10.4, §17 decision 2). Because it is a file, it changes only by pull request and exists when that pull request merges. The State column exists so a workflow still in review is visible and clearly not usable. The Work orders column is a rollup of the work orders sent to it, never a typed number.

The tab once carried a second panel, How a workflow runs, with five numbered facts about what happens after a send. It taught the design and no shipped screen draws it, so it left the page and its facts are in Logic below. They come from `tasks-spec.md` §10.3 and §10.4 and `work-graph-spec.md` §8.2. A handoff note is quoted evidence and never an instruction, because one agent must not steer the next. Returns are bounded, so a disagreement between two agents ends with a person in the Approvals drawer instead of a loop. The last stage is a person, so acceptance and every merge stay human.

The note under those facts moved here too. Every agent in a workflow must be one you operate. A workflow that names an agent somebody else operates cannot be sent by you (`tasks-spec.md` §10.4). A workflow grants nothing: each stage acts under its own agent's toolbelt and the work order's repositories.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, file, stages, roles, what each owns, on failure | `WORKFLOWS` (`fixtures/tasks.json` `workflows`) | `.oxagen/workflows/*.toml`, read by the send and by `get_work_order` | none |
| State: published at a commit, or in a pull request | `WORKFLOWS[].state`, `.commit`, `.pr` | the file's commit on the production branch, or its open pull request | none |
| Work orders per workflow | `WORKFLOWS[].used` | a count over `tasks.work_orders` by target | none |
| Each stage agent's harness mark | `AGENTS[].harness` through `agent()` | `list_agents` `harness` (`agent.list.ts:24-31`) | live |
| Layers and ∥ | `WORKFLOWS[].stages[].needs`, `wfDepths()` | `oxagen-workflow/v0.2` `needs` (`work-graph-spec.md` §8.1) | none |
| Handoffs, returns, the park | none | `hand_off_work_order`, `return_work_order`, the park in Approvals | none |

### Logic
1. `pWork()` renders `tkWfTab()` inside a `data-future` wrapper, so `?future=1` outlines the whole tab body.
2. Each row is `rowClick()` on `openDialog('wfview', id)`. The first cell holds the name and `wf.file` in mono.
3. `wfLayerText()` groups the stages by `wfDepths()`. A stage's depth is one more than the deepest stage it needs, and a stage with no `needs` needs the stage before it (`stageNeeds()`), so a v0.1 file reads as a straight line. Stages in one layer are joined by ∥ (titled "run beside each other"), layers by →, and the cell ends with "→ You".
4. State draws `Published` and the commit, or the mockup's `In review` badge and the pull request number for a workflow whose state is `pull request open`.
5. Work orders prints `wf.used`. The fixture holds 1 for Fix, validate, document, review, which matches the one work order (`wo_01K6T9QX`) sent to it. The page spec's table still reads 4 and 9. A build counts `tasks.work_orders` by target.
6. The panel runs the full width of the tab. `tkWfTab()` returns the one panel.

How a workflow runs, once a work order is sent to it:

7. Each stage is its own run, by its own agent, on the runtime that agent is enrolled on, under its own mandate and budget.
8. A stage owns the definition-of-done items with its tags. Its brief names those items and the handoff it received. `woOwner()` gives an item whose tag no stage lists to the last agent stage.
9. When a stage hands off with `hand_off_work_order`, Oxagen sends the next stage its brief with the handoff note quoted as evidence. A stage that needs two stages receives both notes, each with its stage and run.
10. A stage may send the work back with `return_work_order` to the stage the file names, at most `max_returns` times (1 to 3). Past that the work order parks for you in Approvals.
11. `[accept]` is fixed. The last stage is always a person: you accept every item, and a person merges every pull request.
12. The builder lists only `myAgents()`. The mockup's send menu (`dspList()`) lists every published workflow and does not check who operates its agents. A build leaves out a workflow that names an agent somebody else operates.

### States
Loaded only. The tab shares the page's loading, error and denied panels. A workspace with no workflow shows the table with no rows and **New workflow**. On a phone the table becomes labelled cards and the stages wrap inside their cell.

## Workflow dialog {#dialog/wfview}

The workflow dialog shows one workflow's stage chain and its file as committed.

### Purpose
You opened a workflow from the list, or from an address with `?workflow=<id>`, and want to know exactly what it does before you send work to it or change it. The dialog shows each stage's agent, harness and tier, the tags it owns, what happens when it fails, and the TOML. **Edit workflow** opens the builder on this file.

### Rationale
The chain is drawn from the file and from nothing else, so the page never shows an order the file did not name. Stages that run beside each other sit in one column (`work-graph-spec.md` §8). The file is shown because the file is the workflow: a reviewer approves the TOML, not a picture. The line under the file was trimmed to the fact. A change to this file is a pull request, like every Steering Source, and the builder opens one.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name and description | `WORKFLOWS[].name`, `.desc` | `.oxagen/workflows/*.toml` | none |
| Stages, owns, on failure, needs | `WORKFLOWS[].stages` | the same file | none |
| Stage agent's name, harness and tier | `AGENTS[]` | `list_agents` (`agent.list.ts:24-31`, `:63`, `:83`) | live |
| File text | `wfToml()` | the file at its commit | none |
| Published commit or pull request | `.commit`, `.pr` | the file's history | none |

### Logic
1. `DLG_EXT.wfview(id)` returns `noSuch("Workflow")` for an unknown id. The title is the name and the subtitle `wf.desc`.
2. `stageChain()` draws one card per stage in `wfDepths()` columns, each with its number, role, harness mark, avatar, name and `tierBadge()`, "owns" with tag chips, and "If it fails: stop and ask you" or "If it fails: send back to <role> (up to N times)". A card that needs two stages adds "after Validate and Document". The chain ends with the Accept card, "a person accepts every item".
3. `wfToml()` rebuilds the TOML from the stages. It writes `oxagen-workflow/v0.2` when any stage has `needs`, and v0.1 otherwise. For a fixture stage whose `onFail` is `return:1`, it prints `return_to = 1`. Under v0.2, `return_to` names a role, so a build shows the committed file, where it reads `"Fix"`.
4. The note reads "Published at a4c91e2." or "In a-intel/platform#526. It can be used when it merges."
5. **Edit workflow** calls `wfzOpen(id)`. The page spec names it **Change it**.

### States
An unknown id shows the not-found dialog. On a phone the dialog is a bottom sheet, the chain stacks one card per row without arrows, and the file scrolls sideways inside its block.

## Workflow builder {#dialog/wfnew}

The builder drafts a workflow file from stages you set, and opens the pull request that adds it.

### Purpose
You want a new chain of agents, or a change to one. You describe it in a sentence or set the stages by hand, watch the file change as you go, and open a pull request. The workflow can be used once that pull request merges.

### Rationale
The dialog's subtitle moved here: stages in order, each an agent you operate, and a person last. Those are the three rules the builder enforces (`tasks-spec.md` §10.2, §10.4). A workflow is a file. It exists when the pull request merges, and a reviewer can stop it there. The wand exists because a sentence is how people describe a hand-off chain. The assistant turns it into stages and does not decide what the workflow is. A person reads the stages before anybody reviews them. That is why the toast now reports only what the wand did.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent select: agents you operate | `myAgents()` | `list_agents` `operatorId` (`agent.list.ts:71-72`) | live |
| Stages drafted from a sentence | `wfWand()` | `oxagen.assistant` drafting the file | none |
| File preview | `wfToml()` | `oxagen-workflow/v0.1` and `v0.2` | none |
| Open pull request | `wfOpenPr()` | `propose_workflow` (`tasks-spec.md` §12) | none |

### Logic
1. `wfzOpen(fromId)` sets `S.wfz`. A new builder holds one stage: Fix, Bug fixer, owning code and test, stopping on failure. From a workflow, it copies the stages and the title reads "Edit workflow".
2. `wfWand()` reads the sentence in `#wfDesc`. It matches bug or fix (Fix, Bug fixer, owns code, stops), valid, test or qa (Validate, Validator, owns test, returns to stage 1 up to 2 times), doc (Document, Documenter, owns docs, stops), and architect or review (Review, Architect, owns review, returns to stage 1 once), in the order the sentence names them. It names the workflow when the name is empty. It is deterministic and drafts a straight chain with no `needs`. `work-graph-spec.md` §8.3 asks it to read "at the same time" as stages beside each other.
3. `wfSet()` changes a stage's role, agent, owned tags, **After** boxes and failure rule. Unticking every **After** box is refused inline: "A stage runs after at least one other stage." The failure select offers "stop and ask you" and "send back to stage N" for each earlier stage, then "up to 1 to 3 times".
4. `wfMove()`, `wfDelStage()` and `wfAddStage()` reorder, remove (never the only stage) and add a stage (Review, Architect).
5. The Accept stage is fixed: "You accept every item. This stage cannot be removed."
6. `wfOpenPr()` needs a name. A new workflow joins the list as `pull request open` at `a-intel/platform#527` with 0 work orders. The toast names the pull request and the file.

### States
With no `S.wfz` the dialog shows only **Close**. The footer names `context.propose`. On a phone it is a bottom sheet and the file preview scrolls inside its block.
