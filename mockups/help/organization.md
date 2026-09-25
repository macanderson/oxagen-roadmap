# Organization

## Page header {#organization/header}

The header names the organization you administer and holds the three actions that start most administration.

### Purpose
You land here to change who belongs to the organization and how its workspaces are set up. The header answers "which organization is this" with its name, and offers the three actions an owner takes most: **Edit avatar**, **Invite** and **Create a workspace**. Every Organization tab shares this header, including Roles (`#/a-intel/roles`) and API keys (`#/a-intel/api-keys`).

### Rationale
The tabs below the header hold people, roles, invitations, workspaces, cost centers, model funding and routes, the data plane and API keys. That list used to sit under the h1 as a subtitle. The tab bar already names every tab, so the subtitle repeated it, and the page now shows the eyebrow and the name alone. Mission Control spec §14 gives the organization page this job: the tenant's administration in one page. Creating a workspace is the gold action because a workspace is the unit everything else hangs on (§5.1). **Invite** sits in the header as well as on People and Invitations because it is the first thing a new owner does.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow | literal "Organization" | none | live |
| Name (h1) | `ORG.name` from `FIXTURES.ORG` (`mockups/fixtures/org.json`) | `org.organizations.name` | live |
| Organization avatar | `ORG.avatar` | `update_org_settings` `avatarUrl`, read from `list_workspaces` | live |

### Logic
1. `pOrganization()` renders the header after the state checks and before the tab bar. It returns early for loading, error, denied and empty, so those states replace the header with the body.
2. **Edit avatar** calls `openAvatar('org')`, the one avatar editor the agent page and Account also open. Saving writes `update_org_settings` with the avatar alone.
3. **Invite** opens `invite`. **Create a workspace** (gold) opens `newws`. Both write the arrays the tabs read (`INVITES`, `WS`), so the new row appears behind the dialog.
4. `islPageId()` maps the `keys` and `roles` tabs to their own catalog pages. Their header key falls back to this section through the family rule in `islFamily()`.

### States
- **Loading**: `skeleton()` replaces the page body, header included. The shell stays.
- **Empty**: `emptyState()` reads "This organization has no workspaces", with the rule that a workspace owns one main repo and cannot exist without it, and a gold **Create a workspace**.
- **Error**: `errorState("Organization","503 control_plane_unavailable")`, with **Try again**, **Open an incident** and a trace line.
- **Denied**: `deniedState()` names the missing `org.admin`, with **Request access** and **Back to Work**.
- **Mobile**: the three actions sit on one row under the name, each at least 44 px tall.

## Tab bar {#organization/tabs}

Eight tabs split the organization's administration, and two of them have addresses of their own.

### Purpose
The bar tells you where each kind of setting lives and how many rows it holds before you open it. You pick a tab to switch the body. You can link straight to Roles or API keys, for example from the command menu or the docs.

### Rationale
The organization page carries every tenant setting (Mission Control spec §14). Tabs keep that on one page without one long scroll. Counts appear only where a tab is a list: People, Roles, Invitations, Workspaces and Cost centers. Model funding and routes, Data plane and API keys carry no count, because a count there would not tell you anything to act on. Roles and API keys got routes of their own so a link lands on the list, not on People (`organization-api-keys.md`, Functionality).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| People count | `MEMBERS.length` | `org.org_users` | live |
| Roles count | `ROLES.length` | `iam.roles` | live |
| Invitations count | `INVITES.length` | `org.invitations` | live |
| Workspaces count | `WS.length` | `workspace.workspaces` | live |
| Cost centers count | `CC.centers.length` from `FIXTURES.COST_CENTERS` | `cost.cost_centers` | live |

### Logic
1. `pOrganization()` builds the bar from one array of `[key, label, count, title]`. `tabN()` draws a count only when it is non-zero and puts the plural noun in its `title`.
2. The selected tab is `S.tab.organization`, read through `tab("organization","people")`. People is the default.
3. `orgTab(t)` sets the tab and writes the address: `#/a-intel/api-keys` for `keys`, `#/a-intel/roles` for `roles`, and `#/a-intel` for every other tab. When the address already matches, it calls `render()` instead.
4. `route()` reads `/api-keys` and `/roles` back into `S.tab.organization`, so a reload or a shared link opens the same tab. The bare address `#/a-intel` resets a `keys` or `roles` tab to People, so the Back button from API keys lands on People.
5. The bar is `role="tablist"`, and each tab is `role="tab"` with `aria-selected`.

### States
- **Loaded**: eight tabs, five with counts.
- **Empty, loading, error, denied**: the bar does not render. The state body replaces it.
- **Mobile**: the bar scrolls sideways inside itself. The page does not.

## People

Every member of the organization, with the role, workspace, two-factor method and last activity the admin needs to review access.

### Purpose
You review who can reach this organization and act on one person from their row: **Open** reads their record, **Change role** moves them, and **Remove** ends their access. The table answers "who has access, with what, and are they still using it".

### Rationale
A person belongs to an organization with one org role and to workspaces with one role each (Mission Control spec §5.1). The Role column shows the role id alone (`org.owner`, `workspace.member`), so it has five values and earns a filter. The workspace sits in its own column. The "two-factor required" badge states the organization's sign-in policy. A role change passes IAM, writes an audit event and appears in Audit with the actor's name. Membership writes are free. `resolve_approval` is the only billable governed action (§12.1, 2026-09-15 maintainer decision). The Roles tab carries each role's holder count, so no "Roles in use" panel sits under this table.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Person, email | `PEOPLE[m.p].name`, `.email` | `org.org_users` joined to identity | live |
| Role | `PEOPLE[m.p].role`, split at " · " | `org.org_users.role` | live |
| Workspaces | `MEMBERS[].ws` | workspace memberships | live |
| Two-factor | `MEMBERS[].mfa` | identity factors | live |
| Last seen | `MEMBERS[].last` | session activity | live |
| Status | `MEMBERS[].status` (active, invited) | `org.org_users.status` | live |

`MEMBERS` starts from `mockups/fixtures/members.json` (Priya, Marcus, Dana) and the `volume()` generator adds a workspace owner per workspace and the rest of the 51 people.

### Logic
1. `pOrganization()` maps `MEMBERS` to rows. An active status draws a green chip. An invited one draws a neutral chip.
2. Last seen is never later than the mock's current time, 2026-09-11 09:14.
3. The list controls (`lt*` in `engine.js`) add a search box over every column, filters for Status, Two-factor and Role, sorting on every named column, and a rows-per-page select.
4. **Open** opens `member`. **Change role** opens `role`. **Remove** opens `removemember`, which disables its button while any agent acts on the person's behalf.
5. **Invite** in the panel header opens `invite`.

### States
- **Loaded**: 51 rows, ten per page.
- **Empty**: the organization-wide empty state replaces the tab.
- **Mobile**: each row becomes a card with every cell labelled by its column.

## Pending invitations

Invitations sent and not yet accepted, with who sent each one and when it lapses.

### Purpose
You see who has been offered access and has not taken it, and you resend or revoke an offer. The table answers "who is about to join, with what role, and by when".

