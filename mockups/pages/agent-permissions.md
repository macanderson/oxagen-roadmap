# Agent › Permissions

| | |
|---|---|
| Route | `#/a-intel/finops/agents/invoice-bot/permissions`, and `…/permissions?delegation=mnd_7K2ETQ4` to open the Delegation section on one mandate. Old routes that land here: `…/agents/<agent>/budgets` and `…/agents/<agent>/mandates` in place; the mockup's `#/:org/:ws/agents/<agent>/mandates/<mandate>` becomes `…/permissions?delegation=<mandate>` in place; the app's `/{org}/{ws}/mandates/{mandate}` answers a lookup 308 to `/{org}/{ws}/agents/{agent}/permissions?delegation={mandate}`, and `routes.mandate` retires. The mandate page is cut |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D11 (a mandate is a Steering Source that emits delegation frames, managed on this tab; there is no mandate page), D5 and the Frame types row for `delegation` (never cut; the gate also enforces it), the Emissions row for Mandate, D17, and the Cuts row for the Mandate page. `docs/fleet-operations-ia.md` (Agents) and `docs/fleet-operations-routes.md` (Agents, Tools). ADR-059 in `macanderson/oxagen` for mandates, consequence roles and the ledger. The agent header and the tab bar are specified in `agent.md` |
| Design | `mockups/src/wedge.js` → `aPermissions()`, `permDelegation()` and `mandateFrame()`; `mockups/src/engine.js` → `permRoles()`, `permBudgets()`, `permMandates()` (the no-mandate panel), `iamWire()`, `iamMoney()`, `receiptLink()`, and the dialogs `assignrole`, `budget`, `mandateedit`, `mandaterevoke`, `receipt` and `mandate`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Agents / Permissions`: Loaded, Loaded · mobile, and Loaded · future-only fields marked |
| Audit | `agent-permissions.audit-prompt.md` |

## Job

What the agent may do, as three kinds of limit on its principal: the roles it holds, the budgets it runs under, and the authority a person delegated to it. Delegation lists every mandate the agent holds with its limits, its position, its ledger and the delegation frame it emits. It replaces the mandate page. The tab never lists tools: the toolbelt says what the model is shown, and this tab says whether a call on it survives.

## What is on the page

With component help off, the page carries no explainer text. Each part's specification is in `mockups/help/agent-permissions.md`.

The agent header and the tab bar are as `agent.md` specifies, with Permissions selected and its count (1) equal to the mandates the agent holds. The body is Roles and Budgets side by side, then Delegation across the width.

**Roles.** The panel has no subtext. Its explanation is in the component help (`mockups/help/agent-permissions.md`, Roles). **Assign a role** in the header opens `assignrole`. A wire joins each held role and the operator with “and” into the toolbelt: `agent.finance.pay` and `agent.graph.read` and “Dana Okafor” (`org.billing · finops`) = “8 tool versions”, “the toolbelt its model is shown”. Rows:

| Row | Value | Sub-line |
|---|---|---|
| Each held role (`agent.finance.pay`, `agent.graph.read`) | The role's permission ids, joined with mid-dots (“mandate.draw · invoice.read”) | The role's description (“draw on a mandate; nothing without one”) |
| Resource scope | “side_effects: read, write · repositories: a-intel/finops-agents · egress: third_party · max_hops 2” | none |
| Spend ceiling | “$5.00 USD” over “per run, checked at each checkpoint”, then “$15.00 USD” over “per day, on reported spend” | none |
| Can move money | A badge “1 mandate”, followed by “, and only inside it”; with no mandate, a badge “no” followed by “ · no mandate” | none |

With no role held, the one row reads “Roles” with “None held. It can reach only its own run channel.” No note closes the panel. Why assigning a toolbelt grants nothing is in the component help (`mockups/help/agent-permissions.md`, Roles).

**Budgets.** The panel has no subtext. How a breach is checked on each tier, and what happens when the harness stops reporting, is in the component help (`mockups/help/agent-permissions.md`, Budgets). **Set budget** in the header opens `budget`. Two meters:

- “Per-run hard limit”, “$5.00”, with a bar of the month's highest run against the ceiling and the caption “highest run this month $3.28 · basis: price book 2026-09 at the provider's list rate”.
- “Per-day hard limit”, “$1.10 of $15.00”, with a bar and the caption “resets 00:00 UTC · mode hard · currency USD”.

Rows: Mode, which states the agent's tier (“Hard limit, blocked at the proxy before the call is sent” on `gateway` and `contained`; otherwise “Hard limit, checked at each checkpoint against reported spend · fail-open”), On a breach (“pause at the next checkpoint, a policy.decision frame, and the operator notified”) and Delegation ceiling (`max_hops 2`).

**Delegation.** The panel has no subtext. Its explanation is in the component help (`mockups/help/agent-permissions.md`, Delegation). The header badge counts the active mandates (“1 active”). One block per mandate the agent holds, active or ended, newest first. The demo holds `mnd_7K2ETQ4` (active) and `mnd_5T2HVX` (expired).

Each block's header: the mandate id (mono), its status as a dot and a word (“active”, “expired”), its purpose (“monthly infrastructure invoices, PO-4471”), **Change limits** (opens `mandateedit` on that mandate) and **Revoke** (danger; opens `mandaterevoke` on that mandate). Then two columns of rows:

| Row | Value |
|---|---|
| Granted by | “Dana Okafor (org.billing), second approver Priya Natarajan” |
| Window | “2026-09-01 to 2026-12-31” |
| Effect | `commits_spend, moves_funds` |
| Limits | “$250.00 a call · $5,000.00 monthly · 50 calls a day” |
| Position | “$1,284.60 settled, $2,450.00 reserved, $1,265.40 left”, over a bar of settled and reserved against the period limit |
| Tools | `stripe__create_payment@*, aws_billing__purchase_savings_plan@2` |
| Counterparties | “allow vendor:aws, vendor:github, deny *” |
| Approval | “above $250.00, always for moves_funds, by role:org.billing” |
| SteeringFrame | The `delegation` type badge, the frame id `delegation:mnd_7K2ETQ4@2e98897c4612`, and its body: “monthly infrastructure invoices, PO-4471: $5,000.00 USD a month, stripe__create_payment@*, aws_billing__purchase_savings_plan@2, until 2026-12-31. Calls above the auto-approve limit of $250.00 wait for a person.” |

The mockup draws the SteeringFrame row on the expired `mnd_5T2HVX` too. An ended mandate emits no frame, so a build leaves that row out of an ended block.

The ledger. The block the address names with `?delegation=<id>` is highlighted and shows its ledger; so does the only mandate of an agent that holds one. Any other block shows **Show the ledger**, which writes `?delegation=<id>` into the address. The ledger is a table, When · Call · Amount · State · External · Receipt:

| When | Call | Amount | State | External | Receipt |
|---|---|---|---|---|---|
| 09:31:08 | `stripe__create_payment@4` | $2,450.00 | reserved | awaiting approval | none |
| 2026-09-04 | `stripe__create_payment@4` | $884.60 | settled | `pi_3QaL8f2Xk` | `rcp_01K4X8M2E` |
| 2026-09-02 | `aws_billing__purchase_savings_plan@2` | $400.00 | settled | `sp-0a4f91c` | `rcp_01K4W2P7R` |
| 2026-09-01 | `stripe__create_payment@4` | $1,150.00 | released | — | `rcp_01K4V7D3N` |

State is a dot and a word: settled, reserved or released. A receipt id opens the `receipt` dialog. Three of the fixture's draws ($2,450.00 reserved, $884.60 and $400.00 settled) exceed the mandate's $250.00 per-call limit, which the gate refuses before dispatch; the demo ledger needs draws inside the limit.

No note closes the section. The ledger mechanics (reserve, then settle or release) and how a mandate's tools are gated on the toolbelt are in the component help (`mockups/help/agent-permissions.md`, Delegation).

**No mandate.** An agent that holds no mandate shows one panel in place of Delegation: the heading “No mandate”, no subtext, the badge “cannot move money”, and **Request a mandate**, which opens `mandate`. The panel draws no paragraph and no worked example. The order in which the gate denies a financial call from an agent with no mandate is in the component help (`mockups/help/agent-permissions.md`, Delegation). The demo shows it on `#/a-intel/core-platform/agents/triage/permissions`.

