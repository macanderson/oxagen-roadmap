# Agent identity

## Identity

The principal this agent acts as, with its key, kind, harness, model class, operator, cost center, lifecycle state, and first frame.

### Purpose
The panel answers "who is this actor" before any question about what it may do. A person checks the principal id against a run, an audit event, or an incident, confirms the accountable operator, and sees which label its spend lands on. From here they change the cost center with **Change**, or leave for Permissions to change what the agent may do.

### Rationale
Identity is stable by design. The principal does not move when the toolbelt, the model, or the machine changes, so every run the agent ever made names the same actor. Oxagen mints the principal at registration and never reuses it. Retiring an agent ends the principal and keeps it, so a retired agent's runs keep their identity. That is why this panel carries no controls that edit the principal itself.

The panel used to say "Revocable within one second." under its heading. That is a latency target for revoking the principal, and no measurement in the record backs it yet. A build states it only once the revocation path is measured against it.

The lifecycle runs from registration through enrollment to retirement, with suspended and unenrolled in between. The operator is the person accountable for every run. In IAM terms their id is the run's `initiating_principal`. The page used to print that field name and the lifecycle as sub-lines under the values. Those explanations live here now, and the panel shows only the recorded values.

D14 removed the replay grade from the interface, so this panel has no Replay row.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent key, principal, operator, status, first frame | `AGENTS` | `get_agent` `identity` (`agentKey`, `principalId`, `operatorId`, `status`, `firstFrameAt`) | live |
| Kind | fixed text | The principal's kind and workspace scope | partial |
| Harness and version | `a.harnessLabel`, `a.harnessV` | `get_agent` `identity.harness`, and the version a session or host reported | partial |
| Model class and routed model | `a.model` | The definition's `model_tier` and the workspace route | partial |
| Lifecycle state | `a.status` | `get_agent` `identity.status` | partial |
| Cost center | `FIXTURES.COST_CENTERS` via `ccOfAgent()` | `get_agent` `identity.costCenter`, then the workspace label | live |

### Logic
- `aIdentity()` renders the rows in a fixed order: Agent key, Principal, Kind, Harness, Model class, Operator, Cost center, Lifecycle state, First frame.
- Principal prints `prn_pending` when the fixture has none.
- Model class maps `light` to `z-ai/glm-flash-latest` and anything else to `z-ai/glm-latest`. A build reads the route the workspace sets.
- Cost center renders through `ccAgentCell()`: the label in mono, or "None", then **Change**. Its sub-line carries `data-cc-from` (`agent`, `workspace`, or `none`) and says where the label came from. `tools/check-creation.mjs` asserts that sub-line.
- **Change** opens `ccagent` for an organization Owner, Admin, or Billing member. For anyone else it opens nothing and `ccDenied()` toasts who holds the role.
- The shipped status values are `unenrolled`, `enrolled`, `suspended`, and `retired`. A lifecycle that starts at "registered" starts from a state the backend does not have.

### States
Loading, error, and denied replace the whole body, agent header included, as `agent.md` gives them. On a phone the four panels stack and this one comes first.

## Credentials

What secrets this agent holds, which is one run token and nothing else.

### Purpose
The panel answers the question most of the threat model rests on: can a leaked agent reach a provider? Five pairs list the provider credentials an agent might hold (API key, OAuth token, Cloud role, GitHub token) and the one it does hold (Run token). **Open providers** leaves for Tools › Providers, where the connections that mint call-scoped secrets are managed.

### Rationale
The agent holds no provider credential. Its run token is good for talking to Oxagen and nothing else. Every secret a call needs is minted by the broker at dispatch, scoped to that one call, and never sent to the agent. A leaked run token cannot reach a provider. A GitHub installation token stays in the host's Git proxy (ADR-151).

The panel states this as data rather than prose. The pairs read "Not held" or "Held · works only with oxagen", and the header badge "run token only" is a rollup of those rows. The shipped app draws the same five pairs. An explanatory paragraph used to sit under them. It moved here, and the button that pointed back to it was renamed from "See the connections that mint them" to "Open providers".

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Provider credentials, none held | fixed text | `get_agent` `credentials`, which lists only the agent's `agent_credential_v1` keys | partial |
| Run token | fixed text | The run-token exchange of spec §6.2 | future |
| Badge "run token only" | fixed text | Derived from the rows above | partial |

### Logic
- The badge reads "run token only" when every provider row reads "Not held", and at no other time. A build computes it from the rows.
- The pairs render through `iamPairs()`, a flat label and value list with no "and" and no "=". It is not an intersection.
- The run token row reads "Held · works only with oxagen" on every agent in the mockup. The app words the same value "one, and it reaches Oxagen only". The run-token exchange is not served today, so a build renders that row as not recorded until it ships.
- **Open providers** routes to `#/<org>/<ws>/tools/providers`.