### Rationale
An invitation is the only way into the organization. Accepting one takes a verified email and two-factor, so no one joins with a password alone (Mission Control spec §5.1 and the `accept-invitation` page). An invitation lapses after seven days, so a stale offer does not stay open. The Role offered column shows the role and, for a workspace role, its workspace, because that pair is what the person gets on accepting.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Email | `INVITES[].email` | `org.invitations.email` | live |
| Role offered | `INVITES[].role` | `org.invitations.role` | live |
| Invited by | `INVITES[].by` | `org.invitations.invited_by` | live |
| Sent, Expires | `INVITES[].sent`, `.expires` | `org.invitations.created_at`, `expires_at` | live |

`INVITES` starts from `mockups/fixtures/invites.json` and `volume()` adds 11 more.

### Logic
1. `pOrganization()` maps `INVITES` to rows in fixture order.
2. **Resend** calls `inviteResend(email)`. It restarts the clock: sent becomes 2026-09-11, expires becomes 2026-09-18, and Invited by becomes you. The toast says the new expiry.
3. **Revoke** opens `invrevoke`. Confirming calls `inviteRevoke()`, which removes the row and ends the link.
4. **Invite** opens `invite`. `inviteSend()` refuses an email that already has an open invitation and appends a row otherwise.
5. The build writes each of these as `org.member.invite` and records it in Audit.

### States
- **Loaded**: 13 rows.
- **No rows**: the list controls show an empty table with the Invite button still in the header.
- **Mobile**: rows become labelled cards.

## Workspaces

Every workspace in the organization, with its main repo, production branch, governance mode and the actions that change it.

### Purpose
You see how the organization is partitioned and open, edit, restyle or archive one workspace. The table answers "which repository does each workspace answer to, who owns it, and how strict is it".

### Rationale
A workspace is a governance partition. It owns one main repo, one steering set, its agents, tool grants and budgets (Mission Control spec §5.1). The main repo is required at creation (§10.1). A repository may be linked to more than one workspace, and it is main for at most one. Changing which repository is main is an org-owner action with approval, recorded as a security event, so Edit shows the main repo read-only. The Governance chip shows the workspace's mode (`solo`, `team` or `regulated`) with the retention mode and namespace under it, because those three decide what an agent there may do and what the record keeps.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Workspace, slug | `WS[].name`, `.slug` | `workspace.workspaces` | live |
| Main repo, Linked repos | `WS[].main`, `.linked` | repository links | live |
| Production branch | `WS[].branch` | repository link `production_branch` | live |
| Agents | `WS[].agents` | count of `agent.agents` | live |
| Owner | `WS[].owner` | workspace owner membership | live |
| Governance | `wsGov(w)` over `WS[].governance` | `.oxagen/rules/governance.toml` on the main repo | not built |
| Retention, namespace | `WS[].retention`, `.ns` | `workspace.workspaces` | live |

### Logic
1. `pOrganization()` maps `WS` to rows. `wsGov(w)` returns `team` when a workspace names no mode.
2. A block beside the Organization section fills defaults once: `ns` from the slug's first segment, `retention` as `content_exact`, and `budgetDay` as `20.00`.
3. **Open** sets `S.ws` and goes to the workspace. **Edit** opens `editws`. **Edit avatar** calls `openAvatar('workspace:<slug>')`. **Archive** opens `archivews`, which stays disabled while any agent is registered there.
4. **Create a workspace** opens `newws`. `wsCreate()` appends a row that is provisional for 14 days.
5. The list controls add filters on Governance and Production branch.
6. The build shows Edit avatar on live workspaces only, because `update_workspace_settings` refuses an archived one.

### States
- **Loaded**: nine workspaces.
- **Empty**: the organization-wide empty state, with a gold Create a workspace.
- **Mobile**: rows become labelled cards, and the four row actions wrap.

## Cost centers

The labels spend is charged back to, with how many agents and workspaces name each one today.

### Purpose
Finance asks "which budget line does this spend belong to". This panel holds the list of labels you charge spend to and shows how widely each is used. An organization Owner, Admin or Billing member adds a label with **Add a cost center** and deletes one from its row.

### Rationale
ADR-142 adds cost centers as plain labels, so chargeback does not need a new hierarchy. Spend is charged to the agent's cost center, or to its workspace's when the agent names none. Spend with neither label lands on Spend as its own `~none` row. The agent's label wins because an agent can serve a budget outside its workspace. The rollup is frozen per run: changing a label moves new runs only, and runs already rolled up keep the label they had, so a closed month does not change under finance. The Agents and Workspaces counts tell you what a delete would affect before you open the dialog.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Label, Description | `CC.centers[].label`, `.description` | `cost.cost_centers` | live |
| Agents | `ccAgents(label)` over `CC.agents` | `agent.agents.cost_center` | live |
| Workspaces | `ccWorkspaces(label)` over `CC.workspaces` | `workspace.workspaces.cost_center` | live |
| Added | `CC.centers[].createdAt`, `.by` | `cost.cost_centers.created_at`, `created_by` | live |
| Who can write | `ccWriter(role)` over `PEOPLE` | IAM role check | live |

`CC` is `FIXTURES.COST_CENTERS` (`mockups/fixtures/cost-centers.json`). The calls mirror `list_cost_centers`, `create_cost_center`, `set_cost_center`, `delete_cost_center` and `export_cost_center_statement`.

### Logic
1. `orgCostCenters()` renders the panel. `ccCanEdit()` is true when your role matches `org.owner`, `org.admin` or `org.billing`.
2. `ccReady()` runs once. It charges the fixture's counted agents (`CC.assign`) to their labels and records in `CC.rolledBy` the label each agent's month rolled up to. Spend groups by that record through `ccOf()` in `wedge.js`.
3. `ccLabelOf(a)` returns the agent's own label first, then its workspace's, then none.
4. **Add a cost center** opens `ccadd`. **Delete** opens `ccdel`. For a reader, both call `ccDenied()` instead: a toast that names who holds the role, and no dialog.
5. Each write appends an Audit event: `cost_center_created`, `cost_center_deleted` or `cost_center_set`.

### States
- **Loaded**: four labels (ENG-1001, ENG-1040, FIN-2040, MKT-3300).
- **No labels**: the panel reads "This organization has no cost centers."
- **Read-only**: a viewer without the role sees the note "You can read this list..." naming the holders (`data-cc-readonly`). It is a state message about you, so it stays on the page.
- **Mobile**: rows become labelled cards.

## Workspace cost centers

Each workspace and the cost center its agents' runs roll up to when an agent names none of its own.

### Purpose
You set the default label for a whole workspace here. The table answers "where does this workspace's spend land" and offers **Change** per row.

### Rationale
Most spend follows the workspace, so a workspace default covers most agents with one setting (ADR-142). An agent charged to its own label keeps it whatever its workspace names. You charge an agent from its Identity tab, where `ccAgentCell()` shows the agent's label and where it came from. The workspace table lists every workspace, including those with no label, so a gap is visible as "None" and not as a missing row.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Workspace, slug | `WS[].name`, `.slug` | `workspace.workspaces` | live |
| Cost center | `CC.workspaces[slug]` | `workspace.workspaces.cost_center` | live |
| Agents | `WS[].agents` | count of `agent.agents` | live |

