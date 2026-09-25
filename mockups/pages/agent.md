# Agent › Overview

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents/triage` (`…/triage/overview` is the same tab). A tab id that matches nothing falls back to Overview |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D3, D14 (no replay grade), D17, and the Cuts row for the Definition in git tab. `docs/fleet-operations-ia.md` (Agents: “Overview: composition, current work, tokens and recommendations”) and `docs/fleet-operations-routes.md` (Agents). Token classes: `docs/mission-control-spec.md` §12.6 |
| Design | `mockups/src/engine.js` → `pAgent()` (the header, the tab bar and the states), `IAM_TABS`, `IAM_TAB_ALIAS`, the agent branch of `route()`, `aOverview()`, `coachStrip()`, `coachItems()`, `coachAgent()`, `agentHealth()`, `agentTok()` and `agentSteering()`, and the dialogs `rotatecred`, `suspendagent` and `delagent`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / Agents / Overview`: Loaded, Empty, Loading, Error, Access denied, and each of them · mobile |
| Audit | `agent.audit-prompt.md` |

## Job

One agent, answered in the order a person asks: who it is, what it is made of, what it costs, and what to change. The Overview is the first tab of the agent page and the one a roster row opens.

This spec owns the agent header and the tab bar, which every tab shares, and the Overview tab. Each other tab has its own spec: `agent-identity.md`, `agent-steering.md`, `agent-toolbelt.md`, `agent-runtime.md`, `agent-permissions.md`, `agent-activity.md` and `agent-source.md`. The Definition tab draws its own header, specified in `agent-source.md`.

## What is on the page

**Header.** Eyebrow “Agent”. The h1 is the agent card in its detail layout: the avatar, the agent key in mono (“a-intel.core.triage”), and the harness mark and label (“Codex CLI”). Under it one row of badges: the lifecycle status as a dot and a word (“enrolled”), the tier as recorded (“gateway”), and “operator Marcus Bell”. Then the agent's description (“Labels incoming issues, reproduces where it can, and opens a proposal when it cannot.”). Actions, in this order, none of them gold:

- **Edit avatar** opens the avatar editor for the agent (“Avatar · Triage”).
- **Rotate credential** opens `rotatecred`.
- **Suspend** (danger) opens `suspendagent`.
- **Retire agent** (danger) opens `delagent`.

**Tabs**, in this order, each a path segment: **Overview** (the bare path) · **Identity** · **Steering** · **Toolbelt** · **Runtime** · **Permissions** · **Activity** · **Definition**. The tab bar is `role=tablist` and each tab is `role=tab` with `aria-selected`. Three tabs carry a live count, and a count of zero draws nothing:

| Tab | Count | Demo |
|---|---|---|
| Toolbelt | The tools on the agent's toolbelt | 52 |
| Permissions | The mandates the agent holds | none for Triage; 1 for invoice-bot |
| Activity | The tamper incidents recorded against the agent | 1 |

Older addresses still land on the tab that absorbed them: `…/enrollment` on Runtime, `…/budgets` and `…/mandates` on Permissions, `…/runs` and `…/incidents` on Activity, all in place. `…/mandates/<id>` becomes `…/permissions?delegation=<id>` and `…/definition` becomes `…/source`, both rewritten in place. The toolbelt search and the toolbelt presentation reset when another agent opens, so one agent's query never shows under another's name.

**Overview.** Five panels. The first two sit side by side, then Composition beside Last 30 days, then Definition across the width.

**30-day token use.** The header reads “124,910,766 tok · $402.11 · Observed by gateway”: the agent's 30-day total, its spend, and the basis (“Observed by gateway” on the `gateway` and `contained` tiers, “Reported by harness” below them). The body is eight bars in this order, each with its tokens and its share of the total: Conversation, Tool results, Context frames, Tool definitions, Steering, System, Output, Reasoning. Under them:

- **Cache hit rate**: “83% · 89,161,305 of 107,423,259 input tokens served from cache”.
- **Per run**: “93,217 tok · $0.30”.
- **Per model call**: “2,586 tok in the mean request”.
- **Basis**: “observed by the gateway proxy from the bytes that passed through it”, or on an agent whose spend is reported by the harness “self-reported by the harness · absent classes are marked, never zero”.

**Optimization.** The badge reads “2 from the token record”. At most three items, ordered by the money at stake. Each item is a badge with its title, a signal line in mono, “$<amount> a month at stake”, and one action. On the demo record:

| Item | Signal | At stake | Action |
|---|---|---|---|
| Stop writing cache for one-turn runs | “7,814,133 cache write tokens · a write with no later read inside the TTL” | $31.44 a month | **Edit the definition** (the Definition tab) |
| Narrow the toolbelt | “34% of every request is tool definitions · 11 of 52 tools never called in 30 days” | $24.87 a month | **Edit the grant** (the Toolbelt tab) |

The other items the rules can raise are Keep the prefix stable (**Open steering**), Page the tool results (**Propose a record**), Lower the context budget (**Open the compiler**), Route classification-shaped work to a light model (**Edit the definition**) and Stop the retry storms (**Open incidents**). With none: “Nothing to change. Every share is inside the workspace norm and the cache holds.” The foot of the panel links “Optimization for this workspace →” to Spend › Optimization (`#/a-intel/core-platform/spend/optimization`). The items are the same ones Spend › Optimization lists for this agent.

**Composition.** Subtext: “One principal, and a reference to every other object it uses.” The badge is the agent's health (`tamper`, `not enrolled`, `observe` or `healthy`, as on the roster). Six rows, each with a sub-line; every row but Owner has a button to the tab that owns it (**Open**, **Open toolbelt**, **Open runtime** or **Open permissions**):

| Row | Value | Sub-line |
|---|---|---|
| Identity | `prn_01JQ8W3F2M6XKD7A9RZT4BVCNG` | “minted at registration and never reused” |
| Steering | “14 items · 1,149 tok” | “assembled from the workspace's Steering Sources and delivered at SessionStart and UserPromptSubmit”. On the observe tier: “assembled, and not delivered: no hook is installed on the observe tier”. With no standing brief the value is “no preview prompt is set up”, over a two-sentence sub-line with a “never” contrast (“steering comes from the workspace's sources. This agent holds a reference, never a copy”), which is a copy defect; a build states one fact |
| Toolbelt | Each assigned toolbelt as a link into Tools › Toolbelts (Repository reader, Repository contributor, Release control, Context graph, Workstation, Issue tracker, Messaging, Cloud cost) | “52 tools · Searchable” |
| Runtime | The host (`mbp-01`) and the tier badge | “workstation · Codex CLI 1.4.0 · macOS 15.5 · arm64”, or “no host is enrolled” |
| Owner | “Marcus Bell workspace.owner · core-platform” | “accountable for every run this agent makes” |
| Permissions | “1 role · no mandate”, or the role count with a mandate badge | “A toolbelt says what it can see. Its roles and the policy say what it may call.” |

The Steering row still counts the rev1 assembler's items, while the Steering tab counts SteeringFrames: 14 items here against 45 SteeringFrames there for Triage. A build shows the Steering tab's count of SteeringFrames and their tokens.

**Last 30 days.** Subtext: “This agent's own rollup, the same one the Agents table reads.” **Open activity** in the header opens the Activity tab. Four stats: Runs (“1,340”, “last at 2026-09-11 14:19:02”), Spend (“$402.11” over its basis, “Observed by gateway”), Tokens (“124,910,766” over “83% cache read over input”) and Tamper incidents (“1”, in the critical colour when not zero, over the health reason). The mockup's reason reads “1 open incident” although Triage's only incident is resolved; a build counts every recorded incident and says how many are open. A note closes the panel: “Every tool on the toolbelt is sent, and paid for, on every model call, whether or not it's used.”

