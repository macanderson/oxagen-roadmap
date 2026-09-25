## .oxagen/workspace.toml

The workspace's configuration file as the main repository holds it on the production branch.

### Purpose
It shows a person what the workspace declares about itself: its repositories and their roles, its providers, and its budgets. The subtext names where the file was read: "On a-intel/platform at a4c91e2".

### Rationale
The file is the record. Git decides what is in force, so the panel reads the main repository's production branch at the moment of the call and never a cache (`docs/mission-control-spec.md` §10.1). The file lives in the main repository only, because the main repository is where the workspace's steering and configuration are managed in source control.

The Tree panel beside `governance.toml` lists every path under `.oxagen/` at the same head.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The file | `oxWorkspaceToml()` | `get_repository_tree` `workspaceToml` | shipped |
| Repository and head | `repoByName(w.main)`, else `repoRecordFor()` | `get_repository_tree` `head` | shipped |

### Logic
- `cfgTab()` always reads the workspace's main repository, `repoByName(w.main)`. It never takes the first row of `wsRepos()`, which can hold a repository nobody has bound.
- When the fixtures hold no row for main, `repoRecordFor()` mints one, and the subtext reads "On <repository> · not indexed yet".
- `oxWorkspaceToml(w, repo, "team", "main")` writes the file: two comment lines, `schema`, `org`, `workspace`, one `[[repos]]` table (`name`, `role`, `production_branch`, `issues`), `[providers]` with GitHub and Linear, and `[budget]` with `monthly_usd` and `per_run_usd`.
- The file panel and the Drift table describe the same file at the same commit, so a value in one cannot contradict the other.

### States
- **Loaded**: the file in full.
- **No file on the production branch**: the app prints "Not on the production branch yet. Add Oxagen to this repository to put it there." (`apps/app/src/features/repositories/configuration.tsx:92-97`).
- **Mobile**: the block scrolls sideways inside itself, and the page never does.

## Drift

The differences between `workspace.toml` and the control plane's live state, and how each one gets resolved.

### Purpose
It answers where the file and the live state disagree, and sends a person to the reconciliation pull request, where they decide which side is right.

### Rationale
The panel compares the file with the control plane's live state. That subtitle moved here. Drift is reported, never repaired in place. The reconciler opens one pull request per real difference, and it never edits the live state to match the file or the file to match the live state. The note under the table moved here too. Where the reconciler read both sides, it proposes the file's value. A linked repository with no `.oxagen/` is a scope decision, so it waits for a person (§10.1: Oxagen reconciles the declarations against Postgres and reports drift).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Rows | `DRIFT[w.slug]` | the reconciler's drift record | future-only |
| See the pull request | `DRIFT_PR[w.slug]` | the reconciliation pull request | future-only |

### Logic
- Drift is a fact about one workspace's file against its own live state. `DRIFT` and `DRIFT_PR` are keyed by workspace slug, so another workspace's rows never render here.
- Columns: Declared, In the file, Live, Resolution.
- Resolution reads **Use the file** in the neutral ink when the reconciler read both sides, or **A person decides** in the approval ink.
- **See the pull request** moves to Changes with that pull request selected.
- With no drift recorded, the table gives way to "The reconciler last compared <main repository> with the control plane and found no drift."

### States
- **Loaded**: three rows on Core platform.
- **No drift**: the one-line note.
- **Build today**: the reconciler is not built, so the build prints that drift is not recorded yet and never shows fixture rows (`configuration.tsx:145-148`).
- **Mobile**: one card per row.

## .oxagen/rules/governance.toml

The file that sets the governance mode every pull request on this workspace is judged under.

### Purpose
It shows the mode in force, `team` in the demo, as the production branch holds it.

### Rationale
The mode decides who may merge a change to `.oxagen/`, so it is read from git like everything else. Oxagen reads the mode from the production branch when a pull request opens and again when it merges, so raising it applies to every open pull request. A file that names no mode blocks both steps and does not fall back to `team`. A missing file means `team` (§10.3).

The mode legend moved here from the panel.
- `solo`: the author may merge their own.
- `team`: a code-owner review is required. This is what a missing file means.
- `regulated`: a named approver from a role must approve, and the promotion ledger is hash-chained.

