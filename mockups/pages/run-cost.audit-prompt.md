# Audit prompt: Run cost

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Cost** tab of a run in Oxagen (`#/a-intel/core-platform/runs/<run id>/cost`) for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/run-cost.md`, and `mockups/pages/run.md` for the header, Summary, stat row, tab bar and side column this tab shares. Read both first, in full.
2. The design, rendered: the stories `Oxagen / Runs / Cost` (Loaded, Loaded · mobile) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW/cost`. The checker is `node tools/check-mockup.mjs`.
3. The product spec: `docs/mission-control-spec.md` §12.6 (token classes) and §12.9 (the run waterfall); `docs/fleet-operations-ia.md` (Run, Cost).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/runs/<run id>/cost`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route.** `/runs/<run>/cost` opens this tab with Cost selected; `?tab=cost` answers 308 to the segment; reloading keeps the tab.
2. **Shared parts.** The header, Summary, stat row, tab bar and side column match `run.md` (run its checks 2 to 5 and 13 here, or cite that audit).
3. **Order.** The tab reads, top down: Model fit, the six instruments, Spend by area, Tool calls, Waterfall, then Spend by token class beside Prompt composition. Nothing else.
4. **Model fit.** The heading "Model fit" with the badge "generated · not the record", one card for the model and one for the effort. A card that reads over or under states what it read and offers one action ("Move this agent to <model>" or "Set effort to <value>"); a fit card and an effort card with no reading offer none. The footer names what the reading read and says a reading changes nothing until somebody merges it. The rig strip's fit badges in the header match these cards.
5. **Model and effort honesty.** The reading is keyed on prompts, failed tool calls, turns and steps, never on reasoning share. The effort card shows a value only where the record holds the setting, and otherwise names the reason and offers nothing. Force a run where the effort is not recorded and confirm no value is printed. The reading's "failed" count equals the failed calls the Transcript shows.
6. **fitchange.** The action opens a dialog with the argument, Agent, File (`.oxagen/agents/<slug>.toml`), Today, Proposed and "Effect on this shape of run", the note that sealed runs keep their model, and "Cancel" and "Open the pull request". Opening it writes a pull request against the agent definition through `commit_agent_definition`. A build that writes the model on the run record is a FAIL.
7. **Instruments.** Six tiles in this order: Cost so far, Wall clock, Tokens, Shape of the run, Tool calls, Productive ratio, each with a name, a basis, one figure, one line, a chart and a foot as the spec's table gives them. A figure the record does not carry (this agent's median run, its 30-day productive ratio) reads not recorded, never a zero or a seeded value.
8. **Spend by area.** Seven areas in the spec's order, each with a cost and tokens, then Dearest tools, then the note. In a build the six input areas read not recorded until G3 ships, and the tools are listed by calls rather than priced.
9. **Tool calls.** Calls by family (Family · Calls · a bar · Share · Wall clock · Failed, with the family note), Tools per batch (the histogram, Batches, Widest batch, Mean fan-out, Wall clock won) and Speculative prefetch (Eligible, Hit rate, Wall clock saved, Billed). In a build the prefetch figures read not recorded.
10. **Waterfall.** The badges (findings count, turns and cost with basis), the chart (one bar per turn at its cost, the dashed cost-so-far line ending at the total, a diamond per pinned finding), the legend, the caption, and the table Turn · Steps · Frames · Cache hit · Cost · Running total · Pinned with a total row "of <cost> recorded". A turn whose cost was not recorded draws no bar and says so. Every diamond and Pinned badge opens that finding's evidence.
11. **Token classes and composition.** Spend by token class lists the design's five classes and the rollup's sixth, `cache_write_1h`, after `cache_write_5m` (`input_uncached`, `cache_read`, `cache_write_5m`, `cache_write_1h`, `output`, `reasoning`), with Tokens, Cost and Share and a total row. Prompt composition lists Conversation, Context frames, Tool definitions, Steering and System, then Effective input price, Cache write cost share, Basis and Productive ratio. In a build the composition meters read not recorded until G3 ships.
12. **Rollups.** The Tokens tile equals the stat row's Tokens and the token class total. The Shape tile's steps and frames equal the waterfall total row. The waterfall's Cost column sums to its total row. The token class costs sum to their total. The Tool calls panel's calls equal the Tool calls tile and the tool rows in the Transcript. A typed figure or a seeded one is a FAIL.
13. **Basis.** Every money figure shows its basis. `gateway_observed` appears only where the proxy counted the call. A class the harness did not report is marked absent, never zero.
14. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows read the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named. A fixture reaching production is a FAIL.
15. **States.** The design has the loaded state only. The build uses the shell's standard loading, error, empty and denied panels; each replaces the page body, never the shell, and loading never flashes zeros.
16. **Mobile.** At 390 × 844 with a touch pointer: the instruments stack to one column; the panels stack; the waterfall chart scrolls inside its panel and the page never scrolls sideways; the tables become labelled cards; `fitchange` is a bottom sheet; hit areas are at least 44 px.
17. **Accessibility.** The chart has `role=img` and a label naming the total; each bar and column shows its figures on focus as well as hover; state is never colour alone (a turn carrying a finding has a badge, not only a red bar); the tab works by keyboard end to end.
18. **Permissions.** Reading requires `get_run_cost` and `get_run_turns`, checked server-side. `commit_agent_definition` is gated server-side; verify with a role that lacks it.
19. **Rules.** No person is scored or ranked. The Model fit reading is labelled generated and argues for a pull request; it is never a verdict. No heading or label carries a comma, a mid-dot, or a not/never contrast. No gold action on the tab itself; `fitchange`'s "Open the pull request" is the one gold while it is open.
20. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Run cost audit {{DATE}}
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
