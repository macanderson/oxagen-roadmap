# Billing

| | |
|---|---|
| Route | `#/a-intel/billing` |
| Scope | organization |
| Spec | §12.1 as amended by ADR-055 (the governed action is the billable unit), §14; Appendix A.8, Appendix F page 9 |
| Design | `mockups/src/engine.js` → `pBilling()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / … / billing`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `billing.audit-prompt.md` |

## Job

The plan, the one priced meter, the reported meters, the invoices and the price list, linked to Stripe. Oxagen prices the governed action: a call it decided, delivered and recorded. Runs, tokens and retained evidence are reported and never priced. Readable only by a finance role.

## What is on the page

**Header**: eyebrow "Organization", h1 "Billing", and no subtext. What the page covers is in the component help (`mockups/help/billing.md`, Page header).
Actions: **Change plan** (gold; opens `plan`).

**Summary tiles** (one number and one basis line each):
- **Plan**: the plan name, "monthly, cancel any time".
- **Governed actions this period**: every governed action this period (the same figure as the Governed actions meter), "N above the N included".
- **Retained evidence**: GB with one decimal and thousands separators, "13 months included". The same figure appears on the Evidence retention line, the Retained evidence meter and Audit › Retention.
- **Due <date>**: $, "USD · after the onboarding discount".

Left column:
- **This period**: Line, Basis, Amount. Rows: **Governed actions · N used** (basis: the blocks × $30.00 and the included allowance), **Tokens** ("Not priced. Your own model spend is on Spend.", $0.00), **Evidence retention** ("N GB held · 13 months included", $0.00), **Onboarding discount** (the offer, "20% off usage for 12 months (converted …)", and its amount with a true minus, "−$954.00"), **Total** (no basis, USD).
- **Meters**: Meter, This period, Note. Rows lead with **Governed actions** (the billable unit, the included allowance this month), then **Sealed runs with at least one model call** (reported, not priced), **Retained evidence** (13 months included), **Runs oxagen halted before any model call** (free), **Runs of the in-app agent** (free). Notes read Priced, Reported, or Free. No note sits under the table: what is priced and what a governed action is are in the component help (Meters).
- **Invoices**: Invoice, Period, Governed actions, Amount, Status (Paid in green, or Open in amber), Paid (the date, or "Not paid"), **Open in Stripe ↗**. The list starts in March 2026, the month the organization converted to a paid plan.

Right column:
- **Price list**: Free (Every governance feature, an included monthly allowance, 30 days of evidence and 3 seats); Governed actions, blocks of 10,000 ($30.00 per block at the published rate); Negotiated agreement (Custom pricing per organization); Invoice billing (Never capped. Overage is invoiced at the contracted rate at period end.); Evidence retention (13 months included on paid plans, then $0.10 per GB-month); Tokens oxagen buys for you (At cost, no markup, capped); Enterprise, annual (From $60,000 per year). No footer: that every plan has every governance feature is in the component help (Price list).
- **Billable units**: **Priced** ("Governed actions"), **Reported** ("Sealed runs, tokens by class, retained evidence"), **Free** ("Denials, runs oxagen halted before a model call, runs of the in-app agent"). Each is a list with no definition; what a governed action is lives in the component help (Billable units).
- **Auto top-up** (below Billable units): a switch "Buy more automatically when this period's allowance runs out", a **Blocks per top-up** field (1 to 100) with the governed actions it buys, the saved payment method it charges or a line saying the next purchase saves one, the last top-up this month and its status (paid, open with its invoice under Invoices, or failed), and **Save**. An owner or admin can change it; everyone else reads it with a line naming who can.
- **Buy governed actions**: a **Governed actions** quantity in blocks of 10,000, the total at the organization's contracted rate, a note that Checkout saves the card, and **Continue to Checkout** (opens Stripe Checkout). An owner or a billing member can buy; everyone else sees the line naming who can. An organization billed by invoice does not buy blocks and is told so.
- **Token balance**: the balance, the basis "Pays for the tokens Oxagen buys for the in-app agent, at cost with no markup. The balance is the cap.", preset top-up amounts, a whole-dollar amount with its minimum, and **Continue to Checkout**. When the balance is spent, a line says the in-app agent's turns on Oxagen's model key stop until a top-up lands. A top-up needs a Build plan or above.

These three panels are kept from the shipped Billing page (Mac, 2026-09-23). The rendered mock does not draw them yet. This section is their design. None of their buttons is gold. The token balance is the cap on the price list's "Tokens oxagen buys for you" row. It buys nothing else and prices nothing.

