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
