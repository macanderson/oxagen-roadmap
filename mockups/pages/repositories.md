# Repositories

| | |
|---|---|
| Route | `#/a-intel/core-platform/repositories` (the mockup also takes `/repositories/repos`). The path is unchanged (`fleet-operations-routes.md`, Runtimes and Repositories: `/{org}/{ws}/repositories[/{tab}[/{change}]]` keeps every path) |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: Unchanged (Repositories keeps its design, and its specs change only where a word changed), D7 (Steering record, never context record) and the vocabulary (pull request, never Context PR). `docs/fleet-operations-ia.md`: Workspace navigation (the Repositories count) and Runtimes and Repositories. `docs/fleet-operations-routes.md`: Runtimes and Repositories. `docs/mission-control-spec.md` §10.1 (repositories), §10.2 (the `.oxagen/` layout) and §10.3 (the pull request lifecycle). `docs/creation-spec.md` (the init wizard) |
| Design | `mockups/src/engine.js`: `pRepos()`, `repoTab()`, `wsRepos()`, `repoRecordFor()`, `repoMeta()`, `oxState()`, `rowClick()`, `stBadge()`, `DLG_EXT.repo`, `DLG_EXT.repounlink`, `repoLink()`, `repoUnlink()`, `wzInit()`, `wzInitRepo()`, `wzInitCandidates()`, `wzInitFiles()`, `oxWorkspaceToml()`, `oxGovernanceToml()`, and the shell's `skeleton()`, `emptyState()`, `errorState()` and `deniedState()`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / Repositories / Repositories`: Loaded, Empty, Loading, Error, Access denied, and each state · mobile |
| Audit | `repositories.audit-prompt.md` |

This spec covers the Repositories header and tabs, which all four tabs share, and the Repositories tab. `repositories-copies.md`, `repositories-changes.md` and `repositories-config.md` cover the other three tabs.

## Job

Show where this workspace's files live and every change Oxagen has proposed to them. One argument runs through the four tabs: `.oxagen/` is the workspace's source of truth, it lives in git, and every change to it arrives as a pull request. The Repositories tab answers which repositories the workspace connects (one main, any number linked), which others the installation reaches, whether each carries `.oxagen/`, and where to add it.

## What is on the page

**Shell.** The sidebar lists Work (8), Agents, Tools (29), Steering (9), Runtimes (2), Spend and Repositories (5), then Organization, Billing and Audit (3). Repositories is lit, and its count is the open pull requests Oxagen opened. The top bar holds the breadcrumbs (Anderson Intelligence Corp. / Core platform / Repositories), ⌘K search, notifications, Approvals and the avatar.

