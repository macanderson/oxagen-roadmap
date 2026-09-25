# Run memories

| | |
|---|---|
| Route | `#/a-intel/core-platform/runs/run_01K5RK7C2V8BNM3X/memory`. The same tab on `run_01K5RS7M2E8FJ3QW` (live, nothing written yet), `run_01K5RF2J7M3EDC5F` (sealed, no memories) and `run_01K4QJ9E4T6YUI1O` (sealed, self-grade deleted). In the app, `/{org}/{ws}/runs/{run}/memory` |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D4 and D5 (a memory is a Steering source, and a SteeringFrame carries it), D8 (the Decision trace is the one explanation), D10 (no person is scored), D17 (future-only marks). `run.md` owns the header, the Summary, the stat row, the tab bar and the side column this tab shares. `steering-source.md` owns a memory's own page, and `steering-proposals.md` the proposal a memory becomes |
| Design | `mockups/src/engine.js` → `runMemories()`, `runMemoryTab()`, `memAsmCell()`, `memSaysList()`, `memFoldLine()`, `runSelfGrade()`, `sgAxis()`, `canResearch()`, `DLG_EXT.memory`, inside `pRun()`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Runs / Memories`: Loaded and Loaded · mobile |
| Audit | `run-memories.audit-prompt.md` |

## Job

Say what one run left behind for the next one: each memory oxagen wrote from it after the seal, whether the memory is new or joined one that already said the same thing, how close it is to becoming a steering proposal, and what the assembler does with it today. The tab lists what the run wrote. It never grades the run or the person who steered it.

## What is on the page

**Shared.** The run header, the Summary, the stat row, the tab bar with "Memories" selected, and the side column, as `run.md` specifies them. The tab reads "Memories" with the count of memories the run wrote, blank when it wrote none.

**Lead note**, first: "**oxagen writes these after the seal.** Each lesson becomes a memory, or joins a memory that already says the same thing. At 3 sayings from 2 runs, a memory becomes a steering proposal that cites every saying."

**Memories from this run** (`data-run-memories`). The heading, a count badge (3 on `run_01K5RK7C2V8BNM3X`), then a paged table (Rows 5, 10, 25, 50 or All, and "1–3 of 3"). The columns:

| Column | What it shows |
|---|---|
| Memory | The memory's body, then this run's saying in quotes, then who said it ("release-manager · reflection" or "marcus · operator steer") |
| Frame | The frame the saying came from (31, 37, 58), rows sorted by it |
| Fold | "new" with "this run started it", or "joined" with "saying k of n". A memory that became a proposal adds "proposed as <id>" |
| Class | The memory's class badge: `PREFERENCE`, `FACT`, `RULE` or `EPISODE` |
| In the assembler | One of three: "superseded" by a link to the source that replaced it, "yields" to a link to a published must, or "competes" |

On `run_01K5RK7C2V8BNM3X` the three rows are:

- "Marcus asked for release notes in plain past tense, one line per change, no marketing adjectives." Frame 31, joined, saying 2 of 2, `PREFERENCE`, competes.
- "Database migrations on a-intel/platform run in the Tuesday 02:00 UTC window. A release that needs one waits for it." Frame 37, new, this run started it, `FACT`, competes. Said by "marcus · operator steer".
- "Build and test on Node 20. The latest Node release breaks main." Frame 58, joined, saying 2 of 3, proposed as `prp_01K5RX1N`, `RULE`, competes.

Each row opens the memory dialog. Two notes replace the table:

- A run that has not sealed: "Nothing is written until the seal. This run is <status>. When its chain seals, oxagen reads it and writes what it learned here." (`run_01K5RS7M2E8FJ3QW` reads "live".)
- A sealed run that wrote none: "This run wrote no memories. oxagen read the sealed run and found nothing another run would need, and no operator steered it."

**Self-grade**, with the chip "research only". Four states:

- Not sealed, or sealed with no grade: "Captured after the seal. This run is <status>. When its chain seals, oxagen asks the agent the four questions of rubric rfl_v3 in one out-of-band turn."
- Deleted: "Deleted on 2025-12-29, 180 days after capture. The run’s frames, its seal and the memories it wrote are untouched." Only `run_01K4QJ9E4T6YUI1O` shows it.
- Locked, for a reader without `research.read` (Marcus Bell): the title "Reading a self-grade takes research.read" and the line "An organization grant that no workspace role inherits. Marcus Bell does not hold it." Then Captured (2026-09-11 08:20:19), Rubric ("rfl_v3, four questions"), Model (`claude-haiku-4-5`), Cost ("2,690 tokens, $0.0137, billed as overhead") and Retention ("deleted 180 days after capture"). Then "Request access" (gold) and "How reflection works".
- Readable, for a reader who holds `research.read` (`?as=priya`): one block per question of the rubric ("Did you do the thing that was asked?", "Did you verify it, or did you assert it?", "Did you stay inside the scope you were given?", "Was what it cost proportionate to what it produced?"). Each block has a "self" bar and a "the record" bar out of 5, the agent's answer in quotes, and "the record says: <fact>". A block where self exceeds the record by 2 or more carries "calibration gap". Then the note: "**Research only.** A self-grade never enters a context frame and has no promote action. It cannot become a memory, a proposal or steering, and its tokens never count as productive work." Then the same Captured, Rubric, Model, Cost and Retention list, with no buttons.

"How reflection works" goes to `#/a-intel/<ws>/steering/skills/reflect`, which the Sources tab rewrites to `?kind=skill`. The wedge deleted skill reflection (see Open conflict), so the link lands on the skills list and not on a reflection page.

