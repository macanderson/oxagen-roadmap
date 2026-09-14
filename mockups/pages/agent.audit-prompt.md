# Audit prompt — Agent

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Agent** page of Oxagen Mission Control (`#/a-intel/core-platform/agents/<slug>[/<tab>]`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/agent.md` (read it first, in full).
2. The design, rendered: `pages/agent-<state>.html` and `pages/agent-<state>-mobile.html` for each state (loaded, empty, loading, error, access denied); open them in a browser or with Playwright. `pages/index.html` links all of them.
3. The product spec for context: `docs/2026-09-11-oxagen-mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/2026-09-12-mission-control-app-implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/agents/<slug>[/<tab>]`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar, breadcrumbs, ⌘K search, notifications, assistant and account are present and match the spec’s shell; the breadcrumb ends on this page. The document title names the page.
2. **Header.** Eyebrow “Agent”, h1 “the agent card (detail layout: avatar, key, harness, trust and spend scores)”. Actions present, in order, with the same labels: Edit avatar · Rotate credential · Suspend · Deregister · See the belt as the model sees it. Exactly one gold (primary) action on the screen.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Sections, tabs and tables.** For each item below, the build has it, with the same tab labels (and live counts where the design shows them), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Tabs (hash-routed: `/agents/<slug>/<tab>`): Identity · Toolbelt (N) · Mandates · Budgets · Runs · Enrollment · Tamper incidents (N) · Definition in git.
   - Identity — Identity (Agent key · Principal · Kind · Harness · Model tier · Operator · Status · First frame), Credentials this agent holds (See the connections that mint them), Run credential (Key · Purpose lock · Issued · Last used · Run tokens · Host device key; Rotate, Revoke credential), Roles and the delegation ceiling (`agent.graph.read`, Resource scope · Spend ceiling · Can move money; Assign a role, Change identity), What was actually enforced (Model calls · MCP tool calls · Harness-native tools — the tier computed per run and rendered verbatim), Definition in git (Path · Repo · Commit · `definition_digest` · Generated beside it; Open the file).
   - Toolbelt — How this belt was computed (Searchable belt / Full belt), What the model receives, Try the belt search (queries: pull request · context record · stripe payment · delete repository · graph; Run), Per-tool decision rules table: Tool · Category · Decision · Hazard · Egress · Financial · Schema digest (Labels / API names toggle, By category / Flat), What this agent cannot see (Tool · Why it is not on the belt).
   - Mandates — the mandate page inline (see `mandate.md`): Per call · Per period · Settled · Remaining tiles, The ledger, The grant, Reconciliation.
   - Budgets — Budgets (Mode · On a breach · Spend 30d · Proven spend 30d · Runs 30d · Cost per run; Set budget), Token accounting (Class · Tokens 30d · Rate · Cost), Findings for this agent (Evidence, Fix, Open on Spend).
   - Runs — Run · Status · Verdict · Cost · Frames · Started.
   - Enrollment — Host (Device · Device key · Collector · Hook binary · Hooks written · Model proxy · Tool gateway · Settings · Tier earned · First frame · Last checkpoint; Run a smoke session), Rollback (Unenroll; hooks stripped by hand record `hooks_removed` and the tier falls to what was observed).
   - Tamper incidents — one card per incident (`hooks_removed`…): What happened · What it stopped · Closed · Incident; Open on Audit. The count equals the Audit page’s, read from the same record.
   - Definition in git — the TOML rendered as a form: Identity · Model and budget · Tools · Instructions · Harness · Source (Repository · `definition_digest` · At commit · Generated beside it) · Changing this agent (a pull request; the principal is retired, never deleted).
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`delagent`, `assignrole`, `avatar`, `budget`, `evidence`, `fix`, `connection`), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`agent-empty.html`): “This agent has never run” — registered and enrolled, no frame yet; the belt is computed at run start so there is nothing to show for tools either. Action: Back to Fleet.
   - **loading** (`agent-loading.html`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`agent-error.html`): “This agent could not be loaded” — `503 iam_principals_unavailable`. Nothing was changed. Runs kept recording while this page was down — frames are written by the gateway, not by Mission Control. Actions: Try again, Open an incident; a trace id, region and timestamp line.
   - **access denied** (`agent-denied.html`): “You cannot see this agent” — the roles the signed-in person holds on the organization do not include `agent.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: Request access (opens the request-access dialog), Back to Fleet. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` ·
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
8. **Trust language.** Every tier, replay grade, attestation and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (e.g. “gateway” for a client-attested window). Money always carries its basis.
9. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px. Compare against `pages/agent-loaded-mobile.html`.
10. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; icon buttons have `aria-label`; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
11. **Permissions.** Read requires `agent.read`; each write (agent.credential.rotate/revoke; agent.suspend; agent.deregister; agent.role.assign; budget.set; enrollment.revoke) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
12. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Agent — audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong> — <where> — <what the design shows> — <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected NotBacked, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption — open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
