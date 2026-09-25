# Kill switches

The switches that stop tool calls at every level, and the dialogs that flip, create, edit and remove them. The header, the tab bar and the flip banner are in `tools.md`.

## Class switch

A switch that stops every tool of one class across the organization: every tool that moves funds, every irreversible tool, or every tool with third-party egress.

### Purpose
It answers "stop everything of this kind, now, wherever it is". The three class cards sit at the top of the tab because they are the widest stop that still leaves unrelated work running.

### Rationale
A class switch names no provider or agent. It matches each tool version by the class it declares. A tool imported tomorrow that declares the same class is blocked as soon as it enters the registry (`docs/mission-control-spec.md` §6.11). That is what makes a class switch safe to reach for in an incident: nobody has to list the tools first.

The class switches ship with the workspace and cannot be edited or removed, because something has to be flippable when an incident starts. The headline switch, "Every tool that moves funds", carries a faint gold border and is the one **Stop a tool…** opens.

A switch takes effect on the next tool call, through the kill-switch generation. Running agents that keep calling lose their run token, which backs the switch for anything that keeps trying. The card's Takes effect row keeps the first fact, and the second moved here. The generation badge beside the Class switches eyebrow is the current value, 118 in the demo. Each flip and each policy activation adds one.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Target, scope | `SWITCHES` with `cls` | `list_kill_switches` | partial |
| On or off | `S.switches` | `list_kill_switches` state | partial |
| Flipped by, when, reason | `SWITCHES[]`, `S.flipMeta` | `list_kill_switches` | live |
| Blast radius | `SWITCHES[].stops` | counted from the record | future |
| Generation | `S.denyGen` | `iam.authorization_deny_generations` | live |

