# Audit prompt: Working copies

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Working copies** tab of Repositories in Oxagen (`#/a-intel/core-platform/repositories/copies`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/repositories-copies.md`. Read it first, in full, and `mockups/pages/repositories.md` for the header, tabs and state panels.
2. The design, rendered: the `Oxagen / Repositories / Working copies` stories in Storybook (`npm run storybook`), one per state, desktop and mobile. Or open `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/repositories/copies`.
3. The design authority: `docs/fleet-operations-wedge.md` (Unchanged), `docs/fleet-operations-ia.md` (Runtimes and Repositories), `docs/mission-control-spec.md` §10.2.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: the Working copies tab (the app serves it at `/a-intel/core-platform/repositories/working-copies`).

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The tab is a path segment and survives a reload. Repositories is lit in the sidebar. The Working copies tab is selected, and its count equals the copies not in sync, or is absent while no copy is recorded.
2. **Gold.** Connect a directory is the one gold action; the header's Add Oxagen to a repository is plain on this tab. Two golds on the page is a FAIL.
3. **Panel.** Heading "Working copies", its subtext, and Connect a directory. Columns in order: Directory · Repository · Branch · `.oxagen/` · Symlinks · Bundle · Last seen. Directory carries the path, the machine and the person. Branch carries its head. `.oxagen/` is a badge with its word (`in sync`, `behind`, `uncommitted`, `unbound`) and the uncommitted count. Missing or renamed columns are FAILs.
4. **No banner.** Nothing above the table restates what the `.oxagen/` cells say. A banner is a finding.
5. **Rows open the dialog.** Click, Enter and Space open `workcopy`, and each row has an accessible name naming the path and the machine.
6. **The empty list.** With no copy recorded, the panel says no directory is linked, keeps Connect a directory as the gold action, and says a directory is linked by running `oxagen init` in it and never by a typed path.
7. **Files to review and Sync.** The tree shows `workspace.toml` as committed and `workspace.json` as gitignored, with the note on why the two are never the same file. Sync lists the four commands with their lines and the note on Stella's symlinks. A command the CLI does not ship is named as the CLI names it, or marked not available: `oxagen pull` does not exist today.
8. **`linkdir`.** One command with the workspace in it, the pairing code with its expiry (or "not issued yet" while no code is issued), what the command writes, links, does not write and does not read, the note that linking grants nothing, Close, and Copy command as the dialog's gold action. There is no browse button and no path field.
9. **`workcopy`.** The facts (Repository, Remote, Branch, Machine, `.oxagen/`, Symlinks, Bundle, Last seen), one note by state (in sync, behind, symlinks missing, uncommitted), the uncommitted file list where there is one, Disconnect, and Ask for a pull on a copy not in sync. The behind note says it changes nothing about what a run is steered by.
10. **`copyoff`.** The confirm says Oxagen forgets the directory, nothing on disk is deleted, nothing committed changes, uncommitted edits are neither lost nor proposed, and `oxagen init` links it back. Keep it and Disconnect it. Disconnecting opens no pull request, is a governed action, and lands in Audit.
11. **A copy is not a run.** Search the build's copy for any sentence that presents a working copy's state as a run's state or as a governance incident. One is a FAIL.
12. **Data sources.** For each row of the spec's data-source table, find what feeds it. No working-copy record ships today: the build shows the empty panel, never fixture rows. The pairing code, `oxagen pull`, Disconnect and Ask for a pull are future-only and must not appear to work. `oxagen init` ships, and `oxagen status` and `oxagen propose` ship as `oxagen steering status` and `oxagen context propose`. A fixture reaching production is a FAIL.
13. **States.** Force each state. Empty, loading, error and access denied are the Repositories panels in `repositories.md`, the same on this tab as on the others.
14. **Mobile.** At 390 × 844 with a touch pointer: More is lit in the thumb bar; the table becomes labelled cards; Files to review and Sync stack; the tree scrolls inside its block and the page never scrolls sideways; the dialogs are bottom sheets with full-width footer buttons; touch targets are at least 44 px.
15. **Accessibility.** Rows are reachable by keyboard and named. Dialogs are `role=dialog` with `aria-modal` and a labelled close. State is never colour alone: each badge carries its word.
16. **Permissions.** Read requires `repository.read`. Connecting and disconnecting are gated server-side once they exist (`workcopy.link`, `workcopy.unlink`).
17. **Rules.** Check each rule in the spec's last section, including that `linkdir` names SteeringFrames, not frames, for what reaches a run at the hooks.
18. **Nothing extra.** List anything on the built page that is not in the spec.

## Output

Return a single markdown report:

```
# Working copies: audit {{DATE}}
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
