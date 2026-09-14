# Audit prompt — the whole app

The per-page prompts (`<page>.audit-prompt.md`) check one page each. This one checks what no
page owns: the shell, navigation, the mobile shell, the auth flows as a sequence, the
cross-cutting rules, and that every page has been audited. Copy everything below the line into a
fresh agent session and fill the placeholders.

---

You are auditing the Oxagen Mission Control build at `{{APP_ROOT}}` (served at `{{APP_URL}}`)
against its design. The design is the spec. Be exact and adversarial; “close enough” is a fail.

## Inputs

1. `pages/index.html` — every page in every state, desktop and mobile; each row links the page’s spec (`<page>.md`) and its audit prompt (`<page>.audit-prompt.md`).
2. `mockups/missioncontrol.html?product=1&state=loaded&mobile=0` (the whole design, desktop) and `…&mobile=1` (the whole design, mobile), or the Product stories in Storybook. Open them and navigate; everything on them is the design.
3. `docs/2026-09-11-oxagen-mission-control-spec.md` §14 (Mission Control), §14.1 (surfaces), Appendix F (the pages that survive), Appendix A (target tables).
4. `docs/2026-09-12-mission-control-app-implementation-plan.md` §3 (data mapping), §4.8 (page states), §4.10 (tabs as segments), §4.11 (session gate and Appendix F redirects).

## Procedure

Record PASS / FAIL / N/A per check with evidence (file:line, selector + text, or screenshot path).

### A. Pages exist, nothing else does
1. Exactly the routes in Appendix F exist: seven workspace pages (`/{org}/{ws}`, `/runs/{run}`, `/agents[/{agent}[/source|/mandates/{id}]]`, `/tools`, `/steering`, `/spend`), three organization pages (`/{org}`, `/{org}/billing`, `/{org}/audit`), the seven sign-in flows, the Register Agent gate and the onboarding gate. Every other route from the old app redirects to the page that absorbed it (§4.11) — test five at random.
2. Account is a dialog from the user menu, not a page. Approvals are a panel on Fleet and a strip on Run, not a page. Onboarding is not a page.
3. Run every per-page audit prompt (`<page>.audit-prompt.md`) and attach each report. This audit is FAIL if any of them is.

### B. Shell (desktop)
4. Sidebar: organization switcher and workspace switcher at the top; Workspace nav Fleet · Agent IAM · Tools · Steering · Spend; Organization nav Organization · Billing · Audit; the footer line (agent count · data plane · tier badge). No Scenarios item, no onboarding-demo entry anywhere.
5. Nav counts appear only where something waits on a person: Fleet (approvals pending), Steering (proposals), Audit (open critical incidents). Any other count is a FAIL.
6. Top bar: breadcrumbs ending on the current page; ⌘K opens search-or-run and lists every page and action; notifications with an unread dot and a list where every kind maps to a frame kind or audit event; the account avatar → Account, Preferences, Security and sessions, Privacy and data, Switch theme, Sign out.
7. There is no assistant panel; every question about the fleet is a page, and every configuration change is a dialog that runs a governed action.
8. Theme: light, dark and system all render with the token palette; no colour is defined only inside a media or `[data-theme]` block.

### C. Shell (mobile — 390 × 844, touch)
9. A fixed five-slot thumb bar: Fleet · Agents · Tools · Spend · More; counts as in B5 (Fleet, and More carrying Audit’s); the active slot is marked; every slot ≥ 44 px tall and inside the bottom quarter of the screen.
10. More is a bottom sheet listing Steering, Organization, Billing, Audit, Search, Notifications, Account, Switch organization, Switch workspace — the whole app reachable with one thumb.
11. The hamburger opens the full sidebar as a drawer over a scrim; tapping the scrim closes it.
12. Every dialog rises from the bottom edge as a sheet with a drag handle, a scrolling body and full-width footer buttons, the primary under the thumb.
13. Every list table renders as a stack of cards with each cell labelled by its column header; no page scrolls sideways at any width down to 360 px.
14. Inputs are 16 px (no focus zoom on iOS); tabs scroll horizontally with snap; the top bar shows only the current crumb, the search glyph, notifications and avatar; safe-area insets are respected top and bottom.
15. Resizing across the breakpoint re-lays the shell without a reload and without losing page state.

### D. Auth flows as sequences
16. Sign up → Verify email → Name the organization → Wrap an agent → Start a run → Fleet showing the first run. Each step’s loading, error and (where the design has it) denied state matches `pages/<step>-<state>.html`.
17. Log in → Two-factor → Fleet; Forgot password → Reset link sent → Set a new password → Log in; Accept invitation → Fleet. The suspended-account, expired-link and wrong-account states render as designed.
18. Every sign-in write (sign up, log in, 2FA, reset, accept) produces an audit event; the session gate redirects an unauthenticated request for any app route to Log in and back after.

### E. Cross-cutting rules
19. Trust language: every enforcement tier, replay grade, attestation and cost basis shows the recorded value and nothing stronger; grep the build for any path that could render “gateway” for a client-attested window.
20. Money always carries its basis; headers are rollups of their rows (recompute three tiles on three pages).
21. Exactly one gold action per screen; gold never encodes state; state is a dot and a word.
22. Not-loaded states replace the page body, never the shell; loading never flashes zeros; ❌-mapped data renders `NotBacked` with its milestone, never a fixture and never a zero.
23. Every write is a governed action: IAM check server-side, audit event, receipt or reference shown. Verify with a role lacking the permission on three writes.
24. One agent tool contract drives the API, MCP, CLI and UI (§14.1): pick three actions and show the same contract behind each surface.
25. Accessibility: keyboard-operable end to end, visible focus, `role`/`aria-*` on tabs, dialogs and icon buttons, contrast ≥ 4.5:1 for text on every surface it can land on in both themes.

## Output

```
# Mission Control — audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|

## Fails, most severe first
1. …

## Per-page reports
- fleet: PASS/FAIL (link)
- …
```

Never mark PASS on an assumption — open the file or the DOM. Quote the design’s copy verbatim
when a label differs. If the build cannot be started, stop and report that as the single FAIL.
