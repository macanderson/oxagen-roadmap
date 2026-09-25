# Verify email

## Page header {#verify-email/header}

The eyebrow "Step 1 of 2", the title "Check your email", and one line that names the address the code went to and how long it lasts.

### Purpose
You arrive here right after **Create account**. The header tells you where to look for the code and that it expires in 10 minutes, so you know to check your inbox now.

### Rationale
The address is shown in full, in monospace, because a typo in it is the most likely reason a code never arrives, and the footer's **Change it** fixes exactly that. The eyebrow counts two steps, verify and then name the organization, because a password sign-up is not finished until the address is proven. A sign-up through Google or GitHub skips this screen: the provider has already verified the address.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Work email | `PEOPLE.marcus.email` | Better Auth email verification | live |
| Code lifetime, 10 minutes | literal in `obVerify()` | Better Auth email verification | live |

### Logic
- The header has no controls.
- The footer under the card reads "Wrong address? **Change it**" and links to `#/welcome`, sign-up, where the build keeps the address editable.

### States
- **Loading** and **error**: the header does not change.
- **Mobile**: the title drops from 28 px to 23 px, and the address wraps if it must.

## Verification form

The six code inputs, the gold **Verify email** button, and the resend row with its countdown.

### Purpose
You type the six-digit code from the email and verify the address. If the code did not arrive, you ask for a new one from the same card.

### Rationale
A six-digit code works on any device, including one where the email opens on a phone and the browser is on a laptop. A magic link would force the two onto one device. The resend row sits inside the card rather than in the footer because "Did not arrive?" is the question you have while looking at the empty inputs. The countdown shows when a resend is next allowed, so a person does not press **Send a new code** five times and receive five emails.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Code | literal `"481502"` passed to `obCodes` | Better Auth email verification | live |
| Resend countdown | literal `0:42` | Better Auth email verification | partial |

### Logic
- `obVerify()` draws the panel. The code inputs are the Code inputs section.
- Submit calls `obGo('organization')`, which starts the onboarding gate on Name the organization. The build checks the code first and records `auth.verify` as a governed action in Audit.
- **Send a new code** toasts "A new code is on its way. The old one is void." Sending voids the previous code.
- The countdown is fixed text in the mockup. The build must count down from the resend cooldown and disable **Send a new code** until it reaches zero.
- Verify email is the one gold action on the screen.

### States
- **Loading**: **Verify email** shows a spinner and "Verifying…" and is `aria-disabled`. The inputs stay.
- **Error**: a red message above the form, "**That code has expired.** Codes last 10 minutes. Send a new one below." The six inputs are empty.
- **Mobile**: the button fills the width and is at least 44 px tall.

## Code inputs

Six one-character inputs that take a six-digit code, one digit each, and move the cursor as you type.

### Purpose
You enter a code the way you read it, digit by digit, and see each digit in its own box. The phone keypad opens on numbers.

### Rationale
Two screens take a six-digit code, Verify email and Two-factor, so the inputs are written once here and both screens open this section. Separate boxes make a missed or doubled digit visible before you submit. `inputmode="numeric"` opens the number pad on a phone without the spinner arrows that `type=number` adds.

### Data sources
| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Verify email code | `obCodes("ob-vc", "481502")` | Better Auth email verification | live |
| Two-factor code | `obCodes("ob-tf", "602914")` | Better Auth 2FA | live |

### Logic
- `obCodes(prefix, code)` draws six inputs with ids `<prefix>1` to `<prefix>6`, each `maxlength=1`, `inputmode="numeric"`, and labelled "digit 1" to "digit 6". The field label ("Verification code" or "Authentication code") points at the first.
- `obCodeNext` moves focus to the next box once a box has a value. `obCodeBack` moves focus to the previous box when Backspace is pressed in an empty one.
- The demo prefills the code so the flow can be walked without typing. In the error state the boxes are empty.
- The mockup does not handle a pasted code. The build must accept a six-digit paste into any box, spread it across the six, and move focus to the submit button.
- The build must accept digits only.

### States
- **Error**: the boxes are empty and the red message sits above the form.
- **Mobile**: the six boxes stay on one row and shrink to fit, 48 px tall with 5 px gaps.
