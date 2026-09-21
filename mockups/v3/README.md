# Mission Control v3

The v1 mockup, rebuilt as the product looks when every phase of the plan has shipped, without
witness runs, proof, definitions of done and agent credit scores, and with token accounting and
coaching added. V1 (`mockups/`) and v2 (`mockups/v2/`) are unchanged.

## Open

- `npm run mockups:v3` rebuilds `mockups/v3/missioncontrol.html`, which opens from disk.
- `npm run storybook` serves it at `/v3/missioncontrol.html` from the sources on every request.
- `npm run check:v3` runs the headless checks over every page, state, shell and scenario.

The URL contract is v1's: `?product=1`, `?state=`, `?mobile=`, `?theme=` and the `#/a-intel/...`
routes. `mockups/v3/catalog.mjs` lists every page and scenario.

## What changed from v1

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

## Data boundary

Interactive fixtures, not telemetry. Token rollups are seeded from the record so the same agent
shows the same numbers on every page, shaped by its model tier, belt width and harness; nothing here
was measured. Coaching thresholds are illustrative. No action sends anything to a real agent or
provider.

## Sources

- `mockups/v3/src` and `mockups/v3/fixtures`: copies of v1's, edited. `tools/build-mockup-v3.mjs`
  builds them with the same builder as v1.
- Spec: `oxagen/docs/specs/mission-control/spec.md` §12.6 to §12.9 for the token classes, the
  derived metrics and the findings; `plan.md` §8 for the phases the mock assumes shipped.
