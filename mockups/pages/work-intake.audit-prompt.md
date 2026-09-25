# Audit prompt: Intake

Copy everything below the line into a fresh agent session. Fill the two placeholders. The agent
audits the built page against this design and reports a verdict per check. It does not fix anything
unless told to in a second turn.

---

You are auditing the **Intake** dialog of Oxagen (`/a-intel/core-platform/work?intake=providers`, `?intake=fields`, `?intake=people`), with its Providers, Fields and People parts, the connection wizard, and the dialogs it opens, for conformance to its design. Be exact and adversarial: the design is the spec, and “close enough” is a fail. Do not summarize what you see. Compare it.

## Inputs

1. The page spec: `mockups/pages/work-intake.md` (read it first, in full), and `mockups/pages/work-backlog.md` for the page behind the dialog.
2. The design, rendered: the stories `Oxagen / Work / Intake` (Loaded, Loaded · mobile), or `mockups/missioncontrol.html?product=1&state=loaded&mobile=<0|1>#/a-intel/core-platform/work?intake=<part>`. The flow check is `node tools/check-tasks.mjs` (flows 1, 1b and 7).
3. The product specs: `docs/fleet-operations-wedge.md` (Vocabulary › Work, Cuts, Work › Shipped today), `docs/fleet-operations-routes.md` › Work, `docs/tasks-spec.md` §5, §6, §7, §12, §14.
4. The build under audit: `{{APP_ROOT}}` (the Next.js app), served at `{{APP_URL}}`.

## Procedure

Work through every check. For each, record PASS, FAIL, or N/A (with why). Cite evidence: a file and line in the build, a screenshot path, or a DOM selector and its text.

1. **Opening.** `?intake=providers`, `fields` and `people` each open the dialog on that part over Backlog, and **Intake** in the Work header opens it on Trackers. The old `/tasks/providers`, `/tasks/fields` and `/tasks/people` addresses land on `/work?intake=<part>`. Title “Intake”, the subtitle counting the connections and saying nothing more, the segmented control (`role=group`, `aria-label` “Intake”, `aria-pressed` on the current part), a labelled close, and the footer **Connect an issue tracker** (plain) and **Done** (gold). Note whether switching parts and closing keep the address true to what is on screen.
2. **Tracker cards.** One card per connection with the logo as an SVG, the account, and Connected or Needs attention as a dot and a word. The key-value list holds Authorization, the scope in the provider’s word, Imports, Work items, Events, Last sync and Connected, in that order. **Writes to <provider>** lists the four switches as stored, in the provider’s words, with “Close the <issue / incident / case / ticket> as Done when you accept the work”. Footer **Sync now**, **Edit scope and fields**, **Disconnect** (red). Check that the Work items count on a card equals what the connection imported and matches the count `ipoff` states.
3. **Unconnected providers.** A dashed card with the logo, the line and **Connect** for each of GitHub, Linear, Jira, ServiceNow, Salesforce and Zendesk not yet connected. A second account of a connected provider can be connected.
4. **How imports work.** The five facts, verbatim, including “It never edits a subject or a description, and it never replies to a requester.” and “It never renames or deletes one.”
5. **Fields.** Work item fields lists exactly the thirteen fields of `tasks-spec.md` §6.1 and no custom field. Statuses show their category and “Added by you” on a workspace-added one. Resolutions are Done, Won't do, Duplicate, Canceled and Other, with a provider’s own word only in its column. Labels are P0, P1, P2, P3, Bug, New Feature, Improvement, Documentation, Test and Chore, each with its colour, group, one mapping per connected provider, and a Definition of done items column that reads a dash titled “Coming soon”. Every table has one mapping column per connected provider, a connected help desk included. No table pages. The four panels carry no subtext and no note sits under them.
6. **People.** The suggestions banner and **Confirm <N> matches** appear only while suggestions wait. Columns in order: Account · Provider · Email · Workspace member · Match · State, with State one of `mapped`, `suggested`, `not mapped`, `bot`, `requester`. Only accounts of connected providers are listed. The banner says only that each account’s verified email matches a member, the panel has no subtext, and no note sits under the table: what a mapping grants is in `mockups/help/work-intake.md`, People.
7. **The wizard, step by step.** Six steps in order (Tracker, Authorize, Scope, Fields, People, Review) with `aria-current="step"` on the current one.
   - Tracker: six cards in two groups, **Issue trackers** and **Help desks**, `connected` on those connected; Next disabled until a choice.
   - Authorize: the permissions table with the scopes of `tasks-spec.md` §5.2 exactly; **Create values in <provider>** on every provider but GitHub, on by default, adding the permission of §5.6 and dropping it when turned off; **What it still cannot do** on the same step, including rename or delete a provider value, and for a help desk reply to a requester; no note on where the token is kept (that is in `mockups/help/work-intake.md`, Connection wizard); Next disabled until the provider returns a token. Verify the real OAuth or App flow runs, and that the token is written encrypted to the workspace credential store, never to the browser, a log, or a response body.
   - Scope: the provider’s repositories, teams, projects, assignment groups, queues or groups with the defaults checked; the three import filters in the provider’s unit; the first-read estimate; for Jira the JQL field; Next disabled with nothing checked.
   - Fields: every suggestion marked `suggested` and changeable; **Create “<value>” in <provider>** only where the connection can create one; **Only in <provider>** offers **Add** only for a value no mapping uses; the running count “N to create in <provider>”; the four write switches with certify and send on, status and close off; the notification warning on ServiceNow and Zendesk close. Verify a created value is made with the connection’s token, records `create_provider_value`, takes the Oxagen name, and that no provider value is renamed or deleted.
   - People: suggestions from sign-in accounts and verified email only, never a display name; any account can stay not mapped; a bot or requester shows “never mapped”; the running count updates.
   - Review: the whole connection, the same counts, and the numbered facts ending “Nothing is sent to an agent.”, each one sentence. **Connect <provider>** records `connect_issue_provider`; editing ends on **Save** and records `update_issue_provider`.
