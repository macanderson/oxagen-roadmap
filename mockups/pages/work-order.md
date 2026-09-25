# Work order

| | |
|---|---|
| Route | `#/a-intel/core-platform/work/orders/<order>` (app `/{org}/{ws}/work/orders/{order}`). A dispatched work order: `wo_01K5RS7M4N`. A direct work order: `wo_01K5RQ4B9C7XTN2P`. Old route that lands here: the mockup’s `#/:org/:ws/tasks/work-orders/<order>`, rewritten in place |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D2 (a run is a child of exactly one work order; a run started outside Oxagen is filed under a direct work order), D4 to D6 (a SteeringFrame is not its source; eight frame types; provenance and hash on every frame), D17; Vocabulary › Work (Work order, Dispatched work order, Direct work order, Workflow, Stage) and › Steering (SteeringFrame, Provenance); Steering › Emissions (a work order, when sent, emits `invocation`, `goal` and `constraint` frames); Work › Objects, Rules and Shipped today. `docs/fleet-operations-ia.md` › Work, detail views. `docs/tasks-spec.md` §9.5 (what sending records), §9.6 (delivery), §10.3 (running a workflow), §11 (completing work) |
| Design | `mockups/src/engine.js` → `pWorkOrder()`, `stageChain()`, `woItemsFor()`, `woOwner()`, `woClose()`, `woAccept()`, `woStop()`, `woSentPrompt()`, `woPromptText()`, `copyWoPrompt()`, `runLink()`, `DLG_EXT.woaccept`, `DLG_EXT.wostop`; `mockups/src/wedge.js` → `woKindBadge()`, `woRunsPanel()`, `woFramesPanel()`, `woFrames()`, `frameOf()`, `fileDirect()`, `woSpend()`; data `mockups/fixtures/tasks.json` (`workOrders`, `workflows`) and the runs in `mockups/fixtures/runs.json`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded |
| Storybook | `Oxagen / Work / Work order`: Loaded, Loaded · mobile, Loaded · future-only fields marked (on `wo_01K5RS7M4N`) |
| Audit | `work-order.audit-prompt.md` |

## Job

One work order from the moment it is sent, or opened, to the moment a person accepts it: which agent has it now, the runs it started, which items are claimed and on what evidence, what each stage handed to the next, the brief exactly as sent, and the SteeringFrames the send put in front of the agent. Every run is a child record of one work order, so this is where you open a run to stop or steer it.

A work order comes in two kinds. A **dispatched** work order is one a person sent from Work. A **direct** work order is the one Oxagen opens for a run an operator started outside Oxagen, from their own terminal: it holds that one run, has no brief and no definition of done, and can later be attached to a backlog item.

## What is on the page

**Header.** Eyebrow: the id in mono and the kind badge, `dispatched` (title “A person sent it from Work”) or `direct` (title “Oxagen opened it for a run started outside Oxagen”). h1: the title (“Cut 4.11.0 release notes”). Subtext:

- dispatched: “Sent by Marcus Bell on 2026-09-11 09:13 to Release manager.” (to a workflow: “… to the Fix, validate, document, review workflow.”)
- direct: “Oxagen opened it on 2026-09-11 09:02 for a run Marcus Bell started outside Oxagen, titled from its task reference `a-intel/platform#482`.”

Actions:

| Kind | Actions |
|---|---|
| dispatched | **Copy brief** (plain; title “Copy the brief as sent with its references”), **Stop the work order** (red; while the work order is neither accepted, stopped nor closed), **Accept the work** (gold when every item is claimed and the work order is open; otherwise plain and disabled, titled “Every item must be claimed first”) |
| direct | **Stop the work order** (red; while its run is live, parked or paused), **Attach to a work item** (plain and disabled, titled “A direct work order has no definition of done until you attach it to a backlog item”; outlined as future-only) |

**Tiles**, four across, outlined as future-only:

| Tile | Value and caption |
|---|---|
| State | The state badge, and “stage 1 of 1”, “every item is claimed” (waiting on you), “on 2026-09-08 16:40” (accepted), or “one run, started outside Oxagen” (direct) |
| Items claimed | “3 / 4” or “none”, “by the agents, with evidence” |
| Items accepted | “0 / 4” or “none”, “by a person” |
| Spend | “$4.13”, “of a $10.00 cap · the runs’ own basis”, or without a cap “across its runs, each on its own basis” |

**Stages.** The chain: one card per stage, then a dashed last card, **Accept**, by You, “a person accepts every item”. Each stage card shows its step number and role, the agent’s harness mark, avatar, name and tier badge, and the stage’s latest run (`live` or `sealed` and the run id as a link, and “2 runs” when the stage ran more than once) or “waiting”. A finished stage is marked done, the current stage is outlined in gold, and the Accept card is outlined while the work waits on you. A work order sent to one agent, and every direct one, has one stage, “Work”, then Accept. Arrows join the cards. A direct work order holds nothing to accept until a person attaches it to a backlog item: the mockup still draws its Accept card, by You, and a build draws that card only once the work order holds items.

Then two columns, the main column two thirds wide.

**Main column**

- **Runs**: “1 run. Each is a child record of this work order.” Columns: Run (the id as a link and the run’s title under it) · Stage (the role, with “returned” beside a stage run that returned the work) · Agent (avatar and agent key) · Status (dot and word) · Tier · Cost (USD, the basis under it) · Started. A row opens the run. With none: “No run yet. The runtime starts the first one with `oxagen work start wo_01K6TF1169Q`.”
- **Definition of done**: “4 items from 1 work item.” Columns: Item (the text and its tag chip) · Work item (the numbers it came from, “#482”, or “work order” for an item the send added) · Stage (the role that owns it) · State (`open`, `claimed`, `accepted`, as a dot and a word) · Evidence (what the claim cited, then the agent’s name and the run in mono). The table does not page. On a direct work order: “None. A direct work order has no definition of done until you attach it to a backlog item.”
- **Handoffs**: every stage run in order, as “<role>” or “<role> returned the work”, its run id, and its note (“Returned: the backwards pair still passes. Item 2 is not met.”), or “running” while that run is live. Note: “A handoff note reaches the next stage as quoted evidence. It is never an instruction to that agent.” A direct work order has one run and no handoff. The mockup still draws the panel there, with the run and “running” even once the run is sealed, and a build leaves the panel out.

**Side column**

- **Work items**: each work item’s logo, number and subject, linking to the item. On a direct work order with none: “None attached. The run names `a-intel/infra#1767` as its task reference.”
- **Repositories**: each repository the work order may change, the note “Branches and pull requests only. The production branch is never pushed.”, and “Pull request `a-intel/platform#524`” when one exists. A direct work order confirmed no repositories: the mockup shows the repository its run’s task reference names, with the same note, and a build shows the checkouts the run recorded (`get_run_work`) without the note, because no work order set that limit.
- **Brief**: the digest in the header in mono (`sha256:5d0e81c27a4b9f36`), the brief as sent in a monospace block, and “As sent. A sent brief cannot change.” On a direct work order: “None. The operator started the run from their own terminal, and its first prompt is on the run.”
- **SteeringFrames from this send** (dispatched only; outlined as future-only): “What the send put in front of the agent, each with this work order as its source.” One line per frame: the frame type badge, the frame’s text (“The brief as sent, 103 tokens” for the `invocation`), and the first twelve hex characters of its hash (`sha256:6677a6b40f23`). In order: one `invocation` (the brief), one `goal` per work item (“Cut 4.11.0 release notes (a-intel/platform#482)”), one `constraint` per definition-of-done item, the repository `constraint` (“Change only a-intel/platform, on branches and pull requests. The production branch is never pushed.”), and the cap `constraint` (“Spend at most $10.00 across this work order.”) when the work order has a cap. Note: “Provenance on every frame: `wo_01K5RS7M4N` and the brief digest `sha256:5d0e81c27a4b9f36`. A sent brief cannot change, so these frames cannot either.”

**Copy brief** copies the brief exactly as sent, then **References**: “Work order wo_01K6T9QX: Same-minute migration stamps”, its link, “The prompt above is as sent. Digest sha256:ab41c7e09f3d2865.”, each work item’s number, subject, provider link and Oxagen link, and the pull request when one exists. The toast reads “Brief copied, with 1 work item.”

### Dialogs

- **`woaccept`**: “Accept the work”, subtitle the title. “You accept 3 items the agents claimed, with the evidence each one cited.” Note: “Accepting records `accept_work_order` with your name. It does not merge anything. The pull request a-intel/platform#523 is merged by a person on GitHub.” Note, by the connection’s close switch: on, “The GitHub connection closes each issue as Done, the resolution for work a person accepted.”; off, “The GitHub connection has close on accept off, so each issue stays open there until somebody closes it. Turned on, it closes each one as Done.” Footer **Cancel**, **Accept every item** (gold). Accepting marks every item `accepted`, the work order `accepted`, and each work item `accepted`, and toasts in gold “Accepted. accept_work_order recorded. a-intel/platform#599 stays open in GitHub, because close on accept is off for that connection.”
- **`wostop`**: “Stop this work order?”, “The live run gets a cancel at its next boundary, and no later stage starts.”, and the note “Branches and pull requests stay where they are. The work items go back to ready, and their certified definitions of done are unchanged.” Footer **Keep it running**, **Stop it** (red). Stopping toasts “Stopped. The runtime is told at its next boundary; the work items go back to ready.”

**Shell.** The sidebar with Work lit and its count. Breadcrumbs “Anderson Intelligence Corp. / Core platform / Work orders / wo_01K5RS7M4N”, the last in mono. ⌘K, notifications, the Approvals button with the organization’s count, and the avatar.

**Demo work orders:** `wo_01K5RS7M4N` (dispatched to Release manager, one stage, in progress, 3 of 4 claimed, $4.13 of a $10.00 cap, its run `run_01K5RS7M2E8FJ3QW` live), `wo_01K6T9QX` (the Fix, validate, document, review workflow at stage 2 after one return, four runs, 2 of 4 claimed), `wo_01K6TA2M` (Stella CI, waiting on you with every item claimed, so **Accept the work** is gold), `wo_01K6RZ41` (accepted on 2026-09-08 16:40), and two direct ones. `wo_01K5RQ4B9C7XTN2P` holds a sealed Stella CI run whose task reference is `a-intel/platform#482`. The mockup attaches that backlog item by its number, so this one shows #482 and its four items, all `open`, beside a disabled **Attach to a work item**. `wo_01K53TV12GW6ARFD` holds a live run Mikael Larsen started, with no work item attached, and shows the “None” lines.

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. Checked against `macanderson/oxagen` `origin/main` at `1ba160dbc`. Nothing in the repository stores a work order, a workflow or a claim (wedge spec, Work › Shipped today), and frame types, per-frame provenance and work order frames are future-only (wedge spec, Steering › Shipped today). What ships is each run and what can be done to a live run.

| Element | Mockup collection | Target store or contract | Backing today in macanderson/oxagen | Status |
|---|---|---|---|---|
| Header: id, kind, title, sender, time, target | `WORKORDERS[]`, or `fileDirect()` over `RUNS` | `tasks.work_orders`; `get_work_order` | none | ❌ |
| A direct work order’s sender and task reference | `R.op`, `R.task` | the run’s operator and task reference | `operatorName` with `operatorAttribution` (`packages/oxagen/src/contracts/run.list.ts:242-260`); `taskRef` for ledger runs, null for wrapped sessions (`run.list.ts:285-291`, `packages/handlers/src/run.list.ts:1278`) | 🟡 |
| Tiles: State, Items claimed, Items accepted | `w.status`, `w.claims` | `tasks.work_orders`, `tasks.item_claims` | none | ❌ |
| Spend tile | `woSpend()`, `w.cap` | the runs’ cost with their bases, and the cap | Each run’s cost and basis ship (`run.list.ts:277`). No work order sums them, and no cap is stored | 🟡 |
| Stage chain: stages, roles, what each owns | `WORKFLOWS[].stages` | `.oxagen/workflows/*.toml`, `tasks.work_order_stages` | none | ❌ |
| Each stage agent’s harness, name and tier | `AGENTS[]` | `list_agents` | `harness`, `name`, `enforcementTier` (`packages/oxagen/src/contracts/agent.list.ts:24-31`, `:63`, `:83`) | ✅ |
| Runs panel: run id, title, agent, status, tier, cost with basis, start | `RUNS` by id | `list_runs`, `get_run` | `list_runs` (`run.list.ts:477`): id, `agentKey`, `status`, `enforcementTier`, `cost`, `startedAt`, `name` (`:234-426`) | ✅ |
| Which runs belong to this work order, and each one’s stage | `w.runs` | a `work_order_id` and a stage on each run | none (wedge spec, Open decisions 5) | ❌ |
| Definition of done: items, owning stage, state, evidence | `woItems()`, `w.claims` | `tasks.work_order_items`, `tasks.item_claims`; `claim_dod_item` | none | ❌ |
| Handoffs and returns | `w.runs[].note`, `.returned` | `tasks.work_order_stages`; `hand_off_work_order`, `return_work_order` | none | ❌ |
| Work items | `w.tasks` | `tasks.work_order_tasks` | none | ❌ |
| Repositories the work order may change | `w.repos` | the confirmed list on `tasks.work_orders` | none. A direct work order’s repository is derived from the run’s task reference in the mockup. A run’s recorded checkouts ship (`get_run_work`, `packages/oxagen/src/contracts/run.work.get.ts:127`) | ❌ |
| Pull request | `w.runs[].pr` | the run’s pull requests | `get_run_work` returns connected pull requests and their checks (`run.work.get.ts:127`) | ✅ |
| Brief and its digest | `w.prompt`, `w.digest` | `tasks.work_orders` prompt and digest | none | ❌ |
| SteeringFrames from this send | `woFrames()` | frames of type `invocation`, `goal` and `constraint` with the work order as source (wedge spec, Steering › Emissions) | none. `steering.manifest` items carry no type, hash or provenance (`packages/tacho/src/wire.ts:626-697`) | ❌ |
| Stop the work order | `woStop()` | `stop_work_order`, which cancels the live run through `dispatch_command` | `dispatch_command` queues `cancel` for a run (`packages/oxagen/src/contracts/tacho.command.dispatch.ts:107-134`). Nothing stops a work order or its later stages | 🟡 |
| Accept the work, and the close write-back | `woAccept()`, `woClose()` | `accept_work_order`; the provider close write-back | none | ❌ |
| Copy brief | `woPromptText()` | `get_work_order` | none | ❌ |
| Attach to a work item | none | attaching a direct work order to a backlog item | none | ❌ |

## Future-only fields

The mockup marks these with `data-future` (`?future=1` outlines them):

| Mark | Where | Reason in the mockup | What a build shows instead today |
|---|---|---|---|
| The tile row | both kinds | “work orders” | `not recorded` in each tile |
| SteeringFrames from this send | dispatched | “work order frames” | Left out, with its heading, until frames carry a type and provenance |
| The `direct` badge | direct, eyebrow | “direct work orders” | `not recorded` |
| **Attach to a work item** | direct, header | “direct work orders” | Left out |

The mockup marks nothing else, but every work order field here is future-only: the header, the stage chain’s stages, the definition of done, the handoffs, the work items, the repositories list and the brief. A build renders each as `not recorded` and leaves out **Accept the work**, **Copy brief** and **Attach to a work item** until their contracts ship. No `/work/orders/{order}` route exists in `apps/app` today. What a build can show from the record is each run: the Run page (`apps/app/src/app/[org]/[ws]/runs/[run]/page.tsx`) shows one run with its agent, status, tier, cost and pull requests, and cancels a live run through `dispatch_command`.

## Functionality

- A dispatched work order starts runs through the agent’s runtime: `oxagen work start <wo>` starts the harness with the brief as its first prompt (`tasks-spec.md` §9.6). A workflow stage starts one run per attempt. Oxagen runs no agent.
- A claim is the agent’s word: `claim_dod_item` with the item and its evidence, shown with the agent and the run. **Accept the work** turns gold only when every item is claimed. Accepting records `accept_work_order` with your name, accepts every claimed item, and merges nothing: a person merges the pull request in the repository.
- The connection’s close switch decides what accepting does in the provider: on, each work item closes there as Done; off, it stays open, and the dialog says so.
- **Stop the work order** cancels the live run at its next boundary through `dispatch_command` and starts no later stage. Branches and pull requests stay. The work items go back to ready with their certifications intact.
- In a workflow, a stage hands off with `hand_off_work_order` and a note, and the next stage receives the note as quoted evidence. A stage that finds an earlier item unmet returns the work with `return_work_order`, up to the returns the file allows. When a stage exhausts its returns, the work order parks for the operator in the Approvals drawer.
- The brief is shown exactly as sent, with its digest, and nothing on the page edits it. The copied brief is the same text, followed by its references.
- The send emits SteeringFrames with this work order as their source and the brief digest as their version. A sent brief cannot change, so those frames cannot either.
- A direct work order holds one run. It shows no brief and no definition of done, because it has neither, until a person attaches it to a backlog item.
- `node tools/check-tasks.mjs` walks flows 5 (a sent work order opens here with nothing claimed), 7 (a claimed work order is accepted) and 8 (the copied brief names its work items) on this page.

## States

Loaded only. This change designs the loaded state. The build uses the shell’s standard loading, error, empty and denied panels until they are designed.

Within loaded, an unknown id renders, inside the shell, “No work order has this id” and “Nothing in Core platform is called `<id>`.”, with **Back to work orders** (gold).

## Mobile

The thumb bar holds Work (lit, with its count), Agents, Tools, Spend and More. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The top bar shows the current crumb, the id. The header actions wrap. The tiles sit two by two. The stage chain stacks one card per row without arrows. The columns stack, the main column first. The Runs and Definition of done tables become labelled cards. Dialogs are bottom sheets with full-width footer buttons. Touch targets are at least 44 px. Nothing scrolls sideways.

## Permissions

The design names these, from `tasks-spec.md` §14. Neither exists in `packages/iam` today.

- Read: `work_order.read`
- Writes, each a governed action recorded in Audit: `work_order.accept` (accept or stop). The cancel a stop sends is `dispatch_command`, which ships and needs its own grant.

## Backend gaps this page depends on

- The work order record and its read (`get_work_order`), its stages (`tasks.work_order_stages`), its items and claims (`claim_dod_item`, `tasks.item_claims`)
- `accept_work_order` and `stop_work_order`, and the provider close write-back
- `hand_off_work_order` and `return_work_order`, with the bound on returns and the park in the Approvals drawer
- A `work_order_id` and a stage on each run (wedge spec, Open decisions 5), and the direct work order opened at a run’s first frame
- Delivery of the brief to the agent’s runtime (`oxagen work start`, `repository_dispatch` for a CI agent, an ARP brief; §9.6)
- SteeringFrames with type, hash and provenance, including the frames a work order’s send emits
- Attaching a direct work order to a backlog item

## Rules every build of this page must keep

- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen. The panel is “SteeringFrames from this send”, and the runs’ frames live on each run.
- A Steering Source and a SteeringFrame are never shown as each other. Each SteeringFrame names this work order as its source at the brief’s digest, and the work order is never listed as a frame.
- The page reads the record. No inference, no score, and no model-written account of why. A claim is the agent’s word, labelled with the agent and the run. A handoff note is quoted evidence, and the page says so.
- No person is scored or ranked.
- Every enforcement claim states the tier. Each stage shows its agent’s recorded tier, and the repository limit holds only as far as that tier enforces it: refused on `gateway` and `contained`, a client-attested hook on `harness`, recorded only on `observe`.
- Headers are rollups of the rows beneath them: Items claimed and Items accepted count the Definition of done rows, and Spend sums the runs.
- Plain nouns: a heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- At most one gold action per screen: **Accept the work** once every item is claimed, and none before that.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- The page never shows a claim as accepted. Accept is enabled only when every item is claimed, and accepting merges nothing.
- The brief is shown as sent, with its digest, and cannot be edited here.
- Every number that is money shows its basis.
- A direct work order claims no brief, no definition of done and no repository limit it does not have.
