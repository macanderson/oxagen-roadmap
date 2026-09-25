# Agent source

## Page header {#agent-source/header}

The Source page header names the agent's definition file, the repository and commit it sits at, and holds **Discard** and **Save**.

### Purpose

It tells a person which file they are editing, at which commit, and whether a change of theirs already sits on a branch that has not merged. **Save** starts the one path a change takes: a commit on a branch and a pull request. **Discard** throws the draft away.

### Rationale

The agent definition is this file. Identity and credentials live in Oxagen's database, and everything the definition says lives in git (ADR-057). Saving opens a pull request against the main repository, and nothing is written to Oxagen's database. The merge is the change: the running definition, and the `definition_digest` every frame records, stay where they are until a person merges. The Definition in git tab and its form were cut (the Cuts table in `docs/fleet-operations-wedge.md`), so this page is the one editor for the one file. The file's instructions reach the agent as a `procedure` SteeringFrame, which the Steering tab lists with this file as its source. **Save** is the page's one gold action.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Path | `defSlug(a)` | `get_agent` `definition.path` | live |
| Main repository chip | `w.main` | The workspace's main repository | partial |
| Branch and commit chip | `w.branch`, `a.commit` | `get_agent` `definition.branch`, `definition.commitSha` | partial |
| Pending branch chip | `S.defPending[slug]` | The pending branch, read back after a commit | partial |
| Agent key chip | `a.key` | `get_agent` `identity` | live |
| Save | `edSave()` → `openCommit(slug, "editor")` | `commit_agent_definition` | live |
| Discard | `edDiscard()` | None. The draft lives in the page until it is committed | live |

### Logic

1. `pAgentSource(r)` finds the agent by slug with `agentBySlug()`. No match draws "Agent not found" and "No agent named <slug>" with no action.
2. The eyebrow reads "Agent · Source", and Agent links to the agent's Overview. The h1 is the path, `.oxagen/agents/<slug>.toml`, in mono.
3. The chips read the main repository, then the branch. When `S.defPending[slug]` holds a commit that has not merged, the branch chip is that branch as an amber badge. Otherwise it reads "<branch> @ <commit>". Then "source of truth" and the agent key.
4. **Discard** is disabled while `defDirty(slug)` is false. `edPaint()` updates it on every keystroke. A click sets the draft back to `defBase(slug)`.
5. **Save**, and ⌘S in the editor, open the commit dialog. `openCommit()` drafts a summary, a body and a branch name. When a pending branch exists, has no pull request, and the draft is unchanged, the dialog opens on that branch to open its pull request.
6. A commit records `S.defPending[slug]`, and the chip shows the pending branch until it merges.
7. The tab bar under the header is the agent's tab bar. It is specified in the agent overview help.

### States

The catalog lists the loaded state only. The renderer still carries three rev1 branches: loading draws the skeleton, error draws "This file" with `502 git_read_unreachable`, and denied names `agent.write on <workspace>`. On a phone the path and the chips wrap, and **Discard** and **Save** sit under them.

## Editor {#agent-source/editor}

The editor is a TOML source editor over the agent's definition file, with line numbers, highlighting, find, and a status line.

### Purpose

A person edits the definition directly: the name, the description, the model class, the tools and the tools it may never call, the side effects, the budget, the instructions and the harness settings. The draft stays until they discard it or commit it.

### Rationale

One file defines the agent, so one editor edits it, and it edits the file as text. The Definition in git tab's form was cut, and this editor took its place. The draft is shared state for the agent: a change survives leaving the page and coming back. The file must parse, and a file that names another schema or another slug cannot be committed, because `commit_agent_definition` refuses it.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| File text | `defBase()` and `defSrc()`, seeded by `agentTomlSeed()` | `.oxagen/agents/<slug>.toml` at the head of the default branch. `get_agent` `definition.source` caches the last commit's text | partial |
| Schema | `schema = "agent-definition/v0.1"` | `AGENT_DEFINITION_SCHEMA` | live |
| Dirty marker, cursor and find | `S.ed` | None. Page state | live |

