# Audit prompt: Issue providers

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Providers**, **Fields** and **People** tabs of the Tasks page of Oxagen (`#/a-intel/core-platform/tasks/{providers,fields,people}`) and the connection wizard, for conformance to their design. Be exact and adversarial: the design is the spec, and "close enough" is a fail.

## Inputs

1. The page spec: `mockups/pages/tasks-providers.md` (read it first, in full), and `mockups/pages/tasks.md` for the shared header, tabs and states.
2. The design, rendered: the `tasks-providers`, `tasks-fields` and `tasks-people` stories, or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/tasks/<tab>`. The flow check is `node tools/check-tasks.mjs` (flows 1, 1b, and 7).
3. The product spec: `docs/tasks-spec.md` §5 (with §5.6 on creating values in a provider), §6, §7, §12, §14.
4. The build under audit: `{{APP_ROOT}}`, served at `{{APP_URL}}`.

## Procedure

Record PASS, FAIL, or N/A (with why) for every check, with evidence.

1. **Provider cards.** One card per connection with the provider's logo as an SVG, the account, and `syncing` or `needs attention`. The key-value list holds Authorization, the scope, Imports, Tasks, Events, Last sync, Connected, in that order. **Writes to <provider>** lists the four switches, each `on` or `off` as stored, in the provider's words; the close switch reads "Close the <issue / incident / case / ticket> as Done when you accept the work". Footer: **Sync now**, **Edit scope and fields**, **Disconnect** (red).
2. **Unconnected providers.** A dashed card with the logo and **Connect** for each of GitHub, Linear, Jira, ServiceNow, Salesforce, and Zendesk not yet connected. A workspace may connect a provider twice (two accounts); verify the build allows it.
3. **The wizard, step by step.** Six steps in order: Provider, Authorize, Scope, Fields, People, Review, with `aria-current="step"` on the current one.
   - Provider: six cards with logos in two groups, **Issue trackers** (GitHub, Linear, Jira) and **Help desks** (ServiceNow, Salesforce, Zendesk); Next disabled until a choice.
   - Authorize: the permissions table with the scopes of spec §5.2 exactly; the **Create values in <provider>** switch on every provider but GitHub, on by default, adding the admin permission of spec §5.6 and naming who approves it, and dropping that row when turned off; **What it still cannot do** on the same step, including rename or delete a provider value, and for a help desk reply to a requester; the credential-store note; Next disabled until the provider returns a token. Verify the real OAuth or App flow runs (a redirect or an installation approval) and that the token is written to the workspace credential store encrypted, never to the browser, a log, or a response body.
   - Scope: the provider's repositories, teams, projects, assignment groups, case queues, or groups with the defaults checked; the three import filters in the provider's unit; for Jira the JQL field; Next disabled with none checked.
   - Fields: statuses, resolutions and labels each mapped to a provider value, every suggestion marked `suggested` and changeable; each select offers **Create “<value>” in <provider>** where the connection can create it, and none when **Create values** is off and the provider needs more; **Only in <provider>** offers **Add “<value>”** for each provider value no Oxagen value maps to, and never for a mapped one; the count "N to create in <provider>" follows the choices; the line on what this provider creates and who approves it matches spec §5.6; the four write-back switches with certify and send on, status and close off. Verify a created value is made with the connection's token, records `create_provider_value`, takes the Oxagen name, and that no provider value is renamed or deleted.
   - People: every account on the tasks in scope; suggested members from sign-in accounts and verified email only, never a display name; any account can be set to not mapped; a bot shows `bot` and cannot be mapped; a help-desk requester is shown by name and never mapped; the running count updates.
   - Review: the whole connection, the same people count, "N to create in <provider>" with `create_provider_value` when a value is to be created, and the four facts ending that nothing is sent to an agent. **Connect <provider>** records `connect_issue_provider`.
4. **Edit.** **Edit scope and fields** opens the wizard at step 3 and ends on **Save**, recording `update_issue_provider`.
5. **Disconnect.** `ipoff` says what stops, that the token is revoked at the provider and deleted, that imported tasks stay marked disconnected, and that certified lists and sent work orders are unchanged. Verify the revocation call is made.
6. **Fields.** Task fields lists exactly the thirteen of spec §6.1 and no custom field. Statuses show their category and an `added` badge for workspace-added ones; a built-in's category cannot change. Resolutions ship Done, Won't do, Duplicate, Cancelled, Other; a task closed as Done carries the status Closed, and a provider's own word appears only in its mapping column. Every table has one mapping column per connected provider. Labels ship P0, P1, P2, P3, Bug, New Feature, Improvement, Documentation, Test, Chore, each with its colour, group and three mappings, and a `later` Definition of done items column. The four tables do not page.
7. **Label editor.** Twelve swatches and a hex field, no gold, a live chip preview; one mapping field per provider; the `later` banner saying a label will carry definition-of-done items; **Save label** records `update_task_fields`. Oxagen sets a label's colour in a provider once, when it creates the label there (GitHub, Linear), and never after: verify no later write changes a provider label's colour.
8. **Create in a provider.** `stedit`, `resedit`, and `lbledit` carry **Create in <provider>** on each mapping field; on a connection without the permission the field says "Creating one needs write. Edit the connection to ask for it." Saving records `create_provider_value` for that provider, gated by `task_fields.write`, and the mapping column names the created value.
9. **Status precedence.** A task matching an open and a blocked value reads blocked; a closed value wins over both.
10. **People.** Columns in order: Account · Provider · Email · Workspace member · Match · State. The suggestions banner and **Confirm all** appear only while suggestions wait. `pmap` offers "not mapped" first. Mapping grants nothing: verify that an unmapped account cannot certify or send, and that mapping an account does not grant its member any permission.
11. **Write-back.** With a switch off, no write of that kind reaches the provider. With it on, each write is a governed action in Audit. Oxagen never edits a subject or a description and never replies to a requester. The close write-back closes the task in the provider as Done.
12. **States.** As `tasks.audit-prompt.md` check 13.
13. **Plain nouns, gold, mobile, accessibility.** One gold action per screen; no comma, mid-dot or contrast in a heading; the wizard is a bottom sheet on a phone and its rail scrolls within itself; every logo has a text alternative; every select and checkbox is labelled.
14. **Permissions.** `issue_provider.connect` (including the **Create values** switch), `task_fields.write` (including `create_provider_value`) and `identity_map.write` gated server-side. Verify with a role that lacks each.
15. **Nothing extra.** List anything not in the spec.

## Output

The report format of `tasks.audit-prompt.md`, titled `# Issue providers: audit {{DATE}}`.

Rules: never mark PASS on an assumption. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
