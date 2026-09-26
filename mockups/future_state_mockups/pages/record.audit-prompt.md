# Audit prompt — Steering record

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Steering record** page of Oxagen (`#/a-intel/core-platform/steering/records/<lineage>`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/record.md` (read it first, in full).
2. The design, rendered: the `record` stories in Storybook (`npm run storybook`), one per state (loaded, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. Open it once per kind: `ctx.release.notes-format` (rule), `ctx.release.never-merge` (constraint), `ctx.platform.release-order` (procedure), `ctx.platform.changelog-once` (fact), `ctx.platform.safari-e2e-flake` (memory), `ctx.triage.short-labels` (preference).
3. The product spec for context: `docs/mission-control-spec.md` §10 (context and steering), Appendix F, Appendix A; `docs/creation-spec.md` §5; the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/steering/records/<lineage>`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route for every published lineage; the sidebar, breadcrumbs, ⌘K search, notifications and account match the spec’s shell; the breadcrumb ends on this page; the document title names the record.
2. **Header.** Eyebrow “Steering · record”, and Steering links back to the list. **The h1 is the statement**, not the lineage, not the id, not the kind — if the build leads with anything else, that is the first FAIL and it is severe. The kind glyph sits in a tinted tile beside it. Chips, in order: kind badge, force, constraint effect (only where the kind has one), scope, published/archived, pending branch when a proposal is open. Actions: Discard · Propose a change. Exactly one gold action on the screen.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **The statement editor.** Present, and a real editor: a line-number gutter whose count equals the statement’s line count, syntax highlighting (assert more than one highlight span), a current-line band, Find ⌘F with a match count, and a status line with Ln/Col, the grammar, a line and character count. It holds **the statement and nothing else** — a build that puts the whole TOML file in it has not read the spec. The path label names the file and the field.
5. **The kind panels — the check this page exists for.** Open all six records above and capture the kind panel from each. Assert:
   - Six records produce **six different panels**. Compare the first 90 characters of each panel’s text; two that match is a FAIL.
   - `constraint` and only `constraint` renders the require/forbid boundary block, in the state hue for its effect.
   - `procedure` renders the statement as an ordered list of at least three steps, markers in the kind hue.
   - `fact` names what would falsify it and its `valid_from`.
   - `memory` says it forbids nothing and that nothing decays automatically.
   - `preference` says “violated” reads as *not followed* and does not colour that counter red.
   - Every one of the six ends with a **What it can never do** line.
6. **Lineage panel and related records.** Lineage, file path, publishing commit and date, effect line, schema. Up to three other records of the same kind, each with an Open button that routes to it; or the honest line when there are none.
7. **Actions and dialogs.** Discard is disabled until the draft differs and returns it to what is in force. Propose a change opens `srcpr` with a real line diff and a `+n / −n` count, its primary disabled when nothing changed. Opening the pull request records the pending branch and shows it in the header, and **the record in force is unchanged** — verify the statement the bundle would compile is still the merged one. A control that silently does nothing is a FAIL.
8. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build. ✅ rows wired to the named store; 🟡 rows wired for the fields that exist and rendering `NotBacked` (never a zero) for the rest; ❌ rows rendering `NotBacked` with the milestone named. A fixture reaching production is a FAIL.
9. **States.** Force each state and compare copy and controls with the design: loading is the skeleton with the shell intact and no zeros; error names `503 record_index_unavailable`, says nothing was changed and that runs kept recording, and offers Try again and Open an incident with a trace id; denied names `steering.read on core-platform` and offers Request access. There must be **no empty state** — a lineage nothing holds is a 404.
10. **Trust language.** No badge says anything stronger than the record holds. A record never reads as granting authority anywhere on the page.
11. **Colour.** Kind is an icon plus a hue, never a hue alone; kind hues never reuse a state hue and never use gold; the page is legible in greyscale and in both themes. Check the six kind hues are six distinct computed values.
12. **Mobile.** At 390 × 844 with a touch pointer: one column, editor above the kind panel; the thumb bar is present; the proposal dialog is a bottom sheet with full-width footer buttons; the page never scrolls sideways; tap targets ≥ 44 px; inputs 16 px.
13. **Accessibility.** Dialogs are `role=dialog aria-modal` with a labelled close; icon buttons have `aria-label`; state is never colour alone; focus is visible; the editor is reachable and operable by keyboard, and Tab inside it indents rather than leaving the field only where the spec says so.
14. **Permissions.** Read requires `steering.read`; each write is gated server-side, not only hidden. Verify with a role that lacks it.
15. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Steering record — audit {{DATE}}
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
