# Audit prompt: Register agent · Wrap

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Register agent · Wrap** page of Oxagen (`#/a-intel/core-platform/register/wrap`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/register-wrap.md` (read it first, in full).
2. The design, rendered: the `register-wrap` stories in Storybook (`npm run storybook`), one per state (loaded, loading, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. `node tools/check-mockup.mjs` confirms the design renders in every state.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/register/wrap`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with the gate shell only: brandmark, the signed-in email, a Cancel button, the three-step rail (step 1 done and clickable, step 2 current with `aria-current="step"`, step 3 disabled), and the caption under the card. There is no sidebar, no topbar, and so no approvals button or drawer. An app shell on this route is a FAIL. The document title names the page.
2. **Header.** Eyebrow “Step 2 of 3”, h1 “Wrap the agent”, lead as quoted in the spec with the agent key. Footer actions present, in order, with the same labels: Cancel · Back · I have already installed it — continue, with the caption “Nothing completes until a frame arrives.” before the last. Exactly one gold action on the Claude Code and Codex CLI tabs (Download for <OS>) and none on the SDK tab; the continue button is not gold.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Tabs and panels.** Harness tabs in order with name and sub-line: Claude Code “one click · harness”, Codex CLI “one click · harness”, SDK agent “five lines · harness”. Each panel matches the spec: the h3 (with “recommended” on Claude Code only), the copy, the tier ladder (This agent `harness`, Next rung `gateway`, Top rung `contained`, plus “or observe” on Codex CLI), the OS tabs and package lines for all three operating systems, the token box, the enroll command, and on SDK the credential box, install line, language tabs, and five-line code. Missing or renamed items are FAILs.
5. **Actions and dialogs.** Download for <OS> records the harness, shows the spec’s toast, and moves to step 3. The continue button moves to step 3. Back returns to step 1. Copy the five lines copies and toasts. Each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design:
   - **loading** (`state=loading`): the shell and the rail stay and the card is the skeleton; no data, no zeros, no stale panels.
   - **access denied** (`state=denied`): “You cannot see agent registration”, the missing permission `agent.register on core-platform`, the grant sentence, Request access (opens `request-access`) and Back to Fleet, then Signed in as, Needed, and Decided by (`pol_v41 · deny wins over every allow`).
   Loading must not flash values. Denied must name the missing permission and offer Request access.
8. **Trust language.** Every tier badge shows the recorded word: `harness` for this agent, `gateway` and `contained` as real next rungs, `observe` only where the spec shows it. Nothing says the harness tier is enforced; the copy says client-attested and fail-open. Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
9. **Headings and captions.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing, except where the spec quotes longer rendered copy.
10. **Mobile.** At 390 × 844 with a touch pointer: the card fills the width with 16 px gutters, the panel columns stack, buttons are full width and at least 44 px, code blocks scroll sideways. Compare against the `register-wrap` mobile story (`mobile=1`).
11. **Accessibility.** The three tab lists use `role=tablist/tab` with `aria-selected` and an accessible name (“How to wrap the agent”, “Operating system”, “Language”); the panel is `role=tabpanel`; the rail is a `nav`; focus is visible; the page is operable by keyboard end to end.
12. **Permissions.** Read requires `agent.register`; the enrollment write is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
13. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Register agent · Wrap audit {{DATE}}
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
