# Forgot password

| | |
|---|---|
| Route | `#/welcome/forgot` |
| Scope | auth |
| Spec | §14 Mission Control; Appendix F sign-in flows |
| Design | `mc.html` → `obForgot()` (the single source; `consolidated.html` is the product build of it) |
| States | loaded · loading · error |
| Files | `forgot-password-loaded.html` / `forgot-password-loaded-mobile.html`, `forgot-password-loading.html` / `forgot-password-loading-mobile.html`, `forgot-password-error.html` / `forgot-password-error-mobile.html` |
| Audit | `forgot-password.audit-prompt.md` |

## Job

Request a password reset link, good for sixty minutes and usable once.

## What is on the page

**Header** — eyebrow “Password”, h1 “Reset your password”.
Actions: **Send reset link** (gold, full width)

- Form: Work email. After submit the card becomes “Reset link sent” (if an account exists a link is on its way; 60 minutes; once) with **Open the link** (demo shortcut to Reset password). Footer: “Back to log in”.


**Shell.** No sidebar or top bar: the brandmark, then a centred card; the phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/2026-09-12-mission-control-app-implementation-plan.md` §3; the *mockup collection* column names the constant in `mc.html` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Reset token | `S.ob.forgotSent` | Better Auth password reset | Better Auth | ✅ |

## Functionality

- The sent state never reveals whether the address exists.

## States

- **loaded** — the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading** — Primary button busy: “Sending…”.
- **error** — “We could not send that email. Our mail provider returned a 502. Try again in a minute.”

## Mobile

The card fills the width with 16 px gutters; buttons are full width and at least 44 px tall; inputs are 16 px so iOS does not zoom on focus; code inputs are numeric-keypad (`inputmode="numeric"`).

## Permissions

- Read: `public`
- Writes (each a governed action recorded in Audit): `auth.reset.request`

## Backend gaps this page depends on

- none

## Rules every build of this page must keep

- Every badge that describes trust (enforcement tier, replay grade, attestation, cost basis) shows the recorded value and nothing stronger; a client-attested window is labelled as such.
- Every number that is money shows its basis. Headers are rollups of the rows beneath them, never typed twice.
- Every explanation is a chain of links to frames, records and commits, not a summary.
- Exactly one gold action per screen. Gold is identity; it never encodes state. State reads as a dot and a word, so it survives greyscale.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
