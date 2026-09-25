# Audit prompt: Onboarding · First run

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Onboarding · First run** page of Oxagen (`#/welcome/run`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/onboarding-run.md` (read it first, in full), and `pages/register-run.md` for the frame card it shares.
2. The design, rendered: the `onboarding-run` stories in Storybook (`npm run storybook`), one per state (loaded, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. `node tools/check-mockup.mjs` confirms the design renders in every state.
3. The product spec for context: `docs/mission-control-spec.md` §14, §10.1 (Repositories), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/welcome/run`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with the gate shell only: brandmark, the signed-in email, a Cancel button, the onboarding rail (steps 1 and 2 done and clickable, 3 Start a run current with `aria-current="step"`), and the onboarding caption under the cards. There is no sidebar, no topbar, and so no approvals button or drawer. An app shell on this route is a FAIL. The document title names the page.
2. **Header.** Eyebrow “Step 3 of 3”, h1 “Start a run”, lead as quoted in the spec with the key. While waiting the footer is Cancel · Back · Open the installer with the caption “There is no Done button — the frame is the completion.”, and the one gold action is Bind a-intel/platform as the main repo. After the frame the footer is Cancel · the countdown caption · Open Oxagen (gold) and the Bind button is plain. A Done or Finish button is a FAIL.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Cards.** The waiting card and the received card match `register-run.md` with this page’s key (spinner, h3, “polling · 1s”, chips, log lines in order, “waiting…”, the start sentence; then “connected”, the two frame rows, the three badges, the tier sentence). The Repository detected panel has the h3, “reported by the installer”, the remote chip, the git-remote sentence with the production branch, the Bind button with the GitHub glyph, the GitHub App sentence, and the Skip for now line with “provisional for 14 days”. After Bind the panel is Main repo with “bound”, the three chips, and the `.oxagen/` sentence; after Skip it is No main repo bound with the “provisional” badge, the until date, and Bind a-intel/platform now. Missing or renamed items are FAILs.
5. **Actions and dialogs.** The poll flips the card on the sixth log line; the countdown and Open Oxagen run the unlock and land on Work with the first-run banner; Bind installs the GitHub App and toasts the spec’s copy; Skip for now sets the 14-day window and is reversible; Back returns to Wrap an agent; Open the installer shows the installer screens; Check again in the error state toasts. Each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest. A fixture reaching production is a FAIL. On unlock the agent and its smoke run are written once per flow.
7. **States.** Force each state and compare copy and controls with the design:
   - **loading** (`state=loading`): the shell and the rail stay and the cards are the skeleton; no data, no zeros, no stale log.
   - **error** (`state=error`): h2 “The collector cannot reach Oxagen”, the two paragraphs and the request line verbatim, Check again, then Cancel · Back, no repository panel, and no gold action.
   - **access denied** (`state=denied`): “You cannot see onboarding”, the missing permission `org.create for marcus@a-intel.example`, the grant sentence, Request access (opens `request-access`) and Back to Work, then Signed in as, Needed, and Decided by (`pol_v41 · deny wins over every allow`).
   Loading must not flash values. Error must name the request id and host. Denied must name the missing permission and offer Request access.
8. **Trust language.** The received card says `harness`, “replay grade: full”, “chain intact”, `attested=device-key`, and `countersigned`, and nothing stronger; the copy says client-attested and fail-open, never enforced. The provisional copy says what stays off and does not soften it. Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
9. **Headings and captions.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing, except where the spec quotes longer rendered copy.
10. **Mobile.** At 390 × 844 with a touch pointer: the cards fill the width with 16 px gutters, buttons are full width and at least 44 px, the log and frame rows keep their columns. Compare against the `onboarding-run` mobile story (`mobile=1`).
11. **Accessibility.** The rail is a `nav` labelled “Onboarding”; the spinner, the connected dot, and the bound dot are paired with words; the countdown text is in the DOM; Skip for now is a real button; the dialog in the denied state is `role=dialog aria-modal` with a labelled close; focus is visible; the page is operable by keyboard end to end.
12. **Permissions.** Read requires an authenticated session; `repo.bind` is gated server-side, not only hidden in the UI, and the unlock writes happen on ingest. Verify with a role that lacks the permission.
13. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Onboarding · First run audit {{DATE}}
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
