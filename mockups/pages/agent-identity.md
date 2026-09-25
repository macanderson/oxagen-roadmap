# Agent › Identity

| | |
|---|---|
| Route | `#/a-intel/core-platform/agents/triage/identity` |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D14 (no replay grade) and D17. `docs/fleet-operations-ia.md` (Agents, the Identity row: “Principal, credentials and the run credential”). The agent header and the tab bar are specified in `agent.md` |
| Design | `mockups/src/engine.js` → `aIdentity()` inside `pAgent()`, with `iamPairs()`, `tamperCount()`, `agentTamper()` and the dialogs `identity` (`identityDlg()`) and `revokecred`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / Agents / Identity`: Loaded, Loading, Error, Access denied, and each of them · mobile |
| Audit | `agent-identity.audit-prompt.md` |

## Job

Who the agent is, and the one property most of the threat model rests on: the agent holds no provider credential. The tab names the principal, the person accountable for it, the credential it runs with, and who and what may speak for it. Roles live on Permissions and the tier on Runtime.

## What is on the page

With component help off, the page carries no explainer text; each part's specification is in `mockups/help/agent-identity.md`.

The agent header and the tab bar are as `agent.md` specifies, with Identity selected. The body is four panels in two rows.

**Identity.** The panel has no subtext. Its explanation, and every sub-line the rows below no longer carry, is in the component help (`mockups/help/agent-identity.md`, Identity). Rows:

| Row | Value | Sub-line |
|---|---|---|
| Agent key | `a-intel.core.triage` | none |
| Principal | `prn_01JQ8W3F2M6XKD7A9RZT4BVCNG` | none |
| Kind | “agent · workspace core-platform required” | none |
| Harness | “Codex CLI 1.4.0”. With no reported version the mockup prints a bare dash after the label (Claude Code on pr-reviewer); a build shows the harness alone | none |
| Model class | “light → z-ai/glm-flash-latest”: the class and the model it routes to | none |
| Operator | “Marcus Bell” | none |
| Cost center | `ccAgentCell()`: the label this agent's runs roll up to, in mono (`ENG-1001` on Triage), or “None”, then **Change** (opens `ccagent`) | Why, on a line carrying `data-cc-from` (`agent`, `workspace` or `none`): “its own label, which wins over the workspace’s”, “inherited from workspace <slug>”, or “neither it nor its workspace names one, so its runs land on Spend’s ~none row” |
| Lifecycle state | The status badge (“enrolled”) | none |
| First frame | “2026-04-18 09:51:33Z” | none |

**Credentials.** The panel has no subtext. The header badge reads “run token only”. Five pairs: API key “Not held”, OAuth token “Not held”, Cloud role “Not held”, GitHub token “Not held”, Run token “Held”. No paragraph follows the pairs: what the run token can reach and how the broker mints each call's secret are in the component help (`mockups/help/agent-identity.md`, Credentials). **Open providers** opens Tools › Providers.

**Run credential.** The panel has no subtext. Its explanation, and the sub-lines the Key and Run tokens rows no longer carry, are in the component help (`mockups/help/agent-identity.md`, Run credential). Rows:

| Row | Value | Sub-line |
|---|---|---|
| Key | “ox_live_trag…c4e0” | none |
| Purpose lock | `run_start, control_channel` | none |
| Issued | “2026-07-21 15:08 to Marcus Bell”. With no credential issued the mockup prints a bare dash where the date belongs (on pr-reviewer); a build says none is issued | none |
| Last used | “2026-09-11 14:19:02”, or “never” for an agent that is not enrolled | none |
| Run tokens | “2 active · 15 minute TTL · refreshed on the control channel”, or “0 active” | none |
| Host device key | “ed25519:9c4a…e17b” | “signs checkpoints from mbp-01”, or for an agent with no host “Not enrolled. Checkpoints are unsigned until a host enrolls.” |

Actions under the rows: **Edit identity** (opens `identity`) and **Revoke credential** (danger; opens `revokecred`).

**Trust relationships.** The panel has no subtext. Its explanation, and the sub-lines the rows below no longer carry, are in the component help (`mockups/help/agent-identity.md`, Trust relationships). Rows:

| Row | Value | Sub-line |
|---|---|---|
| Accountable human | “Marcus Bell · workspace.owner · core-platform” | none |
| Workspace | “Core platform core-platform” | none |
| Runtime | `mbp-01`, “a host outside this workspace”, or “not enrolled” | none |
| Delegation ceiling | `max_hops 2`, the same value Permissions › Budgets shows | none |
| Tamper incidents | A badge “1 · Hooks removed” with **Read them** (opens Activity), or a badge “0”. The mockup draws the badge critical although Triage's incident is resolved; a build colours it by the open count | none |

**Open its permissions** under the rows opens the Permissions tab.

There is no Replay row. D14 takes the replay grade out of the interface.

**Dialogs this tab opens.**

- `identity`, titled “Edit identity” with the agent key. **Principal** is a read-only field with no hint. **Acts on behalf of** is a select of the organization's people, with no hint. **Roles held** lists the agent's roles as removable chips with **Assign role**, and the hint “A role takes effect at the next run start.” A note: “The new parent user accepts the change before it applies.” **Cancel** and **Request the change** (gold). What the principal is, how the parent user sets the delegation ceiling, and the approval by the new parent are in the component help (`mockups/help/agent-identity.md`, Edit identity).
- `revokecred`, titled “Revoke the credential on a-intel.core.triage?”. One warning: “a-intel.core.triage cannot run until a new credential is issued. Every run token dies at the next call.” **Keep it** and **Revoke it** (danger). That nothing is minted to replace the key, and that rotating keeps the agent running, are in the component help (`mockups/help/agent-identity.md`, Revoke the credential).
- `ccagent`, titled “Cost center for <agent name>”. It says “Runs rolled up after this change are charged to the label you choose.” **Cost center** is a select of the organization's labels with “None (inherit the workspace’s)” first, and a hint naming the workspace's label: “Workspace core-platform names ENG-1001.” Footer: **Cancel**, **Save** (gold). With no labels in the organization, the dialog says to add one on the Organization page and offers no Save. That runs already rolled up keep their label, and that an agent's own label wins over its workspace's, are in the component help (`mockups/help/agent-identity.md`, Cost center).
- The header dialogs (`rotatecred`, `suspendagent`, `delagent` and the avatar editor) are specified in `agent.md`.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Contract paths are under `packages/oxagen/src/contracts/` in `macanderson/oxagen` `main`.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Agent key, principal, operator, status, first frame | `AGENTS` | `get_agent` `identity` | `agent.get.ts:121-138`: `agentKey`, `principalId`, `operatorId`, `status`, `firstFrameAt` | ✅ |
| Kind | fixed text | The principal's kind and workspace scope | No field states it; every agent principal is kind agent, and its role assignments carry the workspace (`agent.role.list.ts:8-36`) | 🟡 |
| Harness and version | `harnessLabel`, `harnessV` | `get_agent` `identity.harness`; the harness version a session or host reported | `agent.get.ts:128`; `harnessVersion` on a session (`packages/oxagen/src/tacho/schemas.ts:132`) and `claudeVersionAtEnroll` on a host (`tacho/schemas.ts:105`) | 🟡 |
| Model class and routed model | `a.model` | The definition's `model_tier` and the model the workspace routes it to | `model_tier` is checked in the definition by `propose_agent` (`agent.propose.ts:185-186`); `list_agents` leaves `tier` null (`agent.list.ts:76-77`); `get_model_settings` reads the workspace default only (`workspace.model_settings.read.ts:5`) | 🟡 |
| Lifecycle state | `a.status` | `get_agent` `identity.status` | Values `unenrolled`, `enrolled`, `suspended`, `retired` (`agent.list.ts:34-48`). The lifecycle the component help describes (“registered → enrolled → retired”) starts from a state they do not have | 🟡 |
| Credentials: none held | fixed text | The agent's own credentials, and the broker that keeps provider secrets off the agent | `get_agent` `credentials` lists the agent's `agent_credential_v1` keys (`agent.get.ts:26-38`, `:139`). A GitHub installation token stays in the host's Git proxy (`create_github_token`, `tacho.github_token.issue.ts:1-11`; ADR-151) | 🟡 |
| Run token, purpose lock, run tokens active | `a.tokens`, fixed text | The run-token exchange of spec §6.2 | Not served: “The long-lived credential is locked to the run-token exchange of spec §6.2, which no surface serves yet” (`agent.suspend.ts:1-9`). `create_run_token` issues a fifteen-minute evidence credential for one run attempt from an operator's session (`run.token.issue.ts:16`) | ❌ |
| Key, issued, last used | `a.cred`, `a.issued`, `a.lastUsed` | `get_agent` `credentials`: `prefix`, `createdAt`, `lastUsedAt` | `agent.get.ts:26-38` | ✅ |
| Host device key | `a.devKey` | `get_agent` `hosts[].deviceKeyFingerprint` | `agent.get.ts:53-73` | ✅ |
| Accountable human, workspace, runtime | `PEOPLE`, `ws()`, `a.host` | `get_agent` `identity.operatorId` and `hosts`; the member's role | `agent.get.ts:130`, `:141` | ✅ |
| Delegation ceiling | fixed text (`max_hops 2`) | The delegation ceiling: agent grants intersected with the human's | `assign_agent_role` rejects a role above the assigner's grants (`agent.role.assign.ts:26-30`); `get_agent_toolbelt` `basis.humanCeiling` (`agent.toolbelt.get.ts:130-134`) | ✅ |
| Cost center | `FIXTURES.COST_CENTERS` (`agents`, `workspaces`) via `ccOfAgent()` | `get_agent` `identity.costCenter`, then the workspace's label; `set_cost_center` with `target: agent` | `agent.get.ts:135-136` returns the agent's own label, null when it inherits. The inherited label is on the workspace (`workspace.workspaces.cost_center`), and `set_cost_center` writes either (`cost_center.set.ts:38-47`, ADR-142) | ✅ |
| Tamper incidents | `agentTamper(a)` | `list_incidents` for the agent | `tacho.incident.list.ts:66`; tamper kinds (`tacho.incident.list.ts:35-42`) | ✅ |
| Edit identity | `identity` | A governed change of the agent's operator, approved by the new operator; `assign_agent_role` for the roles | No capability changes an agent's operator. Roles: `agent.role.assign.ts:26` | ❌ |
| Revoke credential | `revokecred` | Revoke the agent's credential | Refused by design: `revoke_api_key` refuses `agent_credential_v1`, because `rotate_agent_credential` and `retire_agent` revoke it paired with a fresh mint or with retirement (`packages/handlers/src/api.key.revoke.ts:37-40`) | ❌ |

## Future-only fields

The tab carries no `data-future` mark, and the catalog gives it no future story. These fields have no contract today and are unmarked in the design. A build renders each as not recorded, or leaves the control out, until its contract ships:

- **Run token**, **Purpose lock** and **Run tokens**: the run-token exchange is not served.
- **Edit identity**: no capability changes an agent's operator.
- **Revoke credential**: the backend refuses an unpaired revoke. The design keeps Rotate credential (header) and Retire agent for this; a standalone revoke needs a maintainer decision before it can ship.

## Functionality

- Identity is stable. The principal does not move when the toolbelt, the model or the machine changes, so every run the agent ever made names the same actor.
- The agent holds no provider credential. A call's secret is minted at dispatch, scoped to that call, and held by the broker or the host's proxy, never by the agent.
- Rotating the key or suspending the agent ends every run token at the next call, which is what makes a halt stick. Revoking leaves the agent unable to run until a new credential is issued.
- The delegation ceiling holds in both directions: an agent's effective permission is its own grants intersected with the invoking human's, and a subagent can only narrow it.
- The Tamper incidents row reads the same incident record as the Activity tab and the Audit page.
- The Cost center row resolves the label a run is charged to (ADR-142): the agent's own label, else its workspace's, else none. **Change** saves through `ccagent`, writes `cost_center_set` to Audit, and toasts the result. Runs rolled up after the change land on the new label, and runs already rolled up keep theirs. The organization's labels are managed on Organization › Cost centers (`organization.md`).

## States

- **loaded**: as described above, on the demo record (agent Triage).
- **loading**: the shell stays; the page body, the agent header included, is the skeleton (four tile blocks and a panel of seven rows).
- **error**: “This agent could not be loaded”, with `503 iam_principals_unavailable`, **Try again** (gold) and **Open an incident**, as `agent.md` gives it.
- **access denied**: “You cannot see this agent”, naming `agent.read on core-platform`, with **Request access** (gold) and **Back to Work**, as `agent.md` gives it.

The renderer shares the agent page's empty state (“This agent has never run”) with every tab. The catalog lists it on the Overview only, so this tab has no empty story.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with Agents lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The four panels stack in one column: Identity, Credentials, Run credential, Trust relationships. Each row's label sits beside its value and the sub-line wraps under the value. The panel actions wrap to full rows. Every dialog rises from the bottom edge as a sheet. Touch targets are at least 44 px and nothing scrolls sideways.

## Permissions

- Read: `get_agent` and `list_incidents` admit org Owner, Admin and Member, and workspace Owner and Member. The mockup names the permission `agent.read`.
- Writes, each a governed action recorded in Audit: Assign role inside Edit identity (`assign_agent_role`: org Owner or Admin). The cost center (`set_cost_center`: org Owner, Admin or Billing). For anyone else, **Change** on the Cost center row opens no dialog and shows a toast that names who holds the role (`ccDenied()`). Edit identity and Revoke credential have no contract today.

## Backend gaps this page depends on

- The run-token exchange of spec §6.2 (ADR-057 §4), for Run token, Purpose lock and Run tokens.
- A governed change of an agent's operator, approved by the new operator.
- A decision on a standalone credential revoke. Today the backend refuses it on purpose.
- The harness version on the agent read, and the model each model class routes to.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- A Steering Source and a SteeringFrame are never shown as each other. Identity never shows steering; that is the Steering tab.
- No person is scored or ranked. The accountable human is named, never graded.
- Every enforcement claim states the tier. “Enforced” only for calls routed through Oxagen.
- Headers are rollups of the rows beneath them: the Credentials badge reads “run token only” when every provider credential row reads “Not held”, and at no other time.
- Every badge that describes trust shows the recorded value and nothing stronger. There is no replay grade (D14).
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. A quoted string above that breaks this rule is a mockup defect to fix, not copy to reproduce.
- Exactly one gold (primary) action per screen. The tab has none of its own; an open dialog's primary button is the gold one.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- A not-loaded state replaces the page body, never the shell.
