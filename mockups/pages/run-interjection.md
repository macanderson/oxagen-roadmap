# Run held for an answer

| | |
|---|---|
| Route | `#/a-intel/core-platform/runs/run_01K6QW3D5N7TYBA2`, a run whose loop Oxagen has stopped for a person. The same run path renders `run.md` for every run that is not held. No old route lands here other than the run path itself |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: Cuts (the Skills console is cut and "The interjection stays in the Approvals drawer"), D12 (a skill is a Steering Source), D16 (Approvals is a drawer on every page), D2 (a run is a child of one work order). `docs/fleet-operations-collapse.md` (W13 is retired; this page takes the interjection from `skills.md`). `docs/w13-in-the-loop-scenario.md` for the history of the scenario |
| Design | `mockups/src/engine.js` → `pRun()` hands this run to `skRunPage()`, with `skTrAgent()`, `skPick()`, `skTrOperator()`, `skDl()`, `skFrameRow()`, `skAfterPanel()`, `skRow()`, `skAnswer()` and `skReset()`; the drawer row is `apdInterjectionRow()`, counted by `skWaiting()`, `apdInterjections()` and `apdCount()`; built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded (waiting, answered by link, answered by create) · loading · error · access denied |
| Storybook | `Oxagen / Runs / Held for an answer`: Loaded, Loading, Error and Access denied, each also · mobile |
| Audit | `run-interjection.audit-prompt.md` |

## Job

Show one moment from three sides. A run started in `a-intel/edge-proxy`, a repository no workspace owns. Skills are on in Core platform, so there is a config to resolve and nothing to resolve it against, and the config says to ask (`unbound_repo = ask`). Oxagen stopped the loop before the first model call and put the question to a person through the agent. The person answers here, in the agent's own window, or reaches this page from the Approvals drawer. The pause, the question, the wait and the answer are frames in the same chain as the work.

The Skills console that used to host this moment is cut, and the walk W13 is retired. The interjection stays: it waits in the Approvals drawer on every page, and this page is where it is answered.

## What is on the page

**Shell.** As `run.md`: the sidebar with Work lit, and the top bar with the Approvals button, whose count includes this interjection while it waits. The breadcrumb reads Anderson Intelligence Corp. / Core platform / Work orders / `run_01K6QW3D5N7TYBA2`. The held run names no work order: the mockup files it under none, where D2 files a run started from an operator's terminal under a direct work order. A build names the direct work order in the breadcrumb, as `run.md` does.

**Header.** Eyebrow "Run · run_01K6QW3D5N7TYBA2", h1 "Cut the first release notes for edge-proxy", and the line "a-intel.core.release-manager · Claude Code · Marcus Bell · harness tier · github.com/a-intel/edge-proxy@e7c41a9". On the right, the status: "paused · waiting on a person" (approval colour) while waiting, and "live" once answered. No header actions. The eyebrow and the waiting status each carry a mid-dot, against the label rule below. A build keeps the words and drops the mid-dot: the eyebrow "Run" with the id in mono beside it, and the status "paused" with "waiting on a person" as its caption.

**The note.**

- Waiting: "**The loop is stopped.** Not failed, not queued, not continuing on a default. The harness is holding at the boundary before its first model call, the clock on this run is not running, and nothing has been charged since 09:14:02Z."
- Answered by link: "**Answered.** a-intel/edge-proxy is a linked repo of core-platform, the run resolved skl_v7, and one skill is loaded."
- Answered by create: "**Answered.**" and that the workspace edge exists with `a-intel/edge-proxy` as its main repo and skills off, because that is what a new workspace ships as, and that the run carries none and the agent was told so in one line.
- After either answer, "Ask again", which resets the mockup to waiting. It is not a product control.

**The triptych**, three panes side by side, each with an eyebrow and a label naming whose view it is.

1. **What the agent shows Marcus** (label "harness").
   - Marcus Bell at 09:14:01Z: "Cut the first release notes for edge-proxy. Everything since the repo was created."
   - Oxagen, labelled "interjection", at 09:14:02Z: "Before I start: this repository is not bound to a workspace, so I have no skills config to work from. I am not going to guess which one applies." Then "Two ways forward, and they are not the same:".
   - Two pick cards (`aria-pressed`, a check glyph on the one picked): "Link it to core-platform", "Becomes a linked repo. Inherits skl_v7, the belt, the budget and the harness tier of that workspace."; and "Create a new workspace", "Called edge, with a-intel/edge-proxy as its main repo. Ships with skills off, like every workspace does."
   - "Send this answer" (gold), disabled with "pick one" beside it until a card is picked, then "answers as Marcus Bell".
   - Answered: Marcus's reply at 09:17:38Z ("Link it to core-platform." or "Make a new workspace. Call it edge.") and the agent's turn 1 at 09:17:39Z. By link: "Bound. I have a-intel.release-notes-from-prs@2.1.0 and I am following it: group the merged pull requests, write the draft to a release branch, publish nothing." and "2 skills were withheld from my search. I am told the count and the reason class, not the names." By create: that it works in edge with no skills, from the commit history, and "I will say so in the pull request, because a reviewer should know this was done without the release-notes procedure."
   - Under the pane, a note: the question reaches Marcus where he already is, in the agent's own surface; there is no second inbox, and the agent is not the author of the question.
