# Issue providers

| | |
|---|---|
| Route | `#/a-intel/core-platform/tasks/providers`, `…/tasks/fields`, `…/tasks/people` |
| Scope | workspace |
| Spec | `docs/tasks-spec.md` §5 (connecting), §6 (the task record), §7 (people) |
| Design | `mockups/src/engine.js` → `tkProvTab()`, `tkFieldsTab()`, `tkPeopleTab()`, `ipzOpen()`, `ipzBody()`, `DLG_EXT.ipwz`, `DLG_EXT.ipoff`, `DLG_EXT.lbledit`, `DLG_EXT.stedit`, `DLG_EXT.resedit`, `DLG_EXT.pmap`; data `mockups/fixtures/tasks.json` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / Workspace / Tasks · Providers`, `Tasks · Fields`, `Tasks · People`: one story per state, desktop and mobile |
| Audit | `tasks-providers.audit-prompt.md` |
| Check | `node tools/check-tasks.mjs` (flows 1 and 7) |

## Job

How tasks get into Oxagen and what their words mean here. Providers holds the connections and what each may write back. Fields holds the thirteen fields and the statuses, resolutions, and labels every provider maps onto. People says which provider account is which workspace member, and lets any of them stay not mapped.

The header, the tabs, and the page states are those of `tasks.md`. On all three tabs the gold action is **Connect an issue provider**.

## What is on the page

### Providers

- One card per connection, in a two-column grid. Header: the provider's logo as an SVG (GitHub, Linear, Jira), its name, the account ("GitHub organization **a-intel**", "Linear workspace **Anderson Intelligence**"), and `syncing` or `needs attention`. Body, as a key-value list: Authorization, Repositories / Teams / Projects, Imports (the filter), Tasks ("142 imported"), Events ("ok · 3,412 deliveries / 30d · 0 gaps"), Last sync, Connected (date and person). Then **Writes to <provider>**: four lines, each with an `on` or `off` badge: post the definition of done when a person certifies it, post a link when a work order is sent, move the status when a work order starts, close the task as Fixed when you accept the work. Footer: **Sync now**, **Edit scope and fields** (opens the wizard at step 3), **Disconnect** (red; opens `ipoff`).
- A dashed card for each provider not yet connected, with its logo, "Import issues from the <repositories / teams / projects> you choose.", and **Connect** (opens the wizard on that provider's step 2).
- **How imports work**: events, reconcile (every 15 minutes), fields (the thirteen and nothing else; custom fields are not read), writes (only what the switches allow; never a subject or a description).

### Fields

Four panels, each a table that does not page.

- **Task fields**, "Thirteen fields, read the same way from every provider.": Field · GitHub · Linear · Jira, with the rows of spec §6.1.
- **Statuses**, "Every status belongs to one of three categories: open, blocked or closed.", **Add status**: Status (badge; `added` on one the workspace added) · Category · GitHub · Linear · Jira. A row opens `stedit`.
- **Resolutions**, "A closed task carries one resolution.", **Add resolution**: Resolution · GitHub · Linear · Jira. Fixed, Won't fix, Duplicate, Cancelled, Other. A row opens `resedit`.
- **Labels**, "A label has a colour and a mapping to each provider's own labels, priorities or issue types.", **Add label**: Label (colour chip) · Colour (swatch and hex) · Group · GitHub · Linear · Jira · Definition of done items (`later`). P0, P1, P2, P3, Bug, New Feature, Improvement, Documentation, Test, Chore. A row opens `lbledit`.
- Note: field settings are workspace settings, each change a governed action in Audit applied to the next read; later a label carries definition-of-done items, and those templates live in `.oxagen/` as files.

### People

- **Banner** while suggestions wait: `N suggested`, "N matches wait on you", "Each account's verified email equals a workspace member's. A match counts only when a person confirms it.", **Confirm all N**.
- **People** panel, "Accounts in your providers and the workspace member each one is.": Account (provider logo, handle, display name) · Provider · Email · Workspace member (avatar and name, or a dash) · Match (`verified email`, `by hand`, or a dash) · State (`mapped`, `suggested`, `not mapped`, `bot`). Only accounts of connected providers are listed. A row opens `pmap`.
- Note: "Mapping says who an account is in Oxagen and grants nothing. An account left not mapped still owns and creates tasks under its own handle. Only a signed-in member can certify a definition of done or send a work order, whatever the mapping says."

## The connection wizard (`ipwz`)

Title "Connect an issue provider" (or "Edit <provider>"), subtitle "Import tasks from GitHub, Linear or Jira". A six-step rail with the current step marked `aria-current="step"`. Footer "needs `issue_provider.connect` on core-platform".

1. **Provider**: three cards with the providers' logos, one line each, `connected` on those already connected. **Next** waits for a choice.
2. **Authorize**: the logo and one paragraph on how this provider authorizes (GitHub: the App already installed on a-intel and one more permission an organization owner approves; Linear: a token that acts as the Oxagen app; Jira: one Jira Cloud site, with Server and Data Center not supported yet). Jira adds a **Site** field. **What Oxagen asks for**: Permission · Access · Why, with the scopes of spec §5.2. **What it still cannot do**: edit, act as you, read more, assign. The authorize button (**Request the Issues permission**, **Authorize with Linear**, **Authorize with Atlassian**) turns into a banner, `authorized`, when the provider answers. The note on the credential store. **Next** waits for authorization.
3. **Scope**: the repositories, teams, or projects as checkboxes with the defaults checked; **Import** (the three filters) with the estimate of tasks on the first read; for Jira a **JQL filter**. **Next** waits for one checked.
4. **Fields**: "oxagen.assistant suggested each mapping from the values <provider> returned. …" Three tables (Statuses, Resolutions, Labels): Oxagen (the badge or chip) · <Provider> (a select of the provider's values and "nothing") · Source (`suggested`). Then **Writes to <provider>**: the four switches, certify and send on, status and close off, and "Each write is a governed action, made with the connection's token and recorded in Audit."
5. **People**: Account · Email · Workspace member (a select of members and "not mapped"; a bot shows `bot`, "never mapped"), and the running count "N mapped, N not mapped. Mapping grants nothing. …"
6. **Review**: Provider, Authorization, the scope, Import, Fields, People (the same count), Writes; then **When you connect**, four facts ending "Nothing is sent to an agent. A work order is the only way work reaches one." **Connect <provider>** (gold), or **Save** when editing.

Connecting adds the card to Providers, adds the accounts to People, and toasts "<provider> connected. connect_issue_provider recorded. …".

## Dialogs

- **`ipoff`**: "Disconnect <provider>?". Oxagen stops reading, revokes the token there, and deletes it from the credential store; the imported tasks stay with their last-read values, marked disconnected; certified definitions of done and sent work orders are unchanged; connecting again reads the same tasks back into the same task ids. Footer **Keep it connected**, **Disconnect it** (red).
- **`lbledit`**: Name, Group (Priority, Type, Area), **Colour** (twelve swatches, a hex field, and a live chip preview; no gold swatch), "The colour is Oxagen's. Oxagen never changes a label's colour in a provider.", **Mapped from** one field per provider, and **Definition of done items** as a `later` banner: "A label will carry definition-of-done items". Footer "needs `task_fields.write`", **Cancel**, **Save label** or **Add label**.
- **`stedit`**: Name, Category (open, blocked, closed; disabled for a built-in status), a mapping per provider. **`resedit`**: Name and a mapping per provider.
- **`pmap`**: the account (logo, handle, name), Email, Match, then **Workspace member** with "not mapped" first, and the note that mapping grants nothing. A bot shows only "A bot is never mapped to a person" and **Close**.

## Data sources

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Connections | `IPROV` | `tasks.issue_providers`, token in `mcp.credentials` | the workspace credential store exists; GitHub and Linear connectors read into the graph; no Jira | 🟡 |
| Scopes and authorization | `IPZ` | the provider's OAuth or App flow | GitHub App installation, Linear OAuth `read`; no Jira | 🟡 |
| Mapping suggestions | `IPZ[].values` | `suggest_connection_mappings` | exists for connectors | 🟡 |
| Statuses, resolutions, labels, colours | `TSTATUS`, `TRES`, `TLABELS` | `tasks.field_settings` | nothing | ❌ |
| People | `TPEOPLE` | `tasks.provider_people` | nothing; `auth.accounts` holds sign-in accounts | ❌ |

## States

As `tasks.md`: loaded (GitHub and Linear connected, Jira offered), empty ("No issue provider is connected to this workspace"), loading, error (`503 issue_index_unavailable`), access denied (`task.read on core-platform`).

## Mobile

As `tasks.md`. Provider cards stack; the wizard is a bottom sheet whose rail scrolls sideways within itself; the mapping tables keep their three columns and wrap their text.

## Permissions

- Read: `task.read`
- Writes, each a governed action in Audit: `issue_provider.connect` (connect, edit, sync, disconnect), `task_fields.write` (statuses, resolutions, labels, colours, mappings), `identity_map.write` (map an account)

## Rules every build of this page must keep

- The wizard says what the token still cannot do on the same step that asks for it.
- The token is never shown, copied, or read back.
- A suggestion is never a mapping until a person confirms it. A bot is never mapped.
- An account left not mapped is shown as itself.
- Oxagen never edits a subject or a description and never changes a colour in a provider.
- Plain nouns. Exactly one gold action per screen. State reads as a dot and a word.
