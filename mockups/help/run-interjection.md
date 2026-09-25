<!-- run-interjection: a run Oxagen holds for an answer (skRunPage) -->

## Page header {#run-interjection/header}

The header names the held run, the task it was started for, who and what it runs as, and whether its loop is waiting on a person.

### Purpose
You arrive here from the Approvals drawer or a link, and the first questions are which run this is and whether it is still stopped. The header answers both: the run id, the task title, the agent, harness, operator, tier and commit, and a status that reads waiting until someone answers and live after.

### Rationale
A held run is not an ordinary run page with a banner on it. `pRun()` hands `SKRUN.id` to `skRunPage()` because the moment it has to show, one question seen from the agent's side, the operator's side and the record's, has no counterpart in a run that was never stopped. So the header drops what the ordinary run header carries: no tab bar, no stat row, no Pause, Steer, Cancel or Export. The run has made no model call, so there is nothing to count, and the one control that matters is the answer in the panes below. The Skills console that used to host this moment is cut (`docs/fleet-operations-wedge.md`, Cuts), and W13 is retired. The question now waits in the Approvals drawer (D16), and this page is where it is answered.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Run id, task title | `SKRUN` (`fixtures/skrun.json`) | `get_run` | partial |
| Agent, harness, operator, tier | `SKRUN.agent`, `SKRUN.harness`, `PEOPLE[SKRUN.op]`, `SKRUN.tier` | the run item | partial |
| Remote and commit | `SKRUN.remote`, `SKRUN.sha` | the harness's reported git remote on `run.started` | none |
| Status | `SKS.answered` | the question's state on the run ledger | none |
| Work order | none | a direct work order (D2) | none |

### Logic
1. The eyebrow reads "Run" with `SKRUN.id` beside it. The h1 is `SKRUN.taskTitle`.
2. The meta line joins the agent key in mono, the harness label, the operator's name, "harness tier" and `remote@sha`. The tier is `harness` as recorded, and nothing on the page says enforced about it.
3. While `SKS.answered` is empty the right side shows "paused · waiting on a person" in the approval colour. After an answer it shows "live" with a pulse.
4. The header has no actions. The answer lives in the agent pane.
5. The breadcrumb names no work order in the mockup. A build files a run started from an operator's terminal under a direct work order (D2) and names it before the run.

### States
Loaded shows the waiting header, then the live header after an answer. Loading returns `skeleton()`. Error returns `errorState("This run", "502 frame_store_unreachable")`. Denied returns `deniedState()` naming `runs.read on core-platform`. The ordinary run page names `run.read`, and a build uses the app's `run.read`. The eyebrow and the waiting status each carry a mid-dot against the label rule. A build keeps the words, shows the id beside "Run", and shows "paused" with "waiting on a person" as its caption. On a phone the meta line wraps.

## Loop state

One note under the header says whether the loop is stopped or what the answer did.

### Purpose
You need to know, before reading the panes, whether anything is still happening and whether the run is costing money. The note answers in one line while the run waits, and in one line after it is answered.

### Rationale
A held run must not read as failed, queued, or quietly continuing on a default. It is none of those. The harness holds at the boundary before the first model call, the clock on the run stops, and no charge accrues. The note states the stop and the last charge time so a person can see that waiting costs nothing. The fuller contrast (not failed, not queued, not on a default) is the design's reasoning, so it lives here rather than on the page. After an answer the note says what changed in the record: a link resolved `skl_v7` and loaded one skill, or a create made the workspace `edge` with skills off. Every new workspace ships with skills off, and the run's agent was told in one line that it has none.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Held or answered | `SKS.answered` (`"link"`, `"create"` or null) | the question's state from `control.interject` and `control.answer` | none |
| Last charge time | fixed at 09:14:02Z in `skRunPage()` | the run's cost record | none |
| Config version | `SK_CFG.ver` | `.oxagen/skills.toml` version | partial |