2. **What Oxagen put to a person** (label "Oxagen"; the one gold-bordered pane).
   - Waiting: the card `control.interject` with the chip "the loop is held" and 09:14:02Z; the lines `repo.unknown` (`github.com/a-intel/edge-proxy` resolves to no workspace in `a-intel`) and "skills.enabled = true and unbound_repo = ask, so Oxagen put it to a person instead of resolving nothing quietly."
   - Two paths side by side, each with a heading and one line under it, and consequence lines marked + (gains), − (losses) and · (unchanged):

| Path | Consequences |
|---|---|
| **Link**, "to core-platform" | + Inherits `skl_v7`, with 7 skills in scope and 1 withheld. + "Inherits the belt, the $2.00 run budget and the harness tier". + "Becomes the third linked repo · indexed into the code graph". · "Marcus already owns this workspace, so no new grant". − "Everything in edge-proxy is now in core-platform’s spend and audit" |
| **Create**, "a workspace called edge" | − "**Skills ship off.** 0 in scope, and search_skills is not on the belt". − "No belt, no budget, no price book until somebody sets them". + "Its own spend, its own audit, its own owner". + "a-intel/edge-proxy becomes its main repo, branch main". · The run continues either way, with a procedure or without one |

   - A note that the second path brings up a new workspace with skills off in the middle of a run that was asking for skills, because the default holds every time a workspace is made.
   - "If nobody answers": "At 30 minutes this times out to deny. The run continues with no skills and the agent is told why, because the safe end of an unanswered question is fewer skills, not more."
   - Answered: "Answered" with the badge "closed" and 09:17:38Z; "Marcus Bell chose link to core-platform. Receipt rcp_01K6QW44, waited 3m 36s." (by create, "create the workspace edge" and `rcp_01K6QW45`); and "Binding a repository is a governed action, so this answer went through the same path as approving a payment: a rule, a grant, a receipt, and a name that stays on it."
3. **What was written down** (label "frames"). One row per frame: a class dot, the kind in mono, one line, and the time.
   - Waiting: `run.started` (09:14:02.118Z), `repo.unknown` and `control.interject` (both highlighted), then greyed: `control.answer` ("marcus answered · pending"), `skills.resolved` and `context.assembled` ("waits on the answer") and `model.request` ("the first model call of the run has not happened"). The note: "The three greyed frames have not happened. A run that is waiting is a run that has written down that it is waiting." The mockup greys four rows and gives the pending `control.answer` a time (09:17:38.902Z). A build greys only the frames that have not happened, shows no time on them, and makes the note's count match.
   - Answered by link: `control.answer`, `repo.bound`, `skills.resolved`, `skills.searched`, `skills.loaded`, `context.assembled`, `model.request`. By create: `control.answer`, `workspace.created` (`skills.enabled = false`), `repo.bound`, `skills.resolved` (0 in scope), `context.assembled`, `model.request`. The note: "Nothing here is reconstructed. The pause, the question, the wait and the answer are frames in the same chain as the work."

**After the answer**, one panel under the triptych.

- By link, **Skill loaded**, with "1,840 tokens · $0.0055 · priced on the Spend page as context, not as output": the skill's row (`a-intel.release-notes-from-prs @2.1.0`, its statement, source, kind, tokens, digest, "cited in 186 of 212 runs", "cited 62% → 81% of loads", "allowed", "6 days ago", "Open" and "Edit") and a note that the model call that follows cites it in the system position. "Open" opens the `skill` dialog. "Edit" opens the skill's Steering source page.
- By create, **Workspace created**, with the badge "skills off": the file `a-intel/edge-proxy · .oxagen/workspace.toml`, "committed by Oxagen, 09:17:39Z", with `slug`, `name`, `owner`, `main` and `branch` and no `[skills]` block; the note "This is the same file core-platform had on 2026-07-30. It took a pull request and a named person to change it then, and it takes one now."; and "See how core-platform did it", which opens Steering Sources filtered to skills, where the header carries the skills setting.

**In the Approvals drawer.** While the interjection waits, it is the first row of the drawer on every page (`apdInterjectionRow()`): "Interjection · release-manager is paused", "It started in `a-intel/edge-proxy`, which no workspace owns. Skills are on in Core platform, so there is a config to resolve and nothing to resolve it against. Nothing has been charged since 09:14:02Z; at 30 minutes it times out to `deny`.", and "Answer it" (gold), which closes the drawer and opens this page. It counts one in the Approvals button. No sidebar count and no Agents tile includes it. The row is a pointer to this page, not a second place to answer. `approvals-drawer.md` owns the drawer.

**Dialogs this page opens:** `skill` (from "Open" after a link answer).

