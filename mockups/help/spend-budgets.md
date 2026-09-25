# Spend budgets

## Budgets

The Budgets panel lists every spend ceiling that governs this workspace, with its period, limit, use, mode and position.

### Purpose
It answers where money stops, or where a person hears about it, and how close each ceiling is. From a row you edit the ceiling or remove it. The panel's own **Set a budget** adds one.

### Rationale
Spend has three views, and Budgets is the one that holds ceilings (D10; `docs/fleet-operations-ia.md`, Spend). A ceiling is only worth showing with the place it is checked and the tier that check holds on. The panel used to close on a note: "A hard budget is checked at each checkpoint, from a running counter fed by the usage each harness reports. A breach is a policy.decision frame and a pause, never a silent stop. A soft budget sends a notice." It explained enforcement to a reviewer, so it moved here, and the shipped code answers it differently.

- **Organization and workspace ceilings** are checked by the admission gate on every scoped, metered `invoke()`, from a running counter in Postgres (`packages/billing/src/spend-budget-gate.ts:1-19`). Over the limit, the gate denies before any provider call. At 50%, 80% and 95% it notifies the organization's admins once per period. It fails open when its store is down.
- **An agent's per-run ceiling** is the agent definition's `budget.per_run_micros`, signed into the mandate as `session_limit_usd`. The loopback model proxy on the host refuses the next call at it (`packages/tacho/src/collector/model-proxy.ts:863-885`). That is the `gateway` tier.
- **Nothing checks a ceiling at a checkpoint**, and no soft mode ships.

Mission-control-spec §12.5 sets the rule the page keeps: a budget is enforced only for model traffic routed through Oxagen. On the `observe` and `harness` tiers a ceiling is a recorded number, not a stop. "Hard" claims no more than that.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Organization and workspace ceilings | `SPEND.budgets` | `billing.spend_budgets`, `get_spend_budget` (`billing.budget.get.ts:51-75`) | shipped |
| Another workspace's ceiling | `SPEND.budgets` (`workspace · finops`) | none on this page | future-only |
| An agent's per-run ceiling | `SPEND.budgets` | the agent definition's `budget.per_run_micros` with what it used | partial |
| Mode `hard` | `SPEND.budgets[].mode` | `set_spend_budget` with `enabled: true` | shipped |
| Mode `soft` | `SPEND.budgets[].mode` | the staged `set_budget` (`contracts/v2/set-budget.ts:139`) | future-only |
| Remove | `openDialog('budgetdel')` | a delete | future-only |

### Logic
- `spendBudgets()` renders one row per entry in `SPEND.budgets`: Scope, Period, Limit, Used, Mode, Position, and the row actions.
- **Mode** is a badge: `hard` in the denied ink, `soft` in the approval ink.
- **Position** is Used over Limit. The bar turns red above 80% and is green below. The percentage sits under it.
- **Edit** opens `budgetedit` with the row's index. **Remove** opens `budgetdel`.
- The panel's **Set a budget** opens `budget`. It is plain, so the header's stays the one gold action.
- The Budgets tab count equals the rows.
- A ceiling is one row per scope. Setting one replaces the ceiling its scope has.
- Raising a ceiling is the override that clears a denial. Every write is a governed action and lands in Audit with the person's name.

### States
- The shell's list tools sit above the rows: search, the filters "Any period" and "Any mode", Rows and a pager.
- With no ceiling, the app's table reads "No spend ceiling is set for this workspace or its organization."
- A build lists an agent's per-run ceiling from its definition and prints Used and Position as not recorded until a read carries them.
- Permission to write: org Owner, Admin or Billing for either ceiling, and workspace Owner or Admin for this workspace's own.
- **Mobile**: one card per ceiling, with **Edit** and **Remove** at its foot. The Position bar shrinks to a sliver beside the percentage.

## New budget {#dialog/budget}

The Set a budget dialog adds a ceiling: a scope, a period, a limit in USD and a mode.

### Purpose
It puts a number on how much a scope may spend before a run pauses or a person hears about it. You pick the scope and period, type the limit, pick the mode, then **Set it**.

### Rationale
Mission-control-spec §12.5 gives a budget four parts: an owner (organization, workspace, operator or agent), a period, a limit and a mode. The mode options used to read "hard: checked at each checkpoint, pauses at the next one" and "soft: recorded and reported, never blocks". Each option explained enforcement inside a label, and the hard one claimed a check at each checkpoint, which nothing ships (see Budgets). They now read "Hard: refuses routed calls over the limit" and "Soft: sends a notice", and the explanation lives here. The toast used to add "A breach is a policy.decision frame and, by policy, a pause." That explained what happens later, so the toast now says only what happened.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Scope | `BUDGET_SCOPES` | `set_spend_budget` scope `org` or `workspace` (`billing.budget.set.ts:14-52`) | partial |
| Period | the `bgPeriod` select | `monthly`, or a rolling window in days | partial |
| Limit | the `bgLimit` field | the ceiling in micros | shipped |
| Mode | the `bgMode` select | `enabled` (hard), and soft in the staged `set_budget` | partial |
| Highest run this month | `ag.budgetUsed` on the agent fixture | the month's dearest run in the scope | future-only |

