# Audit prompt: Skills

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Skills** tab of Oxagen (`#/a-intel/core-platform/steering/skills[/<view>]`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/skills.md` (read it first, in full), and the hub it belongs to, `mockups/pages/steering.md`.
2. The design, rendered: the `skills` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The checker is `node tools/check-mockup.mjs`.
3. The scenario that walks this page: `docs/w13-in-the-loop-scenario.md`, and the W13 scenario in `mockups/missioncontrol.html`. The product spec does not describe skills yet; where the two disagree, the page spec wins and the disagreement is a finding.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/steering/skills[/<view>]`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route and the old `/skills` route resolves to it. The shell matches the spec: Skills carries no nav entry of its own, it is a tab of Steering, and Steering's nav count includes 1 while an interjection waits; the breadcrumb ends on Skills. The top bar has the Approvals button left of the avatar, its count including the open interjection; it opens the drawer `#apdrawer`, the interjection row offers Answer it, a selected approval shows the card with Approve and Deny, and Escape closes it. No assistant button in the top bar.
2. **Header.** The Steering hub header: eyebrow the workspace name, h1 “Steering”, the one-sentence subtext, the governance chip “Governance: <mode>”, seven tabs in order with Skills selected. The lead note verbatim. One gold action: Add a skill. Fail if Skills still has a top-level nav entry.
3. **The gate.** With `skills.enabled` false (or the file absent) the route renders the off-by-default gate, not the views. Audit it with `mockups/pages/skills-off.audit-prompt.md`.
4. **Views and sections.** A segmented control under the note: Catalog (N) · Search · In the loop (1 while open) · Reflection (N) · Versions (N), routed as `/steering/skills/<view>`. For each view, every tile, panel, row shape, chip, badge and note listed in the spec is present with the same labels, in the same order. Specifically:
   - Catalog: Delivered by sync first (Repository · Sync · Synced at · Skills · Checkouts · Written to, one row per repository, the note and the link to Preview); four tiles; the searchable-belt note; Resolved by `skl_v7` rows with kind glyph, `id @version`, statement, chips (source · kind · tokens · digest prefix · cited in N of M runs · cited rate before → after), decision badge, updated, Open, Edit; Held back rows with “Why it is held:”, no Edit, and the withholding note.
   - Search: the `search_skills(…)` console pre-filled; Ask as the agent; result header with returned and withheld counts and `skl_v7 · top 5 · min 0.42`; hit rows with score; withheld rows struck through with `out_of_scope` / `unapproved_digest` and the “not told this name” line; an empty result renders `[]` with a reason, a FAIL if it renders as an error; the “try:” chips; Decision (six rows); Frame written with the replay note.
   - In the loop: four tiles; the gold-bordered “Interjection” panel while open and “Nothing is waiting” once answered.
   - Reflection: the research-only note; four tiles; the injected turn with `run.sealed` solid and the three following frames dashed; four rubric axes with self and record bars, the quote, “the record says”, two flagged “calibration gap”; two contradiction cards citing `tool_call` frames; the Quarantine box with five rules and the consent chips; Turn capture off, Export for research (denied without `research.read`).
   - Versions: the config file rendered with `policy = "ask"` highlighted and `"allow"` documented as unavailable; History rows with in effect / superseded; the closing note on 2026-07-30 and `a-intel/platform#402`.
5. **Token figures reconcile.** The If all loaded tile equals the sum of the in-scope rows' load costs, and its dollar figure is that sum at the rate the spec names. In scope here plus Held back equals the count the sources hold. The `skill` dialog's load cost equals the row's chip.
6. **Cited rate, not proof rate.** Every rate on a row or in the `skill` dialog is labelled cited (“cited N of M runs”, “cited X% → Y% of loads”). No row, chip, tile, or dialog field says proof, proven, verdict, or score. The rate's basis is named: loads, and runs from the token record.
7. **Actions and dialogs.** `skcfg`, `skill`, and the skill wizard open what the spec says; Edit routes to the skill source page; `skenable` is reachable only from the gate; Retire opens `skretire`, whose pull request deletes the `SKILL.md` of a skill written here and takes the install line out of `.oxagen/workspace.toml` for one that came from a registry, and the row then reads `retiring` until the merge. Each write is a governed action (IAM, audit event, receipt). A control that silently does nothing is a FAIL.
8. **Data sources.** Every ❌ row of the spec's table renders `NotBacked` with the milestone named, an honest “not recorded yet”, never a zero, never a fixture. The 🟡 cited-rate row is wired to the token record for the fields that exist. A fixture reaching production is a FAIL.
9. **States.** Force each and compare with the design: **empty** (`state=empty`) “Skills are on, and there is nothing to resolve” with Add a skill to a-intel/platform and Open the config; **loading** the skeleton, no zeros; **error** `503 skill_registry_unavailable` with Try again, Open an incident, and the trace line; **access denied** `skills.read on core-platform` with Request access, Back to Fleet, and Signed in as · Needed · Decided by.
10. **Withholding.** Search the build for any path by which a held skill’s name or id reaches the model or the `skills.searched` frame. Any such path is a FAIL: the agent is told a count and a reason class only.
11. **Resolution is pinned.** A run resolves one config version at start; replay uses that version. Verify the build stores the version on the run and that the Search console can be pointed at it.
12. **Plain nouns.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast; subtext is one sentence. Tile labels that carry a comma in the spec (“Interjections, 30 days”, “Captured, 30 days”) are tile keys, not headings, and are quoted as rendered.
13. **Mobile.** At 390 × 844 with a touch pointer: Skills sits inside Steering in the More sheet, not in the thumb bar; the hub tabs are one scrolling strip; tiles wrap to one column; skill rows drop their right column under the text; nothing scrolls sideways; tap targets ≥ 44 px; inputs 16 px.
14. **Accessibility.** Hub tabs `role=tablist/tab` with `aria-selected`; the views use `aria-pressed`; dialogs `role=dialog aria-modal` with a labelled close; the search input has an `aria-label`; state is never colour alone; focus visible; keyboard operable end to end.
15. **Permissions.** Read requires `skills.read`; `skills.admin`, `skills.digest.approve`, `skills.add`, `skills.retire`, `reflection.capture.toggle` and `research.read` are gated server-side, not only hidden. Verify with a role that lacks each.
16. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Skills: audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected NotBacked, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
