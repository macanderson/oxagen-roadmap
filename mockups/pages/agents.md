# Agent IAM

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 3 |
| Design | `mockups/src/engine.js` → `pAgents()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Mission Control / … / agents`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `agents.audit-prompt.md` |

## Job

Every agent identity in the workspace: identity in Postgres, definition in git, joined by the agent key and by `definition_digest`. Register, enroll, assign roles, deregister.

## What is on the page

**Header** — eyebrow “Workspace · <workspace name>”, h1 “Identities”.
Actions: **Register an agent** (opens the Register Agent gate) · **Wrap Claude Code** (gold; the same gate with Claude Code preselected)

**Summary tiles** (one number and one basis line each):
- **Identities here** — count in the workspace · “N across the organization · N listed below”
- **Enrolled** — count · “N not yet enrolled”
- **Holding a mandate** — count · the agent keys that hold one
- **Tamper incidents** — count (critical hue) · the latest incident and how many are open

- **Registered in <workspace>** panel — header shows `.oxagen/agents/ @ <commit>`. Table columns: Identity · trust · spend (the agent card, list layout: avatar, key, harness, trust and spend scores coloured by platform percentile) · Harness · Operator · Status · Tier (model + native) · Belt · Runs 30d · Spend 30d · Proven 30d · Mandates · Incidents. Per-row: **Edit** (the agent page), **Roles** (assign-role dialog), **Deregister** (danger; the deregister dialog, which is a pull request removing the file). Search, sort, facets (Tier, Operator), pager.

**Dialogs this page opens:** `register (gate)`, `wrap (gate)`, `assignrole`, `delagent`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Skills · Steering · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Identity, harness, operator | `AGENTS` | `iam.principals` kind=agent | `iam.principals` + `agent.agents`/`agent_versions`; `agent.definition.*` | ✅ |
| Roles, toolbelt grants | `S.agentRoles`, belt rows | `iam.role_grants`, assignments | same names; `agent.role.*`, `iam.role.list` | ✅ |
| Enrollment | `status`, `tier` | `control.enrollments` | `tacho.hosts`; `tacho.enrollment.{create,revoke}` | ✅ |
| Mandates count | `MANDATES` | `tools.mandates` | none | ❌ (G1) |
| Trust / spend scores | `SCORES`, `PLATFORM`, `scoreCuts()` | none in spec — decided in the mockup 2026-09-13 | none | ❌ (G11) |
| Incidents | `incidents` | `audit.audit_events` incident kinds | `tacho.incidents` | ✅ |
| Runs / spend / proven 30d | `runs30`, `spend30`, `proven30` | `cost.run_totals` | ClickHouse `token_usage` | 🟡 proven ❌ |

## Functionality

- Registering opens a Context PR that adds `.oxagen/agents/<slug>.toml`; nothing is written to Postgres until the first frame arrives.
- The score colour is a percentile among every scored agent on Oxagen (green ≥ p90, none p10–p90, amber < p10, red < p5), recomputed per render from `PLATFORM` (`scoreCuts()`); the score itself is the agent’s own 0–1000.
- Deregister retires the principal (never deletes it) so its runs keep their identity; the file removal is a pull request.
- Tile counts are rollups over `AGENTS` for the workspace; the organization count is over every workspace.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “No identities registered in <workspace>” — identity lives in Postgres, definition in `.oxagen/agents/`; registering opens a Context PR. Actions: **Wrap Claude Code**, **Register an agent**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Identities could not be loaded” — `503 iam_principals_unavailable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see the identities in this workspace” — the roles the signed-in person holds on the organization do not include `agent.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Skills, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `agent.read`
- Writes (each a governed action recorded in Audit): `agent.register`, `agent.role.assign`, `agent.deregister`

## Backend gaps this page depends on

- G1 mandates
- G11 score distribution rollup

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
