# Spend budgets

| | |
|---|---|
| Route | `#/a-intel/core-platform/spend/budgets`. The path is unchanged (`fleet-operations-routes.md`, Spend) |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D10 (Spend has three views: Overview, Budgets and Optimization). `docs/fleet-operations-ia.md`, Spend (Budgets: budgets by scope, period and mode, with each position). `docs/fleet-operations-routes.md`, Spend. `docs/mission-control-spec.md` §12.5 (budgets) |
| Design | `mockups/src/wedge.js`: `spendBudgets()`, inside `pSpend()`. `mockups/src/engine.js`: `budgetForm()`, `budgetAt()`, `budgetSave()`, `budgetDel()`, `BUDGET_SCOPES`, and the `budget`, `budgetedit` and `budgetdel` dialogs. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Spend / Budgets`: Loaded, Loaded · mobile |
| Audit | `spend-budgets.audit-prompt.md` |

The Spend header, the four tiles and the tabs are specified in `spend.md`.

## Job

List every spend ceiling that governs this workspace and where each stands against its limit, and let a person set, change or remove one. A ceiling says where money stops or where a person hears about it, and the page states where each one is checked.

## What is on the page

**Header, tiles and tabs** as `spend.md`, with Budgets (4) selected. The header's **Set a budget** stays the one gold action.

**Budgets panel.** Heading "Budgets", with a small **Set a budget** beside it, which opens `budget` and is not gold. The shell's list tools sit above the rows: the search field "Search this list", the filters "All · Period" (monthly, per run) and "All · Mode" (hard, soft), Rows (5, 10, 25, 50, All), sortable column headers, and a pager over the four rows.

Columns, in order: Scope · Period · Limit · Used · Mode · Position · and a last column of row actions.

| Scope | Period | Limit | Used | Mode | Position |
|---|---|---|---|---|---|
| organization · a-intel | monthly | $25,000.00 | $18,402.66 | soft | 74% |
| workspace · core-platform | monthly | $18,000.00 | $14,213.78 | hard | 79% |
| workspace · finops | monthly | $4,000.00 | $2,044.25 | hard | 51% |
| agent · a-intel.core.triage | per run | $0.40 | $0.29 | hard | 72% |

- **Mode** is a badge: `hard` in the denied ink, `soft` in the approval ink.
- **Position** is a bar over the percentage used. The bar turns red above 80% and is green below.
- Each row carries **Edit** (opens `budgetedit`) and **Remove** (red, opens `budgetdel`).

A note closes the panel: "A hard budget is checked at each hook boundary, from a running counter fed by the usage each harness reports. A breach is a policy.decision frame and a pause, never a silent stop. A soft budget sends a notice."

**Dialogs this page opens:** `budget`, `budgetedit` and `budgetdel`. The header's `spendexport` is specified in `spend.md`.

- **`budget`**, "Set a budget". Scope: organization · a-intel, workspace · core-platform, workspace · finops, operator · Marcus Bell, agent · a-intel.core.triage (the agent is selected by default). Period: per run, daily, monthly (per run by default). Limit (USD), default 0.25, with the hint "Highest run this month: $0.29." Mode: "hard: checked at each checkpoint, pauses at the next one" or "soft: recorded and reported, never blocks". Footer: **Cancel**, **Set it** (gold). Setting one adds a row and reports "Budget set on <scope>: $<limit> <period>, <mode>. A breach is a policy.decision frame and, by policy, a pause." A limit that is not a number is refused with "A budget needs a limit in USD."
- **`budgetedit`**, "Edit the budget on <scope>". The same four fields, filled from the row. Under Scope, the hint "Changing the scope moves the budget. The spend already recorded against the old scope stays there." Beneath the fields, the note "A lower limit applies from the next boundary. It does not undo spend already recorded in this period, so a budget cut below what is used reads as breached at once." Footer: **Cancel**, **Save** (gold). Saving reports "Budget on <scope> set to $<limit> <period>, <mode>. It applies from the next boundary."
- **`budgetdel`**, "Remove the budget on <scope>?". The note "<scope> has no ceiling after this. Runs there are still metered and still cost money, and the spend already recorded stays on the ledger." On a hard budget, the warning "This is a hard budget. Removing it means nothing pauses a run on this scope at a checkpoint." Footer: **Keep it**, **Remove it** (red). Removing reports "Budget on <scope> removed. Runs there are metered and uncapped."

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| The organization's and this workspace's ceilings: scope, period, limit, used, position | `SPEND.budgets` | `billing.spend_budgets`; `get_spend_budget` | `packages/oxagen/src/contracts/billing.budget.get.ts:51-75`: scope `org` or `workspace`, `enabled`, `monthly` or `rolling` with `windowDays`, limit, spent, projected, ratio and a threshold state. The table: `apps/app/src/features/spend/tables.tsx:593-701` | ✅ |
| Another workspace's ceiling (`workspace · finops` on Core platform) | `SPEND.budgets` | none | `get_spend_budget` answers the organization's ceiling and the active workspace's (`apps/app/src/data/contracts/spend.ts:230-249`), so no read puts another workspace's row here | ❌ |
| An agent's per-run ceiling (`agent · a-intel.core.triage`, per run) | `SPEND.budgets` | the agent's ceiling with what it used | The ceiling exists: the agent definition's `budget.per_run_micros` (`packages/oxagen/src/contracts/agent.propose.ts:225`) is signed into the mandate as `session_limit_usd` (`packages/handlers/src/lib/tacho-mandate.ts:191-214`), and the loopback model proxy refuses the next call at it (`packages/tacho/src/collector/model-proxy.ts:863-885`). No budget read lists it with what it used. The app says so (`apps/app/messages/spend.json`, `spend.budgets.scopesMissing`) | 🟡 |
| An operator's ceiling, and a daily period | `BUDGET_SCOPES` | an operator scope and a daily period | No operator ceiling exists. An agent's `per_day_micros` is signed as `daily_limit_usd` only to a host that advertises the daily budget feature (`tacho-mandate.ts:180-214`; ADR-160, Proposed) | ❌ |
| Mode `hard` | `SPEND.budgets[].mode` | an enforced ceiling | `set_spend_budget` with `enabled: true`: the kernel's admission gate denies a metered `invoke()` over the ceiling before any provider call (`packages/billing/src/spend-budget-gate.ts:1-19`; `packages/oxagen/src/contracts/billing.budget.set.ts:54-74`) | ✅ |
| Mode `soft` | `SPEND.budgets[].mode` | a ceiling that notifies and never blocks | No soft mode ships. `enabled: false` keeps a ceiling that gates nothing. An enforced ceiling notifies org admins at 50%, 80% and 95% once per period (`spend-budget-gate.ts:16-18`). The staged `set_budget` carries hard and soft (`packages/oxagen/src/contracts/v2/set-budget.ts:139`) and is inert until cutover (`v2/_define.ts:5-15`) | ❌ |
| Set a budget, Edit | the `budget` and `budgetedit` dialogs | `set_spend_budget` | Organization or workspace scope, monthly or a rolling window in days, a limit, and whether it is enforced (`billing.budget.set.ts:14-52`; the app's dialog, `apps/app/src/features/spend/budget-dialog.tsx`). Setting a ceiling replaces the one its scope has. Operator and agent scopes, per-run and daily periods, and soft mode are not built | 🟡 |
| Remove | the `budgetdel` dialog | a delete | No capability deletes a ceiling. `set_spend_budget` with `enabled: false` stops it gating and keeps the row | ❌ |
| "Highest run this month" | a constant in `budgetForm()` | the month's dearest run in the scope | none | ❌ |
| Where a ceiling is checked (the note) | copy | the gate that enforces each scope | The organization and workspace ceilings: the kernel gate on every scoped, metered `invoke()`, from a running counter in Postgres, failing open on a store error (`spend-budget-gate.ts:1-14`). An agent's per-run ceiling: the loopback model proxy, per model call (`model-proxy.ts:863-885`). Nothing checks a ceiling at a hook boundary | 🟡 |

The app's Budgets tab also carries the gateway model lists and the recorded workspace session ceiling (`get_tacho_session_policy`; `apps/app/src/features/spend/gateway-policy.tsx`). The design does not draw that section.

## Future-only fields

The view carries no `data-future` mark, and the catalog gives it no future story. These fields are future-only all the same, and a build prints each as not recorded, or leaves the choice out of a form, until its contract ships: another workspace's ceiling on this page, the operator scope, the daily period, soft mode, Remove, and the "Highest run this month" hint. An agent's per-run ceiling is partial: a build may list it from the agent definition, but its Used and Position print not recorded until a read carries them.

## Functionality

- **Which ceilings appear.** The organization's ceiling and this workspace's, plus the per-run ceilings of this workspace's agents. A ceiling is one row per scope: setting one replaces the ceiling its scope has.
- **Used and Position.** Used is the spend recorded against the scope in the period to date. Position is Used over Limit. The bar turns red above 80%.
- **Where each ceiling is checked, with its tier.** An organization or workspace ceiling is checked by the kernel's admission gate on every scoped, metered `invoke()`, from the recorders' running counter. Over the limit, the gate denies before any provider call. At 50%, 80% and 95% it notifies the organization's admins once per period. It fails open when its store is down, so the page claims a stop only for calls routed through Oxagen, and only while the gate can read its counter. An agent's per-run ceiling is checked by the loopback model proxy on the host, on each model call routed through it (the `gateway` tier). On the `observe` and `harness` tiers a ceiling is a recorded number, never a stop (§12.5).
- **Lowering a limit** applies from the next check. It does not undo spend already recorded in the period, so a limit set below Used reads as breached at once.
- **Removing** a ceiling leaves the scope metered and uncapped, and the spend already recorded stays on the ledger.
- **Every write is a governed action** and lands in Audit with the person's name. Raising a ceiling is the override that clears a denial.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed. The renderer's standard panels are the Spend ones in `spend.md`. The app's empty table reads "No spend ceiling is set for this workspace or its organization." (`apps/app/messages/spend.json`, `spend.budgets.empty`).

## Mobile

The thumb bar holds Work (8), Agents, Tools, Spend and More (3), with Spend lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The tiles form a two by two grid above the tabs. The Budgets table becomes one card per ceiling, each cell labelled with its column, with **Edit** and **Remove** at the foot of the card. In the card the Position bar shrinks to a sliver beside the percentage, so the percentage carries the value. The search field, the two filters and Rows stack above the cards. The three dialogs rise from the bottom edge as sheets with full-width footer buttons. Nothing scrolls sideways at 390 px.

## Permissions

- Read: `spend.read` (`apps/app/src/data/read.ts:94-97`). Shipped: `get_spend_budget` allows org Owner, Admin, Billing and Member, and workspace Owner, Admin and Member (`billing.budget.get.ts`).
- Set, edit or remove a ceiling: `set_spend_budget`, org Owner, Admin or Billing for either ceiling, and workspace Owner or Admin for this workspace's own (`billing.budget.set.ts:68-71`). The app's refusal reads "Your role cannot set this ceiling. An organization owner, admin or billing member sets either ceiling; a workspace owner or admin sets this workspace’s own."

## Backend gaps this page depends on

- A budget read that lists an agent's per-run ceiling with what it used, beside the organization's and the workspace's.
- An operator scope, a daily period for a budget row, and soft mode: the staged `set_budget` (`packages/oxagen/src/contracts/v2/set-budget.ts`), live at cutover (#2884).
- A capability that deletes a ceiling.
- The month's dearest run in a scope, for the limit hint.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. A breach is a recorded frame (`policy.decision`).
- This view shows no Steering Source and no SteeringFrame, so neither can be shown as the other here.
- Used and Position read the record: the running counter and the rollup. No projection is shown as spent.
- No person is scored or ranked. An operator ceiling, when it ships, reports the ceiling's position, not the person.
- Every enforcement claim states its tier and where it is checked. "Hard" means the gate refuses for calls routed through Oxagen. On the `observe` and `harness` tiers a ceiling is recorded, not enforced.
- Headers are rollups of the rows beneath them. The Budgets count on the tab equals the rows in the table.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: **Set a budget** in the header. The panel's own **Set a budget** is not gold.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
