# Log in

| | |
|---|---|
| Route | `#/welcome/login` |
| Scope | auth |
| Spec | §14 Mission Control; Appendix F sign-in flows |
| Design | `mockups/src/engine.js` → `obLogin()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / … / login`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `login.audit-prompt.md` |

## Job

Returning operator: Google or GitHub, or email and password, then two-factor.

## What is on the page

**Header** — eyebrow “Welcome back”, h1 “Log in to Oxagen”.
Actions: **Log in** (gold, full width)

- Sign in with: Google · GitHub — then “or”. Form: Work email · Password (show/hide; **Forgot password?** link) · “Keep me logged in on this device for 30 days” checkbox.
- Footer: “New to Oxagen? Create an account · Have an invitation? Accept it”.


**Shell.** No sidebar or top bar: the brandmark, then a centred card; the phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Session | `S.ob` | `auth.sessions` (Better Auth) | Better Auth | ✅ |

## Functionality

- Submit goes to Two-factor; Google and GitHub sign in directly and land on Fleet.
- Signing in is recorded like any other governed action.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading** — Primary button busy: “Logging in…”.
- **error** — “Email or password is wrong. Check both and try again, or reset your password.” Email field marked bad.
- **access denied** — Full-card state: “This account is suspended” — who suspended it (the organization owner), when, that recorded runs are kept and no new run tokens are minted. Action: **Contact your organization owner**.

## Mobile

The card fills the width with 16 px gutters; buttons are full width and at least 44 px tall; inputs are 16 px so iOS does not zoom on focus; code inputs are numeric-keypad (`inputmode="numeric"`).

## Permissions

- Read: `public`
- Writes (each a governed action recorded in Audit): `auth.login`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
