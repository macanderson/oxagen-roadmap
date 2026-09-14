# Verify email

| | |
|---|---|
| Route | `#/welcome/verify` |
| Scope | auth |
| Spec | §14 Mission Control; Appendix F sign-in flows |
| Design | `mockups/src/engine.js` → `obVerify()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error |
| Storybook | `Mission Control / … / verify-email`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `verify-email.audit-prompt.md` |

## Job

Step 1 of 2 after sign-up: the six-digit code sent to the work email, good for ten minutes.

## What is on the page

**Header** — eyebrow “Step 1 of 2”, h1 “Check your email”.
Actions: **Verify email** (gold, full width)

- Six one-digit inputs (auto-advance, backspace moves back). “Did not arrive? **Send a new code**” with a resend countdown. Footer: “Wrong address? Change it”.


**Shell.** No sidebar or top bar: the brandmark, then a centred card; the phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Verification code | `S.ob` | Better Auth email verification | Better Auth | ✅ |

## Functionality

- Submit continues to Name the organization.
- Send a new code voids the old one.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading** — Primary button busy: “Verifying…”.
- **error** — “That code has expired. Codes last 10 minutes. Send a new one below.” The inputs are cleared.

## Mobile

The card fills the width with 16 px gutters; buttons are full width and at least 44 px tall; inputs are 16 px so iOS does not zoom on focus; code inputs are numeric-keypad (`inputmode="numeric"`).

## Permissions

- Read: `public`
- Writes (each a governed action recorded in Audit): `auth.verify`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
