# Oxagen product roadmap

One place to see what Oxagen is building next, exactly how it will look, and what is still undecided.

- **The roadmap app** (`index.html`, built from `roadmap/`): the gaps between the Mission Control mockups and the build, the witness and definition-of-done features, the open decisions, and the GitHub issues, live. Published as a claude.ai artifact where Claude is bound to the page, and served by GitHub Pages at https://macanderson.github.io/roadmap/ as a read-only fallback.
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
| Issues | open issues in `macanderson/oxagen`, `macanderson/stella` and this repo, live through the viewer's GitHub connector, with the triage snapshot (theme, kind, spec backing) beside each | GitHub, `data.json` `issue_annotations` |
| Wireframes | the master mockup framed: any page, any state, desktop or phone, any scenario | `mockups/missioncontrol.html` |
| Specs | the documents, on GitHub and framed | `docs/missioncontrol-docs.html` |

In the claude.ai artifact the page gains what a static file cannot have:

- **Claude, bound to the page.** The drawer asks on the viewer's own account, Opus-class by default. It reads the roadmap through page tools (`get_roadmap_overview`, `get_item`, `list_open_issues`) and, when asked, changes it (`update_item`, `record_decision`, `link_issue`). `create_issue` only opens the confirmation dialog: nothing reaches GitHub until the viewer clicks.
- **A shared store.** Status, priority, owner, notes, linked issues and decisions are kept per item in the artifact's database, so an edit by one person is what everyone sees, and Claude sessions can read and write the same rows.
- **GitHub, live.** Issue lists refresh every two minutes; creating an issue from a gap or a decision uses the viewer's own GitHub credentials. Without the connector (GitHub Pages, a saved file) the page falls back to the triage snapshot and pre-filled "new issue" links.
- **Comments.** Every card and detail has a Comment button that opens the claude.ai composer, so a thread can be sent to Claude from the page itself.

### Hosted on Vercel

The public home is **https://oxagen-roadmap.vercel.app** (Vercel project `oxagen-roadmap`). The same `index.html` runs there in hosted mode: it asks `/api/config` what the deployment can do and uses that instead of the claude.ai capabilities.

