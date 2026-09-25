# Audit prompt: Log in

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Log in** page of Oxagen (`#/welcome/login`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/login.md` (read it first, in full).
2. The design, rendered: the `login` stories in Storybook (`npm run storybook`), one per state (loaded, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. `node tools/check-mockup.mjs` confirms the design renders in every state.
3. The product spec for context: `docs/mission-control-spec.md` §14, Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/welcome/login`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with the auth shell only: brandmark and a centred card. There is no sidebar, no topbar, and so no approvals button or drawer. An app shell on this route is a FAIL. The document title names the page.
2. **Header.** Eyebrow “Welcome back”, h1 “Log in to Oxagen”, no lead. Actions present with the same label: Log in. Exactly one gold (primary) action on the screen, full width.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Form and links.** In this order: Continue with Google, Continue with GitHub, the “or” rule, Work email, Password with the Forgot password? link at its label and the Show/Hide toggle, the “Keep me logged in on this device for 30 days” checkbox (checked), the footer “New to Oxagen? Create an account · Have an invitation? Accept it”. Missing or renamed items are FAILs.
5. **Actions and dialogs.** Submit goes to Two-factor. Google and GitHub sign in and land on Work with the spec’s toast. Forgot password?, Create an account, and Accept it go where the spec says. Each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design:
   - **loading** (`state=loading`): the primary button shows a spinner and “Logging in…” and is `aria-disabled`; the form stays.
   - **error** (`state=error`): the inline error “Email or password is wrong. Check both and try again, or reset your password.” above the sign-in buttons, with the email field marked bad.
   - **access denied** (`state=denied`): the full-card state “This account is suspended” with the owner’s name and role, the address, the date, the sentence about kept runs and no new run tokens, and the single plain action Contact your organization owner.
   Loading must not clear the form. Error must say what happened and what to do. Denied must say who suspended the account and when.
8. **Trust language.** The page names no tier, replay grade, attestation, or cost basis, and it must not add one. The suspended copy claims only that recorded runs are kept and no new run tokens are minted. Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
9. **Headings and captions.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing, except where the spec quotes longer rendered copy.
10. **Mobile.** At 390 × 844 with a touch pointer: the card fills the width with 16 px gutters, buttons are full width and at least 44 px, inputs are 16 px. Compare against the `login` mobile story (`mobile=1`).
11. **Accessibility.** Inputs have `label for` and the right `autocomplete`; the Show/Hide toggle is a button; the checkbox is labelled; the inline error is announced; focus is visible; the page is operable by keyboard end to end.
12. **Permissions.** Read is public; `auth.login` is gated server-side, not only hidden in the UI. Verify that a suspended account is refused by the server, not only shown the state.
13. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Log in audit {{DATE}}
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
