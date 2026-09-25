# Reset password

| | |
|---|---|
| Route | `#/welcome/reset` |
| Scope | auth |
| Spec | §14; Appendix F sign-in flows |
| Design | `mockups/src/engine.js` → `pWelcome(r) → obReset()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / … / reset-password`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `reset-password.audit-prompt.md` |

## Job

Set a new password from a reset link. Setting it logs out every other device.

## What is on the page

**Header.** Eyebrow “Password”, h1 “Set a new password”, lead “For `marcus@a-intel.example`. Setting a new password logs out every other device.”
Actions: **Set password** (gold, full width, `type=submit`)

- Form: **New password** (`#ob-rp`, `autocomplete=new-password`, **Show** / **Hide** toggle, a four-segment strength meter, and the requirement list “✓ at least 12 characters · ✓ one symbol · ✓ one digit”, each ticking as the value meets it) · **Confirm new password** (`#ob-rp2`, `type=password`).
- No footer link. The page is reached from the emailed link only.

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The auth shell (`obShell`) is the brandmark at the top, then a centred card. The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Reset and session revocation | `S.ob.pw`, `S.ob.pwShown` | Better Auth password reset + session revocation | Better Auth | ✅ |

## Functionality

- Submit returns to Log in with the toast “Password set. Every other device was logged out.” and clears the sent flag on Forgot password.
- The meter and the requirement list update on every keystroke (`obPwMeter`). Show and Hide toggle both the field type and the button label.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading**: the primary button shows a spinner and “Saving…” and is `aria-disabled`.
- **error**: an inline error above the form: “**The two passwords do not match.** Retype the confirmation.” The confirmation field is marked bad (`ob-bad`).
- **access denied**: the card is replaced by a full-card state with a warning glyph: h2 “This reset link has expired”, then “Reset links last 60 minutes and can be used once. This one was issued at 12:58 on 11 Sep 2026. Request a new one and it will arrive in under a minute.” Action: **Request a new link** (returns to `forgot-password.md`). No gold action.

## Mobile

The card fills the width with 16 px gutters. The button is full width and at least 44 px tall. Inputs are 16 px so iOS does not zoom on focus.

## Permissions

- Read: `reset token`
- Writes (each a governed action recorded in Audit): `auth.reset.complete`

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
