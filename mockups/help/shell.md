# App shell

## Sidebar

The sidebar holds the organization and workspace switchers, the navigation with its counts, and the Stella launcher at its foot.

### Purpose
It answers two questions on every page: where am I, and where does something wait on me. You switch organization or workspace from the two cards at the top, move between the seven workspace areas and the three organization pages, and read a count only where a person has to act. The foot opens Stella and shows the size of the organization and whether the control plane answers.

### Rationale
`docs/fleet-operations-ia.md` (Workspace navigation) fixes the order: Work, Agents, Tools, Steering, Runtimes, Spend and Repositories, then Organization, Billing and Audit. Work comes first because the workspace opens on the work (D1 in `docs/fleet-operations-wedge.md`). The Fleet page is gone (D3), and its waiting count moved to the Approvals button in the top bar, so no sidebar count repeats approvals. A count is drawn only where something waits on a person, which keeps a badge meaning "act here": Agents, Spend, Organization and Billing carry none. The Stella launcher sits at the foot (D16, `docs/mission-control-spec.md` §4.4), and the top bar carries no assistant button.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Organization name, slug and plan | `ORG` (`fixtures/org.json`) | `list_orgs` (`packages/oxagen/src/contracts/org.list.ts`), which returns each organization and your role in it | partial |
| Workspace name, main repository, branch, provisional date | `WS` (`fixtures/ws.json`), `ws()` | `list_workspaces` (`workspace.list.ts`) | partial |
| Work count | `tkWaiting()` plus `woWaiting()` | work items whose definition of done is a draft or changed, plus work orders waiting on you | future-only: `get_nav_counts` returns no Work count |
| Tools count | `proposals()` over `TOOLS` | observed output schemas waiting for approval | future-only |
| Steering count | `stgNavCount()`: `PROPOSALS` plus `recprOpenCount()` | `get_nav_counts` open proposals (`agent.steering_proposals`) | partial: record pull requests are not counted |
| Runtimes count | `RUNTIMES` whose `health` is not `ok` | runtime health | future-only: no runtime capability in the contracts |
| Repositories count | `oxprOpen()` | pull requests Oxagen opened | future-only |
| Audit count | `INCIDENTS`, open and critical | `get_nav_counts` incidents (`tacho.incidents`) | shipped |
| Agents in this organization | the sum of `WS[].agents` | `list_agents` per workspace | partial |
| Connected badge | fixed in `sidebar()` | control plane reachability | future-only |

### Logic
1. `sidebar(r)` builds the rail. `item()` marks the entry whose label matches `PAGES[r.page]` with `aria-current="page"`.
2. `ct(n, one, many, tail)` turns a count into `[n, title]`, and `navCt()` draws it with a hidden space and a title that says what it counts ("8 items waiting on you", "2 hosts not healthy"). A zero draws nothing.
3. Work, Tools, Runtimes and Audit counts are `hot` (warning ink). Steering and Repositories are plain, because an open proposal or pull request is a queue, and a sick host or a critical incident is a fault.
4. On first-run Work (`obFirstRun(w)` returns the smoke run) every count is zero and the footer reads 1 agent, because the organization holds one run.
5. The organization card opens `org-switch`, the workspace card opens `ws-switch`. A provisional workspace shows "provisional until" its date in place of the repository and branch.
6. Scenarios appears only without `?product=1`. It is a mockup control.
7. `asstLaunch()` draws the Stella launcher (see the Stella drawer help, Launcher).

### States
Loaded only. The sidebar is the same in every page state: a page's loading, error or denied panel replaces the page body and leaves the shell alone. On a phone the rail is hidden and the top bar's menu button opens it as a drawer over a scrim (`S.side`). A tap on the scrim closes it.

## Top bar

The top bar carries the breadcrumbs, search, notifications, the Approvals button and your avatar.

### Purpose
It tells you where you are in the hierarchy and gives you four things that apply on every page: search or run an action, read what happened since you last looked, decide what waits on you, and reach your account.