### States
The panel has no empty state. An agent that has never run still holds no provider credential, so the rows read the same.

## Run credential

The long-lived key this agent starts runs with, its purpose lock, its run tokens, and the host key that signs its checkpoints.

### Purpose
The panel answers "what can start a run as this agent, and how would I stop it". A person reads when the key was issued and last used, how many run tokens are live, and which host key signs checkpoints. **Edit identity** changes the operator and roles. **Revoke credential** ends the key.

### Rationale
The key is long-lived, purpose-locked, hashed at rest, and shown to the operator once, at issue. After that Oxagen stores only a hash, which is why the Key row shows a prefix and a suffix. The purpose lock (`run_start`, `control_channel`) limits the key to starting runs and holding the control channel.

Run tokens live 15 minutes and refresh on the control channel. Revoking the key or suspending the agent kills every run token at the next call. That is what makes a halt stick: a run cannot outlive the credential that started it by more than one call.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Key, issued, last used | `a.cred`, `a.issued`, `a.lastUsed` | `get_agent` `credentials` (`prefix`, `createdAt`, `lastUsedAt`) | live |
| Purpose lock | fixed text | The run-token exchange of spec §6.2 | future |
| Run tokens | `a.tokens` | The run-token exchange of spec §6.2 (ADR-057 §4) | future |
| Host device key | `a.devKey` | `get_agent` `hosts[].deviceKeyFingerprint` | live |

### Logic
- Last used reads "never" for an agent that is not enrolled.
- Run tokens reads "N active · 15 minute TTL · refreshed on the control channel" for an enrolled agent, and "0 active" otherwise.
- Host device key's sub-line names the host that signs: "signs checkpoints from mbp-01". With no host it reads "Not enrolled. Checkpoints are unsigned until a host enrolls."
- With no credential issued, the mockup prints a bare dash in Issued (pr-reviewer). A build says none is issued.
- **Revoke credential** opens `revokecred`. The backend refuses an unpaired revoke today, so a build leaves the control out until a maintainer decides. **Rotate credential** in the agent header is the shipped path.

### States
An agent with no host shows the unsigned sub-line and "0 active". The Purpose lock and Run tokens rows render as not recorded in a build until the exchange ships.

## Trust relationships

Who this principal answers to, where it is scoped, which host speaks for it, and its tamper record.

### Purpose
The panel answers "who vouches for this agent, and has anything gone wrong". A person confirms the accountable human and their role, the one workspace the principal is valid in, the runtime whose key countersigns its checkpoints, and the delegation ceiling. **Read them** opens the Activity tab when a tamper incident exists. **Open its permissions** opens Permissions.

### Rationale
Every run of this agent carries the accountable human's name as `initiating_principal`. The principal is scoped to one workspace and cannot be used in another. When the agent is enrolled, its host's device key countersigns its checkpoints. With no host, nothing signs them.

The Delegation row reads "subagents narrow, never widen", as the shipped app draws it. A subagent may do only what both this agent and the invoking person are granted. That sub-line used to sit under the row and moved here. The ceiling holds in both directions: an agent's effective permission is its own grants intersected with the invoking human's, and a subagent can only narrow it. The hop limit, `max_hops 2`, is on Permissions › Budgets.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Accountable human and role | `PEOPLE[a.operator]` | `get_agent` `identity.operatorId`, and the member's role | live |
| Workspace | `ws()` | The principal's workspace scope | live |
| Runtime | `a.host` | `get_agent` `hosts` | live |
| Delegation | fixed text | `assign_agent_role` refuses a role above the assigner's grants, and `get_agent_toolbelt` `basis.humanCeiling` | live |
| Tamper incidents | `agentTamper(a)` over `INCIDENTS` | `list_incidents` for the agent | live |

### Logic
- Runtime prints the host id, or "a host outside this workspace" when the agent is enrolled elsewhere, or "not enrolled".
- Tamper incidents shows a critical badge with the count and the first incident's kind ("1 · Hooks removed") and **Read them**, or a green "0".
- `agentTamper()` matches an incident's scope by prefix and counts resolved incidents as open. The badge on Triage is critical although its incident is resolved. A build colours the badge by the open count and matches the agent key exactly.
- The row reads the same incident record as the Activity tab and the Audit page, so the three counts agree.

### States
With no incident the badge reads "0" and **Read them** is absent.

## Edit identity {#dialog/identity}

The dialog that requests a new operator for this agent and adds or removes its roles.

### Purpose
It answers "who does this agent act on behalf of, and with which roles". A person picks a new parent user, removes a role chip, or opens **Assign role**, then sends **Request the change**.

### Rationale
The principal is the agent's IAM identity. Oxagen creates it at registration and never reuses it, so the Principal field is read-only. The parent user sets the delegation ceiling: the agent can never do what that person cannot. Changing the parent user is a governed action that the new parent approves. The old ceiling applies until they accept. The dialog keeps one sentence of that on screen, because the button label does not say who approves.

