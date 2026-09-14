# Spend

| | |
|---|---|
| Route | `#/a-intel/core-platform/spend[/<tab>[/<drill>]]` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 7 |
| Design | `mc.html` → `pSpend()` (the single source; `consolidated.html` is the product build of it) |
| States | loaded · empty · loading · error · access denied |
| Files | `spend-loaded.html` / `spend-loaded-mobile.html`, `spend-empty.html` / `spend-empty-mobile.html`, `spend-loading.html` / `spend-loading-mobile.html`, `spend-error.html` / `spend-error-mobile.html`, `spend-denied.html` / `spend-denied-mobile.html` |
| Audit | `spend.audit-prompt.md` |

## Job

Findings ranked by the money at stake; cost by operator, agent, model, provider key and tool; proven versus unproven spend and the productive ratio; cache hit rate; wasted spend by cause; reconciliation to provider statements; budgets. Every number shows its basis.

## What is on the page

**Header** — eyebrow “Savings identified · <month>”, h1 “Spend”.
Actions: **Export report** (opens the spend-export dialog) · **Set a budget** (gold; opens the budget dialog)

**Summary tiles** (one number and one basis line each):
- **Spend · <month>** — $ · `gateway_observed · USD` · agents, the assistant and Oxagen’s model routes
- **Proven spend** — $ · runs whose verdict is flipped
- **Accepted, not proven** — $ · a human verified it · never folded into proven
- **Productive ratio** — % · steps that advanced the task

- **Tabs**: Findings (N) · By operator · By agent · By tool · Wasted spend (N) · Reconciliation · Budgets (N).
- **Findings** — ranked cards: rank, amount at stake, level and confidence, the finding, **Evidence** (opens the runs, people and arithmetic) and **Fix** (opens the change that removes it). Search, facet (Level, Confidence), sort (Rank, Savings high/low, A–Z).
- **By operator** — Operator · Role · Agents · Runs · Spend · Proven · Productive ratio · Potential savings · Budget position. A row drills (`/spend/operator/<id>`).
- **By agent** — Agent · trust · spend · Runs · Spend · Proven spend · Spend per proven run · Potential savings · Trend; By model and provider key: Model · Provider key · Model calls · Spend · Cache hit rate · Basis.
- **By tool** — cumulative sparkline tiles (Cumulative · Average per call · Average per run that used it); Tool · Server · Calls · Runs · Cumulative · Share · Avg per call · Avg per run · Potential savings · What the frames say.
- **Wasted spend** — tiles: Wasted · Share of spend · Runs with waste · Largest cause; By cause; Runs that prove it (**Open the run**, **Show the frames**).
- **Reconciliation** — per month: Provider statements · Matched to a frame · Variance tiles; Level · How it matched · Matched · Unmatched after; Statement line · Provider · Frames · Receipt · Variance; Exceptions (Charge · Connection · Frame · Receipt · Incident; **Resolve with a note**, **Open an incident**); Unmatched provider lines; **Export statement**.
- **Budgets** — Scope · Period · Limit · Used · Mode · Position (**Set a budget**).

**Dialogs this page opens:** `budget`, `spendexport`, `evidence`, `fix`, `incident`, `exception note`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Spend; Organization nav: Organization · Billing · Audit; Assistant launcher; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, Assistant toggle, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/2026-09-12-mission-control-app-implementation-plan.md` §3; the *mockup collection* column names the constant in `mc.html` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Totals, by operator/agent/model | `SPEND` | `cost.run_totals` | ClickHouse `token_usage`, `usage_events`; `billing.usage.breakdown` | 🟡 |
| By tool | `SPEND.byTool` | `control.tool_calls` × price | ClickHouse `tool_invocations` | 🟡 |
| Proven vs unproven, productive ratio | `SPEND.proven`, `ratio` | `run_totals.verdict/productive_ratio` | none | ❌ (G7) |
| Findings + evidence + fix | `FINDINGS`, `EVIDENCE`, `FIX` | findings job (M2) | none | ❌ (G4) |
| Reconciliation | `SPEND.variance/matched` | `cost.reconciliations`, `provider_usage` | none (M5) | ❌ (G5) |
| Budgets | `SPEND.budgets` | `billing.budgets` | `billing.spend_budgets`; `billing.budget.{get,set}` | ✅ |

## Functionality

- Each saving is measured minus counterfactual over the runs it cites, at the price each call actually paid; nothing is an opinion.
- Accepted (human-verified) spend is never folded into proven.
- Reconciliation matches provider statement lines to frames level by level; a line with no frame is an exception with an incident.
- A budget breach pauses at the model proxy before the call (mode: hard) or notifies (mode: soft).

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “No spend to report yet” — rollups are derived indexes rebuilt from frames; no model call, nothing to roll up, nothing billable. Action: **Back to Fleet**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Spend could not be loaded” — `504 rollup_rebuild_in_progress`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this workspace’s spend” — the roles the signed-in person holds on the organization do not include `spend.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · assistant · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Organization, Billing, Audit, Assistant, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `spend.read`
- Writes (each a governed action recorded in Audit): `budget.set`, `spend.export`, `exception.resolve`, `incident.open`

## Backend gaps this page depends on

- G3 price book + rollup
- G4 findings job
- G5 reconciliation
- G7 proven spend

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
