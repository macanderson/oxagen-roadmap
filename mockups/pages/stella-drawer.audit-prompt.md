# Audit prompt: Stella drawer

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built drawer against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Stella drawer** of Oxagen, the in-app agent that opens from the foot of the sidebar on every page, for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/stella-drawer.md`. Read it first, in full.
2. The design, rendered: the stories `Oxagen / Drawers / Stella` (Loaded, Loaded · mobile) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>&drawer=stella#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW`. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (D16) and `docs/fleet-operations-ia.md` (Drawers). The contract: `ask_assistant` in `macanderson/oxagen` (`packages/oxagen/src/contracts/assistant.ask.ts`).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Where it opens.** The launcher at the foot of the sidebar reads "Ask stella*" with the gold asterisk and carries `aria-controls` and `aria-expanded`; the More sheet on a phone has the "Ask stella*" tile; the command menu opens it. There is no assistant button in the top bar. It opens on every page (D16).
2. **The drawer.** It flies out from the sidebar over the page and the page does not move. Closed, it is `inert` and `aria-hidden`. A half-typed message survives a close and reopen. The header shows the Stella wordmark (labelled "stella", the asterisk gold in both themes) and a close button labelled "Close the assistant".
3. **Turns.** Sending a message calls `ask_assistant` and posts the reply under "stella*", with a chip naming the run the turn was recorded as and that it is Oxagen's. The turn's run opens through `get_run` and is absent from the workspace's run list.
4. **Page context.** Each turn carries the page it was asked from: the route key, the organization, the workspace and the record on the page. Ask "why did this run stop?" on a run page and confirm the answer reads that run's record. A turn asked on an organization page offers no composer.
5. **Action cards.** Each governed action a turn took renders as a card with "action", the capability in mono, and its facts: what it changed, the decision with the policy and rule, and the receipt. A change to a repository file is a pull request for a person to merge, through the capability that owns that file (`commit_agent_definition` for an agent definition, `open_context_pr` for a Steering record). A write that waits on a person comes back as a parked approval and shows in the Approvals drawer.
6. **The composer and the foot line.** The text area with the placeholder "Ask about a run, or change something" and the label "Message the assistant", and "Send". The foot line says the assistant acts through the same governed actions, holds no authority and no credentials, and bills its model calls to the organization's credit balance, naming the model and the engine once they are read, and neither before.
7. **Engine down and no key.** With the engine refusing (`engine_unavailable`), the drawer names the engine and the failure, offers "Retry", disables the composer, and answers from nowhere else. With no model key, it says the organization has no model key and that nothing was charged, offers "Open funding", names `org.admin`, and disables the composer.
8. **Vocabulary.** The drawer names Spend's views as they are (Overview, Budgets, Optimization) and never a Coaching tab or a Fleet page.
9. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows read the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded or are left out. The launcher shows no model or engine state it did not read. A canned conversation reaching production is a FAIL.
10. **States.** The design has the loaded state only, with the engine-down and no-key conditions. The build uses the shell's standard treatment for anything else until it is designed.
11. **Mobile.** At 390 × 844 with a touch pointer: the drawer opens from More and covers the page full width; the composer and the foot line sit above the thumb bar and are not covered by it; the text area is 16 px; every button has a hit area of at least 44 px; nothing scrolls sideways.
12. **Accessibility.** The drawer has a name; the close button is labelled; the launcher carries `aria-expanded`; the text area has a label; state is never colour alone; the drawer works by keyboard end to end.
13. **Permissions.** `ask_assistant` is checked server-side. Every action a turn takes passes its own capability's IAM check as the person and lands in Audit. Verify with a role that lacks a capability Stella is asked to use: the turn reports the refusal and changes nothing.
14. **Rules.** Stella's reply is labelled as Stella's and never appears in a run's Decision trace. No person is scored or ranked. No heading or label carries a comma, a mid-dot, or a not/never contrast; the turn chip names the run and whose it is without the mockup's contrast. Exactly one gold action per screen.
15. **Nothing extra.** List anything in the built drawer that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Stella drawer audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Where it opens | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started, stop and report that as the single FAIL.
