# Audit prompt: Providers

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Providers** tab of Oxagen's Tools page (`#/a-intel/core-platform/tools/providers`) for conformance to its design. Be exact and adversarial: the design is the spec, and "close enough" is a fail. Do not summarise what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/tools-providers.md`. Read it first, in full. The header and tab bar it shares are specified in `mockups/pages/tools.md`.
2. The design authority: `docs/fleet-operations-wedge.md` (Unchanged, D17), `docs/fleet-operations-routes.md` (Tools), `docs/mission-control-spec.md` §6.4, §6.8 and Appendix A.5, and `docs/agent-ontology-ia.md` for the provider and transport vocabulary.
3. The design, rendered: the stories under `Oxagen / Tools / Providers` in Storybook (`npm run storybook`): Loaded, Empty, Loading, Error, Access denied, each also as a mobile story. Or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/tools/providers`. The checker is `node tools/check-mockup.mjs`.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`. Route under audit: `/a-intel/core-platform/tools/providers`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Route and aliases.** The build serves the route with Providers selected. `/tools/servers` and `/tools/connections` land here in place. Neither falls back to Tools, 404s, or redirects to a dead route.
2. **Header.** The header is the one `tools.md` specifies, with New tool plain on this tab.
3. **Providers panel.** Title "Providers", the caption with its two counts, and Add a provider as the tab's one gold action. The caption's counts equal the rows (recompute).
4. **Table.** Columns in order: Provider · Transport · Tools · Toolbelts · Agents · Health · Connection · Authorization · Last import, then the actions. The Provider cell is the system name over its description, never a transport or a blank. The Transport cell is one of `mcp`, `http`, `graphql`, `sdk`, `cli`, `native`, `local`, `rpc`, with the wire and the endpoint beneath it; a wire value in the transport badge is a FAIL. Every row has an Authorization value, "none needed" for a provider reached in-process or over a harness hook. Each row carries Open, Connect or Reconnect when the provider takes a credential, and Remove. A row opens the provider and is operable by keyboard.
5. **Transport is a property.** Open one provider whose transport is `mcp` and one whose transport is not. Both render the same columns, the same dialog sections and the same actions.
6. **Note and warning.** The transport note is verbatim. The warning under the table counts the connections with an expired token or a passed review date, is derived from the connections, and names each one.
7. **Credential grants log.** Title, caption (recompute the total and the connection count) and the "N most recent shown" badge. Columns in order: Grant · Tool version · Agent and run · Connection · Scope · TTL · State. A parked call's row says nothing was minted and why. A settled row links its receipt. The footer is verbatim. No TTL exceeds one hour.
8. **Provider dialog.** The degraded, expired-token and waiting-schema warnings where they apply; System, Transport (with the line that the registry, the policy and the receipts are the same whichever it is), Registry name, Schemas, Tool versions, Toolbelts, Agents reached, Last import; Authorization with the connection, its badge, scopes, owner and review dates, what the broker mints and grants in 30 days, and Reconfigure OAuth or Reconnect, Refresh the token, Edit the connection, Disconnect and Revoke as the connection's state allows; the no-connection and nothing-to-authorize variants; the provider's own versions; Remove, Re-import tools and Edit. Exactly one gold action in the dialog.
9. **Edit, remove, OAuth, connections.** `serveredit` offers all eight transports and all five wires and refuses an empty endpoint. `serverdel` says how many versions leave, how many belts lose a tool, that calls are denied as `unknown_tool`, and that the rows are kept for replay. `oauth` shows Client id, Client secret, Authorization URL, Scopes and the read-only Redirect URL, and Authorize refuses without a client id and an authorization URL. `conn`, `connedit`, `connrevoke` and `connection` carry the spec's fields and copy. Each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub says what the product would do.
10. **Rollups.** Recompute from the belts and the registry: the Toolbelts and Agents cells of every provider row, the Tools and versions counts, and the provider dialog's tool table. A typed figure is a FAIL.
11. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named (`data-gap`: #3917, #3918, #3923, #3852). The Authorization badge and the attention warning have no store today: the build must say so, never print "connected" or "none". A fixture reaching production is a FAIL.
12. **States.** Force each state and compare copy and controls with `tools.md`: empty "No provider is registered" with Import a provider and Add a connection, loading skeleton with no zeros, error `503 tool_registry_unavailable`, access denied naming `tools.read on core-platform` with Request access and Back to Work. Each replaces the header and tab bar and keeps the shell.
13. **Vocabulary.** Search the rendered DOM and the build's source for "MCP server", "server" and "servers" as a heading, tab, panel title, column header, button label, warning, dialog title or note. Each hit is a FAIL, including "a run that already called this server" in the remove dialog. `mcp` is allowed only as a transport value, in the edit dialog's Transport select, and in prose about the importer that reads `tools/list`.
14. **Secrets and trust.** No screen returns a secret, a token or a client secret after save. No copy implies an agent holds a credential. Every badge shows the recorded value.
15. **Plain nouns.** No heading or label carries a comma, a mid-dot, a dash or a not/never contrast. Subtext under a heading is one sentence.
16. **One gold action.** Exactly one gold action is visible on the loaded tab: Add a provider. A row's Connect or Reconnect in gold is a FAIL.
17. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar reads Work, Agents, Tools, Spend, More with Tools lit; the tab bar scrolls in its own row with Providers in view; both tables render as labelled cards; every dialog is a bottom sheet with full-width footer buttons; touch targets are at least 44 px; inputs are 16 px; nothing scrolls sideways.
18. **Accessibility.** Clickable rows expose `role="button"` or a link, a label, and keyboard operation. Dialogs are `role=dialog aria-modal` with a labelled close. Health and authorization carry a word, never colour alone. Focus is visible.
19. **Permissions.** Read requires `tools.read`. `tools.import`, `tools.provider.edit`, `tools.provider.remove`, `connection.add`, `connection.authorize`, `connection.edit`, `connection.review` and `connection.revoke` are gated server-side. Verify with a role that lacks each.
20. **Nothing extra.** List anything on the built tab that is not in the spec, such as a separate connections table. Each is a finding.

## Output

Return a single markdown report:

```
# Providers audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Route and aliases | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>, <where>, <what the design shows>, <the smallest change that fixes it>

## Vocabulary hits
- <selector> · <text> · <the word the design uses instead>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design's copy verbatim when a label differs. A vocabulary hit is always a FAIL, never a note. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