### Rationale
Every page shares one bar, so a decision or a search never needs a page of its own (`docs/fleet-operations-ia.md`). The Approvals button replaced Fleet's waiting tile (D3) and opens a drawer from every page (D16). The crumbs of a run pass through its work order, because a run is a child of exactly one work order (D2). The assistant has no button here: its launcher is in the sidebar, and the whole-app audit fails a build that adds one.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Crumbs | `crumbs(r)` over the route, `run()`, `runParent()`, `taskById()` | the route and the record on the page | partial: a run's work order needs a `work_order_id` on the run |
| Unread count and dot | `notifUnread()` over `NOTIFS` | `list_notifications` with `unreadOnly` (`notification.list.ts`) | shipped |
| Approvals count | `apdCount()` | `list_approvals` summed over the organization's workspaces | partial (see the Approvals drawer help) |
| Avatar | `personAv("marcus")` | `update_profile` avatar | shipped |

### Logic
1. `topbar(r)` draws, left to right: the menu button (phone only), the crumbs, a spacer, the search button, the bell, `apdButton()`, and the avatar.
2. `crumbs(r)` always starts with the organization. Organization pages end on Organization, API keys, Billing or Audit. Workspace pages add the workspace, then the page. A work item ends on its number, a work order on its id, and a run on its id after Work orders and its parent work order.
3. The search button opens `cmd`. Command or Control with K opens it from anywhere.
4. The bell's aria-label is "Notifications, N unread", and it carries a dot while anything is unread. It opens `notifs`.
5. The Approvals button shows the shield and the count ("99+" above 99), with `aria-pressed` while the drawer is open.
6. The avatar toggles the account menu (`toggleLayer('user')`). A click outside `.rel` closes it.

### States
Loaded only, and the same in every page state. On a phone the bar shows the menu button, the current crumb, the search glyph, the bell, Approvals and the avatar.

## Thumb bar

The thumb bar is the phone's navigation: five slots along the bottom edge.

### Purpose
On a phone it replaces the sidebar with the four places you open most, Work, Agents, Tools and Spend, and More, which holds everything else in one sheet.

### Rationale
`docs/fleet-operations-ia.md` (Phone) names the five slots. A thumb reaches the bottom quarter of a 390 by 844 screen without a grip change, so each slot sits there with a hit area of at least 44 px. Counts follow the sidebar's rule: only where something waits on a person.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Work count | `tkWaiting()` plus `woWaiting()` | as in the sidebar | future-only |
| More count | open critical `INCIDENTS` | `get_nav_counts` incidents | shipped |

### Logic
1. `mobileNav(r)` draws the five slots. Work, Agents, Tools and Spend call `go()`. More opens the `more` sheet.
2. The lit slot follows the page. A run, a work item and a work order light Work. An agent and its source light Agents. Any page in `MNAV_MORE` (Steering, Runtimes, Repositories, Organization, Billing, Audit, a Steering source) lights More, and so does the open sheet.
3. Work carries its count in warning ink. More carries the open critical incident count. The whole-app audit asks More to carry the counts of everything it holds. The mockup carries only Audit's, so a build that sums Steering, Runtimes and Repositories onto More goes further than the mockup.
4. On first-run Work both counts are zero.

### States
Phone only. It stays visible under the drawers and sheets. The Stella drawer's foot line sits under it in the mockup (see the Stella drawer help, Composer).

## Account menu

The account menu opens from your avatar and leads to the Account dialog, the theme and sign out.

### Purpose
It is the one place for things that belong to you rather than to the organization: your profile, preferences, security and data, and the theme.

### Rationale
Account is a dialog, not a page (whole-app audit, check A2), so the menu opens it on the tab you picked. The theme switch sits here as well as in Preferences because it is the one setting people change often.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name and email | fixed in `userMenu()` | the session user | shipped |

### Logic
1. `userMenu()` lists Account, Preferences, Security and sessions, and Privacy and data. Each opens `account` on its tab.
2. Onboarding demo appears only without `?product=1`. It is a mockup control that opens the onboarding screens.
3. Switch theme calls `toggleTheme()`, which cycles light, dark and system.
4. Sign out closes the menu in the mockup. A build ends the session and returns to Log in.

### States
Loaded only.

## Notifications {#dialog/notifs}

The notifications dialog lists what happened while you were away, newest first, and marks each item read when you select it.

### Purpose
It answers "what changed that I should know about": an approval requested or resolved, a budget reached, a pull request opened, a run sealed or halted, a kill switch flipped. Selecting an unread item marks it read, and the footer shows how many remain.

