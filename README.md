# Oxagen Mission Control — mockups

Every mockup is a single self-contained HTML file. Open it in a browser, or serve
the folder (`python3 -m http.server`) and browse to it. Each file carries its own
mockup chrome (states, phone width, theme) in the corner; that chrome is not product UI.

The demo record is the same everywhere: Anderson Intelligence Corp. (`a-intel`), workspace
`core-platform`, operator Marcus Bell.

## The showboat

| File | What it is |
|---|---|
| `mc.html` | **The Ten Pages.** The full end-to-end demo: every page of Mission Control with the strongest version of each component from W1–W11, plus the onboarding flow. Start here. |
| `consolidated.html` | The simple one-file consolidation of W1–W11 (see `docs/CONSOLIDATION.md` for what won and why). |

### Onboarding inside `mc.html`

The W1 pre-app screens live in `mc.html` at `#/welcome…` and are reachable three ways:

- **Account dialog → Onboarding tab** (avatar in the sidebar → Account → Onboarding): every step with an Open button, and "Start from sign-up".
- **User menu → Onboarding demo.**
- **⌘K → "Onboarding demo — sign up" / "— log in".**

The path is sign up → verify email → name the organization → wrap an agent → start a run.
The gate steps reuse the Register Agent components Fleet already uses, so the wrap
and first-frame panels are the same code. Log in, two-factor, forgot/reset password
and accept-invitation are in the set too. "Exit demo" on any screen returns to Fleet.
Nothing on these screens writes anything; it is clickable demo chrome and is not
meant to ship in the live app.

## One flow per file (W1–W12)

| # | File | Title | Published |
|---|---|---|---|
| W1 | `w1-sixty-seconds-to-governed.html` | Sixty Seconds to Governed | [artifact](https://claude.ai/code/artifact/31579436-1abf-48f8-b320-8740c4029b0f) |
| W2 | `w2-stop-it-steer-it.html` | Stop It. Steer It. | [artifact](https://claude.ai/code/artifact/0b3eae2f-4fd9-45a5-b667-e04367999d1d) |
| W3 | `w3-money-asked.html` | Money Asked, A Human Answered | [artifact](https://claude.ai/code/artifact/9a8bcd5c-c66c-462d-992a-a449679801ce) |
| W4 | `w4-flight-recorder.html` | Oxagen Flight Recorder | [artifact](https://claude.ai/code/artifact/a4b69d0b-715c-434c-9f4e-80534bf2e462) |
| W5 | `w5-proven-not-claimed.html` | Proven, Not Claimed | [artifact](https://claude.ai/code/artifact/81725124-b936-4cbb-9e40-79089b5a1e35) |
| W6 | `w6-learned-approved-changed.html` | It learned, you approved, it changed | [artifact](https://claude.ai/code/artifact/2bbadccb-92ff-4ade-8f6d-704d9c66dafe) |
| W7 | `w7-shape-of-your-business.html` | The shape of your business | [artifact](https://claude.ai/code/artifact/8692f683-0eab-4a1f-ad66-20f4a1a2db5b) |
| W8 | `w8-every-dollar-every-operator.html` | Every Dollar, Every Operator | [artifact](https://claude.ai/code/artifact/6a15975f-6719-4b4c-aae5-4b942dea0bb1) |
| W9 | `w9-toolbelt-governed.html` | The Toolbelt, Governed | [artifact](https://claude.ai/code/artifact/c16a2951-1a79-4c70-b202-ec405c0563dc) |
| W10 | `w10-cio-console.html` | The CIO's Console | [artifact](https://claude.ai/code/artifact/403166f6-9216-4d23-86ac-bb3c2aa60b23) |
| W11 | `w11-assistant-and-account.html` | The Assistant on Every Page, and the Account | [artifact](https://claude.ai/code/artifact/317226a1-c2ff-43ce-a439-4a54f8b8288b) |
| W12 | `w12-coverage-audit.html` | Coverage Audit | [artifact](https://claude.ai/code/artifact/45c5e3f9-82f0-404e-ad69-b3279d84c649) |

`mc.html` is published as [The Ten Pages](https://claude.ai/code/artifact/3fcf949a-c455-4efd-af36-1c2d1f13088e);
`consolidated.html` as [Oxagen Mission Control](https://claude.ai/code/artifact/25a71da8-dc9d-49b6-b57d-9240da40310e).

## Docs

- `docs/2026-09-11-oxagen-mission-control-spec.md` — the product and technical specification the mockups render: vocabulary, architecture, the ten pages (§14, App. F), target tables (App. A) and the demo scenarios (§19).
- `docs/2026-09-12-mission-control-app-implementation-plan.md` — how the ten pages become the new Next.js `apps/app` in the oxagen monorepo: wireframe review, page-to-data mapping, toolchain, code, and parallel build batches.
- `docs/2026-09-11-oxagen-demo-mockup-prompts.md` — the brief and the one-prompt-per-flow list that produced W1–W12.
- `docs/CONSOLIDATION.md` — how W1–W11 were folded into one design; which version of each shared thing won.
- `docs/feedback-mockups.md` — review feedback on the set.
- `docs/videos-mockup-narrated.md` — narrated walkthrough links.
