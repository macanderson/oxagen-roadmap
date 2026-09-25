# Audit prompt: In progress

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **In progress** tab of Work in Oxagen (`/a-intel/core-platform/work/in-progress`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarize what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/work-in-progress.md` (read it first, in full), and `mockups/pages/work-backlog.md` for the header, the scope group, the stat cards and the Labels and Owner filters.
2. The design, rendered: the stories `Oxagen / Work / In progress` (Loaded, Loaded · mobile, Loaded · future-only fields marked) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>[&future=1]#/a-intel/core-platform/work/in-progress`. The flow check is `node tools/check-tasks.mjs` (flow 15).
3. The product specs: `docs/work-in-flight-spec.md` §8.7 and §8.8, `docs/work-graph-spec.md` §6.2, `docs/fleet-operations-wedge.md` (D1, D2, D17; Work).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/work/in-progress`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route.** The build serves `/a-intel/core-platform/work/in-progress`, and a reload keeps the tab. The breadcrumbs read “Anderson Intelligence Corp. / Core platform / Work”.
2. **Tabs.** Backlog · In progress · Work orders · Workflows · Findings, in that order, In progress selected with `aria-selected`, and no count on In progress.
3. **Scope and stat cards.** The same group and cards as the Backlog, above the tabs. In progress plus In review equals this tab’s row count under All work, and under My work equals the rows you own or sent. A figure that disagrees with the rows is a FAIL.
4. **Rows.** Every work item in a work order, and nothing else. A work item in a work order that also appears on the Backlog is a FAIL. Accept every item of a work order: its rows leave this tab and return to the Backlog as Accepted.
5. **Table.** Heading “In progress”, with no subtext and no note under the table. Columns in order: Work item · Labels · Owner · Work order · Sent to · State · Items claimed · Updated. No provider Status column. The Work order cell links the work order and shows `live` while one of its runs is live. Sent to shows the harness mark per agent or per stage. A row click opens the work item.
6. **Filters.** The list bar has search, the Labels and Owner filters, the State select, Rows and a pager. Labels and Owner take several values, draw each value as the table does (a label as its colour chip, an owner with the avatar, an unmapped account with its provider logo and badge), show a row count per value, and match a row that carries any value picked. **Clear** empties one, and a click outside or Escape closes its list. A list the panel clips is a FAIL.
7. **Data sources and future-only fields.** Each ❌ row renders `not recorded`, never a zero and never a fixture.
8. **Mobile.** At 390 × 844 with a touch pointer: the stat cards sit two by two, the table is labelled cards, the filters are 44 px tall with 16 px text, each option in their lists is 44 px tall, and the page never scrolls sideways.
9. **Rules.** No heading, table header or caption carries a comma, a mid-dot, or a not/never contrast. No person is scored or ranked. The provider’s status and the work order’s state are never one column. No sentence on the page explains the design: the explanations live in `mockups/help/work-in-progress.md`.
10. **Accessibility.** Rows are keyboard operable. The filter buttons name their filter and how many values are picked. State is never colour alone. Focus is visible.
11. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding, and the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# In progress audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