### Rationale
The bell is on every page, and the dialog carries each event's own sentence, so you read the fact without opening the record. An approval notice announces a decision, and the decision itself stays in the Approvals drawer.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Title, body, time, tone | `NOTIFS` (`fixtures/notifs.json`, 8 items, 3 unread) | `list_notifications` (`notification.list.ts`): `title`, `kind`, `event` | shipped |
| Kind in mono | `NOTIFS[].kind` (`approval.requested`, `budget.breached`, `steering_pr.opened`, `run.sealed` and more) | `event`: `approval.requested`, `approval.resolved` or `budget.breached`; `kind`: system, approval, run, member or security | partial: five of the mockup's eight kinds have no producer |
| Mark read | `notifRead(i)`, `markAllRead()` | `mark_notification` (`notification.mark.ts`) | shipped |
| Read audit event | `auditEvent("notification_read", …)` | none: the contract calls the mark a settings write, not a governed action | future-only |

### Logic
1. `notifsBody()` draws one row per item: the tone icon, the title, the body, the kind, and the time.
2. An unread row is a button labelled "Mark read: <title>". A click, Enter or Space calls `notifRead(i)`, which marks it read, writes one `notification_read` audit event, and moves focus to the next unread row, or to the close button when none is left. A read row is plain text.
3. The footer reads "N unread · select one to mark it read", or "All read" with Mark all read disabled.
4. Mark all read writes one audit event per unread item, closes the dialog, and posts "All notifications marked read. Audit records who read each one."
5. The bell's dot goes when nothing is unread.

### States
Loaded, and the all-read case above. On a phone the dialog rises as a bottom sheet.

## Command menu {#dialog/cmd}

The command menu searches pages, records and actions from any page, and runs what you pick.

### Purpose
You type a few words and jump to a page, a work order or a run, start a creation wizard, open Stella, or run an action. Tools on the workspace's toolbelt appear with the risk and side effect the model sees for each.

### Rationale
One keyboard entry point saves a trip through the sidebar for anything you know by name. `docs/fleet-operations-ia.md` (Command menu) sets Command or Control with 1 to 5 for Work, Agents, Tools, Steering and Spend. The toolbelt group returns only tools on the toolbelt: what an agent cannot call, it cannot find, which also stops a prompt injection from naming a tool outside it. The mockup's footer once named the search `search_tools` and said the search is a governed call recorded as a frame. That is the agent's meta-tool. The operator's menu reads `search_command_menu`.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Groups and items | `CMDS` (fixed) | `search_command_menu` (`command.menu.search.ts`): up to 8 typed rows, each with an href, filtered by your grants | partial |
| Suggestions for the page | none | `suggest_commands` (`command.menu.suggest.ts`) | future-only in the design |
| Toolbelt hits | `cmdBeltHits()` over `BELT` and `beltMember()` | the workspace toolbelt | partial |

### Logic
1. `cmdMenu()` filters every group live on `S.cmdq`. `cmdHit()` needs every typed word to appear, and splits API names on `_`, `@` and `.`, so "create release" finds `github__create_release@2`.
2. The groups, in order: Go, Assistant, Create, Work orders, Runs, Actions, and Tools on the toolbelt. The IA lists Stella, Agents and Approvals groups the mockup does not draw yet.
3. An item whose target starts with `!` runs that code. A route item calls `go()`. An action with no target posts "<label>. Recorded as a governed action with a receipt."
4. A toolbelt hit shows its label, description, hazard and decision, and opens the `tool` dialog.
5. Arrow keys move the selection (`cmdKey()`), Enter opens it, Escape closes. Focus returns to the field after every keystroke (`cmdFocus()`).
6. "Onboarding demo" items are mockup controls.

### States
With no match: "Nothing on your toolbelt matches “<query>”." On a phone the menu rises as a bottom sheet.

## More {#dialog/more}

The More sheet holds every destination the thumb bar has no slot for.

### Purpose
On a phone it is the rest of the sidebar, search, notifications, the account and both switchers, one tap away from the thumb bar.

### Rationale
`docs/fleet-operations-ia.md` (Phone) lists what More holds: Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. Each tile carries one line naming what the page holds, because the tiles have no icon rail to scan.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Steering count | `stgNavCount()` | `get_nav_counts` proposals | partial |
| Runtimes count | `RUNTIMES` not `ok` | runtime health | future-only |
| Repositories count | `oxprOpen()` | pull requests Oxagen opened | future-only |
| Audit count | open critical `INCIDENTS` | `get_nav_counts` incidents | shipped |
| Unread notifications | `notifUnread()` | `list_notifications` | shipped |

