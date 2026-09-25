# Agent › Source

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents/release-manager/source`. `…/agents/<agent>/definition` becomes `…/source` in place (the app answers `/{org}/{ws}/agents/{agent}/definition` with a 308). The Definition in git tab and its form are cut; this page is the one editor for the one file |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: the Cuts row for the agent's Definition in git tab, the Emissions row for Agent definition (`procedure` from its instructions; its purpose is identity, not steering), and D17. `docs/fleet-operations-ia.md` (Agents: “The agent definition file in the editor. Saving opens a pull request”) and `docs/fleet-operations-routes.md` (Agents). ADR-057 in `macanderson/oxagen` (identity in Postgres, the definition in git) |
| Design | `mockups/src/engine.js` → `pAgentSource()`, with `edMount()`, `edPaint()`, `edKey()`, `edFindNext()`, `edDiscard()`, `edSave()`, `hlToml()`, `defBase()`, `defSrc()`, `defDirty()`, `agentTomlSeed()`, `IAM_TABS` and the commit dialog (`openCommit()`); the `definition` rewrite in `route()`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Agents / Source`: Loaded and Loaded · mobile. The catalog gives the view no `future` flag |
| Audit | `agent-source.audit-prompt.md` |

## Job

The agent's definition, `.oxagen/agents/<slug>.toml`, in a source editor. The file is the definition of record: the name, the description, the model class, the tools and the tools it may never call, the side effects, the budget, the instructions and the harness settings. Saving never writes Postgres. It commits to a branch and opens a pull request, and the merge is the change.

The instructions in this file reach the agent as a `procedure` SteeringFrame, listed on the agent's Steering tab with this file as its source.

## What is on the page

With component help off, the page carries no explainer text. Each part's specification is in `mockups/help/agent-source.md` (Page header, Editor, Tab bar, and Commit this change).

**Header.** The eyebrow reads “Agent · Source”, with Agent a link to the agent's Overview. The h1 is the path in mono: `.oxagen/agents/release-manager.toml`. Chips: the main repository (`a-intel/platform`), the branch at its commit (`main @ a4c91e2`, or the pending branch as a badge when a commit sits on a branch that has not merged), “source of truth”, and the agent key (`a-intel.core.release-manager`). The header has no subtext. That the file is the definition and that Save opens a pull request, never a database write, is in the component help (`mockups/help/agent-source.md`, Page header). Actions, in this order:

- **Discard** returns the draft to the base. It is disabled while the draft is unchanged.
- **Save** (gold) opens the commit dialog.

**Tabs.** The agent's eight tabs (`agent.md`), with Definition selected. Each opens its tab. This page draws the tab bar without the counts the other tabs carry, which is a mockup defect: a build shows the same counts on every tab.

**Editor.** One panel, carrying the help key `data-help="editor"`.

- A bar: the path, a dot and a word for the draft's state (“unchanged” or “modified”, the dot filled when modified), and a find field (placeholder “Find  ⌘F”, `aria-label` “Find in file”) with its match count (the match in view and the total once one is selected).
- A gutter of line numbers beside a textarea labelled with the path. The text is highlighted as TOML: keys, strings, numbers, booleans, table headers and comments. The demo file is 21 lines:

```toml
# .oxagen/agents/release-manager.toml
schema = "agent-definition/v0.1"
slug = "release-manager"
name = "Release manager"
description = "Prepares release notes and opens the release PR. Never merges."
model_tier = "complex"
tools = ["github__*", "linear__get_issue", "search_graph", "recall_context"]
deny_tools = ["github__merge_pull_request@*", "github__delete_*@*"]
side_effects = ["read", "write"]
budget = { per_run_micros = 2000000 }

[instructions]
body = """
You prepare releases for this repository. Read the changelog
conventions in .oxagen/rules before writing notes. Open a pull
request; a person merges it.
"""

[harness.claude-code]
color = "blue"
```

