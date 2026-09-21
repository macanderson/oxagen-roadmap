# Verification, September 21, 2026

- `MOCKUP=v3 node tools/check-mockup.mjs`: 3,540 assertions passed, 0 failed. Every page in
  `mockups/v3/catalog.mjs` in every state it implements, desktop and mobile, with no JavaScript
  error, the state's own markup on screen, no sideways scroll on the phone shell, and the mobile
  shell's own guarantees. All 10 scenarios walked step by step (W5 and W14 are gone).
- A route smoke over 62 routes (every catalog page plus the Spend tabs, drills, run tabs, agent
  tabs and auto-approval rules): no error, every page renders.
- The built page contains no `witness`, `oracle`, `dod`, `definition of done`, `proof`, `verdict`
  or `trust score` outside two English idioms in v1 copy ("the only witness to its own arithmetic",
  "not proof that it was not").
- `node tools/build-mockup.mjs --check` and `node tools/build-mockup-v2.mjs --check` still pass:
  v1 and v2 are byte-for-byte unchanged.
- The approvals drawer: opens from the topbar button on every page, lists 17 waiting items
  (16 parked approvals and 1 interjection), selecting one renders the full approval card with its
  three actions, Escape closes it, and the countdowns keep ticking inside it. Screenshots
  `review/approvals-drawer*.png`, `review/governance-mode.png`.
- Screenshots in `review/`: Fleet (light, dark, mobile), Spend findings, tokens, coaching (desktop
  and mobile), agent drill, wasted spend, run transcript and cost, agent page, identities,
  auto-approvals, steering memory and skills, billing.

The checks read presentation fixtures, not telemetry. Token rollups and coaching thresholds are
seeded and illustrative, as `README.md` says.
