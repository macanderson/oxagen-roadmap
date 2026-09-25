# Audit prompt: Tools

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Tools** tab of Oxagen (`#/a-intel/core-platform/tools`), with the header and tab bar every Tools tab shares, for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/tools.md`. Read it first, in full. The other four tabs have their own specs (`tools-toolbelts.md`, `tools-providers.md`, `tools-policy.md`, `tools-switches.md`). Audit only what `tools.md` covers.
2. The design authority: `docs/fleet-operations-wedge.md` (Unchanged, Navigation, D17, the Emissions table), `docs/fleet-operations-ia.md` (Workspace navigation, Tools) and `docs/fleet-operations-routes.md` (Tools).
3. The design, rendered: the stories under `Oxagen / Tools / Tools` in Storybook (`npm run storybook`): Loaded, Empty, Loading, Error, Access denied, each also as a mobile story. Or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/tools`. The checker is `node tools/check-mockup.mjs`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/tools`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and aliases.** `/a-intel/core-platform/tools` serves the Tools tab. `/tools/tools`, `/tools/registry` and any tab id the page does not serve land on the Tools tab in place. `/tools/servers` lands on Providers. `/tools/mandates` answers a 308 to `/agents`. No alias renders an empty page or a 404.
2. **Shell.** The sidebar reads Work, Agents, Tools, Steering, Runtimes, Spend, Repositories, then Organization, Billing, Audit, with Tools lit. The Tools count is the number of observed output schemas waiting for approval, or absent when none waits (or not recorded while its store is missing). The breadcrumb ends on Tools. The top bar has search with ⌘K, notifications, the approvals button (left of the avatar, `aria-label` "Approvals, N waiting", opening the Approvals drawer) and the avatar. No Fleet item anywhere.
3. **Header.** Eyebrow is the workspace name, h1 "Tools", subtext "The registry is the only source of tools an agent can see." Actions in order: Add provider · New tool · Stop a tool… (danger). New tool is gold on this tab. Stop a tool… opens the switch dialog.
4. **Tab bar.** `role="tablist"` with five tabs in this order: Tools, Toolbelts, Providers, Policy, Kill switches, each a path segment with `aria-selected`. The Tools tab count reads N in the approval colour, titled "N schemas need approval", while schemas wait, or the registry's version count. Kill switches counts the switches denying now. A count the record cannot back is absent or marked, never a zero.
5. **Tools panel.** The caption verbatim, the Labels / API names toggle with `aria-pressed`, the "N of N shown" badge, and Add provider (plain). The category chips on their own row with counts, and What the categories mean beside them.
6. **Table.** Columns in order: Tool version · Provider · Category · Hazard · Gate · Egress · Financial · Schema origin · Digest · Toolbelts · Agents · Calls 30d. Missing or renamed columns are FAILs, and extra columns are noted. Every tool cell shows the label over `name@version`, and the toggle swaps them on every cell. A row opens the tool dialog. The Provider cell is a control that opens that provider. The note under the table is verbatim.
7. **List controls.** The table carries a search field, up to three filters on small enumerations, sortable headers, Rows (5, 10, 25, 50 or All, with 10 by default) and a pager.
8. **Rollups.** Recompute from the rows: the "N of N shown" badge, each chip count, the Toolbelts and Agents cells of five rows, and the tab counts. A typed figure, or one that disagrees with the rows, is a FAIL.
9. **Gate.** For five rows, recompute the gate in the spec's order: a switch on the version or its provider, then a financial class, then an irreversible side effect, else allowed. Flip a switch that covers one row and confirm its Gate changes on the next render.
10. **Dialogs.** Each opens from the control the spec names and carries the spec's fields and copy: `import` (three steps: Connect, Review tools/list, and Classify and import, with Classify disabled while nothing is selected and a toast that says the versions are on no toolbelt), `schema` (Not yet, Approve schema, and the empty case), `toolcats`, `tool` (no gold, and the financial block on a financial tool), `switch`, the tool wizard, `request-access`, `incident`, `connection`. Each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub says what the product would do. A control that silently does nothing is a FAIL.
11. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named (`data-gap`). A fixture reaching production is a FAIL. Check three in particular. Category shows consequence tags or not recorded (#3921). No row reads "observed" and no waiting count shows on the Tools tab while observed schemas have no store. The Toolbelts and Agents columns say not recorded (#3852), never a dash or a zero.
12. **Future-only fields.** Every field the spec lists under Future-only fields renders as not recorded with its gap, never as a zero, an empty table, or a fixture value.
13. **States.** Force each state and compare copy and controls with the design:
    - **empty** (`state=empty`): "No provider is registered", its two sentences, Add provider (gold) and Add a connection. The header and tab bar are gone.
    - **loading** (`state=loading`): the shell stays and the body, header included, is the skeleton. No data, no zeros, no stale rows.
    - **error** (`state=error`): "Tools could not be loaded", `503 tool_registry_unavailable`, the three sentences, Try again, Open an incident, and the trace line.
    - **access denied** (`state=denied`): "You cannot see the tool registry", `tools.read on core-platform`, Request access and Back to Work, then Signed in as, Needed and Decided by.
14. **Vocabulary.** Search the rendered DOM and the build's source for "MCP server", "server" and "servers" as a heading, tab, panel title, column header, button label, banner or note on this tab. Each hit is a FAIL, including the awaiting-approval banner and the schema dialog. `mcp` is allowed only as a transport value and in prose about the importer that reads `tools/list`. "Task" never names a work item.
15. **Trust language.** Hazard, gate and schema origin show the recorded value and nothing stronger. No copy says a call is enforced without the tier. Nothing says proven, score or trust band.
16. **Plain nouns.** No heading or label carries a comma, a mid-dot or a not/never contrast. Subtext under a heading is one sentence.
17. **One gold action.** Exactly one gold action is visible on the loaded tab: New tool. In each state panel, exactly one.
18. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar reads Work, Agents, Tools, Spend, More, with Tools lit and counts only where something waits on a person. More lists Steering, Runtimes, Repositories, Organization, Billing, Audit, Ask Stella, Search, Notifications, Account, Switch organization and Switch workspace. The tab bar scrolls in its own row and the selected tab is in view. The table renders as labelled cards. Every dialog is a bottom sheet with full-width footer buttons. Touch targets are at least 44 px, inputs 16 px, and nothing scrolls sideways.
19. **Accessibility.** The tabs use `role=tablist/tab` with `aria-selected`. The toggle and the chips carry `aria-pressed`. A clickable row is reachable and operable by keyboard and names what it opens. Dialogs are `role=dialog aria-modal` with a labelled close. State is never colour alone. Focus is visible.
20. **Permissions.** Read requires `tools.read` (today `list_tool_versions`), checked server-side. Import, schema approval, the wizard and the switch flip are gated server-side, not only hidden. Verify with a role that lacks each.
21. **Nothing extra.** List anything on the built tab that is not in the spec, such as a reclassification form in the tool dialog. Each is a finding, and the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Tools audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and aliases | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Vocabulary hits
- <selector> · <text> · <the word the design uses instead>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. A vocabulary hit is always a FAIL, never a note. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