- A status line: the cursor position (“Ln 21, Col 1”, with “(N selected)” when text is selected), “TOML”, “Spaces: 2”, “LF”, “UTF-8”, and the key hints “⌘S save · Tab indent · ⇧Tab outdent · ⌘/ comment · ⌘F find · ⌘Z undo”.

Keys: ⌘S saves (opens the commit dialog), Tab indents by two spaces, ⇧Tab outdents, ⌘/ comments or uncomments the selected lines, ⌘F moves to the find field, Enter in find goes to the next match (⇧Enter the previous), Escape clears find, Enter keeps the line's indent (and adds two after an opening bracket), and brackets and quotes close themselves.

**Commit dialog** (from Save), titled “Commit this change”, with an eyebrow line “.oxagen/agents/release-manager.toml · +1 −1 · from the source editor”: the path, the diff stat of the draft against the base, and where the change came from.

- Repository and Base: `a-intel/platform` (“primary”) at `main @ a4c91e2`, with no hint. Why the repository is fixed is in the component help (`mockups/help/agent-source.md`, Commit this change).
- **Branch**: a select that opens on “+ New branch” and lists the repository's branches, each with its pull request where it has one. **New branch name** (“agent/release-manager/update-color”), with “Cut from main @ a4c91e2.”
- **Summary**: a drafted one-line summary (“Update release-manager color”), badges for the change's kind and area (“cosmetic”, “harness”), the line naming the model that drafted it, and **Redraft**.
- **Description**: the drafted body, with “Becomes the commit message and the pull request body.”
- **Open a pull request**: a switch (`role=switch`), on by default, with “Against main, titled from the summary.” Off, it reads “Push the commit to the branch only.” With the commit already on the branch it reads “Opens the pull request for <branch>” over “The commit is already on the branch.”, and with a pull request already open it reads “<pr> already covers this branch” over “The commit lands on the branch and the pull request updates itself.” Who reviews, and what changes for the running agent when, is in the component help. When the draft touches a sensitive field, a callout says the checks will hold the merge for a code-owner review.
- **Diff against main**, with the count of lines changed. No note follows it. When the principal, roles and toolbelt update is in the component help (`mockups/help/agent-source.md`, Commit this change).
- The footer names what will be written (“New branch agent/release-manager/update-color on a-intel/platform”), then **Cancel** and the primary button: **Commit and open the pull request**, **Commit to the branch** (switch off, or a branch whose pull request is already open), or **Open the pull request** (the commit is already on the branch). It is disabled until the branch and the summary are filled.

Committing records the pending branch; the header's branch chip then shows it until it merges.

**Shell.** As on Agents, with Agents lit and the breadcrumb Anderson Intelligence Corp. / Core platform / Agents / release-manager / source.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Contract paths are under `packages/oxagen/src/contracts/` in `macanderson/oxagen` `main`.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| The file text | `defBase()` and `defSrc()` from `agentTomlSeed()` | `.oxagen/agents/<slug>.toml` at the head of the default branch | `get_agent` `definition.source` is the text of the last commit `commit_agent_definition` cached, with its `path`, `digest`, `commitSha`, `branch` and `pullRequestUrl` (`agent.get.ts:75-89`, `:142`). No read returns the file at the default branch's head | 🟡 |
| The file's schema and fields | `agentTomlSeed()` | `agent-definition/v0.1` | `AGENT_DEFINITION_SCHEMA` and `AGENT_DEFINITION_DIR` (`agent.definition.commit.ts:25-26`); the budget table (`packages/oxagen/src/agent-definition-source.ts:19-31`); `model_tier`, `tools`, `side_effects` and the instructions are checked by `propose_agent` (`agent.propose.ts:185-225`) | ✅ |
| Repository and branch chips | `w.main`, `w.branch`, `a.commit`, `S.defPending` | The workspace's main repository; the definition's commit; a pending branch | `get_agent` `definition.commitSha`, `branch`, `pullRequestUrl` (`agent.get.ts:75-89`) | 🟡 |
| Branches in the commit dialog | `BRANCHES` | `list_branches` | `repo.branch.list.ts:5` | ✅ |
| Save: commit and pull request | `openCommit()`, `S.defPending` | `commit_agent_definition` | `agent.definition.commit.ts:46`. It commits to a branch that is never the default branch, opens or reuses the pull request, and refuses a file whose `schema` is not `agent-definition/v0.1` or whose `slug` is not the agent's (`agent.definition.commit.ts:1-24`) | ✅ |
| Drafted summary and description, Redraft | the drafter in the commit dialog | A model-written draft of the commit message | No capability drafts a commit message. `summarize_agent_def` summarizes what an agent does (`agent.definition.summarize.ts:5`) | ❌ |
| Governance mode (named in the component help, not in the dialog) | `S.govMode` | The workspace's governance mode | Code owners review the pull request on the repository; the mode itself is a setting on Steering | 🟡 |
| The digest the running definition carries | `a.digest` | `definition_digest` | `get_agent` `definition.digest` (`agent.get.ts:75-89`) | ✅ |

