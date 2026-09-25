# Fixtures: the demo record

One JSON file per collection, loaded into the engine as `FIXTURES.<NAME>` (the file name in
upper snake case: `spend-detail.json` is `FIXTURES.SPEND_DETAIL`). `tools/build-mockup.mjs`
inlines them into `mockups/missioncontrol.html`; Storybook serves them fresh through
`.storybook/mockup-plugin.mjs`. Seed rows carry the story; the volume generator in
`src/engine.js` grows the organization around them at load, deterministically.

The demo record is Anderson Intelligence Corp. (`a-intel`), workspace `core-platform`,
operator Marcus Bell. Money is stored as comma-free display strings (the engine divides them
with `parseFloat`, which stops at a thousands separator). A count one page derives from another
record must be derived the same way in the fixture, or two pages disagree.

| File | Collection | What it is |
|---|---|---|
| `org.json` | `ORG` | the organization: slug, name, plan, data plane, attester key, region, governance mode |
| `ws.json` | `WS` | the workspaces: slug, name, main repo and branch, linked repos, agent count, owner |
| `branches.json` | `BRANCHES` | branches on the workspace's primary repo — what the commit dialog offers beside "+ New branch" |
| `av-sample-photo.json` | `AV_SAMPLE_PHOTO` | a stylised sample portrait so the photo path renders without a network or an upload |
| `people.json` | `PEOPLE` | the people, keyed by handle: name, role, email, two-factor, avatar |
| `agents.json` | `AGENTS` | the seed agents with their identity (principal, harness, host, credential, budget) merged in |
| `runs.json` | `RUNS` | the seed runs: the story runs the scenarios walk, with status, verdict, cost, task, summary and linked work. `outputs` is the `<RunOutputs>` spine (see below); `touched` is the older flat list and is kept only because `RUNGRAPH`, `frPath` and the generated fleet still read it. |
| `approvals.json` | `APPROVALS` | the parked approvals the Fleet and Run pages show; resolution state lives on S.ap at runtime |
| `frames.json` | `FRAMES` | the authored frames of the live release-manager run; every other run derives its frames |
| `notes-v1.json` | `NOTES_V1` | The transcript is the model-visible projection of a run's frames: the prompt, the agent's prose, its tool calls with their outputs, and the usage each model step burned. Times are seconds from R.started. `fr` on an entry points at the governed frame (FRAMES seq) the gateway wrote for it. |
| `notes-v2.json` | `NOTES_V2` | the same notes after the steer landed |
| `transcripts.json` | `TRANSCRIPTS` | the model-visible transcript of the story runs: prompt, prose, tool calls, usage |
| `rungraph.json` | `RUNGRAPH` | Every item is an edge on the run node. `edge` says who wrote it: observed = the gateway, from a tool call it saw (cites frames); stated = carried by the task or the mandate; inferred = a light-tier model read the frames and proposed it with a confidence and the frames it leaned on. An inferred edge is labelled as such everywhere it appears and never stands in for the record. |
| `findings.json` | `FINDINGS` | the Spend findings, each a costed problem with the frames that prove it |
| `evidence.json` | `EVIDENCE` | Evidence behind each Spend finding — keyed by finding id so the FINDINGS seed stays untouched. Every saving is measured minus counterfactual over the cited runs; nothing here is a model's opinion. |
| `fix.json` | `FIX` | What Fix opens, by finding kind. A Steering PR when the fix is a steering record the agent will read; a help article when the fix is in the customer's own agent code or configuration. |
| `servers.json` | `SERVERS` | the tool servers in the registry: kind, transport, tools, versions, health, connection |
| `tools.json` | `TOOLS` | The registry, as W9 drew it: one row per tool version. `proposal` marks an observed output schema awaiting approval; S.approved[n] flips it to observed_approved at runtime. |
| `connections.json` | `CONNECTIONS` | the customer's credentials in the vault, with owner, downscope and review dates |
| `mandates.json` | `MANDATES` | the mandates: limits by measure, counterparties, tools, approval rule, validity, ledger position |
| `policies.json` | `POLICIES` | the policy versions: state, author, rules, tests, what changed |
| `switches.json` | `SWITCHES` | the kill switches, class and scoped, with their default position |
| `repos.json` | `REPOS` | the repositories linked to workspaces, with production branch, code-graph state, and whether the repository carries a `.oxagen/` tree (`ox`). A row with `role: "available"` is one the installation can reach that no workspace has bound — the init wizard's target. |
| `workcopies.json` | `WORKCOPIES` | the same `.oxagen/` tree on a machine: the directory, its git remote and head, whether it is in sync with the production branch, whether Stella's symlinks are there, and the steering bundle it last saw |
| `oxprs.json` | `OXPRS` | every pull request Oxagen has open, across all six kinds of file (`bootstrap`, `record`, `skill`, `agent`, `tool`, `config`), each with who opened it, the files it carries and its checks. The `record` rows are the same lifecycle the Steering page's Steering PRs tab shows; this collection is the whole of it. |
| `records.json` | `RECORDS` | the published steering records and their lineage. Seed rows carry the `SteeringItem` fields the hub shows and the assembler reads: `tok` (token cost), `grant` (the enforcement grant: `gate`, `rule`, `outcome`, `on`; absent means the record compiles to text only), `about` (relevance terms), `repo` (on a repository-scoped record), and `hash`. A row the volume generator grows has no `hash` and takes no part in the assembler. |
| `proposals.json` | `PROPOSALS` | the promoter's proposals, with support and Steering PR state |
| `memory.json` | `MEMORY` | recalled memory as `SteeringItem`s of kind `memory`: class (`RULE`, `FACT`, `EPISODE`, `PREFERENCE`), force (`may` or `info`), scope, body, `token_cost`, provenance (run and frame), `hash`, `valid_from`, last recalled, and recalls in 30 days. `yieldsTo` names a published `must` that beats it. `supersededBy` names the record that replaced it. |
| `ontology.json` | `ONTOLOGY` | ontology notes as `SteeringItem`s of kind `ontology`: one entity or term definition each, with the file under `.oxagen/ontology/` it lives in and the things it is about. Force is `info`. `ws` places a note in a workspace other than core-platform. |
| `gates.json` | `GATES` | the gates as the second compilation, each with the one-line gate notice it puts into steering: a `SteeringItem` of kind `policy` and force `must`. `gate` is `decision rule`, `mandate`, or `kill switch`. `source` names the rule, mandate, switch, or the record whose grant compiled it. `outcome` is the gate badge. `edit` says where the gate is edited (`tools/policy`, `tools/switches`, `mandate`, `record`, `agents`). `agents` limits the notice to the agents that hold the gated tool. |
| `skill-sync.json` | `SKILL_SYNC` | sync status per repository: state (`in-sync`, `behind`, `unbound`), the synced commit and the head, skills and files written, checkouts, and where sync writes |
| `steering-preview.json` | `STEERING_PREVIEW` | the Preview dataset: `budget` (the SessionStart cap in bytes, bytes per token, the volatile token budget, the compile header), `instructions` (workspace additional instructions as items of kind `instruction`), `prompts` (the prompt chips), and `agents` (slug, the repository it works in, its default prompt) |
| `steering-manifests.json` | `STEERING_MANIFESTS` | the `steering.manifest` frame of a seed run, keyed by run id: the frame it sits beside, the time, the bundle version the run started on, the prompt, and the repository. The rendered and cut lists are not stored: `assembleSteering()` rebuilds them from these inputs, so the frame and Preview cannot disagree. A run with no entry uses its task title and bundle v41. |
| `members.json` | `MEMBERS` | organization membership: person, workspaces, status, two-factor, last seen |
| `invites.json` | `INVITES` | open invitations |
| `audit.json` | `AUDIT` | seed control-plane audit events |
| `notifs.json` | `NOTIFS` | every kind maps to a frame kind or an audit event — nothing invented for a bell. tone is mc's decision vocabulary: approval \| failed \| allowed \| gold \| critical |
| `spend.json` | `SPEND` | the month's spend rollups: totals, proven, by operator, agent, model and tool, wasted spend, budgets |
| `spend-detail.json` | `SPEND_DETAIL` | Drill-down detail behind every row of By operator, By agent and By tool. Keyed "kind:id". Cross-cuts (agents / operators / tools / models) are [name, spend] pairs that sum to at most the entity's own spend; a name that is not itself a row (e.g. "19 other agents") is not drillable. |
| `billing.json` | `BILLING` | the plan, this period's lines, meters and invoices |
| `dod.json` | `DOD` | the definition of done of each seed run, keyed by run id: the locked set, checks with evidence, hidden checks, usage, every Stop, the verdict and certificate (`dod-spec.md`) |
| `skills.json` | `SKILLS` | the skill catalog: id, version, kind, source, path, digest, load tokens, decision tier, state (ok, out of scope, unapproved digest), cited and proof rate |
| `sk-cfg.json` | `SK_CFG` | the workspace's `.oxagen/skills.toml`: version, sources, search cut-off and budget, reflection settings, the unbound-repo policy |
| `skrun.json` | `SKRUN` | the interjected run: the agent, operator, harness and the unbound repository it started in |
| `sk-frames.json` | `SK_FRAMES` | that run's frames while it waits on a person |
| `sk-after.json` | `SK_AFTER` | the frames each answer writes: link to core-platform, or create the workspace edge |
| `sk-queries.json` | `SK_QUERIES` | canned `search_skills` answers: hits with scores, withheld skills, the reason for an empty result |
| `sk-reflect.json` | `SK_REFLECT` | one quarantined reflection: the rubric axes, the self-grade against the record, the contradictions |
| `sk-hist.json` | `SK_HIST` | the config's version history, each a pull request |
| `sk-created.json` | `SK_CREATED` | when each workspace was created, with skills off |

