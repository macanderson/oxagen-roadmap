# Agents

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents` |
| Scope | workspace |
| Spec | §14 Mission Control; §12.6 token classes; Appendix F page 3; `docs/agent-ontology-ia.md` for the object model |
| Design | `mockups/src/engine.js` → `pAgents()`, with `agentViewSet()`, `agentHealth()`, `agentSteering()`, `agentRuntime()`, `beltsOfAgent()`, `beltTotal()`, `agentTok()`, `agentTamper()` and `fleetTamperStat()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / agents`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `agents.audit-prompt.md` |

## Job

The registry of actors in this workspace. A row answers who the agent is, what it is for, who owns it, what steers it, what it can reach, where it runs, which principal represents it, whether it is healthy, and what it did in the last 30 days. An agent has one principal and runs on one runtime; its steering, its toolbelts and its tools are workspace objects it holds a reference to, each owned by its own registry page.

## What is on the page

**Header**: eyebrow is the workspace name (“Core platform”), h1 “Agents”, subtext “Every actor in this workspace and what it is made of.”
Actions: **New agent** (`wzOpen('agent')`, the agent wizard: an agent that does not exist yet, written to `.oxagen/agents/<slug>.toml`) · **Register an agent** (opens `register`: Slug, Avatar, Harness, Model tier, over the note that the dialog opens a Context PR and writes no Postgres row) · **Wrap Claude Code** (gold; `openDialog('wrap')` routes to the Register Agent gate at `#/a-intel/core-platform/register`, specified in `register-name.md`, `register-wrap.md` and `register-run.md`).

**Summary tiles** (one number and one basis line each):
- **Agents here**: the workspace count · “N across the organization · N listed below”.
- **Enrolled**: count · “N not yet enrolled”, or “N listed here on the observe tier, the rest on harness” when every agent is enrolled.
- **Holding a mandate**: count across the organization · the agent keys that hold one, each with “· in <workspace>”, or “no agent holds one”.
- **Tamper incidents**: count (critical hue when it is not zero) · the newest incident as “<scope> · <kind>, <date>” with “· N open” or “· all resolved”, or “none in the retention window”.

**Registered in <workspace>** panel. The panel header carries the column-set toggle, the mono line `.oxagen/agents/ @ <commit>`, and a subtext that follows the toggle: “Each row names the reusable objects this agent holds a reference to.” on Composition, “Each row is what this agent did and what it cost over the last 30 days.” on Operations.

**The column-set toggle** is a two-button group labelled Columns, each button carrying `aria-pressed`: **Composition** (the default) and **Operations**. It writes `S.agentView` and re-renders. Both sets read the same agent records; neither deletes a number the other shows.

- **Composition columns**: Agent (the agent card: avatar, key, harness label) · Purpose (`desc`) · Owner (avatar, name) · Steering (“N items” over “N tok”, with “· not delivered” appended when the agent earns no hook, or an em dash when no preview prompt is set up) · Toolbelt (“N belts” over “N tools · <full|searchable>”) · Runtime (the host id over “<kind> · <tier>”, or the tier alone when no runtime record matches) · Principal (`prn_…`, or `prn_pending`) · Health (one badge: `healthy`, `observe`, `not enrolled`, or `tamper`) · Activity (runs over “runs 30d”) · an unlabelled action column.
- **Operations columns**: Agent (the agent card with the description beneath) · Harness (label over slug) · Operator (avatar, name) · Status · Tier (one word from the ladder: `observe`, `harness`, `gateway`, or `contained`) · Belt (count over `full` or `searchable`) · Runs 30d · Spend 30d · Tokens 30d (`agentTok(a).total` over “N% cached”) · Mandates (count badge or an em dash) · Incidents (count badge or 0) · the same action column.
- **Health** is computed in `agentHealth()` in this order: an open tamper incident reads `tamper` with “N open incidents”; no enrollment reads `not enrolled` with “no hook is installed, so its runs are recorded only”; the observe tier reads `observe` with “enrolled, and nothing is delivered or refused yet”; everything else reads `healthy` with “frames arriving, chain intact”.
- **Row actions**, in both sets: **Edit** (the agent page, Definition in git tab) · **Roles** (opens `assignrole`) · **Deregister** (danger; opens `delagent`, which is a pull request removing the file). Clicking anywhere else on a row opens the agent page.
- **List controls** are added to the table by `listify()`: a search box, sortable column headers with `aria-sort`, up to three derived facet selects, Rows (5, 10, 25, 50, All) and a pager. They are derived from the columns in view, so the facets differ between the two column sets.
- **Panel footer note**, verbatim: “An agent has one principal and runs on one runtime. Its steering, its toolbelts and its tools are workspace objects it refers to, so changing one changes every agent that refers to it.”

**Dialogs this page opens:** `register`, `wz` (agent wizard: describe → identity → definition → toolbelt → pull request), `assignrole`, `delagent`, `request-access` (from denied), `incident` (from error). **Wrap Claude Code** is not a dialog: it leaves the page for the Register Agent gate.

