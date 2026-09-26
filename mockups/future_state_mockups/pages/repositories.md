# Repositories

| | |
|---|---|
| Route | `#/a-intel/core-platform/repositories[/<tab>]` |
| Scope | workspace |
| Spec | §10 (the repository, steering and Steering PRs); §11.2 (GitHub: events in, code graph up to date); Appendix F |
| Design | `mockups/src/engine.js` → `pRepos()`, `repoTab()`, `copyTab()`, `chgTab()`, `cfgTab()`, `oxprDetail()`, `wzInit()`, `DLG_EXT.linkdir`, `DLG_EXT.workcopy`, `DLG_EXT.repo`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / repositories`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0\|1>#<route>` |
| Audit | `repositories.audit-prompt.md` |

## Job

Where this workspace's files live, who has them on disk, and every change Oxagen has proposed to them. One argument runs through all four tabs: `.oxagen/` is the workspace's source of truth, it lives in git, and every change to it arrives as a pull request.

This is the page the four creation wizards (`docs/creation-spec.md`) assumed. They all end on a pull request against the workspace's repository; nothing said how a repository comes to have a `.oxagen/` tree in the first place, which directory on whose disk is the same tree, or where an operator sees every pull request Oxagen has open at once.

## What is on the page

**Header** — eyebrow "Workspace · <workspace name>", h1 "Repositories".
Actions: **Add Oxagen to a repository** (gold; opens the init wizard: Repository → Branch & governance → Permissions → Review → Pull request). The header gives up the gold when the tab below holds the one primary action — Working copies (Connect a directory) and a selected pull request on Changes (Merge pull request).

- **Tabs**: Repositories (N linked) · Working copies (N out of step) · Changes (N open) · Configuration. A count appears only where something waits on a person, so Repositories counts what is bound rather than everything reachable, and Changes counts open pull requests, not merged ones.

### Repositories

Main, linked, and repositories the installation can reach that nobody has bound. Columns: Repository · Role · Production branch · `.oxagen/` · Events · Symbols · (action).

- **Role** is the workspace's word, not GitHub's: `main` (exactly one, required at creation), `linked` (zero or more), `not linked`. A repository may be linked to more than one workspace in the organization and is main for at most one.
- **`.oxagen/`** is `governed` or `no .oxagen/`. A linked repository with no tree gets a banner: a run on it is steered by the main repo and by nothing of its own, and there is nowhere to publish a repository-scoped record until the tree exists. A record that tried would have to claim workspace scope, which the checks refuse.
- Every row opens the repository dialog: production branch and head, visibility, `.oxagen/` state with its file count and commit, issues, events, code graph, data-layer drift, and how many working copies hold it. An ungoverned one offers **Add Oxagen** instead of **See its changes**.
- **What linking does, in order** — the four steps of §11.2, stated as consequences rather than as a progress bar, because they are the reason the production branch matters.
- **The permissions this needs** — Contents read **and write**, Pull requests read **and write**, Checks **write**, Metadata read, Issues read. Opening a pull request is a write; a read-only installation cannot do it, and a page that showed a read-only permission set beside a product that opens pull requests would be describing something else. Below it, what the write access still does not buy: Oxagen writes to a branch and never to the production branch, and it merges only what a person merges from here.

### Working copies

The same `.oxagen/` tree on a machine. Columns: Directory · Repository · Branch · `.oxagen/` · Symlinks · Bundle · Last seen.

