# Audit prompt: Spend

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Spend** page of Oxagen (`#/a-intel/core-platform/spend[/<tab>[/<drill>]]`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/spend.md` (read it first, in full).
2. The design, rendered: the `spend` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The other tabs and the drills are reachable from the loaded story.
3. The product spec for context: `docs/mission-control-spec.md` §12.6 (token classes), §12.7 (attribution), §12.8 (findings), §14 (Mission Control), Appendix A (target tables), Appendix E (contracts), Appendix F (the pages that survive); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/spend[/<tab>[/<drill>]]`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar (Fleet, Agent IAM, Tools, Steering, Repositories, Spend; Organization, Billing, Audit), breadcrumbs, ⌘K search, notifications and account are present and match the spec's shell; the breadcrumb ends on this page; the document title names the page. The top bar has an **Approvals** button left of the avatar whose count is pending approvals plus open interjections across the organization; it opens the right-hand drawer (`#apdrawer`, `role=complementary`, labelled "Approvals") listing them; picking one shows the full approval card with Approve and Deny; Escape closes it. There is no assistant button in the top bar.
2. **Header.** Eyebrow "<workspace name>", h1 "Spend", subtext "What the tokens bought, with the basis on every number." Actions present, in order, with the same labels: Export report, Set a budget. Exactly one gold (primary) action on the screen.
3. **Summary tiles.** Four tiles on every tab, hidden on a drill: Spend, Tokens, Observed by the gateway, Wasted. Each shows one number and one basis line as the spec gives them (Spend carries `gateway_observed` + `client_attested` and USD; Wasted is in the critical colour).
4. **Sections, tabs and tables.** For each item below, the build has it, with the same tab labels (and live counts where the design shows them), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Tabs: Findings (N), Tokens, Coaching (N), By operator, By agent, By tool, Wasted spend (N), Budgets (N).
   - Findings: the hero (Savings identified, the strip and legend, the four facts), the filters (Level, Confidence, Sort, Rows), the ranked cards with rank, kind, level, confidence, operator and agent, the finding, the evidence line, the amount and share, Evidence and Fix.
   - Tokens: By token class (Class, Tokens, Share, Cost; the five classes; Cache hit rate, Cache write cost share, Effective input price, Unmapped classes); Prompt composition (Conversation, Tool results, Context frames, Tool definitions, Steering, System, Output, Reasoning); By harness (Harness, Agents, Tokens, Cache hit, Spend, Basis); By agent (Agent, Runs, Tokens, Per run, Cache hit, Tool defs, Context, Tool results, Reasoning, Basis).
   - Coaching: the four tiles (Agent coaching, Operator coaching, Signals read, Memories aggregated), the two sub-tabs with counts, the pager, one panel per agent or operator, and cards with a severity title, money a month, the signal line, the paragraph, the one action and Send to the operator. The seven agent signals and six operator signals are those the spec names, including "Get to one prompt per session".
   - By operator: Operator, Role, Agents, Runs, Spend, Tokens, Cache hit, Potential savings, Budget position; a row drills.
   - By agent: Agent, Runs, Spend, Tokens, Per run, Cache hit, Potential savings, Trend; Models and keys: Model, Provider key, Model calls, Spend, Cache hit rate, Basis, with a Total row.
   - By tool: Cumulative spend, Average per call, Average per run; Tool, Server, Calls, Runs, Cumulative, Share, Avg per call, Avg per run, Potential savings, What the frames say.
   - Wasted spend: tiles Wasted, Share of spend, Runs with waste, Largest cause; By cause with the six causes (cache misses, corrective prompts, retry loops, context bloat, idle while parked, halted early); Runs with waste with Open the run and Show the frames.
   - Budgets: Scope, Period, Limit, Used, Mode, Position; Set a budget.
   - Drill: crumb bar, header, Open the agent (agent only), Export this view, the Potential savings hero, the stat tiles for the kind, Spend by day, the agent history panels where history exists, the cross-cuts, Findings.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`spendexport`, `budget`, `evidence`, `fix`, `incident`, `request-access`, the coaching actions and Send to the operator), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest "not recorded yet", never a zero) for the rest; ❌ rows must render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): "No spend to report yet". Rollups are derived indexes rebuilt from frames; no model call, nothing to roll up, nothing billable. Action: Back to Fleet.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): "Spend could not be loaded", `504 rollup_rebuild_in_progress`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: Try again, Open an incident; a trace id, region and timestamp line.
   - **access denied** (`state=denied`): "You cannot see this workspace's spend"; the roles the signed-in person holds do not include `spend.read on core-platform`; an owner can grant it and the grant is a governed action in the audit record. Actions: Request access, Back to Fleet. Below: Signed in as, Needed, Decided by.
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
8. **Trust language.** Every tier, attestation and cost basis on the page shows the recorded value. The ladder is `observe`, `harness`, `gateway`, `contained`; each renders only as recorded (most agents `gateway` with `gateway_observed`, docs-writer `harness` and `client_attested`, Stella CI `contained`). A self-reported figure is labelled `client_attested` and is never rendered as observed; an absent class is marked absent, never zero. Money always carries its basis. Nothing on the page says proven, verdict, score or definition of done.
9. **Figures reconcile.** Recompute and compare: the Spend tile equals the Total row of Models and keys; the Tokens tile equals the sum of By token class and the sum of By harness; each operator's Tokens equals the sum over its agents; Coaching money a month is derived from the same rollup the Tokens tab prints; the Findings hero total equals the sum of the cards; a drill's Potential savings equals the sum of its findings. A figure typed by hand is a FAIL.
10. **Headings and labels.** No heading on the built page carries a comma, a mid-dot or a not/never contrast; subtext under a heading is one sentence or nothing. Labels match the spec verbatim.
11. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet; the approvals drawer opens full-width; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is at least 44 px; inputs are 16 px. Compare against the mobile story (`mobile=1`).
12. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; the drawer is `role=complementary` and inert when closed; icon buttons have `aria-label`; the sparklines and share strips are `role=img` with a label; state is never colour alone (dot and word); focus is visible; the page is operable by keyboard end to end.
13. **Permissions.** Read requires `spend.read`; each write (`budget.set`, `spend.export`, `incident.open`, a coaching note) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
14. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Spend: audit {{DATE}}
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