The shipped gate differs from that legend, and the build states the gate. Under `solo` any workspace member merges, the author included. Under `team` an org Owner or Admin, or a workspace Owner, other than the author merges. Under `regulated` an org Owner or Admin other than the author merges, recorded as the accountable approver. No code-owner review is checked, and every merge appends to the hash-chained ledger in every mode (`packages/handlers/src/context.steering.policy.ts:47-78`, `context.pr.merge.ts:11-14`).

The moved note also said "You change the mode with a pull request. There is no setting for it." The second sentence is wrong. `set_governance_mode` ships from Organization, Workspaces, Edit workspace. Under `solo` it commits the file. Under `team` or `regulated` it opens a pull request. An owner or admin may apply it at once, which emits a `steering.governance_overridden` security event.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The file and mode | `oxGovernanceToml("team")` | `get_repository_tree` `governanceToml`, `governanceMode` | shipped |
| What each mode requires | this section | the merge gate | partial |
| Changing the mode | none on this page | `set_governance_mode` | shipped |

### Logic
- The panel prints the file only: two comment lines, `mode`, and `separation_of_duties`, which is true only under `regulated`.
- `governanceMode` can read `solo`, `team`, `regulated`, `absent` or `invalid`. The build prints `absent` as `team` and `invalid` as blocking.

### States
- **Loaded**: the file, beside Tree.
- **Mobile**: stacks third.

## Tree

Every committed path under `.oxagen/` on the main repository's production branch, as an indented tree, with the file count.

### Purpose
It shows a person what the main repository actually holds under `.oxagen/`: which records, agents and skills are published, and whether the governance file and the ledger exist. A path missing here is not in force.

### Rationale
The app lists the real paths under `.oxagen/` at the head (`get_repository_tree` `oxagen.files`; `apps/app/src/features/repositories/configuration.tsx:199-208`), so the panel is record data and stays. The design used to draw a fixed layout with placeholder paths (`ctx.<set>.<slug>.toml`, `agents/<slug>.toml`) and one teaching comment per entry. The panel now lists the paths themselves, and the layout moved here:

```
.oxagen/
  workspace.toml             # linked repos, providers, budgets
  workspace.json             # gitignored, this machine's link
  rules/
    governance.toml          # the governance mode
    promotions.jsonl         # the hash-chained promotion ledger
    ctx.<set>.<slug>.toml    # one published record per lineage
  proposals/*.toml           # candidates that steer nothing
  agents/<slug>.toml         # one per agent
  skills/<name>/SKILL.md     # pinned by version and digest
  tools/<name>.toml          # manifest, schema, handler beside it
```

`workspace.json` never appears in the panel, because it is gitignored and lives only on a machine. Oxagen reads only `.oxagen/`. It does not read `.stella/`, and whatever sits there is invisible to it. Stella links `.stella/rules`, `.stella/proposals` and `.stella/agents` into `.oxagen/`, so the two never hold separate copies (`docs/mission-control-spec.md` §10.2). That note sat under the old panel and moved here. Every file in the tree is a Steering Source or configuration, and the SteeringFrames a source emits appear on its source page (D4).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The paths | `OX_TREE[w.main]` | `get_repository_tree` `oxagen.files` | shipped |
| The file count | `OX_TREE[w.main].length` | the same list | shipped |

### Logic
1. `cfgTab()` reads `OX_TREE` for the workspace's main repository, never the first row of `wsRepos()`.
2. `oxTreeText()` prints each directory once, then its files beneath it, indented two spaces per level.
3. The badge counts the paths. For `a-intel/platform` it reads "9 files", the same count the Repositories tab shows beside Present.
4. The fixture's nine paths follow the rest of the record: `ctx.platform.changelog-once.toml` from the merged #519, `agents/release-manager.toml` which #521 modifies, and the four skills in `skills.json`.
5. With no list for the main repository, the panel reads "No path under .oxagen/ is recorded for <repository> yet."
6. The panel carries no comment beside a path. A build prints the paths as `get_repository_tree` returns them.

### States
- **Loaded**: the tree and its count, beside `governance.toml`.
- **No list for the main repository**: the one line above.
- **No `.oxagen/` on the production branch**: the app says the file is not there yet, as the `workspace.toml` panel does.
- **Mobile**: stacks last. The block scrolls sideways inside itself.
