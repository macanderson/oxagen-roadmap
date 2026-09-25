# Agent overview

## Page header {#agent/header}

The agent header names one agent, shows its lifecycle status, its recorded tier and its operator, and holds the four actions that act on the agent as a whole.

### Purpose

It answers four questions before any tab loads: which agent this is, whether it is running, how much of it Oxagen sees, and who answers for it. Every agent tab (Overview, Identity, Steering, Toolbelt, Runtime, Permissions and Activity) draws this same header, so a person keeps their bearings as they move between tabs. From here they change the avatar, rotate the credential, suspend the agent, or retire it.

### Rationale

The agent page replaced eight tabs of mechanism that never said what the agent was (`docs/agent-ontology-ia.md`, "What was wrong"). The header states identity, and identity is the one thing that does not move when the toolbelt, the model or the host changes. The four actions sit here because each one acts on the principal, not on one tab's object. None of them is gold: the header has no primary action by design, so the gold on this page belongs to an open dialog or to a not-loaded state. The header carries no replay grade (D14 in `docs/fleet-operations-wedge.md`) and no score of any kind. The tier badge shows the recorded tier and nothing stronger.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Avatar, agent key, harness mark and label | `AGENTS` via `agentCard(a, {layout: "detail"})` | `get_agent` `identity` | live |
| Description | `a.desc` | `get_agent` `identity` | live |
| Status | `a.status` | `get_agent` status: `unenrolled`, `enrolled`, `suspended`, `retired` | live |
| Tier | `a.tier` via `tierBadge()` | `list_agents` `enforcementTier`. `get_agent` carries no tier | live |
| Operator | `PEOPLE[a.operator]` | `get_agent` `identity.operatorId` | live |
| Edit avatar | `openAvatar("agent:<key>")` | `avatar` in the definition file, by pull request through `update_agent_def` | partial |
| Rotate credential | `openDialog("rotatecred", key)` | `rotate_agent_credential` | partial |
| Suspend | `openDialog("suspendagent", key)` | `suspend_agent` | live |
| Retire agent | `openDialog("delagent", key)` | `retire_agent`, then a pull request that removes the file | partial |

### Logic

1. `pAgent(r)` finds the agent whose key ends in the route's slug (`a.key.split(".").pop()`). No match draws "Agent not found" over the empty state "No agent named <slug>", "It may have been retired, or it belongs to another workspace.", and **Open Agents**. The page spec says an unknown slug falls back to the first agent. The renderer draws the not-found state instead.
2. When the agent differs from the last one drawn (`S.beltFor`), the header resets the toolbelt search, the presentation override and the category filter, so one agent's query never shows under another's name.
3. The status badge is a dot and a word. The mockup tones it `b-allowed` for every status. A build tones it by status, so a suspended or retired agent never reads green.
4. `tierBadge()` tones the tier (`observe` neutral, `harness` amber, `gateway` green, `contained` proven) and puts the tier's ladder text in its `title`.
5. **Edit avatar** opens the avatar editor for the agent. Its receipt says the change opens as a pull request, because the avatar is a field of the definition file.
6. **Rotate credential** opens the dialog in "Rotate the credential". **Suspend** opens "Suspend an agent". **Retire agent** opens the Retire agent dialog specified with the Agents page. Each is a governed action recorded in Audit.

### States

- **Loading**: `skeleton()` replaces the header, the tab bar and the body. The shell stays.
- **Error**: "This agent could not be loaded", with `503 iam_principals_unavailable`, **Try again** and **Open an incident**.
- **Access denied**: "You cannot see this agent", naming `agent.read on core-platform`, with **Request access** and **Back to Work**.
- **Empty**: "This agent has never run" and "It is registered and enrolled, and no frame has arrived.", with **Back to Work**. The header and the tab bar go with the body. The toolbelt is computed at run start, so an agent that has never run has no toolbelt to show either, and no tab has anything to draw.
- **Mobile**: the actions wrap under the description, and every dialog rises as a bottom sheet.

