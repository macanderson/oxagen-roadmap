# Audit prompt: Agent › Identity

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Identity** tab of one agent in Oxagen (`#/a-intel/core-platform/agents/<slug>/identity`) for conformance to its design. Be exact and adversarial. The design is the spec, and close enough is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/agent-identity.md`. Read it first, in full. The agent header and the tab bar are specified in `mockups/pages/agent.md`; check them there.
2. The design, rendered: the stories `Oxagen / Agents / Identity` (Loaded, Loading, Error, Access denied, each also · mobile) in Storybook (`npm run storybook`), or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/agents/triage/identity`. The checker is `node tools/check-mockup.mjs`.
3. The design authority: `docs/fleet-operations-wedge.md` (D14, D17) and `docs/fleet-operations-ia.md` (Agents).
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/agents/<slug>/identity`.

## Procedure

Work through every check. For each, record PASS, FAIL or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The route opens the agent page with Identity selected in the tab bar. The header and tab bar match `agent.md`. The sidebar lights Agents.
2. **Identity panel.** No subtext, and no explainer sub-line under Principal, Operator or Lifecycle state. "Revocable within one second." and those sub-lines are absent from the page and present in the component help (`mockups/help/agent-identity.md`, Identity). Rows in this order: Agent key, Principal, Kind, Harness, Model class, Operator, Cost center, Lifecycle state, First frame, with the values the spec gives. The Cost center row shows the agent's label or "None", **Change**, and the one line of why: the agent's own label, the label inherited from its workspace, or neither. Check one agent of each kind. The Principal is the `prn_…` id, never a service account name.
3. **Credentials panel.** No subtext. Badge "run token only". Five pairs: API key, OAuth token, Cloud role, GitHub token (each "Not held") and Run token ("Held"). The paragraph about the broker minting every secret at dispatch is absent from the page and present in the component help (`mockups/help/agent-identity.md`, Credentials). "Open providers" opens Tools › Providers. The badge reads "run token only" when every provider credential row reads "Not held", and at no other time.
4. **Run credential panel.** No subtext. "Long-lived, purpose-locked, hashed at rest, shown to the operator once." and the Key and Run tokens sub-lines are absent from the page and present in the component help (`mockups/help/agent-identity.md`, Run credential). Rows Key, Purpose lock, Issued, Last used, Run tokens and Host device key. The key shows its prefix only, never the secret or its hash. An agent with no host shows the unsigned-checkpoints sub-line. Actions Edit identity and Revoke credential (danger).
5. **Trust relationships panel.** No subtext and no explainer sub-lines. "Who this principal answers to, and what will speak for it." is in the component help (`mockups/help/agent-identity.md`, Trust relationships). Rows Accountable human, Workspace, Runtime, Delegation ceiling (`max_hops 2`) and Tamper incidents, with Read them when the count is not zero. Open its permissions opens the Permissions tab. There is no Replay row and no replay grade anywhere on the tab (D14). A Replay row is a FAIL.
6. **Nothing moved back.** No roles list and no tier ladder on this tab. Roles are on Permissions, the tier on Runtime.
7. **Dialogs.** Edit identity opens "Edit identity" with Principal, Acts on behalf of, Roles held with Assign role, the note "The new parent user accepts the change before it applies.", Cancel and Request the change. The Principal and Acts on behalf of fields carry no explainer hint. Revoke credential opens "Revoke the credential on <key>?" with one warning, Keep it and Revoke it. Each dialog's explanation is in the component help (`mockups/help/agent-identity.md`, Edit identity, Revoke the credential and Cost center). Assign role reaches `assign_agent_role`. **Change** on the Cost center row opens `ccagent` with the Cost center select ("None (inherit the workspace’s)" first), the hint naming the workspace's label and nothing more, Cancel and Save. Saving writes `cost_center_set` to Audit, and runs already rolled up keep their label. Each write passes IAM, writes an audit event and shows a receipt or reference. A control whose contract does not exist (Edit identity, Revoke credential, see the spec) must say what the product would do or be absent. One that reports a write it did not make is a FAIL.
8. **Data sources.** For each row of the spec's data-source table, find the adapter or query in the build that feeds it. ✅ rows are wired to the named contract (`get_agent`, `list_incidents`). 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named. A fixture reaching production is a FAIL.
9. **Future-only fields.** Run token, Purpose lock and Run tokens render as not recorded until the run-token exchange ships. Edit identity and Revoke credential are absent or say they are not available. Values drawn from fixtures for any of them are a FAIL.
10. **Rollups and agreement.** The Tamper incidents row equals the Activity tab count and the Audit page's count for the agent. The Principal equals the roster's Principal cell. The Host device key equals the fingerprint the Runtime tab shows. A constant or a typed figure is a FAIL.
11. **States.** Force each state and compare copy and controls:
    - **loading**: the shell stays and the body is the skeleton; no data, no zeros, no stale rows.
    - **error**: "This agent could not be loaded", `503 iam_principals_unavailable`, Try again and Open an incident, and a trace line.
    - **access denied**: "You cannot see this agent", the missing permission, Request access and Back to Work, with Signed in as, Needed and Decided by.
12. **Trust language.** Nothing claims a credential the agent holds beyond its own key. Nothing says proven, verdict, score or percentile. The lifecycle words are the recorded status values.
13. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit; the four panels stack in order; sub-lines wrap under their values; dialogs are bottom sheets; nothing scrolls sideways; touch targets are at least 44 px.
14. **Accessibility.** Tabs use `role=tab` and `aria-selected`; dialogs are `role=dialog aria-modal` with a labelled close; state is never colour alone (a dot and a word); focus is visible; the page works by keyboard end to end.
15. **Permissions.** Reading requires the agent read (`get_agent`). `assign_agent_role` is gated server-side, not only hidden. `set_cost_center` admits only org Owner, Admin or Billing; for anyone else **Change** on the Cost center row shows a toast that names who holds the role and opens no dialog. Verify with a role that lacks each.
16. **Rules.** No person is scored or ranked. A frame and a SteeringFrame never share a name on screen. No heading or label carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence. At most one gold action per screen.
17. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Agent Identity audit {{DATE}}
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
