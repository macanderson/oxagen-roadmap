# Audit prompt: Steering › Pull requests

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built view against its design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering › Pull requests** view of Oxagen (`/{org}/{ws}/steering/proposals/prs`) for conformance to its design: the table of Steering record pull requests, the selected one with its file, body, checks and merge bar, the merge, and the close. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering-prs.md`. Read it first, in full. `steering.md` specifies the header, the tabs and the shell; `steering-proposals.md` the Proposals view beside this one.
2. The design, rendered: the stories `Oxagen / Steering / Pull requests` in Storybook (`npm run storybook`): Loaded and Loaded · mobile. Or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/steering/proposals/prs`. Merge the promoter's pull request, close it in a fresh load, and open one from the record wizard (New source, Steering record) to see a person's. For the import pull requests, open Import Markdown in the Steering header, choose Use the sample directory, then Accept all, and publish. The scenario `#/a-intel/core-platform/scenarios/learned-approved-changed/4` walks the checks and the merge.
3. The design authority: `docs/fleet-operations-wedge.md` (D7; Shipped today), `docs/fleet-operations-ia.md` (Steering, Pull requests) and ADR-061 in `macanderson/oxagen`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/{org}/{ws}/steering/proposals/prs` with Proposals selected and the Pull requests button pressed. `/steering/prs` resolves to it. New source in the header is plain on this view.
2. **The table.** The panel "Pull requests" with the governance badge, and the columns Pull request (the number with the statement under it), Branch, Opened by and State, in that order. Only this workspace's pull requests are listed. The Pull requests count equals the open rows; a merged, closed or rejected one is not counted.
3. **Opened by.** "the promoter" only for a pull request the promoter opened, and the person's name for one a person opened. Until the opener is recorded, the cell renders "not recorded" rather than a guess.
4. **State.** The checks light matches the checks below it (blinking while running, a red cross on the first failure, steady green when all passed, grey when queued), and "done / total" counts out of six. The badge maps the proposal's status. Selecting a row sets `aria-current` and shows it below.
5. **The selected pull request.** The heading with the number and the state badge; the branch line; the record file; Pull request body; Checks with its six rows in order (Schema, Lineage uniqueness, record_hash recomputation, Secret and PII scan, Conflict against active records, constraint_effect ∈ {require, forbid}), each with its result text once it reports; the merge bar; Merge effects. The file shows what the pull request carries; a rule with a constraint effect is refused by the checks, not shown as valid.
6. **Checks run in order.** Open a pull request and watch: the checks report one at a time, a failed check stops the run where it failed and says why, merge stays blocked, and nothing is published.
7. **Merge.** Merge pull request is gold only once every check passed and disabled otherwise. Merge re-runs every check with a predicate and refuses if one no longer passes. It follows the governance mode: under `team` the author of a record cannot merge it. Try it as the author and confirm the refusal. A merge publishes exactly once: the row reads merged, the Pull requests count falls by one, the record appears on Sources, promotion_event replaces Merge effects, and the audit log gains one `steering_published`.
8. **Steers nothing while open.** While a pull request is open, its record is absent from Sources, from every envelope and from the compiled bundle, the audit log has no `steering_published` for it, and the steering version has not moved. Check each separately.
9. **Merge effects.** Five rows, the fifth saying the record reaches a run when its host next fetches the bundle, at the run's next session start. A claim that it reaches the next model call of a running run is a FAIL. The token row renders "not recorded" until the token deltas ship.
10. **Import pull requests.** Publishing the Markdown importer opens one pull request per source file at the top of the table, selects the first, and starts every row's checks at once. With the sample directory: five rows, `a-intel/platform#521` to `#525`, a row with several records reading "<N> records from <file>" ("9 records from CLAUDE.md") on `context/import-<file slug>`, and each opened by the person who published. The branch line ends "one source file per PR". The file panel holds one TOML block per record. The body opens "## Import 9 records from CLAUDE.md", names the importer and the person, lists each record under "### Records" with its kind, force, constraint effect and "from `<file>:L<line>`", and states the steering tokens it adds. The checks count six and word Schema, Lineage uniqueness and record_hash recomputation for the set ("9 files, 9 records, 9 lineages"). Merge effects row 3 counts every record ("1,340 → 1,495"). One merge publishes every record in one bundle version and one `steering_published`, whose line reads "9 records from CLAUDE.md". After it, See them in Records is gold and opens Sources filtered to Steering records, and an import with one record offers Open the record (gold) and See it in Records. Any Markdown file edited by the import is a FAIL.
11. **promotion_event.** After the merge: record_id, lineage_id, from → to, approver (and author for a person's), pr_url, commit_sha, merged_at, re-indexed, bundle, tokens per turn and audit, each read from `get_context_pr` `merged` and `merge_context_pr`'s result. The ledger row states what ships: the promotion event is appended to the hash-chained ledger on every merge. See it in the run and Audit log land where they say; for a person's, Open the record lands on the record's page and See it in Records on Sources filtered to Steering records.
12. **Close.** Close pull request opens `closepr` with the title, the subtitle, the comment preview and no note, and its button is red. Closing calls `dismiss_proposal`: the pull request closes, nothing is published, the branch is deleted, the row reads closed, both counts fall by one, and the detail offers neither Close nor Merge. A merged pull request cannot be closed.
13. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract (`list_proposals`, `get_context_pr`, `merge_context_pr`). 🟡 rows show the fields that ship and render "not recorded" for the rest. ❌ rows render "not recorded" or are absent. A fixture reaching production is a FAIL.
14. **Future-only fields.** The spec lists the fields that are future-only though the design marks none: who opened a pull request, the code owner, the file's bytes from GitHub, the supporting-run table in the promoter's body, the token deltas, the closing comment and the import pull request with several records. Each renders "not recorded" or is absent. Any rendered as data is a FAIL.
15. **States.** Loaded only. Force `state=loading`, `error`, `empty` and `denied` and confirm the shell's standard panels replace the page body and keep the shell, with no zeros and no stale rows.
16. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with More lit; the tabs scroll sideways with Proposals in view; the table renders as labelled cards; the selected pull request's columns stack; the file and body scroll inside their boxes and the page never scrolls sideways; the merge bar's buttons go full width; the dialog is a bottom sheet; tap targets are at least 44 px and inputs 16 px.
17. **Rules.**
    - No heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. Note where the design breaks this.
    - Exactly one gold action on every screen: Merge pull request once every check passed, Open the record after a person's merge, See them in Records after an import with several records merges, and none while checks run.
    - A record never grants authority, and a supporting run carries an outcome, never a verdict.
    - No person is scored or ranked.
    - The view's copy says pull request and Steering record.
18. **Accessibility.** The selectable rows are keyboard operable with `aria-current` on the selected one; the checks light carries a text label; the running spinner has a label; state is never colour alone; the dialog is `role=dialog`, `aria-modal`, with a labelled close; focus is visible.
19. **Permissions.** `merge_context_pr` and `dismiss_proposal` are gated server-side, and the governance mode's reviewer rule is enforced by the server, not only by a disabled button. Verify with a role that lacks the permission and with the record's author under `team`.
20. **Nothing extra.** List anything on the built view that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Steering › Pull requests: audit {{DATE}}
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
