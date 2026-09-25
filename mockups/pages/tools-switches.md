# Kill switches

| | |
|---|---|
| Route | `#/a-intel/core-platform/tools/switches` |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: Emissions (the Policy row: "Tools › Policy and the kill switches"), Unchanged and D17. `docs/fleet-operations-ia.md`: Tools. `docs/mission-control-spec.md` §6.5 (the threat model) and §6.11 (kill switches and blast radius). ADR-071 in `macanderson/oxagen` (a kill switch outlives its target). `tools.md` owns the header and tab bar this tab shares |
| Design | `mockups/src/engine.js` → `pTools()`, the `t==="switches"` branch, with `switchCard()`, `switchesOn()`, `switchById()`, `switchDialog()`, `doFlip()`, `KS_SCOPES`, `ksAgentsFor()`, `ksTargets()`, `ksBlast()`, `ksFields()`, `ksRefresh()`, `ksCreate()`, `ksSave()`, `ksRemove()`, `DLG_EXT.switchnew`, `DLG_EXT.switchedit` and `DLG_EXT.switchdel`. State lives on `S.switches`, `S.flipMeta`, `S.denyGen` and `S.killBanner`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded, empty, loading, error, access denied |
| Storybook | `Oxagen / Tools / Kill switches`: Loaded, Empty, Loading, Error and Access denied, and the same five as mobile stories. The catalog gives this view no `future` flag, so it has no future-only story |
| Audit | `tools-switches.audit-prompt.md` |

## Job

Stop something now, at any level: a tool version, a provider, a connection, an agent, an operator's agents, a workspace, the organization, or a class of tools across the organization. A switch denies every affected call at its next call boundary through the deny generation, with run-token revocation behind it for anything that keeps calling. Every flip records who, when and why.

Something has to stay flippable when an incident starts, so the organization switch, the workspace switch and the three class switches ship with the workspace and cannot be edited or removed. A person can also create a scoped switch over an agent, the host it runs on, or every agent one operator is accountable for, and hold it ready.

Each switch is a gate, and Tools › Policy owns every gate. A switch's notice reaches the agent as a `constraint` SteeringFrame from a Steering Source of kind `policy`, listed on Steering › Sources with Managed in "Tools › Kill switches". Clearing a notice never clears its switch.

## What is on the page

**Header and tab bar** as in `tools.md`, with Kill switches selected. New tool is the gold action on this tab, because the tab carries no primary of its own. The tab's count is the switches denying now (2).

**Flip banner.** After a flip, a banner sits between the header and the tab bar on every Tools tab: the badge "switch flipped", then "<target> is denied." (with "organization-wide" for a class or organization switch and "in <workspace>" for a workspace switch), then "<blast radius>. Every affected call fails closed at its next boundary; the frame names this switch and the reason. Deny generation is now <n>.", and **Clear it** (opens `switch`). Flipping the switch on `a-intel.core.triage` reads "a-intel.core.triage is denied." and "18 tool versions · 1 agent · 2 runs in flight. Every affected call fails closed at its next boundary; the frame names this switch and the reason. Deny generation is now 119."

**Class switches.** The eyebrow "Class switches" with a mono badge, "deny generation 118". Three cards, stacked: "every moves_funds tool", "every irreversible tool" and "every tool with egress: third_party", each captioned "Class · Organization-wide, in one action".

**Scoped switches.** The eyebrow "Scoped switches" with **Create a switch** (plain, opens `switchnew`). Cards in two columns:

| Card title | Caption | State in the demo |
|---|---|---|
| a-intel | Organization · Every agent, every workspace | allowing |
| core-platform | Workspace · Every agent in this workspace | allowing |
| slack | Provider · Every tool from this provider | denying, flipped by Marcus Bell 2026-09-10 23:12 UTC, "Server shipped 1.9.0 with an output schema change we had not approved." |
| github__delete_repository@1 | Tool version · This version only | denying, flipped by Priya Natarajan 2026-07-02 08:30 UTC, "Never to be callable by an agent in this organization." |
| con_8QP0 · Snowflake key · analytics | Connection · Kills the connection and every credential grant behind it | allowing |
| a-intel.core.triage | Agent · This agent, every run | allowing |
| Dana Okafor | Operator’s agents · Every agent this operator is accountable for | allowing |

