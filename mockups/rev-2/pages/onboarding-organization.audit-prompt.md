# Audit prompt: Onboarding · Organization

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Onboarding · Organization** page of Oxagen (`#/welcome/organization`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/onboarding-organization.md` (read it first, in full).
2. The design, rendered: the `onboarding-organization` stories in Storybook (`npm run storybook`), one per state (loaded, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. `node tools/check-mockup.mjs` confirms the design renders in every state.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/welcome/organization`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with the gate shell only: brandmark, the signed-in email, a Cancel button, the three-step rail (1 Name the organization current with `aria-current="step"`, 2 Wrap an agent and 3 Start a run disabled), and the caption under the card. There is no sidebar, no topbar, and so no approvals button or drawer. An app shell on this route is a FAIL. The document title names the page.
2. **Header.** Eyebrow “Step 1 of 3”, h1 “Name your organization”, lead as quoted in the spec. Footer actions present, in order, with the same labels: Cancel · Continue, with the caption “Creates `org_a-intel` and its graph database.” before Continue. Exactly one gold (primary) action on the screen: Continue.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Fields.** In this order: Organization name; Address (read-only, `oxagen.com/<namespace>`, its hint); Namespace (`maxlength=6`, its hint with “immutable” and the key pattern); the h3 “First workspace”; Workspace name; Governance mode, a select with `solo`, `team`, `regulated` and `team` selected; the governance partition sentence. Every hint matches the spec verbatim. Missing or renamed fields are FAILs.
5. **Actions and dialogs.** Continue provisions the tenant and moves to Wrap an agent; the governance mode chosen is the value Steering’s header chip and the Organization workspaces table then show. Cancel returns to Fleet and writes nothing. Each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the gap named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design:
   - **loading** (`state=loading`): the shell and the rail stay and the card is the skeleton; no data, no zeros, no stale fields.
   - **error** (`state=error`): the inline error “That namespace is taken. `a-intel` belongs to another organization. Pick a different 2–6 character namespace.” above the fields, the Namespace input marked bad, everything else intact.
   - **access denied** (`state=denied`): “You cannot see onboarding”, the missing permission `org.create for marcus@a-intel.example`, the grant sentence, Request access (opens `request-access`) and Back to Fleet, then Signed in as, Needed, and Decided by (`pol_v41 · deny wins over every allow`).
   Loading must not flash values. Error must say what happened and what to do. Denied must name the missing permission and offer Request access.
8. **Trust language.** The page names no tier, replay grade, attestation, or cost basis, and it must not add one. The governance mode is a workspace setting, not a trust claim, and the three options are the only ones. Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
9. **Headings and captions.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing, except where the spec quotes longer rendered copy.
10. **Mobile.** At 390 × 844 with a touch pointer: the card fills the width with 16 px gutters, the grids stack, buttons are full width and at least 44 px, inputs are 16 px. Compare against the `onboarding-organization` mobile story (`mobile=1`).
11. **Accessibility.** Every input and the select have a `label for`; the rail is a `nav` with an accessible name; the inline error is announced; the dialog in the denied state is `role=dialog aria-modal` with a labelled close; focus is visible; the page is operable by keyboard end to end.
12. **Permissions.** Read requires an authenticated session; `org.create` and `workspace.create` are gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
13. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Onboarding · Organization audit {{DATE}}
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