**Dialogs this page opens:** `plan` (a Plan select with "Team (usage-based, monthly, cancel any time)" and "Enterprise (annual, committed use at 20–30% off, from $60,000)", **Change plan**; the toast "Plan change staged in Stripe."), `incident` (error state), `request-access` (denied state).

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Work, Agents, Tools, Steering, Runtimes, Spend, Repositories; Organization nav: Organization, Billing, Audit; the assistant launcher, agent count, data plane and connection badge at the foot), top bar (Menu, breadcrumbs, ⌘K "Search or run an action", Notifications with the unread count, **Approvals** with the count of everything waiting on you across the organization, account avatar → Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). The Approvals button opens the right-hand drawer `#apdrawer`: heading "Approvals" with an "N waiting on you in all workspaces" badge and a close button, an open question row with **Answer**, one row per pending approval (tool and amount, agent, task, workspace, risk badges, countdown), the full approval card with **Approve** and **Deny** when a row is picked and "‹ All approvals" to return, "N resolved today" beneath. Escape closes it. There is no assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Plan, invoices | `BILLING` | `billing.plans`, `billing.subscriptions`, `billing.invoices` + Stripe | `billing.subscriptions`, `billing.invoices`; `billing.subscription.read` | ✅ |
| Governed-action meter, blocks, contracted rate | `BILLING.billable`, `BILLING.tier2`, `meters` | `billing.gau_buckets`, `billing.gau_settlements`, `billing.contract_terms` (§12.1 as amended, App. A.8) | the same tables on `macanderson/oxagen` `app-rebuild` | 🟡 billing rebuild (G13) |
| Reported meters: sealed runs, tokens, halted runs, in-app runs | `BILLING.meters` | `cost.run_totals`, `cost.daily_totals` | ClickHouse `token_usage` | 🟡 |
| Retained evidence | `BILLING.retention` | evidence store size by organization | `evidence.retention_policy_versions` | 🟡 |
| Auto top-up, block purchase | none (kept panels, not drawn) | `billing.gau_buckets` + Stripe Checkout | `set_auto_topup`, `purchase_gau_bucket` | ✅ |
| Token balance | none (kept panel, not drawn) | usage-credit balance + Stripe Checkout | `purchase_credits` and the balance read | ✅ |
| Onboarding discount | `BILLING.discount` | deferred (spec §20, the 7-day offer) | none | ❌ deferred |

## Functionality

- Every governance feature is on for every tier. The free tier includes a monthly allowance of governed actions, thirty days of evidence and three seats. Plans differ in evidence retention, seats and the included allowance, never in features.
- The governed action is the only priced unit (ADR-055): a call Oxagen decided, delivered and recorded, with its receipt in the chain. Denials, runs halted before a model call and runs of the in-app agent are free. Sealed runs, tokens by class and retained evidence are reported and not priced.
- Governed actions above the included allowance are sold in blocks of 10,000 at the published rate, or at a contracted rate under a negotiated agreement. Invoice billing is never capped; overage is invoiced at the contracted rate at period end.
- Tokens are never marked up. The customer's own model spend is on Spend; the Tokens line here is reported at zero. Tokens Oxagen buys for the organization's own model routes are at cost and capped.
- Stripe holds the plan and the invoice; Oxagen holds the meter. A row of Invoices opens the Stripe-hosted invoice. **Change plan** stages the change in Stripe (`start_subscription_upgrade`, kept in rev1); Enterprise is annual and negotiated per organization.
- The Total is rounded to cents once, half-even, at the statement line. The page shows it as "Total" with no basis.
- **Buy governed actions** buys blocks through Stripe Checkout (`purchase_gau_bucket`) at the contracted rate. **Auto top-up** (`set_auto_topup`) buys the chosen number of blocks on the saved card when the period's allowance runs out. **Token balance** tops up the cap on tokens Oxagen buys for the in-app agent (`purchase_credits`). Each is a governed action, and each Checkout return shows a one-line banner saying what lands once Stripe confirms the payment.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: "Nothing billable yet". You pay per governed action: a call Oxagen decided, delivered and recorded. The free tier has every governance feature on, an included monthly allowance, thirty days of evidence and three seats. Action: **Back to Work**. Below the empty panel, **Buy governed actions** stays so an organization can buy its first block.
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: "Billing could not be loaded". The control plane answered `502 stripe_unreachable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied**: "You cannot see billing". Your roles on the organization do not include `org.billing`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it. Actions: **Request access** (opens `request-access`), **Back to Work**. Below: *Signed in as* (name, role), *Needed* (the permission), *Decided by* (`pol_v41`, deny wins over every allow).

## Mobile

The top bar collapses to hamburger, current crumb, search glyph, notifications, approvals and avatar. A fixed five-slot thumb bar replaces the sidebar: **Work** (count = work waiting on you), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. The approvals drawer opens full-width. The two columns stack. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are at least 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `org.billing`
- Writes (each a governed action recorded in Audit): `billing.plan.change`; buying blocks and topping up the token balance (owner or billing member); changing auto top-up (owner or admin)

## Backend gaps this page depends on

- G13 governed-action buckets, settlements and contract terms (billing rebuild)
- Reported meters on `cost.run_totals` and `cost.daily_totals` (§12.6)

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a figure the harness reported is labeled as such and is never rendered as observed.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
