# Organization

| | |
|---|---|
| Route | `#/a-intel[/<tab>]` |
| Scope | organization |
| Spec | §14 Mission Control; Appendix F page 8 |
| Design | `mc.html` → `pOrganization()` (the single source; `consolidated.html` is the product build of it) |
| States | loaded · empty · loading · error · access denied |
| Files | `organization-loaded.html` / `organization-loaded-mobile.html`, `organization-empty.html` / `organization-empty-mobile.html`, `organization-loading.html` / `organization-loading-mobile.html`, `organization-error.html` / `organization-error-mobile.html`, `organization-denied.html` / `organization-denied-mobile.html` |
| Audit | `organization.audit-prompt.md` |

## Job

People, roles, invitations, SSO and SCIM, workspaces, model funding and routes, the data plane, and API keys — the tenant’s administration in one page.

## What is on the page

**Header** — eyebrow “Organization”, h1 “<organization name>”.
Actions: **Invite** (opens the invite dialog) · **Create a workspace** (gold; opens the new-workspace dialog)

- **Tabs**: People (N) · Roles (N) · Invitations (N) · Workspaces (N) · Model funding and routes · Data plane · API keys. `/api-keys` and `/roles` are routes of their own (see `organization-api-keys.md`, `organization-roles.md`).
- **People** — Single sign-on (Provider · Status · Entity id · Metadata · Signing certificate · Break-glass · Last sign-in; **Edit**), SCIM provisioning (Protocol · Endpoint · Token · In scope · Group → role · Deprovision; **Edit mappings**), People table: Person · Role · Workspaces · Two-factor · SSO · Last seen · Status (**Open**, **Change role** → role dialog, **Remove** → remove-member dialog), The delegation ceiling, Roles in use (**Manage roles**).
- **Roles** — Role · Kind · Scope · Permissions · Held by · Origin (**Create role**, **View**, **Duplicate**, **Delete**, **Edit** — the role editor over `PERMS`).
- **Invitations** — Email · Role offered · Invited by · Sent · Expires (**Resend**, **Revoke**).
- **Workspaces** — Workspace · Main repo · Production branch · Linked repos · Agents · Owner · Governance (**Open**, **Edit** → editws, **Archive** → archivews).
- **Model funding and routes** — Model routes (Oxagen’s own work only): Tier · Provider · Route · Fallback · Use · Cost (**Edit**); In-firewall routes: Tier · Endpoint · Dialect · Model served inside the network; Funding source (Current · Cap · Key storage · “No call reads the environment”; **Change funding source** → funding dialog).
- **Data plane** — Shared (current) · Dedicated · Behind the firewall; Binding · Neo4j · Postgres · Object storage · Key-encryption key · Attester key · Witness runner · Frame bodies · Run ledger · Frame nodes in the graph · Control-plane audit · `digest_only` mode · Erasure; Retention; Graph isolation (Database · Workspace scoping · Cross-tenant reads · Platform catalogs · Startup guard); **Request a change of plane**, **Rotate keys**.
- **API keys** — Name · Principal · Grants · Created by · Last used · Actions 30d · Expires (**Create key** → apikey, **Rotate** → rotatekey, **Revoke** → revokekey); Surfaces this reaches.

**Dialogs this page opens:** `invite`, `member`, `role`, `removemember`, `newws`, `editws`, `archivews`, `funding`, `apikey`, `rotatekey`, `revokekey`.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Fleet · Agent IAM · Tools · Skills · Steering · Spend; Organization nav: Organization · Billing · Audit; Assistant launcher; agent count · data plane · tier badge), top bar (breadcrumbs, ⌘K search-or-run, notifications with unread dot, Assistant toggle, account avatar → user menu: Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out).

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/2026-09-12-mission-control-app-implementation-plan.md` §3; the *mockup collection* column names the constant in `mc.html` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Members, invitations | `MEMBERS`, `INVITES` | `org.org_users` | `org.org_users`, `org.invitations`; `org.member.*` | ✅ |
| Workspaces | `WS` | `wrk.workspaces` | `workspace.workspaces`; `workspace.*` | ✅ |
| Roles, permissions | `ROLES`, `PERMS` | `iam.roles` | `iam.roles`; `iam.role.list` | ✅ (editor writes 🟡; `PERMS` is mockup-only until a spec decision) |
| Model funding + routes | hard-coded | `org.organizations.funding_source/model_routes` | `org.model_credentials`, `workspace.routing_policy` | 🟡 |
| Data plane | plane tab | `org.data_planes` | same; `org.data_plane` | ✅ |
| API keys | `APIKEYS` | `iam.credentials` | `auth.api_keys`; `api.key.{create,revoke,rotate}` | ✅ |
| SSO / SCIM | fixtures | Better Auth SSO + SCIM | Better Auth | 🟡 |

## Functionality

- Changing a role is a governed action: it passes IAM, writes an audit record and bills as one action — the same path the in-app agent takes.
- A workspace owns one main repo, one steering set, its agents, tool grants and budgets; a workspace without a main repo cannot exist (it is *provisional*).
- Funding source and routes cover Oxagen’s own model work (the assistant, classifiers, embeddings, rerank); the customer’s agents pay their own providers.
- Rotate keys on the data plane is a KEK rotation and lands on Audit › Keys.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty** — “This organization has no workspaces” — a workspace without a main repo cannot exist. Action: **Create a workspace**.
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “Organization could not be loaded” — `503 control_plane_unavailable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this organization’s settings” — the roles the signed-in person holds on the organization do not include `org.admin — members, funding, and the data plane are owner-only`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

Top bar collapses to hamburger · current crumb · search glyph · notifications · assistant · avatar. A fixed five-slot thumb bar replaces the sidebar: **Fleet** (count = approvals waiting), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering, Skills, Organization, Billing, Audit, Assistant, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are ≥ 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `org.admin (owner)`
- Writes (each a governed action recorded in Audit): `org.member.invite / change role / remove`, `workspace.create / edit / archive`, `org.funding.set`, `org.route.set`, `api.key.create / rotate / revoke`, `org.data_plane.request`

## Backend gaps this page depends on

- role editor writes
- funding and routes are hard-coded
- SSO/SCIM configuration surface

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
