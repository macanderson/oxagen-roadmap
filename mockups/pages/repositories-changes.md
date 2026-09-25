# Repository changes

| | |
|---|---|
| Route | `#/a-intel/core-platform/repositories/changes`. The path is unchanged (`fleet-operations-routes.md`, Runtimes and Repositories). One pull request is `/{org}/{ws}/repositories/changes/<id>` in the app, the address the close comment links to (`apps/app/src/features/repositories/view.ts:19-42`). In the mockup a selected change is held in page state and the hash stays `/changes` |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: Unchanged, D7 (Steering record is the only name) and the vocabulary (pull request, never Steering PR). `docs/fleet-operations-ia.md`: Workspace navigation (the Repositories count is the open pull requests Oxagen opened) and Runtimes and Repositories (Changes lists Steering record pull requests under that name). `docs/mission-control-spec.md` §10.2 and §10.3 (the pull request lifecycle and its checks) |
| Design | `mockups/src/engine.js`: `chgTab()`, `selectedOxpr()`, `oxprDetail()`, `oxprCanMerge()`, `oxprMerge()`, `ciCounts()`, `ciLight()`, `oxprCiLight()`, `oxprUrl()`, `closeComment()`, `prClose()`, `DLG_EXT.closepr`, `wzFiles()`, `wzChecks()`, `OXPR_KIND`, `PR_STATE`, inside `pRepos()`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / Repositories / Changes`: Loaded, Empty, Loading, Error, Access denied, and each state · mobile |
| Audit | `repositories-changes.audit-prompt.md` |

The Repositories header, tabs and state panels are specified in `repositories.md`.

## Job

List every pull request Oxagen has open on this workspace's repositories, of every kind, Steering record pull requests included, and take one from its checks to a merge or a close. One lifecycle covers every kind: whoever opened it, the checks, the merge and the publication are the same, and a change is in force from its merge commit.

## What is on the page

**Header and tabs** as `repositories.md`, with Changes (5) selected. The header's **Add .oxagen/** is gold on the list and on a pull request that cannot merge. It is plain when the selected pull request can merge, because **Merge pull request** is then the one gold action.

### The list

**Open pull requests panel.** Heading "Open pull requests". The subtext says there are four kinds of file and one lifecycle, and that whoever opened a pull request (a person, the promoter, or the reconciler), the checks, the merge and the publication are the same. The shell's list tools sit above the rows: "Search this list", the filters "Any state", "Any kind" and "Any opened by", Rows, sortable headers and a pager over the six rows.

Columns, in order: Change · Kind · Pull request · Opened by · State · Checks · Opened.

| Change (branch) | Kind | Pull request | Opened by | State | Checks | Opened |
|---|---|---|---|---|---|---|
| Add .oxagen/ to a-intel/mobile (`oxagen/init`) | oxagen init | a-intel/mobile#118 | Marcus Bell, Person | checks running | 2 / 5 | 6 min ago |
| ctx.release.no-reread-changelog (`context/ctx.release.no-reread-changelog`) | Steering record | a-intel/platform#523 | the promoter, Automatic | checks passed | 6 / 6 | 38 min ago |
| a-intel.release-notes-from-prs 2.1.0 → 2.2.0 (`skills/a-intel.release-notes-from-prs`) | skill | a-intel/platform#522 | Priya Natarajan, Person | checks failed | 4 / 6 | 2 h ago |
| release-manager · budget and toolbelt (`agents/release-manager`) | agent | a-intel/platform#521 | Marcus Bell, Person | checks passed | 4 / 4 | 3 h ago |
| Reconcile workspace.toml against live state (`oxagen/reconcile-2026-09-17`) | configuration | a-intel/platform#524 | the reconciler, Automatic | checks passed | 4 / 4 | 11 min ago |
| ctx.platform.changelog-once (`context/ctx.platform.changelog-once`) | Steering record | a-intel/platform#519 | Marcus Bell, Person | merged | 6 / 6 | yesterday |

- **Change** carries the kind's icon, the title, and the branch in mono beneath.
- **Kind** is one of `oxagen init` (the `.oxagen/` tree itself), `Steering record` (`.oxagen/rules/<lineage>.toml`), `skill` (`.oxagen/skills/<name>/SKILL.md`), `agent` (`.oxagen/agents/<slug>.toml`), `tool` (`.oxagen/tools/<name>.toml`) or `configuration` (`.oxagen/workspace.toml`).
- **Opened by** names a person, `the promoter` or `the reconciler`, with "Person" or "Automatic" beneath.
- **State** is a badge: `open`, `checks running`, `checks passed`, `checks failed`, `merged` or `closed`.
- **Checks** is the CI light and "done / total". The light blinks blue while any check runs, shows a red ✕ the moment one fails (pulsing while others still run), stays green when every check passed, and grey while all are queued. Its title says "running", "N failed", "all passed" or "queued".
- A row opens that pull request on click, Enter or Space (`role="button"`, `tabindex="0"`, `aria-label="Open <title>"`).

A note closes the panel: "A change takes effect at its merge commit. While its pull request is open, it steers nothing: it is not in the compiled bundle or the record index, and the bundle version has not moved."

**Automatic proposals panel.** Three openers, each with one line:

- Promoter: "Groups records across runs by lineage and opens a proposal that cites those runs. There is no threshold. A person reads the cited runs and decides."
- Reconciler: "Compares .oxagen/workspace.toml with the control plane’s live state and opens one pull request per difference. It does not edit live state to match the file."
- Person: "Every creation wizard (agent, tool, skill, and record) ends here. None of them saves straight to the database."

A note says drift is reported and never repaired in place, because a reconciler that silently edited either side would make the file a description of the past, and the pull request is the only place a person can say which of the two was right.

### One pull request

Selecting a row replaces the list with the pull request. The panel's head holds **← All changes**, the title, the CI light and the state badge. Then:

- **Facts**: Kind (the badge and the file pattern), Pull request, Branch ("<branch> → <base>"), Opened by ("<who> · <when>"), Why. The design's reasons: "An operator added this repository to core-platform." (init), "14 runs across 3 agents re-read CHANGELOG.md more than once." (#523), "A .skill bundle was uploaded to replace the pinned version." (#522), "Edited in the agent source editor." (#521), "linear was added as a provider in the app; the file did not say so." (#524), "Written in the record wizard." (#519).
- **Files this pull request carries**: one line per file, `+` for added and `~` for changed, with what changed. For #523: `+ .oxagen/rules/ctx.release.no-reread-changelog.toml`, "one record, kind = rule, force = should".
- **Checks**: a table, Check · Result · What it asserted, with a Result filter. Result is a badge: `pass`, `fail`, `running` or `queued`. The checks by kind:

| Kind | Checks, in the order they run |
|---|---|
| Steering record | `schema`, `lineage_uniqueness`, `record_hash`, `secret_pii_scan`, `conflict_against_active`, `constraint_effect` |
| oxagen init | `schema`, `layout`, `governance`, `secret_pii_scan`, `no_authority` |
| skill | `frontmatter`, `semver`, `digest`, `grants`, `secret_pii_scan`, `load_cost` |
| agent | `schema`, `toolbelt`, `budget`, `secret_pii_scan` |
| configuration | `schema`, `drift_is_real`, `no_authority`, `secret_pii_scan` |

On a failure the note "<check> stopped the run." follows, with what the check asserted, then "The checks behind it stayed queued, merge is disabled, and nothing was published." For #522: `grants` failed ("The bundle adds github__merge_pull_request to its tool list. A skill cannot raise a tier or add a tool."), and `secret_pii_scan` and `load_cost` read "Did not run: grants stopped the run."

- **What merge will do**, five numbered steps: "Squash the branch onto <base>, pinned to the commit the checks ran on." "Delete the head branch." "Re-index from the merged commit and bump the workspace bundle version." "Append the promotion event to the ledger, with the approver and the commit sha." "Write one audit event. The change is in force from that commit, not from now."
- **Actions**: **Merge pull request** is gold only when every check has reported and none failed, and disabled otherwise. **Close pull request** is red and opens `closepr`. A line at the right reads "GitHub enforces team (code-owner review) governance." when merge is enabled, or "Merge stays disabled until every check reports." otherwise. Merging reports "Merged <pull request>. Squashed onto <base>, head branch deleted, bundle bumped, promotion event and audit event written."
- A merged pull request shows, in place of the steps and actions, "Merged. The file is on main, the promotion event is on the ledger, and the workspace’s steering version is the ledger’s length." A closed one shows "Closed without merging. The comment on <pull request> names who closed it and links back here."

**Dialogs this page opens:** `closepr`, and the init wizard from the header (specified in `repositories.md`).

- **`closepr`**, "Close <pull request>", subtitle "without merging". The lead: "The pull request closes on GitHub and nothing is published. oxagen posts this comment on it:". The comment, previewed as GitHub renders it: "Closed by Marcus Bell <marcus@a-intel.example>", a horizontal rule, then "Added via oxagen" and the full address of this pull request in Oxagen as the link text (`https://app.oxagen.sh/a-intel/core-platform/repositories/changes/<id>`). The note: "Closing is a governed action: it is recorded in Audit with your name, and the branch stays until someone deletes it." Footer: **Cancel**, **Close pull request** (red). Closing reports that the pull request closed without merging and quotes the comment posted.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Steering record pull requests: the row, state, checks, files, merge | `OXPRS` (kind `record`) | `list_proposals`, `get_steering_pr`, `merge_steering_pr` | The six checks run in the order the table gives (`packages/oxagen/src/contracts/context.steering.shared.ts:106-114`). Merge is refused until every check passed and unless the merger fits the governance mode, is pinned to the checked commit, and appends the promotion event to the hash-chained ledger (`packages/handlers/src/steering.pr.merge.ts:1-15`). The app's Changes lists this kind (`apps/app/src/features/repositories/actions.ts:412-425`) | ✅ |
| Close | `DLG_EXT.closepr`, `prClose()` | `dismiss_proposal` | Closes the pull request, deletes its branch and publishes nothing. The previewed comment is recorded as the reason and is not posted on GitHub (`apps/app/src/features/repositories/actions.ts:524-543`; `apps/app/messages/repositories.json`, `closepr.notPosted` and `closepr.note`) | 🟡 |
| Oxagen init pull requests | `OXPRS` (kind `bootstrap`) | `open_init_pr`, and a list of them | `open_init_pr` opens one after checking it before the push, and a person merges it on GitHub (`packages/oxagen/src/contracts/repository.init_pr.open.ts:1-35`). Changes does not list it (`apps/app/src/features/repositories/changes.tsx:136-139`) | 🟡 |
| Skill pull requests | `OXPRS` (kind `skill`) | `propose_skill`, and a list of them | `propose_skill` opens one after six checks run before the push, and a failed check writes nothing (`packages/oxagen/src/contracts/skill.propose.ts:1-21`). Not listed, and nothing merges it through Oxagen | 🟡 |
| Agent pull requests | `OXPRS` (kind `agent`) | `propose_agent`, `commit_agent_definition`, and a list | Both open one (`packages/oxagen/src/contracts/agent.propose.ts:277-281`; `agent.definition.commit.ts:1-24`). Not listed, and nothing merges it through Oxagen | 🟡 |
| Tool pull requests | `OXPR_KIND.tool` | a manifest under `.oxagen/tools/` | None. `import_tools` registers a tool directly and writes no file (`packages/oxagen/src/contracts/tool.import.ts:25-29`) | ❌ |
| Configuration pull requests and the reconciler | `OXPRS` (kind `config`) | the reconciler | Not built (`repositories.json`, `changes.auto.reconciler.what`) | ❌ |
| Opened by | `OXPRS[].by`, `.byKind` | the proposal's author | A person ships. The app names any other opener "another source", and the promoter and the reconciler as named openers are not recorded | 🟡 |
| Why | `OXPRS[].trigger` | the proposal's reason | Prints "not recorded" where the proposal carries none (`apps/app/src/features/repositories/change-detail.tsx:296-337`) | 🟡 |
| The Changes count (open pull requests) | `oxprOpen()` | the open proposals | Open Steering record pull requests ship. The other kinds are not counted | 🟡 |