A role takes effect at the next run start, when Oxagen recomputes the toolbelt. A new operator takes effect at the next call, when Oxagen recomputes the delegation ceiling.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Principal | fixed text `prn_01K2M7A4E8 · kind agent` | `get_agent` `identity.principalId` | live |
| Acts on behalf of | `PEOPLE`, `a.operator` | A governed operator change, approved by the new operator | future |
| Roles held | `S.agentRoles` via `agentRoleChips()` | `list_agent_roles`, `assign_agent_role` | live |

### Logic
- `identityDlg()` renders only while `S.dlg` is `identity`. The argument is the agent key.
- The Principal field shows a fixed string on every agent. A build shows the agent's own principal.
- Removing a chip calls `roleUnassign()`, which drops the role and toasts "Removed <role> from <key>. Its toolbelt is recomputed at the next run start." With no role held the chips read "none, so it can call nothing".
- **Assign role** opens `assignrole` over this dialog.
- **Request the change** runs `identitySave()`. The mockup sets the operator at once and toasts "<key> now acts on behalf of <name>." A build records a pending change, asks the new operator to accept, and keeps the old ceiling until they do.
- No capability changes an agent's operator today.

### States
The mockup opens the dialog for every viewer. No contract changes an agent's operator today, so a build leaves **Edit identity** off the page until one ships, and keeps role changes on **Assign a role**, which `assign_agent_role` backs for an org Owner or Admin.

## Revoke the credential {#dialog/revokecred}

The confirmation before revoking this agent's long-lived credential with nothing to replace it.

### Purpose
It answers "what happens if I revoke this key". A person reads the one warning and chooses **Keep it** or **Revoke it**.

### Rationale
Revoke mints nothing to replace the key. The agent cannot call anything until a new credential is issued, and every run token dies at the next call. To replace the key and keep running, a person rotates the credential instead, from the agent header. The dialog used to carry that comparison in a note and a warning that said the same thing twice. It now shows one warning with the two facts that matter.

The backend refuses a standalone revoke on purpose. `revoke_api_key` refuses `agent_credential_v1`, because `rotate_agent_credential` and `retire_agent` revoke it paired with a fresh mint or with retirement. Shipping this control needs a maintainer decision.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent key | `agent(key)` | `get_agent` | live |
| Revoke | `act()` toast only | Revoke the agent's credential | future |

### Logic
- `DLG_EXT.revokecred` takes the agent key and returns `noSuch("Agent")` for an unknown key.
- The title is "Revoke the credential on <key>?". The body is one warning: "<key> cannot run until a new credential is issued. Every run token dies at the next call."
- **Revoke it** closes the dialog and toasts "Credential revoked on <key>. Every run token dies at the next call." The mockup changes no record.
- A build writes a security event with who revoked, when, and why, and marks the credential revoked in `get_agent` `credentials`.

### States
Until the maintainer decides, a build leaves **Revoke credential** off the page, and this dialog does not open.

## Cost center {#dialog/ccagent}

The dialog that sets the cost center label this agent's runs are charged to.

### Purpose
It answers "which budget line pays for this agent". A person picks a label from the organization's list, or "None (inherit the workspace's)", and saves.

### Rationale
Cost centers follow ADR-142. A run is charged to the agent's own label, else its workspace's, else to Spend's `~none` row. An agent's own label wins over its workspace's. That order lets one agent in a shared workspace bill a different team without moving it.

Runs rolled up after the change are charged to the label you choose. Runs already rolled up keep the label they had. The dialog keeps the first of those two sentences, because **Save** does not say it on its own.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Labels | `CC.centers` (`FIXTURES.COST_CENTERS`) | The organization's cost centers | live |
| Agent label | `CC.agents[key]` | `get_agent` `identity.costCenter` | live |
| Workspace label | `CC.workspaces[ws]` | `workspace.workspaces.cost_center` | live |
| Save | `ccSetAgent()` | `set_cost_center` with `target: agent` | live |

### Logic
- `DLG_EXT.ccagent` takes the agent key. The select lists "None (inherit the workspace's)" first, then every label, with the agent's current label selected.
- The hint names the workspace's label: "Workspace core-platform names ENG-1001."
- **Save** runs `ccSetAgent()`. It checks `ccCanEdit()` first. It writes the label, or deletes it for None, and writes `cost_center_set` to Audit.
- The toast says what happened: "<name> is charged to <label>." With None it says where the runs now roll up: to the workspace's label, or to Spend's `~none` row.
- The Identity panel's Cost center row re-renders with the new label and its `data-cc-from` value.

### States
- No labels in the organization: the dialog says "This organization has no cost centers. Add one on the Organization page, then charge this agent to it here." and offers no **Save**.
- Denied: a person who is not an organization Owner, Admin, or Billing member never reaches this dialog. **Change** toasts who holds the role instead.
