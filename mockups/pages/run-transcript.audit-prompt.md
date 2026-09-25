# Audit prompt: Run transcript

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Transcript** tab of a run in Oxagen (`#/a-intel/core-platform/runs/<run id>/transcript`) for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/run-transcript.md`, and `mockups/pages/run.md` for the header, Summary, stat row, tab bar, side column and frame dialog this tab shares. Read both first, in full.
2. The design, rendered: the stories `Oxagen / Runs / Transcript` (Loaded, Loaded · mobile) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/transcript`. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (D14, and the Decision trace honesty rule 2 on returned thinking) and `docs/fleet-operations-routes.md` (Runs).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/runs/<run id>/transcript`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route.** `/runs/<run>/transcript` opens this tab with Transcript selected. The old app address `?tab=transcript` answers 308 to the segment, and `?kinds=`, `?frames=` and `?body=` keep their names on it. Reloading keeps the tab and the filters in the address.
2. **Shared parts.** The header, Summary, stat row, tab bar and side column match `run.md` (run its checks 2 to 5 and 13 here, or cite that audit).
3. **No playback.** There is no play, pause, step, scrub, speed or position counter anywhere on the tab, and every row is present on load without a reveal animation or an auto-scroll.
4. **Tools row.** The search field with the placeholder "Search the transcript…" and the aria-label "search the transcript"; "<shown> of <all> entries" while a query is typed. The kind chips in this order, each with a count and `aria-pressed`: prompt, responses, provider thinking, tools, usage, recall, seal. The "none" and "all" toggle. "✗ errors" with the failed-call count and `aria-pressed`. The button "expand the provider’s thinking", which turns into "collapse the provider’s thinking".
5. **Run bar.** The task reference (or the run id), the agent led by its harness mark, the model, the turns, the steps and the entry count; "errors only" while that filter is on; the state chip ("● live", "⏸ paused" or "⏸ parked"); and the burn figure "<cost of the entries in view> of <run total>".
6. **Rows.** Each entry kind renders as the spec's table says: the prompt with "YOU" and its three sub-items; a steer with "STEER", the quote, the issuer, the delivery and its `control.steer` chip; model text with "AGENT", or "ANSWER" on the last text of a sealed run, folded to its first sentence; returned thinking; usage with its cost, cost so far and frame chips; recall; a tool call led by the tool's name and its arguments on one line with its chips; the output around its first error line; a file change with its diff and "new file" where created; the seal. A `TodoWrite` call is an ordinary tool row.
7. **Returned thinking.** The fold reads "thinking the provider returned · <N> line(s)" and is folded by default. Its title says it is text the provider returned and not the model's hidden reasoning. Nowhere on the tab or in the Decision trace is it called the model's reasoning or presented as how the model decided.
8. **Decisions and frames.** Every ⚖ chip shows the decision word, the rule and the frame, and opens that frame in the frame dialog. Every "fr N" chip opens that frame. A parked call shows "⏸ parked · <approval id> · fr <N>" and, under it, only "Held at the gateway for up to 10 minutes." No line names a Governed actions tab. The recall row's second link names where it goes, never a Context tab.
9. **Filters and search.** Each chip hides and shows its kind. "none" turns every chip off and "all" turns them on. "✗ errors" shows only failed calls. Search matches entry text, tool names and arguments, outputs, diffs and the model id. The empty messages read "no failed calls in this run.", "nothing matches this search." and "nothing to show with these filters."
10. **No note, and the compacted run.** Nothing renders under the feed: the explanation of what the transcript is lives in the component help (`mockups/help/run-transcript.md`, Transcript), and with `?help=1` the tools row and the feed each carry a `?` that opens their section. A compacted run shows "**Compacted.** This transcript is read from the archive." above the tools row, and nothing more.
11. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows read `get_run_transcript` (or the named contract). 🟡 rows are wired for the fields that exist and render not recorded for the rest. A fixture reaching production is a FAIL.
12. **Rollups.** Each chip's count equals the entries of that kind. The errors count equals the failed tool calls. The run bar's entry count equals the rows. The last "Σ" figure equals the run's recorded cost, and the burn figure equals the sum of the usage rows in view.
13. **States.** The design has the loaded state only. The build uses the shell's standard loading, error, empty and denied panels; each replaces the page body, never the shell, and loading never flashes zeros.
14. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar with Work lit; the tab bar scrolls with snap; the tools row wraps; the search input is 16 px; outputs and diffs scroll inside their block and the page never scrolls sideways; every chip and link has a hit area of at least 44 px.
15. **Accessibility.** The chips are buttons with `aria-pressed`; the folds are buttons with `aria-expanded` or a label; the search field has a label; state is never colour alone (a failed call shows "✗", not only red); the tab works by keyboard end to end.
16. **Permissions.** Reading requires `get_run_transcript`, checked server-side (`sensitivity: "high"`). The tab has no write of its own.
17. **Rules.** A frame and a SteeringFrame never share a name on screen. No inference, no score, no model-written account of why. No heading or label carries a comma, a mid-dot, or a not/never contrast. No gold action on this tab.
18. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Run transcript audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
