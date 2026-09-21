# Audit prompt: Reset password

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Reset password** page of Oxagen (`#/welcome/reset`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/reset-password.md` (read it first, in full).
2. The design, rendered: the `reset-password` stories in Storybook (`npm run storybook`), one per state (loaded, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. `node tools/check-mockup.mjs` confirms the design renders in every state.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/welcome/reset`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with the auth shell only: brandmark and a centred card. There is no sidebar, no topbar, and so no approvals button or drawer. An app shell on this route is a FAIL. The document title names the page.
2. **Header.** Eyebrow “Password”, h1 “Set a new password”, lead as quoted in the spec with the address. Actions present with the same label: Set password. Exactly one gold (primary) action on the screen, full width.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Form.** New password with the Show/Hide toggle, the four-segment meter, and the three requirements (at least 12 characters, one symbol, one digit) that tick live; then Confirm new password. No footer link. Missing or renamed items are FAILs.
5. **Actions and dialogs.** Submit returns to Log in with the spec’s toast and revokes every other session. Show and Hide toggle the field. Each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design:
   - **loading** (`state=loading`): the primary button shows a spinner and “Saving…” and is `aria-disabled`; the form stays.
   - **error** (`state=error`): the inline error “The two passwords do not match. Retype the confirmation.” above the form, with the confirmation field marked bad.
   - **access denied** (`state=denied`): the full-card state “This reset link has expired” with the 60 minutes, once, the issue time and date, the under-a-minute sentence, and the single plain action Request a new link.
   Loading must not clear the form. Error must say what happened and what to do. Denied must say when the link was issued and offer a new one.
8. **Trust language.** The page names no tier, replay grade, attestation, or cost basis, and it must not add one. Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
9. **Headings and captions.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing, except where the spec quotes longer rendered copy.
10. **Mobile.** At 390 × 844 with a touch pointer: the card fills the width with 16 px gutters, the button is full width and at least 44 px, inputs are 16 px. Compare against the `reset-password` mobile story (`mobile=1`).
11. **Accessibility.** Inputs have `label for` and `autocomplete=new-password`; the meter is `aria-hidden` and the requirement list carries the meaning in words; the Show/Hide toggle is a button; the inline error is announced; focus is visible; the page is operable by keyboard end to end.
12. **Permissions.** Read requires a valid reset token; `auth.reset.complete` is gated server-side, not only hidden in the UI. Verify that an expired or used token is refused by the server.
13. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Reset password audit {{DATE}}
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
