# Audit prompt: Spend optimization

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Optimization** view of Spend in Oxagen (`#/a-intel/core-platform/spend/optimization`, with `?part=`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/spend-optimization.md`. Read it first, in full, and `mockups/pages/spend.md` for the header, tiles and tabs this view shares.
2. The design, rendered: the `Oxagen / Spend / Optimization` stories in Storybook (`npm run storybook`): Loaded and Loaded · mobile. Or open `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/spend/optimization`, then `?part=tokens`, `?part=agents` and `?part=habits`.
3. The design authority: `docs/fleet-operations-wedge.md` (D9, D10, D15, Cuts), `docs/fleet-operations-ia.md` (Spend). In `macanderson/oxagen`: the operator review in `docs/VISION.md`. `docs/mission-control-spec.md` §12.6 and §12.8.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/spend/optimization`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/spend/optimization` with the Optimization tab selected, and `?part=` selects the part. `/spend/waste`, `/spend/tokens` and `/spend/coaching` land here with a 308, on the waste, tokens and agents parts. `/spend/findings` lands on Work, Findings. No Findings list renders on Spend.
2. **Header, tiles and tabs.** As `spend.md`. Set a budget is the one gold action; every action in the parts is a plain button.
3. **Parts.** A group of four buttons with `aria-pressed`: Unproductive spend, Tokens and cache, Agents (N), Operator habits (N). Each count equals its list.
4. **Unproductive spend.** By cause lists each cause with its run count, amount, bar and one line saying what the frames show; the amounts sum to the Wasted tile. Runs with unproductive spend shows one card per run with the run link, agent, operator, start, unproductive of cost, badges, the work order's title, the frame, step, cache and model line, Open the run and Show the frames. The closing note says unproductive spend is a claim about frames and that accepted work is never counted.
5. **Tokens and cache.** By token class: Class · Tokens · Share · Cost for `input_uncached`, `cache_read`, `cache_write`, `output`, `reasoning`, and beneath it Cache hit rate, Cache write cost share, Effective input price, Unmapped classes. Prompt composition: Conversation, Tool results, Context frames, Tool definitions, Steering, System, Output, Reasoning. By harness: Harness · Agents · Tokens · Cache hit · Spend · Basis, with the observed-share badge and the note defining observed and self-reported. By agent: Agent · Runs · Tokens · Per run · Cache hit · Tool defs · Context · Tool results · Reasoning · Basis, the twelve agents with the most tokens, each row opening the agent. Missing or renamed columns are FAILs.
6. **Agents.** Recommendations for agents: Agent · Recommendation · The record · A month · action, ordered by money a month. The seven recommendations are those the spec names, each raised by its signal and carrying its one action (Edit the grant, Open steering, Propose a record, Open the compiler, Edit the definition, Open incidents). Each action opens the place where a person makes the change. A recommendation with no recorded signal behind it is a FAIL.
7. **Operator habits.** One card per habit, in alphabetical order of the name as shown. Each card holds the name, the habit, the record line with the numbers it was read from, the rule set off as a quotation, and Share with the first name; the re-read habit also carries Propose the record. The habit set covers what `docs/VISION.md` names (turns to completion, restarts on the same task, steering overridden by hand instead of written as a rule, routed requests the operator approved every time) as each ships, and each habit carries exactly one rule.
8. **No person is graded.** Search the build for any rank number, score, percentile, severity, grade, verdict or money-ordered list of people in the habits part. One is a FAIL. The panel says the record reports what happened.
9. **Figures reconcile.** By cause sums to the Wasted tile. By token class sums to the Tokens tile. The cache hit rate equals `cache_read ÷ (input_uncached + cache_read)` over the classes shown. A recommendation's money and its record line come from the same rollup the Tokens and cache part prints. A figure typed by hand is a FAIL.
10. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows (the token classes, the By agent runs, tokens, per run, cache hit, reasoning and basis) are wired to `get_spend`. The one shipped waste cause (`cache_write_never_read`) and its proving runs are wired to `list_waste`. Every ❌ row renders as not recorded with the gap named: the six design causes, each run's amount and steps, Show the frames, cost by class, Prompt composition, By harness, the three prompt-part columns of By agent, Recommendations for agents and Operator habits. A fixture reaching production is a FAIL, and so is a recommendation or habit the build invents without its signal.
11. **States.** The design has the loaded state only. The build uses the shell's standard loading, error, empty and denied panels, and an empty part says so in one line.
12. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with Spend lit; the part buttons wrap; every table becomes labelled cards; the meters, run cards and habit cards stack at full width. Nothing scrolls sideways. Touch targets are at least 44 px.
13. **Accessibility.** The part buttons carry `aria-pressed`. The tabs use `role=tab` with `aria-selected`. The meters and bars carry their figures as text. State is never colour alone. The page is operable by keyboard end to end.
14. **Permissions.** Read requires `spend.read`. Each action lands on a page that checks its own permission. Sharing a rule is a governed action and lands in Audit.
15. **Rules.** Check each rule in the spec's last section: the Prompt composition labels cannot read as recorded frames; no source shown as a frame; every figure reads the record; no person scored or ranked; basis on money and tier on enforcement; headers are rollups; plain-noun headings with one-sentence subtext (flag the design's multi-sentence subtext under Recommendations for agents and Operator habits if the build copies it); exactly one gold action; future-only fields render as not recorded.
16. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding. The reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Spend optimization: audit {{DATE}}
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
