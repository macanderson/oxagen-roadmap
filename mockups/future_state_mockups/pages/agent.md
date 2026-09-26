# Agent

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents/<slug>[/<tab>]` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 3 |
| Design | `mockups/src/engine.js` → `pAgent(r)`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / agent`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `agent.audit-prompt.md` |

## Job

One agent: its principal and run credential, roles and the delegation ceiling, the toolbelt as the model sees it with per-tool decision rules, the mandates it holds, budgets and token accounting, its runs, enrollment on the host, tamper incidents, and its definition in git.

## What is on the page

**Header** — eyebrow “Agent”, h1 “the agent card (detail layout: avatar, key, harness, trust and spend scores)”. Status badge, one tier badge (`observe` or `harness`), replay grade, operator; the description. A score strip beneath: Proof rate · Productive ratio · Policy denials 30d · Tamper incidents · Approvals overturned · Chain integrity · Spend per proven run · Proven ÷ spend 30d · Cache hit rate · Wasted spend share · Business value; and an Auto-approvals note (“qualifies for N of M rules”, floors: tainted input and critical hazard never auto-approve).
Actions: **Edit avatar** · **Rotate credential** · **Suspend** (danger) · **Deregister** (danger; dialog) · **See the belt as the model sees it** (gold; jumps to the Toolbelt tab)

- **Tabs** (hash-routed: `/agents/<slug>/<tab>`): Identity · Toolbelt (N) · Mandates · Budgets · Runs · Enrollment · Tamper incidents (N) · Definition in git.
- **Identity** — Identity (Agent key · Principal · Kind · Harness · Model tier · Operator · Status · First frame), Credentials this agent holds (**See the connections that mint them**), Run credential (Key · Purpose lock · Issued · Last used · Run tokens · Host device key; **Rotate**, **Revoke credential**), Roles and the delegation ceiling (`agent.graph.read`, Resource scope · Spend ceiling · Can move money; **Assign a role**, **Change identity**), What this tier delivers (the tier ladder with this agent’s rung marked and `gateway` and `contained` marked not yet available; then Model calls: not routed through Oxagen, spend is client-attested · MCP tool calls: the ones registered with Oxagen’s MCP server are routed through Oxagen and decided on the server · Harness-native tools: the four blocking hook events can refuse, client-attested and fail-open · Steering: delivered at SessionStart and UserPromptSubmit and as files in the checkout; the tier computed per run from what was actually routed and rendered verbatim), Definition in git (Path · Repo · Commit · `definition_digest` · Generated beside it; **Open the file**).
- **Toolbelt** — How this belt was computed (Searchable belt / Full belt), What the model receives, Try the belt search (queries: pull request · steering record · stripe payment · delete repository · graph; **Run**), Per-tool decision rules table: Tool · Category · Decision · Hazard · Egress · Financial · Schema digest (Labels / API names toggle, By category / Flat), What this agent cannot see (Tool · Why it is not on the belt).
- **Mandates** — the mandate page inline (see `mandate.md`): Per call · Per period · Settled · Remaining tiles, The ledger, The grant, Ledger note.
- **Budgets** — Budgets (lead: checked at each hook boundary against the spend the harness reports; a breach pauses the run at the next boundary, client-attested and fail-open; an enforced ceiling needs the `gateway` tier, which is not available yet. Mode · On a breach · Spend 30d · Proven spend 30d · Runs 30d · Cost per run; **Set budget**), Token accounting (Class · Tokens 30d · Rate · Cost), Findings for this agent (**Evidence**, **Fix**, **Open on Spend**).
- **Runs** — Run · Status · Verdict · Cost · Frames · Started.
- **Enrollment** — Host (Device · Device key · Collector · Hook binary · Hooks written (five run as command hooks, the first four can refuse; the hook process fails closed against its cached bundle) · Model proxy (“not available yet”) · Oxagen MCP server · Settings · Tier earned · First frame · Last checkpoint; **Run a smoke session**), Rollback (**Unenroll**; hooks stripped by hand record `hooks_removed` and the tier falls to `observe`).
- **Tamper incidents** — one card per incident (`hooks_removed`…): What happened · What it stopped · Closed · Incident; **Open on Audit**. The count equals the Audit page’s, read from the same record.
- **Definition in git** — the TOML rendered as a form: Identity · Model and budget · Tools · Instructions · Harness · Source (Repository · `definition_digest` · At commit · Generated beside it) · Changing this agent (a pull request; the principal is retired, never deleted).

**Dialogs this page opens:** `delagent`, `assignrole`, `avatar`, `budget`, `evidence`, `fix`, `connection`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · connection badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Identity, credential, host | `AGENTS` + `IAM` merge | `iam.principals`, `iam.credentials`, `control.enrollments` | `iam.principals`, `auth.api_keys` (hosts), `mcp.credentials`, `tacho.hosts` | ✅ / 🟡 credentials |
| Roles, ceiling | `S.agentRoles` | `iam.role_grants` | `agent.role.*`, `iam.role.list` | ✅ |
| Toolbelt, decision rules | `TOOLS`, `beltFor()` | `tools.tool_versions`, grants, `pol_v41` | `agent.tools`/`tool_versions`, `mcp.tool_snapshots` | 🟡 risk/side-effect tags to verify |
| Mandates | `MANDATES` | `tools.mandates`, `mandate_ledger` | none | ❌ (G1) |
| Budgets | `budget`, `budgetUsed` | `billing.budgets` | `billing.spend_budgets`, `workspace_budget_policy` | ✅ |
| Scores strip | `SCORES`, `PLATFORM` | none in spec | none | ❌ (G11) |
| Runs | `RUNS` by agent | `:Run` | `agent.agent_runs` | 🟡 |
| Incidents | `incidents` | incident kinds | `tacho.incidents` | ✅ |
| Definition in git | `agentTomlSeed`, `S.defBase/defSrc` | `definition_path/digest/commit_sha` | DB-backed `agent.definition.*`, not `.oxagen/agents/*.toml` | 🟡 |

## Functionality

- Rotate credential: the old key stops at the next call and every live run token dies with it. Suspend: every run token dies at the next call even if the daemon is down. Both are governed actions with audit records.
- The belt is computed at run start from grants × policy; the page shows the same list the model receives, and a search over it (`search_tools`) when the belt is *searchable*.
- Tab is part of the route so a link to `/agents/<slug>/toolbelt` lands on the tab.
- Every field on the Definition tab is a view of the TOML file; editing goes through the source page and a commit dialog.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “This agent has never run” — registered and enrolled, no frame yet; the belt is computed at run start so there is nothing to show for tools either. Action: **Back to Fleet**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “This agent could not be loaded” — `503 iam_principals_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this agent” — the roles the signed-in person holds on the organization do not include `agent.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `agent.read`
- Writes (each a governed action recorded in Audit): `agent.credential.rotate/revoke`, `agent.suspend`, `agent.deregister`, `agent.role.assign`, `budget.set`, `enrollment.revoke`

## Backend gaps this page depends on

- G1 mandates
- G11 scores
- G3 cost rollups
- definition in git vs DB-backed definitions

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
