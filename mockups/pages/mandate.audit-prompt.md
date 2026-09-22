# Audit prompt: Mandate

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Mandate** page of Oxagen (`#/a-intel/finops/agents/invoice-bot/mandates/<mandate id>`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/mandate.md` (read it first, in full).
2. The design, rendered: the `mandate` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The checker is `node tools/check-mockup.mjs`.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/finops/agents/invoice-bot/mandates/<mandate id>`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route and resolves the mandate the route names; the sidebar (Workspace: Fleet, Agents, Tools, Steering, Runtimes, Repositories, Spend; Organization: Organization, Billing, Audit; the assistant launcher at the foot), breadcrumbs (… / Agents / <slug> / <mandate id>), ⌘K search, notifications, the approvals button, and account are present and match the spec’s shell. No assistant button in the top bar. The document title names the page.
2. **Header.** Eyebrow “Mandate”, h1 the mandate id in mono, the status, “granted by”, and currency badges, then the purpose. Actions present, in order, with the same labels: Change limits · Revoke. No gold action on the page body; never more than one gold action visible at once.
3. **Summary tiles.** 4 tiles: Per call · Per period · Settled · Remaining. Each shows one number and one basis line; Settled is the sum of settled ledger rows this period, and Remaining equals the period limit less settled less reserved (recompute both from the ledger and compare).
4. **Sections, tabs, and tables.** For each item below, the build has it, with the same panel headings and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Ledger panel: the remaining-authority bar with settled, reserved by this call (only while a reservation is held), and remaining, each with its amount and share; the concurrency sentence; the table When · Call · Amount · State · External id · Receipt, with a receipt link on every settled row and a released row showing the release. Search, facet on State, rows-per-page, pager.
   - Grant panel: Agent · Granted by · Second approver · Effect · Counterparties · Tools · Approval · Valid.
   - Ledger panel (exceptions): the critical exception with Open on Audit on this mandate, or the “Every draw on this mandate has a receipt…” note on one with no exception.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`mandate` for Change limits, `receipt` from a ledger row, `request-access` from denied, `incident` from error), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. Revoke ends in-flight calls that have not dispatched and says so. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Approvals button and drawer.** The topbar button is left of the avatar with aria-label “Approvals, N waiting”; it opens `#apdrawer`; Escape closes it; approving or denying a call under this mandate from the drawer moves this page’s bar, tiles, and ledger (one record).
7. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. Every row is ❌ today; each must render `NotBacked` with the gap named, never a zero. A fixture reaching production is a FAIL.
8. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): “This mandate has never been drawn on”; active, ledger empty, remaining equals the full period limit. No actions.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “This mandate could not be loaded”; `503 mandate_ledger_unavailable`; nothing was changed; runs kept recording; frames are written by the collector on each host. Actions: Try again, Open an incident; a trace id, region, and timestamp line.
   - **access denied** (`state=denied`): “You cannot see this mandate”; the missing permission `org.billing`, readable only by a finance role; an owner can grant it and the grant is a governed action. Actions: Request access, Back to Fleet. Below: Signed in as, Needed, Decided by (`pol_v41` · deny wins over every allow).
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
9. **Trust language.** Every amount carries its currency and reads from the ledger; a reservation is labelled reserved until a receipt settles or releases it; nothing calls a reserved amount spent. The exception names money that moved outside Oxagen as ungoverned, not as a receipt.
10. **Ledger figures.** The bar’s settled, reserved, and remaining sum to the period limit; each equals the matching tile; every settled row’s amount is in the settled total. A constant or a typed figure is a FAIL.
11. **Headings.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence.
12. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; the two columns stack with the ledger first; every dialog is a bottom sheet with full-width footer buttons; the ledger renders as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px.
13. **Accessibility.** The remaining-authority bar is `role=img` with an `aria-label` that states settled, reserved, and remaining; dialogs are `role=dialog aria-modal` with a labelled close; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
14. **Permissions.** Read requires `org.billing` (a finance role); each write (mandate.grant / mandate.change; mandate.revoke) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
15. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Mandate audit {{DATE}}
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