### Logic
1. With no answer, `skRunPage()` draws the gold-bordered note: "The loop is stopped. The harness is holding before its first model call. Nothing has been charged since 09:14:02Z."
2. With `SKS.answered === "link"` it reads "Answered." and that `a-intel/edge-proxy` is a linked repo of core-platform, the run resolved `skl_v7`, and one skill is loaded.
3. With `"create"` it reads "Answered." and that the workspace `edge` exists with `a-intel/edge-proxy` as its main repo and skills off in it, that the run carries none, and that the agent was told so.
4. "Ask again" calls `skReset()`, which clears `SKS.answered` and `SKS.picked` and returns the page to waiting. It is a mockup-only control. In a build a sent answer is final and this control does not exist.

### States
Waiting, answered by link and answered by create. Loading, error and denied replace the whole body. On a phone the note spans the width above the stacked panes.

## Agent view

The first pane shows the conversation as the operator sees it in the agent's own window: the prompt, Oxagen's question, the two choices and the answer.

### Purpose
You answer the question here. The pane shows what Marcus typed, the question Oxagen put into the agent's surface, the two ways forward, and after the answer, the agent's first turn under that answer.

### Rationale
The question reaches the operator where they already are, in the agent's own surface. There is no second inbox to check. The Approvals drawer row points to this page and is not itself a place to answer. The agent is not the author of the question. Oxagen is, and the message carries the "question" label and Oxagen's name so nobody mistakes it for the model's own text. The two choices are cards, not a free-text reply, because the answer is a governed action with a receipt and must be one of the two things the config allows. The agent's replies show the consequence in its own words: it names the one skill it loaded and says it was told a count and a reason class for the withheld ones, never their names. By create, it says it will note in the pull request that the draft was written without the release-notes procedure.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Operator prompt | fixed in `skTrAgent()` | the run's first prompt | partial |
| Oxagen's question and the two choices | `skTrAgent()`, `skPick()`, `SK_CFG.ver` | `control.interject` frame | none |
| Pick and answer | `SKS.picked`, `SKS.answered`, `skAnswer()` | one governed answer: `link_repository` (`repository.link.ts:49`) or `create_workspace` (`workspace.create.ts:85`) | partial |
| Agent's turn 1 | fixed in `skTrAgent(ans)` | the transcript after `control.answer` | none |

### Logic
1. `skTrAgent()` draws Marcus's prompt at 09:14:01Z and Oxagen's question at 09:14:02Z.
2. `skPick("link", …)` and `skPick("create", …)` draw two buttons with `aria-pressed`. Picking one sets `SKS.picked` and shows a check glyph.
3. "Send this answer" is disabled with "pick one" beside it until a pick exists, then reads "answers as Marcus Bell". It is the one gold action on the page.
4. `skAnswer()` sets `SKS.answered`, re-renders, and toasts what happened: linked with `skl_v7` and one skill loaded, or `edge` created with skills off.
5. After the answer the picks disappear. Marcus's reply shows at 09:17:38Z and the agent's turn 1 at 09:17:39Z, worded for the chosen path.

### States
Waiting with no pick, waiting with a pick, and answered by link or create. On a phone the pane stacks first and the pick cards run full width with a 44 px hit area.

## Operator question

The second pane shows what Oxagen put to a person: the interjection frame, the config that fired it, both paths with their consequences, and the timeout.

### Purpose
Before you pick, you want to know what each answer does to the repository, the workspace, the budget and the run. This pane lays out both paths side by side with each gain, loss and unchanged fact marked, and says what happens if nobody answers.

