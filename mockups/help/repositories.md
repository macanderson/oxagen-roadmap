## Header

The Repositories page header: the workspace name, the title, and the one action that adds `.oxagen/` to a repository.

### Purpose
It names the page and the workspace, and it offers the first step every other file depends on: putting the `.oxagen/` tree into a repository. A person arrives here to find out where the workspace's files live, and **Add .oxagen/** is the thing they do next when a repository has none.

### Rationale
One argument runs through all four tabs. `.oxagen/` is the workspace's source of truth, it lives in git, and every change to it arrives as a pull request. Repositories is the binding, Working copies is the same directory on someone's disk, Changes is every pull request Oxagen has open, and Configuration is the file beside the control plane's live state (the comment above `OXPR_KIND` in `mockups/src/engine.js`). Nothing on the page writes a row a file should hold, and nothing here merges without a person.

The subtitle "Where this workspace's files live and every change oxagen has proposed to them." left the page. It restated the page title, so this section carries it instead. The fleet operations wedge kept this page's design (Unchanged, `docs/fleet-operations-wedge.md`) and changed only its words (D7: Steering record, pull request).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow | `ws().name` | the workspace record | shipped |
| Add .oxagen/ | `wzOpen('init')` | `bind_main_repository` or `link_repository`, `set_production_branch`, `open_init_pr` | shipped |

