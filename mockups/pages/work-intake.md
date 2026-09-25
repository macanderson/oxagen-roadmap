# Intake

| | |
|---|---|
| Route | `#/a-intel/core-platform/work?intake=providers`, `?intake=fields` and `?intake=people` (app `/{org}/{ws}/work?intake=<part>`): the Intake dialog over Backlog, open on that part. Old routes that land here: the mockup’s `#/:org/:ws/tasks/providers`, `…/tasks/fields` and `…/tasks/people`, rewritten in place to `/work?intake=<part>` |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: Vocabulary › Work (Intake), Cuts (the Providers, Fields and People tabs of Tasks become the Intake dialog on Backlog), Work › Shipped today, D17. `docs/fleet-operations-routes.md` › Work. `docs/tasks-spec.md` §5 (connecting: §5.1 the wizard, §5.2 authentication, §5.3 reading, §5.4 writing back, §5.5 disconnecting, §5.6 creating values in a provider), §6 (the work item record), §7 (people), §12, §14 |
| Design | `mockups/src/wedge.js` → `DLG_EXT.intake`, `intakePart()`; `mockups/src/engine.js` → `tkProvTab()`, `tkFieldsTab()`, `tkPeopleTab()`, `tpConfirmAll()`, `ipzOpen()`, `ipzBody()`, `ipzRail()`, `ipzMapRow()`, `ipzFinish()`, `DLG_EXT.ipwz`, `DLG_EXT.ipoff`, `DLG_EXT.lbledit`, `DLG_EXT.stedit`, `DLG_EXT.resedit`, `DLG_EXT.pmap`, and `openDialog()` with `closeDialog()` for the return to Intake; data `mockups/fixtures/tasks.json` (`providers`, `statuses`, `resolutions`, `labels`, `people`) and the `IP_KIND`, `IPZ` and `TK_FIELDS` constants. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Work / Intake`: Loaded, Loaded · mobile |
| Audit | `work-intake.audit-prompt.md` |

## Job

How work items get into Oxagen from an issue tracker or a help desk, and what their words mean here. One dialog with three parts. **Trackers** holds the connections and what each may write back. **Fields** holds the thirteen fields and the statuses, resolutions and labels every provider maps onto, and creates a value a provider lacks. **People** says which provider account is which workspace member, and lets any of them stay not mapped. The six-step wizard connects a provider.

Six providers, in two groups. The issue trackers are GitHub, Linear and Jira. The help desks are ServiceNow, Salesforce Service Cloud and Zendesk. Each provider names the unit of work in its own word (issue, incident, case or ticket) and its staff-only note in its own word (comment, work note, internal comment or internal note), and every provider-specific string in the dialog uses that provider’s words.

## What is on the page

Component help for this page lives in `mockups/help/work-intake.md`, one section per part of the dialog and one per dialog it opens.

**The dialog.** It opens over Backlog from **Intake** in the Work header (on Trackers), from the address (`?intake=providers`, `fields` or `people`), and from the old Tasks tab addresses. Title “Intake”. Subtitle “2 issue trackers connected to Core platform.” What an imported issue becomes is in `mockups/help/work-intake.md`, Intake dialog. A segmented control (`role=group`, `aria-label` “Intake”) with **Trackers**, **Fields** and **People**, the current part pressed (`aria-pressed`). A close button (`aria-label` “Close”). Footer: **Connect an issue tracker** (plain; opens the wizard) and **Done** (gold; closes the dialog). The page behind is Backlog (`work-backlog.md`).

### Trackers

One card per connection, two to a row. Header: the provider’s logo as an SVG, its name, and the account (“GitHub organization **a-intel**”, “Linear workspace **Anderson Intelligence**”), with Connected or Needs attention as a dot and a word. Body, a key-value list in this order:

| Key | GitHub on the demo record | Linear on the demo record |
|---|---|---|
| Authorization | GitHub App installation 41829377 | OAuth 2.0 as an app actor |
| the scope, in the provider’s word | Repositories: `a-intel/platform`, `a-intel/billing`, `a-intel/mobile` | Teams: `PLAT · Platform`, `INFRA · Infrastructure` |
| Imports | open issues, and issues closed in the last 30 days | open issues, and issues completed in the last 30 days |
| Work items | 142 imported | 88 imported |
| Events | ok · 3,412 deliveries / 30d · 0 gaps | ok · 1,207 deliveries / 30d · 1 gap recovered |
| Last sync | 2 min ago | 4 min ago |
| Connected | 2026-09-02 by Marcus Bell | 2026-09-05 by Marcus Bell |

Then **Writes to <provider>**, four lines, each with an `on` or `off` badge, in the provider’s words: “Post the definition of done as a comment when a person certifies it” (on), “Post a link to the work order as a comment when it is sent” (on), “Move the status when a work order starts” (off), “Close the issue as Done when you accept the work” (off). A ServiceNow card reads “as a work note” and “Close the incident as Done”. Footer: **Sync now**, **Edit scope and fields** (opens the wizard at step 3), **Disconnect** (red; opens `ipoff`).

A dashed card for each provider not yet connected, with its logo, its name, one line and **Connect** (opens the wizard at step 2): Jira “Jira Cloud issues from the projects you choose.”, ServiceNow “Incidents from the assignment groups you choose.”, Salesforce “Service Cloud cases from the queues you choose.”, Zendesk “Tickets from the Zendesk groups you choose.”

**How imports work**, five numbered facts. Their full account is in `mockups/help/work-intake.md`, How imports work:

- events: “Each provider sends an event when an issue, incident, case, or ticket changes. oxagen reads it again and updates the work item.”
- reconcile: “Every 15 minutes oxagen lists what changed since the last read, so a missed event costs at most 15 minutes.”
- fields: “oxagen reads the thirteen fields on the Fields tab and nothing else. Custom fields are not read.”
- writes: “oxagen writes to a provider only what the switches on its card allow. It never edits a subject or a description, and it never replies to a requester.”
- creates: “oxagen creates a status, resolution, or label in a provider only when you choose Create for it. It never renames or deletes one.”

### Fields

Four panels. Each table has one mapping column per connected provider, in the order GitHub, Linear, Jira, ServiceNow, Salesforce, Zendesk, and none of the tables pages.

- **Work item fields**, with no subtext. Columns: Field · one per connected provider. Rows: Work item id (“tsk_ ULID, minted by oxagen”, spanning the provider columns), Number, Subject, Description, Labels, Owner, Created by, Created at, Updated by, Updated at, Closed at, Status, Resolution, each with the provider’s source field (GitHub `title`, `body`, “first assignee”, “actor of the latest timeline event”; Linear `workflow state`).
- **Statuses**, with no subtext, and **Add status**. Columns: Status (the badge, and “Added by you” on one the workspace added) · Category · one per connected provider. Rows: Open, In review (“Added by you”), Blocked, Closed. A row opens `stedit`.
- **Resolutions**, with no subtext, and **Add resolution**. Columns: Resolution · one per connected provider. Rows: Done, Won't do, Duplicate, Canceled, Other. A provider’s own word stays in its column (GitHub `state_reason completed`). A row opens `resedit`.
- **Labels**, with no subtext, and **Add label**. Columns: Label (color chip) · Color (swatch and hex) · Group · one per connected provider · Definition of done items (a dash titled “Coming soon”). Rows: P0, P1, P2, P3, Bug, New Feature, Improvement, Documentation, Test, Chore. A row opens `lbledit`.

A connected help desk gets its own column: ServiceNow’s Done reads `close code Solution provided`. No note sits under the panels. What each panel holds, how a change applies, and the later label templates are in `mockups/help/work-intake.md`, Work item fields, Statuses, Resolutions and Labels.

### People

- **Banner** while suggestions wait: the badge `2 suggested`, “2 matches need your confirmation”, “Each account’s verified email matches a workspace member.”, and **Confirm 2 matches** (**Confirm 1 match** for one).
- **People** panel, with no subtext. The shared list bar: search, facets State, Provider and Match, Rows, and a pager. Columns: Account (provider logo, handle in mono, display name) · Provider · Email · Workspace member (avatar and name, or a dash) · Match (`verified email`, `by hand`, or a dash) · State (`mapped`, `suggested`, `not mapped`, `bot`, `requester`). Only accounts of connected providers are listed. A row opens `pmap`. The demo lists ten: `mbell-ai`, `priya-n`, `amara-l` (mapped by hand), `jonas-okoro` (suggested), `vk-dev` (not mapped) and `dependabot[bot]` (bot) on GitHub, and `marcus`, `priya`, `ines.h` (suggested) and `support-rota` (not mapped) on Linear.
- No note sits under the table. What a mapping grants, and when a suggestion counts, are in `mockups/help/work-intake.md`, People and Suggested matches.

### The connection wizard (`ipwz`)

Title “Connect an issue tracker”, or “Edit <provider>” when editing, with no subtitle. A six-step rail (`role=list`): Tracker, Authorize, Scope, Fields, People, Review. The current step carries `aria-current="step"`, and a finished step shows a check. The footer opens with “needs `issue_provider.connect` on core-platform”.

1. **Tracker.** “Choose where the work items come from.” Two groups, **Issue trackers** (GitHub, Linear, Jira) and **Help desks** (ServiceNow, Salesforce, Zendesk). Each card shows the logo, the name, `connected` on one already connected, and its line (GitHub “Issues from the repositories the oxagen GitHub App can reach.”, Linear “Issues from the Linear teams you choose.”, and the four lines of the dashed cards). Footer **Cancel**, **Next** (gold, disabled until a provider is chosen).
2. **Authorize.** The logo and one paragraph on how this provider authorizes. GitHub: “Oxagen uses the GitHub App already installed on **a-intel** for your repositories. Importing issues needs one more permission, which an organization owner approves on github.com.” Linear: “oxagen asks Linear for a token that acts as the oxagen app. Anything it posts is signed by oxagen, not by you.” Jira: “oxagen asks Atlassian for a token on one Jira Cloud site. Jira Server and Data Center are not supported yet.” The help desks name their OAuth application and say the token acts within the authorizing account’s roles. Jira adds a **Site** field (`a-intel.atlassian.net`), ServiceNow **Instance**, Salesforce **My Domain**, Zendesk **Subdomain**.
   Every provider but GitHub carries the checkbox **Create values in <provider>**, on by default: “Needs <permission> too, so the Fields step can create the statuses, resolutions, and labels <provider> lacks.” The permission is Linear’s `write`, Jira’s `manage:jira-configuration`, ServiceNow’s `personalize_choices role`, Salesforce’s `Customize Application` or Zendesk’s `admin role`. Turning it off drops that row from the table below and clears the authorization.
   **What oxagen needs**: Permission · Access · Why, with the provider’s scopes (Jira: `read:jira-work`, `read:jira-user`, `write:jira-work`, `offline_access`, and `manage:jira-configuration` marked `admin`, “A Jira admin approves it.”). **What it still cannot do**, on the same step: edit (“a subject or a description, or delete an issue”), act as you (“every write is signed by the oxagen app”, GitHub and Linear) or act as anyone else (“every write appears under the account that authorizes, so authorize with one made for oxagen”, Jira and the help desks), reply to a requester (“every work note oxagen posts is one only staff can read”, help desks), read more (“than the projects you choose next”), assign (“an issue to anyone in Jira”), and rename or delete (“a status, resolution, or label, including one oxagen created”).
   The authorize button (**Request the Issues permission**, **Authorize with Linear**, **Authorize with Atlassian**, **Authorize with ServiceNow**, **Authorize with Salesforce**, **Authorize with Zendesk**) reads “Waiting for <provider>…” while it waits, then turns into the banner `authorized`, “<provider> is authorized”, with the provider’s line (Jira: “Authorized by Marcus Bell for a-intel.atlassian.net. oxagen refreshes the token on its own.”). No note follows. Where the token is kept is in `mockups/help/work-intake.md`, Connection wizard. Footer **Back**, **Next** (disabled until authorized).
3. **Scope.** The provider’s scope as checkboxes with the defaults checked (“Projects on a-intel.atlassian.net”: OPS, PLAT checked, SEC not). **Import**, a select of three filters in the provider’s unit (“open issues, and issues closed in the last 30 days”, “open issues only”, “every issue”), and the estimate “About 64 work items on the first read.” Jira adds **JQL filter** (placeholder “priority in (Highest, High)”, hint “Optional. Narrows what the chosen projects import.”). Footer **Back** (disabled when editing), **Next** (disabled with nothing checked).
4. **Fields.** “oxagen.assistant suggested each mapping from the values Jira returned. Change any of them. Choose Create to add an Oxagen value to Jira, or Add to bring a Jira value into Oxagen.” What a value mapped to nothing does is in `mockups/help/work-intake.md`, Connection wizard. A note on what this provider creates and who approves it (Jira: “oxagen creates statuses and resolutions with manage:jira-configuration. A new status reaches a project once a Jira admin adds it to the project’s workflow. A Jira label exists once an issue carries it, so oxagen adds a label the first time it sets one.”), with the running count “**1 to create in Jira.**” Three tables, **Statuses**, **Resolutions** and **Labels**: oxagen · <Provider> · Source. Each select offers “nothing”, the provider’s values, and **Create “<value>” in <provider>** where the connection can create one. Source reads `suggested`, `chosen`, `create`, or a dash. Under each table, **Only in <provider>** lists **Add “<value>”** for each provider value no mapping uses (Jira: **Add “security”**); a value already mapped is not offered, and an added value appears as a row marked `added` with **Remove**. Then **Writes to <provider>**: the four switches in the provider’s words, certify and send on, status and close off. ServiceNow’s close switch adds “Resolving an incident runs the instance’s notifications, which by default email the caller.”, and Zendesk’s “Solving a ticket runs Zendesk’s triggers, which by default email the requester.” No hint follows the switches.
5. **People.** “These accounts appear on the work items in scope. Each one whose verified email matches a workspace member is suggested. Confirm, change, or leave it not mapped.” Account · Email · Workspace member: a select (`aria-label` “Member for <account>”) with “Not mapped” first, or for a bot or requester its badge and “never mapped”. Running count: “3 mapped, 1 not mapped.” What a mapping grants and how a requester is shown are in `mockups/help/work-intake.md`, Connection wizard.
6. **Review.** Provider, Authorization, the scope, Import, Fields (“4 statuses, 5 resolutions, and 10 labels mapped. 1 to create in Jira.”), People (“3 mapped, 1 not mapped”), Writes (“certify, send”). Then **When you connect**, numbered: “Oxagen stores the token and reads every work item in scope.”, “Oxagen creates the 1 value you chose in Jira, each one a governed action named create_provider_value.” (only when a value is to be created), “oxagen.assistant drafts a definition of done for each open work item.”, “Every draft waits for a person.”, “Nothing is sent to an agent.” Why each holds is in `mockups/help/work-intake.md`, Connection wizard. Footer **Back**, **Connect Jira** (gold), or **Save** when editing.

### Dialogs opened from Intake

- **`ipoff`**: “Disconnect GitHub?”. “Oxagen stops reading GitHub and revokes its token there.” Note: “The 10 work items it imported stay, with the values last read and marked disconnected.” What else stays, and what reconnecting does, are in `mockups/help/work-intake.md`, Disconnect dialog. Footer **Keep it connected**, **Disconnect it** (red).
- **`lbledit`**: “Edit P0” or “Add a label”. Name, Group (Priority, Type, Area), **Color**: twelve swatches (`aria-label` “Color #D6455E”, `aria-pressed` on the chosen one; no gold swatch), a hex field (`aria-label` “Hex color”) and a live chip preview, with no hint. **Mapped from**: one field per connected provider, each with **Create in <provider>** where the connection can create one, or “Creating one needs write. Edit the connection to ask for it.” (the provider’s permission named). The editor has no Definition of done items field. The later label templates, and how Oxagen sets a label’s color in a tracker, are in `mockups/help/work-intake.md`, Label editor. Footer “needs `task_fields.write` on core-platform”, **Cancel**, **Save label** or **Add label**.
- **`stedit`**: “Edit Blocked” or “Add a status”. Name, Category (open, blocked, closed; disabled for a built-in status, with “A built-in status keeps its category.”, otherwise with no hint), **Mapped from**. What a category means is in `mockups/help/work-intake.md`, Status editor. Footer **Cancel**, **Save status**.
- **`resedit`**: “Edit Won't do” or “Add a resolution”. Name and **Mapped from**. Footer **Cancel**, **Save resolution**.
- **Create in <provider>** turns into the disabled “Created when you save” and fills the mapping field with the value’s name there (GitHub: `label Won't do`).
- **`pmap`**: “Map <handle>”, subtitle “<Provider> account”. Account, Email (“none shared” when there is none), Match. Then **Workspace member**, a select with “not mapped” first, and no note. Footer **Cancel**, **Save**. A bot reads only “This is a bot account.” and **Close**. A requester reads only “This is a requester, the person who asked for the work.” and **Close**. What a mapping grants, and why a bot or a requester is never mapped, are in `mockups/help/work-intake.md`, Person mapping.

