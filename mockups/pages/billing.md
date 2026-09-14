# Billing

| | |
|---|---|
| Route | `#/a-intel/billing` |
| Scope | organization |
| Spec | §14 Mission Control; Appendix F page 9 |
| Design | `mc.html` → `pBilling()` (the single source; `consolidated.html` is the product build of it) |
| States | loaded · empty · loading · error · access denied |
| Files | `billing-loaded.html` / `billing-loaded-mobile.html`, `billing-empty.html` / `billing-empty-mobile.html`, `billing-loading.html` / `billing-loading-mobile.html`, `billing-error.html` / `billing-error-mobile.html`, `billing-denied.html` / `billing-denied-mobile.html` |
| Audit | `billing.audit-prompt.md` |

## Job

Governed-action usage, the retention meter, the plan, this period’s lines and the invoices — linked to Stripe. Readable only by a finance role.

## What is on the page

**Header** — eyebrow “Organization”, h1 “Billing”.
Actions: **Change plan** (gold; opens the plan dialog)

**Summary tiles** (one number and one basis line each):
- **Plan** — the plan name · “monthly, cancel any time”
- **Runs this period** — count · “N free · N billable”
- **Retained evidence** — GB · “N months included”
- **Due <date>** — $ USD · after the onboarding discount

- **This period** — Line · Basis · Amount (runs, evidence, discount, tax).
- **Meters** — Meter · This period · Note (governed actions, runs, evidence, egress…).
- **Invoices** — Invoice · Period · Runs · Amount · Status · Paid; a row opens the Stripe-hosted invoice.
- **The price list** — per-run tiers, evidence storage, Oxagen’s light / embed / rerank tiers (read from `ORG_ROUTES`).
- **What counts as a run** — sealed with at least one model call; the customer never pays for Oxagen saying no or for proving work.

**Dialogs this page opens:** `plan`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Spend; Organization nav: Organization · Billing · Audit; Assistant launcher; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, Assistant toggle, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/2026-09-12-mission-control-app-implementation-plan.md` §3; the *mockup collection* column names the constant in `mc.html` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Plan, invoices | `BILLING` | `billing.subscriptions` + Stripe | `billing.subscriptions`, `billing.invoices`; `billing.subscription.read` | ✅ |
| Run allowance, meters | `runsIncluded/runsUsed`, `meters` | per-run plan (§12.1) | credits model (`credit_ledger`) | ❌ billing rebuild (G13) |
| Onboarding discount | `BILLING.discount` | Stripe coupon | none | 🟡 |

## Functionality

- Every organization’s first 1,000 runs a month are free with every governance feature on.
- Proven runs carry no surcharge; denials cost nothing.
- Change plan goes to Stripe checkout; the page shows the amount due before it is charged.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “Nothing billable yet” — the first 1,000 runs are free; a run counts when sealed with at least one model call. Action: **Back to Fleet**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Billing could not be loaded” — `502 stripe_unreachable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see billing” — the roles the signed-in person holds on the organization do not include `org.billing — plan and invoices are readable only by a finance role`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · assistant · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Organization, Billing, Audit, Assistant, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

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
