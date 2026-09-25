# Steering

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering[/library]` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 1, 3, 4, 5, 6, 7, 8, 9, and 13 (Phase 2)); §14 Mission Control; Appendix F page 8 (Steering); `steering.md` is the hub every Steering tab belongs to |
| Design | `mockups/src/engine.js` → `pSteering()`, with `stgHub()`, `stgLibCounts()`, `stgLib()`, `stgLibraryAll()`, `stgLibraryItems()`, `stgItems()`, `govChip()`, `DLG_EXT.govmode`, and the Markdown import (`wzImport()`, `wzImpPublish()`, and the `imp` helpers inside `DLG_EXT.wz`), built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering.audit-prompt.md` |

## Job

Steering is the library: the reusable things that influence how an agent behaves in a workspace, and the record of which agent receives which of them. It is not a second agent registry. An agent appears here only as a receiver.

This page specifies the hub, the governance mode chip and its dialog, the five tabs, the Library shelf row, the Library's own All shelf, and the Markdown import. The shelves and the other tabs have their own specs: `steering-records.md`, `skills.md` (with `skills-off.md` and `skill-source.md`), `steering-memory.md`, `steering-ontology.md`, `steering-assignments.md`, `steering-gates.md`, `steering-proposals.md`, and `steering-compiler.md`.

The page depicts every phase of the steering and gateway plan (0 to 5) as shipped. Records, skills, memory, ontology notes, gate notices, and workspace instructions all compete in one assembler, `assembleSteering(run, budget)`, and every run carries a `steering.manifest` frame. The index is the Postgres registry, not the graph. No screen claims an enforced budget or a real interrupt.

## What is on the page

**Hub header.** Eyebrow: the workspace name (“Core platform”), h1 “Steering”, subtext “Everything that can steer an agent in this workspace competes in one assembler.” Actions, left to right: the governance chip **Governance: team** (`govChip`, the mode in mono), **Import Markdown** (plain; opens the Markdown import below), and **Write a context record** (opens the record wizard: describe, kind, statement, checks, pull request), which is gold where the tab does not hold its own primary action. A tab that holds its own primary action takes the gold from the header. The chip stays on every tab and in the empty state, where it is the header's only action.

**Governance mode dialog** (`govmode`, opened by the chip). Title “Governance mode · <workspace name>”, subtitle “.oxagen/rules/governance.toml on <main repo>”. Three cards in one column, `solo` (“The author may merge their own.”), `team` (“A code-owner review is required.”), `regulated` (“A named approver from a role must approve, and the promotion ledger is hash-chained.”), each with its hint line, the current mode marked “· now”, the picked card highlighted. Under the cards, the `governance.toml` the pick would write (`oxGovernanceToml`: `mode = "<mode>"`, `separation_of_duties = true` only for `regulated`). A note: the mode is read off the file when a pull request is opened and again when it is merged, so raising it takes effect on everything already in flight; lowering it is an org-owner action with approval, recorded as a security event. Footer **Cancel** · **Open the Context PR** (gold). Confirming sets the workspace mode and reports “Context PR opened on <main repo>: .oxagen/rules/governance.toml sets mode = <mode>. It takes effect on merge for everything already in flight; nothing else in Oxagen writes that file.”; picking the current mode reports that nothing changed. The Edit workspace dialog (`editws`) carries the same value as a select, `wsGov`.

### The five tabs

**In this order:** Library · Assignments · Gates (6) · Proposals (15) · Compiler. Each tab is a URL segment, `#/:org/:ws/steering/<tab>`. The hash is read on load and on `hashchange`; a tab changed by code writes the hash back with `replaceState`, so every view is a link. The bare route `#/:org/:ws/steering` is the Library.

Each tab answers one question, and only one:

