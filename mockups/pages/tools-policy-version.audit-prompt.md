# Audit prompt: Policy version

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Policy version** page of Oxagen's Tools page (`#/a-intel/core-platform/tools/policy/pol_v42`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/tools-policy-version.md`. Read it first, in full. The version list and the activation, discard, restore and new-draft dialogs are specified in `mockups/pages/tools-policy.md`.
2. The design authority: `docs/mission-control-spec.md` §6.12, `docs/oxagen/specs/tacho/design/adr-0004-tacho-policy-engine-cedar.md` and `docs/oxagen/specs/tacho/design/approval-tokens.md`.
3. The design, rendered: the stories under `Oxagen / Tools / Policy version` in Storybook (`npm run storybook`): Loaded, Loading, Error, Access denied, each also as a mobile story. Or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/tools/policy/pol_v42`. The checker is `node tools/check-creation.mjs`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/tools/policy/pol_v42`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Routes.** `/tools/policy/<version>` opens Rules, `/tests` opens Tests, `/changes` opens Changes. `?rule=rg_0093` lands the caret on that rule and drops the query. An unknown version draws "Policy version not found" with Back to Policy. The Policy tab's version id, Open and Edit land here.
2. **Header.** Eyebrow, h1, the four badges and the actions by state, with the spec's copy. Save the draft is disabled until the editor holds a change.
3. **What changes.** A field on a draft, saved with the draft. A key-value list on any other version, with Reason once an activation recorded one.
4. **Tab counts.** Rules counts the rules in the editor, Tests the version's tests, Changes the rules added, changed or removed against the base. Type a new rule and confirm Rules and Changes follow before you save.
5. **Rule list.** One row per rule in source order, with its `@id`, its decision and new or changed against the base. A row moves the caret to its rule. The decision follows the source: `permit` allows, `forbid` with `@decision("require_approval")` requires approval, any other `forbid` denies.
6. **Editor.** The status bar names Cedar. An active or superseded version is read-only and says so, and no key but find changes it. On a draft, ⌘S saves.
7. **Problems.** Introduce each problem the spec lists (an effect other than permit or forbid, an unclosed bracket, a missing `;`, a missing or repeated `@id`, a bad `@decision`, an unknown context path) and confirm its line and copy. With none, "No problems."
8. **Save.** Save refuses an empty sentence. A save with problems succeeds and says how many remain. The Policy list's Rules count matches the saved source.
9. **Tests.** Columns in order: Call · Agent · Facts · Expected · Result · Decided by. Run tests reports a result and a deciding rule per row. Edit the source, and every result reads "not run" and the badge "not run yet" until the next run. Delete or flip the rule a test depends on and confirm the test fails with what it got. A call no rule permits reads "no rule permits it" and gets deny.
10. **Add test.** The dialog's fields and copy. A new test turns the run stale until Run tests. On a non-draft the dialog refuses.
11. **Add rule.** The dialog's fields, options and copy. The preview follows every change and is valid Cedar. It refuses without a sentence, and without a value the condition needs. A new rule lands unsaved at the end with the next `rg_` id and the caret on it.
12. **Changes.** A draft diffs against the version it was drafted from, any other version against the next older one. Added, Changed and Removed agree with the diff. Unsaved edits appear in it.
13. **Activation gate.** From this page, Activate refuses while the draft is unsaved, while its saved rules have a problem, while its tests have not run against the saved rules, and while a test fails, naming each blocked check. A ready draft asks for a reason.
14. **Valid Cedar.** Every rule sample the page or its dialogs draw parses as Cedar, checked with `checkParsePolicySet` from `@cedar-policy/cedar-wasm`: effects are `permit` or `forbid` only, annotations are `@name("value")`, and conditions use Cedar operators and methods (`has`, `like`, `in`, `.contains()`), with no invented statement or method.
15. **States.** Force each state and compare copy and controls: loading skeleton, error `503 policy_store_unavailable`, access denied naming `tools.read on core-platform`. Each replaces the page body and keeps the shell.
16. **Plain nouns.** No heading or label carries a comma, a mid-dot, a dash or a not/never contrast, including the options of the Add rule selects. The page's prose names no policy language outside the editor's status bar.
17. **One gold action.** Exactly one gold action per state of the version, and one per dialog.
18. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. Each row is ❌ today: the build must say the version is not recorded, and must not show `pol_v42` or its rules from a fixture. A fixture reaching production is a FAIL.
19. **Mobile.** At 390 × 844 with a touch pointer: the Rules panel sits above the editor with rows at least 44 px tall, the source scrolls in its block, the tests are labelled cards, the diff is one column, dialogs are bottom sheets, inputs are 16 px, and nothing scrolls sideways.
20. **Accessibility.** Tabs use `role=tablist/tab`. The editor's textarea is labelled with its path. Dialogs are `role=dialog aria-modal` with a labelled close. A decision reads as a word, not only a colour.
21. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Policy version audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Routes | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
