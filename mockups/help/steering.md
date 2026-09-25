## Header

The Steering header names the workspace and holds the actions that change what can steer an agent there.

### Purpose
Steering answers one question for an operator: what do the agents in this workspace know, and what are they told. The page lists every source that can steer an agent here, and the frames each one emits. The header says which workspace you are in and offers the two workspace settings that govern every source (the governance mode and the skills configuration) and the two ways to add a source (Import Markdown and New source).

This one section answers the header on every Steering tab: Sources, Assignments, Compiler, Proposals and the Pull requests view. A source's own page has its own header (`steering-source/header`).

### Rationale
The header replaced the shelves of the old Steering hub. Records, Instructions, Skills, Memory and Ontology were five tabs that all answered "what is written down", so they became one Sources list with a kind filter (`docs/fleet-operations-wedge.md`, Cuts). The Skills console went the same way, and `.oxagen/skills.toml` became the setting the skills chip opens. Both chips are settings, so neither is gold. The page keeps one gold action: New source on four tabs, and Merge pull request on the Pull requests view, where New source turns plain.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow | `ws().name` from `WS` | The workspace record | shipped |
| Governance chip | `wsGov(w)`, `govLabel(w)` over `WS[].governance` | `.oxagen/rules/governance.toml`, read by `get_repository_tree` as `governanceMode` | shipped |
| Skills chip and its title | `SK_ON[w.slug]`, `SK_CFG.ver` | `get_skill_config` `current.version` (`skl_vN`) | shipped |
| Import Markdown | `wzOpen('import')` | stella's parse and the record and memory writes | future-only |
| New source | `newSourceBtn()` opening `newsrc` | The four authoring flows | partial |

### Logic
1. `pSteering()` reads the tab from `tab("steering","sources")`. The Pull requests view is `prs`, and it lights Proposals.
2. `govChip(w)` renders "Governance: <mode>" from `govLabel()`, the mode's name alone, and opens `govmode` with the workspace slug. The chip claims no review rule: no shipped gate runs a code-owner review, so a label such as "team (code-owner review)" would promise a check that never happens.
3. The skills chip renders only where `SK_ON` is true: Core platform has it, FinOps does not. Its title reads "How skills resolve in this workspace, settings version skl_v7", and it opens `skcfg`.
4. Import Markdown is plain on every tab and opens the Markdown import wizard (`dialog/wz-import`).
5. `newSourceBtn(t!=="prs")` makes New source gold everywhere except the Pull requests view.

### States
- Loading renders `skeleton()`. Error renders `errorState("Steering","503 record_index_unavailable")`. Denied names `steering.read on <workspace>`.
- Empty renders "Nothing steers this workspace yet" with a gold New source in place of the tab body.
- On a phone the chips, Import Markdown and New source wrap under the h1.

## Tabs

The four tabs split Steering by the question each one answers.

### Purpose
Sources says what exists. Assignments says which sources reach which agents. Compiler says what one agent would receive for one brief. Proposals says what is waiting to change, with its pull requests one view down.

