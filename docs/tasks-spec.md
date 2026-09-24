# Tasks and work orders

| | |
|---|---|
| **Status** | Spec v1, for design review. No code is written against it yet. |
| **Date** | 2026-09-24 |
| **Owner** | Mac Anderson |
| **Source** | `mockups/src/engine.js` (the Tasks section: `pTasks`, `pTask`, `pWorkOrder`, `DLG_EXT.ipwz`, `DLG_EXT.wo`, `DLG_EXT.certify`, `DLG_EXT.wfnew`), `mockups/fixtures/tasks.json`, rendered in `mockups/missioncontrol.html` |
| **Builds on** | ADR-043 (Oxagen governs agents, it does not run them), ADR-096 (the launcher may contain the process), ADR-101 (four first-class harnesses), ADR-157 (ARP carries an operator-authored brief), ADR-053 (the assistant), ADR-052 (the governed action is the billable unit) |
| **Related** | `creation-spec.md` (every definition is a file, and a wizard ends on a pull request), `dod-spec.md` (the run dod, a different object), `mission-control-spec.md` §1 (the operator), §7.6 (agent messages are quoted evidence), §11.2 (connectors) |
| **Pages** | `mockups/pages/tasks.md`, `tasks-providers.md`, `task.md`, `work-order.md`, each with its audit prompt |
| **Check** | `node tools/check-tasks.mjs` walks every flow below in the built mockup |

## 1. The situation

Your work lives in an issue tracker (GitHub issues, Linear, or Jira) or a help desk (ServiceNow,
Salesforce Service Cloud, or Zendesk). Your agents are registered in Oxagen. Nothing joins the two. To
put an agent on an issue or a ticket you copy it into a prompt, you guess which repository it may
touch, and nobody writes down what finished means. When the agent stops, you read
the pull request and decide whether it did the job, against a standard that exists only in your head.

This spec joins them. Oxagen reads your tasks from the tracker or the help desk, drafts a definition
of done for each one, and waits for a person to certify it. A certified task is ready. You pick ready tasks and send
them to an agent you operate in a **work order**: one screen that merges every definition of done,
drafts the prompt, lets you edit it and reference context records and other agents with `@`, and
asks you to confirm the repositories the agent may change. A workflow chains agents, so a bug fixer
hands to a validator, then a documenter, then an architect, and you accept the result.

The Tasks page is where an operator sees all of it at once: what is waiting on you, what is ready,
what is out with which agent, and what came back.

## 2. Scope

| Day 1 | Later |
|---|---|
| GitHub issues, Linear, and Jira Cloud | Jira Server and Data Center, Azure DevOps, Jira Service Management as its own connection, Freshdesk, and HubSpot Service Hub |
| Thirteen fixed fields per task (§6.1) | Custom fields |
| Statuses in three categories, resolutions, and labels, each configurable with a mapping per provider | Two-way sync of subject and description |
| Creating a status, resolution, or label in a provider when a person chooses Create (§5.6) | Renaming or deleting a provider value |
| A colour per label | Labels that carry definition-of-done items (§6.5) |
| Mapping provider accounts to workspace members, with any account left not mapped | Group and team mapping |
| A definition of done drafted by `oxagen.assistant` for every open task imported | Drafting from linked pull requests and comments |
| Certification by a person, and readiness | Certification rules per label or per repository |
| One or more ready tasks sent in a work order to one agent you operate | Rules that send without a person |
| An editable prompt with `@` mentions of context records and agent profiles | `@` mentions of tasks, files and runs |
| Repository confirmation and a spend cap per work order | Per-item budgets |
| Workflows of agents you operate, as files in `.oxagen/workflows/` | Workflows that include agents another person operates |
| Claims by the agent and acceptance by a person | Acceptance that closes the task and merges nothing else |

The three help desks (ServiceNow, Salesforce Service Cloud, and Zendesk) are specified in full here
and drawn in the mockup beside the trackers. Whether they ship with the trackers or after them is an
open question (§18).

## 3. The flow

1. **Connect.** A person with `issue_provider.connect` runs the six-step wizard (§5.1). Oxagen stores the
   token and starts reading.
2. **Import.** Every task in scope becomes a task record with the thirteen fields (§6.1).
3. **Draft.** `oxagen.assistant` drafts a definition of done for each open task (§8.2). The task is a draft.
4. **Certify.** A person reads the draft, edits it, and certifies it (§8.4). The task is ready.
5. **Send.** You select ready tasks, choose an agent you operate or a workflow, and send a work order (§9).
6. **Pick up.** The runtime the agent is enrolled on picks the work order up and starts the run (§9.6).
7. **Claim.** The agent claims each item with evidence (§11).
8. **Hand off.** In a workflow each stage hands to the next, and may return the work a bounded number of times (§10).
9. **Accept.** You accept the claimed items (§11). Nothing merges without a person.

## 4. Vocabulary

| Term | Meaning |
|---|---|
| **Issue provider** | A tracker or a help desk Oxagen reads tasks from: GitHub, Linear, Jira, ServiceNow, Salesforce Service Cloud, or Zendesk. The wizard groups them as issue trackers and help desks. |
| **Connection** | One authorized account of one provider in one workspace. A workspace may hold several, including two of the same provider. |
| **Provider value** | A status, resolution, label, priority, type, category, or tag as a provider names it. A mapping joins each Oxagen value to provider values (§6). |
| **Requester** | The person who asked for the work on a help desk: a ServiceNow caller, a Salesforce contact, or a Zendesk requester. Oxagen shows a requester by name and never maps one (§7). |
| **Task** | One issue, incident, case, or ticket, read into Oxagen with the thirteen fields. Its id is `tsk_<ULID>`, minted by Oxagen and stable across reconnects. |
| **Definition of done** | The ordered items that say what finished means for one task. Drafted by the assistant or a person, and certified by a person. |
| **Item** | One line of a definition of done: its text, its kind (`check` or `review`), its tag (`code`, `test`, `docs`, `review`), and its source. |
| **Resolution** | Why a closed task closed: Done, Won't do, Duplicate, Cancelled, or Other (§6.3). |
| **Certification** | A person's statement that the items define done. It records who, when, the digest of the items, and the version of the task they were read against. |
| **Readiness** | Oxagen's state for a task, separate from the provider's status (§8.6). A task is **ready** when it is certified and open. |
| **Work order** | Ready tasks, their merged definition of done, a prompt, the repositories it may change, and a spend cap, sent to one agent or one workflow. |
| **Brief** | The prompt a work order carries. It is the operator's, drafted by the assistant and made the operator's by the send. |
| **Workflow** | A file that names stages in order. Each stage is an agent you operate. The last stage is always a person. |
| **Handoff** | A stage passing the work to the next stage, with a note that reaches the next agent as quoted evidence. |
| **Return** | A stage sending the work back to an earlier stage, up to the number of returns the file allows. |
| **Claim** | An agent's statement, with evidence, that an item is met. |
| **Acceptance** | A person's statement that the claimed items are done. |
| **Operator** | The person accountable for an agent's runs (spec §1). Oxagen derives it from the agent principal's parent user (`principals.parent_user_id`). You may send work only to an agent whose operator you are. |

