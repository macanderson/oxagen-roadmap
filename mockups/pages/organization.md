# Organization

| | |
|---|---|
| Route | `#/a-intel[/<tab>]` |
| Scope | organization |
| Spec | §14; Appendix F page 8 |
| Design | `mockups/src/engine.js` → `pOrganization()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / … / organization`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `organization.audit-prompt.md` |

## Job

People, roles, invitations, workspaces with their governance mode, the model key, funding and routes, the data plane, and API keys: the tenant's administration in one page.

## What is on the page

**Header**: eyebrow "Organization", h1 "<organization name>", and no subtext. What the tabs hold is in the component help (`mockups/help/organization.md`, Page header).
Actions: **Edit avatar** (opens `avatar` for the organization), **Invite** (opens `invite`), **Create a workspace** (gold; opens `newws`).

**Tabs**: People (N), Roles (N), Invitations (N), Workspaces (N), Cost centers (N), Model funding and routes, Data plane, API keys. `/api-keys` and `/roles` are routes of their own (see `organization-api-keys.md`, `organization-roles.md`).

- **People**: panel "People" with the badge "two-factor required" and **Invite**; a search box over every column; filters Status (active, invited), Two-factor (TOTP, hardware key, passkey, passkey + TOTP), Role (`org.owner`, `org.billing`, `org.auditor`, `workspace.owner`, `workspace.member`), Rows; columns Person (name and email), Role (the role id alone; its workspace is in Workspaces), Workspaces, Two-factor, Last seen, Status (an invited person's chip is neutral, an active one's green); every named column sorts from its header; per row **Open** (opens `member`), **Change role** (opens `role`), **Remove** (opens `removemember`). The panel has no note: that a role change is recorded in Audit is in the component help (People). Last seen is never later than the mock's current time (2026-09-11 09:14). Nothing sits beneath the panel. The Roles tab holds the holder count of every role.
- **Roles**: Role (id and description), Kind, Scope, Permissions, Held by, Origin (built-in, or who created it and when); **Create role** (small, not gold), per row **View** and **Duplicate** for a built-in role, or **Edit**, **Duplicate** and **Delete** (disabled while anyone holds it) for a custom one; Held by reads "Not assigned" when nobody holds the role; the role editor `roleedit` over `PERMS`; `roledel`. Filters Kind, Scope, Origin.
- **Invitations**: panel "Pending invitations" with **Invite**; Email, Role offered, Invited by, Sent, Expires; per row **Resend**, **Revoke**.
- **Workspaces**: Workspace (name and slug), Main repo, Production branch, Linked repos, Agents, Owner, Governance (a chip with the workspace's mode `solo`, `team` or `regulated`, read off the workspace, with retention mode and namespace beneath); per row **Open**, **Edit** (opens `editws`), **Edit avatar** (opens `avatar` for the workspace), **Archive** (opens `archivews`); **Create a workspace**. The panel has no note: that changing main is an org-owner action with approval is in the component help (Workspaces).
- **Cost centers** (`orgCostCenters()`): panel "Cost centers" with **Add a cost center** (opens `ccadd`). The panel has no lead line: how spend is charged to a label is in the component help (Cost centers). Columns: Label (mono), Description ("No description" when it has none), Agents, Workspaces, Added (the date and who added it); per row **Delete** (red; opens `ccdel`). Agents and Workspaces count the agents and workspaces that name the label today. With no labels the panel reads "This organization has no cost centers." A second panel, "Workspace cost centers", lists every workspace with its label ("None" when it has none) and its agent count, and per row **Change** (opens `ccws`), and no note beneath it (the agent-label rule is in the component help, Workspace cost centers). A viewer without an organization Owner, Admin or Billing role sees the note "You can read this list. Changing it takes an organization Owner, Admin or Billing role, which <holders> hold." above the table.
- **Model funding and routes**: **Funding source** first, in one of three states. On a customer key: Key (the saved prefix), Billing ("tokens billed at zero"), Key storage ("enveloped"), Engine, a password field for the key, and **Test and save**. On a platform-minted key: Secret, Provisioned id, Name on the account, Minted, Monthly cap, Reads, Engine, with **Rotate** and **Revoke**, and beneath them the Reconciliation block (OpenRouter reports, Our credit ledger, Difference). With no key: a note that the in-app agent cannot run and nothing has been charged, and **Mint a key for <organization name>**. Every state carries the **Source** select, with no hint under it. The panel has no note on the resolver; that and each source's terms are in the component help (Funding source, Reconciliation). Then **Model routes** for Oxagen's own work: Tier, Provider, Route, Fallback, Use, Cost, **Edit** (opens `editroute`), and a Total row with the basis "reported by harness" (`client_attested`). No badge sits in its header and no note beneath it: the alias rule is in the component help (Model routes).
- **Data plane**: a segmented control Shared, Dedicated, Behind the firewall (the current one marked); a preview note when another mode is shown ("Preview. Nothing below is in effect for <organization name>."); no paragraph describes the mode; the mode's facts, each a value with no rationale (shared: Binding, Database, Object storage, Key-encryption key, Attester key, Gateway; dedicated: Tenant data, Identity and billing, Object storage, Key-encryption key, Gateway; firewall: Deployment, Bundle version, Bundle signature, Containers, Air-gapped mode, Licence, Next bundle, and the Outbound connections table); **Request a change of plane** (opens `plane`), **Rotate keys** (opens `rotatekek`, which lands on Audit › Keys). **Retention**: Frame bodies, Run ledger, Frame rows, Control-plane audit, `digest_only` mode. **Tenant isolation**: Rows, Workspace scoping, Cross-tenant reads, Platform catalogs, Startup guard.
- **API keys**: as `organization-api-keys.md`.

**Dialogs this page opens:** `avatar`, `invite`, `member`, `role`, `removemember`, `newws`, `editws`, `archivews`, `ccadd`, `ccdel`, `ccws`, `roleedit`, `roledel`, `editroute`, `funding`, `mintkey`, `rotateorgkey`, `revokeorgkey`, `plane`, `apikey`, `rotatekey`, `revokekey`.

The **Edit workspace** dialog (`editws`) has Name, Main repository (read-only, changing it is an org-owner action with approval), Production branch, **Governance mode** (select `wsGov`: `solo`, `team`, `regulated`, each with its one-line meaning; written to `.oxagen/rules/governance.toml` through a pull request and in effect on merge), Namespace (immutable), Retention mode (`content_exact`, `digest_only`), and the facts Toolbelt limit, Default budget, Agents; **Cancel**, **Save**. The **Create a workspace** dialog (`newws`) has Name, Namespace, Main repository, Production branch, Governance mode, Retention mode; **Create**.

The **avatar editor** (`avatar`) is the one editor `agent.md` specifies, the same dialog Account and the agent page open. Both records here draw as squircles. For the organization it is titled “Avatar for <organization name>” with the slug under it, and no note. For a workspace it is titled “Avatar for <workspace name>” with the slug under it, and no note. The capability each one saves with (`update_org_settings`, `update_workspace_settings`) is in the component help (`mockups/help/shell.md`, Avatar editor). With nothing stored, the draft opens on the name's initials. Save closes the dialog and shows the receipt “The avatar for <name> was saved. Recorded in the audit record.” The app offers Edit avatar on live workspace rows only, because `update_workspace_settings` refuses an archived workspace. Nothing yet draws a saved organization or workspace avatar outside the editor. The switchers keep their letter tiles.

**Shell.** Sidebar (organization switcher, workspace switcher, Workspace nav: Work, Agents, Tools, Steering, Runtimes, Spend, Repositories; Organization nav: Organization, Billing, Audit; the assistant launcher, agent count, data plane and connection badge at the foot), top bar (Menu, breadcrumbs, ⌘K "Search or run an action", Notifications with the unread count, **Approvals** with the count of everything waiting on you across the organization, account avatar → Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out). The Approvals button opens the right-hand drawer `#apdrawer`: heading "Approvals" with an "N waiting on you in all workspaces" badge and a close button, an open question row with **Answer**, one row per pending approval (tool and amount, agent, task, workspace, risk badges, countdown), the full approval card with **Approve** and **Deny** when a row is picked and "‹ All approvals" to return, "N resolved today" beneath. Escape closes it. There is no assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Members, invitations | `MEMBERS`, `INVITES` | `org.org_users` | `org.org_users`, `org.invitations`; `org.member.*` | ✅ |
| Workspaces | `WS` | `wrk.workspaces` | `workspace.workspaces`; `workspace.*` | ✅ |
| Organization avatar | `ORG.avatar` | `update_org_settings` `avatarUrl`; read from `list_workspaces` `organization.avatarUrl` | `org.settings.write.ts` (the shared `avatarUrlSchema`), `workspace.list.ts` (macanderson/oxagen#4280) | ✅ |
| Workspace avatar | `WS[].avatar` | `update_workspace_settings` `avatarUrl`; read from each `list_workspaces` row's `avatarUrl` | `workspace.settings.write.ts`, `workspace.list.ts` (macanderson/oxagen#4280) | ✅ |
| Governance mode | `WS[].governance` (`wsGov`) | `.oxagen/rules/governance.toml` on the main repo, read on PR open and on merge | none | ❌ |
| Roles, permissions | `ROLES`, `PERMS` | `iam.roles` | `iam.roles`; `iam.role.list` | ✅ (editor writes 🟡; `PERMS` is mockup-only until a spec decision) |
| Funding source and model routes | `ORG_KEY`, `ORG_ROUTES` | `org.organizations.funding_source/model_routes`, `org.model_credentials` | `org.model_credentials`, `workspace.routing_policy` | 🟡 |
| Cost centers | `FIXTURES.COST_CENTERS` (`centers`, `workspaces`, `agents`) as `CC` | `cost.cost_centers`; `cost_center` on the workspace and on the agent | `cost.cost_centers`, `workspace.workspaces.cost_center`, `agent.agents.cost_center`; `list_cost_centers`, `create_cost_center`, `set_cost_center`, `delete_cost_center` (ADR-142) | ✅ |
| Data plane | plane tab | `org.data_planes` | same; `org.data_plane` | ✅ |
| API keys | `APIKEYS` | `iam.credentials` | `auth.api_keys`; `api.key.{create,revoke,rotate}` | ✅ |

## Functionality

- Changing a role is a governed action: it passes IAM and writes an audit record. Membership writes are free; `resolve_approval` is the only billable action (2026-09-15, maintainer decision).
- **Create a workspace** opens an in-app form that calls `create_workspace`. It ships in rev1 with the fix for `macanderson/oxagen#3029`, where the org-only `create_workspace` REST mount fails before its handler (2026-09-15, maintainer decision).
- The governance mode is a workspace setting (`solo`, `team`, `regulated`). The Workspaces table reads it off the workspace; the Edit workspace and Create a workspace dialogs set it; saving a change opens a pull request that writes `.oxagen/rules/governance.toml` on the main repo. Raising the mode takes effect on everything in flight; lowering it is an org-owner action with approval, recorded as a security event.
- API key rotation ships in rev1: **Rotate** opens `rotatekey` and calls `rotate_api_key` (2026-09-15, maintainer decision).
- No control on this page is gated on the enterprise license; custom roles in the role editor are on for every tier (2026-09-15, maintainer decision).
- A workspace owns one main repo, one steering set, its agents, tool grants and budgets; a workspace without a main repo cannot exist (it is *provisional*). Archiving needs zero registered agents.
- The model key and routes cover Oxagen's own model work (reflection, promotion rationale, classifiers, run names); the customer's agents pay their own providers. The routes' month-to-date total is the same record Spend's By model table reads.
- Rotate keys on the data plane is a KEK rotation and lands on Audit › Keys.
- A cost center is a label that spend is charged back to (ADR-142). An agent's own label wins over its workspace's. Spend with neither lands on Spend's `~none` row.
- **Add a cost center** (`ccadd`: Label, Description, **Cancel**, **Add** in gold) checks the label against `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$` and refuses a duplicate, each with its error under the field. Adding a label you deleted earlier restores it with its description. Adding writes `cost_center_created` to Audit and toasts "Added <label>. Charge a workspace or an agent to it and their next runs roll up there."
- **Delete** (`ccdel`) names how many agents and workspaces name the label today ("3 agents and 0 workspaces name ENG-1040 today."). Runs already rolled up keep the label, and Spend marks it `deleted`. New runs from those agents and workspaces fall back to the workspace's label, or to none. Deleting writes `cost_center_deleted` to Audit.
- **Change** on a workspace (`ccws`, a Cost center select with None first) writes `cost_center_set` to Audit. Runs rolled up after the change land on the new label, except an agent's that names its own.
- Every cost center write needs an organization Owner, Admin or Billing role. For anyone else, **Add a cost center**, **Delete** and **Change** open no dialog and show a toast that names who holds the role (`ccDenied()`).

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: "This organization has no workspaces". A workspace owns one main repo, one steering set, a set of agents, tool grants, and budgets. A workspace without a main repo cannot exist. Action: **Create a workspace** (gold).
- **loading**: the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so you keep your bearings.
- **error**: "Organization could not be loaded". The control plane answered `503 control_plane_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied**: "You cannot see this organization's settings". Your roles on the organization do not include `org.admin`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it. Actions: **Request access** (opens `request-access`), **Back to Work**. Below: *Signed in as* (name, role), *Needed* (the permission), *Decided by* (`pol_v41`, deny wins over every allow).

## Mobile

The top bar collapses to hamburger, current crumb, search glyph, notifications, approvals and avatar. A fixed five-slot thumb bar replaces the sidebar: **Work** (count = work waiting on you), **Agents**, **Tools**, **Spend**, **More** (count = open critical incidents). **More** is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace. The hamburger opens the full sidebar as a drawer over a scrim. The approvals drawer opens full-width. Every dialog rises from the bottom edge as a sheet with a drag handle and full-width footer buttons; every list table becomes a stack of cards, each cell labelled with its column header; touch targets are at least 44 px; inputs are 16 px; nothing scrolls sideways.

## Permissions

- Read: `org.admin (owner)`
- Writes (each a governed action recorded in Audit): `org.member.invite / change role / remove`, `workspace.create / edit / archive` (a governance change opens a pull request), the organization's avatar (`update_org_settings`) and a workspace's (`update_workspace_settings`), `cost_center.create / delete / set` (an organization Owner, Admin or Billing member; everyone else reads the list, and a write they try is refused with a toast that names who holds the role), `iam.role.create / edit / delete`, `org.funding.set`, `org.route.set`, `org.model_key.mint / rotate / revoke`, `api.key.create / rotate / revoke`, `org.data_plane.request`

## Backend gaps this page depends on

- role editor writes
- funding and routes are hard-coded
- governance mode has no store; it is a file on the main repo written by a pull request

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a figure the harness reported is labeled as such and is never rendered as observed.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