### Rationale
The wedge folded seven hub tabs into four (`docs/fleet-operations-ia.md`, Steering). The Library shelves became kinds on Sources, Gates moved to Tools › Policy, Preview became the Compiler, and Deliveries became Assignments. Each tab is a path segment, so the back button walks the tabs and every tab has an address a person can send. A count sits on a tab only where it is a rollup of rows on that tab.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Sources count | `steeringSources(w.slug).length` | One read of every source kind (#3830) | partial |
| Proposals count | `PROPOSALS.length + stgOpenCount()` | `list_proposals` and the open pull requests | shipped |
| Sidebar Steering count | `stgNavCount()` | The same figure as the Proposals tab | shipped |

### Logic
1. `STG_TABS` fixes the order: Sources, Assignments, Compiler, Proposals. The tab list is labeled "Steering", and each tab carries `aria-selected`.
2. Sources counts the unfiltered list (186 in Core platform). Proposals counts the proposals plus the open pull requests (10 and 6, so 16). Assignments and Compiler carry no count.
3. `stgTab(t)` writes `stgHash(t)`: `/steering`, `/steering/assignments`, `/steering/compiler/<agent>` and `/steering/proposals`, with the Pull requests view at `/steering/proposals/prs`. Inside a scenario the address belongs to the scenario, so the tab re-renders in place.
4. Old addresses land where they went. `STG_OLD_TAB` and the route rewrite send `library`, `records`, `skills`, `memory`, `ontology` and `instructions` to Sources (a shelf to its `?kind=`), `preview` to Compiler, `deliveries` to Assignments, and `gates`, `policy`, `settings` and `freshness` to Tools › Policy. The mockup rewrites with `history.replaceState`. A build answers with a 308.
5. The mockup's sidebar reads 10 from `stgNavCount()`, the proposals plus the pull requests a person opened, while the Proposals tab reads 16. A build shows one number in both places.

### States
The tabs render in every state the page has. On a phone they are one strip that scrolls sideways with the selected tab in view, and the page itself does not scroll sideways.

## Kind filter

The chip group narrows the source list to one kind of source.

### Purpose
It answers "show me only the skills" or "only the memories" without leaving the one list. A person reaches for it to review one kind, or to find a source whose kind they know.

### Rationale
The chips replace the five Library shelves (`docs/fleet-operations-wedge.md`, Cuts). A chip filters the one list and never loads a second one, so the tab count, the chip counts, the caption and the type strip all read the same rows. The filter is a query value, `?kind=<kind>`, so the back button walks the filters and a filtered list has an address a person can send.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Chips and counts | `SRC_FILTERS`, and a count per `o.g` over `steeringSources()` | One read of every source kind (#3830) | partial |
| Documents chip | `SOURCES.documents` | `.oxagen/sources.toml` | future-only |

### Logic
1. `SRC_FILTERS` fixes the order: All, Steering records, Documents, Skills, Agent definitions, Instructions, Glossary, Memory, Policy, Mandates, Toolbelts. The vision and the ADRs share the Documents chip (`g:"doc"`).
2. A chip renders only for a kind the workspace holds, and All always renders. Each chip carries its count in a dim span and `aria-pressed`.
3. Core platform shows All 186, Steering records 78, Documents 5, Skills 10, Agent definitions 68, Glossary 4, Memory 7, Policy 6 and Toolbelts 8. FinOps shows All 34, Agent definitions 21, Instructions 1, Glossary 1, Policy 3, Mandates 4 and Toolbelts 4.
4. `srcKindPick(k)` sets `S.srcKind` and calls `stgTab("sources")`, which writes `?kind=<kind>`. All clears the value.
5. A kind in the address that the workspace does not hold heads the panel with that kind's label, reads "0 sources." and "No rows match.", and presses no chip.

### States
FinOps runs with skills off, so it has no Skills chip, and `?kind=skill` renders the empty panel. The chips wrap on a phone. A build shows no Documents chip until the vision and ADR source kinds ship.

## Source list

One row per Steering Source in the workspace, with what it emits, its scope and version, and how many agents its scope reaches.

### Purpose
An operator uses the list to find a source, see whether it steers anything at this version, and see where it is managed. A row opens the source.

### Rationale
A Steering Source and a SteeringFrame are two objects (D4). The list holds sources only. A SteeringFrame is what the assembler resolves from a source for one run, and it appears on the source's page, in the Compiler, on an agent's Steering tab and in a run's Decision trace. Every kind lives in this one list: a skill (D12), a memory and a glossary term (D13), a mandate (D11), a policy notice and a toolbelt. Oxagen reads frames out of a source by its declared structure and never asks a model what a document means, so the same source at the same version always emits the same frames. A source that emits nothing stays in the list with its reason. The panel's heading follows the kind filter, so the panel carries the fixed key `source-list`.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Steering record rows | `RECORDS`, `STEER_BUNDLE.rules` | `.oxagen/rules/*.toml` via `list_records` | shipped |
| Document rows | `SOURCES.documents` | `.oxagen/sources.toml` | future-only |
| Skill rows | `SKILLS`, `SOURCES.bundles`, `SOURCES.withheld` | `get_skill_config`, `preview_skill_search` | partial |
| Agent definition rows | `AGENTS`, `defSlug()` | `list_agent_defs` | shipped |
| Workspace instructions | `STEERING_PREVIEW.instructions` | `get_prompt_settings` | partial |
| Glossary rows | `ONTOLOGY` | `.oxagen/ontology/*.toml` | future-only |
| Memory rows | `MEMORY` | `list_memories` (no force, scope or hash, #3904) | partial |
| Policy rows | `GATES`, `gateHome()` | A gate notice per gate (#3880) | future-only |
| Mandate rows | `MANDATES` | `list_mandates` | shipped |
| Toolbelt rows | `TOOLBELTS`, `TOOLBELT_ASSIGN` | Named toolbelts | future-only |
| Emits and type strip | derived in `steeringSources()` | Frame types on each SteeringFrame | future-only |
| Agents | `reachOf()` over `wsAgentsOf()` | The scope against `list_agents` | partial |

### Logic
1. `steeringSources(wslug)` builds every row in one shape. Records come first in Core platform, newest publication first, then bundle rules no record holds, versioned "bundle v41".
2. Emits follows the Emissions table. A record emits by `REC_TYPE`, and one at force `info` emits `context`. An archived record, a superseded ADR, an unapproved, out-of-scope or withheld skill, and an expired mandate emit nothing and show the reason under "nothing". A toolbelt emits one `capability` per tool, less the harness's own tools (`HARNESS_TOOL_RE`).
3. Agents counts the agents in the workspace each source can reach by its scope. `reachOf(o)` reads the scope alone: named agents, one agent, the agents whose repository matches, or every agent. What one brief selects is the Compiler's answer. A row that emits nothing reads a dim 0.
4. Managed in reads "Steering" with no link, or links out. `gateHome()` sends a policy row to Tools › Kill switches, the record whose grant compiled it, the agent's Permissions for a mandate, Agents, or Tools › Policy.
5. `srcStatus()` colors the status by `SRC_ST` and adds "pull request open" while a change is open.
6. The caption reads "<n> sources, <m> emitting nothing." in one sentence. The type strip sums the Emits of the listed rows.

### States
- A filter that matches no row reads "No rows match.". On a phone the table becomes one card per source.
- With `?future=1` the Emits column, the type strip and every document row are outlined. A build renders Emits as "not recorded" and shows no document row until those contracts ship.

## Governance mode {#dialog/govmode}

The dialog picks a governance mode and previews the `.oxagen/rules/governance.toml` a pull request would write.

### Purpose
It changes who may merge a change to Steering in this workspace. A person opens it from the governance chip, compares the three modes, and opens the pull request.

### Rationale
The mode is a file on the main repository, not a settings row, so changing it is a pull request like every other source. Oxagen reads the file on the production branch when a pull request is opened and again when it is merged. Raising the mode therefore takes effect on everything already in flight. Lowering it is an organization-owner action with approval, recorded as a security event. Oxagen writes this file in two places: the Repository wizard creates it, and this dialog changes it.

The three modes, as the merge gate enforces them (`packages/handlers/src/context.steering.policy.ts`, and the shipped app's own pull request panel says the same):

| Mode | Who merges | Suits |
|---|---|---|
| `solo` | Any workspace member, the author included | One person, or a repository nobody else reviews |
| `team` | An org Owner or Admin, or a workspace Owner, other than the author | What a missing file means, and what most repositories want |
| `regulated` | An org Owner or Admin other than the author, recorded as the accountable approver | Separation of duties: the author of a record is never its approver |

Every merge, in every mode, appends the promotion event to the hash-chained ledger. No mode runs a code-owner review. The card text says only what the gate enforces, so it names who merges and nothing more. The shipped governance dialog in `apps/app/messages/steering.json` still says "A code-owner review is required." for `team`, which the gate does not check; A build states the gate.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Mode in force | `wsGov(w)` over `WS[].governance` | `get_repository_tree` `governanceMode` | shipped |
| The three cards | `WZ_MODES` (shared with the Repository wizard) | The governance schema | shipped |
| The file preview | `oxGovernanceToml(mode)` | `draftGovernanceToml` | shipped |
| The change | `govSet()` | `set_governance_mode` | partial |
| Approval for a lowering | none | An org-owner approval and a security event (#3859) | future-only |

### Logic
1. `govChip(w)` opens `govmode` with the workspace slug. `DLG_EXT.govmode` finds the workspace with `wsBySlug(S.dlgArg)`.
2. `S.govPick` holds the pick, and the mode in force carries "· now". Each card shows the gate line from `WZ_MODES`: "Any workspace member merges, the author included.", "An org Owner or Admin, or a workspace Owner, other than the author merges." and "An org Owner or Admin other than the author merges, recorded as the accountable approver."
3. The preview is `oxGovernanceToml(pick)`: two comment lines, `mode`, and `separation_of_duties = true` for `regulated` only.
4. Open the pull request calls `govSet()`. Picking the mode in force reports "Governance mode is already team. Nothing to change." Otherwise it reports "Pull request opened on a-intel/platform: .oxagen/rules/governance.toml sets mode = <mode>."
5. The mockup sets the chip at once. A build reads the chip off the file, so the chip changes when the pull request merges. Under `solo`, `set_governance_mode` commits straight to the production branch.

### States
Opened without a workspace, it renders an empty dialog titled "Governance mode". On a phone it is a bottom sheet. The build gates the change on an organization Owner or Admin or a workspace Owner or Admin, and an agent that calls it waits for approval.

## Skills settings {#dialog/skcfg}

The dialog shows `.oxagen/skills.toml` at the version in force and what each skill source contributes.

### Purpose
It answers "how do skills resolve in this workspace": which repositories and registries are sources, how search is capped, and what happens in a repository with no configuration. It changes nothing.

### Rationale
The Skills console was cut, and `.oxagen/skills.toml` became a setting on Sources (`docs/fleet-operations-wedge.md`, Cuts). Changing the file is a pull request through `update_skill_config`, so the dialog has no save button, only Close. Skill reflection was cut too (ADR-090 decision 7 kept it research-only), so the comment on `use = "research"` reads "the only accepted value" and points at no tab.

Each source row carries a short note. The main repository versions the skills with the code they are about. A linked repository's skills resolve because Core platform links it. `a-intel/mobile` is linked, but no skill is drawn from it, so nothing in it reaches an agent. The organization registry publishes across the organization, and each skill's own scope still decides which workspaces see it. The marketplace is third-party, and `market = "hold"` holds every version until a person approves its digest.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Title, version, merge | `SK_CFG.file`, `ver`, `pr`, `by`, `when` | `get_skill_config` `current` | shipped |
| The file | `skCfgFile()` over `SK_CFG.search`, `SK_CFG.reflect` | `get_skill_config` `config` | partial |
| Sources and counts | `SK_CFG.sources` (`sk-cfg.json`) | The resolution at a config version | partial |

### Logic
1. The skills chip opens `DLG_EXT.skcfg`. The subtitle reads "Version skl_v7, merged as a-intel/platform#523 by Marcus Bell on 2026-09-10 11:42:07Z".
2. `skCfgFile()` renders the header "`<file>` skl_v7 · merged <time>" and the TOML with `enabled`, `[sources]`, `[search]`, `[unbound_repo]` (`policy = "ask"`) and `[reflection]`. The same renderer shows the file in the dialog that turns skills on.
3. The Sources list renders one row per `SK_CFG.sources` entry: an icon, the label, the note, and a badge with the skill count, or "not a source" on a held row.
4. The schema in `macanderson/oxagen` has one source under `.oxagen/skills`, and no registry, marketplace, `top_k` or `min_score`. A build renders what the schema holds.

### States
The dialog opens only where skills are on. FinOps has no chip. On a phone it is a bottom sheet.

## New source {#dialog/newsrc}

The chooser lists the four source kinds a person writes on Steering and opens the flow for each.

### Purpose
A person who wants to add something that steers agents picks the kind here: a Steering record, a document, a skill or a glossary term.

### Rationale
Every source changes by a pull request against the main repository, and the subtitle says so. A Steering record publishes when its pull request merges. A skill is a folder of instructions, references and optional entrypoints, and Oxagen describes an entrypoint to the agent as a capability and never runs it (D12, ADR-043).

The other kinds have no card, because they change somewhere else. An agent appends memory, and Import Markdown writes it from a file. A memory becomes a Steering record only through a proposal (D13). Policy is managed on Tools › Policy and the kill switches, a mandate on the agent's Permissions tab (D11), and a toolbelt on Tools › Toolbelts.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Subtitle's repository | `ws().main` | The workspace's main repository | shipped |
| Steering record card | `wzOpen('record')` | `propose_record`, `open_context_pr` | shipped |
| Document card | `openDialog('srcreg')` | `.oxagen/sources.toml` | future-only |
| Skill card | `wzOpen('skill')` | `propose_skill` | partial |
| Glossary term card | `openDialog('ontnew')` | `.oxagen/ontology/*.toml` | future-only |

### Logic
1. New source opens `DLG_EXT.newsrc` from the header on every tab.
2. Four cards in one column, each with its action word: Write one, Register one, Add one and Define one.
3. Write one and Add one close the chooser and open the record or skill wizard. Register one and Define one replace the chooser with `srcreg` or `ontnew`.
4. The footer holds Cancel only. Each flow ends on its own pull request.

### States
A build does not offer the Document card until `.oxagen/sources.toml` ships. In a workspace with skills off, the Skill card still opens the wizard, which warns that no agent resolves a skill there. On a phone the chooser is a bottom sheet.

## Register a document {#dialog/srcreg}

The dialog previews the `.oxagen/sources.toml` entry that makes a document a Steering Source, and opens its pull request.

### Purpose
It turns an ADR or the product vision into a source, and says which of its sections emit which frame types.

### Rationale
A document emits frames only from the sections this file names. Oxagen reads the declared structure and never asks a model what a document means, so the same document at the same version emits the same frames (`docs/fleet-operations-wedge.md`, Reading a source). An invariant comes only from a section the ADR declares as its invariants, and a superseded ADR emits nothing. The registration emits nothing until its pull request merges. The file is new to the workspace layout and needs an ADR beside ADR-093 (Open decision 3).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Subtitle and last change | `SOURCES.registration` (`path`, `repo`, `pr`, `merged`) | `.oxagen/sources.toml` history | future-only |
| The registration | A fixed TOML string in `DLG_EXT.srcreg` | `.oxagen/sources.toml` | future-only |

### Logic
1. Register one on the Document card opens `DLG_EXT.srcreg`.
2. The body shows one `[[source]]` for ADR-034 with two `[[source.section]]` tables: Decision emits `procedure` at `should`, and Invariants emits `invariant` with `enforced_by = "gate.never-merge"`. The block carries the future-only mark `.oxagen/sources.toml`.
3. The note reads "Last changed by a-intel/platform#431, merged 2026-09-02."
4. Open the pull request reports "Pull request opened on a-intel/platform to register ADR-034." The mockup changes no fixture.
5. The mockup has no fields. A build lets the author choose the document and map its sections.

### States
Future-only as a whole. A build does not offer it until the file and the document source kinds ship. On a phone it is a bottom sheet.

## Define a glossary term {#dialog/ontnew}

The form writes one glossary term as `.oxagen/ontology/<term>.toml` and opens its pull request.

### Purpose
It records a word the way this workspace uses it ("release train", "surface"), so every agent in scope reads the same meaning.

### Rationale
A glossary term is a source kind that emits one `context` frame at `info` (D13). It was an ontology note, and the Ontology tab was cut. A term informs the model and grants nothing. The term steers nothing until its pull request merges.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The term | `ontRead("on")` into `ONTOLOGY` | `.oxagen/ontology/<term>.toml` | future-only |
| Pull request | `ontPr()` into `OXPRS` | A pull request on the main repository | future-only |
| Checks | `ontChecks()` | The ontology note checks | future-only |

### Logic
1. `ontForm(null,"on")` renders Term, Kind (term, entity, alias or boundary, with a hint on each), Definition with the wand, and About (repositories, branches or services, comma separated).
2. The wand calls `ontWand()`, which rewrites the draft with `assistProse("ontology")` and reports what it did. With no draft it asks for the definition first.
3. Open the pull request calls `ontCreate()`. It refuses an empty term, an empty definition, and a term the workspace already defines.
4. It creates `ont.<slug>` at force `info`, with `token_cost` from `ontCost()` (characters over 4), a hash from `ontHash()`, and `valid_from` "pending the merge". `ontPr()` opens the pull request with the checks `schema`, `lineage_uniqueness`, `secret_pii_scan` and `grant_scan`, and it appears on Repositories › Changes.
5. The toast reads "Opened <pull request> for <term>." The Sources row reads "pending merge".

### States
The mockup's Sources row for a pending term still counts a `context` emission, and the assembler can select it. A build emits nothing for a term until its pull request merges. On a phone the form is a bottom sheet with 16 px inputs.

## Delivery report {#dialog/deliveryreport}

The report lists every agent a fleet steer addressed and how far the steer got on each one.

### Purpose
It answers "did the agents see it" for a steer sent to many agents at once. The dialog opens from the fleet steer on Agents: `openSteerFleet()` opens Steer the fleet, and sending it calls `steerSend(true)`, which writes the report and opens it. Its help lives in this file because a steer is steering input: an `invocation` frame at the model request.

### Rationale
Every status change is a frame on the recipient's run. `applied` is the only success: the model request carrying the steer was made, and the row names that frame. `expired`, `canceled` and `failed` count as undelivered. A broadcast declares a ceiling, and each recipient resolves the strongest boundary it can carry (`docs/mission-control-spec.md` §7.6). Oxagen writes the report the moment a steer is sent, with a row for every agent it addressed, and queued rows update as each boundary is reached.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The send | `S.steerReport` (`at`, `text`, `mode`, `dig`, `tokens`, `to`) | `dispatch_command` `steer` | shipped |
| A run's status | its `control.steer` frame via `runFrames()` | The command statuses | shipped |
| Refusals | `SWITCHES`, `STEER_MUTES`, `AGENTS[].enrolled`, the run's tier | Kill switches, mutes, enrollment | partial |

### Logic
1. `steerSend(true)` walks the picked agents. An armed kill switch or a mute cancels the steer before it queues. An agent that is not enrolled, or a run at `observe`, fails. A run in flight gets a `control.steer` frame. A fleet steer lands at the boundary on every run: a requested interrupt is recorded as not available on the run's tier. An agent with no run in flight queues for its next run.
2. `steerRows()` reads each row live. A run's row follows its frame to applied or expired. An idle agent's row expires after `STEER_TTL`, 10 minutes.
3. The title counts applied, queued and undelivered. The subtitle names the recipients, the send time and the mode. Three tiles repeat the counts, then the text as sent with its digest and tokens.
4. The table: Agent and run, Status, Mode used, Time and Why. An applied row offers Open frame <seq>.
5. `steerApply()` repaints the report while it is open.

### States
- With no fleet steer this session it reads "No fleet steer has been sent in this session." with Close and a gold Steer the fleet.
- The footer line counts tokens injected across runs, or reads "Nothing injected yet.". On a phone the table becomes cards.

## Markdown import wizard {#dialog/wz-import}

The three-step wizard that reads CLAUDE.md, AGENTS.md and any other Markdown file into Steering records and memories.

### Purpose
A repository often says how agents should work there before Oxagen arrives, in files nobody wants to retype. The operator drops a directory or picks files, reviews each line stella reads as a candidate, and publishes what they accepted. Records leave as pull requests. Memories are written when the import publishes.

### Rationale
The import is the one exception to the rule that every source changes by a pull request (`docs/creation-spec.md` §1). A memory is recalled material that steers at `may` or `info` at most, so writing it at once cannot bind an agent. A memory becomes a record only through a proposal that runs earn (D13). An imported line that joins a memory adds a saying, and a saying from a file never counts as a run, so an import alone never raises a proposal. Records take the same road as a record written by hand: each pull request runs the same six checks, and a record steers nothing until its pull request merges. One pull request per source file lets a reviewer read one file's rules together. Every inference keeps the file, the line and the word that decided its kind, so a person can check it against the source. The Markdown files are never changed.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Sample directory | `MD_IMPORT` (`FIXTURES.MD_IMPORT`: `root`, `usd_per_ktok`, `max_kb`, `files`, `skipped`) | A directory the browser reads | future-only |
| Dropped or picked files | `impDrop()`, `impPick()`, `impTake()` | Read in the browser | future-only |
| Candidates and their kinds | `impParse()`, `impParseFile()`, `impInfer()`, `IMP_RULES` | stella's parse, billed in usage credits | future-only |
| Duplicates and folds | `impJac()` over `RECORDS` and `stgMemory()` | `list_records` and the memory index | future-only |
| Record pull requests | `wzImpPublish()` into `RECPRS` with `src` and `records` | One pull request per source file | future-only |
| Memories and sayings | `wzImpPublish()` into `MEMORY` | The memory index | future-only |
| Audit event | `auditEvent("steering_imported", …)` | Audit | future-only |

`open_context_pr` opens a pull request for one record file only (`steering-prs.md`), and no contract takes an imported memory or saying.

### Logic
`wzOpen('import')` opens it from Import Markdown on every Steering tab and from ⌘K Create. `wzSteps()` returns Files, Review and Publish. The footer names `CREATE.import.need`, "needs steering.write · memory.write on <workspace>".

1. **Files.** A skipped directory (`node_modules`, `vendor`, `.git`, `dist`, `build`) is named once and never opened. A file that is not `.md` or `.markdown`, or is over 200 KB, is skipped with its reason. Tokens are characters divided by 3.6. `impCost()` charges $0.012 per thousand tokens, rounded up to the cent, at least $0.01. The cost note states the file count, the tokens and the cost before stella reads anything. stella reads nothing until the operator chooses Parse with stella, which stays disabled while no file is included or one is still being read.
2. **Review.** `impParseFile()` skips fenced code, makes one candidate per bullet, one procedure per numbered list and one per paragraph that carries an instruction word. `impInfer()` takes the first `IMP_RULES` match: "never", "do not" or "must not" is a constraint that forbids, "must" one that requires, "always" a rule at `must`, "should" a rule at `should`, "prefer" a preference, "remember" or "incident" a memory. A bullet with no such word is a rule at `should` when it opens on an instruction verb, else a fact. A line with 50% word overlap with a published record, or 60% with an earlier line, starts rejected. A line with 50% overlap with a memory joins it. A memory caps at `may`. An undecided line is left out. Review what publishes needs one accepted line.
3. **Publish.** `impLineages()` gives each record `ctx.<workspace>.<first four words>`, with `-2`, `-3` where the lineage is taken. `wzImpPublish()` opens every pull request at once, starts its checks with `recprRun()`, writes new memories as `mem.import.<words>` and adds sayings, then records `steering_imported`. The gold toast counts what happened. With a pull request it lands on the Pull requests view with the first selected, and with none on Sources at `?kind=memory`.

### States
With no file, step 1 shows the drop zone and the note on what the import skips. A parse with no candidate shows 0 on every tile. The wizard has no refused state: `wzOpen()` checks no permission. A build checks both permissions server-side before it writes. On a phone the tables become labeled cards and row buttons are at least 44 px.

## Steering record wizard {#dialog/wz-record}

The five-step wizard that turns one sentence into a Steering record and opens its pull request.

### Purpose
An operator who wants every agent in scope to follow, know or avoid one thing writes it here. The wizard asks for the concern, the kind, the statement with its force, scope and effect, shows the checks, and opens the pull request. The record exists when someone merges it.

### Rationale
A record steers and never grants. No sentence an operator writes makes a denied call allowed, which is why the only constraint effects are `require` and `forbid` and there is no third value. The kind decides how the statement is delivered and what the checks assert, so the wizard asks for it before the statement. The description should say the thing itself: a reason belongs in the pull request's rationale, where a reviewer reads it once, while text in the bundle is paid for by every agent on every turn. The fifth check earns the others. Two people can each write a sensible record, six weeks apart, that together say a call must happen and must not, and the pull request is the one place that is caught before either reaches a run. People trust pull requests, so the record is in force from the merge commit and not from when it was written.

What each kind can never do, and how it reaches a run (`KIND_USE`):

| Kind | Reaches a run | Never |
|---|---|---|
| rule | Compiled into the bundle's steering block. `must` and `should` sit in the stable prefix every turn, and `may` and `info` are selected by relevance | Grants no permission and allows no blocked call |
| constraint | Compiled into the stable prefix at its force, and checked against every published record on the same subject | Narrows what is allowed and never widens it. A `require` does not create the permission it requires |
| procedure | Compiled like a rule, as an ordered list a model cannot silently reorder | A step grants nothing. Naming a governed action in step 4 puts nothing on a toolbelt |
| fact | A `fact` context frame with provenance to the record and its commit, `valid_from` at the merge time | Steers nothing by itself. A rule that cites it changes behavior |
| memory | A `memory` context frame, selected by relevance, never pinned into the prefix | Forbids and proves nothing on its own. It can explain why a retry is not a regression |
| preference | At `may` or `info`, selected by relevance, dropped first when the window is tight | Blocks no call. A run that ignored it has not failed |

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The draft | `S.wz` from `wzNew('record')` | Session state until the pull request | shipped |
| Kinds and their copy | `KINDS`, `KIND_USE` | The record schema's six kinds | shipped |
| Lineage | `wzRecLineage()` | `lineage_id` in `.oxagen/rules/<lineage>.toml` | shipped |
| Scope `agent` | `wzRecord()` step 3 | `sharing_scope` | future-only |
| Token estimate | `wzRecTok()`, characters divided by 3.3 | The adapter's token cost | partial |
| Six checks | `recprChecks()` | The checks `open_context_pr` runs | shipped |
| Pull request | `wzRecOpenPr()` into `RECPRS` | `propose_record`, then `open_context_pr` | shipped |

### Logic
`wzOpen('record')` opens it from New source › Write one and ⌘K Create. A memory's Propose as a Steering record calls `memPromote()`, which seeds the description with the memory's body. `wzSteps()` returns Describe, Kind, Statement, Checks and Pull request. The footer names "needs steering.write on <workspace>".

1. **Describe.** Four chips fill the description. The step advances once the assistant's wand has rewritten it (`wzDescOk()`).
2. **Kind.** Six cards, each with its description and what it is for. Write the statement waits for a pick.
3. **Statement.** The editor over `wzRecStatement()`. Force is filtered by kind: a preference offers `may` and `info`, a fact or memory `info`, the rest all four. Scope is workspace, repository or agent, with a hint naming where it opens. A rule or constraint offers the effect. A preview card shows the record, and a note prices the bundle bump in tokens. A request already recorded keeps the bundle version it was sent with, so a merge never changes what an old run carried.
4. **Checks.** The six, worded for this record. Lineage uniqueness turns red when a published record holds the lineage.
5. **Pull request.** One file, `.oxagen/rules/<lineage>.toml`. `wzRecOpenPr()` numbers the pull request with `prNextNumber()`, starts the checks and lands on the Pull requests view with it selected. The toast names the branch, the number and the six queued checks.

### States
The wand note in `wzDesc`, "Press the wand to have oxagen.assistant write the file’s prose. The next step opens when it has.", shows on step 1 while the text is typed and the wand has not run. The agent, tool and skill wizards share it.

The drafting turn that the wand and the drafting card (`wzDraftNote()`, "Drafted by oxagen.assistant from what you wrote.") stand for is recorded with frames and a receipt and billed to Oxagen. It is not one of your runs, so it appears in neither Work nor Spend. Every line it drafts is yours to change before anybody reviews it. The assistant rewrites what you give it and does not decide what you are building, which is why the wand refuses an empty box ("Write a line or two first.") and its toast says only what it wrote. This paragraph answers for every wizard that uses the two helpers. The wizard has no refused state. On a phone the kind cards stack in one column.

## Skill wizard {#dialog/wz-skill}

The four-step wizard that adds a skill from the registry, from a description or from a bundle, and ends on a pull request.

### Purpose
An operator who wants agents to know how to do something pins a published skill, describes one, or uploads a bundle built elsewhere. The wizard shows the file and its load cost, then opens the pull request. A skill an agent can find is a skill somebody merged.

### Rationale
A skill is a file with a version and a digest (D12, ADR-090). All three ways in end on a pull request against the main repository, because no editor here writes to a database. Pinning takes a version and its digest, never "latest": a publisher's new version is a digest diff a person approves, which is what `market = "hold"` means. Replacing a pinned version bumps it to the bundle's, and the old version stays readable, because every run that loaded it named its digest. The checks recompute the digest over the canonical bytes, and a digest that disagrees with the bundle fails the check. A skill is procedure and not policy. Writing "you may merge" into it grants nothing: the toolbelt decides. A skill has no code to run and no credential to hold. Every token in the file is paid for on every turn it is loaded into, by every agent that loads it, which is why the review step prices it and why a searchable toolbelt beats a pinned one. Skills ship off, and this ends in a pull request rather than a save.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Registry rows | `SKILL_REGISTRY` via `skrMatch()` | The org registry and the marketplace | future-only |
| Upload | `wzSkFile()`, `wzSkBundle()` | Files read in the browser | partial |
| The file | `wzSkillBody()`, `skrBody()`, the editor | `.oxagen/skills/<name>/SKILL.md` | shipped |
| Load cost | `wzSkTokens()`, characters divided by 3.6 | `propose_skill` estimate | shipped |
| Six checks | `wzPrStep()` rows | `propose_skill` checks | shipped |
| Pull request | `wzOpenPr()` | `propose_skill` on `skills/<name>` | partial |

`propose_skill` accepts up to 16 files beside `SKILL.md` with no declared parts, and the registry and marketplace are not sources in the config schema (`steering-source-skill.md`).

### Logic
`wzOpen('skill')` opens it from New source › Add one. `wzSteps()` returns Source, then Find it, Upload or Describe it, then Review and Pull request. The footer names "needs skills.admin on <workspace>". In a workspace with skills off, step 1 warns that no agent resolves a skill until `skills.enabled` is true, which is its own pull request.

1. **Source.** Three options. Next waits for one.
2. **Find it.** `skrMatch()` scores the query against each skill's match words and statement. A row shows publisher, verification, kind, tokens, digest, installs, cited rate and the version pinned here. An unverified row is held. Pin selects one version, and Read the file waits for it. **Upload.** Replaces picks a pinned skill. A `.skill`, `.zip` or `SKILL.md` is read in the browser and never uploaded until the pull request carries it. The sample bundle bumps 2.1.0 to 2.2.0 and shows its digest. **Describe it.** Four chips and the wand, as in the record wizard.
3. **Review.** The frontmatter's name and version as chips, the tokens to load and the dollars a turn at $0.000003 a token, and the editor.
4. **Pull request.** The files: `SKILL.md` added or modified, a bundle's extra files, and `.oxagen/skills.toml` for a pin. Six checks. On merge, a replacement repins every agent that resolves the skill at its next run, a run in flight keeps the old version, and the digest is taken at merge.

### States
The toast names `<main>#525`. The mockup keeps no record of this pull request, so it does not appear on Repositories › Changes. A build lists it there with kind `skill`. The wand note and the drafting card come from `wzDesc()` and `wzDraftNote()`. What they stand for is in the Steering record wizard section.

## Repository wizard {#dialog/wz-init}

The five-step wizard that adds the `.oxagen/` tree to a repository that has none.

### Purpose
Every other wizard writes into `.oxagen/`, so a repository needs the tree first. The operator picks the repository and its role, the production branch and the governance mode, reads the permissions and the drafted files, and opens the pull request that adds them.

### Rationale
Oxagen governs the files in a repository and keeps no copy of them, so its first act there is a branch and a pull request someone reviews. Until that merges, the repository is ungoverned, nothing in it is in force, and a reviewer can stop it. A workspace has exactly one main repository. Moving it needs an organization owner and an approval, and Audit records it as a security event. A linked repository holds records that steer only its own runs and none scoped to the workspace. Only the production branch's commits update the code graph, and records publish only to it. When GitHub's default branch changes, Oxagen records it and asks before the production branch moves. The governance mode is read off `governance.toml` when a pull request opens and again when it merges, so raising it applies to every open pull request, and nothing else in Oxagen writes that file. After this, either setting changes by a pull request. `solo` suits one person or a repository nobody else reviews. `team` is what a missing file means and what most repositories want. `regulated` adds separation of duties: a record's author is never its approver.

What Oxagen still cannot do in the repository:

- Push to the production branch. Every write goes to a branch, and the production branch moves only by a merge a person performed.
- Merge on its own. Merging gates on a role only a signed-in person holds, under the mode the repository declares.
- Read a secret. The scan refuses a pull request that carries one. Nothing in `.oxagen/` holds a credential, and a provider's credential stays in the vault.
- Grant authority. Nothing in the tree grants a tool, raises a tier or lifts a budget. A record steers. A toolbelt grants.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Candidate repositories | `wzInitCandidates()` over `REPOS` | The installation's repositories | shipped |
| Role and branch | `S.wz.role`, `S.wz.branch` | `bind_main_repository` or `link_repository`, then `set_production_branch` | shipped |
| Governance mode | `WZ_MODES`, `oxGovernanceToml()` | `.oxagen/rules/governance.toml` | shipped |
| Drafted files | `oxWorkspaceToml()`, `wzInitFiles()` | `open_init_pr` | shipped |
| Five checks | `wzPrStep()` rows | `open_init_pr` refusals | shipped |

The mode cards state the shipped merge gate, the same lines as the Governance mode dialog (`dialog/govmode`), where the three modes are documented.

### Logic
`wzOpen('init', repo)` opens it from a repository's Add .oxagen/ on Repositories. `wzSteps()` returns Repository, Branch & governance, Permissions, Review and Pull request. The footer names "needs repository.admin on <workspace>".

1. **Repository.** The select lists only repositories with no `.oxagen/`. Make it the main repository is disabled for the current main. The note names today's main.
2. **Branch & governance.** GitHub's default first, then three mode cards with `team` preset, each saying who merges under it.
3. **Permissions.** Contents and Pull requests read and write, Checks write, Metadata and Issues read, each with its purpose.
4. **Review.** Both TOML files in full.
5. **Pull request.** Six files on `oxagen/init` against the repository itself, and five checks: schema, layout, governance, secret scan and no authority. A file that parses but names no mode would block every later pull request, so the check refuses it.

### States
The toast reads "Opened <repository>#118 · Add .oxagen/". The mockup keeps no record of it, and the repository row does not change. Steps 3 and 4 carry no drafting note, because nothing there is drafted from the operator's words.
