# Audit prompt: Billing

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Billing** page of Oxagen (`#/a-intel/billing`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/billing.md` (read it first, in full).
2. The design, rendered: the `billing` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright.
3. The product spec for context: `docs/mission-control-spec.md` §12.1 as amended by ADR-055 (the governed action is the billable unit), §14, Appendix A.8 (billing tables), Appendix E (contracts), Appendix F (the pages that survive); `docs/adr/ADR-055-gau-buckets-and-contracted-rates.md`; the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/billing`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar (Work, Agents, Tools, Steering, Runtimes, Spend, Repositories; Organization, Billing, Audit), breadcrumbs, ⌘K search, notifications and account are present and match the spec's shell; the breadcrumb ends on this page; the document title names the page. The top bar has an **Approvals** button left of the avatar whose count is pending approvals plus open questions across the organization; it opens the right-hand drawer (`#apdrawer`, `role=complementary`, labelled "Approvals") listing them; picking one shows the full approval card with Approve and Deny; Escape closes it. There is no assistant button in the top bar.
2. **Header.** Eyebrow "Organization", h1 "Billing", subtext "What <organization name> pays oxagen." One action with the same label: Change plan. Exactly one gold (primary) action on the screen.
3. **Summary tiles.** Four tiles: Plan, Governed actions this period, Retained evidence, Due <date>. Each shows one number and one basis line as the spec gives them; each number is a rollup of the rows under it (recompute it from the lines and compare).
4. **Sections, tabs and tables.** For each item below, the build has it, with the same panel headings and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - This period: Line, Basis, Amount; the rows Governed actions · N used, Tokens (not priced, $0.00), Evidence retention, Onboarding discount (amount with a true minus), Total (no basis).
   - Meters: Meter, This period, Note; the rows lead with Governed actions, then Sealed runs with at least one model call, Retained evidence, Runs oxagen halted before any model call, Runs of the in-app agent; the note.
   - Invoices: Invoice, Period, Governed actions, Amount, Status, Paid, Open in Stripe.
   - Price list: the seven rows of the spec (Free; Governed actions, blocks of 10,000; Negotiated agreement; Invoice billing; Evidence retention; Tokens oxagen buys for you; Enterprise, annual), each description in sentence case, and the one-line footer.
   - Billable units: Priced, Reported, Free with the spec's contents.
   - Auto top-up, Buy governed actions, Token balance: below Billable units in the right column, with the fields, lines and role messages the spec gives each. The rendered mock does not draw these three panels. Judge them against the spec's text, and do not fail them for being absent from the mock.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`plan`; `incident` on the error state; `request-access` on the denied state), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. Change plan stages the change in Stripe and shows the amount due before it is charged. An invoice row opens the Stripe-hosted invoice. **Continue to Checkout** on Buy governed actions and on Token balance opens Stripe Checkout and shows the total before anything is charged. **Save** on Auto top-up records the setting. None of these buttons is gold. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest "not recorded yet", never a zero) for the rest; ❌ rows must render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): "Nothing billable yet"; you pay per governed action, a call Oxagen decided, delivered and recorded; the free tier has every governance feature on, an included monthly allowance, thirty days of evidence and three seats. Action: Back to Work. Below the empty panel, Buy governed actions stays.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): "Billing could not be loaded", `502 stripe_unreachable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: Try again, Open an incident; a trace id, region and timestamp line.
   - **access denied** (`state=denied`): "You cannot see billing"; the roles the signed-in person holds do not include `org.billing`; an owner can grant it and the grant is a governed action in the audit record. Actions: Request access, Back to Work. Below: Signed in as, Needed, Decided by.
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
8. **Trust language.** The governed action is the only priced unit; nothing on the page prices a run, a token or a proven outcome. Tokens are reported at zero and never marked up. Nothing on the page says proven, verdict, score, witness, definition of done, GAU allowance per run, or usage credits. Money always carries its basis.
9. **Figures reconcile.** Recompute and compare: the Governed actions tile equals the Governed actions meter and the first line of This period; the blocks × rate equals the Governed actions amount; Total equals the sum of the lines after the discount; Due equals Total; Retained evidence matches on the tile, the line and the meter; each invoice's governed actions and amount agree with Stripe. A figure typed by hand is a FAIL.
10. **Headings and labels.** No heading on the built page carries a comma, a mid-dot or a not/never contrast; subtext under a heading is one sentence or nothing. Labels match the spec verbatim.
11. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Work/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet; the approvals drawer opens full-width; the two columns stack; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is at least 44 px; inputs are 16 px. Compare against the mobile story (`mobile=1`).
12. **Accessibility.** Dialogs are `role=dialog aria-modal` with a labelled close; the drawer is `role=complementary` and inert when closed; icon buttons have `aria-label`; the external link says where it goes; state is never colour alone (dot and word); focus is visible; the page is operable by keyboard end to end.
13. **Permissions.** Read requires `org.billing`; the write (`billing.plan.change`) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
14. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays. The Auto top-up, Buy governed actions and Token balance panels, and the one-line banner after a Checkout return, are in the spec and are not extras.

## Output

Return a single markdown report:

```
# Billing: audit {{DATE}}
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

Rules: never mark PASS on an assumption; open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
