# Audit prompt — Accept invitation

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Accept invitation** page of Oxagen Mission Control (`#/welcome/invite`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/accept-invitation.md` (read it first, in full).
2. The design, rendered: `pages/accept-invitation-<state>.html` and `pages/accept-invitation-<state>-mobile.html` for each state (loaded, loading, error, access denied); open them in a browser or with Playwright. `pages/index.html` links all of them.
3. The product spec for context: `docs/2026-09-11-oxagen-mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/2026-09-12-mission-control-app-implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/welcome/invite`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; there is no app shell — brandmark and a centred card only. The document title names the page.
2. **Header.** Eyebrow “Invitation”, h1 “Join <organization> on Oxagen”. Actions present, in order, with the same labels: Accept invitation · Decline. Exactly one gold (primary) action on the screen.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Sections, tabs and tables.** For each item below, the build has it, with the same tab labels (and live counts where the design shows them), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Inviter card (avatar, name, “organization owner · invited you on <date>”). Facts: Organization (slug) · Organization role · Workspace (main repo) · Workspace role · Invitation expires. What the workspace role lets you do and not do. Footer: “Signed in as <email> · Not you?”.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (no dialogs), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design file:
   - **loading** (`accept-invitation-loading.html`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`accept-invitation-error.html`): “This invitation has already been accepted. It was used on <date> at <time>. Log in instead.”
   - **access denied** (`accept-invitation-denied.html`): Full-card state: “This invitation is for a different account” — sent to X, you are logged in as Y. Action: Log in as someone else.
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
8. **Trust language.** Every tier, replay grade, attestation and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (e.g. “gateway” for a client-attested window). Money always carries its basis.
9. **Mobile.** At 390 × 844 with a touch pointer: the card fills the width with 16 px gutters, buttons are full width and ≥ 44 px, inputs are 16 px, code inputs use the numeric keypad. Compare against `pages/accept-invitation-loaded-mobile.html`.
10. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; icon buttons have `aria-label`; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
11. **Permissions.** Read requires `invitation token`; each write (org.invitation.accept / decline) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
12. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Accept invitation — audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong> — <where> — <what the design shows> — <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected NotBacked, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption — open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