### Logic
- `budgetForm(null)` renders four fields. Scope lists five choices and selects `agent · a-intel.core.triage`. Period lists per run, daily and monthly, and selects per run. Limit starts at 0.25. Mode selects hard.
- When the scope is an agent, the Limit field adds the hint "Highest run this month: <amount>."
- **Set it** calls `budgetSave(-1)`. It strips everything but digits, dots and commas from the limit.
- A limit that is not a number is refused with the toast "A budget needs a limit in USD." and the dialog stays open.
- Otherwise it appends a row with Used $0.00, closes the dialog, re-renders, and toasts "Budget set on <scope>: $<limit> <period>, <mode>."
- The mockup appends a row even when the scope already has a ceiling. A build replaces the scope's ceiling, as `set_spend_budget` does.
- The operator scope, the daily period and soft mode are not built. A build leaves them out of the form until they ship.

### States
- Permission: `set_spend_budget`. A person without it gets the app's refusal: "Your role cannot set this ceiling. An organization owner, admin or billing member sets either ceiling; a workspace owner or admin sets this workspace’s own."
- **Mobile**: the dialog rises from the bottom edge as a sheet with full-width buttons.

## Budget edit {#dialog/budgetedit}
<!-- open: openDialog('budgetedit','0') -->

The Edit the budget dialog changes one ceiling's scope, period, limit or mode.

### Purpose
It moves a ceiling up or down, or turns it from hard to soft, without removing it. You change the fields, then **Save**.

### Rationale
The form is `budgetForm(b)`, the same one Set a budget uses, so the two cannot drift. Two sentences moved off the dialog. The Scope hint used to read "Changing the scope moves the budget. The spend already recorded against the old scope stays there." The note used to go on after its first sentence: "It does not undo spend already recorded in this period, so a budget cut below what is used reads as breached at once." Both explain what happens to recorded spend, which the record keeps where it landed. The note now reads "A new limit applies from the next boundary." The toast used to add "It applies from the next boundary.", which repeated the note.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The ceiling | `budgetAt(i)` over `SPEND.budgets` | `get_spend_budget` | shipped |
| Save | `budgetSave(i)` | `set_spend_budget`, which replaces the scope's ceiling | partial |

### Logic
- `DLG_EXT.budgetedit` reads the row by index through `budgetAt()`. An index out of range opens the no-such-record dialog.
- The title is "Edit the budget on <scope>". The four fields are filled from the row.
- **Save** calls `budgetSave(i)`, which checks the limit as Set a budget does, writes the four fields back to the row, closes the dialog, and toasts "Budget on <scope> set to $<limit> <period>, <mode>."
- A lower limit applies from the next check. It does not undo spend already recorded in the period, so a limit below Used reads as breached at once, and the Position bar turns red.
- Changing the scope moves the ceiling. Spend already recorded against the old scope stays there.

### States
- Permission: `set_spend_budget`, as for Set a budget.
- **Mobile**: the dialog rises from the bottom edge as a sheet.

## Budget removal {#dialog/budgetdel}
<!-- open: openDialog('budgetdel','1') -->

The Remove the budget dialog confirms taking a ceiling off a scope.

### Purpose
It asks you once before a scope loses its ceiling, and warns you when the ceiling is hard. **Keep it** backs out. **Remove it** takes the row away.

### Rationale
The note used to go on after its first sentence: "Runs there are still metered and still cost money, and the spend already recorded stays on the ledger." It explained that removing a ceiling changes no money already spent, so it moved here. The note now reads "<scope> has no ceiling after this." A hard ceiling is the only stop a routed call meets on its scope, so the warning stays. It used to read "Removing it means nothing pauses a run on this scope at a checkpoint.", a check nothing ships, and now reads "This is a hard budget. Removing it lets routed calls on this scope run past the limit." The toast used to add "Runs there are metered and uncapped."

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The ceiling | `budgetAt(i)` | `get_spend_budget` | shipped |
| Remove | `budgetDel(i)` | a delete capability | future-only |

No capability deletes a ceiling. `set_spend_budget` with `enabled: false` stops it gating and keeps the row.

### Logic
- `DLG_EXT.budgetdel` reads the row by index. An index out of range opens the no-such-record dialog.
- The title is "Remove the budget on <scope>?".
- On a hard ceiling the warning shows beneath the note.
- **Remove it** calls `budgetDel(i)`: it splices the row out of `SPEND.budgets`, closes the dialog, re-renders, and toasts "Budget on <scope> removed."
- The scope stays metered. Its runs keep costing money, and the spend already recorded stays on the ledger.
- A build offers stopping enforcement through `set_spend_budget` with `enabled: false`, or leaves Remove out, until a delete ships.

### States
- Permission: `set_spend_budget`, as for Set a budget.
- **Mobile**: the dialog rises from the bottom edge as a sheet with full-width buttons.
