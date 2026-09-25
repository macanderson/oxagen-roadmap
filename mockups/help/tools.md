# Tools

The registry tab, the header and tab bar every Tools tab shares, the flip banner, and the dialogs the header and the registry open.

## Header

The header names the workspace and carries the three actions that change what an agent can reach: add a provider, create a tool, and stop one.

### Purpose
You land here to answer "what can the agents in this workspace call, and how do I stop one of them now". The header answers the second half on every tab. **Add provider** starts the importer, **New tool** starts the tool creation wizard, and **Stop a tool…** opens the kill switch dialog. The three stay in the same place on Tools, Toolbelts, Providers, Policy and Kill switches, so an operator in an incident does not hunt for the stop control.

### Rationale
The registry is the only source of tools an agent can see (`docs/mission-control-spec.md` §6.4). Nothing reaches a toolbelt, and so nothing reaches a model, until it is a tool version here. That is why adding a provider and creating a tool sit on the page header and not inside one tab: both put new versions into the registry that every other tab reads.

The fleet operations wedge left the five Tools tabs alone ("Unchanged" in `docs/fleet-operations-wedge.md`). Two things moved around them: Tools › Policy now owns every gate, and the mandates ledger moved to each agent's Permissions tab (D11). The header keeps **Stop a tool…** because a kill switch is the one control an incident needs from any tab (§6.11).