### Logic
1. `orgCostCenters()` builds this panel after the labels panel, one row per `WS` entry (`tr[data-cc-ws]`).
2. A workspace with no label reads "None".
3. **Change** opens `ccws` for a writer. `ccSetWs()` sets `CC.workspaces[slug]`, writes `cost_center_set` to Audit and toasts where new runs land. For a reader it calls `ccDenied()`.
4. Runs rolled up after the change land on the new label, except an agent's that names its own. Runs already rolled up keep their label.
5. Deleting a label on the Cost centers panel sets every workspace that named it to none.

### States
- **Loaded**: nine rows. FinOps names FIN-2040 and Data platform names ENG-1001.
- **Read-only**: rows render the same. Change refuses with a toast.
- **Mobile**: rows become labelled cards.

## Funding source

Who pays for Oxagen's own model calls in this organization, and the key those calls run on.

### Purpose
The in-app agent and Oxagen's own model work (reflection, promotion rationale, pull request bodies, run names) need a model key. This panel answers "whose key is it, is one held, and what has it spent". You pick a source, and then mint, rotate, revoke or save a key for it.

### Rationale
Three sources exist. `platform` is one Oxagen OpenRouter account for every customer, billed at vendor cost plus a published markup (§4.5). `customer_key` is your own OpenRouter or vendor key: you own and pay for it, and your tokens are reported and billed at zero. `platform_minted` became the default on 2026-09-15 (maintainer decision). Oxagen mints one OpenRouter key per organization on its own account. Oxagen owns, pays for, rotates and revokes it, and its tokens are billed. The provider reports that key on its own line, so the bill and Oxagen's ledger can be compared (see Reconciliation). With the shared key the provider returns one total for every customer, and Oxagen's meter is the only count.

No call reads a key from the environment. Keys and routes come from the model layer's resolver, and a code path that bypasses it is a defect. Every key is stored enveloped, tested before save and never returned to a screen. Screens show only the prefix. Every read of the key is an audit event. Minting a key is a governed action and puts your name on it.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Source | `ORG_KEY.source`, options `ORG_KEY_SOURCES` | `org.organizations.funding_source` | partial |
| Secret prefix, Provisioned id | `ORG_KEY.prefix`, `.provisionedId` | `org.model_credentials` | partial |
| Name on the account | `ORG_KEY.label` | provider key name | partial |
| Minted, rotated | `ORG_KEY.minted`, `.mintedBy`, `.rotated` | `org.model_credentials` | partial |
| Monthly cap, used | `ORG_KEY.capUsd`, `orgRoutesTotal()` | provider key limit, route totals | partial |
| Reads | `ORG_KEY.reads30` | audit events on the key | partial |
| Engine | `ASST_ENGINE_URL`, `ASST_ENGINE_VER` | engine config | fixture only |

### Logic
1. `orgKeyPanel()` renders one of three bodies. A customer key shows Key, Billing, Key storage, Engine, a password field and **Test and save**. A platform-minted or platform key shows Secret, Provisioned id, Name on the account, Minted, Monthly cap, Reads and Engine, with **Rotate** and **Revoke**. No key shows a note and **Mint a key for** the organization.
2. `orgKeyState()` is `none` when the source is `none`, or when the chosen source holds no key.
3. `orgKeySourceSet(v)` switches the source. Picking `customer_key` with no saved key leaves the organization without a key: no model call resolves and nothing is charged until you save one.
4. `orgKeySave()` keeps the first 13 characters as the prefix. In the product Oxagen calls `z-ai/glm-flash-latest` once with the key to check it, then envelopes it. `orgKeyClear()` removes it.
5. The badge reads the source when a key is held and "no key held" when not.
6. Monthly cap "used" is the Model routes total, so the two cannot disagree.

### States
- **Platform-minted** (default): the facts, Rotate and Revoke, then Reconciliation.
- **Customer key**: the key field, and Remove the key once one is saved.
- **No key**: "No key is held for Anderson Intelligence Corp. The in-app agent cannot run, and nothing has been charged."
- **Mobile**: the facts keep their two columns, and long values wrap.

## Reconciliation

Two independent figures for this month's spend on the organization's key, and the difference between them.

### Purpose
You check that what the provider says this organization spent equals what Oxagen debited. A difference means someone is over-billed or something went unbilled.

### Rationale
The two numbers come from two witnesses. The first is read off OpenRouter's usage report for this key. The second is summed from Oxagen's own credit ledger. Neither is derived from the other, so agreement means something. A shared key cannot produce this row, because the provider reports one total for every customer. That is the reason a platform-minted key exists at all (maintainer decision of 2026-09-15). The block renders only for `platform_minted`, and only while a key is held.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| OpenRouter reports | `ORG_KEY.providerUsd` | provider usage report, joined on `provisioned_id` | fixture only |
| Our credit ledger | `ORG_KEY.ledgerUsd` | `billing.credit_ledger` | partial |
| Difference | `orgKeyDrift()` | computed | live |

### Logic
1. `orgKeyPanel()` appends this block, with `data-help="reconciliation"`, when the source is `platform_minted` and `orgKeyHeld()` is true.
2. `orgKeyDrift()` is provider minus ledger, rounded to cents.
3. A zero drift draws a green "none" chip. A positive drift draws a red chip reading the amount "unbilled". A negative one reads "over-billed".
4. The build must read each figure from its own store and must never compute one from the other.

### States
- **Loaded**: $148.02 on both lines, difference none.
- **Customer key, platform key or no key**: the block does not render.
- **Mobile**: the facts keep their two columns, and long values wrap.

## Model routes

The model each tier of Oxagen's own work calls, its fallback, and what that tier used this month.

### Purpose
Oxagen's own work runs on four tiers: complex (reflection, promotion rationale, pull request bodies, run names), light (classification, labeling, redaction hints), embed and rerank. The table answers "which model answers each tier, and what did it cost". **Edit** changes a tier's provider, route or fallback.

### Rationale
These routes cover Oxagen's work only. Customer agents call their providers with their own keys, and Oxagen records what each harness reports. That spend is billed at zero (§12.1). Tiers point at rolling aliases such as `z-ai/glm-latest`, so "latest" stays current without a deploy. Every `model.response` frame records the concrete model id the provider returned. The cost record prices that id, so the record names the exact model and no price is looked up by alias. The Total carries its basis, "reported by harness", because Oxagen did not observe these calls at a gateway.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tier, use | `ORG_ROUTES[].tier`, `.use` | `org.organizations.model_routes` | partial |
| Provider, Route, resolves to, Fallback | `ORG_ROUTES[]` | `workspace.routing_policy` | partial |
| Use, Cost (complex) | `orgRouteUse(r)` over `SPEND.byModel` | Spend's model line | partial |
| Use, Cost (light, embed, rerank) | `ORG_ROUTES[].calls`, `.unit`, `.cost` | `cost.daily_totals` | partial |
| Total | `orgRoutesTotal()` | computed | live |

