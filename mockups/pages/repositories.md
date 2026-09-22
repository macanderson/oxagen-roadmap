# Repositories

| | |
|---|---|
| Route | `#/a-intel/core-platform/repositories[/<tab>]` |
| Scope | workspace |
| Spec | §10 (the repository, steering and Context PRs); §11.2 (GitHub: events in, code graph up to date); §14 Mission Control; Appendix F |
| Design | `mockups/src/engine.js` → `pRepos()`, `repoTab()`, `copyTab()`, `chgTab()`, `oxprDetail()`, `cfgTab()`, `wzInit()`, `DLG_EXT.linkdir`, `DLG_EXT.workcopy`, `DLG_EXT.repo`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / repositories`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0\|1>#<route>` |
| Audit | `repositories.audit-prompt.md` |

## Job

Where this workspace's files live, who has them on disk, and every change Oxagen has proposed to them. One argument runs through all four tabs: `.oxagen/` is the workspace's source of truth, it lives in git, and every change to it arrives as a pull request.

This is the page the four creation wizards (`docs/creation-spec.md`) assumed. They all end on a pull request against the workspace's repository; nothing said how a repository comes to have a `.oxagen/` tree in the first place, which directory on whose disk is the same tree, or where you see every pull request Oxagen has open at once.

## What is on the page

**Header**: eyebrow the workspace name (“Core platform”), h1 “Repositories”, subtext “Where this workspace’s files live and every change Oxagen has proposed to them.”
Actions: **Add Oxagen to a repository** (gold; opens the init wizard). The header gives up the gold when the tab below holds the one primary action: Working copies (Connect a directory) and a selected pull request on Changes whose every check passed (Merge pull request).

- **Tabs**: Repositories (4) · Working copies (2) · Changes (5) · Configuration. Repositories counts what is bound (main and linked), Working copies counts copies out of step, and Changes counts open pull requests, not merged ones.

### Repositories

A banner when a linked repository carries no tree: “1 linked repository carries no .oxagen/”, “A run on a-intel/mobile is steered by the main repo and by nothing of its own.”, the reason there is nowhere to publish a repository-scoped record, and **Add Oxagen**. Then the **Repositories** panel, subtext “One main repo, any number of linked. The main repo holds the workspace’s steering and configuration; a linked repo may hold records that steer only runs on it.”, a small **Add Oxagen to a repository** in its header, filters Role and `.oxagen/`, Rows, a pager. Columns: Repository (with language · visibility · pushed when the seed carries them) · Role · Production branch (with its head) · `.oxagen/` (with “N files”) · Events (“ok · 8,142 deliveries / 30d · 0 gaps”) · Symbols · action (“nothing waiting”, or **Add Oxagen**).

- **Role** is the workspace's word, not GitHub's: `main` (exactly one, required at creation), `linked` (zero or more), `not linked`. A repository may be linked to more than one workspace in the organization and is main for at most one.
- **`.oxagen/`** is `governed` or `no .oxagen/`. Every row opens the `repo` dialog (Enter and Space too): production branch and head, visibility, `.oxagen/` state with its file count and commit, issues, events, code graph, data layer, working copies, and the scope of records published there; an ungoverned one offers **Add Oxagen** instead of **See its changes**. A linked repository also offers **Unlink** (red; opens `repounlink`), and one that is not linked offers **Link to this workspace** (gold). The main repo offers neither, because moving main is an owner action and this dialog never offers it.
- A note: changing which repository is `main` is an organization-owner action with approval, recorded as a security event; the production branch never moves on its own.
- Oxagen writes to a branch and never to the production branch, and merges only what a person merges from here, under the governance mode the repository itself declares. The App permissions the binding asks for are named where they are granted, in the install flow, not restated on this tab.

### Working copies

The **Working copies** panel, subtext on `oxagen init` and the one gitignored file, **Connect a directory** (gold; opens `linkdir`). Columns: Directory (with machine · person) · Repository · Branch (with head) · `.oxagen/` (`in sync`, `behind`, `uncommitted`, `unbound`, with “N uncommitted”) · Symlinks (`ok` / `missing`) · Bundle · Last seen. Every row opens the `workcopy` dialog, whose footer carries **Disconnect** (red; opens `copyoff`). With no copies, the panel says none is linked yet and keeps Connect a directory.

- **Files to review**: the tree with `workspace.toml` (“committed. reviewed. the source of truth.”) and `workspace.json` (“gitignored · this machine’s link”), and the note on why the two are never the same file in two places.
- **Sync**: `oxagen init` (links the directory, idempotent), `oxagen pull` (fast-forwards `.oxagen/`, re-points the Stella symlinks, never merges your work), `oxagen status`, `oxagen propose`. Opening and merging a proposal's pull request happen here, because both gate on a role only a signed-in person holds. A note: a copy whose symlinks read `missing` is one where Stella will load nothing.
- **Connect a directory** (`linkdir`): one command with a pairing code that expires; what it writes (`workspace.json`), links (`.stella/*` symlinks), does not write, and does not read; “Linking a directory grants nothing”; **Copy command**.