### Returning to Intake

A dialog opened from inside Intake returns to Intake, on the part it was opened from, when it closes: **Cancel**, the close button, Escape, or its own save (`lbledit`, `stedit`, `resedit`, `pmap`, `ipoff`). `openDialog()` records the part as `S.dlgBack`, and `closeDialog()` reopens Intake on it. The wizard does the same: **Cancel** on step 1, the close button and Escape return to Intake, and **Save** on an edit returns to the part it came from. Connecting a new provider returns to Intake on Providers, where the new card now sits.

**Toasts.** Sync now: “GitHub sync queued. Recorded in Audit as sync_issue_provider.” Connect (gold): “Jira connected. connect_issue_provider recorded and create_provider_value for the value oxagen creates. Importing 2 projects.” Save: “<provider> saved. update_issue_provider recorded.” Disconnect: “GitHub disconnected, and its token revoked. Recorded in Audit as disconnect_issue_provider.” A label: “Label saved. update_task_fields recorded in Audit, with create_provider_value for GitHub.” A status or resolution: “Saved. update_task_fields recorded in Audit.” A mapping: “vk-dev is Marcus Bell. map_provider_person recorded.” or “vk-dev is not mapped. map_provider_person recorded.” Confirm all: “Matches confirmed. map_provider_person recorded once per account.”

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Checked against `macanderson/oxagen` `origin/main` at `1ba160dbc`. Nothing in the repository stores an intake connection (wedge spec, Work › Shipped today), so every part of the dialog is future-only. The rows marked 🟡 or ✅ name the code paths a build would use.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Connection cards: account, scope, imports, work item count, events, last sync, connected by, health | `IPROV` (`providers`) | `tasks.issue_providers`; `list_issue_providers`, `get_issue_provider` | No intake connection. The nearest record is a data connector’s connection (`ingestion.source_connections`, `packages/database/src/schema/ingestion.ts:28-29`) with its webhooks (`ingestion.webhook_subscriptions`, `:150-151`), for GitHub, Linear, Zendesk and Salesforce. It reads into the graph and imports no work item | ❌ |
| Authorization on a card | `IPROV[].auth` | the provider’s OAuth or App grant | The GitHub App installation ships (`ingestion.github_installations`, `packages/database/src/schema/ingestion.ts:407-408`). `get_run_issue_providers` reads whether the App is connected and lists Linear connections and teams, and `start_issue_authorization` starts a Linear grant, both for run follow-through only (`packages/oxagen/src/contracts/run.issue.providers.get.ts:4`, `run.issue.authorization.begin.ts:4`). No Jira or ServiceNow grant | 🟡 |
| Writes to a provider (four switches) and their writes | `IPROV[].writeback` | `update_issue_provider`; the write-back governed actions | none. Every connector is read-only | ❌ |
| Sync now, Edit scope and fields, Disconnect | `act()`, `ipzOpen()`, `ipOff()` | `sync_issue_provider`, `update_issue_provider`, `disconnect_issue_provider` | none | ❌ |
| Unconnected provider cards | `IP_KIND` | the provider catalog | GitHub (`packages/ingestion/src/connectors/github/index.ts:126`), Linear (`linear/index.ts:81`), Zendesk (`zendesk/index.ts:167-168`) and Salesforce (`salesforce/index.ts:49-50`) connectors exist, read-only. No Jira or ServiceNow connector | ❌ |
| Work item fields (the thirteen, per provider) | `TK_FIELDS` | the field mapping of `tasks-spec.md` §6.1 | none | ❌ |
| Statuses, resolutions, labels and colours | `TSTATUS`, `TRES`, `TLABELS` | `tasks.field_settings`; `get_task_fields`, `update_task_fields` | none | ❌ |
| Label definition-of-done items (described in component help, not drawn) | none | `.oxagen/dod/labels/<label>.toml` | none | ❌ |
| People: accounts, members, match, state | `TPEOPLE` (`people`) | `tasks.provider_people`; `list_provider_people`, `map_provider_person` | none. Sign-in accounts, a suggestion source, ship in `auth.accounts` (`packages/database/src/schema/auth.ts:155`) | ❌ |
| Wizard, Authorize: the token and where it is kept | `IPZ[].perms`, `S.ipz.authed` | the workspace credential store | The store ships: `packages/plugins/src/credentials/workspace-credential.ts:1-3`, envelope-encrypted into `mcp.credentials` (`packages/database/src/schema/mcp.ts:82-83`). Nothing requests the issue scopes of `tasks-spec.md` §5.2 | 🟡 |
| Wizard, Scope and Import | `IPZ[].scope`, `ipzFilters()` | the connection’s scope and filter | A connector connection takes repositories or organizations (`packages/ingestion/src/connectors/github/index.ts:18-25`). No import filter | ❌ |
| Wizard, Fields: suggested mappings | `IPZ[].values`, `ipzSuggest()` | a value-mapping suggestion | `suggest_connection_mappings` suggests record-type to entity-type mappings, not status or label values (`packages/oxagen/src/contracts/connection.mappings.suggest.ts:5`) | ❌ |
| Create a value in a provider | `IPZ[].creates`, `ipzApply()` | `create_provider_value` | none | ❌ |
| Wizard, People | `IPZ[].people` | `list_provider_people`, `map_provider_person` | none | ❌ |
| Connect | `ipzFinish()` | `connect_issue_provider` | none | ❌ |

