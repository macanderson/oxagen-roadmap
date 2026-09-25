# Verify email

| | |
|---|---|
| Route | `#/welcome/verify` |
| Scope | auth |
| Spec | §14; Appendix F sign-in flows |
| Design | `mockups/src/engine.js` → `pWelcome(r) → obVerify()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error |
| Storybook | `Oxagen / … / verify-email`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `verify-email.audit-prompt.md` |

## Job

Step 1 of 2 after sign-up: enter the six-digit code sent to the work email. The code is good for ten minutes.

## What is on the page

**Header.** Eyebrow “Step 1 of 2”, h1 “Check your email”, lead “We sent a six-digit code to `marcus@a-intel.example`. It is good for 10 minutes.”
Actions: **Verify email** (gold, full width, `type=submit`)

- Form, one field: label “Verification code”, then six one-character inputs (`#ob-vc1` to `#ob-vc6`, `inputmode="numeric"`, `maxlength=1`, each labelled “digit N”). Typing a digit moves focus to the next input; Backspace on an empty input moves back. The demo prefills `481502`.
- Under the form: “Did not arrive?” · link button **Send a new code** · a countdown `0:42` at the right.
- Footer: “Wrong address? **Change it**” (a link back to `#/welcome`).

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The auth shell (`obShell`) is the brandmark at the top, then a centred card. The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Verification code | `S.ob`, `PEOPLE.marcus.email` | Better Auth email verification | Better Auth | ✅ |

## Functionality

- Submit (`obGo('organization')`) continues to Name the organization.
- **Send a new code** voids the old one and toasts “A new code is on its way. The old one is void.” The countdown shows when a resend is next allowed.
- Change it returns to sign-up with the address editable.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading**: the primary button shows a spinner and “Verifying…” and is `aria-disabled`. The inputs stay.
- **error**: an inline error above the form: “**That code has expired.** Codes last 10 minutes. Send a new one below.” The six inputs are empty.

## Mobile

The card fills the width with 16 px gutters. The button is full width and at least 44 px tall. The six code inputs stay on one row and open the numeric keypad (`inputmode="numeric"`).

## Permissions

- Read: `public` (a pending sign-up)
- Writes (each a governed action recorded in Audit): `auth.verify`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger. A window the harness reported is labeled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records, and commits, not a summary.
- Exactly one gold action per screen. Gold is identity and never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do. Nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
- Headings are plain nouns: no heading carries a comma, a mid-dot, or a not/never contrast, and subtext under a heading is one sentence or nothing.
- Nothing on the page mentions a witness, a proof, a verdict, a definition of done, a trust or spend score, or a per-run price.
