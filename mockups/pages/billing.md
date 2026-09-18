# Billing

| | |
|---|---|
| Route | `#/a-intel/billing` |
| Scope | organization |
| Spec | §14 Mission Control; Appendix F page 9 |
| Design | `mockups/src/engine.js` → `pBilling()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Mission Control / … / billing`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `billing.audit-prompt.md` |

## Job

The plan, the two meters, and the invoices, linked to Stripe. Meter 1 is governed action units (GAUs): used against this month's allowance, blocks and auto top-up, and the contracted rate. Meter 2 is usage credits for in-app AI usage: the balance, the signup grant and credit packs. Readable only by a finance role.

## What is on the page

The mockup (`pBilling()`) still renders the proven-run price list. Billing charges on two meters (spec §12.1; 2026-09-15, maintainer decision): governed actions in GAUs on one price list (maintainer decisions of 2026-09-14, reaffirmed 2026-09-15), and in-app AI usage in usage credits. The build renders the page below.

**Header** — eyebrow “Organization”, h1 “Billing”.
Actions: **Change plan** (gold; opens the plan dialog; Build or Scale goes through Stripe Checkout)

**Summary tiles** (one number and one basis line each):
- **Plan** — the plan name · “monthly, cancel any time”
- **GAU this month** — remaining · “used of included + purchased + carried”
- **Contracted rate** — $ per 1,000 GAU · the plan's terms, or the contract's agreement reference
- **Due <date>** — $ USD

- **This month** — Line · Basis · Amount (the plan, blocks bought through Checkout, auto top-ups, invoiced overage, tax).
- **Meters** — Meter · This month · Note: GAU used against the allowance (`resolve_approval` is the only billable governed action), with held runs and other governed actions reported beside it and carrying no price; and usage credits spent on in-app AI usage.
- **Invoices** — Invoice · Period · GAU · Amount · Status · Paid; a row opens the Stripe-hosted invoice.
- **The price list** — Governed actions: Free $0 with 5,000 GAU a month · Build $199 with 50,000 · Scale $999 with 300,000 · Enterprise negotiated per contract · $5 per 1,000 GAU list · 5,000-GAU blocks at $25 · volume bands of $5, $4, $3 and $2 per 1,000. In-app AI usage: 1 usage credit = $0.01 · each in-app agent model call debits provider cost times the meter markup · a $5 signup grant · credit packs. Every feature is on for every tier.
- **Auto top-up** — on or off, and the GAU blocks it buys; an Owner or Admin changes it.
- **Usage credits** — the balance that pays for in-app AI usage, the signup grant and the packs bought against it; buy a credit pack (`purchase_credits`).
- **What counts** — Billed in GAU: `resolve_approval`, one GAU each. Billed in usage credits: each model call the in-app agent makes, at provider cost times the meter markup. Free: membership writes and every other governed action, `dod.held` included. Reported: held runs and proven spend.

**Dialogs this page opens:** `plan`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · connection badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Plan, invoices | `BILLING` | `billing.plans`, `billing.subscriptions`, `billing.invoices` + Stripe | `billing.subscriptions`, `billing.invoices`; `billing.subscription.read` | ✅ |
| GAU meter, blocks, contracted rate | `BILLING.billable`, `meters` | `billing.gau_buckets`, `billing.gau_settlements`, `billing.contract_terms` (§12.1, App. A.8) | the same tables on `macanderson/oxagen` `app-rebuild` | 🟡 billing rebuild (G13) |
| Usage credits (in-app AI usage) | none | `billing.credit_balances`, `billing.credit_lots`, `billing.credit_ledger` (§12.1, App. A.8) | the same tables; the credit gate with the meter markup in `packages/billing/src/pricing.ts` | ✅ |
| Held runs (reported) | `BILLING.billable` | `dod.dod_certificates` (§8.6) | none | ❌ G15 |
| Onboarding discount | `BILLING.discount` | deferred (spec §20, the 7-day offer) | none | ❌ deferred |

## Functionality

- Every feature is on for every tier, the in-app agent and the hosted witness runner included. The free tier includes 5,000 GAU a month and thirty days of evidence.
- `resolve_approval` is the only billable governed action. Membership writes, denials, broken runs and witness runs cost nothing. Held runs and proven spend are report figures.
- Two meters, two balances. GAU blocks buy governed actions; credit packs buy in-app AI usage. Neither balance pays for the other, and tokens are not passed through at cost.
- A Free organization that uses its allowance saves a card or waits for the next month. A prepaid organization's auto top-up buys blocks when the bucket reaches zero.
- Change plan upgrades to Build or Scale through Stripe Checkout (`start_subscription_upgrade`, kept in rev1); the page shows the amount due before it is charged.

**Decisions of 2026-09-15 (maintainer decision; spec §12.10).** The mockup does not show these yet.

- Oxagen charges on two meters. In-app AI usage is priced in usage credits: 1 credit = $0.01, debited by the credit gate at provider cost times the meter markup, funded by the $5 signup grant on `create_org` and topped up with credit packs (`purchase_credits`). GAU blocks remain the governed-action product.
- Enterprise is negotiated only: a `billing.contract_terms` row, with no enterprise plan in Stripe or in the plan dialog. No feature is gated on the enterprise license; every feature, IAM and SOC 2 controls included, is on for every tier.
- When invoice billing is switched off, the organization's `overage_invoiced_gau` is added to `purchased_gau`: the invoice is the purchase.
- `invoice_gau_max` bounds overage beyond the monthly allowance; the interim invoice fires at unit `invoice_gau_max` + 1.
- An invoice-billed organization is suspended 5 days after an invoice is past due. Metering continues while it is suspended. Paying the full outstanding balance reactivates it.
- `get_rate_card`, `preview_action_cost` and `get_evidence_retention` retire at cutover; nothing on this page reads them.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “Nothing billed yet” — no billable governed action this month; the free tier is every feature, 5,000 GAU a month and thirty days of evidence. Action: **Back to Fleet**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Billing could not be loaded” — `502 stripe_unreachable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see billing” — the roles the signed-in person holds on the organization do not include `org.billing — plan and invoices are readable only by a finance role`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `org.billing`
- Writes (each a governed action recorded in Audit): `billing.plan.change`

## Backend gaps this page depends on

- G13 GAU buckets, settlements and contract terms (billing rebuild)

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