The subtext that used to sit under the h1 ("The registry is the only source of tools an agent can see.") explained the design. It lives here now.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow | `ws().name` | `workspaces.name` | live |
| Add provider | `openDialog('import')` | `register_mcp_server`, `import_tools` | partial |
| New tool | `wzOpen('tool')` | the creation wizard (#3924) | future |
| Stop a tool… | `openDialog('switch')` over `SWITCHES` | `set_kill_switch` | live |
| Flip banner | `S.killBanner`, set by `doFlip()` | `list_kill_switches` | live |

### Logic
1. `pTools()` reads the tab from `S.tab.tools` (the path segment). `servers`, the Providers tab's name before rev1, lands on Providers. Any id it does not serve lands on Tools.
2. **New tool** is gold on the Tools and Kill switches tabs. On Toolbelts, Providers and Policy it is plain, because each of those tabs carries its own gold action (New toolbelt, Add provider, Activate). One gold action per screen is a house rule.
3. **Stop a tool…** opens `switch` with no argument, which `switchDialog()` resolves to the class switch "Every tool that moves funds" (`ks_cls_funds`). That is the switch an incident most often needs first.
4. After a flip, `doFlip()` stores the banner HTML in `S.killBanner`, and the header prints it between itself and the tab bar on every tab until the switch is cleared. See Flip banner.

### States
- **Loaded**: the eyebrow, "Tools", and the three actions.
- **Empty, loading, error, denied**: `pTools()` branches on `S.state` before it draws the header, so the header and the tab bar are gone and the state panel fills the page. Empty reads "No provider is registered" with **Add provider** (gold) and **Add a connection**. Error reads "Tools could not be loaded" with `503 tool_registry_unavailable`. Denied reads "You cannot see the tool registry" and names `tools.read on core-platform`. Loading is the skeleton.
- **Mobile**: the actions wrap onto two rows.

## Tabs

The tab bar moves between the five Tools tabs, and each count says what that tab holds or what waits on a person there.

### Purpose
It tells you, before you click, whether a tab needs you. The Tools count turns to the approval colour when observed output schemas wait for an admin. The Kill switches count is the number of switches on now.

### Rationale
A count in navigation appears only where something waits on a person (`docs/fleet-operations-ia.md`, Workspace navigation). The Tools tab follows that rule when schemas wait, and falls back to the registry's size when none does, so the tab still says how big the registry is. The other counts are sizes of the record each tab lists. Each tab is a path segment (`#/…/tools/<tab>`), so a link to a tab survives a reload and can be pasted into an incident channel.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tools count | `proposals().length`, else `verCount()` | observed schemas (#3921), `list_tool_versions` | partial |
| Toolbelts count | `TOOLBELTS.length` | `tools.toolbelts` (#3852) | future |
| Providers count | `PROVIDERS.length` | `list_mcp_servers` | live |
| Policy count | `POLICIES.length` | `tools.policy_versions` (#3920) | future |
| Kill switches count | `switchesOn()` over `S.switches` | `list_kill_switches` | live |

### Logic
1. `pTools()` builds five buttons with `role="tab"` and `aria-selected`. Each navigates to `#/<org>/<ws>/tools/<id>`.
2. `tabN()` prints each count with a title: "29 schemas need approval", "703 tool versions", "9 toolbelts", "19 providers", "9 policies", "2 kill switches on".
3. While `proposals()` is not empty, the Tools count is that number in `var(--st-approval)`. Approving a schema in `schema` takes one off the count on the next render.
4. The Kill switches count rises and falls with each flip and clear, because `switchesOn()` counts `S.switches`.

### States
- **Loaded**: five tabs with counts.
- **Empty, loading, error, denied**: the tab bar is not drawn.
- **Mobile**: the bar scrolls in its own row, and `render()` scrolls the selected tab into view.
- **In the app**: the Tools count counts one cursor page and marks it a floor, because `list_tool_versions` carries no total. Toolbelts and Policy carry no count until their stores ship.

## Flip banner {#tools/flip-banner}

After someone turns a kill switch on, this banner sits between the header and the tab bar on every Tools tab until the switch is cleared.

### Purpose
It answers "is something stopped right now, and how much did it stop". It names the target, the blast radius and the new kill-switch generation, and **Clear it** reopens the switch dialog to allow calls again.

### Rationale
A stopped tool is the loudest state the Tools page can be in, and the person who flipped the switch may move to another tab to watch its effect. The banner follows them. A switch blocks every affected call from the next tool call, through the kill-switch generation (§6.11). The flip also records the switch and the reason on every denied call, which is why the banner does not need to repeat them. That sentence ("The record names this switch and the reason.") moved here from the banner.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Target | `ksName(s)` | `list_kill_switches` target | live |
| Blast radius | `SWITCHES[].stops` | counted from the record | future |
| Generation | `S.denyGen` | `iam.authorization_deny_generations` | live |

### Logic
1. `doFlip()` flips `S.switches[id]`, adds one to `S.denyGen`, and stores who, when and why in `S.flipMeta`.
2. Turning a switch on builds the banner: "<target> is blocked", with "across the organization" for a class or organization switch and "in <workspace>" for a workspace switch, then the blast radius and "Kill-switch generation is now <n>."
3. Clearing a switch sets `S.killBanner` to null, so the banner leaves every tab on the next render.
4. The banner holds one switch. Flipping a second switch replaces it.

### States
- Shown only in the loaded state, after a flip in this session.
- **Mobile**: it stacks above the tab bar.

## Schema approvals

The banner on the Tools tab counts the tool versions whose output schema Oxagen inferred and an admin has not yet approved.

### Purpose
It tells an admin that some outputs are checked loosely today and how many, and **Review** opens the approval dialog on the first one.

### Rationale
A provider that declares no `outputSchema` still gets its outputs checked. The gateway records the outputs it sees, infers a schema from them, and files that schema as a registry proposal (§6.4). Until an admin approves it, outputs are checked only for size and type, and every run that used the tool says so in its completeness record. The banner exists because that gap sits quietly in every run until a person closes it. It is the only thing on the Tools page that waits on a person, which is why the sidebar count and the Tools tab count read the same number.

The two sentences that explained this ("oxagen inferred one from real outputs and filed it for approval. Until approved, outputs are only checked for size and type.") moved here from the banner.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Waiting count | `proposals()` over `TOOLS[].proposal` and `S.approved` | `schema_origin = observed_proposed` (#3921) | future |
| Provider names | `serverById(t.s).system` | `tools.tool_servers` | partial |

### Logic
1. `proposals()` returns every tool version with `proposal` set that `S.approved` does not hold.
2. The bold line names the providers behind the waiting schemas while there are three or fewer, joined with "and" or commas. Above three it names none.
3. **Review** opens `schema`, which shows the first waiting version and says how many more wait after it.
4. The banner disappears when the last schema is approved.

### States
- Shown only on the loaded Tools tab while a schema waits.
- **In the app**: not drawn until observed schemas have a store (#3921).

## Tools

The registry table: every tool version from every provider, with its classification, the gate it meets today, and the toolbelts that put it in front of agents.

### Purpose
It answers "what is this tool, how dangerous is a wrong call, and who can call it today". Filter by category, search, sort, then open a row for the version's schema and credential, or open its provider.

### Rationale
Permissions apply per tool version (§6.4). A provider that ships a new version adds a new row, and that row is on no toolbelt until a person puts it there. That is why the first column is `name@version` and not a tool name.

The page reads the chain Provider → Tool → Toolbelt → Agent. A toolbelt decides which agents can see a tool. The gate decides whether a call goes through. The table keeps both on one row so nobody mistakes seeing for permission.

Category says what a tool acts on and decides nothing. Hazard (risk and side effect) and the gate are the columns that carry a decision. The categories dialog says the same.

The panel's caption and the note under the table moved here: "Every tool version from every provider. Permissions apply per version, so a new version from a provider isn’t added to any toolbelt automatically." and "The gate checks the tool version’s kill switch first, then its provider’s kill switch, then policy v41. A toolbelt decides which agents can see a tool. The gate decides whether a call goes through."

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tool version, provider, digest, schema origin, calls 30d | `TOOLS` | `list_tool_versions` | live |
| Category and chips | `toolMeta()`, `TCAT` | a registry attribute (#3921) | future |
| Hazard | `TOOLS[].risk`, `.eff` via `hazard()` | the version's classification | partial |
| Gate | `toolGate()`, `toolGateKind()` over `SWITCHES` | `list_tool_versions` `gate` | partial |
| Egress, Financial | `TOOLS[].eg`, `.fin` | classification, consequence tags | partial |
| Toolbelts, Agents | `beltsWithTool()`, `agentsWithTool()` | `tools.toolbelt_assignments` (#3852) | future |
| Shown badge | `tsel.length` of `verCount()` | derived | live |

### Logic
1. `S.regCat` holds the chosen category. `catChips()` counts every row by `toolMeta(x.n).cat` and prints one chip per category that holds a version, from least to most consequential (`TCAT_ORDER`).
2. The "N of 703 shown" badge counts the rows the chip leaves.
3. `namesToggle()` sets `S.toolNames`. `toolCell()` prints the label over the API name, or the reverse, on every tool cell of the page.
4. `toolGateKind()` decides the Gate in this order: a live switch on the version or its provider gives Stopped by kill switch, then a financial class gives Mandate + approval, then an irreversible side effect gives Needs approval, else Allowed. The tooltip names the switch or the rule (`rg_0093` in the active policy).
5. Each row takes a left rule in its risk colour and opens `tool`. The Provider cell is a button that opens `server`.
6. `ltTable()` adds search, the filters Any schema origin, Any egress and Any financial, Rows (10 by default) and the pager.

### States
- **Loaded**: 703 versions across 19 providers.
- **Empty, loading, error, denied**: the page is replaced by the state panel (see Header).
- **Mobile**: the chips wrap, and the table becomes labelled cards.
- **In the app**: Category shows the consequence tags the classification records. Toolbelts and Agents render not recorded until #3852 ships.

## Provider import {#dialog/import}

A three-step dialog that connects to a provider, lists its tools, and imports the ones you pick into the registry.

### Purpose
It answers "what does this provider offer, and which of it do I want in the registry". You name the endpoint, read what `tools/list` returned, untick what you do not want, and import. The imported versions land in the registry on no toolbelt.

### Rationale
Import is how most tools arrive. An imported tool comes with a schema, a publisher and a credential story, which a tool written from scratch lacks until someone writes them (`docs/creation-spec.md` §3). Importing grants nothing. A version sits in the registry, callable by nobody, until a role grant puts it on a toolbelt.

The importer calls `tools/list`, versions every tool it finds, and stores both schemas. Where a provider declares no `outputSchema`, the gateway records observed outputs and files a registry proposal for an admin (§6.4). Step two unticks two tools by default, `delete_page` and `export_space`, because they are irreversible or bulk egress and declare no output schema. They would land denied by workspace policy until someone decides otherwise. Step three shows risk, side effect, egress and financial class because those are what policy decides on.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Endpoint, transport, connection | fields, `CONNECTIONS` | `register_mcp_server` | partial |
| Tools returned | `IMPORT_TOOLS` | `tools/list` via `import_tools` | partial |
| Picks | `S.impPick`, `impPicked()` | the import request | partial |
| Registry size before and after | `verCount()` | `list_tool_versions` | live |

### Logic
1. The step is the dialog's argument (`S.dlgArg`), so `openDialog('import')` always starts at Connect and clears `S.impPick`.
2. Step 1: Endpoint URL, Transport (`streamable-http`, `sse`, `stdio`), and Connection ("Create one after import" or one of `CONNECTIONS`). **Connect** moves to step 2.
3. Step 2: one checkbox per tool, with its hazard and an `outputSchema` badge. The footer counts the picks. **Classify** is disabled with nothing picked.
4. Step 3: a table of the picks with hazard, egress, financial class and whether the output schema is declared or will be observed. The note says the registry grows from 703 to 703 plus the picks.
5. **Import N tools** closes the dialog and toasts "Imported 6 tool versions from confluence. They are in the registry and on no toolbelt." The mockup writes nothing to `TOOLS`.

### States
- **Mobile**: a bottom sheet, and the table becomes cards.
- The build registers MCP servers only, over `streamable-http`, `sse` or `stdio` (`packages/database/src/schema/mcp.ts:191-194`).

## Output schema approval {#dialog/schema}

The dialog that shows the output schema Oxagen inferred for one tool version, beside a recorded response, and asks an admin to approve it.

### Purpose
It answers "is this inferred schema right". An admin compares the inferred schema with a real response, then approves it or leaves it for later.

### Rationale
Until approval, the gateway validated this tool's outputs only for size and type, and every run that used it says so in its completeness record (§6.4). Approving the inferred schema turns strict validation on from the next call. Approving is a governed action, `approve_tool_schema`. It is audited, and it bumps the tool version's schema digest, which every future frame records. Showing the schema next to one recorded response lets the admin check it against evidence instead of trusting the inference.

The note "What has been happening until now." and the footer about `approve_tool_schema` moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Waiting version | `proposals()[0]` | observed schemas (#3921) | future |
| Observations | `TOOLS[].calls30`, `agentsWithTool()` | `tool_invocations` | partial |
| Inferred schema, sample | `OBSERVED_SCHEMAS`, `OBSERVED_SAMPLES` | registry proposal | future |
| Digest on approval | derived from the name | `schema_digest` | future |

### Logic
1. `schemaDlg()` takes the first waiting version from `proposals()`.
2. The eyebrow names the version and says the provider declares no output schema. The design fixes the words "the slack provider". A build names the version's own provider.
3. `codePair()` sets the inferred schema beside one recorded response.
4. **Approve schema** calls `approveSchema()`, which sets `S.approved[name]` and closes the dialog. The row's origin turns to "observed, approved", it gains a digest, and every waiting count drops by one.
5. With nothing left, the dialog reads "Every observed schema is approved" and "Nothing to review."

### States
- **Mobile**: a bottom sheet, and the two code blocks stack.
- **In the app**: not drawn until #3921 gives observed schemas a store and an approval capability.

## Tool categories {#dialog/toolcats}

A legend of the ten tool categories, and of the hazard and gate marks every tool cell uses.

### Purpose
It answers "what does this icon mean" for anyone reading the registry or a toolbelt. It opens from **What the categories mean** beside the category chips.

### Rationale
A category says what a tool acts on. It is independent of the hazard (how bad a wrong call is) and of the gate (what the policy decided). The ten categories run from least to most consequential: Read-only, Data query, Record write, Messaging and authoring, File mutation, Code execution, Source control, Infrastructure, Access and identity, Financial control.

Category is a registry attribute and decides nothing. A rule may reference it, but only risk, side effect, financial effect and egress carry a decision by themselves (§6.9). The dialog draws the hazard and gate marks under the categories so the two axes that decide sit apart from the one that describes. On a gate mark, a dashed outline means a person still stands in the way.

The intro paragraph and the footer that said this moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Categories | `TCAT`, `TCAT_ORDER` | a registry attribute (#3921) | future |
| Hazard marks | `hazard()`, `effSvg()` | the classification | partial |
| Gate marks | `gate()`, `GATE_L` | the gate each version meets | partial |

### Logic
1. `toolCatsBody()` prints one tile per category in `TCAT_ORDER`, with its label, meaning and three example tools.
2. "Hazard and gate" lists Risk (low, medium, high, critical), Side effect (read, write, irreversible) and Gate (Allowed, Needs approval, Mandate + approval, Blocked, Stopped by kill switch).
3. **Close** is the only action.

### States
- **Mobile**: a bottom sheet, the tiles in one column.

## Tool version {#dialog/tool}
<!-- open: openDialog('tool', TOOLS[0].n+'@'+TOOLS[0].v) -->

One tool version: its classification, schema digest and origin, the credential it is called with, its price, and its input schema.

### Purpose
It answers "exactly what will this tool accept, and what stands between a call and its effect". It opens from a registry row, a toolbelt row and a provider row.

### Rationale
Validation is strict in both directions: no additional properties, formats enforced, size caps (§6.7 step 3). A failure is `schema_violation` and the call is denied. The canonical input digest is computed at that step and is the call's identity for idempotency, approval binding and the receipt. That is why the input schema is the body of the dialog.

The credential line names the connection kind and how the broker downscopes it. The agent never sees the credential (§6.8). For a financial tool, the amount is read from the call by the declared `amount_path`, never from prose. A call without a mandate is denied before dispatch. One over its mandate is denied or routed to approval by the mandate's own rule (§6.9).

The dialog has no gold action. It reads a version and changes nothing.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Name, provider, category, hazard, gate | `TOOLS`, `toolMeta()`, `toolGate()` | `list_tool_versions` | partial |
| Schema digest and origin | `toolDigest()`, `toolOrigin()` | `schema_digest`, `schema_origin` | live |
| Credential | `TOOLS[].cred` | credential scope on the version | future |
| Price | `TOOLS[].price` | the price book | future |
| Financial paths | `TOOLS[].amount`, `.currency`, `.party`, `.idem` | measures (`agent.ts:1331`) | partial |
| Input schema | built in `toolDlg()` | `agent.tool_versions` input schema | partial |

### Logic
1. `toolDlg()` finds the version by `name@version`. An id it cannot find reads "Not in the registry."
2. A financial tool (`fin` other than `none`) adds `amount_path`, `currency_path`, `counterparty_path` and `idempotency`, the warning "Financial tool.", and a payment-shaped schema.
3. The footer counts the toolbelts that carry the version and its calls in 30 days.

### States
- **Mobile**: a bottom sheet, and the schema scrolls inside its block.
- **In the app**: price and credential render not recorded. The app offers reclassification here through `set_tool_classification`, which the design does not draw.

## Tool creation wizard {#dialog/wz-tool}

The New tool wizard: describe a capability, see whether a provider already offers it, then either import it or build a manifest, a handler and a pull request.

### Purpose
It answers "I need a tool that does X". Oxagen looks for a provider it can already reach before it offers to write code. Importing is nearly always the cheaper answer, because an imported tool arrives with a schema, a publisher and a credential story.

### Rationale
A tool is not permission. Whatever this wizard creates lands in the registry callable by nobody until a role puts it on a toolbelt. A tool version is a file, like every other thing Oxagen creates, so the build path ends on a pull request (`docs/creation-spec.md` §1 and §3).

The manifest is the tool. Every chip above the editor is read out of it by `tomlParse`, not out of a form. Declare the worst case, not the common case: the gate a call gets is computed from the classification fields and nothing else, and an audit flags a tool classified `read` that writes.

Every handler, in all four languages, does three things. It reads the grant off the call rather than a key out of the environment. It passes the request id as the idempotency key, so a retried call is one effect. It declares its annotations, so a provider that lies about being read-only is a diff somebody can see. The code is yours, in your repository. Oxagen governs the call that reaches it and the receipt that leaves.

The step subtitles, the step 1 hint and note, and the notes on steps 2 to 4 moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Description | `S.wz.desc` via `wzDesc()` | the drafting turn | future |
| Match | `mcpMatch()` over `MCP_CATALOG` | the provider catalogue | future |
| Name, category, hazard | `wzToolName()`, `wzToolCat()`, `wzToolHaz()` | the manifest | future |
| Manifest, schema, code | `wzToolManifest()`, `wzToolSchema()`, `wzToolCode()` | `.oxagen/tools/<name>.toml` | future |
| Pull request | `wzPrStep()` | the workspace's main repository | future |

### Logic
1. **Describe**: the description box and four example chips. **Match it** stays disabled until the wand has rewritten the text (`wzDescOk()`).
2. **Recommendation**: `mcpMatch()` scores the description against the catalogue on whole words. The top match is recommended with its tools, hazards, publisher, transport, credential and downscope. With no match, Build it is recommended. "Also matched" lists the other providers, and picking one changes which provider the import walks.
3. **Import** (the import path): the provider's URL, publisher, transport, credential and catalogue tools. A provider that moves money warns that its financial tools are denied by construction until a named human owner with a finance role holds the connection and every calling agent holds a mandate. **Open the importer** hands off to `import`.
4. **Manifest** (the build path): the TOML in the source editor. The chips re-read on every edit, and a file that does not parse blocks the next step.
5. **Code**: a handler in TypeScript, Python, Go or Rust, and the input JSON Schema.
6. **Pull request**: five files and five checks. **Open the pull request** closes the wizard and toasts that the version exists when the pull request merges.

### States
- **Mobile**: a bottom sheet, the step rail scrolls.
- The footer names the permission the wizard needs, `tools.admin` on the workspace.
- **In the app**: not built (#3924).
