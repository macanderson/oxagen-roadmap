# Audit prompt: Repositories

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Repositories** page of Oxagen (`#/a-intel/core-platform/repositories`): its header, its tabs and the Repositories tab, with the dialogs that tab opens. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/repositories.md`. Read it first, in full.
2. The design, rendered: the `Oxagen / Repositories / Repositories` stories in Storybook (`npm run storybook`), one per state (Loaded, Empty, Loading, Error, Access denied), desktop and mobile. Or open `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/repositories`.
3. The design authority: `docs/fleet-operations-wedge.md` (Unchanged, D7, the vocabulary), `docs/fleet-operations-ia.md` (the Repositories count), `docs/fleet-operations-routes.md` (Runtimes and Repositories), `docs/mission-control-spec.md` §10.1 to §10.3, and `docs/creation-spec.md` for the init wizard.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/repositories`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves `/repositories`, and each other tab is a path segment. Repositories is lit in the sidebar, with a count only while Oxagen has a pull request open. The breadcrumb ends on Repositories. The Approvals button and its drawer are present. The document title names the page.
2. **Header.** Eyebrow the workspace name, h1 "Repositories", the one-sentence subtext. Action: Add Oxagen to a repository, gold on this tab. The gold moves off the header on Working copies and on a selected pull request that can merge, and nowhere else. Two golds on one screen is a FAIL.
3. **Tabs.** Repositories (N) · Working copies (N) · Changes (N) · Configuration. Repositories counts bound repositories, Working copies counts copies out of step, Changes counts open pull requests only. A merged or closed pull request in the count is a FAIL.
4. **Banner.** Present when a linked repository has no `.oxagen/`, naming it, saying runs on it are steered by the main repo alone and why no repository-scoped record can be published there, with Add Oxagen opening the wizard on that repository.
5. **Table.** Columns in order: Repository · Role · Production branch · `.oxagen/` · Events · Symbols · action. Role reads `main`, `linked` or `not linked`, never GitHub's words, and main sorts first. Production branch prints the branch over its head. `.oxagen/` reads `governed` with the file count, or `no .oxagen/`. The action is "nothing waiting" or Add Oxagen. The list tools filter on Role and on `.oxagen/` by state; a filter that lists "governed" once per file count is a FAIL.
6. **Rows open the dialog.** Click, Enter and Space open `repo`. Each row has an accessible name. The row's Add Oxagen opens the wizard without opening the dialog.
7. **The `repo` dialog.** The subtitle names the role. The facts are Production branch, Visibility, `.oxagen/` (with files at the head), Issues, Events, Code graph, Data layer, Working copies. A governed repository says what scope its records have. One without a tree says so and why. The footer offers Unlink on a linked repository, Link to this workspace on one not linked, and neither on main; See its changes on a governed one, Add Oxagen on one without a tree. A dialog that offers to move main is a FAIL. A fact the build cannot read prints "not recorded", never "undefined" or a blank.
8. **Unlink.** The confirm says issues and events stop, the repository is untouched, records published there stop steering runs here at once while recorded runs keep their hashes, and how many working copies go with it (or that the count is not recorded). Unlinking leaves the row as not linked. Link and unlink are governed actions, pass IAM and land in Audit. Neither opens a pull request.
9. **The init wizard.** Five steps in order: Repository, Branch & governance, Permissions, Review, Pull request, with `aria-current="step"` on the current one. Step 1 offers only repositories with no `.oxagen/`, and main or linked is a choice there that the drafted `role` follows. Step 2 offers GitHub's default branch as the suggestion and says so, and the three governance modes. Step 3 lists what Oxagen will be able to do, writes included (Contents, Pull requests, Checks), and what it still cannot do (push to the production branch, merge on its own, read a secret, grant authority). Step 4 shows both files in full and says every line is the person's to change. Step 5 names the repository being added, the branch `oxagen/init`, the six files with `.gitignore` carrying `.oxagen/workspace.json`, and the five checks. Opening binds the repository if it is not bound, sets the production branch if it changed, then calls `open_init_pr`. A refused check pushes nothing and says why.
10. **Governance modes.** The mode cards describe what the merge gate enforces. Compare the card text with `context.steering.policy.ts`: a card promising a code-owner review the gate does not check is a FAIL.
11. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract: `list_repositories`, `list_installation_repositories`, `get_repository_tree`, `link_repository`, `unlink_repository`, `open_init_pr`. 🟡 rows are wired for what ships and print "not recorded" for the rest. ❌ rows (language and push time, Symbols, the delivery count, the dialog's Issues, Code graph, Data layer and Working copies, moving main) print "not recorded" or are absent. A fixture reaching production is a FAIL.
12. **States.** Force each state and compare the copy and controls with the design:
    - **empty**: "This workspace has no repository yet", the two sentences, and Add Oxagen to a repository. The header and tabs are not rendered.
    - **loading**: the shell stays and the body is the skeleton. No data, no zeros, no stale rows.
    - **error**: "Repositories could not be loaded", `503 installation_unreachable`, the three sentences, Try again, Open an incident, and the trace line.
    - **access denied**: "You cannot see this workspace’s repositories", naming `repository.read on core-platform`, with Request access, Back to Work, Signed in as, Needed and Decided by. "Back to Fleet" is a FAIL.
    Each state looks the same on all four tabs.
13. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with More lit; Repositories is in the More sheet with its count. The tab strip scrolls within itself and the page never scrolls sideways. The table becomes labelled cards. Every dialog and the wizard are bottom sheets with full-width footer buttons. Touch targets are at least 44 px and inputs 16 px.
14. **Accessibility.** Tabs use `role=tablist` and `role=tab` with `aria-selected`. Clickable rows are reachable by keyboard and named. Dialogs are `role=dialog` with `aria-modal` and a labelled close. State is never colour alone. The page is operable by keyboard end to end.
15. **Permissions.** Read requires `repository.read`. `link_repository`, `unlink_repository` and `set_production_branch` are refused server-side to anyone but org Owner or Admin or workspace Owner; `open_init_pr` to anyone but org Owner or Admin. Verify with a role that lacks them. Moving main is not offered.
16. **Rules.** Check each rule in the spec's last section: frames and SteeringFrames never share a name; a published record is a source, never a frame; every fact is read, not cached as current; no person scored or ranked; nothing claims enforcement and nothing in `.oxagen/` grants authority; the tab counts are rollups; plain-noun headings with one-sentence subtext; one gold action; future-only fields render as not recorded; the permission table names the writes.
17. **Vocabulary.** The page says pull request, never Context PR, and Steering record, never context record. Search the build's strings for both old terms.
18. **Nothing extra.** List anything on the built page that is not in the spec. The app's production branch control in the repository dialog is not in the design: note it for the reviewer.

## Output

Return a single markdown report:

```
# Repositories: audit {{DATE}}
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