## Tab bar {#agent/tabs}

The tab bar splits one agent into eight linkable parts, in the order the agent is composed, and counts the three tabs that hold records a person may need to act on.

### Purpose

It moves a person between who the agent is, what steers it, what it can reach, where it runs, what it may do, what it did, and the file that defines it. Each tab is a path segment, so a link can point at one tab and Back moves between tabs.

### Rationale

The rev1 page had eight tabs of mechanism (Identity, Toolbelt, Mandates, Budgets, Runs, Enrollment, Tamper incidents, Definition) and no tab that said what the agent is made of (`docs/agent-ontology-ia.md`). Overview now comes first. The rest follow the order the object is composed: identity, steering, toolbelt, runtime, permissions and activity. Mandates, budgets and roles are all ceilings on the principal, so they sit together under Permissions instead of beside the toolbelt. Runs and tamper incidents merged into Activity, and Enrollment became Runtime. The Definition in git tab and its form were cut (the Cuts table in `docs/fleet-operations-wedge.md`). Definition now opens the source editor, the one editor for the one file. Old links keep working because each old id lands on the tab that absorbed it.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Tabs and their order | `IAM_TABS` | App routes `/{org}/{ws}/agents/{agent}/<tab>` | live |
| Old tab ids | `IAM_TAB_ALIAS`, `hashRewrite()` in `route()` | App redirects. The app answers `/definition` with a 308 to `/source` | partial |
| Toolbelt count | `beltTotal(a)` | `get_agent_toolbelt` `tools` | live |
| Permissions count | `a.mandates.length` | `list_agents` `mandates` | live |
| Activity count | `tamperCount(a)` over `INCIDENTS` | `list_agents` `tamperIncidentsRecorded` | live |

### Logic

1. `IAM_TABS` holds the eight tabs in order: Overview, Identity, Steering, Toolbelt, Runtime, Permissions, Activity, Definition.
2. `pAgent()` reads the tab from `tab("agent", "overview")`, maps an old id through `IAM_TAB_ALIAS` (`mandates` and `budgets` to Permissions, `runs` and `incidents` to Activity, `enrollment` to Runtime), and falls back to Overview for any id not in `IAM_TAB_KEYS`.
3. `route()` rewrites two addresses in place. `…/mandates/<id>` becomes `…/permissions?delegation=<id>`, and `S.delegationSel` opens that mandate's ledger. `…/definition` becomes `…/source`, which `pAgentSource()` draws.
4. `tabN(n, title)` draws a count only when it is above zero. The `title` spells it out: "52 tools in the toolbelt", "1 mandate", "1 tamper incident". The counts read the record on every render, so the Toolbelt count equals the toolbelt's width and the Activity count equals the incidents the Activity tab lists.
5. A click sets `S.tab.agent` and navigates to the tab's path. Overview and the bare agent path are the same tab.
6. The Source page draws the same `IAM_TABS` list without counts, with Definition selected. A build shows the same counts there as on every other tab.
7. The bar is `role=tablist`, and each tab is `role=tab` with `aria-selected`.

### States

A not-loaded state (loading, error, denied or empty) replaces the tab bar along with the body. On a phone the strip scrolls in its own row and keeps the selected tab in view.

## Composition

Composition lists the one principal this agent owns and a reference to each reusable object it uses, with a button to the tab that owns each one.

### Purpose

It answers the first question a person asks about an agent: what is it made of. Each row names one part (identity, steering, toolbelt, runtime, owner, permissions) and opens the tab or the registry where that part is managed. The health badge in the header says whether anything needs attention now.

### Rationale

The rule behind the panel is "identity is not steering" (`docs/agent-ontology-ia.md`). The agent owns one thing, its principal. Oxagen mints the principal at registration and never reuses it, so a run from a year ago and a run from this morning are the same actor even when nothing else about the agent is the same. Steering, toolbelts, tools, providers and runtimes are reusable objects with registries of their own, and the agent holds a reference to each, never a copy. So every row names a reference and states nothing the owning registry already states.