### Logic
1. `DLG_EXT.more` draws three grids: the pages, then Stella, Search, Notifications and Account, then the two switchers.
2. Every tile closes the sheet before it acts, so the page or dialog it opens is not stacked on the sheet.
3. Counts follow the sidebar. On first-run Work the Steering count is zero.
4. The Stella tile reads "Ask stella*" with the launcher's second line and opens the drawer (`asstToggle(true)`).
5. Scenarios appears only without `?product=1`.

### States
Phone only in the design. It opens on desktop too, from the check tools.

## Account {#dialog/account}

The Account dialog holds your profile, your preferences, your sign-in and sessions, and your data.

### Purpose
You change your display name and avatar, set the locale, currency, time zone and theme, manage two-factor and sessions, and export your activity. You also see the roles you hold.

### Rationale
Account is a dialog from the user menu, not a page (whole-app audit A2). Several fields show a fact without the control that changes it: roles change on the Organization page by someone who holds the member-role capability, so the profile tab shows what you hold. The currency is display only. The value of record stays the provider's billing currency, and each converted number carries its rate and source. The locale formats dates, numbers and currencies, and model-written prose (findings, explanations) is generated in it and recorded on the frame. Machine-readable fields in records, receipts and exports stay untranslated. A passkey replaces the password and leaves the second factor in place. Revoking a session touches no agent credential and no run token. You stop an agent from the Agents page. An export is a signed bundle of archive segments, attestations, key ids and a verifier script, so an auditor can check the chain offline without trusting Oxagen. It runs as `export_data`. Frame bodies are written once and kept for seven years, and personal data is redacted before write.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Display name, avatar | fixed in `accountBody()` | `update_profile` (`user.profile.update.ts`) | shipped |
| Locale, currency, time zone, theme | fixed; theme calls `setTheme()` | `get_user_preferences`, `set_preferences` (`user.preferences.read.ts`, `user.preferences.set.ts`) | shipped |
| Roles | fixed | `list_orgs` role; `change_member_role` writes it (`org.member_role.change.ts`) | partial |
| Two-factor, passkey, sessions | fixed | none in `packages/oxagen/src/contracts` | future-only |
| Export | toasts | `export_data` (`privacy.data.export.ts`) | shipped |
| Erasure | one line naming `erase_data` | `erase_data` (`privacy.data.erase.ts`): confirmed, revokes every session, schedules the hard delete; organization scope needs Owner | shipped on the API; the app offers no button, as the mockup does |
| Retention | fixed | the organization's retention settings | partial |

### Logic
1. `accountTabs()` draws Profile, Preferences, Security and Privacy. Onboarding is a mockup control, shown only without `?product=1`, with Close as its only button.
2. Profile: Edit avatar calls `openAvatar('person:marcus')`, and the editor returns here on Save or Cancel.
3. Preferences: the theme select applies at once. The Preview shows a date, number, money and duration in the chosen format.
4. Security: Regenerate codes, Add and Revoke post toasts in the mockup.
5. Privacy: the two export buttons queue an export. An organization export asks an owner. Erasure has no button: it runs on the API with explicit confirmation, ends every sign-in at once, and schedules the hard delete, which is why the tab only names the capability.
6. Save posts "Saved." `set_preferences` is a partial write: only the fields sent change.

### States
Loaded only. On a phone the dialog rises as a bottom sheet.

## Switch organization {#dialog/org-switch}

The organization switcher lists the organizations you belong to and marks the current one.

### Purpose
You move to another organization, or confirm which one you are in.

### Rationale
An organization is the tenant: it owns a key-encryption key, a database partition, a billing account, and optionally a dedicated data plane (`docs/mission-control-spec.md`, Organization). Switching changes all four, so it is a deliberate step from the sidebar's top card, not a menu item.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Organizations, plan, agent count | `ORG` (one) | `list_orgs` (`org.list.ts`), with your role in each | partial |

### Logic
1. The search field filters the list in a build. The mockup has one organization, marked current.
2. Selecting the current organization closes the dialog.
3. `list_orgs` reads only your own memberships, so the list holds no organization you do not belong to. It runs before any organization is chosen, which is why the CLI's `oxagen login` calls it first.

### States
Loaded only.

## Switch workspace {#dialog/ws-switch}

The workspace switcher lists the workspaces of this organization and opens the one you pick.

### Purpose
You move between workspaces, each with its own main repository, branch and agents, or create a new one.

