# Audit prompt: Organization, Roles

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Organization: Roles** page of Oxagen (`#/a-intel/roles`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/organization-roles.md` (read it first, in full).
2. The design, rendered: the `organization-roles` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), Appendix A (target tables), Appendix E (contracts), Appendix F (the pages that survive); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/roles`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with the Roles tab selected; the sidebar (Fleet, Agents, Tools, Steering, Runtimes, Repositories, Spend; Organization, Billing, Audit), breadcrumbs, ⌘K search, notifications and account are present and match the spec's shell; the breadcrumb reads <organization> / Organization; the document title names the page. The top bar has an **Approvals** button left of the avatar whose count is pending approvals plus open interjections across the organization; it opens the right-hand drawer (`#apdrawer`, `role=complementary`, labelled "Approvals") listing them; picking one shows the full approval card with Approve and Deny; Escape closes it. There is no assistant button in the top bar.
2. **Header.** Eyebrow "Organization", h1 "<organization name>", subtext "People, roles, workspaces, model routes, the data plane, and API keys." Actions present, in order, with the same labels: Invite, Create a workspace. Exactly one gold (primary) action in the header; the small gold Create role inside the panel is the tab's own action.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Sections, tabs and tables.** For each item below, the build has it, with the same tab labels, the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - The seven Organization tabs, with Roles selected.
   - Roles: the badge "postgres · iam", Create role, the filters Kind, Scope, Origin; Role, Kind, Scope, Permissions, Held by, Origin; View and Duplicate on a built-in role; Edit, Duplicate and Delete (with the disabled reason) on a custom role; the note.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`roleedit` for View, Edit, Duplicate and Create role; `roledel` for Delete; `invite`, `newws`), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. The editor shows the permission matrix over `PERMS`, the selected count, the holders banner, read-only for a built-in role with Duplicate as custom. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest "not recorded yet", never a zero) for the rest; ❌ rows must render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): same as Organization, "This organization has no workspaces". Action: Create a workspace.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): "Organization could not be loaded", `503 control_plane_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: Try again, Open an incident; a trace id, region and timestamp line.
   - **access denied** (`state=denied`): "You cannot see this organization's settings"; the roles the signed-in person holds do not include `org.admin` (members, funding, and the data plane are owner-only); an owner can grant it and the grant is a governed action in the audit record. Actions: Request access, Back to Fleet. Below: Signed in as, Needed, Decided by.
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
8. **Trust language.** A role's permissions render exactly as stored; the note states the rule in words: an agent can only do what its roles, its operator's permissions, the policy and the kill switches all allow. No math notation. Nothing on the page says proven, verdict, score, witness or definition of done.
9. **Figures reconcile.** Held by counts equal the People table, the agents holding the role, and the keys holding it; the tab count equals the rows; the editor's selected count equals the checked boxes. A figure typed by hand is a FAIL.
10. **Headings and labels.** No heading on the built page carries a comma, a mid-dot or a not/never contrast; subtext under a heading is one sentence or nothing. Labels match the spec verbatim.
11. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet; the approvals drawer opens full-width; every dialog is a bottom sheet with full-width footer buttons; the roles table renders as labelled cards; the page never scrolls sideways; every tap target is at least 44 px; inputs are 16 px. Compare against the mobile story (`mobile=1`).
12. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; the drawer is `role=complementary` and inert when closed; the permission matrix is real checkboxes with labels; icon buttons have `aria-label`; state is never colour alone (dot and word); focus is visible; the page is operable by keyboard end to end.
13. **Permissions.** Read requires `org.admin`; each write (`iam.role.create / edit / delete`) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
14. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Organization, Roles: audit {{DATE}}
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
