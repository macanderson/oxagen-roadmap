# Audit prompt: Agent › Runtime

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Runtime** tab of one agent in Oxagen (`#/a-intel/core-platform/agents/<slug>/runtime`) for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/agent-runtime.md`. Read it first, in full. The agent header and the tab bar are specified in `mockups/pages/agent.md`; the host itself in `mockups/pages/runtime.md`.
2. The design, rendered: the stories `Oxagen / Agents / Runtime` (Loaded, Loading, Error, Access denied, each also · mobile) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/agents/triage/runtime`. For the variant with no host, open `…/agents/pr-reviewer/runtime`. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (D17, honesty rule 6 of the Decision trace), `docs/fleet-operations-ia.md` (Agents) and `docs/fleet-operations-routes.md` (Agents).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/agents/<slug>/runtime`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The route opens the agent page with Runtime selected; `/enrollment` shows the same tab. The header and tab bar match `agent.md`.
2. **Host.** No subtext. The explainer sub-lines the spec lists as gone (Harness, Device key, Model proxy, oxagen MCP endpoint and Settings, and the Hooks written sentences) are absent from the page and present in the component help (`mockups/help/agent-runtime.md`, Host). The health badge and Open the runtime, which opens the host on Runtimes. Rows in this order: Runtime, Harness, Device key, Collector, Hook binary, Hooks written, Model proxy, Oxagen MCP endpoint, Settings, Tier earned, First frame, Last checkpoint, and Note when the runtime has one, with the values and sub-lines the spec gives. Open the same host on Runtimes and confirm the collector, the hooks and the last checkpoint are the same values, read from one record.
3. **What this tier delivers.** No subtext; "The tier is computed per run from what was actually routed." is absent from the page and present in the component help (`mockups/help/agent-runtime.md`, What this tier delivers). All runtimes opens Runtimes. The ladder is an ordered list with `aria-label` "The tier ladder", four rungs in order (`observe`, `harness`, `gateway`, `contained`) with the copy the spec gives, and "this agent" on the recorded rung only. No rung is marked not yet available. The six rows (Model calls, Tool calls over MCP, Harness-native tools, Budgets, Steering, Credentials held by this agent) give the terse answer the spec's table gives for the agent's tier. Force an agent on each tier and compare. No closing note: "Only contained is fully enforced" is absent from the page, and the long form of each answer is in the component help (`mockups/help/agent-runtime.md`, What this tier delivers).
4. **Rollback.** No subtext. The unenroll command in a code block, Run a test session (toast "Test session queued.") and Unenroll (danger). The `hooks_removed` note is absent from the page and present in the component help (`mockups/help/agent-runtime.md`, Unenroll this host from the CLI). The command matches what the shipped CLI accepts; a command the CLI rejects is a FAIL.
5. **No host enrolled.** An agent with no enrolled host shows one panel: "No runtime is enrolled", "Runs are recorded at the observe tier.", Enroll a runtime (gold, the Register agent gate) and Show CLI steps, which shows the CLI steps. Only an agent at the `observe` tier has no enrolled host.
6. **Dialogs.** Unenroll opens "Unenroll <host>?" with the two sentences, Keep it enrolled and Unenroll it, and reaches `revoke_tacho_enrollment`. Each write passes IAM, writes an audit event and shows a receipt or reference. Run a test session either starts a recorded run or says it is not available; a toast that claims a run that was never queued is a FAIL.
7. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it (`get_agent`, `list_tacho_hosts`, `list_agents`, `list_incidents`). ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named. A fixture reaching production is a FAIL.
8. **Future-only fields.** The host kind, the line saying how the host was started, the runtime note and Run a test session render as not recorded or are absent until their contracts ship. The hook event list, the hook binary version and the health word render only from what the host reports.
9. **Trust language.** The tier shows the recorded value and nothing stronger. Only calls routed through Oxagen are described as enforced; the harness tier is described as reported by the harness and fail-open. A tamper incident never raises the tier. Nothing says proven, verdict, score or percentile.
10. **Agreement.** The Tier earned badge equals the header's tier badge and the roster's Tier cell. The device key equals the Identity tab's Host device key. The health badge follows the host's recorded status and flags.
11. **States.** Force each state and compare with `agent.md`: loading (skeleton, no zeros), error (`503 iam_principals_unavailable`, Try again, Open an incident, trace line), access denied (the missing permission, Request access, Back to Work, Signed in as, Needed, Decided by).
12. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. The panels stack; the ladder stays an ordered list; the command scrolls inside its block and the page never scrolls sideways; dialogs are bottom sheets; touch targets are at least 44 px.
13. **Accessibility.** The ladder is an ordered list with an `aria-label`; dialogs are `role=dialog aria-modal` with a labelled close; state is never colour alone (a dot and a word); focus is visible; the tab works by keyboard end to end.
14. **Permissions.** Reading requires the agent read and the host read, checked server-side. `revoke_tacho_enrollment` and the registration writes are gated server-side, not only hidden. Verify with a role that lacks each.
15. **Rules.** A frame and a SteeringFrame never share a name on screen. No person is scored or ranked. No heading or label carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. At most one gold action per screen: none on the loaded tab, Wrap it on the variant with no host.
16. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Agent Runtime audit {{DATE}}
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