### Rationale
Everything under Workspace in the sidebar is scoped to one workspace, so the switcher sits in the sidebar's second card. Each row shows the main repository and production branch, because those are what make one workspace different from another.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, main repository, branch, agent count | `WS` | `list_workspaces` (`workspace.list.ts`) | partial |

### Logic
1. One row per workspace you can use. The current one carries "current". `list_workspaces` checks that you belong to the organization before it lists anything, and answers a non-member with an error.
2. Selecting a row sets `S.ws` and goes to the workspace root, which opens Work.
3. Create a workspace opens `newws` (Organization help).

### States
Loaded only.

## Create {#dialog/create}

The Create dialog is the chooser for everything an operator authors: an agent, a tool, a skill, a Steering record, a Markdown import, or the `.oxagen/` tree in a repository.

### Purpose
You pick what to create and the matching wizard opens. Each card names the file it will write.

### Rationale
All six are the same kind of object: a file in a repository. `docs/creation-spec.md` gives them one path: you describe it, Oxagen drafts the file, you read the file, a pull request publishes it, and it exists when someone merges it. A reviewer can stop it at the pull request. The one exception is a memory from the Markdown import: it is written when you publish the import, and it steers at `may` or below.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Cards | `CREATE` (fixed) | none: the kinds are fixed in the design | shipped |
| Workspace and main repository | `ws()` | `list_workspaces` | partial |

