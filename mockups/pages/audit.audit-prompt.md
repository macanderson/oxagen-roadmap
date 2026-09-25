# Audit prompt: Audit

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Audit** page of Oxagen (`#/a-intel/audit[/<tab>]`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/audit.md` (read it first, in full).
2. The design, rendered: the `audit` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The other tabs are reachable from the loaded story.
3. The product spec for context: `docs/mission-control-spec.md` §14, §13.3 (retention tiers), Appendix A (target tables), Appendix E (contracts), Appendix F (the pages that survive); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/audit[/<tab>]`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar (Work, Agents, Tools, Steering, Runtimes, Spend, Repositories; Organization, Billing, Audit, with the Audit count equal to open critical incidents), breadcrumbs, ⌘K search, notifications and account are present and match the spec's shell; the breadcrumb ends on this page; the document title names the page. The top bar has an **Approvals** button left of the avatar whose count is pending approvals plus open interjections across the organization; it opens the right-hand drawer (`#apdrawer`, `role=complementary`, labelled "Approvals") listing them; picking one shows the full approval card with Approve and Deny; Escape closes it. There is no assistant button in the top bar.
2. **Header.** Eyebrow "Organization", h1 "Audit", subtext "What happened, who allowed it, under what authority, and what it cost.", the mono retention line beneath. One action with the same label: Export evidence bundle. Exactly one gold (primary) action on the screen.
3. **Summary tiles.** On Events: Events · 30 days, Denied, By a service principal, By an agent. On Incidents: Open, Critical · 12 months, Median time to resolve, Money moved without a receipt. Each shows one number and one basis line; each number is a count of the rows beneath it through the same classifier the table uses (recompute and compare).
4. **Sections, tabs and tables.** For each item below, the build has it, with the same tab labels (and live counts where the design shows them), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Tabs: Events (N), Incidents (N open), Receipts (N), Exports (N), Keys, Retention.
   - Events: Actor and Range selects, the search field, the Result and Severity filters, CSV; When, Event, Actor, What, Result, Severity, Reference; the note.
   - Incidents: the critical banner with Open the incident while one is open; Open an incident; Severity, What happened, Opened, Detected by, State; Open per row; the kinds `mandate.exception`, `taint_raised`, `receipt_modified`, `chain_break`, `hooks_removed`, `credential_probe` and no other.
   - Receipts: the search input, Search, the example chips, clear; Receipt, When, Agent and operator (the agent key led by its harness mark), Tool version, Decision, Amount, External effect, Tier; the empty-search state with Clear the search; the "N of N receipts shown" footer.
   - Exports: the callout; one card per export with its badge, Verify bundle, Download and the seven facts; Verifier; Outbound events with Dead-letter view and Delivery.
   - Keys: Rotate KEK; Key, Algorithm, Gen, Valid from, Valid to, State, What it covers; Rotate on the active KEK; the re-wrap bar.
   - Retention: Edit policy; Body retention, Hot window, Replay of a compacted run, Workspace opt-down, Storage price (the Billing figure, included for 13 months, then $0.10 per GB-month); Archive tiers with Tier, Where, What it holds, Retention, Held today; Redaction.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`newexport`, `exportevents`, `incident`, `incidentview`, `receipt`, `rotatekek`, `retention`, `request-access`), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. Build bundle queues an export that appears on Exports as building; Rotate retires the active KEK and adds the next generation; Verify bundle prints the verifier result. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest "not recorded yet", never a zero) for the rest; ❌ rows must render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): "No audit events yet"; events are written by the kernel on every governed action; empty means nothing has been done yet, not that recording is off. Action: Open Organization.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): "Audit could not be loaded", `503 audit_store_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen. Actions: Try again, Open an incident; a trace id, region and timestamp line.
   - **access denied** (`state=denied`): "You cannot see the audit record"; the roles the signed-in person holds do not include `org.auditor or org.owner`; an owner can grant it and the grant is a governed action in the audit record. Actions: Request access, Back to Work. Below: Signed in as, Needed, Decided by.
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
8. **Trust language.** Every tier, attestation and cost basis on the page shows the recorded value. A receipt at `observe` renders "recorded only" and its authority Decision says "observed (oxagen did not decide this call)", never **Decided by oxagen**; a receipt at `harness` says "routed through oxagen"; the ladder `observe`, `harness`, `gateway`, `contained` renders only as recorded. No incident kind, tile or column names a witness, a verdict, a proof or a definition of done. Money always carries its basis.
9. **Figures reconcile.** Recompute and compare: the four Events tiles equal the filtered counts of the events table; the Incidents tiles equal the incidents rows; the tab counts equal their rows; the re-wrap percentage equals objects re-wrapped over objects wrapped; "N of N receipts shown" equals the table. A figure typed by hand is a FAIL.
10. **Headings and labels.** No heading on the built page carries a comma, a mid-dot or a not/never contrast; subtext under a heading is one sentence or nothing. Labels match the spec verbatim.
11. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Work/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet; the approvals drawer opens full-width; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is at least 44 px; inputs are 16 px. Compare against the mobile story (`mobile=1`).
12. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; the drawer is `role=complementary` and inert when closed; clickable rows are focusable and open on Enter; selects and inputs are labelled; state is never colour alone (dot and word); focus is visible; the page is operable by keyboard end to end.
13. **Permissions.** Read requires `org.auditor or org.owner`; each write (`export.create`, `key.rotate`, `incident.open / assign`, `retention.edit`) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
14. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Audit: audit {{DATE}}
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
