# Audit

| | |
|---|---|
| Route | `#/a-intel/audit[/<tab>]` |
| Scope | organization |
| Spec | §14 Mission Control; Appendix F page 10 |
| Design | `mockups/src/engine.js` → `pAudit()` (`auditEvents`, `auditIncidents`, `auditReceipts`, `auditExports`, `auditKeys`, `auditRetention`), built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / … / audit`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `audit.audit-prompt.md` |

## Job

Control-plane audit events, incidents, receipt search, exports, keys and KEK rotation, and retention. The record is written by the kernel, never by an agent.

## What is on the page

**Header**: eyebrow "Organization", h1 "Audit", subtext "What happened, who allowed it, under what authority, and what it cost." A mono line beneath: "control-plane events retained 7 years · run ledger forever · bodies 7 years by default · <org slug>".
Actions: **Export evidence bundle** (gold; opens `newexport`).

**Summary tiles** on the Events tab (one number and one basis line each, every one a count of the rows in the table beneath through the same actor classifier):
- **Events · 30 days**: count, "every IAM decision is recorded, allowed or not".
- **Denied**: count, "denials are recorded and cost nothing".
- **By a service principal**: count, "Terraform, CI, exports, the archiver".
- **By an agent**: count, "each one a governed action with a receipt".

**Tabs**: Events (N), Incidents (N open), Receipts (N), Exports (N), Keys, Retention.

- **Events**: panel "Control-plane events" with the caption "admin actions, IAM changes, repo bindings, plane changes, key rotations", the store badge "postgres · 7 years", Actor and Range selects, **CSV** (opens `exportevents`); a search field "Search events, receipts, actors, external ids"; filters Result (allowed, denied), Severity (critical, info, warning), Rows; columns When, Event, Actor (name and kind: human, agent, service), What, Result, Severity, Reference; a note that a client-attested call is labeled as such and can never be shown as decided by Oxagen.
- **Incidents**: tiles Open, Critical · 12 months, Median time to resolve, Money moved without a receipt; a critical banner while one is open, with **Open the incident**; panel "Incidents" with the caption "raised by the policy engine, the gateway and the verifier", **Open an incident** (opens `incident`); columns Severity, What happened (title, kind and scope), Opened, Detected by, State; per row **Open** (opens `incidentview`). Kinds: `mandate.exception`, `taint_raised`, `receipt_modified`, `chain_break`, `hooks_removed`, `credential_probe`. A note that any external transaction on a governed connection with no receipt is a critical exception.
- **Receipts**: panel "Receipt search" with the caption "one signed record per tool call"; a search input, **Search**, example chips (stripe, harness, observe, deny, an agent key, an external effect id), **clear**; columns Receipt, When, Agent and operator, Tool version, Decision, Amount, External effect, Tier; a row opens `receipt`; an empty search shows "No receipt matches" with **Clear the search**; a footer "N of N receipts shown". The nav count on Audit is the open critical incidents.
- **Exports**: a callout on what a bundle is; one card per export (the title, a ready or building badge, **Verify bundle**, **Download**; Export id, Range, Contents, Size, Created, Signature, Key ids; the verifier output once verified); panel **Verifier** (the offline `oxagen-verify` transcript); panel **Outbound events** (the subscribed event kinds, Dead-letter view, Delivery).
- **Keys**: panel "Keys and validity windows", store badge "kms + postgres", **Rotate KEK** (opens `rotatekek`); columns Key (name and id), Algorithm, Gen, Valid from, Valid to, State (active, retiring, retired, expired), What it covers; **Rotate** on the active KEK row; a note on rotation and a re-wrap progress bar.
- **Retention**: panel "Retention" with **Edit policy** (opens `retention`): Body retention, Hot window, Replay of a compacted run, Workspace opt-down, Cold storage cost; **Archive tiers**: Tier, Where, What it holds, Retention, Held today (Ledger, Frames, Bodies and segments, Control-plane audit); **Redaction** (before write, never after).

**Dialogs this page opens:** `newexport` (Scope, From, To, Format; **Build bundle**), `exportevents` (**Download CSV**), `incident` (Subject, Severity, Attach; **Raise it**), `incidentview` (What happened, Where it stands or Resolution; **Assign** while open, **Export incident**), `receipt` (Who, What, Authority, Credential, Effect, Integrity; **Export receipt**, **Open the run**), `rotatekek` (**Rotate**), `retention` (Body retention, Frame hot window; **Save policy**), `request-access` (denied state).

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet, Agent IAM, Tools, Steering, Repositories, Spend; Organization nav: Organization, Billing, Audit; the assistant launcher, agent count, data plane and connection badge at the foot), top bar (Menu, breadcrumbs, ⌘K "Search or run an action", Notifications with the unread count, **Approvals** with the count of everything waiting on you across the organization, account avatar → Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). The Approvals button opens the right-hand drawer `#apdrawer`: heading "Approvals" with an "N waiting" badge and a close button, an open interjection row with **Answer it**, one row per pending approval (tool and amount, agent, task, workspace, risk badges, countdown), the full approval card with **Approve** and **Deny** when a row is picked and "‹ All approvals" to return, "N resolved today" beneath. Escape closes it. There is no assistant button in the top bar.

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

- Every governed action lands here with who, what, result and a reference to the frame or record: reading a notification, changing a role, flipping a switch.
- A receipt for a client-attested call exists too. Its authority group says `recorded` where a call routed through Oxagen says `decided on the server`, and the rendering refuses to say otherwise. A tier is shown as recorded: `observe` renders "recorded only", `harness` renders "routed through Oxagen".
- Retention is the organization's policy and nothing in the product shortens it; personal data is redacted before write, and the archive has no edit path.
- Exports are signed archives with a verifier; **Verify bundle** recomputes the Merkle roots and checks every seal signature against the key ids listed. **Build bundle** runs as `export_data`, a governed action with third-party egress.
- Rotation does not rewrite history: a retiring generation decrypts until re-wrap completes, and a receipt keeps citing the signing generation it was signed under.
- Filtering is by actor kind and range (`since`, `until`); the API takes the same parameters.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: "No audit events yet". Control-plane audit events are written by the kernel on every governed action. An empty record means nothing has been done in this organization yet, not that recording is off. Action: **Open Organization**.
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: "Audit could not be loaded". The control plane answered `503 audit_store_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied**: "You cannot see the audit record". Your roles on the organization do not include `org.auditor or org.owner`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it. Actions: **Request access** (opens `request-access`), **Back to Fleet**. Below: *Signed in as* (name, role), *Needed* (the permission), *Decided by* (`pol_v41`, deny wins over every allow).

## Mobile

The top bar collapses to hamburger, current crumb, search glyph, notifications, approvals and avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. The approvals drawer opens full-width. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are at least 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `org.auditor or org.owner`
- Writes (each a governed action recorded in Audit): `export.create`, `key.rotate`, `incident.open / assign`, `retention.edit`

## Backend gaps this page depends on

- G8 audit events in Postgres, archive segments
- receipt frames
- KEK rotation

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested call is labelled as such and is never rendered as decided by Oxagen.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