## 5. Connecting a provider

### 5.1 The wizard

The Providers tab and the Tasks page header open it. It has six steps, and every step says what the
next one needs.

1. **Provider.** Two groups, **Issue trackers** (GitHub, Linear, Jira) and **Help desks** (ServiceNow,
   Salesforce, Zendesk), each provider with its logo and one line on what it imports. A provider
   already connected is marked `connected` and can be connected again for another account.
2. **Authorize.** How this provider authorizes, in one paragraph. The site, where the provider has one
   (Jira site, ServiceNow instance, Salesforce My Domain, Zendesk subdomain). **Create values in
   <provider>**, on by default, where creating a value needs more than reading does (§5.6). Then **What
   Oxagen needs**, a table with the reason for each permission, and **What it still cannot do**: edit a
   subject or a description, delete an issue, act as you (GitHub, Linear) or as anyone other than the
   account that authorizes (Jira and the help desks), reply to a requester (help desks), read outside
   the scope you choose next, assign a task to anyone, or rename or delete a provider value. Next is
   disabled until the provider returns a token.
3. **Scope.** The repositories, teams, projects, assignment groups, queues, or groups to import, and the
   filter: open ones and those closed in the last 30 days (the default), open only, or everything. The
   filter names the provider's unit: issues, incidents, cases, or tickets. Jira adds an optional JQL
   filter. The step estimates how many tasks the first read brings in.
4. **Fields.** The workspace's statuses, resolutions, and labels, each with the provider value the
   assistant suggested from the values the provider returned. Every suggestion is marked `suggested`
   and can be changed to another provider value, to nothing, or to **Create “<name>” in <provider>**
   where the provider can hold one (§5.6). Below each table, **Only in <provider>** lists the provider
   values no mapping uses, each with **Add**, which brings it into Oxagen as a new value. Then the four
   write-back switches (§5.4).
5. **People.** Every account on the tasks in scope, with a suggested workspace member where one matches
   (§7). Each can be confirmed, changed, or left not mapped. A bot or a requester is never mapped.
6. **Review.** The whole connection on one screen, with how many values Oxagen creates in the provider
   and how many it adds to Oxagen. Then what happens when you connect: Oxagen stores the token and reads
   the tasks, creates each value you chose (`create_provider_value`), the assistant drafts a definition
   of done for each open one, every draft waits for a person, and nothing is sent to an agent.

**Edit scope and fields** on a provider card opens the same wizard at step 3, and its last button is
**Save**.

### 5.2 Authentication

| Provider | Method | Scopes | Token life |
|---|---|---|---|
| GitHub | The Oxagen GitHub App installation the workspace already uses for its repositories. Importing issues adds a permission an organization owner approves on github.com. | Issues read and write, Metadata read, Pull requests read | Installation tokens, minted per call and short-lived (ADR-020, ADR-151) |
| Linear | OAuth 2.0 with `actor=app`, so every write is signed by the Oxagen app | `read`, `comments:create`, and `write` while Create values is on | Long-lived. Linear has no refresh endpoint, so Oxagen re-authorizes on a 401. |
| Jira Cloud | OAuth 2.0 (3LO) on one Atlassian site, resolved through the accessible-resources call | `read:jira-work`, `read:jira-user`, `write:jira-work`, `offline_access`, and `manage:jira-configuration` while Create values is on | Rotating refresh tokens |
| ServiceNow | OAuth 2.0 through an application registry entry an admin creates on the instance | `useraccount`, with the `itil` role on the account that authorizes, and the `personalize_choices` role while Create values is on | Refresh tokens, with a lifetime the instance sets |
| Salesforce Service Cloud | OAuth 2.0 web server flow through a connected app | `api`, `refresh_token`, and Customize Application on the account while Create values is on | Refresh tokens. Salesforce does not rotate them. |
| Zendesk | OAuth 2.0 through an OAuth client on the account | `read`, `write`, and an admin account while Create values is on | Long-lived. A Zendesk grant returns no refresh token. |

**Who a write appears as.** GitHub and Linear sign every write as the Oxagen app. A Jira, ServiceNow,
Salesforce, or Zendesk token acts as the account that authorizes it, within that account's roles, so
every note and transition Oxagen makes appears under that account. The wizard says so under **What it
still cannot do**, and asks you to authorize with an account made for Oxagen. A role on the account
(ServiceNow, Salesforce, Zendesk) is not a scope the token asks for. The wizard lists it beside the
scopes because the connection needs it all the same.

The token goes to the workspace credential store (`packages/plugins/src/credentials/workspace-credential.ts`),
envelope-encrypted under the organization's key. Nobody can read it back, including the person who
connected it. A write without a token fails closed.

### 5.3 Reading

- **Events.** GitHub `issues` and `issue_comment` webhooks through the App, Linear webhooks, Jira
  dynamic webhooks registered by the OAuth app, Salesforce Change Data Capture on `Case`, and a Zendesk
  webhook that a trigger fires. ServiceNow offers no webhook a token can register, so a ServiceNow
  connection reads on the reconcile alone until an admin adds an outbound business rule. An event is a
  hint: Oxagen reads the task again and applies what it read.
