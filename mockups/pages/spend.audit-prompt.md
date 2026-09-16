# Audit prompt — Spend

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Spend** page of Oxagen Mission Control (`#/a-intel/core-platform/spend[/<tab>[/<drill>]]`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/spend.md` (read it first, in full).
2. The design, rendered: the `spend` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/spend[/<tab>[/<drill>]]`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar, breadcrumbs, ⌘K search, notifications and account are present and match the spec’s shell; the breadcrumb ends on this page. The document title names the page.
2. **Header.** Eyebrow “Savings identified · <month>”, h1 “Spend”. Actions present, in order, with the same labels: Export report · Set a budget. Exactly one gold (primary) action on the screen.
3. **Summary tiles.** 4 tiles: Spend · <month> · Proven spend · Accepted, not proven · Productive ratio. Each shows one number and one basis line; each number is a rollup of the rows under it (recompute it from the list and compare).
4. **Sections, tabs and tables.** For each item below, the build has it, with the same tab labels (and live counts where the design shows them), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Tabs: Findings (N) · By operator · By agent · By tool · Wasted spend (N) · Budgets (N).
   - Findings — ranked cards: rank, amount at stake, level and confidence, the finding, Evidence (opens the runs, people and arithmetic) and Fix (opens the change that removes it). Search, facet (Level, Confidence), sort (Rank, Savings high/low, A–Z).
   - By operator — Operator · Role · Agents · Runs · Spend · Proven · Productive ratio · Potential savings · Budget position. A row drills (`/spend/operator/<id>`).
   - By agent — Agent · trust · spend · Runs · Spend · Proven spend · Spend per proven run · Potential savings · Trend; By model and provider key: Model · Provider key · Model calls · Spend · Cache hit rate · Basis.
   - By tool — cumulative sparkline tiles (Cumulative · Average per call · Average per run that used it); Tool · Server · Calls · Runs · Cumulative · Share · Avg per call · Avg per run · Potential savings · What the frames say.
   - Wasted spend — tiles: Wasted · Share of spend · Runs with waste · Largest cause; By cause; Runs that prove it (Open the run, Show the frames).
   - Budgets — Scope · Period · Limit · Used · Mode · Position (Set a budget).
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`budget`, `spendexport`, `evidence`, `fix`, `incident`, `exception note`), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): “No spend to report yet” — rollups are derived indexes rebuilt from frames; no model call, nothing to roll up, nothing billable. Action: Back to Fleet.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “Spend could not be loaded” — `504 rollup_rebuild_in_progress`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: Try again, Open an incident; a trace id, region and timestamp line.
   - **access denied** (`state=denied`): “You cannot see this workspace’s spend” — the roles the signed-in person holds on the organization do not include `spend.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: Request access (opens the request-access dialog), Back to Fleet. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* 
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
8. **Trust language.** Every tier, replay grade, attestation and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (e.g. “gateway” for a client-attested window). Money always carries its basis.
9. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px. Compare against `pages/spend-loaded-mobile.html`.
10. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; icon buttons have `aria-label`; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
11. **Permissions.** Read requires `spend.read`; each write (budget.set; spend.export; exception.resolve; incident.open) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
12. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Spend — audit {{DATE}}
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