### Rationale
The question is not the agent's guess. `repo.unknown` fired because `github.com/a-intel/edge-proxy` resolves to no workspace in `a-intel`. Core platform has `skills.enabled = true` and `unbound_repo = ask`, so Oxagen put it to a person rather than resolving nothing quietly. Showing the config values that fired lets you see the rule, not a reason paraphrased by a model. The two paths are not the same, and the pane makes the difference plain. The second path brings up a brand new workspace with skills off in the middle of a run that was asking for skills, because the default applies every time a workspace is made. An unanswered question times out at 30 minutes to `deny`, since the safe end of an unanswered question is fewer skills, not more. There is no `allow`. Either answer is a governed action: linking a repository takes the same path as approving a payment, a rule, a grant, a receipt, and a name that stays on it.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Interjection and repository | `skTrOperator()`, `SKRUN.remote`, `ORG.slug` | `control.interject`, `repo.unknown` frames | none |
| Config that fired | `SK_CFG` (`unbound: "ask"`) | `unbound_repo` in `.oxagen/skills.toml` (`packages/oxagen/src/skills.ts:42`) | partial |
| Path consequences | `skDl()` lines over `SK_CFG` and `WS` | derived from the config that would apply | none |
| Receipt and wait | fixed `rcp_01K6QW44` or `rcp_01K6QW45`, 3m 36s | the answer's receipt | none |

### Logic
1. Waiting, `skTrOperator()` draws the `control.interject` card with "the loop is held" and 09:14:02Z, the `repo.unknown` line, and `skills.enabled = true · unbound_repo = ask`.
2. Two paths follow. Link, to core-platform: inherits `skl_v7` with 7 skills in scope and 1 withheld, the toolbelt, the $2.00 run budget and the harness tier, becomes the third linked repo, needs no new grant, and puts edge-proxy's spend and audit in core-platform. Create, a workspace called edge: skills off with 0 in scope and no `search_skills`, no toolbelt, budget or price book, its own spend, audit and owner, and edge-proxy as main repo on `main`. `skDl()` marks each line `+`, `−` or `·`.
3. The picked path takes the `on` border from `SKS.picked`.
4. "If nobody answers" states the 30-minute timeout to `deny`, that the run continues with no skills, and that the agent is told why.
5. Answered, the pane collapses to "Answered", a "closed" badge, the path Marcus chose, the receipt id and the 3m 36s wait.

### States
Waiting and answered. On a phone the two paths stack. The pane is the one gold-bordered pane, and gold marks it as the question, never a state.

## Frames

The third pane lists the frames the run has written, in order, so the stop, the question, the wait and the answer read as part of the run's record.

### Purpose
You want to know what the record holds, not what the page says about it. The pane shows each frame's kind, one line and its time, highlights the ones that caused the stop, and greys the ones that are waiting on the answer.

### Rationale
The pause, the question, the wait and the answer are frames in the same chain as the work. Nothing here is reconstructed after the fact. A run that is waiting has written down that it is waiting, so the frames that have not happened yet appear greyed: they are the next steps, shown so you can see what the answer unblocks. Once answered, the list shows the frames each path actually wrote, which is how the header counts ("7 skills in scope, 1 withheld", "0 in scope") stay rollups of the record. A frame here is a recorded event, never a SteeringFrame.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Waiting frames | `SK_FRAMES` (`fixtures/sk-frames.json`) | `run.started`, `repo.unknown`, `control.interject` on the run ledger | none |
| Frames after a link | `SK_AFTER.link` (`fixtures/sk-after.json`) | `control.answer`, `repo.bound`, `skills.resolved`, `skills.searched`, `skills.loaded`, `context.assembled`, `model.request` | none |
| Frames after a create | `SK_AFTER.create` | `control.answer`, `workspace.created`, `repo.bound`, `skills.resolved`, `context.assembled`, `model.request` | none |

### Logic
1. `skRunPage()` maps `SK_FRAMES` while waiting and `SK_AFTER[ans]` after an answer through `skFrameRow()`.
2. `skFrameRow()` draws a class dot from `skFrameDot()` (`model`, `tool`, `gov`, `ctx`, `op`), the kind in mono, the line, and the time.
3. A frame with `hot` gets the highlight: `repo.unknown` and `control.interject` while waiting, `skills.searched` and `skills.loaded` after a link, `workspace.created` and `skills.resolved` after a create.
4. A frame with `pend` renders at reduced opacity. While waiting that is `control.answer`, `skills.resolved`, `context.assembled` and `model.request`.
5. The mockup greys four rows and gives the pending `control.answer` a time. A build greys only frames that have not happened, shows no time on them, and renders nothing for a frame that was not written.