The second rule is "toolbelt assignment is not permission". A toolbelt says what the agent can see. Its roles and the policy say what it may call. That is why Toolbelt and Permissions are separate rows. Steering is assembled from the workspace's Steering Sources, so the Steering row counts what reaches the agent and links to the tab that shows each source. The owner is accountable for every run the agent makes, and the row carries no figure about them, because no person is scored.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Health badge | `agentHealth(a)` | Derived from `status`, `enforcementTier` and open tamper incidents | live |
| Identity | `a.principal` | `get_agent` `identity.principalId` | live |
| Steering | `agentSteering(a)` over `STG_PREVIEW` | The agent's envelope for its standing brief (#3879) | future |
| Toolbelt names | `beltsOfAgent(a.key)` over `TOOLBELT_ASSIGN` | Stored toolbelts and their assignments | future |
| Tool count and presentation | `beltTotal(a)`, `beltPresentation(a)` | `get_agent_toolbelt` `tools`, `presentation.mode` | live |
| Runtime | `agentRuntime(a)` over `RUNTIMES` | `get_agent` `hosts`; `list_tacho_hosts`. No host kind is recorded | partial |
| Owner | `PEOPLE[a.operator]` | `get_agent` `identity.operatorId` | live |
| Permissions | `agentRolesOf(a.key)`, `a.mandates` | `get_agent` `roles`; `list_agents` `mandates` | live |

### Logic

1. `agentHealth(a)` picks the badge in this order: Tamper when `tamperCount(a)` is above zero, Not enrolled when no host is enrolled, Observe on the `observe` tier, and Healthy otherwise. The mockup counts resolved incidents as open, and `agentTamper()` matches an incident's scope by prefix. A build counts the open incidents recorded against the agent itself.
2. Identity shows the principal, or `prn_pending` before registration completes.
3. Steering shows the items and tokens `agentSteering()` assembles, over "delivered at SessionStart and UserPromptSubmit", or "not delivered: no hook is installed" on the `observe` tier. With no standing brief the value reads "no preview prompt is set up". The mockup counts the rev1 assembler's items (14 for Triage) while the Steering tab counts SteeringFrames (45). A build shows the Steering tab's SteeringFrame count and tokens.
4. Toolbelt links each assigned toolbelt into Tools › Toolbelts (`S.beltPick`). The sub-line gives the tool count and the presentation. `beltPresentation()` uses the tab's override, then the agent's `beltMode`, then Searchable when the toolbelt is wider than `FULL_BELT_LIMIT` (40). With no named toolbelt the sub-line reads "from role grants · no named toolbelt".
5. Runtime shows the host and the tier badge, over the host's kind, harness version and OS, or "enrolled on a host outside this workspace", or "no host is enrolled".
6. Permissions shows the role count and a mandate badge, or "no mandate".
7. Every row but Owner has a button that sets `S.tab.agent` and opens that tab.

### States

The panel draws only in the loaded state. On a phone each row puts its button under the value.

## Last 30 days

Last 30 days rolls up this agent's runs, spend, tokens and tamper incidents over the last 30 days.

### Purpose

It shows how much the agent did, what it cost, and whether anything is wrong, in four numbers. **Open activity** opens the Activity tab, where the runs, the accounting and the incidents are listed.

### Rationale

This is the agent's own rollup, and it reads the same fields as the Operations columns on the Agents table (Runs, Spend, Tokens, Incidents). The two pages cannot disagree because a header is a rollup of the rows beneath it. The panel once closed with "Every tool on the toolbelt is sent, and paid for, on every model call." That is true only of a toolbelt sent in full. A searchable toolbelt sends two meta-tools and the pinned tools. The tool-definition share is on the 30-day token use panel, and the Narrow the toolbelt item in Optimization prices it.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Runs | `a.runs30` | `list_agents` `runs30d` | live |
| Last run time | `a.lastUsed` | The agent's newest run. No per-agent field today | partial |
| Spend | `a.spend30`, `basisChip()` | `list_agents` `spend30d`; `get_spend` grouped by agent | partial |
| Tokens and cache share | `agentTok(a)` | `list_agents` `tokens30d` | partial |
| Tamper incidents | `tamperCount(a)` | `list_agents` `tamperIncidentsRecorded` | live |
| Incident caption | `agentHealth(a)[2]` | Derived from the same record | live |

