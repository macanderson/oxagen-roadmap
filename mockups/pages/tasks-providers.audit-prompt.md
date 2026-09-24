# Audit prompt: Issue providers

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Providers**, **Fields** and **People** tabs of the Tasks page of Oxagen (`#/a-intel/core-platform/tasks/{providers,fields,people}`) and the connection wizard, for conformance to their design. Be exact and adversarial: the design is the spec, and "close enough" is a fail.

## Inputs

1. The page spec: `mockups/pages/tasks-providers.md` (read it first, in full), and `mockups/pages/tasks.md` for the shared header, tabs and states.
2. The design, rendered: the `tasks-providers`, `tasks-fields` and `tasks-people` stories, or `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#/a-intel/core-platform/tasks/<tab>`. The flow check is `node tools/check-tasks.mjs` (flows 1 and 7).
3. The product spec: `docs/tasks-spec.md` §5, §6, §7, §12, §14.
4. The build under audit: `{{APP_ROOT}}`, served at `{{APP_URL}}`.

## Procedure

Record PASS, FAIL, or N/A (with why) for every check, with evidence.

1. **Provider cards.** One card per connection with the provider's logo as an SVG, the account, and `syncing` or `needs attention`. The key-value list holds Authorization, the scope, Imports, Tasks, Events, Last sync, Connected, in that order. **Writes to <provider>** lists the four switches, each `on` or `off` as stored. Footer: **Sync now**, **Edit scope and fields**, **Disconnect** (red).
2. **Unconnected providers.** A dashed card with the logo and **Connect** for each of GitHub, Linear and Jira not yet connected. A workspace may connect a provider twice (two accounts); verify the build allows it.
3. **The wizard, step by step.** Six steps in order: Provider, Authorize, Scope, Fields, People, Review, with `aria-current="step"` on the current one.
   - Provider: three cards with logos; Next disabled until a choice.
   - Authorize: the permissions table with the scopes of spec §5.2 exactly; **What it still cannot do** on the same step; the credential-store note; Next disabled until the provider returns a token. Verify the real OAuth or App flow runs (a redirect or an installation approval) and that the token is written to the workspace credential store encrypted, never to the browser, a log, or a response body.
   - Scope: the provider's repositories, teams or projects with the defaults checked; the three import filters; for Jira the JQL field; Next disabled with none checked.
   - Fields: statuses, resolutions and labels each mapped to a provider value, every suggestion marked `suggested` and changeable; the four write-back switches with certify and send on, status and close off.
   - People: every account on the tasks in scope; suggested members from sign-in accounts and verified email only, never a display name; any account can be set to not mapped; a bot shows `bot` and cannot be mapped; the running count updates.
   - Review: the whole connection, the same people count, and the four facts ending that nothing is sent to an agent. **Connect <provider>** records `connect_issue_provider`.
4. **Edit.** **Edit scope and fields** opens the wizard at step 3 and ends on **Save**, recording `update_issue_provider`.
5. **Disconnect.** `ipoff` says what stops, that the token is revoked at the provider and deleted, that imported tasks stay marked disconnected, and that certified lists and sent work orders are unchanged. Verify the revocation call is made.
6. **Fields.** Task fields lists exactly the thirteen of spec §6.1 and no custom field. Statuses show their category and an `added` badge for workspace-added ones; a built-in's category cannot change. Resolutions ship Fixed, Won't fix, Duplicate, Cancelled, Other. Labels ship P0, P1, P2, P3, Bug, New Feature, Improvement, Documentation, Test, Chore, each with its colour, group and three mappings, and a `later` Definition of done items column. The four tables do not page.
7. **Label editor.** Twelve swatches and a hex field, no gold, a live chip preview; one mapping field per provider; the `later` banner saying a label will carry definition-of-done items; **Save label** records `update_task_fields`. The colour never reaches the provider: verify no write to a provider label.
8. **Status precedence.** A task matching an open and a blocked value reads blocked; a closed value wins over both.
9. **People.** Columns in order: Account · Provider · Email · Workspace member · Match · State. The suggestions banner and **Confirm all** appear only while suggestions wait. `pmap` offers "not mapped" first. Mapping grants nothing: verify that an unmapped account cannot certify or send, and that mapping an account does not grant its member any permission.
10. **Write-back.** With a switch off, no write of that kind reaches the provider. With it on, each write is a governed action in Audit. Oxagen never edits a subject or a description.
11. **States.** As `tasks.audit-prompt.md` check 13.
12. **Plain nouns, gold, mobile, accessibility.** One gold action per screen; no comma, mid-dot or contrast in a heading; the wizard is a bottom sheet on a phone and its rail scrolls within itself; every logo has a text alternative; every select and checkbox is labelled.
13. **Permissions.** `issue_provider.connect`, `task_fields.write` and `identity_map.write` gated server-side. Verify with a role that lacks each.
14. **Nothing extra.** List anything not in the spec.

## Output

The report format of `tasks.audit-prompt.md`, titled `# Issue providers: audit {{DATE}}`.

Rules: never mark PASS on an assumption. Quote the design's copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