| Tab | Question | Count |
|---|---|---|
| Library | What is written down | the four shelves added up |
| Assignments | Which agent receives what | the agents in this workspace set up for steering |
| Gates | What gets refused | the gates that reach this workspace |
| Proposals | What is proposed but not published | candidates plus open Context PRs |
| Compiler | What one agent receives for one prompt | none |

Rev1 had seven tabs: Records, Skills, Memory, Ontology, Policy, Proposals, and Preview. Four of them named a kind of artifact and answered the same question, so they became shelves of the Library. Policy was renamed Gates because the Tools page has its own Policy tab, and that one decides tool calls rather than text. Preview was renamed Compiler because it shows one assembly in full, not a rendering of the page.

**The Library shelf row.** Under the tab strip, on the Library tab and on the Skills page, a chip row (`kf stg-seg`, `role="group"`, `aria-label="Library shelves"`): **All** · **Records** · **Instructions** · **Skills** · **Memory** · **Ontology**, each with its count in a dim span, each carrying `aria-pressed`. Instructions renders only where the workspace has one, so All always equals the sum of the shelves beside it. The row never renders on Assignments, Gates, Proposals, or the Compiler: an artifact kind is not a peer of an assignment or a lifecycle. Picking a shelf is a navigation, so `stgLib(kind)` sets the shelf and routes; the shelf has a URL somebody can send.

**Old URLs still land.** `/steering/records`, `/steering/skills`, `/steering/memory`, and `/steering/ontology` each resolve, light the **Library** tab, and press their own chip. `/steering/library` is the All shelf. `/steering/policy` lands on Gates and `/steering/preview/<agent>` lands on `/steering/compiler/<agent>`. Nothing in a scenario, a document, or a bookmark has to be rewritten.

**Two planes that never merge.** Steering is what the model reads: advisory, ranked, budgeted, and it may be dropped. Gating is what gets refused: deterministic, never budgeted, never ranked. There is one authoring surface and two compilations. Every item compiles to text. An item with an enforcement grant also compiles to a gate, and every gate puts a one-line gate notice back into steering. The Library, Assignments, and the Compiler are the text plane. Gates is the gate plane.

**One item type.** Every source is read into `SteeringItem`: `id`, `lineage`, `kind`, `force`, `scope`, `body`, `token_cost`, `enforcement_grant?`, `provenance`, `hash`, `valid_from`. `kind` is one of record, skill, memory, ontology, policy (a gate notice), instruction. `force` is one of `must`, `should`, `may`, `info`. Precedence is fixed in one place: a gate beats everything, a published `must` beats recalled memory, and repository scope may narrow workspace scope and never widen it.

### Library, the All shelf

The All shelf is one table over `stgLibraryItems()`, the list every count on the tab reads. A shelf filters this list; it is never a second list. Two kinds stay out of it. A gate notice belongs to the gate plane and lives on Gates. A bundle rule with no record in the registry has no shelf to open.

- **Stat strip**, four tiles: **Items** (“everything that can steer an agent here”), **By kind** (one count per kind, in mono, in assembler order), **Compiled size** (“if every item were rendered at once, which no run does”), **Carry a grant** (“these compile to a gate as well as to text”).
- A lead note, verbatim: “A shelf is a filter on this list, never a second list. The assembler reads exactly these items, in this order, and decides per run which of them a given agent is shown. Assignments says who receives what; the compiler shows one decision in full.”
- **Everything written down** panel, badged with the item count, with **Who receives it** in its header, which opens Assignments. Columns: **Item** (the body, with a link to its source) · **Kind** · **Force** · **Scope** (with the repository or agent it names) · **Compiles to** · **Token cost** · **Source** (its provenance line).
- Order is the assembler's: a record, then an instruction, a skill, a definition, and a memory, and within a kind by force (`STG_KIND_ORDER`, then `STG_FORCE_ORDER`, then id).
- Under the panel, a second note, verbatim: “Steering is what the model reads: advisory, ranked, budgeted, and it may be dropped. Gating is what gets refused: deterministic, never budgeted, never ranked. The Library, Assignments, and the Compiler are the text plane. Gates is the gate plane.”
- **Kind** is the badge each card on the Records shelf carries (`kindBadge`): the kind's icon and hue, and the kind in capitals. It is never a grey chip. A record shows its own kind. A skill shows the kind its registry gives it, **procedure** or **constraint**, with “skill” under the badge. A memory shows **memory**, with its class under the badge (“preference”, “fact”, “rule”, or “episode”). An ontology note, an instruction, and a gate notice are none of the six kinds. Each shows a badge in a neutral hue with its own icon (a book, lines of text, a lock), and an ontology note has its kind (“term” or “entity”) under it. The six hues stand for the six kinds and nothing else. `stgKindChip` draws this badge on every steering list: this table, the Compiler, an agent's Steering tab, and a run's manifest.
- **Compiles to** has two values. **compiles to text**: no enforcement grant. **compiles to text and a gate**: the item carries one, and the chip is a button that opens Gates.

