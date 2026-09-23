# Audit prompt: the whole app

The per-page prompts (`<page>.audit-prompt.md`) check one page each. This one checks what no
page owns: the shell, navigation, the approvals drawer, the mobile shell, the auth flows as a
sequence, the cross-cutting rules, and that every page has been audited. Copy everything below the
line into a fresh agent session and fill the placeholders.

---

You are auditing the Oxagen build at `{{APP_ROOT}}` (served at `{{APP_URL}}`) against its design.
The design is the mockup at `mockups/missioncontrol.html`; it is the spec. Be exact and adversarial.
Close enough is a fail.

## Inputs

1. `mockups/pages/README.md`: every page, its spec (`<page>.md`) and its audit prompt.
2. `mockups/missioncontrol.html?product=1&state=loaded&mobile=0` (the whole design, desktop) and
   `…&mobile=1` (the whole design, mobile), or the Product stories in Storybook. Open them and
   navigate; everything on them is the design.
3. `docs/mission-control-spec.md` §12.6 to §12.9 (tokens, attribution, findings), §14
   (Mission Control), §14.1 (surfaces), Appendix A (target tables), Appendix E (contracts),
   Appendix F (the pages that survive).
4. `docs/implementation-plan.md` §3 (data mapping), §4.8 (page states), §4.10 (tabs as
   segments), §4.11 (session gate and Appendix F redirects), §8 (the phases the design assumes
   shipped: every phase, 0 to 5).

## What is not in the design

The build must not have any of these. Each one found is a FAIL: a witness runner, an oracle, a
flip, a `proof.observed` frame, a Proof tab, a Verdict column, a `proven` chip, a definition of
done (Done column, tile, tab, certificate, `dod.*` frames), a trust score or spend score, a
percentile band, proven or accepted or unproven spend, spend per proven run, a witness-run tab set,
an incident kind `witness_tampered` or `witness_probe`, an approvals panel on Fleet, an interjection
banner on Fleet, an assistant button in the topbar.

## Procedure

Record PASS / FAIL / N/A per check with evidence (file:line, selector + text, or screenshot path).

### A. Pages exist, nothing else does
1. Exactly the routes in Appendix F exist: seven workspace pages (`/{org}/{ws}`, `/runs/{run}`,
   `/agents[/{agent}[/source|/mandates/{id}]]`, `/tools`, `/steering`, `/spend`), three organization
   pages (`/{org}`, `/{org}/billing`, `/{org}/audit`), the seven sign-in flows, the Register Agent
   gate and the onboarding gate. Every other route is a FAIL.
2. Account is a dialog from the user menu, not a page. Approvals are a drawer from the topbar and a
   strip on Run, not a page and not a panel on Fleet. Onboarding is not a page.
3. Run every per-page audit prompt (`<page>.audit-prompt.md`) and attach each report. This audit is
   FAIL if any of them is.

### B. Shell (desktop)
4. Sidebar: organization switcher and workspace switcher at the top; Workspace nav Fleet, Agents,
   Tools, Steering, Runtimes, Repositories, Spend; Organization nav Organization, Billing, Audit; the footer
   (agent count, data plane, connection); the assistant launcher at the foot of the sidebar.
5. Nav counts appear only where something waits on a person: Fleet (live runs), Steering
   (proposals), Audit (open critical incidents). Any other count is a FAIL.
6. Topbar, left to right: breadcrumbs ending on the current page; ⌘K search-or-run listing every
   page and action; notifications with an unread dot; the approvals button with a numeric badge;
   the account avatar (Account, Preferences, Security and sessions, Privacy and data, Switch theme,
   Sign out). No assistant button in the topbar.
7. The approvals drawer. The badge counts every pending approval across the organization plus an
   open interjection; it is present on every page including organization pages. Clicking opens a
   right-hand drawer titled "Approvals" with the count, a list under "N waiting on you" (an
   interjection row with "Answer it", then approval rows: shield glyph, amount or tool version,
   agent, task title, workspace, risk and side-effect chips, a live countdown), then "N resolved
   today". Selecting a row shows the full approval card (four-hop chain, rules that fired, taint,
   mandate bar, decision footer with Approve and Deny) with "‹ All approvals" above it. Escape and
   the scrim close it. The countdowns keep ticking inside it. Resolving an approval inside the
   drawer is the same governed action as on Run.
