# Onboarding · Wrap an agent

| | |
|---|---|
| Route | `#/welcome/wrap` |
| Scope | onboarding gate |
| Spec | §14 Mission Control; Appendix F onboarding (the gate) |
| Design | `mockups/src/engine.js` → `pWelcome(r) → regWrap() in onboard mode`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · access denied |
| Storybook | `Mission Control / … / onboarding-wrap`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `onboarding-wrap.audit-prompt.md` |

## Job

Step 2 of 3 of the gate: wrap the first agent — the same screen as Register agent · Wrap, with the enrollment token for the organization’s first agent key.

## What is on the page

**Header** — eyebrow “Step 2 of 3”, h1 “Wrap an agent”.
Actions: **Cancel** · **Back** · **I have already installed it — continue** (gold)

- See `register-wrap.md`: harness tabs (Claude Code · Codex CLI · SDK agent), OS tabs, **Download for <OS>**, the installer’s lines.


**Shell.** No sidebar or top bar: the brandmark, then a centred card; the phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Enrollment | `S.reg` (mode onboard) | `control.enrollments` | `tacho.enrollment.create` | ✅ |

## Functionality

- Identical to Register agent · Wrap; only the rail and the Cancel target differ.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading** — the shell stays; the page body is replaced by the skeleton (four tile blocks and a panel of seven rows), so the operator keeps their bearings.
- **access denied** — “You cannot see onboarding” — the roles the signed-in person holds on the organization do not include `org.create for <email>`. Copy explains an owner can grant it and that the grant is itself a governed action in the audit record. Actions: **Request access** (opens the request-access dialog), **Back to Fleet**. Below: *Signed in as* (name · role), *Needed* (the permission), *Decided by* (`pol_v41` · deny wins over every allow).

## Mobile

The card fills the width with 16 px gutters; buttons are full width and at least 44 px tall; inputs are 16 px so iOS does not zoom on focus; code inputs are numeric-keypad (`inputmode="numeric"`).

## Permissions

- Read: `authenticated`
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