### Logic

1. Runs shows `runs30` over "in the last 30 days · last at <time>".
2. Spend shows `spend30` over its basis: "Observed by gateway" on the `gateway` and `contained` tiers, and "Reported by harness" below them. `list_agents` sums wrapped sessions only, so spend observed by the gateway comes from `get_spend` until the roster carries both.
3. Tokens shows the same total as the 30-day token use panel, over the cache read share of input.
4. Tamper incidents turns the critical colour when above zero. It shows a dash when the count is zero and no host is enrolled. The caption is the health reason: "1 open incident", "Not monitored: no hook installed", "enrolled, and nothing is delivered or refused yet", or "frames arriving, chain intact". The mockup's reason says "1 open incident" for Triage, whose only incident is resolved. A build counts every recorded incident and says how many are open.

### States

The panel draws only in the loaded state. On a phone it takes the full width under Composition.

## Definition

Definition names the file that defines this agent, the repository and commit it sits at, the digest the running agent carries, and the harness file generated beside it.

### Purpose

A person finds the file of record, checks which commit and `definition_digest` are running, and opens the source editor with **Open definition**.

### Rationale

Identity and credentials live in Oxagen's database, and the definition lives in git (ADR-057). The file in git is the definition of record, so the panel points at the file and never restates its fields. The Definition in git tab and its form were cut. This panel and the Source page replace them. The file's instructions reach the agent as a `procedure` SteeringFrame, and the file's purpose is identity, not steering (the Emissions table in `docs/fleet-operations-wedge.md`).

Oxagen generates the harness file from the definition. The target is a check that fails a pull request which edits the generated file without regenerating it. No such check exists today.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Path | `defSlug(a)` | `get_agent` `definition.path` | live |
| Repo | `w.main`, `w.branch` | The workspace's main repository. `definition.branch` is the branch of the last commit | partial |
| Commit | `a.commit` | `get_agent` `definition.commitSha` | live |
| `definition_digest` | `a.digest` | `get_agent` `definition.digest` | live |
| Generated beside it | `.claude/agents/<slug>.md` | The subagent file `propose_agent` writes | partial |

### Logic

1. Path reads `.oxagen/agents/<slug>.toml`. Repo reads "<main repository> @ <branch>".
2. `definition_digest` is the digest every frame records for this agent. It does not move until a pull request that changes the file merges.
3. Generated beside it reads `.claude/agents/<slug>.md` for every agent, whatever its harness. A build reads the generated path for the agent's harness.
4. **Open definition** sets `S.tab.agent` to `definition` and goes to `/definition`, which `route()` rewrites to `/source`. A build links `/source` directly.

### States

The panel draws only in the loaded state. On a phone it takes the full width, like every Overview panel.

## 30-day token use

The 30-day token use panel splits this agent's tokens by where they went in the prompt, with the cache rate, the size of a run and of a model call, and who counted them.

### Purpose

It shows where the agent's tokens go, so a person can see what to cut. It pairs with Optimization, which turns the same numbers into changes with a price on each.

### Rationale

