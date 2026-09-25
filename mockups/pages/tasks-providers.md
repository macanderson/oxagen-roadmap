# Issue trackers

| | |
|---|---|
| Route | `#/a-intel/core-platform/tasks/providers`, `…/tasks/fields`, `…/tasks/people` |
| Scope | workspace |
| Spec | `docs/tasks-spec.md` §5 (connecting, and §5.6 creating values in a provider), §6 (the task record), §7 (people) |
| Design | `mockups/src/engine.js` → `tkProvTab()`, `tkFieldsTab()`, `tkPeopleTab()`, `ipzOpen()`, `ipzBody()`, `DLG_EXT.ipwz`, `DLG_EXT.ipoff`, `DLG_EXT.lbledit`, `DLG_EXT.stedit`, `DLG_EXT.resedit`, `DLG_EXT.pmap`; data `mockups/fixtures/tasks.json` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / Workspace / Tasks · Providers`, `Tasks · Fields`, `Tasks · People`: one story per state, desktop and mobile |
| Audit | `tasks-providers.audit-prompt.md` |
| Check | `node tools/check-tasks.mjs` (flows 1, 1b, and 7) |

## Job

How tasks get into Oxagen from an issue tracker or a help desk, and what their words mean here. Trackers holds the connections and what each may write back. Fields holds the thirteen fields and the statuses, resolutions, and labels every tracker maps onto, and creates a value a tracker lacks. People says which tracker account is which workspace member, and lets any of them stay not mapped.

Six providers in two groups. The issue trackers are GitHub, Linear, and Jira. The help desks are ServiceNow, Salesforce Service Cloud, and Zendesk. Each provider names the unit of work in its own word (issue, incident, case, or ticket) and its staff-only comment in its own word (comment, work note, internal comment, or internal note), and every string on these tabs uses that provider's words.

The header, the tabs, and the page states are those of `tasks.md`. On all three tabs the gold action is **Connect an issue tracker**.

## What is on the page

### Trackers

- One card per connection, in a two-column grid. Header: the provider's logo as an SVG (GitHub, Linear, Jira, ServiceNow, Salesforce, Zendesk), its name, the account ("GitHub organization **a-intel**", "Linear workspace **Anderson Intelligence**"), and Connected or Needs attention. Body, as a key-value list: Authorization, Repositories / Teams / Projects, Imports (the filter), Tasks ("142 imported"), Events ("ok · 3,412 deliveries / 30d · 0 gaps"), Last sync, Connected (date and person). Then **Writes to <provider>**: four lines, each with an On or Off badge, in the provider's words: "Post the definition of done as a comment when a person certifies it", "Post a link to the work order as a comment when it is sent", "Move the status when a work order starts", "Close the issue as Done when you accept the work". ServiceNow reads "as a work note" and "Close the incident as Done". Footer: **Sync now**, **Edit scope and fields** (opens the wizard at step 3), **Disconnect** (red; opens `ipoff`).
- A dashed card for each provider not yet connected, with its logo, its name, one line ("Jira Cloud issues from the projects you choose.", "Incidents from the assignment groups you choose.", "Service Cloud cases from the queues you choose.", "Tickets from the Zendesk groups you choose."), and **Connect** (opens the wizard on that provider's step 2).
- **How imports work**: events ("when an issue, incident, case, or ticket changes"), reconcile (every 15 minutes), fields (the thirteen and nothing else; custom fields are not read), writes (only what the switches allow; never a subject or a description, and never a reply to a requester), creates ("Oxagen creates a status, resolution, or label in a provider only when you choose Create for it. It never renames or deletes one.").

### Fields

Four panels, each a table that does not page. Every table has one mapping column per connected provider, so a help desk gets its own column once it is connected (ServiceNow's Done row reads `close code Solution provided`).

- **Task fields**, "Thirteen fields, read the same way from every provider.": Field · one column per connected provider, with the rows of spec §6.1.
- **Statuses**, "Every status belongs to one of three categories: open, blocked, or closed.", **Add status**: Status (badge; `added` on one the workspace added) · Category · one column per connected provider. A row opens `stedit`.
- **Resolutions**, "A closed task carries one resolution.", **Add resolution**: Resolution · one column per connected tracker. Done, Won't do, Duplicate, Canceled, Other. GitHub's `not_planned` maps to Canceled when the issue has the label canceled, and to Won't do otherwise. A task closed as `Done` carries the status `Closed`, and the close write-back closes the task in the provider as `Done`. A provider's own word stays in its mapping column (Jira's `Done, Fixed`, Zendesk's `Solved`). A row opens `resedit`.
- **Labels**, "A label has a color and a mapping to each tracker's own labels, priorities, types, or tags.", **Add label**: Label (color chip) · Color (swatch and hex) · Group · one column per connected tracker · Definition of done items (a dash titled "Coming soon"). P0, P1, P2, P3, Bug, New Feature, Improvement, Documentation, Test, Chore. A row opens `lbledit`.
- Note: field settings are workspace settings, each change a governed action in Audit applied to the next read; "A value a tracker lacks can be created there from its editor."

### People

- **Banner** while suggestions wait: `N suggested`, "N matches need your confirmation", "Each account's verified email matches a workspace member. A match counts only when a person confirms it.", **Confirm N matches**.
- **People** panel, "Accounts in your trackers and the workspace member each one maps to.": Account (tracker logo, handle, display name) · Tracker · Email · Workspace member (avatar and name, or a dash) · Match (`verified email`, `by hand`, or a dash) · State (Mapped, Suggested, Not mapped, Bot). Only accounts of connected providers are listed. A row opens `pmap`.
- Note: "Mapping says who an account is in Oxagen and grants nothing. An account left not mapped still owns and creates tasks under its own handle. Only a signed-in member can certify a definition of done or send a work order, whatever the mapping says."

## The connection wizard (`ipwz`)

Title "Connect an issue tracker" (or "Edit <tracker>"), subtitle "Import tasks from an issue tracker or a help desk". A six-step rail with the current step marked `aria-current="step"`. Footer "needs `issue_provider.connect` on core-platform".

1. **Tracker**: "Choose where the tasks come from. You can connect more than one, and more than one account of the same tracker." Six cards with the providers' logos in two groups, **Issue trackers** (GitHub, Linear, Jira) and **Help desks** (ServiceNow, Salesforce, Zendesk), one line each, `connected` on those already connected. **Next** waits for a choice.
2. **Authorize**: the logo and one paragraph on how this provider authorizes (GitHub: the App already installed on a-intel and one more permission an organization owner approves; Linear: a token that acts as the Oxagen app; Jira: one Jira Cloud site, with Server and Data Center not supported yet; ServiceNow: an OAuth application an admin registers on the instance, acting within the roles of the account that authorizes; Salesforce: a connected app, acting within the account's profile and permission sets; Zendesk: one account, acting as the staff account that authorizes). Jira adds a **Site** field, ServiceNow an **Instance** field, Salesforce a **My Domain** field, and Zendesk a **Subdomain** field. Every provider but GitHub carries the switch **Create values in <provider>**, on by default, with "Needs <permission> too, so the Fields step can create the statuses, resolutions, and labels <provider> lacks." The permission is Linear's `write`, Jira's `manage:jira-configuration`, ServiceNow's `personalize_choices` role, Salesforce's Customize Application, or a Zendesk admin role; GitHub's Issues permission already covers the labels it creates. Turning the switch off drops that row from the table. **What Oxagen needs**: Permission · Access · Why, with the scopes of spec §5.2, the admin row marked `admin` and naming who approves it. **What it still cannot do**: edit, act as you (or act as anyone else, where writes carry the authorizing account), read more, assign, rename or delete a status, resolution, or label (including one Oxagen created), and for a help desk "reply to a requester". The authorize button (**Request the Issues permission**, **Authorize with Linear**, **Authorize with Atlassian**) turns into a banner, `authorized`, when the provider answers. The note on the credential store. **Next** waits for authorization.
3. **Scope**: the repositories, teams, projects, assignment groups (ServiceNow), case queues (Salesforce), or groups (Zendesk) as checkboxes with the defaults checked; **Import** (the three filters, in the provider's unit: "open incidents, and incidents closed in the last 30 days") with the estimate of tasks on the first read; for Jira a **JQL filter**. **Next** waits for one checked.
4. **Fields**: "oxagen.assistant suggested each mapping from the values <provider> returned. Change any of them. Choose Create to add an Oxagen value to <provider>, or Add to bring a <provider> value into Oxagen. A value that maps to nothing is kept on the task as it is in <provider> and read as nothing." Then one line on what this provider can create and who must approve it (spec §5.6): GitHub creates every value as a label; Linear creates workflow states and labels; a new Jira status reaches a project once a Jira admin adds it to the workflow; ServiceNow adds choices and never a priority; a new Salesforce Status reaches a case once an admin adds it to the support process; Zendesk adds tags, and custom statuses need an admin account. Three tables (Statuses, Resolutions, Labels): Oxagen (the badge or chip) · <Provider> (a select of the provider's values, "nothing", and **Create “<value>” in <provider>** where the connection can create it) · Source (`suggested`). Below the tables, **Only in <provider>** lists each provider value no Oxagen value maps to, with **Add “<value>”**; a mapped value is not offered. A running count reads "N to create in <provider>". Then **Writes to <provider>**: the four switches in the provider's words, certify and send on, status and close off, the close switch reading "Close the <unit> as Done when you accept the work". ServiceNow adds "Resolving an incident runs the instance's notifications, which by default email the caller." The footer line: "Each write is a governed action, made with the connection's token and recorded in Audit."
5. **People**: Account · Email · Workspace member (a select of members and "not mapped"; a bot shows `bot`, "never mapped"), and the running count "N mapped, N not mapped. Mapping grants nothing. …" A help desk adds "A requester is the person who asked for the work. Oxagen shows a requester by name and never maps one."
6. **Review**: Provider, Authorization, the scope, Import, Fields (with "N to create in <provider>" and `create_provider_value` when a value is to be created), People (the same count), Writes; then **When you connect**, four facts ending "Nothing is sent to an agent. A work order is the only way work reaches one." **Connect <provider>** (gold), or **Save** when editing.

Connecting creates each value you chose (`create_provider_value`), adds the card to Trackers, adds the accounts to People, and toasts "<provider> connected. connect_issue_provider recorded. …".

## Dialogs

- **`ipoff`**: "Disconnect <provider>?". Oxagen stops reading, revokes the token there, and deletes it from the credential store; the imported tasks stay with their last-read values, marked disconnected; certified definitions of done and sent work orders are unchanged; connecting again reads the same tasks back into the same task ids. Footer **Keep it connected**, **Disconnect it** (red).
- **`lbledit`**: Name, Group (Priority, Type, Area), **Colour** (twelve swatches, a hex field, and a live chip preview; no gold swatch), "The colour is Oxagen's. Oxagen sets a label's colour in a provider once, when it creates the label there, and never changes it after.", **Mapped from** one field per connected provider, each with **Create in <provider>**, and **Definition of done items** as a `later` banner: "A label will carry definition-of-done items". Footer "needs `task_fields.write`", **Cancel**, **Save label** or **Add label**.
- **`stedit`**: Name, Category (open, blocked, closed; disabled for a built-in status), "The category decides what the status means: only an open task can be sent.", a mapping per connected provider. **`resedit`**: Name and a mapping per connected provider, footer **Save resolution**.
- **Create in <provider>**: every mapping field in `stedit`, `resedit`, and `lbledit` carries it. On a connection without the permission the field says "Creating one needs write. Edit the connection to ask for it." (the permission named is the provider's). Saving with Create chosen toasts "create_provider_value for <provider>", and the mapping column names the value Oxagen created (GitHub: `label Won't do`).
- **`pmap`**: the account (logo, handle, name), Email, Match, then **Workspace member** with "not mapped" first, and the note that mapping grants nothing. A bot shows only "A bot is never mapped to a person" and **Close**.

