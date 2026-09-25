## Working copies

The table of directories, on named machines, that hold this workspace's `.oxagen/` tree, and whether each is in step with the production branch.

### Purpose
It answers which laptops and runners carry a checkout linked to this workspace, whose they are, and which ones trail what is published. A row opens that copy. **Connect a directory** starts a new link.

### Rationale
Each row is a directory where someone ran `oxagen init`, linked by one gitignored file, `.oxagen/workspace.json`. That subtitle left the panel and lives here. A working copy is a fact about a machine. It never says anything about a run: steering reaches a run from the merged commit, in the signed bundle, whatever a directory holds (`mockups/pages/repositories-copies.md`, Job). So the table reports what a person reading the checkout sees, and no state here is a governance incident.

A banner once repeated the out-of-step count in a paragraph. The `.oxagen/` cell says it in a word, on the row it is true of, and the count is on the tab.

Two files under `.oxagen/` share a name and do different jobs. `workspace.toml` describes the workspace, is committed, and goes through review. `workspace.json` names the workspace this checkout talks to. It describes one machine, so it is gitignored, nobody commits or reviews it, and it is never the same file in two places. The split keeps a laptop's link out of git, where it would drift between people (`docs/mission-control-spec.md` §10.2). The rest of the tree is `rules/`, `proposals/`, `agents/`, `skills/` and `tools/`.

Everything that touches a directory happens on the machine, because the browser cannot see a filesystem. Four commands do the work:
- `oxagen init` links the directory. It reads the git remote, matches it to a repository the installation can reach, and writes `.oxagen/workspace.json`. It is idempotent.
- `oxagen pull` fast-forwards `.oxagen/` to the production branch and re-points the Stella symlinks. It never merges your work.
- `oxagen status` compares the copy with what is published: the bundle version, the records in force, and anything uncommitted under `.oxagen/`.
- `oxagen propose` turns a local edit under `.oxagen/` into a proposal. You open and merge its pull request in Oxagen, because both need a role that only a signed-in person holds.

Stella reads the directory through symlinks (`.stella/rules`, `.stella/proposals` and `.stella/agents` into `.oxagen/`), so there is no second copy to drift. Where the Symlinks column reads `missing`, Stella loads nothing (§10.2).

The tab used to carry two panels under the table: Files to review (the tree above, with one comment per file) and Sync (the four commands). Both only taught the layout and the CLI and read nothing from a copy, so they left the page and their content lives here. The `linkdir` dialog still shows the one command a person runs to link a directory.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Directory, machine, person | `WORKCOPIES` through `wsCopies()` | a working-copy row per enrolled machine | future-only |
| Repository, branch, head | `WORKCOPIES[].repo`, `.branch`, `.head` | the same | future-only |
| `.oxagen/` state, uncommitted count | `.oxagen`, `.dirty`, `WC_STATE` | the same | future-only |
| Symlinks, bundle, last seen | `.symlinks`, `.bundle`, `.seen` | the same | future-only |
| `oxagen init` | help copy | `apps/cli/src/commands/init.ts` | shipped |
| `oxagen pull` | help copy | a CLI command | future-only |
| `oxagen status` | help copy | `oxagen steering status` (`apps/cli/src/program.ts:598-612`) | partial |
| `oxagen propose` | help copy | `oxagen context propose --lineage <id>` (`apps/cli/src/program.ts:438-450`) | partial |

### Logic
- `wsCopies()` keeps the copies whose repository is one of `wsRepos()`.
- `WC_STATE` maps `in-sync` to "in sync" (allowed ink), `behind` and `uncommitted` to the approval ink, and `unbound` to "not linked". A dirty copy adds "<n> uncommitted" beneath.
- Symlinks reads `ok` or `missing`.
- `rowClick()` makes each row reachable by Tab and opened by Enter or Space, labelled "Open <path> on <machine>". It opens `workcopy`.
- **Connect a directory** is gold on this tab, and the header's **Add .oxagen/** gives up its gold (`tabPrimary` in `pRepos()`).
- Where a build names the CLI, it prints the names the CLI ships (`oxagen init`, `oxagen steering status`, `oxagen context propose`) until the design's names exist. It leaves out `oxagen pull` and says `git pull` on the production branch updates `.oxagen/` today.

### States
- **Loaded**: four copies in the demo.
- **Loaded with no copy**: the panel reads "No directory is linked to <workspace> yet.", keeps **Connect a directory** (gold), and adds "Run oxagen init in a directory to link it." The line "You cannot link one by typing a path here, because the browser cannot see your filesystem." moved here. The panel keeps its gold, so the screen always has a primary action.
- **Build today**: `oxagen init` reports nothing back, so the app shows the empty panel and says no working copy is recorded yet (`apps/app/src/features/repositories/working-copies.tsx:94`).
- **Mobile**: one card per copy, each cell labelled.

## Directory connection {#dialog/linkdir}

The dialog that links a directory: one command to run in it, with a pairing code.

### Purpose
It gives a person the exact command, with the organization and workspace filled in, and a single-use pairing code. The lead says "Run this in the directory you want linked." **Copy command** is the gold action.

### Rationale
There is no browse button and no path field. A path typed into a web form proves nothing about what is at it. The directory identifies itself: the person runs one command in it, and what arrives is what the machine read (the git remote, the branch, the head). That fact is what makes a working-copy row worth showing (the comment above `DLG_EXT.linkdir`).

