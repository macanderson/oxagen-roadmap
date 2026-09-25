# Steering › Sources

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering`, filtered by kind with `?kind=record`, `doc`, `skill`, `agent`, `instruction`, `glossary`, `memory`, `policy`, `mandate` or `toolbelt`. Old routes that land here (`docs/fleet-operations-routes.md`, Steering): `/steering/library` (308 to `/steering`); `/steering/records`, `/instructions`, `/skills`, `/memory` and `/ontology` (308 to `?kind=record`, `instruction`, `skill`, `memory` and `glossary`); `/{org}/{ws}/skills` and `/skills/{…}` (308 to `?kind=skill`). The mockup rewrites `#/:org/:ws/steering/<shelf>` and `#/:org/:ws/skills…` in place with `history.replaceState` |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D4 (a source and a frame are two objects), D5 (eight frame types), D7 (Steering record), D11 (a mandate emits delegation frames), D12 (a skill is a source), D13 (memory and glossary terms are source kinds), D17 (every field marked); the Steering sections Two objects, Emissions, Reading a source and Shipped today; the Cuts rows for the Steering shelves, Memory and Ontology management, Steering › Gates and the Skills console. `docs/fleet-operations-ia.md` (Steering). `docs/creation-spec.md` for the wizards New source opens. ADR-061, ADR-090 and ADR-093 in `macanderson/oxagen` |
| Design | `mockups/src/wedge.js`: `pSteering`, `stgSourcesTab`, `steeringSources`, `gateHome`, `emitsCell`, `scopeCell`, `srcStatus`, `newSourceBtn`, `DLG_EXT.newsrc`, `DLG_EXT.srcreg`; `mockups/src/engine.js`: `govChip`, `DLG_EXT.govmode`, `DLG_EXT.skcfg`, `skCfgFile`, and the Markdown import (`wzImport`, `wzImpPublish` and the `imp` helpers inside `DLG_EXT.wz`). Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Steering / Sources`: Loaded, Loaded · mobile, and Loaded · future-only fields marked |
| Audit | `steering.audit-prompt.md` |

## Job

Steering answers one question for an operator: what do the agents know, and what are they told. This view is the one list of every Steering Source in the workspace: the durable material a person or an agent wrote that can steer an agent. Each row says what the source emits (its frame types), its scope, its version and hash, its status, how many agents its scope reaches, and where it is managed. A kind filter replaces the Library sections.

The list holds sources and never frames. A SteeringFrame is what the assembler resolves from a source for one run at one injection point, and it appears on the source's own page, in the Compiler, on an agent's Steering tab and in a run's Decision trace. A row here links to the source, and the source's page lists the SteeringFrames it emits (D4).

This spec also owns the parts every Steering tab shares: the header with its governance chip, skills chip, Import Markdown and New source, the four tabs, and the Markdown import wizard. `steering-assignments.md`, `steering-compiler.md`, `steering-proposals.md` and `steering-prs.md` refer here for them.

## What is on the page

**Shell.** The sidebar lists Work (8), Agents, Tools (29), Steering (10, lit), Runtimes (2), Spend and Repositories (5), then Organization, Billing and Audit (3), with Ask stella and the connection badge at the foot. The top bar carries the breadcrumbs "Anderson Intelligence Corp. / Core platform / Steering", "Search or run an action" with ⌘K, notifications, the Approvals button (17 waiting across the organization) and the avatar. The Steering count is what waits on a person here: open proposals and Steering record pull requests (IA, Workspace navigation). The mockup's sidebar reads 10, the proposals plus the pull requests a person opened, while the Proposals tab reads 16; a build shows one number in both places.

**Header.** Shared by the four tabs.

- Eyebrow: the workspace name, "Core platform" (set in capitals by the style).
- h1: "Steering".
- No subtext. What the page is for is in its component help (`mockups/help/steering.md`, Header).
- Actions, left to right:
  - The governance chip, "Governance: team": the mode's name and no review claim, because no shipped gate runs a code-owner review. It opens `govmode`. It is never gold.
  - The skills chip, "Skills settings", with the title "How skills resolve in this workspace, settings version skl_v7". It renders only in a workspace with skills on, and it opens `skcfg`. It is never gold.
  - **Import Markdown**, plain on every tab. It opens the Markdown import below.
  - **New source**. Gold on Sources, Assignments, Compiler and Proposals. Plain on the Pull requests view, where Merge pull request holds the gold. It opens `newsrc`.

**Tabs.** A tab list labelled "Steering", in this order: Sources (186), Assignments, Compiler and Proposals (16). Sources counts the rows of the unfiltered list. Proposals counts the proposals plus the open pull requests. Assignments and Compiler carry no count. Each tab is a path segment: `/steering`, `/steering/assignments`, `/steering/compiler/<agent>` and `/steering/proposals`. The Pull requests view, `/steering/proposals/prs`, lights Proposals.

**Kind filter.** A chip group labelled "Source kind". One chip per kind the workspace holds, each with its count in a dim span and `aria-pressed` on the one in use. The order is fixed: All, Steering records, Documents, Skills, Agent definitions, Instructions, Glossary, Memory, Policy, Mandates and Toolbelts. A kind the workspace does not hold has no chip.

| Workspace | Chips at load |
|---|---|
| Core platform | All 186, Steering records 78, Documents 5, Skills 10, Agent definitions 68, Glossary 4, Memory 7, Policy 6, Toolbelts 8 |
| FinOps | All 34, Agent definitions 21, Instructions 1, Glossary 1, Policy 3, Mandates 4, Toolbelts 4 |

Picking a chip writes `?kind=<kind>` into the address, and All clears it. A kind named in the address that the workspace does not hold renders the panel headed with that kind, "0 sources." and "No rows match.", with no chip pressed.

**Sources panel.**

- Heading: "All sources", or the picked kind's label ("Steering records", "Documents", "Skills", "Agent definitions", "Instructions", "Glossary", "Memory", "Policy", "Mandates" or "Toolbelts").
- Caption: "186 sources, 22 emitting nothing." The count is singular for one source ("1 source."), and the emitting-nothing clause appears only when a listed source emits nothing. How the Agents column counts is in the component help (`mockups/help/steering.md`, Source list).
- The type strip, right of the heading: one frame-type badge per type the listed sources emit, with the total beside it. On All in Core platform: `goal` 1, `invariant` 1, `constraint` 47, `procedure` 81, `context` 34 and `capability` 19. Each badge carries the type's description as its title.
- The shared list controls: "Search this list", up to three filters for columns whose values are a short list (on All sources: Scope, Managed in and Emits; on Steering records: Status, Scope and Emits), Rows (5, 10, 25, 50, All; 10 by default), a pager ("1–10 of 186") and sortable column headers.

Columns, in order:

| Column | What it shows |
|---|---|
| Source | The kind label in small dim text ("Steering record", "Product vision", "ADR", "Skill", "Agent definition", "Workspace instructions", "Glossary term", "Memory", "Policy", "Mandate" or "Toolbelt"), then the title, then the id in mono as a link to the source. The title is a record's statement, a document's title, a skill's description, "<Agent> instructions" for an agent definition, the instruction text, a glossary term as "term: definition", a memory's body, a gate notice's text, a mandate's purpose, or a toolbelt as "<Name>. <description>" |
| Emits | One frame-type badge per type the source emits at this version, with the count beside it when above one (`capability` 3). A source that emits nothing reads "nothing", with the reason under it where there is one: "superseded by ADR-014", "scoped to another workspace", "no person approved its digest", "withheld as unapproved_digest" or "withheld as out_of_scope" |
| Scope | `workspace`, `repository` with the repository under it, `agent` with the agent slug under it, `org`, or `assigned` for a toolbelt. A source that names agents adds "N named agents" under its scope |
| Version | The source version in mono, and "#" with the first 8 hex of the source's hash under it where the source carries one. A record shows its commit (`a4c91e2`), or `bundle v41` for a rule only the compiled bundle holds. A document shows its commit, a skill its semver (`2.1.0`), a memory or the instructions a date, a mandate `grant v3`, a policy source its rule or switch id, and a toolbelt "updated <date>" |
| Status | A dot and a word. A record reads published or archived, with a second badge, "pull request open", while a change to it is open. A document reads registered, accepted or superseded. A skill reads approved, unapproved, out of scope, withheld or retiring. An agent definition, the instructions, a policy source and a toolbelt read "in force". A glossary term reads published, pending merge or retiring. A memory reads recorded or yields. A mandate reads active, expired or revoked |
| Agents | How many agents in the workspace the source's scope reaches, right-aligned. A source that emits nothing reads 0 in dim text |
| Managed in | "Steering" in dim text, with no link, for the kinds managed on Steering. A link for the rest: "Agents" (an agent definition, and the gate for agents with no mandate), "Agent › Permissions" (a mandate, and the gate a mandate compiles), "Tools › Policy", "Tools › Kill switches", "Tools › Toolbelts", or "Steering record" (a gate compiled from a record's enforcement grant, which opens that record) |

A row opens the same address as its id link: the source's page for the kinds managed on Steering, the agent's Source tab for an agent definition, and the page named in Managed in for a policy source, a mandate or a toolbelt.

**The kinds.** What each kind emits follows the wedge spec's Emissions table.

| Filter value | Kind label | Emits | A row opens |
|---|---|---|---|
| `record` | Steering record | `constraint` for a rule or a constraint, `procedure` for a procedure, `context` for a fact, a preference or a memory. A record at force `info` emits `context` whatever its kind. An archived record emits nothing | `/steering/sources/record/<lineage>` (`steering-source.md`) |
| `doc` | Product vision, ADR | Only the sections `.oxagen/sources.toml` names: the vision `goal`, `constraint` and `context`; an accepted ADR `context`, `constraint`, `procedure` and `invariant`. A superseded ADR emits nothing | `/steering/sources/vision/VISION`, `/steering/sources/adr/<id>` (`steering-source.md`) |
| `skill` | Skill | `procedure` from SKILL.md, `context` per reference file, `capability` per declared entrypoint. An unapproved, out-of-scope or withheld skill emits nothing | `/steering/sources/skill/<id>` (`steering-source-skill.md`) |
| `agent` | Agent definition | `procedure` from its instructions | `/agents/<slug>/source` |
| `instruction` | Workspace instructions | `procedure` at `should` | `/steering/sources/instruction/<id>` (`steering-source.md`) |
| `glossary` | Glossary term | `context` | `/steering/sources/glossary/<id>` (`steering-source.md`) |
| `memory` | Memory | `context`, at `may` or `info` | `/steering/sources/memory/<id>` (`steering-source.md`) |
| `policy` | Policy | `constraint`, one gate notice per gate | Where its gate is edited |
| `mandate` | Mandate | `delegation`, one per active mandate. An expired mandate emits nothing | `/agents/<slug>/permissions?delegation=<mandate>` |
| `toolbelt` | Toolbelt | `capability`, one per tool on the toolbelt | `/tools/toolbelts` |

The Core platform fixtures, by kind: 78 Steering records (62 published, 16 archived); five documents (VISION registered, ADR-014, ADR-021 and ADR-033 accepted, ADR-008 superseded by ADR-014); ten skills (six approved, `a-intel.invoice-reconciliation` out of scope, `oxagen.pdf-extract` unapproved, `a-intel.changelog-bot` and `a-intel.mobile-release-notes` withheld); 68 agent definitions; four glossary terms; seven memories (six recorded, `mem_01K5QX7C` yields), one of them, `mem_01K5R0N2`, proposed as `prp_01K5RX1N` once it reached three sayings from three runs; six policy sources; eight toolbelts. FinOps adds the workspace instructions `ins.finops.additional` and four mandates, one of them expired.

**A workspace with skills off.** FinOps runs with skills off. Its header has no skills chip, its kind filter has no Skills chip, and `?kind=skill` renders "Skills", "0 sources." and "No rows match."

### Dialogs

**`govmode`**, opened by the governance chip.

- Title "Governance mode for Core platform", subtitle ".oxagen/rules/governance.toml on a-intel/platform".
- Three cards in one column, each saying what the merge gate enforces (`context.steering.policy.ts`). `solo`: "Any workspace member merges, the author included." `team`: "An org Owner or Admin, or a workspace Owner, other than the author merges." `regulated`: "An org Owner or Admin other than the author merges, recorded as the accountable approver." The mode in force carries "· now" after its name, and the picked card is highlighted. Who each mode suits, and separation of duties under `regulated`, are in the dialog's component help.
- Under the cards, the file the pick would write: two comment lines saying the file is read on the production branch when a pull request is opened and again when it is merged, and that a missing file means team; then `mode = "<mode>"` and `separation_of_duties = true` for `regulated`, `false` otherwise. A build writes the comment `draftGovernanceToml` writes (`packages/oxagen/src/contracts/context.steering.shared.ts:96`). The mockup's first comment line joins the path and the sentence with a colon.
- No note. When the mode is read, and what a lowering needs, are in the dialog's component help (`mockups/help/steering.md`, Governance mode).
- Footer: Cancel and **Open the pull request** (gold). Confirming reports "Pull request opened on a-intel/platform: .oxagen/rules/governance.toml sets mode = <mode>." Picking the mode in force reports "Governance mode is already team. Nothing to change."

**`skcfg`**, opened by the skills chip.

- Title ".oxagen/skills.toml", subtitle "Version skl_v7, merged as a-intel/platform#523 by Marcus Bell on 2026-09-10 11:42:07Z".
- The file, headed ".oxagen/skills.toml" and "skl_v7 · merged 2026-09-10 11:42:07Z": `enabled`, `[sources]`, `[search]`, `[unbound_repo]` with `policy = "ask"`, and `[reflection]`. The comment on `use = "research"` reads "the only accepted value" and links to no tab.
- **Sources**: a-intel/platform (3 skills, "The workspace's main repository."), a-intel/billing (1, "A linked repository."), a-intel/mobile ("not a source", "Linked. Not a skill source."), the a-intel org registry (3, "Published across the organization.") and the Oxagen marketplace (1, "Third-party. Every version waits for a person to approve its digest.").
- Footer: Close. The dialog changes nothing. That a change is a pull request is in its component help.

**`newsrc`**, opened by New source.

- Title "New source", subtitle "Every source changes by a pull request against a-intel/platform".
- Four cards, each with its action word:
  - Steering record, "A rule, constraint, procedure, fact or preference in .oxagen/rules/." **Write one** opens the record wizard ("New Steering record").
  - Document, "Name a document, such as docs/VISION.md or an ADR, in .oxagen/sources.toml, and say which sections emit which frame types." **Register one** opens `srcreg`.
  - Skill, "A folder under .oxagen/skills/ with skill.toml, SKILL.md, references and optional entrypoints." **Add one** opens the skill wizard ("Add a skill").
  - Glossary term, "One term the way this workspace uses it, in .oxagen/ontology/." **Define one** opens `ontnew` ("Define a glossary term").
- No note. Why memory, policy, mandates and toolbelts have no card is in the dialog's component help (`mockups/help/steering.md`, New source).
- Footer: Cancel. Each wizard ends on a pull request against the main repository. `docs/creation-spec.md` specifies the wizards.

**`srcreg`**, opened by Register one.

- Title "Register a document", subtitle ".oxagen/sources.toml on a-intel/platform".
- No lead. How a registration decides what a document emits is in the dialog's component help.
- The registration as TOML: a `[[source]]` with `id = "ADR-034"`, `kind = "adr"` and its path, and two `[[source.section]]` tables: Decision emits `procedure` at `should`, and Invariants emits `invariant` with `enforced_by = "gate.never-merge"`.
- A note: "Last changed by a-intel/platform#431, merged 2026-09-02."
- Footer: Cancel and **Open the pull request** (gold), which reports "Pull request opened on a-intel/platform to register ADR-034."

### Markdown import

The Markdown import reads an existing CLAUDE.md, AGENTS.md, or any other Markdown file into Steering records and memories. It is one of the six kinds of `DLG_EXT.wz` (`S.wz.kind` is `import`). `wzImport()` draws its three steps, Files, Review and Publish, and `wzImpPublish()` writes what the operator accepted. Nothing is written until the operator accepts it.

- **Entry points.** Each calls `wzOpen('import')`, and neither is gold.
  - **Import Markdown** in the Steering header on every tab, before New source.
  - **Import Markdown** in the ⌘K group Create.
- **Footer.** Left, in mono: "needs steering.write · memory.write on <workspace slug>". Step 1 has **Cancel**, and steps 2 and 3 have **Back**. Each step's own action sits at the right and is gold.
- **Step 1, Files.** Title "Import Markdown", subtitle "Drop a directory or pick files, and oxagen lists the Markdown it finds." A drop zone reads "Drop a directory or Markdown files here", with **Choose a directory** (a directory picker), **Choose files** (accepts `.md`, `.markdown` and `text/markdown`), and **Use the sample directory** (loads `FIXTURES.MD_IMPORT`, rooted at `a-intel/platform`). While files are read, a status line (`role="status"`) says "Reading N more…".
  - The field **Found in <root>** ("Found" when no root is known) is a table with the columns Include (a checkbox with no header text), File, Lines, KB, Tokens and Import as (`records` or `memories`). An excluded row dims. Under the table, **Import every file as** sets every row at once.
  - Caps. A directory named `node_modules` or `vendor` is skipped as "a dependency directory", `.git` as "version control", and `dist` or `build` as "build output". A skipped directory is named once, by its own path, and never opened. A file that does not end in `.md` or `.markdown` is "not Markdown". A file over 200 KB is "over the 200 KB limit". A file the browser cannot read is "could not be read".
  - The field **Skipped** groups the skipped paths by reason. It shows three paths per reason, then "and N more", and it gives an oversized file's size in KB.
  - With files included, a note reads "stella reads N files, about T tokens. That costs about $X in usage credits, billed to <organization>." ("file" for one). The organization's trailing period is dropped, so the sentence ends once. KB is the file's characters divided by 1024, to one decimal and at least 0.1. Tokens are the characters divided by 3.6. The cost is $0.012 per thousand tokens, rounded up to the cent and never below $0.01.
  - Gold **Parse with stella**, disabled while no file is included or a file is still being read.
- **Step 2, Review.** Title "Review candidates", subtitle "Accept or reject each line, or a whole file at once."
  - Four tiles: **Files** ("parsed by stella"), **Candidates** ("N as records, M as memories"), **Duplicates** ("start rejected") and **Parse cost** ("usage credits").
  - A bar holds **Accept all**, **Reject all**, the select **Import everything as** (each file’s choice, records, or memories), and the count "N accepted, N rejected, N undecided" (`data-imp-counts`). When any line is a duplicate, a hint reads "Accept all leaves the N duplicates rejected. Accept one on its row to import it anyway."
  - Candidates are grouped by file. Each group header holds the path, "N candidates" ("candidate" for one), **Accept file** and **Reject file**.
  - Each candidate row holds the kind badge and its source, `<file>:L<line>` (`L<line>-<end>` for a block), then the text with the matched word marked, then the reason stella gives, with "You set it to <kind>." added when the operator changed the kind. Then the row's notes, then its controls: **Import as** (Record or Memory), Kind, Force (a select for a record, a badge for a memory), Constraint effect (forbid or require, on a record constraint only), **Accept** and **Reject**. The row carries `data-imp-id`, `data-imp-st` and `data-imp-as`.
  - The notes a row can carry: "Already published as <record> (N% word overlap).", "Repeats <file>:L<line> (N% word overlap).", "Joins <memory> as a saying (N% word overlap)." on a memory, "Close to memory <memory> (N% word overlap)." on a record, and "A memory caps at may. Keep it a record to hold it at <force>."
  - A closing note reads "An undecided line is left out." Gold **Review what publishes**, enabled once one line is accepted.
- **Step 3, Publish.** Title "Publish", subtitle "Records open one pull request per source file, and memories are written now."
  - With records, one block per source file (`data-imp-pr`): `<main> ← context/import-<file slug>`, and one `add .oxagen/rules/<lineage>.toml` per accepted line beside its `<file>:L<line>`.
  - With memories, the field **Memories** lists `mod <memory id>` ("a saying from <file>:L<line>") for a line that joins a memory, and `add mem.import.<words>` ("<class> at <force> from <file>:L<line>") for a new one. The hint reads "Written when you publish, with no pull request."
  - The gold button reads "Open N pull requests and write M memories", "Open N pull requests" or "Write M memories", singular for one.
- **What each target writes.**
  - A record goes into one pull request per source file, opened at once, like a record you write by hand: branch `context/import-<file slug>`, scope workspace, and lineage `ctx.<first segment of the workspace slug>.<first four words>`, with the words cut at 48 characters. Where a published record, an open pull request, or an earlier line already holds a lineage, the import adds `-2`, `-3` and so on. The pull request's description reads "Imported from <file>". `steering-prs.md` specifies how it reads.
  - A memory is written at once, with no pull request, at `may` or `info`. A new one takes the lineage `mem.import.<words>` and provenance "<file>:L<line> · import by <person>". A line that joins a memory adds a saying to it, which counts toward the sayings and never toward the runs. `steering-source.md` specifies the memory's page, and `run-memories.md` specifies folding.
  - The Markdown files are never changed.
  - Audit records `steering_imported`: "<R> records in <P> pull requests, <M> new memories and <S> sayings from <F> Markdown files", each noun singular at a count of one.
  - A gold toast joins the parts that apply: "Opened N pull requests for R records.", "Wrote N memories." and "Added N sayings to existing memories."
  - With a pull request opened, the page goes to the Pull requests view, `/steering/proposals/prs`, with the first one selected. With none, it goes to Sources at `?kind=memory`.
- **Empty and refused.** With no file found, step 1 shows the drop zone and the note "oxagen skips dependency and build directories, version control, anything that is not Markdown, and any file over 200 KB.", and **Parse with stella** is disabled. A parse that finds no candidate shows 0 on every tile and the closing note, and **Review what publishes** stays disabled with no line that says why. The wizard has no refused state: `wzOpen()` checks no permission, and the footer only names what the import needs.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. The mockup collection is a file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or a constant in `mockups/src/`. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in `macanderson/oxagen` | Status |
|---|---|---|---|---|
| Steering record rows | `RECORDS`, `STEER_BUNDLE.rules`, read by `steeringSources` | `.oxagen/rules/*.toml` on the main repository, indexed in `agent.context_records` | `list_records` (`packages/oxagen/src/contracts/context.records.list.ts:17`) returns lineage, title, kind, force, constraint effect, sharing scope, statement, status, version, checksum, commit, path and publish time (`context.steering.shared.ts:250-280`). Status `active` reads published and `retired` reads archived | ✅ |
| A record's `org` or `agent` scope | `RECORDS[].scope` | `sharing_scope` | The sharing scope is `repository` or `workspace` only (`context.steering.shared.ts:37`) | ❌ |
| Document rows (vision, ADR) | `SOURCES.documents`, `SOURCES.registration` | `.oxagen/sources.toml` and the documents it names | Nothing reads or writes the file | ❌ |
| Skill rows | `SKILLS`, `SOURCES.bundles`, `SOURCES.withheld` | `.oxagen/skills.toml` pins, and the resolution at a config version | `get_skill_config` returns the pins, each id, version and digest (`skill.config.get.ts:6`, `packages/oxagen/src/skills.ts:14`). `preview_skill_search` returns each candidate's description and token cost and the withheld ones with `out_of_scope` or `unapproved_digest` (`skill.search.preview.ts:14`). References and entrypoints have no store | 🟡 |
| Agent definition rows | `AGENTS`, `defDoc()` | `.oxagen/agents/<slug>.toml` | `list_agent_defs` and `get_agent_def` (`agent.definition.list.ts:6`, `agent.definition.get.ts:6`) | ✅ |
| Workspace instructions row | `STEERING_PREVIEW.instructions` | Workspace settings | `get_prompt_settings` returns `additionalInstructions` (`prompt.settings.read.ts:15`, `:33`). The text reaches the in-app agent only, with no id, hash or manifest item (`packages/agent/src/runtime/workspace-instructions.ts:1-30`, #3296) | 🟡 |
| Glossary term rows | `ONTOLOGY` | `.oxagen/ontology/*.toml` | No contract reads a glossary term. The v2 ontology contracts describe schema files, not terms | ❌ |
| Memory rows | `MEMORY` | `:AgentMemory` in Neo4j | `list_memories` returns the body (`lesson`), class, kind, citation count and creation time (`agent.memory.list.ts:25`, `agent.memory.model.ts:98`). No force, scope, run, hash or yield (#3904) | 🟡 |
| Policy rows (gate notices) | `GATES`, `gateHome()` | One notice per gate that reaches the workspace | The gates ship (`list_kill_switches`, `kill_switch.list.ts:29`; `list_mandates`, `mandate.list.ts:29`; decision rules in workspace settings). No capability produces a gate notice (#3880) | ❌ |
| Mandate rows | `MANDATES` | The mandate ledger | `list_mandates` (`mandate.list.ts:29`) | ✅ |
| Toolbelt rows | `TOOLBELTS`, `TOOLBELT_ASSIGN` | Named toolbelts and their assignments | None. A toolbelt exists only as the computed per-agent list of `get_agent_toolbelt` (`agent.toolbelt.get.ts:95`) | ❌ |
| Emits column and type strip | derived per kind in `steeringSources` | Frame types on each SteeringFrame | `steering.manifest` items carry id, kind, force, tokens, outcome and reason, and no type (`packages/tacho/src/wire.ts:626-697`) | ❌ |
| Version and hash | per kind in `steeringSources` | The source version and the source's hash | A record's commit and checksum ship through `list_records`. A skill's version and digest ship through `get_skill_config`. The other kinds carry none | 🟡 |
| Agents (reach) | `reachOf()` over `AGENTS` | The source's scope against the agent registry | The agents ship (`list_agents`, `agent.list.ts:142`). A workspace or repository record's reach resolves from its sharing scope. Agent, org and named-agent scopes do not exist in the contracts | 🟡 |
| Managed in | `gateHome()`, `SRC_KIND` | Navigation only | Derived in the page | ✅ |
| Governance chip | `WS[].governance`, `wsGov()` | `.oxagen/rules/governance.toml` on the main repository | Read by `get_repository_tree` as `governanceMode` (`repository.tree.get.ts:41`, `:83`). Written by `set_governance_mode` (`context.governance_mode.set.ts:71`) | ✅ |
| Governance change route | `DLG_EXT.govmode`, `govSet()` | A pull request, with an org-owner approval and a security event for a lowering | `set_governance_mode` commits straight to the production branch under `solo`, opens a pull request on `oxagen/governance` under `team` and `regulated`, and records `steering.governance_overridden` when `applyImmediately` skips the review. No approval gates a lowering (#3859) | 🟡 |
| Skills chip | `SK_CFG.ver` | The published config version | `get_skill_config` `current.version`, `skl_vN` (`packages/oxagen/src/skills.ts:83`) | ✅ |
| `skcfg` file and sources | `SK_CFG`, `skCfgFile()` | `.oxagen/skills.toml` | `get_skill_config` `config` (`skills.ts:14-50`): one source under `.oxagen/skills`, `search` with `mode = "on_demand"`, `cutoff`, `budget` and `limit`, `unbound_repo = "ask"`. The mockup's registry and marketplace sources, `top_k` and `min_score` are not in the schema | 🟡 |
| `srcreg` registration | `SOURCES.registration` | `.oxagen/sources.toml` | None | ❌ |
| Proposals tab count | `PROPOSALS`, `stgOpenCount()` | Open proposals and their pull requests | `list_proposals` (`context.proposal.list.ts:12`) | ✅ |
| Sources tab count | `steeringSources().length` | One read of every source kind | The kinds above, which ship in part (#3830) | 🟡 |
| Markdown import | `MD_IMPORT` (`FIXTURES.MD_IMPORT`: `root`, `usd_per_ktok`, `max_kb`, `files`, `skipped`) for the sample directory. A dropped or picked file is read in the browser | stella's parse, billed in usage credits. Records to one pull request per source file, memories to the memory index | None. The mockup parses in the page, charges nothing, and no contract takes an imported memory or saying | ❌ |

## Future-only fields

Every `data-future` mark on this view, with its reason as the mockup writes it:

| Mark | Reason | What a build shows today |
|---|---|---|
| The type strip beside the panel heading | `frame types` | Nothing. The strip does not render until frame types ship |
| The Emits column header and every Emits cell | `frame types` | The column renders "not recorded" in each cell, never an empty type list and never a guess from the kind |
| Every document row (Product vision, ADR), on All and on Documents | `vision and ADR sources` | No document row and no Documents chip |
| The TOML in `srcreg` | `.oxagen/sources.toml` | The Document card in `newsrc` and the Register a document dialog are not offered |

These fields are future-only in `macanderson/oxagen` and carry no mark in the mockup. A build treats them the same way: glossary rows, policy rows, toolbelt rows, a memory's force, scope and status, a record's `org` or `agent` scope, and the skill bundle the Skill card in `newsrc` describes. Each renders as not recorded, or is absent, until its contract ships.

## Functionality

- One read builds the list, and every number on the view reads it: the Sources tab count, the chip counts, the caption and the type strip. A chip filters that list and never holds a second one.
- A kind filter is a query value, `?kind=<kind>`, so the back button walks the filters and a filtered list has an address a person can send.
- The list shows sources only. A row never shows a SteeringFrame; the SteeringFrames a source emits are on its page with their hashes (D4).
- Reading a source is deterministic. Oxagen reads frames out of a source by its declared structure and never asks a model what a document means. The same source at the same version always emits the same frames.
- A source that emits nothing stays in the list with its reason: an archived record, a superseded ADR, an unapproved, out-of-scope or withheld skill, an expired mandate.
- Every source changes by a pull request against the main repository, or by its own governed write (a memory an agent appends, a mandate granted on Agent › Permissions). New source offers the four kinds a person writes here. Memory has no card: it becomes a Steering record only through a proposal. The Markdown import is the one exception to the pull request rule. Its records open pull requests like any other, and the memories it accepts are written when it publishes, at `may` or `info`, with no pull request.
- Changing the governance mode writes `.oxagen/rules/governance.toml` through `set_governance_mode`, never a settings row. The chip reads the file.
- The skills chip reads the published configuration. Changing it is a pull request through `update_skill_config`.
- Old addresses land here: `/steering/library` on All, each Library section on its kind, and every `/skills` address on `?kind=skill`.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, and More is the lit slot on every Steering view. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The top bar collapses to the menu button, the current crumb, search, notifications, the Approvals button and the avatar. The header's chips, Import Markdown and New source wrap under the subtext. The import wizard rises as a sheet like every dialog, and its tables become labelled cards. The four tabs are one strip that scrolls sideways, with the selected tab in view, and the page itself never scrolls sideways. The kind chips wrap. The table becomes a stack of cards, one per source: the kind label, title and id first, then each cell labelled with its column header. Every dialog rises from the bottom edge as a sheet. Touch targets are at least 44 px and inputs are 16 px.

## Permissions

- Read: the mockup's denied panel names `steering.read on core-platform`, the label the app uses for the Steering reads (`apps/app/src/data/read.ts:114`). In `macanderson/oxagen`, `list_records` and `list_proposals` allow an organization Owner or Admin and a workspace Owner, Member or Viewer; `get_skill_config` allows an organization Owner, Admin or Member and a workspace Owner or Member.
- Writes, each a governed action recorded in Audit:
  - Changing the governance mode: `set_governance_mode`, an organization Owner or Admin, or a workspace Owner or Admin. An agent that calls it waits for approval.
  - A Steering record: `propose_record` and `open_context_pr`, an organization Owner or Admin, or a workspace Owner or Member.
  - A skill: `propose_skill`, an organization Owner or Admin.
  - The skills configuration: `update_skill_config`, an organization Owner or Admin.
  - The Markdown import: its footer names `steering.write · memory.write`. The build checks both server-side before it writes. The mockup checks neither before the wizard opens and has no refused state.

## Backend gaps this page depends on

- One read of every source kind in one shape, with token cost and grant (#3830, after #3296).
- Frame types on every SteeringFrame, and the source's hash on every row (wedge spec, Shipped today).
- `.oxagen/sources.toml` and the vision and ADR source kinds. The file needs an ADR beside ADR-093 (wedge spec, Open decision 3).
- Glossary terms in `.oxagen/ontology/*.toml`, read by an adapter.
- A memory's force, scope, run and recall counter (#3904).
- Gate notices for the gates that reach a workspace (#3880).
- Named toolbelts and their assignments.
- Skill bundles: a manifest that declares references and entrypoints.
- `org` and `agent` sharing scopes for a Steering record.
- A lowering of the governance mode that waits for an org-owner approval and records a security event (#3859).
- The Markdown import: stella's parse and its usage-credit charge, a write path for an imported memory and for a saying added to an existing memory, and a permission check before the wizard opens.

## Rules every build of this page must keep

- A Steering Source and a SteeringFrame are never shown as each other. A Sources row links to the source, and the source's page lists the SteeringFrames it emits. A frame row elsewhere links to its source at the version it names.
- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- Every enforcement claim states the tier. "Enforced" only for calls routed through Oxagen. A policy source is a notice; the gate behind it is edited on Tools, and removing a notice never removes its gate.
- Headers are rollups of the rows beneath them: the Sources tab count, the chip counts, the caption and the type strip all read the one list.
- No person is scored or ranked.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. The caption under "All sources" is one sentence.
- Exactly one gold action per screen: New source here. The governance and skills chips and Import Markdown are never gold. Inside the import wizard, each step's own action is the gold.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- Nothing on this page writes a row. Every change ends on a pull request, or on a governed write the source's own page names. The Markdown import's memories are that governed write, and it never changes a Markdown file.
