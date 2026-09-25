# Audit prompt: Organization

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Organization** page of Oxagen (`#/a-intel[/<tab>]`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/organization.md` (read it first, in full).
2. The design, rendered: the `organization` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The other tabs are reachable from the loaded story.
3. The product spec for context: `docs/mission-control-spec.md` §14, Appendix A (target tables), Appendix E (contracts), Appendix F (the pages that survive); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel[/<tab>]`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar (Work, Agents, Tools, Steering, Runtimes, Spend, Repositories; Organization, Billing, Audit), breadcrumbs, ⌘K search, notifications and account are present and match the spec's shell; the breadcrumb ends on this page; the document title names the page. The top bar has an **Approvals** button left of the avatar whose count is pending approvals plus open interjections across the organization; it opens the right-hand drawer (`#apdrawer`, `role=complementary`, labelled "Approvals") listing them; picking one shows the full approval card with Approve and Deny; Escape closes it. There is no assistant button in the top bar.
2. **Header.** Eyebrow "Organization", h1 "<organization name>", subtext "People, roles, workspaces, model routes, the data plane, and API keys." Actions present, in order, with the same labels: Edit avatar, Invite, Create a workspace. Exactly one gold (primary) action on the screen.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Sections, tabs and tables.** For each item below, the build has it, with the same tab labels (and live counts where the design shows them), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Tabs: People (N), Roles (N), Invitations (N), Workspaces (N), Model funding and routes, Data plane, API keys; `/api-keys` and `/roles` are routes of their own.
   - People: badge "two-factor required", Invite; a search box; Status, Two-factor, and Role filters (Role lists role ids with no workspace suffix); Person, Role, Workspaces, Two-factor, Last seen, Status, each sortable from its header; Open, Change role, Remove. Fail if a Roles in use panel or a Manage roles button sits beneath the table. No Delegation ceiling panel; the ceiling is stated where it is decided, on the agent page and in the authority record.
   - Roles: Role, Kind, Scope, Permissions, Held by, Origin; Create role, View or Edit, Duplicate, Delete (disabled for built-in or held roles).
   - Invitations: "Pending invitations", Invite; Email, Role offered, Invited by, Sent, Expires; Resend, Revoke.
   - Workspaces: Workspace, Main repo, Production branch, Linked repos, Agents, Owner, Governance (a chip that reads the workspace's `solo`, `team` or `regulated`, with retention mode and namespace beneath); Open, Edit, Edit avatar, Archive, with Edit avatar on live workspaces only; Create a workspace.
   - Model funding and routes: two panels, Funding source and then Model routes. Funding source renders one of three states (a customer key with its prefix and a field to save one, a platform-minted key with its facts plus Rotate and Revoke, or no key with Mint a key) and always carries Change source. Model routes carries Tier, Provider, Route, Fallback, Use, Cost, Edit, and a Total row with basis `client_attested`. A Model key panel or an In-firewall routes panel is a FAIL; both were cut and their facts live in Funding source.
   - Data plane: the segmented control Shared, Dedicated, Behind the firewall with the current one marked and a preview note on the others; the mode's facts; Request a change of plane, Rotate keys; Retention (Frame bodies, Run ledger, Frame rows, Control-plane audit, `digest_only` mode); Tenant isolation (Rows, Workspace scoping, Cross-tenant reads, Platform catalogs, Startup guard).
   - API keys: as `organization-api-keys.md`.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`avatar`, `invite`, `member`, `role`, `removemember`, `newws`, `editws`, `archivews`, `ccadd`, `ccdel`, `ccws`, `roleedit`, `roledel`, `editroute`, `funding`, `mintkey`, `rotateorgkey`, `revokeorgkey`, `plane`, `apikey`, `rotatekey`, `revokekey`), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. The Edit workspace dialog has the Governance mode select (`wsGov`) with `solo`, `team`, `regulated`, and saving a changed mode opens a pull request on `.oxagen/rules/governance.toml`; the Create a workspace dialog has the same select. Edit avatar, in the header and on a workspace row, opens the one avatar editor that `agent.md` specifies and Account and the agent page open: titled "Avatar for <name>" with the slug under it, a squircle preview, Kind (Icon, Initials, Photo), Letters up to 6, a Photo https link, the five tones Solid, Soft, Line, Gold and Dark gold, the record's note, and Remove avatar when one is stored. Saving writes `update_org_settings` or `update_workspace_settings` with the avatar alone. A second avatar dialog built for this page, or a tone list other than those five, is a FAIL. A stub must say what the product would do; a control that silently does nothing is a FAIL. Cost centers: **Add a cost center** opens `ccadd`, which refuses a malformed label and a duplicate with the design's error under the field, and adding writes `cost_center_created` to Audit. **Delete** opens `ccdel`, whose count names the agents and workspaces that name the label, and deleting writes `cost_center_deleted`. **Change** on a workspace opens `ccws` and writes `cost_center_set`. As a viewer without an organization Owner, Admin or Billing role, the tab shows the read-only note naming who holds the role, and every write is refused with a toast and opens no dialog.
6. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest "not recorded yet", never a zero) for the rest; ❌ rows must render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): "This organization has no workspaces"; a workspace owns one main repo, one steering set, a set of agents, tool grants, and budgets; a workspace without a main repo cannot exist. Action: Create a workspace.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): "Organization could not be loaded", `503 control_plane_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: Try again, Open an incident; a trace id, region and timestamp line.
   - **access denied** (`state=denied`): "You cannot see this organization's settings"; the roles the signed-in person holds do not include `org.admin`; an owner can grant it and the grant is a governed action in the audit record. Actions: Request access, Back to Fleet. Below: Signed in as, Needed, Decided by.
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
8. **Trust language.** Every tier, attestation and cost basis on the page shows the recorded value. The ladder is `observe`, `harness`, `gateway`, `contained`, each rendered only as recorded; the routes' Total carries `client_attested`; the Gateway row of the data plane says observed only where the loopback proxy reports. Money always carries its basis. Nothing on the page says proven, verdict, score, witness or definition of done.
9. **Figures reconcile.** Recompute and compare: every tab count equals the rows of its table; each human role's people count under Held by on the Roles tab equals the People rows left when you filter Role to that role; the Model routes Total equals the sum of its rows and the Cap's "used" figure; the Model key Difference equals OpenRouter reports minus Our credit ledger. A figure typed by hand is a FAIL. On Cost centers, each label's Agents count equals the agents that name it on their Identity tab, each Workspaces count equals the rows of Workspace cost centers that name it, and the tab count equals the label rows.
10. **Headings and labels.** No heading on the built page carries a comma, a mid-dot or a not/never contrast; subtext under a heading is one sentence or nothing. Labels match the spec verbatim.
11. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Work/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet; the approvals drawer opens full-width; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is at least 44 px; inputs are 16 px. Compare against the mobile story (`mobile=1`).
12. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; the data plane segmented control is `role=group` with `aria-pressed`; dialogs are `role=dialog aria-modal` with a labelled close; the drawer is `role=complementary` and inert when closed; icon buttons have `aria-label`; state is never colour alone (dot and word); focus is visible; the page is operable by keyboard end to end.
13. **Permissions.** Read requires `org.admin (owner)`; each write (`org.member.invite / change role / remove`; `workspace.create / edit / archive`; `update_org_settings` and `update_workspace_settings` for an avatar; `iam.role.create / edit / delete`; `org.funding.set`; `org.route.set`; `org.model_key.mint / rotate / revoke`; `api.key.create / rotate / revoke`; `org.data_plane.request`) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
14. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Organization: audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected NotBacked, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption; open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
