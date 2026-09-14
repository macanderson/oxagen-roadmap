# Reset password

| | |
|---|---|
| Route | `#/welcome/reset` |
| Scope | auth |
| Spec | §14 Mission Control; Appendix F sign-in flows |
| Design | `mc.html` → `obReset()` (the single source; `consolidated.html` is the product build of it) |
| States | loaded · loading · error · access denied |
| Files | `reset-password-loaded.html` / `reset-password-loaded-mobile.html`, `reset-password-loading.html` / `reset-password-loading-mobile.html`, `reset-password-error.html` / `reset-password-error-mobile.html`, `reset-password-denied.html` / `reset-password-denied-mobile.html` |
| Audit | `reset-password.audit-prompt.md` |

## Job

Set a new password from a reset link. Setting it logs out every other device.

## What is on the page

**Header** — eyebrow “Password”, h1 “Set a new password”.
Actions: **Set password** (gold, full width)

- Form: New password (show/hide, meter, requirements) · Confirm new password.


**Shell.** No sidebar or top bar: the brandmark, then a centred card; the phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/2026-09-12-mission-control-app-implementation-plan.md` §3; the *mockup collection* column names the constant in `mc.html` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Reset | `S.ob` | Better Auth password reset + session revocation | Better Auth | ✅ |

## Functionality

- Submit returns to Log in with the toast “Password set. Every other device was logged out.”

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading** — Primary button busy: “Saving…”.
- **error** — “The two passwords do not match. Retype the confirmation.” Confirmation field marked bad.
- **access denied** — Full-card state: “This reset link has expired” — links last 60 minutes and can be used once; when this one was issued. Action: **Request a new link**.

## Mobile

The card fills the width with 16 px gutters; buttons are full width and at least 44 px tall; inputs are 16 px so iOS does not zoom on focus; code inputs are numeric-keypad (`inputmode="numeric"`).

## Permissions

- Read: `reset token`
- Writes (each a governed action recorded in Audit): `auth.reset.complete`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
