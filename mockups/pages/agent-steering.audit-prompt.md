# Audit prompt: Agent › Steering

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering** tab of one agent in Oxagen (`#/a-intel/core-platform/agents/<slug>/steering`): the SteeringFrames the agent receives for its standing brief, what was excluded, and the Steering Sources behind them. Check it for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/agent-steering.md`. Read it first, in full. The agent header and the tab bar are specified in `mockups/pages/agent.md`.
2. The design, rendered: the stories `Oxagen / Agents / Steering` (Loaded, Loaded · mobile, Loaded · future-only fields marked) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/agents/release-manager/steering`, adding `&future=1` to outline the future-only fields. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (D4, D5, D6, D7, D17; the sections Two objects, Frame types, Emissions, Provenance, Exclusion reasons and Shipped today) and `docs/fleet-operations-ia.md` (Agents). ADR-093 in `macanderson/oxagen`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/agents/<slug>/steering`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The route opens the agent page with Steering selected. The header and tab bar match `agent.md`. The sidebar lights Agents.
2. **Delivery warning.** On an `observe`-tier agent, the warning comes first, opens "Not delivered.", and says nothing below reaches the agent because no hook is installed. On any other tier it is absent.
3. **What it receives.** The sentence names the SteeringFrame count and the standing brief (the agent's preview prompt, or its description when none is set) and ends in one full stop. Open in the Compiler opens the Compiler on this agent. Two meters, Session-start prefix and Per-prompt selection, each "<used> of <cap> tok" with its caption. The type strip lists only the types present, in type order (goal, invariant, constraint, delegation, procedure, context, invocation, capability), each with its count and `aria-pressed`; pressing one filters section 1 and section 2 and adds Show every type. The pick belongs to this agent: another agent's Steering tab opens with every type shown.
4. **Injection points.** Only points that carry frames appear, in the order Session start, Prompt, Prompt submit, Model request, Checkout files, Tool list, each with its caption and "<N> frames · <N> tok". Each is a table Type · SteeringFrame · Source · Force · Tokens. A gate-backed frame that is not a capability carries "enforced by <gate>". The Source cell names the source kind, links the id to where the source is managed, and shows the version with the frame hash (a toolbelt's version is the date it last changed). Rows sort by type, then force, then id. A point shows 4 rows and Show all N. A harness's own tools are not frames. Each active mandate the agent holds appears as a `delegation` frame in Session start.
5. **Excluded.** "<N> resolved for this agent and not delivered." The clause ", each with its reason" is absent from the page and its explanation is in the component help (`mockups/help/agent-steering.md`, Excluded). One table Type · SteeringFrame · Source · Reason · Tokens with the injection point under each body. Every reason is a mono word from the closed vocabulary of the wedge spec (13 words) with the numbers that decided it under it. A scope line names this agent and never a run. A withheld skill reads "Withheld before ranking. The agent is told the count and the reason, never the name." The table shows 6 rows and Show all N. With nothing excluded: "Nothing was excluded.", or with a type picked "Nothing of this type was excluded." Resolve twice with the same inputs: the exclusions must be identical.
6. **Sources.** "<N> sources reach this agent." The clause ", each managed where it lives" is absent from the page and its explanation is in the component help (`mockups/help/agent-steering.md`, Sources). One table Source · Emits here · Frames · Managed in, with the kind, a link and the version in the Source cell, facets on Managed in and Emits here (one type per option), Rows and a pager. Each source appears once: the same skill listed twice under two ids is a FAIL. A Toolbelt source is one toolbelt, not one row per tool.
7. **Two objects.** No source row is drawn as a frame and no frame row as a source. Every frame names its source at a version. A frame without a source version is a FAIL. Two frames with different bodies never share a hash.
8. **Nothing authored.** No control on the tab writes a Steering Source, a record, an assignment or a policy. Every change happens where the source is managed.
9. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named. A fixture reaching production is a FAIL.
10. **Future-only fields.** Until an envelope-per-agent capability (#3879) and per-frame provenance ship, section 1 renders as not recorded and names #3879 (an envelope built from a run's manifest and presented as this one is a FAIL), frame hashes are absent, and exclusion reasons other than `tier`, `budget` and `superseded` render as not recorded. Open in the Compiler is absent or says the Compiler is not available. Any of these drawn with fixture values is a FAIL.
11. **Rollups.** Each point's tally equals the sum of its rows. The type strip counts equal the frames by type. The section 1 total equals the sum of the point tallies. The session-start meter equals the compile header plus the Session start rows; the per-prompt meter equals the Prompt submit rows. The Excluded count equals its rows. The Sources frame counts sum to the section 1 total. The Overview's Steering row and the roster's Steering cell show the same count as this tab.
12. **Honesty.** The tab adds no inference, no score and no model-written account of why. A relevance number appears only inside an exclusion's reason line.
13. **States.** The design has the loaded state only. The build uses the shell's standard loading, error, empty and denied panels; each replaces the page body, never the shell, and loading never flashes zeros.
14. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. The meters stack, the type strip wraps, and every table is a stack of cards with the type badge heading each card and labelled rows beneath. Nothing scrolls sideways; touch targets are at least 44 px.
15. **Accessibility.** The type buttons use `aria-pressed`; tables have header cells; links have names; state is never colour alone; focus is visible; the tab works by keyboard end to end.
16. **Permissions.** Reading requires the agent read and the Steering read, checked server-side. The tab has no writes.
17. **Rules.** A frame and a SteeringFrame never share a name on screen. A Steering Source and a SteeringFrame are never shown as each other. No person is scored or ranked. No heading or label carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. No gold action on the tab.
18. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Agent Steering audit {{DATE}}
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