**Definition.** Subtext: “The definition file in git is the source of truth. Identity and credentials are managed by oxagen.” **Open definition** in the header opens the Definition tab (the mockup goes through the old `/definition` address, which lands there). Rows: Path (`.oxagen/agents/triage.toml`), Repo (`a-intel/platform @ main`), Commit (`a4c91e2`), `definition_digest` (`sha256:73ad0e15f8c9b224`), and Generated beside it (`.claude/agents/triage.md`, with the sub-line “A pull request that edits a generated file without regenerating it fails the checks.”).

**Dialogs this page opens.**

- The avatar editor, titled “Avatar · <name>”, with the agent key under it: kind (Icon, Initials or Photo), glyph and tone.
- `rotatecred`, titled “Rotate the credential on a-intel.core.triage?”. It says a new key is minted and handed to the host at its next check-in, that the old key stops working at the next call and every live run token dies with it, and warns that a run in flight ends at its next call. **Cancel** and **Rotate it** (gold).
- `suspendagent`, titled “Suspend a-intel.core.triage?”. It says suspension is reversible and keeps the registration, the roles and the mandates, and that every run token dies at the next call because the refusal is on the server. **Cancel** and **Suspend it** (danger).
- `delagent`, titled “Retire agent” with the agent key: what is kept, what ends (the roles, the mandates and the host enrollment), what is in flight, the checkbox “I understand this cannot be undone”, **Cancel** and **Retire agent** (danger).
- The Optimization actions open the Definition tab, the Toolbelt tab, Steering, the Compiler, the Steering record wizard or the Activity tab. The mockup's Edit the definition and Open incidents go through the old `/definition` and `/incidents` addresses, which land on the Definition tab and Activity; a build links the canonical paths.

