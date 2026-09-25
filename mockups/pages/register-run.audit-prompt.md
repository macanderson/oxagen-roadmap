# Audit prompt: Register agent · First run

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Register agent · First run** page of Oxagen (`#/a-intel/core-platform/register/run`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/register-run.md` (read it first, in full).
2. The design, rendered: the `register-run` stories in Storybook (`npm run storybook`), one per state (loaded, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. `node tools/check-mockup.mjs` confirms the design renders in every state.
3. The product spec for context: `docs/mission-control-spec.md` §14, Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/register/run`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with the gate shell only: brandmark, the signed-in email, a Cancel button, the three-step rail (steps 1 and 2 done and clickable, step 3 current with `aria-current="step"`), and the caption under the card. There is no sidebar, no topbar, and so no approvals button or drawer. An app shell on this route is a FAIL. The document title names the page.
2. **Header.** Eyebrow “Step 3 of 3”, h1 “Wait for the first frame”, lead as quoted in the spec with the agent key. While waiting the footer is Cancel · Back with the caption “This step completes when the first frame arrives.” and no gold action. After the frame the footer is Cancel · the countdown caption · Open in Work (gold). A Done or Finish button is a FAIL.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Cards.** The waiting card: spinner, h3 “Waiting for the first frame”, “polling · 1s”, the three chips, the log lines in the spec’s order and wording for the chosen harness, the trailing “waiting…”, and the start sentence. The received card: “connected” as dot and word, h3 “First frame received”, the timestamp, both frame rows with their seq, time, kind, and body, the three badges (`harness`, “replay grade: full”, “chain intact”), and the tier sentence. Missing or renamed items are FAILs.
5. **Actions and dialogs.** The poll flips the card on the sixth log line; the countdown runs in `#regAuto` and opens Work on its own; Open in Work opens it at once; Back returns to the wrap step; Check again in the error state toasts the spec’s copy. Each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest. A fixture reaching production is a FAIL. On unlock the agent and its smoke run are written once per flow.
7. **States.** Force each state and compare copy and controls with the design:
   - **loading** (`state=loading`): the shell and the rail stay and the card is the skeleton; no data, no zeros, no stale log.
   - **error** (`state=error`): h2 “The collector cannot reach Oxagen”, the two paragraphs and the request line verbatim (`https://ingest.oxagen.com/v1`, `ECONNREFUSED`, 6 attempts, 94 seconds, `req_01JQ8F4B1PC7QM`), Check again, then Cancel · Back and no gold action.
   - **access denied** (`state=denied`): “You cannot see agent registration”, the missing permission `agent.register on core-platform`, the grant sentence, Request access (opens `request-access`) and Back to Work, then Signed in as, Needed, and Decided by (`pol_v41 · deny wins over every allow`).
   Loading must not flash values. Error must name the request id and host. Denied must name the missing permission and offer Request access.
8. **Trust language.** The received card says `harness`, “replay grade: full”, “chain intact”, `attested=device-key`, and `countersigned`, and nothing stronger; the copy says reported by the harness and fail-open, never enforced. `gateway` and `contained` are real tiers elsewhere and are not shown here. Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
9. **Headings and captions.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing, except where the spec quotes longer rendered copy.
10. **Mobile.** At 390 × 844 with a touch pointer: the card fills the width with 16 px gutters, buttons are full width and at least 44 px, the log and frame rows keep their columns. Compare against the `register-run` mobile story (`mobile=1`).
11. **Accessibility.** The rail is a `nav` with an accessible name; the spinner and the connected dot are paired with words; the countdown text is in the DOM, not only visual; the dialog in the denied state is `role=dialog aria-modal` with a labelled close; focus is visible; the page is operable by keyboard end to end.
12. **Permissions.** Read requires `agent.register`; the unlock writes happen on ingest and are gated server-side, not in the UI. Verify with a role that lacks the permission.
13. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Register agent · First run audit {{DATE}}
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