### Logic

1. `S.defBase[slug]` is the file at the head of the branch it was last committed to, the default branch until the first commit. `S.defSrc[slug]` is the working draft. `defDirty()` compares the two.
2. `edMount()` fills the textarea, paints, restores the selection, and focuses the textarea unless a dialog is open.
3. `edPaint()` draws three layers behind the textarea: `hlToml()` highlights keys, strings, numbers, booleans, table headers and comments in one pass with colours from the theme tokens, `edMarks()` marks find matches, and a gutter numbers the lines. It also sets the dot and the word "modified" or "unchanged".
4. `edKey()` maps the keys: ⌘S saves, ⌘F moves to find, ⌘/ comments or uncomments the selected lines, Tab inserts two spaces or indents the selected lines, ⇧Tab outdents, and Enter keeps the line's indent and adds two after an opening bracket. Brackets and quotes close themselves, a typed closer steps over its match, and Backspace between a pair deletes both.
5. In find, Enter goes to the next match and ⇧Enter to the previous one. Both wrap around the file, and the match scrolls to the middle. Escape clears find. The count reads "<n> of <total>" once a match is selected.
6. The status line reads the cursor ("Ln <n>, Col <n>", with "(<n> selected)"), "TOML", "Spaces: 2", "LF", "UTF-8" and the key hints.
7. `tomlParse()` reads strings, multi-line strings, numbers, booleans, arrays, inline tables and tables, and throws with the line number. The editor shows no parse error today and lets an invalid file reach the commit dialog. A build shows the error at its line and disables **Save**.

### States

The editor draws only in the loaded state. On a phone the editor fills the width, long lines scroll inside it, the find field drops under the path, the status line wraps, and the textarea's text is 16 px so the page does not zoom.

## Tab bar {#agent-source/tabs}

The eight agent tabs, drawn on the Source page with Definition selected.

### Purpose
The strip keeps the agent's other tabs one click away while you edit its file. Definition is selected, because the Source page is where the Definition tab lands.

### Rationale
The Source page is its own route (`#/<org>/<ws>/agents/<slug>/source`), and the review island treats it as a record page, so its tab bar carries its own key instead of falling back to `agent/tabs`. The strip is the same one every agent tab draws, and its full specification is in `mockups/help/agent.md`, Tab bar. The Definition in git tab and its form are cut (the Cuts table in `docs/fleet-operations-wedge.md`), so this editor is the one place the file is edited, and the old `/definition` address lands here with a 308 in the app.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tab list | `IAM_TABS` | The route table of the agent page | live |
| Selected tab | fixed: Definition | The route segment `source` | live |
| Tab counts | none on this page | The same reads the agent tabs use (`get_agent_toolbelt`, `list_mandates`, `list_incidents`) | partial |

### Logic
1. `pAgentSource()` draws `IAM_TABS` with `aria-selected` true on `definition`.
2. Each tab sets `S.tab.agent` and goes to `#/<org>/<ws>/agents/<slug>/<tab>`. Overview goes to the bare agent address.
3. The Definition tab goes to `/definition`, which the router rewrites to `/source` (`hashRewrite`), so it reloads this page.
4. This page draws no counts on Toolbelt, Permissions and Activity. The agent tabs draw them. A build shows the same counts here.
5. The strip is `role=tablist`, and each tab is `role=tab` with `aria-selected`.

### States
The loading, error and denied states replace the tab bar with the page body. On a phone the strip scrolls in its own row and keeps Definition in view.

## Commit this change {#dialog/commit}
<!-- open: openCommit('triage','editor') -->

The dialog that commits the edited definition to a branch of the main repository and, with its switch on, opens a pull request.

### Purpose
It answers "where does this change go, what does it say, and what will review it". You pick the branch, read or rewrite the drafted summary and description, choose whether to open a pull request, check the diff, and commit. **Save** on the Source page and ⌘S in the editor open it.

