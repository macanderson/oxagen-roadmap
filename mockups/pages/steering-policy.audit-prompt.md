# Audit prompt: Steering · Policy

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering · Policy** tab of Oxagen Mission Control (`#/a-intel/core-platform/steering/policy`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering-policy.md`, and the hub it belongs to, `mockups/pages/steering.md` (read both first, in full).
2. The design, rendered: the `steering-policy` stories in Storybook (`npm run storybook`), one per state, desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>`.
3. The decisions this tab renders: the story sheet of 2026-09-18, decisions 3, 5, and 9.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route. Steering is lit in the sidebar. There is no Skills nav entry. The breadcrumb ends on Steering.
2. **Hub header and tabs.** h1 “Steering”. Seven tabs in this order: Records, Skills, Memory, Ontology, Policy, Proposals, Preview. This tab is selected. Each tab is a URL segment, and reloading the URL lands on the same tab.
3. **One gold action.** Write a context record in the hub header is the one gold action. The Edited on buttons are not gold.
4. **Sections and tables.** The build has each item below with the same headings and every column named, in that order.
   - The two compilation panels, text and gates.
   - Gates table: Gate · Outcome · Applies to · Gate notice · Notice cost · Edited on.
   - Edited on routes: Tools · Policy, Tools · Kill switches, Tools · Mandates, the Mandate page, or the record.
5. **Actions.** Every Edited on button routes to the existing editor. Fail if a gate can be edited on this tab.
6. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named store; 🟡 rows are wired for the fields that exist and render `NotBacked` for the rest; ❌ rows render `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
7. **States.** Force each state and compare copy and controls with the design:
   - **empty** (`state=empty`): the hub header and tabs stay; the body is “No gate applies to this workspace yet”.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): “Steering could not be loaded”, `503 record_index_unavailable`, Try again, Open an incident, and the trace line.
   - **access denied** (`state=denied`): “You cannot see this workspace’s steering”, naming `steering.read on core-platform`, with Request access and Back to Fleet.
8. **Trust language.** Gates are described as deterministic, never budgeted, never ranked. The refusal claim carries its scope: for actions routed through Oxagen. The harness tier is client-attested and fail-open. The word enforced does not appear as a claim about the harness tier.
9. **Mobile.** At 390 × 844 with a touch pointer: the seven tabs are one scrolling strip and the selected tab is in view; every list table renders as labelled cards; the page never scrolls sideways; tap targets are ≥ 44 px; inputs are 16 px; More is the lit thumb-bar slot.
10. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; grouped toggles use `aria-pressed`; state is never colour alone; focus is visible; the tab is operable by keyboard end to end.
11. **Permissions.** Read requires `steering.read`, checked server-side. There are no writes on this tab.
12. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Steering · Policy: audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
