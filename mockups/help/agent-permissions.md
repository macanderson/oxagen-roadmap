# Agent permissions

## Roles

The roles this agent's principal holds, and what they intersect down to with its operator's grants.

### Purpose
Answers "what is this agent allowed to reach, and on whose authority". A person reads the held roles, the resource scope, the spend ceiling, and whether the agent can move money. From here they assign another role with **Assign a role**, which opens `assignrole` for this agent.

### Rationale
The toolbelt and the permissions are two separate questions, and the page keeps them apart. A toolbelt decides what the model is shown. A role, the policy on the tool, and the mandate ledger decide whether a call on it survives the pipeline. Assigning a toolbelt grants nothing: it widens what the model is shown, and every call on it is still decided against these roles, the policy, and the ledger. For that reason this tab never lists tools, and the Toolbelt tab never claims a permission.

A subagent can use only what both its own grants and the invoking person's grants allow. Delegation can narrow authority and can never widen it. The wire at the top of the panel draws that intersection: each held role and the operator, joined by "and", equal the toolbelt the model is shown. The rule rests on D11 and D17 in `docs/fleet-operations-wedge.md` and on ADR-059 in `macanderson/oxagen`.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Roles held, their permissions and descriptions | `S.agentRoles` via `agentRolesOf()`, `ROLES` via `roleById()` | `list_agent_roles`, `get_agent_role` | live |
| Operator in the wire | `PEOPLE[a.operator]` | The delegation ceiling on `get_agent_toolbelt` | live |
| Toolbelt width in the wire | `beltTotal()` | `get_agent_toolbelt` `tools` | live |
| Resource scope | fixed text over the workspace's repositories | A recorded scope per role grant | future |
| Spend ceiling | `a.budget`, `a.budgetDay` | The definition's `per_run_micros` and `per_day_micros` | partial |
| Can move money | `a.mandates` | `list_mandates`, active | live |

### Logic
1. `permRoles(a)` reads `agentRolesOf(a.key)`. Each held role renders one row: the role id in mono, its permission ids joined with mid-dots, and its description under them. A role id with a repository scope, such as `agent.repo.write(a-intel/platform)`, is looked up by its base through `roleBase()`. An id that matches no role reads "not a registered role".
2. `iamWire()` draws the intersection: one term per held role, then the operator's name and role, then "=" and the toolbelt width with the caption "the toolbelt its model is shown".
3. Resource scope is one fixed line: side effects, the workspace's main and linked repositories, egress, and `max_hops 2`.
4. Spend ceiling renders the per-run and per-day amounts through `iamMoney()`, each with its basis line.
5. Can move money reads `a.mandates`. With a mandate it shows a count badge and "and only inside it". With none it reads "no · no mandate". A financial call from an agent with no mandate is denied before dispatch.
6. **Assign a role** opens `assignrole`, which writes `assign_agent_role`. The mockup disagrees with itself on timing: the assign toast says the role is effective at the next call, and the Edit identity dialog says the next run start. A build states the one the resolver implements.

### States
With no role held the panel shows one row, "Roles", with "None held. It can reach only its own run channel." The page has the loaded state only. On a phone the panel stacks above Budgets and the wire wraps.

## Budgets

The ceilings this agent's runs are measured against, per run and per day, and what happens at a breach.

### Purpose
Answers "how much may one run of this agent spend, how much has it spent today, and what stops it". **Set budget** opens the `budget` dialog, which the Spend group specifies.

### Rationale
A budget is a limit on the principal, like a role or a mandate, so it sits under Permissions and not beside the toolbelt. What a budget can do depends on the tier the agent earns, and the panel states that tier's answer in its Mode row.

On the `harness` tier the hard limit is checked at each checkpoint against the spend the harness reports. If the harness stops reporting, the run is not paused, so the limit is fail-open. On the `gateway` and `contained` tiers the loopback proxy sees every model call, and it blocks the call before it is sent. Every enforcement claim states the tier, so the Mode row reads differently on each.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Per-run limit | `a.budget` | The definition's `budget.per_run_micros`, signed into the host bundle as `session_limit_usd` | partial |
| Highest run this month | `a.budgetUsed` | The dearest run of this agent this month, from `list_runs` costs | partial |
| Per-day limit | `a.budgetDay` | `budget.per_day_micros`, signed as `daily_limit_usd` (ADR-160) | partial |
| Spent today | `a.usedDay` | `get_spend` by agent over one day | partial |
| Mode and On a breach | `a.tier`, fixed text | The bundle budget's `enforced` or `observed` mode | partial |
| Delegation ceiling | fixed text | A subagent hop limit | future |

