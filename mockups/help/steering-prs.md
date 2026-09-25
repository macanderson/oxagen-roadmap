## Pull requests

Every open Steering record pull request in the workspace, from the promoter and from people, with where its checks stand.

### Purpose
This table answers what is on a branch waiting to publish, who opened it and whether its checks have passed. Selecting a row opens its file, body, checks and merge bar below.

### Rationale
A Steering record is a file under `.oxagen/rules/` on the main repository, and it publishes only by merging (`docs/mission-control-spec.md` §10.3). The IA gives this view one primary action, Merge, and only once every check passed (`docs/fleet-operations-ia.md`, Steering). Three things open a pull request: the promoter from a proposal it argued out of runs, a person from the record wizard, and a person from the Markdown importer, one pull request per source file. They argue differently and publish identically, so they share one table. Opened by names who opened each one. It weighs nothing. While the promoter's proposal has no pull request, the view says so and offers to open one. A pull request there comes from the promoter, out of runs. Writing a record yourself opens the same kind of pull request, argued from you rather than from runs. New source › Write one offers that path.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Rows | `RECPRS`, `CTXPR`, `PROPOSALS[].pr` | `list_proposals` `pr`, `status`, `checks` | shipped |
| Opened by | `prTable()` ("the promoter", or `me().name`) | Who opened the pull request | partial |
| Checks light and state badge | `ciLight(ciFromSt())`, `prLabel()` | `get_context_pr` `checks` | shipped |
| Governance badge | `govLabel(ws())` | `get_context_pr` `governanceMode` | shipped |
| Import rows | `RECPRS[]` with `src` and `records`, from `wzImpPublish()` | A pull request carrying several record files | future-only |

### Logic
- `ctxprTab()` calls `prTable()`. Rows, top to bottom: each person's pull request in `RECPRS` (newest first), then the promoter's `CTXPR` while `S.ctxpr.st` is not `none`, then every other proposal whose `pr` is set.
- A row with several records reads "<N> records from <file>" in place of a statement.
- `ciLight()` draws the light and "done / total": blinking while a check runs, a red cross on a failure, green when all passed, grey when queued. `prLabel()` gives the badge: "0 / 6 checks · queued", "3 / 6 checks · running", "4 / 6 · check failed", "6 / 6 checks pass", "merged" or "closed".
- Selection: `prSelect()` sets `S.prSel`. `prSelected()` shows a person's pull request whenever `RECPRS` is not empty and the promoter's is not chosen. `recprCur()` picks the selected one, else the newest still open, else the newest. The selected row carries `aria-current`.
- Only the promoter's row and people's rows are selectable. The fixture rows have no detail.
- None state: with `S.ctxpr.st` at `none`, the promoter's row is absent and the panel reads "prp_01K5RU4A is ready and has no pull request yet." with a gold **Open a pull request** that opens `ctxpr`. It steers nothing until one merges.
- Fixture defects a build does not copy: proposals a person raised read "the promoter", `#77` is merged yet listed, checks count out of 5, 7 and 4, and four rows target other workspaces' repositories.

### States
Loaded only. On a phone the table becomes cards: the pull request and its statement, then Branch, Opened by and State.

## Pull request

The selected pull request's branch and the record file it carries, as the reviewer reads it.

### Purpose
A reviewer reads the exact bytes that publish: lineage, kind, scope, statement, force, effect and hash.