**Header.** Eyebrow the workspace name ("Core platform"), h1 "Repositories", subtext "Where this workspace’s files live and every change oxagen has proposed to them." Action: **Add .oxagen/** (gold, opens the init wizard). The header gives up its gold where the tab below holds the one primary action: on Working copies (Connect a directory), and on Changes when a selected pull request can merge (Merge pull request).

**Tabs**: Repositories (4) · Working copies (2) · Changes (5) · Configuration. Repositories counts the connected repositories (main and linked). Working copies counts the copies out of step with the production branch. Changes counts the open pull requests. A merged or closed one is not counted. Configuration carries no count. In the mockup a tab click selects the tab without writing the hash. The route map keeps each tab a path segment (`/repositories/copies`, `/repositories/changes`, `/repositories/config`).

**Banner**, when a linked repository carries no `.oxagen/`: the badge "1 linked repository carries no .oxagen/", the bold line "A run on a-intel/mobile is steered by the main repo and by nothing of its own.", a sentence saying that repository-scoped records live in the repository they steer, so there is nowhere to publish one until the tree exists, and that a record that tried would have to claim workspace scope, which the checks refuse. **Add .oxagen/** opens the init wizard on that repository.

**Repositories panel.** Heading "Repositories", subtext "The main repository holds the workspace’s steering and configuration, and each linked repository can hold records for its own runs." A small **Add .oxagen/** sits at the right of the heading (not gold). The shell's list tools sit above the rows: "Search this list", the filters "Any role" (Linked, Main repository, Not linked), "Any production branch" (Main, Release) and "Any .oxagen/" (No .oxagen/, Present), Rows (5, 10, 25, 50, All), sortable headers and a pager over the six rows.

Columns, in order: Repository · Role · Production branch · `.oxagen/` · Events · Symbols · and a last column for the row's action.

| Repository | Role | Production branch | `.oxagen/` | Events | Symbols | Action |
|---|---|---|---|---|---|---|
| a-intel/platform (TypeScript · private · pushed 11 min ago) | Main repository | main, a4c91e2 | Present · 9 files | ok · 8,142 deliveries / 30d · 0 gaps | 118,402 | No action needed |
| a-intel/billing (TypeScript · private · pushed 1 h ago) | Linked | main, 7e0b331 | Present · 3 files | ok · 1,904 deliveries / 30d · 0 gaps | 24,118 | No action needed |
| a-intel/mobile (Swift · private · pushed 5 h ago) | Linked | release, c02fa77 | No .oxagen/ | ok · 640 deliveries / 30d · 1 gap recovered | 31,904 | Add .oxagen/ |
| a-intel/infra | Linked | main, 9e8b2ba | Present | ok · 5,788 deliveries / 30d · 1 gap recovered | 76,316 | No action needed |
| a-intel/ledger-service (Go · private · pushed yesterday) | Not linked | main, 5fd2c80 | No .oxagen/ | a dash | a dash | Add .oxagen/ |
| a-intel/docs-site (MDX · public · pushed 3 days ago) | Not linked | main, e19a744 | No .oxagen/ | a dash | a dash | Add .oxagen/ |

- **Repository** carries a repository icon, the name in mono, and a line of language, visibility and push time where the record holds them.
- **Role** is the workspace's word, not GitHub's: Main repository (`main`, exactly one), Linked (`linked`, any number) or Not linked (`not linked`). A repository can be linked to more than one workspace and is main for at most one.
- **Production branch** prints the branch over its head commit.
- **`.oxagen/`** is a badge, Present (`governed`) with the file count after it, or No .oxagen/ (`no .oxagen/`).
- Main sorts first, then linked, then not linked.
- Every row opens the `repo` dialog on click, Enter or Space (`role="button"`, `tabindex="0"`, `aria-label="Open <repository>"`). The row's **Add .oxagen/** opens the init wizard on that repository and does not open the dialog.

A note closes the panel: "Changing the main repository needs an organization owner and an approval, and Audit records it as a security event. When GitHub’s default branch changes, the GitHub App records the change, and the production branch stays put until someone confirms the move."

**Dialogs this page opens:** `repo`, `repounlink`, the init wizard (`wz`), and from the state panels `incident` and `request-access`.

- **`repo`**, titled with the repository, subtitled "main repository", "linked repository" or "not linked to this workspace" with the language. Facts: Production branch ("main at a4c91e2"), Visibility, `.oxagen/` (the badge, then "· 9 files at a4c91e2"), Issues ("enabled · 3,907 imported"), Events, Code graph ("118,402 symbols · indexed 2 min ago", or "Not indexed"), Data layer ("3 data-layer findings"), Working copies ("2 on 2 machines", or "None").
  - On a governed repository, "Records published here". For main: "Scope is workspace. These steer every run in Core platform." For a linked one: "Scope is repository. These steer only runs on this repository. A record here can narrow what a workspace record allows but cannot widen it. One that claims workspace scope fails the checks."
  - With no tree, the note "No .oxagen/ here." followed, for a linked repository, by "Runs on this repository get steering from a-intel/platform only. A record scoped to this repository has nowhere to go until the tree exists." and, for one not linked, by "This repository is not linked to Core platform either. Adding .oxagen/ links it."
  - Footer: the repository name in mono and **Close**. A linked repository adds **Unlink** (red, opens `repounlink`), and one not linked adds **Link to this workspace** (gold). A governed repository adds **See its changes** (opens Changes), and one without a tree adds **Add .oxagen/** (gold on a linked repository, plain beside Link to this workspace). The main repository offers neither Unlink nor Link, because moving main is an owner action this dialog never offers.
- **`repounlink`**, "Unlink <repository> from Core platform?". The note: "Its issues and events stop reaching this workspace, and new runs here can no longer use it. The repository is untouched: nothing is deleted, no branch moves, and .oxagen/ stays where it is." On a governed repository, the warning "Records published in this repository stop steering runs in Core platform the moment this is written. Runs already recorded keep naming the hashes they carried." With working copies, the warning "1 working copy is linked through it. It stops appearing on the Working copies tab." Footer: **Keep it linked**, **Unlink it** (red). Unlinking leaves the repository in the table as not linked and reports "<repository> unlinked from Core platform. Runs already recorded still name it. New runs here cannot use it." Linking reports "<repository> linked to Core platform. Its issues and events reach this workspace, and runs here can use it."
- **The init wizard**, "Connect repository", subtitle "adds .oxagen/, the directory every other file needs" (on the last step, "the directory every other file needs"). A rail of five steps, the current one `aria-current="step"`: Repository · Branch & governance · Permissions · Review · Pull request. The footer names the permission it needs, "needs repository.admin on core-platform".
  1. **Repository.** A lead saying Oxagen governs the files in a repository without keeping a copy, so its first act there is a pull request that puts the directory in place. The Repository select lists only the repositories with no `.oxagen/` (a-intel/mobile · Swift · private, a-intel/ledger-service · Go · private, a-intel/docs-site · MDX · public), with the hint that a governed repository changes by an ordinary pull request. Two cards: **Make it the main repository** ("The workspace’s steering and configuration live here. A workspace has exactly one, and moving it needs an owner and an approval.") and **Link it** ("Agents work on it. It can hold records that steer only runs on this repository, but no records scoped to the workspace."). The note reads "a-intel/platform is already this workspace’s main repository, so this one is linked.", or, with main chosen, says that merging makes the repository main, an organization-owner action with approval, recorded as a security event. **Next**.
  2. **Branch & governance.** Production branch, with GitHub's default first: "GitHub’s default branch is release, which is the suggestion." The hint goes on to say this is the only branch whose commits update the code graph and the only one a record is published to, and that Oxagen asks you to confirm before the production branch follows a change to GitHub’s default. Governance mode, three cards: `solo` ("The author may merge their own. One person, or a repository nobody else reviews."), `team` ("A code-owner review is required. What a missing governance.toml means, and what most repositories want."), `regulated` ("A named approver from a role must approve, and the promotion ledger is hash-chained. Separation of duties: the author of a record may never be its approver."). The hint: the mode is read when a pull request is opened and again when it is merged. **Next**.
  3. **Permissions.** "What oxagen will be able to do in a-intel/mobile": Permission · Level · What it is for. Contents, read and write, the branch and the file every pull request carries. Pull requests, read and write, opening one and re-reading its head before a merge. Checks, write, the check runs on the head commit. Metadata, read, mandatory. Issues, read, task references so spend rolls up to an issue. Then "And what it still cannot do": push to the production branch, merge on its own, read a secret, grant authority, each with its line. **Draft the files**.
  4. **Review.** "The files, drafted for a-intel/mobile": `.oxagen/workspace.toml` and `.oxagen/rules/governance.toml` in full, and "Every line is yours to change before anybody reviews it. What lands is what the pull request carries, not what this screen drafted." **Next**.
  5. **Pull request.** "Add .oxagen/ to a-intel/mobile". The pull request header names the repository being added and the branch `oxagen/init`. Six files: `.oxagen/workspace.toml`, `.oxagen/rules/governance.toml`, `.oxagen/rules/.gitkeep`, `.oxagen/proposals/.gitkeep`, `.oxagen/agents/.gitkeep` (each added), and `.gitignore` (changed, to ignore `.stella/private/` and the local `.oxagen/workspace.json`). "What the checks will assert": `schema`, `layout`, `governance`, `secret_pii_scan`, `no_authority`. **Open pull request** (gold) reports "Opened a-intel/mobile#118 · Add .oxagen/".

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. The mockup collection is a file in `mockups/fixtures/` (`REPOS`, `WORKCOPIES`, `OXPRS`) or a constant in `mockups/src/engine.js`. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Connected repositories, role, production branch | `REPOS` through `wsRepos()` | `list_repositories` | Main and linked bindings with the branch, the URL and the connection state (`packages/oxagen/src/contracts/repository.list.ts:43-84`). The table: `apps/app/src/features/repositories/repositories-tab.tsx:280-390` | ✅ |
| Repositories not linked | `REPOS` with role `available` | `list_installation_repositories` | `packages/oxagen/src/contracts/repository.installation.list.ts:33` | ✅ |
| Visibility | `REPOS[].visibility` | the installation's repository list | `repositories-tab.tsx:322-327` | ✅ |
| Language and push time | `REPOS[].lang`, `.pushed` | GitHub's repository metadata | In no read | ❌ |
| Head commit, `.oxagen/` state and file count | `REPOS[].head`, `.ox`, `.oxFiles` | `get_repository_tree` | Read from GitHub through the installation at the moment of the call: head, whether the tree exists, every path under it (`packages/oxagen/src/contracts/repository.tree.get.ts:40-95`) | ✅ |
| Events | `REPOS[].events` | `list_repositories` `events` | The App's delivery state ships (`installed`, `suspended`, `uninstalled`, `paused`, `retired`). The 30-day delivery count and gaps print "deliveries not recorded" (`repositories-tab.tsx:356-368`) | 🟡 |
| Symbols | `REPOS[].symbols` | the code graph | Prints "not recorded" (`repositories-tab.tsx:370-376`) | ❌ |
| The banner | `.oxagen/` state of each linked repository | `get_repository_tree` per linked repository | Derived from the tree reads | ✅ |
| `repo` dialog: production branch, visibility, `.oxagen/` with files at the head | `REPOS`, `wsRepos()` | `list_repositories`, `get_repository_tree` | `apps/app/src/features/repositories/repository-dialog.tsx:235-268` | ✅ |
| `repo` dialog: Issues, Code graph, Data layer, Working copies | `REPOS`, `WORKCOPIES` | the issue import, the code graph, working copies | Print "not recorded" (`repository-dialog.tsx:269-286`) | ❌ |
| Link and unlink | `repoLink()`, `repoUnlink()` | `link_repository`, `unlink_repository` | `packages/oxagen/src/contracts/repository.link.ts:49`, `repository.unlink.ts:29`. The unlink confirm cannot count working copies, and the app says so | 🟡 |
| Init wizard: connect, branch, open the pull request | `wzInit()` | `bind_main_repository` or `link_repository`, then `set_production_branch`, then `open_init_pr` | The app's wizard runs the three in order (`apps/app/src/features/repositories/init-wizard.tsx:1-22`). `open_init_pr` pushes the six files to `oxagen/init` and opens one pull request, which a person merges on GitHub (`packages/oxagen/src/contracts/repository.init_pr.open.ts:1-35`) | ✅ |
| The five checks | `wzPrStep()` | the refusals `open_init_pr` answers | Checked before anything is pushed: `workspace.toml` parses, no `.oxagen/` exists, `governance.toml` names the chosen mode, no secret, no grant of authority (the refusals in `repository.init_pr.open.ts:23-32`; the app's messages, `apps/app/messages/repositories.json`, `failure`) | ✅ |
| Governance modes on step 2 | `WZ_MODES` | `.oxagen/rules/governance.toml`, read on open and merge | The file and the three mode names ship (`packages/handlers/src/context.steering.policy.ts:10-38`). The merge gate differs from the card text: `team` needs an org Owner or Admin, or a workspace Owner, other than the author, and `regulated` needs an org Owner or Admin other than the author (lines 47-78). No code-owner review is checked, and every merge appends to the hash-chained ledger | 🟡 |
| Moving main | none | `set_main_repository`, an owner action with approval | Main is set once (`packages/oxagen/src/contracts/repository.main.bind.ts:71`). Moving it is not built (`apps/app/src/features/repositories/gaps.ts:6-12`, #3241) | ❌ |

The app also carries a production branch control in the repository dialog (`set_production_branch`, `packages/oxagen/src/contracts/repository.production_branch.set.ts:44`), which the design's `repo` dialog does not draw. It serves the tab at `/repositories`, and the other tabs at `/repositories/working-copies`, `/repositories/changes`, `/repositories/changes/<id>` and `/repositories/configuration` (`apps/app/src/features/repositories/view.ts:11-42`).

## Future-only fields

The view carries no `data-future` mark. These fields are future-only all the same, and a build prints each as not recorded until its contract ships: the language and push time, the delivery count and gaps under Events, Symbols, and the dialog's Issues, Code graph, Data layer and Working copies. Moving main is not offered anywhere on this page, and the design keeps it that way.

## Functionality

- **Every path that changes a committed file ends on a pull request.** Nothing on this page merges without a person, and nothing writes a row that a file should hold.
- **Linking and unlinking** are the exceptions: they change workspace membership, not a committed file, so neither opens a pull request, and the unlink confirm says the repository is untouched. Unlinking leaves the repository in the table as not linked, so linking it back is the same round trip.
- **Adding .oxagen/** connects the repository first if it is not linked (main or linked, as chosen on step 1), moves the production branch if the person changed it, then opens one pull request from `oxagen/init`. The checks run before anything is pushed, and a refused check pushes nothing. An init pull request already open is reused. A person merges it on GitHub, and until then the repository is ungoverned.
- **Changing main** is an organization-owner action with approval, recorded as a security event. The page names it and never offers it.
- **Governance modes.** The mode is read from `.oxagen/rules/governance.toml` on the production branch when a pull request is opened and again when it is merged, and a missing file means `team`. The mode cards say what the merge gate enforces under each mode, no more.
- **The production branch never moves on its own.** When GitHub's default changes, the App records it and prompts.
- **Scope.** A repository-scoped record may narrow what a workspace record allows. It may never widen it, and one claiming workspace scope fails the checks.
- **Nothing in `.oxagen/` grants authority**: not a record, not a skill, not a tool manifest, not the init tree.
- **The permission table** shows the access the lifecycle needs, writes included.

## States

The catalog lists all five, and each replaces the page body under the shell on every tab.

- **loaded**: as above, on the demo workspace (Anderson Intelligence Corp., `a-intel` / `core-platform`, Marcus Bell signed in).
- **empty**: the header and tabs give way to "This workspace has no repository yet". The body says every workspace needs a main repository, which keeps steering and configuration in source control, and that until you connect one a record has nowhere to be published. Action: **Connect repository** (gold).
- **loading**: the skeleton, four tile blocks and a panel of seven rows. The shell stays.
- **error**: "Repositories could not be loaded". "The control plane answered 503 installation_unreachable. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by oxagen." Actions: **Try again** (gold) and **Open an incident**. The trace line: "trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z".
- **access denied**: "You cannot see this workspace’s repositories". "Your roles on Anderson Intelligence Corp. do not include repository.read on core-platform. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it." Actions: **Request access** (gold) and **Back to Work**. Beneath: Signed in as "Marcus Bell · workspace.owner · core-platform", Needed "repository.read on core-platform", Decided by "pol_v41 · deny wins over every allow". The app today reads "Back to Fleet" and names the organization's policy. The wedge makes the way back Work.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, and More is lit on every Repositories tab. More holds Steering, Runtimes, Repositories (5), Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The top bar collapses to the menu button, the page name, search, notifications, Approvals and the avatar.

The header action sits under the subtext. The tab strip scrolls within itself, so Configuration sits past the right edge at 390 px while the page itself never scrolls sideways. The banner stacks its text above **Add .oxagen/**. The panel heading keeps its small **Add .oxagen/** beside the subtext, which squeezes the subtext into a narrow column. The table becomes one card per repository, each cell labelled with its column. Every dialog, the init wizard included, rises from the bottom edge as a sheet with full-width footer buttons.

## Permissions

- Read: `repository.read`, the permission the denied panel names, as the app names it too (`apps/app/src/data/read.ts:134-137`). Shipped: `list_repositories` and `get_repository_tree` allow org Owner and Admin, and workspace Owner and Member.
- Link, unlink, set the production branch: `link_repository`, `unlink_repository` and `set_production_branch`, org Owner or Admin, or workspace Owner.
- Add .oxagen/: `open_init_pr`, org Owner or Admin. The wizard's footer names `repository.admin on core-platform`.
- Change which repository is main: organization owner, with approval, recorded as a security event. Not built.

## Backend gaps this page depends on

- The 30-day delivery count and the gaps per repository.
- The code graph's symbol count and index time.
- The issues imported per repository, and the data-layer findings.
- The language and push time on a repository row.
- Working copies per repository (see `repositories-copies.md`).
- `set_main_repository`: moving main as an owner action with approval and a security event (#3241).

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. The init wizard's drafting note means recorded frames when it says the assistant's turn is recorded with frames.
- A Steering Source and a SteeringFrame are never shown as each other. "Records published here" names Steering records, which are sources, and a record's page links to the frames it emits.
- Every fact on this page is read from the workspace's link to the repository, from GitHub through the installation at the moment of the call, or from the record. Nothing is inferred and nothing is cached as if it were current.
- No person is scored or ranked.
- Every enforcement claim states the tier, and nothing here claims enforcement: `.oxagen/` grants nothing, and a record steers only once merged.
- Headers are rollups of the rows beneath them. The tab counts equal their lists.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. It moves off the header only where the tab holds the one primary action. A dialog carries its own.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- The permission table shows the access this lifecycle needs, writes included. A table that understates it describes a product that cannot open a pull request.
