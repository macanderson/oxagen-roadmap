# Reset password

## Page header {#reset-password/header}

The eyebrow "Password", the title "Set a new password", and one line that names the account and warns that other devices will be logged out.

### Purpose
You opened the link from the reset email. The header confirms whose password you are changing and tells you, before you submit, that every other session ends.

### Rationale
The lead is a warning before an action you cannot undo, so it stays on the page. When a person resets because they suspect someone else has the password, ending every other session is what shuts that person out. Naming the address guards against a link forwarded to the wrong person. The eyebrow "Password" groups this screen with Reset your password, the request half of the same recovery.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Account address | `PEOPLE.marcus.email` | Better Auth password reset + session revocation | live |

### Logic
- The header has no controls.
- The page has no footer link. The build reaches it only from the emailed link, which carries the reset token.

### States
- **Loading** and **error**: the header does not change.
- **Denied**: the header is not drawn. The Expired link card replaces the whole card.
- **Mobile**: the title drops from 28 px to 23 px.

## New password form

The new password with its meter and requirements, a confirmation field, and the gold **Set password** button.

### Purpose
You choose a new password that meets the rules and type it twice, so a typo does not lock you out again.

### Rationale
The first field is the Password field from Sign up, with the same Show or Hide toggle, four-segment meter and three requirements, because the rules for a chosen password are the same wherever you choose it. The confirmation field has no toggle and no meter. It exists only to catch a mistyped first field.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| New password | `S.ob.pw` | Better Auth password reset + session revocation | live |
| Shown or hidden | `S.ob.pwShown` | none, client state | mockup only |
| Confirmation | `S.ob.pw` in the loaded state, literal `Rq7!mesa-latice` in the error state | Better Auth password reset | live |

### Logic
- `obReset()` draws the form. **New password** is `#ob-rp` through `obPwField`. **Confirm new password** is `#ob-rp2`, `type=password`.
- Submit clears `S.ob.forgotSent`, goes to Log in, and toasts "Password set. Every other device was logged out."
- The build checks that the two fields match and that the password meets the three rules, sets the password, revokes every other session, and records `auth.reset.complete` as a governed action in Audit. The mockup checks nothing.
- **Set password** is the one gold action on the screen.

### States
- **Loading**: **Set password** shows a spinner and "Saving…" and is `aria-disabled`.
- **Error**: a red message above the form, "**The two passwords do not match.** Retype the confirmation." The confirmation field is marked bad (`ob-bad`).
- **Mobile**: inputs are 16 px so iOS does not zoom, and the button fills the width.

## Expired link

The card that replaces the form when the reset link has expired or was already used: when it was issued, and a way to get a new one.

### Purpose
The link from your email no longer works. The card says why and gets you a new link in one click.

### Rationale
A reset link lasts 60 minutes and can be used once, the same rule the Reset your password screen and its sent card state. The card gives the issue time, 12:58 on 11 Sep 2026, so you can tell whether you opened an old email or whether someone used the link before you. It is a denied state because the token is refused. It has no gold action because the only way forward is to start the request again.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Issue time | literal `12:58 on 11 Sep 2026` in `obReset()` | Better Auth password reset | live |
| Lifetime and single use | literal in `obReset()` | Better Auth password reset | live |

### Logic
- `obReset()` returns this card when the state is `denied`. It uses `.ob-state.deny` with the warning glyph.
- The title is "This reset link has expired". The body reads "Reset links last 60 minutes and can be used once. This one was issued at 12:58 on 11 Sep 2026. Request a new one and it will arrive in under a minute."
- **Request a new link** clears `S.ob.forgotSent` and opens Reset your password with its form, not its sent card.
- The build shows this card for an expired token and for a used one, and never sets a password from either.

### States
- **Denied**: this card, in place of the header and the form.
- **Mobile**: the card fills the width and the button is at least 44 px tall.
