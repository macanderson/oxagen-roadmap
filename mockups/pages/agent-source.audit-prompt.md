# Audit prompt: Agent source

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check; it does not fix anything
unless told to in a second turn.

---

You are auditing the **Agent source** page of Oxagen (`#/a-intel/core-platform/agents/<slug>/source`) for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarise what you see; compare it.

## Inputs

1. The page spec: `pages/agent-source.md` (read it first, in full).
2. The design, rendered: the `agent-source` stories in Storybook (`npm run storybook`), one per state (loaded, loading, error, access denied), desktop and mobile; or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` in a browser or with Playwright. The checker is `node tools/check-mockup.mjs`.
3. The product spec for context: `docs/mission-control-spec.md` §14 (Mission Control), §10.3 (the Context PR lifecycle), Appendix F (the pages that survive), Appendix A (target tables); the data mapping in `docs/implementation-plan.md` §3.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/agents/<slug>/source`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route; the sidebar (Workspace: Fleet, Agent IAM, Tools, Steering, Repositories, Spend; Organization: Organization, Billing, Audit; the assistant launcher at the foot), breadcrumbs (… / Agent IAM / <slug> / source), ⌘K search, notifications, the approvals button, and account are present and match the spec’s shell. No assistant button in the top bar. The document title names the page.
2. **Header.** Eyebrow “Agent source”, h1 the file path in mono, the chips (main repo, branch @ commit or the pending branch, “source of truth”, the agent key), the one-sentence subtext. Actions present, in order, with the same labels: Back to the form · Discard · Save. Exactly one gold (primary) action on the screen, Save. Discard is disabled while the draft is unchanged.
3. **Summary tiles.** None on this page; fail if the build added any.
4. **Sections, tabs, and tables.** The Editor panel: the bar with the path, the modified dot and “modified” / “unchanged”, Find with ⌘F and a match count; the line-number gutter and the textarea labelled with the path; the status line with the cursor position, Frontmatter markdown, Spaces: 2, LF, UTF-8, and the key hints. The commit dialog: the diff of the draft against the base, the Branch select with + New branch, Summary, Description with Redraft, the Open a pull request checkbox, Cancel, and the primary button disabled until the branch and summary are filled.
5. **Actions and dialogs.** Every button in the spec exists, opens what the spec says (`commit`, `request-access` from denied, `incident` from error), and each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub must say what the product would do; a control that silently does nothing is a FAIL. A frontmatter parse error is shown at its line on every edit. The editor holds a `---` fence, a YAML header with `name`, `description` and the `oxagen:` table, a second fence and the instructions as the body; a build that shows TOML, or `agent-definition/v0.1`, is a FAIL.
6. **Approvals button and drawer.** The topbar button is left of the avatar with aria-label “Approvals, N waiting”; it opens `#apdrawer`; Escape closes it (and does not discard the draft); a row selected shows the full card with Approve and Deny.
7. **Data sources.** For each row of the spec’s data-source table, find the adapter or query in the build that feeds it. ✅ rows must be wired to the named store; 🟡 rows must be wired for the fields that exist and render `NotBacked` (an honest “not recorded yet”, never a zero) for the rest; ❌ rows must render `NotBacked` with the gap named. A fixture reaching production is a FAIL. The file must be read from `.oxagen/agents/<name>.md` on the bound repo, not from a database column.
8. **States.** Force each state and compare copy and controls with the design file:
   - **loading** (`state=loading`): the shell stays and the body is the skeleton; no editor, no stale text.
   - **error** (`state=error`): “This file could not be loaded”; `502 git_read_unreachable`; nothing was changed; runs kept recording; frames are written by the collector on each host. Actions: Try again, Open an incident; a trace id, region, and timestamp line.
   - **access denied** (`state=denied`): “You cannot see this agent’s definition”; the missing permission `agent.write on core-platform`; an owner can grant it and the grant is a governed action. Actions: Request access, Back to Fleet. Below: Signed in as, Needed, Decided by (`pol_v41` · deny wins over every allow).
   Error must name the code and offer Try again and Open an incident. Denied must name the missing permission and offer Request access.
9. **Trust language.** The chips show the recorded repo, branch, and commit; a commit on an unmerged branch is labelled pending and the running definition’s digest is the one every frame records. Nothing says the draft is live before it merges.
10. **Draft state.** A change made on the agent form appears here and a change made here appears on the form; Discard returns the draft to the base; navigating away and back keeps an uncommitted draft.
11. **Headings.** No heading on the built page carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence.
12. **Mobile.** At 390 × 844 with a touch pointer: the five-slot thumb bar is present with Fleet/Agents/Tools/Spend/More, counts only where something waits on a person; the editor fills the width and the status line wraps; the commit dialog is a bottom sheet with full-width footer buttons; only the editor’s lines scroll sideways; every tap target is ≥ 44 px; the textarea is 16 px.
13. **Accessibility.** The textarea and the find field have `aria-label`; the dialog is `role=dialog aria-modal` with a labelled close; the modified state is a dot and a word; focus is visible; the editor is operable by keyboard end to end, including ⌘S, Tab, ⇧Tab, ⌘/, ⌘F, and ⌘Z.
14. **Permissions.** Read requires `agent.read`; each write (agent.write (commit to a branch); repo.pr.open) is gated server-side, not only hidden in the UI. Verify with a role that lacks the permission.
15. **Nothing extra.** List anything on the built page that is not in the spec (tiles, tabs, columns, buttons, copy). Each is a finding; the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Agent source audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and shell | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected NotBacked, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption; open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
