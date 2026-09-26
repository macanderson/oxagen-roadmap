# Audit prompt: Steering source

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against its design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering source** page of Oxagen (`/{org}/{ws}/steering/sources/{kind}/{id}`) for conformance to its design, for every kind it serves: a Steering record, an ADR, the product vision, a memory, a glossary term and the workspace instructions. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering-source.md`. Read it first, in full. `steering.md` specifies the shell and the Sources list this page opens from; `steering-source-skill.md` covers a skill.
2. The design, rendered: the stories `Oxagen / Steering / Steering record` in Storybook (`npm run storybook`): Loaded, Loaded · mobile, and Loaded · future-only fields marked. Or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#<route>`, with `&future=1` to outline the future-only fields, at each of these routes:
   - `#/a-intel/core-platform/steering/sources/record/ctx.release.notes-format` (a rule), `…/record/ctx.release.never-merge` (a constraint with a grant), `…/record/ctx.platform.release-order` (a procedure), `…/record/ctx.platform.changelog-once` (a fact), `…/record/ctx.platform.safari-e2e-flake` (a memory record), `…/record/ctx.triage.short-labels` (a preference), `…/record/ctx.sec.prefer-workspaces-retry-helper` (archived);
   - `…/sources/adr/ADR-021`, `…/sources/adr/ADR-008`, `…/sources/vision/VISION`;
   - `…/sources/memory/mem_01K5QX7C`, `…/sources/glossary/ont.release-train`;
   - `#/a-intel/finops/steering/sources/instruction/ins.finops.additional`.
