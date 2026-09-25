## Open pull requests

The list of every pull request Oxagen has open on this workspace's repositories, of every kind, with its state and its checks.

### Purpose
It answers what is waiting to change in `.oxagen/`, who opened it, and whether its checks let it merge. A row opens that pull request.

### Rationale
Every change to `.oxagen/` arrives as a pull request, and one lifecycle covers every kind. Whoever opened it (a person, the promoter, or the reconciler), the checks, the merge and the publication are the same. That subtitle moved here from the panel. So did the closing note. A change takes effect at its merge commit. While its pull request is open, it steers nothing: it is not in the compiled bundle or the record index, and the bundle version has not moved (`docs/mission-control-spec.md` §10.3). The words are pull request and Steering record (D7). Context PR appears nowhere on screen.

Opened by names one of three openers, and a pull request an automatic opener made needs the same review as one a person made:
- **The promoter** groups records across runs by lineage and opens a proposal that cites those runs. It applies no threshold. A person reads the cited runs and decides. The promoter picks the scope from where the evidence came (§10.3).
- **The reconciler** compares `.oxagen/workspace.toml` with the control plane's live state and opens one pull request per difference. Its differences show on Configuration, in Drift. It reports drift and never repairs it: it does not edit live state to match the file, or the file to match live state. A reconciler that silently edited either side would make the file a description of the past, so a person decides which side is right, in the pull request.
- **A person**: every creation wizard (agent, tool, skill, and record) ends here. None of them saves straight to the database.

The tab used to explain the three openers in an Automatic proposals panel under the list. It only taught what the Opened by column means and counted nothing, so it left the page and its content lives here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Steering record pull requests | `OXPRS` kind `record` | `list_proposals`, `get_context_pr` | shipped |
| Init, skill and agent pull requests | `OXPRS` kinds `bootstrap`, `skill`, `agent` | `open_init_pr`, `propose_skill`, `propose_agent`, and a list of them | partial |
| Tool and configuration kinds | `OXPR_KIND.tool`, `OXPRS` kind `config` | tool manifests, the reconciler | future-only |
| Opened by | `OXPRS[].by`, `.byKind` | the proposal's author | partial |
| The reconciler as an opener | `OXPRS` kind `config` | the reconciler | future-only |
| State and checks | `.state`, `.checks`, `PR_STATE` | the proposal's checks as stored | shipped |

### Logic
- `chgTab()` reads `wsOxprs()`, the pull requests on this workspace's repositories. With a selection, it renders the pull request instead.
- **Change** shows the kind's icon, the title, and the branch. `OXPR_KIND` names each kind and its file: `oxagen init` (the tree), Steering record (`.oxagen/rules/<lineage>.toml`), skill, agent, tool, and configuration (`.oxagen/workspace.toml`).
- **Opened by** names a person, "the promoter" or "the reconciler", with Person or Automatic beneath. A build names the promoter and the reconciler only once the proposal records them. Today the app calls any other opener "another source".
- **State** maps through `PR_STATE`: open, checks running, checks passed, checks failed, merged, closed.
- **Checks** is `oxprCiLight()`, one light and "done / total". `ciLight()` blinks blue while any check runs, shows a red cross once one fails (pulsing while others run), stays green when every check passed, and stays grey while all are queued.
- `rowClick()` sets `S.oxprSel` and renders. Enter and Space open it too.
- The Changes tab count is `oxprOpen()`, which leaves out merged and closed rows. The list itself keeps them.

### States
- **Loaded**: six rows, five open.
- **Empty list in a build**: "Oxagen has no pull request open or merged on this workspace's repositories."
- **Build today**: lists the kinds it can read and says in one line which kinds have no list yet.
- **Mobile**: one card per pull request.

## Pull request

One pull request in full, in place of the list: its facts, its files, its checks, and merge or close.

### Purpose
It answers why this change exists, what it changes, which checks passed, and whether it can merge now. A person merges it or closes it from here.

### Rationale
A person needs the evidence and the gate together before they merge. The view carries both, so nobody merges from the list. The "What merge will do" list moved here from the view. Merge does five things, in order.
1. Squashes the branch onto the base, pinned to the commit the checks ran on.
2. Deletes the head branch.
3. Re-indexes from the merged commit and bumps the workspace bundle version.
4. Appends the promotion event to the ledger, with the approver and the commit sha.
5. Writes one audit event.

The change is in force from that commit, not from the moment someone clicked. The workspace's steering version is the ledger's length, a clause that moved here from the merged note (§10.3).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Kind, pull request, branch, opened by | `OXPRS` via `selectedOxpr()` | `get_context_pr` | shipped |
| Why | `.trigger` | the proposal's reason | partial |
| Files | `.files`, `wzFiles()` | the pull request's diff | shipped |
| Checks | `.checks` | the stored check runs | shipped |
| Merge | `oxprMerge()` | `merge_context_pr` | shipped for Steering records |
| Close | `openDialog('closepr')` | `dismiss_proposal` | partial |

### Logic
- `selectedOxpr()` resolves `S.oxprSel` against this workspace's list, so another workspace's selection never renders. `/repositories/changes/<id>` opens one directly.
- The head holds **← All changes**, the title, the CI light and the state badge. The panel carries `data-help="pull-request"` because its heading is the title.
- Checks run in order, and the first failure stops the run. On a failure the note reads "<check> stopped the run.", then what it asserted, then "The checks behind it stayed queued, merge is disabled, and nothing was published."
- `oxprCanMerge()` is true only when every check reported, none failed, and the state is not merged. **Merge pull request** is gold then, and the header's **Add .oxagen/** turns plain. Otherwise Merge is disabled.
- The line beside the buttons reads "GitHub enforces <mode> governance." (`govLabel()`) or "Merge stays disabled until every check reports."
- **Close pull request** (red) opens `closepr`, which another page's help covers.
- Merged reads "Merged. The file is on <base> and the promotion event is on the ledger." Closed reads "Closed without merging. The comment on <pull request> names who closed it and links back here."

### States
- **Merged or closed**: the note replaces the actions.
- **Mobile**: facts, files, checks as cards, then the actions at full width.