The token classes come from `docs/mission-control-spec.md` §12.6: input uncached, cache read, cache write, output and reasoning, plus the measured parts of the prompt. `docs/agent-ontology-ia.md` moved the token panel and the coaching off the header and onto the Overview. The Basis line says who counted the tokens. On the `gateway` and `contained` tiers the gateway proxy counts the bytes that pass through it. Below them the harness reports its own usage. A class the harness does not report is marked absent and never drawn as zero, so a reported figure is never read as a measured one.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Total, spend and basis | `agentTok(a)`, `a.spend30`, `t.observed` | `get_spend` grouped by agent, with its basis | live |
| Output and Reasoning bars | `agentTok(a)` | Token classes `output` and `reasoning` | live |
| Conversation, Tool results, Context frames, Tool definitions, Steering and System bars | `agentTok(a).parts` | Measured prompt composition. `cost.run_totals` has three columns, null until a recorder measures them | future |
| Cache hit rate | `t.cacheRead`, `t.tokIn` | `list_agents` `tokens30d.cacheReadRate` | live |
| Per run and per model call | `t.perRun`, `t.perCall` | `get_spend` `runs` and `calls` | live |

### Logic

1. `coachStrip(a)` draws this panel and Optimization side by side at the top of the Overview.
2. `agentTok(a)` builds the rollup from a generator seeded by the agent key, so the same agent shows the same numbers on the Agents table, this panel and Spend. The total is the 30-day spend times a blended tokens-per-dollar rate. Input is 86% of the total. The tool-definition share grows with the toolbelt's width. A build reads `get_spend`.
3. The header reads "<tokens> tok · <spend> · <basis>".
4. `tokBars()` draws eight bars in this order: Conversation, Tool results, Context frames, Tool definitions, Steering, System, Output and Reasoning. Each shows its tokens and its share of the total, and its tooltip says what the class holds. The widest bar sets the scale. The bars sum to the header total.
5. Cache hit rate reads "<rate> · <cache read> of <input> input tokens served from cache".
6. Per run divides tokens and spend by the runs in 30 days. Per model call divides input by an assumed 31 calls a run. A build divides by the recorded calls.
7. Basis reads "observed by the gateway proxy" or "self-reported by the harness".

### States

The panel draws only in the loaded state. A build shows the six input bars as not recorded until the composition is measured. On a phone the bars keep their labels and values.

## Optimization

Optimization lists up to three changes the token record says would cut this agent's spend, each with the signal behind it, the money at stake, and one action.

### Purpose

It tells a person what to change about this agent and what the change is worth. Each action opens the place the change is made: the Toolbelt tab, Steering, the Compiler, the Steering record wizard, the definition, or the incidents.

### Rationale

Coaching is what the token record says to do differently. Every item names the signal it came from (a share, a rate or a count), the tokens and money behind it, and one action. Oxagen derives the items at read time from the same rollup the 30-day token use panel prints, so the two cannot disagree. An item is never a model's opinion of the agent, and it recommends a change to the agent, never a grade. The same items appear for this agent on Spend › Optimization.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Items | `coachItems("agents", key)` over `coachAgent(a)` and `agentTok(a)` | A recommendation read for one agent, derived from the token record | future |
| Dismissed items | `S.coachOff` via `coachKey()` | The dismissals a person made on Spend › Optimization | future |

### Logic

1. `coachAgent(a)` raises an item when its rule's threshold is crossed:
   - Narrow the toolbelt: tool definitions above 16% of input. Action **Edit the grant**.
   - Keep the prefix stable: cache hit rate below 72%. Action **Open steering**.
   - Page the tool results: tool results above 30% of input. Action **Propose a record**.
   - Lower the context budget: context frames above 24% of input, cited on fewer than half the runs. Action **Open the compiler**.
   - Route classification-shaped work to a light model: a complex model class with reasoning above 40% of output. Action **Edit the definition**.
   - Stop the retry storms: runs with repeated provider retries above 4% of runs, and at least three. Action **Open incidents**.
   - Stop writing cache for one-turn runs: cache writes above 6% of input. Action **Edit the definition**.
2. Each item prices its tokens at the agent's spend per token and scales that by the share the change can save. Items sort by money at stake, largest first.
3. `coachItems()` drops the items a person dismissed. The panel shows the first three. The badge reads "<N> suggestions", or "3 of <N> suggestions" above three.
4. Edit the definition and Open incidents go through the old `/definition` and `/incidents` addresses. A build links the canonical paths.
5. The foot link opens Spend › Optimization for this workspace.

