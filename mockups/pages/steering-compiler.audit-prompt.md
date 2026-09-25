# Audit prompt: Steering › Compiler

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built view against its design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering › Compiler** view of Oxagen (`/{org}/{ws}/steering/compiler/{agent}`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering-compiler.md`. Read it first, in full. `steering.md` specifies the header, the tabs and the shell; `steering-source.md` and `steering-source-skill.md` the pages each frame's source links to.
2. The design, rendered: the stories `Oxagen / Steering / Compiler` in Storybook (`npm run storybook`): Loaded, Loaded · mobile, and Loaded · future-only fields marked. Or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/steering/compiler/release-manager`, with `&future=1` to outline the future-only fields. Try each brief chip and each agent, and `#/a-intel/finops/steering/compiler/invoice-bot` for a `delegation` frame.
3. The design authority: `docs/fleet-operations-wedge.md` (D4, D5, D6, D11, D12; the Steering sections Frame types, Emissions, Provenance, Exclusion reasons and Shipped today, which says the Compiler is future-only until #3879), `docs/fleet-operations-ia.md` (Steering, Compiler) and ADR-093 §4 in `macanderson/oxagen`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/steering/compiler/{agent}` and `/steering/compiler`, and `/steering/preview/{agent}` resolves to the Compiler for that agent. Compiler is selected; the header, the tabs and the shell match `steering.md`; the kind filter does not render.
2. **Until #3879 ships.** If the build has no capability that runs the assembler without delivering, the Envelope and Exclusions render "not recorded" and name the gap. A build that fills them from fixtures, or from one run's manifest presented as a resolution, is a FAIL. Mark the checks that need the envelope N/A with this reason, and still run checks 1, 3, 12 to 17.
3. **Controls.** The Agent select, labelled, with "<name> · <harness>" options, and the tier badge and repository under it; changing it writes `/steering/compiler/<slug>`. An agent the address names that has no standing brief still resolves, in every workspace. The Brief text area, labelled, with its placeholder and the line "Sends nothing. Nothing here reaches an agent." The six brief chips in a group, with `aria-pressed` on the one in use.
4. **Sends nothing.** Typing, choosing a chip and changing the agent write no run, no frame, no record and no audit event. Check the network log: every request is a read.
5. **Envelope.** The caption states the SteeringFrame count, the agent and the repository. The two meters read "<used> of <cap> tok" with their sub-lines. The type strip sums the frames by type. One block per injection point that carries frames, in the order Session start, Prompt, Prompt submit, Model request, Checkout files, Tool list, each with its description and "<n> frames · <tok> tok". Columns: Type, Frame, Source, Force and Tokens, in that order.
6. **Rollups.** The caption's count equals the frames across the blocks. Each block's figures equal its rows. The session-start meter equals the compile header plus the Session start frames, and its cap is the budget the manifest records (2,000 tokens today, not a fixed 4,096). The volatile meter equals the Prompt submit frames. The exclusions' count equals its rows. A figure that disagrees with its rows is a FAIL; name both values.
7. **Provenance on every frame.** Every Source cell names the kind, the id as a link, and the version with the frame's hash. Each link lands on the source at the version it names: a record, document, memory, glossary term or the instructions on its page, a skill on its skill page (never "No skill here"), an agent definition on the agent's Source tab, a gate notice where its gate is edited, a mandate on the agent's Delegation, a toolbelt on Tools › Toolbelts. Every frame the envelope attributes to a source appears on that source's page with the same id.
8. **Exclusions.** The caption, the table (Type, Frame with the injection point under it, Source, Reason and Tokens), and every reason from the wedge spec's closed vocabulary with the numbers that decided it: the rank, relevance, cost and remainder for `over_budget`, the scope for `out_of_scope`, the rule for `overridden_by_gate`, the record for `overridden_by_must`, the newer version for `superseded`. A reason outside the vocabulary, or one without its numbers, is a FAIL.
9. **Determinism.** Resolve the same agent and brief three times: the frames, their order, their ids and the exclusions are identical. Resolve "CI is green, merge the release pull request" for the release manager and confirm the memory `mem_01K5QX7C` is excluded as `overridden_by_must` by `ctx.release.never-merge`.
10. **Type filter.** Pressing a type filters both sections to it, and "Show every type" clears it. Each button carries `aria-pressed`. Note whether the captions say the list is filtered.
11. **Frame types, not kinds.** Every frame carries one of the eight types (`goal`, `invariant`, `constraint`, `delegation`, `procedure`, `context`, `invocation`, `capability`). A delegation frame appears for an agent with an active mandate. A harness's own tools are not frames. A tool the belt denies is excluded, not listed.
12. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to `list_agents` and its `enforcementTier`. 🟡 rows show what a run's manifest records and nothing more. ❌ rows render "not recorded" or are absent. A fixture reaching production is a FAIL.
13. **Future-only fields.** With the design's `?future=1`, the Envelope section, each frame's hash and every reason badge beyond `tier`, `over_budget` and `superseded` are outlined. In the build each renders as the spec's "What a build shows today" says, and so does the unmarked Exclusions section, the briefs, the repository line and the volatile meter.
14. **States.** Loaded only. Force `state=loading`, `error`, `empty` and `denied` and confirm the shell's standard panels replace the page body and keep the shell, with no zeros and no stale rows.
15. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with More lit; the tabs scroll sideways with Compiler in view; the controls and meters stack; the chips wrap; every frame table renders as labelled cards; the page never scrolls sideways; tap targets are at least 44 px; the Brief text area is 16 px and does not zoom.
16. **Rules.**
    - No model and no score take part in the resolution, and nothing on the view says one did.
    - No heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. Note where the design breaks this.
    - Exactly one gold action: the header's New source. No chip, meter or type button is gold.
    - Every enforcement claim names the tier and "routed through Oxagen".
    - No person is scored or ranked.
17. **Accessibility.** The select and text area have labels; the meters carry `role=img` with a percent label; the chip group and type buttons use `aria-pressed`; state is never colour alone; focus is visible; the view is operable by keyboard end to end, and typing keeps the caret.
18. **Permissions.** The read is refused server-side without the Steering read. There are no writes on this view.
19. **Nothing extra.** List anything on the built view that is not in the spec: a Run button, a send action, a delivery warning, a Preview label. Each is a finding.

## Output

Return a single markdown report:

```
# Steering › Compiler: audit {{DATE}}
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
