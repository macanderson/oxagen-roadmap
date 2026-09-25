# Audit prompt: Run held for an answer

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **run held for an answer** in Oxagen (`#/a-intel/core-platform/runs/run_01K6QW3D5N7TYBA2`), the page a run renders while Oxagen holds its loop for a person, for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/run-interjection.md`. Read it first, in full. Also read `mockups/pages/approvals-drawer.md`, which owns the drawer this interjection waits in, and `mockups/pages/run.md` for the shell and the ordinary run page.
2. The design, rendered: the stories `Oxagen / Runs / Held for an answer` (Loaded, Loading, Error, Access denied, each also · mobile) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/runs/run_01K6QW3D5N7TYBA2`. The drawer row: add `&drawer=approvals` on any page. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (Cuts: the Skills console is cut and the interjection stays in the Approvals drawer; D2, D12, D16) and `docs/fleet-operations-collapse.md` (W13 retired).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/runs/<held run id>`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** A run whose loop Oxagen holds renders this page at the run path; every other run renders the ordinary run page. The sidebar lights Work. The breadcrumb names the run's direct work order before the run (D2). The Approvals button in the top bar counts this interjection while it waits. No assistant button in the top bar.
2. **Header.** The eyebrow "Run" with the run id in mono, the task title as the h1, the line agent · harness · operator · `harness` tier · remote@sha, and the status "paused" with "waiting on a person" while waiting, "live" once answered. No header actions. No mid-dot in the eyebrow or the status label.
3. **The note.** Waiting: "The loop is stopped." with the rest of the sentence and the time since which nothing has been charged. Answered: what the answer did, for link and for create. "Ask again" exists only in the mockup; in the build a sent answer is final and the control does not exist.
4. **The triptych.** Three panes in this order, with these eyebrows and labels: What the agent shows <operator's first name> (harness), What Oxagen put to a person (Oxagen, the one gold-bordered pane), What was written down (frames). Each pane's content matches the spec: the messages and their times, the "interjection" label on Oxagen's message, the two pick cards with their copy, "Send this answer" disabled with "pick one" until a pick and then "answers as <operator>"; the `control.interject` card; the Link and Create paths with every consequence line and its mark; the note on the second path; "If nobody answers" with the 30-minute `deny`; the frame list.
5. **The answer.** Sending either path is one governed action with a receipt id. The frame pane fills with the frames the spec lists for that path, in order. The agent pane shows the operator's reply and the agent's turn 1. After link, Skill loaded shows the skill row with its token cost priced as context. After create, the created workspace's `.oxagen/workspace.toml` has no `[skills]` block and the panel says so. "See how core-platform did it" opens Steering Sources filtered to skills, never a retired Skills console route.
6. **Frames.** While waiting, the frames that have not happened render greyed with no time, and the note's count of greyed frames equals the greyed rows. Nothing renders a frame that was not written. Once answered, the note reads "Nothing here is reconstructed."
7. **Where the question goes.** The same question reaches the operator in the agent's own surface and on this page. Answering in either place writes one `control.answer` frame. The build creates no second inbox.
8. **Approvals drawer.** While the interjection waits, the drawer's first row on every page is "Interjection · <agent> is paused" with the repository, the workspace, the charge and timeout sentence, and "Answer it", which closes the drawer and opens this page. The row is not itself a place to answer. The interjection counts one in the Approvals button and in no sidebar count or Agents tile. Once answered, the row and the count drop it.
9. **Timeout.** An unanswered interjection times out at 30 minutes to `deny`; the run continues with no skills and the agent is told why. There is no `allow`. Verify with a clock.
10. **Data sources.** Every ❌ row of the spec's table renders not recorded with the gap named, never a fixture. The frame kinds `repo.unknown`, `control.interject`, `control.answer`, `repo.bound`, `workspace.created`, `skills.resolved`, `skills.searched` and `skills.loaded` must exist in the run ledger before this page can render from the record.
11. **States.** Loading: the shell stays and the body is the skeleton, with no data and no zeros. Error: "This run could not be loaded", `502 frame_store_unreachable`, "Try again", "Open an incident" and the trace line. Access denied: "You cannot see this run", naming the run read permission, "Request access" and "Back to Work", with Signed in as, Needed and Decided by.
12. **Trust language.** The tier on the meta line and in the Link path is `harness`, as recorded, and nothing says enforced about it. The consequences never claim more than the config would apply. Withheld skills reach the agent as a count and a reason class, never by name.
13. **Mobile.** At 390 × 844 with a touch pointer: the three panes stack in order; the two paths stack; the pick cards are full width; the Approvals count includes this run while it waits; the drawer is full width; hit areas are at least 44 px; nothing scrolls sideways.
14. **Accessibility.** The pick cards are buttons with `aria-pressed`. "Send this answer" is a real disabled button, not a styled span. The panes have headings. The drawer row's button is labelled. State is never colour alone.
15. **Permissions.** Reading requires the run read, checked server-side. Answering by link requires the right to link a repository and by create the right to create a workspace, both gated server-side. A person without the grant sees the question and cannot answer it.
16. **Rules.** A frame and a SteeringFrame never share a name on screen. No heading or label carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence. Exactly one gold action ("Send this answer") and one gold pane.
17. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Run held for an answer audit {{DATE}}
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