### Rationale
The definition file in git is the record, and the identity lives in Postgres (ADR-057 in `macanderson/oxagen`). So a change to an agent is a commit and a pull request, never a write to the database. The repository is fixed: it is the main repository linked to the workspace, and every agent definition in the workspace lives there, so the dialog shows it and offers no choice. The branch is a choice, so a person can stack a change onto an open pull request or start a new one.

The drafted summary and description are a starting point. What you commit is what you wrote. With the switch on, the pull request goes against the base branch, titled from the summary. Governance mode `team` asks the code owners of `.oxagen/agents/` to review it, and the merge is the change. With the switch off, the commit goes to the branch only. Nothing changes for the running agent until someone opens and merges a pull request, and your coding agent can pick the branch up from the repository. The principal, the roles and the toolbelt update when the pull request merges. Until then the running definition stays at its commit, and its `definition_digest` does not change. These sentences sat in the dialog as hints and a closing note. They moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Path, diff stat, origin | `S.cm`, `diffLines()`, `diffStat()` | The draft against the file at the base | live |
| Repository and base | `w.main`, `w.branch`, `a.commit` | The workspace's main repository and the definition's commit | partial |
| Branches | `BRANCHES` | `list_branches` (`repo.branch.list.ts:5`) | live |
| Summary, description, Redraft | `draftCommit()` | No capability drafts a commit message | future |
| Change kind and areas | `draftCommit()` over `defChanges()` | Derived from the parsed diff | partial |
| Risk callout | `draftCommit().risk` | The checks on the pull request | partial |
| Governance mode | fixed `team` | The workspace's governance mode | partial |
| Commit and pull request | `commitConfirm()`, `S.defPending` | `commit_agent_definition` (`agent.definition.commit.ts:46`) | live |

### Logic
1. `openCommit(slug, from)` drafts the change with `draftCommit()` and stores it in `S.cm`. When the agent has a pending branch with no pull request and the draft is unchanged, the dialog opens in pull-request-only mode on that branch.
2. `draftCommit()` reads the field changes (`defChanges()`), names an area for each (model routing, budget, toolbelt, side effects, instructions, metadata, harness), and writes one line per change. The title follows the change: "Move <slug> to the light tier", "Lower <slug> per-run budget to $X", or "Update <slug>: <areas>". The kind is `widens authority` when a change adds a tool, removes a deny, or adds `irreversible`, then `formatting`, `cosmetic` or `behavioral`. The branch name is `agent/<slug>/<title words>`.
3. The draft line names the drafting model (`z-ai/glm-flash-latest`, the light model class), its tokens, its cost and its latency. **Redraft** reruns `draftCommit()`.
4. The Branch select opens on **+ New branch**, then lists this agent's open change and the repository's branches with their pull requests. A new branch reads "Cut from <base> @ <commit>." An existing branch shows how far it is ahead, who pushed last, and whether a pull request already covers it.
5. A risky change shows a callout: the checks hold the merge for a code-owner review, and for an active mandate when the change adds `irreversible`.
6. The switch reads "Against <base>, titled from the summary." on and "Push the commit to the branch only." off. A branch whose pull request is open shows "<pr> already covers this branch" instead, and the commit updates that pull request. Pull-request-only mode shows "Opens the pull request for <branch>".
7. The primary button reads **Commit and open the pull request**, **Commit to the branch**, or **Open the pull request**, and stays disabled until the branch and the summary are filled.
8. `commitConfirm()` moves the base to the draft, records the pending branch in `S.defPending`, adds a new branch to `BRANCHES`, and toasts "Committed +N −M to <branch> on <repo> · <pr> opened". The Source header then shows the pending branch until it merges. A build calls `commit_agent_definition`, which refuses the default branch, a file whose `schema` is not `agent-definition/v0.1`, and a `slug` that is not the agent's.

### States
The mockup opens the dialog on a file that does not parse. A build shows the parse error in the editor and disables Save, so an invalid file never reaches the dialog. On a phone the dialog rises as a bottom sheet with full-width footer buttons, and the split diff falls back to one column.
