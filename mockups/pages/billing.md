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

Proven runs this period, the secondary meters, the plan, this period’s lines and the invoices, linked to Stripe. The customer pays when the work is verified. Readable only by a finance role.

## What is on the page

**Header** — eyebrow “Organization”, h1 “Billing”.
Actions: **Change plan** (gold; opens the plan dialog)

**Summary tiles** (one number and one basis line each):
- **Plan** — the plan name · “monthly, cancel any time”
- **Proven runs this period** — count · “definition of done held · of N sealed runs”
- **Retained evidence** — GB · “N months included”
- **Due <date>** — $ USD · after the onboarding discount

- **This period** — Line · Basis · Amount (proven runs at the tier price, pending runs at $0.00 until signed, evidence, discount, tax).
- **Meters** — Meter · This period · Note: one priced meter (the proven run, `dod.held`), and the secondary meters (sealed runs, governed actions, retained evidence, halted runs, witness runs) reported and never priced.
- **Invoices** — Invoice · Period · Proven runs · Amount · Status · Paid; a row opens the Stripe-hosted invoice.
- **The price list** — Free (every governance feature, unlimited runs, 30 days of evidence, 3 seats) · $0.30 / $0.20 / $0.15 per proven run by monthly volume · evidence retention · tokens at cost · Enterprise from $60,000 a year.
- **What counts** — Priced: a proven run (sealed, its definition of done held, certificate signed). Pending: metered the day it is signed. Reported: sealed runs, governed actions, retained evidence. Free: broken runs, halted runs, witness runs.

**Dialogs this page opens:** `plan`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Skills · Steering · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Plan, invoices | `BILLING` | `billing.subscriptions` + Stripe | `billing.subscriptions`, `billing.invoices`; `billing.subscription.read` | ✅ |
| Proven runs, meters | `BILLING.billable`, `meters` | `dod.held` governed actions (§12.1, G15) | credits model (`credit_ledger`) | ❌ billing rebuild (G13) |
| Onboarding discount | `BILLING.discount` | Stripe coupon | none | 🟡 |

## Functionality

- The free tier has every governance feature on and unlimited runs; it is limited to thirty days of evidence and three seats.
- The proven run is the only priced meter; broken runs, denials and witness runs cost nothing.
- Change plan goes to Stripe checkout; the page shows the amount due before it is charged.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “Nothing billable yet” — you pay when the work is verified; the free tier is every feature, unlimited runs, thirty days of evidence and three seats. Action: **Back to Fleet**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Billing could not be loaded” — `502 stripe_unreachable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see billing” — the roles the signed-in person holds on the organization do not include `org.billing — plan and invoices are readable only by a finance role`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Skills, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `org.billing`
- Writes (each a governed action recorded in Audit): `billing.plan.change`

## Backend gaps this page depends on

- G13 per-run allowance and meters (billing rebuild)

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
