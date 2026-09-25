# Two-factor

## Page header {#two-factor/header}

The eyebrow "Step 2 of 2", the title "Two-factor authentication", and one line that names the account the code is for.

### Purpose
Your password was right, and one step is left. The header tells you to open your authenticator app and which account's code to read from it, since one app can hold several.

### Rationale
The eyebrow pairs with Log in: a password sign-in is two steps, and this is the second. The address in the lead is the account whose entry you pick in the authenticator app. An app can hold more than one Oxagen entry, and a code from the wrong one uses up one of three attempts. A Google or GitHub sign-in never reaches this screen.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Account address | `PEOPLE.marcus.email` | Better Auth 2FA | live |
| Second factor kind | `PEOPLE.marcus.mfa` (`TOTP`) | Better Auth 2FA | live |

### Logic
- The header has no controls.
- The footer under the card is a single **Back to log in** link to `#/welcome/login`.
- The build must show this screen only to a person whose first factor passed and whose account has a TOTP factor enrolled (`PEOPLE.marcus.mfa`). The first factor alone opens no session.

### States
- **Loading** and **error**: the header does not change.
- **Mobile**: the title drops from 28 px to 23 px.

## Two-factor form

The six code inputs, the gold **Verify** button, the recovery-code link and the code's countdown.

### Purpose
You type the current code from your authenticator app and finish signing in. If your phone is not with you, you use a recovery code instead.

### Rationale
Three wrong codes lock the account for 15 minutes (`docs/walkthrough.md`, Part 1, section 3). The error says how many attempts are left, so you stop before the lockout rather than after it. The countdown shows how long the code on screen stays valid, so you wait for a fresh one rather than typing one that expires mid-entry. The recovery path sits on the same card because a person without their phone has no other way past this screen.

The recovery link is a stub. Pressing it toasts "Recovery codes are single use. 8 of 10 remain." and nothing else. The build must swap the six inputs for one recovery-code input, accept a single-use code, mark it used, and say how many remain after sign-in.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Code | literal `"602914"` passed to `obCodes` | Better Auth 2FA | live |
| Recovery codes left | literal "8 of 10" in the toast | Better Auth 2FA | live |
| Attempts left | literal "2 attempts" in the error | Better Auth 2FA | live |
| Code expiry | literal `0:24` | Better Auth 2FA | partial |

### Logic
- `obTwoFactor()` draws the panel. The six boxes are the Code inputs section, shared with Verify email.
- Submit calls `obSignedIn()`, which clears any onboarding state, goes to Work and toasts "Signed in as Marcus Bell." The build checks the code first and records `auth.2fa` as a governed action in Audit.
- **Use a recovery code instead** is the stub described above.
- "expires 0:24" is fixed text in the mockup. The build counts down the time left on the current code.
- **Verify** is the one gold action on the screen.

### States
- **Loading**: **Verify** shows a spinner and "Verifying…" and is `aria-disabled`. The inputs stay.
- **Error**: a red message above the form, "**That code is wrong.** 2 attempts left before a 15-minute lockout." The six inputs are empty.
- **Mobile**: the six boxes stay on one row and open the number pad, and the button fills the width.
