# Audit prompt: Steering · Proposals

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering · Proposals** tab of Oxagen (`#/a-intel/core-platform/steering/proposals[/prs]`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering-proposals.md`, and the hub it belongs to, `mockups/pages/steering.md` (read both first, in full).
2. The design, rendered: the `steering-proposals` stories in Storybook (`npm run storybook`), one per state, desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>`. The checker is `node tools/check-mockup.mjs`; `tools/check-record-e2e.mjs` walks the pull request lifecycle.
3. The decisions this tab renders: the story sheet of 2026-09-18, decisions 8, 9, and 13; the product spec §12.8.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route and `/steering/prs` resolves to the Context PRs view. Steering is lit in the sidebar. There is no Skills nav entry. The breadcrumb ends on Steering. The top bar has the Approvals button left of the avatar with the organization-wide waiting count; it opens the drawer `#apdrawer`, a selected row shows the approval card with Approve and Deny, and Escape closes it. No assistant button in the top bar.
2. **Hub header, chip, and tabs.** Eyebrow is the workspace name, h1 “Steering”, the one-sentence subtext, the governance chip “Governance: <mode>”. Five tabs in this order: Library, Assignments, Gates, Proposals, Compiler, with counts; Proposals counts candidates plus open pull requests. This tab is selected. Each tab is a URL segment, and reloading the URL lands on the same tab.
3. **One gold action.** Exactly one gold action at a time: the header's, or Open a Context PR, or Merge pull request once every check passed. The chip is not gold.
4. **Sections and tables.** The build has each item below with the same headings and every column named, in that order.
   - The Candidates and Context PRs control, with counts, each a URL, and the line under it.
   - Candidates: the panel heading verbatim; record cards with kind, force, state badge, checks badge, Review, statement, source, support line, id, scope, lineage.
   - A reviewed proposal: All proposals, the three tiles, Proposed record, Promoter evidence, Supporting runs with Run · Frame · Outcome · Record, Context PR with its four rows and action, If it publishes with its five rows.
   - Context PRs: Context PRs with Pull request · Branch · Opened by · State (the CI status light with done / total beside the state badge: blinking blue while running, a red ✕ on the first failure, static green when all passed, static grey when queued); the selected pull request with its file, body, the six named checks with per-check result text, the merge bar, Merge pull request, Close pull request on an operator's, Merge effects or promotion_event.
5. **Outcome, not verdict.** Every Supporting runs row carries one of kept, reverted, no change, halted as a dot and a word. No column, badge, or tile is labelled verdict, proven, or proof. The three tiles equal what the rows beneath them give: the row count, the distinct agents, and the promoter's confidence or “apply”.
6. **Actions.** Review opens the proposal. Open a Context PR opens `ctxpr` with Concern, Kind, Scope, Constraint effect, and Supporting evidence. Merge is blocked until every check reports, re-runs every predicate, and publishes exactly once. Close pull request leaves nothing behind. A merged pull request cannot be closed. Write a context record ends on this tab with the new pull request selected.
7. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named store; 🟡 rows are wired for the fields that exist and render `NotBacked` for the rest; ❌ rows render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
8. **States.** Force each state and compare copy and controls with the design:
   - **empty** (`state=empty`): the hub header, chip, and tabs stay; the body is “No proposals yet” with its sentences and Write a context record.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “Steering could not be loaded”, `503 record_index_unavailable`, Try again, Open an incident, and the trace line.
   - **access denied** (`state=denied`): “You cannot see this workspace’s steering”, naming `steering.read on core-platform`, with Request access and Back to Fleet.
9. **Trust language.** While a pull request is open the record steers nothing, and no count moves: not in Records, not in the bundle, not in the audit log, bundle version unchanged. A failed check is shown as failed, with the reason. The steering tokens a turn before and after a merge reconcile to the bundle total.
10. **Plain nouns.** No heading on the built tab carries a comma, a mid-dot, or a not/never contrast; subtext is one sentence.
11. **Mobile.** At 390 × 844 with a touch pointer: the five tabs are one scrolling strip and the selected tab is in view; the two-column views stack; every list table renders as labelled cards; the page never scrolls sideways; tap targets are ≥ 44 px; inputs are 16 px; More is the lit thumb-bar slot.
12. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; the two-way control uses `aria-pressed`; the selected pull request row carries `aria-current`; state is never colour alone; focus is visible; the tab is operable by keyboard end to end.
13. **Permissions.** Read requires `steering.read`, checked server-side. Each write (`context.propose`, `context.review`, `context.retire`) is gated server-side.
14. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Steering · Proposals: audit {{DATE}}
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
