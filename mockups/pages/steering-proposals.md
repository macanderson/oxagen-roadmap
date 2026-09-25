# Steering · Proposals

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/proposals[/prs]` |
| Scope | workspace |
| Spec | the steering and gateway plan, Phase 2 (story sheet decisions 8, 9, and 13); §12.8 findings; `steering.md` is the hub this tab belongs to |
| Design | `mockups/src/engine.js` → `pSteering()` (the proposals branch), `prpDetail()`, `prpBadge()`, `prTable()`, `ctxprTab()`, `recprDetail()`, `recprBody()`, `PRP_SUPPORT`, `PRP_META`, `wzImpPublish()`, inside `pSteering()` and `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / steering-proposals`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `steering-proposals.audit-prompt.md` |

## Job

The way in: a record becomes a proposal, a proposal becomes a pull request, a merge publishes it. Context PRs is a view inside this tab instead of a tab of its own. A proposal argues from runs; the outcome of each supporting run is reported as recorded, and a person decides whether the support is enough. There is no threshold and no verdict.

## What is on the page

**Hub header.** Eyebrow: the workspace name, h1 “Steering”, subtext “Everything that can steer an agent in this workspace competes in one assembler.” Actions: the governance chip **Governance: team**, **Import Markdown** (plain; opens the Markdown import specified in `steering.md`), and **Write a context record** (gold; opens the record wizard). The header gives up the gold when the view below holds the one primary action (Open a Context PR on a proposal that has none, Merge pull request on a pull request that passed). The chip and its `govmode` dialog are specified in `steering.md`.

**The five tabs, in this order:** Library (75) · Assignments (4) · Gates (6) · Proposals (15) · Compiler. The Proposals count is candidates plus open pull requests. Each tab is a URL segment, `#/:org/:ws/steering/<tab>`. Proposals is selected.

