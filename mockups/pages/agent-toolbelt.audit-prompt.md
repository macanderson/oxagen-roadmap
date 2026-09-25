# Audit prompt: Agent › Toolbelt

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Toolbelt** tab of one agent in Oxagen (`#/a-intel/core-platform/agents/<slug>/toolbelt`) for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/agent-toolbelt.md`. Read it first, in full. The agent header and the tab bar are specified in `mockups/pages/agent.md`.
2. The design, rendered: the stories `Oxagen / Agents / Toolbelt` (Loaded, Loading, Error, Access denied, each also · mobile) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/agents/triage/toolbelt`. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (D5, the Emissions row for Toolbelt, D17) and `docs/fleet-operations-ia.md` (Agents); the toolbelt in `docs/mission-control-spec.md` §6.6.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/agents/<slug>/toolbelt`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The route opens the agent page with Toolbelt selected; its count equals the toolbelt's width. The header and tab bar match `agent.md`.
2. **How the toolbelt is built.** No subtext and no sentence under the wire: the rebuild rule and the registry sentence (versions, providers, and what a call outside the toolbelt does) are absent from the page and present in `mockups/help/agent-toolbelt.md`, How the toolbelt is built. The badge names the active policy and the kill-switch generation. The wire joins grants, the delegation ceiling (the operator), the policy bundle and the kill switches into the toolbelt with its width. Every figure matches the toolbelt read.
3. **Model view.** The subtext states the width against the workspace's limit (40) and the presentation it earns: "N tools · Searchable (over the limit of 40)." or "N tools · All tools sent (under the limit of 40).". The Toolbelt presentation group has Searchable and All tools sent with `aria-pressed`. Searchable shows the tools block with `search_tools`, `load_tools` and the pinned tools; All tools sent shows every definition with its schema digest and "… N more" past six. Neither view carries a note or a footnote: the meta-tool note, the trailer paragraph and the comparison note are absent from the page and present in `mockups/help/agent-toolbelt.md`, Model view. The toggle changes nothing stored and resets when another agent opens.
4. **Toolbelt search.** No subtext. The field reads as `search_tools(…)` with Run and Enter. The five example queries are present. A hit lists tools on the toolbelt only, at most eight, followed by "<N> of <M> tools matched." and nothing more. A miss reads "Zero results." and names a registry tool that exists and why it is not on the toolbelt. The explanations (what `search_tools` returns, and why a search never returns a tool outside the toolbelt) are absent from the page and present in `mockups/help/agent-toolbelt.md`, Toolbelt search. Search for a tool that is not on the toolbelt: it must not appear as a hit.
5. **Per-tool decision rules.** No subtext and no footnote under the table; the policy-engine explanation and the "other N" line are in `mockups/help/agent-toolbelt.md`, Per-tool decision rules. Tool names (Labels, API names) and Layout (By category, Flat) groups with `aria-pressed`; the "N of M shown" badge; category chips with counts; the hazard and gate counts; What the categories mean. Columns in order: Tool · Category · Decision · Hazard · Egress · Financial · Schema digest. The rule that decided shows under each decision. Grouped rows have a heading per category with its meaning and count. A row opens the tool dialog.
6. **Not on the toolbelt.** Subtext "A sample of the <N> registry versions outside this toolbelt.", the badge "not visible to the model", and the table Tool · Reason with Rows and a pager. Every tool listed here is absent from the decision table and from the tools block.
7. **Agreement with Steering.** The tools in the tools block are the Tool list `capability` frames on the Steering tab. A tool the Steering tab excludes as `overridden_by_gate` does not appear in the tools block. A harness's own tools (Bash, Edit, WebFetch) are not in the tools block and are not frames. A Codex agent shows no Claude Code tools.
8. **Dialogs.** The tool dialog shows the tool's category, hazard, side effect, decision, egress, financial class, description, Schema digest, Schema origin, Credential, Price and the input schema. The categories dialog lists each category with its meaning. Both close with a labelled close button.
9. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it (`get_agent_toolbelt`, `list_tool_versions`, `search_tools`). ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named. A fixture reaching production is a FAIL.
10. **Future-only fields.** The trailer, the pinned tools, an agent-scoped toolbelt search, `denied` and `mandate + approval` decisions on toolbelt rows, a `critical` hazard on a toolbelt row, and harness tools as toolbelt rows render as not recorded or are absent until their contracts ship. Any of them drawn with fixture values is a FAIL.
11. **Rollups.** The tab count, the wire's toolbelt figure, the Model view width and "N of M shown" agree. The category chips, hazard counts and gate counts equal the rows. The Not on the toolbelt sample count equals the registry versions less the toolbelt's width.
12. **Trust language.** The decision column states what the policy answers, never that a call was enforced. A harness tool's decision says it is decided at the harness's hooks. Nothing says proven, verdict, score or percentile.
13. **States.** Force each state and compare with `agent.md`: loading (skeleton, no zeros), error (`503 iam_principals_unavailable`, Try again, Open an incident, trace line), access denied (the missing permission, Request access, Back to Work, Signed in as, Needed, Decided by).
14. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. The wire wraps; the tools block scrolls inside its own box and the page never scrolls sideways; the tables become cards with labelled cells; dialogs are bottom sheets; touch targets are at least 44 px.
15. **Accessibility.** The presentation, names and layout groups use `role=group` with an `aria-label` and `aria-pressed`; the search field has a label; dialogs are `role=dialog aria-modal` with a labelled close; state is never colour alone; focus is visible; the tab works by keyboard end to end.
16. **Permissions.** Reading requires the toolbelt read (`get_agent_toolbelt`), checked server-side. The tab has no writes.
17. **Rules.** Permissions is not claimed here and tools are not listed on Permissions. A frame and a SteeringFrame never share a name on screen. No heading or label carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. No gold action on the tab.
18. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Agent Toolbelt audit {{DATE}}
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