**New agent is not Register an agent.** Register wraps an agent that already runs on a machine or in CI; New agent writes one that does not exist yet. Both end on a pull request; they start from opposite ends. Every creation wizard is `DLG_EXT.wz`; its spec is `docs/creation-spec.md`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agents · Tools · Steering · Runtimes · Repositories · Spend; Organization nav: Organization · Billing · Audit; foot: the assistant launcher, agent count · data plane, connection badge). The Agents nav item carries the workspace agent count; Runtimes carries the number of runtimes in this workspace whose health is not `ok` and has its own spec, `runtimes.md`. Top bar: hamburger, breadcrumbs (… / Agents), ⌘K search-or-run, notifications with unread dot, the approvals button (left of the avatar, count of everything waiting on you across the organization; opens the drawer described in `fleet.md`), account avatar → user menu (Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Identity, purpose, owner, principal | `AGENTS` (`mockups/fixtures/agents.json`) | `iam.principals` kind=agent | `iam.principals` + `agent.agents`/`agent_versions`; `agent.definition.*` | ✅ |
| Toolbelt assignments | `TOOLBELTS`, `TOOLBELT_ASSIGN` (`mockups/fixtures/toolbelts.json`) via `beltsOfAgent()` | `tools.toolbelts`, `tools.toolbelt_assignments` | none; a belt exists today only as a computed per-agent list | ❌ |
| Belt width and presentation | `belt`, `beltMode` via `beltTotal()` | grants × policy at run start | `agent.tools`/`tool_versions` | 🟡 |
| Steering reaching an agent | `STG_PREVIEW` (`mockups/fixtures/steering-preview.json`) via `agentSteering()` | the assembler’s registry port; `steering.manifest` frames | `agent.context_records`; nothing assembles per agent yet | 🟡 |
| Runtime, enrollment, tier | `RUNTIMES` (`mockups/fixtures/runtimes.json`) via `agentRuntime()`; `status`, `tier` | `control.runtimes`, `control.enrollments`; the tier computed per run (G6) | `tacho.hosts`; `tacho.enrollment.{create,revoke}` | ✅ enrollment · ❌ tier |
| Roles | `S.agentRoles` via `agentRolesOf()` | `iam.role_grants` | `agent.role.*`, `iam.role.list` | ✅ |
| Mandates count | `MANDATES` (`mockups/fixtures/mandates.json`) | `tools.mandates` | none | ❌ (G1) |
| Health and incidents | `INCIDENTS` (`mockups/fixtures/audit.json`) via `agentTamper()` | `audit.audit_events` incident kinds | `tacho.incidents` | ✅ |
| Runs and spend 30d | `runs30`, `spend30` | `cost.run_totals` | ClickHouse `token_usage` | 🟡 |
| Tokens 30d, cache rate | `agentTok(a)` | `cost.daily_totals` (`cache_hit_rate`); `list_agents` with `tokens30d`, `cacheHitRate30d` | 🟡 ClickHouse `token_usage` | 🟡 totals ✅ · classes and cache rate ❌ |

## Functionality

- Every cell in the Composition set names a reusable object and states nothing the registry that owns it states. The row opens the agent, and the agent’s Composition panel carries the link out to Tools, Steering, or Runtimes for each one, so a reference is described in one place.
- Assigning a toolbelt is not a permission. The belt says what the agent can reach; the principal’s roles, mandates and budgets say what it may do. A call has to pass both.
- The column set is session state (`S.agentView`), not a route segment, so a link to this page always lands on Composition.
- Registering opens a Context PR that adds `.oxagen/agents/<slug>.toml`; nothing is written to Postgres until the first frame arrives.
- Deregister retires the principal and never deletes it, so its runs keep their identity; the file removal is a pull request.
- Tile counts are rollups: Agents here and Enrolled from the workspace row, Holding a mandate and Tamper incidents summed over the agent records across the organization, which is the scope their basis lines name.
- The Health cell, the Incidents column and the Tamper incidents tile all read `agentTamper(a)` off the same `INCIDENTS` record the Audit page reads, so the two pages cannot disagree.
- Tokens 30d is `agentTok(a).total`; the same rollup feeds the agent page’s token panel and its coaching.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: “No agent registered in Core platform”. “An agent's identity lives in Postgres; its definition is a file in `.oxagen/agents/` in the main repo. Registering one opens a Context PR — nothing is written to Postgres first.” Actions: **Wrap Claude Code** (gold), **Register an agent**.
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: “Agents could not be loaded”. “The control plane answered `503 iam_principals_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see the agents in this workspace”. “Your roles on Anderson Intelligence Corp. do not include `agent.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (opens `request-access`), **Back to Fleet**. Below: *Signed in as* (Marcus Bell · workspace.owner · core-platform), *Needed* (`agent.read on core-platform`), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting plus an interjection), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Runtimes, Repositories, Organization, Billing, Audit, the assistant, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. The column-set toggle stays on one row above the table. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `agent.read`
- Writes (each a governed action recorded in Audit): `agent.register`, `agent.role.assign`, `agent.deregister`

## Backend gaps this page depends on

- G1 mandates
- G6 the tier computed per run
- G3 the token classes of §12.6 on `cost.daily_totals`
- toolbelts as a stored object, with assignments to agents
- the per-agent steering assembly the Steering cell counts

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, health, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Both column sets read the same records. Switching the toggle changes which columns render and never which agents are listed, and no number appears in one set that contradicts the other.
- A cell that names a reusable object links to the registry that owns it, and states no fact that registry owns.
- Every number that is money shows its basis. Every token figure is the agent’s own rollup, and the cache rate under it is cache read over input for that agent. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen (Wrap Claude Code). Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- No heading carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence or nothing.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
