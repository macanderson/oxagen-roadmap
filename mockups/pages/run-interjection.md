# Run · interjection

| | |
|---|---|
| Route | `#/a-intel/core-platform/runs/run_01K6QW3D5N7TYBA2`: a run whose loop Oxagen has stopped |
| Scope | workspace |
| Spec | see `skills.md`; the ordinary run page is `run.md`; the drawer is owned by `fleet.md` |
| Design | `mockups/src/engine.js` → `pRun()` hands this run to `skRunPage()`; the drawer row is `apdInterjectionRow()` |
| States | loaded (waiting · answered: link · answered: create) · loading · error · access denied |
| Storybook | `Oxagen / … / run-interjection`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `run-interjection.audit-prompt.md` |

## Job

The same moment from three sides. A run started in `a-intel/edge-proxy`, a repository no workspace owns; skills are on, so there is a config to resolve and nothing to resolve it against, and Oxagen stopped the loop before the first model call and put the question to a person **through the agent**. You answer here, in the agent's own window, or from the approvals drawer (same answer, same frame); the run continues; the pause, the question, the wait, and the answer are frames in the same chain as the work.

## What is on the page

**Header**: eyebrow “Run · <run id>”, h1 the task title (“Cut the first release notes for edge-proxy”), meta line “a-intel.core.release-manager · Claude Code · Marcus Bell · harness tier · github.com/a-intel/edge-proxy@e7c41a9”, status **paused · waiting on a person**, or **live** once answered. No header actions.

- **Note**, waiting: “The loop is stopped. Not failed, not queued, not continuing on a default. The harness is holding at the boundary before its first model call, the clock on this run is not running, and nothing has been charged since 09:14:02Z.” Answered: what the answer did, and **Ask again** (resets the demo; not a product control).
- **The triptych** (three panes, stacking on a phone):
  - *What the agent shows Marcus* (harness): the operator's message; Oxagen's bubble, labelled **interjection** (“Before I start: this repository is not bound to a workspace, so I have no skills config to work from. I am not going to guess which one applies.”); two pick cards **Link it to core-platform** (“Becomes a linked repo. Inherits skl_v7, the belt, the budget and the harness tier of that workspace.”) and **Create a new workspace** (“Called edge, with a-intel/edge-proxy as its main repo. Ships with skills off, like every workspace does.”); **Send this answer** (disabled with “pick one” until a card is picked, then “answers as Marcus Bell”). Once answered: the operator's reply and the agent's turn 1 (with a skill loaded, or told in one line that it has none and that it will say so in the pull request). Note: “The question reaches Marcus where they already are, in the agent’s own surface. There is no second inbox to check, and the agent is not the author of the question.”
  - *What Oxagen put to a person* (gateway, gold): the `control.interject` card (“the loop is held”; `repo.unknown`; `skills.enabled = true` and `unbound_repo = ask`); two paths side by side, h3 **Link** and **Create**, with +/−/· consequence lines. Link: “+ Inherits skl_v7: 7 skills in scope, 1 withheld”, “+ Inherits the belt, the $2.00 run budget and the harness tier”, “+ Becomes the third linked repo · indexed into the code graph”, “· Marcus already owns this workspace, so no new grant”, “− Everything in edge-proxy is now in core-platform’s spend and audit”. Create: “− Skills ship off. 0 in scope, and search_skills is not on the belt”, “− No belt, no budget, no price book until somebody sets them”, “+ Its own spend, its own audit, its own owner”, “+ a-intel/edge-proxy becomes its main repo, branch main”, “· This run continues either way, with a procedure or without one”. The note that the second path restates the default mid-run. **If nobody answers**: “At 30 minutes this times out to `deny`. The run continues with no skills and the agent is told why, because the safe end of an unanswered question is fewer skills, not more.” Once answered: the receipt (`rcp_01K6QW44` for link, `rcp_01K6QW45` for create), the wait, and that binding a repository went through the same path as approving a payment.
  - *What was written down* (frames), waiting: `run.started` · `repo.unknown` · `control.interject` · `control.answer` (“marcus answered · pending”), then `skills.resolved` · `context.assembled` · `model.request` greyed (“The three greyed frames have not happened. A run that is waiting is a run that has written down that it is waiting.”). Answered (link): `control.answer` · `repo.bound` · `skills.resolved` · `skills.searched` · `skills.loaded` · `context.assembled` · `model.request`. Answered (create): `control.answer` · `workspace.created` (`skills.enabled = false`) · `repo.bound` · `skills.resolved` (0 in scope) · `context.assembled` · `model.request`.
