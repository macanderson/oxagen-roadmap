# Audit prompt: Run · interjection

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Run · interjection** page of Oxagen (`#/a-intel/core-platform/runs/run_01K6QW3D5N7TYBA2`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `mockups/pages/run-interjection.md` (read it first, in full), `mockups/pages/skills.md` for the vocabulary it shares, and `mockups/pages/fleet.md` for the approvals drawer it appears in.
2. The design, rendered: the `run-interjection` stories in Storybook (`npm run storybook`), one per state (loaded, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The checker is `node tools/check-mockup.mjs`.
3. The scenario that walks this page: `docs/w13-in-the-loop-scenario.md`, and the W13 scenario in `mockups/missioncontrol.html`. The product spec does not describe skills yet; where the two disagree, the page spec wins and the disagreement is a finding.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/runs/run_01K6QW3D5N7TYBA2`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the run route; a run whose loop Oxagen has stopped renders this page, and an ordinary run renders the ordinary run page (`run.audit-prompt.md`). Breadcrumb: … / Fleet / <run id>. The top bar has the approvals button left of the avatar and no assistant button.
2. **Header.** Eyebrow “Run · <run id>”, h1 the task title, the meta line (agent · harness · operator · harness tier · remote@sha), and the status badge **paused · waiting on a person** / **live**. No header actions.
3. **The note.** Waiting: “The loop is stopped. Not failed, not queued, not continuing on a default…” with the timestamp nothing has been charged since. Answered: what the answer did. **Ask again** exists only in the mockup; in the build a sent answer is final and the control must not exist.
4. **The triptych.** Three panes, in this order, with these pane titles and sources: *What the agent shows <operator first name>* (harness) · *What Oxagen put to a person* (gateway, gold) · *What was written down* (frames). Each pane’s contents per the spec: the messages, the **interjection** label on Oxagen’s bubble, the two pick cards with their copy, **Send this answer** disabled with “pick one” until a pick and then “answers as <operator>”; the `control.interject` card; the two paths headed Link and Create with their consequence lines verbatim (+ / − / ·); the mid-run default note; the 30-minute `deny` timeout copy; the frame list with the three unhappened frames greyed while waiting.
5. **The answer.** Sending either path produces a governed action with a receipt id; the frame pane fills in with the frames the spec lists for that path, in order; the agent pane shows the operator’s reply and the agent’s turn 1. After **Create**, the created workspace’s `.oxagen/workspace.toml` has no `[skills]` block and the after-panel says so; after **Link**, Skill loaded shows the row with its token cost priced as context.
6. **Where the question goes.** The same question must reach the operator in the agent’s own surface (the harness) and here; answering in either place writes one `control.answer` frame. Verify the build does not create a second inbox.
7. **Approvals button and drawer.** While the interjection waits, the topbar count includes it on every page; the drawer’s first row is the interjection (“Interjection · <agent> is paused”, the repository, the workspace, the charge and timeout sentence) with **Answer it**, which closes the drawer and opens this page; the row is not itself a place to answer. The Fleet nav count, the Fleet “Waiting on a human” tile, and the Steering nav count include it. Once answered, the row and the counts drop it.
8. **Timeout.** An unanswered interjection times out at 30 minutes to `deny`; the run continues with no skills and the agent is told why. There is no `allow`. Verify with a clock.
9. **Data sources.** Every row of the spec’s table is ❌ today; `NotBacked` with the gap named, never a zero. The frame kinds `repo.unknown`, `control.interject`, `control.answer`, `repo.bound`, `workspace.created`, `skills.resolved`, `skills.searched`, `skills.loaded` must exist in the run ledger before this page can be ✅.
10. **States.** **loading** skeleton; **error** `502 frame_store_unreachable` with Try again / Open an incident; **access denied** `runs.read on core-platform` with Request access / Back to Fleet.
11. **Trust language.** The tier on the meta line and in the Link path is `harness`, as recorded; nothing says enforced about it; the consequences never claim more than the config would apply.
12. **Headings.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence.
13. **Mobile.** At 390 × 844: the three panes stack in order; the two paths stack; pick cards full width; the Fleet thumb count and the approvals count include this run while it waits; the drawer is full-width; nothing scrolls sideways; tap targets ≥ 44 px.
14. **Accessibility.** Pick cards are buttons with `aria-pressed`; **Send this answer** is a real disabled button, not a styled span; the panes have headings; the drawer row’s button is labelled; state is never colour alone.
15. **Permissions.** Read `runs.read`; answering requires `repo.bind` (link) or `workspace.create` (create), gated server-side; a person without the grant sees the question and cannot answer it.
16. **Nothing extra.** List anything on the built page that is not in the spec.

## Output

Return a single markdown report:

```
# Run · interjection audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected NotBacked, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption; open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