### Logic
1. `switchCard()` prints the target as the title, and the level and scope as the caption.
2. The toggle carries `role="switch"` and `aria-checked`, reads "Off (calls allowed)" or "On (calls blocked)", and opens `switch` instead of flipping in place.
3. A switch that is on takes the denied colour on its border and adds Flipped by and Reason.
4. Only the moves-funds class maps to a stored tag today (`moves_money`). The irreversible and egress classes have no tag to write a deny against (#3922).

### States
- **Loaded**: three class switches, all off.
- **Empty, loading, error, denied**: the page is replaced by the Tools state panel (see `tools.md`, Header). The switches exist from the day the workspace does, so this tab has no empty panel.
- **Mobile**: one column, and each toggle is at least 44 px tall.
- **In the app**: the irreversible and egress cards render with no toggle and say why (#3922). Every blast radius renders not recorded.

## Scoped switch

A switch over one target: the organization, the workspace, a provider, a tool version, a connection, an agent, or everything one operator answers for.

### Purpose
It answers "stop this one thing and nothing else". Flip a card, or create a switch over an agent, a host or an operator and hold it ready.

### Rationale
Deny is available at every level (§6.11). A tool version switch stops a bad release. A provider switch stops every tool from one system. A connection switch kills the connection and every credential grant behind it. An agent or operator switch stops the actors an incident names. The organization and workspace switches ship with the workspace and cannot be edited or removed. A switch you create here starts off, can be edited, and can be removed once it is off.

Every flip and every clear records who, when and why, and adds one to the kill-switch generation. The reason is recorded on every denied call and is read by the model. While a switch is on, deleting the connection, provider or tool version it names is refused (ADR-071). Running agents that keep calling lose their run token, and that sentence moved here from the Takes effect row.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Target, level, scope | `SWITCHES` without `cls`, `ksName()` | `list_kill_switches` | live |
| On or off, flipped by, reason | `S.switches`, `S.flipMeta` | `list_kill_switches` | live |
| Blast radius | `SWITCHES[].stops`, `ksBlast()` | counted from the record | future |
| Created here | `SWITCHES[].made` | `switch.create` (#3922) | future |

### Logic
1. A provider switch keys on the provider id so the gate can match it. `ksName()` prints the provider's system name instead.
2. `toolGateKind()` reads every live switch on a version or its provider, so turning a switch on changes the Gate column on Tools and Availability on Toolbelts.
3. A switch created in this session carries **Edit** (opens `switchedit`) and **Remove** (opens `switchdel`).
4. **Create a switch** opens `switchnew`.

### States
- **Loaded**: seven cards. The Slack provider and `github__delete_repository@1` are on.
- **Mobile**: one column.
- **In the app**: a switch row is written only when a switch flips on, so a switch held off, and editing or removing one, are #3922.

## Switch flip {#dialog/switch}

The confirmation that turns a switch on, or clears it, with the blast radius and a recorded reason.

### Purpose
It answers "what will this stop, and why am I stopping it". It shows the blast radius before it asks, and records your reason.

### Rationale
A flip shows its blast radius before it asks and says what it stops. Turning a switch on blocks every affected call from the next tool call. Runs in flight keep running. Their next call that changes anything is blocked, and the record names the switch and your reason. A class switch also blocks a tool imported later with the same class. Clearing allows blocked calls again from the next tool call. Nothing blocked while the switch was on is retried. You can clear a switch at any time, and nothing is destroyed.

The coverage is what `set_kill_switch` states: a switch stops the tool calls a governed agent run makes and every tool the in-app agent materializes through the tool gateway. It does not stop a caller holding an API key against `api.oxagen.sh`. IAM policy and revoking the key govern that traffic.

The banner's second and third sentences, the class-switch note, and the footer moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Switch | `switchById(S.dlgArg)`, else `ks_cls_funds` | `list_kill_switches` | live |
| Reason | `#killwhy` | `set_kill_switch` reason | live |
| Generation before and after | `S.denyGen` | `set_kill_switch` `denyGeneration` | live |

### Logic
1. The title reads "Flip the switch on <target>" or "Clear the switch on <target>".
2. **Block calls now** (danger) or **Allow calls again** (gold) calls `doFlip()`, which flips the switch, adds one to the generation, stores who and why, sets the flip banner, and moves to the Kill switches tab.
3. Takes effect, Backstop and Recorded as print under the reason: a security event, and a policy decision on every affected run.

### States
- **Mobile**: a bottom sheet with full-width footer buttons.

## Switch create {#dialog/switchnew}

A form that creates a switch over an agent, the host it runs on, or everything one operator answers for, and holds it off.

### Purpose
It answers "have a stop ready for this before an incident needs it". The blast radius recomputes as you pick the scope and target.

### Rationale
These are the three identities an incident names. A device switch counts the agents enrolled on that host, so the blast radius comes from the agent list and is never typed. A new switch starts off. Turning it on later blocks every affected call from the next tool call. The organization, workspace and class switches ship with the workspace and cannot be removed. One you create here can be edited, and removed while it is off. The reason stays on the card until someone turns the switch on.

The banner's second sentence, the reason hint's second sentence, and the note moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Scope | `KS_SCOPES` | target kinds `agent`, `operator` (device: #3922) | partial |
| Target | `ksTargets()` over `AGENTS`, `PEOPLE` | agents and operators | partial |
| Blast radius | `ksBlast()` | counted from the record | future |

### Logic
1. `ksRefresh()` redraws the fields when the scope or target changes.
2. `ksCreate()` refuses with no target, and refuses a second switch on a target a switch already covers. Otherwise it adds the card to Scoped switches, off, and toasts "Created a switch on <target>." It stays off until someone turns it on.

### States
- **Mobile**: a bottom sheet.
- **In the app**: not built (#3922).

## Switch edit {#dialog/switchedit}
<!-- open: openDialog('switchedit', 'ks_ws') -->

A form that changes the scope, target or reason of a switch created here.

### Purpose
It answers "retarget this switch". A switch that ships with the workspace refuses.

### Rationale
A shipped switch's scope is fixed, so the dialog offers to turn it on or to create a narrower switch beside it. A created switch that is on warns before a save, because changing its target changes which calls are blocked from the next tool call.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Scope, target, reason | `SWITCHES[]` | `switch.edit` (#3922) | future |

### Logic
1. On a shipped switch, the dialog reads "<target> cannot be edited" with **Create a switch**.
2. `ksSave()` writes the scope, target, blast radius and reason, and toasts "Saved the switch on <target>."

### States
- **Mobile**: a bottom sheet.

## Switch removal {#dialog/switchdel}
<!-- open: openDialog('switchdel', 'ks_ws') -->

A confirmation that removes a switch created here, once it is off.

### Purpose
It answers "take this switch off the page". It refuses in two cases.

### Rationale
A switch has to be ready when an incident starts, so the organization, workspace and class switches are permanent. A switch that is on has to be cleared first. Clearing it records your name and your reason. Removing it would let every blocked call through with no record of who allowed it. Removing a switch that is off records nothing, because by then it blocks nothing. The switch leaves the page, and you can create it again.

The permanent refusal's middle sentence, the note under the on warning, and the off note's second sentence moved here.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Switch | `SWITCHES[]`, `S.switches` | `switch.remove` (#3922) | future |

### Logic
1. A shipped switch reads "<target> cannot be removed" with Close.
2. A switch that is on reads "Clear it before you remove it" with **Clear it**, which opens `switch`.
3. Otherwise **Remove** calls `ksRemove()`, which drops the switch and toasts "Removed the switch on <target>."

### States
- **Mobile**: a bottom sheet.