### Logic
- `pRepos()` renders the header, the tab bar and the body of the selected tab.
- **Add .oxagen/** opens the init wizard (`wzOpen('init')`) with no repository chosen. The wizard lists only repositories with no `.oxagen/`.
- Exactly one gold action per screen. The header gives up its gold where the tab below holds the one primary action. `tabPrimary` in `pRepos()` is true on Working copies, where **Connect a directory** is gold, and on Changes when `oxprCanMerge(selectedOxpr())` is true, where **Merge pull request** is gold. Everywhere else the header's button is gold.
- `selectedOxpr()` validates the selection against this workspace, so a stale selection never demotes the header for a primary that is not on screen.

### States
- **Loaded**: as above on every tab.
- **Empty, loading, error, denied**: the state panel replaces the header and the tabs. Empty reads "This workspace has no repository yet" with **Connect repository** (gold, the same init wizard). Error names `503 installation_unreachable`. Denied names `repository.read on core-platform`.
- **Mobile**: the action sits under the title and keeps its full width.

## Tabs

The tab bar that switches between Repositories, Working copies, Changes and Configuration, with a count where something is out of step.

### Purpose
It answers, before a click, how many repositories the workspace connects, how many working copies trail the production branch, and how many pull requests are open. A person picks the tab whose count needs attention.

### Rationale
The four tabs are one lifecycle seen from four places, so they share one header. `docs/fleet-operations-ia.md` (Runtimes and Repositories) keeps all four unchanged. A count appears only where it reports something the rows show: the count is a rollup of the list beneath it, never a separate number.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Repositories count | `wsRepos()`, rows whose role is not `available` | `list_repositories` | shipped |
| Working copies count | `wsCopies()`, rows not `in-sync` | a working-copy record | future-only |
| Changes count | `oxprOpen()`, rows not `merged` or `closed` | `list_proposals` for Steering record pull requests | partial |
| Configuration | none | none | shipped |

### Logic
- `pRepos()` reads the tab from `tab("repositories","repos")`. The route sets `S.tab.repositories` from the path: `/repositories`, `/repositories/working-copies`, `/repositories/changes` and `/repositories/configuration`. The old `/copies` and `/config` segments rewrite in place.
- A click calls `go(repoTabHref(t))`, so every tab is a URL and the back button works.
- Repositories counts main and linked rows (4 in the demo). Working copies counts copies whose `.oxagen/` state is not `in sync` (2). Changes counts open pull requests (5); merged and closed ones are left out. Configuration carries no count.
- `tabN()` prints nothing for zero, and each count carries a `title` that names what it counts.
- Switching tabs clears `S.oxprSel`, so Changes opens on the list.
- `/repositories/changes/<id>` opens that pull request directly.

### States
- **Loaded**: four tabs, the selected one `aria-selected`.
- **Empty, loading, error, denied**: the tab bar is replaced with the page's state panel.
- **Mobile**: the strip scrolls within itself. Configuration sits past the right edge at 390 px while the page never scrolls sideways.

## Banner

A banner above the Repositories table that names each linked repository with no `.oxagen/` tree.

### Purpose
It tells a person that runs on a linked repository get no steering of their own, and offers **Add .oxagen/** on that repository. The bold line reads "A run on a-intel/mobile is steered by the main repo and by nothing of its own."

### Rationale
Repository-scoped records live in the repository they steer. Until that repository has a `.oxagen/` tree there is nowhere to publish one. A record that tried would have to claim workspace scope, and the checks refuse a linked-repository record that claims workspace scope (`docs/mission-control-spec.md` §10.2). The banner turns that silent gap into one line and one button, on the page where the fix starts.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Linked repositories with no tree | `wsRepos()` rows with `ox` `unbound` and a role other than `available` | `get_repository_tree` per linked repository | shipped |
| Count badge | the same rows | derived | shipped |

### Logic
- `repoTab()` collects linked or main rows whose `ox` is `unbound`. Repositories not linked to the workspace never raise the banner.
- The badge reads "1 linked repository carries no .oxagen/" and pluralises.
- The bold line joins every such repository's name.
- **Add .oxagen/** opens the init wizard on the first of them (`wzOpen('init','<repo>')`).
- The banner disappears once every linked repository reads Present.

### States
- **Loaded with a gap**: shown, as in the demo for `a-intel/mobile`.
- **Loaded with no gap**: not rendered.
- **Mobile**: the text stacks above the button.

## Repositories

The table of every repository the workspace connects or the installation can reach, with its role, its production branch and whether it carries `.oxagen/`.

### Purpose
It answers which repository is main, which are linked, which others the GitHub App can reach, and which of them still need `.oxagen/`. A row opens the repository dialog. A row with no tree offers **Add .oxagen/**.

### Rationale
A workspace has exactly one main repository, required at creation. The main repository holds the workspace's steering and configuration. Each linked repository can hold records that steer only runs on it (`docs/mission-control-spec.md` §10.1). The role is the workspace's word, never GitHub's. That subtitle left the page and lives here.

The closing note also moved here. Changing the main repository needs an organization owner and an approval, and Audit records it as a security event. When GitHub's default branch changes, the GitHub App records the change, and the production branch stays put until someone confirms the move. The page names neither action as a control, because moving main is not built (#3241).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Repository, role, production branch | `REPOS` through `wsRepos()` | `list_repositories` | shipped |
| Not linked rows | `REPOS` with role `available` | `list_installation_repositories` | shipped |
| Language, push time | `REPOS[].lang`, `.pushed` | GitHub metadata | future-only |
| Head, `.oxagen/` state, file count | `.head`, `.ox`, `.oxFiles` | `get_repository_tree` | shipped |
| Events | `.events` | `list_repositories` `events` | partial |
| Symbols | `.symbols` | the code graph | future-only |

### Logic
- `wsRepos()` keeps the workspace's main, its linked repositories and every `available` one, then sorts main, linked, not linked.
- When `REPOS` has no row for the main repository, `repoRecordFor()` mints one, so main is never missing from the list.
- `repoMeta()` joins language, visibility and push time, and prints nothing when all three are absent.
- `oxState()` maps `governed` to Present (with the file count), `unbound` to No .oxagen/, and `drift` to Drift.
- Events and Symbols print a dash for repositories not linked.
- The last column reads "No action needed" on a governed row, else **Add .oxagen/**, which stops propagation and opens the init wizard on that repository.
- `rowClick()` makes each row a button reachable by Tab, opened by Enter or Space, labelled "Open <repository>".

### States
- **Loaded**: six rows in the demo.
- **Empty**: the page's empty panel replaces the table.
- **Mobile**: one card per repository, each cell labelled.

## Repository {#dialog/repo}
<!-- open: openDialog('repo','a-intel/mobile') -->

The dialog for one repository: its production branch, its `.oxagen/` state, what it feeds the workspace, and the actions its role allows.

### Purpose
It answers what Oxagen knows about one repository and what a person may do with it here: link it, unlink it, see its changes, or add `.oxagen/`.

### Rationale
A repository row carries too many facts for one line. The dialog keeps the table scannable and puts the rest one click away. Scope follows the role. A record in the main repository has `sharing_scope = "workspace"`. A record in a linked repository has `repository` scope and steers only runs on that repository. The lines "A record here can narrow what a workspace record allows but cannot widen it. One that claims workspace scope fails the checks." moved here from the dialog (§10.2, Stella's authority rule). So did "A record scoped to this repository has nowhere to go until the tree exists."

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Production branch, visibility, `.oxagen/` and files | `wsRepos()`, `REPOS` | `list_repositories`, `get_repository_tree` | shipped |
| Issues, Code graph, Data layer | `REPOS[].issues`, `.symbols`, `.drift` | the issue import, the code graph | future-only |
| Working copies | `WORKCOPIES` by `repo` | a working-copy record | future-only |
| Link, unlink | `repoLink()`, `openDialog('repounlink')` | `link_repository`, `unlink_repository` | partial |

### Logic
- `DLG_EXT.repo` looks the row up through `wsRepos()` first, so the main repository opens even with no fixture row.
- The subtitle reads "main repository", "linked repository" or "not linked to this workspace", then the language.
- On a governed repository, "Records published here" reads "Scope is workspace. These steer every run in <workspace>." for main, or "Scope is repository. These steer only runs on this repository." for a linked one.
- With no tree, the note reads "No .oxagen/ here." then, for a linked repository, "Runs on this repository get steering from <main> only." For one not linked: "This repository is not linked to <workspace> either. Adding .oxagen/ links it."
- Footer: main offers neither Unlink nor Link. Linked adds **Unlink** (red). Not linked adds **Link to this workspace** (gold), which calls `repoLink()`. Governed adds **See its changes**. No tree adds **Add .oxagen/**, gold on a linked repository.

### States
- Opens only from a row. A name it cannot find renders an empty "Repository" dialog with **Close**.
- **Mobile**: a bottom sheet with full-width buttons.

## Repository unlink {#dialog/repounlink}
<!-- open: openDialog('repounlink','a-intel/billing') -->

The confirmation before a linked repository leaves this workspace.

### Purpose
It says what unlinking changes before a person does it: "Its issues and events stop reaching this workspace, and new runs here can no longer use it." Then it warns about what this repository feeds.

### Rationale
Linking and unlinking change workspace membership, not a committed file, so neither opens a pull request (`mockups/pages/repositories.md`, Functionality). The repository is untouched: nothing is deleted, no branch moves, and `.oxagen/` stays where it is. That sentence moved here from the dialog.

Two warnings stay, each trimmed to its fact. "Records published in this repository stop steering runs in <workspace>." Runs already recorded keep naming the hashes they carried, because a SteeringFrame is fixed once recorded (D6 and the wedge's vocabulary). "<n> working copy is linked through it." Those copies stop appearing on the Working copies tab. The main repository never reaches this dialog: moving main is an owner action with approval, and nothing here offers it.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Repository and role | `repoByName()`, `ws().main` | `list_repositories` | shipped |
| Governed warning | `REPOS[].ox` | `get_repository_tree` | shipped |
| Working copy count | `WORKCOPIES` by `repo` | a working-copy record | future-only |
| Unlink | `repoUnlink()` | `unlink_repository` | shipped |

### Logic
- `DLG_EXT.repounlink` refuses the main repository and an unknown name with `noSuch("Repository")`.
- The governed warning renders only when `ox` is `governed`. The copies warning renders only when a working copy names the repository.
- **Keep it linked** closes. **Unlink it** (red) calls `repoUnlink()`, which drops the name from `w.linked`, sets the role to `available`, and reports "<repository> unlinked from <workspace>." The row stays in the table as Not linked, so linking back is the same round trip.
- `repoLink()` reports "<repository> linked to <workspace>." Its issues and events then reach this workspace, and runs here can use it. Runs already recorded still name an unlinked repository.
- The build writes an audit event for both, with the person's name.

### States
- The app's confirm cannot count working copies yet and says so.
- **Mobile**: a bottom sheet with full-width buttons.