### Logic
1. `permBudgets(a)` draws two meters. The per-run bar is the highest run this month over the per-run limit; it turns critical above 80%. The caption names the basis: price book 2026-09 at the provider's list rate.
2. The per-day bar is spent today over the day limit. It reads allowed up to 50%, approval above 50%, and critical above 80%. The caption reads "resets 00:00 UTC · mode hard · currency USD".
3. Mode reads `TIER_RANK[a.tier]`. At rank 2 or above (`gateway`, `contained`) it says the proxy blocks the call before it is sent. Below that it says the limit is checked at each checkpoint against reported spend and is fail-open.
4. On a breach: `pause` at the next checkpoint, a `policy.decision` frame, and the operator notified.
5. Delegation ceiling is `max_hops 2`. A subagent inherits this ceiling and may only lower it.

### States
The page has the loaded state only. A build reads the ceilings from the definition and today's spend from `get_spend`; until a per-agent ceiling read exists it renders them as not recorded. `set_spend_budget` takes org and workspace scopes only, so a per-agent ceiling is changed by a pull request on the definition. The mockup's `budget` dialog names `a-intel.core.triage` from every agent's tab, which is a defect the spec records.

## Delegation

Every mandate this agent holds: who granted it, its limits, its position, its ledger, and the delegation frame it emits.

### Purpose
Answers "may this agent move money, how much is left, and who said so". A person reads each mandate's limits and position, opens its ledger, changes its limits, or revokes it. An agent with no mandate shows **No mandate** here instead, with **Request a mandate**.

### Rationale
A mandate is authority a person delegated to this agent. D11 makes a mandate a Steering Source that emits `delegation` frames, managed on this tab. The old mandate page is cut, and its address lands here with `?delegation=<id>`. Each active mandate reaches the agent as one delegation frame, delivered in the session-start prefix and never cut for budget, and the gate enforces the same limits on every call.

A mandate is the only thing that lets this agent move money. Nothing in a grant, a role, or a toolbelt can substitute for one. Every draw reserves at decision time, then settles on the receipt or releases on failure or denial. The mandate's tools appear on the toolbelt gated `mandate + approval`, never plain `allowed`.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Id, status, purpose, window, effect | `MANDATES` | `list_mandates`, `get_mandate` | live |
| Granted by | `m.by`, `m.roleAt` | `grantedBy`, `roleAtGrant` | live |
| Second approver | `m.second` | A second approver on the grant | future |
| Limits | `m.perCall`, `m.perPeriod`, `m.period`, `m.callsPerDay` | `limits` per measure | live |
| Position | `m.used`, `m.reserved`, `m.remaining` | `authority`: settled, reserved, remaining | live |
| Tools, counterparties, approval | `m.tools`, `m.allow`, `m.deny`, `m.approvalAbove`, `m.alwaysFor`, `m.approvers` | `tools`, `targets`, `approval` | live |
| SteeringFrame | `mandateFrame()` | One `delegation` frame per active mandate | future |
| Ledger rows | `m.ledger` | `get_mandate` `ledger` (`reserve`, `settle`, `release`) | live |
| Ledger call and receipt | `x.call`, `x.rcp` | The tool on the row; a receipt per settled draw | future |

### Logic
1. `permDelegation(a)` in `wedge.js` filters `MANDATES` to this agent. With none it returns `permMandates(a)`, the No mandate panel. All three variants carry `data-help="delegation"`.
2. The header badge counts the active mandates. Each mandate is one block: id, status dot and word, purpose, **Change limits** (`mandateedit`), and **Revoke** (`mandaterevoke`).
3. Position shows settled, reserved and left, over a bar of settled and reserved against the period limit. Settled plus reserved plus remaining equals the period limit. A reservation reads reserved until a receipt settles or releases it, and every amount carries USD.
4. `mandateFrame(m)` builds the frame body from the purpose, the period limit, the tools, the end date, and the auto-approve limit. The row carries `data-future`. The mockup draws it on an ended mandate too; a build leaves it out, because an ended mandate emits no frame.
5. The ledger shows on the block `S.delegationSel` names, read from `?delegation=<id>`, or on an agent's only mandate. Any other block shows **Show the ledger**, which writes the query.
6. The decision order for a financial call from an agent with no mandate: the call arrives with its amount; the financial class is read from the tool version's declared `amount_path`; the mandate lookup finds none for this agent key; the gate denies it with `no_mandate`. The ledger is unchanged and no credential is minted. The check runs before any credential is minted and before anything is sent to a provider, whether or not the tool is on the toolbelt.
7. The `Mandates held` branch of `permMandates` is a table that `permDelegation` never reaches.

