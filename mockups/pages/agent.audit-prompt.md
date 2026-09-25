# Audit prompt: Agent › Overview

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Overview** of one agent in Oxagen (`#/a-intel/core-platform/agents/<slug>`), together with the agent header and the tab bar every agent tab shares, for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/agent.md`. Read it first, in full. The other tabs have their own specs (`agent-identity.md`, `agent-steering.md`, `agent-toolbelt.md`, `agent-runtime.md`, `agent-permissions.md`, `agent-activity.md`, `agent-source.md`); audit only what this spec owns.
2. The design, rendered: the stories `Oxagen / Agents / Overview` (Loaded, Empty, Loading, Error, Access denied, each also · mobile) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/agents/triage`. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (D3, D14, D17, the Cuts table), `docs/fleet-operations-ia.md` (Agents) and `docs/fleet-operations-routes.md` (Agents). Token classes: `docs/mission-control-spec.md` §12.6.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/agents/<slug>`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The bare agent path and `/overview` both open the Overview. An unknown tab id falls back to Overview. The sidebar lights Agents. The breadcrumb reads the organization, the workspace, Agents and the agent. The top bar has search, notifications, the Approvals button and the avatar. No assistant button in the top bar.
2. **Header.** Eyebrow "Agent". The h1 is the agent card: avatar, agent key in mono, the harness mark and label, and no score. One row of badges: the status as a dot and a word, the tier as recorded, "operator <name>". Then the description. Actions in this order: Edit avatar, Rotate credential, Suspend (danger), Retire agent (danger). No action in the header is gold. No replay badge and no replay grade anywhere on the page.
3. **Tab bar.** Eight tabs in this order: Overview, Identity, Steering, Toolbelt, Runtime, Permissions, Activity, Definition. `role=tablist`, each `role=tab` with `aria-selected`. Each is a path segment, so a tab is linkable and back moves between tabs. Counts: Toolbelt equals the tools on the toolbelt, Permissions the mandates held, Activity the tamper incidents recorded; a zero draws nothing. There is no Definition in git tab.
4. **Old addresses.** `/enrollment` shows Runtime, `/budgets` and `/mandates` show Permissions, `/runs` and `/incidents` show Activity. `/mandates/<id>` answers with `/permissions?delegation=<id>` (the app: a lookup 308 from `/{org}/{ws}/mandates/<id>`). `/definition` answers 308 to `/source`.
5. **30-day token use.** The header reads "<N> tok · $<N> · <basis>". Eight bars in this order: Conversation, Tool results, Context frames, Tool definitions, Steering, System, Output, Reasoning, each with tokens and share. Then Cache hit rate, Per run, Per model call and Basis with the copy the spec gives. The Basis line names the basis and does not explain how it is counted.
6. **Optimization.** The panel is titled Optimization. The badge reads "<N> suggestions", or "3 of <N> suggestions" above three. At most three items, ordered by the money at stake, each with its title, its signal line, "$<N> a month at stake" where there is a figure, and one action that opens where the change is made. The empty copy is verbatim: "Nothing to change. Every share is inside the workspace norm and the cache holds." The foot link reads "Optimization for this workspace →" and opens Spend › Optimization at its canonical path. Each action opens its tab at the canonical path; an action that goes through an old address is a finding.
7. **Composition.** No subtext (the sentence "One principal, and a reference to every other object it uses." on the page is a FAIL; it belongs in `mockups/help/agent.md`, Composition). The health badge. Rows Identity, Steering, Toolbelt, Runtime, Owner and Permissions with the values and sub-lines the spec gives. Every row but Owner has a button (Open, Open toolbelt, Open runtime or Open permissions) that opens the tab that owns it. Each named toolbelt links into Tools › Toolbelts. No row restates a fact its registry owns.
8. **Last 30 days.** No subtext. Open activity opens the Activity tab. Four stats: Runs with the last run time, Spend with its basis, Tokens with the cache share, Tamper incidents with the health reason. No note closes the panel: the sentences about the shared rollup and tool definitions paid on every call are in `mockups/help/agent.md`, Last 30 days, and on the page they are a FAIL.
9. **Definition.** No subtext, and no sub-line under Generated beside it. Both explanations are in `mockups/help/agent.md`, Definition. Open definition opens the Definition tab at `/source`. Rows Path, Repo, Commit, `definition_digest` and Generated beside it.
10. **Dialogs.** Edit avatar opens the avatar editor that `agent.md` specifies, the same dialog Account and the Organization page open: titled "Avatar for <name>" with the agent key under it, a squircle preview, and the five tones Solid, Soft, Line, Gold and Dark gold. Rotate credential opens "Rotate the credential on <key>?" with one note, one warning, Cancel and Rotate it. Suspend opens "Suspend <key>?" with the one note "Every run token dies at the next call. You can undo a suspension.", Cancel and Suspend it. Neither dialog explains the mechanism behind the action. That is in `mockups/help/agent.md`. Retire agent opens "Retire agent" with the confirmation checkbox. Each write reaches its contract (`update_agent_def`, `rotate_agent_credential`, `suspend_agent`, `retire_agent`), passes IAM, writes an audit event and shows a receipt or reference. A control that silently does nothing is a FAIL.
11. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named. A fixture reaching production is a FAIL.
12. **Future-only fields.** The six input composition bars, Optimization, the Composition Steering row, the named toolbelts and the host kind render as not recorded until their contracts ship. Any of them drawn with invented values is a FAIL. Output, Reasoning, the cache rate and the tool count may render from their contracts.
13. **Rollups.** The 30-day total equals the sum of the eight bars. The same total appears in Last 30 days and in the agent's row on Agents, and the cache share matches the roster's. The tab counts equal the records the tabs list. A constant or a typed figure is a FAIL.
14. **States.** Force each state and compare copy and controls:
    - **empty**: "This agent has never run", "It is registered and enrolled, and no frame has arrived.", and Back to Work. The sentence about the toolbelt computed at run start is in `mockups/help/agent.md`, Page header, not on the page.
    - **loading**: the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
    - **error**: "This agent could not be loaded", `503 iam_principals_unavailable`, nothing was changed, runs kept recording, frames are written by the collector on each host; Try again and Open an incident; a trace id, region and timestamp line.
    - **access denied**: "You cannot see this agent", the missing permission, the grant as a governed action; Request access and Back to Work; Signed in as, Needed and Decided by.
15. **Trust language.** Every tier, health word and cost basis shows the recorded value. `observe`, `harness`, `gateway` and `contained` appear only where recorded. A figure reported by the harness says so in its Basis line. Nothing says proven, verdict, score or percentile.
16. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit; More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The header actions wrap; the tab strip scrolls in its own row and keeps the selected tab in view; the panels stack; every dialog is a bottom sheet; nothing scrolls sideways; touch targets are at least 44 px.
17. **Accessibility.** Tabs use `role=tab` and `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; icon buttons have labels; state is never colour alone (a dot and a word); focus is visible; the page works by keyboard end to end.
18. **Permissions.** Reading requires the agent read (`get_agent`). `update_agent_def`, `rotate_agent_credential`, `suspend_agent` and `retire_agent` are gated server-side, not only hidden. Verify with a role that lacks each.
19. **Rules.** No person is scored or ranked. A frame and a SteeringFrame never share a name on screen. No heading or label carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. At most one gold action per screen, and none in the agent header.
20. **Nothing extra.** List anything on the built page that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Agent Overview audit {{DATE}}
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
