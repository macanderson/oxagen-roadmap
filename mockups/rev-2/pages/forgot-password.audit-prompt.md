# Audit prompt: Forgot password

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Forgot password** page of Oxagen (`#/welcome/forgot`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/forgot-password.md` (read it first, in full).
2. The design, rendered: the `forgot-password` stories in Storybook (`npm run storybook`), one per state (loaded, loading, error), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. `node tools/check-mockup.mjs` confirms the design renders in every state.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/welcome/forgot`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with the auth shell only: brandmark and a centred card. There is no sidebar, no topbar, and so no approvals button or drawer. An app shell on this route is a FAIL. The document title names the page.
2. **Header.** Eyebrow “Password”, h1 “Reset your password”, lead “We will email a link that is good for 60 minutes.” Actions present with the same label: Send reset link. Exactly one gold (primary) action on the screen, full width.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Form and links.** The single Work email field (`type=email`), then the footer Back to log in. After submit, the sent card: “Reset link sent”, the sentence that starts “If an account exists for”, the 60 minutes and once, and Back to log in. The demo’s Open the link button is not part of the product build. Missing or renamed items are FAILs.
5. **Actions and dialogs.** Submit shows the sent card without revealing whether the address exists. Back to log in returns to Log in from either card. Each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design:
   - **loading** (`state=loading`): the primary button shows a spinner and “Sending…” and is `aria-disabled`; the form stays.
   - **error** (`state=error`): the inline error “We could not send that email. Our mail provider returned a 502. Try again in a minute.” above the form.
   Loading must not clear the form. Error must name the provider status and say what to do.
8. **Trust language.** The page names no tier, replay grade, attestation, or cost basis, and it must not add one. The sent copy never confirms that an account exists. Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
9. **Headings and captions.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing, except where the spec quotes longer rendered copy.
10. **Mobile.** At 390 × 844 with a touch pointer: the card fills the width with 16 px gutters, the button is full width and at least 44 px, the input is 16 px. Compare against the `forgot-password` mobile story (`mobile=1`).
11. **Accessibility.** The input has a `label for` and `autocomplete=username`; the inline error is announced; the sent state’s glyph is `aria-hidden` with the words carrying the meaning; focus is visible; the page is operable by keyboard end to end.
12. **Permissions.** Read is public; `auth.reset.request` is gated and rate-limited server-side, not only hidden in the UI.
13. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Forgot password audit {{DATE}}
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