### States
Waiting and answered by link or create. On a phone the pane stacks third.

## Skill loaded

After a link answer, one panel shows the skill the run loaded and what it cost to carry.

### Purpose
You chose to link the repository and want to see what the run got from it: which procedure, at which version and digest, and what it costs in tokens and dollars.

### Rationale
Linking resolved `skl_v7` and the run's search loaded one skill, `a-intel.release-notes-from-prs@2.1.0`. The panel shows its catalog row so the answer's effect is a record you can open, not a claim. The cost reads 1,840 tokens and $0.0055. Spend prices a loaded skill as context, not as output. The model call that follows cites the skill in the system position, and the sealed record keeps the same digest, so the question of which procedure the run followed has an answer long after the run ends.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Skill row | `skRow(skillOf("a-intel.release-notes-from-prs"))` over `SKILLS` | the Steering Source for the skill | partial |
| Tokens and cost | fixed in `skAfterPanel()` | `skills.loaded` frame and the cost record | none |
| Cited counts and rates | `SKILLS[].cited`, `runs`, `citedBefore`, `citedAfter` | citation records from the token record | none |

### Logic
1. `skAfterPanel("link")` draws the panel with the heading "Skill loaded" and "1,840 tokens · $0.0055".
2. `skRow()` draws the skill id and version, its statement, its source, kind, token count and digest, "cited in 186 of 212 runs" and "cited 62% → 81% of loads", the decision badge from `skTier()`, and the last update.
3. "Open" opens the `skill` dialog. "Edit" opens the skill's Steering source page.

### States
Drawn only after a link answer. On a phone it spans the width under the stacked panes.

## Workspace created

After a create answer, one panel shows the workspace file Oxagen committed for `edge`, with skills off.

### Purpose
You chose to create a workspace and want to see what exists now and why the run has no skills. The panel shows the committed `.oxagen/workspace.toml` and marks it "skills off".

### Rationale
A new workspace ships with skills off every time. That is the default, and it holds even when the workspace is born in the middle of a run that was asking for skills. The file has no `[skills]` block, and an absent block reads as false. Turning skills on is a pull request and a named person, as it was when core-platform turned them on on 2026-07-30. The panel shows the file, not a summary, because the file is what a reviewer will diff. "See how core-platform did it" takes you to the setting's history.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| File contents | fixed in `skAfterPanel("create")` | `.oxagen/workspace.toml` in `a-intel/edge-proxy` | none |
| Commit time and author | fixed 09:17:39Z, committed by Oxagen | the commit and `workspace.created` frame | none |
| Skills setting | absent `[skills]` block | `skills.enabled` on the workspace | partial |

### Logic
1. `skAfterPanel("create")` draws "Workspace created" with the badge "skills off".
2. The file header reads `a-intel/edge-proxy · .oxagen/workspace.toml` and "committed by oxagen, 09:17:39Z". The body sets `slug`, `name`, `owner`, `main` and `branch`, with a comment that there is no `[skills]` block and that turning it on is `a-intel/edge-proxy#2`.
3. "See how core-platform did it" sets `S.tab.skills` to `versions` and goes to the core-platform skills route, which lands on Steering Sources filtered to skills, where the header carries the skills setting.

### States
Drawn only after a create answer. On a phone the file scrolls inside its own block and the page never scrolls sideways.

## Skill {#dialog/skill}

The skill dialog shows one skill in full: its version, digest, cost, decision, owner, citations and the whole `SKILL.md` it is made of.

### Purpose
You opened a skill from its row and want to know exactly what an agent reads when it loads it, what that costs, who owns it, and whether it is held. From here you retire it, edit its file, or send a changed digest for approval.

