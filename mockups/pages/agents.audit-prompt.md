# Audit prompt: Agents

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Agents** page of Oxagen (`#/a-intel/core-platform/agents`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/agents.md` (read it first, in full). Read `docs/agent-ontology-ia.md` after it for the object model and the words the page must use.
2. The design, rendered: the `agents` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The checker is `node tools/check-mockup.mjs`.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), §12.6 (token classes), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/agents`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar (Workspace: Fleet, Agents, Tools, Steering, Runtimes, Repositories, Spend; Organization: Organization, Billing, Audit; the assistant launcher at the foot), breadcrumbs, ⌘K search, notifications, the approvals button, and account are present and match the spec’s shell; the breadcrumb ends on this page. The nav word is **Agents**, and nothing on the page or in the nav says “Agent IAM” or “Identities” as the name of the registry. Runtimes is a nav item and resolves. No assistant button in the top bar. The document title names the page.
2. **Header.** Eyebrow is the workspace name, h1 “Agents”, subtext “Every actor in this workspace and what it is made of.” Actions present, in order, with the same labels: New agent · Register an agent · Wrap Claude Code. Exactly one gold (primary) action on the screen, Wrap Claude Code.
3. **Summary tiles.** 4 tiles: Agents here · Enrolled · Holding a mandate · Tamper incidents. Each shows one number and one basis line; each number is a rollup of the records it names (recompute it and compare, and check the scope the basis line claims: the first two are the workspace, the last two are the organization). No score tile, no proven tile.
4. **The column-set toggle.** The panel header carries a two-button group labelled Columns with **Composition** and **Operations**, each carrying `aria-pressed`, exactly one pressed. Composition is the default on a fresh load. Switching changes which columns render and never which agents are listed. The panel subtext follows the toggle: “Each row names the reusable objects this agent holds a reference to.” on Composition, “Each row is what this agent did and what it cost over the last 30 days.” on Operations. No number that one set shows contradicts the other.
5. **Sections and tables.** For each item below, the build has it, with the same panel headings and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Registered in <workspace> panel: header shows `.oxagen/agents/ @ <commit>`.
   - **Composition** columns: Agent · Purpose · Owner · Steering · Toolbelt · Runtime · Principal · Health · Activity · action. Steering reads “N items” over “N tok”, with “· not delivered” on an agent that earns no hook. Toolbelt reads “N belts” over “N tools · full|searchable”. Runtime reads the host over “<kind> · <tier>”. Principal reads `prn_…` or `prn_pending`. Health is one of `healthy`, `observe`, `not enrolled`, `tamper`, and the verdict matches the rule in the spec (an open incident wins, then no enrollment, then the observe tier).
   - **Operations** columns: Agent · Harness · Operator · Status · Tier · Belt · Runs 30d · Spend 30d · Tokens 30d · Mandates · Incidents · action. The Agent cell is the agent card with no score; the Tier cell is one ladder word; Tokens 30d shows the total with “N% cached” beneath. No Proven 30d column, no trust or spend score.
   - Per-row in both sets: Edit (the agent page), Roles (assign-role dialog), Deregister (danger; the deregister dialog, which is a pull request removing the file). Clicking a row opens the agent page.
   - List controls: search, sortable headers with `aria-sort`, up to three facets derived from the columns in view, Rows (5, 10, 25, 50, All), and a pager. The facets change with the column set; a facet naming a column that is not in view is a FAIL.
   - The panel footer note is verbatim: “An agent has one principal and runs on one runtime. Its steering, its toolbelts and its tools are workspace objects it refers to, so changing one changes every agent that refers to it.”
6. **Composition names, it does not restate.** Each Composition cell names the reusable object and adds no fact the registry that owns it owns; the row opens the agent, where the Composition panel carries the link out to Tools, Steering, or Runtimes. No tier-ladder panel on this page; the ladder belongs on the agent Runtime tab.
7. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`register` (the dialog), Wrap Claude Code (the Register Agent gate at `#/a-intel/core-platform/register`, not a dialog), `wz` (the agent wizard: describe → identity → definition → toolbelt → pull request), `assignrole`, `delagent`, `request-access` from denied, `incident` from error), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
8. **Approvals button and drawer.** The topbar button is left of the avatar with aria-label “Approvals, N waiting”; it opens `#apdrawer`; Escape closes it; a row selected shows the full card with Approve and Deny.
9. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the gap named. Toolbelt assignments and mandates are ❌ today, so a belt count or a mandate badge invented client-side is a FAIL. A fixture reaching production is a FAIL.
10. **States.** Force each state and compare copy and controls with the design file:
    - **empty** (`state=empty`): “No agent registered in <workspace>”; identity lives in Postgres, definition in `.oxagen/agents/`; registering opens a Context PR. Actions: Wrap Claude Code, Register an agent.
    - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
    - **error** (`state=error`): “Agents could not be loaded”; `503 iam_principals_unavailable`; nothing was changed; runs kept recording; frames are written by the collector on each host. Actions: Try again, Open an incident; a trace id, region, and timestamp line.
    - **access denied** (`state=denied`): “You cannot see the agents in this workspace”; the missing permission `agent.read on core-platform`; an owner can grant it and the grant is a governed action. Actions: Request access, Back to Fleet. Below: Signed in as, Needed, Decided by (`pol_v41` · deny wins over every allow).
    Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
11. **Trust language.** Every tier, replay grade, attestation, health verdict, and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (`observe`, `harness`, `gateway`, and `contained` are each shown only where recorded; only `contained` is described as enforced; nothing says proven, score, or percentile). Money always carries its basis.
12. **Token figures and counts.** Each row’s Tokens 30d equals the same agent’s 30-day token use panel on its agent page, and its “N% cached” equals that panel’s cache hit rate. The Incidents column, the Health cell, and the Tamper incidents tile read the same incident record the Audit page reads, and the numbers agree. A constant or a typed figure is a FAIL.
13. **Words and headings.** The page uses Agent (not IAM record or identity as the name of an actor), Principal (not service account), Toolbelt (not toolset), Runtime (not enrollment as the name of a place), and Assignment (not binding). No heading carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence.
14. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet listing Steering, Runtimes, Repositories, Organization, Billing, and Audit; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the column-set toggle stays on one row; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px.
15. **Accessibility, permissions, and nothing extra.** Dialogs are `role=dialog aria-modal` with a labelled close; the Columns group is `role=group` with an `aria-label` and `aria-pressed` on both buttons; sortable headers carry `aria-sort`; icon buttons have `aria-label`; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end. Read requires `agent.read`; each write (`agent.register`, `agent.role.assign`, `agent.deregister`) is gated server-side, not only hidden in the UI, verified with a role that lacks the permission. Then list anything on the built page that is not in the spec (tiles, columns, buttons, copy); each is a finding and the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Agents audit {{DATE}}
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

Rules: never mark PASS on an assumption; open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