The Records, Memory, and Ontology shelves render the bodies specified in `steering-records.md`, `steering-memory.md`, and `steering-ontology.md`. The Skills shelf is its own page, `skills.md`, and shows the shelf row.

**Dialogs this page opens:** `govmode`, `wz (record wizard)`, `wz (Markdown import)`. Every creation wizard is `DLG_EXT.wz`; its spec is `docs/creation-spec.md`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agents · Tools · Steering · Runtimes · Repositories · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · connection badge; the assistant launcher at its foot), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, the **Approvals** button with the count of everything waiting on you across the organization (pending approvals plus an open interjection), account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). The Approvals button opens the right-hand drawer `#apdrawer` (`apdHtml`, `apdRow`, `apdBody`) listing what waits; one selected shows the full approval card with Approve and Deny; Escape closes it. The top bar has no assistant button. Skills has no nav entry of its own: it is a shelf of the Steering library. The Steering nav count is proposals waiting for a person, plus 1 while a Skills interjection waits on one.

### Markdown import

The Markdown import reads an existing CLAUDE.md, AGENTS.md, or any other Markdown file into context records and memories. It is the sixth kind of `DLG_EXT.wz` (`S.wz.kind` is `import`): `wzImport()` draws its three steps, Files, Review, and Publish, and `wzImpPublish()` writes what the operator accepted. Nothing is written until the operator accepts it.

- **Entry points.** Every one calls `wzOpen('import')`, and none is gold.
  - **Import Markdown** in the hub header, between the governance chip and **Write a context record**.
  - A small **Import Markdown** in the header of the Proposals panel, before the small **Write a context record**.
  - **Import Markdown** in the ⌘K group Create, after Write a context record.
  - The **Markdown import** card in the `create` dialog: “CLAUDE.md, AGENTS.md and any Markdown file, read into records and memories.”, with the file line “CLAUDE.md · AGENTS.md · any .md”.
  - The empty state of the All and Records shelves, and of the Memory shelf.
