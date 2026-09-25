# Audit prompt: Work orders

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Work orders** tab of Work in Oxagen (`/a-intel/core-platform/work/orders`), with the first-run view a new operator lands on after onboarding, for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarize what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/work-orders.md` (read it first, in full), and `mockups/pages/work-backlog.md` for the Work header and tabs.
2. The design, rendered: the stories `Oxagen / Work / Work orders` (Loaded, Loaded · mobile, Loaded · future-only fields marked), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>[&future=1]#/a-intel/core-platform/work/orders`. The first run: scenario W1 step 6, `mockups/missioncontrol.html?product=1#/a-intel/core-platform/scenarios/sixty-seconds-to-governed/6`.
3. The product specs: `docs/fleet-operations-wedge.md` (D1, D2, D3, D17; Work › Objects, Rules, Shipped today), `docs/fleet-operations-routes.md`, `docs/tasks-spec.md` §9.5, §9.6, §11, and `mockups/pages/onboarding-run.md` for the step that lands here.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/work/orders`.

5. The work graph: `docs/work-graph-spec.md` §6.2, §7.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/a-intel/core-platform/work/orders`. The Fleet runs address with a cursor (`/a-intel/core-platform?cursor=…`) answers 308 to it. Work is lit in the sidebar, the breadcrumbs end on Work, and the Work orders tab is selected with its count of work orders waiting on you.
2. **Header.** As `work-backlog.md`, with no header action on this tab. A gold control anywhere on the tab is a FAIL.
3. **Panel and chips.** Heading “Work orders”, the one-sentence subtext, and the chips All, Dispatched, Direct and Live, each with its count. Recompute each count from the rows: a count that disagrees is a FAIL. Each chip filters as the spec says.
4. **Table.** Columns in order: Work order · Work items · Sent to · Latest run · Items claimed · State · Spend · Sent by. The Work order cell carries the title, the id in mono and the kind badge `dispatched` or `direct`. A direct work order with no work item shows the run’s task reference. Latest run links the run, marks `live`, and counts runs above one. State uses exactly Sent, In progress, Waiting on you, Sent back, Parked for you, Stopped, Accepted, Closed. Rows sort newest first. A row opens the work order, and the run link opens the run. Missing or renamed columns are FAILs.
5. **Every run under one work order.** Take ten runs from the build’s run list and find each under exactly one work order here. A run that appears under none, or under two, is a FAIL. A run started outside Oxagen must sit under a direct work order titled from its task reference or its first prompt.
6. **Direct work orders.** Items claimed reads a dash. Sent by is the run’s recorded operator, and a run the record attributes to its host’s enroller reads “enrolled by”, never “started by”. The state follows the run. Nothing on the row claims a definition of done.
7. **Spend.** Each work order’s Spend equals the sum of its runs’ cost. Every figure keeps its basis where the build shows one, and a mixed set of bases is never shown as one.
8. **The first run.** Complete onboarding (or open the scenario step) and land on `/work/orders`. The page shows, in order: the provisional banner while no main repository is linked (with **Link a-intel/platform**), the first run banner (“One run so far.”, the run and its agent, “filed under a direct work order”, **Show the seeded workspace**), the Onboarding offer panel (the conversion date, the discount, the run’s cost with its basis, what Oxagen billed, **See plans**, **Not now**), and one row: the smoke session under its direct work order. Every count on the page, the tabs included, reads off that one run. **Link** links the main repository and removes the provisional banner. **Not now** removes the offer. Clicking another tab shows that tab.
9. **Data sources.** For each row of the spec’s Data sources table, find what feeds it in the build. ✅ rows (a direct work order’s agent and sender, the provisional window and Link, the run’s cost) are wired to the named contract. 🟡 rows are wired for the fields that exist and render `not recorded` for the rest. ❌ rows (the dispatched list, direct work orders themselves, items claimed, state, the chip counts, the offer, what Oxagen billed) render `not recorded`, never a zero and never a fixture. A fixture reaching production is a FAIL.
10. **Future-only fields.** The `direct` badge and every other field the spec lists as future-only render `not recorded` until their contracts ship. A control that silently does nothing is a FAIL.
11. **States.** The design has the loaded state only. Force loading, error, empty and denied: each must be the shell’s standard panel inside the shell, with no zeros and no stale rows. Record which panel the build uses for each.
12. **Mobile.** At 390 × 844: the thumb bar holds Work (lit), Agents, Tools, Spend and More, and More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The tab strip scrolls inside itself, the chips wrap, the table is labelled cards with the title, id and kind at the top of each, the first-run banners stack, and the page never scrolls sideways. Touch targets are at least 44 px.
13. **Rules.** One gold action at most. No heading or caption carries a comma, a mid-dot, or a not/never contrast. Money shows its basis. Chips and Spend are rollups of the rows. No person is ranked. A run never stands without its work order.
14. **Accessibility.** Tabs use `role=tablist`/`tab` with `aria-selected`. The chips expose which one is chosen. Rows are keyboard operable. State is never colour alone.
15. **Permissions.** `work.read` to see the tab. **Link** is `bind_main_repository`, gated on the server and recorded in Audit. Verify with a role that lacks each.
16. **Queued, expired, and sends.** State includes `queued` with “waits on #N” under it and `expired`. A send to several targets is one row with “N work orders”, the targets’ marks, “one per target”, `partial` while its children’s states differ, and its children under it each marked “k of N in this send”. No rank, score or winner between siblings, and nothing typed on the send row that is not a rollup of its children.
17. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding, and the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Work orders audit {{DATE}}
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

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
