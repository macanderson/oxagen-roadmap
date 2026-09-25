# Working copies

| | |
|---|---|
| Route | `#/a-intel/core-platform/repositories/copies`. The path is unchanged (`fleet-operations-routes.md`, Runtimes and Repositories). The app serves this tab at `/{org}/{ws}/repositories/working-copies` (`apps/app/src/features/repositories/view.ts:11-16`) |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: Unchanged (Repositories keeps its design). `docs/fleet-operations-ia.md`: Runtimes and Repositories. `docs/fleet-operations-routes.md`: Runtimes and Repositories. `docs/mission-control-spec.md` §10.2 (the `.oxagen/` layout and the gitignored `workspace.json`) |
| Design | `mockups/src/engine.js`: `copyTab()`, `wsCopies()`, `WC_STATE`, `stBadge()`, `rowClick()`, `DLG_EXT.linkdir`, `DLG_EXT.workcopy`, `DLG_EXT.copyoff`, `copyDisconnect()`, inside `pRepos()`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / Repositories / Working copies`: Loaded, Empty, Loading, Error, Access denied, and each state · mobile |
| Audit | `repositories-copies.audit-prompt.md` |

The Repositories header, tabs and state panels are specified in `repositories.md`.

## Job

Show which directories, on which machines, hold this workspace's `.oxagen/` tree, whether each is in step with the production branch, and let a person link one or disconnect it. A working copy is a fact about a laptop. It never says anything about a run: steering reaches a run from the merged commit, in the signed bundle, whatever a directory holds.

## What is on the page

**Header and tabs** as `repositories.md`, with Working copies (2) selected. On this tab the header's **Add .oxagen/** is plain, because the panel's **Connect a directory** is the one gold action.

**Working copies panel.** Heading "Working copies", subtext "Each row is a directory where someone ran oxagen init, linked by one gitignored file." **Connect a directory** (gold, opens `linkdir`) at the right. The shell's list tools sit above the rows: "Search this list", the filters "Any symlinks" (Missing, Ok), "Any bundle" (v39, v41) and "Any repository" (a-intel/billing, a-intel/mobile, a-intel/platform), Rows, sortable headers and a pager over the four rows.

Columns, in order: Directory · Repository · Branch · `.oxagen/` · Symlinks · Bundle · Last seen.

| Directory | Repository | Branch | `.oxagen/` | Symlinks | Bundle | Last seen |
|---|---|---|---|---|---|---|
| ~/src/platform (mba-mbell · Marcus Bell) | a-intel/platform | feat/ledger-compaction, b71d4ae | in sync | ok | v41 | 40 s ago |
| /home/runner/work/platform/platform (ci-runner-07 · a-intel CI) | a-intel/platform | main, a4c91e2 | in sync | ok | v41 | 3 min ago |
| ~/work/billing (mbp-dokafor · Dana Okafor) | a-intel/billing | main, 7e0b331 | behind | ok | v39 | 2 h ago |
| ~/src/mobile (mba-pnatarajan · Priya Natarajan) | a-intel/mobile | release, c02fa77 | uncommitted, 2 uncommitted | missing | v41 | 18 min ago |

- **Directory** carries a folder icon, the path in mono, and the machine and person beneath.
- **Branch** prints the branch over its head commit.
- **`.oxagen/`** is a badge: `in sync` in the allowed ink, `behind` or `uncommitted` in the approval ink, or `not linked` in the neutral ink, with the count of uncommitted files beneath.
- **Symlinks** is a badge, `ok` or `missing`.
- Every row opens `workcopy` on click, Enter or Space (`role="button"`, `tabindex="0"`, `aria-label="Open <path> on <machine>"`).
- No banner sits above the table. The `.oxagen/` cell carries the state on the row it is true of, and the count is on the tab.

With no copy linked, the panel reads "No directory is linked to Core platform yet.", keeps **Connect a directory** (gold), and adds the note "Run oxagen init in a directory to link it. You cannot link one by typing a path here, because the browser cannot see your filesystem."

**Files to review.** The tree:

```
.oxagen/
  workspace.toml     # committed. reviewed. the source of truth.
  workspace.json     # gitignored · this machine’s link
  rules/
  proposals/
  agents/
  skills/
  tools/