## Future-only fields

The page carries no `data-future` mark, and the catalog gives it no future story. One field has no contract today and is unmarked in the design: the drafted summary and description, with Redraft. A build leaves the fields empty for the person to write, or labels any draft as generated, until a drafting capability ships.

## Functionality

- The file is the definition of record. The identity (the principal, the credential, the roles) lives in Postgres; everything this file says lives in git.
- The draft is shared state for the agent: a change survives leaving the page and coming back until it is discarded or committed.
- Discard returns the draft to the base, the file at the head of the branch it was last committed to (the default branch until the first commit).
- Save always opens the commit dialog, whose diff is the draft against the base.
- A commit lands on a branch, never on the default branch. With the switch on it opens a pull request, or adds to the branch's open one. The running definition, and the `definition_digest` every frame records, do not move until a person merges.
- Deleting an agent's definition is a pull request that removes the file (`retire_agent` leaves the file; see `agents.md`).
- The TOML is parsed as the file is edited, and a file that does not parse, or names another schema or slug, cannot be committed. The mockup's editor shows no parse error today and lets an invalid file reach the commit dialog; a build shows the error at its line and disables Save.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed. (`pAgentSource()` still carries the rev1 loading, error and denied branches; the catalog does not list them.)

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The h1 path wraps, the chips wrap, and Discard and Save sit under the subtext. The tab strip scrolls in its own row. The editor fills the width, its long lines scroll sideways inside the editor, and the page does not. The find field drops under the path in the editor bar, and the status line wraps. The textarea's text is 16 px so it does not zoom. The commit dialog rises from the bottom edge as a sheet with full-width footer buttons. Touch targets are at least 44 px.

## Permissions

- Read: `get_agent` (org Owner, Admin or Member; workspace Owner or Member). The mockup names the permission `agent.read`.
- Writes, each a governed action recorded in Audit: Save (`commit_agent_definition`: org Owner, Admin or Member, workspace Owner or Member, with the delegation ceiling enforced on the `tools` the file names in an enterprise organization). Branches are read with `list_branches`.

## Backend gaps this page depends on

- A read of `.oxagen/agents/<slug>.toml` at the head of the default branch through the repository binding, beside the cached copy of the last commit.
- A drafted commit summary and description, labelled as generated.
- The pending branch for an agent's definition, read back after a commit so the header can show it.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- A Steering Source and a SteeringFrame are never shown as each other. This file is a Steering Source for its instructions; the `procedure` frame it emits is on the Steering tab.
- No person is scored or ranked.
- Every enforcement claim states the tier. “Enforced” only for calls routed through Oxagen.
- The chips show the recorded repository, branch and commit, and nothing stronger. A commit on an unmerged branch reads pending until it merges; nothing says the draft is live.
- Headers are rollups of the rows beneath them: the diff stat in the dialog's subtitle equals the diff's lines.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. A quoted string above that breaks this rule is a mockup defect to fix, not copy to reproduce.
- Exactly one gold (primary) action per screen: Save. Inside the open commit dialog its primary button is the gold one.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
