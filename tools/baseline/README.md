# Mission Control design baseline

Every lane that builds from "the mockup" builds from **one** `mc.html`: the tag
`mc-baseline-w2` in this repo.

```sh
git show mc-baseline-w2:mc.html > /tmp/mc.html
```

## mc-baseline-w2 (2026-09-13)

`main` after PRs #3–#8: everything in w1 below, plus

| Decision | Came from | What to build |
|---|---|---|
| W1–W11 are guided scenarios over the real pages, not separate designs | PR #6 | Walk your page's scenario (`Scenarios` in the sidebar) before building it; `tools/check-scenarios.mjs` walks them all |
| Everything each W file showed that mc.html lacked is in mc.html | PR #6 (nine port lanes) | The per-flow list is in PR #6's description |
| Frames and context belong to a run; recorded frames are immutable | PR #6 | `FRAMES_BY_RUN`/`runFrames(R)`, `runContext(R)`; a published steering bundle reaches the next model call only |
| Tenant is Anderson Intelligence Corp. (`a-intel`) at business scale | PR #5, re-applied in PR #6 | Seed rows render first; 274 agents, 1,168 runs shown |
| One story clock: 2026-09-11 09:31:30 UTC, running from load | PR #8 | `nowT()`/`storyMs()` stamp anything a control writes |

## On main since mc-baseline-w2 (include in the next tag)

| Decision | Came from | What to build |
|---|---|---|
| A run only calls tools its agent's belt can make | `belt-true-toolpool` | The Run page's calls (and the fixture seed's) are a subset of `AGENT_BELTS[agent]` at `TOOLS` versions, never a tool the belt denies. In w2, `TOOLPOOL` gave release-manager `edit__file@1`/`write__file@1`, invoice-bot `slack__post_message@2` and stella-ci `linear__get_issue@1`, none of them on those belts, plus three versions the registry does not have. `check-baseline.mjs` now asserts it for every pool entry and every run. |

## mc-baseline-w1

It is `main` @ 54f9107 (Agent IAM, Identities) with:

| Decision | Came from | What to build |
|---|---|---|
| Approvals are small by default | `small-approvals-bottom-dock-scenarios` 2cd6684 | `approvalCardSm()` in lists and rails; the full card only behind an in-place Details expand |
| The in-app agent is a flyout off the sidebar | `worktree-assistant-sidebar-flyout` fc4d0b8 (PR #1) | `asstToggle`/`asstMount` on a host outside `#app`; no right-side aside, no bottom dock |
| The Run page reads off one derivation | `Specs/mockups/mc.html` scratch (never on a branch) | `runMetrics(R)` feeds six instruments, the prompt panel, the calls/concurrency/prefetch panel and the Files changed diffstat |

Where an older branch or a W file disagrees with this table, the table wins.
w2 and w3 still carry the bottom dock; that is known and does not change the
decision.

## Files

- `apply-run-metrics.py`: the runMetrics port as a re-runnable transform. When
  `main` moves, rebuild with `python3 tools/baseline/apply-run-metrics.py mc.html`
  on main's file instead of merging hunks. It asserts every splice matches once,
  refuses a base that already has `runMetrics`, and fails on duplicate top-level
  function names (one script, so a duplicate silently shadows).
- `run-metrics.js`, `run-metrics.css`: the scratch work, cut out verbatim except
  that its `dur(ms)` is renamed `msDur(ms)`. In scratch it shadowed the page's
  `dur(sec)`, so every seconds formatter there read milliseconds.
- `check-baseline.mjs`: browser check (Homebrew Playwright). Run it after any
  change to the baseline:

  ```sh
  node tools/baseline/check-baseline.mjs mc.html [--shots DIR]
  ```

  Its assertions compare independent sources: tokens × published price against
  the recorded cost, the Tool calls tile against the family table, the diffstat
  header against each file, `dur(90)` against `msDur(90000)`, and label boxes on
  the timeline. Each one was mutation-tested: breaking the thing it guards
  makes it fail.
