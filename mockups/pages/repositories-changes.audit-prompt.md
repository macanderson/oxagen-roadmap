# Audit prompt: Repository changes

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Changes** tab of Repositories in Oxagen (`#/a-intel/core-platform/repositories/changes`) for conformance to its design: the list of every pull request Oxagen has open, and one pull request opened from it. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/repositories-changes.md`. Read it first, in full, and `mockups/pages/repositories.md` for the header, tabs and state panels.
2. The design, rendered: the `Oxagen / Repositories / Changes` stories in Storybook (`npm run storybook`), one per state, desktop and mobile. Or open `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/repositories/changes` and select a row.
3. The design authority: `docs/fleet-operations-wedge.md` (Unchanged, D7, the vocabulary), `docs/fleet-operations-ia.md` (the Repositories count; Changes lists Steering record pull requests), `docs/mission-control-spec.md` §10.2 and §10.3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/repositories/changes`, and `/a-intel/core-platform/repositories/changes/<id>` for one pull request.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** `/repositories/changes` serves the list, and `/repositories/changes/<id>` opens one pull request and survives a reload. That is the address the close comment links to. Repositories is lit, with a count equal to the open pull requests.
2. **Vocabulary.** The page says pull request and Steering record. "Context PR" or "context record" anywhere on screen is a FAIL.
3. **The list.** Heading "Open pull requests" and its one-sentence subtext. Columns in order: Change · Kind · Pull request · Opened by · State · Checks · Opened. Change carries the title and the branch. Kind carries its word. Opened by names the opener. State is a badge with its word. Missing or renamed columns are FAILs.
4. **Every kind.** The list holds every pull request Oxagen opened on this workspace's repositories that the build can read, Steering record pull requests included. Kinds the build cannot list yet are named in one line, not silently left out.
5. **The CI light.** Blinking blue while a check runs; a red ✕ the moment one fails, pulsing while others still run; static green when all passed; static grey while all are queued; with "done / total" beside it and a title naming the state. Compare against the design for #118 (running), #523 (passed), #522 (failed).
6. **Counts.** The tab and sidebar counts equal the open pull requests. A merged or closed pull request in the count is a FAIL. A merged pull request in a list headed "Open pull requests" is a finding.
7. **Rows open the pull request.** Click, Enter and Space open it, each row has an accessible name, and ← All changes returns to the list.
8. **One pull request.** Facts: Kind with its file pattern, Pull request, Branch → base, Opened by with when, Why. Files this pull request carries, with `+` and `~` and what changed. Checks: Check · Result · What it asserted, in the order they run, with the kind's checks as the spec lists them. What merge will do: the five steps.
9. **A failed check stops the run.** On #522 the failing row says why, the note "<check> stopped the run." follows with the checks behind it queued, merge is disabled, and nothing is published. Verify Merge is disabled in the DOM and refused server-side if invoked anyway.
10. **Merge.** Enabled only when every check has reported and none failed, and the pull request is not merged. Then, and only then, it is the gold action and the header gives up its gold. The line beside it names the governance mode in force. Merging is `merge_context_pr` for a Steering record: it squashes onto the base pinned to the checked commit, deletes the head branch, bumps the bundle version, appends the promotion event to the ledger and writes one audit event. A merge by a person the mode does not allow is refused with the reason.
11. **Close.** `closepr` previews the comment (Closed by the name and email, a rule, Added via Oxagen with the full address of the pull request in Oxagen as the link text). Confirming closes the pull request, publishes nothing, and lands in Audit. The confirm says truthfully what happens to the branch and whether the comment is posted on GitHub.
12. **Merged and closed.** A merged pull request shows where the file is and that the promotion event is on the ledger, and offers no Merge or Close. A closed one says it closed without merging.
13. **In force from the merge.** The note under the list says a change steers nothing while its pull request is open. Search the build for any path that publishes a record, bumps the bundle or changes steering before a merge. One is a FAIL.
14. **Automatic proposals.** The promoter, the reconciler and a person, each with its line, and the note that drift is reported and never repaired in place. The reconciler is named as not built until it ships.
15. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. Steering record pull requests are wired to `list_proposals`, `get_context_pr`, `merge_context_pr` and `dismiss_proposal`. Init, skill and agent pull requests are listed only if a read returns them. Tool and configuration pull requests are not built and must not appear as rows. Opened by and Why print "not recorded" where the proposal carries neither. A fixture reaching production is a FAIL.
16. **The same record twice.** A Steering record pull request on this tab and on Steering, Pull requests is one record: merge it from one view and confirm the other shows it merged.
17. **States.** Force each state. Empty, loading, error and access denied are the Repositories panels in `repositories.md`. The build's own empty list says Oxagen has no pull request on this workspace's repositories.
18. **Mobile.** At 390 × 844 with a touch pointer: More is lit; the list becomes labelled cards with the CI light on the Checks line; the detail stacks with the checks as cards and the actions at full width; `closepr` is a bottom sheet; the page never scrolls sideways; touch targets are at least 44 px.
19. **Accessibility.** Rows are reachable by keyboard and named. The CI light has a text equivalent. Dialogs are `role=dialog` with `aria-modal` and a labelled close. State is never colour alone.
20. **Permissions.** Read requires `repository.read`. `merge_context_pr` is refused server-side outside its roles and outside what the governance mode allows; `dismiss_proposal` outside org Owner or Admin or workspace Owner. Verify with a role that lacks them.
21. **Rules.** Check each rule in the spec's last section.
22. **Nothing extra.** List anything on the built page that is not in the spec.

## Output

Return a single markdown report:

```
# Repository changes: audit {{DATE}}
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
