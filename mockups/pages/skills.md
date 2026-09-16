# Skills

| | |
|---|---|
| Route | `#/a-intel/core-platform/skills[/<tab>]` |
| Scope | workspace |
| Spec | not yet in `docs/mission-control-spec.md` — see `docs/w13-in-the-loop-scenario.md` (§ 2 needs one sentence distinguishing *running* a skill from *resolving* one) |
| Design | `mockups/src/engine.js` → `pSkills()`. The off-by-default gate is `skills-off.md`; the interjected run is `run-interjection.md`. |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Mission Control / … / skills`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `skills.audit-prompt.md` |

## Job

Oxagen does not run a skill — the harness does. This page governs **resolution**: which skills the workspace's config (`.oxagen/skills.toml`) lets an agent find, which it may load, what that cost, and what was held back and why. It also shows the two things Oxagen does with its seat in the loop — interjecting (stopping a run to ask a person) and reflection (asking the agent to grade its own sealed run, quarantined) — and the config file's history, each version a pull request.

## What is on the page

**Header** — eyebrow “Workspace · <workspace name>”, h1 “Skills”, lede: “A skill is procedure written down: a file, in a repo, with a version and a digest. Oxagen does not run it — the harness does. What Oxagen governs is resolution…”. No header actions.

- **Tabs** (`/skills/<tab>`): Catalog (N in scope) · Search · In the loop (1 while an interjection is open) · Reflection (N axes) · Versions (N).
- **Catalog** — tiles: In scope here (N of M the sources hold) · Held back (N; scope, or an unapproved digest) · If all loaded (tokens · $ a turn) · Actually loaded (skills a run, median · the belt is searchable); note on the searchable belt vs the pinned belt before `skl_v4`; panel “Resolved by `skl_v7`” (**Open .oxagen/skills.toml** → `skcfg` dialog) listing each in-scope skill as a row: kind glyph · `id @version` · statement · optional note · chips (source · kind · tokens · digest prefix · cited in N of M runs · proof rate before → after) · decision badge (allowed / needs approval / denied) · updated · **Open** (→ `skill` dialog); panel “Held back — these do not appear in a search, at any rank” with the same row shape plus “Why it is held”, and the note that a held skill is not a low-scoring result and the agent is told the count and reason class, never the name.
- **Search** — the `search_skills(…)` console: note “This is not a search box for you…”; input pre-filled with `cut the first release notes`; **Ask as the agent** (Enter also runs it); result header (N returned · N withheld · `skl_v7 · top 5 · min 0.42`); a hit row per result (`id @version` · statement · chips source/tokens/decision · score); a withheld row per withholding (struck-through id · `out_of_scope` / `unapproved_digest` chip · why · “The agent is told `withheld: 1` and the reason class. It is not told this name.”); an empty result renders `[]` with a reason, never an error; “try:” chips for the five canned queries; panel “What decided this” (Config · Sources on · Belt mode · Cut-off · Load budget · Unbound repo); panel “The frame this wrote” (`skills.searched` as a key/value block: query, config, returned, withheld, reasons, cost, grade) and the replay note (replay resolves `skl_v7`, not today's config).
- **In the loop** — note “Oxagen sits between the harness and the model…”; tiles: Interjections, 30 days · Median answer · On timeout (`deny`) · Open now; while open, a gold panel “A run is waiting on you” (**Open the run and answer it** → `run-interjection`); once answered, “Nothing is waiting” with the answer, a link to the run, and **reset the demo**; two panels: “What the seat is allowed to do” (Ask a person a question · Stop before a guess · Ask the agent to reflect · Record what it did) and “What it is not allowed to do” (Rewrite what the agent said · Answer on the operator's behalf · Feed a reflection back into the work · Hide that it happened).
- **Reflection** — note “Research only, and the file says so” (`use = "research"` is the only accepted value); tiles: Sampled (20% plus every failing and tampered run) · Captured, 30 days · Cost (billed as overhead, never as productive) · Calibration gap (axes where the agent scored itself above the record); panel “The turn that was injected”: four frames, `run.sealed` solid then `control.reflect` · `model.request` · `reflection.captured` **dashed** (out of band, after the seal, not replayed on a fork); panel “What it said about itself”: four rubric axes, each with a self bar, a record bar, the agent's quote and “the record says: …”, the two disagreeing axes flagged “calibration gap”, and two contradiction cards citing the frame (`frame 171 · proof.observed`, `frame 96 · tool_call`); the **Quarantine** box with the five rules (never enters a context frame · cannot be promoted · does not price the work · is not evidence about a person · expires) and consent chips (`use = research` · consent: organization · retain 180 days), **Turn capture off**, **Export for research** (denied without `research.read`).
- **Versions** — note that the config lives in the main repo on its production branch; panel with the rendered `.oxagen/skills.toml` (`enabled`, `[sources]`, `[search]`, `[unbound_repo]` with `policy = "ask"` highlighted and `"allow"` documented as not available, `[reflection]`); panel “History”: one row per policy version (`skl_v7` … `skl_v1`) with what changed, the PR, the author, the date, and **in effect** / **superseded**; closing note: core-platform was created on 2026-07-30 with skills off and stayed off until `a-intel/platform#402`.

