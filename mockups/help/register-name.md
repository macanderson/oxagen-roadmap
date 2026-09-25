# Register agent · Name

## Page header {#register-name/header}

The step's eyebrow, its title, and one line that says the agent key is fixed once chosen.

### Purpose
You arrive here from **Register agent** on Agents, from the `wrap` dialog kind, or from ⌘K "Register an agent". The header tells you which of the three steps you are on and warns you, before you type, that the name you pick becomes a key you cannot rename.

### Rationale
The lead is one sentence because the page has one decision on it: the key. The rest of what the old lead said moved here. Nothing is saved until the agent connects for the first time. Registration writes no row on Continue, so a person who backs out at any step leaves nothing behind (`docs/mission-control-spec.md` §4.4, "one path, not two"). The key cannot change later because it is the agent's identity in every frame, run, grant and audit event: `<org namespace>.<workspace>.<agent>`, the same shape the onboarding namespace hint shows.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Eyebrow and title | literal in `regName()` | none, static copy | live |
| Signed-in operator (for the audit of the later writes) | `PEOPLE.marcus` | `auth.sessions` | live |

### Logic
- `pRegister(r)` picks the step from the route with `regStepOf(r)`: `/register` and `/register/name` render `regName()`.
- The footer carries **Cancel** (`regCancel`) and **Continue** (gold, `regNav('wrap')`). Continue writes nothing. It moves to `/register/wrap`.
- Cancel clears `S.reg` and its timers, returns to Work, and toasts "Registration canceled. Nothing was installed and nothing was written." Escape does the same on any register step.
- The build must mint the one-time enrollment token when Continue is pressed (`enrollment.create`, a governed action in Audit) and nothing else. The mockup mints nothing. The token it shows on the next step is the fixed `REG_TOKEN`.

### States
- **Loaded**: eyebrow "Step 1 of 3", title "Name the agent", the one-line lead.
- **Loading** and **denied**: the header is not drawn. The gate shell and the step rail stay, and the skeleton or the denied block (`deniedState("agent registration", "agent.register on core-platform")`) fills the body.
- **Mobile**: same text, full width, with the footer buttons stacked full width.

## Gate shell

The frame around every step of Register agent and of onboarding: the brandmark, the signed-in address, and Cancel, with no sidebar and no top bar.

### Purpose
It tells you that you are inside a short, closed flow and gives you one way out. You see who you are signed in as, so you know whose name the enrollment will carry, and you can leave at any time.

### Rationale
Registration and onboarding are one component in two modes, so the shell is written once here and both gates open this section. `regShell(step, inner)` draws it for `pRegister` (Register agent) and for `pWelcome` in onboard mode (`S.reg.mode === "onboard"`), because the gate reuses the Register agent screens word for word (`docs/mission-control-spec.md` §4.4: "Onboarding is gated, and it is three steps").

The app shell is left out on purpose. A new organization has no app yet: nothing unlocks until the first frame arrives, so a sidebar would offer pages that cannot open. Register agent borrows the same frame so the two paths look and behave the same. Appendix F counts neither as a page.

The caption that sat under every step moved here. Registration finishes when the agent first connects to Oxagen, and that connection also tests the install. In onboarding the same event opens the operator console. You can cancel at any step, and nothing is saved until the agent connects.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Signed-in address | `PEOPLE.marcus.email` | `auth.sessions` | live |
| Mode (register or onboard) | `S.reg.mode` | `org.onboarding_state` (G16) | not backed |
| Flow state and timers | `S.reg` (`regNew`, `obNew`) | none, client state | mockup only |

### Logic
- **Cancel** (`regCancel`) in register mode clears `S.reg` and every timer (`regClear`), goes to Work, and toasts one of two lines: "Nothing was installed and nothing was written." before the first frame, "The enrollment was revoked and the smoke run discarded." after it (`S.reg.first`).
- In onboard mode Cancel calls `obExit`. The demo labels it **Exit demo** and hides it under `?product=1`. The build says **Cancel**.
- Escape runs the same Cancel on every step.
- The build must revoke the enrollment token on Cancel once the host has enrolled. After the first frame (`S.reg.first`), ingest has already written the agent and its smoke run, so Cancel must discard both as well.

### States
- **Loading**: the shell and the step rail stay, and the skeleton replaces the step's body.
- **Denied**: the shell and the rail stay, and `deniedState` fills the body: `agent.register on <workspace>` in register mode, `org.create for <email>` in onboard mode, with **Request access** and **Back to Work**.
- **Mobile**: the brandmark and Cancel share one row, and the email is hidden.

## Step rail

The three numbered steps of the gate, with the current one marked and the finished ones clickable.

### Purpose
It shows how far you are and how much is left, and lets you go back to a step you finished. You cannot jump ahead, because each step needs the one before it.

