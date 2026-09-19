# Register agent · First run

| | |
|---|---|
| Route | `#/a-intel/core-platform/register/run` |
| Scope | workspace gate |
| Spec | §14 Mission Control; Appendix F page 3 |
| Design | `mockups/src/engine.js` → `pRegister(r) → regRun()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / … / register-run`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `register-run.audit-prompt.md` |

## Job

Step 3 of 3: wait for the first frame. Registration completes the moment the first frame from the new key reaches Oxagen and lands the operator on Fleet looking at its run.

## What is on the page

**Header** — eyebrow “Step 3 of 3”, h1 “Wait for the first frame”.
Actions: **Cancel** · **Back**

- **Waiting for the first frame** — a live log that fills as the collector reports (host enrolled, collector running, hooks written, proxy reachable…), then the first frame; an auto-open countdown (“Opening automatically in N…”) to the run.


**Shell.** No sidebar or top bar: the brandmark, then a centred card; the phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| First frame poll | `regSchedule`, `S.reg.log` | `:Frame` seq 1 for the principal | `agent_run_events` / `tacho_events` | 🟡 |

## Functionality

- Polling stops when the user leaves the step or the state is not loaded.
- On the first frame the Context PR that adds `.oxagen/agents/<slug>.toml` is opened by the smoke session.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **error** — “The collector cannot reach the model proxy” — the host enrolled but every request to `https://proxy.oxagen.com/v1` has been refused (ECONNREFUSED, N attempts). A proxy that cannot be reached means an unwrapped agent, so registration will not complete on telemetry alone. Fix hint (outbound 443), request id, host; **Check again**.
- **access denied** — “You cannot see agent registration” — the roles the signed-in person holds on the organization do not include `agent.register on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The card fills the width with 16 px gutters; buttons are full width and at least 44 px tall; inputs are 16 px so iOS does not zoom on focus; code inputs are numeric-keypad (`inputmode="numeric"`).

## Permissions

- Read: `agent.register`
- Writes (each a governed action recorded in Audit): none

## Backend gaps this page depends on

- G16 first-frame unlock

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