**Dialogs this tab opens.**

- `memory` (`DLG_EXT.memory`), from a row. The title is the memory's body and the subtitle "A memory, recalled and never published". Class and force, Scope, Where it came from, Recalled, Cost and In force since. Then the memory's position in the assembler and the Sayings list. A run saying links to that run's Memories tab with its frame. An imported saying shows the file and line with "imported". Under the sayings, the fold line (`memFoldLine()`):
  - Proposed: "Proposed as <id> when it reached 3 sayings from 2 runs. The proposal cites every saying above."
  - Ready: "It has N sayings from R runs, which meets the setting. The promoter proposes it on its next pass."
  - Otherwise: "It becomes a proposal at 3 sayings from 2 runs. It has N from R run(s)." A memory with an imported saying adds "An imported saying counts toward the sayings and never toward the runs, so an import alone never makes a proposal."
  - When the memory came from a run, "The run that left it" and "Open <run>". The footer reads "Close", "Forget" (danger, opens `memforget`), and the gold "Open the proposal" when the memory was proposed, otherwise "Promote to a record", which opens the create wizard with the memory's body.
- `memforget`: "Forget this memory?", what stops, the recall count, and "Keep it" and "Forget it".
- `request-access` from the locked self-grade, and the run dialogs from the header (`run.md`).

## Open conflict

The Self-grade panel contradicts the wedge. `docs/fleet-operations-wedge.md` lists skill reflection as deleted, and `docs/fleet-operations-collapse.md` records it the same way: "Deleted. ADR-090 decision 7 kept it research-only, and nothing reads it." The mockup still renders the panel on every run, and its "How reflection works" link has no page to land on. A build leaves the panel out until a maintainer decides one of two things: remove the panel, `SELF_GRADES` and `SK_REFLECT` from the mockup, or restore reflection to the wedge with a page for it. An audit records this as a note, not a fail.

