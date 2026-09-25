# Audit prompt: Repository configuration

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Configuration** tab of Repositories in Oxagen (`#/a-intel/core-platform/repositories/config`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/repositories-config.md`. Read it first, in full, and `mockups/pages/repositories.md` for the header, tabs and state panels.
2. The design, rendered: the `Oxagen / Repositories / Configuration` stories in Storybook (`npm run storybook`), one per state, desktop and mobile. Or open `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/repositories/config`.
3. The design authority: `docs/fleet-operations-wedge.md` (Unchanged, D7), `docs/fleet-operations-ia.md` (Runtimes and Repositories), `docs/mission-control-spec.md` §10.2 and §10.3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: the Configuration tab (the app serves it at `/a-intel/core-platform/repositories/configuration`).

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The tab is a path segment and survives a reload. Repositories is lit. The Configuration tab is selected and carries no count. The header's Add .oxagen/ is the one gold action.
2. **`.oxagen/workspace.toml`.** The panel names the main repository and the commit it was read at, or says it is not indexed yet, and shows the file in full as the production branch holds it. It shows the workspace's main repository, never another repository's file under the main one's name. A workspace with no file on the production branch says so and points to adding .oxagen/.
3. **Drift.** Heading "Drift", its subtext, See the pull request, and the columns Declared · In the file · Live · Resolution, with Resolution as a badge ("Use the file" or "A person decides") and the note beneath. With no drift the panel says the reconciler compared the main repository with the control plane and found no drift. Drift from another workspace never renders here.
4. **The file and the drift agree.** A value the Drift table says is in the file must be what the file panel shows at the same commit. A contradiction between the two panels is a FAIL.
5. **Drift is never repaired in place.** Search the build for any path that edits live state to match the file, or the file to match live state, without a pull request. One is a FAIL.
6. **`.oxagen/rules/governance.toml`.** The file in full, the three modes with one line each, and the note: the mode is read when a pull request is opened and again when it is merged; a missing file means `team`; a file that names no mode refuses both. The build reads `absent` and `invalid` as well as the three modes and says what each means.
7. **Modes match the gate.** Each mode's line says what the merge gate enforces (`context.steering.policy.ts`): `solo`, any workspace member, the author included; `team`, an org Owner or Admin or a workspace Owner other than the author; `regulated`, an org Owner or Admin other than the author, recorded as the accountable approver. A line that promises a check the gate does not run (a code-owner review) is a FAIL.
8. **Changing the mode.** The page says how the mode changes: through the workspace's settings, as a commit under `solo`, a pull request under `team` or `regulated`, or an override that emits a security event. Copy that says the mode never changes from a settings screen is a FAIL, because `set_governance_mode` ships from one.
9. **Tree.** The paths under `.oxagen/` at the head, and the note that Oxagen reads `.oxagen/` and nothing else. The comments beside paths are copy and claim nothing the record does not hold (the promotions ledger is hash-chained in every mode).
10. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. The file, the mode and the tree are wired to `get_repository_tree`. Drift and See the pull request print "not recorded" until the reconciler ships, and never show fixture rows. A fixture reaching production is a FAIL.
11. **States.** Force each state. Empty, loading, error and access denied are the Repositories panels in `repositories.md`.
12. **Mobile.** At 390 × 844 with a touch pointer: More is lit; the panels stack into one column in the order `workspace.toml`, Drift, `governance.toml`, Tree; each file block scrolls inside itself and the page never scrolls sideways; the Drift table becomes labelled cards.
13. **Accessibility.** State is never colour alone: each badge carries its word. File blocks are readable by a screen reader as text. The page is operable by keyboard end to end.
14. **Permissions.** Read requires `repository.read`. `set_governance_mode` is refused server-side outside org Owner or Admin and workspace Owner or Admin, and its override writes a security event.
15. **Rules.** Check each rule in the spec's last section.
16. **Nothing extra.** List anything on the built page that is not in the spec.

## Output

Return a single markdown report:

```
# Repository configuration: audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