| Piece | Hosted mode | Who can use it |
|---|---|---|
| Roadmap, wireframes, specs | static files from this repo | everyone |
| GitHub issues | GitHub's public REST API, read in the browser every ten minutes; creating an issue opens GitHub's pre-filled form | everyone |
| Shared state (status, priority, owner, notes, links, decisions, activity) | `api/state.js`, one private Vercel Blob (`roadmap/state.json`) | everyone reads; the **edit key** writes |
| Claude | `api/ask.js`: one streamed round per call with the Anthropic SDK (Opus by default; the drawer's tier picks Sonnet or Haiku); the page runs the tool loop because the tools are page functions | the **edit key**, so a public link cannot spend the API key |

Environment variables: `BLOB_READ_WRITE_TOKEN` (set by `vercel blob create-store`), `EDIT_KEY` (a random string; enter it once behind the page's **Edit key** button), and `ANTHROPIC_API_KEY` (add it to turn Claude on: `vercel env add ANTHROPIC_API_KEY production`, then redeploy). Deploy with `vercel deploy --prod`; the build step is `node tools/build-roadmap.mjs --check`, so a stale `index.html` fails the deploy.

### Refreshing the content

`roadmap/data.json` is the roadmap's content. It was assembled on 2026-09-17 from a page-by-page comparison of `mockups/pages/*.md` against `apps/app` in `macanderson/oxagen`, the witness and DoD specs, the plan's open decisions, and a triage of every open issue in `macanderson/oxagen` and `macanderson/stella`. To refresh it, redo that comparison (an agent session with both repos checked out does it in minutes) and write the same shape; then `node tools/build-roadmap.mjs` and republish the artifact. Overrides made in the app live in the shared store and survive a rebuild.

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
| `#/a-intel/core-platform/steering/preview/release-manager` | a Steering tab by hash: `records`, `skills[/<view>]`, `memory`, `ontology`, `policy`, `proposals[/prs]`, `preview[/<agent>]` |
| `#/a-intel/core-platform/skills` | an old route: Skills moved under Steering, and this still resolves to `…/steering/skills` |
| `?theme=dark` | pinned theme |

The onboarding screens live at `#/welcome…` and are reachable from the Account dialog's Onboarding
tab, the user menu, and ⌘K. Nothing on them writes anything.

## What the mockups depict

Phase 2 of the steering and gateway plan, shipped. Steering is the hub: seven tabs (Records, Skills,
Memory, Ontology, Policy, Proposals, Preview), one assembler where every item competes, and a
`steering.manifest` frame on every run. Agents sit on the `observe` or `harness` tier. `gateway` and
`contained` are on the tier ladder as tiers not yet available, and no screen claims a model proxy,
observed metering, an enforced budget, a real interrupt, or a sandbox. The index is the Postgres
registry. `mockups/pages/steering.md` is the spec of the hub.

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
(`docs/scope-review.md`); W12 was a coverage audit, now `tools/check-mockup.mjs`. W6 walks Steering:
Records, Proposals, the pull request, the merge, Preview, and the `steering.manifest` frame on the
run. W13 is the Skills tab of Steering (`#/a-intel/<ws>/steering/skills`; Skills moved under Steering
on 2026-09-18), its off-by-default gate and the interjected run (`docs/w13-in-the-loop-scenario.md`,
spec §10.6). W14 is the
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
- `agent-portability-atlas.md`: an inventory of how Claude Code, Cursor and Codex store agents, skills and memory on disk — where the schemas match, where they don't, and the gap in Oxagen's own agent/skill/memory capabilities against delivering any of the three in another harness's native format. [Interactive version.](https://claude.ai/artifact/YYawKKCKLASpWHcegLyXpC)

The spec, the plan and the desktop spec are also carried in the oxagen monorepo under
`docs/specs/`. For the spec and the plan, this repository's copy is canonical and the oxagen copy
is carried for build agents. For the desktop spec, the oxagen copy is canonical and newer. No
build step joins them, so a change is made in both by hand, in the same change set, and each file's
header names the sections that are identical in both and the ones that still differ.
`docs/reviews/` holds dated reviews as records; they are not on the documents page.

## The verification badge

`badges/` holds the badge a pull request or branch carries once Oxagen has looked at it, one SVG
per state and theme, generated by `node tools/build-badges.mjs` (`--check` guards drift). The words are
the spec's closed vocabularies (§8.5 verdicts, §8.3 attestation), never a stronger one. Open
`badges/index.html` for the sheet and the embed snippet.

## The guards

```sh
npm run build   # build-mockup, build-stories, build-docs, build-badges
npm run check   # the four --check runs, then check-mockup.mjs and check-creation.mjs in Chromium
```

`npm run check` builds nothing and fails if any built file is stale or any page fails to render:
the roadmap app, the master, the stories, the documents page, the badges, then the mockup, creation,
assistant and record checks. `tools/README.md` says what each checks and what to watch for.

## Creating things

Four things an operator creates — an agent, a tool, a skill and a context record — and one shape
for all four, because all four are a file in a repository: describe it, Oxagen drafts the file, you
read the file, a pull request publishes it. Nothing in it writes a row. `docs/creation-spec.md` is
the spec; the wizards are `DLG_EXT.wz` in `mockups/src/engine.js` and reached from `Create` in ⌘K
and from each page's own action. The tool wizard matches a description against the MCP servers
Oxagen can already reach (`mockups/fixtures/mcp-catalog.json`) and offers to import before it offers
to generate a handler in TypeScript, Python, Go or Rust. The skill wizard searches the registry
(`mockups/fixtures/skill-registry.json`), drafts from prose, or takes a `.skill` bundle that
replaces a pinned version. Two pages carry the editing half: `record` (a published record, presented
by its kind, with its statement in a real editor) and `skill-source`.


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