### Logic
1. `orgRoutesPanel()` renders one row per `ORG_ROUTES` entry and a Total row.
2. `orgRouteUse(r)` reads Spend's model line when the tier names a `spendModel`. The complex tier is meant to be the Oxagen line on Spend. The other tiers carry their own figures.
3. `orgRoutesOffSpend()` turns the light, embed and rerank tiers into Spend rows, so Spend's month total and its By model table carry every tier this page counts.
4. `orgUseCount()` shows tokens in millions for embed and calls for the rest.
5. **Edit** opens `editroute`. `orgRouteSave()` writes provider, route and fallback, and the change applies at the next model call.

Known defect: the complex row reads 0 and $0.00. `ORG_ROUTES[0].spendModel` is "z-ai/glm-latest (Oxagen)" and Spend's model line is "z-ai/glm-latest (oxagen)", so the lookup misses. Lowercasing it makes the row read about $22,000 against the $2,000 cap, because `volume()` generates that Spend line as 5 percent of the fleet's spend. The fix waits on a decision about what that Spend line holds.

### States
- **Loaded**: four tiers, Total $74.92.
- **Mobile**: rows become labelled cards, and the Total row stays last.

## Data plane

Where this organization's data lives, shown for the current mode, with a preview of the two other modes.

### Purpose
A security or procurement reviewer asks "where is our data, who holds the keys, and can it run behind our firewall". The panel answers for the current binding and lets you preview Dedicated and Behind the firewall. **Request a change of plane** opens `plane`. **Rotate keys** opens `rotatekek` and lands on Audit › Keys.

### Rationale
Every store is resolved per organization, so moving between modes is a deployment change and not a different product (ADR-042, Mission Control spec §5.2 rule 5). The three modes:
- **Shared**: tenant data in Oxagen's shared infrastructure, isolated by row-level security with no bypass setting.
- **Dedicated**: your own database cluster and object-storage bucket, with the same schema and the same row-level policies. Identity, IAM, billing and the price book stay in shared infrastructure by design. The key-encryption key sits in your KMS, and Oxagen does not hold the key material. The resolver is the only place a connection string is read. A call path that bypasses it is a defect, and CI fails on it.
- **Behind the firewall**: the same containers as a signed bundle you run. Outbound connections are optional, and fully air-gapped runs with every feature. Everything the cloud enforces, the appliance enforces, including the gateway whose sealed cost records you hand to your auditor. Stripe is not involved, and you apply a new bundle on your own schedule.

The attester key is published so a customer can verify an export offline. The gateway's loopback proxy on every host reports to it, so metering is observed. The bundle's release key is the one an evidence bundle is checked against.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Binding, region | `ORG.dataPlane`, `ORG.region` | `org.data_planes` | live |
| Key-encryption key | literal `kek_aintel_2026Q3` | KMS per organization | not built |
| Attester key | `ORG.attester` | published key registry | partial |
| Firewall facts, outbound table | literals in `planeDetail()`, `FW_OUTBOUND` | appliance manifest | fixture only |

### Logic
1. `orgPlaneBody()` shows `S.planeView`, or `ORG.dataPlane` when you have not picked one. The segmented control lists `PLANE_MODES` and marks the current mode.
2. A mode other than the current one shows the note "Preview. Nothing below is in effect" (`data-plane-preview`).
3. `planeDetail(v)` returns the facts for the mode, and for the firewall mode the Outbound connections table.
4. **Rotate keys** is a KEK rotation. `rotateKek()` retires the active generation, adds the next, writes `key.rotated` and opens Audit › Keys.

### States
- **Loaded**: Shared, current.
- **Preview**: Dedicated or Behind the firewall with the preview note.
- **Mobile**: the Retention panel stacks under this one.

## Retention

How long each part of the record is kept for this organization, and whether any workspace drops prompt bodies.

### Purpose
You check the retention policy in effect before you answer an auditor or a procurement questionnaire. The panel answers "how long do we keep bodies, rows and audit events, and is any workspace keeping digests only".

### Rationale
Oxagen keeps everything at full fidelity for seven years and makes that cheap by writing it once (Mission Control spec §13.1). Frame bodies are encrypted, content-addressed objects kept seven years from the seal. The run ledger is kept forever. Frame rows stay in the database for a 13-month hot window and are then compacted into the segment (§13.3). `digest_only` is a per-workspace opt-down for customers who cannot store prompt content. Turning it on in a workspace records a completeness gap on every run there, and the transcript and the Decision trace then show digests where the text was. Keeping bodies is the default. The full policy and its editor are on Audit › Retention.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Frame bodies, Run ledger, Frame rows, Control-plane audit | literals in `orgPlaneBody()` | `evidence.retention_policy_versions` | partial |
| `digest_only` mode | `orgDigestOnly()` over `WS[].retention` | `workspace.workspaces.retention_mode` | live |

### Logic
1. `orgPlaneBody()` renders this panel beside the Data plane panel.
2. `orgDigestOnly()` lists the workspaces whose `retention` is `digest_only`. With none it reads "off in every workspace". With some it names them and says every run there records a completeness gap.
3. A workspace's retention mode is set in `editws` and `newws`. Saving `digest_only` there changes this row at the next render.
4. The four periods here must match Audit › Retention and the Audit header's retention line. The build reads all three from one policy record.

### States
- **Loaded**: bodies 7 years, ledger forever, hot window 13 months, audit 7 years, `digest_only` off in every workspace.
- **Mobile**: stacks under the Data plane panel.

## Tenant isolation

How this organization's rows are kept apart from every other tenant's, stated as the checks in force.

### Purpose
A security reviewer asks "what stops another customer reading our rows". The panel lists the controls that answer it: row-level security on every tenant table, workspace scoping on every record, refusal of cross-tenant reads, and the startup guard.

### Rationale
Every tenant table carries `org_id NOT NULL` and row-level security is on, with no bypass setting (Mission Control spec §5.2). The tenant boundary is the policy, and the policy is tested: a CI test checks that every `org_id` column appears in the generated policy manifest. Every run, frame and record carries `ws`, and Oxagen is the only writer that sets it. Cross-tenant reads are refused by the database itself, not by application code. Price books, tool schemas and connector definitions are platform tables and never tenant rows. The startup guard refuses to boot when the app role is a superuser, holds `BYPASSRLS`, or runs with row-level security off (§5.2 rule 3).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Rows, Cross-tenant reads, Startup guard | literals in `orgPlaneBody()` | database policy manifest and boot checks | not built |
| Workspace scoping | `WS[].slug` | `workspace.workspaces` | live |
| Platform catalogs | literal | platform schema list | fixture only |
| Badge | `ORG.slug` | `org.organizations.slug` | live |

### Logic
1. `orgPlaneBody()` renders this panel under the Data plane and Retention panels.
2. Workspace scoping lists every `WS` slug in order.
3. The build should read the startup guard and the manifest check from their last run, and show a failed check as a failed state, not as the literal text here.

### States
- **Loaded**: five facts, the workspace list and the organization slug badge.
- **Mobile**: the facts keep their two columns, and long values wrap.