- **Footer.** Left, in mono: “needs steering.write · memory.write on <workspace slug>”. Step 1 has **Cancel**, and steps 2 and 3 have **Back**. Each step's own action sits at the right and is gold.
- **Step 1, Files.** Title “Import Markdown”, subtitle “Drop a directory or pick files, and Oxagen lists the Markdown it finds.” A drop zone reads “Drop a directory or Markdown files here”, with **Choose a directory** (a directory picker), **Choose files** (accepts `.md`, `.markdown`, and `text/markdown`), and **Use the sample directory** (loads `FIXTURES.MD_IMPORT`, rooted at `a-intel/platform`). While files are read, a status line (`role="status"`) says “Reading N more…”.
  - The field **Found in <root>** (“Found” when no root is known) is a table with the columns Include (a checkbox with no header text) · File · Lines · KB · Tokens · Import as (`records` or `memories`). An excluded row dims. Under the table, **Import every file as** sets every row at once.
  - Caps. A directory named `node_modules` or `vendor` is skipped as “a dependency directory”, `.git` as “version control”, and `dist` or `build` as “build output”. A skipped directory is named once, by its own path, and never opened. A file that does not end in `.md` or `.markdown` is “not Markdown”. A file over 200 KB is “over the 200 KB limit”. A file the browser cannot read is “could not be read”.
  - The field **Skipped** groups the skipped paths by reason. It shows three paths per reason, then “and N more”, and it gives an oversized file's size in KB.
  - With files included, a note reads “stella reads N files, about T tokens. That costs about $X in usage credits, billed to <organization>. Nothing is sent until you choose Parse with stella.” (“file” for one). KB is the file's characters divided by 1024, to one decimal and at least 0.1. Tokens are the characters divided by 3.6. The cost is $0.012 per thousand tokens, rounded up to the cent and never below $0.01.
  - Gold **Parse with stella**, disabled while no file is included or a file is still being read.
- **Step 2, Review.** Title “Review candidates”, subtitle “Accept or reject each line, or a whole file at once.”
  - Four tiles: **Files** (“parsed by stella”), **Candidates** (“N as records, M as memories”), **Duplicates** (“start rejected”), and **Parse cost** (“usage credits”).
  - A bar holds **Accept all**, **Reject all**, the select **Import everything as** (each file’s choice, records, or memories), and the count “N accepted, N rejected, N undecided” (`data-imp-counts`). When any line is a duplicate, a hint reads “Accept all leaves the N duplicates rejected. Accept one on its row to import it anyway.”
  - Candidates are grouped by file. Each group header holds the path, “N candidates” (“candidate” for one), **Accept file**, and **Reject file**.
  - Each candidate row holds the kind badge and its source, `<file>:L<line>` (`L<line>-<end>` for a block), then the text with the matched word marked, then the reason stella gives, with “You set it to <kind>.” added when the operator changed the kind. Then the row's notes, then its controls: **Import as** (Record or Memory), Kind, Force (a select for a record, a badge for a memory), Constraint effect (forbid or require, on a record constraint only), **Accept**, and **Reject**. The row carries `data-imp-id`, `data-imp-st`, and `data-imp-as`.
  - The notes a row can carry: “Already published as <record> (N% word overlap).”, “Repeats <file>:L<line> (N% word overlap).”, “Joins <memory> as a saying (N% word overlap). An imported saying never counts as a run.” on a memory, “Close to memory <memory> (N% word overlap). As a record it stands alone.” on a record, and “A memory caps at may. Keep it a record to hold it at <force>.”
  - A closing note reads “An undecided line is left out. The Markdown files themselves stay as they are.” Gold **Review what publishes**, enabled once one line is accepted.
- **Step 3, Publish.** Title “Publish”, subtitle “Records open one pull request per source file, and memories are written now.”
  - With records, a line reads “Each pull request runs the same six checks as a record you write by hand. A record steers nothing until its pull request merges.” Then one block per source file (`data-imp-pr`): `<main> ← context/import-<file slug>`, and one `add .oxagen/rules/<lineage>.toml` per accepted line beside its `<file>:L<line>`.
  - With memories, the field **Memories** lists `mod <memory id>` (“a saying from <file>:L<line>”) for a line that joins a memory, and `add mem.import.<words>` (“<class> at <force> from <file>:L<line>”) for a new one. The hint reads “Written when you publish, with no pull request. A memory becomes a record only through a proposal that runs earn, and an imported saying never counts as a run.”
  - The gold button reads “Open N pull requests and write M memories”, “Open N pull requests”, or “Write M memories”, singular for one.
