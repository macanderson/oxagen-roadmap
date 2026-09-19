# Audit prompt — Repositories

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Repositories** page of Oxagen (`#/a-intel/core-platform/repositories[/<tab>]`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/repositories.md` (read it first, in full).
2. The design, rendered: the `repositories` stories in Storybook (`npm run storybook`), one per state (loaded, empty, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright.
3. The product spec for context: `docs/mission-control-spec.md` §10 (the repository, steering and Context PRs), §11.2 (GitHub: events in, code graph up to date), Appendix F; `docs/creation-spec.md` (the one shape all five wizards share); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/repositories[/<tab>]`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar, breadcrumbs, ⌘K search, notifications and account are present and match the spec's shell; the breadcrumb ends on this page; Repositories is a Workspace nav item between Steering and Spend, with a count only when a pull request is open. The document title names the page.
2. **Header.** Eyebrow "Workspace · <workspace name>", h1 "Repositories". Action: **Add Oxagen to a repository**. Exactly one gold (primary) action on the screen — and it moves off the header onto the tab's own action on Working copies and on a selected pull request. Two golds anywhere is a FAIL.
3. **Summary tiles.** None on this page; fail if the build added decorative ones.
4. **Sections, tabs and tables.** For each item below, the build has it, with the same tab labels (and live counts where the design shows them), the same panel headings, and every table column named in the spec, in that order. Missing or renamed columns are FAILs; extra columns are noted.
   - Tabs: Repositories (N) · Working copies (N) · Changes (N) · Configuration. Counts: bound repositories, copies out of step, **open** pull requests (a merged one must not be counted).
   - Repositories — Repository · Role · Production branch · `.oxagen/` · Events · Symbols · action. The role vocabulary is `main` / `linked` / `not linked`, never GitHub's. The ungoverned-repository banner is present when a linked repository has no tree. Panels: **What linking does, in order** (the four steps of §11.2) and **The permissions this needs**.
   - Working copies — Directory · Repository · Branch · `.oxagen/` · Symlinks · Bundle · Last seen. The behind-is-not-behind banner is present. Panels: **Two files, and only one of them is yours to review**, **Syncing, in both directions**.
   - Changes — Change · Kind · Pull request · Opened by · State · Checks · Opened. Selecting a row shows the files, the checks with per-check result text, and What merge will do. Panel: **What opens one, without anybody asking**.
   - Configuration — `workspace.toml`, the drift table with which side is right, `governance.toml` with the three modes, and the whole tree.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`wz (init wizard)`, `linkdir`, `workcopy`, `repo`), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL.
6. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest "not recorded yet", never a zero) for the rest; ❌ rows must render `NotBacked` with the milestone named. A fixture reaching production is a FAIL. **This page has more ❌ than any other**, so check every one: `.oxagen/` presence, working copies, the skill/tool/config/init pull-request kinds, and drift are all unbacked today, and a build that renders them as if they were real is the single worst failure available here.
7. **States.** Force each state and compare copy and controls with the design file:
   - **empty** (`state=empty`): "This workspace has no repository yet" — a workspace without a main repo cannot exist, so this is the moment between creating one and binding it. Action: Add Oxagen to a repository.
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
   - **error** (`state=error`): "Repositories could not be loaded" — `503 installation_unreachable`. Nothing was changed. Runs kept recording while this page was down. Actions: Try again, Open an incident; a trace id, region and timestamp line.
   - **access denied** (`state=denied`): "You cannot see this workspace's repositories" — the roles the signed-in person holds do not include `repository.read on core-platform`. Actions: Request access, Back to Fleet. Below: *Signed in as*, *Needed*, *Decided by*.
8. **The lifecycle's own truths.** These are the sentences the page exists to make true; each is its own check.
   - A **failed check stops the run where it stopped**: the failing row says why, the checks behind it are queued, **Merge pull request** is disabled, and nothing is published. Verify merge is disabled in the DOM *and* a no-op if invoked anyway.
   - **Merge is disabled until every check reports.** A build that enables it on the first pass is a FAIL.
   - **Drift is reported, never repaired in place.** Search the build for any path that writes live state to match the file, or the file to match live state, without a pull request. One is a FAIL.
   - **Nothing on this page writes a row.** Every path ends on a pull request; a Save button that lands in a database is a FAIL.
   - **Nothing in `.oxagen/` grants authority.** Verify the init pull request cannot add a tool, raise a tier or lift a budget.
   - **A working copy's state is never presented as a run's state.** Copy that implies a stale laptop degrades governance is a FAIL.
   - **The permission table names the writes** (Contents, Pull requests, Checks). A read-only set beside a product that opens pull requests is a FAIL.
9. **The init wizard.** Five steps, in order: Repository → Branch & governance → Permissions → Review → Pull request. The repository list offers only repositories with no `.oxagen/`. GitHub's default branch is offered as the *suggestion*, and the copy says so. The Permissions step states both what Oxagen will be able to do and what it still cannot. The Review step shows both files in full and says every line is the operator's to change. The pull-request header names **the repository being initialised**, not the workspace's main repo. The branch is `oxagen/init`, and the file list includes `.gitignore` carrying `.oxagen/workspace.json`.
10. **Trust language.** Every tier, replay grade, attestation and cost basis on the page shows the recorded value; search the build for any place a stronger word could be rendered than the record allows. Money always carries its basis.
11. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More; Repositories is in the More sheet with its open-pull-request count; every dialog is a bottom sheet with full-width footer buttons; all four list tables render as labelled cards; the page never scrolls sideways; every tap target is ≥ 44 px; inputs are 16 px.
12. **Accessibility.** Tabs use `role=tablist/tab` with `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; icon buttons have `aria-label`; state is never colour alone (dot + word); the wizard rail marks the current step with `aria-current="step"`; focus is visible; the page is operable by keyboard end to end.
13. **Permissions.** Read requires `repository.read`; each write (`repository.link`, `repository.admin`, `context.propose`, `context.review`, `workcopy.link`) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission. `repository.admin` (changing which repo is main) must additionally require approval and write a security event.
14. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Repositories — audit {{DATE}}
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

Rules: never mark PASS on an assumption — open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