## Data sources

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen (file paths) | Status |
|---|---|---|---|---|
| The held run and its frames before and after the answer | `SKRUN`, `SK_FRAMES`, `SK_AFTER` (`fixtures/skrun.json`, `sk-frames.json`, `sk-after.json`) | the run ledger's frame kinds `repo.unknown`, `control.interject`, `control.answer`, `repo.bound`, `workspace.created`, `skills.resolved`, `skills.searched`, `skills.loaded` | none of these kinds is produced | ❌ |
| The unbound-repository policy | `SK_CFG` | `.oxagen/skills.toml` | `unbound_repo: "ask"` in the skills config schema (`packages/oxagen/src/skills.ts:42`) and its stored column (`packages/database/src/schema/skills.ts:33`). No runtime acts on it | 🟡 |
| The two paths and their consequences | computed from `SK_CFG` and `WS` | derived at interjection time from the config that would apply | none | ❌ |
| The answer | `SKS.picked`, `SKS.answered`, `skAnswer()` | one governed action with a receipt | `link_repository` (`packages/oxagen/src/contracts/repository.link.ts:49`) and `create_workspace` (`packages/oxagen/src/contracts/workspace.create.ts:85`) ship as separate actions. Nothing answers an interjection | 🟡 |
| Skill loaded | `SKILLS`, `skillOf()` | `skills.loaded` and the cost record | skill resolution frames are not produced | ❌ |
| The drawer row and its count | `skWaiting()`, `apdInterjections()` | open interjections joined into the approvals count | none. The app's drawer lists approvals only and says so (`apps/app/src/features/shell/approvals-drawer.tsx:21-22`, #3849) | ❌ |
| The run's work order | none | a direct work order (D2) | none (`run.md`) | ❌ |

## Future-only fields

The view carries no future-only mark, and the catalog gives it no future story. Every element that the data-source table marks ❌ is future-only nonetheless, and a build renders the page only once the interjection frames and the answer exist. Until then no run renders this page.

## Functionality

- The question reaches the operator where they already are, in the agent's surface. There is no second inbox: the drawer row points here, and the answer is one `control.answer` frame whichever surface sent it.
- Either path is a governed action: a rule, a grant, a receipt and a name. Linking inherits the workspace's config, belt, budget and tier. Creating a workspace ships it with skills off, in the middle of a run that was asking for skills.
- An unanswered interjection times out at 30 minutes to `deny`. The run continues with no skills and the agent is told why. There is no `allow`.
- The greyed frames stay greyed until they happen. Nothing renders a frame that was not written.
- The withheld skills reach the agent as a count and a reason class, never by name.
- Answering removes the row from the drawer and one from the Approvals count.

## States

- **loaded**, waiting (the default), then answered by link or by create after "Send this answer".
- **loading**: the shell stays and the body is the skeleton: four tile blocks and a panel of seven rows.
- **error**: "This run could not be loaded". "The control plane answered `502 frame_store_unreachable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen." Actions "Try again" and "Open an incident", then the line "trace 01K5RSXQ7F2E · us-east-1 · 2026-09-11 09:16:04Z".
- **access denied**: "You cannot see this run". "Your roles on Anderson Intelligence Corp. do not include `runs.read on core-platform`. An organization owner can grant it; the grant is a governed action and lands in the audit record with your name on it." Actions "Request access" and "Back to Work". Below: Signed in as (Marcus Bell · `workspace.owner` · core-platform), Needed (`runs.read on core-platform`), Decided by (`pol_v41` · deny wins over every allow).

## Mobile

- The shell is as `run.md` describes, with Work lit in the thumb bar and the Approvals count in the compact top bar including this interjection while it waits.
- The three panes stack in the order above. The two paths stack. The pick cards are full width.
- The Approvals drawer is full width, with this row first.
- Every button and pick card has a hit area of at least 44 px, and the page never scrolls sideways.

## Permissions

- Read: the run read. The denied state names `runs.read on core-platform`, where the ordinary run page names `run.read`; one name is right, and a build uses the app's `run.read` (`apps/app/src/data/read.ts:74`).
- Answer: link needs the right to link a repository to the workspace (`link_repository`), and create needs the right to create a workspace (`create_workspace`). The answer is the governed action, not a chat reply. A person without the grant sees the question and cannot answer it.

## Backend gaps this page depends on

- The interjection frame kinds on the run ledger: `repo.unknown`, `control.interject`, `control.answer`, `repo.bound`, `workspace.created` and the skill resolution frames.
- A runtime that acts on `unbound_repo = ask`: it stops the loop before the first model call and opens the interjection.
- One governed answer that links or creates, with a receipt, and the 30-minute timeout to `deny`.
- The open-interjection count joined into the Approvals drawer and its button (#3849).
- A direct work order for a run started outside Oxagen (D2).

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. The third pane lists frames.
- The page reads the record. No inference, no score, no model-written account of why. The consequences never claim more than the config would apply.
- No person is scored or ranked.
- Every enforcement claim states the tier. The tier on the meta line and in the Link path is `harness`, as recorded, and nothing says enforced about it.
- Headers are rollups of the rows beneath them: "7 skills in scope, 1 withheld" and "0 in scope" match the frames the answer writes.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen, "Send this answer", and one gold pane. Gold never encodes state.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