## Future-only fields

The Intake dialog carries no `data-future` mark, and the catalog gives it no future story (`mockups/catalog.mjs`: `work-intake` has no `future: true`). Every field in it is future-only all the same. A build renders the dialog’s values as `not recorded` and leaves out each control whose capability does not exist, until the contracts in Backend gaps ship. Today the nearest surface in `apps/app` is the issue connections panel on the Run’s Issues tab (`apps/app/src/features/run/issues-tab.tsx:274`, `apps/app/src/features/run-outcomes/connections.tsx`), which reads `get_run_issue_providers` for run follow-through.

## Functionality

- The dialog opens on the part the address names and defaults to Trackers. Switching parts keeps the dialog open.
- A connection is a row, not a file: it holds a credential and an identity map (`tasks-spec.md` §6.6). Every write in the dialog is a governed action recorded in Audit.
- The token goes to the workspace credential store, encrypted under the organization’s key. Nobody can read it back, including the person who connected it. A write without a token fails closed.
- Each provider’s wizard says, on the step that asks for the token, what the token still cannot do.
- A suggestion is not a mapping until a person confirms it. **Confirm <N> matches** confirms every suggestion at once. A bot and a requester are never mapped.
- Oxagen creates a value in a provider only when a person chooses Create for it, with the connection’s token, as `create_provider_value`. It never renames or deletes a provider value, including one it created. A created value takes the Oxagen name, and a tag or a Jira label holds no spaces (`Won't do` becomes `wont_do`).
- Oxagen sets a label’s colour in a provider once, when it creates the label there, and never changes it after.
- A status belongs to one of three categories. When a work item matches more than one, `closed` wins over `blocked`, and `blocked` wins over `open`. Only an `open` work item can be sent.
- Resolutions use the words of done: Done, Won't do, Duplicate, Canceled, Other. A provider’s own word appears only in its mapping column.
- Disconnecting revokes the token at the provider and deletes it from the store. The imported work items stay, with their last-read values, marked disconnected. Connecting the same account again reads them back into the same ids.
- `node tools/check-tasks.mjs` walks flows 1 (connect Jira from Intake, create one value, leave one account not mapped), 1b (connect ServiceNow with creation off) and 7 (a label colour and a resolution created in GitHub, back in Intake).