**Dialogs this tab opens.**

- `assignrole`, “Assign a role”, for this agent (see `agents.md`).
- `budget`, “Set a budget”: Scope, Period (per run, daily, monthly), Limit (USD, with the hint “Highest run this month: <amount>.”), Mode (hard or soft), **Cancel** and **Set it**. Opened here, its agent scope names this agent. The mockup's dialog names `a-intel.core.triage` and triage's highest run from every agent's tab, which is a defect.
- `mandateedit`, “Edit mnd_7K2ETQ4” with the agent key: “Auto-approve limit per call (USD)” (“A call above this parks for a person.”), the per-period limit (“Monthly limit (USD)”), Valid to, and the note “Raising a limit needs the second approver, Priya Natarajan.” **Cancel** and **Save**, which closes the dialog with “Limits saved on mnd_7K2ETQ4.” What lowering a limit below the reserved amount does is in the component help (`mockups/help/agent-permissions.md`, Change limits).
- `mandaterevoke`, “Revoke mnd_7K2ETQ4?”: what the agent can no longer do, what is reserved and released at the next boundary, and what already settled and stays on the ledger, all in one warning. No note follows it. Why the ledger is kept is in the component help (`mockups/help/agent-permissions.md`, Revoke a mandate). **Cancel** and **Revoke it**. The mockup offers Change limits and Revoke on an ended mandate too. `update_mandate_limits` acts on an active mandate and `revoke_mandate` refuses one that has ended, so a build offers both on active mandates only.
- `receipt`, “Receipt <id>”: the tool, time and agent, the decision and tier, the amount, then Who (Operator, Agent, “Run · turn · step”, and the work order it served, which the build labels Work order where the mockup says Task) and What (tool version, schema digest, input digest, the amount read from its path, the counterparty).
- `mandate`, from Request a mandate. The mockup titles it “Grant a mandate”: Agent, Effect (commits_spend, moves_funds, changes_entitlement), Auto-approve limit per call (USD), Per period (USD), Period, Calls per day, Counterparties allowed, Tools, the hint “A call that moves funds always needs approval, whatever the limit.”, Purpose, Valid from and Valid to (“Mandates expire. There is no unbounded option.”), **Cancel** and **Grant the mandate**, which closes with “Mandate granted.” Effect carries no hint and no note closes the form. How amounts are read and who may grant are in the component help (`mockups/help/agent-permissions.md`, Grant a mandate). From this tab it carries this agent and files a request (`request_mandate`) that a holder of the consequence's role grants. The mockup pre-fills `a-intel.finops.invoice-bot` from every agent and grants directly, which is a defect.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Contract paths are under `packages/oxagen/src/contracts/` in `macanderson/oxagen` `main`; mandate schemas are in `packages/oxagen/src/mandates/schemas.ts`.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Roles held, their permissions and descriptions | `S.agentRoles` via `agentRolesOf()`, `ROLES` | `list_agent_roles`; `get_agent_role` grants | `agent.role.list.ts:38`; `agent.role.get.ts:19` | ✅ |
| The wire's operator and toolbelt | `PEOPLE[a.operator]`, `beltTotal()` | The delegation ceiling; `get_agent_toolbelt` | `agent.toolbelt.get.ts:130-135`, `:155` | ✅ |
| Resource scope | fixed text | The scope a role's grants reach | Not a field on any read | ❌ |
| Spend ceiling, per run and per day | `a.budget`, `a.budgetDay` | The definition's `budget` table: `per_run_micros`, `per_day_micros` | Parsed from the definition (`packages/oxagen/src/agent-definition-source.ts:19-31`) and signed into the host bundle as `session_limit_usd` and `daily_limit_usd` (`packages/handlers/src/lib/tacho-mandate.ts:191-212`; ADR-160 for the day) | 🟡 |
| Can move money | `a.mandates` | Active mandates | `list_mandates` (`mandate.list.ts:28`); `list_agents` `mandates` (`agent.list.ts:117-121`) | ✅ |
| Per run meter: highest run this month | `a.budgetUsed` | The agent's dearest run this month | Run cost is on `list_runs` rows (`run.list.ts:476`); no per-agent maximum is read | 🟡 |
| Per day meter: spent today | `a.usedDay` | The agent's spend today | `get_spend` grouped by agent over a day range (`spend.get.ts:34`) | 🟡 |
| Mode and On a breach | `a.tier` via `TIER_RANK`, and fixed text | The bundle budget's mode and what a breach does | `deriveBundleBudget` signs `enforced` or `observed` (`tacho-mandate.ts:178-212`). A pause at the next checkpoint and the operator notice are not recorded as described | 🟡 |
| Delegation ceiling `max_hops` | fixed text | A subagent hop limit | No such field | ❌ |
| Set budget | `budget` dialog | A per-agent ceiling | `set_spend_budget` takes scope `org` or `workspace` only (`billing.budget.set.ts:55`, `billing.budget.get.ts:9`). A per-agent ceiling is written in the definition file (`commit_agent_definition`) | 🟡 |
| Mandates: id, status, purpose, window, effect | `MANDATES` | `list_mandates`, `get_mandate`: `id`, `status`, `purpose`, `validFrom`, `validTo`, `consequenceTags` | `mandates/schemas.ts:630-655`; table `tools.mandates` (`packages/database/src/schema/tools.ts:30-99`). The starter tag is `moves_money`; the mockup's `moves_funds` and `commits_spend` are custom tags | ✅ |
| Granted by | `m.by`, `m.roleAt` | `grantedBy`, `roleAtGrant` | `mandates/schemas.ts:630-655` | ✅ |
| Second approver | `m.second` | A second approver on the grant | No field | ❌ |
| Limits | `m.perCall`, `m.perPeriod`, `m.period`, `m.callsPerDay` | `limits` per measure: `perCall`, `perPeriod`, `period`, and the `calls` measure | `mandates/schemas.ts:419-446`; `CALLS_MEASURE` (`schemas.ts:105`) | ✅ |
| Position | `m.used`, `m.reserved`, `m.remaining` | `authority`: `settled`, `reserved`, `remaining` by measure | `mandates/schemas.ts:587-605` | ✅ |
| Tools, counterparties, approval | `m.tools`, `m.allow`, `m.deny`, `m.approvalAbove`, `m.alwaysFor`, `m.approvers` | `tools`, `targets`, `approval` (`humanAbove`, `alwaysHumanFor`, `approvers`) | `mandates/schemas.ts:496-530`. Approvers are written `role:Billing`, not `role:org.billing` | ✅ |
| Delegation frame | `mandateFrame()` | One `delegation` SteeringFrame per active mandate, with the grant version as its source version | No frame types; no grant version on a mandate | ❌ |
| Ledger: when, amount, state, external | `m.ledger` | `get_mandate` `ledger`: `at`, `kind` (`reserve`, `settle`, `release`), `value`, `externalEffectId` | `mandate.get.ts:18-56`; `mandates/schemas.ts:607-628`; table `tools.mandate_ledger` (`tools.ts:103`) | ✅ |
| Ledger: call | `x.call` | The tool version of the call | The row carries `toolCallId`, not the tool | 🟡 |
| Ledger: receipt and the receipt dialog | `x.rcp`, `RECEIPTS` | A receipt per settled draw | No receipt record; the ledger row carries `externalEffectId` only | ❌ |
| Change limits | `mandateedit` | `update_mandate_limits` on an active mandate | `mandate.limits.update.ts:59` | ✅ |
| Revoke | `mandaterevoke` | `revoke_mandate` with a reason | `mandate.revoke.ts:10`; it refuses a mandate that has already ended | ✅ |
| Request a mandate | `mandate` | `request_mandate`, a draft a person with the consequence role grants | `mandate.request.ts:9`; `grant_mandate` (`mandate.grant.ts:16`) | ✅ |
| No-mandate decision order (component help only; the page no longer draws it) | `mockups/help/agent-permissions.md`, Delegation | The gate's denial when no mandate covers a financial call | The mandate gate decides at dispatch (ADR-059). The chain's example call is illustrative | 🟡 |

