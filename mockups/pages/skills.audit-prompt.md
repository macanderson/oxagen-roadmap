# Audit prompt — Skills

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Skills** page of Oxagen Mission Control (`#/a-intel/core-platform/steering/skills[/<tab>]`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `mockups/pages/skills.md` (read it first, in full), and `mockups/pages/skills.md` for the vocabulary it shares.
2. The design, rendered: the `skills` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright.
3. The scenario that walks this page: `docs/w13-in-the-loop-scenario.md`, and the W13 scenario in `mockups/missioncontrol.html`. The product spec does not describe skills yet; where the two disagree, the page spec wins and the disagreement is a finding.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/steering/skills[/<tab>]`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar, breadcrumbs, ⌘K search, notifications and account are present and match the spec’s shell; **Skills** sits in the Workspace nav between Tools and Steering and carries a count of 1 while an interjection waits; the breadcrumb ends on this page.
2. **Header.** The Steering hub header: eyebrow “Workspace · <workspace name>”, h1 “Steering”, seven tabs in order (Records, Skills, Memory, Ontology, Policy, Proposals, Preview) with Skills selected. The lead note “Skills are steering, and they are files.” verbatim. One gold action: Add a skill. Fail if Skills still has a top-level nav entry, and fail if the old `/skills` route does not resolve to this tab.
3. **The gate.** With `skills.enabled` false (or the file absent) the route renders the off-by-default gate, not the tabs — audit it with `pages/skills-off.audit-prompt.md`.
4. **Views and sections.** A segmented control under the hub tabs: Catalog (N in scope) · Search · In the loop (1 while open) · Reflection (N) · Versions (N), routed as `/steering/skills/<view>`. For each tab, every tile, panel, row shape, chip, badge and note listed in the spec is present with the same labels, in the same order. Specifically:
   - Catalog: the Delivered by sync panel first (Repository · Sync · Synced at · Skills · Checkouts · Written to, one row per repository, with the note that only the description line competes in the assembler and the link to Preview); four tiles; the searchable-belt note; “Resolved by `skl_v7`” rows with kind glyph, `id @version`, statement, chips (source · kind · tokens · digest prefix · cited · proof rate), decision badge, updated, Open; “Held back” rows with “Why it is held” and the withholding note.
   - Search: the `search_skills(…)` console pre-filled; **Ask as the agent**; result header with returned/withheld counts and `skl_v7 · top 5 · min 0.42`; hit rows with score; withheld rows struck through with `out_of_scope` / `unapproved_digest` and the “not told this name” line; an empty result renders `[]` with a reason — a FAIL if it renders as an error; the five “try:” chips; “What decided this” (six rows); “The frame this wrote” with the replay note.
   - In the loop: four tiles; the gold “A run is waiting on you” panel while open and “Nothing is waiting” once answered; the allowed / not-allowed panels, four rows each, verbatim.
   - Reflection: the research-only note; four tiles; the injected turn with `run.sealed` solid and the three following frames dashed; four rubric axes with self and record bars, the quote, “the record says”, two flagged “calibration gap”; two contradiction cards citing frames; the Quarantine box with five rules and the consent chips; **Turn capture off**, **Export for research** (denied without `research.read`).
   - Versions: the config file rendered with `policy = "ask"` highlighted and `"allow"` documented as unavailable; the history rows with in effect / superseded; the closing note on 2026-07-30 and `a-intel/platform#402`.
5. **Actions and dialogs.** `skcfg`, `skill`, `skadd` open what the spec says; `skenable` is reachable only from the gate. Each write is a governed action (IAM, audit event, receipt). A control that silently does nothing is a FAIL.
6. **Data sources.** Every row of the spec’s table is ❌ today: each must render `NotBacked` with the milestone named — an honest “not recorded yet”, never a zero, never a fixture. A fixture reaching production is a FAIL.
7. **States.** Force each and compare with the design file: **empty** (`state=empty`) “Skills are on, and there is nothing to resolve” with Add a skill / Open the config; **loading** the skeleton, no zeros; **error** `503 skill_registry_unavailable` with Try again / Open an incident and the trace line; **access denied** `skills.read on core-platform` with Request access / Back to Fleet and Signed in as · Needed · Decided by.
8. **Withholding.** Search the build for any path by which a held skill’s name or id reaches the model or the `skills.searched` frame. Any such path is a FAIL: the agent is told a count and a reason class only.
9. **Resolution is pinned.** A run resolves one config version at start; replay uses that version. Verify the build stores the version on the run and that the Search console can be pointed at it.
10. **Mobile.** At 390 × 844 with a touch pointer: Skills is a tile in the More sheet, not in the thumb bar; tiles wrap to one column; skill rows drop their right column under the text; nothing scrolls sideways; tap targets ≥ 44 px; inputs 16 px. Compare against `pages/skills-loaded-mobile.html`.
11. **Accessibility.** Tabs `role=tablist/tab` with `aria-selected`; dialogs `role=dialog aria-modal` with a labelled close; the search input has an `aria-label`; state is never colour alone; focus visible; keyboard operable end to end.
12. **Permissions.** Read requires `skills.read`; `skills.admin`, `skills.digest.approve`, `skills.add`, `reflection.capture.toggle` and `research.read` are gated server-side, not only hidden. Verify with a role that lacks each.
13. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

## Output


Return a single markdown report:

```
# Skills — audit {{DATE}}
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