### Changes

The **Open Context PRs** panel, subtext “Four kinds of file and one lifecycle.” Columns: Change (with its branch) · Kind · Pull request · Opened by (a person, `the promoter`, or `the reconciler`, with which under it) · State (`open`, `checks running`, `checks passed`, `checks failed`, `merged`, `closed`) · Checks (the CI status light with jobs done over total: blinking blue while any job runs, a red ✕ the moment one fails, pulsing while others still run, static green when all passed, static grey while queued; “4 / 6”) · Opened. A note: a change is in force from the merge commit; while a pull request is open the thing it carries steers nothing. Then **Automatic proposals**: the promoter, the reconciler, a person, and the note “Drift is reported, never repaired in place.”

- **Kind** is one of `Oxagen init`, `context record`, `skill`, `agent`, `tool`, `configuration`, each with its file path.
- Selecting a row shows the pull request: **← All changes**, the title and state; Kind, Pull request, Branch → base, Opened by, Why; **Files this pull request carries**; **Checks** (Check · Result · What it asserted), each with its own result text; on a failure the note “<check> stopped the run.” with the reason, the checks behind it queued; then **What merge will do** (five numbered consequences) with **Merge pull request** (gold only when every check passed, disabled otherwise) and **Close pull request** (red; opens `closepr`, which previews the comment Oxagen posts on GitHub: “Closed by <first name> <last name> <email>”, a horizontal rule, then “Added via Oxagen” and the full URL of this Context PR page in Oxagen as the link text; confirming closes the pull request, posts the comment, and records a governed action), and the governance line (“Governance: team on GitHub” when merge is enabled, else “Merge stays disabled until every check required. on GitHub”) or “Merge stays disabled until every check reports.”; once merged, the note that the file is on the base branch and the promotion event is on the ledger.

### Configuration

- **`.oxagen/workspace.toml`** as it is on the production branch (“On a-intel/platform at a4c91e2”, or “not indexed yet”).
- **Drift** (subtext “The file against what the control plane has. Reported, never repaired in place.”, **See the pull request**): Declared · In the file · Live · Right (`the file`, or `a person decides`). Two rows the reconciler can argue for because it read both sides; the third (a linked repository with no `.oxagen/`) waits for a person. A workspace with nothing recorded says the reconciler found nothing between them.
- **`.oxagen/rules/governance.toml`** with the three modes: `solo` (the author may merge their own), `team` (a code-owner review is required; what a missing file means), `regulated` (a named approver from a role, hash-chained ledger). It is read when a pull request is opened **and again when it is merged**, so raising the mode takes effect on everything still open. A file that exists but names no mode refuses both. The workspace's current mode is the chip on Steering (`steering.md`), and changing it is a Context PR.
- **Tree**: `.oxagen/` as it is on disk, `workspace.json` gitignored, `rules/` with `governance.toml`, `promotions.jsonl`, and one published record per lineage, `proposals/`, `agents/`, `skills/<name>/SKILL.md` (“pinned by version and digest”), `tools/<name>.toml`. Oxagen reads `.oxagen/` and nothing else; whatever sits under `.stella/` is invisible to it.

**Dialogs this page opens:** `wz (init wizard)`, `linkdir`, `workcopy`, `copyoff`, `repo`, `repounlink`.

- **`repounlink`**: what stops reaching the workspace (issues, events, and any run binding), that the repository itself is untouched, that records published there stop steering runs here at once while the runs already recorded keep their hashes, and how many working copies go with it. Footer: **Keep it linked** · **Unlink it** (red). Unlinking leaves the repository in the table as not linked, so linking it back is the same round trip.
- **`copyoff`**: Oxagen forgets the directory, the machine stops reporting it, the gitignored `workspace.json` stops resolving, nothing on disk is deleted, and `oxagen init` links it back. It names any uncommitted edits under `.oxagen/` and says disconnecting neither loses nor proposes them. This is the one path on the page that is not a pull request, because nothing committed changes. Footer: **Keep it** · **Disconnect it** (red).

### The init wizard

The fifth thing you create and the one the other four need first: the `.oxagen/` tree itself. Same shape as the rest of `docs/creation-spec.md`, with one difference: it is the only wizard that can run against a repository Oxagen has never written to, so before it drafts anything it says what it is about to be allowed to do (the permission table) **and what it still cannot do**: push to the production branch, merge on its own, read a secret, or grant authority.