**Shell.** As on Agents, with Agents lit and the breadcrumb Anderson Intelligence Corp. / Core platform / Agents / triage.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Contract paths are under `packages/oxagen/src/contracts/` in `macanderson/oxagen` `main`.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Agent card, description, status, operator | `AGENTS` | `get_agent` `identity` | `agent.get.ts:91-145`, identity at `:121-138`; status `unenrolled`, `enrolled`, `suspended`, `retired` (`agent.list.ts:34-48`) | ✅ |
| Tier badge | `AGENTS` `tier` | `list_agents` `enforcementTier` | `agent.list.ts:78-83`. `get_agent` carries no tier | ✅ |
| Edit avatar | `openAvatar()` | `update_agent_def` `avatarUrl` | `agent.definition.update.ts:12`, `:38` | ✅ |
| Rotate credential | `rotatecred` | `rotate_agent_credential` | `agent.credential.rotate.ts:14`. It returns the new key once to the caller; nothing hands it to the host at check-in | 🟡 |
| Suspend | `suspendagent` | `suspend_agent` | `agent.suspend.ts:14`; a suspended principal anchors no governed run and its toolbelt is empty (`agent.suspend.ts:1-9`) | ✅ |
| Retire agent | `delagent` | `retire_agent`, then a pull request removing the file | `agent.retire.ts:16`; the file is left in place (`agent.retire.ts:1-9`) | 🟡 |
| Tab counts | `beltTotal()`, `a.mandates`, `tamperCount()` | `get_agent_toolbelt` `tools`; `list_agents` `mandates` and `tamperIncidentsRecorded` | `agent.toolbelt.get.ts:155`; `agent.list.ts:117-130` | ✅ |
| 30-day total, spend and basis | `agentTok(a)`, `spend30` | `get_spend` grouped by agent: `tokens` by class and `cost` with its basis | `spend.get.ts:34`; token classes `input_uncached`, `cache_read`, `cache_write_5m`, `cache_write_1h`, `output`, `reasoning` (`spend.shared.ts:107-116`); basis (`spend.shared.ts:13-18`) | ✅ |
| Output and Reasoning bars | `agentTok(a)` | The same token classes | `spend.shared.ts:107-116` | ✅ |
| Conversation, Tool results, Context frames, Tool definitions, Steering and System bars | `agentTok(a).parts` | Measured prompt composition (§12.6) | `cost.run_totals` has `tool_definition_tokens`, `context_frame_tokens` and `steering_tokens`, null until a recorder measures them (`packages/database/src/schema/cost.ts:320-323`). Conversation, tool results and system have no column | ❌ |
| Cache hit rate, per run, per model call | `agentTok(a)` | Cache read over input; tokens over `runs` and over `calls` | `get_spend` row `runs`, `calls` (`spend.shared.ts:150-160`); `list_agents` `tokens30d.cacheReadRate` (`agent.list.ts:95-116`) | ✅ |
| Optimization | `coachItems("agents", key)` over `coachAgent()` and `agentTok(a)` | Recommendations for this agent, derived at read time from the token record | No recommendation contract. The findings job ships four kinds, one of them the cache-write finding the first item mirrors (`finding.shared.ts:15-20`, `list_findings` at `finding.list.ts:23`) | ❌ |
| Composition, Identity | `a.principal` | `get_agent` `identity.principalId` | `agent.get.ts:121-138` | ✅ |
| Composition, Steering | `agentSteering(a)` | The agent's envelope for its standing brief | No capability resolves an envelope without a run (#3879) | ❌ |
| Composition, Toolbelt | `beltsOfAgent()`, `beltTotal()`, `beltPresentation()` | Stored toolbelts; `get_agent_toolbelt` for the count and the presentation | No toolbelt table; `agent.toolbelt.get.ts:147-155` | 🟡 |
| Composition, Runtime | `RUNTIMES` via `agentRuntime()` | `get_agent` `hosts`; `list_tacho_hosts` | `agent.get.ts:53-73`; `packages/oxagen/src/tacho/schemas.ts:50-124` (platform, OS version, arch, harnesses; no host kind) | 🟡 |
| Composition, Owner and Permissions | `PEOPLE`, `agentRolesOf()`, `a.mandates` | `get_agent` `identity.operatorId` and `roles`; `list_agents` `mandates` | `agent.get.ts:130`, `:140`; `agent.list.ts:117-121` | ✅ |
| Health badge | `agentHealth()` | Derived from `status`, `enforcementTier` and open tamper incidents | `agent.list.ts:122-125` | ✅ |
| Last 30 days: runs, spend, tokens, incidents | `runs30`, `spend30`, `agentTok(a)`, `tamperCount()` | `list_agents` `runs30d`, `spend30d`, `tokens30d`, `tamperIncidents`; `get_spend` by agent | `agent.list.ts:86-130`. `spend30d` and `tokens30d` count wrapped sessions only | 🟡 |
| Last run time | `a.lastUsed` | The agent's newest run | No per-agent field; the newest run is found on `list_runs` pages (`run.list.ts:476`) | 🟡 |
| Definition: path, commit, digest | `a.commit`, `a.digest` | `get_agent` `definition` | `agent.get.ts:75-89`: `path`, `digest`, `commitSha`, `branch`, `pullRequestUrl`, the cached `source` | ✅ |
| Definition: repo | `w.main`, `w.branch` | The workspace's main repository | The workspace's link to its main repository; `definition.branch` is the branch of the last commit | 🟡 |
| Generated beside it | `.claude/agents/<slug>.md` | The subagent file generated from the definition | `propose_agent` writes it when it proposes the agent (`agent.propose.ts:17-20`, `:35`). No check fails a pull request that edits it without regenerating it | 🟡 |

## Future-only fields

The Overview carries no `data-future` mark, and the catalog gives `agent` no future story. These fields have no contract today and are unmarked in the design. A build renders each as not recorded until its contract ships:

- The six input composition bars (Conversation, Tool results, Context frames, Tool definitions, Steering, System).
- Optimization.
- The Composition Steering row.
- The named toolbelts in the Composition Toolbelt row (the tool count and presentation ship).
- The host kind in the Composition Runtime row.

## Functionality

