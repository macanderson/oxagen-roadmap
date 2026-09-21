# mockups/pages: the spec of every page

One `.md` per page, hand-written, and the spec for the app build. Beside each, `<page>.audit-prompt.md`,
a prompt that audits a build of that page against it. `audit-prompt.md` audits the whole app. These
files describe `mockups/missioncontrol.html`, the authoritative design of rev1: what the product has
to have, to the spec, every last detail. They are what a build of rev1 is measured against, and what
says how far from done it is.

The first mockup, with the witness runner, proof, the definition of done and agent scores, is kept as
`mockups/future_state_mockups/` with its own `pages/`. It is not a target. Nothing in it is to be
built, and no issue is to be filed for it.

The rendered page lives in the master mockup, not here. Every page in every state, desktop and
mobile, is a story in Storybook (`npm run storybook`), with this spec on the page's Docs tab; the same
view is a URL of `mockups/missioncontrol.html` (`?product=1&state=<state>&mobile=<0|1>#<route>`).
Which states a page has is decided by `mockups/catalog.mjs`, which reads what the renderer in
`mockups/src/engine.js` branches on: the auth screens have no empty state, the installer has only
loaded, the gate steps have loading and denied, and the first-run step an error.

| File | What it is |
|---|---|
| `<page>.md` | The page's spec: route, job, everything on it (header, tiles, tabs, tables with columns, dialogs), data sources (mockup collection → target store → what backs it today → status), functionality, every state's copy, mobile behaviour, permissions, backend gaps. |
| `<page>.audit-prompt.md` | A prompt to paste into an agent session that audits the built page against `<page>.md`, check by check, and reports PASS/FAIL with evidence. |
| `audit-prompt.md` | The whole-app prompt: shell, the approvals drawer, mobile shell, auth sequences, cross-cutting rules; it runs every per-page prompt. |

Pages (39): fleet · run · run-interjection · agents · agent · agent-source · mandate · tools ·
steering · skills · skills-off · skill-source · steering-memory · steering-ontology · steering-policy ·
steering-proposals · steering-preview · record · repositories · spend · organization ·
organization-api-keys · organization-roles · billing · audit ·
register-name · register-wrap · register-run · signup · verify-email · login · two-factor ·
forgot-password · reset-password · accept-invitation · onboarding-organization · onboarding-wrap ·
onboarding-run · installer.

What the design assumes: every phase of the plan (0 to 5) has shipped. Steering is the hub with seven
tabs (Records, Skills, Memory, Ontology, Policy, Proposals, Preview) and one assembler; the tier ladder
is complete (`observe`, `harness`, `gateway`, `contained`) and most agents run `gateway` with observed
metering; token accounting follows spec §12.6; coaching derives from the token record; approvals live
in a drawer opened from the topbar on every page; the governance mode is a workspace setting on the
Steering header. Not in the design: the witness runner, proof, the definition of done, agent scores,
proven spend.

`steering.md` specifies the hub and Records. `skills.md`, `skills-off.md` and `skill-source.md` are
the Skills tab, which has no nav entry of its own (the old `#/:org/:ws/skills…` routes still resolve).
The other five tabs have a spec each.

The five creation wizards (agent, tool, skill, context record, and the `.oxagen/` directory itself)
are dialogs rather than pages, so they have no `<page>.md`; their spec is `docs/creation-spec.md`, and
the three pages they end at (`record`, `skill-source` and `repositories`) are specified here.

Headings and labels on every page follow one rule: a heading names the thing, a caption states one
fact, and no label carries a comma, a mid-dot, or a "not / never" contrast. Subtext under a heading
is one sentence or nothing.

Guards: `node tools/build-mockup.mjs --check` (the master is what the sources produce) and
`node tools/check-mockup.mjs` (every page renders in every state in either shell, with no mockup
chrome and no JavaScript error; every scenario walks). See `tools/README.md`.