## Invite a person {#dialog/invite}

The form that sends one invitation: an email, the role offered, and the terms of the link.

### Purpose
You open it from **Invite** in the Organization header, or on the People and Pending invitations panels, when someone new needs access. It sets what the person can do on the day they accept, and it adds a row to Pending invitations.

### Rationale
An invitation is the only way into an organization. Nobody joins an existing tenant by signing up, so the invitation carries the role the membership starts with (spec §5.1: one org role, and one workspace role per workspace). The note under the form states the two terms a person needs before they send: the link expires in seven days, and accepting it takes a verified email and two-factor. People shows the badge "two-factor required" for the same reason. Sending is a membership write, and membership writes are recorded and not billed (§12.1).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Email | `#iv-email`, prefilled `rowan@a-intel.example` | `org.invitations` | live |
| Role | `#iv-role`, five fixed options | `iam.roles`, `org.invitations` | live |
| Invited by, Sent, Expires | `me()`, fixed dates 2026-09-11 and 2026-09-18 | `org.invitations` | live |

### Logic
1. **Send the invitation** calls `inviteSend()`. An empty email does nothing.
2. An email that already has an open invitation (`inviteFind()`) is refused with the toast "<email> already has an invitation open."
3. Otherwise `inviteSend()` pushes a row onto `INVITES` with the chosen role, you as the inviter, sent 2026-09-11 and expiring 2026-09-18. It re-renders and toasts "Invitation sent to <email>. It expires 2026-09-18 and needs a verified email and two-factor."
4. The role list is fixed in the dialog: `workspace.member · core-platform`, `workspace.owner · core-platform`, `org.auditor`, `org.billing` and `org.owner`. The build reads the human roles from `iam.roles` and the workspaces you may grant into, and offers only roles inside your own delegation ceiling.
5. It writes `invitation.sent` to `AUDIT` with the email, the role and the expiry. The mockup checks no email format. The build validates the address and writes `org.member.invite` with the inviter, the email and the role.

### States
The mockup has no error state here. The build shows a malformed email or a duplicate under the Email field. On a phone the dialog rises as a bottom sheet with full-width buttons.

## Member {#dialog/member}
<!-- open: openDialog('member','marcus') -->

One person's membership in full: their org role, their role in each workspace, the agents they operate and the mandates that run through them.

### Purpose
You open it with **Open** on a People row. It answers what this person can do and what acts on their behalf, before you change their role or remove them. **Change role** in its footer opens the Change role dialog for the same person.

### Rationale
A person's reach is wider than their own clicks. Every agent they operate works inside their delegation ceiling, and every mandate they granted lets an agent move money. The People table cannot carry that and stay readable, so this dialog gathers it for one person. It is the check to make before **Remove**, which Oxagen refuses while any agent acts on the person's behalf.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Org role | `PEOPLE[p].role` | `org.org_users` | live |
| Two-factor, Last seen | `MEMBERS` row through `orgMember()` | `org.org_users`, sessions | live |
| Joined | fixed text | the accepted `org.invitations` row | fixture only |
| Role per workspace | `orgMemberWs()` over `WS` | `org.org_users` workspace roles | live |
| Agents they operate | `AGENTS` whose `operator` is the person | the agent registry | partial |
| Mandates | `MANDATES` by `by`, and each agent's `mandates` | the mandate ledger | partial |

### Logic
1. `DLG_EXT.member(p)` finds the member with `orgMember(p)` and the person in `PEOPLE`.
2. Role per workspace lists every workspace for a member whose `ws` is `all`, each marked "· every workspace", or the one workspace they belong to. Each row repeats the base of the org role, the part before " · ".
3. Agents they operate shows the count in its eyebrow (`data-member-agents`) and one row per agent: key, workspace, and runs in 30 days.
4. Mandates lists what the person granted (`MANDATES` whose `by` is their name, with agent and status) and what their agents hold (mandate id and agent key). Each reads "none" when empty.
5. Joined reads "By invitation, accepted with a verified email" for everyone. The build reads the accepted invitation and its date.
6. The build reads each workspace role on its own, because a person can own one workspace and be a member of another (§5.1).

### States
With no member, the dialog reads "Member" and "No member selected." with **Close**. With no agents, the section reads "None. This person operates no agents." The dialog is wide on a desktop and a bottom sheet on a phone.

## Change role {#dialog/role}
<!-- open: openDialog('role','dana') -->

The form that changes one person's organization role.

### Purpose
You open it from **Change role** on a People row or in the Member dialog's footer. It answers which role the person holds now and lets you pick another.

### Rationale
A role change is a governed action. It passes IAM and writes an audit event with your name, the person and both roles. It is recorded and not billed: `resolve_approval` is the only billable governed action (§12.1, 2026-09-15). A new role for the person grants their agents nothing on its own. An agent still needs its own role, and it can use only the permissions it shares with its operator. That is the delegation ceiling, stated where it is decided: on the agent page and in the authority record.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Person | `PEOPLE[p].name`, `.email` | `org.org_users` | live |
| Role options | `ROLES` whose `kind` is `human` | `iam.roles` | live |
| Current role | `PEOPLE[p].role`, before " · " | `org.org_users` | live |

### Logic
1. `DLG_EXT.role(p)` titles the dialog "Change role" with the person's email under it. The Person field is disabled.
2. The Role select lists every human-kind role in `ROLES` and selects the current one.
3. An unknown `p` falls back to Dana Okafor. The build refuses to open without a person.
4. **Change role** closes the dialog and toasts "Role changed and recorded in Audit with your name." In the mockup it changes nothing: `PEOPLE` keeps the old role, no `AUDIT` row is written, and the Roles tab's Held by counts stay put.
5. The build calls `org.member.change_role`, writes the role and the audit event, and re-renders People and Held by. For a workspace-scoped role it also asks which workspace, because the options carry none.

### States
The dialog has no empty or error state in the mockup. On a phone it rises as a bottom sheet with full-width buttons.

## Remove a person {#dialog/removemember}
<!-- open: openDialog('removemember','marcus') -->

The confirmation that removes one person from the organization, refused while any agent acts on their behalf.

### Purpose
You open it with **Remove** on a People row. It says what the person loses and whether anything still depends on them.

### Rationale
Each agent's delegation ceiling is the narrower of its own roles and its operator's permissions. Remove the operator and each of their agents' ceilings collapses to nothing until a new parent user accepts. Every call those agents make would then fail. So Oxagen refuses the removal and sends you to reassign the agents first. Removing is a governed action and is recorded. The person's runs keep their attribution, because the record is append-only.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, role | `PEOPLE[p]` | `org.org_users` | live |
| Agents on their behalf | `AGENTS` whose `operator` is the person | the agent registry | partial |

### Logic
1. `memberDelDlg()` titles the dialog "Remove from the organization" with the name under it.
2. The body reads "<name> loses <role> and every workspace grant. Their sessions end now."
3. When one or more agents name the person as operator, a warning reads "N agents act on their behalf. Reassign them first from the agent's Identity panel." **Remove** is disabled.
4. Otherwise a note reads "No agent acts on their behalf." and **Remove** calls `memberRemove(p)`. It deletes the `MEMBERS` row and toasts "<name> removed. Grants ended; runs stay attributed to them."
5. It writes `member.removed` to `AUDIT`. The mockup leaves the person in `PEOPLE`. The build calls `org.member.remove`, ends the sessions, revokes the grants and writes the event.