- **What each target writes.**
  - A record goes into one Context PR per source file, opened at once, like a record you write by hand: branch `context/import-<file slug>`, scope workspace, and lineage `ctx.<first segment of the workspace slug>.<first four words>`, at most 48 characters. Where a published record, an open pull request, or an earlier line already holds a lineage, the import adds `-2`, `-3`, and so on. `steering-proposals.md` specifies how that pull request reads.
  - A memory is written at once, with no pull request. `steering-memory.md` specifies what it holds.
  - The Markdown files are never changed.
  - The audit record gets `steering_imported`: “<R> records in <P> pull requests, <M> new memories and <S> sayings from <F> Markdown files”.
  - A gold toast joins the parts that apply: “Opened N pull requests for R records.”, “Wrote N memories.”, “Added N sayings to existing memories.”, and “The records steer nothing until their pull requests merge.”
  - With a pull request opened, the page goes to Context PRs with the first one selected. With none, it goes to the Memory shelf.
- **Empty and refused.** With no file found, step 1 shows the drop zone and the note “Oxagen skips dependency and build directories, version control, anything that is not Markdown, and any file over 200 KB.”, and **Parse with stella** is disabled. A parse that finds no candidate shows 0 on every tile and the closing note, and **Review what publishes** stays disabled with no line that says why. The wizard has no refused state: `wzOpen()` checks no permission, and the footer only names what the import needs.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Library items | `stgLibraryItems()` over `RECORDS`, `STG_PREVIEW.instructions`, `SKILLS`, `MEMORY`, `ONTOLOGY` | the registry the assembler reads through (Phase 1) | five stores behind one port after the two publish paths collapse | 🟡 |
| Records | `RECORDS` (with `tok`, `grant`, `about`, `hash`, `repo`) | git `.oxagen/rules/` is the system of record; the Postgres registry is the index | `agent.context_records`, `context_record_versions`; `context.record.*` | ✅ |
| Compiled bundle | `STEER_BUNDLE` in `engine.js` | `context.system` in the signed bundle (Phase 0) | compiled from active `must` and `should` records | 🟡 |
| Token cost and enforcement grant | `RECORDS[].tok`, `RECORDS[].grant` | `SteeringItem.token_cost`, `SteeringItem.enforcement_grant` | every row carries `kind` and `force` after the two publish paths collapse (Phase 1) | 🟡 |
| Governance mode | `WS[].governance` via `wsGov()` | `.oxagen/rules/governance.toml` on the main repo, read on open and on merge | read by `context.steering.policy.ts`; nothing writes it | 🟡 |
| Effect line per record | `RECORDS[].effect` | rollups over `frame.context_rendered` and `context_cited` | frame index | 🟡 |
| Markdown import | `MD_IMPORT` (`FIXTURES.MD_IMPORT`: `root`, `usd_per_ktok`, `max_kb`, `files`, `skipped`) for the sample directory; a dropped or picked file is read in the browser | stella's parse, billed in usage credits; records to Context PRs, memories to the memory index | none: the mockup parses in the page and charges nothing | ❌ |

## Functionality

