# Run · interjection

| | |
|---|---|
| Route | `#/a-intel/core-platform/runs/run_01K6QW3D5N7TYBA2` — a run whose loop Oxagen has stopped |
| Scope | workspace |
| Spec | see `skills.md`; the ordinary run page is `run.md` |
| Design | `mockups/src/engine.js` → `pRun()` hands this run to `skRunPage()` |
| States | loaded (waiting · answered: link · answered: create) · loading · error · access denied |
| Storybook | `Oxagen / … / run-interjection`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `run-interjection.audit-prompt.md` |

## Job

The same moment from three sides. A run started in `a-intel/edge-proxy`, a repository no workspace owns; skills are on, so there is a config to resolve and nothing to resolve it against, and Oxagen stopped the loop before the first model call and put the question to a person **through the agent**. The operator answers here (or in the agent's own window — same answer, same frame); the run continues; the pause, the question, the wait and the answer are frames in the same chain as the work.

## What is on the page

**Header** — eyebrow “Run · <run id>”, h1 the task title, meta line (agent · harness · operator · gateway tier · remote@sha), status **paused · waiting on a person** or **live** once answered.

- **Note** — waiting: “The loop is stopped. Not failed, not queued, not continuing on a default…nothing has been charged since 09:14:02Z.” Answered: what the answer did, and **Ask again** (resets the demo).
- **The triptych** (three panes, stacking on a phone):
  - *What the agent shows Marcus* (harness) — the operator's message; Oxagen's bubble, labelled **interjection**, explaining it will not guess; two pick cards **Link it to core-platform** / **Create a new workspace**; **Send this answer** (disabled until one is picked; “answers as Marcus Bell”). Once answered: the operator's reply and the agent's turn 1 (with a skill loaded, or told in one line that it has none and that it will say so in the pull request).
  - *What Oxagen put to a person* (gateway, gold) — `control.interject` card (`repo.unknown`; `skills.enabled = true` and `unbound_repo = ask`); two paths side by side with +/−/· consequence lines: **Link** (inherits `skl_v7`, the belt, the budget, gateway tier; third linked repo; no new grant; spend and audit move) and **Create** (**skills ship off**, 0 in scope, `search_skills` not on the belt; no belt, budget or price book; own spend, audit, owner; the repo becomes its main repo; the run continues either way); note that the second path restates the default mid-run; “If nobody answers — at 30 minutes this times out to `deny`”. Once answered: the receipt, the wait, and that binding a repository went through the same path as approving a payment.
  - *What was written down* (frames) — waiting: `run.started` · `repo.unknown` · `control.interject` then `control.answer` · `skills.resolved` · `context.assembled` · `model.request` greyed (“A run that is waiting is a run that has written down that it is waiting”). Answered (link): `control.answer` · `repo.bound` · `skills.resolved` · `skills.searched` · `skills.loaded` · `context.assembled` · `model.request`. Answered (create): `control.answer` · `workspace.created` (`skills.enabled = false`) · `repo.bound` · `skills.resolved` (0 in scope) · `context.assembled` · `model.request`.
- **After the answer** — link: “The skill it loaded” (the skill row; 1,840 tokens · $0.0055, priced as context). Create: “The workspace that was created” — `a-intel/edge-proxy · .oxagen/workspace.toml` with **no `[skills]` block**, and **See how core-platform did it** (→ Skills · Versions).

**Dialogs this page opens:** none.

## Data sources

| Element | Mockup collection | Target store (proposed) | Backing today | Status |
|---|---|---|---|---|
| The run, its frames before and after | `SKRUN`, `SK_FRAMES`, `SK_AFTER` | run ledger: `repo.unknown`, `control.interject`, `control.answer`, `repo.bound`, `workspace.created`, `skills.*` frame kinds | run ledger exists; none of these kinds do | ❌ |
| The two paths and their consequences | computed from `SK_CFG`, `WS` | derived at interjection time from the config that would apply | none | ❌ |
| The answer (link / create) | `SKS.answered`, `SKS.picked` | a governed action with a receipt (`rcp_…`) | none | ❌ |

## Functionality

- The question reaches the operator where they already are (the agent's surface); there is no second inbox. The agent is not the author of the question and the bubble says so.
- Either path is a governed action: rule, grant, receipt, name. Creating a workspace ships it with skills off, in the middle of a run that was asking for skills.
- Timeout at 30 minutes → `deny`: the run continues with no skills and is told why.

## States

- **loaded** — waiting (default), then answered (link) or answered (create) after **Send this answer**; **Ask again** returns to waiting.
- **loading** — skeleton. **error** — “This run could not be loaded” — `502 frame_store_unreachable`. **access denied** — `runs.read on core-platform`.

## Mobile

The three panes stack in the order shown; the two paths stack; pick cards are full width; the thumb bar's Fleet count includes this run while it waits.

## Permissions

- Read: `runs.read` · Answer: `repo.bind` (link) or `workspace.create` (create) on the organization — the answer is the governed action, not a chat reply.
