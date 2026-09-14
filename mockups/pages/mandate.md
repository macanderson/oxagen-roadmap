# Mandate

| | |
|---|---|
| Route | `#/a-intel/finops/agents/invoice-bot/mandates/<mandate id>` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 3 |
| Design | `mc.html` → `pMandate(r)` (the single source; `consolidated.html` is the product build of it) |
| States | loaded · empty · loading · error · access denied |
| Files | `mandate-loaded.html` / `mandate-loaded-mobile.html`, `mandate-empty.html` / `mandate-empty-mobile.html`, `mandate-loading.html` / `mandate-loading-mobile.html`, `mandate-error.html` / `mandate-error-mobile.html`, `mandate-denied.html` / `mandate-denied-mobile.html` |
| Audit | `mandate.audit-prompt.md` |

## Job

One mandate: the delegated financial authority an agent holds — its limits, what has been settled and reserved against it, the grant that created it, and reconciliation of every draw to a receipt.

## What is on the page

**Header** — eyebrow “Mandate”, h1 “<mandate id> (mono)”.
Actions: **Change limits** (opens the mandate dialog) · **Revoke** (danger)

**Summary tiles** (one number and one basis line each):
- **Per call** — $ limit · “read from the call by `amount_path`”
- **Per period** — $ limit · period and call-rate cap
- **Settled** — $ this period, from the ledger
- **Remaining** — $ after the amount reserved at decision time

- **The ledger** — When · Call · Amount · State (reserved / settled / released) · External id · Receipt (opens the receipt dialog). Search, facet on State, pager.
- **The grant** — Agent · Granted by · Second approver · Effect · Counterparties · Tools · Approval · Valid.
- **Reconciliation** — draws against provider statement lines; **Open on Audit** for the receipts.

**Dialogs this page opens:** `mandate (change limits)`, `receipt`, `revoke`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Spend; Organization nav: Organization · Billing · Audit; Assistant launcher; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, Assistant toggle, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/2026-09-12-mission-control-app-implementation-plan.md` §3; the *mockup collection* column names the constant in `mc.html` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Mandate, limits | `MANDATES` | `tools.mandates` | none | ❌ (G1) |
| Ledger | `MANDATE_LEDGER` | `tools.mandate_ledger` | none | ❌ (G1) |
| Receipts | `RECEIPTS` | receipt frames | none | ❌ |

## Functionality

- Amounts are reserved at decision time and settled or released on the receipt; Remaining = period limit − settled − reserved.
- A financial tool whose schema does not expose an amount cannot be granted a mandate (denied by construction).
- Changing limits or revoking needs the second approver and lands in the audit record; readable only by a finance role.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “This mandate has never been drawn on” — active, ledger empty; remaining equals the full period limit.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “This mandate could not be loaded” — `503 mandate_ledger_unavailable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this mandate” — the roles the signed-in person holds on the organization do not include `org.billing — mandates are readable only by a finance role`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · assistant · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Organization, Billing, Audit, Assistant, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `org.billing (finance role)`
- Writes (each a governed action recorded in Audit): `mandate.grant / mandate.change (two-person rule)`, `mandate.revoke`

## Backend gaps this page depends on

- G1 `tools.mandates` + `mandate_ledger`
- receipt frames (G8)

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
