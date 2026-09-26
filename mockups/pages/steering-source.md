# Steering source

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/sources/record/ctx.release.notes-format`, the page every kind managed on Steering shares, at `#/:org/:ws/steering/sources/<kind>/<id>`. The other kinds on it: `…/sources/adr/ADR-021` and the superseded `…/sources/adr/ADR-008`, `…/sources/vision/VISION`, `…/sources/memory/mem_01K5QX7C`, `…/sources/glossary/ont.release-train`, and the workspace instructions at `#/a-intel/finops/steering/sources/instruction/ins.finops.additional`. A skill has its own spec, `steering-source-skill.md`. Old route: `/steering/records/{lineage}` (308 to `/steering/sources/record/{lineage}`; `routes.steeringRecord` becomes `routes.steeringSource(kind, id)`). The mockup rewrites `#/:org/:ws/steering/records/<lineage>` in place |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D4 (a source and a frame are two objects), D5 (eight frame types), D6 (provenance and hash), D7 (Steering record), D13 (memory and glossary terms are source kinds); the Steering sections Two objects, Emissions, Reading a source, Provenance and Shipped today. `docs/fleet-operations-ia.md` (Steering, Source). `docs/creation-spec.md` §5 for the record wizard. ADR-061 and ADR-093 in `macanderson/oxagen` |
| Design | `mockups/src/wedge.js`: `pSource`, `pDocSource`, `pItemSource`, `srcHead`, `srcRowOf`, `srcFramesOf`, `srcFramesPanel`, `srcReachPanel`; `mockups/src/engine.js`: `pRecord`, `crecPanel`, `crecSave`, `DLG_EXT.srcpr`, `DLG_EXT.crecarchive`, `DLG_EXT.memforget`, `memPromote`, `memSaysList`, `memFoldLine`, `memOpenProposal`, `DLG_EXT.ontedit`, `DLG_EXT.ontretire`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Steering / Steering record`: Loaded, Loaded · mobile, and Loaded · future-only fields marked |
| Audit | `steering-source.audit-prompt.md` |

## Job

One Steering Source, read as the durable thing it is: a Steering record, an ADR, the product vision, a memory, a glossary term or the workspace instructions. The page shows the source itself (its statement, sections or body), where it lives and at which version, the SteeringFrames it emits at that version with the hash each one carries, and the agents its scope reaches. A change to a file is a pull request, and a change to a memory is a governed write, so nothing on the page saves a row.

The page never shows a frame as its source. Its "Frames it emits" panel lists the SteeringFrames this source yields, each with its own id, and every frame row elsewhere (the Compiler, an agent's Steering tab, a run's Decision trace) links back here at the version it names (D4, D6).

## What is on the page

**Shell.** As `steering.md`, with Steering lit. The breadcrumbs read "Anderson Intelligence Corp. / Core platform / Steering / <id>", the id in mono.

**The frame every kind shares.**

- Eyebrow: "Steering · <kind label>", where Steering links back to Sources filtered to this kind (`?kind=record`, `doc`, `memory`, `glossary` or `instruction`).
- h1: the source's title. A title over 90 characters sets a smaller h1.
- A row of badges under the h1, then the actions at the right. A lead paragraph appears only for a state: "Archived in <commit>." on an archived record and "Superseded by <id>." on a superseded ADR.
- Two columns. The left column holds the source; the right column holds the kind panel (a record only), **Frames it emits** and **Agents it reaches**.

**Frames it emits.** Heading "Frames it emits". Caption "<n> at this version." Why the frames and hashes are stable is in the component help (`mockups/help/steering-source.md`, Frames it emits). A source that emits nothing reads "None." followed by its reason: "It emits nothing at this version." for an archived record, "superseded by ADR-014" for ADR-008. Each frame is one item:

- the frame-type badge, the force badge, and the injection point in dim text ("Session start", "Prompt submit");
- the token cost at the right ("214 tok");
- the body;
- "enforced by <gate>" under the body where a gate enforces it ("enforced by gate.never-merge" on ADR-021's invariant);
- the frame id in mono: `<type>:<source id>@<first 12 hex of the hash>`, for example `constraint:ctx.release.notes-format@a4c91e2f07b3`.

**Agents it reaches.** Heading "Agents it reaches". Caption "<n> in <workspace> by its scope, <scope>." ("68 in Core platform by its scope, workspace."), or "None while it emits nothing." The first five agents, each an agent chip that links to the agent with a **Compiler** link beside it to `/steering/compiler/<slug>`. Under them, "<n> more on Assignments" links to `steering-assignments.md`'s view.

### A Steering record

The route `…/sources/record/ctx.release.notes-format` renders a rule at `should` with the effect `require`.

- Eyebrow "Steering · Steering record". The kind's glyph in a tinted tile beside the h1, and the h1 is the statement, never the lineage.
- Badges: the kind badge (its icon and the kind in capitals, "RULE"), the force ("should"), the constraint effect where the record carries one ("require" or "forbid"), the scope ("workspace"), and the status ("published" with a dot, or "archived"). While a change to the record is open, its branch shows as a further badge ("context/ctx.release.notes-format.amend").
- No lead on a published record. The kind's description and what puts a record in force are in the component help (`mockups/help/steering-source.md`, Header).
- Actions: **Discard edits** (disabled until the statement changes, and it returns the editor to the words in force), **Archive** (red outline; opens `crecarchive`; absent on an archived record) and **Propose a change** (gold; opens `srcpr`).
- An archived record (`ctx.platform.retry-budget`) reads "archived", has the lead "Archived in <commit>.", has no Archive action, and its Frames it emits reads "None. It emits nothing at this version."

Left column:

- **The statement editor.** The shared source editor over the statement and nothing else. Its path label reads ".oxagen/rules/ctx.release.notes-format.toml · statement", its change state "unchanged", and its bar "214 tok in the bundle" (or "in the stable prefix"). It has a line-number gutter, markdown highlighting, the current-line band, **Find ⌘F** with a match count, and a status line: "Ln 1, Col 91", "Statement", "1 line · 90 chars", "LF", "UTF-8", and the key hints.
- No note under it. That the editor holds the statement only is in its component help (`mockups/help/steering-source.md`, Statement).
- **Lineage** panel, with no caption. Rows: Lineage (`ctx.release.notes-format`), File (".oxagen/rules/ctx.release.notes-format.toml on a-intel/platform"), Published by ("a4c91e2 on 2026-09-04"), Effect ("rendered 212 · cited 188 · violated 3", or "never rendered") and Schema (`steering-record/v0.1`).

Right column, first **the kind panel**. It is headed with the kind's name and its badge, and shows only the record's own data. How each kind reaches a run and what it can never do are in the component help (`mockups/help/steering-source.md`, Kind panel). Each of the six kinds has its own panel:

| Kind | What the panel shows |
|---|---|
| `rule` | "Where it sits": Force ("should", with "in the stable prefix, every turn in scope"; `may` and `info` read "selected by relevance"), Effect (its badge, where the record has one) and Bundle ("v41 · 214 of 1,340 tokens", or "Not in the compiled bundle"). Three meters: "Runs it was rendered into" (212 of 212), "Runs that cited it" (188 of 212) and "Runs that went against it" (3 of 212) |
| `constraint` | A boundary block with the effect in capitals and one line: "Enforcement grant. Its gate is on Tools › Policy." for a record with a grant, "No enforcement grant." otherwise. Meters: rendered, cited and "Runs that crossed it" |
| `procedure` | "Steps": the statement as a numbered list, one step per line |
| `fact` | "Claim": Falsifiable by, valid_from ("2026-05-30, the merge time of a4c91e2") and Last confirmed ("96 runs read it and none contradicted it") |
| `memory` | "When it happened": Recorded, Explains, Selection ("By relevance. 12 of 40 runs that carried it used it.") and Decay ("none automatic") |
| `preference` | Three meters: rendered, cited and "Runs that departed from it" in grey |

The meters are the record's attribution, read from the effect line: rendered is the total, and the other two are shares of it. They are never a score.

Then **Frames it emits** (one `constraint` frame at `should`, Session start, 214 tok), **Agents it reaches** (68), and **Related records**: up to three record cards of the same kind, each with **Open**, under the shared list controls (Sort: Shown order, Statement A–Z, Statement Z–A; Rows; a pager). With no other record of the kind: "None. This is the only <kind> in <workspace>."

### An ADR and the product vision

The routes `…/sources/adr/ADR-021`, `…/sources/adr/ADR-008` and `…/sources/vision/VISION`. The whole page is future-only.

- Eyebrow "Steering · ADR" or "Steering · Product vision". The h1 is the document's title: "No agent merges to main", "Release notes are written by hand", "Product vision".
- Badges: the status (accepted, superseded or registered), the id in mono, "@<commit>", and "repository a-intel/platform".
- Lead. None on an accepted ADR or the vision. A superseded ADR: "Superseded by ADR-014."
- Action: **Open the file**, plain. It opens the document on its repository and reports "Opened <path> on <repository>."
- **Sections** panel, with no caption. Columns: Section, Emits, Force and Text. Emits is the frame-type badge, with "enforced by <gate>" under it where the registration names a gate, or "nothing". Force is the force badge, or a dash for an unregistered section. Every section of a superseded ADR reads "nothing".

| Document | Sections |
|---|---|
| ADR-021, accepted | Invariants: `invariant`, "enforced by gate.never-merge", `must`, "No agent merges to main. A person merges every pull request." Decision: `procedure`, `should`, "An agent that finishes a change opens a pull request, requests review from the code owners, and stops." |
| ADR-008, superseded | Decision: nothing, `should`, "The release manager writes the notes by hand from the milestone." |
| VISION, registered | Goals: `goal`, `should`. Constraints: `constraint`, `must`. Context: `context`, `info`. Positioning: nothing, "Not registered. The registration names Goals, Constraints and Context only." |

- **Record** panel: File ("docs/adr/ADR-021-no-agent-merges.md on a-intel/platform"), Version ("7c1e2d0, 2026-07-30"), Owner ("Priya Natarajan"), Registered by ("a-intel/platform#431, merged 2026-09-02"), and Supersedes or Superseded by as a link to the other ADR where one applies (ADR-014 supersedes ADR-008).
- Right column: **Frames it emits** (ADR-021: an `invariant` at `must`, Session start, 17 tok, enforced by gate.never-merge, `invariant:ADR-021@f868b179031d`; a `procedure` at `should`, Session start, 28 tok. The vision: a `goal` and a `constraint` at Session start and a `context` at Prompt submit) and **Agents it reaches** (68, by its scope, repository). ADR-008 reads "None." with its reason, and "None while it emits nothing."

### A memory

The route `…/sources/memory/mem_01K5QX7C`.

- Eyebrow "Steering · Memory". The h1 is the memory's body: "On 4.10.1 a green release pull request was merged by the agent to save time, and nobody objected."
- Badges: the status ("yields"), the force ("may"), the scope ("workspace"), the version (the date it was recorded, "2026-08-14") and the hash ("sha256:c81f7720").
- No lead. Where the memory came from is its Where row. How it competes and how it becomes a record are in the component help (`mockups/help/steering-source.md`, Header).
- Actions: **Forget** (plain; opens `memforget`) and **Propose as a Steering record** (gold; opens the record wizard with the memory's words in its description). A memory the fold already proposed offers **Open the proposal** (gold) instead, which lands on Proposals with that proposal selected (`…/sources/memory/mem_01K5R0N2` opens `prp_01K5RX1N`), so nobody argues the same record twice.
- **Record** panel: Kind ("Memory"), Where (the run that left it: "run_01K5R52Q3X9YAB9E · frame 88 · reflection"), Recalled ("212 times in 30 days, last 2026-09-11 09:14") and, for a memory that yields, Yields to (a link to `ctx.release.never-merge`, then "a published must, and is excluded as overridden_by_must").
- **Sayings** panel, under Record, with a count badge, when the memory holds any. The same list the memory dialog shows (`run-memories.md`): each saying in quotes with who said it, then its run and frame as a link to that run's Memories tab, or, for an imported saying, `<file>:L<line>` and "imported". Under the list, the fold line. `mem_01K5QX7C` has one saying ("It becomes a proposal at 3 sayings from 2 runs. It has 1 from 1 run."). `mem_01K5R0N2` has three and reads "Proposed as prp_01K5RX1N when it reached 3 sayings from 2 runs." An import adds its saying here. How an imported saying counts toward the fold is in the component help (`mockups/help/steering-source.md`, Sayings).
- An imported memory's Where reads its file, line and importer ("apps/api/CLAUDE.md:L3 · import by Marcus Bell").
- Right column: **Frames it emits** (one `context` frame at `may`, Prompt submit, 29 tok) and **Agents it reaches**. A memory that yields still emits its frame; the Compiler and the Decision trace list it as excluded with `overridden_by_must`.

### A glossary term

The route `…/sources/glossary/ont.release-train`.

- Eyebrow "Steering · Glossary term". The h1 is "term: definition": "release train: The release train is the weekly cut of a-intel/platform from main to a release/x.y branch. A change that misses the freeze rides the next train."
- Badges: published, `info`, workspace, the commit ("d17e40b") and the hash ("sha256:2f90b1c4").
- No lead.
- Action: **Propose a change** (gold; opens `ontedit`).
- **Record** panel: Kind ("Glossary term") and Where (".oxagen/ontology/release-train.toml").
- Right column: **Frames it emits** (one `context` frame at `info`, Prompt submit, 34 tok) and **Agents it reaches**.

### The workspace instructions

The route `#/a-intel/finops/steering/sources/instruction/ins.finops.additional`.

