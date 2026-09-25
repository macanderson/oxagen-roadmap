# Intake

<!-- work-intake: the Intake dialog over Backlog, its Trackers, Fields and People parts, the connection wizard, and the dialogs opened from Intake. The parts inside the dialog carry slashed data-help keys (`work-intake/<part>`), because the island names the page under a dialog work-backlog. -->

## Intake dialog {#dialog/intake}

The Intake dialog holds everything that brings work items into Oxagen, in three parts: the tracker connections, the field mappings, and the people map.

### Purpose
You open Intake when work items are missing, arrive with the wrong status or label, or show an account that should be a workspace member. The dialog answers three questions. Which trackers feed this workspace, and what may each write back (Trackers)? What does each provider's word mean here (Fields)? Which provider account is which member (People)? From it you connect another tracker, change a mapping, or map a person, then go back to Backlog with **Done**.

### Rationale
Intake used to be three tabs of the Tasks page: Providers, Fields and People. The wedge made Work the primary surface (D1 in `docs/fleet-operations-wedge.md`) and folded those tabs into one dialog on Backlog (wedge spec, Cuts). Setting up intake is occasional work, so it does not take a tab from the daily list, and it opens over Backlog so the effect of a change is one click away. Each issue, incident, case or ticket a connection imports becomes one work item, so the subtitle counts connections and leaves the item count to Backlog. A connection is a row, not a file (`docs/tasks-spec.md` §6.6): it holds a credential and an identity map, and neither belongs in a repository.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Subtitle count | `wsProviders()` over `IPROV` (`fixtures/tasks.json` `providers`) | `list_issue_providers` over `tasks.issue_providers` | none |
| Open part | `S.dlgArg`, `INTAKE_PARTS` in `mockups/src/wedge.js` | the `intake` query parameter on `/{org}/{ws}/work` | none |
| Return to Intake | `S.dlgBack`, `openDialog()`, `closeDialog()` | client state | none |

### Logic
1. Three paths open the dialog. **Intake** in the Work header on Backlog calls `openDialog('intake','providers')`. The address `#/<org>/<ws>/work?intake=providers`, `fields` or `people` opens it through `route()` and `hashDialog()`. The old Tasks addresses `…/tasks/providers`, `…/tasks/fields` and `…/tasks/people` are rewritten in place to `/work?intake=<part>`.
2. `DLG_EXT.intake` reads the part from `S.dlgArg` and falls back to `providers` for any value it does not know.
3. The segmented control (`role=group`, `aria-label` "Intake") holds Trackers, Fields and People. `intakePart()` switches the part without closing the dialog, and the current button carries `aria-pressed="true"`.
4. The subtitle reads "<N> issue tracker(s) connected to <workspace>." N is the number of connection cards, so the header is a rollup of the rows beneath it.
5. The body is `tkProvTab()`, `tkFieldsTab()` or `tkPeopleTab()`.
6. A dialog opened from inside Intake returns to it. `openDialog()` records `{kind:'intake', arg:<part>}` in `S.dlgBack`, and `closeDialog()` reopens Intake on that part. Cancel, the close button, Escape, and the saves of `lbledit`, `stedit`, `resedit`, `pmap` and `ipoff` all return this way. `ipzOpen()` records the same for the wizard. Connecting a new provider (`ipzFinish()`) returns to Intake on Trackers, where the new card now sits.
7. The footer holds **Connect an issue tracker** (plain, `ipzOpen()` at step 1) and **Done** (gold, closes the dialog). Done is the one gold action while nothing sits on top of Intake.

### States
Loaded only in this design. A workspace with no connection shows the six dashed provider cards and "0 issue trackers connected to <workspace>." A build uses the shell's loading, error and denied panels until they are designed. On a phone the dialog is a bottom sheet with a drag handle, and **Done** comes first in a full-width footer. Every value in the dialog is future-only: nothing in `macanderson/oxagen` stores an intake connection (wedge spec, Work › Shipped today). The nearest surface in the app today is the issue connections panel on the Run's Issues tab, which reads `get_run_issue_providers` for run follow-through.

## Trackers

Trackers shows one card per connection, with what it reads, how it authorizes and what it may write back, and one dashed card for each provider not yet connected.

### Purpose
You come here to check that a tracker is connected and healthy: how many work items it brought in, when it last synced, and whether any webhook delivery went missing. You also see exactly what Oxagen may write into that tracker. From a card you sync now, edit its scope and fields, or disconnect it. From a dashed card you connect a new provider.

