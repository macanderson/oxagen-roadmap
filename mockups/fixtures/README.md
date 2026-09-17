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
| `runs.json` | `RUNS` | the seed runs: the story runs the scenarios walk, with status, verdict, cost, task, summary and linked work |
| `approvals.json` | `APPROVALS` | the parked approvals the Fleet and Run pages show; resolution state lives on S.ap at runtime |
| `frames.json` | `FRAMES` | the authored frames of the live release-manager run; every other run derives its frames |
| `notes-v1.json` | `NOTES_V1` | The transcript is the model-visible projection of a run's frames: the prompt, the agent's prose, its tool calls with their outputs, and the usage each model step burned. Times are seconds from R.started. `fr` on an entry points at the governed frame (FRAMES seq) the gateway wrote for it. |
| `notes-v2.json` | `NOTES_V2` | the same notes after the steer landed |
| `transcripts.json` | `TRANSCRIPTS` | the model-visible transcript of the story runs: prompt, prose, tool calls, usage |
| `rungraph.json` | `RUNGRAPH` | Every item is an edge on the run node. `edge` says who wrote it: observed = the gateway, from a tool call it saw (cites frames); stated = carried by the task or the mandate; inferred = a light-tier model read the frames and proposed it with a confidence and the frames it leaned on. An inferred edge is labelled as such everywhere it appears and never stands in for the record. |
| `findings.json` | `FINDINGS` | the Spend findings, each a costed problem with the frames that prove it |
| `evidence.json` | `EVIDENCE` | Evidence behind each Spend finding — keyed by finding id so the FINDINGS seed stays untouched. Every saving is measured minus counterfactual over the cited runs; nothing here is a model's opinion. |
| `fix.json` | `FIX` | What Fix opens, by finding kind. A Context PR when the fix is a steering record the agent will read; a help article when the fix is in the customer's own agent code or configuration. |
| `servers.json` | `SERVERS` | the tool servers in the registry: kind, transport, tools, versions, health, connection |
| `tools.json` | `TOOLS` | The registry, as W9 drew it: one row per tool version. `proposal` marks an observed output schema awaiting approval; S.approved[n] flips it to observed_approved at runtime. |
| `connections.json` | `CONNECTIONS` | the customer's credentials in the vault, with owner, downscope and review dates |
| `mandates.json` | `MANDATES` | the mandates: limits by measure, counterparties, tools, approval rule, validity, ledger position |
| `policies.json` | `POLICIES` | the policy versions: state, author, rules, tests, what changed |
| `switches.json` | `SWITCHES` | the kill switches, class and scoped, with their default position |
| `repos.json` | `REPOS` | the repositories linked to workspaces, with production branch, code-graph state, and whether the repository carries a `.oxagen/` tree (`ox`). A row with `role: "available"` is one the installation can reach that no workspace has bound — the init wizard's target. |
| `workcopies.json` | `WORKCOPIES` | the same `.oxagen/` tree on a machine: the directory, its git remote and head, whether it is in sync with the production branch, whether Stella's symlinks are there, and the steering bundle it last saw |
| `oxprs.json` | `OXPRS` | every pull request Oxagen has open, across all six kinds of file (`bootstrap`, `record`, `skill`, `agent`, `tool`, `config`), each with who opened it, the files it carries and its checks. The `record` rows are the same lifecycle the Steering page's Context PRs tab shows; this collection is the whole of it. |
| `records.json` | `RECORDS` | the published context records and their lineage |
| `proposals.json` | `PROPOSALS` | the promoter's proposals, with support and Context PR state |
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