```

A note beneath says the committed file says what the workspace is, and the gitignored one says which workspace this checkout talks to, a fact about a laptop and not about the product, so it is never reviewed, never merged, and never the same file in two places.

**Sync.** Four commands, each with one line:

- `oxagen init`: "Links this directory. Reads the git remote, matches it to a repository the installation can reach, and writes .oxagen/workspace.json. Idempotent."
- `oxagen pull`: "Fast-forwards .oxagen/ to the production branch and re-points the stella symlinks. It never merges your work."
- `oxagen status`: "Compares this copy with what is published: the bundle version, the records in force, and anything uncommitted under .oxagen/."
- `oxagen propose`: "Turns a local edit under .oxagen/ into a proposal. You open and merge its pull request here, because both need a role that only a signed-in person holds."

The note: "stella reads this directory through symlinks, so there is no second copy to drift. Where the symlinks read missing, stella loads nothing."

**Dialogs this page opens:** `linkdir`, `workcopy` and `copyoff`, and the init wizard from the header (specified in `repositories.md`).

- **`linkdir`**, "Connect a directory", subtitle "one command, run in the directory". The lead: "Run this in the directory you want linked. It reads the git remote, matches it against the repositories this installation can reach, and writes the one gitignored file that says which workspace this checkout talks to." Under "In the directory": `oxagen init --org a-intel --workspace core-platform` and the comment "# Pairing code: 4QF2-91KD · expires in 9:41", with the hint "The code works for one pairing. After that, the machine’s enrollment identifies the copy, so a used code links nothing." Under "What it writes, and what it does not", four lines. Writes: `.oxagen/workspace.json`, with org, workspace, path and machine, gitignored, never reviewed and never merged. Links: `.stella/rules`, `.stella/proposals` and `.stella/agents` as symlinks into `.oxagen/`. Does not write: anything committed under `.oxagen/`, and a repository with no tree is told so and offered the pull request that adds one. Does not read: the working tree, because Oxagen reads `.oxagen/` and nothing else. The note: "Linking a directory grants nothing. A person’s roles decide what they can do here, and an agent’s mandate decides what it can do. A laptop is not a principal." Footer: "a-intel · core-platform", **Close**, **Copy command** (gold), which reports "Waiting for a directory to pair…".
- **`workcopy`**, titled with the path, subtitled "<machine> · <person>". Facts: Repository, Remote ("git@github.com:a-intel/platform.git"), Branch ("feat/ledger-compaction at b71d4ae"), Machine ("macOS 15.3 · arm64 · enr_01K5RQ4B9C"), `.oxagen/`, Symlinks, Bundle (with "· published is v41" when it trails), Last seen. Then one note by the copy's state:
  - in sync with symlinks ok: "This copy matches what is published. No action needed."
  - behind: "This copy is behind the production branch, so whoever reads it sees rules that are no longer in force. Runs are not affected: steering reaches a run from the merged commit, in the signed bundle."
  - symlinks missing: "stella will load nothing here. The symlinks under .stella/ are absent, so its loader has no rules directory to read. oxagen init re-creates them."
  - uncommitted: that there are edits under `.oxagen/` no pull request carries, and they steer nothing, here or in a run, until one does. Beneath, "Uncommitted under .oxagen/" lists the files (`.oxagen/rules/ctx.mobile.release-train.toml`, "statement edited locally"; `.oxagen/agents/screenshot-bot.toml`, "never committed") with the hint "Turning these into a pull request is oxagen propose. You open and merge it in oxagen, because both need a role that only a signed-in person holds."
  - Footer: the copy's id in mono, **Close**, **Disconnect** (red, opens `copyoff`), and on a copy that is not in sync or has symlinks missing, **Ask for a pull** (gold), which reports "Asked <machine> to run oxagen pull".
- **`copyoff`**, "Disconnect <path>?". The note: "oxagen forgets this directory. <machine> stops reporting it, and the gitignored .oxagen/workspace.json in it stops resolving. Nothing on disk is deleted and nothing committed changes." With uncommitted edits, the warning "2 uncommitted edits under .oxagen/ here are carried by no pull request. Disconnecting does not lose them, and it does not propose them either." Then "Running oxagen init in the directory again links it back." Footer: **Keep it**, **Disconnect it** (red), which reports "<path> on <machine> disconnected. The directory is untouched. Run oxagen init there to link it again."

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Working copies: directory, machine, person, repository, branch, head, `.oxagen/` state, symlinks, bundle, last seen | `WORKCOPIES` through `wsCopies()` | a working-copy row per enrolled machine | None. `oxagen init` writes `.oxagen/workspace.json` on the machine and reports nothing back, so the app's table stays empty and says so (`apps/app/src/features/repositories/working-copies.tsx:94`; `apps/app/messages/repositories.json`, `copies.notRecorded`) | ❌ |
| The tab count (copies out of step) | `wsCopies()` | the same rows | none | ❌ |
| Pairing code | a constant in `DLG_EXT.linkdir` | a short-lived pairing code | Not issued. The app prints "# Pairing code: not issued yet" and says the directory is linked on the machine only (`repositories.json`, `linkdir.pairing`, `linkdir.pairingHint`) | ❌ |
| `oxagen init` | copy | the CLI command | Ships: resolves the organization and workspace, writes `.oxagen/workspace.json`, and is idempotent (`apps/cli/src/commands/init.ts:1-17`) | ✅ |
| `oxagen pull` | copy | a CLI command | Not in the CLI. The app says `git pull` on the production branch updates `.oxagen/` today (`repositories.json`, `copies.sync.pull`) | ❌ |
| `oxagen status` | copy | a CLI command | Ships as `oxagen steering status`, which compares `.oxagen/` against the remote production branch (`apps/cli/src/program.ts:598-612`) | 🟡 |
| `oxagen propose` | copy | a CLI command | Ships as `oxagen context propose --lineage <id>`, which records a proposal whose pull request is opened and merged in Oxagen (`apps/cli/src/program.ts:438-450`) | 🟡 |
| Connect a directory | `DLG_EXT.linkdir` | the command, the pairing, the copy's row | The command ships. The pairing and the row do not | 🟡 |
| Disconnect, Ask for a pull | `copyDisconnect()`, a notice | a working-copy record, and a message to the machine | none | ❌ |

## Future-only fields

The view carries no `data-future` mark. Almost all of it is future-only all the same: the rows, the tab count, the pairing code, `oxagen pull`, **Disconnect** and **Ask for a pull**. A build shows the empty panel with **Connect a directory** and the note that no working copy is recorded yet, names the command that links a directory, and prints the command names the CLI ships (`oxagen init`, `oxagen steering status`, `oxagen context propose`) until the design's names exist.

## Functionality

- **A directory identifies itself.** There is no browse button and no path field: the person runs one command in the directory, and what arrives is what the machine read (the git remote, the branch, the head). The pairing code authorises the link once, and afterwards the copy is known by the machine's enrollment.
- **Linking grants nothing.** A person's roles decide what they may do in Oxagen, and an agent's mandate decides what it may do on the machine. A laptop is not a principal.
- **States.** `in sync` holds what the production branch holds. `behind` trails it, which changes what the person reads and never what a run is steered by. `uncommitted` holds edits under `.oxagen/` that no pull request carries, and those edits steer nothing until one does. Symlinks `missing` means Stella loads nothing in that directory.
- **Disconnecting** is the one path on the Repositories page that is not a pull request, because nothing committed changes: Oxagen forgets the directory, the machine stops reporting it, the gitignored link stops resolving, and nothing on disk is deleted. `oxagen init` links it back. Uncommitted edits are neither lost nor proposed.
- **Turning local edits into a pull request** is `oxagen propose` on the machine. Opening and merging the pull request happen in Oxagen, because both gate on a role only a signed-in person holds.

## States

The catalog lists all five. The header, tabs and state panels are the Repositories ones in `repositories.md`. Empty reads "This workspace has no repository yet" with **Connect repository**. Loading is the skeleton. Error reads "Repositories could not be loaded" with `503 installation_unreachable`. Access denied reads "You cannot see this workspace’s repositories" and names `repository.read on core-platform`. On this tab the loaded state has a second form, the empty list described above, for a workspace with a repository and no linked directory.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with More lit. More holds Steering, Runtimes, Repositories (5), Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The tab strip scrolls within itself. The table becomes one card per copy, each cell labelled with its column. Files to review and Sync stack beneath the table, and the tree keeps its own horizontal scroll inside its block. The three dialogs rise from the bottom edge as sheets with full-width footer buttons. The page never scrolls sideways at 390 px.

## Permissions

- Read: `repository.read`.
- Connect a directory: `workcopy.link`. Disconnect: `workcopy.unlink`. Both are governed actions recorded in Audit, and neither is built.
- Proposing from a machine needs the person's role on the workspace, checked when the pull request is opened and merged in Oxagen.

## Backend gaps this page depends on

- A working-copy record: what `oxagen init` links, reported back per enrolled machine, with the branch, head, `.oxagen/` state, symlinks, bundle and last seen.
- A pairing code the control plane issues and expires.
- `oxagen pull`, and the command names `oxagen status` and `oxagen propose` if the design keeps them.
- Disconnect, and a request to a machine to pull.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. When `linkdir` says what a run needs from the rest of the repository reaches it at the hooks, it means SteeringFrames, and a build names them so.
- A Steering Source and a SteeringFrame are never shown as each other. An uncommitted record under `.oxagen/` is a draft of a source and steers nothing.
- Every fact on a copy's row is one the machine reported. No path typed by a person is shown as a copy, and nothing is inferred about a machine that has not reported.
- No person is scored or ranked. A copy names the person whose machine it is, and nothing more.
- A working copy's state is never presented as a run's state. A stale laptop is not a governance incident.
- Every enforcement claim states the tier. Linking a directory grants nothing.
- Headers are rollups of the rows beneath them. The tab count equals the copies not in sync.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: **Connect a directory** on this tab. A dialog carries its own.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
