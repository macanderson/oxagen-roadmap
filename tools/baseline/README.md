# Mission Control design baseline

Every lane that builds from "the mockup" builds from **one** `mc.html`: the tag
`mc-baseline-w1` in this repo.

```sh
git show mc-baseline-w1:mc.html > /tmp/mc.html
```

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