8. **Returning to Intake.** Open each of `ipoff`, `lbledit`, `stedit`, `resedit`, `pmap` and the wizard from inside Intake, then close it by Cancel, by the close button, by Escape, and by its own save. Each time Intake must come back on the part it was opened from. Connecting a new provider returns to Intake on Trackers with the new card present. A close that drops you on Backlog instead is a FAIL.
9. **Dialogs.** `ipoff` says what stops, that the token is revoked, and that imported work items stay marked disconnected; verify the revocation call, and that the token is deleted and certified lists and sent work orders are unchanged. `lbledit` has twelve swatches and a hex field with no gold, a live chip preview, and one mapping field per provider with **Create in <provider>** or the missing-permission line, and no Definition of done items field. `stedit` keeps a built-in’s category and shows no hint on a status the workspace added. `pmap` offers “not mapped” first with no note under it, and a bot or requester shows one sentence and can only be closed.
10. **Data sources.** For each row of the spec’s Data sources table, find what feeds it in the build. The whole dialog is future-only: every ❌ row renders `not recorded` or is left out, never a zero and never a fixture. A 🟡 row uses the named code path only for what it holds (the GitHub App installation, the Linear grant, the credential store). A fixture reaching production is a FAIL.
11. **Future-only fields.** The design carries no `data-future` mark on this dialog. Confirm the build still treats every field as future-only until its contract ships, and that no control silently does nothing.
12. **States.** The design has the loaded state only. Force loading, error, empty and denied on the page behind: each must be the shell’s standard panel inside the shell. Record which panel the build uses.
13. **Mobile.** At 390 × 844: the dialog and the wizard are bottom sheets with full-width footer buttons; provider cards stack; the People table and the permissions table are labelled cards; the wizard’s rail wraps; the thumb bar (Work, Agents, Tools, Spend, More) stays; nothing scrolls sideways; touch targets at least 44 px; inputs 16 px.
14. **Rules.** One gold action on the screen. No heading, panel title, table header or caption carries a comma, a mid-dot, or a not/never contrast. Every string names the provider’s own unit and note. The token is never shown, copied or read back. A suggestion is never a mapping until confirmed. An unmapped account is shown as itself. Resolutions use the words of done. Every provider shows its own logo. No sentence in the dialog explains the design, and the explanations live in `mockups/help/work-intake.md`: a panel subtext, a note under a table, or a hint that teaches mechanics is a FAIL. How imports work is the one explanatory panel the design keeps.
15. **Accessibility.** Dialogs are `role=dialog aria-modal` with a labelled close. Every select, checkbox and swatch is labelled. Logos have text alternatives. State is never colour alone.
16. **Permissions.** `issue_provider.connect` (including the Create values switch), `task_fields.write` (including `create_provider_value`) and `identity_map.write` are gated on the server. Verify with a role that lacks each.
17. **Nothing extra.** List anything in the built dialog that is not in the spec. Each is a finding, and the reviewer decides whether it stays.

## Output

Return a single markdown report:

```
# Intake audit {{DATE}}
Verdict: PASS | FAIL (n fails, m notes)

| # | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| 1 | Opening | PASS | … | |
| … | | | | |

## Fails, most severe first
1. <what is wrong>. <where>. <what the design shows>. <the smallest change that fixes it>

## Not in the spec
- …

## Data sources not backed (expected not recorded, and whether the build renders it honestly)
- …
```

Rules: never mark PASS on an assumption. Open the file or the DOM. Quote the design’s copy verbatim when a label differs. If the build cannot be started or the route is missing, stop and report that as the single FAIL.