### Rationale
The file is the record, so the panel shows the file, highlighted with the same TOML grammar the source editor uses. What is shown is what parses. One concern is one pull request, so a record from the wizard carries one file. An import carries one file per accepted record from one Markdown file, so a reviewer reads a file's rules together. The line under the heading says which rule applies.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Branch, base, head | `def.branch`, `def.base`, `CTXPR` | `get_context_pr` `pr` | shipped |
| The record file | `recprFileText()`, `recprFile()`, the TOML in `ctxprTab()` | `get_context_pr` `record`, and the bytes from GitHub (#3882) | partial |
| State badge | `prLabel()` | `get_context_pr` `checks` | shipped |

### Logic
- The heading is "Pull request · <number>" with the state badge at the right (`data-recpr-state` or `data-ctxpr-state`).
- The line under it: "Branch <branch> · base main · <base> · one concern per PR", or "one source file per PR" for an import.
- A person's file comes from `recprFileText(def, rec)`. It writes `schema`, `lineage_id`, `kind`, `sharing_scope` and `statement` with `tomlStr()` or `tomlMulti()`, so a quote or backslash in the statement cannot break the parse. Then `[steering] strength`, then `[enforcement] constraint_effect` and `blocking = false` when the record has an effect, or the comment "no [enforcement] table: a <kind> constrains nothing", then `record_hash`.
- `recprFile()` renders one highlighted block per record with `hlToml()`.
- The promoter's file is inline TOML in `ctxprTab()` for `ctx.release.no-reread-changelog`.
- The promoter's record is a `rule` carrying `constraint_effect = "forbid"`. The shipped contract gives an effect to a `constraint` only (`context.steering.shared.ts:175-190`). A build shows whatever file the pull request carries.
- The mid-dots in the heading and the branch line break the plain-noun rule. A build does not copy them.

### States
Loaded only. On a phone the file scrolls inside its box and the page does not.

## Pull request body

The pull request's description, as opened on GitHub.

### Purpose
A reviewer reads why the record is proposed, what it asks for and what it costs, before approving it.

### Rationale
The body is where the argument lives. The record file holds only the statement, because every agent in scope pays for the bundle's words on every turn, and a reviewer reads the reason once. The promoter argues from runs and cites its evidence. A person argues from their own rationale. The importer names the file and lines each record came from.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Body | `recprBody(def)`, the body in `ctxprTab()` | `get_context_pr` `body` | shipped |
| Supporting-run table in the promoter's body | `PRP_SUPPORT` first three rows | Each cited run's outcome (#3881) | future-only |
| Tokens a turn | `recprTok()`, `PRP_META[].tok` | Tokens before and after | future-only |

### Logic
- The promoter's body: "## <statement>", "Promoted by the oxagen promoter from **212 runs across 1 agent**, confidence 0.97.", "### What this asks for" (strength and effect, "it grants nothing"), "### Why" with the support line, the finding id and a table of the first three runs (Run, Date, Frame, Outcome, Repeat reads), "### What it costs", and "Opened by oxagen · workspace `core-platform` · governance `team`".
- A person's body (`recprBody`): "## <statement>", "Written by <name> in the record wizard on <date>.", "### What this asks for" with kind, strength, effect and the scope in words, "### Why" with the wizard's description or "(no rationale given)", "### What it costs" ("Adds <n> steering tokens a turn to every turn in scope."), and "Opened by <name>". The panel carries the badge "written by <name>".
- An import's body: "## Import <N> records from <file>", "stella parsed `<file>` on <date>. <name> accepted these in the Markdown importer.", "One pull request per source file, so a reviewer reads a file's rules together.", then "### Records", one line per record with lineage, kind, force, effect and `<file>:L<line>`, the statement under it, and the cost.
- Governance reads `team` in every body. A build writes the mode `governance.toml` declares.

### States
Loaded only. On a phone the body scrolls inside its box.

## Checks

The six checks every Steering record pull request runs, and the merge bar that follows them.

### Purpose
A reviewer sees which checks passed, which one failed and why, and whether Merge is open.

### Rationale
The checks run the same rules as `stella context validate` (`docs/mission-control-spec.md` §10.3), so a record that passes locally passes here. That line sat beside the heading and moved here. Every Steering record pull request runs the same six, whoever opened it: Schema, Lineage uniqueness, `record_hash` recomputation, Secret and PII scan, Conflict against active records, and the constraint-effect rule. The fifth catches two sensible records, written weeks apart, that together require and forbid the same call. The sixth holds a record to `require` or `forbid`, so a record never grants authority. Merge stays blocked until all six pass, because merge is the publication.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Checks and results | `recprChecks(def)`, `CTXPR.checks` | `get_context_pr` `checks` | shipped |
| Merge | `recprMerge()`, `ctxprMerge()` | `merge_context_pr` | shipped |
| Code owner in the merge bar | `me().name` | The repository's code owners (#3882) | future-only |

### Logic
- `prRun(def, st, paint)` sets the state to `opened`, waits 450 ms, then runs the checks one at a time, each for its `ms` (900, 700, 600, 900, 1,000 and 500). The run takes about 5 seconds.
- A check with a `test` predicate is evaluated when its turn comes. A false answer stops the run there: state `failed`, `failed` holds the index, the checks after it stay queued, and nothing publishes.
- Schema tests that each file parses with `tomlOf()`. Lineage uniqueness tests `lineageHit()`: a published record under the same lineage fails with "is already published. A lineage holds one record, so amend the published one instead of opening a second under its id." An open pull request opened earlier, later in `RECPRS`, fails with "is already claimed by <number>, which was opened first."
- An import's checks are worded for the set ("9 files, 9 records, 9 lineages").
- The promoter's `CTXPR.checks` carry no predicates in the mockup, so they always pass. A build runs real checks on both kinds.
- Merge re-runs every predicate with `prRecheck()`. A check that passed and no longer does blocks the merge: "A check that passed no longer does. <number> is blocked and nothing was published."
- The merge bar reads "Checks are running. Merge is blocked until all 6 report." while checks run, "6 checks passed. Governance team: <name> owns .oxagen/rules/." once they pass, and "A check failed. Nothing merges and nothing is published. Change the file and open it again." Then **Close pull request** and **Merge pull request**, gold only once every check passed.
- After the merge the bar reads "Merged by <name>" with the time and "squashed into main as <commit>", plus **Open the record** and **See it in Records** for a person's, or **See them in Records** for an import with several records.
- Under `team`, a build refuses a merge by the record's author, as `merge_context_pr` does. The mockup lets the author merge.

### States
Queued, running, passed, failed, merged and closed. A closed pull request's bar reads "Closed without merging. Nothing was published." and offers neither Close nor Merge.

## Merge effects

The five things merging will do, listed before the merge.

### Purpose
A reviewer sees the consequence of the Merge button, with the numbers, before pressing it.

### Rationale
Nothing in the list happens on the way here. The record steers nothing while its pull request is open: it is not in Sources, not in the bundle and not in the audit log, and the bundle version has not moved. That is why a Steering record is a pull request. The note saying so moved here from the panel.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Publish, re-index, version, audit | the five rows | `get_context_pr` `onMerge`, `merge_context_pr` | shipped |
| Bundle version | `stgBundle().v` | `onMerge.bundleVersion` | shipped |
| Steering tokens a turn | `stgBundle().tok`, `recprTok()` | Tokens before and after | future-only |

### Logic
The five rows, in order:
1. Write a `promotion_event` with the approver (the promoter's) or the author (a person's), the pull request and the commit.
2. Re-index the record from the merged commit. A hash mismatch blocks delivery.
3. Bump the bundle `v<n>` to `v<n+1>` and re-sign it, with the steering tokens a turn before and after ("1,340 → 1,386"). An import counts every record it carries.
4. Emit `steering_published` to the audit log.
5. Deliver it on the next model call of every run in the workspace.

The fifth row is wrong about timing. A record reaches a run when its host next fetches the bundle, at the run's next session start, and a build says so.

The panel is replaced by Promotion event once the pull request merges.

### States
Open pull requests only. On a phone the panel follows Checks.

## Promotion event

The ledger entry a merge wrote, with the bundle it produced.

### Purpose
A person confirms what the merge did: which record, which commit, which bundle version and digest, and which audit event.

### Rationale
Merge triggers a `promotion_event` with the status change, the lineage, the approver, the pull request and the commit, then a re-index from the merged commit, a bundle bump and a `steering_published` audit event (`docs/mission-control-spec.md` §10.3). Showing each field lets a person check the merge against git and Audit without Oxagen's word for it. Publishing compiles one new bundle version per merge, even for an import with nine records.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| record_id, lineage_id, from → to, approver, pr_url, commit_sha, merged_at | `CTXPR`, `def`, `S.ctxpr.mergedAt` | `get_context_pr` `merged`, `merge_context_pr` `promotionEvent` | shipped |
| bundle and digest | `stgBundle()`, `steerDigestOf()` | `merge_context_pr` `bundleVersion` | shipped |
| tokens per turn | `stgBundle().tok` | Token deltas | future-only |
| ledger | fixed text | The promotions ledger | partial |

### Logic
- `prSet(def, st, "merged")` calls `prPublish()`. It pushes the records into `RECORDS`, bumps `STEER_BUNDLE.v` once, adds each rule with `since` set to the new version, fills a missing digest with `steerDigestOf(v)`, and audits `steering_published` ("<lineage> · <number> merged as <commit> · bundle v41 → v42").
- The panel (`data-promo-bundle`) lists record_id, lineage_id ("9 lineages · …" for an import), from → to ("proposed → published", or "authored → published" with an author row for a person's), approver, pr_url, commit_sha, merged_at, re-indexed, bundle ("v41 → v42 · <digest>"), tokens per turn, audit and ledger.
- The promoter's panel adds **See it in run_01K5RS7M2E8FJ3QW**, and both add **Audit log**.
- The ledger row reads "promotions.jsonl not written · regulated mode only". `merge_context_pr` appends to the hash-chained ledger on every merge, so a build shows the entry it wrote.
- The toast: "Merged <number>. promotion_event written, bundle v41 → v42 signed, steering_published audited."

### States
Merged pull requests only.

## Close a pull request {#dialog/closepr}

The confirm before closing a pull request without merging it.

### Purpose
A person closes a pull request they will not merge, and sees the comment Oxagen will post on it first.

### Rationale
Closing is a governed action: Audit records it with the person's name. The comment names who closed it and links back to Oxagen, so a reader on GitHub knows where the decision was made. The shipped close, `dismiss_proposal`, rejects the proposal with a reason, closes the pull request and deletes the branch. The note on the dialog said the branch stays until someone deletes it, which the contract contradicts. It moved here, corrected. Nothing publishes on a close.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Comment preview | `closeComment()`, `me()` | The comment Oxagen posts (#3882) | future-only |
| Close | `prClose(kind, id)` | `dismiss_proposal` | partial |

### Logic
- `DLG_EXT.closepr(arg)` takes `kind|id`: `ctxpr|a-intel/platform#519`, `recpr|<number>`, or `oxpr|<id>` from Repositories › Changes.
- It shows "The pull request closes on GitHub and nothing is published. oxagen posts this comment on it:" and the comment: "Closed by <name> <email>", a rule, "Added via oxagen" and the link. The link is this view's address for a Steering record pull request, and `oxprUrl()` for a change.
- **Close pull request** (red) calls `prClose()`. It sets the state to `closed` and toasts "Closed <number> without merging. Comment posted: “Closed by <name> <email>”, then Added via oxagen <link>."
- A merged pull request cannot be closed. Taking a published record out of force is its own pull request.
- `recprDiscard()` removes a person's pull request outright and toasts "Nothing was published and the branch is gone." Only `tools/check-record-e2e.mjs` calls it.

### States
One state. On a phone the dialog is a bottom sheet with full-width buttons.
