# Audit prompt: Agent IAM

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Agent IAM** page of Oxagen (`#/a-intel/core-platform/agents`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/agents.md` (read it first, in full).
2. The design, rendered: the `agents` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The checker is `node tools/check-mockup.mjs`.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), §12.6 (token classes), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/agents`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar (Workspace: Fleet, Agent IAM, Tools, Steering, Repositories, Spend; Organization: Organization, Billing, Audit; the assistant launcher at the foot), breadcrumbs, ⌘K search, notifications, the approvals button, and account are present and match the spec’s shell; the breadcrumb ends on this page. No assistant button in the top bar. The document title names the page.
2. **Header.** Eyebrow is the workspace name, h1 “Identities”, subtext “Identity in Postgres, definition in git.” Actions present, in order, with the same labels: New agent · Register an agent · Wrap Claude Code. Exactly one gold (primary) action on the screen, Wrap Claude Code.
3. **Summary tiles.** 4 tiles: Identities here · Enrolled · Holding a mandate · Tamper incidents. Each shows one number and one basis line; each number is a rollup of the records it names (recompute it and compare). No score tile, no proven tile.
4. **Sections, tabs, and tables.** For each item below, the build has it, with the same panel headings and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Registered in <workspace> panel: header shows `.oxagen/agents/ @ <commit>`. Table columns: Identity · Harness · Operator · Status · Tier · Belt · Runs 30d · Spend 30d · Tokens 30d · Mandates · Incidents · action. The Identity cell is the agent card with no score; the Tier cell is one ladder word; Tokens 30d shows the total with “N% cached” beneath. Per-row: Edit (the agent page), Roles (assign-role dialog), Deregister (danger; the deregister dialog, which is a pull request removing the file). Clicking a row opens the agent page. Search, sort, facets (Tier), rows-per-page, pager. No Proven 30d column, no trust or spend score.
   - No tier ladder panel under the table; the Tier column carries the word, and the ladder is on the agent page under Tier delivery. A ladder panel here is a finding.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`register` (gate), `wrap` (gate), `wz` (agent wizard), `assignrole`, `delagent`, `request-access` from denied, `incident` from error), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Approvals button and drawer.** The topbar button is left of the avatar with aria-label “Approvals, N waiting”; it opens `#apdrawer`; Escape closes it; a row selected shows the full card with Approve and Deny.
7. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the gap named. A fixture reaching production is a FAIL.
8. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): “No identities registered in <workspace>”; identity lives in Postgres, definition in `.oxagen/agents/`; registering opens a Context PR. Actions: Wrap Claude Code, Register an agent.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “Identities could not be loaded”; `503 iam_principals_unavailable`; nothing was changed; runs kept recording; frames are written by the collector on each host. Actions: Try again, Open an incident; a trace id, region, and timestamp line.
   - **access denied** (`state=denied`): “You cannot see the identities in this workspace”; the missing permission `agent.read on core-platform`; an owner can grant it and the grant is a governed action. Actions: Request access, Back to Fleet. Below: Signed in as, Needed, Decided by (`pol_v41` · deny wins over every allow).
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
9. **Trust language.** Every tier, replay grade, attestation, and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (`observe`, `harness`, `gateway`, and `contained` are each shown only where recorded; only `contained` is described as enforced; nothing says proven, score, or percentile). Money always carries its basis.
10. **Token figures.** Each row’s Tokens 30d equals the same agent’s 30-day token use panel on its agent page, and its “N% cached” equals that panel’s cache hit rate. A constant or a typed figure is a FAIL.
11. **Headings.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence.
12. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px.
13. **Accessibility.** Dialogs are `role=dialog aria-modal` with a labelled close; the tier ladder is an ordered list with `aria-label`; icon buttons have `aria-label`; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
14. **Permissions.** Read requires `agent.read`; each write (agent.register; agent.role.assign; agent.deregister) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
15. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Agent IAM audit {{DATE}}
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
