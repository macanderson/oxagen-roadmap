# Audit prompt: Agent › Source

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Source** tab of one agent in Oxagen (`#/a-intel/core-platform/agents/<slug>/source`): the agent definition file `.oxagen/agents/<slug>.toml` in a source editor, saved through a pull request. Check it for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/agent-source.md`. Read it first, in full. The tab bar is specified in `mockups/pages/agent.md`.
2. The design, rendered: the stories `Oxagen / Agents / Source` (Loaded, Loaded · mobile) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/agents/release-manager/source`. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (the Cuts row for the Definition in git tab, the Emissions row for Agent definition, D17), `docs/fleet-operations-ia.md` (Agents) and `docs/fleet-operations-routes.md` (Agents). ADR-057 in `macanderson/oxagen`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/agents/<slug>/source`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The route opens the source editor. `/{org}/{ws}/agents/<slug>/definition` answers 308 to `/source`. There is no Definition in git tab and no definition form anywhere. The sidebar lights Agents.
2. **Header.** An eyebrow naming the agent (a link to its Overview) and Source. The path as the h1 in mono. Chips for the main repository, the branch at its commit (or the pending branch), "source of truth" and the agent key. No subtext (the sentence "The agent definition is this file. Saving opens a pull request against the main repo." on the page is a FAIL; it belongs in `mockups/help/agent-source.md`, Page header). Actions in this order: Discard, Save. Save is the one gold action. Discard is disabled while the draft is unchanged.
3. **Tabs.** The agent's eight tabs with Source selected, carrying the same counts the other tabs show.
4. **Editor.** The bar with the path, the modified dot and word, and the find field with its match count; line numbers beside a textarea labelled with the path; TOML highlighting; the status line with the cursor position, TOML, Spaces: 2, LF, UTF-8 and the key hints. The keys work: ⌘S opens the commit dialog, Tab and ⇧Tab indent and outdent, ⌘/ toggles comments, ⌘F focuses find, Enter and ⇧Enter in find move between matches, Escape clears find.
5. **Parsing.** Break the file (an unterminated string). The editor shows the parse error at its line and Save is disabled. Change the `slug` or the `schema` line: Save refuses it with the reason. A file that does not parse reaching the commit dialog is a FAIL.
6. **Commit dialog.** Save opens "Commit this change" with the path, the diff stat and the origin; Repository and Base; Branch (with + New branch and the repository's branches) and New branch name; Summary with Redraft; Description; the Open a pull request switch; the diff against the base; the note that merge is the change; the footer naming what will be written; Cancel and the primary button, whose label follows the switch and the branch, disabled until the branch and summary are filled. Committing reaches `commit_agent_definition` on a branch that is never the default branch, opens or reuses the pull request, passes IAM, writes an audit event and shows the pull request.
7. **Draft state.** A change survives leaving the page and coming back. Discard returns the draft to the base. After a commit, the branch chip shows the pending branch until it merges, and the running `definition_digest` does not change before the merge.
8. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it (`get_agent`, `list_branches`, `commit_agent_definition`). ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named. A fixture reaching production is a FAIL. The file must come from the repository binding, or be labelled as the cached copy of the last commit.
9. **Future-only fields.** The drafted summary and description are empty for the person to write, or labelled as generated, until a drafting capability ships. A draft presented as the person's own text is a FAIL.
10. **Trust language.** The chips show the recorded repository, branch and commit. A commit on an unmerged branch reads pending. Nothing says the draft is live before it merges.
11. **States.** The design has the loaded state only. The build uses the shell's standard loading, error, empty and denied panels; each replaces the page body, never the shell, and loading shows no editor and no stale text.
12. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. The path and chips wrap; the editor fills the width and only its own lines scroll sideways; the status line wraps; the textarea is 16 px; the commit dialog is a bottom sheet with full-width footer buttons; touch targets are at least 44 px.
13. **Accessibility.** The textarea and the find field have labels; the pull request switch is `role=switch` with `aria-checked`; the dialog is `role=dialog aria-modal` with a labelled close; the modified state is a dot and a word; focus is visible; the editor works by keyboard end to end.
14. **Permissions.** Reading requires the agent read (`get_agent`). `commit_agent_definition` is gated server-side, not only hidden, and in an enterprise organization refuses `tools` above the committer's own grants. Verify with a role that lacks it.
15. **Rules.** Nothing on the page writes Postgres. A frame and a SteeringFrame never share a name on screen. No heading or label carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. Exactly one gold action per screen.
16. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

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

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
