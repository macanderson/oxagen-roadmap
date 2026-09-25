# Forgot password

| | |
|---|---|
| Route | `#/welcome/forgot` |
| Scope | auth |
| Spec | §14; Appendix F sign-in flows |
| Design | `mockups/src/engine.js` → `pWelcome(r) → obForgot()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error |
| Storybook | `Oxagen / … / forgot-password`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `forgot-password.audit-prompt.md` |

## Job

Request a password reset link. The link is good for sixty minutes and can be used once.

## What is on the page

**Header.** Eyebrow “Password”, h1 “Reset your password”, lead “We will email a link that is good for 60 minutes.”
Actions: **Send reset link** (gold, full width, `type=submit`)

- Form, one field: **Work email** (`#ob-fp`, `type=email`, `autocomplete=username`), demo value `marcus@a-intel.example`.
- Footer: **Back to log in**.
- After submit (`S.ob.forgotSent`) the card becomes a full-card state with an inbox glyph: h2 “Reset link sent”, then “If an account exists for `marcus@a-intel.example` a reset link is on its way. The link is good for 60 minutes and can be used once.” Action: **Open the link** (a demo shortcut to `reset-password.md`; the product build has no such button, the link arrives by email). Footer: **Back to log in**.

**Shell.** No sidebar and no topbar, so this page has no approvals button and no approvals drawer. The auth shell (`obShell`) is the brandmark at the top, then a centred card. The phone layout is the same card at full width.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). From `docs/implementation-plan.md` §3; the *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) or the constant in `mockups/src/engine.js` that the design renders from.

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| Reset token | `S.ob.forgotSent` | Better Auth password reset | Better Auth | ✅ |

## Functionality

- Submit sets the sent state. The sent state never says whether the address exists.
- Back to log in returns to `login.md` from either card.

## States

- **loaded**: the page as described above, on the demo record (Anderson Intelligence Corp., `a-intel` / `core-platform`, operator Marcus Bell).
- **loading**: the primary button shows a spinner and “Sending…” and is `aria-disabled`.
- **error**: an inline error above the form: “**We could not send that email.** Our mail provider returned a 502. Try again in a minute.”

## Mobile

The card fills the width with 16 px gutters. The button is full width and at least 44 px tall. The input is 16 px so iOS does not zoom on focus.

## Permissions

- Read: `public`
- Writes (each a governed action recorded in Audit): `auth.reset.request`

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