- `.oxagen/` is `in sync`, `behind` or `uncommitted`. **A working copy that is behind is not a run that is behind**, and the banner says so: steering reaches a run through the gateway from the merged commit, whatever the directory on the operator's disk holds. What a stale copy costs is the person, who reads rules that are no longer in force. Without that sentence an operator reads a yellow row as a governance failure and goes looking for a breach that did not happen.
- **Symlinks** is `ok` or `missing`. Stella symlinks into `.oxagen/` rather than copying it, so there is no second copy that could drift; a copy whose symlinks are missing is one where Stella's loader will find nothing, and the dialog says that in those words rather than showing a yellow dot and leaving it.
- **Two files, and only one of them is yours to review** — `.oxagen/workspace.toml` is committed, reviewed, and the source of truth. `.oxagen/workspace.json` is gitignored and says which workspace *this checkout* talks to, which is a fact about a laptop and not about the product. Two files one name apart is a collision waiting to happen, so the init pull request adds the second to `.gitignore` and the panel states which is which.
- **Syncing, in both directions** — `oxagen init` (links the directory, idempotent), `oxagen pull` (fast-forwards `.oxagen/`, re-points the symlinks, never merges your work), `oxagen status`, `oxagen propose`. Opening and merging a proposal's pull request are not CLI verbs, because both gate on a role only a signed-in person holds.
- **Connect a directory** opens the pairing dialog. There is no browse button: the browser cannot see a filesystem, and a path typed into a web form proves nothing about what is at it. The directory identifies itself by running one command in it, and what arrives is the git remote, the branch and the head — facts the machine read. The pairing code authorises once and expires; what identifies the copy afterwards is the machine's enrollment, so a code that leaks after it is spent links nothing. **Linking a directory grants nothing** — a person's roles decide what they may do here and an agent's mandate decides what it may do there; a laptop is not a principal.

### Changes

Every pull request Oxagen has open, across every kind of file. Columns: Change · Kind · Pull request · Opened by · State · Checks · Opened.

- **Kind** is one of `Oxagen init`, `steering record`, `skill`, `agent`, `tool`, `configuration`. Four kinds of file and one lifecycle: whoever opened it, the checks, the merge and the publication are the same, and only the body differs.
- **Opened by** names a person, **the promoter** or **the reconciler**, and the row says which. A promoter argues from runs; a person argues from the person; the reconciler argues from two records it read.
- Selecting a row shows the pull request: the files it carries, why it exists, the checks with each one's own result text, and either **What merge will do** (five numbered consequences) or, once merged, what the merge did. **A check can fail, and a failed check stops the run where it stopped** — the failing row says why, the checks behind it stay queued, merge is disabled and nothing is published. A check that can only report "pass" is not a check.
- **Merge pull request** is disabled until every check reports and is a no-op if called anyway. **Close without merging** discards the branch and publishes nothing; a merged one cannot be closed, because taking something back out of force is its own pull request.
- **What opens one, without anybody asking** — the promoter, the reconciler, a person. **Drift is reported, never repaired in place.** A reconciler that silently edited either side would make the file a description of the past and the product unreviewable; the pull request is the only place a person can say which of the two was right.

### Configuration

- **`.oxagen/workspace.toml`** as it is on the production branch, at the commit it was read from.
- **Drift** — the file against what the control plane has, per declaration, with which side is right. Two rows the reconciler can argue for because it read both sides; the third (a linked repository with no `.oxagen/`) it cannot, because that is a decision about scope and not a difference between two records, so it waits for a person.
- **`.oxagen/rules/governance.toml`** with the three modes. It is read on the production branch when a pull request is opened **and again when it is merged**, so raising the mode takes effect on everything already in flight. A file that exists but names no mode refuses both rather than quietly falling back to `team`.
- **The whole tree** — `.oxagen/` as it is on disk. Oxagen reads `.oxagen/` and nothing else; whatever sits under `.stella/` is invisible to it, and it never looks.

**Dialogs this page opens:** `wz (init wizard)`, `linkdir`, `workcopy`, `repo`.

### The init wizard

The fifth thing an operator creates and the one the other four need first: the `.oxagen/` tree itself. Same shape as the rest of `docs/creation-spec.md` — describe it, Oxagen drafts the files, you read them, a pull request puts them there — with one difference. It is the only wizard that can run against a repository Oxagen has never written to, so before it drafts anything it says what it is about to be allowed to do (the permission table) **and what it still cannot do**: push to the production branch, merge on its own, read a secret, or grant authority.

