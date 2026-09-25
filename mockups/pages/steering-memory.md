# Steering · Memory

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/memory` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 1, 4, 5, and 9); §12.6 token classes; `steering.md` is the hub, and Memory is a shelf of its Library tab |
| Design | `mockups/src/engine.js` → `stgMemoryTab()` with `stgMemoryAgg()` and the fold helpers `memFoldOf()`, `memFoldSub()` and `memFoldLine()`, inside `pSteering()` and `stgHub()`; the dialogs are `DLG_EXT.memory` and `DLG_EXT.memforget`; the Markdown import that writes memories is `wzImport()` and `wzImpPublish()` inside `DLG_EXT.wz`, specified in `steering.md`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering-memory`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering-memory.audit-prompt.md` |

## Job

What an agent's own runs left behind, and how it competes. Memory is aggregated, not collected. A memory is one concept, and its sayings are the words runs used for it: an operator steer and a reflection that say the same thing fold into one memory with two sayings. The recall count is the sum over the runs that pulled it. When a memory holds enough sayings from enough runs, it becomes a steering proposal that cites every saying. The Markdown import is the one other writer: it adds sayings from a file, and a saying from a file never counts as a run. Memory is recalled, never published, so it enters only the volatile selection and gives way to anything published that says otherwise.

## What is on the page

**Hub header.** Eyebrow: the workspace name, h1 “Steering”, subtext “Everything that can steer an agent in this workspace competes in one assembler.” Actions: the governance chip **Governance: team**, **Import Markdown** (plain; opens the Markdown import wizard), and **Write a context record** (gold; opens the record wizard). The chip and its `govmode` dialog are specified in `steering.md`.

**The five tabs, in this order:** Library · Assignments · Gates · Proposals · Compiler. `stgHub()` derives each tab's count: Library counts every library item, Assignments the agents assigned in this workspace, Gates this workspace's gates, and Proposals the proposals plus the open context pull requests from `stgOpenCount()`. Compiler carries no count. Each tab is a URL segment, `#/:org/:ws/steering/<tab>`. The hash is read on load and on `hashchange`; a tab changed by code writes the hash back with `replaceState`, so every view is a link. Library is selected, and the shelf row beneath it presses Memory. The shelves are All · Records · Instructions · Skills · Memory · Ontology, each a chip with `aria-pressed` and a count from `stgLibCounts()`. Instructions shows only when the workspace holds one. `/steering/memory` still resolves and lights this shelf.

- **Aggregation strip**, four stat tiles, one number and one basis line each. Every number is computed at render from the rows below by `stgMemoryAgg()`; the spec names the derivation, and no number is typed:
  - **Memories**: the row count. Basis “folded from N sayings”, where N is `folded`, the count of sayings across every row. The basis line carries `data-mem-folded`.
  - **Sources**: `runs`, the distinct runs named in the provenance lines and in the sayings, with “runs” in small type. Basis “N operator steers and M reflections”: a saying whose `by` contains “operator steer” counts as a steer, and every other saying from a run counts as a reflection. When any saying was imported, the basis reads “N operator steers, M reflections, and K imported lines” (“imported line” for one), and the line carries `data-mem-imports`. An imported saying adds to K and never to the runs.
  - **Recalled 30d**: `recalls`, the sum of `recalls30` over the rows. Basis “N tokens delivered”, the sum of each row's token cost times its recalls.
  - **By class**: `cls`, one count per class, each class name in mono, in the order the classes first appear in the rows. Basis “a rule is proposed as a record instead”.
