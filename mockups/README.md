# Mission Control mockup

The authoritative design of rev1: what the product has to have, to the spec, every last detail.
It is the first mockup rebuilt as the product looks when every phase of the plan has shipped,
without witness runs, proof, definitions of done and agent credit scores, and with token
accounting and coaching added. The first mockup is kept as `future_state_mockups/`; v2 is `v2/`.
The per-page specs and audit prompts in `pages/` describe this mockup and are what a build of
rev1 is measured against.

## Open

- `node tools/build-mockup.mjs` rebuilds `mockups/missioncontrol.html`, which opens from disk.
- `npm run storybook` serves it at `/missioncontrol.html` from the sources on every request.
- `node tools/check-mockup.mjs` runs the headless checks over every page, state, shell and scenario.

The URL contract: `?debug=true`, `?state=`, `?mobile=`, `?theme=` and the `#/a-intel/...`
routes. `mockups/catalog.mjs` lists every page and scenario.

The file opens as the product. The mockup chrome — the state bar, the scenario rail, the
scenario nav item, the onboarding demo entry points and Exit demo — appears only under
`?debug=true`, so a reviewer's first open shows the design and nothing else. `?product=1` is
the old spelling of the same default and still works.

## What changed from the future-state mockup

**Removed.** The witness runner, oracles, the flip, proof frames and the Proof tab. The definition
of done, its Done column, tile, tab, dialogs and scenario. The trust and spend scores, their pills,
meters, percentile bands and the nightly platform rollup. Proven, accepted and unproven spend, and
spend per proven run. Scenarios W5 (Proven, not claimed) and W14 (Done means done).

**Kept.** Everything else, including wasted spend and spend attribution. Wasted spend never
depended on proof: it is what the frames show bought nothing, so it stays with one cause fewer
(the "unproven outcome" cause is gone) and the note now says so.

**Added.**

- Token accounting, from the cost record's fixed classes (spec §12.6): `input_uncached`,
  `cache_read`, `cache_write`, `output`, `reasoning`, and the measured prompt parts (tool
  definitions, context frames, steering, system, tool results, conversation). A Tokens tab on
  Spend shows the month by class, by prompt part, by harness with its basis, and by agent. Fleet and
  the agent Runs table show tokens per run with the cache share; Identities shows tokens per agent;
  every operator and agent drill carries token tiles; the Cost tab of a run names its basis.
- Coaching, derived at read time from the same rollup: what each agent and each operator should
  change, with the signal it came from, the tokens and money behind it, and the one action that
  changes it. A Coaching tab on Spend, and a strip on every agent page in place of the score strip.
- The tier ladder is complete: `gateway` and `contained` are real tiers (Phases 4 and 5), most of the
  fleet sits on `gateway` with `gateway_observed` metering, one seed agent stays on `harness` and is
  self-reported, and Stella CI runs `contained`.
- Auto-approval rules qualify an agent on its record (tier, runs in 30 days, no tamper incident),
  never on a score.
- Billing prices the governed action (ADR-055), not the proven run.
- Steering is unchanged from v1: records, memory, ontology, policy, proposals, preview and skills
  are its tabs. The Memory tab gains an aggregation strip: how many run notes and operator steers
  folded into how many items, and how often they were recalled.
- Skills report a cited rate (loads the run cited) where v1 reported a proof rate.
- Approvals moved off the Fleet page into a drawer. A button in the topbar, left of your avatar
  on every page, carries the count of everything waiting on you across the organization: parked
  approvals and any open interjection. The drawer lists them; picking one shows the full card
  (the same one the run page shows) with approve and deny. Fleet keeps its "waiting on a human"
  tile, which opens the drawer, and loses the approvals panel and the interjection banner. The
  topbar's assistant button is gone; the launcher at the foot of the sidebar stays.
- The workspace governance mode (`solo`, `team`, `regulated`) is a setting: a chip on the Steering
  header opens a dialog that shows the three modes and the `governance.toml` it would write, the
  Edit workspace dialog carries the same select, and the Organization workspaces table reads it
  off the workspace. Changing it opens a Context PR; nothing else writes that file.

- The Run page leads with the generated summary, then one row of stat boxes (Tokens, Prompts,
  Cost, Wasted, Wall clock, Cache hit), then the tabs (Transcript open by default, Issues, Governed
  actions, Cost, Policy, Context, Chain and seal) in a two-thirds column; the right third holds one
  Repository panel (branch, pull request, checks, diff and files), the outputs, and spend by area
  (initial prompt, follow-up prompts, context retrievals, tool definitions, tool calls by tool, model
  output). The Issues tab lists every issue the session touched with its status, relation and link. A prompt after the first is corrective, so prompts
  per session is a wasted-spend cause and an operator coaching signal.
- `pages/` holds the spec of every page and its audit prompt, rewritten for this mockup. They are
  what a build of rev1 is measured against.
- Tasks (2026-09-23, `docs/tasks-spec.md`): a Workspace nav item under Fleet. Tasks arrive from
  GitHub, Linear and Jira through a six-step connection wizard, with thirteen fixed fields,
  configurable statuses, resolutions and coloured labels, and provider accounts mapped to members or
  left not mapped. `oxagen.assistant` drafts a definition of done for every task and a person
  certifies it. This is the task's definition of done, a list a person certifies and accepts. It is
  not the run dod removed above, and none of that one's verdict words apply. Ready tasks go to an
  agent the sender operates in a work order: the merged definition of done, an editable prompt with
  `@` mentions of context records and agent profiles, and confirmed repositories. Workflows chain
  agents (fix, validate, document, review) and end with a person. `tools/check-tasks.mjs` walks it.

## Data boundary

Interactive fixtures, not telemetry. Token rollups are seeded from the record so the same agent
shows the same numbers on every page, shaped by its model tier, belt width and harness; nothing here
was measured. Coaching thresholds are illustrative. No action sends anything to a real agent or
provider.

## Sources

- `mockups/src` and `mockups/fixtures`, built by `tools/build-mockup.mjs`. The future-state
  sources are `mockups/future_state_mockups/{src,fixtures}`, built by `tools/build-mockup-future.mjs`.
- Spec: `oxagen/docs/specs/mission-control/spec.md` §12.6 to §12.9 for the token classes, the
  derived metrics and the findings; `plan.md` §8 for the phases the mock assumes shipped.
