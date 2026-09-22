# Audit prompt: Fleet

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Fleet** page of Oxagen (`#/a-intel/core-platform`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/fleet.md` (read it first, in full).
2. The design, rendered: the `fleet` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The checker is `node tools/check-mockup.mjs`.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), §12.6 (token classes), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar (Workspace: Fleet, Agents, Tools, Steering, Runtimes, Repositories, Spend; Organization: Organization, Billing, Audit; the assistant launcher at the foot), breadcrumbs, ⌘K search, notifications, the approvals button, and account are present and match the spec’s shell; the breadcrumb ends on this page. No assistant button in the top bar. The document title names the page.
2. **Header.** Eyebrow is the workspace name, h1 “Fleet”, subtext “Every run in this workspace, live and recent.” Actions present, in order, with the same labels: Steer · Register Agent. Neither is gold; never more than one gold action is visible at once.
3. **Summary tiles.** 4 tiles: Live runs · Waiting on a human · Spend shown · Tokens shown. Each shows one number and one basis line; each number is a rollup of the rows under it (recompute it from the list and compare). Waiting on a human is a button that opens the approvals drawer, and its number equals pending approvals plus an open interjection. Switching a filter chip changes Spend shown and Tokens shown.
4. **Sections, tabs, and tables.** For each item below, the build has it, with the same panel headings and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Runs panel: filter chips all · live · parked · sealed. Columns: Run · Agent · Operator · Status · Tier · Replay · Tokens · Cost · Frames · Started · action. Tokens shows the total with “N% cached” beneath; Cost shows the basis beneath. Per-row action: Pause on a live run (opens the pause dialog), Resolve on a parked run (opens the Run page), Export otherwise. Clicking a row opens the Run page. List controls: search, sortable columns, facet filters (Tier, Replay, Status), rows-per-page (5/10/25/50/All), pager.
   - No Approvals panel, no interjection banner, no Verdict or Done column, no held or proven chip on this page.
   - First-run banners (onboarding only): *provisional* workspace until a main repo is bound (Bind <repo>), *first run* (“One run so far.”, Show the seeded fleet), and the Onboarding offer card (See plans, Not now).
5. **Approvals button and drawer.** The topbar button is left of the avatar with aria-label “Approvals, N waiting”, N = pending approvals plus an open interjection across the organization. It opens `#apdrawer` (h3 “Approvals”, badge “N waiting”, close button “Close approvals”); Escape closes it. The list shows the interjection row (with Answer it) first, then one row per pending approval with a live countdown, then “N resolved today”; empty copy “Nothing is waiting on a human.” Selecting a row shows ‹ All approvals and the full card: eyebrow, amount or tool, agent, badges, countdown, four-hop chain, mandate bar or Grant block, The call, Rules that fired, footer with Open run, Deny, Approve (gold). Resolution state is never written to the seed.
6. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`steerfleet`, `pause`, `approve`, `deny`, `request-access` (from denied), `incident` (from error)), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL. The Interrupt switch in the steer dialog is disabled and says “not yet available”.
7. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the gap named. A fixture reaching production is a FAIL.
8. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): “No runs yet in <workspace>”; the copy about a run appearing at the first model call of a registered agent. Actions: Register Agent, Open Agents.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “Fleet could not be loaded”; `503 run_index_unavailable`; nothing was changed; runs kept recording; frames are written by the collector on each host. Actions: Try again, Open an incident; a trace id, region, and timestamp line.
   - **access denied** (`state=denied`): “You cannot see this workspace”; the missing permission `workspace.read on core-platform`; an owner can grant it and the grant is a governed action. Actions: Request access (opens the request-access dialog), Back to Fleet. Below: Signed in as, Needed, Decided by (`pol_v41` · deny wins over every allow).
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
9. **Trust language.** Every tier, replay grade, attestation, and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (`observe`, `harness`, `gateway`, and `contained` are each shown only where recorded; nothing says enforced about the harness tier; nothing says proven, verdict, or held). Money always carries its basis.
10. **Token figures.** Tokens shown equals the sum of the Tokens column over the rows listed; each row’s “N% cached” is cache read over input for that run; “N% served from cache” on the tile is spend-weighted over the same rows. A constant or a typed figure is a FAIL.
11. **Headings.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence.
12. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet; the approvals drawer is full-width; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px.
13. **Accessibility.** Dialogs are `role=dialog aria-modal` with a labelled close; the drawer is `role=complementary` with `aria-label` and is `inert` when closed; icon buttons have `aria-label`; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
14. **Permissions.** Read requires `workspace.read`; each write (approval.resolve (Approve/Deny); run.command (pause/resume/cancel/steer); agent.register (Register Agent)) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
15. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Fleet audit {{DATE}}
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