**Each card.** The title is the target, and the caption its level and scope. The toggle carries `role="switch"`, `aria-checked`, and the label "Flip the switch on <target>" or "Clear the switch on <target>". It reads "allowing" or "denying" and opens `switch` rather than flipping in place. Then a key-value list: Blast radius ("7 tool versions · 2 agents · 2 mandates · 1 run in flight"), then Flipped by (the person over the time) and Reason for a denying switch, then Takes effect, "at the next call boundary, through the deny generation, with token revocation behind it for anything that keeps calling". A switch created in this session also carries **Edit** (opens `switchedit`) and **Remove** (danger, opens `switchdel`). A denying card takes the denied colour on its border, and the headline class switch (moves_funds) a faint gold one.

**Dialogs this tab opens.**

- `switch`, flip or clear. Title "Flip the switch on <target>" or "Clear the switch on <target>", then the level and scope.
  - Flipping: a critical banner, the badge "blast radius", the blast radius in bold, and "Every affected call is denied at its next boundary. Runs in flight are not killed; their next non-read-only call fails closed and the frame names this switch and your reason." A class switch adds "This is a class switch. It does not name a server or an agent: it matches on the tool version’s declared class, so a tool imported tomorrow with financial.effect: moves_funds is denied the moment it enters the registry." The design's word "server" there breaks the vocabulary rule of `tools.md`, and a build says provider.
  - Clearing: the badge "restores", and "Denied calls resume at the next boundary. Nothing that was denied while the switch was on is retried."
  - A Reason field, recorded on every denied call and read by the model. Then Takes effect ("next call boundary · deny generation bumps 118 → 119"), Behind it ("run-token revocation for anything that keeps calling") and Recorded as ("a security event, and a policy.decision frame on every affected run").
  - Footer, flipping: "You can clear this switch at any time. Nothing is destroyed.", Cancel and **Deny now** (danger). Clearing: Cancel and **Allow again** (gold).
  - After a flip the card reads denying with Flipped by and Reason, the tab count and the deny generation rise by one, and the flip banner appears.
- `switchnew`, "Create a kill switch", subtitle "An agent, the device it runs on, or everything one operator answers for".
  - Scope: Agent, Enrolled device or Operator’s agents, with the hint "This agent, every run.", "Every agent enrolled on this host." or "Every agent this operator is accountable for."
  - Target: every agent in the organization by key and name, the enrolled hosts with how many agents each carries and its device key, or the operators with how many agents each is accountable for.
  - A blast radius banner that recomputes as the scope or the target changes ("18 tool versions · 1 agent"), with "A switch is created allowing. Flipping it denies every affected call at its next boundary."
  - Why it exists, with the placeholder "Held ready for an incident on this host" and the hint "One sentence. It sits on the card until somebody flips it."
  - Note: "The organization, workspace and class switches ship with the workspace and cannot be removed. One you create here can be edited and removed while it is allowing."
  - Footer: Cancel, **Create it** (gold). The new card joins Scoped switches, allowing, and the toast reads "Created a switch on <target>. It is allowing until you flip it." A second switch on a target a switch already covers is refused: "A switch already covers <target>." With no target: "Pick what the switch covers before you create it."
