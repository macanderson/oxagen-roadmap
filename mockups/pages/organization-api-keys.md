# Organization · API keys

| | |
|---|---|
| Route | `#/a-intel/api-keys` |
| Scope | organization |
| Spec | §14 Mission Control; Appendix F page 8 |
| Design | `mockups/src/engine.js` → `pOrganization() with `S.tab.organization="keys"``, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Mission Control / … / organization-api-keys`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `organization-api-keys.audit-prompt.md` |

## Job

The organization page opened on its API keys tab: keys minted for service principals, what each may do, who created it, when it was last used, and its expiry.

## What is on the page

**Header** — eyebrow “Organization”, h1 “<organization name>”. Breadcrumb: Organization / **API keys**.
Actions: **Invite** · **Create a workspace**

- **API keys** — Name · Principal · Grants · Created by · Last used · Actions 30d · Expires; **Create key** (apikey dialog: name, principal, grants, expiry; the secret is shown once), **Rotate** (rotatekey dialog), **Revoke** (revokekey dialog).
- **Surfaces this reaches** — the API, MCP, the CLI and the UI share one contract; a key’s grants apply to all four.

**Dialogs this page opens:** `apikey`, `rotatekey`, `revokekey`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Skills · Steering · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| API keys | `APIKEYS` | `iam.credentials` | `auth.api_keys`; `api.key.{create,revoke,rotate}` | ✅ |
| Actions 30d | fixture | `audit.audit_events` by principal | ClickHouse `audit_events` | 🟡 |

## Functionality

- A key is bound to a service principal with explicit grants; create, rotate and revoke are governed actions with audit records.
- The route pins the tab so a link lands on the keys, not on People.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — Same as Organization: “This organization has no workspaces”.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Organization could not be loaded” — `503 control_plane_unavailable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this organization’s settings” — the roles the signed-in person holds on the organization do not include `org.admin — members, funding, and the data plane are owner-only`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Skills, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `org.admin`
- Writes (each a governed action recorded in Audit): `api.key.create`, `api.key.rotate`, `api.key.revoke`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
