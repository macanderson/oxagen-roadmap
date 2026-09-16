# Audit prompt — Skill source

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Skill source** page of Oxagen Mission Control (`#/a-intel/core-platform/skills/<id>/source`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/skill-source.md` (read it first, in full).
2. The design, rendered: the `skill-source` stories in Storybook (`npm run storybook`), one per state, desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>`.
3. Context: `docs/w13-in-the-loop-scenario.md`, `docs/creation-spec.md` §4, and the Skills page spec `pages/skills.md`.
4. The build under audit: `{{APP_ROOT}}`, served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/skills/<id>/source`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route for every catalog skill whose state is `ok`; the shell matches; the breadcrumb ends on this page. The skill id may contain dots — verify a dotted id routes rather than 404s.
2. **Header.** Eyebrow “Skills · source”, Skills links back to the catalog, h1 is the file path in mono. Chips, in order: source label, `@version`, digest prefix, resolution tier, load cost in tokens. Actions: Back to the catalog · Discard · Propose a change. Exactly one gold action.
3. **The editor.** A real editor, not a textarea with a monospace font: line-number gutter whose count equals the file’s line count, markdown highlighting that treats the frontmatter block as its own grammar (assert highlight spans inside and outside the `---` fences differ), a current-line band, Find ⌘F with a match count, and a status line with Ln/Col, the grammar, a line and character count.
4. **The file is the file.** Read the textarea’s value. It must be text, not markup — a `<span` anywhere in it is a FAIL — and it must begin with the frontmatter fence. Round-trip: type a line, discard, and assert the original bytes come back.
5. **Version bump.** Modify the body and open Propose a change. The dialog names the current version and the next patch version, and the checks say a changed body with an unchanged version fails. A build that bumps silently after the merge, or not at all, is a FAIL.
6. **Digest.** The checks say the digest is recomputed at merge and that every run that loaded the old version keeps naming the old digest. Verify nothing on the page claims a new digest before the merge.
7. **Actions and dialogs.** Discard is disabled until modified. Propose a change shows a real line diff with a `+n / −n` count and a disabled primary when nothing changed. A stub must say what the product would do; a control that silently does nothing is a FAIL.
8. **Data sources.** Every row of the spec’s table is ❌ today: the build must render `NotBacked` with the milestone named, never a fixture and never a zero.
9. **States.** loading is the skeleton with the shell intact; error names `502 git_read_unreachable` and offers Try again and Open an incident with a trace id; denied names `skills.admin on core-platform` and offers Request access. No empty state.
10. **Grants.** Nothing on the page implies a skill grants authority; where an operator might assume it, the page says otherwise.
11. **Mobile.** At 390 × 844: the editor keeps its gutter, the status line drops the key hints, the dialog is a bottom sheet, nothing scrolls sideways, tap targets ≥ 44 px, inputs 16 px.
12. **Accessibility.** The editor is reachable and operable by keyboard; the textarea has an `aria-label` naming the file; dialogs are `role=dialog aria-modal`; focus is visible.
13. **Permissions.** Read requires `skills.read`; writes require `skills.admin` and are gated server-side, not only hidden.
14. **Nothing extra.** List anything on the built page that is not in the spec.

## Output

Return a single markdown report:

```
# Skill source — audit {{DATE}}
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