### States
With no person, the dialog reads "Remove person" with an empty body. In the fixture Marcus Bell operates 28 agents, so his **Remove** is disabled. On a phone the dialog rises as a bottom sheet.

## Create a workspace {#dialog/newws}

The form that creates a workspace with its main repository, production branch, governance mode and retention mode.

### Purpose
You open it from **Create a workspace**, the gold action in the Organization header, the Workspaces panel and the empty state. It answers what a new workspace needs before it can exist, and it adds a row to Workspaces.

### Rationale
A workspace owns one main repo, one steering set, its agents, tool grants and budgets (§5.1). A workspace without a main repo cannot exist, so the main repository is required at creation (§10.1). The production branch is the only branch whose commits update the code graph. GitHub's default is offered as the suggestion. If GitHub's default changes later, Oxagen prompts you, and the setting does not move on its own. Until the GitHub App links the main repo, the workspace is provisional for 14 days. Runs record and spend counts, but steering, records and agent definitions stay off. `create_workspace` ships in rev1 with the fix for `macanderson/oxagen#3029` (2026-09-15).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, Namespace | `#nw-name`, `#nw-ns` | `wrk.workspaces` | live |
| Main repository | `#nw-main`, two fixed options | the GitHub App link | live |
| Production branch | `#nw-branch` | the repository link | live |
| Governance mode | `#nw-gov` | `.oxagen/rules/governance.toml` | not built |
| Retention mode | `#nw-ret` | `wrk.workspaces` | live |

### Logic
1. **Create** calls `wsCreate()`. An empty name or namespace does nothing.
2. The slug comes from the name. A slug already in `WS` is refused with "A workspace called <name> is already here."
3. Otherwise it pushes a `WS` row with you as owner, 0 agents, a $20.00 daily default budget and the chosen fields. It toasts "<name> is here, provisional for 14 days. Installing the GitHub App on <main>."
4. The namespace field caps at 6 characters and checks nothing else. The build enforces 2 to 6 lowercase characters, unique in the organization, and immutable after creation (§5.1).
5. The namespace hint always shows `a-intel.data.<agent>`, whatever you type. The build shows the namespace you entered.
6. Governance offers `team` (the default), `solo` and `regulated`. Retention offers `content_exact` (the default) and `digest_only`, which every run records as a completeness gap.

### States
The mockup has no error state. On a phone the dialog rises as a bottom sheet.

## Edit workspace {#dialog/editws}
<!-- open: openDialog('editws','core-platform') -->

The form that edits one workspace's name, production branch, governance mode and retention mode.

### Purpose
You open it with **Edit** on a Workspaces row. It shows which settings you can change here and which are fixed.

### Rationale
The main repository is read-only because changing it is an org-owner action with approval, recorded as a security event (§10.1). The namespace is immutable because it is part of every agent key in the workspace. Governance mode lives in the main repo, so a change opens a pull request on `.oxagen/rules/governance.toml` and takes effect on merge. Raising the mode applies to everything in flight. Lowering it is an org-owner action with approval. `digest_only` is recorded as a completeness gap on every run, and the transcript shows digests where the bodies were.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, Production branch, Retention mode | `WS` row | `wrk.workspaces` | live |
| Governance mode | `wsGov(w)`, `WZ_MODES` | `.oxagen/rules/governance.toml` | not built |
| Toolbelt limit | `FULL_BELT_LIMIT` (40) | workspace setting | partial |
| Default budget | `w.budgetDay` ($20.00) | `wrk.workspaces` budget default | partial |
| Agents | `AGENTS` in the workspace | the agent registry | partial |

### Logic
1. `wsEditDlg()` fills the fields from the `WS` row. Governance lists `solo`, `team` and `regulated`, each with its one-line meaning from `WZ_MODES`.
2. The facts read the toolbelt limit (40 tools, then the toolbelt is sent searchable), the default budget ($20.00 per day per agent, hard, the budget a new agent starts with), and the agents registered and holding a mandate.
3. **Save** calls `wsSave()`. It writes the name, branch and retention mode at once.
4. A changed governance mode toasts "Pull request opened on <main>: governance.toml sets mode = <mode>." The mockup also writes the new mode to the row at once. The build keeps the old mode until the pull request merges.
5. It writes `workspace.updated` to `AUDIT` (severity warning when the retention mode is `digest_only`), and the final toast reads "Workspace <name> updated. Recorded as a security event." The build writes `workspace.edit`.

### States
With no workspace, the dialog reads "Edit workspace" with an empty body. On a phone it rises as a bottom sheet.

## Archive a workspace {#dialog/archivews}
<!-- open: openDialog('archivews','growth') -->

The confirmation that archives one workspace, refused while any agent is registered there.

### Purpose
You open it with **Archive** on a Workspaces row. It says what archiving does and whether anything blocks it.

### Rationale
Archiving freezes a workspace without deleting its record. Its runs, frames, records and spend stay readable. Agents cannot start there, tools cannot be granted, and the main repo link is released so another workspace can take it. A workspace with registered agents cannot be archived, because each agent would be left without a home. Archiving is an org-owner action, recorded as a security event. `update_workspace_settings` refuses an archived workspace, which is why Edit avatar shows on live rows only.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Workspace | `wsById(slug)` over `WS` | `wrk.workspaces` | live |
| Agents registered | `AGENTS` whose `ws` is the slug | the agent registry | partial |

### Logic
1. `wsArchiveDlg()` titles the dialog "Archive workspace" with the name under it.
2. The body reads "Archiving freezes <name>. Nothing new can start there, and the main repo link is released."
3. With agents registered, a warning reads "N agents are registered here. Retire or move them first." **Archive** is disabled.
4. With none, a note reads "No agents here." and **Archive** calls `wsArchive(slug)`. It removes the row from `WS`, moves your current workspace if it was this one, and toasts "Workspace <name> archived. Runs and frames stay readable; nothing new can start there."
5. The build keeps the workspace listed with an archived state, reachable read-only, and writes `workspace.archive`.

### States
With no workspace, the dialog reads "Archive workspace" with an empty body. Every workspace in the fixture has agents, so **Archive** is disabled on every row. On a phone the dialog rises as a bottom sheet.

## Revoke an invitation {#dialog/invrevoke}
<!-- open: openDialog('invrevoke',INVITES[0].email) -->

The confirmation that revokes one pending invitation.

### Purpose
You open it with **Revoke** on a Pending invitations row. It says what happens to the link and to the person who holds it.

### Rationale
An invitation creates nothing until it is accepted, so revoking one leaves nothing behind to clean up. The person gets no notice. Who invited them, when, and who revoked it stay in the audit record. Inviting them again issues a new link, so a revoke is not a dead end.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Email | `S.dlgArg`, found by `inviteFind()` in `INVITES` | `org.invitations` | live |