- `switchedit`. On a switch created here: "Edit the switch on <target>", the same fields, and while it is denying "This switch is denying right now. Moving it moves what is denied, at the next call boundary." Footer: Cancel, **Remove** (danger), **Save** (gold: "Saved the switch on <target>."). On a switch that ships with the workspace it refuses: "a-intel cannot be edited", "a-intel ships with the workspace, so its scope is fixed. Flip it, or create a narrower switch beside it.", with Close and **Create a switch** (gold).
- `switchdel`. On a switch that ships with the workspace it refuses: "a-intel cannot be removed", "a-intel ships with the workspace. Something has to stay flippable when an incident starts, so the organization, workspace and class switches are permanent. Clear it instead of removing it.", with Close. On a denying switch: "Clear it before you remove it", the warning "<target> is denying right now. Removing the switch would let every denied call through without a record of who allowed it.", the note "Clear the switch first. Clearing records your name and your reason; removing it afterwards records nothing, because nothing is denied by then.", Cancel and **Clear it** (gold, opens `switch`). On an allowing switch: "Remove the switch on <target>?", "It is allowing, so nothing is denied by it and nothing changes for a run. The switch is gone from this page and you can create it again.", **Keep it** and **Remove** (danger: "Removed the switch on <target>.").

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Backing checked against `macanderson/oxagen` `main` at `bf14d158a` (2026-09-24). A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Switches: target, scope, on or off, who flipped it and when, reason, who cleared it | `SWITCHES` (`FIXTURES.SWITCHES`), `S.switches`, `S.flipMeta` | `list_kill_switches` | `list_kill_switches` returns each switch's target, scope, state, reason, flipper and time, and clearer (`packages/oxagen/src/contracts/kill_switch.list.ts:8-26`, `:28-59`), from `iam.emergency_denies`, which keeps a cleared row (`packages/database/src/schema/iam.ts:425-...`) | ✅ |
| Flip and clear | `doFlip()` | `set_kill_switch` | Flips a switch on or off, bumps the deny generation in the same transaction, revokes a connection's live grants, and records a security event (`packages/oxagen/src/contracts/kill_switch.set.ts:54-96`) | ✅ |
| Deny generation | `S.denyGen` | the deny generation | `denyGeneration` `{org, workspace}` on both reads (`kill_switch.set.ts:48-52`), stored in `iam.authorization_deny_generations` (`iam.ts:378-...`) | ✅ |
| Class switch "every moves_funds tool" | `SWITCHES` `ks_cls_funds` | a class switch by consequence tag | A class target is a consequence tag (`kill_switch.set.ts:45`). The design's `moves_funds` is the tag `moves_money` | ✅ as `moves_money` |
| Class switches "every irreversible tool" and "every tool with egress: third_party" | `ks_cls_irrev`, `ks_cls_egress` | class switches by side effect and egress | Side effect and egress are not consequence tags, so no deny can be written. Gap #3922 (`apps/app/src/features/tools/switches.tsx:6-11`, `apps/app/src/features/tools/gaps.ts:18-19`) | ❌ |
| Organization, workspace, provider, tool version, connection, agent and operator switches | `SWITCHES` | target kinds | `org`, `workspace`, `tool_server`, `tool_version`, `connection`, `agent` and `operator` (`kill_switch.set.ts:14-23`, and the `target_kind` check at `iam.ts:489`) | ✅ |
| Enrolled device scope | `KS_SCOPES` (`Device`) | a switch over one host | None, #3922 | ❌ |
| Blast radius | `SWITCHES[].stops`, `ksBlast()` | counted from the record | No read computes one. `set_kill_switch` returns `grantsRevoked` once a connection switch flips (`kill_switch.set.ts:93-94`) | ❌ |
| Create a switch held allowing, Edit, Remove | `ksCreate()`, `ksSave()`, `ksRemove()` | `switch.create`, `switch.edit`, `switch.remove` | A switch row is written only when a switch flips on, and nothing edits or deletes one. #3922 (`switches.tsx:13-16`) | ❌ |
| Recorded as a security event and a `policy.decision` frame | static text | a security event and `policy_decision` frames | The flip is a security event (`kill_switch.set.ts:58`). A denied call on a wrapped run is recorded as a `policy_decision` frame carrying both deny generations (`packages/tacho/src/envelope.ts:257-269`). That the frame names the switch and the reason is not verified here | 🟡 |
| The switch's gate notice on Steering | `GATES` (`gate.ks_srv_slack`, `gate.ks_tv_del`) | a `constraint` frame from a `policy` source | None produced (`tools-policy.md`) | ❌ |
| Tab count | `switchesOn()` | switches on | Counted from `list_kill_switches`, and a floor when the board is truncated (`apps/app/src/features/tools/tabs.tsx:1-11`) | ✅ |

## Future-only fields

