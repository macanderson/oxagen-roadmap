# Audit prompt — Organization

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Organization** page of Oxagen Mission Control (`#/a-intel[/<tab>]`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/organization.md` (read it first, in full).
2. The design, rendered: `pages/organization-<state>.html` and `pages/organization-<state>-mobile.html` for each state (loaded, empty, loading, error, access denied); open them in a browser or with Playwright. `pages/index.html` links all of them.
3. The product spec for context: `docs/2026-09-11-oxagen-mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/2026-09-12-mission-control-app-implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel[/<tab>]`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar, breadcrumbs, ⌘K search, notifications, assistant and account are present and match the spec’s shell; the breadcrumb ends on this page. The document title names the page.
2. **Header.** Eyebrow “Organization”, h1 “<organization name>”. Actions present, in order, with the same labels: Invite · Create a workspace. Exactly one gold (primary) action on the screen.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Sections, tabs and tables.** For each item below, the build has it, with the same tab labels (and live counts where the design shows them), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Tabs: People (N) · Roles (N) · Invitations (N) · Workspaces (N) · Model funding and routes · Data plane · API keys. `/api-keys` and `/roles` are routes of their own (see `organization-api-keys.md`, `organization-roles.md`).
   - People — Single sign-on (Provider · Status · Entity id · Metadata · Signing certificate · Break-glass · Last sign-in; Edit), SCIM provisioning (Protocol · Endpoint · Token · In scope · Group → role · Deprovision; Edit mappings), People table: Person · Role · Workspaces · Two-factor · SSO · Last seen · Status (Open, Change role → role dialog, Remove → remove-member dialog), The delegation ceiling, Roles in use (Manage roles).
   - Roles — Role · Kind · Scope · Permissions · Held by · Origin (Create role, View, Duplicate, Delete, Edit — the role editor over `PERMS`).
   - Invitations — Email · Role offered · Invited by · Sent · Expires (Resend, Revoke).
   - Workspaces — Workspace · Main repo · Production branch · Linked repos · Agents · Owner · Governance (Open, Edit → editws, Archive → archivews).
   - Model funding and routes — Model routes (Oxagen’s own work only): Tier · Provider · Route · Fallback · Use · Cost (Edit); In-firewall routes: Tier · Endpoint · Dialect · Model served inside the network; Funding source (Current · Cap · Key storage · “No call reads the environment”; Change funding source → funding dialog).
   - Data plane — Shared (current) · Dedicated · Behind the firewall; Binding · Neo4j · Postgres · Object storage · Key-encryption key · Attester key · Witness runner · Frame bodies · Run ledger · Frame nodes in the graph · Control-plane audit · `digest_only` mode · Erasure; Retention; Graph isolation (Database · Workspace scoping · Cross-tenant reads · Platform catalogs · Startup guard); Request a change of plane, Rotate keys.
   - API keys — Name · Principal · Grants · Created by · Last used · Actions 30d · Expires (Create key → apikey, Rotate → rotatekey, Revoke → revokekey); Surfaces this reaches.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`invite`, `member`, `role`, `removemember`, `newws`, `editws`, `archivews`, `funding`, `apikey`, `rotatekey`, `revokekey`), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`organization-empty.html`): “This organization has no workspaces” — a workspace without a main repo cannot exist. Action: Create a workspace.
   - **loading** (`organization-loading.html`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`organization-error.html`): “Organization could not be loaded” — `503 control_plane_unavailable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: Try again, Open an incident; a trace id, region and timestamp line.
   - **access denied** (`organization-denied.html`): “You cannot see this organization’s settings” — the roles the signed-in person holds on the organization do not include `org.admin — members, funding, and the data plane are owner-only`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: Request access (opens the request-access dialog), Back to Fleet. Below: *Signed in as* (name · role)
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
8. **Trust language.** Every tier, replay grade, attestation and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (e.g. “gateway” for a client-attested window). Money always carries its basis.
9. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px. Compare against `pages/organization-loaded-mobile.html`.
10. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; icon buttons have `aria-label`; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
11. **Permissions.** Read requires `org.admin (owner)`; each write (org.member.invite / change role / remove; workspace.create / edit / archive; org.funding.set; org.route.set; api.key.create / rotate / revoke; org.data_plane.request) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
12. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Organization — audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong> — <where> — <what the design shows> — <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected NotBacked, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption — open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