### Rationale
A write into someone else's tracker is the part of intake a person most needs to see and control (`docs/tasks-spec.md` §5.4). So the four write-back switches sit on the card, each with an On or Off badge, in the provider's own words for its unit and its staff-only note. No screen says "issue" about a help desk. Six providers ship in two groups: GitHub, Linear and Jira as issue trackers, and ServiceNow, Salesforce Service Cloud and Zendesk as help desks. Each keeps its own logo, and none is the default. The Events and Last sync rows exist because a missed event costs up to 15 minutes before the reconcile catches it, and a person reading a stale item needs to see why.

Trackers once ended with a panel, How imports work, of five numbered rules: events, reconcile, fields, writes and creates. It taught the design and no shipped screen draws it, so it left the page and the rules are in Logic below. They state `docs/tasks-spec.md` §5.3, §5.4, §5.6 and §6.1 once, beside the cards they govern, so a person connecting a tracker sees the boundary before granting a token.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Account, scope, imports, work item count, events, last sync, connected by, health | `IPROV` (`providers`) | `tasks.issue_providers`; `list_issue_providers`, `get_issue_provider` | none |
| Authorization | `IPROV[].auth` | the provider's OAuth or App grant | partial |
| Writes to the provider | `IPROV[].writeback` | `update_issue_provider`, and the write-back governed actions | none |
| Sync now, Edit scope and fields, Disconnect | `act()`, `ipzOpen()`, `openDialog('ipoff')` | `sync_issue_provider`, `update_issue_provider`, `disconnect_issue_provider` | none |
| Dashed provider cards | `IP_KIND` | the provider catalog | none |

