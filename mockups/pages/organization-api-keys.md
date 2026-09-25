# Organization: API keys

| | |
|---|---|
| Route | `#/a-intel/api-keys` |
| Scope | organization |
| Spec | §14; Appendix F page 8 |
| Design | `mockups/src/engine.js` → `pOrganization()` with `S.tab.organization="keys"`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / … / organization-api-keys`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `organization-api-keys.audit-prompt.md` |

## Job

The organization page opened on its API keys tab: keys minted for service principals, what each may do, who created it, when it was last used, and its expiry.

## What is on the page

**Header**: eyebrow "Organization", h1 "<organization name>", subtext "People, roles, workspaces, model routes, the data plane, and API keys." Breadcrumb: <organization> / Organization / **API keys**.
Actions: **Invite** (opens `invite`), **Create a workspace** (gold; opens `newws`).

**Tabs**: the seven Organization tabs, with **API keys** selected.

- **API keys**: panel "API keys" with the caption "Each key is a service principal with its own grants" and **Create key** (opens `apikey`); Rows; columns Name (with the masked key beneath), Principal, Grants (one chip each), Created by, Last used, Actions 30d, Expires (a state badge Active, "Expires in N days" counted from the mock's current date, or "Never used", with the date beneath); per row **Rotate** (opens `rotatekey`), **Revoke** (opens `revokekey`); a note that a key is shown once, carries grants not roles, and revoking ends the principal's access at the next call.
- **Surfaces this reaches**: one paragraph saying the API, MCP, the CLI and these screens share one set of actions, so a key can do the same everywhere; four example `oxagen` CLI lines.

**Dialogs this page opens:** `apikey` (Name, Grants, Expires; the secret is shown once), `rotatekey` (a new secret, the old one valid for 24 hours), `revokekey`, plus `invite` and `newws` from the header.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Work, Agents, Tools, Steering, Runtimes, Spend, Repositories; Organization nav: Organization, Billing, Audit; the assistant launcher, agent count, data plane and connection badge at the foot), top bar (Menu, breadcrumbs, ⌘K "Search or run an action", Notifications with the unread count, **Approvals** with the count of everything waiting on you across the organization, account avatar → Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). The Approvals button opens the right-hand drawer `#apdrawer`: heading "Approvals" with an "N waiting on you in all workspaces" badge and a close button, an open interjection row with **Answer**, one row per pending approval (tool and amount, agent, task, workspace, risk badges, countdown), the full approval card with **Approve** and **Deny** when a row is picked and "‹ All approvals" to return, "N resolved today" beneath. Escape closes it. There is no assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| API keys | `APIKEYS` | `iam.credentials` | `auth.api_keys`; `api.key.{create,revoke,rotate}` | ✅ |
| Actions 30d | fixture | `audit.audit_events` by principal | ClickHouse `audit_events` | 🟡 |

## Functionality

- A key is bound to a service principal with explicit grants; create, rotate and revoke are governed actions with audit records.
- The route pins the tab so a link lands on the keys, not on People.
- Rotation ships in rev1 (2026-09-15, maintainer decision): **Rotate** calls `rotate_api_key`, issues a new secret shown once, and keeps the old one valid for 24 hours.
- A key's grants apply on every surface: the API, MCP, the CLI and the UI share one agent tool contract.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: same as Organization: "This organization has no workspaces". Action: **Create a workspace** (gold).
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: "Organization could not be loaded". The control plane answered `503 control_plane_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied**: "You cannot see this organization's settings". Your roles on the organization do not include `org.admin`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it. Actions: **Request access** (opens `request-access`), **Back to Fleet**. Below: *Signed in as* (name, role), *Needed* (the permission), *Decided by* (`pol_v41`, deny wins over every allow).

## Mobile

The top bar collapses to hamburger, current crumb, search glyph, notifications, approvals and avatar. A fixed five-slot thumb bar replaces the sidebar: **Work** (count = work waiting on you), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. The approvals drawer opens full-width. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are at least 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `org.admin`
- Writes (each a governed action recorded in Audit): `api.key.create`, `api.key.rotate`, `api.key.revoke`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested figure is labelled as such and is never rendered as observed.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