## Data sources

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen (file paths) | Status |
|---|---|---|---|---|
| Memories a run wrote | `MEMORY[].sayings`, `runMemories()` | `list_memories` filtered to one run | `list_memories` (`packages/oxagen/src/contracts/agent.memory.list.ts:25`) browses `:AgentMemory` nodes by node, class, kind and citations. It has no run filter, and the record carries a free `source` string (`agent.memory.model.ts:105`) | 🟡 |
| Sayings, fold, "saying k of n" | `MEMORY[].sayings`, `S.memFold` | a saying per run or import on the memory, and the fold setting | none. No contract stores a saying or counts runs toward a fold | ❌ |
| Proposed as | `MEMORY[].proposedAs` | `list_memory_promotions` | `packages/oxagen/src/contracts/agent.memory_promotion.list.ts:11` lists promotions; it does not name the fold that raised one | 🟡 |
| In the assembler | `memAsmCell()` over `SOURCES`, `RECORDS` | the assembler's manifest per memory | the manifest names outcome and reason per item (`packages/tacho/src/wire.ts:626-697`). Only `record` and `steer` candidates are produced, so no memory reaches it | ❌ |
| Forget, Promote | `memForget()`, `memPromote()` | `delete_memory` and `promote_memory` | `delete_memory` removes the node and its edges (`packages/oxagen/src/contracts/agent.memory.delete.ts:14`), so a forget is a hard delete and no run records the hash it carried. `promote_memory` (`agent.memory.promote.ts:14`) | 🟡 |
| The post-seal writer | none | a job that reads a sealed run and writes its memories | none | ❌ |
| Self-grade | `SELF_GRADES`, `SK_REFLECT`, `SK_CFG.reflect.retain` | a stored grade per run | `reflection` is a jsonb config on skills (`packages/database/src/schema/skills.ts:36`). No grade is stored, and the wedge deleted the feature | ❌ |
| `research.read` | `PEOPLE[].grants`, `canResearch()` | an organization grant | none | ❌ |

## Future-only fields

The tab carries no future-only mark, and the catalog gives it no future story. The ❌ rows render as not recorded in a build. The Self-grade panel stays out of a build until the open conflict is decided.

## Functionality

- A memory is written only after the seal. A live or parked run shows the unsealed note and no rows.
- Each row is one saying from this run. The same memory can appear on several runs, once on each, with its own frame.
- The fold setting is fixed at 3 sayings from 2 runs. An imported saying counts toward the sayings and never toward the runs, so an import alone never makes a proposal.
- The tab's count equals the table's rows and the count badge.
- "In the assembler" reads the same rule the Decision trace applies. A published must beats a memory ("yields"), a newer source replaces it ("superseded"), and otherwise it competes for the budget.
- A self-grade is research only. It never enters a context frame, never becomes a memory, a proposal or steering, and its tokens never count as productive work.

## States

Loaded, with the four run cases above: rows (`run_01K5RK7C2V8BNM3X`), unsealed (`run_01K5RS7M2E8FJ3QW`), sealed with none (`run_01K5RF2J7M3EDC5F`), and a deleted self-grade (`run_01K4QJ9E4T6YUI1O`). The build uses the shell's standard loading, error and denied panels until they are designed.

## Mobile

- The shell is as `run.md` describes, with Work lit in the thumb bar.
- The memory table becomes labelled cards.
- The self-grade blocks stack, one question per block.
- The memory dialog rises from the bottom as a sheet with full-width buttons.
- Every button and link has a hit area of at least 44 px.

## Permissions

- Read: `list_memories`, allowed by default to organization Owner and Admin and to workspace Owner and Member (`agent.memory.list.ts`).
- Write: `promote_memory` from the dialog.
- `research.read` reads a self-grade. It is an organization grant that no workspace role inherits.

## Backend gaps this page depends on

- A run filter on `list_memories`, and a saying per run or import on each memory.
- The fold that counts sayings and runs and raises a proposal.
- The post-seal writer that reads a sealed run.
- A memory candidate adapter in the assembler, so "In the assembler" reads the manifest.
- A forget that keeps the memory's hash for the runs that carried it. `delete_memory` removes the node outright.
- The Self-grade decision (Open conflict).

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- The tab reads the record. No person is scored or ranked, and the self-grade never feeds a score.
- Headers are rollups of the rows beneath them: the tab count and the badge equal the rows.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast.
- Exactly one gold action per screen. The locked self-grade's "Request access" is the gold. The memory dialog's "Open the proposal" or "Promote to a record" is the gold while it is open.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
