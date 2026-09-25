# Audit prompt: Steering › Assignments

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built view against its design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering › Assignments** view of Oxagen (`/{org}/{ws}/steering/assignments`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering-assignments.md`. Read it first, in full. `steering.md` specifies the header, the tabs and the shell; `steering-compiler.md` the view each agent row links to.
2. The design, rendered: the stories `Oxagen / Steering / Assignments` in Storybook (`npm run storybook`): Loaded, Loaded · mobile, and Loaded · future-only fields marked. Or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/steering/assignments`, with `&future=1` to outline the future-only fields. Also open `#/a-intel/data-platform/steering/assignments` for agents on `observe`.
3. The design authority: `docs/fleet-operations-wedge.md` (D4, D5, D11, D12, D13; the Steering sections Emissions and Shipped today) and `docs/fleet-operations-ia.md` (Steering, Assignments).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/{org}/{ws}/steering/assignments` with Assignments selected, and `/steering/deliveries` resolves to it. The header, the tabs and the shell match `steering.md`. The kind filter does not render on this tab.
2. **By scope.** The heading "By scope", the caption, and a table with Scope, Sources, Frames by type and Agents, in that order. Rows in the spec's order: Organization, Workspace, each repository in name order, One agent each with its sub-line, Named agents with its sub-line. A scope with no emitting source has no row.
3. **Rollups.** The By scope Sources column sums to the Sources tab's row count less the sources that emit nothing (164 of 185 in the design). Each Frames by type cell sums the emits of the sources in its scope. Each Agents figure is the agents at least one source in the scope reaches. Any figure that disagrees with Sources is a FAIL; name both values.
4. **By agent.** The heading "By agent", the caption, the shared list controls (search, the Tier filter, Rows, pager), and the columns Agent, Tier, Sources, Frames by type and Resolve, in that order. The Agent cell is the agent chip with the key in mono. Resolve is a Compiler link.
5. **Eligibility, not delivery.** An agent on `observe` shows "assembled, not delivered" under its tier. No row says or implies an agent was steered, delivered to, or enforced upon; the counts are eligibility before budget.
6. **One assembler.** Compiler on a row opens `/steering/compiler/<slug>` with that agent selected, for every agent in the workspace, not only the agents with a standing brief. A row whose link lands on a Compiler that cannot resolve its agent is a FAIL.
7. **Assignment is by scope.** No control on the tab attaches a source to an agent or removes one. Any picker, toggle or assign button is a FAIL.
8. **Not a registry.** The tab carries no agent spend, run count, incident count or status column.
9. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract (`list_agents`, its `enforcementTier`). 🟡 rows are wired for the scopes that exist (records, mandates, agent definitions) and render "not recorded" for the rest. ❌ rows render "not recorded" or are absent. A fixture reaching production is a FAIL.
10. **Future-only fields.** With the design's `?future=1`, every Frames by type cell is outlined. In the build each renders "not recorded", never a type list derived from a source's kind. The unmarked future-only figures the spec lists render as not recorded.
11. **States.** Loaded only. Force `state=loading`, `error`, `empty` and `denied` and confirm the shell's standard panels replace the page body and keep the shell, with no zeros and no stale rows.
12. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with More lit; the tabs scroll sideways with Assignments in view; both tables render as labelled cards; the page never scrolls sideways; tap targets are at least 44 px and inputs 16 px.
13. **Rules.**
    - No SteeringFrame is listed on this tab; it counts sources and frame types.
    - No heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. Note where the design breaks this.
    - Exactly one gold action: the header's New source. Nothing in the body is gold.
    - Every enforcement claim states the tier and "routed through Oxagen".
    - No agent or person is scored or ranked.
14. **Accessibility.** Tabs use `role=tablist` and `role=tab` with `aria-selected`; the Tier filter and Rows select have labels; state is a dot and a word; focus is visible; the view is operable by keyboard end to end.
15. **Permissions.** The read is refused server-side without the Steering read. Opening an agent needs the agent read. There are no writes on this tab.
16. **Nothing extra.** List anything on the built view that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Steering › Assignments: audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
