# Audit prompt: Steering · Compiler

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering · Compiler** tab of Oxagen (`#/a-intel/core-platform/steering/compiler[/<agent>]`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering-compiler.md`, and the hub it belongs to, `mockups/pages/steering.md` (read both first, in full).
2. The design, rendered: the `steering-compiler` stories in Storybook (`npm run storybook`), one per state, desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>`. The checker is `node tools/check-mockup.mjs`.
3. The decisions this tab renders: the story sheet of 2026-09-18, decisions 1, 5, 6, 8, 9, and 11; the product spec §12.6.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with and without the agent segment, and the old route `#/:org/:ws/steering/preview[/<agent>]` resolves to the same tab and agent. The workspace nav reads Fleet, Agents, Tools, Steering, Runtimes, Repositories, Spend, with Steering lit and no Skills entry (Skills is a shelf of the Library tab). The breadcrumb ends on Steering. The top bar has the Approvals button left of the avatar with the organization-wide waiting count; it opens the drawer `#apdrawer`, a selected row shows the approval card with Approve and Deny, and Escape closes it. No assistant button in the top bar.
2. **Hub header, chip, and tabs.** Eyebrow is the workspace name, h1 “Steering”, the one-sentence subtext, the governance chip “Governance: <mode>”. Five tabs in this order: Library, Assignments, Gates, Proposals, Compiler, with counts and none on Compiler. This tab, Compiler, is selected. Each tab is a URL segment, and reloading the URL lands on the same tab and agent.
3. **One gold action.** Write a context record in the hub header is the one gold action. The chip is not gold; no prompt chip is gold.
4. **Sections and tables.** The build has each item below with the same headings and every column named, in that order.
   - Controls: Agent select with “name · harness · tier” options and the tier line under it, Prompt textarea, six prompt chips with the copy the spec quotes.
   - The delivery warning where the spec says it renders, verbatim.
   - Two meters: stable prefix bytes of 16,384 with the split line, volatile tokens of the budget with the fit and cut counts.
   - Three parts, each naming its injection point in its tally: SessionStart additional context capped at 16 KiB, UserPromptSubmit additional context with the budget, files in the checkout with the repository and sync state.
   - Manifest cuts with its badge: Item · Kind · Force · Token cost · Cut because · Why, with the four reasons and no others, and the Why copy per reason.
   - The closing note, verbatim.
5. **Token figures reconcile.** The prefix meter's tokens equal the compile header plus the gate notice rows plus the must and should rows. The volatile meter's tokens equal the sum of the volatile rows. The cut count in the meter, the badge, and the table are the same number. Bytes equal tokens times the bundle's bytes per token.
6. **Actions.** Changing the agent changes the URL and the selection. Typing changes the selection without losing the caret. The same inputs give the same selection every time. Every item id links to where it is authored; a skill path opens the `skill` dialog.
7. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named store; 🟡 rows are wired for the fields that exist and render `NotBacked` for the rest; ❌ rows render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
8. **States.** Force each state and compare copy and controls with the design:
   - **empty** (`state=empty`): the hub header, chip, and tabs stay; the body is “Nothing to compile yet” with its sentences and Write a context record.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “Steering could not be loaded”, `503 record_index_unavailable`, Try again, Open an incident, and the trace line.
   - **access denied** (`state=denied`): “You cannot see this workspace’s steering”, naming `steering.read on core-platform`, with Request access and Back to Fleet.
9. **Trust language.** An agent with no hook shows that nothing is delivered, and the warning names the tier the agent is on. The model request is named as not available until the gateway tier. No copy says an item is enforced. A gate notice is never among the cuts for budget. No verdict, proof, or witness vocabulary.
10. **Plain nouns.** No heading on the built tab carries a comma, a mid-dot, or a not/never contrast; subtext is one sentence. Part eyebrows are “1 · Stable prefix”, “2 · Volatile selection”, “3 · Skills”.
11. **Mobile.** At 390 × 844 with a touch pointer: the five tabs are one scrolling strip and the selected tab is in view; the controls and meters stack; the cut table renders as labelled cards; the page never scrolls sideways; tap targets are ≥ 44 px; inputs are 16 px; More is the lit thumb-bar slot, and its sheet lists Steering with its shelves inside, Runtimes, Repositories, Organization, Billing, and Audit.
12. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; prompt chips use `aria-pressed`; meters carry `role=img` with a percent label; the select and textarea have labels; state is never colour alone; focus is visible; the tab is operable by keyboard end to end.
13. **Permissions.** Read requires `steering.read`, checked server-side. There are no writes on this tab.
14. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Steering · Compiler: audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