### Logic
1. `inviteRevokeDlg()` titles the dialog "Revoke invitation" with the email under it.
2. The body reads "The link stops working at once, and <email> gets no notice."
3. **Revoke** calls `inviteRevoke(email)`. It removes the row from `INVITES`, re-renders, and toasts "Revoked. The link <email> holds no longer works."
4. **Resend** on the row is not part of this dialog. `inviteResend()` restarts the clock to 2026-09-18.
5. It writes `invitation.revoked` to `AUDIT` with the revoker. The build revokes the token and writes the same event.

### States
When the invitation is gone, the dialog reads "That invitation is no longer here." with **Close**. On a phone it rises as a bottom sheet.

## Add a cost center {#dialog/ccadd}

The form that adds one cost center label to the organization.

### Purpose
You open it with **Add a cost center** on the Cost centers panel. It adds a label that workspaces and agents can then be charged to.

### Rationale
A cost center is a label that spend is charged back to (ADR-142). Adding one charges nothing. Nothing rolls up to it until you charge a workspace or an agent. A label you deleted earlier comes back with its description, so a mistaken delete is undone by adding the label again. Only an organization Owner, Admin or Billing member writes cost centers. Everyone else reads the list.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Label | `#cc-label` | `cost.cost_centers` through `create_cost_center` | live |
| Description | `#cc-desc`, up to 280 characters | `cost.cost_centers` | live |
| Deleted labels | `CC.deleted` | `cost.cost_centers` | live |

### Logic
1. A reader never sees the dialog. **Add a cost center** calls `ccDenied()` for anyone without `ccCanEdit()`, and the toast names who holds the role.
2. **Add** calls `ccAdd()`. It trims the label and tests it against `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$`.
3. A malformed label shows "A label is 1 to 64 letters, digits, dots, underscores or hyphens, and starts with a letter or digit." under the field. A label already listed shows "<label> is already on the list." Either one marks the field `aria-invalid` and focuses it.
4. A label found in `CC.deleted` is restored with its description, or with the new one if you typed one. Otherwise a new center is created with today's date and your name.
5. `ccAdd()` writes `cost_center_created` to Audit and toasts "Added <label>. Charge a workspace or an agent to it and their next runs roll up there." A restore toasts "Restored <label>. Nothing is charged to it until you charge a workspace or an agent."

### States
The error line sits hidden under the Description field until a check fails. On a phone the dialog rises as a bottom sheet.

## Delete a cost center {#dialog/ccdel}
<!-- open: openDialog('ccdel','ENG-1040') -->

The confirmation that deletes one cost center label and says what still points at it.

### Purpose
You open it with **Delete** on a Cost centers row. It tells you how many agents and workspaces name the label today and where their new runs will go.

### Rationale
Runs already rolled up keep this label. Deleting it changes where new runs land, not the history, so Spend still shows the old spend under the label and marks it `deleted`. New runs from an agent or workspace that named it fall back to the workspace's cost center, or to none (ADR-142). The count is shown before you confirm because it is the size of the change.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Label | `ccFind(label)` in `CC.centers` | `cost.cost_centers` | live |
| Agents and workspaces naming it | `ccAgents()`, `ccWorkspaces()` | `agent.agents.cost_center`, `workspace.workspaces.cost_center` | live |

### Logic
1. `DLG_EXT.ccdel(label)` titles the dialog "Delete <label>".
2. With holders, a warning (`data-cc-del-count`) reads "3 agents and 0 workspaces name ENG-1040 today." Without, a note reads "No agent or workspace names <label>, so no run changes where it rolls up."
3. **Delete** calls `ccDelete()`. It moves the label to `CC.deleted`, clears it from every agent, and sets every workspace that named it to none.
4. It writes `cost_center_deleted` to Audit and toasts "Deleted <label>. Runs already rolled up keep it." followed by how many agents fall back.
5. The rollup is frozen at first read (`ccReady()` records `CC.rolledBy`), which is how Spend keeps old runs on the deleted label.

### States
An unknown label renders the shared "no such cost center" dialog. On a phone the dialog rises as a bottom sheet.

## Workspace cost center {#dialog/ccws}
<!-- open: openDialog('ccws','growth') -->

The form that charges one workspace to a cost center label, or to none.

### Purpose
You open it with **Change** on a Workspace cost centers row. It sets the label a workspace's runs roll up to.

### Rationale
A workspace's label is the default for every agent in it. An agent's own label wins over it, so this change moves only the agents that name none (ADR-142). Runs rolled up after the change are charged to the new label. Runs already rolled up keep the one they had.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Workspace | `WS` row | `workspace.workspaces` | live |
| Cost center | `CC.workspaces[slug]`, options from `ccOptions()` | `workspace.workspaces.cost_center` through `set_cost_center` | live |

### Logic
1. `DLG_EXT.ccws(slug)` titles the dialog "Cost center for <workspace>". The select lists None first, then each label with its description.
2. **Save** calls `ccSetWs(slug)`. It refuses a reader with `ccDenied()`.
3. It writes the label, writes `cost_center_set` to Audit, and toasts "<workspace> is charged to <label>. Runs rolled up after this change land there, except an agent's that names its own label."
4. Picking None toasts "<workspace> names no cost center. Its agents' runs roll up to their own labels, or to Spend's ~none row."

### States
An unknown workspace renders the shared "no such workspace" dialog. On a phone the dialog rises as a bottom sheet.

## Edit a model route {#dialog/editroute}
<!-- open: openDialog('editroute','0') -->

The form that sets the provider, route and fallback for one tier of Oxagen's own model work.

### Purpose
You open it with **Edit** on a Model routes row. It changes which model answers Oxagen's reflection, classification, embedding or reranking calls for this organization.

### Rationale
Routes are organization settings with platform defaults (§4.5, rule 2). You configure the alias and Oxagen records the concrete model. Tiers point at rolling aliases such as `z-ai/glm-latest`, so "latest" stays current without a deploy. Every `model.response` frame records the concrete model the provider returned, and the cost record prices that id, so a price is looked up by the model that answered and not by the alias. Every fallback is recorded as a frame, so a run shows which model answered and why.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Provider | `ORG_ROUTE_PROVIDERS` | `org.organizations.model_routes` | partial |
| Route, Fallback | `ORG_ROUTES[i]` | `org.organizations.model_routes`, `workspace.routing_policy` | partial |

### Logic
1. `DLG_EXT.editroute(i)` titles the dialog "Edit the <tier> route" with "organization setting · platform default" under it.
2. The Provider select lists OpenRouter, Anthropic (direct), OpenAI (direct) and Voyage AI (direct).
3. **Save route** calls `orgRouteSave(i)`. It writes the provider, a non-empty route and the fallback, which may be blank.
4. It toasts "The <tier> route was saved. Recorded as a control-plane event; it applies at the next model call."
5. The mockup validates nothing and writes no event. Any text saves as a route, and "resolves to" does not change. The build checks the route against the provider's model list, resolves the concrete model, and writes `org.route.set`.

### States
An unknown index shows "No route selected." with **Close**. On a phone the dialog rises as a bottom sheet.

