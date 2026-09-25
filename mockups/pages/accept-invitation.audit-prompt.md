# Audit prompt: Accept invitation

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Accept invitation** page of Oxagen (`#/welcome/invite`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/accept-invitation.md` (read it first, in full).
2. The design, rendered: the `accept-invitation` stories in Storybook (`npm run storybook`), one per state (loaded, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. `node tools/check-mockup.mjs` confirms the design renders in every state.
3. The product spec for context: `docs/mission-control-spec.md` §14, Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/welcome/invite`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with the auth shell only: brandmark and a centred wide card. There is no sidebar, no topbar, and so no approvals button or drawer. An app shell on this route is a FAIL. The document title names the page.
2. **Header.** Eyebrow “Invitation”, h1 “Join <organization> on Oxagen” with the organization’s name, no lead. Actions present, in order, with the same labels: Accept invitation · Decline. Exactly one gold (primary) action on the screen: Accept invitation.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Card.** The inviter row (avatar, name, “organization owner · invited you on <date>”), the rule, the five facts in order (Organization with the slug, Organization role, Workspace with the main repo, Workspace role, Invitation expires), the sentence on what the workspace role lets you do and not do, and the footer “Signed in as <email> · Not you?”. Missing or renamed items are FAILs.
5. **Actions and dialogs.** Accept signs in and lands on Work with the spec’s toast. Decline tells the inviter and changes nothing else. Not you? goes to Log in. Each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design:
   - **loading** (`state=loading`): the Accept button shows a spinner and “Accepting…”; the card stays.
   - **error** (`state=error`): the inline error “This invitation has already been accepted. It was used on <date> at <time>. Log in instead.” at the top of the card, with the rest intact.
   - **access denied** (`state=denied`): the full-card state “This invitation is for a different account” naming the inviter, the invited address, the signed-in address, the two ways out, and the single plain action Log in as someone else.
   Loading must not clear the card. Error must say when the invitation was used. Denied must name both addresses.
8. **Trust language.** The page names no tier, replay grade, attestation, or cost basis, and it must not add one. The role sentence claims only what the workspace owner role grants and denies. Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
9. **Headings and captions.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing, except where the spec quotes longer rendered copy.
10. **Mobile.** At 390 × 844 with a touch pointer: the card fills the width with 16 px gutters, the facts stack label over value, buttons are full width and at least 44 px. Compare against the `accept-invitation` mobile story (`mobile=1`).
11. **Accessibility.** The avatar has an accessible name or is `aria-hidden` with the name beside it; the facts are a definition list; the inline error is announced; the lock glyph is `aria-hidden`; focus is visible; the page is operable by keyboard end to end.
12. **Permissions.** Read requires a valid invitation token for the signed-in address; `org.invitation.accept` and `org.invitation.decline` are gated server-side, not only hidden in the UI. Verify that a different account is refused by the server.
13. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Accept invitation audit {{DATE}}
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