## Future-only fields

The design marks these with `data-future` (they outline with `?future=1`):

| Mark | Reason in the design | What a build shows today |
|---|---|---|
| The SteeringFrame row of each mandate block | “delegation frames” | Not recorded. The mandate's own fields show; no frame id or frame body |

Unmarked in the design, and future-only all the same: Resource scope, the `max_hops` delegation ceiling, the second approver, and the ledger's Receipt column with its dialog. A build renders each as not recorded until its contract ships.

## Functionality

- A mandate is a Steering Source (D11). Each active one emits one `delegation` frame, delivered in the session-start prefix and never cut for budget; the gate enforces the same limits on every call. An expired or revoked mandate emits no frame.
- Every draw reserves at decision time, then settles on the receipt or releases on failure or denial. Settled plus reserved plus remaining equals the period limit, and the Position bar, the ledger and the Approvals drawer's card read the same record.
- Two concurrent calls cannot both fit under the same remaining limit: the reservation is taken before dispatch.
- A financial tool whose schema declares no amount cannot be granted a mandate.
- Changing limits and revoking are governed actions by a person holding the consequence's role (ADR-059), recorded in Audit. Lowering a limit applies from the next call; revoking releases every reservation not yet dispatched and keeps the ledger.
- `?delegation=<id>` opens the section on that mandate. The old mandate page's address lands here, so every link to a mandate still works.
- Assigning a toolbelt grants nothing. Permissions never lists tools, and the Toolbelt tab never claims a permission.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. Roles, Budgets and Delegation stack. Each mandate block's two columns stack, its actions wrap under the id, and the ledger becomes cards with labelled cells. The wire wraps. Dialogs rise from the bottom edge as sheets. Touch targets are at least 44 px and nothing scrolls sideways.