## Change funding source {#dialog/funding}

A read-only card view of the three ways Oxagen's own model calls can be paid for.

### Purpose
It compares `platform_minted`, `platform` and `customer_key` side by side and marks the current one. No control on the page opens it. Only the guided scenario step "Change the funding source" does.

### Rationale
Funding source is the first thing the model layer resolves (§4.5). The Source select on the Funding source panel changes it, and that panel carries the key field and the key's lifecycle. Every key is stored enveloped, tested before save, not returned to any screen, and every read of it is audited. On a customer key your tokens are reported and billed at zero. On the other two they are billed to this organization. `platform_minted` carries the badge "reconciles per organization": the provider reports its key on its own line, which the shared `platform` key cannot do.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Sources and descriptions | `ORG_KEY_SOURCES` | `org.organizations.funding_source` | partial |
| Current source | `ORG_KEY.source` | `org.organizations.funding_source` | partial |

### Logic
1. The dialog renders one card per entry in `ORG_KEY_SOURCES`, with the id, a "current" badge on the active one, and the label and description.
2. The cards choose nothing. **Close** is the only action. `orgKeySourceSet()` on the panel is what changes the source.
3. The `platform` card says "Billed at vendor cost plus a published markup.", as §4.5 and §12.1 row 17 set it.
4. The build keeps one control per decision: either the cards choose and the select goes, or this dialog goes.

### States
The dialog is wide on a desktop and a bottom sheet on a phone.

## Mint a model key {#dialog/mintkey}

The form that mints one OpenRouter key for this organization on Oxagen's account.

### Purpose
You open it with **Mint a key for <organization>** when the Funding source panel holds no key. It creates the key the in-app agent and Oxagen's own model work run on.

### Rationale
Oxagen calls OpenRouter's provisioning API and holds what comes back (§4.5). The secret is not returned to this screen. It is stored enveloped under the organization key, and only the prefix, the provisioned id and a hash stay in the clear. The name is how a person reading the provider's bill finds this organization. The monthly cap is set on the key at the provider, so a metering fault in Oxagen cannot spend past it. Minting is a governed action (`org.model_key.mint`) with your name on it, and every later read of the key is its own audit event.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name on the account | fixed `oxagen/<slug>` | `org.model_credentials` | partial |
| Monthly cap | fixed `2000.00` | the key at the provider, `org.model_credentials` | partial |
| Request preview | static text | OpenRouter `POST /api/v1/keys` | not built |

### Logic
1. `DLG_EXT.mintkey()` titles the dialog "Mint a model key for <organization>".
2. The two fields are prefilled. The preview under "What this writes" is static and does not follow your edits.
3. **Mint the key** closes the dialog and toasts that the key was minted and capped at $2,000.00 a month, with `org.model_key.mint` in the audit record.
4. The mockup writes `org.model_key.mint` to `AUDIT`, but `ORG_KEY` still holds no key and the panel still reads "no key held". The build calls the provisioning API, stores the key, writes the event and re-renders the panel with the minted facts.

### States
On a phone the dialog rises as a bottom sheet.

## Rotate the model key {#dialog/rotateorgkey}

The confirmation that replaces the organization's minted model key with a new one.

### Purpose
You open it with **Rotate** on the Funding source panel. It says what rotation does and what happens to this month's spend on the old key.

### Rationale
Rotation provisions a new key at the provider and envelopes it. It revokes the old key only once the engine has picked up the new one, so turns in flight finish on the key they started with. This month's spend on the old key stays on the provider's report under its provisioned id. The month still reconciles, because the ledger is compared with both lines. Rotating is a governed action (`org.model_key.rotate`).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Provisioned id, name | `ORG_KEY.provisionedId`, `.label` | `org.model_credentials` | partial |
| This month on the old key | `ORG_KEY.providerUsd` | the provider's usage report | partial |

### Logic
1. `DLG_EXT.rotateorgkey()` titles the dialog "Rotate this key" with the provisioned id and name under it.
2. It shows one fact: this month's spend on the old key, on the provider's report under its id.
3. **Rotate** closes the dialog and toasts that the new key is in force and the old one is revoked.
4. The mockup changes nothing: `ORG_KEY.rotated` stays empty, so the panel still reads "never rotated". The build writes the new key, sets the rotation date and writes the audit event.

### States
On a phone the dialog rises as a bottom sheet.

## Revoke the model key {#dialog/revokeorgkey}

The confirmation that revokes the organization's minted model key at the provider.

### Purpose
You open it with **Revoke** on the Funding source panel. It warns that the in-app agent stops for everyone in the organization.

### Rationale
Revocation ends the key at the provider at the next call. Nothing else depends on it: no run, receipt or record needs the key, and the month's spend stays on the provider's report. Oxagen's own work (promotion rationale, pull request bodies and run names) routes on the tiers in Model routes, so revoking this key leaves it running. Revoking is a governed action (`org.model_key.revoke`).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Provisioned id, name | `ORG_KEY.provisionedId`, `.label` | `org.model_credentials` | partial |

### Logic
1. `DLG_EXT.revokeorgkey()` shows one warning: the in-app agent stops for everyone, and the key ends at the provider at the next call.
2. **Revoke** sets `ORG_KEY.source` to `none` and clears the provisioned id. It toasts "Revoked at the provider. The in-app agent is unavailable in <organization> until a key is minted."
3. The panel then shows the no-key note and **Mint a key**. The Source select has no `none` option, so it falls back to showing the first source. The build shows the source as unset.
4. The mockup writes no audit event. The build revokes the key at the provider and writes the event.

### States
On a phone the dialog rises as a bottom sheet.

## Request a change of data plane {#dialog/plane}

The request form for moving the organization to a dedicated, behind-the-firewall or air-gapped data plane.

### Purpose
You open it with **Request a change of plane** on the Data plane panel. It starts the conversation that ends in an Enterprise agreement and a deployment change.

### Rationale
Per-organization data planes make every store switchable (ADR-042). A dedicated plane and a behind-the-firewall deployment are deployment modes of one product, not forks of it. Identity, IAM, billing and the price book stay on the shared plane. A move changes where tenant data lives, so it waits on a signed annual agreement. Enterprise is negotiated per organization (§12.1: a `billing.contract_terms` row).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Current plane | `ORG.dataPlane` | `org.data_planes` | live |
| Mode, Region | fixed options, `ORG.region` | `org.data_planes` request | partial |
| Included, Plan | static text | `billing.contract_terms` | not built |

### Logic
1. `DLG_EXT.plane()` titles the dialog "Request a change of data plane" with "<organization> is on <plane>" under it.
2. Mode preselects the mode you were previewing, or dedicated. The options are dedicated, behind your firewall and air-gapped.
3. Region preselects the organization's region.
4. **Request it** closes the dialog and toasts "Request sent. An owner signs the annual agreement before anything moves." In the mockup it writes nothing. The build records `org.data_plane.request` and routes it to the account owner.
5. The build states the negotiated terms from `billing.contract_terms` in place of the static "from $60,000 per year".

### States
On a phone the dialog rises as a bottom sheet.