Five steps: **Repository** (only repositories with no `.oxagen/` yet; **Make it the main repo** or **Link it**, with the note that moving main is an owner action) → **Branch & governance** (the production branch, GitHub's default as the suggestion and not the decision; the governance mode from the same three cards as `govmode`) → **Permissions** (the table and the four things it still cannot do) → **Review** (both files in full, every line yours to change) → **Pull request** (six files including `.gitignore` carrying `workspace.json`, five checks: schema, layout, governance, secret_pii_scan, no_authority; **Open pull request**, reported as “Opened <repo>#118 · Add Oxagen”). It writes `.oxagen/rules/governance.toml`, which nothing else in the product writes but the governance chip's Context PR.

**Shell.** As `steering.md`: sidebar (Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit) with Repositories lit and its count of open pull requests, top bar with breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button (count of everything waiting on you across the organization) that opens the drawer `#apdrawer`, and the account avatar. No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Repositories, role, production branch | `REPOS` via `wsRepos()` | `repositories` + the link row per workspace | `ingestion.repository_bindings`, `repository_binding_heads`; `bind_main_repository` binds main only | 🟡 |
| `.oxagen/` presence, file count, commit | `REPOS.ox`, `oxFiles`, `oxCommit` | read from the production branch through the App | nothing reads it; `.oxagen/` exists only where a record was written | ❌ |
| Working copies | `WORKCOPIES` | a working-copy row per enrolled machine | `oxagen init` writes `.oxagen/workspace.json` locally and reports nothing back | ❌ |
| Changes (context records) | `OXPRS` (kind `record`) | `PROPOSES`, `PROMOTED_BY` | `open_context_pr` / `merge_context_pr` / `get_context_pr`, six checks, promotions ledger | ✅ |
| Changes (agent definitions) | `OXPRS` (kind `agent`) | the same lifecycle | `commit_agent_definition` opens one; **nothing merges it** | 🟡 |
| Changes (skills, tools, config, init) | `OXPRS` | the same lifecycle | none: no skill sync, `.oxagen/tools/` documented unbuilt (ADR-072), no reconciler, no init | ❌ |
| Governance mode | `WS[].governance` via `wsGov()`; `oxGovernanceToml()` | `.oxagen/rules/governance.toml` | read by `context.steering.policy.ts`; **nothing writes it** | 🟡 |
| Drift | `DRIFT`, `DRIFT_PR` | the file against Postgres | nothing reconciles them | ❌ |

## Functionality

- Every path that changes a file ends on a pull request. Nothing here merges without a person.
- Linking and unlinking a repository, and disconnecting a working copy, are the exceptions: the first two are workspace membership and the third is one gitignored file on a laptop. None of the three changes a committed file, so none opens a pull request, and each says so where it is confirmed.
- Changing which repository is `main` is an organization-owner action with approval, recorded as a security event.
- The production branch never moves on its own: a default-branch change on GitHub is recorded and prompts.
- A repository-scoped record may narrow what a workspace record allows. It may never widen it, and one claiming workspace scope fails the checks.
- Nothing in `.oxagen/` can grant authority: not a record, not a skill, not a tool manifest, not the init tree.
- Merge is enabled only when every check has reported, none failed, and the pull request is not already merged; the header gives up its gold only then.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: “This workspace has no repository yet”. “A workspace without a main repo cannot exist, so this state is the moment between creating one and binding it. The main repo is where steering and configuration are managed in source control — until it is bound, there is nowhere for a record to be published to.” Action: **Add Oxagen to a repository** (gold). The header and tabs are not rendered.
- **loading**: the shell stays; the page body is replaced by the skeleton.
- **error**: “Repositories could not be loaded”. “The control plane answered `503 installation_unreachable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the trace line.
- **access denied**: “You cannot see this workspace’s repositories”, naming `repository.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**; Repositories is in the **More** sheet, with its open-pull-request count. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; the four tables become stacks of cards, each cell labelled with its column header; the two-column panel grids stack; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `repository.read`
- Writes (each a governed action recorded in Audit): `repository.link (add Oxagen to a repository)`, `repository.admin (change which repo is main)`, `context.propose (open a pull request)`, `context.review (merge one)`, `workcopy.link (connect a directory)`, `workcopy.unlink (disconnect one)`, `repository.link (link or unlink a repository)`

## Backend gaps this page depends on

- `.oxagen/` presence read from the production branch: nothing reads it today
- A working-copy record: `oxagen init` writes locally and reports nothing back
- Writing `governance.toml`: it is read on every open and merge and written by nothing
- A merge capability for agent-definition pull requests, to match `merge_context_pr`
- Skill and tool pull-request paths (`.oxagen/tools/` is documented unbuilt, ADR-072)
- The reconciler, and the drift record it reads
- GitHub App permissions: the documented set is read-only, and this page's lifecycle writes

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
- A working copy's state is never presented as a run's state. The two are different facts about different machines, and conflating them turns a stale laptop into a governance incident.
- The permission table shows the access this lifecycle needs, including the writes. A page that understates it is describing a product that cannot open a pull request.
