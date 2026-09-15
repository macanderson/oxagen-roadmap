# Audit

| | |
|---|---|
| Route | `#/a-intel/audit[/<tab>]` |
| Scope | organization |
| Spec | §14 Mission Control; Appendix F page 10 |
| Design | `mc.html` → `pAudit()` (the single source; `consolidated.html` is the product build of it) |
| States | loaded · empty · loading · error · access denied |
| Files | `audit-loaded.html` / `audit-loaded-mobile.html`, `audit-empty.html` / `audit-empty-mobile.html`, `audit-loading.html` / `audit-loading-mobile.html`, `audit-error.html` / `audit-error-mobile.html`, `audit-denied.html` / `audit-denied-mobile.html` |
| Audit | `audit.audit-prompt.md` |

## Job

Control-plane audit events, incidents, receipt search, legal holds, exports, keys and KEK rotation, assurance results, retention and erasure. The record is written by the kernel, never by an agent.

## What is on the page

**Header** — eyebrow “Organization”, h1 “Audit”.
Actions: **Place a legal hold** (opens the hold dialog) · **Export evidence bundle** (gold; opens the new-export dialog)

**Summary tiles** (one number and one basis line each):
- **Events · 30 days** — count · every IAM decision is recorded, allowed or not
- **Denied** — count · denials are recorded and cost nothing
- **By a service principal** — count · Terraform, CI, exports, the archiver
- **By the in-app agent** — count · each one a governed action with a receipt

- **Tabs**: Events (N) · Incidents (N open) · Receipts (N) · Legal holds (N) · Exports (N) · Keys · Assurance (passed/total) · Retention.
- **Events** — Actor and Range selects, search (events, receipts, actors, external ids); When · Event · Actor · What · Result · Severity · Reference; **CSV**. A client-attested call is labelled and can never be shown as gateway-enforced.
- **Incidents** — tiles: Open · Critical · Median time to resolve · Money moved without a receipt; Severity · What happened · Opened · Detected by · State (**Open an incident**, **Open** → the incident dialog with export).
- **Receipts** — receipt search with example chips; Receipt · When · Agent · operator · Tool version · Decision · Amount · External effect · Tier; a row opens the receipt dialog (export as signed JSON). Nav count on Audit = open critical incidents.
- **Legal holds** — Hold · Matter · Scope · Placed by · Placed · Released · State (**Place a hold**, **Release**).
- **Exports** — one card per export: Export id · Range · Contents · Size · Created · Signature · Key ids · Dead-letter view · Delivery; **Verify bundle**, **Download** (signed archive with its verifier).
- **Keys** — Key · Algorithm · Gen · Valid from · Valid to · State · What it covers (**Rotate KEK**, **Rotate**).
- **Assurance** — Suite · Passed · Failed · Not applicable tiles; Case · Result · What happened; Not applicable at this deployment (Case · Why it cannot run · Tracked as); Per release: Suite · Ran · Cases · Passed · Failed · N/A · Against · Note (**Run now**, **Result**).
- **Retention** — Body retention · Hot window · Replay of a compacted run · Workspace opt-down · Cold storage cost (**Edit policy**); Archive tiers: Tier · Where · What it holds · Retention · Held today; GDPR erasure requests: Request · Subject · Requested · By · State · Scope · Note (**Record a request**).

**Dialogs this page opens:** `hold`, `newexport`, `incident`, `receipt`, `export (download)`, `rotate KEK`, `retention policy`, `erasure request`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Skills · Steering · Spend; Organization nav: Organization · Billing · Audit; Assistant launcher; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, Assistant toggle, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/2026-09-12-mission-control-app-implementation-plan.md` §3; the *mockup collection* column names the constant in `mc.html` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Events | `AUDIT` | `audit.audit_events` | ClickHouse `audit_events` + `security.security_events`; `audit.log.query` | 🟡 |
| Incidents | `INCIDENTS` | incident kinds | `tacho.incidents` | ✅ |
| Receipts | `RECEIPTS` | receipt frames | none | ❌ |
| Legal holds | `HOLDS` | `audit.legal_holds` | none | ❌ (G8) |
| Exports | `EXPORTS` | archive exports | `privacy.data.export` | 🟡 |
| Keys, KEK rotation | `KEYS` | KMS per org | none | ❌ |
| Erasure | `ERASURE` | crypto-shred | `privacy_erasure_requests` | 🟡 |
| Retention | `RETENTION_TIERS` | §13.3 tiers | `evidence.retention_policy_versions` | 🟡 |
| Assurance history | `ASSURANCE_HISTORY` | M2 suite | none | ❌ |

## Functionality

- Reading a notification, changing a role, flipping a switch — every governed action lands here with who, what, result and a reference to the frame or record.
- A legal hold freezes deletion for its scope until released; erasure is crypto-shredding and is recorded as a request with its state.
- Exports are signed archives with a verifier; **Verify bundle** checks the signature against the key ids listed.
- Filtering is by actor kind and range (`since`/`until`); the API takes the same parameters.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “No audit events yet” — events are written by the kernel on every governed action; empty means nothing has been done yet, not that recording is off. Action: **Open Organization**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Audit could not be loaded” — `503 audit_store_unavailable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see the audit record” — the roles the signed-in person holds on the organization do not include `org.auditor or org.owner`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · assistant · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Skills, Organization, Billing, Audit, Assistant, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `org.auditor or org.owner`
- Writes (each a governed action recorded in Audit): `hold.place / release`, `export.create`, `key.rotate`, `incident.open / resolve`, `retention.edit`, `erasure.record`

## Backend gaps this page depends on

- G8 audit events in Postgres, legal holds, archive segments
- receipt frames
- KEK rotation
- assurance history (M2)

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
