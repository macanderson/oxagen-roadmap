# Organization · Roles

| | |
|---|---|
| Route | `#/a-intel/roles` |
| Scope | organization |
| Spec | §14 Mission Control; Appendix F page 8 |
| Design | `mockups/src/engine.js` → `pOrganization() with `S.tab.organization="roles"``, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Mission Control / … / organization-roles`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `organization-roles.audit-prompt.md` |

## Job

The organization page opened on its Roles tab: every role, its kind and scope, the permissions it carries, who holds it and where it came from; the role editor.

## What is on the page

**Header** — eyebrow “Organization”, h1 “<organization name>”. Breadcrumb: Organization / **Roles**.
Actions: **Invite** · **Create a workspace**

- **Roles** — Role · Kind (organization / workspace) · Scope · Permissions · Held by · Origin (built-in / custom); **Create role**, per-row **View**, **Duplicate**, **Delete**, **Edit** (the role dialog: a permission matrix over `PERMS` with the delegation ceiling shown).

**Dialogs this page opens:** `role (view/edit/create/duplicate)`, `delete role`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Steering · Spend; Organization nav: Organization · Billing · Audit; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Roles | `ROLES` | `iam.roles` | `iam.roles`; `iam.role.list` | ✅ |
| Permissions matrix | `PERMS` | not in App. A (mockup-only) | none | ❌ needs a spec decision |

## Functionality

- A role can never grant more than the delegation ceiling of the person assigning it.
- Built-in roles are read-only; Duplicate is the path to a custom one.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — Same as Organization.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Organization could not be loaded” — `503 control_plane_unavailable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this organization’s settings” — the roles the signed-in person holds on the organization do not include `org.admin — members, funding, and the data plane are owner-only`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `org.admin`
- Writes (each a governed action recorded in Audit): `iam.role.create / edit / delete`

## Backend gaps this page depends on

- `PERMS` permission catalogue needs a spec decision before backend work

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