The same Steering record pull request also appears on Steering, Pull requests (`/steering/proposals/prs`). Both views read one record, so a merge or a close from either is the same action.

## Future-only fields

The view carries no `data-future` mark. These are future-only all the same, and a build prints each as not listed or not recorded until its contract ships: the tool and configuration kinds, the reconciler as an opener, the comment posted on GitHub when a pull request closes, and the listing of init, skill and agent pull requests, which ship as writes without a list. A build lists the kinds it can read and says in one line which kinds have no list yet.

## Functionality

- **One lifecycle.** A pull request opens on a branch and never on the production branch. Its checks run in order, and the first failure stops the run: the checks behind it stay queued, merge is disabled and nothing is published.
- **Where the checks run.** A Steering record's six checks run on its pull request and are stored with it, so a Steering record pull request can sit in `checks failed` until it is fixed. The skill, agent and init writes run their checks before they push, and a failed check pushes nothing, so today those kinds never reach this list with a failed check. The design's #522, a skill pull request with a failed check, is a state no shipped skill write produces.
- **Merge is enabled only** when every check has reported, none failed, and the pull request is not already merged. The header gives up its gold only then. Merging squashes the branch onto the base, pinned to the commit the checks ran on, deletes the head branch, re-indexes from the merged commit, bumps the workspace's bundle version, appends the promotion event to the hash-chained ledger with the approver and the commit, and writes one audit event.
- **The governance mode** is read from `.oxagen/rules/governance.toml` on the production branch when a pull request is opened and again when it is merged, so the line beside Merge names the mode in force.
- **In force from the merge commit.** While a pull request is open, what it carries steers nothing: it is not in the compiled bundle or the record index, and the bundle version has not moved.
- **Closing** publishes nothing, is a governed action, and lands in Audit with the person's name. The comment names who closed it and links back to the pull request in Oxagen.
- **Nothing in `.oxagen/` grants authority.** A check refuses a record, skill, agent or init tree that tries: `constraint_effect`, `grants`, `toolbelt` and `no_authority`.
- **Drift is reported, never repaired in place.** The reconciler opens a pull request per difference and never edits live state or the file on its own.
- **Selecting a row** holds the selection only for this workspace: a selection from another workspace never renders here.