| Events and reconcile | `IPROV[].events`, `.synced` | provider webhooks (the data connectors' `ingestion.webhook_subscriptions` for GitHub, Linear, Zendesk and Salesforce) and a 15-minute changed-since read | partial |

Authorization is partial because the GitHub App installation ships (`ingestion.github_installations`), and `get_run_issue_providers` reads it and the Linear connections for run follow-through only. The GitHub, Linear, Zendesk and Salesforce connectors ship read-only into the graph. No Jira or ServiceNow connector exists.

### Logic
1. `tkProvTab()` draws one card per `wsProviders()` row, two to a row. The header holds `ipLogo()`, the provider's name, the account label with the account in bold mono ("GitHub organization a-intel"), and a badge: Connected when `health` is `ok`, Needs attention otherwise.
2. The key-value list reads Authorization, the scope under the provider's word (Repositories, Teams), Imports (the filter), Work items ("142 imported"), Events, Last sync, and Connected (the date and the member).
3. **Writes to <provider>** draws four `wbLine()` rows: post the definition of done as a <note> when a person certifies it, post a link to the work order as a <note> when it is sent, move the status when a work order starts, and close the <unit> as Done when you accept the work. `IP_KIND[k].note` and `IP_KIND[k].unit` supply the words, so a ServiceNow card reads "work note" and "incident".
4. **Sync now** toasts "<provider> sync queued. Recorded in Audit as sync_issue_provider." **Edit scope and fields** calls `ipzOpen(kind, id)`, which opens the wizard at step 3 with the card's filter, switches and create setting. **Disconnect** (red) opens `ipoff`.
5. Each provider in `IP_KIND` with no connection gets a dashed card with its logo, its name, its `desc` line and **Connect**. Connect calls `ipzOpen(kind)`, which opens the wizard at step 2 with that provider chosen.
6. The demo record holds GitHub (142 items) and Linear (88 items), both with certify and send on and status and close off. Jira, ServiceNow, Salesforce and Zendesk are dashed.

How imports work, for every connection:

7. **Events.** Each provider sends an event when an issue, incident, case or ticket changes. Oxagen treats the event as a hint, reads the unit again, and updates the work item. GitHub sends `issues` and `issue_comment` through the App, Linear and Jira register webhooks, Salesforce uses Change Data Capture on `Case`, and a Zendesk trigger fires a webhook. ServiceNow offers no webhook a token can register, so a ServiceNow connection reads on the reconcile alone until an admin adds an outbound business rule. A read older than the stored updated time is dropped.
8. **Reconcile.** Every 15 minutes Oxagen lists what changed since its last read, so a missed event costs at most 15 minutes. A nightly pass reads everything in scope.
9. **Fields.** Oxagen reads the thirteen fields on the Fields part and nothing else. Custom fields are not read.
10. **Writes.** Oxagen writes to a provider only what the switches on its card allow. It never edits a subject or a description, never deletes a unit, never assigns anyone, and never replies to a requester.
11. **Creates.** Oxagen creates a status, resolution or label in a provider only when you choose Create for it. It never renames or deletes a provider value, including one it created.

### States
With no connection the grid holds six dashed cards. The mockup draws no reason under Needs attention. On a phone the cards stack one per row and the card footer buttons wrap. A build renders each value as not recorded until `list_issue_providers` ships.

## Work item fields

Work item fields shows the thirteen fields Oxagen reads from every provider, and the provider field each one comes from.

### Purpose
When a work item shows the wrong owner, date or number, you look here to see which provider field fed it. Every provider fills the same thirteen fields, so a work item from Jira and one from Zendesk read the same way on Backlog.

### Rationale
Day 1 reads thirteen fields and nothing else (`docs/tasks-spec.md` §6.1). Each field Oxagen adds needs a mapping on six providers and a meaning in the brief, so custom fields wait for a schema of their own. `docs/work-in-flight-spec.md` §4 adds four more later: provider id, source url, priority and estimated agent minutes. Three derivations are worth knowing. Updated by is not a field in GitHub, Linear or Jira, so Oxagen reads the actor of the latest change. Owner is one person, and GitHub's first assignee fills it. Created by on a help desk is a requester, the customer or employee who raised the ticket.

Field settings are workspace settings, kept in Postgres and not in files, because they translate a tracker's words into Oxagen's and steer no agent (§6.6). Each change to a status, resolution or label is a governed action (`update_task_fields`) recorded in Audit, and it applies to the next read of every work item. A value a provider lacks can be created there from its editor. The table shows one column per connected provider, so a workspace with one help desk reads one column, not six.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Rows and each provider's source field | `TK_FIELDS` | the field mapping of `tasks-spec.md` §6.1 | none |
| Provider columns | `tkCols()` over `wsProviders()` | `list_issue_providers` | none |

### Logic
1. `tkFieldsTab()` builds the four Fields panels through its local `panel()` helper, which also sets each panel's `data-help` key.
2. `tkCols()` returns the connected providers in `IP_KIND` order: GitHub, Linear, Jira, ServiceNow, Salesforce, Zendesk. Each becomes a column.
3. The Work item id row spans every provider column with "tsk_ ULID, minted by oxagen". Every other row calls `mapCells()`, which prints the provider's source field in mono, or a dash where a provider has none.
4. The table does not page (`data-lt="off"`), and no row opens anything. The panel is read-only.

### States
A workspace with no connection shows the Field column alone. On a phone the table keeps its columns and wraps its text. A build renders the panel from the §6.1 mapping, with a column only for each connection `list_issue_providers` returns.

## Statuses

Statuses lists the workspace's statuses, the category each one belongs to, and the provider value each one maps from.

### Purpose
You come here to decide what counts as open, blocked or closed in this workspace, to add a status of your own, or to fix a mapping that files a work item under the wrong status. A row opens the status editor. **Add status** opens it empty.

### Rationale
Every status belongs to one of three categories: open, blocked or closed (`docs/tasks-spec.md` §6.2). The category is what Oxagen acts on, and the status name is what a person reads. Only a work item whose category is open can be sent. When a work item matches more than one status, closed wins over blocked, and blocked wins over open. Oxagen ships Open, Blocked and Closed. A workspace may add more: the demo adds In review, in the open category. The provider's Blocked status and the work graph's blocked reason are two things, and Backlog keeps them in two columns.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Statuses, categories and mappings | `TSTATUS` (`statuses`) | `tasks.field_settings`; `get_task_fields`, `update_task_fields` | none |
| Added by you | `TSTATUS[].builtin` | `tasks.field_settings` | none |

### Logic
1. `tkFieldsTab()` draws one row per `TSTATUS` entry: `tStatusBadge()` (green dot for open, red for blocked, grey for closed), an "Added by you" badge where `builtin` is false, the category, and `mapCells()` for each connected provider.
2. A row calls `openDialog('stedit', key)`. **Add status** calls `openDialog('stedit','new')`.
3. A save records `update_task_fields` in Audit and applies at the next read of every work item.
4. The category precedence above decides which status a work item takes when its provider value maps to more than one.

### States
Four rows on the demo record: Open, In review, Blocked and Closed. On a phone the table keeps its columns and wraps. A build renders not recorded until `get_task_fields` ships.

## Resolutions

Resolutions lists the words Oxagen uses for how a closed work item ended, and the provider value each one maps from.

### Purpose
A closed work item carries one resolution. You come here to see which provider close reason becomes which resolution, to add a resolution, or to create one in a provider that lacks it. A row opens the resolution editor. **Add resolution** opens it empty.

### Rationale
Oxagen's resolutions are the words of done: Done, Won't do, Duplicate, Canceled and Other (`docs/tasks-spec.md` §6.3). They read the same to a support team, an IT desk and an engineering team. A provider's own word, such as Jira's Fixed or Zendesk's Solved, stays in its mapping column and never becomes Oxagen's. The resolution matters beyond the label. A blocker closed as Done unblocks the items that wait on it, and one closed any other way does not (`docs/work-graph-spec.md` §5.2). Salesforce and Zendesk have one closed state out of the box, so only Done maps there until a workspace maps more or creates the values.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Resolutions and mappings | `TRES` (`resolutions`) | `tasks.field_settings`; `get_task_fields`, `update_task_fields` | none |

### Logic
1. `tkFieldsTab()` draws one row per `TRES` entry: the name in bold, then `mapCells()` for each connected provider. GitHub's Done reads `state_reason completed`, and a connected ServiceNow's reads `close code Solution provided`.
2. A row calls `openDialog('resedit', key)`. **Add resolution** calls `openDialog('resedit','new')`.
3. A save records `update_task_fields`, and a value created in a provider also records `create_provider_value`.
4. `node tools/check-tasks.mjs` asserts that the five default resolutions ship and that none is named Fixed or Won't fix.

### States
Five rows on the demo record. On a phone the table keeps its columns and wraps.

## Labels

Labels lists the workspace's labels, each with its color, its group, and the provider labels, priorities, types or tags it maps from.

### Purpose
You come here to see why a work item carries a label, to change a label's color, or to map a provider's priority or tag onto an Oxagen label. A row opens the label editor. **Add label** opens it empty.

### Rationale
A label has a color and a mapping to each provider's own labels, priorities, types or tags (`docs/tasks-spec.md` §6.4). One Oxagen label can stand for a GitHub label, a Linear priority, a Jira issue type and a ServiceNow category at once, so P0 means the same thing whichever tracker the work came from. Oxagen ships ten labels in two groups, Priority (P0 to P3) and Type (Bug, New Feature, Improvement, Documentation, Test, Chore). The color is Oxagen's own. Gold is never offered, because gold is the house identity color and never encodes state. A provider label that maps to no Oxagen label is not read.

The Definition of done items column shows a dash titled "Coming soon". A label will later carry definition-of-done items that copy into the draft of every work item with that label, and those templates will be files in `.oxagen/dod/labels/` (§6.5). The label editor's section explains the plan.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Labels, colors, groups and mappings | `TLABELS` (`labels`) | `tasks.field_settings`, `tasks.task_labels`; `get_task_fields`, `update_task_fields` | none |
| Definition of done items | none | `.oxagen/dod/labels/<label>.toml` | none |

### Logic
1. `tkFieldsTab()` draws one row per `TLABELS` entry: `lblChip()` in the label's color, a swatch with the hex value, the group, `mapCells()` for each connected provider, and the dash.
2. A row calls `openDialog('lbledit', key)`. **Add label** calls `openDialog('lbledit','new')`.
3. The chip colors here are the ones Backlog and every work item draw.

### States
Ten rows on the demo record. On a phone the table keeps its columns and wraps.

## Suggested matches

The suggested matches banner appears on People while any provider account has a suggested member nobody has confirmed, and confirms them all at once.

### Purpose
When Oxagen finds a provider account whose verified email matches a workspace member, it suggests the match. You confirm the suggestions here in one step instead of opening each account.

### Rationale
A match counts only when a person confirms it. Nothing in Intake infers on a person's behalf, so a suggestion stays labelled `suggested` until someone confirms it or picks another member (`docs/tasks-spec.md` §7). Oxagen suggests from two sources, in order: the member signed in to Oxagen with that provider account, then a verified email equal to the member's. It never suggests from a display name, because display names collide.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Suggested accounts | `TPEOPLE` with `state` `suggested` | `tasks.provider_people`; `list_provider_people` | none |
| Suggestion source | `TPEOPLE[].match` | `auth.accounts` and the member's verified email | partial |
| Confirm | `tpConfirmAll()` | `map_provider_person`, once per account | none |

The suggestion source is partial: sign-in accounts ship in `auth.accounts`, and nothing reads them into a suggestion yet.

### Logic
1. `tkPeopleTab()` counts the `TPEOPLE` rows in state `suggested`. With none, it draws no banner.
2. The banner shows the badge "<N> suggested", "<N> match(es) need(s) your confirmation" in bold, "Each account's verified email matches a workspace member.", and **Confirm <N> matches** ("Confirm 1 match" for one).
3. `tpConfirmAll()` sets every suggested account to mapped and toasts "Matches confirmed. map_provider_person recorded once per account." The banner goes away.
4. The demo record suggests two: `jonas-okoro` on GitHub and `ines.h` on Linear.

### States
Absent when no suggestion waits. On a phone the badge, the text and the button stack.

## People

People lists every account in the connected providers, the workspace member it maps to, how the match was made, and its state.

### Purpose
You want to know who an account on a work item is, and whether Oxagen treats it as a workspace member. The table lists every account in your providers and the member each one is. A row opens the mapping dialog, where you map, change or clear it.

### Rationale
Mapping says who an account is in Oxagen and grants nothing (`docs/tasks-spec.md` §7). A member's own roles decide what they may do. An account left not mapped still owns and creates work items under its own handle, with its provider's mark, and nothing pretends it is a member. Only a signed-in member can certify a definition of done or send a work order, whatever the mapping says. A bot is never mapped to a person, and a help desk's requester is never mapped to a member, because a requester raised the ticket and never works in the workspace. No person is scored or ranked here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Account, provider, email, member, match, state | `TPEOPLE` (`people`) | `tasks.provider_people`; `list_provider_people`, `map_provider_person` | none |
| Workspace member name and avatar | `PEOPLE` | the workspace's members | live |

### Logic
1. `tkPeopleTab()` lists only accounts whose provider is connected (`wsProviders()`).
2. Columns: Account (the provider logo, the handle in mono and the display name), Provider, Email, Workspace member (avatar and name, or a dash), Match (`verified email`, `by hand`, or a dash) and State.
3. State is `TP_STATE`: Mapped, Suggested, Not mapped, Bot or Requester.
4. The shared list bar adds search, facets for State, Provider and Match, Rows, and a pager.
5. A row calls `openDialog('pmap', id)`.
6. The demo lists ten: `mbell-ai`, `priya-n`, `amara-l` (mapped by hand), `jonas-okoro` (suggested), `vk-dev` (not mapped) and `dependabot[bot]` (bot) on GitHub, and `marcus`, `priya`, `ines.h` (suggested) and `support-rota` (not mapped) on Linear.

### States
With no connection the table is empty. On a phone the table becomes labelled cards. A build renders not recorded until `list_provider_people` ships.

## Connection wizard {#dialog/ipwz}

The connection wizard connects an issue tracker or a help desk in six steps: Tracker, Authorize, Scope, Fields, People and Review.

### Purpose
You connect a provider once, and this is where you decide everything that connection may do: which account it authorizes as, what it reads, how its words map to Oxagen's, which accounts are which members, and what it writes back. The same wizard edits a connection from **Edit scope and fields**, starting at step 3. It imports work items from an issue tracker or a help desk, and the edit path changes the scope, the fields and the writes a connection may make.

### Rationale
Every step says what the next one needs (`docs/tasks-spec.md` §5.1). You can connect more than one provider, and more than one account of the same provider. The Authorize step names what the token still cannot do, because every enforcement claim states its scope. GitHub and Linear sign every write as the Oxagen app. A Jira, ServiceNow, Salesforce or Zendesk token acts as the account that authorizes it, so the wizard asks you to authorize with an account made for Oxagen. **Create values** is a separate permission, on by default, because creating a status in Jira or a choice in ServiceNow needs an admin grant that reading never does (§5.6). The token is stored in the workspace credential store, envelope-encrypted under the organization's key. Nobody can read it back, including the person who connected it, and a write without a token fails closed. The Review step says what connecting does. The assistant drafts a definition of done for each open work item, and its turns are recorded and never appear in Work or Spend. No work item is ready until somebody certifies it. A work order is the only way work reaches an agent.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Provider catalog and per-provider copy | `IP_KIND`, `IPZ` | the provider catalog | none |
| Authorize: the token and where it is kept | `IPZ[].perms`, `S.ipz.authed` | the workspace credential store, `mcp.credentials` | partial |
| Scope and Import | `IPZ[].scope`, `ipzFilters()` | the connection's scope and filter | none |
| Fields: suggested mappings | `IPZ[].values`, `ipzSuggest()` | a value-mapping suggestion | none |
| Create a value in a provider | `IPZ[].creates`, `ipzApply()`, `ipNew()` | `create_provider_value` | none |
| People | `IPZ[].people` | `list_provider_people`, `map_provider_person` | none |
| Connect or Save | `ipzFinish()` | `connect_issue_provider`, `update_issue_provider` | none |

The credential store ships (`packages/plugins/src/credentials/workspace-credential.ts`), and nothing requests the issue scopes yet. `suggest_connection_mappings` suggests record-type mappings, not status or label values.

### Logic
1. `ipzOpen()` opens at step 1. `ipzOpen(kind)` from a dashed card opens at step 2 with that provider chosen. `ipzOpen(kind, id)` opens at step 3, already authorized, with the connection's filter, switches and create setting. `ipzRail()` draws the six steps (`role=list`), marks the current one `aria-current="step"`, and checks the finished ones. The footer opens with "needs `issue_provider.connect` on <workspace>".
2. **Tracker.** Two groups of cards, Issue trackers and Help desks, each with logo, name, `connected` where one exists, and its line. `ipzPick()` resets the wizard's state for the new provider through `ipzFor()`. Next waits for a choice.
3. **Authorize.** The provider's `intro` paragraph, a site field where the provider has one, and **Create values in <provider>** where `createPerm` exists. `ipzCreateOn()` toggles it and clears the authorization, because the grant changes. **What oxagen needs** lists the permissions, adding `createPerm` while Create is on. **What it still cannot do** lists edit, act as you or as anyone else, reply to a requester (help desks), read more, assign, and rename or delete. `ipzAuth()` waits 700 ms, then shows the `authorized` banner with `IPZ[].authed`. Next waits for it.
4. **Scope.** Checkboxes over `IPZ[].scope` with the defaults checked, and **Import**, one of three filters in the provider's unit. The estimate is `est` scaled by the checked count over the default count. The assistant then drafts a definition of done for each open item the first read brings in. Jira adds an optional JQL filter. Back is disabled when editing.
5. **Fields.** Three tables drawn by `ipzMapRow()`. Each select offers nothing, the provider's values, and **Create "<name>" in <provider>** where `ipzCan()` allows it. Source reads `suggested`, `chosen`, `create` or a dash. **Only in <provider>** offers **Add** for each value no mapping uses (`ipzAdd()`, `ipzUnadd()`). A value that maps to nothing stays on the work item as the provider has it, and Oxagen reads it as nothing. The note carries `createNote`, says when Create is off, and counts "<N> to create". Then the four write-back switches, certify and send on, status and close off, with `closeNote` on ServiceNow and Zendesk. Each write is a governed action, made with the connection's token and recorded in Audit.
6. **People.** Each account from `IPZ[].people`, prefilled with its verified-email match. A bot or requester shows its badge and "never mapped". The note counts mapped and not mapped. Mapping grants nothing, an unmapped account still appears on its work items under its own name, and you can map it later on People. A requester is the person who asked for the work, and Oxagen shows a requester by name and never maps one.
7. **Review.** Provider, Authorization, scope, Import, Fields, People and Writes, then **When you connect**: the token is stored and every work item in scope read, each chosen value created as `create_provider_value`, the assistant drafts, every draft waits for a person, and nothing is sent to an agent.
8. `ipzFinish()` calls `ipzApply()`. `ipNew()` gives a created value its Oxagen name, with no spaces in a tag or Jira label (`wont_do`). An edit toasts "<provider> saved. update_issue_provider recorded." and applies at the next read. A new connection adds the card as "importing", adds the accounts to People, returns to Intake on Trackers, and toasts in gold "<provider> connected. connect_issue_provider recorded. Importing <N> <scope>." Drafts then appear as each work item is read.

### States
Loaded only. On a phone the wizard is a bottom sheet, the step rail wraps onto a second line, and the permissions table becomes labelled cards. `node tools/check-tasks.mjs` walks flows 1 (Jira, one value created, one account not mapped) and 1b (ServiceNow with Create off).

## Disconnect dialog {#dialog/ipoff}

The disconnect dialog confirms that Oxagen stops reading a provider and revokes its token there.

### Purpose
You disconnect a tracker when the workspace no longer takes work from it, or when its token must be withdrawn. The dialog says what happens to the token and to the work items it imported before you commit.

### Rationale
Disconnecting revokes the token at the provider and deletes it from the credential store (`docs/tasks-spec.md` §5.5). The work items it imported stay, with the values last read, marked disconnected. Their certified definitions of done, and every work order already sent, are unchanged, because a certification and a send are records a person made and a lost connection does not undo them. Connecting the same account again reads the same issues back into the same work item ids, since a work item is unique by connection and provider id (§5.3).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Provider and account | `IPROV` | `get_issue_provider` | none |
| Imported work item count | `wsTasks()` filtered by kind | `tasks.tasks` by connection | none |
| Disconnect | `ipOff()` | `disconnect_issue_provider` | none |

### Logic
1. **Disconnect** on a Trackers card calls `openDialog('ipoff', id)`. `DLG_EXT.ipoff` finds the connection or shows `noSuch("Connection")`.
2. Title "Disconnect <provider>?". The body says Oxagen stops reading the provider and revokes its token there. The note counts the imported work items that stay, with their last-read values, marked disconnected.
3. Footer: **Keep it connected** and **Disconnect it** (red). No action is gold, because the primary is destructive.
4. `ipOff()` removes the connection, closes the dialog (which returns to Intake on Trackers through `S.dlgBack`), and toasts "<provider> disconnected, and its token revoked. Recorded in Audit as disconnect_issue_provider."
5. The mockup drops the connection row, so `wsTasks()` stops listing that provider's work items on Backlog. The build must keep those items, marked disconnected, with their certifications and work orders.

### States
Opens only from a connected card. `issue_provider.connect` gates the action server-side. On a phone it is a bottom sheet with full-width footer buttons.

## Label editor {#dialog/lbledit}

The label editor names a label, sets its group and color, and maps it to each connected provider, with the option to create it where a provider lacks it.

### Purpose
You add a label, recolor one, or map it to a provider's label, priority, type or tag. When a provider has no matching value, you can have Oxagen create it there on save.

### Rationale
The color is Oxagen's own. Oxagen sets a label's color in a tracker once, when it creates the label there, and never changes it after (`docs/tasks-spec.md` §6.4, §5.6). Twelve swatches exist and gold is not one, because gold is the house identity color. Creating a value is opt-in per value, made with the connection's token, and recorded as `create_provider_value`. A connection without the create grant says what it lacks rather than failing on save.

A label will later carry definition-of-done items (§6.5). When a work item has the label, those items copy into the work item's draft before `oxagen.assistant` adds its own, marked with the label they came from. Bug would carry "A test reproduces the defect and fails before the fix." The templates will live in `.oxagen/dod/labels/` and change by pull request, because they steer agents. The editor no longer shows that plan on the page. The Labels table keeps a Coming soon column for it.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, group, color, mappings | `TLABELS`, `S.lblDraft` | `tasks.field_settings`; `update_task_fields` | none |
| Create in a provider | `ipCan()`, `edCreate()`, `ipNew()` | `create_provider_value` | none |
| Definition of done items | none | `.oxagen/dod/labels/<label>.toml` | none |

### Logic
1. A Labels row calls `openDialog('lbledit', key)`, and **Add label** passes `new`. The title is "Edit <name>" or "Add a label".
2. Name, and Group (Priority, Type, Area). **Color** offers `LBL_SWATCHES`, a hex field that applies any `#rrggbb`, and a live chip preview. `lblSw()` updates the preview in place without a render.
3. **Mapped from** calls `mapFields()`: one field per connected provider. `ipCan()` returns the provider's name for the value, `false` when the connection lacks the grant, or `null` when the provider cannot hold one. A name draws **Create in <provider>**. False draws "Creating one needs <permission>. Edit the connection to ask for it."
4. `edCreate()` needs a name ("Name it first."), fills the field with `ipNew()`, and turns the button into the disabled "Created when you save".
5. `lblSave()` needs a name ("Name the label first."), writes `TLABELS`, closes back to Intake on Fields, and toasts "Label saved. update_task_fields recorded in Audit, with create_provider_value for <provider>." The change applies at the next read of every work item.
6. The footer reads "needs `task_fields.write` on <workspace>", **Cancel**, and **Save label** or **Add label**.

### States
On a phone it is a bottom sheet and the mapping fields stack. `node tools/check-tasks.mjs` flow 7 recolors New Feature and checks the color back in Intake.

## Status editor {#dialog/stedit}

The status editor names a status, sets its category, and maps it to each connected provider.

### Purpose
You add a status, rename one, or change which provider values file a work item under it. For a status you added, you also pick its category.

### Rationale
The category decides what the status means to Oxagen: only a work item in the open category can be sent (`docs/tasks-spec.md` §6.2). A built-in status (Open, Blocked, Closed) keeps its category, so no workspace can make Closed sendable or Open unsendable. A status the workspace adds takes any of the three. The name is free, because the name is what a person reads.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, category, mappings | `TSTATUS` | `tasks.field_settings`; `update_task_fields` | none |
| Create in a provider | `ipCan()`, `edCreate()` | `create_provider_value` | none |

### Logic
1. A Statuses row calls `openDialog('stedit', key)`, and **Add status** passes `new`. The title is "Edit <name>" or "Add a status".
2. **Category** offers open, blocked and closed. It is disabled for a built-in status, with the hint "A built-in status keeps its category."
3. **Mapped from** is `mapFields()` as in the label editor, with Create where the provider can hold a status: a GitHub label, a Linear workflow state, a Jira status, a ServiceNow state choice, a Salesforce Status value or a Zendesk custom status.
4. `fieldSave('status', key)` needs a name ("Name it first."), writes `TSTATUS`, keeps a built-in's category, closes back to Intake on Fields, and toasts "Saved. update_task_fields recorded in Audit." It adds ", with create_provider_value for <provider>" when a value is created.
5. Footer: **Cancel** and **Save status** (gold).

### States
On a phone it is a bottom sheet. A build gates the save on `task_fields.write`.

## Resolution editor {#dialog/resedit}

The resolution editor names a resolution and maps it to each connected provider.

### Purpose
You add a resolution, rename one, or map it to a provider's close reason. Where a provider lacks the value, you create it there on save.

### Rationale
Resolutions use the words of done, and a provider's own word stays in its mapping (`docs/tasks-spec.md` §6.3). The editor has no category, because every resolution describes a closed work item. Creating the value lets a provider with fewer close reasons carry Oxagen's: GitHub has no custom close reasons, so Oxagen creates a label (`label Won't do`), and Salesforce and Zendesk start with one closed state.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name and mappings | `TRES` | `tasks.field_settings`; `update_task_fields` | none |
| Create in a provider | `ipCan()`, `edCreate()`, `ipNew()` | `create_provider_value` | none |

### Logic
1. A Resolutions row calls `openDialog('resedit', key)`, and **Add resolution** passes `new`. The title is "Edit <name>" or "Add a resolution".
2. The body is the Name field and **Mapped from** (`mapFields()`). Linear with Create off shows "Creating one needs write. Edit the connection to ask for it."
3. **Create in GitHub** fills the GitHub field with `label Won't do` through `ipNew()`.
4. `fieldSave('resolution', key)` needs a name, writes `TRES`, closes back to Intake on Fields, and toasts "Saved. update_task_fields recorded in Audit, with create_provider_value for GitHub."
5. Footer: **Cancel** and **Save resolution** (gold).

### States
On a phone it is a bottom sheet. `node tools/check-tasks.mjs` flow 7 creates Won't do in GitHub and reads the mapping back in Intake.

## Person mapping {#dialog/pmap}

The person mapping dialog says which workspace member a provider account is, or leaves it not mapped.

### Purpose
You open it from a People row to map an account to a member, change the member, or clear the mapping. For a bot or a requester it shows what the account is and offers nothing to change.

### Rationale
Mapping says who an account is in Oxagen, and it grants nothing (`docs/tasks-spec.md` §7). The member's own roles decide what they may do, and only a signed-in member can certify or send. A bot is never mapped to a person, and its work items show its own handle. A requester is never mapped to a member, and Oxagen shows the requester by name on each work item. Both rules keep the record from pretending an account is someone it is not.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Account, email, match, state | `TPEOPLE` | `tasks.provider_people`; `list_provider_people` | none |
| Member list | `PEOPLE`, `MEMBERS` | the workspace's members | live |
| Save | `pmapSave()` | `map_provider_person` | none |

### Logic
1. A People row calls `openDialog('pmap', id)`. Title "Map <handle>", subtitle "<Provider> account".
2. The key-value list shows Account (logo, handle, display name), Email ("none shared" when there is none), and Match when one exists.
3. A bot shows only "This is a bot account." and **Close**. A requester shows only "This is a requester, the person who asked for the work." and **Close**.
4. Anyone else gets **Workspace member**, a select with "not mapped" first, then the members of this workspace or of every workspace, up to 40.
5. `pmapSave()` sets the member or clears it. The match stays `verified email` when it was one, and becomes `by hand` otherwise. It toasts "<handle> is <member>. map_provider_person recorded." or "<handle> is not mapped. map_provider_person recorded.", and closes back to Intake on People.
6. Footer: **Cancel** and **Save** (gold), or **Close** alone for a bot or requester.

### States
On a phone it is a bottom sheet. A build gates the save on `identity_map.write`, held by workspace owners by default.