Several passages moved here from the dialog.
- The command reads the git remote, matches it against the repositories this installation can reach, and writes the one gitignored file that says which workspace this checkout talks to.
- The code works for one pairing. After that, the machine's enrollment identifies the copy, so a used code links nothing.
- What the command writes: `.oxagen/workspace.json`, with the organization, workspace, path and machine. It is gitignored, so nobody reviews or merges it.
- What it links: `.stella/rules`, `.stella/proposals` and `.stella/agents` as symlinks into `.oxagen/`, so there is no second copy to drift.
- What it does not write: anything committed under `.oxagen/`. A repository with no tree is told so and offered the pull request that adds one.
- What it does not read: the working tree. Oxagen reads `.oxagen/` and nothing else. What a run needs from the rest of the repository reaches Oxagen as SteeringFrames, through the hooks.
- Linking a directory grants nothing. A person's roles decide what they can do in Oxagen, and an agent's mandate decides what it can do. A laptop is not a principal.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The command | `ORG.slug`, `ws().slug` | `oxagen init` | shipped |
| Pairing code and expiry | a constant in `DLG_EXT.linkdir` | a short-lived code the control plane issues | future-only |
| Copy command | a notice | the clipboard, then the pairing | partial |

### Logic
- The dialog renders the command `oxagen init --org <org> --workspace <workspace>` with the comment "# Pairing code: 4QF2-91KD · expires in 9:41".
- The footer shows the organization and workspace in mono, **Close**, and **Copy command** (gold), which reports "Waiting for a directory to pair…".
- The build copies the command. Until codes are issued, it prints "# Pairing code: not issued yet" and says the directory is linked on the machine only.

### States
- One form. **Mobile**: a bottom sheet with full-width buttons.

## Working copy {#dialog/workcopy}
<!-- open: openDialog('workcopy','wc_01K6T2D8') -->

The dialog for one working copy: where it lives, what it holds, and what, if anything, it needs.

### Purpose
It answers whether this directory matches what is published and, if not, what a person should do: nothing, run `oxagen init`, pull, or propose the local edits.

### Rationale
The row shows the state in a word. The dialog adds the facts behind it and one note. Each note keeps its fact and its fix, and the explanations moved here.
- Symlinks missing: Stella's loader has no rules directory to read.
- Behind: whoever reads this copy sees rules that are no longer in force. Runs are not affected: steering reaches a run from the merged commit, in the signed bundle.
- Uncommitted: the edits steer nothing, here or in a run, until a pull request carries them.
- `oxagen propose` hands the pull request to Oxagen: you open and merge it there, because both need a role that only a signed-in person holds.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Repository, remote, branch, head | `WORKCOPIES` via `copyById()` | a working-copy record | future-only |
| Machine and enrollment | `.os`, `.enrollment` | the machine's enrollment | future-only |
| `.oxagen/`, symlinks, bundle, last seen | `.oxagen`, `.symlinks`, `.bundle`, `.seen`, `STEER_BUNDLE.v` | the same | future-only |
| Uncommitted files | a constant in `DLG_EXT.workcopy` | the copy's report | future-only |
| Ask for a pull | a notice | a message to the machine | future-only |

### Logic
- The title is the path. The subtitle is "<machine> · <person>".
- Bundle adds "· published is v<n>" when the copy's bundle trails `STEER_BUNDLE.v`.
- In sync with symlinks ok: "This copy matches what is published. No action needed."
- Otherwise one note in the approval ink. Symlinks missing leads with "stella will load nothing here. The symlinks under .stella/ are absent. oxagen init re-creates them." Then "This copy is behind the production branch." or "There are edits under .oxagen/ that no pull request carries."
- A dirty copy lists "Uncommitted under .oxagen/" with the hint "Turning these into a pull request is oxagen propose."
- Footer: the copy id, **Close**, **Disconnect** (red, opens `copyoff`), and on a copy not in sync or with symlinks missing, **Ask for a pull** (gold), which reports "Asked <machine> to run oxagen pull".

### States
- An unknown id renders an empty "Working copy" dialog with **Close**.
- **Mobile**: a bottom sheet.

## Working copy disconnection {#dialog/copyoff}
<!-- open: openDialog('copyoff','wc_01K6T2D8') -->

The confirmation before Oxagen forgets a working copy.

### Purpose
It says what disconnecting does in one line, "oxagen forgets this directory. Nothing on disk is deleted.", and warns when uncommitted edits sit in it.

### Rationale
The link is one gitignored file on a laptop, so disconnecting is not a pull request: nothing committed changes, and the directory is left as it is. It is the one path on the Repositories page that is not a pull request. Moved here from the dialog: the machine stops reporting the directory, and the gitignored `.oxagen/workspace.json` in it stops resolving. Uncommitted edits are neither lost nor proposed: disconnecting does not lose them, and it does not propose them either. Running `oxagen init` in the directory again links it back.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Path and machine | `WORKCOPIES` via `copyById()` | a working-copy record | future-only |
| Uncommitted count | `.dirty` | the copy's report | future-only |
| Disconnect | `copyDisconnect()` | `workcopy.unlink` | future-only |

### Logic
- `DLG_EXT.copyoff` answers an unknown id with `noSuch("Working copy")`.
- The warning renders only when `dirty` is above zero: "<n> uncommitted edits under .oxagen/ here are carried by no pull request."
- **Keep it** closes. **Disconnect it** (red) calls `copyDisconnect()`, which removes the row and reports "<path> on <machine> disconnected."
- The build records the disconnect in Audit with the person's name.

### States
- **Mobile**: a bottom sheet with full-width buttons.