- A lead note, verbatim: “A published must beats recalled memory. Memory is what an agent’s own runs left behind. It is recalled, never published, so it competes only in the volatile selection, as may or info, and it gives way wherever a published record says otherwise. To make a memory binding, promote it: a proposal, a pull request, a merge.”
- **Recalled memory** panel, badge the row count. The table carries no filters and no pager: a workspace holds a handful of memories, and controls over nine rows are furniture.
- **Fold setting**, one line between the panel header and the table, read as a sentence: “A memory becomes a proposal at [3] sayings from [2] runs.” The first select (`#memFoldN`) offers 2, 3, 4 and 5 and defaults to 3. The second (`#memFoldR`) offers 1, 2 and 3 and defaults to 2. Dim text follows: “A workspace setting. The promoter reads it on every pass.” Both selects are mono and have labels bound by `for`.
- Columns: Memory (the body, with “<id> · <provenance>” beneath it in mono) · Sayings · Class (`PREFERENCE`, `RULE`, `EPISODE`, `FACT`, mono) · Force · Scope (workspace, or agent with the agent's slug) · Last recalled (with “N recalls in 30 days”) · Token cost (“27 tok”) · In the assembler. Every row opens the `memory` dialog (Enter and Space too).
- **Sayings** shows the row's saying count, then “of N”, where N is the setting's sayings. The cell carries `data-mem-fold`, set to `proposed`, `ready` or `below` by `memFoldOf()`. Beneath the count, one line from `memFoldSub()`:
  - “proposed as <proposal id>” when the memory carries `proposedAs`.
  - “the promoter proposes it on its next pass” when it meets the setting.
  - “needs N more saying” or “needs N more sayings” when it is short of sayings.
  - “needs a saying from another run” when it has enough sayings from too few runs.
  - “needs a saying from a run” when it has enough sayings and none of them came from a run, which is where a memory written only by the import stops.
- **Folding.** Each saying is `{run, frame, by, text}`: the words one run used, the frame that holds them, and who wrote them, an operator steer or the reflector. A saying from the Markdown import is `{run: null, frame: null, file, line, by, text}`, and its `by` is “<operator> · import”. It counts toward the sayings and never toward the runs, so an imported memory alone never folds into a proposal. A new saying that means what a memory already says joins that memory instead of starting a new one. `memFoldOf()` gives a memory one of three states. It is `proposed` when it carries `proposedAs`. It is `ready` when it holds at least the setting's sayings from at least the setting's distinct runs. Every other memory is `below`, and a memory below the setting is never proposed. On the demo fixture `mem_01K5R0N2` is the one proposed memory: three sayings from three runs, proposed as `prp_01K5RX1N`, whose supporting runs on the Proposals tab are those three sayings.
- **In the assembler** has three values. **competes**: the item is ranked per prompt like any other. **yields**: a published `must` contradicts it, and the cell links the record (“to ctx.release.never-merge, a published must”). **superseded**: a published record replaced it, and the cell links the record (“by ctx.platform.safari-e2e-flake”).
- Footer: **See one yield in the compiler** sets the compiler prompt to “CI is green, merge the release pull request” and opens the Compiler tab, where `mem_01K5QX7C` is cut as lower precedence by `ctx.release.never-merge`. Beside it: “Recall used to reach only the in-app agent, capped at six items. It now goes through the same assembler as every other source.”

**Dialogs this page opens:** `govmode`, `memory`, `memforget`, `wz (record wizard)`, `wz (Markdown import)`.

- **`memory`**, one item. Title: the memory's body. Subtitle: “A memory, recalled and never published”. Fields: Class (with its force), Scope, Where it came from (the provenance line), Recalled (“N times in 30 days, last on <date>”), Cost (“N tokens every time it is selected, so M over those 30 days”), In force since. Then one sentence from `memPosition()` on where it sits:
  - “It competes in the volatile selection at force <force>. A published record beats it wherever the two are about the same thing.”
  - “It yields to <record>, a published must. Where the two disagree, the published record is what the agent reads.”
  - “Superseded by <record>. It is kept for the runs that carried it and is never selected again.”

  Then the **Sayings** field (`data-mem-says` holds the count). Each saying shows its quoted text, then who said it, the run id as a mono link to that run's Memories tab (`#/:org/:ws/runs/<run>/memory`; the link closes the dialog), and “frame N”. An imported saying shows `<file>:L<line>` in mono (`data-mem-src`) and “imported” in place of the run link and the frame. A note from `memFoldLine()` follows the list:
  - Proposed: “Proposed as <proposal id> when it reached N sayings from M runs. The proposal cites every saying above.”
  - Ready: “It has N sayings from M runs, which meets the setting. The promoter proposes it on its next pass.”
  - Below: “It becomes a proposal at N sayings from M runs. It has X from Y run.” (or “runs”). When any saying was imported, the note adds: “An imported saying counts toward the sayings and never toward the runs, so an import alone never makes a proposal.”

  When the provenance starts with a run id, the field **The run that left it** holds **Open <run id>**, which goes to the run. An imported memory's provenance starts with its file and line, so it has no such field. Footer: **Close** · **Forget** (red; opens `memforget`) · one gold action. A memory with `proposedAs` gets **Open the proposal**, which closes the dialog, selects that proposal, and opens `#/:org/:ws/steering/proposals` (`memOpenProposal()`). Every other memory gets **Promote to a record**, which opens the record wizard with the memory's body as the description (`memPromote()`).
- **`memforget`**. Title “Forget this memory?”. A note says the assembler stops selecting it, names the agent that stops being told it (or “every agent in scope”), and says every frame and every carried hash stays. When the memory was recalled in the last 30 days, a warning gives the count. A last note offers promotion as the other answer. Footer: **Keep it** · **Forget it** (red). Forgetting removes the row and shows the toast “Forgot <id>. The assembler stops selecting it; every run that carried it is untouched.”

**Shell.** As `steering.md`: sidebar with Steering lit and Runtimes between Steering and Repositories, top bar with breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button (count of everything waiting on you across the organization) that opens the drawer `#apdrawer`, and the account avatar. No assistant button in the top bar. Skills has no nav entry of its own.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Memory items | `MEMORY` (`body`, `cls`, `force`, `scope`, `provenance`, `recalls30`, `lastRecalled`, `token_cost`, `valid_from`, `supersededBy`, `yieldsTo`, `proposedAs`) | `:AgentMemory` in the graph, read by the assembler's memory adapter | `packages/agent/src/runtime/assistant-recall.ts` recalls for the in-app agent only, capped at 6 | 🟡 |
| Sayings | `MEMORY[].sayings[]` (`run`, `frame`, `by`, `text`; an imported saying has `run` and `frame` null and adds `file` and `line`) | one edge per saying from the memory to the frame that said it, or to the file and line it was imported from | none | ❌ |
| Imported memories | `wzImpPublish()` adds `MEMORY` entries from the lines accepted in the Markdown import (`FIXTURES.MD_IMPORT` in the sample) | the memory index, written under `memory.write` | none | ❌ |
| Fold setting | `S.memFold` in `engine.js`, `{sayings: 3, runs: 2}` | a workspace setting the promoter reads on every pass | none | ❌ |
| Aggregation strip | derived at render by `stgMemoryAgg()` | rollups over the same items; tokens delivered from `cost.run_totals` `context_frame_tokens` | 🟡 ClickHouse `token_usage` | 🟡 |

## Functionality

- Nothing on this tab is authored here. A memory is written by a run, or by the Markdown import. It leaves three ways: a published record supersedes it, it is promoted into a record of its own, or it is forgotten.
- The Markdown import (`steering.md`) writes memories with no pull request, when its wizard publishes. A line accepted as a memory joins an existing memory when its words overlap that memory's body by 50% or more, and its review row says “Joins <memory> as a saying (N% word overlap). An imported saying never counts as a run.” Every other accepted memory line becomes a new memory: id `mem_01K5` plus four hex characters, lineage `mem.import.<first four words>`, class from the line's kind (preference `PREFERENCE`, memory `EPISODE`, fact `FACT`, rule, constraint and procedure `RULE`), provenance “<file>:L<line> · import by <name>”, last recalled “never”, and 0 recalls. Its force is `info` for a memory, a fact, or a line set to `info`, and `may` for every other line. A memory caps at may, so a line at must or should reads “A memory caps at may. Keep it a record to hold it at <force>.” When an import opens no pull request, publishing lands on this shelf.
- Forgetting stops the assembler selecting it. It touches no run: every frame stays, and every run that carried the memory keeps naming the hash it carried. A build where forgetting rewrites a run is a FAIL.
- Promoting opens the record wizard with the memory's words in the description. The memory is not consumed: the record is what becomes binding, and the memory is superseded by it at merge. A memory already proposed offers **Open the proposal** in place of **Promote to a record**, and that button opens the proposal the fold produced.
- Folding is the automatic route to a proposal. When a memory reaches the fold setting, the promoter proposes it as a record and cites every saying as a supporting run. The mockup does not run the promoter: a memory that reaches the setting reads `ready`, and no new proposal appears.
- Changing either fold select sets `S.memFold` and re-renders. Every Sayings cell, every dialog's fold note, the run page's Memories lead note and the rationale of `prp_01K5RX1N` read the new value. The change shows no toast and writes no audit event in the mockup.
- Every saying from a run links its run's Memories tab and names its frame, so a fold can be checked against the words each run used. An imported saying names its file and line instead.
- The strip is derived from the rows beneath it by `stgMemoryAgg()`. Memories is the row count; folded is the count of sayings across the rows; Sources is the distinct runs across provenance and sayings, split into operator steers and reflections by each saying's `by`, with imported sayings counted apart as imported lines; Recalled 30d is the sum of the recalls column; tokens delivered is the sum of token cost times recalls; By class counts rows per class. A build that types the numbers twice is a FAIL.
- The In the assembler cell (`memAsmCell()`) reads the same `supersededBy` and `yieldsTo` fields that the Compiler's precedence step drops a memory on, so the shelf and the Compiler name the same record.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header, the chip, and the five tabs stay; the header holds no gold. The body is “Nothing has been recalled yet”: “Memory is what an agent’s own runs leave behind. No run in this workspace has written one. You can import sayings from a CLAUDE.md or AGENTS.md.” Action: **Import Markdown** (plain; opens the Markdown import wizard). This state holds no gold action at all.
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”. “The control plane answered `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the trace line.
- **access denied**: “You cannot see this workspace’s steering”, naming `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The five tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the page itself never scrolls sideways. The shelf row wraps under the Library tab, Memory pressed among it. The four tiles wrap to two columns. The fold setting wraps onto as many lines as it needs, and each select keeps its label beside it. Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**. **More** is a bottom sheet listing Tasks, Steering, Runtimes, Repositories, Organization, Billing, Audit, then **Ask stella\***, Search, Notifications, Account, then Switch organization and Switch workspace, and it is the lit slot on every Steering tab. The shell spec in `fleet.md` describes each tile. Every dialog rises from the bottom edge as a sheet; the table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- Writes (each a governed action recorded in Audit): `memory.forget`; `context.propose` to promote one into a record. Neither writes a file: forgetting edits the memory index, and promoting opens a pull request.
- **Open the proposal** is a navigation and needs only `steering.read`.
- The Markdown import names `steering.write · memory.write` in its wizard footer, and `memory.write` covers the memories it writes. The mockup opens the wizard for every viewer and checks neither permission.
- The fold setting names no permission in the mockup. Any viewer can change it, and nothing records the change. The permission that owns it is listed under Backend gaps.

## Backend gaps this page depends on

- The `:AgentMemory` source adapter for wrapped agents (Phase 1). Today recall reaches only the in-app agent.
- The recall counter per item, and the tokens-delivered rollup from `cost.run_totals`.
- Sayings as stored edges from a memory to the frame that said them, and the match that joins a new saying to an existing memory.
- The promoter pass that proposes a memory once it reaches the fold setting.
- The write path for imported memories and sayings, the permission check before the import wizard opens, and the stella parse the wizard bills for.
- A store and a permission for the fold setting. The mockup keeps it in page state (`S.memFold`), so it resets on reload and applies to every workspace.

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen".
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger.
- Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