- A two-way control under the tabs (`aria-pressed`): **Candidates (9)** and **Context PRs (6)**, with the line “a record becomes a proposal, a proposal becomes a pull request, a merge publishes it”. Candidates is `/steering/proposals`; Context PRs is `/steering/proposals/prs` (`/steering/prs` still resolves).
- **Candidates**: the panel “Proposals” with a small **Import Markdown** and a small **Write a context record** in its header, both plain, then Sort, Rows, and a pager. Each proposal is a record card: the kind badge, force, its state badge (`candidate`, `open Context PR`, `merged`, or for the promoter's live proposal `ready for a Context PR`, `open Context PR` with the check state, or `published`), its checks badge (“6 / 6 checks pass”, “5 / 6 · conflict check running”), **Review**; the statement; then “from <source>” (findings job with its finding id, reflector with a run id, a person, or “memory fold · mem_01K5R0N2” for a memory's fold), the support line computed from the supporting runs (“682 duplicate tool calls across 212 runs”, “14 unsatisfied runs in 30 days”, “3 data-layer drift findings”, “3 sayings from 3 runs”), the proposal id, scope, and lineage.
- **Review** opens the proposal (`prpDetail`): a row with **All proposals**, the lineage, and the state badges; three tiles, **Supporting runs** (“sealed runs, from the rows below” or “proposed by a person”), **Distinct agents** (“from the rows below”), and **Confidence** (“the promoter's own estimate; a person decides”) or, for a person's proposal, **Checks** “apply” (“the same six as any record”); then two columns. Left: **Proposed record** (the card, badge “steers nothing yet”, “from <source>”), **Promoter evidence** (the rationale in prose), **Supporting runs** (badge: the support line; columns Run (with agent and date) · Frame (“seq 31”) · Outcome · Record (the record or finding id, and the record kind with a repeat count)). Right: **Context PR** (Target `a-intel/platform`, Branch `context/<lineage>`, File `.oxagen/rules/<lineage>.toml`, Governance “team · a code-owner review is required”) with the action: **Open a Context PR** (gold when none is open), **Open <pr>** or **Merged in <pr>** once one exists, or the pull request and its checks in mono; **If it publishes** (Reaches, As, Costs, Baseline, Read back as).
- **Outcome** is what the record shows for that run: `kept`, `reverted`, `no change`, or `halted`, as a dot and a word. It is never a verdict. The tiles derive from the rows beneath them.
- **A proposal from a memory fold.** `prp_01K5RX1N` is the one proposal a memory made. Its card reads “from **memory fold · mem_01K5R0N2**” and its support line reads “<sayings> sayings from <distinct runs> runs”. **Open the proposal** in the `memory` dialog of `mem_01K5R0N2` opens it here (`memOpenProposal()`). Its detail cites the memory's sayings as follows.
  - **Supporting runs** holds one row per saying (`PRP_SUPPORT`, built from the memory's `sayings`). Run is the run that said it, with the agent and the date. Frame is the frame it was said in (“seq 23”). Record is `mem_01K5R0N2` with the kind “memory · saying”.
  - Outcome on these rows reads `failed` when the run's summary contains “never passed” or “nothing merged”, and `passed` otherwise. Those two words fall outside the four outcomes above. The date is fixed at 2026-09-11 for every row.
  - The tiles: **Supporting runs** counts the rows, so it counts sayings. **Distinct agents** counts the agents behind them. **Confidence** is 0.71.
  - **Promoter evidence** opens “Three runs said the same thing in their own words, and the fold kept them as one memory, mem_01K5R0N2.” It quotes each saying as “<agent> wrote “<saying>” in <run> at frame <n>.”, where the agent is the last segment of its slug (`stella-ci`). It closes “The third saying reached the workspace setting of <sayings> sayings from <runs> runs. As a memory it competes at may. As a record it reaches every run in core-platform at should.” The two numbers read `S.memFold`, so changing the fold setting on the Memory shelf changes the sentence.
  - **Context PR** names Branch `context/ctx.platform.node-20` and File `.oxagen/rules/ctx.platform.node-20.toml`. Its action is **Open a Context PR**, disabled, with no reason given. **If it publishes** costs 24 steering tokens a turn, and Baseline reads “<sayings> sayings from <agents> agents in one day”.
- **Context PRs**: the panel **Context PRs** (badge “Governance: <mode>”, the workspace's mode from `wsGov`), columns Pull request (with the statement under it) · Branch · Opened by · State. A row is selectable (`aria-current`); the selected pull request is shown below it. Three things open one, and the table says which: **the promoter**, out of runs it aggregated into a proposal, and **a person** (named), out of the record wizard or out of the Markdown import. Several operator pull requests may be open at once. Each keeps its own state, its own file, and its own checks.
  - Before the promoter's proposal has a pull request: “prp_01K5RU4A is ready and has no Context PR yet. It steers nothing until one merges.”, **Open a Context PR** (gold; opens `ctxpr`), and a note that writing one yourself opens the same kind of pull request, argued from you rather than from runs.
  - The selected pull request: **Context PR · <pr>** with its state badge and the line “Branch <branch> · base main · <sha> · one concern per PR”, the file it carries as TOML; **Pull request body** ( or “written by <name>”); **Checks** (badge “the same rules as stella context validate”): Schema, Lineage uniqueness, record_hash recomputation, Secret and PII scan, Conflict against active records, constraint_effect ∈ {require, forbid}, each with its own result text once it reports, and pass, running, queued, or fail.
  - The merge bar: “Checks are running. Merge is blocked until all 6 report.”, then “6 checks passed. Governance team: <name> owns .oxagen/rules/.”; on a failure “A check failed. Nothing merges and nothing is published. Change the file and open it again.” **Merge pull request** is gold only once every check passed, disabled otherwise, and a no-op if called anyway. An operator's pull request also offers **Close pull request** (red; opens `closepr`, which previews the comment Oxagen posts on GitHub: “Closed by <first name> <last name> <email>”, a horizontal rule, then “Added via Oxagen” and the full URL of this Context PR page in Oxagen as the link text; confirming closes the pull request, posts the comment, and records a governed action).
  - **Merge effects**, five numbered rows: write a promotion_event, re-index from the merged commit, bump the bundle vN → vN+1 and re-sign it with the tokens a turn before and after, emit steering_published, deliver on the next model call of every run in the workspace. Once merged, **promotion_event** replaces it (record_id, lineage_id, from → to, author and approver, pr_url, commit_sha, merged_at, re-indexed, bundle, tokens per turn, audit, ledger) with **Audit log**, and for the promoter's **See it in run_01K5RS7M2E8FJ3QW**; the merge bar reads “Merged by <name>” with **Open the record** and **See it in Records** on an operator's.
  - **A pull request from the Markdown import** carries every record accepted from one source file. Its branch is `context/import-<file slug>`. Its table row reads “<N> records from <file>” under the number, or the statement when it carries one record. Its eyebrow ends “one source file per PR” in place of “one concern per PR”. The file panel holds one TOML block per record. Its body reads, line by line: “## Import <N> records from <file>”, “stella parsed `<file>` on <date>. <name> accepted these in the Markdown importer.”, “One pull request per source file, so a reviewer reads a file’s rules together.”, then “### Records” with one line per record (“- `<lineage>` · <kind> · <force> · from `<file>:L<line>`”, a constraint's effect after the force, and the statement on the next line), “### What it costs”, “Adds <N> steering tokens a turn to every turn in scope.”, a `---` line, and “Opened by <name> · workspace `<ws>` · governance `team`”. Once merged with more than one record, the merge bar offers one gold **See them in Records**, the promotion_event lineage_id reads “<N> lineages · <ids>”, and the `steering_published` audit line opens “<N> records from <file>”.
  - **Every check with a predicate is re-run at merge.** The lineage check counts published records and competing open pull requests; the pull request opened first keeps the claim. A check that stopped passing blocks the merge and says so.
  - **While a pull request is open the record steers nothing.** It is not in Records, not in the compiled bundle, not in the audit log, and the bundle version has not moved. `tools/check-record-e2e.mjs` asserts each of those separately.
- Skills use the same flow: a skill is authored through a pull request of kind `skill`, listed on Repositories · Changes beside the record pull requests.

**Dialogs this tab opens:** `govmode`, `wz (record wizard)`, `wz (Markdown import)`, `ctxpr` (Open a Context PR: Concern, Kind, Scope, Constraint effect, Supporting evidence, and the note that merge is the publication).

**Shell.** As `steering.md`: sidebar with Steering lit and Runtimes between Steering and Repositories, top bar with breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button (count of everything waiting on you across the organization) that opens the drawer `#apdrawer`, and the account avatar. No assistant button in the top bar. Skills has no nav entry of its own.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js`.

| Element | Mockup collection | Target store | Backing today (repo) | Status |
|---|---|---|---|---|
| Proposals | `PROPOSALS`, `PRP_SUPPORT` (rows with `run`, `date`, `frame`, `outcome`, `dups`, `rec`), `PRP_META` | `PROPOSES`, `PROMOTED_BY` | `agent.context_promotions`; `agent.memory_promotion.*` | 🟡 |
| Memory-born proposal | `PROPOSALS` (`prp_01K5RX1N`), `FIXTURES.MEMORY[].proposedAs` and `sayings`, `PRP_META` | the memory index, one edge per saying, and `PROPOSES` | none | ❌ |
| Import pull requests | `RECPRS[]` with `src`, written by `wzImpPublish()` | GitHub pull requests on the main repo | none | ❌ |
| Supporting-run outcomes | `PRP_SUPPORT[].outcome` | the run's terminal status and the frame that cited the record (§12.8) | `agent_stop` frames and `context_cited` | 🟡 |
| Context PRs | `CTXPR`, `RECPRS`, `S.recprs`, `S.ctxpr` | GitHub pull requests on the main repo | the promotions ledger; Context PR state from GitHub is a gap | 🟡 |
| Steering tokens a turn | `PRP_META[].tok`, `stgBundle().tok` | `cost.run_totals` `steering_tokens` | 🟡 ClickHouse `token_usage` | 🟡 |

## Functionality

- The tab count is candidates plus open pull requests, and the Context PRs count is the same open number.
- Merging is done on GitHub through the Context PR. The page shows what merge will do and the check results.
- A pull request opened from the record wizard lands here, on the Context PRs view, with its row selected. The Markdown import lands here too when it opens at least one pull request, with the first one selected, and each import pull request starts its checks at once.
- Closing an unmerged pull request throws the branch away; a merged one cannot be closed, because taking a record back out of force is its own pull request.

## States

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: the hub header, the chip, and the five tabs stay; the header holds no gold. The body is “No proposals yet”: “Nothing has been proposed from this workspace’s runs, and no pull request is open against `.oxagen/rules/`. A proposal steers nothing until a person opens a pull request from it and someone merges that.” Action: **Write a context record** (gold).
- **loading**: the shell stays; the page body, hub header included, is replaced by the skeleton (four tile blocks and a panel of seven rows).
- **error**: “Steering could not be loaded”. “The control plane answered `503 record_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the trace line.
- **access denied**: “You cannot see this workspace’s steering”, naming `steering.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The five tabs are one scrolling strip with scroll snap, and the tab in view is scrolled to on render; the page itself never scrolls sideways. The two columns of a proposal and of a pull request stack. Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**. **More** is a bottom sheet listing Steering (with its shelves inside), Runtimes, Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace, and it is the lit slot on every Steering tab. Every dialog rises from the bottom edge as a sheet; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px.

## Permissions

- Read: `steering.read`
- Writes (each a governed action recorded in Audit): `context.propose (open a Context PR)`, `context.review (merge one)`, `context.retire`

## Backend gaps this page depends on

- Context PR state from GitHub
- The fold that turns a memory's sayings into a proposal, and the outcome of each saying's run from its terminal status (the mockup reads the summary's words and fixes the date)
- The import parse and one pull request per source file (`steering.md`)
- The outcome per supporting run, joined from the run's terminal status and the citing frame

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A control claim carries its scope: "for actions routed through Oxagen".
- Every badge that describes trust (tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger. A supporting run carries an outcome, never a verdict.
- Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to items, frames, records and commits, not a summary.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, or a dashed outline, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
