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
| `org.json` | `ORG` | none |
| `ws.json` | `WS` | none |
| `branches.json` | `BRANCHES` | branches on the workspace's primary repo — what the commit dialog offers beside "+ New branch" |
| `av-sample-photo.json` | `AV_SAMPLE_PHOTO` | a stylised sample portrait so the photo path renders without a network or an upload |
| `people.json` | `PEOPLE` | none |
| `agents.json` | `AGENTS` | none |
| `runs.json` | `RUNS` | none |
| `approvals.json` | `APPROVALS` | none |
| `frames.json` | `FRAMES` | none |
| `notes-v1.json` | `NOTES_V1` | The transcript is the model-visible projection of a run's frames: the prompt, the agent's prose, its tool calls with their outputs, and the usage each model step burned. Times are seconds from R.started. `fr` on an entry points at the governed frame (FRAMES seq) the gateway wrote for it. |
| `notes-v2.json` | `NOTES_V2` | none |
| `transcripts.json` | `TRANSCRIPTS` | none |
| `rungraph.json` | `RUNGRAPH` | Every item is an edge on the run node. `edge` says who wrote it: observed = the gateway, from a tool call it saw (cites frames); stated = carried by the task or the mandate; inferred = a light-tier model read the frames and proposed it with a confidence and the frames it leaned on. An inferred edge is labelled as such everywhere it appears and never stands in for the record. |
| `findings.json` | `FINDINGS` | none |
| `evidence.json` | `EVIDENCE` | Evidence behind each Spend finding — keyed by finding id so the FINDINGS seed stays untouched. Every saving is measured minus counterfactual over the cited runs; nothing here is a model's opinion. |
| `fix.json` | `FIX` | What Fix opens, by finding kind. A Context PR when the fix is a steering record the agent will read; a help article when the fix is in the customer's own agent code or configuration. |
| `servers.json` | `SERVERS` | none |
| `tools.json` | `TOOLS` | The registry, as W9 drew it: one row per tool version. `proposal` marks an observed output schema awaiting approval; S.approved[n] flips it to observed_approved at runtime. |
| `connections.json` | `CONNECTIONS` | none |
| `mandates.json` | `MANDATES` | none |
| `policies.json` | `POLICIES` | none |
| `sim.json` | `SIM` | none |
| `switches.json` | `SWITCHES` | none |
| `assurance.json` | `ASSURANCE` | none |
| `repos.json` | `REPOS` | none |
| `records.json` | `RECORDS` | none |
| `proposals.json` | `PROPOSALS` | none |
| `members.json` | `MEMBERS` | none |
| `invites.json` | `INVITES` | none |
| `audit.json` | `AUDIT` | none |
| `notifs.json` | `NOTIFS` | every kind maps to a frame kind or an audit event — nothing invented for a bell. tone is mc's decision vocabulary: approval \| failed \| allowed \| gold \| critical |
| `spend.json` | `SPEND` | none |
| `spend-detail.json` | `SPEND_DETAIL` | Drill-down detail behind every row of By operator, By agent and By tool. Keyed "kind:id". Cross-cuts (agents / operators / tools / models) are [name, spend] pairs that sum to at most the entity's own spend; a name that is not itself a row (e.g. "19 other agents") is not drillable. |
| `billing.json` | `BILLING` | none |
