# Verification, September 22, 2026

- `node tools/check-mockup.mjs`: 4,475 assertions passed, 0 failed. Every page in
  `mockups/catalog.mjs` in every state it implements, desktop and mobile, with no JavaScript
  error, the state's own markup on screen, no sideways scroll on the phone shell, and the mobile
  shell's own guarantees. All 10 scenarios walked step by step (W5 and W14 are gone).
- The W8 failure this file reported against Spend's tab strip is fixed, and it was not the strip.
  Spend's token total is eleven digits, and at the stat tile's 23px it overflowed the tile by 50px
  and pushed the shell sideways on four steps. Measuring each element with a clipped ancestor ruled
  out named the `.stat .v` span; the phone now renders a stat value at 17px, the size the
  reconciliation tiles already use, and every step of W8 measures 0px of overflow.
- The catalog holds 50 routes: the Agents registry, five of the agent's own tabs, Tools with its
  five tabs, Steering with its five tabs and its Library shelves, and Runtimes with one host.
- `node tools/check-creation.mjs`: 459 passed. `node tools/check-api.mjs`: 60 passed.
  `node tools/check-assistant.mjs`: 49 checks passed. `node tools/check-record-e2e.mjs`: 121
  passed, which writes a steering record, merges its pull request, and finds it on the Records
  shelf. `node tools/check-refresh.mjs`: 13 passed. The whole chain is `npm run check`, and it
  exits 0.
- The route smoke this file reported over 41 unnamed routes is not in the repository, so
  `npm run check` cannot re-run it. The claim is removed rather than repeated on a build that
  never saw it.
- The built page contains no `witness`, `oracle`, `dod`, `definition of done`, `proof`, `verdict`
  or `trust score` outside two English idioms in v1 copy ("the only witness to its own arithmetic",
  "not proof that it was not").
- `node tools/build-mockup-future.mjs --check` and `node tools/build-mockup-v2.mjs --check` still pass:
  the future-state mockup and v2 are unchanged. (On September 25, `a48afde` deleted `mockups/v2`,
  and #109 removed `tools/build-mockup-v2.mjs` and its step in `npm run check`.)
- The approvals drawer: opens from the topbar button on every page, lists 17 waiting items
  (16 parked approvals and 1 interjection), selecting one renders the full approval card with its
  three actions, Escape closes it, and the countdowns keep ticking inside it. Screenshots
  `review/approvals-drawer*.png`, `review/governance-mode.png`.
- The Run page: the summary leads, the stat row, the Issues tab with links, the single Repository panel, the outputs and spend by area in the right column; the transcript feed starts inside the first 1,000 px on a live run. Screenshots `review/run-*.png`, `review/steer-dialog*.png`.
- Screenshots in `review/`: Fleet (light, dark, mobile), Spend findings, tokens, coaching (desktop
  and mobile), agent drill, wasted spend, run transcript and cost, agent page, identities,
  steering memory and skills, billing.

The checks read presentation fixtures, not telemetry. Token rollups and coaching thresholds are
seeded and illustrative, as `README.md` says.
