# Mandate

| | |
|---|---|
| Route | `#/a-intel/finops/agents/invoice-bot/mandates/<mandate id>` |
| Scope | workspace |
| Spec | §14 Mission Control; Appendix F page 3 |
| Design | `mockups/src/engine.js` → `pMandate(r)`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / mandate`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `mandate.audit-prompt.md` |

## Job

One mandate: the delegated financial authority an agent holds, its limits, what has been settled and reserved against it, the grant that created it, and the ledger of every draw against a receipt.

## What is on the page

**Header**: eyebrow “Mandate”, h1 the mandate id (mono). Badges: status (`active`, `expired`, or revoked), “granted by <name>”, the currency; then the purpose (“monthly infrastructure invoices, PO-4471”).
Actions: **Change limits** (opens `mandate`) · **Revoke** (danger; toast “Mandate revoked. In-flight calls that have not dispatched end now.”). Neither is gold.

**Summary tiles** (one number and one basis line each):
- **Per call**: $ limit · “read from the call by amount_path”.
- **Per period**: $ limit · “<period> · N calls per day”.
- **Settled**: $ · “this period, from the ledger”.
- **Remaining**: $ (approval colour) · “after $ reserved at decision time”.

- **Ledger** panel (left). First the remaining-authority bar (`mandateBar`: eyebrow “Remaining authority”, “of $ USD”, settled with its share, “reserved by this call” with its share while a reservation is held, remaining) and the line “Two concurrent calls cannot both fit under the same remaining limit — the reservation is taken before dispatch.” Then the table: When · Call · Amount · State (settled, reserved, released) · External id · Receipt (a link that opens `receipt`). Search, facet on State, Rows 5/10/25/50/All, pager (“1–4 of 4”).
- **Grant** panel (right): Agent (compact agent card) · Granted by (“<name> · <role> at grant”) · Second approver · Effect · Counterparties (allow, deny) · Tools · Approval (“above $, always for <effect>, approvers <role>”) · Valid (from → to).
- **Ledger** panel (right, below the grant): every draw has a receipt and every receipt has a frame; on this mandate an exception (“One exception, severity critical. The connection’s Stripe webhook reported charge `ch_3Qa8` for $18.00 USD on `con_01K2A9`, and no receipt exists for it. Money moved that Oxagen did not govern.”) with **Open on Audit**; on any other mandate the note “Every draw on this mandate has a receipt and every receipt has a frame. Nothing is outstanding for September.”

**Dialogs this page opens:** `mandate` (change limits), `receipt`, `request-access` (from denied), `incident` (from error). Revoke is a button with a toast, not a dialog.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agents · Tools · Steering · Runtimes · Repositories · Spend; Organization nav: Organization · Billing · Audit; foot: the assistant launcher, agent count · data plane, connection badge). Top bar: hamburger, breadcrumbs (… / Agents / <slug> / <mandate id>), ⌘K search-or-run, notifications with unread dot, the approvals button (left of the avatar, count of everything waiting on you across the organization; opens the drawer described in `fleet.md`), account avatar → user menu. No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Mandate, limits | `MANDATES` | `tools.mandates` | none | ❌ (G1) |
| Ledger | `MANDATES[i].ledger` | `tools.mandate_ledger` | none | ❌ (G1) |
| Receipts | `RECEIPTS` | receipt frames | none | ❌ (G8) |

## Functionality

- Amounts are reserved at decision time and settled or released on the receipt; used + reserved + remaining always equals the period limit, and the bar, the tiles, and the ledger read the same `MANDATES` record the approval card moves.
- A financial tool whose schema does not expose an amount cannot be granted a mandate (denied by construction).
- Changing limits or revoking is a governed action by a person with the finance role and lands in the audit record; the page is readable only by a finance role.
- The route names the mandate; the page resolves it by id and falls back to the first mandate only in the mockup.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `finops`, mandate `mnd_7K2ETQ4`, operator Marcus Bell).
- **empty**: “This mandate has never been drawn on”. “It is active and its ledger is empty. Remaining authority equals the full period limit.” No actions.
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: “This mandate could not be loaded”. “The control plane answered `503 mandate_ledger_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see this mandate”. “Your roles on Anderson Intelligence Corp. do not include `org.billing — mandates are readable only by a finance role`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (opens `request-access`), **Back to Fleet**. Below: *Signed in as* (Marcus Bell · workspace.owner · core-platform), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting plus an interjection), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The two columns stack, the ledger first. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; the ledger table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `org.billing (finance role)`
- Writes (each a governed action recorded in Audit): `mandate.grant / mandate.change`, `mandate.revoke`

## Backend gaps this page depends on

- G1 `tools.mandates` + `mandate_ledger`
- receipt frames (G8)

## Rules every build of this page must keep

- Every number that is money shows its basis and its currency; the tiles, the bar, and the ledger are one record, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary; every settled row links its receipt.
- No gold action on this page; the primary button of an open dialog is the only gold. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- No heading carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence or nothing.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