- **Reconcile.** Every 15 minutes Oxagen lists what changed since its last read, so a missed event
  costs at most 15 minutes. A nightly pass reads everything in scope.
- **Identity.** A task is unique by connection and provider id: a ServiceNow `sys_id`, a Salesforce
  case `Id`, or a Zendesk ticket `id`. GitHub keys by record type and database id, never by issue
  number (ADR-121), so a transferred issue stays the same task.
- **Order.** A read older than the stored `updated at` is dropped.

### 5.4 Writing back

Each connection carries four switches. Each write is a governed action made with the connection's
token and recorded in Audit.

| Switch | Default | What it writes |
|---|---|---|
| Post the definition of done as a <note> when a person certifies it | on | A note with the items and a link to the task in Oxagen |
| Post a link to the work order as a <note> when it is sent | on | A note naming the work order and the agent |
| Move the status when a work order starts | off | The provider status mapped to `in review` or `open` |
| Close the <unit> as Done when you accept the work | off | The provider's closed status, with the provider value mapped to `Done` |

The note is the provider's own kind: a comment on GitHub, Linear, and Jira, a work note on ServiceNow,
an internal comment on Salesforce, and an internal note on Zendesk. On a help desk only staff can read
it. Each switch fills in the provider's note and unit (issue, incident, case, or ticket), so
ServiceNow reads "Close the incident as Done when you accept the work". Resolving a ServiceNow incident or solving a Zendesk ticket emails the requester by
default, and the close switch says so.

Oxagen never edits a subject or a description, never deletes an issue, never assigns anyone, and never
replies to a requester.

### 5.5 Disconnecting

Disconnecting revokes the token at the provider and deletes it from the credential store. The
tasks it imported stay, with their last-read values, marked disconnected. Certified definitions of
done and sent work orders are unchanged. Connecting the same account again reads the same issues back
into the same task ids.

### 5.6 Creating values in a provider

Mapping works in both directions. A provider value Oxagen lacks can be added to Oxagen, and an Oxagen
value a provider lacks can be created there. You choose, one value at a time, on step 4 of the wizard
or in a status, resolution, or label editor on the Fields tab. Oxagen creates nothing on its own.

| Provider | What Oxagen creates | Permission it needs |
|---|---|---|
| GitHub | A label, for a status, a resolution, or a label. GitHub has no custom statuses or close reasons. | Issues read and write, already asked for |
| Linear | A workflow state for a status or a resolution, and a label for a label | `write` |
| Jira Cloud | A status or a resolution. A label needs nothing, because a Jira label exists once an issue carries it. | `manage:jira-configuration`, which a Jira admin approves |
| ServiceNow | A choice on the incident table: a state, a close code, or a category | the `personalize_choices` role on the account that authorizes |
| Salesforce Service Cloud | A Status value, a closed Status value, or a Type value, through the Metadata API | Customize Application on the account that authorizes |
| Zendesk | A custom ticket status. A resolution or a label becomes a tag, which exists once a ticket carries it. | an admin account for a custom status, and `write` for a tag |

- **The switch.** Step 2 carries **Create values in <provider>**, on by default. Turned off, Oxagen asks
  only for what reading and the write-back switches need, and step 4 offers Create only where no more
  is needed (a GitHub label, a Jira label, a Zendesk tag). A field editor on a connection without the
  permission says what it lacks: "Creating one needs write. Edit the connection to ask for it."
- **Names.** A created value takes the Oxagen name. A tag and a Jira label hold no spaces, so `Won't do`
  becomes `wont_do` there.
- **Reach.** A new Jira status reaches a project once a Jira admin adds it to the project's workflow. A
  new Salesforce Status value reaches a case once an admin adds it to the support process. Oxagen says
  so on step 4 and edits no workflow and no process.
- **Limits.** Oxagen creates no ServiceNow priority, because the instance derives priority from impact
  and urgency. It creates no Zendesk priority or type, because Zendesk fixes both.
- **Colour.** A label Oxagen creates takes its Oxagen colour once, where the provider has label colours
  (GitHub, Linear). Oxagen never changes the colour after.
- **The record.** Each value created is a governed action, `create_provider_value`, made with the
  connection's token and recorded in Audit beside the `connect_issue_provider` or `update_task_fields`
  that asked for it.
- **Renaming and deleting.** Oxagen renames and deletes no provider value, including one it created.

## 6. The task record

### 6.1 Fields

Day 1 reads thirteen fields and nothing else. The Fields tab shows one column for each connected
provider.

| Field | GitHub | Linear | Jira |
|---|---|---|---|
| Task id | `tsk_<ULID>`, minted by Oxagen | same | same |
| Number | `owner/repo#number` | identifier, `PLAT-231` | key, `OPS-88` |
| Subject | `title` | `title` | `summary` |
| Description | `body` | `description` | `description`, converted from ADF to Markdown |
| Labels | `labels` and issue type | `labels` and `priority` | `labels`, `priority`, and issue type |
| Owner | first assignee | `assignee` | `assignee` |
| Created by | `user` | `creator` | `reporter` |
| Created at | `created_at` | `createdAt` | `created` |
| Updated by | actor of the latest timeline event | actor of the latest history entry | author of the latest changelog entry |
| Updated at | `updated_at` | `updatedAt` | `updated` |
| Closed at | `closed_at` | `completedAt` or `canceledAt` | `resolutiondate` |
| Status | `state` and the labels mapped to a status | workflow state | status and its category |
| Resolution | `state_reason` | the completed or canceled state | `resolution` |

| Field | ServiceNow | Salesforce Service Cloud | Zendesk |
|---|---|---|---|
| Task id | `tsk_<ULID>`, minted by Oxagen | same | same |
| Number | `number`, `INC0012345` | `CaseNumber`, `00001026` | `id`, `#4821` |
| Subject | `short_description` | `Subject` | `subject` |
| Description | `description` | `Description` | the first comment |
| Labels | `priority` and `category` | `Priority` and `Type` | `tags`, `priority`, and `type` |
| Owner | `assigned_to` | `Owner`, when a person owns the case | `assignee` |
| Created by | `caller_id`, a requester | `Contact`, a requester | `requester` |
| Created at | `opened_at` | `CreatedDate` | `created_at` |
| Updated by | `sys_updated_by` | `LastModifiedBy` | author of the latest audit |
| Updated at | `sys_updated_on` | `LastModifiedDate` | `updated_at` |
| Closed at | `resolved_at` | `ClosedDate` | `solved_at` from ticket metrics |
| Status | `state` | `Status` | `status` |
| Resolution | `close_code` | the closed `Status` | the solved status or its tags |