- Every tab is a path segment, so a tab is linkable and the back button moves between tabs. The tab counts are live and read from the record.
- Identity is stable and everything else is a reference. The principal does not move when the toolbelt, the model or the machine changes, which is why a run from a year ago and a run from this morning are the same actor.
- Every Composition row names a reusable object, states nothing the registry that owns it states, and opens the tab or the registry that owns it.
- The 30-day token use total equals the sum of its eight bars, and it is the same figure the roster's Tokens 30d column and the Last 30 days panel show.
- Optimization items are derived from the token rollup at read time and never stored as a model's text. Each item names what to change and what it is worth, and its action opens the place the change is made.
- Rotate credential and Suspend each end every live run token at the next call. Suspend is reversible; Retire agent retires the principal and never deletes it.

## States

- **loaded**: as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell, agent Triage). An agent slug that matches nothing falls back to the first agent.
- **empty**: “This agent has never run”. “It is registered and enrolled, but no frame has arrived. Its toolbelt is computed at run start, so there is nothing yet to show for tools either.” Action: **Back to Work**. The header and the tab bar are replaced along with the body.
- **loading**: the shell stays; the page body is the skeleton (four tile blocks and a panel of seven rows).
- **error**: “This agent could not be loaded”. “The control plane answered `503 iam_principals_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by oxagen.” Actions: **Try again** (gold) and **Open an incident**, over the line “trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z”.
- **access denied**: “You cannot see this agent”. “Your roles on Anderson Intelligence Corp. do not include `agent.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it.” Actions: **Request access** (gold) and **Back to Work**. Below: Signed in as (“Marcus Bell · workspace.owner · core-platform”), Needed (`agent.read on core-platform`) and Decided by (`pol_v41` · deny wins over every allow).

The empty, loading, error and denied states belong to the whole agent page. `agent-identity.md`, `agent-toolbelt.md` and `agent-runtime.md` list the three that apply to their tabs.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The top bar shows the current crumb (the agent's slug). The header actions wrap under the description. The tab strip scrolls in its own row and keeps the selected tab in view. The Overview panels stack in one column, the token bars keep their labels and values, each Optimization item wraps within the panel, and the Composition rows put the Open button under each value. Every dialog rises from the bottom edge as a sheet. Touch targets are at least 44 px and nothing scrolls sideways.

## Permissions

- Read: `get_agent`, `list_agents` and `get_agent_toolbelt` admit org Owner, Admin and Member, and workspace Owner and Member. The mockup names the permission `agent.read`.
- Writes, each a governed action recorded in Audit: Edit avatar (`update_agent_def`: org Owner or Admin, workspace Owner or Member), Rotate credential (`rotate_agent_credential`: org Owner or Admin), Suspend (`suspend_agent`: org Owner or Admin), Retire agent (`retire_agent`: org Owner or Admin).

## Backend gaps this page depends on

- Measured prompt composition written to `cost.run_totals` and rolled up per agent, for the six input bars.
- A recommendation read for one agent, derived from the token record, for Optimization.
- An envelope per agent without a run (#3879), for the Steering row.
- Stored toolbelts with assignments, for the named toolbelts.
- A host kind on the host record.
- Spend and tokens observed by gateway, rolled up per agent on `list_agents`.
- The current work order an agent is on. `docs/fleet-operations-ia.md` puts current work on the Overview; the mockup does not draw it yet, and no store holds a work order.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- A Steering Source and a SteeringFrame are never shown as each other. The Steering row counts what reaches the agent and links to the Steering tab, which shows the frames and their sources apart.
- No person is scored or ranked. Owner names who is accountable and carries no figure about them. Optimization recommends a change to the agent, never a grade.
- Every enforcement claim states the tier. “Enforced” only for calls routed through Oxagen.
- Headers are rollups of the rows beneath them: the token total is the sum of its bars, and the tab counts are the records the tabs list.
- Every badge that describes trust (tier, health, cost basis) shows the recorded value and nothing stronger. There is no replay grade on the page (D14).
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. A quoted string above that breaks this rule is a mockup defect to fix, not copy to reproduce.
- Exactly one gold (primary) action per screen. The agent header has none by design; the gold on this page belongs to an open dialog's primary button or to a not-loaded state's first action.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- A not-loaded state replaces the page body, never the shell.