### Logic
1. `DLG_EXT.create` draws one card per `CREATE` entry: its icon, name, description and file path.
2. A card calls `wzOpen(kind)`, which replaces this dialog with the wizard (the creation wizards' help).
3. The footer names the workspace and its main repository, where every pull request opens.

### States
Loaded only.

## Avatar editor {#dialog/avatar}

The avatar editor sets the picture for a person, an agent, a workspace or an organization: an icon, up to six letters, or a photo, in one of five tones.

### Purpose
You give a record a mark you can tell apart at 18 px. The preview draws the draft at 72, 36, 24 and 18 px, the sizes the product uses.

### Rationale
One editor serves every record so a mark looks the same wherever it appears (`mockups/pages/agent.md`, the avatar editor). The icons are the Lucide glyphs the product ships, drawn at one line weight in the tone's ink. Solid, Soft and Line follow the theme. Gold and Dark gold are the brand gold in two shades. Each tone fixes its own glyph colour, so no combination fails contrast. An agent's avatar is part of its definition, so a change rides a pull request. The other three save on their own records: `update_profile` for you, `update_workspace_settings` for a workspace, and `update_org_settings` for the organization.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Your avatar | `PEOPLE[].avatar` | `update_profile` | shipped |
| Workspace avatar | `WS[].avatar` | `update_workspace_settings` `avatarUrl` | shipped |
| Organization avatar | `ORG.avatar` | `update_org_settings` `avatarUrl` | shipped |
| Agent avatar | `AGENTS[].avatar` | the agent definition, through a pull request | partial |

### Logic
1. `openAvatar(target)` reads the stored avatar (`avRecord()`) and starts the draft from it (`avDraftFrom()`), so you edit what is there.
2. Kind switches between Icon (24 glyphs, `AV_ICON_ORDER`), Initials (up to `AV_MAX`, 6 letters, in Sans, Serif or Mono) and Photo (an https link).
3. Tone offers the five `AV_TONES`, each swatch drawn as the draft itself.
4. Typing patches the preview in place (`avPatch()`), so the field keeps focus.
5. Save validates: a photo needs an https link under `AV_URL_MAX` (512) characters, and initials need one letter. A refusal shows under the fields until the next edit.
6. Remove avatar appears when one is stored and returns the record to its default initials.
7. After Save or Cancel, `avReturn()` goes back to where the editor opened: Account, the Register dialog, the agent wizard, or the page.

### States
Loaded, and the refusal. On a phone the dialog rises as a bottom sheet.

## Request access {#dialog/request-access}

The request access dialog asks an organization owner for a role you lack.

### Purpose
From a page's denied state you name the role you need and why, and send the request to someone who can grant it.

### Rationale
A denied page names the permission it needs, so the next step is a request, not a support ticket. Granting a role is a governed action: it lands in the audit record with the granter's name, your name and your reason.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Role requested, reason | fixed | an access request | future-only: no request capability in the contracts |
| The grant | none | `change_member_role`, `set_role_grants` | partial |

### Logic
1. Denied states open this dialog from their Request access button.
2. Send the request posts "Request sent to Priya Natarajan." and closes.

### States
Loaded only.

## Loading skeleton {#shell/loading-state}

The loading skeleton holds a page's shape while its first read is in flight: four tile blocks over one panel of seven rows.

### Purpose
It tells you the page is on its way and where its parts will land, so nothing jumps when the data arrives. There is nothing to do on it.

### Rationale
Every list and record page draws the same skeleton, so a slow read looks the same everywhere. It carries no copy: a spinner line such as "Loading agents" would say what the shape already says. A page that owns a busy control (a gate step's primary button) shows that control's own busy state instead.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| The shape | `skeleton()` in `engine.js` | none: the app draws it before the first response | shipped |

### Logic
1. A page renderer returns `skeleton()` when `S.state` is `loading`, before it reads any collection.
2. The four `.sk.b` blocks stand for the tile row, and the panel's seven `.sk.r` rows for the first table.
3. `?state=loading` pins it. The review island's State switch sets it on any page that has the state.

### States
It is the loading state. On a phone the four blocks stack two across and the panel runs full width.

## Empty panel {#shell/empty-state}

The empty panel stands in for a list that has nothing in it: an icon, a heading, one sentence, and the action that fills the list.

### Purpose
It says the list is empty on purpose, not broken, and puts the one action that starts it in reach, such as **Add provider** on Tools or **Enroll a runtime** on Runtimes.

### Rationale
A table with only its header row reads as a failed read. A named empty state with its first action keeps you on the page. Each page writes its own heading and sentence, because only the page knows what an empty list of its records means.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Heading, sentence, actions | the caller of `emptyState(t, p, acts)` | the list read returning zero rows | shipped |

### Logic
1. A page renderer returns `emptyState()` when `S.state` is `empty`, or when its collection is empty in the loaded state.
2. The heading names what is missing ("No runtimes enrolled"). The sentence says what fills it. The actions are the page's own.
3. The panel draws no table and no tiles.

### States
It is the empty state. On a phone the actions stack full width.

## Error panel {#shell/error-state}

The error panel replaces a page whose read failed: "<page> could not be loaded", the error the control plane returned, and two ways forward.

### Purpose
It tells you the read failed, that nothing changed, and that your fleet kept working. You try again, or open an incident if the failure persists.

### Rationale
A failed page read is the control plane's problem, not the fleet's. Frames are written by the collector on each host, not by Oxagen, so runs keep recording while a page is down, and the panel says so to stop a person from pausing agents over a dashboard error. It names the exact code (`503 iam_principals_unavailable`, `502 stripe_unreachable`) so the incident starts from a fact.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| What failed, code | the caller of `errorState(what, code)` | the failing read's error response | partial: the codes are the mockup's |
| Trace line | fixed `trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z` | the request's trace id, region and time | future-only |

### Logic
1. A page renderer returns `errorState()` when `S.state` is `error`.
2. **Try again** re-renders the page (`render()`). A build retries the read.
3. **Open an incident** opens the `incident` dialog with the page and code filled in.
4. The trace line under the actions is mono and dim. A build prints the real trace id.

### States
It is the error state. On a phone the actions stack full width and the trace line wraps.

## Access denied panel {#shell/denied-state}

The access denied panel replaces a page you lack the role for: "You cannot see <page>", the permission you are missing, and who can grant it.

### Purpose
It names the exact permission the page needs, so you can ask for it, and it takes you back to Work if you cannot wait.

### Rationale
A denial that says only "Forbidden" sends a person to support. This one names the permission (`agent.read on core-platform`) and the policy version that decided (`pol_v41`), so an owner can grant the right thing. The grant is a governed action and lands in the audit record with your name on it. In the policy engine a deny wins over every allow, which is why Decided by names one policy version and not a list of roles.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| What, needed permission | the caller of `deniedState(what, need)` | the authorization error's required permission | partial |
| Signed in as | `me().name`, `me().role` | the session | shipped |
| Decided by | fixed `pol_v41` | the policy version on the decision | partial |

### Logic
1. A page renderer returns `deniedState()` when `S.state` is `denied`.
2. **Request access** opens `request-access`. **Back to Work** goes to the workspace's Work page.
3. The key-value block lists Signed in as, Needed and Decided by.

### States
It is the denied state. On a phone the actions stack full width and the key-value block runs full width.
