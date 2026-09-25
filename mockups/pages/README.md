# mockups/pages: the spec of every page

One `.md` per page, hand-written, and the spec for the app build. Beside each, `<page>.audit-prompt.md`,
a prompt that audits a build of that page against it. `audit-prompt.md` audits the whole app. These
files describe `mockups/missioncontrol.html`, the authoritative design of rev1: what the product has
to have, to the spec, every last detail. They are what a build of rev1 is measured against, and what
says how far from done it is.

The first mockup, with the witness runner, proof, the definition of done and agent scores, is kept as
`mockups/future_state_mockups/` with its own `pages/`. It is not a target. Nothing in it is to be
built, and no issue is to be filed for it.

The rendered page lives in the master mockup, not here. Every page is a story in Storybook
(`npm run storybook`), with this spec on the page's Docs tab; the same view is a URL of
`mockups/missioncontrol.html` (`?product=1&state=<state>&mobile=<0|1>#<route>`). Which states a page
has is decided by `mockups/catalog.mjs`. A view the fleet operations wedge redesigned has the loaded
state only, in both shells, and a view with future-only fields has a third story that outlines them
(`?future=1`). A view the wedge left alone keeps the states its renderer in `mockups/src/engine.js`
branches on: the auth screens have no empty state, the installer has only loaded and an error, the
gate steps have loading and denied, and the first-run step an error.

| File | What it is |
|---|---|
| `<page>.md` | The page's spec: route, job, everything on it (header, tiles, tabs, tables with columns, dialogs), data sources (mockup collection → target store → what backs it today → status), functionality, every state's copy, mobile behaviour, permissions, backend gaps. |
| `<page>.audit-prompt.md` | A prompt to paste into an agent session that audits the built page against `<page>.md`, check by check, and reports PASS/FAIL with evidence. |
| `audit-prompt.md` | The whole-app prompt: shell, the approvals drawer, mobile shell, auth sequences, cross-cutting rules; it runs every per-page prompt. |

Pages (63): work-backlog · work-intake · work-item · work-orders · work-order · work-workflows ·
work-findings · run · run-transcript · run-cost · run-evidence · run-interjection · agents · agent ·
agent-identity · agent-steering · agent-toolbelt · agent-runtime · agent-permissions · agent-activity ·
agent-source · tools · tools-toolbelts · tools-providers · tools-policy · tools-switches · steering ·
steering-source · steering-source-skill · steering-assignments · steering-compiler · steering-proposals ·
steering-prs · runtimes · runtime · spend · spend-budgets · spend-optimization · repositories ·
repositories-copies · repositories-changes · repositories-config · approvals-drawer · stella-drawer ·
organization · organization-api-keys · organization-roles · billing · audit · register-name ·
register-wrap · register-run · signup · verify-email · login · two-factor · forgot-password ·
reset-password · accept-invitation · onboarding-organization · onboarding-wrap · onboarding-run ·
installer.

## The unique views

The first 44 pages are the unique views of the fleet operations wedge, one spec each.
`docs/fleet-operations-wedge.md` is the design authority, `docs/fleet-operations-ia.md` lists the
views with their routes, and `docs/fleet-operations-routes.md` says where every old route lands. What
the wedge deleted, and which spec took each deleted spec's content, is in
`docs/fleet-operations-collapse.md`.

- **Work** is the workspace root. `work-backlog`, `work-orders`, `work-workflows` and `work-findings`
  are its four tabs, `work-item` and `work-order` are one record each, and `work-intake` is the Intake
  dialog (providers, fields, people and the connection wizard). A run is a child execution record of
  its work order. The product spec of work items and work orders is `docs/tasks-spec.md`, written
  when Work was called Tasks, and `node tools/check-tasks.mjs` walks it.
- **A run** has four tabs: the Decision trace (`run`), `run-transcript`, `run-cost` and
  `run-evidence`. `run-interjection` is a run held for an answer.
- **Agents** is the population. `agent` is the Overview tab of one agent, and each other tab has its
  own spec. The mandate is Delegation on `agent-permissions`.
- **Tools** has five tabs, each with its own spec: Tools, Toolbelts, Providers, Policy and Kill
  switches.
- **Steering** has four areas: Sources (`steering`, with `steering-source` for one source and
  `steering-source-skill` for a skill's bundle), `steering-assignments`, `steering-compiler` and
  `steering-proposals`, with `steering-prs` for its pull requests.
- **Runtimes** is the host list, and `runtime` is one host.
- **Spend** is Overview, Budgets and Optimization.
- **Repositories** is the linked repositories, Working copies, Changes and Configuration.
- **The drawers.** `approvals-drawer` opens from the topbar on every page, `stella-drawer` from the
  foot of the sidebar. Neither is a page.

Every old address still resolves. The workspace root and `#/:org/:ws/tasks…` land on Work,
`mandates/<id>` on the agent's Delegation, `#/:org/:ws/skills…` on Sources filtered to skills, the
Library shelves on Sources filtered to their kind, `/steering/gates` and `/steering/policy` on
Tools › Policy, and `/steering/preview/<agent>` on the Compiler. The full table is
`docs/fleet-operations-routes.md`.

## Creation

The five creation wizards (agent, tool, skill, Steering record, and the `.oxagen/` directory itself)
are dialogs rather than pages, so they have no `<page>.md`. Their spec is `docs/creation-spec.md`.
Each ends on a pull request: the record wizard opens `steering-prs` with it selected, and the others
list theirs on `repositories-changes`. The editing half is `steering-source` for a published record
and `steering-source-skill` for a skill.

## What the design assumes

Every phase of the plan (0 to 5) has shipped. The tier ladder is complete (`observe`, `harness`,
`gateway`, `contained`), and most agents run `gateway` with observed metering. Token accounting
follows spec §12.6. Every runtime input an agent receives is a SteeringFrame resolved from a Steering
Source, and one resolver builds the Compiler, the agent's Steering tab and the Decision trace.
Approvals live in a drawer opened from the topbar on every page. The governance mode is a workspace
setting on the Steering header. Fields the platform does not record yet are marked future-only on the
page, and each spec names them.

Not in the design: the witness runner, proof, the definition of done, agent scores, proven spend, the
Fleet page, the Tasks page, the mandate page, the skills console and skill reflection, the Library
shelves, the Memory, Ontology and Gates tabs, fork replay, bisect, the frame player, spend drill pages,
and any operator score or rank.

## Rules

Headings and labels on every page follow one rule: a heading names the thing, a caption states one
fact, and no label carries a comma, a mid-dot, or a "not / never" contrast. Subtext under a heading
is one sentence or nothing.

Guards: `node tools/build-mockup.mjs --check` (the master is what the sources produce) and
`node tools/check-mockup.mjs` (every page renders in every state in either shell, with no mockup
chrome and no JavaScript error; every scenario walks). See `tools/README.md`.
