# Steering › Pull requests

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/proposals/prs`. Old route: `/steering/prs`, resolved in place to `/steering/proposals/prs` (`docs/fleet-operations-routes.md`, Steering). The mockup rewrites `#/:org/:ws/steering/prs` in place |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D7 (Steering record), the vocabulary rows Steering record and Proposal, and the Steering section Shipped today (proposals and their pull requests ship through `list_proposals`, `get_context_pr`, `open_context_pr` and `merge_context_pr`). `docs/fleet-operations-ia.md` (Steering, Pull requests: "Open Steering record pull requests with their six checks", primary action "Merge, when every check passed"). ADR-061 in `macanderson/oxagen` |
| Design | `mockups/src/wedge.js`: `stgProposalsTab`, inside `pSteering`; `mockups/src/engine.js`: `ctxprTab`, `prTable`, `recprDetail`, `recprRecs`, `recprChecks`, `recprFile`, `recprFileText`, `recprBody`, `wzImpPublish`, `prLabel`, `prRun`, `prRecheck`, `ctxprMerge`, `recprMerge`, `recprDiscard`, `ciLight`, `ciFromSt`, `DLG_EXT.closepr`, `prClose`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Steering / Pull requests`: Loaded, and Loaded · mobile |
| Audit | `steering-prs.audit-prompt.md` |

## Job

The Steering record pull requests of the workspace, and the one place a person merges one. A Steering record is a file in `.oxagen/rules/` on the main repository, and it becomes published by being merged, never by being saved. A pull request carries one record file, or, from the Markdown importer, one record file for each record accepted out of a single source file. Every pull request runs the same six checks. Merge is refused until every check passed, and the merge is the publication.

Three things open a pull request here. The promoter opens one from a proposal it argued out of runs. A person opens one from the record wizard. A person also opens them from the Markdown importer, one pull request per source file (`steering.md`, Import Markdown). They differ in how they argue for their records and are identical in everything that decides whether those records publish. While a pull request is open, its record steers nothing.

## What is on the page

**Header, tabs and shell.** As `steering.md`, with Proposals selected (16). New source is plain on this view, so the gold is Merge pull request's.

**The two views.** The group labelled "Proposals or pull requests", with **Pull requests** 6 pressed and the line "A proposal becomes a pull request. A merge publishes it." (`steering-proposals.md`).

**Pull requests** panel.

- Heading "Pull requests", with the governance mode as a badge at the right: "Governance: team".
- A table with no list controls. Columns, in order: Pull request, Branch, Opened by and State.
  - **Pull request**: the number in mono ("a-intel/platform#519"), with the record's statement under it.
  - **Branch**: `context/<lineage>` in mono.
  - **Opened by**: "the promoter", or the person who opened it from the record wizard or the Markdown importer ("Marcus Bell").
  - **State**: the checks light (a light and "done / total": blinking while checks run, a red cross on the first failure, steady green when all passed, grey when queued), then the state badge ("6 / 6 checks pass", "0 / 6 checks · queued", "3 / 6 checks · running", "4 / 6 · check failed", "merged", "closed").
- The rows at load. A pull request a person opens from the record wizard joins the top of the table and is selected.

| Pull request | Statement | Branch | Opened by | State |
|---|---|---|---|---|
| a-intel/platform#519 | "Do not re-read CHANGELOG.md more than once in a run; cache the first read." | `context/ctx.release.no-reread-changelog` | the promoter | 6 / 6, "6 / 6 checks pass" (selected) |
| a-intel/platform#520 | "Migrations run in filename order; never renumber a merged migration." | `context/ctx.platform.migration-order` | the promoter | "5 / 6 · conflict check running" |
| a-intel/support-console#188 | "Draft the first reply in the language the ticket was written in." | `context/ctx.support.reply-in-customers-language` | the promoter | "6 / 6 pass" |
| a-intel/data-platform#341 | "Backfill in day-sized partitions and verify row counts after each." | `context/ctx.data.backfill-partitions` | the promoter | "5 / 5 pass" |
| a-intel/security-tools#77 | "No agent may rotate a credential it holds." | `context/ctx.sec.never-rotate-own-credential` | the promoter | "7 / 7 pass" |
| a-intel/mobile#96 | "The production branch of a-intel/mobile is release, not main." | `context/ctx.mobile.release-branch` | the promoter | "4 / 4 pass" |

- Publishing the Markdown importer adds one row per source file to the top of the table, selects the first, and starts every row's checks at once. A row with several records reads "<N> records from <file>" in place of a statement, and its branch is `context/import-<file slug>`. With the sample directory and Accept all, five rows arrive, each opened by Marcus Bell at "0 / 6 checks · queued". The view's count reads 11 and the Proposals tab 21.

| Pull request | Statement | Branch |
|---|---|---|
| a-intel/platform#521 | "9 records from CLAUDE.md" (selected) | `context/import-claude` |
| a-intel/platform#522 | "4 records from AGENTS.md" | `context/import-agents` |
| a-intel/platform#523 | "3 records from apps/api/CLAUDE.md" | `context/import-apps-api-claude` |
| a-intel/platform#524 | "3 records from docs/runbooks/release.md" | `context/import-docs-runbooks-release` |
| a-intel/platform#525 | the statement of README.md's one record | `context/import-readme` |

- A selectable row carries `aria-current` when selected. In the mockup only the promoter's `a-intel/platform#519` and a person's pull requests are selectable; the other rows are fixtures without a detail.
- What the fixture rows get wrong, which a build does not copy: a proposal raised by a person (`a-intel/platform#520` from Marcus Bell, `#341` from Amara Lindqvist, `#77` from Ines Haddad) reads "the promoter"; the proposal behind `#77` is merged yet listed here as open and counted in the view's 6; the checks count out of 5, 7 and 4, though every Steering record pull request runs six; and four of the six target other workspaces' repositories.