8. Theme: light, dark and system all render with the token palette; no colour is defined only inside
   a media or `[data-theme]` block.

### C. Shell (mobile, 390 × 844, touch)
9. A fixed five-slot thumb bar: Fleet, Agents, Tools, Spend, More; counts as in B5 (Fleet, and More
   carrying Audit's); the active slot is marked; every slot at least 44 px tall and inside the
   bottom quarter of the screen.
10. More is a bottom sheet listing Steering (with Skills inside it), Repositories, Organization,
    Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace.
11. The hamburger opens the full sidebar as a drawer over a scrim; tapping the scrim closes it. The
    approvals button is in the compact topbar and its drawer is full width.
12. Every dialog rises from the bottom edge as a sheet with a drag handle, a scrolling body and
    full-width footer buttons, the primary under the thumb.
13. Every list table renders as a stack of cards with each cell labelled by its column header; no
    page scrolls sideways at any width down to 360 px. The Run page's two columns stack.
14. Inputs are 16 px (no focus zoom on iOS); tabs scroll horizontally with snap; the topbar shows
    only the current crumb, the search glyph, notifications, approvals and avatar; safe-area insets
    are respected top and bottom.
15. Resizing across the breakpoint re-lays the shell without a reload and without losing page state.

### D. Auth flows as sequences
16. Sign up → Verify email → Name the organization → Wrap an agent → Start a run → Fleet showing the
    first run. Each step's loading, error and (where the design has it) denied state matches the
    design.
17. Log in → Two-factor → Fleet; Forgot password → Reset link sent → Set a new password → Log in;
    Accept invitation → Fleet. The suspended-account, expired-link and wrong-account states render
    as designed.
18. Every sign-in write (sign up, log in, 2FA, reset, accept) produces an audit event; the session
    gate redirects an unauthenticated request for any app route to Log in and back after.

### E. Cross-cutting rules
19. Trust language: every enforcement tier, replay grade, attestation and cost basis shows the
    recorded value and nothing stronger. The ladder is `observe`, `harness`, `gateway`, `contained`,
    all real; a run's basis is `gateway_observed` only when the proxy counted it and
    `client_attested` otherwise; a class the harness did not report is marked absent, never zero.
20. Money always carries its basis; every token figure carries its basis; headers are rollups of
    their rows (recompute three tiles on three pages, and the Tokens tile on Spend from the by-class
    table).
21. Exactly one gold action per screen; gold never encodes state; state is a dot and a word.
22. Not-loaded states replace the page body, never the shell; loading never flashes zeros;
    ❌-mapped data renders `NotBacked` with its milestone, never a fixture and never a zero.
23. Every write is a governed action: IAM check server-side, audit event, receipt or reference shown.
    Verify with a role lacking the permission on three writes, one of them from the approvals drawer.
24. One agent tool contract drives the API, MCP, CLI and UI (§14.1): pick three actions and show the
    same contract behind each surface.
25. Headings and labels: on every page, a heading names the thing, a caption states one fact, and no
    label carries a comma, a mid-dot or a not/never contrast; subtext under a page title is one
    sentence. Grep the build's rendered headings for ` · `, `, ` and ` not `.
26. Accessibility: keyboard-operable end to end, visible focus, `role`/`aria-*` on tabs, dialogs, the
    drawer (`role=complementary`, `inert` when closed) and icon buttons, contrast at least 4.5:1 for
    text on every surface it can land on in both themes.

## Output

```
# Oxagen audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|

## Fails, most severe first
1. …

## Per-page reports
- fleet: PASS/FAIL (link)
- …
```

Never mark PASS on an assumption; open the file or the DOM. Quote the design's copy verbatim when a
label differs. If the build cannot be started, stop and report that as the single FAIL.
