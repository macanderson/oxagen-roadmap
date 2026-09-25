<!-- run-memories: the Memories tab of a run -->

## Memories from this run

The Memories from this run panel lists each memory this run wrote or joined after its seal, one row per saying the run contributed.

### Purpose
You want to know what this run left behind for the next one. Each row shows the lesson, the words this run said, the frame it came from, whether the run started the memory or joined one, and what the assembler does with it today. Select a row to open the memory, forget it, or promote it to a record.

### Rationale
A memory is a Steering Source, and a SteeringFrame carries it into a later run (D4, D5 and D13 in `docs/fleet-operations-wedge.md`). A memory reaches a Steering record only through a proposal. After the seal, the post-run review reads the run and writes each lesson as a memory. A lesson that says what an existing memory already says joins it as one more saying, so the tab shows both the memories the run started and the ones it joined. At 3 sayings from 2 runs a memory becomes a steering proposal that cites every saying. The tab lists what the run wrote. It never grades the run or the person who steered it (D15).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Memories a run wrote | `runMemories()` over `MEMORY[].sayings` | `list_memories` filtered to one run | partial |
| Saying, frame, who said it | `memSayings()` | a saying per run on the memory | none |
| Fold (new, joined, saying k of n) | `memSayings()`, `S.memFold` | the fold setting and its count | none |
| Proposed as | `MEMORY[].proposedAs` | `list_memory_promotions` | partial |
| Class | `MEMORY[].cls` | `:AgentMemory` class | live |
| In the assembler | `memAsmCell()` | the assembler's manifest per memory | none |

### Logic
1. `runMemories()` walks every memory's sayings and keeps each saying whose `run` is this run. Rows sort by the saying's frame.
2. Memory shows the body, the saying in quotes, and who said it ("release-manager · reflection" or "marcus · operator steer").
3. Fold reads `new` with "this run started it" when the saying is the memory's first, otherwise `joined` with "saying k of n". A proposed memory adds "proposed as" and the proposal id.
4. Class is the memory's class badge.
5. `memAsmCell()` reads `superseded` with the source that replaced it, `yields` to a published must, or `competes`.
6. A row opens the `memory` dialog.
7. The badge, the table's rows and the tab's count read the same list.

### States
A run that has not sealed shows "No memories yet. This run is live." A sealed run with none shows "This run wrote no memories." The post-run review found nothing another run would need there, and no operator steered it. The catalog run `run_01K5RK7C2V8BNM3X` shows 3 rows. On a phone the table becomes labelled cards.

## Self-grade

The Self-grade panel shows the agent's answers to the four rubric questions, set against what the record observed, for readers who hold `research.read`.

### Purpose
You want to see how well the agent judged its own work. Each question pairs the agent's score with the record's score out of 5 and quotes the agent's answer. A reader without the grant sees what was captured and can request access.

### Rationale
After the seal, Oxagen asks the agent the four questions of rubric `rfl_v3` in one out-of-band turn. The answer is research data and nothing more. A self-grade never enters a context frame and has no promote action. It cannot become a memory, a proposal or steering, and its tokens never count as productive work. No person is scored (D15). Reading one takes `research.read`, an organization grant that no workspace role inherits.

The panel is in open conflict with the wedge. `docs/fleet-operations-wedge.md` lists skill reflection as deleted (ADR-090 decision 7 kept it research-only, and nothing reads it). A build leaves the panel out until a maintainer decides to remove it or to restore reflection with its own page.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Answers and record scores | `SELF_GRADES[run].axes` | a stored grade per run | none |
| Questions, rubric, model | `SK_REFLECT` | skill `reflection` config, `skills.ts:36` | none |
| Retention | `SK_CFG.reflect.retain` | the reflection config | none |
| Grant | `PEOPLE[].grants`, `canResearch()` | an organization grant | none |

### Logic
1. `runSelfGrade()` picks one of four states in order.
2. Not sealed, or no grade: "Not captured yet. This run is live."
3. Deleted: "Deleted on <date>, 180 days after capture." Deleting a grade leaves the run's frames, its seal and its memories untouched.
4. Without `research.read`: the lock, "Reading a self-grade takes research.read", "<name> does not hold it.", the Captured, Rubric, Model, Cost and Retention list, then "Request access" (gold, opens `request-access`) and "How reflection works".
5. With the grant (`?as=priya`): one block per question from `sgAxis()`. A block where self exceeds the record by 2 or more carries "calibration gap". The same list follows.
6. Cost reads "billed as overhead".

### States
The catalog run shows the locked state for Marcus Bell. "How reflection works" lands on the skills list, because the wedge removed the reflection page. On a phone the blocks stack.

## Memory {#dialog/memory}
<!-- open: openDialog('memory',MEMORY[0].id) -->

The Memory dialog shows one memory: its class and force, where it came from, what it costs, where it stands in the assembler, and every saying it holds.

### Purpose
You want to decide what to do with a memory. Forget it if it is wrong, promote it to a record if it should bind, or open the proposal it already became.

### Rationale
Memory is what an agent's own runs left behind. It is recalled, never published, so it competes only in the per-prompt selection at force `may` or `info`. A published `must` beats it wherever the two are about the same thing (the `overridden_by_must` exclusion). To make a memory binding you promote it: a proposal, a pull request, a merge (D13). Forgetting stops the assembler from selecting it. The runs it was folded from keep every frame and the hash they carried.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Body, class, force, scope, provenance, in force since | `MEMORY` | `list_memories`, `agent.memory.list.ts:25` | live |
| Recalled and cost | `recalls30`, `lastRecalled`, `token_cost` | the assembler's manifests | partial |
| Position | `memPosition()` | the assembler's manifest | none |
| Sayings and fold line | `memSaysList()`, `memFoldLine()` | a saying per run or import | none |
| Forget | `memforget`, `memForget()` | `delete_memory`, `agent.memory.delete.ts:14` | partial |
| Promote | `memPromote()` | `promote_memory`, `agent.memory.promote.ts:14` | live |

### Logic
1. `DLG_EXT.memory` titles the dialog with the body and subtitles it with the memory id.
2. Cost multiplies `token_cost` by the 30-day recall count.
3. `memPosition()` reads "Superseded by <source>.", "Yields to <source>, a published must.", or "Competes in the per-prompt selection at force <force>." A superseded memory stays for the runs that carried it and is never selected again.
4. `memSaysList()` and `memFoldLine()` are shared with the memory's page under Steering. A run saying links to that run's Memories tab. An imported saying shows its file and line. An imported saying counts toward the sayings and never toward the runs.
5. "The run that left it" opens the source run.
6. Forget opens `memforget`. The gold action is "Open the proposal" when proposed, otherwise "Promote to a record", which opens the record wizard with the body filled in.

### States
A missing memory shows "That record is no longer here." `delete_memory` removes the node outright, so a build needs a forget that keeps the hash. On a phone the dialog rises as a sheet.
