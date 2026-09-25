# Audit prompt: Steering › Proposals

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built view against its design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering › Proposals** view of Oxagen (`/{org}/{ws}/steering/proposals`) for conformance to its design: the list of proposals, one proposal's review, and the dialog that opens its pull request. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering-proposals.md`. Read it first, in full. `steering.md` specifies the header, the tabs and the shell; `steering-prs.md` the Pull requests view.
2. The design, rendered: the stories `Oxagen / Steering / Proposals` in Storybook (`npm run storybook`): Loaded and Loaded · mobile. Or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/steering/proposals`; press Review on each proposal. The scenario `#/a-intel/core-platform/scenarios/learned-approved-changed/2` shows the promoter's proposal before its pull request opens. Open `mem_01K5R0N2` from Sources (`?kind=memory`) or from a run's Memories tab and press Open the proposal to reach `prp_01K5RX1N`.
3. The design authority: `docs/fleet-operations-wedge.md` (D7, D13; the vocabulary row Proposal; Shipped today), `docs/fleet-operations-ia.md` (Steering, Proposals) and ADR-061 in `macanderson/oxagen`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/{org}/{ws}/steering/proposals` with Proposals selected and its count equal to the proposals plus the open pull requests. The header, the tabs and the shell match `steering.md`. The kind filter does not render.
2. **The two views.** A group with Proposals and Pull requests, each with its count and `aria-pressed`, and the line beside them. Proposals is `/steering/proposals` and Pull requests `/steering/proposals/prs`. The Pull requests count equals the open pull requests in the table there.
3. **The list.** The panel "Proposals" with its caption and the card list controls (Sort, Rows, pager). Each card: the kind badge, the force, the state badge, the checks badge where a pull request is open, Review, the statement as the headline, and the meta line (from, support, id, scope, lineage). Only this workspace's proposals are listed.
4. **States and checks.** Each state badge maps a contract status (proposed, pr_open, checks_running, checks_passed, checks_failed, merged, rejected) to the design's words. A checks badge counts out of six for every Steering record pull request. "Context PR" appears nowhere in the view's copy.
5. **Review.** Review shows one proposal and All proposals returns to the list. The three tiles (Supporting runs, Distinct agents, and Confidence or, for a person's proposal, Checks) with their sub-lines. Proposed record with "steers nothing yet". Promoter evidence. Supporting runs with Run, Frame, Outcome and Record, in that order. The Pull request panel with Target, Branch, File, Governance and the one action the spec gives for the proposal's state. If it publishes with Reaches, As, Costs, Baseline and Read back as.
6. **Rollups.** Supporting runs equals the rows beneath it; Distinct agents equals the distinct agents in the rows. Any tile that disagrees with its rows is a FAIL; name both values.
7. **Outcome, not verdict.** Every supporting run carries one of `kept`, `reverted`, `no change` or `halted`, as a dot and a word, or "not recorded". No column, badge or tile is labelled verdict, proven, proof, grade or score. No threshold decides a proposal.
8. **Open a pull request.** Offered only while the proposal has none, and gold then. `ctxpr` shows the callout when one is open, the fields, the note naming the six checks, and Open the pull request (or Go to the open one). Opening calls `open_context_pr`, pushes `context/<lineage>` with one record file, queues the six checks and lands on Pull requests with it selected. The Kind and Scope options carry no dash-joined labels. A constraint effect is offered for a constraint only.
9. **Steers nothing.** While a proposal has no merged pull request, its record is absent from Sources, from every envelope and from the compiled bundle, and the steering version has not moved.
10. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract (`list_proposals`, `get_context_pr`, `open_context_pr`). 🟡 rows show the counts that derive from the support and render "not recorded" for the measure. ❌ rows render "not recorded" or are absent. A fixture reaching production is a FAIL.
11. **Future-only fields.** The spec lists the fields that are future-only though the design marks none: the support measure, Confidence, the supporting runs' agent, date, frame, outcome and record kind, Costs, Baseline, proposals the promoter, a findings job or the post-run review would raise, and the proposal a memory fold raised. Each renders "not recorded" or is absent. Any rendered as data is a FAIL.
12. **States.** Loaded only. Force `state=loading`, `error`, `empty` and `denied` and confirm the shell's standard panels replace the page body and keep the shell, with no zeros and no stale cards.
13. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with More lit; the tabs scroll sideways with Proposals in view; the cards stack their badges and wrap their meta lines; in a review the tiles wrap, the columns stack and the Supporting runs table renders as labelled cards; the dialog is a bottom sheet; the page never scrolls sideways; tap targets are at least 44 px and inputs 16 px.
14. **The proposal a memory made.** Open `prp_01K5RX1N` from its card, and from Open the proposal in the dialog of `mem_01K5R0N2` on another page and on this one. The card reads "from memory fold · mem_01K5R0N2" and "3 sayings from 3 runs". Supporting runs holds one row per saying of the memory, each with its run, its agent, "seq <frame>", and `mem_01K5R0N2` with "memory · saying". Promoter evidence quotes each saying verbatim with its run and frame, and names the fold setting, 3 sayings from 2 runs. The rows' `passed` and `failed` are outside the four outcomes: a build that copies them is a FAIL under check 7. A build renders the rows and the tiles as not recorded until a saying per run and the fold ship.
15. **Rules.**
    - No heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. Note where the design breaks this.
    - Exactly one gold action on every screen, the review of a proposal with no pull request included.
    - No person is scored or ranked; "from <name>" weighs nothing.
    - Every enforcement claim names its tier and "routed through Oxagen".
16. **Accessibility.** Tabs use `role=tablist` and `role=tab` with `aria-selected`; the two view buttons use `aria-pressed`; the dialog is `role=dialog`, `aria-modal`, with labelled fields and a labelled close; state is a dot and a word; focus is visible; the view is operable by keyboard end to end.
17. **Permissions.** The read is refused server-side without the Steering read. `open_context_pr`, `propose_record` and `dismiss_proposal` are gated server-side, not only hidden. Verify with a role that lacks them.
18. **Nothing extra.** List anything on the built view that is not in the spec. A Dismiss control is a finding for the reviewer: the capability ships and the design has none.

## Output

Return a single markdown report:

```
# Steering › Proposals: audit {{DATE}}
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