## Data sources

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Connections | `IPROV` | `tasks.issue_providers`, token in `mcp.credentials` | the workspace credential store exists; GitHub and Linear connectors read into the graph; no Jira and no help desk | 🟡 |
| Scopes and authorization | `IPZ` | the provider's OAuth or App flow | GitHub App installation, Linear OAuth `read`; no Jira and no help desk | 🟡 |
| Mapping suggestions | `IPZ[].values` | `suggest_connection_mappings` | exists for connectors | 🟡 |
| Statuses, resolutions, labels, colours | `TSTATUS`, `TRES`, `TLABELS` | `tasks.field_settings` | nothing | ❌ |
| Values created in a provider | `IPZ[].create` | `create_provider_value` with the connection's token | nothing | ❌ |
| People | `TPEOPLE` | `tasks.provider_people` | nothing; `auth.accounts` holds sign-in accounts | ❌ |

## States

As `tasks.md`: loaded (GitHub and Linear connected; Jira, ServiceNow, Salesforce, and Zendesk offered), empty ("No issue tracker is connected to this workspace"), loading, error (`503 issue_index_unavailable`), access denied (`task.read on core-platform`).

## Mobile

As `tasks.md`. Provider cards stack; the wizard is a bottom sheet whose rail scrolls sideways within itself; the mapping tables keep their three columns and wrap their text.

## Permissions

- Read: `task.read`
- Writes, each a governed action in Audit: `issue_provider.connect` (connect, edit, sync, disconnect, and the **Create values** switch), `task_fields.write` (statuses, resolutions, labels, colours, mappings, and creating a value in a provider, recorded as `create_provider_value`), `identity_map.write` (map an account)

## Rules every build of this page must keep

- The wizard says what the token still cannot do on the same step that asks for it.
- The token is never shown, copied, or read back.
- A suggestion is never a mapping until a person confirms it. A bot is never mapped.
- An account left not mapped is shown as itself.
- Oxagen never edits a subject or a description and never replies to a requester.
- Oxagen creates a value in a provider only when a person chooses Create for it, and never renames or deletes one. It sets a label's colour there once, when it creates the label, and never changes it after.
- Resolutions use the words of done: Done, Won't do, Duplicate, Canceled, Other. A provider's own word appears only in its mapping column.
- Plain nouns. Exactly one gold action per screen. State reads as a dot and a word.