**Dialogs this page opens:** `skenable` (turn skills on: the switch rendered as the outcome, the pull request as the control; the config it writes; runs in flight finish without skills), `skcfg` (the config file and its five sources, on/off, with the skill count each contributes), `skill` (version · digest · kind · load cost · decision · owner · cited · proof rate; the SKILL.md body; **Send the digest for approval** on an unapproved marketplace skill), `wz` (the skill wizard: search the registry and pin a version by its digest, describe it and let Oxagen draft the `SKILL.md`, or upload a `.skill`/`.zip` bundle to replace a pinned version and bump to the version in the bundle; then the file in the editor, then a pull request).

The page header carries **Add a skill** (gold), which opens the wizard; a catalog row carries **Edit**, which opens `pages/skill-source.md`. Every creation wizard is `DLG_EXT.wz`; its spec is `docs/creation-spec.md`.

**Shell.** As every workspace page (see `tools.md`), with **Skills** in the Workspace nav between Tools and Steering, carrying a count of 1 while an interjection waits on a person.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) the design renders from. Nothing on this page is in Appendix A yet; every target store below is a proposal the spec has to accept or rename.

| Element | Mockup collection | Target store (proposed) | Backing today (repo) | Status |
|---|---|---|---|---|
| Skills on/off per workspace | `SK_ON`, `SK_CREATED` | `.oxagen/skills.toml` in the main repo (absent = off) | none | ❌ |
| Catalog, decisions, withholdings | `SKILLS` | `skills.resolutions` (per config version) | none | ❌ |
| Config, sources, search cut-off, budget | `SK_CFG` | `.oxagen/skills.toml` + `skills.config_versions` | none | ❌ |
| Search console | `SK_QUERIES` | the gateway's `search_skills` answered against a pinned config version | none | ❌ |
| Interjection counts and the open one | `SKS`, `SKRUN`, `SK_FRAMES`, `SK_AFTER` | `control.interject` / `control.answer` frames in the run ledger | none | ❌ |
| Reflection capture, rubric, contradictions | `SK_REFLECT` | `reflections` (quarantined store, org grant `research.read`, 180-day retention) | none | ❌ |
| Config history | `SK_HIST` | git history of `.oxagen/skills.toml` | none | ❌ |

## Functionality

- A skill is `id@version` with a digest. A held skill (out of scope, or a digest that changed since a person approved it) is dropped **before ranking** and is not a result at any rank; the agent is told the count withheld and the reason class, never the name.
- A run resolves its config once, at the start, to a pinned version; replay resolves that version, not today's.
- Turning skills on adds one tool, `search_skills`, to every belt in the workspace and nothing else: no tool is granted, no tier changes, no budget moves. It is a pull request against the main repo, and the person who opened it is on the receipt.
- An unbound repository with skills on stops the loop before the first model call (`unbound_repo = "ask"`); at 30 minutes it times out to `deny`. There is no `allow`.
- A reflection is captured out of band after the seal, excluded from the sealed chain, not replayed on a fork, billed as overhead, readable only under `research.read`, and expires.

## States

- **loaded** — the page as described above, on the demo record (`a-intel` / `core-platform`, skills on since `skl_v1`).
- **empty** — “Skills are on, and there is nothing to resolve” — the config names five sources and none holds a skill; `search_skills` returns an empty result and the reason, not an error. Actions: **Add a skill to a-intel/platform** (→ the skill wizard), **Open the config** (→ `skcfg`).
- **loading** — the shell stays; the page body is the skeleton.
- **error** — “Skills could not be loaded” — `503 skill_registry_unavailable`. Nothing was changed; runs kept recording. Actions: **Try again**, **Open an incident**; trace line.
- **access denied** — “You cannot see the skills of this workspace” — `skills.read on core-platform`. Actions: **Request access**, **Back to Fleet**; Signed in as · Needed · Decided by.
- **off** — not a state of this page but a different page: when the workspace's `skills.enabled` is false the route renders the gate (`skills-off.md`).

## Mobile

As `tools.md`. Skills is not in the thumb bar; it is a tile in the **More** sheet (“resolution, the loop, reflection”) with the same count. Tiles wrap to one column, the triptych and the two-path compare stack, skill rows drop their right column under the text.

## Permissions

- Read: `skills.read`
- Writes (each a governed action recorded in Audit): `skills.admin` (turn on / edit the config, via a pull request), `skills.digest.approve`, `skills.add` (a branch), `reflection.capture.toggle`; `research.read` (an organization grant) to read or export a reflection.

## Backend gaps this page depends on

- The spec: § 2 run-vs-resolve sentence; § 19 tables end at W12 (both decisions are open in `docs/w13-in-the-loop-scenario.md`).
- A skills resolution store and config versioning (every row above is ❌).
- `control.interject` / `control.answer` frame kinds in the run ledger, and `reflection.captured` behind a quarantined store.