### Rationale
Three steps is the whole gate (`docs/mission-control-spec.md` §4.4). The rail names them so the first frame reads as the finish line: Register agent ends on "Wait for the first frame" and onboarding on "Start a run". Onboarding swaps the first step, Name the organization, for Name the agent, because the organization does not exist yet when you sign up.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Step labels | literal lists in `regShell()` | none, static copy | live |
| Current step | the route, through `regStepOf(r)` or `r.step` | `org.onboarding_state` for onboarding (G16) | not backed |

### Logic
- Register mode: 1 Name the agent, 2 Wrap the agent, 3 Wait for the first frame. Onboard mode: 1 Name the organization, 2 Wrap an agent, 3 Start a run.
- A step before the current one shows ✓ and is a button that calls `regNav(id)`. The current step carries `aria-current="step"`. A later step is `disabled`.
- `regNav` builds the hash with `regHash`, which hands onboard mode to `obHash`. Inside the W1 scenario `obHash` routes through the scenario step so the scenario rail stays on screen.
- The rail is a `nav` named "Register an agent" or "Onboarding".

### States
- **Loading** and **denied**: the rail stays, with the step the route names as current.
- **Mobile**: the labels hide and the numbered circles remain.

## Agent form

The four fields that name the agent and say where it will run: agent name, workspace, harness and model class.

### Purpose
You choose the agent's name, confirm the workspace it lands in, pick the harness that runs it, and pick its model class. The next step's installer is chosen from the harness.

### Rationale
The form asks only for what the key and the installer need. Everything else about an agent (its toolbelt, budget, mandates) is set after it exists, on its own tabs, because an agent exists only once its first frame arrives.

The explanations that sat in the form moved here:
- The Workspace hint said the agent's definition file lands in `.oxagen/agents/` in the workspace's main repo. The definition is a file under version control, so the agent is reviewed like code.
- The Model class hint said the harness calls the model with its own key, and the tier is recorded on every frame. Oxagen does not hold the agent's model key. The class is a label the frames carry.
- The note under the grid said Continue creates a one-time enrollment token for the key. Nothing is written to the database and no pull request opens until the agent first connects. That first session then opens the pull request that adds the definition file.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Agent name | `S.reg.slug` (`regNew`, demo `perf-watch`) | `iam.principals`, minted at the first frame | partial (G16) |
| Workspace and main repo | `ws()` over `FIXTURES.WS` | `wrk.workspaces`, `wrk.repositories` | live |
| Harness | `S.reg.harness`, labels from `REG_HARNESS` | `control.enrollments` | live |
| Model class | `S.reg.tier` | none named in the page spec | not backed |

### Logic
- **Harness** offers `claude-code`, `codex-cli`, `stella`, `claude-agent-sdk` and `custom`. Changing it sets `S.reg.tab` through `regTabFor`: `claude-code` opens the Claude Code tab, `codex-cli` the Codex CLI tab, and every other value the SDK agent tab. The hint says so, and that it can be changed there.
- **Model class** is `complex` or `light`. `obUnlock` copies it onto the new agent, and the smoke run's model is `claude-haiku-4-5` for `light` and `claude-opus-5` otherwise.
- **Workspace** is read-only: the gate registers into the workspace you opened it from.

### States
- **Loading** and **denied**: the form is not drawn.
- **Mobile**: the two-column grid stacks, and inputs are 16 px so iOS does not zoom.

## Agent key

The agent name field and the key it produces, `<org>.<workspace>.<agent>`, rewritten on every keystroke.

### Purpose
You see the exact key the agent will carry before you commit to it, so a typo is caught here rather than in every record afterwards.

### Rationale
The key is the agent's durable identity: every frame, run, grant and audit event names it, and the agent's definition file is named for it. It is fixed once the agent connects, as the header warns. Showing the normalised key live removes the surprise of a name that the server rewrote.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Slug | `regSlug()` over `S.reg.slug` | `iam.principals`, minted at the first frame | partial (G16) |
| Organization namespace | `ORG.slug` | `org.organizations` | live |
| Workspace segment | `ws().slug`, first segment | `wrk.workspaces` | live |

### Logic
- `regSlug` lower-cases the input, turns every run of other characters into one hyphen, trims hyphens from both ends, and falls back to `agent` when nothing is left.
- `regKey` joins `ORG.slug`, the first hyphen-separated segment of the workspace slug, and the slug: `core-platform` gives `a-intel.core.perf-watch`.
- `regKeyLive` runs on every input event and rewrites every `.regKeyLive` element, so the hint changes without a re-render and the input keeps focus.
- The build must check the key for uniqueness in the workspace when Continue is pressed and refuse a key that is taken. The mockup does not.

### States
- **Loaded**: the demo value `perf-watch` and the hint "The agent key becomes `a-intel.core.perf-watch`."
- **Mobile**: the field fills the width.