### States
No mandate: heading "No mandate", badge "cannot move money", and **Request a mandate**, which opens `mandate`. The mockup offers Change limits and Revoke on an ended mandate; a build offers both on active mandates only. On a phone each block's columns stack and the ledger becomes cards.

## Grant a mandate {#dialog/mandate}

The form that delegates spending authority to an agent, opened by **Request a mandate**.

### Purpose
Answers "what may this agent spend, on which tools, with whom, and until when". The person fills the effect, the limits, the counterparties, the tools, the purpose, and the window, then submits.

### Rationale
A mandate is the only way an agent moves money (D11, ADR-059). Amounts are read from the call by the tool version's declared `amount_path`, so a financial tool whose schema exposes no amount cannot be granted a mandate. Granting is a governed action by a person with a finance role. Every draw on the mandate is a receipt, and the ledger on the Delegation section shows what is used, reserved and left.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent | fixed option `a-intel.finops.invoice-bot` | This agent | partial |
| Effect | fixed options | `consequenceTags` | live |
| Limits and period | form inputs | `limits` per measure | live |
| Counterparties, tools | form inputs | `targets`, `tools` | live |
| Purpose, window | form inputs | `purpose`, `validFrom`, `validTo` | live |
| Submit | `act()` toast | `request_mandate`, then `grant_mandate` | live |

### Logic
1. `mandateBody()` renders Agent, Effect (commits spend, moves funds, changes entitlement), the auto-approve limit per call, the per-period limit, Period, Calls per day, Counterparties allowed, Tools, Purpose, and the window.
2. Counterparties outside the list are denied. A call that moves funds needs approval whatever the limit. A mandate always has an end date.
3. **Grant the mandate** closes the dialog and shows "Mandate granted." The mockup writes nothing.

### States
The mockup pre-fills `a-intel.finops.invoice-bot` from every agent and grants directly. From this tab a build carries this agent and files `request_mandate`, which a holder of the consequence's role grants. The dialog is a bottom sheet on a phone.

## Change limits {#dialog/mandateedit}

The dialog that edits one mandate's per-call limit, period limit, and end date.

### Purpose
Answers "how do I raise or lower what this agent may spend under this mandate". Opened by **Change limits** on a mandate block.

### Rationale
Limits change as budgets and vendors change, and a new mandate for every change would split the ledger. Editing in place keeps one ledger per grant. A call above the auto-approve limit parks for a person, and no rule elsewhere can release it. Lowering a limit below what is already reserved leaves the reservation in place, and the new limit applies from the next call. Raising a limit needs the second approver.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Auto-approve limit per call | `m.perCall` | `limits.perCall` | live |
| Period limit | `m.perPeriod`, `m.period` | `limits.perPeriod` | live |
| Valid to | `m.to` | `validTo` | live |
| Second approver | `m.second` | A second approver on the grant | future |
| Save | `mandateSave()` | `update_mandate_limits` | live |

### Logic
1. `DLG_EXT.mandateedit(id)` finds the mandate or shows the not-found state through `noSuch("Mandate")`.
2. The title is "Edit <id>" with the agent key under it. The note names the second approver.
3. `mandateSave(id)` writes the per-call value to both `perCall` and `approvalAbove`, the period limit, and the end date, then re-renders and shows "Limits saved on <id>." A build writes `update_mandate_limits` and records an audit event.

### States
The mockup opens it on an ended mandate too. `update_mandate_limits` acts on an active mandate, so a build offers it on active mandates only.

## Revoke a mandate {#dialog/mandaterevoke}

The confirmation that ends one mandate before its window closes.

### Purpose
Answers "what happens to the money if I revoke this now". Opened by **Revoke** on a mandate block.

### Rationale
Revoking is irreversible, so the dialog states the consequence in amounts before the button. The ledger is kept and never deleted, and a revoked mandate still answers for every draw it made. Revoking releases every reservation not yet dispatched.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent | `m.agent` | `get_mandate` | live |
| Reserved | `m.reserved` | `authority.reserved` | live |
| Settled | `m.used` | `authority.settled` | live |
| Revoke | `mandateRevoke()` | `revoke_mandate` with a reason | live |

### Logic
1. `DLG_EXT.mandaterevoke(id)` titles the dialog "Revoke <id>?".
2. The warning says the agent can move no money after this, that the reserved amount is released at the next boundary, and that the settled amount stays on the ledger.
3. **Revoke it** calls `mandateRevoke(id)`, which sets the status to `revoked` and the remaining amount to 0.00, then shows "Revoked <id>. The reservation is released at the next boundary."

### States
`revoke_mandate` refuses a mandate that has already ended, so a build offers Revoke on active mandates only.