**The selected pull request.** Two columns under the table.

Left column:

- **Pull request · a-intel/platform#519**, with the state badge at the right ("6 / 6 checks pass"). Under the heading, the line "Branch context/ctx.release.no-reread-changelog · base main · a4c91e2 · one concern per PR". Then the record file as TOML, highlighted with the editor's grammar:

```toml
# .oxagen/rules/ctx.release.no-reread-changelog.toml
schema       = "context-record/v0.1"
lineage_id   = "ctx.release.no-reread-changelog"
kind         = "rule"
sharing_scope= "workspace"
statement    = "Do not re-read CHANGELOG.md more than once in a run; cache the first read."

[steering]
strength = "should"

[enforcement]
constraint_effect = "forbid"
blocking = false

record_hash  = "sha256:9a41c0e7bd238f45"
```

  An import pull request's line ends "one source file per PR" in place of "one concern per PR" ("Branch context/import-claude · base main · a4c91e2 · one source file per PR"), and the file panel holds one TOML block per record, each opening with its own `# .oxagen/rules/<lineage>.toml` line.

  The mockup's record is a `rule` with a `constraint_effect`, which the shipped contract refuses: only a `constraint` carries an effect (`packages/oxagen/src/contracts/context.steering.shared.ts:175-190`). A build shows the file the pull request carries, whatever it holds.
- **Pull request body**: the body as opened, in markdown text. The promoter's opens "## <statement>", says it was promoted from 212 runs across 1 agent with its confidence, then "### What this asks for", "### Why" with the support and the finding id and a table of the first three supporting runs (Run, Date, Frame, Outcome, Repeat reads), "### What it costs", and the footer line "Opened by Oxagen · workspace `core-platform` · governance `team`". A person's carries the badge "written by <name>", their rationale under "### Why", the scope, and "Opened by <name>". An import's carries the same badge and opens "## Import 9 records from CLAUDE.md", then "stella parsed `CLAUDE.md` on 2026-09-11. Marcus Bell accepted these in the Markdown importer." and "One pull request per source file, so a reviewer reads a file’s rules together." Under "### Records", one line per record ("- `<lineage>` · <kind> · <force>", its constraint effect when it has one, and "from `<file>:L<line>`") with the statement under it. Then "### What it costs" with "Adds 155 steering tokens a turn to every turn in scope." and the footer "Opened by Marcus Bell · workspace `core-platform` · governance `team`".

Right column:

- **Checks**, with "the same rules as stella context validate" beside the heading. Six rows, each the check's name with its result under it and its state at the right: "pass" (a dot and the word), a spinner while running, "queued", or "fail" with the reason.

