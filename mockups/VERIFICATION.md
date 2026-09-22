# Verification, September 22, 2026

- `node tools/check-mockup.mjs`: 4,165 assertions passed, 1 failed. Every page in
  `mockups/catalog.mjs` in every state it implements, desktop and mobile, with no JavaScript
  error, the state's own markup on screen, no sideways scroll on the phone shell, and the mobile
  shell's own guarantees. All 10 scenarios walked step by step (W5 and W14 are gone).
- The one failure is on `main` too, at the same 17 px: step 1 of W8 opens Spend, and Spend's
  nine-tab strip overflows the page by 17 px when the phone shell is forced. It is a shell layout
  defect on a page this change does not touch.
- The catalog holds 46 routes, the Agents registry, the agent detail tabs, Tools with its five
  tabs, Steering with its five tabs and its Library shelves, and Runtimes among them.
- `node tools/check-creation.mjs`: 459 passed. `node tools/check-api.mjs`: 49 passed.
  `node tools/check-assistant.mjs`: 60 passed. `node tools/check-record-e2e.mjs`: 121 passed,
  which writes a context record, merges its pull request, and finds it on the Records shelf.
  `node tools/check-refresh.mjs`: 13 passed.
- The built page contains no `witness`, `oracle`, `dod`, `definition of done`, `proof`, `verdict`
  or `trust score` outside two English idioms in v1 copy ("the only witness to its own arithmetic",
  "not proof that it was not").
- `node tools/build-mockup-future.mjs --check` and `node tools/build-mockup-v2.mjs --check` still pass:
  the future-state mockup and v2 are unchanged.
- The approvals drawer: opens from the topbar button on every page, lists 17 waiting items
  (16 parked approvals and 1 interjection), selecting one renders the full approval card with its
  three actions, Escape closes it, and the countdowns keep ticking inside it. Screenshots
  `review/approvals-drawer*.png`, `review/governance-mode.png`.
- The Run page: the summary leads, the stat row, the Issues tab with links, the single Repository panel, the outputs and spend by area in the right column; the transcript feed starts inside the first 1,000 px on a live run. Screenshots `review/run-*.png`, `review/steer-dialog*.png`.
- Screenshots in `review/`: Fleet (light, dark, mobile), Spend findings, tokens, coaching (desktop
  and mobile), agent drill, wasted spend, run transcript and cost, agent page, identities,
  auto-approvals, steering memory and skills, billing.

The checks read presentation fixtures, not telemetry. Token rollups and coaching thresholds are
seeded and illustrative, as `README.md` says.
