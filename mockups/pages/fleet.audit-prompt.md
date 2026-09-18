# Audit prompt — Fleet

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Fleet** page of Oxagen Mission Control (`#/a-intel/core-platform`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/fleet.md` (read it first, in full).
2. The design, rendered: the `fleet` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar, breadcrumbs, ⌘K search, notifications and account are present and match the spec’s shell; the breadcrumb ends on this page. The document title names the page.
2. **Header.** Eyebrow “Workspace · <workspace name>”, h1 “Fleet”. Actions present, in order, with the same labels: Steer · Register Agent. Exactly one gold (primary) action on the screen.
3. **Summary tiles.** 4 tiles: Live runs · Waiting on a human · Spend, runs shown · Definition of done held. Each shows one number and one basis line; each number is a rollup of the rows under it (recompute it from the list and compare).
4. **Sections, tabs and tables.** For each item below, the build has it, with the same tab labels (and live counts where the design shows them), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Approvals panel — badge “N parked”. One card per pending approval: tool version (`github__create_release@2`), agent · task, parked-at time, hazard/side-effect/tier chips, counterparty, timeout (“Times out in 10m, then the call ends”), Approve (gold; opens the approve dialog), Deny (opens the deny dialog), Details (the four-hop chain: who asked, which agent, which action, which rule). Resolution state lives on `S.ap`; the seed `APPROVALS` is never mutated.
   - Runs table — columns: Run · Agent · Operator · Status · Tier · Replay · Verdict · Done · Cost · Frames · Started. Row filter chips: all · live · held · proven. Per-row: Pause (live runs; opens the pause dialog), Export. Clicking a row opens the Run page. List controls: search, sortable columns, facet filters (Tier, Replay, Status), rows-per-page (5/10/25/50/All), pager.
   - First-run banners (onboarding only): *provisional* workspace until a main repo is bound (Bind <repo>), *first run* (“one run so far”, Show the seeded fleet), and the onboarding offer card (See plans, Not now).
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`steer`, `pause`, `approve`, `deny`, `approval details (four-hop chain)`, `request-access (from denied)`, `incident (from error)`), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): “No runs yet in <workspace>” — nothing has reached Oxagen; a run appears at the first model call of a registered agent. Actions: Register Agent, Open Agents.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “Fleet could not be loaded” — `503 run_index_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Mission Control. Actions: Try again, Open an incident; a trace id, region and timestamp line.
   - **access denied** (`state=denied`): “You cannot see this workspace” — the roles the signed-in person holds on the organization do not include `workspace.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: Request access (opens the request-access dialog), Back to Fleet. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`po
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
8. **Trust language.** Every tier, replay grade, attestation and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (every agent and run is `observe` or `harness`; `gateway` and `contained` render only as not yet available; nothing says enforced about the harness tier). Money always carries its basis.
9. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px. Compare against `pages/fleet-loaded-mobile.html`.
10. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; icon buttons have `aria-label`; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
11. **Permissions.** Read requires `workspace.read`; each write (approval.resolve (Approve/Deny); run.command (pause/resume/cancel/steer); agent.register (Register Agent)) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
12. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Fleet — audit {{DATE}}
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
