## Header

The top of one Steering Source's page: the kind, the source's own words as the title, its badges, and the actions that change it.

### Purpose
It tells the person which source they are reading, at which version, and in which state, before they read any detail. It holds the one gold action the page offers, so the next step is always in the same place: propose a change, propose a memory as a record, or open the proposal a memory already has.

### Rationale
A Steering Source is durable material that can steer an agent, and a SteeringFrame is what Oxagen resolves from it for one run (D4). The header names the source and never a frame. For a record, the h1 is the statement and never the lineage, because the statement is the record and the lineage is metadata (D7). A record is in force because its commit merged into the main repository, and it leaves force the same way, by a pull request. So the header shows no lead on a published record: the badges and the Lineage panel carry that state. Each kind's one-line description ("A directive that steers behavior", "A hard boundary: require or forbid", "Steps, in order", "A checkable claim about the world", "A durable recollection", "Soft and often unfalsifiable") is the kind badge's title.

A memory is appended by an agent's run or imported from a Markdown file. It competes as context at its own force, never above `may`, and it becomes a Steering record only through a proposal (D13). A glossary term is a term the way this workspace uses it, and it changes by a pull request against the main repository. The workspace instructions are a workspace setting that reaches every agent in the workspace as a `procedure` at `should`. On screen, the Where row, the badges and Agents it reaches show the facts.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Record statement, kind, force, effect, scope, status | `RECORDS` via `stgRecord()` | `.oxagen/rules/<lineage>.toml`, `get_record` | shipped |
| Branch badge while a change is open | `S.recPending` | `list_proposals` by lineage, status `pr_open` | shipped |
| Document title, status, commit, repository | `SOURCES.documents` | `.oxagen/sources.toml` and the documents it names | future-only |
| Memory body, force, scope, version, hash, status | `MEMORY` | `:AgentMemory` via `list_memories` (body only today, #3904) | partial |
| Glossary term, force, commit, hash | `ONTOLOGY` | `.oxagen/ontology/*.toml` | future-only |
| Instruction text, force, date, hash | `STEERING_PREVIEW.instructions` | `get_prompt_settings` `additionalInstructions` (text only) | partial |

### Logic
1. `pSource(r)` routes by kind: `record` to `pRecord`, `skill` to the skill page, `adr` and `vision` to `pDocSource`, and memory, glossary and instruction to `pItemSource`. `srcRowOf(kind, id)` finds the row in `steeringSources()`. No row renders "No source here" with **Back to Sources**.
2. `srcHead` writes the eyebrow "Steering · <kind label>", where Steering links to Sources at `?kind=<group>`. A title over 90 characters sets a smaller h1.
3. Badges. A record: the kind badge, force, constraint effect, scope, published or archived, and the branch while `S.recPending` holds one. A document: status, id, `@commit`, repository. A memory, term or instruction: `srcStatus`, force, scope, version and short hash.
4. Leads. Only two remain: "Archived in <commit>." on an archived record and "Superseded by <id>." on a superseded ADR.
5. Actions. A record: **Discard edits** (disabled until the statement differs from the words in force), **Archive** (absent when archived, opens `crecarchive`) and gold **Propose a change** (`crecSave`, opens `srcpr`). A document: **Open the file**, which reports "Opened <path> on <repository>.". A change to it is a pull request. A memory: **Forget** (`memforget`) and gold **Propose as a Steering record** (`memPromote`, which opens the record wizard seeded with the body). A memory with `proposedAs` offers **Open the proposal** instead (`memOpenProposal`), so no one argues the same record twice. A glossary term: gold **Propose a change** (`ontedit`). The instructions: none.

### States
Loading, error and denied use the shell panels. Denied names `steering.read on <workspace>`. The mockup renders its first record for a record lineage nothing holds. A build answers with "No source here". On a phone the badges and actions wrap under the h1.

## Statement

The shared source editor over a Steering record's statement, and nothing else in the file.

### Purpose
The person reads the exact words every agent in scope receives, and edits them in place to start a change. Editing here writes nothing: it prepares a draft for **Propose a change**.

### Rationale
The statement is the record. The lineage, the force, the scope and the effect are the rest of `.oxagen/rules/<lineage>.toml`, and each of them changes the same way the statement does: a pull request against the main repository. Holding the statement alone keeps the editor honest about what a person can change from here, and the file's other fields stay on their badges and in the Lineage panel. The editor is the same one the skill page and the creation wizards use, so find, highlighting and the status line behave the same everywhere.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Statement text | `RECORDS[].st`, seeded by `cedSeed("rec:<id>")` | `statement` in `.oxagen/rules/<lineage>.toml` | shipped |
| Path label | `.oxagen/rules/<id>.toml · statement` | The record's path from `get_record` | shipped |
| Bundle figure | `crecBundleRow(rec)` over `stgBundle()` | The compiled bundle's row for the record | partial |
| Draft and change state | `S.cedVal`, `S.cedBase`, `cedDirty()` | Browser state only | shipped |

### Logic
1. `pRecord` seeds the editor key `rec:<lineage>` with the statement once, through `cedSeed`, and renders `cedHtml(key, path, "md")`.
2. The bar badge reads "<n> tok in the bundle" when the compiled bundle carries the record (`crecBundleRow`), "in the stable prefix" for a `must` or `should` record the bundle does not carry, and "selected per prompt" for `may` and `info`.
3. Typing marks the change state "modified" and turns on **Discard edits**. Discard calls `cedRevert`, which puts back the words in force.
4. **Propose a change** hands the draft to `crecSave`, which opens `srcpr` with the line diff. Opening the pull request moves the base to the draft and records the pending branch. The record in force does not change until the merge.
5. Prose wraps. The gutter numbers follow the wrapped lines and the editor never scrolls sideways.

### States
An archived record keeps the editor, and a change to it is still a pull request. On a phone the editor spans the width and keeps its gutter.

## Lineage

The panel that names where a Steering record lives and which commit put its current version in force.

### Purpose
It answers "which file, which version, since when, and how has it done". The person uses it to find the file on the main repository, to tie the record to its publishing commit, and to see its attribution counts.

### Rationale
Git decides which version of a record is in force. A lineage is one record across its versions, and each version is a commit on the main repository. The panel has no caption: the rows say it. It sits under the editor because it is the rest of the file's identity, next to the words it governs.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Lineage | `RECORDS[].id` | `lineage_id` | shipped |
| File | `.oxagen/rules/<id>.toml` on the main repository | The record's path | shipped |
| Published by | `RECORDS[].commit`, `pub` | `get_record` provenance | shipped |
| Effect: rendered and cited | `RECORDS[].effect` | `get_record` `effect` from `context_use` appends | shipped |
| Effect: violated | `RECORDS[].effect` | A rollup of runs that went against the record (#3868) | future-only |
| Schema | `context-record/v0.1` | The record schema version | shipped |

### Logic
1. Rows, in order: Lineage, File (with the main repository), Published by ("<commit> on <date>"), Effect and Schema.
2. Effect prints the record's effect line as stored ("rendered 212 · cited 188 · violated 3"), or "never rendered".
3. `get_record` also returns every version of the lineage. The page does not render them yet.

### States
A build shows "not recorded" for an effect the workspace does not record, never 0. On a phone the rows stack label over value.

## Kind panel

The right-column panel that shows a Steering record's own data in the shape its kind needs.

### Purpose
What a person needs to know about a constraint is not what they need to know about a memory. The panel answers the kind's question: where a rule sits, whether a constraint compiles a gate, the order of a procedure's steps, how a fact is checked, when a memory happened, and how often each was rendered and cited.

### Rationale
Each of the six kinds gets its own panel, never one generic panel with swapped copy. The panel shows data only. How each kind reaches a run, and what it can never do, live here:

| Kind | How it reaches a run | Limits |
|---|---|---|
| `rule` | Compiled into the steering block of the policy bundle. `must` and `should` sit in the stable prefix every turn, and `may` and `info` are selected by relevance | Grant permission or allow a blocked call |
| `constraint` | Compiled into the stable prefix at its force, and checked against every other published record on the same subject | Widen what is allowed. A `require` does not create the permission it requires |
| `procedure` | Compiled like a rule, and rendered as an ordered list so a model cannot silently reorder it | Grant anything. Naming a governed action in a step does not put it on a toolbelt |
| `fact` | Delivered as a `fact` context frame with provenance to the record and its commit, with `valid_from` set to the merge time | Steer by itself. To change behavior, write a rule that cites it |
| `memory` | Delivered as a `memory` context frame, selected by relevance, never pinned into the prefix | Forbid or prove anything alone. It can explain why a retry is not a regression |
| `preference` | Delivered at `may` or `info`, selected by relevance, and dropped first when the window is tight | Block a call. A run that ignored it has not failed |

A record never grants authority. A procedure's order is the record: a run that did the steps in another order did not follow it. A fact and a rule stay apart so a fact can go stale without silently turning off a rule. A memory record has no automatic decay. One that stops being true is archived by a pull request. On a preference, "violated" means not followed, and the third meter is grey because not following a preference is not a failure.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Kind, force, effect | `RECORDS[]` | `get_record` | shipped |
| Bundle row | `crecBundleRow`, `stgBundle()` | The compiled bundle's row (no read returns it) | partial |
| Enforcement grant | `RECORDS[].grant` | The record's enforcement grant | shipped |
| Rendered and cited | `crecNum()` over the effect line | `get_record` `effect` | shipped |
| Violated | `crecNum(rec, "violated")` | #3868 | future-only |
| Falsifiable by, Explains | Fixed strings in `crecPanel` | A field on the record (none today) | future-only |

### Logic
1. `crecPanel(rec)` heads the panel with the kind's name and badge (`data-help="kind-panel"`, since the heading changes per record).
2. `rule`: "Where it sits" with Force ("in the stable prefix, every turn in scope" for `must` and `should`, "selected by relevance" otherwise), Effect and Bundle ("v41 · 214 of 1,340 tokens", "Not in the compiled bundle", or "Selected per prompt by relevance"). Meters: rendered, cited, "Runs that went against it".
3. `constraint`: a boundary block with the effect in capitals. With a grant it reads "Enforcement grant. Its gate is on Tools › Policy.": the record compiles to text and to a gate, and a call routed through Oxagen that crosses it is denied before dispatch with the record cited. Without one it reads "No enforcement grant.": the agent reads the boundary in its prefix and nothing refuses a call until a grant compiles a gate. A `require` is checked on the run, not the call. Every merge re-runs the conflict check across every published record. A `forbid` that contradicts an active `require` on the same subject fails it, so the two are never both in force. Meters: rendered, cited, "Runs that crossed it".
4. `procedure`: "Steps", split by `crecSteps` on numbered items, else on commas and sentences.
5. `fact`: "Claim" with Falsifiable by, valid_from and Last confirmed ("<cited> runs read it and none contradicted it").
6. `memory`: "When it happened" with Recorded, Explains, Selection and Decay ("none automatic").
7. `preference`: the three meters, the third grey.
8. `crecMeter` draws each meter as a share of rendered. The meters are attribution read from the record, never a score. No person is scored or ranked.

### States
A build renders a null effect as "not recorded" on each meter, never 0 of 0. On a phone the panel stacks under the Lineage panel.

## Frames it emits

The SteeringFrames this source yields at its current version, each with its type, force, injection point, cost and id.

### Purpose
It connects a source to what agents actually receive. A person checks here that a record, a document section, a skill file or a memory turns into the frames they expect, and matches a frame id seen in the Compiler or a run's Decision trace back to this source.

### Rationale
A source and a frame are two objects (D4). This panel is where the page lists the frames without presenting any of them as the source. Oxagen reads frames out of a source by its declared structure and never asks a model what a document means, so the same source at the same version always emits the same frames with the same hashes (D6). The caption states the count at this version and nothing more. The panel carries `data-help="steering-source/frames-it-emits"`, so the skill page's panel opens this section too.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Frames | `srcFramesOf(o)` over `frameOf()`, `itemFrame()` | SteeringFrames with type, provenance and hash | future-only |
| Type | `REC_TYPE`, section `emits`, bundle parts | `type` on each frame | future-only |
| Force, tokens | the source row, `stgTokOf()` | `force`, `token_cost` | partial |
| Injection point | `POINT_LABEL` | `injection_point` | future-only |
| Frame id | `<type>:<source id>@<12 hex>` from `frHex` | `hash` over the canonical body | future-only |

### Logic
1. A source that emits nothing (`emitN` is 0) reads "None." and its reason: "It emits nothing at this version." for an archived record, "superseded by ADR-014" for a superseded ADR, or "withheld: unapproved digest" for a withheld skill.
2. A document: one frame per section the registration names, at Session start for `must` and `should` and Prompt submit for `may` and `info`, with "enforced by <gate>" where the section names one.
3. A skill: the description line at Prompt submit, `SKILL.md` as a `procedure`, one `context` per reference file and one `capability` per entrypoint, all in Checkout files. An entrypoint shows "descriptor" in place of tokens.
4. A record, memory, glossary term or instruction: one frame from `stgItemById`, at Session start for `must` and `should` and Prompt submit for `may` and `info`. A record at force `info` emits `context` whatever its kind.
5. Each item shows the type badge, force badge, injection point, tokens, body, "enforced by" where a gate enforces it, and the frame id.
6. A memory that yields still emits its frame. The Compiler lists it as excluded with `overridden_by_must`.

### States
Until frame types ship, a build renders the panel with "not recorded" and names the gap. It never derives frames from the kind.

## Agents it reaches

The agents in the workspace this source's scope can reach, with a way to see each one's envelope.

### Purpose
It answers "who does this steer". A person follows an agent to the Compiler to see whether this source lands in that agent's envelope for a brief.

### Rationale
Reach is read off the scope alone. Whether a brief actually selects the source is the Compiler's question, so each agent carries a Compiler link. The count equals the Agents column on Sources for the same row, because both read `reachOf()`. The panel carries `data-help="steering-source/agents-it-reaches"` and answers the skill page as well.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agents | `wsAgentsOf(S.ws)` filtered by `o.reach` | `list_agents` | shipped |
| Scope | the source row's `scope`, `repo`, `agent`, `agentsList` | A record's sharing scope. Other kinds carry none | partial |

### Logic
1. `srcReachPanel(o)` filters the workspace's agents through `reachOf(o)`: a named list, one agent, the agents working in one repository, or every agent for workspace and org scope.
2. The caption reads "<n> in <workspace> by its scope, <scope>." or, while the source emits nothing, "None while it emits nothing."
3. The first five agents render as agent chips, each with **Compiler** to `/steering/compiler/<slug>`.
4. "<n> more on Assignments" links to `/steering/assignments` when more than five match.

### States
A source that emits nothing lists no agents. On a phone each agent row keeps its Compiler link at the right.

## Related records

Up to three other Steering records of the same kind in this workspace.

### Purpose
It lets a person compare a record with its neighbours: two rules that say nearly the same thing, or a constraint whose opposite already exists. **Open** moves to the other record's page.

### Rationale
Records drift toward duplication. Showing a few of the same kind next to the statement makes an overlap visible before someone proposes a second record under a new lineage. The panel uses the shared record card, so each neighbour reads the way it does on Proposals.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Records of the same kind | `RECORDS` filtered by `kind`, first three | `list_records` with a `kind` input | shipped |
| Card fields | `recordCard(x)` | `list_records` row | shipped |

### Logic
1. `pRecord` takes `RECORDS` of the same kind, excluding this one, and keeps the first three.
2. Each is a `recordCard` with **Open**, which goes to `crecUrl(id)`.
3. The shared list controls apply: Sort (Shown order, Statement A to Z, Statement Z to A), Rows and a pager.
4. With no other record of the kind: "None. This is the only <kind> in <workspace>."

### States
An archived neighbour still lists, dimmed by its card. On a phone the cards stack.

## Record

The panel that says what a non-record source is and where it lives: a document, a memory, a glossary term or the workspace instructions.

### Purpose
It gives the facts a person needs to find or judge the source outside Oxagen: the file and commit for a document, the run or file that left a memory, how often a memory is recalled, and what a memory yields to.

### Rationale
These kinds have no statement editor, so the Record panel carries their identity. A document is registered in `.oxagen/sources.toml` and versioned by commit. A memory is appended by a run or imported, so its origin is its Where row. A memory that a published `must` contradicts yields to it and is excluded as `overridden_by_must`. Saying so here explains why a memory the page shows as recorded never reaches a run.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Document file, version, owner, registered by | `SOURCES.documents`, `SOURCES.registration` | `.oxagen/sources.toml` | future-only |
| Supersedes, superseded by | `documents[].supersedes`, `supersededBy` | The ADR's own front matter | future-only |
| Memory kind, Where | `MEMORY[].provenance` | `:AgentMemory` | partial |
| Recalled | `MEMORY[].recalls30`, `lastRecalled` | A recall counter (#3904) | future-only |
| Yields to | `MEMORY[].yieldsTo` | The assembler's precedence rule | future-only |
| Glossary Where | `ONTOLOGY[].provenance` | `.oxagen/ontology/*.toml` | future-only |
| Instructions Where | "workspace settings" | Workspace settings | partial |

### Logic
1. A document (`pDocSource`): File ("<path> on <repository>"), Version ("<commit>, <date>"), Owner, Registered by ("<pull request>, merged <date>"), then Supersedes or Superseded by as a link to the other ADR.
2. A memory (`pItemSource`): Kind, Where ("run_01K5R52Q3X9YAB9E · frame 88 · reflection", or "apps/api/CLAUDE.md:L3 · import by Marcus Bell"), Recalled ("212 times in 30 days, last 2026-09-11 09:14") and, when it yields, Yields to with a link to the record.
3. A glossary term: Kind and Where (".oxagen/ontology/release-train.toml").
4. The workspace instructions: Kind and Where ("workspace settings").

### States
A build renders each future-only field as "not recorded". On a phone the rows stack.

## Sayings

Every time a run, or a Markdown import, said what this memory says, with the fold line under the list.

### Purpose
It shows the evidence a memory rests on and how close it is to becoming a proposal. A person follows a saying to the run and frame it came from.

### Rationale
Memories fold by concept: one memory keeps every saying that said the same thing. The fold setting decides when a memory becomes a proposal, and the list is the same one the memory dialog shows, so the two never disagree. An imported saying counts toward the sayings and never toward the runs, so an import alone never makes a proposal.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Sayings | `MEMORY[].sayings` via `memSayings()` | A saying per run or import on the memory | future-only |
| Fold setting | `S.memFold` (3 sayings from 2 runs) | A workspace setting | future-only |
| Fold state | `memFoldOf()`, `memFoldLine()` | The promoter's fold | future-only |

### Logic
1. The panel renders only when the memory holds sayings, with the count as a badge.
2. `memSaysList(m)` quotes each saying with who said it, then its run and frame as a link to that run's Memories tab, or `<file>:L<line>` and "imported".
3. The fold line: "Proposed as <proposal> when it reached 3 sayings from 2 runs. The proposal cites every saying above.", "It has <n> sayings from <r> runs, which meets the setting. The promoter proposes it on its next pass.", or "It becomes a proposal at 3 sayings from 2 runs. It has <n> from <r> run.", with the import sentence added when a saying is imported.

### States
No sayings, no panel. On a phone the quotes wrap and the links stay tappable.

## Sections

The table of a registered document's sections and what each one emits.

### Purpose
It shows which parts of an ADR or the product vision steer agents and which do not, so a person can see why a paragraph in the document never reaches a run.

### Rationale
A document emits frames only from the sections `.oxagen/sources.toml` names. A section the registration does not name emits nothing. Oxagen reads the declared structure and never asks a model what a document means. An invariant needs a section the ADR declares as its invariants, and a superseded ADR emits nothing. Runs that received its frames before still name them. The whole page is future-only until `.oxagen/sources.toml` ships.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Section heading and text | `SOURCES.documents[].sections` | The document on the main repository | future-only |
| Emits, force, enforced by | `sections[].emits`, `force`, `enforcedBy` | `.oxagen/sources.toml` | future-only |

### Logic
1. Columns: Section, Emits, Force, Text.
2. Emits is the frame-type badge with "enforced by <gate>" under it, or "nothing" for an unregistered section and for every section of a superseded ADR.
3. Force is the force badge, or a dash for an unregistered section.

### States
A build shows no document page until the registration ships. The address answers as an id nothing holds. On a phone the table becomes labeled cards.

## Archive a record {#dialog/crecarchive}

A confirmation that opens a pull request to take a Steering record out of force.

### Purpose
It lets a person retire a record the only way a published record changes: by a pull request that sets `status = "archived"` on its file.

### Rationale
Archiving is not a delete. The file stays, the lineage stays, and the record stops compiling into the bundle when the pull request merges. It stays in force until then. Every run the record steered keeps naming its hash, and a later record may supersede it instead. Only a record with an enforcement grant compiles to a gate, so only that record gets the warning: the gate goes with it, and what it refused becomes allowed once the archive merges. The mockup used to warn for any constraint effect. The grant is what decides.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Record | `stgRecord(id)` | `get_record` | shipped |
| Grant | `RECORDS[].grant` | The enforcement grant | shipped |
| Pending change | `S.recPending` | `list_proposals` by lineage | shipped |
| Archive pull request | `crecPr()` into `OXPRS` | No archive pull request today. `promote_context_record` with `retire` appends to the ledger | partial |

### Logic
1. An archived record: "<lineage> is already archived" and "It is out of force.", with Close.
2. A record with a change open: "<lineage> already has a pull request open", "Branch <branch> is waiting on its checks. Land or close that one first.", with Close. Two changes are never proposed over the same file.
3. Otherwise: the note naming the pull request, the gate warning for a granted record, **Keep it in force** and red **Open the pull request**.
4. `crecArchive` opens the pull request (`crecPr`: checks schema, lineage, dependent_records, bundle_recompilation), records the pending branch, and reports "Opened <pull request> to archive <lineage>."

### States
On a phone the dialog rises as a bottom sheet with full-width buttons.

## Propose a change {#dialog/srcpr}
<!-- open: cedSeed('rec:ctx.release.notes-format',stgRecord('ctx.release.notes-format').st);S.cedVal['rec:ctx.release.notes-format']=stgRecord('ctx.release.notes-format').st+' Link the issue too.';crecSave(stgRecord('ctx.release.notes-format')) -->

The dialog that turns an edited statement or `SKILL.md` into a pull request, with the diff and the checks it will face.

### Purpose
A person reviews exactly what changes and what the checks will assert, then opens the pull request. It is the only way the page changes a published record or skill.

### Rationale
A published record changes the way it was published: a branch, a pull request, the same six checks and a merge. Nothing in the dialog edits what is in force. An amended record keeps its lineage, because it is the same record at a new version. A skill is a file with a digest, and a run records the digest when it loads the skill, so changing the words changes the digest and goes through a pull request too. Every run that loaded the old version keeps naming the old digest. The primary action names what it does, so the dialog has no lead.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Diff | `diffLines(S.cedBase[key], cedText(key))` | The pull request's diff | shipped |
| Record change | `crecSave()` | `revise_context_record` on `context/<lineage>` | shipped |
| Skill change | `skSrcSave()` | `propose_skill` | partial |
| Checks | `S.srcPr.checks` | The record and skill checks | shipped |

### Logic
1. `crecSave(rec)` sets the path, the branch `context/<lineage>.amend` (the shipped contract uses `context/<lineage>`), and six checks: Schema, Lineage ("<lineage> keeps its lineage"), record_hash recomputation (the old hash stays on every run that carried it), Secret and PII scan, Conflict against active records ("re-run in full", because the words changed) and constraint_effect.
2. `skSrcSave(id)` bumps the patch version and lists Frontmatter, Version, Digest ("recomputed at merge"), Grants, Secret and PII scan, and Load cost against the search budget.
3. The body shows the main repository and branch, the added and removed counts, and the line diff, or "Nothing changed yet." **Open the pull request** is disabled while nothing changed.
4. `srcPrOpen` moves the base to the draft, records `S.recPending`, and reports "a-intel/platform#528 opened. <lineage> changes when it merges." or "…#529 opened. <skill> becomes <version> when it merges." Until the merge every run gets the words in force now, and runs in flight keep the old skill version.

### States
On a phone the dialog is a bottom sheet and the diff wraps.

## Forget a memory {#dialog/memforget}

A confirmation that stops the assembler from selecting a memory.

### Purpose
It removes a memory an agent got wrong so no agent in scope is told it again.

### Rationale
Forgetting rewrites no run. The runs the memory was folded from are untouched: every frame stays, and every run that carried it keeps naming the hash it carried. The recall count is the warning: whatever those runs did with the memory, they did because of it. Promotion is the other answer. If the memory is right, a Steering record makes it binding instead of leaving it to compete at `may`.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Memory, agent | `memById(id)` | `:AgentMemory` | partial |
| Recall count | `MEMORY[].recalls30` | A recall counter (#3904) | future-only |
| Forget | `memForget()` | `delete_memory` removes the node and its edges | partial |

### Logic
1. The note: "The assembler stops selecting it, and <agent or every agent in scope> stops being told it."
2. With recalls, the warning "It was recalled <n> times in the last 30 days."
3. **Keep it** closes. Red **Forget it** removes the memory from `MEMORY`, re-renders, and reports "Forgot <id>."
4. No run records a memory's hash today, so the build's promise about carried hashes needs that field first.

### States
On a phone the dialog is a bottom sheet.

## Edit a glossary term {#dialog/ontedit}

The form that proposes a new definition for a glossary term as a pull request.

### Purpose
A person corrects or sharpens what a term means in this workspace, and the change reaches agents only after review.

### Rationale
A glossary term is a file in `.oxagen/ontology/`, so a change is a pull request against that file. The definition in force does not change until it merges. A term that is already being retired refuses an edit: the removal and the edit would write over each other.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Term, kind, definition, about | `ontById(id)`, `ontForm()` | `.oxagen/ontology/<term>.toml` | future-only |
| Pull request | `ontPr(o, "mod")` into `OXPRS` | A pull request on the main repository | future-only |
| Checks | `ontChecks()` | schema, lineage_uniqueness, secret_pii_scan, grant_scan | future-only |

### Logic
1. A retiring term: "A pull request removes this note. Close that pull request before you change the definition.", with Close.
2. Otherwise: Term, Kind (term, entity, alias, boundary, with the hint on each), Definition with the wand, and About. The note: "Saving opens a pull request against <file>."
3. **Retire** opens `ontretire`. **Open the pull request** (`ontSave`) requires a term and a definition, updates the row with the new hash and token cost, opens the pull request, and reports "Opened <pull request> for <term>."

### States
On a phone the dialog is a bottom sheet with 16 px inputs.

## Retire a glossary term {#dialog/ontretire}

A confirmation that opens a pull request to remove a glossary term's file.

### Purpose
It retires a term the workspace no longer uses, through review.

### Rationale
A glossary term is a file, so retiring it is a pull request that removes the file. The term keeps informing the model until that pull request merges, and its row says "retiring" in the meantime. The warning states the one consequence: once the removal merges, no agent is told what the term meant.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Term, file | `ontById(id)`, `ontFile()` | `.oxagen/ontology/<term>.toml` | future-only |
| Retiring flag | `ONTOLOGY[].retiring` | An open removal pull request | future-only |
| Pull request | `ontPr(o, "del")` | A pull request on the main repository | future-only |

### Logic
1. A term already retiring: "A pull request removes this note and is waiting on its checks. Open it on the Changes tab.", with Close.
2. Otherwise: "Retiring it opens a pull request that removes <file>.", the warning, **Keep it** and red **Open the pull request**.
3. `ontRetire` sets `retiring`, opens the pull request (checks schema, reference_scan, lineage_uniqueness), and reports "Opened <pull request> to remove <term>."

### States
On a phone the dialog is a bottom sheet.