The renderer puts no `data-future` mark on this tab, and the catalog gives it no future-only story. These fields have no contract today all the same, and a build renders each as not recorded with its gap (#3922), never as a toggle that writes nothing:

- The two class switches on side effect and egress. The app draws their cards with no toggle and says why.
- The Enrolled device scope.
- Every Blast radius figure, on the cards and in the dialogs.
- A switch created and held allowing, and Edit and Remove on it.
- Each switch's gate notice as a frame.

## Functionality

- A flip takes effect at the next call boundary through the deny generation. Runs in flight are not killed: their next non-read-only call fails closed. Run-token revocation stands behind the switch for anything that keeps calling.
- The coverage is what `set_kill_switch` states: a switch stops the tool calls a governed agent run makes and every tool the in-app agent materializes through the tool gateway. It does not stop a caller holding an API key against `api.oxagen.sh` or `mcp.oxagen.sh`. IAM policy and revoking the key govern that traffic (`kill_switch.set.ts:58`).
- A class switch matches on the tool version's declared class, so a tool that enters the registry later with that class is denied the moment it arrives.
- A connection switch kills the connection and every credential grant behind it.
- Every flip and every clear records who, when and why, and bumps the deny generation. The reason is recorded on every denied call and is read by the model.
- The blast radius shows before a person confirms. For a switch created here it is counted off the agent list, never written down.
- The switches that ship with the workspace (organization, workspace and the three class switches) cannot be edited or removed. A created switch can be edited while allowing, and removed only once it is cleared, because clearing records who allowed the traffic and removing records nothing.
- While a switch is on, deleting the connection, provider or tool version it names is refused (ADR-071).
- A denying switch's gate has a notice on Steering › Sources, managed here (`gate.ks_srv_slack` for the Slack switch, `gate.ks_tv_del` for the tool version switch). Removing a notice never clears its switch.
- The flip banner shows on every Tools tab until the switch is cleared.

## States

`pTools()` branches on the state before it draws anything, so every state but loaded replaces the whole page body, header and tab bar included. The four panels are the ones `tools.md` quotes:

- **loaded**: the tab as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **empty**: "No provider is registered", with **Import a provider** (gold) and **Add a connection**. The Kill switches tab has no empty panel of its own: the organization, workspace and class switches exist from the day the workspace does.
- **loading**: the skeleton, four tile blocks and a panel of seven rows.
- **error**: "Tools could not be loaded", `503 tool_registry_unavailable`, **Try again** (gold), **Open an incident** and the trace line.
- **access denied**: "You cannot see the tool registry", naming `tools.read on core-platform`, with **Request access** (gold) and **Back to Work**, then Signed in as, Needed and Decided by.

## Mobile

The shell is as in `tools.md`: the thumb bar holds Work, Agents, Tools, Spend and More, with Tools lit. The tab bar scrolls in its own row, and the Kill switches tab must be scrolled into view. The class cards and the scoped cards stack in one column. Each toggle is at least 44 px tall. The flip banner stacks above the tab bar. Every dialog rises from the bottom edge as a sheet with full-width footer buttons. Inputs are 16 px, and the page never scrolls sideways.

## Permissions

The design names these permissions. The capability that binds each today is in parentheses.

- Read: `tools.read` (`list_kill_switches` admits an org Owner, Admin or Compliance member and a workspace Owner or Member).
- Writes, each a governed action recorded in Audit and as a security event: `switch.flip` (`set_kill_switch`, org Owner or Admin, and on the agent surface a flip waits for a person, `kill_switch.set.ts:67`), `switch.create`, `switch.edit` and `switch.remove` (none).

## Backend gaps this page depends on

- #3922: class switches by side effect and egress, the device scope, a switch created and held allowing, and editing one.
- A blast radius computed from the record for every level, before and after a flip.
- The switch named, with its reason, on the `policy_decision` frame of every denied call.
- Each switch's gate notice produced as a `constraint` frame from a `policy` source.

## Rules every build of this page must keep

- Every enforcement claim states the tier. A switch denies calls routed through Oxagen at their next boundary. On the `harness` tier the hook refuses a harness-native call, client-attested and fail-open. On `observe` nothing refuses. Copy that says "every affected call is denied" names that scope.
- Headers are rollups of the rows beneath them: the tab count counts the denying switches, and every blast radius is counted from the record, never typed.
- A flip shows its blast radius before it asks, and says what it stops. A destructive action says what stops working before it asks.
- A Steering Source and a SteeringFrame are never shown as each other. A switch's notice row on Sources links here.
- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- No person is scored or ranked.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. The design's card captions join the level and the scope with a mid-dot, and a build states them as one fact each.
- Exactly one gold action per screen: New tool on this tab. In a dialog, the one gold action is its confirming control.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- A not-loaded state replaces the page body and keeps the shell. A stub control says what the product would do. Nothing silently does nothing.
