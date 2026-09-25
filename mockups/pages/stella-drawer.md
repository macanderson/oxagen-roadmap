# Stella drawer

| | |
|---|---|
| Route | None of its own. It opens over any page. The story opens it over the Decision trace: `#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW`, with `?drawer=stella` on the file URL (`missioncontrol.html?product=1&drawer=stella#/a-intel/core-platform/runs/run_01K5RS7M2E8FJ3QW`) |
| Scope | workspace. `ask_assistant` is scoped, so the drawer answers inside the workspace it was opened in |
| Spec | `docs/fleet-operations-wedge.md`: D16 (Approvals and Stella are drawers that open from every page), Unchanged (the Stella drawer keeps its design), D17 (future-only marks). `docs/fleet-operations-ia.md` (Drawers: it reads the page it was opened from through `ask_assistant` `pageContext`, and its changes go through the same governed actions a person uses). ADR-053 in `macanderson/oxagen` (the in-app agent engine) |
| Design | `mockups/src/engine.js` → `asstSheet()`, `asstHead()`, `asstStateBlock()`, `asstMount()`, `asstToggle()`, `asstLaunch()`, `stellaWordmark()`, `stellaMark()`, `stellaName()`, and the Stella tile of `DLG_EXT.more`; `mockups/src/boot.js` opens it for `?drawer=stella`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Drawers / Stella`: Loaded and Loaded · mobile |
| Audit | `stella-drawer.audit-prompt.md` |

## Job

Let an operator ask about what is on screen, or ask for a change, without leaving the page. Stella is Oxagen's in-app agent. Each turn is recorded as a run of its own, Oxagen's and never the customer's, and every change it makes goes through the same governed actions the screens use. It holds no authority and no credentials.

## What is on the page

**Where it opens.** The launcher at the foot of the sidebar: the Stella mark, "Ask stella*" (the asterisk in gold), and "oxagen’s in-app AI assistant" under it, then "engine down" or "no model key" when one applies, with a chevron; `aria-controls="asst"` and `aria-expanded`. On a phone, the More sheet's tile "Ask stella*" with "ask about a run, or change something". In the command menu (⌘K), the assistant group's "Open the assistant", "Ask why a run came back tampered" and "Ask what an agent cost this month". The top bar carries no assistant button.

**The drawer** (`#asst`) flies out from the sidebar over the page, so the page does not move. Closed, it is `inert` and `aria-hidden`. A half-typed message survives a close.

