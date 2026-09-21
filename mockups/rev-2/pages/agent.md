# Agent

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents/<slug>[/<tab>]` |
| Scope | workspace |
| Spec | §14 Mission Control; §12.6 token classes; §12.7 attribution; Appendix F page 3 |
| Design | `mockups/src/engine.js` → `pAgent(r)`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / agent`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `agent.audit-prompt.md` |

## Job

One agent: its principal and run credential, roles and the delegation ceiling, the toolbelt as the model sees it with per-tool decision rules, the mandates it holds, budgets and token accounting, its runs, enrollment on the host, tamper incidents, and its definition in git. Above the tabs, its 30-day token use and the coaching the token record derives from it.

## What is on the page

**Header**: eyebrow “Agent”, h1 the agent card (detail layout: avatar, key, harness label). Badges: status, one tier badge (`observe`, `harness`, `gateway`, or `contained`, as recorded), “replay <grade>”, “operator <name>”; then the description.
Actions: **Edit avatar** (opens `avatar`) · **Rotate credential** · **Suspend** (danger) · **Deregister** (danger; opens `delagent`) · **See the belt as the model sees it** (gold; jumps to the Toolbelt tab).

- **Coaching strip** (`coachStrip`, two panels above the tabs). **30-day token use**: badge “N tok · $ · <basis>”; the composition bars (`tokBars`): Conversation, Tool results, Context frames, Tool definitions, Steering, System, Output, Reasoning, each with tokens and share; then Cache hit rate (“N% · N of N input tokens served from cache”) · Per run (“N tok · $”) · Per model call (“N tok in the mean request”) · Basis (“observed by the gateway proxy from the bytes that passed through it” or “self-reported by the harness · absent classes are marked, never zero”). **Coaching**: badge “N from the token record”; up to three items from `coachAgent(a)`, each a severity badge with the title (Narrow the belt, Keep the prefix stable, Page the tool results, Lower the context budget, Route classification-shaped work to a light model, Stop the retry storms, Stop writing cache for one-turn runs), the signal line, “$ a month at stake”, and one action button (Edit the grant, Open steering, Propose a record, Preview the window, Edit the definition, Open incidents); or “Nothing to change. Every share is inside the workspace norm and the cache holds.”; footer link “All coaching for this workspace →”.
- **Tabs** (hash-routed: `/agents/<slug>/<tab>`): Identity · Toolbelt (N) · Mandates (N) · Budgets · Runs · Enrollment · Tamper incidents (N) · Definition in git.
- **Identity**: **Identity** (Agent key · Principal · Kind · Harness · Model tier · Operator · Status · First frame), **Credentials** (badge “none”; API key, OAuth token, Cloud role, GitHub token all none; Run token “one, and it reaches Oxagen only”; **See the connections that mint them**), **Run credential** (Key · Purpose lock · Issued · Last used · Run tokens · Host device key; **Change identity** (opens `identity`), **Revoke credential**), **Roles** (the ∩ formula: role ∩ the invoking human’s grants = N tool versions; `agent.graph.read`, Resource scope · Spend ceiling · Can move money; **Assign a role** (opens `assignrole`)), **Tier delivery** (the tier ladder with this agent’s rung marked “this agent”, no rung marked not yet available; then Model calls · MCP tool calls · Harness-native tools · Budgets · Steering · Credentials held by this agent · Replay · Tamper incidents (**Read them**); the note “The tier is computed per run from what was actually routed and rendered verbatim. No report can say a stronger word than the tier allows, and only contained earns the word enforced.”), **Definition in git** (Path · Repo · Commit · `definition_digest` · Generated beside it; **Open the file**).
- **Toolbelt**: **Belt computation** (Searchable belt / Full belt), **Model view**, **Belt search** (queries: pull request · context record · stripe payment · delete repository · graph; **Run**), **Per-tool decision rules** (By category / Flat; **What the categories mean** opens `toolcats`): Tool · Category · Decision · Hazard · Egress · Financial · Schema digest; **Off the belt** (Tool · Reason).
- **Mandates**: **Mandates held** (Mandate · Effect · Per call · Per period · Remaining · Expires · Status), or **No mandate** with **Request a mandate** (opens `mandate`) and **Open the mandates ledger**.
- **Budgets**: **Budgets** (lead “Checked at each hook boundary against the spend the harness reports. A breach pauses the run at the next boundary: client-attested and fail-open. An enforced ceiling needs the `gateway` tier, which is not available yet.”; Mode · On a breach · Spend 30d · Tokens 30d · Productive ratio · Runs 30d · Cost per run; **Set budget** opens `budget`), **Token accounting** (Class · Tokens 30d · Rate · Cost, one row per §12.6 class), **Findings** (**Evidence**, **Fix**, **Open on Spend**).
- **Runs**: “N shown”; Run · Status · Tokens (total, “N% cached” beneath) · Cost · Frames · Started; a row opens the Run page; **Open the audit record**.
- **Enrollment**: **Host** (Device · Device key · Collector · Hook binary · Hooks written (SessionStart, UserPromptSubmit, PreToolUse, PermissionRequest, Stop; “Five run as command hooks. The first four can refuse.”) · Model proxy (“not available yet”) · Oxagen MCP server · Settings · Tier earned · Last checkpoint; **Run a smoke session**), **Rollback** (**Unenroll**). An agent with no host offers **Wrap it** (gold; opens `wrap`) and **Show the CLI path** (opens `register`).
- **Tamper incidents**: one card per incident (What happened · What it stopped · Closed · Owner · Incident; **Open on Audit**), or **No tamper incident recorded** with **Open the incident register**. The count equals the Audit page’s, read from the same record.
- **Definition in git** (`defForm`): the TOML rendered as a form: Identity · Model and budget · Tools (Side effects) · Instructions · Harness · Source (Repository · `definition_digest` · At commit · Generated beside it; **Open the source**) · Changing this agent (**Save changes** or **Open a pull request**, **Discard**; a pull request; the principal is retired, never deleted).

