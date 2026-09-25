# Audit prompt: Steering › Sources

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built view against its design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering › Sources** view of Oxagen (`/{org}/{ws}/steering`, with the kind filter `?kind=`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering.md`. Read it first, in full.
2. The design, rendered: the stories `Oxagen / Steering / Sources` in Storybook (`npm run storybook`): Loaded, Loaded · mobile, and Loaded · future-only fields marked. Or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/steering`, with `&future=1` to outline the future-only fields. Also open `#/a-intel/finops/steering` for a workspace with instructions, mandates and skills off.
3. The design authority: `docs/fleet-operations-wedge.md` (D4, D5, D7, D11, D12, D13, D17; the Steering sections and Shipped today), `docs/fleet-operations-ia.md` (Steering) and `docs/fleet-operations-routes.md` (Steering).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/{org}/{ws}/steering` and `/steering?kind=<kind>` for each of `record`, `doc`, `skill`, `agent`, `instruction`, `glossary`, `memory`, `policy`, `mandate` and `toolbelt`. Steering is lit in the sidebar, and its count is open proposals plus Steering record pull requests, the same number the Proposals tab shows. The breadcrumbs end on Steering. The Approvals button sits left of the avatar with the organization's waiting count.
2. **Old routes.** `/steering/library` lands on `/steering`. `/steering/records`, `/instructions`, `/skills`, `/memory` and `/ontology` land on `?kind=record`, `instruction`, `skill`, `memory` and `glossary`. `/{org}/{ws}/skills` and every `/skills/{…}` address land on `?kind=skill`. Each is a 308 in the app. A 404 or a landing elsewhere is a FAIL.
3. **Header.** Eyebrow is the workspace name, h1 "Steering", subtext "Every source that can steer an agent here, and the frames it emits." The actions, left to right: the governance chip "Governance: <mode>", the skills chip "Skills: <version>" (only where skills are on; absent on FinOps), and New source. Neither chip is gold.
4. **Tabs.** Four tabs in this order: Sources, Assignments, Compiler and Proposals. Sources carries the unfiltered row count, Proposals the proposals plus open pull requests, and the other two no count. Each tab is a path segment, and reloading lands on the same tab.
5. **Kind filter.** A chip group labelled "Source kind", in the fixed order All, Steering records, Documents, Skills, Agent definitions, Instructions, Glossary, Memory, Policy, Mandates and Toolbelts, with a chip only for a kind the workspace holds. Each chip carries its count and `aria-pressed`. All equals the sum of the other chips. Picking a chip writes `?kind=` and the back button walks the filters.
6. **Panel heading and caption.** The heading is "All sources" or the picked kind's label. The caption states the row count and how many emit nothing, and names the workspace in the reach sentence. The type strip sums the Emits column of the listed rows. A number that disagrees with the rows is a FAIL; name both values.
7. **Columns.** Source, Emits, Scope, Version, Status, Agents and Managed in, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Source: the kind label, the title, and the id in mono as a link.
   - Emits: one frame-type badge per type with a count above one, or "nothing" with the reason.
   - Scope: the scope, with the repository, the agent or the named-agent count under it.
   - Version: the source version, with "#" and 8 hex of the hash where the source has one.
   - Status: a dot and a word from the spec's list for the kind.
   - Agents: the agents the scope reaches, 0 in dim text for a source that emits nothing.
   - Managed in: "Steering" without a link, or a link to Agents, Agent › Permissions, Tools › Policy, Tools › Kill switches, Tools › Toolbelts or the Steering record.
8. **Row navigation.** A record row opens `/steering/sources/record/<lineage>`, a document row `/steering/sources/<adr|vision>/<id>`, a skill `/steering/sources/skill/<id>`, a glossary term, a memory and the instructions their `/steering/sources/<kind>/<id>` page, an agent definition the agent's Source tab, a mandate the agent's Permissions with `?delegation=<id>`, a toolbelt Tools › Toolbelts, and a policy source the page its gate is edited on. The row and its id link go to the same address.
9. **Sources, never frames.** No row on this view is a SteeringFrame, and no row shows a frame id (`<type>:<source>@<hash>`). A frame elsewhere links back to its source at the version it names.
10. **Emissions.** Spot-check five sources against the wedge spec's Emissions table: a rule record emits `constraint`, a fact `context`, the vision `goal`, `constraint` and `context` only from its registered sections, ADR-008 nothing because it is superseded, a withheld skill nothing, an expired mandate nothing.
11. **Dialogs.** `govmode`: title, subtitle, three cards with the one in force marked "· now", the file the pick would write (the comment `draftGovernanceToml` writes, no dash-joined line), the note, Cancel and Open the pull request. Confirming calls `set_governance_mode` and reports the pull request, or the commit under `solo`; picking the mode in force reports that nothing changed. `skcfg`: title, subtitle, the file, the sources with their counts, the footer line and Close; nothing links to a Reflection tab. `newsrc`: the four cards with Write one, Register one, Add one and Define one, the note on memory, policy, mandates and toolbelts, and Cancel. `srcreg`: the lead, the registration, the note and Open the pull request. Each dialog is `role=dialog`, `aria-modal`, with a labelled close.
12. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract (`list_records`, `list_agent_defs`, `list_mandates`, `get_repository_tree`, `get_skill_config`, `list_proposals`). 🟡 rows are wired for the fields that exist and render "not recorded" for the rest, never a zero. ❌ rows render "not recorded" or are absent. A fixture reaching production is a FAIL.
13. **Future-only fields.** With the design's `?future=1`, the type strip, the Emits column, the document rows and the `srcreg` file are outlined. In the build each renders as the spec's "What a build shows today" says. The unmarked future-only fields the spec names (glossary, policy and toolbelt rows, a memory's force, scope and status, a record's `org` or `agent` scope, skill bundles) render as not recorded or are absent. Any of them rendered as data is a FAIL.
14. **States.** Loaded only. Force `state=loading`, `error`, `empty` and `denied` and confirm the shell's standard panels render in the page body with the shell kept, no zeros, and no stale rows. The denied panel names `steering.read on <workspace>`.
15. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with More lit; More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The tabs scroll sideways with the selected one in view, the kind chips wrap, the table renders as labelled cards, every dialog is a bottom sheet, the page never scrolls sideways, tap targets are at least 44 px and inputs 16 px.
16. **Rules.**
    - No heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence.
    - Exactly one gold action: New source. Neither chip is gold.
    - No copy says a Steering record or a gate notice is enforced without the tier and the words "routed through Oxagen".
    - No person is scored or ranked.
    - The product vocabulary holds: Steering record (never "context record"), pull request (never "Context PR"), SteeringFrame for a resolved input and frame for a recorded event.
17. **Accessibility.** Tabs use `role=tablist` and `role=tab` with `aria-selected`; the kind chips are a group with `aria-pressed`; state is never colour alone (a dot and a word); focus is visible; the view is operable by keyboard end to end.
18. **Permissions.** Reads are refused server-side without the Steering read. Each write (`set_governance_mode`, `propose_record`, `open_context_pr`, `propose_skill`, `update_skill_config`) is gated server-side, not only hidden. Verify with a role that lacks it.
19. **Nothing extra.** List anything on the built view that is not in the spec: a Library shelf row, a Memory, Ontology or Gates tab, a Skills console view, a frame list on Sources. Each is a finding.

## Output

Return a single markdown report:

```
# Steering › Sources: audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