- The header: the Stella wordmark (an image labelled "stella", the letters in the page's ink and the asterisk gold in both themes) and the close button (×, aria-label "Close the assistant").
- The conversation. Each message has its author above it: the operator's name ("Marcus Bell") over a bubble, or "stella*". A Stella turn carries a chip naming the run it was recorded as and whose it is ("run_01K5RT9X4M2 · oxagen’s run"). The chip breaks the label rule below with its mid-dot. A build keeps the run id and whose run it is, and drops the mid-dot.
- An action card for each governed action a turn took: the badge "action" and the capability in mono, then its facts. On the demo: Pull request (`a-intel/platform#521`), File (`.oxagen/agents/triage.toml`), Change ("tools narrowed 52 → 18"), Decision ("allow · pol_v41 · rule rg_0041"), Receipt (`rcp_01K5RTB4Q`, which opens the receipt), and Recorded as ("one governed action, in the ledger and not billed"). Why it is not billed is in the component help (`mockups/help/stella-drawer.md`, Action card).
- The demo conversation, which is the same on every page:
  1. Marcus Bell: "Triage is burning money on tool definitions. Narrow its toolbelt to what it actually used in the last 30 days, and tell me what you changed."
  2. stella*: "I read the finding and the toolbelt. 34 of the 52 tools on a-intel.core.triage were never called in 1,340 runs. Narrowing the toolbelt is a change to the agent definition, so it is a pull request, not a database write. I opened one.", the action card, and "Estimated saving from the frames it cites: $188.40 USD over 30 days. In team mode someone other than the author merges, so it is yours to merge."
  3. Marcus Bell: "Why did run_01K5RG6H1L4OIU9Y cost $5.08?"
  4. stella*: "Two thirds of its input tokens were tool result bodies: it re-read CHANGELOG.md on five of seven turns, and the cache missed after turn 3 because a steering publish changed the prefix mid-run." Then a sentence that the Cost tab pins both findings to their turns and that Optimization names the record that stops the re-read, and the link "Open the waterfall →" to that run's Cost tab.
- The composer: a text area (placeholder "Ask about a run, or change something", aria-label "Message the assistant") and "Send" (gold). Sending posts the turn: "Turn posted. Recorded as a run of the in-app agent."
- The foot line: "Runs `z-ai/glm-flash-latest` on `https://engine.oxagen.sh/v1`." What Stella may do, and how its model calls are billed, is in the component help (Drawer).

**Two conditions replace the conversation**, each with the composer disabled:

- Engine down: the header badge "engine down", the title "The stella engine is not answering", the line "`https://engine.oxagen.sh/v1` returned `503`.", "Retry", and "engine 0.31.4 · last healthy 09:02:11Z". The text area reads "Unavailable while the engine is down".
- No model key: the header badge "no model key", the title "This organization has no model key", the line "Nothing has run and nothing has been charged. An owner mints a key under Organization → Model funding and routes.", "Open funding" (gold, to Organization › Model funding and routes), and "needs org.admin". The text area reads "Unavailable until a model key is minted".

**Page context.** A turn carries the page it was asked from: its route key, the organization and workspace, and the record on the page (the run id here). Opened on a run, Stella answers from that run's record, the Decision trace included. The mockup's conversation does not change with the page; the story over the run shows the same demo turns.

## Data sources

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen (file paths) | Status |
|---|---|---|---|---|
| A turn: message, reply, conversation | the canned bubbles in `asstSheet()` | `ask_assistant` | `packages/oxagen/src/contracts/assistant.ask.ts:61`; input `:82-91`, output `:92-110`; the app's flyout calls it (`apps/app/src/features/shell/assistant-actions.ts:42-66`) | ✅ |
| Page context | none; the mockup's turns are fixed | `pageContext` on `ask_assistant` | route, organization, workspace and entity id (`assistant.ask.ts:37-46`); the app sends it (`apps/app/src/features/shell/assistant-actions.ts:56-65`) | ✅ |
| The run a turn was recorded as, and that it is Oxagen's | the chip on each Stella turn | the turn's `runId`; list exclusion | `runId` (`arun_…`) on the output (`assistant.ask.ts:97-98`); assistant turns are left out of `list_runs` (`packages/oxagen/src/contracts/run.list.ts:9-12`, `:37`) | ✅ |
| Parked writes a turn opened | none in the demo | `parkedCards` | `assistant.ask.ts:48-58`, `:101-108` | ✅ |
| Action cards: capability, pull request, decision, rule, receipt | the canned card | the governed actions inside the turn's run | each tool call is a governed action recorded on the turn's run (`get_run` on the `arun_…` id); no card structure is returned with the reply, and no capability reads a receipt by id | 🟡 |
| The demo action: an agent definition change | `open_steering_pr` in the card | `commit_agent_definition` | `open_steering_pr` writes one record file under `.oxagen/rules/` (`packages/oxagen/src/contracts/steering.pr.open.ts:1-4`); an agent definition change is `commit_agent_definition` (`packages/oxagen/src/contracts/agent.definition.commit.ts:47`) | 🟡 |
| Billing line | the foot line and the card | ADR-053 metering; `resolve_approval` as the billed action | the turn is not a governed action and its tokens are metered on the organization's funding (`assistant.ask.ts:26-30`); `resolve_approval` carries no billing exemption (`packages/oxagen/src/contracts/agent.approval.resolve.ts:32-37`) | ✅ |
| Engine down | `S.asstEngine` | the refusal `engine_unavailable` | `assistant.ask.ts:17-19`; the app maps it (`apps/app/src/features/shell/assistant-flyout.tsx:341`) | ✅ |
| No model key | `orgKeyState()` | the funding refusal | the credit gate's codes (`assistant.ask.ts:22`); the app maps a key limit (`assistant-flyout.tsx:335`) | 🟡 |
| The launcher's model and "ready", and the foot line's model and engine | `ASST_MODEL`, `S.asstEngine` | engine health and the model in use | not read in the launcher (`apps/app/src/features/shell/assistant-launcher.tsx:19-21`, #2968). The engine address and the model name appear nowhere in the app's source outside test builders | ❌ |

## Future-only fields

The drawer carries no future-only mark, and the catalog gives it no future story. The ❌ row above is future-only nonetheless: a build's launcher reads "Ask stella*" without a model or an engine state, and its foot line names neither, until they are read.

## Functionality

- Each turn is a run of the in-app agent: recorded with frames and a receipt, metered in usage credits on the organization's funding, and never counted among the customer's runs.
- Every change Stella makes is a governed action through the same capabilities a person uses, with the decision, the rule and a receipt. A change to a file in the repository, such as an agent definition, is a pull request for a person to merge.
- A write that waits on a person comes back as a parked approval, which shows in the Approvals drawer.
- The turn carries the page it was asked from. On a run page, that is the run, and the answer reads that run's record, the Decision trace included. Nothing Stella writes is the record of the run it answers about.
- The engine is a required service. If it does not answer, the drawer says so by name and nothing falls back to an in-process loop. With no model key there is nothing to run and nothing is charged.
- The drawer flies over the page and does not move it. A half-typed message survives a close. The drawer opens from every page (D16).

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed. The engine-down and no-key conditions above are part of the loaded design.

## Mobile

- The drawer opens from the More sheet's "Ask stella*" tile and covers the page full width.
- The thumb bar stays visible under it. In the mockup the thumb bar covers the foot line under the composer; a build keeps the foot line and the composer above the thumb bar.
- "Send" sits inside the composer. In the mockup the text area is 13 px, "Send" is 24 px tall and the close button 32 px. A build sets the text area to 16 px, so a phone does not zoom on focus, and gives every button a hit area of at least 44 px.

## Permissions

- `ask_assistant`: allowed by default to organization Owner and Admin and to workspace Owner and Member (`assistant.ask.ts:73-76`). The drawer offers the composer only inside a workspace.
- Every action a turn takes passes its own capability's IAM check as the person, and lands in Audit.

## Backend gaps this page depends on

- The actions a turn took, returned with the reply, so the drawer can draw an action card per governed action.
- A receipt read by id.
- The engine's health, its address and the model in use, for the launcher and the foot line.

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- Stella's reply is a model-written answer, and the drawer labels it as Stella's. It never appears in a run's Decision trace, and nothing it writes becomes the record of another run.
- No person is scored or ranked.
- Every enforcement claim states the tier, and every action card names the decision and the rule that allowed it.
- Headers are rollups of the rows beneath them.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: "Send", or "Open funding" when there is no model key.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
