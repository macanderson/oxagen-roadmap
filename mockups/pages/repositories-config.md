# Repository configuration

| | |
|---|---|
| Route | `#/a-intel/core-platform/repositories/config`. The path is unchanged (`fleet-operations-routes.md`, Runtimes and Repositories). The app serves this tab at `/{org}/{ws}/repositories/configuration` (`apps/app/src/features/repositories/view.ts:11-16`) |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: Unchanged (Repositories keeps its design) and D7 (Steering record). `docs/fleet-operations-ia.md`: Runtimes and Repositories. `docs/fleet-operations-routes.md`: Runtimes and Repositories. `docs/mission-control-spec.md` §10.2 (the `.oxagen/` layout, `workspace.toml` and `governance.toml`) and §10.3 (the lifecycle the governance mode gates) |
| Design | `mockups/src/engine.js`: `cfgTab()`, `oxWorkspaceToml()`, `oxGovernanceToml()`, `repoByName()`, `repoRecordFor()`, `DRIFT`, `DRIFT_PR`, inside `pRepos()`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / Repositories / Configuration`: Loaded, Empty, Loading, Error, Access denied, and each state · mobile |
| Audit | `repositories-config.audit-prompt.md` |

The Repositories header, tabs and state panels are specified in `repositories.md`.

## Job

Show the workspace's configuration as the main repository holds it on the production branch, beside what the control plane actually has, and the governance mode every pull request is judged under. The file is the source of truth. Where the file and the live state differ, the page reports the difference and sends it to a pull request. It never repairs either side in place.

## What is on the page

**Header and tabs** as `repositories.md`, with Configuration selected. The tab carries no count. The header's **Add Oxagen to a repository** is the gold action.

Two rows of two panels.

**`.oxagen/workspace.toml`.** Subtext "On a-intel/platform at a4c91e2", or "On <repository> · not indexed yet" when the head is unknown. The file in full: its two comment lines (what the file is, and that the machine's link is the gitignored `.oxagen/workspace.json`), `schema = "oxagen-workspace/v0.1"`, `org`, `workspace`, one `[[repos]]` table with `name`, `role`, `production_branch` and `issues`, a `[servers]` table naming `github` and `linear` with their transport and downscope, and a `[budget]` table with `monthly_usd` and `per_run_usd`. The panel always shows the workspace's main repository, never the first repository in a list.

**Drift.** Subtext "The file against what the control plane has. Reported, never repaired in place." **See the pull request** (small) opens Changes on the reconciliation pull request. The shell's list tools sit above the rows: Rows and a pager over the three rows. Columns: Declared · In the file · Live · Right.

| Declared | In the file | Live | Right |
|---|---|---|---|
| `[servers.linear]` | absent | present since 2026-09-14 | the file |
| `budget.monthly_usd` | 400 | 600 | the file |
| `[[repos]] a-intel/mobile` | role = linked | linked, no .oxagen/ | a person decides |

Right is a badge: `the file` in the neutral ink, or `a person decides` in the approval ink. The note beneath: "Two of these the reconciler can argue for, because it read both sides. The third it cannot: a repository with no .oxagen/ is a decision about scope, not a difference between two records, so it waits for a person."

With no drift recorded for the workspace, the panel drops the table and says the reconciler read the main repository against the control plane and found nothing between them, and that an empty table means the file and the live state agree, not that nobody looked. Drift belongs to one workspace: another workspace's rows never render here.

**`.oxagen/rules/governance.toml`.** The file in full: two comment lines (it is read on the production branch when a pull request is opened and again when it is merged, and a missing file means team), `mode = "team"` and `separation_of_duties = false`. Beneath, the three modes:

- `solo`: "The author may merge their own."
- `team`: "A code-owner review is required. This is what a missing file means."
- `regulated`: "A named approver from a role must approve, and the promotion ledger is hash-chained."

A note says the mode is read on the production branch when a pull request is opened and again when it is merged, so raising it takes effect on everything still open. It says the mode changes by a pull request like everything else. It says a file which exists but names no mode refuses both opening and merging rather than falling back to `team`.

**Tree.** `.oxagen/` as it sits on disk, one comment per entry:

```
.oxagen/
  workspace.toml             # linked repos, servers, budgets
  workspace.json             # gitignored · this machine’s link
  rules/
    governance.toml          # mode = team
    promotions.jsonl         # hash-chained ledger (regulated)
    ctx.<set>.<slug>.toml    # one published record per lineage
  proposals/*.toml           # candidates; steer nothing
  agents/<slug>.toml         # one per agent
  skills/<name>/SKILL.md     # pinned by version and digest
  tools/<name>.toml          # manifest, schema, handler beside it
```

The note: "Oxagen reads .oxagen/ and nothing else. Whatever sits under .stella/ is invisible to it, and it never looks."

**Dialogs this page opens:** none of its own. **See the pull request** moves to Changes, and the header opens the init wizard (specified in `repositories.md`).

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| `workspace.toml` on the production branch, and the head it was read at | `oxWorkspaceToml()`, `repoByName()` | `get_repository_tree`: `workspaceToml`, `head` | Read from GitHub through the installation at the moment of the call (`packages/oxagen/src/contracts/repository.tree.get.ts:40-95`). The app prints the file, or "Not on the production branch yet. Add Oxagen to this repository to put it there." (`apps/app/src/features/repositories/configuration.tsx:92-97`) | ✅ |
| Drift, and See the pull request | `DRIFT`, `DRIFT_PR` | the reconciler and the drift record it writes | Not built. The app prints that drift is not recorded yet because the reconciler is not built (`configuration.tsx:145-148`) | ❌ |
| `governance.toml` and the mode it declares | `oxGovernanceToml()` | `get_repository_tree`: `governanceToml`, `governanceMode` (`solo`, `team`, `regulated`, `absent`, `invalid`) | `repository.tree.get.ts:40-95`; the app prints the mode and the file (`configuration.tsx:160-176`) | ✅ |
| What each mode requires | `cfgTab()` copy | the merge gate | The gate differs from the copy. Under `solo` any workspace member merges, the author included. Under `team` an org Owner or Admin, or a workspace Owner, other than the author merges. Under `regulated` an org Owner or Admin other than the author merges, recorded as the accountable approver (`packages/handlers/src/context.steering.policy.ts:47-78`). No code-owner review is checked | 🟡 |
| Changing the mode | `cfgTab()` copy | `set_governance_mode` | Ships, from Organization, Workspaces, Edit workspace: under `solo` it commits the file to the production branch, and under `team` or `regulated` it opens an ordinary pull request a person merges on GitHub. An owner or admin may apply it at once, which emits a `steering.governance_overridden` security event (`packages/oxagen/src/contracts/context.governance_mode.set.ts:1-58`) | ✅ |
| The hash-chained ledger | `cfgTab()` copy | the promotions ledger | Every merge appends the promotion event to the hash-chained ledger, in every mode (`packages/handlers/src/context.pr.merge.ts:11-14`) | ✅ |
| Tree | a constant in `cfgTab()` | `get_repository_tree`: `oxagen.files` | Every path under `.oxagen/` at the head ships, and the app lists them (`configuration.tsx:199-208`). The comments are design copy | ✅ |

## Future-only fields

The view carries no `data-future` mark. Drift and its **See the pull request** are future-only all the same: a build prints that drift is not recorded until the reconciler ships, and never shows fixture rows.

## Functionality

- **The file is the record.** Every panel reads the main repository's production branch at the moment of the call, never a cache, because git decides what is in force.
- **Drift is reported, never repaired in place.** The reconciler compares the file with the live state and opens one pull request per real difference. It never edits live state to match the file, or the file to match live state. A difference the reconciler cannot argue for, such as a linked repository with no `.oxagen/`, waits for a person.
- **The governance mode** is read from `.oxagen/rules/governance.toml` when a pull request is opened and again when it is merged, so raising it applies to everything still open. A missing file means `team`. A file that exists but names no mode refuses opening and merging.
- **What each mode requires** is what the merge gate enforces. The page states the gate's rule for each mode and claims no review the gate does not check.
- **Changing the mode** goes through `set_governance_mode`, from the workspace's settings: a commit under `solo`, a pull request under `team` and `regulated`, or an override that emits a security event.
- **Oxagen reads `.oxagen/` and nothing else.** Whatever sits under `.stella/` is invisible to it.

## States

The catalog lists all five. The header, tabs and state panels are the Repositories ones in `repositories.md`. Empty reads "This workspace has no repository yet" with **Add Oxagen to a repository**. Loading is the skeleton. Error reads "Repositories could not be loaded" with `503 installation_unreachable`. Access denied reads "You cannot see this workspace’s repositories" and names `repository.read on core-platform`. On this tab the loaded state has two more forms: no drift recorded (the note above), and, in the app, no `workspace.toml` on the production branch yet.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with More lit. More holds Steering, Runtimes, Repositories (5), Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The tab strip scrolls within itself, and Configuration is its last tab. The two rows of panels stack into one column: `workspace.toml`, Drift, `governance.toml`, Tree. Each file block scrolls sideways inside itself, and the page never does at 390 px. The Drift table becomes one card per row, each cell labelled with its column.

## Permissions

- Read: `repository.read`. Shipped: `get_repository_tree` allows org Owner and Admin, and workspace Owner and Member.
- Changing the governance mode: `set_governance_mode`, org Owner or Admin, or workspace Owner or Admin, from the workspace's settings. The override is recorded as a security event.
- Merging the reconciliation pull request: as any pull request on Changes (`repositories-changes.md`).

## Backend gaps this page depends on

- The reconciler, and the drift record it writes per workspace.
- Mode copy that states what the merge gate enforces.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- A Steering Source and a SteeringFrame are never shown as each other. The tree lists sources as files. The frames they emit appear on each source's page, not here.
- Every file and every mode on this page is read from the production branch at the moment of the call. No drift is inferred: a row exists only where the reconciler read both sides.
- No person is scored or ranked.
- Every enforcement claim states the tier. The mode copy claims only what the merge gate enforces, and nothing in `.oxagen/` grants authority.
- Headers are rollups of the rows beneath them. The file panel and the Drift table describe the same file at the same commit, so a value in one cannot contradict the other.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: the header's **Add Oxagen to a repository**.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
