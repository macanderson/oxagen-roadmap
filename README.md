# Oxagen Mission Control: the mockups and the documents

One master mockup, one documents page, and the sources both are built from.

```
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
and states exist is `mockups/catalog.mjs`, which the stories and the checker both read.

## The scenarios

| # | Scenario | Story |
|---|---|---|
| W1 | Sixty seconds to governed | `sixty-seconds-to-governed` |
| W2 | Stop it. Steer it. | `stop-it-steer-it` |
| W3 | Money asked, a human answered | `money-asked` |
| W4 | The flight recorder | `flight-recorder` |
| W5 | Proven, not claimed | `proven-not-claimed` |
| W6 | It learned, you approved, it changed | `learned-approved-changed` |
| W8 | Every dollar, every operator | `every-dollar-every-operator` |
| W9 | The toolbelt, governed | `toolbelt-governed` |
| W10 | The CIO's console | `cio-console` |
| W11 | Whose account it is | `the-account` |
| W13 | In the loop: skills ship off, the search is the config, and an unbound repository stops the loop to ask a person | `in-the-loop` |
| W14 | Done means done | `done-means-done` |

W7 (the ontology) and the assistant half of W11 were cut by the scope review of 2026-09-14
(`docs/scope-review.md`); W12 was a coverage audit, now `tools/check-mockup.mjs`. W13 is the Skills
page (`#/a-intel/<ws>/skills`), its off-by-default gate and the interjected run; it is not in the spec
yet (`docs/w13-in-the-loop-scenario.md`). W14 is the
definition of done (`docs/dod-spec.md`). A scenario is `SCENARIOS["id"]` in `mockups/src/engine.js`
and a row in `mockups/catalog.mjs`. `docs/videos-mockup-narrated.md` has the narrated walkthroughs.

## The documents

`docs/missioncontrol-docs.html` is every document in `docs/` on one page, with a rail of documents and
a contents rail per document; a section has a link (`#spec/8-6-definition-of-done`). It is built by
`python3 tools/build-docs.py` (needs `markdown-it-py`); the markdown is the source.

- `mission-control-spec.md`: the product and technical specification the mockups render
- `dod-spec.md`: the definition of done for agent runs, which gates a run and is the billable unit
- `witness-spec.md`: Witness, outcome verification: fourteen deterministic oracle classes, signed certificates, a verify endpoint
- `desktop-spec.md`: the Oxagen Desktop installer
- `implementation-plan.md`: how the pages become the Next.js `apps/app` in the oxagen monorepo
- `scope-review.md`: the review of 2026-09-14, what it cut and where each cut landed
- `demo-mockup-prompts.md`, `consolidation.md`, `feedback-mockups.md`, `videos-mockup-narrated.md`, `w13-in-the-loop-scenario.md`: how the mockups were made and reviewed

The spec, the plan and the desktop spec are also carried in the oxagen monorepo under
`docs/specs/`; when one copy changes, change the other.

## The verification badge

`badges/` holds the badge a pull request or branch carries once Oxagen has looked at it, one SVG
per state and theme, generated by `node tools/build-badges.mjs` (`--check` guards drift). The words are
the spec's closed vocabularies (§8.5 verdicts, §8.3 attestation), never a stronger one. Open
`badges/index.html` for the sheet and the embed snippet.

## The guards

```sh
npm run build   # build-mockup, build-stories, build-docs, build-badges
npm run check   # the three --check runs, then tools/check-mockup.mjs in Chromium
```

`tools/README.md` says what each checks and what to watch for.


## Docs site

`site/` is the internal documentation site: a Next.js and Fumadocs app that renders the repo's
markdown where it lives and links every section to its mocked page, audit prompt, spec section and
plan section. Nothing in `site/` holds prose of its own.

```sh
pnpm -C site install   # dependencies, then the prepare step and the Fumadocs source index
pnpm -C site dev       # http://localhost:3310, with the prepare step run first
pnpm -C site build     # static export to site/out, Storybook catalog included, hostable on any static file server
```

| Source (committed) | What the site makes of it |
|---|---|
| `docs/walkthrough.md` | The home page and first sidebar entry. |
| `mockups/pages/<page>.md` | One page per spec, grouped Workspace, Organization, Auth & onboarding in `mockups/pages/README.md` order, each with a Mocked page panel (state tabs, Desktop and Mobile, each a URL of `mockups/missioncontrol.html`) and links to its audit prompt, the walkthrough sections that cover it, their spec and plan links, and the scenarios that visit it. |
| `mockups/pages/*.audit-prompt.md`, `mockups/pages/audit-prompt.md` | Audit prompts. |
| `docs/*.md` | Specs & plans: the spec, the implementation plan, the definition of done, the scope review, the witness spec, the desktop spec, the demo prompts, the scale-back prompt, the W13 scenario doc. |
| `mockups/catalog.mjs` | Every page's route and states, and the scenarios in W order. |
| `SCENARIOS` in `mockups/src/engine.js` (with `mockups/fixtures`) | One outline per scenario: its steps, the page each step routes to, and a link to each step inside the mockup. |
| `mockups/missioncontrol.html`, `docs/*.html`, `docs/_house`, `badges` | Served unchanged under `/mock/`. The Mocked page panel and its Open full page link are `/mock/mockups/missioncontrol.html?product=1&state=<state>&mobile=<0\|1>&theme=<light\|dark>#<route>`, with the theme following the site's. |
| `storybook-static/` (from `npm run build-storybook`) | Copied to `site/out/storybook/` by `site/scripts/catalog.mjs`, the last step of `pnpm -C site build`, which runs `npm ci` at the repo root first when the root dependencies are absent. Specs & plans ends with a Catalog link to `/storybook/`. |

Generated and gitignored: `site/public/mock/` (the HTML copied by `site/scripts/prepare.mjs`),
`site/.generated/` (scenario outlines from `site/scripts/gen-scenarios.mjs`, the scenarios and
rendered-HTML indexes, `manifest.json`, and a walkthrough stub while `docs/walkthrough.md` is
absent), `site/.source/` (the Fumadocs index), `site/.next/` and `site/out/`. The markdown carries
no frontmatter: a page's title is its first heading and its description its first paragraph.