- Eyebrow "Steering · Workspace instructions". The h1 is the instruction text: "Quote every amount with its currency and its purchase order. Never round."
- Badges: "in force", `should`, workspace, the date ("2026-08-30") and the hash ("sha256:f19a60c7").
- No lead. Its badges carry the force, and Agents it reaches carries its reach.
- No action. The instructions are a workspace setting, not a file.
- **Record** panel: Kind ("Workspace instructions") and Where ("workspace settings").
- Right column: **Frames it emits** (one `procedure` frame at `should`, Session start, 19 tok) and **Agents it reaches** (21 in FinOps).

### Other kinds and unknown ids

A policy source, a mandate, a toolbelt and an agent definition are managed on Tools, on the agent's Permissions tab and on the agent's Source tab. Their Sources rows link there, and this page is not their page. An id this workspace does not hold renders "No source here", "Nothing in Core platform is named <id>. It may have been archived, or it belongs to another workspace." and **Back to Sources**. The mockup renders its first record instead for a record lineage nothing holds; a build answers that address with "No source here" too.

### Dialogs

**`srcpr`**, "Propose a change to this record", subtitle ".oxagen/rules/<lineage>.toml".

- No lead. The primary action names what it does.
- The change: the main repository and the branch ("a-intel/platform ← context/ctx.release.notes-format.amend"), the added and removed line counts, and the line diff of the statement, or "Nothing changed yet."
- "What the checks will assert": Schema ("steering-record/v0.1 still valid after the edit"), Lineage ("ctx.release.notes-format keeps its lineage"), record_hash recomputation ("recomputed over the new bytes · the old hash stays on every run that carried it"), Secret and PII scan ("the new statement is scanned"), Conflict against active records ("re-run in full") and constraint_effect ("unchanged · require").
- Footer: Cancel and **Open the pull request** (gold; disabled while nothing changed). Opening reports "a-intel/platform#528 opened. ctx.release.notes-format changes when it merges." The header gains the branch badge and the Sources row gains "pull request open". The record in force does not change until the merge.

