# Audit prompt: Steering · Assignments

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Assignments** tab of Steering in Oxagen (`#/a-intel/core-platform/steering/assignments`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering-assignments.md` (read it first, in full), and `mockups/pages/steering.md` for the hub, the chip, and the tabs. `steering-compiler.md` specifies the tab this one links into.
2. The design, rendered: the `steering-assignments` stories in Storybook (`npm run storybook`), one per state, desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>`. The checker is `node tools/check-mockup.mjs`.
3. The decisions this tab renders: the story sheet of 2026-09-18, decisions 1, 4, 5, and 9; the product spec §12.6 and §14.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with Assignments selected. The workspace nav reads Fleet, Agents, Tools, Steering, Runtimes, Repositories, Spend. The breadcrumb ends on Steering. The Approvals button and its drawer behave as `steering.md` specifies.
2. **Hub and tabs.** The header, the governance chip, and the five tabs are present with their counts, Assignments selected, and the Assignments count is the number of agents in this workspace set up for steering. **The shelf row does not render on this tab.**
3. **The lead note** is verbatim, and it says an item reaches an agent by scope, not by a picker.
4. **What each agent receives.** The panel is badged with the agent count and carries **Open the library**. Columns: Agent, Repository, Delivery, Gates, Stable prefix, Volatile, Cut, Skills, Per run, and the row action, in that order. The Agent cell is the standard agent chip with the harness underneath and links to the agent page.
5. **Delivery is honest.** The cell carries the tier badge and reads “hooks deliver it” or “no hook: assembled, not delivered”. No row says an agent was steered when no hook is installed. An `observe` agent shows an assembly and no delivery.
6. **One assembler.** Open the compiler on a row opens `/steering/compiler/<slug>` for that agent, and every number on the row equals the compiled view: gates, stable prefix count and tokens, volatile count and tokens, cut, skills, and the per-run total. Any difference is a FAIL, and name the two values.
7. **Scope.** The Scope panel is badged with the item count. Columns: Scope, Items, Reaches. Rows in order for the scopes that have items: `org`, `workspace`, `repository`, `agent`, each with the sentence the spec gives. The closing note is verbatim.
8. **Not a second registry.** The tab carries no agent metric that does not come from the assembly: no spend, no run counts, no incident counts, no status column.
9. **One gold action.** The header holds the one gold action; nothing in the body is gold.
10. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named store; 🟡 rows are wired for the fields that exist and render `NotBacked` for the rest; ❌ rows render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
11. **States.** Force each state and compare copy and controls with the design: **empty** reads “No agent receives steering here” with the two sentences and **Open Agents**; **loading** keeps the shell and shows the skeleton; **error** is `503 record_index_unavailable` with Try again, Open an incident, and the trace line; **access denied** names `steering.read on core-platform` with Request access, Back to Fleet, Signed in as, Needed, and Decided by.
12. **Trust language.** No copy says steering is enforced. Delivery is stated as delivered or recorded, with its scope.
13. **Plain nouns.** No heading carries a comma, a mid-dot, or a not/never contrast; subtext under the h1 is one sentence.
14. **Mobile.** At 390 × 844 with a touch pointer: the five tabs are one scrolling strip with the selected tab in view, both tables render as labelled cards, the page never scrolls sideways, tap targets are ≥ 44 px, inputs are 16 px, and More is the lit thumb-bar slot.
15. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; state is never colour alone; focus is visible; the tab is operable by keyboard end to end.
16. **Permissions.** Read requires `steering.read`, checked server-side. Opening an agent requires `agent.read`.
17. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Steering · Assignments: audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
