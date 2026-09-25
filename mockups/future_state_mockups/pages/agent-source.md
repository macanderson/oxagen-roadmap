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

**Header** — eyebrow “Agent · source”, h1 “`.oxagen/agents/<slug>.toml` (mono)”. Chips: main repo, branch @ commit (or the pending branch badge when a commit exists on a branch but is not merged), “source of truth”, the agent key.
Actions: **Back to the form** · **Discard** (enabled when dirty) · **Save** (gold; opens the commit dialog)

- **Editor** panel — bar with the path, a modified dot and *modified / unchanged*, **Find ⌘F** with match count; a gutter with line numbers and a textarea (`#edT`); a status line with the cursor position and key hints; TOML is parsed on every edit (`tomlParse`) and a parse error is shown at its line.
- **Commit dialog** — the diff of the draft against the base, a commit message, and a branch choice (`BRANCHES` on the workspace’s main repo, or **+ New branch**); committing records `S.defPending[slug]` (the running definition is still main’s until merged).

**Dialogs this page opens:** `commit (branch, message, diff)`, `discard`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · connection badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| The file | `defBase(slug)` / `defSrc(slug)` from `agentTomlSeed` | `.oxagen/agents/<slug>.toml` at `definition_path`, `definition_digest`, `commit_sha` | DB-backed `agent.definition.*` | 🟡 |
| Branches | `BRANCHES` | git branches on `wrk.repositories` main repo | `ingestion.repository_bindings` (+heads) | 🟡 |
| Commit / PR | `S.defPending` | Steering PR lifecycle (spec §10.3) | `agent.steering_promotions` | 🟡 |

## Functionality

- Draft state is shared with the agent form (`S.defSrc`), so a change made on either survives navigation until discarded or committed.
- `sha7()` of the draft is shown as the would-be digest; the running definition’s digest is what every frame records.
- Discard returns the draft to the base (the file at the head of the branch it was last committed to).

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “This file could not be loaded” — `502 git_read_unreachable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this agent’s definition” — the roles the signed-in person holds on the organization do not include `agent.write on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `agent.read`
- Writes (each a governed action recorded in Audit): `agent.write (commit to a branch)`, `repo.pr.open`

## Backend gaps this page depends on

- Definitions are DB-backed today; the app must read/write `.oxagen/agents/*.toml` through the repo binding

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