**`crecarchive`**, "Archive <lineage>?".

- "Archiving opens a pull request that sets status = "archived" on .oxagen/rules/<lineage>.toml."
- For a record with an enforcement grant, a warning: "This record compiles to a gate. What the gate refuses today is allowed once this merges." A record with a constraint effect and no grant gets no warning, because only a grant compiles a gate.
- What stays (the file, the lineage, every run's hash) is in the dialog's component help.
- Footer: **Keep it in force** and **Open the pull request** (red). Opening reports "Opened <pull request> to archive <lineage>." A record with a change already open says "<lineage> already has a pull request open", "Branch <branch> is waiting on its checks. Land or close that one first." and offers Close; an archived record says "<lineage> is already archived" and "It is out of force."

**`memforget`**, "Forget this memory?".

- "The assembler stops selecting it, and every agent in scope stops being told it."
- A warning with its recall count: "It was recalled 212 times in the last 30 days."
- What forgetting leaves untouched, and promotion as the other answer, are in the dialog's component help.
- Footer: **Keep it** and **Forget it** (red), which reports "Forgot <id>."

**`ontedit`**, "Edit release train": Term, Kind (term, entity, alias or boundary, with the hint on each), Definition (with the wand, "Press the wand to have oxagen.assistant write the definition’s prose.") and About. A note: "Saving opens a pull request against .oxagen/ontology/release-train.toml." Footer: Cancel, **Retire** (red; opens `ontretire`) and **Open the pull request** (gold). Opening reports "Opened <pull request> for release train."

**`ontretire`**, "Retire release train?": "Retiring it opens a pull request that removes .oxagen/ontology/release-train.toml.", then the warning "Once the removal merges, no agent is told that release train means what this note says it means." Footer: **Keep it** and **Open the pull request** (red), which reports "Opened <pull request> to remove release train."

The record wizard that Propose as a Steering record opens is specified in `docs/creation-spec.md` §5; it ends on a pull request.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in `macanderson/oxagen` | Status |
|---|---|---|---|---|
| A record's statement, kind, force, effect, scope, status, commit and path | `RECORDS` via `stgRecord()` | `.oxagen/rules/<lineage>.toml` on the main repository, indexed in `agent.steering_records` | `get_record` (`packages/oxagen/src/contracts/steering.records.get.ts:127`), whose record is `publishedRecordSchema` (`context.steering.shared.ts:250-280`). It reads the file first and says whether the file or the registry answered (`steering.records.get.ts:25`, `:79`) | ✅ |
| Published by (the commit and its author) | `RECORDS[].commit`, `pub` | The commit that published the file | `get_record` `provenance` (`steering.records.get.ts:36-49`, `:80`) | ✅ |
| Effect: rendered and cited | `RECORDS[].effect` via `crecNum()` | Distinct runs that rendered and cited the lineage | `get_record` `effect` (`steering.records.get.ts:55-64`), counted from `context_use` and `context_use_feedback` appends (`packages/handlers/src/context.steering.store.ts:645`). Null when the workspace records no context use, which renders "not recorded", never 0 | ✅ |
| Effect: violated, and the third meter | `RECORDS[].effect` | A rollup of runs that went against the record | None (#3868) | ❌ |
| Bundle share ("214 tok in the bundle", "v41 · 214 of 1,340 tokens") | `STEER_BUNDLE`, `stgBundle()`, `crecBundleRow()` | The compiled bundle's row for the record | Each `steering.manifest` item carries its tokens (`packages/tacho/src/wire.ts:643-654`) and a merge reports the steering version (`steering.pr.merge.ts:14`), but no read returns one record's row in the bundle in force | 🟡 |
| The kind panel's figures ("59 published records", "96 runs read it") | `RECORDS`, `rec.effect` | `list_records` total, `get_record` effect | `list_records` (`steering.records.list.ts:17`); `get_record` effect | ✅ |
| A fact's "Falsifiable by" and a memory record's "Explains" | Fixed strings in `crecPanel` | A field on the record | None. The record schema has no such field | ❌ |
| Related records | `RECORDS` of the same kind | `list_records` filtered by kind | `list_records` `kind` input (`steering.records.list.ts:40`) | ✅ |
| The branch badge and "pull request open" | `S.recPending` | The proposal open on the lineage | `list_proposals` by `lineageId` with status `pr_open` (`context.proposal.list.ts:12`) | ✅ |
| Propose a change | `crecSave()`, `DLG_EXT.srcpr`, `srcPrOpen()` | A proposal with the new statement and its pull request | `revise_steering_record` (`steering.record.revise.ts:24`) opens it on `context/<lineage>`, not the mockup's `.amend` branch, and runs the six checks (`context.steering.shared.ts:107-116`) | ✅ |
| Archive | `DLG_EXT.crecarchive`, `crecArchive()` | A pull request that sets the status to archived | `promote_steering_record` with the action `retire` appends to the promotions ledger (`steering.record.promote.ts:5`, `:28`). No capability opens an archive pull request | 🟡 |
| A record's versions | none on the page | Every version of the lineage | `get_record` `versions` (`steering.records.get.ts:82`). The page does not render them | ✅ |
| Documents: title, status, sections, registration | `SOURCES.documents`, `SOURCES.registration` | `.oxagen/sources.toml` and the documents it names | None | ❌ |
| A memory's body | `MEMORY` | `:AgentMemory` | `list_memories` `lesson` (`agent.memory.list.ts:25`, `agent.memory.model.ts:98`) | ✅ |
| A memory's status, force, scope, hash, run, recall count and yield | `MEMORY[]` | The memory adapter | None. `list_memories` carries a class, a kind, a citation count and a creation time, and none of these (#3904) | ❌ |
| A memory's sayings, fold line and imported provenance | `MEMORY[].sayings`, `memSaysList()`, `memFoldLine()` | A saying per run or import on the memory, and the fold setting | None. No contract stores a saying or counts runs toward a fold (`run-memories.md`) | ❌ |
| Open the proposal | `MEMORY[].proposedAs`, `memOpenProposal()` | The proposal the fold raised | `list_memory_promotions` (`agent.memory_promotion.list.ts:11`) lists promotions and does not name the fold that raised one | 🟡 |
| Forget | `DLG_EXT.memforget`, `memForget()` | Stop the assembler selecting the memory | `delete_memory` removes the node and its edges (`agent.memory.delete.ts:14`). No run records a memory's hash today, so the dialog's promise about carried hashes has nothing behind it yet | 🟡 |
| Propose as a Steering record | `memPromote()`, the record wizard | A proposal, then its pull request | `propose_record` (`context.proposal.create.ts:12`) and `open_steering_pr` (`steering.pr.open.ts:96`) | ✅ |
| Glossary term, its file and its edit | `ONTOLOGY`, `DLG_EXT.ontedit`, `DLG_EXT.ontretire` | `.oxagen/ontology/*.toml` | None | ❌ |
| Workspace instructions text | `STEERING_PREVIEW.instructions` | Workspace settings | `get_prompt_settings` `additionalInstructions` (`prompt.settings.read.ts:15`, `:33`) | ✅ |
| The instructions' status, force, scope, version, hash and reach | `STEERING_PREVIEW.instructions` | An instruction source in the assembler | The text reaches the in-app agent only, with no manifest item (`packages/agent/src/runtime/workspace-instructions.ts:1-30`, #3296) | ❌ |
| Frames it emits | `srcFramesOf()` | SteeringFrames with type, provenance and hash | `steering.manifest` items carry no type, source version or hash (`packages/tacho/src/wire.ts:626-697`) | ❌ |
| Agents it reaches | `srcReachPanel()` over `AGENTS` | The source's scope against the agent registry | `list_agents` (`agent.list.ts:142`) and a record's sharing scope. Other kinds carry no scope | 🟡 |

## Future-only fields

| Mark | Reason | What a build shows today |
|---|---|---|
| The **Frames it emits** panel on every kind | `frame types and per-frame provenance` | The panel with "not recorded" in place of the list, naming the gap. Never frames derived from the kind |
| The whole ADR and vision page | `vision and ADR sources` | No page. `/steering/sources/adr/<id>` and `/steering/sources/vision/<id>` answer as an id nothing holds until `.oxagen/sources.toml` ships |

These fields are future-only in `macanderson/oxagen` and carry no mark in the mockup: the violated count and its meter, a fact's "Falsifiable by", a memory record's "Explains", every field of a glossary term, a memory's status, force, scope, hash, run, recall count and yield, and the instructions' reach. A build renders each as not recorded until its contract ships.

## Functionality

- The page reads one source at one version. The same source at the same version always emits the same SteeringFrames with the same hashes, and each frame's id names the source and the first 12 hex of its hash.
- A record's statement editor holds the statement only. The lineage, force, scope and effect are the rest of the file, and each changes the same way. Discard edits is disabled until the draft differs from the words in force.
- Propose a change opens the line diff and the six checks. Opening the pull request records the pending branch; the record in force is unchanged until the merge, and every run keeps naming the hash it carried.
- Archive opens a pull request, never a delete. The record stays in force until the merge.
- A memory leaves by being forgotten, by being superseded by a published record, or by a proposal that makes it a Steering record. Forgetting stops the assembler selecting it and rewrites no run.
- A glossary term changes and retires by pull request against `.oxagen/ontology/`.
- The workspace instructions are a setting, so the page offers no edit.
- A document's sections emit only what the registration names, and a superseded ADR emits nothing.
- Every Compiler link in Agents it reaches opens the Compiler resolved for that agent.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with More lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The two columns become one: the source first (the editor, the sections or the Record panel), then the kind panel, Frames it emits, Agents it reaches and Related records. The h1 wraps, and the badges wrap under it. The actions wrap under the lead. The Sections table becomes labelled cards. The editor keeps its gutter. Every dialog rises from the bottom edge as a sheet with full-width footer buttons. Nothing scrolls sideways; touch targets are at least 44 px and inputs are 16 px.

## Permissions

- Read: the mockup's denied panel names `steering.read on core-platform`. `get_record` and `list_records` allow an organization Owner or Admin and a workspace Owner, Member or Viewer.
- Writes, each a governed action recorded in Audit:
  - Propose a change: `revise_steering_record`, an organization Owner or Admin, or a workspace Owner or Member.
  - Archive: today `promote_steering_record` with `retire`, an organization Owner or Admin, or a workspace Owner or Admin.
  - Forget: `delete_memory`, an organization Owner or Admin, or a workspace Owner or Member.
  - Propose as a Steering record: `propose_record` and `open_steering_pr`, an organization Owner or Admin, or a workspace Owner or Member.

## Backend gaps this page depends on

- Frame types, the source version and the hash on every SteeringFrame (wedge spec, Shipped today).
- `.oxagen/sources.toml` and the vision and ADR source kinds, with an ADR beside ADR-093 (wedge spec, Open decision 3).
- The violated count per record (#3868).
- An archive pull request for a Steering record.
- A memory's status, force, scope, run, hash and recall counter (#3904).
- Glossary terms in `.oxagen/ontology/*.toml` and the pull requests that change them.
- The workspace instructions as a source the assembler ranks (#3296).
- One read of every source kind in one shape (#3830).

## Rules every build of this page must keep

- A Steering Source and a SteeringFrame are never shown as each other. This page lists the SteeringFrames a source emits, each with its own id, and a frame row elsewhere links here at the version it names.
- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- A record's statement is the headline. A build that leads with the lineage, the id or the status has inverted the record.
- Each of the six record kinds gets its own panel of the record's own data. What each kind can never do is in the kind panel's component help. A record never grants authority.
- The meters are attribution read from the record, never a score. No person is scored or ranked.
- Every enforcement claim states the tier. "Enforced" only for calls routed through Oxagen. A gate named on this page is edited on Tools › Policy.
- Headers are rollups of the rows beneath them: the Frames it emits count is the rows beneath it, and the reach count is the agents listed plus those on Assignments.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. The kind-panel eyebrows are plain nouns (Where it sits, Steps, Claim, When it happened), and the Frames it emits caption is one sentence.
- Exactly one gold action per screen: Propose a change, or, on a memory, Propose as a Steering record or Open the proposal.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- Nothing on this page writes a row. A file changes by a pull request, and a memory by its own governed write.
