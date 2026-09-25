# Audit prompt: Spend overview

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Spend overview** of Oxagen (`#/a-intel/core-platform/spend`, with `?by=` and `&key=`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/spend.md`. Read it first, in full.
2. The design, rendered: the `Oxagen / Spend / Overview` stories in Storybook (`npm run storybook`): Loaded, Loaded · mobile, and Loaded · future-only fields marked. Or open `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/spend` in a browser or with Playwright, and add `&future=1` to outline the future-only fields. The side panels are `#/a-intel/core-platform/spend?by=operator&key=marcus`, `?by=agent&key=a-intel.core.triage`, `?by=model&key=claude-opus-5`, `?by=tool&key=claude_code__Bash`, `?by=cost_center&key=ENG-1001` and `?by=work&key=wo_01K5RS7M4N`.
3. The design authority: `docs/fleet-operations-wedge.md` (D10, D15, Work rule 4, Cuts, Open decision 5), `docs/fleet-operations-ia.md` (Spend), `docs/fleet-operations-routes.md` (Spend). In `macanderson/oxagen`: the operator review in `docs/VISION.md`, and ADR-142.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/spend`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/spend`, and the grouping and the key are query values (`?by=`, `&key=`), so a side panel is a URL a person can share. Spend is lit in the sidebar and carries no count. The breadcrumb ends on Spend. The Approvals button and its drawer are present. The document title names the page.
2. **Old routes.** Each lands on its canonical form with a 308 and never a 404: `/spend/operator`, `/spend/agent`, `/spend/model`, `/spend/tool` to `?by=` the same kind; `/spend/task` to `?by=work`; `/spend/cost_center` to `?by=cost_center`; `/spend/pricing` to `?by=model`; `/spend/<operator|agent|tool>/<key>` to `?by=<kind>&key=<key>`. `/spend/tokens`, `/spend/coaching` and `/spend/waste` land on `/spend/optimization`; `/spend/findings` and `/spend?finding=<id>` land on `/work/findings` with the finding's dialog. No drill page renders anywhere.
3. **Header.** Eyebrow the workspace name, h1 "Spend", and no subtext. Actions in order: Export report, Set a budget. Set a budget is the one gold action on the screen.
4. **Tiles.** Four tiles, in order: Organization spend (with its basis, "Observed by gateway + Reported by harness", and USD), Tokens (with "served from cache"), Observed by the gateway ("of tokens counted by the proxy"), Unproductive spend (in the critical ink, with its share of spend). The Unproductive spend tile opens Optimization. A tile whose figure no contract answers prints "not recorded", never a zero.
5. **Tabs.** Overview · Budgets (N) · Optimization, each a path segment. Changing the tab drops `by` and `key`.
6. **September by day.** The panel heading names the month, it carries no caption, and the right side shows the month to date. The bars are one image with a label naming the range, and each bar's tooltip names its day and amount. If no contract answers the month by day, the build prints the chart as not recorded rather than drawing seeded bars.
7. **Group by.** A group of six buttons with `aria-pressed`: Work order, Operator, Agent, Model, Tool, Cost center. A button writes `?by=` and closes an open panel.
8. **The table.** Heading "By <grouping>", and no subtext. Search, filters, Rows and a pager above the rows. Rows open ordered by spend, largest first. Every column the spec names, in order, per grouping:
   - Work order: Work order · Kind · Sent by · Runs · Items accepted · Per accepted item · Spend (no Share).
   - Operator: Operator · Agents · Runs · Tokens · Cache hit · Budget position · Spend · Share.
   - Agent: Agent · Runs · Tokens per run · Cache hit · Trend · Spend · Share.
   - Model: Model · Provider key · Model calls · Cache hit · Spend · Share.
   - Tool: Tool · Calls · Runs · Per call · Spend · Share.
   - Cost center: Cost center · Agents · Workspaces · Spend · Share. The `~none` row is present and says it has no label.
   Missing or renamed columns are FAILs. Extra columns are noted.
9. **Selecting a row.** A row writes `&key=`, carries `aria-selected`, and opens the side panel. Selecting it again, or **Close**, removes the key. With a panel open, the table narrows to the name, Spend and Share.
10. **Side panels.** Each carries the fields the spec lists, in order, and its action:
    - Operator: Role, Agents, Runs, Spend, Budget, Bounded tasks; no caption; **Open the habits** to `/spend/optimization?part=habits`.
    - Agent: the agent card, Runs, Spend with the change on last month, Tokens per run, Cache hit, Tool definitions, Cost center; the recommendation count; **Open the agent** and **Recommendations** to `?part=agents`.
    - Model: Model calls, Spend, Cache hit, Provider key; **Model routes** to Organization.
    - Tool: Kind, Calls, Per call, Per run, Record.
    - Cost center: Agents, Spend, Resolved from; **Export the statement**.
    - Work order: Work order (link and kind badge), Sent by, Runs (one link each), Spend against the cap; **Open the work order**.
11. **The operator review.** The operator panel shows the person's spend and, for bounded tasks, items accepted and spend per accepted item. Search the build for any score, rank number, percentile, severity, grade or verdict attached to a person anywhere on the page. One is a FAIL.
12. **Figures reconcile.** Recompute and compare: the Spend tile equals the Total row of By model; the rows of By operator, By agent and By cost center each sum to the Spend tile, `~none` included; Share is the row over the Spend tile. By tool may exceed the month because a turn counts toward every tool it called, and the page must not present its rows as a partition. A figure typed by hand is a FAIL.
13. **Cost centers (ADR-142).** A run is charged to its agent's label, else its workspace's, else `~none`. **Export the statement** downloads the organization's month as CSV, one line per center and one for `~none`, with the total; it is refused to anyone but org Owner, Admin or Billing, with a toast that names who holds the role and no dialog. A label deleted after its runs rolled up keeps its row on By cost center with a `deleted` badge.
14. **Dialogs.** Export report opens `spendexport` with Timeframe, Include, the delivery note, Cancel and Generate report. Set a budget opens `budget` (audited in `spend-budgets.audit-prompt.md`). Export the statement opens `ccexport` with the Month select (September 2026 to date, August 2026, July 2026), the nine columns `line`, `cost_center`, `runs`, `unpriced_runs`, `cost_micros`, `cost_cents`, `currency`, `basis`, `run_ids`, the note, Cancel and Export CSV. Export CSV writes `cost_center_statement_exported` to Audit. A stub must say what the product would do; a control that silently does nothing is a FAIL.
15. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that ship and print "not recorded" for the rest. ❌ rows print "not recorded" with the gap named. A fixture reaching production is a FAIL. Check these in particular: the Observed by the gateway tile, the By work order grouping, Agents and Budget position on By operator, Trend, Provider key, the tool's kind, the cost center's Agents and Workspaces, and the work order panel.
16. **Future-only fields.** With the future story or `?future=1` open, the By work order panel, each `direct` badge and the operator panel's Bounded tasks are outlined. In the build each renders as not recorded until its contract ships. List every field the build renders from a fixture.
17. **States.** The design has the loaded state only. Confirm the build uses the shell's standard loading, error, empty and denied panels: no zeros while loading; the error panel names its code and offers Try again and Open an incident; the denied panel names `spend.read` and offers Request access.
18. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with Spend lit; More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The tiles form a two by two grid, the table becomes labelled cards, and dialogs are bottom sheets. With a key open, the side panel follows the table and is reachable. Nothing scrolls sideways. Touch targets are at least 44 px and inputs 16 px.
19. **Accessibility.** Tabs use `role=tablist` and `role=tab` with `aria-selected`. The Group by buttons carry `aria-pressed`. The side panel is an `aside` with a label, and Close has an accessible name. The day chart is `role=img` with a label. State is never colour alone. The page is operable by keyboard end to end.
20. **Rules.** Check each rule in the spec's last section: frames and SteeringFrames never share a name; no source shown as a frame; every figure reads the record; no person scored or ranked; every money figure states its basis and every enforcement claim its tier; headers are rollups; plain-noun headings with one-sentence subtext; exactly one gold action; future-only fields render as not recorded; every figure reads the same scope, this workspace.
21. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding. The reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Spend overview: audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
