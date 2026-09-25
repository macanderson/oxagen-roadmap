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
3. **Providers panel.** Title "Providers", the caption with its two counts, and Add provider as the tab's one gold action. The caption's counts equal the rows (recompute).
4. **Table.** Columns in order: Provider · Transport · Tools · Toolbelts · Agents · Health · Connection · Authorization · Last import, then the actions. The Provider cell is the system name over its description, never a transport or a blank. The Transport cell is one of `mcp`, `http`, `graphql`, `sdk`, `cli`, `native`, `local`, `rpc`, with the wire and the endpoint beneath it. A wire value in the transport badge is a FAIL. Every row has an Authorization value, "none needed" for a provider reached in-process or over a harness hook. Each row carries Open, then Manage connection, Connect or Reconnect when the provider takes a credential, and Remove. A row opens the provider and is operable by keyboard.
5. **Logomark and links.** Every provider row shows a logomark (24 px) left of the system name, and the provider dialog shows it (32 px) before the title. Where `list_mcp_servers` returns an `iconUrl`, the image loads from that https URL with `alt=""` and `referrerpolicy="no-referrer"`. Where it returns none, or the image fails to load (block its host in the network panel to test), the first letter of the system sits on a soft tile, or of the registry name while #3917 is open. A favicon service or a generic icon in its place is a FAIL. The description under the system is the registry entry's `description`, or not recorded (#3917, #4327). Under it, the row lists the website's host, Docs and Source, each only when the entry holds it. The dialog lists Website, Docs and Source as links, or Links "None recorded". Docs is absent when it is the same URL as the website or the source. Every link is https and opens in a new tab with `rel="noopener noreferrer"`. Clicking a link, or pressing Enter on it, follows the link and does not open the row. Until #4327 ships, Website, Docs and Source render not recorded with `data-gap` #4327, and a blank is a FAIL. For one provider added from the registry, compare with `search_mcp_registry`: the icon is the entry's first https `icons[].src`, and the website and source are its `websiteUrl` and `repository.url` (the spec's Registry fields table).
6. **Transport is a property.** Open one provider whose transport is `mcp` and one whose transport is not. Both render the same columns, the same dialog sections and the same actions.
7. **Note and warning.** No transport note sits under the table. The warning under the table counts the connections with an expired token or a passed review date, is derived from the connections, and names each one.
8. **Credential grants log.** Title, caption (recompute the total and the connection count) and the "N most recent shown" badge. Columns in order: Grant · Tool version · Agent and run · Connection · Scope · TTL · State. A parked call's row says nothing was minted and why. A settled row links its receipt. The table has no footer. No TTL exceeds one hour.
9. **Provider dialog.** The degraded, expired-token and waiting-schema warnings where they apply. The logomark before the title. System, then Website, Docs and Source, or Links "None recorded" (check 5), then Transport (the transport and the wire, with no explanatory line), Registry name, Schemas, Tool versions, Toolbelts, Agents reached and Last import. Authorization, with the connection, its badge, scopes, owner and review dates, what the broker mints and grants in 30 days, and Reconfigure OAuth or Reconnect, Refresh the token, Edit the connection, Disconnect and Revoke as the connection's state allows. The no-connection and nothing-to-authorize variants. The provider's own versions. Remove, Re-import tools and Edit. Exactly one gold action in the dialog.
10. **Edit, remove, OAuth, connections.** `serveredit` offers all eight transports and all five wires and refuses an empty endpoint. `serverdel` says how many versions leave, how many toolbelts lose a tool, that calls are denied as `unknown_tool`, and that the rows are kept for replay. `oauth` shows Client id, Client secret, Authorization URL, Scopes and the read-only Redirect URL, and Authorize refuses without a client id and an authorization URL. `conn`, `connedit`, `connrevoke` and `connection` carry the spec's fields and copy. Each write is a governed action: it passes IAM, produces an audit event, and shows a receipt or reference. A stub says what the product would do.
11. **Rollups.** Recompute from the toolbelts and the registry: the Toolbelts and Agents cells of every provider row, the Tools and versions counts, and the provider dialog's tool table. A typed figure is a FAIL.
12. **Data sources.** For each row of the spec's data-source table, find the adapter or query that feeds it. ✅ rows are wired to the named contract. 🟡 rows are wired for the fields that exist and render not recorded for the rest. ❌ rows render not recorded with the gap named (`data-gap`: #3917, #3918, #3923, #3852, #4327). The Authorization badge and the attention warning have no store today: the build must say so, never print "connected" or "none". The logomark is partial: a provider added over OAuth shows its stored icon, and one added with a bearer token, a header or no auth shows the letter tile until #4327. A fixture reaching production is a FAIL.
13. **States.** Force each state and compare copy and controls with `tools.md`: empty "No provider is registered" with Add provider and Add a connection, loading skeleton with no zeros, error `503 tool_registry_unavailable`, access denied naming `tools.read on core-platform` with Request access and Back to Work. Each replaces the header and tab bar and keeps the shell.
14. **Vocabulary.** Search the rendered DOM and the build's source for "MCP server", "server" and "servers" as a heading, tab, panel title, column header, button label, warning, dialog title or note. Each hit is a FAIL, including the remove dialog's title, which names the registry name. `mcp` is allowed only as a transport value, in the edit dialog's Transport select, and in prose about the importer that reads `tools/list`.
15. **Secrets and trust.** No screen returns a secret, a token or a client secret after save. No copy implies an agent holds a credential. Every badge shows the recorded value.
16. **Plain nouns.** No heading or label carries a comma, a mid-dot, a dash or a not/never contrast. Subtext under a heading is one sentence.
17. **One gold action.** Exactly one gold action is visible on the loaded tab: Add provider. A row's Connect or Reconnect in gold is a FAIL.
18. **Mobile.** At 390 × 844 with a touch pointer: the thumb bar reads Work, Agents, Tools, Spend, More with Tools lit. The tab bar scrolls in its own row with Providers in view. Both tables render as labelled cards, and every dialog is a bottom sheet with full-width footer buttons. Touch targets are at least 44 px, inputs are 16 px, and nothing scrolls sideways.
19. **Accessibility.** Clickable rows expose `role="button"` or a link, a label, and keyboard operation. Dialogs are `role=dialog aria-modal` with a labelled close. Health and authorization carry a word, never colour alone. Focus is visible. A logomark is decorative (`alt=""` or `aria-hidden`), and the name beside it names the provider. A link's accessible name contains its visible text. Enter or Space on a button or link inside a row works that control and does not open the row.
20. **Permissions.** Read requires `tools.read`. `tools.import`, `tools.provider.edit`, `tools.provider.remove`, `connection.add`, `connection.authorize`, `connection.edit`, `connection.review` and `connection.revoke` are gated server-side. Verify with a role that lacks each.
21. **Nothing extra.** List anything on the built tab that is not in the spec, such as a separate connections table. Each is a finding.

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