### Rationale
A skill is a Steering Source: a bundle of instructions, references and optional entrypoints (D12). The dialog shows the whole body because that is the whole of it. A skill has no code to run and no credential to hold. It is prose an agent reads, and every action it describes still goes through the toolbelt and the policy that governs it. An entrypoint becomes a capability descriptor, and Oxagen never runs it. A withheld skill emits nothing (ADR-090). Showing the digest and the citation rate lets you judge a skill by the record: how often runs that searched for it actually cited it, before and after this version.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Id, version, digest, kind, path, source | `SKILLS` (`fixtures/skills.json`), `skillOf()` | the skill's Steering Source | partial |
| Load cost | `s.tokens`, priced at $0.000003 a token | `skills.loaded` and the cost record | none |
| Decision | `s.tier`, `skTier()` | the policy answer for the skill | partial |
| Owner, held reason | `s.owner`, `s.why`, `PEOPLE` | the source's owner and approval state | partial |
| Cited, cited rate | `s.cited`, `s.runs`, `s.citedBefore`, `s.citedAfter` | citation records | none |
| Body | `skBody(s)` | the `SKILL.md` file at that digest | partial |

### Logic
1. `DLG_EXT.skill` opens on `skillOf(arg)`, or on `SKILLS[0]` when the id is not found. The title is the skill id and the subtitle is its source and path.
2. The facts list version, digest, kind, load cost ("tokens · $X a turn it is loaded into"), decision (allowed, needs approval or denied), owner ("nobody, so it is held" when unset), and cited ("N of M runs that searched for it", or "never"). A skill with `citedAfter` adds the cited rate before and after this version.
3. A held skill shows its reason in a bordered note.
4. The body block shows `s.path` and `skBody(s)`.
5. The footer names the source and offers Close, Retire (opens `skretire`), and one primary: "Send the digest for approval" for an unapproved skill, which toasts that the diff went to its approver, or "Edit the file", which opens the skill's source page.

### States
One state per skill: approved, held for scope, or unapproved digest. On a phone the dialog rises as a sheet and the body block scrolls inside it.

## Retire a skill {#dialog/skretire}
<!-- open: openDialog('skretire',SKILLS[0].id) -->

The retire dialog confirms that you want to remove a skill and opens the pull request that removes it.

### Purpose
You want a skill gone from the workspace. The dialog says which file or line the pull request removes and how many runs cited the skill, so you know what the change touches before you open it.

### Rationale
A skill is committed and reviewed, so retiring one is a pull request, never a delete button. One written in the workspace's repositories is a file, and the pull request removes that file. One installed from the registry or the marketplace is a line in `.oxagen/workspace.toml`, and the pull request removes the install line and leaves the skill published where it came from. Until the pull request merges a search still returns the skill. Runs that cited it keep the digest they recorded, and nothing rewrites what those runs were steered by. A skill grants nothing, so removing it takes no authority from any agent.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Skill | `skillOf(id)` over `SKILLS` | the skill's Steering Source | partial |
| File or install line | `skInTree()`, `skRetireFile()`, `skRetireRepo()` | the repository file or `.oxagen/workspace.toml` | partial |
| Citations | `s.cited`, `s.runs` | citation records | none |
| Pull request | `skPr()` into `OXPRS` | the forge pull request and its checks | partial |

### Logic
1. An unknown id returns `noSuch("Skill")`. A skill already retiring shows "A pull request removes it and is waiting on its checks." with Close only.
2. `skInTree()` is true for `repo` and `linked` sources. The note reads "This opens a pull request that removes `<path>` on `<repo>`." for those, or "…that removes its install line from `.oxagen/workspace.toml`." for registry and marketplace skills.
3. The warning reads "N of M runs cited it. Each keeps the digest it recorded." or "No run has ever cited it."
4. "Open the pull request" calls `skRetire()`. It sets `s.retiring`, and `skPr()` adds a pull request to `OXPRS` on `skills/retire-<leaf>` with four checks: `schema`, `citation_check`, `grant_scan` and `load_cost`, which reports the tokens a turn the search budget frees. The toast names the pull request.
5. "Keep it" closes the dialog.

### States
Ready to retire or already retiring. On a phone the dialog rises as a sheet.