- A record can never grant authority. An enforcement grant compiles a gate the policy already allows a record to narrow; it never widens one.
- Changing the governance mode is a Context PR against `governance.toml`, never a settings write. The chip reads the workspace's current value; the dialog's pick is session state until Open the Context PR.
- A shelf is a filter over `stgLibraryItems()`. Picking one sets `S.libKind` and writes the hash, so the back button walks the shelves.
- `stgTab()` normalizes an old tab id before it routes: `records`, `memory`, and `ontology` name a shelf of the Library, `policy` is `gates`, and `preview` is `compiler`. `route()` and `pSteering()` apply the same aliases, so a bookmark, a scenario step, and an in-page link all land the same way.
- The old routes `#/:org/:ws/skills`, `#/:org/:ws/skills/<view>`, and `#/:org/:ws/skills/<id>/source` still resolve. `route()` rewrites them in place to `#/:org/:ws/steering/skills…`, so no link in the mockup, a scenario, or a document breaks.
- `#/:org/:ws/steering/prs` is kept as an alias of `#/:org/:ws/steering/proposals/prs`.
- The import parses each included file top to bottom (`impParseFile()`). Fenced code is skipped. A heading or a blank line ends a block. Consecutive numbered lines are one procedure at should (“numbered steps, so a procedure”). Each bullet is one candidate, and consecutive paragraph lines are one. The first rule in `IMP_RULES` that matches decides the line:
  - “never”, “do not”, “don't”, or “must not”: a constraint at must (“reads as a constraint that forbids”).
  - “must” or “required”: a constraint at must (“reads as a constraint that requires”).
  - “always”: “reads as a rule at must”.
  - “should”: “reads as a rule at should”.
  - “prefer” or “rather”: a preference at may (“reads as a preference”).
  - “remember”, “last time”, or “incident”: a memory at info (“recalls something that happened, so a memory”).

  A bullet that matches none and opens on an instruction verb (use, keep, run, write, add, put, open, name, read, check, call, set, update, leave, ask, or avoid) is a rule at should: “it opens on “<verb>”, an instruction, so a rule at should”. Any other bullet is a fact at info: “no instruction in it, so a fact”. A paragraph that matches none is prose about the repository and is left out.
- The import measures duplicates by word overlap (`impJac()` over `wzWords()`). A line that overlaps a published record's statement by 50% or more, or an earlier line in this import by 60% or more, starts rejected and names what it repeats. Any other line that overlaps a memory's body by 50% or more is sent to that memory as a saying. Parsing again keeps the decisions on every line whose text did not change.
- Changing a line's kind resets its force to the first one the kind allows. A preference offers may and info, a memory and a fact offer info, and every other kind offers must, should, may, and info. A constraint defaults to forbid. **Accept all** leaves duplicates rejected. **Import everything as** set to each file’s choice restores the Files step's choice, and a line that joins a memory still goes to that memory.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header, the governance chip, and the five tabs stay; the header holds no gold. The empty state is the tab's own, and on the Library it is the shelf's, so the reason names the thing that is missing. The All and Records shelves read “Nothing steers this workspace yet”: “Published records live in `.oxagen/rules/` on a-intel/platform. A record becomes published by being merged, never by being saved here.” Actions: **Import Markdown** (plain) and **Write a context record** (gold). The Memory, Ontology, Assignments, Gates, Proposals, and Compiler copy is in each tab's own spec.
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”. “The control plane answered `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see this workspace’s steering”. “Your roles on Anderson Intelligence Corp. do not include `steering.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access**, **Back to Fleet**. Below: *Signed in as* (Marcus Bell · workspace.owner · core-platform), *Needed* (`steering.read on core-platform`), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The five tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the shelf row is a second strip under it on the Library, and the page itself never scrolls sideways. Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar; the approvals drawer opens full width. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = 1 while something in it waits). **More** is a bottom sheet listing Steering (with its shelves inside it), Runtimes, Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace, and it is the lit slot on every Steering tab. Every dialog rises from the bottom edge as a sheet; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- Writes (each a governed action recorded in Audit): `context.propose (open a Context PR)`, `context.review`, `context.retire`; changing the governance mode opens a Context PR under `context.propose`, and lowering it needs an org-owner approval.
- The Markdown import names `steering.write · memory.write` in its footer: its records open Context PRs, and its memories are written directly. The mockup checks neither permission before the wizard opens.

## Backend gaps this page depends on

- Context PR state from GitHub
- The registry port the assembler reads through (Phase 1), and its move to the graph behind the same port (Phase 3)
- Writing `governance.toml`: it is read on every open and merge and written by nothing today
- The Markdown import: stella's parse and its usage-credit charge, the memory write, and a permission check before the wizard opens. The mockup parses in the page, charges nothing, and has no refused state

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen".
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale. The governance chip is never gold.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
- One tab, one category. A tab never mixes an artifact kind with a lifecycle or an assignment.