**Dialogs this page opens:** `delagent`, `assignrole`, `identity`, `avatar`, `budget`, `evidence`, `fix`, `mandate`, `toolcats`, `commit`, `wrap`, `register`, `request-access` (from denied), `incident` (from error).

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Repositories · Spend; Organization nav: Organization · Billing · Audit; foot: the assistant launcher, agent count · data plane, connection badge). Top bar: hamburger, breadcrumbs (… / Agent IAM / <slug>), ⌘K search-or-run, notifications with unread dot, the approvals button (left of the avatar, count of everything waiting on you across the organization; opens the drawer described in `fleet.md`), account avatar → user menu. No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Identity, credential, host | `AGENTS` + `IAM` merge | `iam.principals`, `iam.credentials`, `control.enrollments` | `iam.principals`, `auth.api_keys` (hosts), `mcp.credentials`, `tacho.hosts` | ✅ / 🟡 credentials |
| Roles, ceiling | `S.agentRoles` | `iam.role_grants` | `agent.role.*`, `iam.role.list` | ✅ |
| Toolbelt, decision rules | `TOOLS`, `beltOf()` | `tools.tool_versions`, grants, `pol_v41` | `agent.tools`/`tool_versions`, `mcp.tool_snapshots` | 🟡 risk/side-effect tags to verify |
| Mandates | `MANDATES` | `tools.mandates`, `mandate_ledger` | none | ❌ (G1) |
| Budgets | `budget`, `budgetUsed` | `billing.budgets` | `billing.spend_budgets`, `workspace_budget_policy` | ✅ |
| Token use, token accounting | `agentTok(a)` | `cost.daily_totals` (`tool_definition_tokens`, `context_frame_tokens`, `steering_tokens`, `cache_hit_rate`, `retries`); `get_agent` `tokenProfile` | 🟡 ClickHouse `token_usage` | 🟡 totals ✅ · classes and parts ❌ |
| Coaching | `coachAgent(a)` | derived at read time from `cost.daily_totals`; `list_coaching` (read, `noBillingGate`) | none | ❌ |
| Runs | `RUNS` by agent, `runMetrics` | `:Run`, `cost.run_totals` | `agent.agent_runs` | 🟡 |
| Incidents | `INCIDENTS` (`agentTamper`) | incident kinds | `tacho.incidents` | ✅ |
| Definition in git | `agentTomlSeed`, `S.defBase/defSrc` | `definition_path/digest/commit_sha` | DB-backed `agent.definition.*`, not `.oxagen/agents/*.toml` | 🟡 |

## Functionality

- Rotate credential: the old key stops at the next call and every live run token dies with it. Suspend: every run token dies at the next call even if the daemon is down. Both are governed actions with audit records.
- The belt is computed at run start from grants × policy; the page shows the same list the model receives, and a search over it (`search_tools`) when the belt is *searchable*.
- Coaching is derived at read time from the same rollup the token panel prints (`agentTok`), so the two cannot disagree; every item names its signal, the tokens and money behind it, and one action. It is never a model’s opinion of itself.
- Tab is part of the route so a link to `/agents/<slug>/toolbelt` lands on the tab.
- Every field on the Definition tab is a view of the TOML file; editing goes through the source page and a commit dialog.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: “This agent has never run”. “It is registered and enrolled, but no frame has arrived. Its belt is computed at run start, so there is nothing yet to show for tools either.” Action: **Back to Fleet**.
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: “This agent could not be loaded”. “The control plane answered `503 iam_principals_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see this agent”. “Your roles on Anderson Intelligence Corp. do not include `agent.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (opens `request-access`), **Back to Fleet**. Below: *Signed in as* (Marcus Bell · workspace.owner · core-platform), *Needed* (`agent.read on core-platform`), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting plus an interjection), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The two coaching panels stack; the tab strip scrolls sideways inside its own row. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing else scrolls sideways.

## Permissions

- Read: `agent.read`
- Writes (each a governed action recorded in Audit): `agent.credential.rotate/revoke`, `agent.suspend`, `agent.deregister`, `agent.role.assign`, `budget.set`, `enrollment.revoke`, `agent.write (commit)`

## Backend gaps this page depends on

- G1 mandates
- G3 the token classes of §12.6 on `cost.daily_totals`, and `list_coaching` over them
- G6 the tier computed per run
- definition in git vs DB-backed definitions

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such; a self-reported token figure says so in its Basis line.
- Every number that is money shows its basis. Every token figure reconciles: the token use total equals the sum of its bars, the Token accounting rows sum to it, and the Agent IAM row shows the same total. Headers are rollups, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary; a coaching item names its signal.
- Exactly one gold action per screen (See the belt as the model sees it). Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- No heading carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence or nothing.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
