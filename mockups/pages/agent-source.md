# Agent source

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents/<slug>/source` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 3 |
| Design | `mockups/src/engine.js` → `pAgentSource(r)`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / … / agent-source`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `agent-source.audit-prompt.md` |

## Job

The agent’s definition file `.oxagen/agents/<slug>.toml` in a source editor. Every field on the agent form is a view of this file; saving opens the same commit dialog the form uses; nothing is written to Postgres.

## What is on the page

**Header**: eyebrow “Agent source”, h1 `.oxagen/agents/<slug>.toml` (mono). Chips: the main repo (`a-intel/platform`), branch @ commit (`main @ a4c91e2`, or the pending branch badge when a commit exists on a branch but is not merged), “source of truth”, the agent key. Subtext: “Every field on the agent form is a view of this file. Saving opens the same commit dialog the form uses; nothing is written to Postgres.”
Actions: **Back to the form** · **Discard** (enabled when dirty) · **Save** (gold; opens the commit dialog).

- **Editor** panel: a bar with the path, a modified dot and *modified* / *unchanged*, **Find** (aria-label “Find in file”, ⌘F) with a match count; a gutter with line numbers and a textarea labelled with the path (`#edT`); a status line with the cursor position (“Ln 21, Col 1”), “TOML”, “Spaces: 2”, “LF”, “UTF-8”, and the key hints “⌘S save · Tab indent · ⇧Tab outdent · ⌘/ comment · ⌘F find · ⌘Z undo”. TOML is parsed on every edit (`tomlParse`) and a parse error is shown at its line.
- **Commit dialog** (`commit`): the diff of the draft against the base, a Branch select (`BRANCHES` on the workspace’s main repo, or **+ New branch** with a “New branch name” field), a Summary and a Description (with **Redraft**), an “Open a pull request” checkbox, **Cancel** and the primary button (Commit, or Commit and open a pull request; disabled until the branch and summary are filled). Committing records `S.defPending[slug]`; the running definition is still main’s until merged.

**Dialogs this page opens:** `commit` (branch, message, diff), `request-access` (from denied), `incident` (from error). Discard is a button, not a dialog.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit; foot: the assistant launcher, agent count · data plane, connection badge). Top bar: hamburger, breadcrumbs (… / Agent IAM / <slug> / source), ⌘K search-or-run, notifications with unread dot, the approvals button (left of the avatar, count of everything waiting on you across the organization; opens the drawer described in `fleet.md`), account avatar → user menu. No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| The file | `defBase(slug)` / `defSrc(slug)` from `agentTomlSeed` | `.oxagen/agents/<slug>.toml` at `definition_path`, `definition_digest`, `commit_sha` | DB-backed `agent.definition.*` | 🟡 |
| Branches | `BRANCHES` | git branches on `wrk.repositories` main repo | `ingestion.repository_bindings` (+heads) | 🟡 |
| Commit / PR | `S.defPending` | Context PR lifecycle (spec §10.3) | `agent.context_promotions` | 🟡 |

## Functionality

- Draft state is shared with the agent form (`S.defSrc`), so a change made on either survives navigation until discarded or committed.
- `sha7()` of the draft is shown as the would-be digest; the running definition’s digest is what every frame records.
- Discard returns the draft to the base (the file at the head of the branch it was last committed to) and is disabled while the draft is unchanged.
- Save always opens the commit dialog; the diff in it is the draft against the base.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: “This file could not be loaded”. “The control plane answered `502 git_read_unreachable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see this agent’s definition”. “Your roles on Anderson Intelligence Corp. do not include `agent.write on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (opens `request-access`), **Back to Fleet**. Below: *Signed in as* (Marcus Bell · workspace.owner · core-platform), *Needed* (`agent.write on core-platform`), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting plus an interjection), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. The editor fills the width; the status line wraps. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; touch targets are ≥ 44 px; the textarea is 16 px; nothing scrolls sideways except the editor’s own lines.

## Permissions

- Read: `agent.read`
- Writes (each a governed action recorded in Audit): `agent.write (commit to a branch)`, `repo.pr.open`

## Backend gaps this page depends on

- Definitions are DB-backed today; the app must read and write `.oxagen/agents/*.toml` through the repo binding

## Rules every build of this page must keep

- The chips (repo, branch @ commit, source of truth) show the recorded values and nothing stronger; a pending branch is labelled pending until merged.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen (Save). Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- No heading carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence or nothing.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
