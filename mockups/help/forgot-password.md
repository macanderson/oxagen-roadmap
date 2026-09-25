# Forgot password

## Page header {#forgot-password/header}

The eyebrow "Password", the title "Reset your password", and one line that says the link lasts 60 minutes.

### Purpose
You cannot remember your password. The header tells you what happens next, an email with a link, and how long you have to use it.

### Rationale
The eyebrow "Password" groups this screen with Set a new password, the other half of the same recovery. The lifetime is stated before you send the request so a link that expires later is not a surprise. The same 60 minutes appears on the sent card and on Reset password's expired card, so all three screens agree.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Link lifetime, 60 minutes | literal in `obForgot()` | Better Auth password reset | live |

### Logic
- The header has no controls.
- The footer under the card is a single **Back to log in** link to `#/welcome/login`.

### States
- **Loading** and **error**: the header does not change.
- **After submit**: the header is not drawn. The Reset link sent card replaces the whole card.
- **Mobile**: the title drops from 28 px to 23 px.

## Reset request form

One field, **Work email**, and the gold **Send reset link** button.

### Purpose
You enter the address you signed up with and ask for a reset link.

### Rationale
The form asks for one thing because the address is all a reset needs. The demo prefills the demo operator's address, `marcus@a-intel.example`, so the flow can be walked without typing. The build starts the field empty unless the log-in form passed an address along.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Work email | `PEOPLE.marcus.email` | Better Auth password reset | live |
| Sent flag | `S.ob.forgotSent` | Better Auth password reset | mockup only |

### Logic
- `obForgot()` draws the form. The field is `#ob-fp`, `type=email`, `autocomplete=username`.
- Submit sets `S.ob.forgotSent` and re-renders, which shows the Reset link sent card. The build sends the email and records `auth.reset.request` as a governed action in Audit.
- **Send reset link** is the one gold action on the screen.

### States
- **Loading**: **Send reset link** shows a spinner and "Sending…" and is `aria-disabled`.
- **Error**: a red message above the form, "**We could not send that email.** Our mail provider returned a 502. Try again in a minute." This is the only error the form shows. An address with no account is not an error, as the next section explains.
- **Mobile**: the input is 16 px so iOS does not zoom, and the button fills the width.

## Reset link sent

The card that replaces the form after you submit: an inbox glyph, "Reset link sent", and the link's lifetime.

### Purpose
You know the request went through, where to look, and how long the link lasts.

### Rationale
The card reads the same whether or not an account exists for the address: "If an account exists for `marcus@a-intel.example` a reset link is on its way." A card that said "no account found" would let anyone test which addresses have accounts. The link is good for 60 minutes and can be used once, so a link found later in a mailbox cannot be replayed.

**Open the link** is a demo shortcut. It stands in for clicking the link in the email and goes straight to Set a new password. The build has no such button. The link arrives by email only.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Address | `PEOPLE.marcus.email` | Better Auth password reset | live |
| Sent state | `S.ob.forgotSent` | Better Auth password reset | mockup only |

### Logic
- `obForgot()` returns this card while `S.ob.forgotSent` is true. It uses `.ob-state.ok` with the inbox glyph.
- **Open the link** calls `obGo('reset')`. It is a mockup-only control.
- **Back to log in** returns to `#/welcome/login`. The sent flag stays set until Set a new password submits or its expired card asks for a new link, so coming back to this route shows the card again.

### States
- **Loaded after submit**: this card. It has no gold action.
- **Mobile**: the card fills the width and the button is at least 44 px tall.
