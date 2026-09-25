# Organization: Roles

| | |
|---|---|
| Route | `#/a-intel/roles` |
| Scope | organization |
| Spec | §14; Appendix F page 8 |
| Design | `mockups/src/engine.js` → `pOrganization()` with `S.tab.organization="roles"` (`rolesBody`, `roleEditDlg`, `roleDelDlg`), built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / … / organization-roles`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `organization-roles.audit-prompt.md` |

## Job

The organization page opened on its Roles tab: every role, its kind and scope, the permissions it carries, who holds it and where it came from; the role editor.

## What is on the page

**Header**: eyebrow "Organization", h1 "<organization name>", subtext "People, roles, workspaces, model routes, the data plane, and API keys." Breadcrumb: <organization> / Organization.
Actions: **Invite** (opens `invite`), **Create a workspace** (gold; opens `newws`).

**Tabs**: the seven Organization tabs, with **Roles** selected.

- **Roles**: panel "Roles" with the badge "postgres · iam" and **Create role** (small, gold; opens `roleedit` empty); filters Kind (agent, human, service), Scope (organization, repository, workspace), Origin (built-in, or creator and date), Rows; columns Role (id and description), Kind, Scope, Permissions (chips, "+N more" past four), Held by ("N people", "N agents", "N keys", or "Not assigned"), Origin ("built-in", or who created it and when); per row **View** (built-in) or **Edit** (opens `roleedit`), **Duplicate** (opens `roleedit` as a copy), and for a custom role only **Delete** (opens `roledel`; disabled while anyone holds it, "Reassign N holders first"); a built-in role shows View and Duplicate only; the note "An agent can only do what its roles, its operator's permissions, the policy and the kill switches all allow."

**Dialogs this page opens:** `roleedit` (Role name, Description, Kind, Scope, the permission matrix over `PERMS` with a selected count, a banner naming the holders, a note that saving is a governed action; a built-in role is read-only with **Duplicate as custom**; **Create role** or **Save changes**), `roledel` (**Delete role**, disabled while anyone holds it), plus `invite` and `newws` from the header.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Work, Agents, Tools, Steering, Runtimes, Spend, Repositories; Organization nav: Organization, Billing, Audit; the assistant launcher, agent count, data plane and connection badge at the foot), top bar (Menu, breadcrumbs, ⌘K "Search or run an action", Notifications with the unread count, **Approvals** with the count of everything waiting on you across the organization, account avatar → Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). The Approvals button opens the right-hand drawer `#apdrawer`: heading "Approvals" with an "N waiting" badge and a close button, an open interjection row with **Answer it**, one row per pending approval (tool and amount, agent, task, workspace, risk badges, countdown), the full approval card with **Approve** and **Deny** when a row is picked and "‹ All approvals" to return, "N resolved today" beneath. Escape closes it. There is no assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Roles | `ROLES` | `iam.roles` | `iam.roles`; `iam.role.list` | ✅ |
| Held by | `roleAssignees` over `MEMBERS`, `AGENTS`, `APIKEYS` | `iam.roles` assignments | `iam.roles`; `org.org_users` | 🟡 |
| Permissions matrix | `PERMS` | not in App. A (mockup-only) | none | ❌ needs a spec decision |

## Functionality

- A role can never grant more than the delegation ceiling of the person assigning it. `org.*` is the only wildcard and only `org.owner` carries it.
- Built-in roles are read-only; Duplicate is the path to a custom one. Names are immutable; duplicate the role to rename it.
- Saving a role is recorded in Audit and counts as one governed action. Each holder gets the new permissions at its next call. Nothing in flight is cut.
- Deleting keeps the role's definition and every grant it carried in the audit record. You cannot delete a role while anyone holds it.
- Custom roles are on for every tier (2026-09-15, maintainer decision).

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
- Writes (each a governed action recorded in Audit): `iam.role.create / edit / delete`

## Backend gaps this page depends on

- `PERMS` permission catalogue needs a spec decision before backend work
- role editor writes

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested figure is labelled as such and is never rendered as observed.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