Three derivations are worth naming. **Updated by** is not a field in GitHub, Linear, or Jira, so
Oxagen reads the actor of the latest change. **Owner** is one person: GitHub allows several assignees,
and day 1 reads the first. **Created by** on a help desk is a requester, the customer or employee who
raised the ticket, and a requester is never a workspace member (§7). Custom fields are not read. Each
field Oxagen adds needs a mapping on six providers and a meaning in the brief, so custom fields wait
for a schema of their own.

### 6.2 Statuses

A status belongs to one of three categories: `open`, `blocked`, or `closed`. Oxagen ships `Open`,
`Blocked`, and `Closed`. A workspace may add statuses (the mockup adds `In review`, category
`open`) and map each to provider values. When a task matches more than one, `closed` wins over
`blocked`, and `blocked` wins over `open`. Only a task whose category is `open` can be sent.

### 6.3 Resolutions

A closed task carries one resolution. Oxagen ships five, and a workspace may add more.

| Resolution | GitHub | Linear | Jira |
|---|---|---|---|
| Done | `state_reason completed` | Done | Done, Fixed |
| Won't do | `state_reason not_planned` | Canceled with label `Won't do` | Won't Do, Won't Fix |
| Duplicate | `state_reason duplicate` | Duplicate | Duplicate |
| Cancelled | `not_planned` with label `cancelled` | Canceled | Cancelled |
| Other | anything else | anything else | Cannot Reproduce, Incomplete, anything else |

| Resolution | ServiceNow | Salesforce Service Cloud | Zendesk |
|---|---|---|---|
| Done | close code Solution provided, Workaround provided, Resolved by caller | status Closed | status Solved |
| Won't do | close code No resolution provided | not mapped | not mapped |
| Duplicate | close code Duplicate | not mapped | not mapped |
| Cancelled | state Canceled | not mapped | not mapped |
| Other | anything else | anything else | anything else |

Oxagen's words are the words of done. A closed task is `Done`, `Won't do`, `Duplicate`, `Cancelled`,
or `Other`, and those words read the same to a support team, an IT desk, and an engineering team. A
provider's own words, such as Jira's `Fixed` and Zendesk's `Solved`, stay in the mapping column and
never become Oxagen's. Salesforce and Zendesk have one closed state out of the box, so only `Done` maps
there until a workspace maps more or creates the values (§5.6).

### 6.4 Labels

A task carries any number of labels. A label has a name, a group, a colour, and a mapping to each
provider's labels, priorities, types, categories, or tags. Oxagen ships ten.

| Label | Group | Colour | GitHub | Linear | Jira |
|---|---|---|---|---|---|
| P0 | Priority | `#D6455E` | label `P0` | priority Urgent | priority Highest |
| P1 | Priority | `#E0803A` | label `P1` | priority High | priority High |
| P2 | Priority | `#3B82F6` | label `P2` | priority Medium | priority Medium |
| P3 | Priority | `#71717A` | label `P3` | priority Low | priority Low, Lowest |
| Bug | Type | `#C0453C` | label `bug`, or issue type Bug | label Bug | issue type Bug |
| New Feature | Type | `#57A97C` | label `enhancement`, or issue type Feature | label Feature | issue type New Feature, Story |
| Improvement | Type | `#3FA2A2` | label `improvement` | label Improvement | issue type Improvement |
| Documentation | Type | `#9D8BE3` | label `documentation` | label Docs | label documentation |
| Test | Type | `#5B93D6` | label `test` | label Test | label test |
| Chore | Type | `#A1A1AA` | label `chore` | label Chore | issue type Task |

| Label | ServiceNow | Salesforce Service Cloud | Zendesk |
|---|---|---|---|
| P0 | priority 1 - Critical | priority High | priority Urgent |
| P1 | priority 2 - High | not mapped | priority High |
| P2 | priority 3 - Moderate | priority Medium | priority Normal |
| P3 | priority 4 - Low, 5 - Planning | priority Low | priority Low |
| Bug | category Software | type Problem | type Problem |
| New Feature | not mapped | type Feature Request | not mapped |
| Improvement | not mapped | not mapped | not mapped |
| Documentation | not mapped | not mapped | tag `documentation` |
| Test | not mapped | not mapped | not mapped |
| Chore | category Inquiry / Help | type Question | type Task |

The colour is Oxagen's own. Oxagen sets a label's colour in a provider once, when it creates the label
there (§5.6), and never changes it after. The label editor
offers twelve swatches and a hex field, and previews the chip as you choose. Gold is not offered,
because gold is the house identity colour and never encodes state. A provider label that maps to no
Oxagen label is not read.

### 6.5 Label items

Day 1 a label is a tag. The design reserves more for it: **a label will carry definition-of-done
items**, and when a task has the label, those items copy into the task's draft before the assistant
adds its own. `Bug` would carry "A test reproduces the defect and fails before the fix." `Documentation`
would carry "The docs page renders in the docs build." The copied items are marked with the label they
came from, and the certifier sees them like any other item. The label editor shows the section now,
marked `later`, so nobody is surprised by it.

Those item templates steer agents, so they will be files: `.oxagen/dod/labels/<label>.toml`, changed
by pull request like every other definition (`creation-spec.md`). This is the one place labels cross
from settings into steering, and it is why it waits for its own change.

### 6.6 Where settings live

Statuses, resolutions, labels, colours, and their mappings are workspace settings in Postgres. Each
change is a governed action (`update_task_fields`) in Audit, and it applies to the next read of every
task. They are not files, because they translate a tracker's words into Oxagen's and steer no agent.
Connections and people mappings are rows too, because they hold a credential and personal data that
do not belong in a repository.

## 7. People

The People tab, and step 5 of the wizard, map provider accounts to workspace members.