## States

The catalog lists all five. The header, tabs and state panels are the Repositories ones in `repositories.md`. Empty reads "This workspace has no repository yet" with **Connect repository**. Loading is the skeleton. Error reads "Repositories could not be loaded" with `503 installation_unreachable`. Access denied reads "You cannot see this workspace’s repositories" and names `repository.read on core-platform`. The app's own empty list reads "Oxagen has no pull request open or merged on this workspace’s repositories." (`repositories.json`, `changes.empty`).

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with More lit. More holds Steering, Runtimes, Repositories (5), Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The tab strip scrolls within itself. The list becomes one card per pull request, each cell labelled with its column, with the CI light and its count on the Checks line. The detail view stacks: facts, files, the checks as cards, the merge steps, then the actions at full width. `closepr` rises from the bottom edge as a sheet with full-width footer buttons. The page never scrolls sideways at 390 px.

## Permissions

- Read: `repository.read`. Shipped: `list_proposals` and `get_steering_pr` allow org Owner and Admin, and workspace Owner, Member and Viewer.
- Merge: `merge_steering_pr`, org Owner or Admin, or workspace Owner or Member, and then only a merger the governance mode allows. Under `team` that is an org Owner or Admin, or a workspace Owner, other than the author. Under `regulated` it is an org Owner or Admin other than the author. Under `solo` it is any workspace member.
- Close: `dismiss_proposal`, org Owner or Admin, or workspace Owner.
- Opening a pull request belongs to the page that drafts it: the record, skill, agent and init wizards.

## Backend gaps this page depends on

- One list of every pull request Oxagen opened, of every kind, with state and checks.
- Merging skill, agent and init pull requests through Oxagen, to match `merge_steering_pr`.
- Tool manifests under `.oxagen/tools/` and their pull requests.
- The reconciler and the drift record it reads.
- Posting the close comment on GitHub.
- The opener of a proposal when it is not a person.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- A Steering Source and a SteeringFrame are never shown as each other. A pull request changes a source. The frames a merged source emits appear on its source page and in each run's Decision trace, not here.
- Every state, check result and count reads the record: the proposal, its checks as stored and mirrored to GitHub, and the ledger. No check result is inferred.
- No person is scored or ranked. Opened by names who opened the pull request, and nothing more.
- Every enforcement claim states the tier. A pull request steers nothing until it merges, and nothing in `.oxagen/` grants authority.
- Headers are rollups of the rows beneath them. The Changes count equals the open pull requests in the list, merged and closed ones excluded.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: **Merge pull request** when it can merge, the header's **Add .oxagen/** otherwise.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- The words are pull request and Steering record. No older name for either appears on screen.