### States

With no item: "Nothing to change. Every share is inside the workspace norm and the cache holds." A build shows the panel as not recorded until a recommendation contract ships. On a phone each item wraps within the panel.

## Suspend an agent {#dialog/suspendagent}

The Suspend dialog confirms suspending one agent, which stops every run token at its next call and can be undone.

### Purpose

A person stops an agent now without ending it: during an incident, a runaway run, or spend nobody expected. **Suspend it** is the reversible stop. Retire is the permanent one.

### Rationale

Suspension keeps the registration, the roles and the mandates, so lifting it returns the agent as it was. Every run token dies at the next call, even when the host's daemon is down, because Oxagen refuses the call on the server. A halt that depends on the host could be ignored by the host. The dialog exists because suspend used to fire on one click, and it was one of five destructive actions that each got a confirmation. It is a separate action from Retire so a person reaches for the reversible stop first.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent key in the title | `agent(key)` | `get_agent` `identity` | live |
| Suspend it | `DLG_EXT.suspendagent` | `suspend_agent`. A suspended principal anchors no governed run, and its toolbelt is empty | live |

### Logic

1. The header's **Suspend** opens the dialog with the agent key. A key that resolves to no agent draws "That record is no longer here." (`noSuch`).
2. The title reads "Suspend <key>?". The body is one note: "Every run token dies at the next call. You can undo a suspension."
3. **Cancel** closes. **Suspend it** (danger) closes and shows "Agent <key> suspended. Every run token dies at the next call."
4. The mockup changes nothing on the record, so the status badge still reads `enrolled`. A build writes `suspended`, and the header, the roster and the Health badge read it.
5. The mockup has no control that lifts a suspension. A build puts one wherever it shows a suspended agent.
6. `suspend_agent` admits org Owner or Admin, and the write lands in Audit with the person's name.

### States

A phone shows the dialog as a bottom sheet. A build gates `suspend_agent` on the server as well as in the page.

## Rotate the credential {#dialog/rotatecred}

The Rotate dialog confirms replacing this agent's run credential with a new key while the agent keeps running.

### Purpose

A person replaces the credential after a suspected leak, or on a schedule, without taking the agent offline. The one warning is that a run in flight ends at its next call.

### Rationale

The agent holds one credential, the run credential. Oxagen stores it as a hash and shows it to the operator once. Run tokens derive from it, and killing them at the next call is what makes a stop stick. Rotation mints a new key, hands it to the host at its next check-in, and stops the old key at the next call, so every live run token dies with it. A run in flight ends at that call without waiting for a checkpoint, and its frames up to that point are kept. Rotate and Revoke are different actions: Rotate replaces the key and the agent keeps running, while Revoke on the Identity tab leaves the agent unable to run until a new credential is issued.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent key in the title | `agent(key)` | `get_agent` `identity` | live |
| Rotate it | `DLG_EXT.rotatecred` | `rotate_agent_credential`. It returns the new key once to the caller, and nothing hands it to the host at check-in | partial |

### Logic

1. The header's **Rotate credential** opens the dialog with the agent key. A key that resolves to no agent draws "That record is no longer here."
2. The title reads "Rotate the credential on <key>?". A note says the new key goes to the host at its next check-in and the old key stops working at the next call. A warning says a run in flight on this agent ends at its next call.
3. **Cancel** closes. **Rotate it** (gold) closes and shows "Credential rotated on <key>. The old key stops working at the next call."
4. The mockup changes no field. The Identity tab's Key, Issued and Last used stay as they were. A build shows the new key's prefix and issue time, and shows the key to the operator once.
5. `rotate_agent_credential` admits org Owner or Admin, and the write lands in Audit.

### States

A phone shows the dialog as a bottom sheet. A build gates `rotate_agent_credential` on the server as well as in the page.
