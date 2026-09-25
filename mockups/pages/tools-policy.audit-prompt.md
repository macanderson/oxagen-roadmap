# Audit prompt: Policy

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Policy** tab of Oxagen's Tools page (`#/a-intel/core-platform/tools/policy`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/tools-policy.md`. Read it first, in full. The header and tab bar it shares are specified in `mockups/pages/tools.md`, and the list of gate notices is on Steering › Sources (`mockups/pages/steering.md`).
2. The design authority: `docs/fleet-operations-wedge.md` (the Policy row of Emissions, Exclusion reasons, the Steering › Gates row of Cuts, D4 and D17), `docs/fleet-operations-routes.md` (Steering and Tools), `docs/fleet-operations-collapse.md` (Steering › Gates) and `docs/mission-control-spec.md` §6.12.
3. The design, rendered: the stories under `Oxagen / Tools / Policy` in Storybook (`npm run storybook`): Loaded, Empty, Loading, Error, Access denied, each also as a mobile story. Or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/tools/policy`. The checker is `node tools/check-mockup.mjs`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/tools/policy`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and old routes.** The build serves the route with Policy selected. `/steering/gates`, `/steering/policy`, `/steering/settings` and `/steering/freshness` answer a 308 to it. `/tools/autoapprovals` lands here in place. None renders an empty page or a 404.
2. **Header.** The header is the one `tools.md` specifies, with New tool plain on this tab.
3. **Policy versions panel.** Title "Policy versions" with no caption and no storage badge (the page names no storage table), and Draft new version. Columns in order: Version · State · Author · When · Rules · Tests · What changed, then the actions. A row carries Open and, by state, Draft new version (active), Edit, Activate and Discard (draft), or Restore (superseded). No note sits under the table.
4. **Tests badge.** A version whose tests have not run reads "not run yet" and never a pass. Create a draft and confirm it.
5. **Only a draft edits or deletes.** Edit and Discard on an active or superseded version refuse with the spec's copy and offer Draft a change. A version that has decided anything is never edited or removed.
6. **Where a version lives.** The five rows in order, Store · In regulated mode · Compiled from · Who reads it · What it writes, each a fact with the spec's copy and no explanation.
7. **Conditions and the sequence rule.** The 18 conditions as chips. The sequence rule carries a plain sentence above it saying what it denies and what lets it through. No copy on the tab names a policy language. Naming one is a FAIL.
8. **Dialogs.** `policyver`, `policynew`, `policyedit`, `policyactivate`, `policydiscard` and `policyrestore` open from the controls the spec names and carry its fields and copy. `policynew` refuses without a sentence. `policyactivate` says the active version is superseded and that every policy decision names the new one from the next tool call. `policyrestore` drafts a new version and never moves the pointer back. `policyver` has no subtitle, and a draft's date row reads Drafted. Each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub says what the product would do.
9. **Activation.** Activate a draft. The previous version reads superseded, the new one active, the kill-switch generation advances, and activation required approval.
10. **Gate notices.** On Steering › Sources filtered to Policy, each gate's notice is a `constraint` from a source of kind `policy`, and its Managed in link opens the place its gate is edited: this tab for a decision rule, Kill switches for a switch, the record for an enforcement grant, Agents for a missing mandate. A notice's frame names its version (`pol_v41`). Removing a notice leaves its gate in force. While notices have no contract they render as not recorded.
11. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named (#3920). Policy versions have no store today: the build must say so in place of the rows, and must not show `pol_v41` from a fixture. A fixture reaching production is a FAIL.
12. **What the build adds.** Record whether the build draws auto-approval rules, the mandates ledger or the freshness gates on this tab. Each is a finding against the design for the reviewer, and the mandates ledger is expected on each agent's Delegation section instead.
13. **States.** Force each state and compare copy and controls with `tools.md`: empty "No provider is registered", loading skeleton with no zeros, error `503 tool_registry_unavailable`, access denied naming `tools.read on core-platform` with Request access and Back to Work. Each replaces the header and tab bar and keeps the shell.
14. **Trust language.** No copy says a call is enforced without the tier. A policy version is never called a Steering record, and nothing says a version reaches a model.
15. **Plain nouns.** No heading or label carries a comma, a mid-dot, a dash or a not/never contrast, including the options of the Based on select. Subtext under a heading is one sentence.
16. **One gold action.** Exactly one gold action is visible on the tab with one draft, with no draft, and with two drafts. Record which control holds it in each case.
17. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar reads Work, Agents, Tools, Spend, More with Tools lit. The tab bar scrolls in its own row with Policy in view. The versions table renders as labelled cards, the rule source scrolls inside its block, and every dialog is a bottom sheet. Touch targets are at least 44 px, inputs are 16 px, and nothing scrolls sideways.
18. **Accessibility.** Tabs use `role=tablist/tab`. Dialogs are `role=dialog aria-modal` with a labelled close. State reads as a dot and a word. Focus is visible and the tab is operable by keyboard.
19. **Permissions.** Read requires `tools.read`. `policy.draft`, `policy.edit`, `policy.discard` and `policy.activate` are gated server-side, and activation needs an approver. Verify with a role that lacks each.
20. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Policy audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and old routes | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
