# Register agent · Wrap

| | |
|---|---|
| Route | `#/a-intel/core-platform/register/wrap` |
| Scope | workspace gate |
| Spec | §14 Mission Control; Appendix F page 3 |
| Design | `mockups/src/engine.js` → `pRegister(r) → regWrap()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · access denied |
| Storybook | `Oxagen / … / register-wrap`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `register-wrap.audit-prompt.md` |

## Job

Step 2 of 3: wrap the agent. A wrapped agent routes through at least one gateway seam — the model proxy, the tool gateway, or both. Nothing is pasted: the installer carries the one-time enrollment token.

## What is on the page

**Header** — eyebrow “Step 2 of 3”, h1 “Wrap the agent”.
Actions: **Cancel** · **Back** · **I have already installed it — continue** (gold)

- Harness tabs: Claude Code (one click · gateway, recommended) · Codex CLI (one click · gateway) · SDK agent (five lines · gateway). OS tabs: macOS · Windows · Linux; **Download for <OS>** (a signed package; see `installer.md`). The SDK tab shows the five-line wrap (TypeScript / Python).
- What the installer does, line by line (`regLines`): host enrolled with a device key, collector running, hooks written / `OPENAI_BASE_URL` / `oxagen.agent.wrap()` attached, base URL set to the model proxy, proxy reachable with its tier.


**Shell.** No sidebar or top bar: the brandmark, then a centred card; the phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Enrollment | `S.reg`, `REG_TABS` | `control.enrollments` | `tacho.hosts`; `tacho.enrollment.create` | ✅ |

## Functionality

- The harness chosen on step 1 is preselected and can be changed here.
- Continue moves to step 3 where the first frame is awaited.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **access denied** — “You cannot see agent registration” — the roles the signed-in person holds on the organization do not include `agent.register on core-platform`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The card fills the width with 16 px gutters; buttons are full width and at least 44 px tall; inputs are 16 px so iOS does not zoom on focus; code inputs are numeric-keypad (`inputmode="numeric"`).

## Permissions

- Read: `agent.register`
- Writes (each a governed action recorded in Audit): `enrollment.create`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
