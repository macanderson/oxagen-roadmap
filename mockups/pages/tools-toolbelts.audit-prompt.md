# Audit prompt: Toolbelts

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Toolbelts** tab of Oxagen's Tools page (`#/a-intel/core-platform/tools/toolbelts`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/tools-toolbelts.md`. Read it first, in full. The header and tab bar it shares are specified in `mockups/pages/tools.md`.
2. The design authority: `docs/fleet-operations-wedge.md`, sections Steering › Two objects, Frame types, Emissions (the Toolbelt row) and Steering › Shipped today, and decisions D4, D5 and D17.
3. The design, rendered: the stories under `Oxagen / Tools / Toolbelts` in Storybook (`npm run storybook`): Loaded, Empty, Loading, Error, Access denied, each also as a mobile story. Or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/tools/toolbelts`. The checker is `node tools/check-mockup.mjs`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/tools/toolbelts`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with Toolbelts selected in the tab bar and Tools lit in the sidebar. The header is the one `tools.md` specifies, with New tool plain on this tab.
2. **Toolbelts panel.** Title "Toolbelts", the caption verbatim, the "N toolbelts · N tool versions" badge, and New toolbelt as the tab's one gold action.
3. **Toolbelts table.** Columns in order: Toolbelt · Owner · Tools · Providers · Agents assigned · Gates on its tools · Availability · Updated. The Toolbelt cell is the name over the purpose. Owner is the team over the person who last changed it. A toolbelt nobody carries reads "Unassigned", never a zero or a blank. A row opens the toolbelt and is operable by keyboard. The note under the table is verbatim.
4. **Delivery panel.** Title "Delivery", the caption verbatim, columns Agent · Toolbelts · Tool versions · Providers · Tier. A row opens that agent's Toolbelt tab.
5. **Toolbelt dialog.** The unavailable warning where a version cannot be called, and the toolbelt's own note where it has one. Owner with the last change, Providers, Agents assigned (each a control into that agent's Toolbelt tab) and Gates on its tools. "Tool versions on this toolbelt" (Tool version · Provider · Hazard · Gate · Calls 30d), where a missing version says a call by that name fails as an unknown tool. The closing note, then Remove, Assign to an agent and Edit tools. Remove refuses while an agent carries the toolbelt. Edit tools says how many agents the change reaches.
6. **New toolbelt.** Name · What it is for · Owner (platform, finops, security), the note verbatim, Cancel and Create. Creating a toolbelt that the table does not show afterwards is a FAIL unless the control says it is a stub.
7. **Arithmetic.** Recompute from the assignment record and the registry: the badge's toolbelt and distinct-version counts, the agents on each toolbelt, the providers on each toolbelt, the gate counts per toolbelt, and the tool-version count per agent on Delivery (the union of that agent's toolbelts). A constant, a typed figure, or a count that survives removing a tool from a toolbelt is a FAIL.
8. **Availability.** Availability reads Unavailable exactly when a version is behind a live kill switch or absent from the registry. Flip a switch that covers a toolbelt's version and confirm the row and the dialog change on the next render.
9. **Frames.** A toolbelt emits one `capability` SteeringFrame per tool it shows the model. Open the toolbelt's source row on Steering › Sources and a capability frame on the Compiler: the frame count excludes every harness-native tool (the Workstation toolbelt emits none), and each frame's source link opens this toolbelt, at the version the frame names. A frame whose source is a tool version rather than the toolbelt is a FAIL. While frames have no contract they render as not recorded.
10. **The chain.** Follow a toolbelt to its providers and its agents, and a Delivery row to the agent. Every leg is a link or a button. A plain-text dead end is a FAIL.
11. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named (#3852). Toolbelts and assignments have no store today: the build must say so in place of the rows, not show an empty table as if no toolbelt existed. A fixture reaching production is a FAIL.
12. **States.** Force each state and compare copy and controls with `tools.md`: empty "No provider is registered", loading skeleton with no zeros, error `503 tool_registry_unavailable` with Try again and Open an incident, access denied naming `tools.read on core-platform` with Request access and Back to Work. Each replaces the header and tab bar and keeps the shell.
13. **Trust language.** Nothing on the tab calls an assignment a permission or a grant. Gate and availability show the recorded value. A refusal claim names the tier (routed through Oxagen, or the `harness` tier's hook, reported by the harness and fail-open).
14. **Plain nouns.** No heading or label carries a comma, a mid-dot or a not/never contrast. Subtext under a heading is one sentence.
15. **One gold action.** Exactly one gold action is visible: New toolbelt. In the toolbelt dialog, one: Edit tools.
16. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar reads Work, Agents, Tools, Spend, More with Tools lit. The tab bar scrolls in its own row with Toolbelts in view. Both tables render as labelled cards, and the toolbelt dialog is a bottom sheet. Touch targets are at least 44 px, inputs are 16 px, and nothing scrolls sideways.
17. **Accessibility.** Clickable rows expose `role="button"` or a link, a label naming what they open, and keyboard operation. Tabs use `role=tablist/tab`. Dialogs are `role=dialog aria-modal` with a labelled close. State is never colour alone.
18. **Permissions.** Read requires `tools.read`. `toolbelt.create`, `toolbelt.edit` and `toolbelt.assign` are gated server-side. Verify with a role that lacks each.
19. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Toolbelts audit {{DATE}}
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
