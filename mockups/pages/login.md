# Log in

| | |
|---|---|
| Route | `#/welcome/login` |
| Scope | auth |
| Spec | §14; Appendix F sign-in flows |
| Design | `mockups/src/engine.js` → `pWelcome(r) → obLogin()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / … / login`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `login.audit-prompt.md` |

## Job

Returning operator: Google or GitHub, or email and password, then two-factor.

## What is on the page

**Header.** Eyebrow “Welcome back”, h1 “Log in to Oxagen”. No lead.
Actions: **Log in** (gold, full width, `type=submit`)

- Sign in with: **Continue with Google** · **Continue with GitHub** (each with its glyph), then a rule reading “or”.
- Form: **Work email** (`#ob-li-email`, `autocomplete=username`) · **Password** with a **Forgot password?** link at the right of the label (`#ob-li-pw`, `autocomplete=current-password`, **Show** / **Hide** toggle, no strength meter) · checkbox “Keep me logged in on this device for 30 days”, checked.
- Footer: “New to Oxagen? **Create an account** · Have an invitation? **Accept it**”.

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The auth shell (`obShell`) is the brandmark at the top, then a centred card. The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Session | `S.ob`, `PEOPLE.marcus` | `auth.sessions` (Better Auth) | Better Auth | ✅ |
| Suspension | `PEOPLE.priya` (the owner who suspended) | `org.members.status` | `org.member.*` | ✅ |

## Functionality

- Submit (`obGo('two-factor')`) goes to Two-factor. Google and GitHub (`obSignedIn`) sign in directly and land on Work with the toast “Signed in as Marcus Bell. The session is recorded like any other governed action.”
- Show and Hide toggle the password field between `password` and `text`.
- Forgot password? goes to `forgot-password.md`. Create an account goes to sign-up. Accept it goes to `accept-invitation.md`.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading**: the primary button shows a spinner and “Logging in…” and is `aria-disabled`.
- **error**: an inline error above the sign-in buttons: “**Email or password is wrong.** Check both and try again, or reset your password.” The email field is marked bad (`ob-bad`).
- **access denied**: the card is replaced by a full-card state with a lock glyph: h2 “This account is suspended”, then “Priya Natarajan (organization owner, Anderson Intelligence Corp.) suspended `marcus@a-intel.example` on 9 Sep 2026. Runs already recorded are kept; no new run tokens are minted.” Action: **Contact your organization owner** (toast “A message to the organization owner is drafted. Nothing else changes until they act.”). No gold action.

## Mobile

The card fills the width with 16 px gutters. Buttons are full width and at least 44 px tall. Inputs are 16 px so iOS does not zoom on focus.

## Permissions

- Read: `public`
- Writes (each a governed action recorded in Audit): `auth.login`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger. A client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen. Gold is identity and never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do. Nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
- Headings are plain nouns: no heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence or nothing.
- Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
