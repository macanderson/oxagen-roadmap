# Audit prompt: Agent › Activity

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Activity** tab of one agent in Oxagen (`#/a-intel/core-platform/agents/<slug>/activity`): the work orders the agent worked with their runs, the token accounting, the last 30 days with its findings, and the tamper incidents. Check it for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/agent-activity.md`. Read it first, in full. The agent header and the tab bar are specified in `mockups/pages/agent.md`.
2. The design, rendered: the stories `Oxagen / Agents / Activity` (Loaded, Loaded · mobile, Loaded · future-only fields marked) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/agents/triage/activity`, adding `&future=1` to outline the future-only fields. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (D1, D2, D3, D9, D17; the Work sections Objects, Rules and Shipped today), `docs/fleet-operations-ia.md` (Agents) and `docs/tasks-spec.md` for work orders.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/agents/<slug>/activity`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The route opens the agent page with Activity selected; its count equals the tamper incidents recorded against the agent. `/runs` and `/incidents` show this tab. The header and tab bar match `agent.md`.
2. **Work orders.** The subtext counts the work orders and runs in view. Columns in order: Work order (id over title) · Kind (`direct` or `dispatched`) · Runs (each a link) · Status · Cost · Started. A row opens the work order; a run id opens the run. Search, the Status facet, Rows and a pager. An agent with no run in view shows the one-line panel. There is no Verdict column and no Fleet link.
3. **Token accounting.** Subtext "By class, measured on every model call." and "30 days". Columns Class · Tokens 30d · Rate · Cost, with the four input and output classes and the Tool definitions row counted as input. The note names the cache hit rate and the tool-definition share of input.
4. **Last 30 days.** Subtext as the spec gives it; Open on Spend. Rows Runs, Spend with its basis, Productive ratio with its sub-line, Tokens with the cached share. Each finding open against the agent is a card with its kind, the money at stake, why, Evidence and Fix; with none, "No finding is open against this agent."
5. **Tamper incidents.** One panel per incident: the kind in mono, the caption (when, detected by, agent, host), severity and status badges, What happened, What it stopped, Closed or Owner, Incident, Open on Audit and the runs affected. The closing note about a tamper incident never raising the tier is present. With none, "No tamper incident recorded" with the detector list and Open the incident register.
6. **Dialogs.** Evidence opens "Evidence · <kind>" with At stake, Confidence, Signal, Evidence and the recent runs table, headed Run · Work order · Started · Cost · Wasted · What was wasted (a Task header is a FAIL). Fix opens the help article for the finding's kind. Applying a fix reaches `record_finding_fix`, passes IAM, writes an audit event and shows a receipt or reference.
7. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it (`list_runs`, `get_spend`, `list_findings`, `get_finding_evidence`, `list_incidents`). ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named. A fixture reaching production is a FAIL.
8. **Future-only fields.** Until work orders ship, the Work orders panel lists the agent's runs from `list_runs`, one row per run, and renders the work order and Kind as not recorded. The cost per class, the Tool definitions row and share, and an incident's resolver, owner and due date render as not recorded. Any of them drawn with fixture values is a FAIL. A work order grouping invented client-side is a FAIL.
9. **Rollups.** The subtext's counts equal the rows. A work order's cost equals the sum of its runs. The token rows sum to the agent's 30-day total on the Overview and the roster. The cache rate in the note equals the Overview's cache hit rate and the Tokens row's cached share. The Spend basis equals the Overview's. The incident panels equal the tab count and the Audit page's count for the agent. A constant or a typed figure is a FAIL.
10. **Agreement with Work.** Every work order listed here appears on Work › Work orders, and each run appears under the same work order there. Every finding listed here appears on Work › Findings.
11. **Trust language.** Money carries its basis, and a client-attested figure says so. An incident's window stays labelled as observed. Nothing says proven, verdict, score or percentile.
12. **States.** The design has the loaded state only. The build uses the shell's standard loading, error, empty and denied panels; each replaces the page body, never the shell, and loading never flashes zeros.
13. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. The panels stack; the tables become cards with labelled cells; finding cards wrap their buttons; dialogs are bottom sheets; nothing scrolls sideways; touch targets are at least 44 px.
14. **Accessibility.** Tables have header cells; sortable headers carry `aria-sort`; dialogs are `role=dialog aria-modal` with a labelled close; state is never colour alone (a dot and a word); focus is visible; the tab works by keyboard end to end.
15. **Permissions.** Each read is checked server-side: the runs, the spend, the findings and the incidents. `record_finding_fix` is gated server-side, not only hidden. Verify with a role that lacks each.
16. **Rules.** A frame and a SteeringFrame never share a name on screen. No person is scored or ranked. No heading or label carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. No gold action on the tab.
17. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Agent Activity audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