Five steps: **Repository** (only repositories with no `.oxagen/` yet; main or linked) → **Branch & governance** (the production branch, with GitHub's default as the suggestion and not the decision; the governance mode) → **Permissions** → **Review** (both files in full, every line the operator's to change) → **Pull request** (six files, five checks).

It writes `.oxagen/rules/governance.toml`, which nothing else in the product writes. A workspace's governance mode is read off that file on every open and every merge, so the mode a repository starts under has to be chosen by a person, once, here — and changed the same way everything else is.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · connection badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Repositories, role, production branch | `REPOS` | `repositories` + the link row per workspace | `ingestion.repository_bindings`, `repository_binding_heads`; `bind_main_repository` binds main only | 🟡 |
| `.oxagen/` presence, file count, commit | `REPOS.ox` | read from the production branch through the App | nothing reads it; `.oxagen/` exists only where a record was written | ❌ |
| Working copies | `WORKCOPIES` | a working-copy row per enrolled machine | `oxagen init` writes `.oxagen/workspace.json` locally and reports nothing back | ❌ |
| Changes (steering records) | `OXPRS` (kind `record`) | `PROPOSES`, `PROMOTED_BY` | `open_steering_pr` / `merge_steering_pr` / `get_steering_pr`, six checks, promotions ledger | ✅ |
| Changes (agent definitions) | `OXPRS` (kind `agent`) | the same lifecycle | `commit_agent_definition` opens one; **nothing merges it** | 🟡 |
| Changes (skills, tools, config, init) | `OXPRS` | the same lifecycle | none — no skill sync, `.oxagen/tools/` documented unbuilt (ADR-072), no reconciler, no init | ❌ |
| Governance mode | fixture | `.oxagen/rules/governance.toml` | read by `context.steering.policy.ts`; **nothing writes it** | 🟡 |
| Drift | fixture | the file against Postgres | nothing reconciles them | ❌ |

## Functionality

- Every path on this page ends on a pull request. Nothing here writes a row, and nothing merges without a person.
- Changing which repository is `main` is an organization-owner action with approval, recorded as a security event.
- The production branch never moves on its own: a default-branch change on GitHub is recorded and prompts.
- A repository-scoped record may narrow what a workspace record allows. It may never widen it, and one claiming workspace scope fails the checks.
- Nothing in `.oxagen/` can grant authority — not a record, not a skill, not a tool manifest, not the init tree.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — "This workspace has no repository yet" — a workspace without a main repo cannot exist, so this is the moment between creating one and binding it. Until it is bound there is nowhere for a record to be published to. Action: **Add Oxagen to a repository**.
- **loading** — the shell stays; the page body is replaced by the skeleton, so the operator keeps their bearings.
- **error** — "Repositories could not be loaded" — `503 installation_unreachable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — "You cannot see this workspace's repositories" — the roles the signed-in person holds do not include `repository.read on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet**, **Agents**, **Tools**, **Spend**, **More**; Repositories is in the **More** sheet, with its open-pull-request count. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; the four tables become stacks of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `repository.read`
- Writes (each a governed action recorded in Audit): `repository.link (add Oxagen to a repository)`, `repository.admin (change which repo is main)`, `context.propose (open a pull request)`, `context.review (merge one)`, `workcopy.link (connect a directory)`

## Backend gaps this page depends on

- `.oxagen/` presence read from the production branch — nothing reads it today
- A working-copy record: `oxagen init` writes locally and reports nothing back
- Writing `governance.toml` — it is read on every open and merge and written by nothing
- A merge capability for agent-definition pull requests, to match `merge_steering_pr`
- Skill and tool pull-request paths (`.oxagen/tools/` is documented unbuilt, ADR-072)
- The reconciler, and the drift record it reads
- GitHub App permissions: the documented set is read-only, and this page's lifecycle writes

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
- A working copy's state is never presented as a run's state. The two are different facts about different machines, and conflating them turns a stale laptop into a governance incident.
- The permission table shows the access this lifecycle actually needs, including the writes. A page that understates it is describing a product that cannot open a pull request.
