# Agent profiles and first prompt

Approved in the side conversation on September 23, 2026. This isolated v5 preview adds to the machine-first onboarding wireframe without editing its active source files.

Open `http://localhost:3310/mock/mockups/approved-profile-flow/index.html`.

## Behavior

- Suggest the first prompt from known workspace, harness, and selected profile information. Offer Edit prompt and Use suggested prompt. Preserve customized text when the profile changes.
- Copying, editing, launching the harness, and elapsed time do not complete registration.
- Require a matching machine and harness connection plus a first-run receipt bound to the setup request. Prompt wording is editable and is not the authentication mechanism. Reject stale, replayed, or unrelated receipts in the product implementation.
- After both receipts arrive, announce a five-second countdown beside Launch Mission Control. Allow immediate navigation and pausing. Moving to the Profiles preview pauses the countdown.
- Steering has a Profiles tab. Each profile supplies instructions added to the prompt and an optional default toolbelt. Selecting a profile initially suggests its default. Changing or saving a profile does not silently replace an agent’s chosen toolbelt.
- An agent may select another permitted toolbelt. A profile does not grant permissions or replace the agent’s IAM principal or responsible operator.

## Scope

The profiles, machine, connection events, and Fleet run are fixtures. This preview stores changes only in memory. It calls no product API, registers no agent, and writes no schema. The main thread’s onboarding files and frozen v4 remain untouched by this addition.

The product implementation must retain the existing tenant, operator, IAM, and governed configuration boundaries. Automatic drafting should use known configuration without requiring an extra model call. If a model is used, use Stella’s existing authorization and credit-metering path.