- **After the answer**. Link: **Skill loaded** (the skill row; “1,840 tokens · $0.0055 · priced on the Spend page as context, not as output”). Create: **Workspace created**: `a-intel/edge-proxy · .oxagen/workspace.toml` with no `[skills]` block, and **See how core-platform did it** (→ Skills · Versions).

**In the approvals drawer.** While the interjection waits it is the first row of the drawer on every page (`apdInterjectionRow`): “Interjection · release-manager is paused”, “It started in `a-intel/edge-proxy`, which no workspace owns. Skills are on in Core platform, so there is a config to resolve and nothing to resolve it against. Nothing has been charged since 09:14:02Z; at 30 minutes it times out to `deny`.”, and **Answer it** (closes the drawer and opens this page). It counts one in the topbar button, in the Fleet nav count, in the Fleet “Waiting on a human” tile, and in the Steering nav count.

**Dialogs this page opens:** none.

**Shell.** As `run.md`: sidebar, top bar with the approvals button left of the avatar, no assistant button in the top bar.

## Data sources

| Element | Mockup collection | Target store (proposed) | Backing today | Status |
|---|---|---|---|---|
| The run, its frames before and after | `SKRUN`, `SK_FRAMES`, `SK_AFTER` | run ledger: `repo.unknown`, `control.interject`, `control.answer`, `repo.bound`, `workspace.created`, `skills.*` frame kinds | run ledger exists; none of these kinds do | ❌ |
| The two paths and their consequences | computed from `SK_CFG`, `WS` | derived at interjection time from the config that would apply | none | ❌ |
| The answer (link / create) | `SKS.answered`, `SKS.picked` | a governed action with a receipt (`rcp_…`) | none | ❌ |
| The drawer row and its count | `skWaiting(w)`, `apdInterjections()` | `control.interjections` open, joined into the approvals count | none | ❌ |

## Functionality

- The question reaches you where you already are (the agent's surface); there is no second inbox. The agent is not the author of the question and the bubble says so. The drawer row is a pointer to this page, not a second place to answer.
- Either path is a governed action: rule, grant, receipt, name. Creating a workspace ships it with skills off, in the middle of a run that was asking for skills.
- Timeout at 30 minutes → `deny`: the run continues with no skills and is told why.

## States

- **loaded**: waiting (default), then answered (link) or answered (create) after **Send this answer**; **Ask again** returns to waiting.
- **loading**: skeleton. **error**: “This run could not be loaded”, `502 frame_store_unreachable`, **Try again**, **Open an incident**. **access denied**: `runs.read on core-platform`, **Request access**, **Back to Fleet**.

## Mobile

The three panes stack in the order shown; the two paths stack; pick cards are full width; the thumb bar's Fleet count and the topbar approvals count include this run while it waits; the drawer is full-width.

## Permissions

- Read: `runs.read` · Answer: `repo.bind` (link) or `workspace.create` (create) on the organization. The answer is the governed action, not a chat reply.

## Backend gaps this page depends on

- The interjection frame kinds on the run ledger (`repo.unknown`, `control.interject`, `control.answer`, `repo.bound`, `workspace.created`, `skills.*`)
- The open-interjection count joined into the approvals drawer

## Rules every build of this page must keep

- The tier on the meta line is the recorded one (`harness` here); nothing says enforced about it.
- Exactly one gold pane and one gold button (Send this answer); gold never encodes state.
- No heading carries a comma, a mid-dot, or a not/never contrast; subtext under a heading is one sentence or nothing.
- The greyed frames stay greyed until they happen; nothing renders a frame that was not written.
