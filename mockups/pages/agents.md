# Agent IAM

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents` |
| Scope | workspace |
| Spec | §14 Mission Control; §12.6 token classes; Appendix F page 3 |
| Design | `mockups/src/engine.js` → `pAgents()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / agents`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `agents.audit-prompt.md` |

## Job

Every agent identity in the workspace: identity in Postgres, definition in git, joined by the agent key and by `definition_digest`. Register, enroll, assign roles, deregister. Each row carries the tier the agent earned and its 30-day runs, spend, and tokens.

## What is on the page

**Header**: eyebrow is the workspace name (“Core platform”), h1 “Identities”, subtext “Identity in Postgres, definition in git.”
Actions: **New agent** (opens the agent wizard: an agent that does not exist yet) · **Register an agent** (opens the Register Agent gate: an agent that already runs somewhere) · **Wrap Claude Code** (gold; the same gate with Claude Code preselected).

**Summary tiles** (one number and one basis line each):
- **Identities here**: the workspace count · “N across the organization · N listed below”.
- **Enrolled**: count · “N not yet enrolled” (or “N listed here on the observe tier, the rest on harness” when every agent is enrolled).
- **Holding a mandate**: count across the organization · the agent keys that hold one, each with “· in <workspace>”, or “no agent holds one”.
- **Tamper incidents**: count (critical hue) · the latest incident (“<agent> · <kind>, <date>”) and “· N open” or “· all resolved”; “none in the retention window” when there are none.

- **Registered in <workspace>** panel. Header shows `.oxagen/agents/ @ <commit>`. Table columns: Identity (the agent card: avatar, key, description) · Harness (label, slug beneath) · Operator (avatar, name) · Status · Tier (one word from the ladder: `observe`, `harness`, `gateway`, or `contained`) · Belt (count, `full` or `searchable` beneath) · Runs 30d · Spend 30d · Tokens 30d (`agentTok(a).total`, “N% cached” beneath) · Mandates (count badge or —) · Incidents (count badge or 0) · an unlabelled action column: **Edit** (the agent page, Definition in git tab), **Roles** (opens `assignrole`), **Deregister** (danger; opens `delagent`, which is a pull request removing the file). Clicking a row opens the agent page. Search, sort, facets (Tier: contained, gateway, harness), Rows 5/10/25/50/All, pager (“1–10 of 64”).
- **Tier ladder** panel under the table (`tierLadder()`), badge “computed per run from what was actually routed”: four rungs in order with one line each: `observe` (“Recorded only. No hook is installed and nothing is delivered.”), `harness` (“Hooks installed. Steering is delivered and the four blocking hook events can refuse: client-attested and fail-open.”), `gateway` (“Model and MCP traffic routed through the gateway. Metering observed, budgets enforced on routed traffic.”), `contained` (“The agent runs under an OS sandbox whose only egress is the gateway. The only tier that earns the word enforced.”). No rung is marked not yet available. The note beneath: “Every agent here sits on `observe` or `harness`. A control claim carries its scope: for actions routed through Oxagen, the server decides. Everything else on the harness tier is delivered, recorded, client-attested, and fail-open.”

**Dialogs this page opens:** `register` (gate), `wrap` (gate), `wz` (agent wizard: describe → identity → definition → toolbelt → pull request), `assignrole`, `delagent`, `request-access` (from denied), `incident` (from error).

**New agent is not Register an agent.** Register wraps an agent that already runs on a machine or in CI; New agent writes one that does not exist yet. Both end on a pull request; they start from opposite ends. Every creation wizard is `DLG_EXT.wz`; its spec is `docs/creation-spec.md`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit; foot: the assistant launcher, agent count · data plane, connection badge). Top bar: hamburger, breadcrumbs, ⌘K search-or-run, notifications with unread dot, the approvals button (left of the avatar, count of everything waiting on you across the organization; opens the drawer described in `fleet.md`), account avatar → user menu (Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Identity, harness, operator | `AGENTS` | `iam.principals` kind=agent | `iam.principals` + `agent.agents`/`agent_versions`; `agent.definition.*` | ✅ |
| Roles, toolbelt grants | `S.agentRoles`, belt rows | `iam.role_grants`, assignments | same names; `agent.role.*`, `iam.role.list` | ✅ |
| Enrollment, tier | `status`, `tier` | `control.enrollments`; the tier computed per run (G6) | `tacho.hosts`; `tacho.enrollment.{create,revoke}` | ✅ enrollment · ❌ tier |
| Mandates count | `MANDATES` | `tools.mandates` | none | ❌ (G1) |
| Incidents | `INCIDENTS` (`agentTamper`) | `audit.audit_events` incident kinds | `tacho.incidents` | ✅ |
| Runs / spend 30d | `runs30`, `spend30` | `cost.run_totals` | ClickHouse `token_usage` | 🟡 |
| Tokens 30d, cache rate | `agentTok(a)` | `cost.daily_totals` (`cache_hit_rate`); `list_agents` with `tokens30d`, `cacheHitRate30d` | 🟡 ClickHouse `token_usage` | 🟡 totals ✅ · classes and cache rate ❌ |

## Functionality

- Registering opens a Context PR that adds `.oxagen/agents/<slug>.toml`; nothing is written to Postgres until the first frame arrives.
- Deregister retires the principal (never deletes it) so its runs keep their identity; the file removal is a pull request.
- Tile counts are rollups: Identities here and Enrolled from the workspace row, Holding a mandate and Tamper incidents summed over the agent records across the organization, which is the scope their captions name.
- The Incidents column and the Tamper incidents tile read `agentTamper(a)` off the same `INCIDENTS` record the Audit page reads, so the two pages cannot disagree.
- Tokens 30d is `agentTok(a).total`; the same rollup feeds the agent page’s token panel and its coaching.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: “No identities registered in Core platform”. “An agent's identity lives in Postgres; its definition is a file in `.oxagen/agents/` in the main repo. Registering one opens a Context PR — nothing is written to Postgres first.” Actions: **Wrap Claude Code** (gold), **Register an agent**.
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: “Identities could not be loaded”. “The control plane answered `503 iam_principals_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see the identities in this workspace”. “Your roles on Anderson Intelligence Corp. do not include `agent.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (opens `request-access`), **Back to Fleet**. Below: *Signed in as* (Marcus Bell · workspace.owner · core-platform), *Needed* (`agent.read on core-platform`), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting plus an interjection), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `agent.read`
- Writes (each a governed action recorded in Audit): `agent.register`, `agent.role.assign`, `agent.deregister`

## Backend gaps this page depends on

- G1 mandates
- G6 the tier computed per run
- G3 the token classes of §12.6 on `cost.daily_totals`

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Every token figure is the agent’s own rollup, and the cache rate under it is cache read over input for that agent. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen (Wrap Claude Code). Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- No heading carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence or nothing.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
