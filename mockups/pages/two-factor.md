# Two-factor

| | |
|---|---|
| Route | `#/welcome/two-factor` |
| Scope | auth |
| Spec | §14 Mission Control; Appendix F sign-in flows |
| Design | `mockups/src/engine.js` → `pWelcome(r) → obTwoFactor()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error |
| Storybook | `Oxagen / … / two-factor`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `two-factor.audit-prompt.md` |

## Job

Step 2 of 2 of log in: the six-digit code from the authenticator app.

## What is on the page

**Header.** Eyebrow “Step 2 of 2”, h1 “Two-factor authentication”, lead “Enter the six-digit code from your authenticator app for `marcus@a-intel.example`.”
Actions: **Verify** (gold, full width, `type=submit`)

- Form, one field: label “Authentication code”, then six one-character inputs (`#ob-tf1` to `#ob-tf6`, `inputmode="numeric"`, `maxlength=1`, each labelled “digit N”) that auto-advance and back up on Backspace. The demo prefills `602914`.
- Under the form: link button **Use a recovery code instead** · “expires 0:24” at the right.
- Footer: **Back to log in**.

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The auth shell (`obShell`) is the brandmark at the top, then a centred card. The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| TOTP and recovery codes | `PEOPLE.marcus.mfa` (`TOTP`) | Better Auth 2FA | Better Auth | ✅ |

## Functionality

- Submit (`obSignedIn`) signs in and lands on Fleet with the toast “Signed in as Marcus Bell. The session is recorded like any other governed action.”
- **Use a recovery code instead** toasts “Recovery codes are single use. 8 of 10 remain.”
- The expiry countdown shows how long the current code stays valid. Three wrong codes lock the account for 15 minutes.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading**: the primary button shows a spinner and “Verifying…” and is `aria-disabled`. The inputs stay.
- **error**: an inline error above the form: “**That code is wrong.** 2 attempts left before a 15-minute lockout.” The six inputs are empty.

## Mobile

The card fills the width with 16 px gutters. The button is full width and at least 44 px tall. The six code inputs stay on one row and open the numeric keypad (`inputmode="numeric"`).

## Permissions

- Read: `authenticated (first factor)`
- Writes (each a governed action recorded in Audit): `auth.2fa`

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