## States

Loaded only. This change designs the loaded state. The build uses the shell’s standard loading, error, empty and denied panels until they are designed.

Within loaded, a workspace with no connection shows the six dashed provider cards and “0 issue trackers connected to <workspace>.” in the subtitle.

## Mobile

The page behind keeps the phone shell: the thumb bar holds Work (lit), Agents, Tools, Spend and More, and More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The dialog is a bottom sheet with a drag handle and full-width footer buttons, **Done** first. Provider cards stack one per row. The Fields tables keep their columns and wrap their text. The People table becomes labelled cards. The wizard is a bottom sheet too: its step rail wraps onto a second line, and the permissions table becomes labelled cards. Touch targets are at least 44 px and inputs 16 px. Nothing scrolls sideways.

## Permissions

The design names these, from `tasks-spec.md` §14. None exists in `packages/iam` today.

- Read: `work.read` (the design’s rename of `task.read`)
- Writes, each a governed action recorded in Audit: `issue_provider.connect` (connect, edit, sync, disconnect, and the **Create values** switch), `task_fields.write` (statuses, resolutions, labels, colours, mappings, and creating a value in a provider), `identity_map.write` (map an account)

## Backend gaps this page depends on

- The intake connection record and its capabilities (`connect_issue_provider`, `list_issue_providers`, `get_issue_provider`, `update_issue_provider`, `sync_issue_provider`, `disconnect_issue_provider`; `tasks-spec.md` §12), in `tasks.issue_providers`
- The issue scopes and write grants of §5.2 for each provider, and Jira and ServiceNow connectors
- Field settings (`get_task_fields`, `update_task_fields`) in `tasks.field_settings`, and `create_provider_value` with each provider’s create grant (§5.6)
- The people map (`list_provider_people`, `map_provider_person`) in `tasks.provider_people`
- The write-back governed actions of §5.4
- A migration labelled `migration-required` for the `tasks.*` tables (§13)

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. Intake shows neither.
- A Steering Source and a SteeringFrame are never shown as each other. The label definition-of-done templates will be files (`.oxagen/dod/labels/`), and they are sources once they ship.
- Nothing in Intake infers. A mapping the assistant suggested is labelled `suggested` until a person confirms it or picks another value.
- No person is scored or ranked.
- Every enforcement claim states its scope. The wizard says what the token cannot do, and a write-back switch names what it writes.
- Headers are rollups of the rows beneath them: the subtitle’s connection count is the number of cards, and a card’s work item count is the items it imported.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: **Done**, or the gold button of the dialog or wizard step on top.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- The token is never shown, copied, or read back.
- A suggestion is never a mapping until a person confirms it. A bot is never mapped, and a requester is never mapped.
- An account left not mapped is shown as itself.
- Oxagen never edits a subject or a description and never replies to a requester.
- Oxagen creates a value in a provider only when a person chooses Create for it, and never renames or deletes one.
- Every provider is shown with its own logo, and none is the default.