- **Suggestions.** Oxagen suggests a member from two sources, in order: the member signed in to Oxagen
  with that provider account (`auth.accounts`), then a verified email that equals the member's. It
  never suggests from a display name.
- **Confirmation.** A suggestion counts only when a person confirms it. **Confirm all** confirms every
  suggestion on the page at once.
- **Not mapped.** Any account can stay not mapped. It still owns and creates tasks and appears under
  its own handle with its provider's mark. Nothing pretends it is a member.
- **Bots.** A bot account (`dependabot[bot]`, Automation for Jira, the ServiceNow `system` user, the
  Salesforce Automated Process user) is never mapped to a person.
- **Requesters.** A help desk's requester (a ServiceNow caller, a Salesforce contact, a Zendesk end
  user) raised a ticket and never works in the workspace, so Oxagen never maps one. The People tab
  lists the help desk's staff accounts only.
- **Grants.** Mapping grants nothing. A member's roles decide what they may do. Only a signed-in
  member can certify a definition of done or send a work order, whatever an account's mapping says.
- **Who maps.** `identity_map.write`, held by workspace owners by default. Each change is a governed
  action (`map_provider_person`).

## 8. The definition of done

### 8.1 What it is

An ordered list of items. Each item has:

| Part | Values |
|---|---|
| Text | One sentence a reviewer can check. |
| Kind | `check`: evidence can show it (a test, a diff, a check run). `review`: a person judges it. |
| Tag | `code`, `test`, `docs`, or `review`. A workflow stage owns items by tag (§10). |
| Source | `from the issue` (or incident, case, or ticket), `oxagen.assistant`, `you`, or `edited by you`. |

This is not the run dod of `dod-spec.md`. That one is a locked file of executable checks that
gates an agent's stop. This one is a list a person certifies before work starts and accepts after it
ends. None of the run dod's verdict words apply here: an item is `open`, `claimed`, or `accepted`.
Later, the run dod can compile a task's `check` items into its checks.

### 8.2 Drafting

Every open task a provider imports is drafted by `oxagen.assistant`, following the eight-step
AI-assisted configuration pattern (`.claude/skills/ai-assisted-config/SKILL.md`).

1. **Existing items first.** A checklist already in the description (`- [ ]` lines, the shape every
   issue in `macanderson/oxagen` carries under SCR-003) becomes the first items, marked `from the issue`.
2. **Then the assistant's items**, drafted against the item schema from the subject, description,
   labels, and linked pull requests.
3. **Notes.** The assistant lists what the task leaves open and every assumption it made, on the task
   page under **Assistant notes**, for example "The issue does not say which tacho version. The
   assistant assumed 1.6.2."
4. **It never certifies.** A draft is a draft until a person certifies it.

The drafting turn runs as `oxagen.assistant`, is recorded like any turn, and never appears in Fleet or
Spend. Drafting is bounded: closed tasks are not drafted, and a first import drafts at most 60 tasks a
minute per workspace, oldest update first. A task still being drafted shows `drafting`, and **Draft it
now** moves it to the front.

### 8.3 Editing

A draft is editable by anyone with `task.edit_dod`: change an item's text, tag, or kind, remove it, add
one, or redraft with the wand. Redrafting keeps every item a person wrote or edited. A certified list
is read-only. **Edit** asks first, because editing sends the task back to draft until somebody
certifies it again. Work orders already sent keep the list they were sent with.

### 8.4 Certification

**Certify definition of done** opens a dialog that lists every item. **Certify** is disabled until
the certifier ticks **I read every item**. Certifying records `certify_task_dod` with:

- the certifier and the time
- the digest of the items: SHA-256 over their RFC 8785 canonical JSON, so the same list always has the same digest
- the provider version of the task it was read against (`updated_at`, or the provider's etag)

If the connection allows it, Oxagen posts the list as a comment on the issue, or as an internal note on
a help desk (§5.4). In a workspace whose governance mode is `regulated`, the person who certifies a
task cannot send it.

### 8.5 A certified task that changes

When a provider changes a certified task's subject, description, or labels, the certification is
marked `changed` and the task leaves ready. A comment, an assignee, or a status change inside the same
category does not. The task page shows the text it was certified against beside the text now, and the
assistant suggests items for the new scope. **Certify again** makes it ready.

### 8.6 Readiness

| Readiness | Meaning | Next |
|---|---|---|
| `drafting` | The assistant is reading the task. | `draft` |
| `draft` | A draft waits for a person. | `ready` on certify |
| `changed` | The task changed after certification. | `ready` on certify again |
| `ready` | Certified, and its status category is `open`. | `sent` |
| `sent` | In an open work order. | `accepted`, or `ready` if the work order stops |
| `accepted` | A person accepted every item. | none |
| `closed` | Closed upstream without a certification. | none |

A task is sendable when it is `ready` and its status category is `open`. A blocked task can be
certified and cannot be sent until it is open again. The Tasks tab shows the reason on every checkbox
it disables.

## 9. Sending work

### 9.1 Selecting

The Tasks tab lists tasks from every connection with a checkbox on each ready one. A selection can mix
providers. The header's gold action, **Create work order and send to agent**, is disabled until one
task is selected. The same button sits on a ready task's own page.

### 9.2 The send menu

The button opens a menu. It lists:

- **Agents you operate**: every agent in the workspace whose operator is you, each with its harness
  mark, avatar, name, harness, host, and enforcement tier. The four harnesses (Claude Code, Codex,
  Cursor, Stella) carry their own marks, and no harness is listed first by default (ADR-101).
- **Workflows**: every published workflow whose agents you all operate, with the harness marks of its
  stages in order.

A search field narrows both lists. An agent somebody else operates is not in the menu.

### 9.3 The work order screen

Picking an entry opens the work order. It is one screen with six sections.

1. **Tasks.** A chip per task, each tagged to this work order and removable while more than one remains.
2. **Sent to.** The agent (harness mark, name, harness, host, tier, and "operator: you") or the
   workflow's stages. A select switches to any other agent you operate or published workflow.
3. **Definition of done.** One master list: every certified item of every task, one row per distinct
   item, each tagged with the tasks it came from. Two tasks that ask for the same thing produce one item
   with two tags. In a workflow each item names the stage that owns it. Certified items are read-only.
   You may add items for this work order only, and your send certifies them.
4. **Prompt.** Drafted from the tasks, the items, the stages, and the repositories, and yours to edit.
   **Draft it again** replaces your edits with a new draft. Typing `@` opens mentions (§9.4). The label
   above the box says `drafted by oxagen.assistant` or `edited by you`.
5. **Repositories.** The repositories the work order may change, pre-checked from the tasks. A
   repository outside the agent's toolbelt is shown and disabled, with the reason. A work order narrows
   what the agent may write and never widens it. Below them, **I confirm the repositories** names the
   agents and the repositories. Branches and pull requests only: the production branch is never pushed.
6. **Spend cap.** A USD cap for the whole work order, every stage and every return. Each run also stays
   inside its own agent's per-run budget. When a stage runs on Cursor, the screen says the cap counts
   every stage but that one, because Cursor's model calls do not pass through the Oxagen gateway.

**Send to <agent>** stays disabled until the repositories are confirmed, at least one repository is
checked, and the prompt is not empty.

### 9.4 Mentions

Typing `@` in the prompt lists matching context records (`@ctx.release.never-merge`) and agent profiles
(`@a-intel.core.validator`). Enter or Tab inserts the first match, and a click inserts any. Below the
box, **References** lists every mention the prompt holds:

- A **context record** enters the brief as its statement, with its record hash and its token cost.
- An **agent profile** enters as the agent's name, harness, and job. It grants that agent nothing and
  sends it nothing. Work reaches another agent only through a workflow stage.
- A mention that resolves to nothing is flagged `not found`, and it stays text.

The mention grammar in `packages/ai/src/prompts/mentions.ts` has no context-record or task type. It
needs both (§17).

### 9.5 What sending records

`send_work_order` is a governed action. It records the work order, its tasks, its items with their
certification digests, the prompt as sent with its digest, the repositories, the cap, and the target.
A sent prompt cannot change. Each task moves to `sent` and shows the work order on its page. If the
connection allows it, Oxagen posts a link on each issue or ticket. The sender lands on the work order page.

### 9.6 Delivery

Oxagen runs no agent (ADR-043). A work order is the operator's brief, and the runtime the agent is
enrolled on starts the run. There are three ways it reaches a runtime.

| Runtime | How the run starts |
|---|---|
| A wrapped harness on an enrolled host (Claude Code, Codex, Cursor, Stella) | The host's collector receives the work order. `oxagen work start <wo>` starts the harness in the agent's working copy with the brief as its first prompt, and the hooks bind the session to the work order. The person at the host starts it on day 1. The contained launcher (`oxagen run`, ADR-096, Phase 5) starts it without one later. |
| A CI agent (Stella CI) | Oxagen sends a `repository_dispatch` event carrying the work order id, and the job reads the brief with its own credential. |
| Any harness through ARP | The brief is an `arp.capture-brief` document (ADR-157), so every harness that loads an ARP brief loads a work order. |

Every run a work order starts records the work order id and its tasks as the run's task reference
(`cost.run_totals.task_ref`, the task reference of the spec's run record), so the Run page's Issues tab lists them and Spend can drill by
task. The agent reads its work order through `get_work_order` on the MCP surface.

The repository list and the cap are enforced at the agent's tier. On `gateway` and `contained` a write
to another repository is refused. On `harness` the refusal is a hook, client-attested and fail-open
against the person at the keyboard. The work order page shows each agent's tier, so the page never
claims more than the tier enforces.

## 10. Workflows

### 10.1 The file

A workflow is a file in the workspace's main repository.

```toml
# .oxagen/workflows/fix-validate-document-review.toml
schema = "oxagen-workflow/v0.1"
name = "Fix, validate, document, review"

[[stage]]
role = "Fix"
agent = "a-intel.core.bug-fixer"
owns = ["code"]
on_fail = "stop"

[[stage]]
role = "Validate"
agent = "a-intel.core.validator"
owns = ["test"]
on_fail = "return"
return_to = 1
max_returns = 2

[[stage]]
role = "Document"
agent = "a-intel.core.documenter"
owns = ["docs"]
on_fail = "stop"

[[stage]]
role = "Review"
agent = "a-intel.core.architect"
owns = ["review"]
on_fail = "return"
return_to = 1
max_returns = 1

[accept]
by = "operator"   # the last stage is always a person
```

A stage owns the items whose tag it lists. An item whose tag no stage lists belongs to the last agent
stage. The accept stage is implicit and cannot be removed.

### 10.2 Building one

**New workflow** on the Workflows tab opens the builder. Write a sentence ("A bug fixer passes a fix
to a validator, which passes it to a documenter, which passes it to an architect for final review")
and press the wand: the assistant drafts the stages in the order the sentence names them. Each stage
has a role, an agent (only agents you operate, each with its harness), the tags it owns, and what
happens on failure: stop and ask you, or return to an earlier stage at most one to three times. Stages
can be added, removed, and reordered. The builder shows the file as it will be committed. **Open pull
request** proposes it, and the workflow exists when the pull request merges (`creation-spec.md`).

### 10.3 Running one

A workflow runs nothing itself. Oxagen sequences work orders.

1. Stage 1 receives the work order's brief with its own items marked.
2. When the stage's items are claimed, its agent calls `hand_off_work_order` with a note. Oxagen sends
   the next stage its brief, with the note as quoted evidence. A handoff note is never an instruction
   to the next agent (spec §7.6).
3. A stage that finds an earlier stage's item unmet calls `return_work_order` with the item numbers.
   Oxagen sends the work back to the stage the file names, and counts the return.
4. When a stage exhausts its returns, the work order parks for the operator in the Approvals drawer.
5. After the last agent stage, the work order waits on you.

Every stage is its own run, by its own agent, on its own runtime, under its own mandate and budget.

### 10.4 Rules

- Day 1, every agent in a workflow must be one you operate. A workflow that names an agent somebody
  else operates is not offered to you.
- A workflow grants nothing. Each stage acts under its own agent's toolbelt and the work order's
  repository list.
- ADR-043 removed the old `workflow.*` capabilities, which executed agent turns on Oxagen's workers.
  This workflow executes nothing. It is a file that orders work orders, and it needs its own ADR (§17)
  so nobody mistakes one for the other.

## 11. Completing work

- **Claims.** The agent calls `claim_dod_item` with the item number and its evidence: a commit, a test,
  a check run, or a pull request. A claim is the agent's word and is labelled as one.
- **Acceptance.** When every item is claimed, the work order shows `waiting on you` and **Accept the
  work** turns gold. Accepting records `accept_work_order` with your name and accepts every claimed
  item. It merges nothing: pull requests are merged by a person in the repository.
- **Close.** If the connection's close switch is on, Oxagen closes each task as `Done`, with the
  provider value mapped to `Done`. If it is off, the dialog says the task stays open in the provider.
- **Stop.** **Stop the work order** cancels the live run at its next boundary and starts no later stage.
  Branches and pull requests stay. The tasks go back to ready with their certifications intact.

## 12. Capabilities

Every name is verb-first snake_case (ADR-025). Management capabilities carry `noBillingGate: true`.
The runs a work order starts are metered like any run.

| Capability | Surfaces | Notes |
|---|---|---|
| `connect_issue_provider` | api, app, cli | Stores the token and starts the first read |
| `list_issue_providers`, `get_issue_provider` | api, mcp, app, cli | |
| `update_issue_provider` | api, app, cli | Scope, filter, write-back switches, and **Create values** |
| `sync_issue_provider` | api, app, cli | Queues a read now |
| `disconnect_issue_provider` | api, app, cli | Revokes and deletes the token |
| `get_task_fields`, `update_task_fields` | api, app, cli | Statuses, resolutions, labels, colours, and mappings |
| `create_provider_value` | api, app, cli | Creates a status, resolution, or label in a provider with the connection's token (§5.6) |
| `list_provider_people`, `map_provider_person` | api, app, cli | |
| `list_tasks`, `get_task` | api, mcp, app, cli, agent | |
| `draft_task_dod` | api, app | Runs as `oxagen.assistant` |
| `update_task_dod` | api, app, cli | Draft only |
| `certify_task_dod` | api, app, cli | Signed-in person only |
| `create_work_order`, `send_work_order` | api, app, cli | Sender must operate every target agent |
| `get_work_order`, `list_work_orders` | api, mcp, app, cli, agent | The agent reads its brief here |
| `claim_dod_item` | mcp, agent | Agent only |
| `hand_off_work_order`, `return_work_order` | mcp, agent | Agent only |
| `accept_work_order`, `stop_work_order` | api, app, cli | Signed-in person only |
| `propose_workflow` | api, app, cli | Opens the pull request, as `open_context_pr` does |

Existing capabilities it reuses: `suggest_connection_mappings` (field suggestions in step 4),
`open_context_pr` (workflows), `dispatch_command` (cancelling a live run on stop), `ask_assistant`
(drafting). The agent-facing tools (`get_work_order`, `claim_dod_item`, `hand_off_work_order`,
`return_work_order`) must load in Claude Code, Codex, Cursor, and Stella (ADR-101).

## 13. Storage

| Store | What |
|---|---|
| Postgres | `tasks.issue_providers`, `tasks.provider_people`, `tasks.tasks`, `tasks.task_labels`, `tasks.field_settings`, `tasks.dod_items`, `tasks.dod_certifications`, `tasks.work_orders`, `tasks.work_order_tasks`, `tasks.work_order_items`, `tasks.work_order_stages`, `tasks.item_claims`. Every table is tenant-scoped under RLS through `withTenantDb`. |
| Credential store | Provider tokens in `mcp.credentials`, envelope-encrypted, keyed by workspace and connection |
| Neo4j | `(:Task)-[:IN]->(:WorkOrder)-[:STARTED]->(:Run)-[:OPENED]->(:PullRequest)`, and `(:Task)-[:CERTIFIED_BY]->(:Person)` |
| ClickHouse | `task.imported`, `task.changed`, `dod.drafted`, `dod.certified`, `work_order.sent`, `stage.handed_off`, `stage.returned`, `item.claimed`, `work_order.accepted`, `work_order.stopped`, `provider_value.created` |
| Files | `.oxagen/workflows/<slug>.toml`, and later `.oxagen/dod/labels/<label>.toml` |

The Postgres tables are a schema change, so the pull request that adds them carries
`migration-required` (SCR-006).

## 14. Permissions

| Permission | Allows | Default |
|---|---|---|
| `task.read` | See tasks, work orders, workflows, providers, fields, and people | every workspace member |
| `issue_provider.connect` | Connect, edit, sync, and disconnect a provider, and choose **Create values** | workspace owner |
| `task_fields.write` | Edit statuses, resolutions, labels, and colours, and create a value in a provider | workspace owner |
| `identity_map.write` | Map provider accounts | workspace owner |
| `task.edit_dod` | Edit a draft definition of done | workspace member |
| `task.certify` | Certify a definition of done | workspace owner, and members granted it |
| `work_order.send` | Send a work order, to agents the sender operates | workspace member |
| `work_order.accept` | Accept or stop a work order | its sender, and workspace owners |
| `context.propose` | Open the pull request for a workflow | workspace member |

Every write is gated server-side, whatever the UI hides.

## 15. Pages and audits

| Page | Route | Spec | Audit |
|---|---|---|---|
| Tasks (Tasks, Work orders, Workflows tabs, the send menu, the work order dialog, the workflow builder) | `#/:org/:ws/tasks`, `/tasks/work-orders`, `/tasks/workflows` | `mockups/pages/tasks.md` | `tasks.audit-prompt.md` |
| Providers, Fields, People, and the connection wizard | `#/:org/:ws/tasks/{providers,fields,people}` | `mockups/pages/tasks-providers.md` | `tasks-providers.audit-prompt.md` |
| One task | `#/:org/:ws/tasks/:taskId` | `mockups/pages/task.md` | `task.audit-prompt.md` |
| One work order | `#/:org/:ws/tasks/work-orders/:woId` | `mockups/pages/work-order.md` | `work-order.audit-prompt.md` |

Tasks is a Workspace nav item under Fleet. Its count is the drafts and changed certifications waiting on
a person plus the work orders waiting on you, because a count in navigation appears only where
something waits on a person. On a phone, Tasks is in the More sheet.

## 16. What exists today

Legend: ✅ exists · 🟡 partial · ❌ missing. Read from `macanderson/oxagen` on 2026-09-23.

| Need | Today | Status |
|---|---|---|
| GitHub issue reading | The ingestion connector reads issues into the graph (`packages/ingestion/src/connectors/github`), and the App binding covers repositories. `repository.link.ts` says issue import is not part of the binding. | 🟡 |
| Linear reading | A read-only connector (`connectors/linear`) with OAuth `read` or a personal key | 🟡 |
| Jira | Nothing | ❌ |
| Zendesk reading | A read-only connector polls the incremental export every 900 seconds with an OAuth token that has no refresh | 🟡 |
| Salesforce reading | A read-only connector reads `Case` among its record types, with a refresh token it does not rotate | 🟡 |
| ServiceNow | Nothing | ❌ |
| Creating a provider value | Nothing. Every connector is read-only. | ❌ |
| Credential storage | The workspace credential store with envelope encryption (`workspace-credential.ts`, `kms.ts`) | ✅ |
| Field mapping suggestions | `suggest_connection_mappings` | 🟡 |
| Identity mapping | Nothing. Connectors store the `login` string. `auth.accounts` holds the GitHub accounts people signed in with. | ❌ |
| Task, definition of done, certification, readiness | Nothing names an issue, task, or ticket | ❌ |
| The operator | Derived from `principals.parent_user_id` in `list_agents` | ✅ |
| Starting a run from Oxagen | No capability starts a run. `dispatch_command` reaches live runs only. ARP carries a brief the operator starts. | ❌ |
| Workflows | Removed by ADR-043 in their old form | ❌ |
| Mentions of context records | The grammar has no context-record or task type | ❌ |
| The run's task reference | `cost.run_totals.task_ref`, with nothing recording one | 🟡 |

## 17. Decisions this needs

Each becomes an ADR before the code it governs merges.

1. **A work order is the operator's brief, and the runtime starts the run.** It settles delivery (§9.6)
   and keeps ADR-043 intact.
2. **Workflows order work orders and execute nothing.** It names the difference from the `workflow.*`
   that ADR-043 removed.
3. **Task field settings are workspace settings, and label item templates are files.** §6.5 and §6.6.
4. **The task definition of done and the run dod are two objects.** §8.1, and how the second may
   later compile the first.
5. **The product words.** "Work order" and "send". ADR-113 reserves "Dispatch" as a name only the
   founder decides, so neither the UI nor a capability name uses it for this.
6. **The mention grammar gains `context_record` and `task`.** `packages/ai/src/prompts/mentions.ts`.
7. **The words of done.** A closed task's resolutions are `Done`, `Won't do`, `Duplicate`, `Cancelled`,
   and `Other`, in every vertical. A provider's own words stay in its mapping (§6.3).
8. **Oxagen creates a provider value only when a person chooses Create, and never renames or deletes
   one.** §5.6.

## 18. Open questions

- Should a certification expire, for a task that sits ready for months?
- Should a regulated workspace require two certifiers for a `P0`?
- Who pays for drafting the first import of a large tracker: Oxagen, as for every assistant turn, or
  the tenant above a threshold?
- Should acceptance of a work order that closed its tasks upstream reopen them when a provider reopens
  the issue?
- Do ServiceNow, Salesforce Service Cloud, and Zendesk ship with the three trackers, or after them? The
  mockup draws all six.
- The default labels (`Bug`, `Test`, `Chore`) and the item tags (`code`, `test`, `docs`) come from
  software work. Should a help-desk workspace get its own defaults?
- Should Jira Service Management be a card of its own, or a Jira Cloud connection that reads a service
  project?
- The scopes, roles, and event paths in §5.2, §5.3, and §5.6 were read from each provider's
  documentation, not tested against a live tenant, as of 2026-09-24. Each needs a check against a
  sandbox before its connector is built.

## 19. Definition of done for the build

- [ ] A workspace connects GitHub, Linear, and Jira Cloud through the six-step wizard, each with its logo, its scopes, and what the token still cannot do. ServiceNow, Salesforce Service Cloud, and Zendesk join them once §18 settles when.
- [ ] **Create values in <provider>** asks for the permission in §5.6, and each value a person creates records `create_provider_value`.
- [ ] Each connection authenticates with the method in §5.2 and stores its token in the workspace credential store.
- [ ] More than one provider, and more than one account of one provider, can be connected to one workspace.
- [ ] Provider accounts map to workspace members with suggestions a person confirms, and any account can stay not mapped.
- [ ] Tasks import with the thirteen fields of §6.1 and no others.
- [ ] Statuses, resolutions, and labels are configurable with a mapping per provider, and every label has a colour.
- [ ] The ten default labels, five resolutions (`Done`, `Won't do`, `Duplicate`, `Cancelled`, `Other`), and three status categories ship as specified.
- [ ] With the close switch on, accepting the work closes each task as `Done` in its provider.
- [ ] The label editor shows the definition-of-done section as `later`.
- [ ] Every open task imported gets a draft definition of done from `oxagen.assistant`, with its notes.
- [ ] A person certifies a definition of done, the certification records its digest and task version, and the task becomes ready.
- [ ] A certified task that changes upstream leaves ready and shows both versions.
- [ ] Only ready, open tasks can be selected. The send menu lists only agents the sender operates, each with its harness mark, and published workflows made of them.
- [ ] The work order screen merges every definition of done, tags each item with its tasks, drafts an editable prompt, resolves `@` mentions of context records and agent profiles, and will not send until the repositories are confirmed.
- [ ] A work order reaches the agent's runtime by one of the paths in §9.6, and the run records it as its task reference.
- [ ] A workflow file chains agents, hands off with quoted notes, returns within its bound, and parks for the operator when the bound is spent.
- [ ] The agent claims items with evidence, and a person accepts them. Nothing merges without a person.
- [ ] Every capability in §12 is gated, audited, documented, and tested, and the agent-facing tools load in all four harnesses.
- [ ] The four page audits in §15 pass against the build.
