# Audit prompt: Skill source

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against its design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Skill source** page of Oxagen (`/{org}/{ws}/steering/sources/skill/{skill}`) for conformance to its design: an approved skill with its editor and bundle, a withheld skill, and an unapproved one. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/steering-source-skill.md`. Read it first, in full. `steering.md` specifies the shell and the Sources list, and `steering-source.md` the page other kinds share.
2. The design, rendered: the stories `Oxagen / Steering / Skill` in Storybook (`npm run storybook`): Loaded, Loaded · mobile, and Loaded · future-only fields marked. Or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#<route>`, with `&future=1` to outline the future-only fields, at `#/a-intel/core-platform/steering/sources/skill/a-intel.release-notes-from-prs`, `…/skill/a-intel.changelog-bot`, `…/skill/a-intel.mobile-release-notes` and `…/skill/oxagen.pdf-extract`.
3. The design authority: `docs/fleet-operations-wedge.md` (D4, D5, D6, D12; the Emissions row for Skill; the Cuts rows for the Skills console and skill reflection), ADR-043 and ADR-090 in `macanderson/oxagen`, and `docs/fleet-operations-routes.md` (Steering).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route for every skill the workspace's config pins. `/steering/skills/{skill}/source` answers 308 to it. `/{org}/{ws}/skills/{…}` lands on Sources filtered to skills. Steering is lit, and the breadcrumbs end on the skill's id in mono. An id nothing holds renders "No skill here" (or the page's not-found panel) with Back to Sources.
2. **Header.** Eyebrow "Steering · Skill", with Steering linking to `?kind=skill`. The h1 is the id in mono. The badges in order: status, source, `@<version>`, the digest prefix, the resolution decision, and "<n> tok to load". The lead is the spec's sentences on the bundle and on entrypoints. Actions: Discard (disabled until the file changes) and Propose a change (gold).
3. **Editor.** The editor holds `SKILL.md` as bytes: the frontmatter fences and keys highlight as one grammar and the body as markdown; the gutter, Find ⌘F with its count, and the status line are present. Type, then Discard: the editor returns the merged bytes exactly.
4. **Bundle.** The Bundle panel's caption names the manifest. Columns: Part, File, Emits and Tokens, in that order. One row for the instructions, one per reference with its description under it, one per entrypoint with its runtime and signature under it and its digest under the file. An entrypoint's Emits cell reads `capability` with "descriptor only", and its Tokens cell a dash. A skill without references or entrypoints reads "SKILL.md only." with the rest of the sentence. Until manifests ship, the panel lists `SKILL.md` alone and says the bundle is not recorded.
5. **Entrypoints are never run.** Nothing on the page runs, tests or previews an entrypoint. No button, link or request starts one. Any such control is a FAIL.
6. **Frames it emits.** One `procedure` frame from `SKILL.md`, one `context` frame per reference and one `capability` frame per entrypoint, each at Checkout files with its type, force, tokens (or "descriptor"), body and id `<type>:<skill>@<12 hex>`. The caption's count equals the items. Compare with the Compiler's envelope for an agent that receives the skill: every SteeringFrame the Compiler attributes to this skill appears here with the same id. A frame there that is missing here is a FAIL; name it.
7. **Agents it reaches.** The caption's count, five agents with Compiler links, and "<n> more on Assignments". The count equals the Agents column on Sources for the skill.
8. **Withheld skills.** `a-intel.changelog-bot`: no editor, no bundle; badges "withheld", `@1.4.0` and `unapproved_digest`; the lead gives the reason and says the agent is told the count and reason, never the name; Request approval (gold) leaves the skill withheld. `a-intel.mobile-release-notes`: withheld as `out_of_scope`, no action, and its reason states the scope against the workspace, not against a run. Both read "None." under Frames it emits and "None while it emits nothing." under Agents it reaches.
9. **Unapproved skill.** `oxagen.pdf-extract` shows "unapproved", its source, version, digest, decision and load cost; Frames it emits reads "None." with its reason.
10. **The agent never learns a withheld name.** Check the agent-facing read the build uses (`summarize_skill_search` or its successor): it returns counts by reason and no skill id for a withheld skill.
11. **Dialog.** `srcpr`: the title, the subtitle, the lead, the branch and the line diff with its counts (or "Nothing changed yet."), the six checks (Frontmatter, Version with the bump shown, Digest, Grants, Secret and PII scan, Load cost against the search budget), and Open the pull request, disabled while nothing changed. Opening calls `propose_skill`; a failed check writes nothing. The dialog is `role=dialog`, `aria-modal`, with a labelled close.
12. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract (`get_skill_config`, `preview_skill_search`, `propose_skill`, `summarize_skill_search`). 🟡 rows are wired for the fields that exist and render "not recorded" for the rest. ❌ rows render "not recorded" or are absent. A fixture reaching production is a FAIL.
13. **Future-only fields.** With the design's `?future=1`, the Bundle panel and Frames it emits are outlined. In the build each renders as the spec's "What a build shows today" says. The unmarked future-only fields the spec lists (the file bytes without a read path, the manifest, the reason in words, the "needs approval" and "denied" decisions) render as not recorded. Any of them rendered as data is a FAIL.
14. **States.** Loaded only. Force `state=loading`, `error`, `empty` and `denied` and confirm the shell's standard panels replace the page body and keep the shell, with no zeros and no stale content. The denied panel names the permission the read needs.
15. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with More lit. The columns stack in the spec's order, the Bundle table renders as labelled cards, the editor keeps its gutter, the dialog is a bottom sheet with full-width footer buttons, the page never scrolls sideways, tap targets are at least 44 px and inputs 16 px.
16. **Rules.**
    - A skill grants nothing and raises no tier, and the page says so where a reader might assume otherwise.
    - The page lists SteeringFrames under the skill and never shows a frame as the skill.
    - No heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. Note where the design breaks this.
    - Exactly one gold action: Propose a change, or Request approval on a withheld skill.
    - No cited rate, proof rate, verdict or score appears for a skill, and no reflection or Skills console view.
17. **Accessibility.** The editor is a labelled text area; the Find field has a label; state is a dot and a word; focus is visible; the page is operable by keyboard end to end.
18. **Permissions.** `propose_skill` and `update_skill_config` are refused server-side for a role other than organization Owner or Admin. Verify with a workspace Member.
19. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Skill source: audit {{DATE}}
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