## Permissions

- Read: the agent read (`get_agent`) and the roles read (`list_agent_roles`). Mandates: `list_mandates` and `get_mandate` admit org Owner, Admin, Billing and Compliance, and a workspace Owner or Member for the mandates of agents they created or requested (`mandate.list.ts:9-27`).
- Writes, each a governed action recorded in Audit: Assign a role (`assign_agent_role`: org Owner or Admin), Change limits (`update_mandate_limits`) and Revoke (`revoke_mandate`), each by a holder of the consequence's role (org Owner, Admin, Billing or Compliance by tag), Request a mandate (`request_mandate`: org Owner, Admin, Billing or Compliance, workspace Owner or Member). Set budget has no per-agent contract today.

## Backend gaps this page depends on

- Delegation frames: frame types, and a grant version on a mandate as the frame's source version.
- Receipts tied to settled ledger rows, and the tool on each ledger row.
- A second approver on a grant.
- Resource scope and a subagent hop limit as recorded fields.
- A per-agent ceiling read (the definition's `per_run_micros` and `per_day_micros`) and the agent's spend against it.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. The SteeringFrame row is labelled as one.
- A Steering Source and a SteeringFrame are never shown as each other. The mandate is the source; its delegation frame is shown beside it, labelled SteeringFrame, with the mandate at its grant version as its source.
- No person is scored or ranked. The granter and the approvers are named, never graded.
- Every enforcement claim states the tier. “Enforced” only for calls routed through Oxagen: on `harness` a budget breach is reported by the harness and fail-open, and the proxy enforces the ceiling before the call on `gateway` and `contained`.
- Headers are rollups of the rows beneath them: the Delegation badge counts the active blocks, the Position equals the ledger's settled and reserved rows against the period limit, and the tab count equals the mandates held.
- Every number that is money shows its currency, and the Position, the bar and the ledger are one record, never typed twice.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. A quoted string above that breaks this rule is a mockup defect to fix, not copy to reproduce.
- Exactly one gold (primary) action per screen. The tab has none of its own; an open dialog's primary button is the gold one.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
