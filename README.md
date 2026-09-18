# Oxagen product roadmap

One place to see what Oxagen is building next, exactly how it will look, and what is still undecided.

- **The roadmap app** (`index.html`, built from `roadmap/`): the gaps between the Mission Control mockups and the build, the witness and definition-of-done features, the open decisions, and the GitHub issues, live. Published as a claude.ai artifact where Claude is bound to the page, and served by GitHub Pages at https://oxagenai.github.io/roadmap/ as a read-only fallback.
- **The mockups** (`mockups/`): the master mockup, every page in every state, desktop and mobile, and the guided scenarios. The roadmap frames them, so a card leads to its wireframe in one click.
- **The documents** (`docs/`): the Mission Control spec, the DoD spec, the witness spec, the desktop spec, the plan, the scope review, and the reviews.

```
index.html                    the roadmap app, ONE file: built from roadmap/app.html + roadmap/data.json (edit those, never this)
roadmap/app.html              the app: the pages, the Claude drawer, the GitHub wiring, the shared store
roadmap/data.json             the roadmap content: surfaces, witness, dod, decisions, milestones, the catalog, the issue triage snapshot
mockups/missioncontrol.html   the master: every page, dialog, auth screen and guided scenario, self-contained, open from disk
mockups/src/                  its sources: engine.js (the app), engine.css, shell.html
mockups/fixtures/*.json       the demo record, one file per collection (README.md there says what each is)
mockups/pages/<page>.md       the spec of every page, and beside each an audit prompt for a build of it
mockups/stories/              the Storybook catalog: every page × state × shell, every scenario
docs/missioncontrol-docs.html the documents page: every docs/*.md, one file
docs/*.md                     the spec, the DoD spec, the witness spec, the desktop spec, the plan, the scope review, the mockup records
badges/                       the verification badge for pull requests and branches, one SVG per state and theme
tools/                        the builds and the guards
```

The demo record is the same everywhere: Anderson Intelligence Corp. (`a-intel`), workspace
`core-platform`, operator Marcus Bell.

## The roadmap app

`index.html` is built by `node tools/build-roadmap.mjs` from `roadmap/app.html` and `roadmap/data.json`;
`--check` says whether the three agree, and `npm run check` runs it with the other guards.

What the app does, and where each part lives:

| Page | What it shows | Source of truth |
|---|---|---|
| Now | build progress by surface, the milestones, what to build next, the decisions blocking work, shared activity | `data.json` + the shared store |
| Gaps | every mockup page and wizard with its build status, the concrete gaps, the backend gaps, the spec, the wireframe, the linked issues | `data.json` `surfaces[]`, the mockup pages' specs |
| Witness, Done | the proof and definition-of-done features, and which ones need a decision first | `docs/witness-spec.md`, `docs/dod-spec.md` |
| Decisions | each open question with its recommendation; decide it in place, argue it with Claude, or open it as an issue | `docs/implementation-plan.md` §6, the scope review, the feedback |
| Issues | open issues in `oxagenai/oxagen`, `oxagenai/stella` and this repo, live through the viewer's GitHub connector, with the triage snapshot (theme, kind, spec backing) beside each | GitHub, `data.json` `issue_annotations` |
| Wireframes | the master mockup framed: any page, any state, desktop or phone, any scenario | `mockups/missioncontrol.html` |
| Specs | the documents, on GitHub and framed | `docs/missioncontrol-docs.html` |

In the claude.ai artifact the page gains what a static file cannot have:

- **Claude, bound to the page.** The drawer asks on the viewer's own account, Opus-class by default. It reads the roadmap through page tools (`get_roadmap_overview`, `get_item`, `list_open_issues`) and, when asked, changes it (`update_item`, `record_decision`, `link_issue`). `create_issue` only opens the confirmation dialog: nothing reaches GitHub until the viewer clicks.
- **A shared store.** Status, priority, owner, notes, linked issues and decisions are kept per item in the artifact's database, so an edit by one person is what everyone sees, and Claude sessions can read and write the same rows.
- **GitHub, live.** Issue lists refresh every two minutes; creating an issue from a gap or a decision uses the viewer's own GitHub credentials. Without the connector (GitHub Pages, a saved file) the page falls back to the triage snapshot and pre-filled "new issue" links.
- **Comments.** Every card and detail has a Comment button that opens the claude.ai composer, so a thread can be sent to Claude from the page itself.

### Refreshing the content

`roadmap/data.json` is the roadmap's content. It was assembled on 2026-09-17 from a page-by-page comparison of `mockups/pages/*.md` against `apps/app` in `oxagenai/oxagen`, the witness and DoD specs, the plan's open decisions, and a triage of every open issue in `oxagenai/oxagen` and `oxagenai/stella`. To refresh it, redo that comparison (an agent session with both repos checked out does it in minutes) and write the same shape; then `node tools/build-roadmap.mjs` and republish the artifact. Overrides made in the app live in the shared store and survive a rebuild.

## The master

`mockups/missioncontrol.html` is built by `node tools/build-mockup.mjs` from `mockups/src` and
`mockups/fixtures`; **edit the sources, not the built file**, and `--check` says whether the two agree.
Everything a URL of it pins is read at runtime, so there is one file where there used to be 254:

| URL | What it shows |
|---|---|
| `missioncontrol.html` | the design with the mockup chrome: the state bar, the phone preview, the theme toggle, the Scenarios nav item, the onboarding demo |
| `?product=1` | the product build: no chrome |
| `?product=1&state=loaded&mobile=0` | the product, pinned to the loaded state and the desktop shell |
| `?product=1&state=loaded&mobile=1` | the same in the mobile shell: a five-slot thumb bar, a More sheet, dialogs as bottom sheets, list tables as cards |
| `?state=empty#/a-intel/core-platform/tools` | one page in one state; the states are `loaded`, `empty`, `loading`, `error`, `denied` |
| `#/a-intel/core-platform/scenarios/flight-recorder/1` | a guided scenario (the W flows) on step 1 |
| `#/a-intel/core-platform/runs/run_01K5RQ4B9C7XTN2P/dod` | a run tab by hash |
| `?theme=dark` | pinned theme |

The onboarding screens live at `#/welcome…` and are reachable from the Account dialog's Onboarding
tab, the user menu, and ⌘K. Nothing on them writes anything.

## The catalog

```sh
npm install
npm run storybook        # every page in every state, desktop and mobile; every scenario
npm run build-storybook  # a static site in storybook-static/
```

Storybook frames URLs of the master. Each page's stories are one per state, desktop and mobile, with
controls for the state, the shell (a 390×844 phone frame), the theme and the chrome; the page's
`mockups/pages/<page>.md` spec is on its Docs tab. The dev server assembles the master from the
sources on every request (`.storybook/mockup-plugin.mjs`), so an edit shows on reload. Which pages
and states exist is `mockups/catalog.mjs`, which the stories, the checker and the roadmap app all read.

## Guards

`npm run check` builds nothing and fails if any built file is stale or any page fails to render:
the roadmap app, the master, the stories, the documents page, the badges, then the mockup, creation,
assistant and record checks. See `tools/README.md`.
