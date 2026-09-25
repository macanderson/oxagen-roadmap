# Audit prompt: Kill switches

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Kill switches** tab of Oxagen's Tools page (`#/a-intel/core-platform/tools/switches`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/tools-switches.md`. Read it first, in full. The header and tab bar it shares are specified in `mockups/pages/tools.md`.
2. The design authority: `docs/fleet-operations-wedge.md` (the Policy row of Emissions, and D17), `docs/mission-control-spec.md` §6.11, and ADR-071 in `macanderson/oxagen`.
3. The design, rendered: the stories under `Oxagen / Tools / Kill switches` in Storybook (`npm run storybook`): Loaded, Empty, Loading, Error, Access denied, each also as a mobile story. Or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/tools/switches`. The checker is `node tools/check-mockup.mjs`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/tools/switches`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and shell.** The build serves the route with Kill switches selected and Tools lit. The header is the one `tools.md` specifies, and New tool is the gold action on this tab. The tab's count is the number of switches denying now.
2. **Class switches.** The eyebrow with the deny generation badge, and the three cards: every moves_funds tool, every irreversible tool, every tool with egress: third_party.
3. **Scoped switches.** The eyebrow with Create a switch, then a card per switch reaching this workspace: organization, workspace, provider, tool version, connection, agent and operator levels as the record holds them.
4. **Each card.** The target as its title, then its level and scope. A toggle with `role="switch"`, `aria-checked` and a label naming the action and the target, reading allowing or denying. Blast radius, then Flipped by and Reason on a denying switch, then Takes effect with the spec's copy. The toggle opens the flip dialog and never flips in place. A switch that ships with the workspace carries no Edit and no Remove.
5. **Flip.** Flip an allowing switch. The dialog shows the blast radius before it asks, the class note on a class switch, the Reason field, Takes effect with the generation it moves from and to, Behind it and Recorded as, and Deny now. After it: the card reads denying with the flipper and the reason, the deny generation advances by one, the tab count rises by one, and the flip banner appears on every Tools tab with Clear it. The flip lands in Audit as a security event.
6. **Clear.** Clear a denying switch. The dialog says denied calls resume at the next boundary and nothing denied is retried, and Allow again clears it. The clearer and the reason are recorded.
7. **Create.** Create a switch over an agent, over an enrolled host, and over an operator's agents. The target list and the blast radius recompute as the scope or the target changes and are counted from the record. A new switch is created allowing. A second switch on a target something already covers is refused with the spec's copy.
8. **Edit and remove.** The organization, workspace and class switches refuse Edit and Remove with the spec's copy. A created switch carries Edit and Remove. Removing a denying switch refuses and offers to clear it first. Removing an allowing one says nothing changes for a run.
9. **Coverage.** No copy claims a switch stops traffic it does not stop. The build states the coverage for calls routed through Oxagen, and a claim that every call is denied names that scope. On the `harness` tier the claim says client-attested and fail-open. While a switch is on, deleting the provider, connection or tool version it names is refused (ADR-071): try it.
10. **Arithmetic.** Recompute every blast radius from the record: tool versions, agents, runs in flight and grants for the target. A typed figure, or one that disagrees with Providers, Toolbelts or the agent list, is a FAIL.
11. **Gate notices.** On Steering › Sources filtered to Policy, each denying switch has a notice whose Managed in link opens this tab. While notices have no contract they render as not recorded.
12. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract (`list_kill_switches`, `set_kill_switch`). 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named (#3922). The side-effect and egress class switches carry no toggle and say why. The device scope, the blast radius, a switch held allowing, Edit and Remove render as not recorded. A fixture reaching production is a FAIL.
13. **States.** Force each state and compare copy and controls with `tools.md`: empty "No provider is registered", loading skeleton with no zeros, error `503 tool_registry_unavailable`, access denied naming `tools.read on core-platform` with Request access and Back to Work. Each replaces the header and tab bar and keeps the shell.
14. **Plain nouns.** No heading, label, caption or select option carries a comma, a mid-dot, a dash or a not/never contrast. Subtext under a heading is one sentence.
15. **One gold action.** Exactly one gold action is visible on the tab: New tool. Each dialog has one gold action, its confirming control, and Deny now reads as danger.
16. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar reads Work, Agents, Tools, Spend, More with Tools lit. The tab bar scrolls in its own row with Kill switches in view. The cards stack in one column, and each toggle is at least 44 px. Every dialog is a bottom sheet with full-width footer buttons. Inputs are 16 px, and nothing scrolls sideways.
17. **Accessibility.** Toggles are `role=switch` with `aria-checked` and a label naming the switch. Dialogs are `role=dialog aria-modal` with a labelled close. Allowing and denying read as words, never colour alone. Focus is visible and every control is operable by keyboard.
18. **Permissions.** Read requires `tools.read`. `switch.flip`, `switch.create`, `switch.edit` and `switch.remove` are gated server-side (today `set_kill_switch` admits an org Owner or Admin). Verify with a role that lacks each.
19. **Nothing extra.** List anything on the built tab that is not in the spec. Each is a finding.

## Output

Return a single markdown report:

```
# Kill switches audit {{DATE}}
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
