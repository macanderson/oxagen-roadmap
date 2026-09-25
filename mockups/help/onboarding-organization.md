# Onboarding · Organization

## Page header {#onboarding-organization/header}

The first gate step's eyebrow and title, and the footer that creates the organization.

### Purpose
You arrive here right after sign-up: from Verify email, or straight from **Continue with Google** or **Continue with GitHub**. The header tells you this is step 1 of 3 and that you are naming your organization. The footer says what Continue creates.

### Rationale
Onboarding is gated and has three steps: name the organization, wrap an agent, start a run (`docs/mission-control-spec.md` §4.4). The organization comes first because everything after it belongs to it. The lead that sat under the title moved here: the organization is the tenant. It owns its own graph database, its own encryption key, its billing account, and the namespace that appears in every agent key. §5.1 lists the same holdings, with a KMS key-encryption key and a retention policy, and decision 2 of the call sheet (§0) makes the organization the hard isolation boundary.

The footer caption stays on the page because the Continue label does not say what it does: it creates `org_a-intel` and its graph database.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow and title | literal in `obOrg()` | none, static copy | live |
| Organization id in the caption | `ORG.slug` | `org.organizations` | live |
| Gate state | `S.reg` in onboard mode (`obNew`) | `org.onboarding_state` (G16) | not backed |

### Logic
- `pWelcome` renders this step for `#/welcome/organization`. It creates `S.reg` with `obNew()` when there is no onboarding state yet, then wraps `obOrg()` in the gate shell.
- The footer is **Cancel** (`obExit`, labeled **Exit demo** in the demo and hidden under `?product=1`), the caption "Creates `org_a-intel` and its graph database.", and **Continue** (gold, `regNav('wrap')`).
- Continue moves to `#/welcome/wrap`. The mockup writes nothing. The build must create the organization and its first workspace on Continue, as `org.create` and `workspace.create`, each a governed action in Audit.
- Cancel writes nothing, because nothing exists before Continue.

### States
- **Loaded**: "Step 1 of 3", "Name your organization", the form.
- **Error**: the header stays. The form shows the namespace error.
- **Loading** and **denied**: the header is not drawn. The gate shell and the step rail stay. The denied block names `org.create for marcus@a-intel.example`.
- **Mobile**: the footer buttons stack full width.

## Organization form

The organization's name and address, its namespace, and its first workspace with a governance mode.

### Purpose
You name the organization, see the address it gets, set the namespace every agent key starts with, and name the first workspace and choose how it is governed. The next step registers the first agent into that workspace.

### Rationale
An organization holds workspaces, and agents belong to a workspace (§5.1). The wrap step needs a workspace to register into, so the first one is created with the organization. The dim line that closed the form moved here: a workspace is a governance partition, with one main repo, one steering set, and its own agents, tool grants and budgets. The main repo is linked on the last step, from the repository the installer reports.

The governance mode is chosen now because it is the workspace's own setting: Steering shows it as "Governance: team" and the Organization workspaces table reads it.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Organization name, address | `ORG` (`FIXTURES.ORG`) | `org.organizations` | live, gate state partial (G16) |
| Workspace name | `ws()` over `FIXTURES.WS[0]` | `wrk.workspaces` | live |
| Governance mode | `ws.governance` | `wrk.workspaces.governance` | not backed |

### Logic
- **Organization name** (`#ob-org`) shows "Anderson Intelligence Corp.".
- **Address** (`#ob-url`) is read-only, `oxagen.com/a-intel`, with the hint "Derived from the name. You can change it later." The mockup does not rewrite it as you type. The build must derive it from the name.
- **Namespace** has its own section.
- Under a rule, the h3 "First workspace" heads **Workspace name** (`#ob-ws`, `core-platform`) and **Governance mode** (`#ob-mode`): `solo`, `team` (selected), and `regulated`. These three are the only values.
- None of the inputs is bound to state. Continue reads nothing from them in the mockup.

### States
- **Error**: a red box above the fields reads "That namespace is taken." with the namespace and a request to pick another. The Namespace input is marked bad. Everything else stays.
- **Loading** and **denied**: the form is not drawn.
- **Mobile**: both two-column grids stack, and inputs are 16 px so iOS does not zoom.

## Namespace

The organization's short, permanent namespace, the first segment of every agent key.

### Purpose
You set the namespace once. The hint shows the key shape it produces, `a-intel.<workspace>.<agent>`, so you see how it will read in every key before you commit to it.

### Rationale
The namespace is fixed at creation and never changes (§5.1). Every agent key starts with it, and every frame, run, grant and audit event names an agent by its key, so renaming it would break every record that already carries it. That is why the hint says **immutable** and states the limit, 2 to 6 characters, before you type. A short namespace keeps keys readable in logs and chips.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Namespace | `ORG.slug` | `org.organizations` | live |
| Uniqueness check | none, the error state is forced | `org.organizations` | not backed |

### Logic
- The input `#ob-ns` is monospace with `maxlength=6`, and shows `a-intel`.
- The hint gives the length, the word **immutable**, and the key pattern with the namespace filled in.
- In the error state the input carries `ob-bad` (a red border), and the form's error box says `a-intel` belongs to another organization.
- The demo value `a-intel` has seven characters, one more than the rule and `maxlength` allow. The fixture and the rule disagree, and the build must settle which one holds.
- The build must check the namespace against every organization when Continue is pressed and refuse one that is taken. The hint states only the length, so the build must also state which characters it accepts.

### States
- **Loaded**: `a-intel` and the hint.
- **Error**: the red border and the form's error box.
- **Mobile**: the field fills the width.
