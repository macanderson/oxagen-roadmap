# Audit prompt — Skills · off (the default)

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Skills · off (the default)** page of Oxagen Mission Control (`#/a-intel/finops/skills`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `mockups/pages/skills-off.md` (read it first, in full), and `mockups/pages/skills.md` for the vocabulary it shares.
2. The design, rendered: the `skills-off` stories in Storybook (`npm run storybook`), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/finops/skills` in a browser or with Playwright.
3. The scenario that walks this page: `docs/w13-in-the-loop-scenario.md`, and the W13 scenario in `mockups/missioncontrol.html`. The product spec does not describe skills yet; where the two disagree, the page spec wins and the disagreement is a finding.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/finops/skills`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/a-intel/finops/skills` for a workspace whose `.oxagen/skills.toml` is absent or has `enabled = false`, and renders the gate instead of the tabs. Shell as the spec; breadcrumb ends on Skills.
2. **Header.** Eyebrow “Workspace · FinOps”, h1 “Skills”.
3. **The gate.** Lock glyph; h2 “Skills are off in FinOps”; the sub-line verbatim; badge **off**; the two columns with their four bullets each, verbatim; the “Why off, and not on.” note; footer **Turn skills on for FinOps** (the only gold action on the screen) · **Read the config it would write** · “needs `skills.admin` on finops”.
4. **Every workspace.** One row per workspace in the organization: slug, main repo, “created <date> with `skills.enabled = false`”, agents, owner, “turned on <date> by <person>” or “never turned on”, badge on/off. The creation date must come from the workspace record; the on-date and person from the pull request that turned it on. A workspace missing from this list is a FAIL.
5. **The default is real.** Create a new workspace in the build and open its Skills route: it must render this gate. A new workspace that comes up with skills on is the single most severe FAIL this audit can return.
6. **Turning it on.** `skenable` shows the switch as the outcome and the pull request as the control: the config it would write, the note that runs in flight finish without skills, and that every agent gains `search_skills` and nothing else. Confirming opens a pull request against the workspace’s main repo, puts the person on the receipt, and does not flip anything until the PR merges. A settings toggle that writes to a database is a FAIL.
7. **Data sources.** Presence of the config per workspace and the workspace creation date, per the spec’s table; `NotBacked` where the store does not exist yet.
8. **Mobile.** At 390 × 844: the two columns stack; the footer buttons are full width; rows drop the badge under the text; nothing scrolls sideways; tap targets ≥ 44 px. Compare against `pages/skills-off-loaded-mobile.html`.
9. **Accessibility.** The switch in `skenable` is `role=switch` with `aria-checked`; the dialog is `role=dialog aria-modal` with a labelled close; icon buttons have `aria-label`.
10. **Permissions.** Read `skills.read`; turning on requires `skills.admin` on the workspace, gated server-side.
11. **Nothing extra.** List anything on the built page that is not in the spec.

## Output


Return a single markdown report:

```
# Skills · off (the default) — audit {{DATE}}
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
