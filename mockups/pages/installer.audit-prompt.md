# Audit prompt: Installer

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Installer** page of Oxagen (`#/welcome/installer`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/installer.md` (read it first, in full).
2. The design, rendered: the `installer` stories in Storybook (`npm run storybook`), one per state (loaded, error), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. `node tools/check-mockup.mjs` confirms the design renders in every state.
3. The product spec for context: `docs/mission-control-spec.md` §14, Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/welcome/installer`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with the auth shell only: brandmark and a centred wide card. There is no sidebar, no topbar, and so no approvals button or drawer. An app shell on this route is a FAIL. The document title names the page.
2. **Header.** No eyebrow and no h1. The card header is h3 “oxagen Agent Installer” with the package name at the right; each screen has its own h2 (“Install the oxagen agent”, “Installing”, “Connected to Anderson Intelligence Corp.”). Actions present with the same labels: Install · Cancel on Download, none on Installing, Back to oxagen on Connected. Exactly one gold action on Download (Install) and on Connected (Back to oxagen), none on Installing. The switch row “Installer screen” with Download · Installing · Connected is present.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Screens.** Download: the copy naming the organization and workspace, the five facts in order (Package, Size, Signature, Checksum, Token), and the “Installs to your user account only” sentence. Installing: “Step N of 8”, the progress bar, and the eight steps in the spec’s order with done, now, and pending markers. Connected: “connected” with the time, the countersigned sentence with `harness`, the seq 0 frame row, the rollback sentence and command, and “The operator console is already unlocking in your browser.” Missing or renamed items are FAILs.
5. **Actions and dialogs.** Install advances through the eight steps to Connected. Cancel returns to Wrap an agent. Back to oxagen returns to Start a run. The switch row shows each screen. Each write is a governed action by the package, not the browser. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design:
   - **error** (`state=error`): the card body is h2 “Enrollment token rejected”, the token, the time, date, and host it was used by, “Enrollment tokens are single use.”, “Nothing was installed. Generate a fresh token from the wrap step and run the installer again.”, and the single plain action Back to wrap an agent; the screen switch row is hidden.
   The loaded page must not flash zeros or an empty progress bar on the Download screen. Error must say what happened and what to do.
8. **Trust language.** The Connected screen says `harness` and “countersigned on ingest”, and nothing stronger. The Download screen claims only what the package does (user account, no sudo, no system extension, frames as the only egress). Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
9. **Headings and captions.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing, except where the spec quotes longer rendered copy.
10. **Mobile.** At 390 × 844 with a touch pointer: the card fills the width with 16 px gutters, buttons are full width and at least 44 px, the facts stack, the rollback command scrolls sideways. Compare against the `installer` mobile story (`mobile=1`).
11. **Accessibility.** The switch row buttons carry `aria-pressed`; the progress bar has an accessible value or the “Step N of 8” text beside it; the connected dot is paired with the word; the facts are a definition list; focus is visible; the page is operable by keyboard end to end.
12. **Permissions.** Read requires the installer token; enrollment is performed by the package and gated server-side on the one-time token. Verify that a used token is refused by the server.
13. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Installer audit {{DATE}}
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