| Check | Result when it passes |
|---|---|
| Schema | "context-record/v0.1 valid · 1 file, 1 record, 1 lineage" |
| Lineage uniqueness | "no published record holds ctx.release.no-reread-changelog; this proposal is its only holder" |
| record_hash recomputation | "recomputed over the canonical bytes · sha256:9a41c0e7bd238f45 matches the file" |
| Secret and PII scan | "statement, rationale and evidence scanned · 0 findings" |
| Conflict against active records | "59 published records checked · no require on CHANGELOG.md reads" |
| constraint_effect ∈ {require, forbid} | "constraint_effect = forbid · grants nothing" |

- An import pull request with several records runs the same six, worded for the set: Schema "context-record/v0.1 valid · 9 files, 9 records, 9 lineages", Lineage uniqueness "no published record or open pull request holds any of these 9 lineages", record_hash recomputation "recomputed over the canonical bytes of 9 files · each matches its record_hash", and the constraint check "<c> of <n> carry a constraint, each require or forbid · grants nothing", or "no constraining kind · the field is absent, which is also a pass".
- The merge bar, under the checks:
  - checks running: "Checks are running. Merge is blocked until all 6 report.";
  - all passed: "6 checks passed. Governance team: Marcus Bell owns .oxagen/rules/.";
  - a check failed: "A check failed. Nothing merges and nothing is published. Change the file and open it again.";
  - then **Close pull request** (red outline; opens `closepr`) and **Merge pull request**, gold only once every check passed and disabled otherwise.
- **Merge effects**, five numbered rows: "write a promotion_event with the approver, the pull request and the commit"; "re-index the record from the merged commit; a hash mismatch blocks delivery"; "bump the bundle v41 → v42 and re-sign it · 1,340 → 1,386 steering tokens a turn"; "emit steering_published to the audit log"; and a fifth row on delivery. An import's third row counts every record it carries ("1,340 → 1,495" for the nine records from CLAUDE.md). A person's pull request, from the wizard or the importer, adds the note "Nothing above happens on the way here. The record steers nothing while this pull request is open, which is the whole reason it is a pull request." The mockup's fifth row reads "deliver it on the next model call of every run in core-platform"; the record reaches a run when its host next fetches the bundle, at the run's next session start, as the W6 scenario says, and a build says so.

**After the merge.**

- The merge bar reads "Merged by Marcus Bell" with "2026-09-11 09:16:40 UTC · squashed into main as 7d2e91a". The table row reads "merged", the Pull requests count falls by one, and the Sources count rises by one.
- **promotion_event** replaces Merge effects: record_id (`rec_01K5RW2P7QH4`), lineage_id, from → to ("proposed → published"; "authored → published" for a person's), author (a person's only), approver ("Marcus Bell · workspace.owner · core-platform"), pr_url ("github.com/a-intel/platform/pull/519"), commit_sha (`7d2e91a`), merged_at, re-indexed ("from the merged commit · sha256:9a41c0e7bd238f45 verified"), bundle ("v41 → v42 · sha256:b7d05a31c9e2f644"), tokens per turn ("1,340 → 1,386"), audit ("steering_published · evt_01K5RW2Q8") and ledger ("promotions.jsonl not written · regulated mode only; this workspace is team"). An import with several records reads its lineage_id as "9 lineages · " and the list of them.
- Actions under it: **See it in run_01K5RS7M2E8FJ3QW** and **Audit log** for the promoter's; **Open the record** (gold) and **See it in Records** for a person's, and for an import that carried one record; **See them in Records** (gold) alone for an import that carried several. Open the record lands on `/steering/sources/record/<lineage>`. Both Records buttons open Sources filtered to Steering records (`/steering?kind=record`).
- An import's merge audits `steering_published` with "9 records from CLAUDE.md · a-intel/platform#521 merged as <commit> · bundle v41 → v42". Its records are one merge, so they compile into one bundle version.

### Dialog

**`closepr`**, "Close a-intel/platform#519", subtitle "without merging".