3. The design authority: `docs/fleet-operations-wedge.md` (D4, D5, D6, D7, D13; the Steering sections Two objects, Emissions, Reading a source, Provenance and Shipped today) and `docs/fleet-operations-routes.md` (Steering).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/{org}/{ws}/steering/sources/{kind}/{id}` for `record`, `memory`, `glossary` and `instruction` (and `adr` and `vision` only once `.oxagen/sources.toml` ships). `/steering/records/{lineage}` answers 308 to `/steering/sources/record/{lineage}`. Steering is lit, and the breadcrumbs end on the source's id in mono. An id nothing holds renders "No source here" with Back to Sources, for every kind, a record lineage included.
2. **The shared frame.** The eyebrow reads "Steering · <kind label>", and Steering links to Sources filtered to the kind. The h1 is the source's title. The badges, the lead and the actions sit where the spec says. The right column holds Frames it emits and Agents it reaches.
3. **A Steering record: header.** The kind glyph beside the statement as the h1, never the lineage. Badges in order: the kind badge, the force, the constraint effect where present, the scope, the status, and the branch badge while a change is open. No lead, except "Archived in <commit>." on an archived record. Actions: Discard (disabled until the statement changes), Archive (absent on an archived record), Propose a change (gold). On the archived record, nothing says it is in force.
4. **A Steering record: editor and Lineage.** The editor holds the statement only, with the path label ".oxagen/rules/<lineage>.toml · statement", the change state, the bundle figure, Find ⌘F and the status line. No note under it, and no caption beside the Lineage heading. The Lineage panel has Lineage, File, Published by, Effect and Schema. The editor round-trips the bytes: what merges is what the person saw.
5. **The six kind panels.** Open one record of each kind. Each has its own panel, never one generic panel with swapped copy: the kind's content (Where it sits; the boundary block; Steps; Claim; When it happened; the meters alone for a preference) and the meters where the spec gives them. No panel explains how the kind reaches a run or what it cannot do; that is in the component help. The constraint with a grant names Tools › Policy as the home of its gate, not a Steering tab. A fact's "Falsifiable by" and a memory record's "Explains" come from the record, never a fixed sentence shared by every record of the kind.
6. **Meters.** Rendered is the total, and cited and the third meter are shares of it. When `get_record` returns a null effect, each meter renders "not recorded", never 0 of 0. The violated meter renders "not recorded" until its rollup ships. No meter is presented as a score.
7. **ADR and vision.** Once shipped: the eyebrow, the title, the badges (status, id, @commit, repository), no lead on an accepted ADR or the vision, "Superseded by <id>." on a superseded ADR, Open the file (plain), the Sections table (Section, Emits, Force, Text) with "enforced by <gate>" under a gated section and "nothing" for an unregistered or superseded one, and the Record panel with Supersedes or Superseded by as links. Until then, the address answers as an id nothing holds.
8. **A memory.** The h1 is the body. The badges, no lead, Forget (plain) and Propose as a Steering record (gold). The Record panel: Kind, Where, Recalled and Yields to (a link to the record). A memory that yields still lists its frame under Frames it emits. The Sayings panel lists every saying with its run and frame, or its file, line and "imported", then the fold line, and matches the memory dialog saying for saying. On `…/sources/memory/mem_01K5R0N2` the gold is Open the proposal and lands on `prp_01K5RX1N`. A proposed memory that still offers Propose as a Steering record is a FAIL. After a Markdown import writes a new memory, its Where names the file, the line and the importer.
9. **A glossary term.** The h1 is "term: definition", no lead, Propose a change (gold), and the Record panel with Kind and Where. `ontedit` and `ontretire` each end on a pull request against `.oxagen/ontology/<term>.toml`.
10. **The workspace instructions.** The h1 is the text, the badges, no lead, no action, and the Record panel with Kind and Where.
11. **Frames it emits.** Every item carries the frame-type badge, the force, the injection point, the tokens (or "descriptor"), the body, "enforced by <gate>" where a gate enforces it, and the frame id `<type>:<source id>@<12 hex>`. The caption's count equals the items. The same source at the same version shows the same ids on reload. Until frame types ship, the panel renders "not recorded" and lists nothing derived from the kind.
12. **Agents it reaches.** The caption's count, the first five agents each with a Compiler link that opens the Compiler resolved for that agent, and "<n> more on Assignments". A source that emits nothing reads "None while it emits nothing." The count equals the Agents column on Sources for the same source.
13. **Dialogs.** `srcpr`: title, subtitle, no lead, the branch and the line diff with its counts (or "Nothing changed yet."), the six checks with their assertions, and Open the pull request disabled while nothing changed; opening records the pending branch and changes nothing in force. `crecarchive`: the one note naming the pull request, the gate warning only for a record with an enforcement grant, Keep it in force and Open the pull request (red); the refusals for a record with a change open and an archived record. `memforget`: the one note on what forgetting does, the recall warning, Keep it and Forget it (red). Each dialog is `role=dialog`, `aria-modal`, with a labelled close, and a bottom sheet on a phone.
14. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract (`get_record`, `list_records`, `list_proposals`, `revise_steering_record`, `list_memories`, `propose_record`, `open_steering_pr`, `get_prompt_settings`). 🟡 rows are wired for the fields that exist and render "not recorded" for the rest. ❌ rows render "not recorded" or are absent. A fixture reaching production is a FAIL.
15. **Future-only fields.** With the design's `?future=1`, Frames it emits and the whole ADR and vision page are outlined. In the build each renders as the spec's "What a build shows today" says. The unmarked future-only fields the spec lists render as not recorded. Any of them rendered as data is a FAIL.
16. **States.** Loaded only. Force `state=loading`, `error`, `empty` and `denied` and confirm the shell's standard panels replace the page body and keep the shell, with no zeros and no stale content. The denied panel names `steering.read on <workspace>`.
17. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with More lit. The two columns stack with the source first. The badges and actions wrap, the Sections table renders as labelled cards, every dialog is a bottom sheet with full-width footer buttons, the page never scrolls sideways, tap targets are at least 44 px and inputs 16 px.
18. **Rules.**
    - The page lists SteeringFrames under a source and never shows a source as a frame or a frame as the source.
    - No heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. Note each place the design itself breaks this, and do not fail the build for matching a corrected form.
    - Exactly one gold action: Propose a change, or, on a memory, Propose as a Steering record or Open the proposal.
    - Every enforcement claim names its tier and "routed through Oxagen".
    - No person is scored or ranked; the meters are attribution.
    - The vocabulary holds: Steering record, pull request, SteeringFrame. No older name for any of them in the page's copy.
19. **Accessibility.** The editor is a labelled text area; the Find field has a label; the meters carry text values, not colour alone; state is a dot and a word; focus is visible; the page is operable by keyboard end to end.
20. **Permissions.** The read is refused server-side without the Steering read. Each write (`revise_steering_record`, the archive path, `delete_memory`, `propose_record`, `open_steering_pr`) is gated server-side, not only hidden. Verify with a role that lacks it.
21. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Steering source: audit {{DATE}}
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