## `runs[].outputs` — the `<RunOutputs>` spine

Decided 2026-09-17 (`design/run-outputs/DECISION.md`, feedback item 7). A run's outputs are a
list of nodes **in the order the run produced them**, not a bag of strings. The flat `touched`
list smuggled a qualifier in after a `·` (`CHANGELOG.md · read once`) and could not say which
items a human would go and open, or what the run was still waiting on. Each node is:

| Field | Meaning |
|---|---|
| `kind` | `task` · `read` · `file` · `branch` · `pr` · `release` · `media` · `comment` · `label` · `record` · `proof` · `gate` · `halt` · `would` · `seal`. Picks the glyph and how the node renders. |
| `name` | what it is called; rendered monospace (a path, a ref, a tool name, an id) |
| `where` | where it landed — the repo, the branch, the ledger, the gateway |
| `state` | its disposition: `created` `written` `pushed` `posted` `open` `linked` `read` `awaiting` `blocked` `failing` `proven` `withheld`, or, on a `seal`, the run's verdict. Drives the badge and the node's ring colour. |
| `note` | one line of prose: what the reader needs and nothing more |
| `at` | wall-clock time, optional |
| `fr` | the frame that produced it; renders as a chip that opens that frame |
| `stat` | `{add, del}` for a file, optional |
| `thumb` / `dim` | a data URI and its dimensions for a `media` node, optional |

Rules the renderer relies on: `read` nodes never become cards, consecutive nodes of one kind fold
past three, a `gate` sits at the position it stopped the run, and a `would` node names what the run
has *not* done. A run with no `outputs` derives a spine from `touched`, so the generated fleet
still renders.

## The assembler's arithmetic

The live release run's `steering.compiled` band is 1,340 tokens, and its `steering.manifest` frame
renders the same 1,340: compile header 38, three gate notices 92 (33 + 31 + 28), four `must` and
`should` records 783, and two `info` records 427 in the volatile selection. The volatile budget is
430, so nothing else fits. Change a gate notice's `token_cost`, a bundle rule's `tok`, or the budget
and the two numbers on the Run page stop agreeing.

Agents carry one tier word from the ladder: `observe` or `harness`. `gateway` and `contained` are
not yet available in the mockup's world, so no agent, run, frame, approval, or receipt carries them.
Spend basis is `client_attested` throughout.
