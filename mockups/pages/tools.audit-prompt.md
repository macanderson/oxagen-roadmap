# Audit prompt — Tools

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Tools** page of Oxagen Mission Control (`#/a-intel/core-platform/tools[/<tab>]`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/tools.md` (read it first, in full).
2. The design, rendered: the `tools` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/tools[/<tab>]`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar, breadcrumbs, ⌘K search, notifications and account are present and match the spec’s shell; the breadcrumb ends on this page. The document title names the page.
2. **Header.** Eyebrow “Workspace · <workspace name>”, h1 “Tools”. Actions present, in order, with the same labels: Import server · Flip a kill switch. Exactly one gold (primary) action on the screen.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Sections, tabs and tables.** For each item below, the build has it, with the same tab labels (and live counts where the design shows them), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Tabs (`/tools/<tab>`): Registry (N to approve) · Connections (N) · Mandates ledger (N) · Policy (N) · Kill switches (N on) · Auto-approvals (N).
   - Registry — banner “N awaiting approval: output schemas were observed, not declared” (Review opens the schema dialog); Tool servers table: Server · Kind · Tools · Health · Schemas · Connection · Last import (Import tools from an MCP server); Tool versions table: Tool version · Category · Hazard · Gate today · Egress · Financial · Schema origin · Digest · On belts · Calls 30d (Labels / API names toggle; category chips with counts across the ten categories, By category / Flat). A row opens the tool dialog. Note: the gate shown is today’s — the version’s own kill switch, then its server’s, then the mandate rule, then `pol_v41`.
   - Connections — the customer’s credentials in the vault: Connection · Kind · Owner · Servers · Downscope · Grants 30d · Reviewed · Next review · Status (Add a connection); Credential grants log: Grant · Tool version · Agent · run · Connection · Scope · TTL · State; How the broker chooses: Provider capability · What the broker mints · Here; Financial connections carry extra rules: Named human owner · Mandate per agent · Full-scope keys · Named human owner.
   - Mandates ledger — Mandate · Agent · Granted by · Purpose · Per call · Per period · Settled · Reserved · Remaining · Valid to · Status (Grant a mandate opens the mandate dialog).
   - Policy — Policy versions: Version · State · Author · When · Rules · Tests · What changed (Edit opens the policy dialog); Conditions available to policy; a sequence rule as shipped.
   - Kill switches — “Deny is available at every level”: platform-wide classes (every `moves_funds` tool, every irreversible tool, every tool with egress: third_party), organization, workspace, server, tool version, connection, key, category, agent, person. Each switch: allowing / denying toggle, Blast radius · Takes effect · Flipped by · Reason. Flipping bumps `deny_generation` so every live run token is re-checked at the next call.
   - Auto-approvals — trust-gated rules: Rule · Applies to · Requires · Qualifying now · Approved 30d · On (Create rule, Edit, Delete); tiles: Rules on · Auto-approved 30d (each one a frame with the rule id) · Held by a floor (tainted, critical, or above a ceiling) · Median wait saved.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`import`, `connection`, `tool`, `schema (approve observed)`, `mandate`, `policy (edit)`, `switch`), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): “No tool server is registered” — no belt, every call by name is `unknown_tool`. Actions: Import from an MCP server, Add a connection.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “Tools could not be loaded” — `503 tool_registry_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Mission Control. Actions: Try again, Open an incident; a trace id, region and timestamp line.
   - **access denied** (`state=denied`): “You cannot see the tool registry” — the roles the signed-in person holds on the organization do not include `tools.read on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: Request access (opens the request-access dialog), Back to Fleet. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol
   Loading must not flash zeros. Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
8. **Trust language.** Every tier, replay grade, attestation and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows (every agent and run is `observe` or `harness`; `gateway` and `contained` render only as not yet available; nothing says enforced about the harness tier). Money always carries its basis.
9. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; More opens a bottom sheet; every dialog is a bottom sheet with full-width footer buttons; every list table renders as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px. Compare against `pages/tools-loaded-mobile.html`.
10. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; icon buttons have `aria-label`; state is never colour alone (dot + word); focus is visible; the page is operable by keyboard end to end.
11. **Permissions.** Read requires `tools.read`; each write (tools.import; tools.schema.approve; connection.add; mandate.grant; policy.edit / policy.activate; switch.flip; autorule.edit) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
12. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Tools — audit {{DATE}}
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
