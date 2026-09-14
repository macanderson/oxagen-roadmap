# Audit

| | |
|---|---|
| Route | `#/a-intel/audit[/<tab>]` |
| Scope | organization |
| Spec | §14 Mission Control; Appendix F page 10 |
| Design | `mockups/src/engine.js` → `pAudit()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Mission Control / … / audit`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `audit.audit-prompt.md` |

## Job

Control-plane audit events, incidents, receipt search, exports, keys and KEK rotation, and retention. The record is written by the kernel, never by an agent.

## What is on the page

**Header** — eyebrow “Organization”, h1 “Audit”.
Actions: **Export evidence bundle** (gold; opens the new-export dialog)

**Summary tiles** (one number and one basis line each):
- **Events · 30 days** — count · every IAM decision is recorded, allowed or not
- **Denied** — count · denials are recorded and cost nothing
- **By a service principal** — count · Terraform, CI, exports, the archiver
- **By an agent** — count · each one a governed action with a receipt

- **Tabs**: Events (N) · Incidents (N open) · Receipts (N) · Exports (N) · Keys · Retention.
- **Events** — Actor and Range selects, search (events, receipts, actors, external ids); When · Event · Actor · What · Result · Severity · Reference; **CSV**. A client-attested call is labelled and can never be shown as gateway-enforced.
- **Incidents** — tiles: Open · Critical · Median time to resolve · Money moved without a receipt; Severity · What happened · Opened · Detected by · State (**Open an incident**, **Open** → the incident dialog with export).
- **Receipts** — receipt search with example chips; Receipt · When · Agent · operator · Tool version · Decision · Amount · External effect · Tier; a row opens the receipt dialog (export as signed JSON). Nav count on Audit = open critical incidents.
- **Exports** — one card per export: Export id · Range · Contents · Size · Created · Signature · Key ids · Dead-letter view · Delivery; **Verify bundle**, **Download** (signed archive with its verifier).
- **Keys** — Key · Algorithm · Gen · Valid from · Valid to · State · What it covers (**Rotate KEK**, **Rotate**).
- **Retention** — Body retention · Hot window · Replay of a compacted run · Workspace opt-down · Cold storage cost (**Edit policy**); Archive tiers: Tier · Where · What it holds · Retention · Held today; Redaction (before write, never after)

**Dialogs this page opens:** `newexport`, `incident`, `receipt`, `export (download)`, `rotate KEK`, `retention policy`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Events | `AUDIT` | `audit.audit_events` | ClickHouse `audit_events` + `security.security_events`; `audit.log.query` | 🟡 |
| Incidents | `INCIDENTS` | incident kinds | `tacho.incidents` | ✅ |
| Receipts | `RECEIPTS` | receipt frames | none | ❌ |
| Exports | `EXPORTS` | archive exports | `privacy.data.export` | 🟡 |
| Keys, KEK rotation | `KEYS` | KMS per org | none | ❌ |
| Retention | `RETENTION_TIERS` | §13.3 tiers | `evidence.retention_policy_versions` | 🟡 |

## Functionality

- Reading a notification, changing a role, flipping a switch — every governed action lands here with who, what, result and a reference to the frame or record.
- Retention is the organization’s policy and nothing in the product shortens it; personal data is redacted before write, and the archive has no edit path.
- Exports are signed archives with a verifier; **Verify bundle** checks the signature against the key ids listed.
- Filtering is by actor kind and range (`since`/`until`); the API takes the same parameters.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “No audit events yet” — events are written by the kernel on every governed action; empty means nothing has been done yet, not that recording is off. Action: **Open Organization**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Audit could not be loaded” — `503 audit_store_unavailable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see the audit record” — the roles the signed-in person holds on the organization do not include `org.auditor or org.owner`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `org.auditor or org.owner`
- Writes (each a governed action recorded in Audit): `export.create`, `key.rotate`, `incident.open / resolve`, `retention.edit`

## Backend gaps this page depends on

- G8 audit events in Postgres, archive segments
- receipt frames
- KEK rotation

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
