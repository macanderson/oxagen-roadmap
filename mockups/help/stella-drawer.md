# Stella drawer

## Drawer

The Stella drawer is Oxagen's in-app agent: you ask about what is on screen, or ask for a change, without leaving the page.

### Purpose
It answers questions from the record ("why did this run cost $5.08?") and makes changes you ask for through the same governed actions the screens use. Each reply names the run it was recorded as, and each change shows as an action card with its decision and receipt.

### Rationale
Approvals and Stella are drawers that open from every page (D16 in `docs/fleet-operations-wedge.md`), and the Stella drawer keeps its design (Unchanged). `docs/mission-control-spec.md` §4.4 sets the rules the drawer shows. Each turn is a run of its own, and that run is Oxagen's, not the customer's, so it never appears in Work, the run index or Spend's run counts. Stella holds no authority and no credentials: what it does passes IAM as you and lands in the record like an action taken on a page. The engine is a hosted `stella serve` and a required service. Nothing falls back to an in-process loop, so a drawer that cannot reach the engine says so by name instead of answering from somewhere else. Turns are metered in usage credits against a model key held for the organization. With no key there is nothing to spend against, so nothing runs and nothing is charged. The drawer flies out over the page, so the page does not move, and its host is never rebuilt, so the transition runs and a half-typed message survives a close.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| A turn: message, reply, conversation | the canned bubbles in `asstSheet()` | `ask_assistant` (`assistant.ask.ts`) | shipped |
| Page context | none; the turns are fixed | `pageContext` on `ask_assistant`: route, organization, workspace and entity id | shipped |
| The run a turn was recorded as | the chip on each Stella turn | the turn's `runId` (`arun_…`); assistant turns are left out of `list_runs` | shipped |
| Engine down | `S.asstEngine` | the refusal `engine_unavailable`; `get_assistant_engine` (`assistant.engine.get.ts`) probes `GET /readyz` | shipped |
| No model key | `orgKeyState()` over `ORG_KEY` | the credit gate's refusal | partial |

### Logic
1. `asstMount()` owns `#asst`, a host `render()` never replaces. It rebuilds the sheet only when the engine state, the organization or the key state changes (`data-sig`), and toggles `open`, `aria-hidden` and `inert` on every render.
2. `asstSheet()` picks one of three bodies: engine down, no model key, or the conversation.
3. Engine down: the header badge "engine down", the title, the engine address and the `503` it returned, Retry (which sets the engine back up in the mockup), and the engine version with its last healthy time. The text area is disabled.
4. No model key: the header badge "no model key", the title, the line that nothing has run or been charged, Open funding (gold, which closes the drawer and opens Organization on the funding tab), and "needs org.admin". The text area is disabled.
5. The conversation is the same on every page in the mockup. A build sends the page context with each turn, so on a run the answer reads that run's record, the Decision trace included.
6. The right edge is a separator: drag it or use the arrow keys to widen from 430 px up to 56 px short of the window. The width lives in this browser only (`mc.asstW`). A phone keeps the drawer full width.
7. Escape closes it when no dialog or menu is open.

### States
Loaded, with the engine-down and no-key conditions. On a phone it opens from More and covers the page full width, with the thumb bar visible under it.

## Launcher

The launcher at the foot of the sidebar opens the Stella drawer and says whether Stella can answer.

### Purpose
It is the one way into the drawer on desktop. Its second line says whose agent it is, and a third line appears when the engine is down or the organization has no model key, so you know before you type.

### Rationale
`docs/mission-control-spec.md` §4.4 puts the launcher at the foot of the sidebar. The top bar has no assistant button, and `tools/check-assistant.mjs` fails if anything else in the shell controls `#asst`. The marks come from the house brand kit: the asterisk is gold in both themes and the letters follow the theme.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Engine down | `S.asstEngine` | `get_assistant_engine` | partial: the app's launcher does not read it yet (#2968) |
| No model key | `orgKeyState()` | the organization's model credential (`org.model_credential.get.ts`) | partial |

### Logic
1. `asstLaunch()` draws the Stella mark, "Ask stella*", "oxagen’s in-app AI assistant", and a chevron, with `aria-controls="asst"` and `aria-expanded`.
2. With the engine down or no key, the mark carries a red dot and a third line reads "engine down" or "no model key".
3. A click calls `asstToggle()`, which focuses the text area when the drawer opens.

### States
Desktop only. On a phone the More sheet's "Ask stella*" tile opens the drawer.

## Action card

An action card records one governed action a Stella turn took: the capability, what it changed, the decision, and the receipt.

### Purpose
It lets you check a change Stella says it made against the record: which pull request and file, what changed, which policy and rule allowed it, and the receipt to open.

### Rationale
Every change Stella makes is a governed action through the capabilities a person uses, so the card shows the same facts a person's action would leave: the decision with its policy and rule, and a receipt. A change to a repository file, such as an agent definition, is a pull request for a person to merge. The card says the action was not billed: `resolve_approval` is the only billable governed action (`docs/mission-control-spec.md` §12.1).

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Capability, pull request, file, change, decision, receipt | the canned card in `asstSheet()` | the governed actions on the turn's run, read with `get_run` on the `arun_…` id | partial: the reply returns no card structure |
| The demo action | `open_context_pr` | `commit_agent_definition` for an agent definition change | partial |
| Receipt | `openDialog('receipt', 'rcp_01K5RTB4Q')` | a receipt read by id | future-only |

### Logic
1. One card per governed action in the turn, with the badge "action" and the capability in mono.
2. The Receipt link opens the `receipt` dialog.
3. A write that waits on a person comes back as a parked approval and shows in the Approvals drawer, not as a card.

### States
Shown in the conversation only.

## Composer

The composer is where you type a turn and send it.

### Purpose
You ask about a run or ask for a change. The line under it names the model and the engine the turn runs on.

### Rationale
Send is the drawer's one gold action. The text area keeps a half-typed message across a close because the host is never rebuilt. The foot line names the model and engine because a model-written answer should say what wrote it.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Message | the text area | `ask_assistant` input | shipped |
| Model and engine | `ASST_MODEL`, `ASST_ENGINE_URL` | the engine's health and the model in use | future-only: a build names neither until it reads them |

### Logic
1. The text area has the placeholder "Ask about a run, or change something" and the label "Message the assistant".
2. Send posts "Turn posted. Recorded as a run of the in-app agent." in the mockup. A build calls `ask_assistant` and appends the reply.
3. With the engine down or no key the composer is replaced by a disabled text area that says why.

### States
Loaded. On a phone the thumb bar covers the foot line in the mockup. A build keeps the composer and foot line above it, sets the text area to 16 px, and gives Send a 44 px hit area.
