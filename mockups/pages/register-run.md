# Harness registration

The third step includes harness selection, the test prompt, and the success countdown.

[Open the interactive wireframe](../missioncontrol.html#/a-intel/core-platform/register/harness).

## Approval boundary

This is the v5 proposal requested on September 22, 2026. It requires Mac’s approval before the product implements this onboarding flow. The existing v4 snapshot is unchanged. The wireframe simulates receipts, software versions, and harness detection. Its timers do not represent backend verification.

## Shared sequence

1. Enroll the machine. Connection, device identity, and server enrollment checks turn green with a checkmark and status text. Advance when all three are verified.
2. Check Tacho and Oxagen separately. Show installed and latest versions, with Install or Upgrade for either tool. Advance only after the machine reports both current versions.
3. Detect harnesses on that machine. Show SVG marks, versions, paths, and registration state. Select an unregistered harness, name the agent, and assign its responsible human operator. Open that harness and submit the displayed test prompt. Keep registration pending until the server correlates the resulting run to this organization, workspace, machine, harness, and setup request. Activity from another harness or an old run cannot complete setup.
4. Show registration success and the received run. Beside **Launch Mission Control**, announce: “Mission Control opens in 5 seconds. Your run will be visible in Fleet.” Count down, allow Pause countdown, and let the button navigate immediately. Fleet shows that received run.

Machine enrollment persists independently of agent registration. Save and exit preserves completed enrollment and installed software. Retrying an installation preserves the other tool. The UI does not claim to remove local software when someone exits.

## Wireframe controls

Open **Preview controls** to inspect a connection failure, upgrade failure, no detected harnesses, already registered harnesses, or a pending test. The separate **Preview matching run received** button simulates the server signal. It is a design-review control, not a product action.

## Implementation conditions

- Start machine enrollment through a small local enrollment helper before requiring either full CLI installation. Its download and launch transport need implementation after approval. A browser alone cannot attest a machine.
- Reuse the approved runtime and harness IAM identities. Confirm the device key for an existing enrollment. Do not deduplicate by hostname.
- The displayed software versions are fixtures. Production must use the release manifest and the machine’s reports, with a retry state when either is unavailable.
- The responsible operator is explicit and editable. A machine’s operating-system username is not the operator.
- The first test prompt is a connection check. Its receipt does not prove governance enforcement or the truth of agent output.
- Match the test run with a scoped, expiring enrollment reference, not a free-text substring alone. Reject stale, replayed, foreign-machine, and wrong-harness receipts.
- Keep the existing organization setup before this shared machine-first sequence. Both onboarding and Register an agent use the same sequence.
- Light and dark themes use retained SVG brand variants. Unknown harnesses keep their names and a neutral icon. Green checks also carry shape and text.
- Mobile stacks the software cards and harness actions. Inputs and buttons remain usable without horizontal scrolling.

## Verification for approval

Check the normal flow, each tool upgraded independently, failed enrollment, failed upgrade, absent harnesses, registered harnesses, wrong or missing test signal, countdown pause, immediate navigation, and dark/light mobile layouts before implementing the proposal.