- "The pull request closes on GitHub and nothing is published. Oxagen posts this comment on it:"
- The comment's preview: "Closed by Marcus Bell <marcus@a-intel.example>", a rule, then "Added via Oxagen" and the address of this view as the link, "https://app.oxagen.sh/a-intel/core-platform/steering/proposals/prs".
- A note: "Closing is a governed action: it is recorded in Audit with your name, and the branch stays until someone deletes it." The shipped close, `dismiss_proposal`, deletes the branch, and so does the mockup's own close of a person's pull request ("the branch is gone"); a build's note says the branch is deleted.
- Footer: Cancel and **Close pull request** (red), which reports "Closed a-intel/platform#519 without merging. Comment posted: “Closed by Marcus Bell <marcus@a-intel.example>”, then Added via Oxagen https://app.oxagen.sh/a-intel/core-platform/steering/proposals/prs."

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in `macanderson/oxagen` | Status |
|---|---|---|---|---|
| The rows | `CTXPR`, `RECPRS`, `PROPOSALS[].pr` | The proposals with a pull request | `list_proposals` `pr` (number, url, provider, repository, branch), `status` and `checks` (`packages/oxagen/src/contracts/context.proposal.list.ts:12`, `context.steering.shared.ts:207-246`) | ✅ |
| Opened by | `prTable()` | Who opened the pull request | None. `source` names who raised the proposal; nothing records who opened its pull request | 🟡 |
| The checks light and state badge | `ciLight()`, `ciFromSt()`, `prLabel()` | The six checks' states | `get_context_pr` `checks`, each with name, status (pending, running, passed, failed), summary, details URL and times (`context.pr.get.ts:9`, `context.steering.shared.ts:107-133`) | ✅ |
| Governance badge and the reviewer line | `wsGov()` | The mode read off `governance.toml` | `get_context_pr` `governanceMode` and `onMerge.review` (`context.pr.open.ts:33`, `:68-80`) | ✅ |
| The code owner named in the merge bar | the signed-in person | The repository's code owners | None (#3882) | ❌ |
| Branch, base and head | `CTXPR.branch`, `base`, `head` | The pull request | `get_context_pr` `pr` `branch`, `baseRef`, `headSha` and `path` (`context.pr.open.ts:34-50`) | ✅ |
| The record file | `recprFileText()`, the TOML in `ctxprTab()` | The file on the branch | `get_context_pr` `record` carries every field the file declares and its hash (`context.pr.open.ts:52-63`); the file's bytes are not read from GitHub (#3882) | 🟡 |
| Pull request body | `recprBody()`, the body in `ctxprTab()` | The body as opened | `get_context_pr` `body` (`context.pr.open.ts:65`) | ✅ |
| The supporting-run table inside the body | `PRP_SUPPORT` | Each cited run's outcome | None (#3881) | ❌ |
| Merge pull request | `ctxprMerge()`, `recprMerge()`, `prRecheck()` | Refused until every check passed, and until the caller is a reviewer the mode allows | `merge_context_pr` (`context.pr.merge.ts:14`): under `team` an Owner or Admin other than the author merges, under `regulated` an organization Owner or Admin other than the author, under `solo` any member | ✅ |
| Merge effects: publish, re-index, version, audit | the five rows | What merge will do | `get_context_pr` `onMerge` (`publishes`, `bundleVersion`, `review`), and `merge_context_pr` emits `steering.published` | ✅ |
| Merge effects: steering tokens a turn | `stgBundle().tok` | The bundle's tokens before and after | None | ❌ |
| promotion_event | `CTXPR.promo`, `evt`, `hash`, `S.ctxpr.mergedAt` | The ledger's promotion event | `get_context_pr` `merged` (commit, time, merged by, promotion event id, record id; `context.pr.open.ts:81-90`) and `merge_context_pr`'s `promotionEvent` (id, sequence, chain digest) and `bundleVersion` before and after | ✅ |
| promotion_event: tokens per turn, and the ledger row | `ctxprTab()` | Token deltas; which ledger was written | Token deltas: none. The ledger: `merge_context_pr` appends to the hash-chained promotions ledger on every merge (`context.pr.merge.ts:1-9`), so "not written · regulated mode only" is not what ships | 🟡 |
| Import pull requests | `RECPRS[]` with `src` and `records`, written by `wzImpPublish()` | A pull request carrying a record file for each record accepted out of one Markdown file | None. `open_context_pr` opens a pull request for one proposal with "the single record file under .oxagen/rules/" (`packages/oxagen/src/contracts/context.pr.open.ts:99`) | ❌ |
| Close pull request | `DLG_EXT.closepr`, `prClose()`, `recprDiscard()` | Close without merging | `dismiss_proposal` rejects the proposal with a reason, closes its pull request and deletes its branch (`context.proposal.dismiss.ts:1-3`, `:10`). The comment Oxagen posts is not written (#3882) | 🟡 |

## Future-only fields

The mockup marks no field on this view with `data-future`, and the catalog gives it no future-only story. These fields are future-only in `macanderson/oxagen` all the same, and a build renders each as not recorded until its contract ships: who opened a pull request, the code owner in the merge bar, the file's bytes as GitHub holds them, the supporting-run table in the promoter's body, the steering tokens a turn before and after, the comment Oxagen posts when it closes one, and a pull request that carries several records from one Markdown file.

## Functionality

- A pull request carries one record file on `context/<lineage>`: one concern, one pull request. An import pull request carries a record file for every record accepted out of one source file, on `context/import-<file slug>`, so a reviewer reads a file's rules together. A second pull request on a lineage fails Lineage uniqueness, and the one opened first keeps the claim.
- The six checks run one at a time and report in order. A check that fails stops the run where it failed: the state reads failed, merge stays blocked, and nothing is published.
- Merge re-runs every check that has a predicate. A check that passed and no longer does blocks the merge: "A check that passed no longer does. <pull request> is blocked and nothing was published."
- Merging publishes the record, writes the promotion event, re-indexes from the merged commit, bumps and re-signs the bundle, and audits `steering_published`. It reports "Merged a-intel/platform#519. promotion_event written, bundle v41 → v42 signed, steering_published audited."
- While a pull request is open, its record steers nothing: it is not in Sources, not in the compiled bundle and not in the audit log, and the bundle version has not moved.
- Merge follows the governance mode. Under `team` the author of a record is never its approver, so a person's own pull request waits for another Owner or Admin. The mockup lets Marcus Bell merge the pull request he opened and records him as author and approver; a build refuses that merge, as `merge_context_pr` does.
- Closing an unmerged pull request publishes nothing and says so. The row then reads "closed", the Pull requests count and the Proposals tab count fall by one, and the detail offers neither Close nor Merge. The mockup keeps both counts and shows the running-checks merge bar after the promoter's pull request is closed; a build does neither. A merged pull request cannot be closed: "It is merged. Taking a published record back out of force is its own pull request."
- Several pull requests a person opened may be open at once, each with its own state, file and checks.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with More lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The four tabs are one strip that scrolls sideways with Proposals in view. The table becomes a stack of cards: the pull request and its statement, then Branch, Opened by and State, each labelled. The two columns of the selected pull request stack: the file and the body first, then Checks, the merge bar and Merge effects. The file and the body scroll inside their boxes; the page never scrolls sideways. The merge bar's buttons go full width. The dialog rises from the bottom edge as a sheet. Touch targets are at least 44 px and inputs are 16 px.

## Permissions

- Read: the Steering read, `steering.read on core-platform` in the mockup's denied panel. `list_proposals` and `get_context_pr` allow an organization Owner or Admin and a workspace Owner, Member or Viewer.
- Writes, each a governed action recorded in Audit:
  - Merge pull request: `merge_context_pr`, an organization Owner or Admin, or a workspace Owner or Member, and the caller must be a reviewer the governance mode allows. An agent that calls it waits for approval.
  - Close pull request: `dismiss_proposal`, an organization Owner or Admin, or a workspace Owner.

## Backend gaps this page depends on

- A pull request's record file, code owner, closing comment and promotion event, read from GitHub (#3882).
- Who opened each pull request.
- The steering tokens a turn before and after a merge.
- The supporting runs' outcomes for the promoter's body (#3881).
- A pull request that carries several record files from one Markdown file, for the importer.

## Rules every build of this page must keep

- Merge is the publication. Nothing on the view publishes a record any other way, and nothing counts a record as in force before its merge.
- A record never grants authority. Its constraint effect is `require` or `forbid`, and only a constraint carries one.
- A supporting run carries an outcome, never a verdict. No person is scored or ranked.
- A Steering Source and a SteeringFrame are never shown as each other, and a frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- Every enforcement claim states the tier. "Enforced" only for calls routed through Oxagen.
- Headers are rollups of the rows beneath them: the Pull requests count is the open rows, and the checks light is the checks listed.
- The vocabulary holds: Steering record and pull request. No "context record" and no "Context PR" in the view's copy.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. The mockup's heading "Pull request · a-intel/platform#519" and the branch line under it carry mid-dots; those are design defects, not patterns to copy.
- Exactly one gold action per screen: Merge pull request once every check passed, Open the record after a person's merge, or See them in Records after an import with several records merges. While checks run, the view has no gold.
- A future-only field renders as not recorded in a build until its contract ships.
