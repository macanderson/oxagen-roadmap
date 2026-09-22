# Steering · Skills

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/skills[/<view>]`. The old `#/a-intel/core-platform/skills[/<view>]` still resolves and is rewritten to it. |
| Scope | workspace |
| Spec | `docs/w13-in-the-loop-scenario.md` (§ 2 needs one sentence distinguishing *running* a skill from *resolving* one); §12.6 token classes (context frames); `steering.md` is the hub this tab belongs to |
| Design | `mockups/src/engine.js` → `pSkills()` with `skHead()`, `skSyncPanel()`, `skCatalog()`, `skRow()`, `skSearch()`, `skLoop()`, `skReflect()`, `skVersions()`, rendered inside the Steering hub by `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs`. The off-by-default gate is `skills-off.md`; the interjected run is `run-interjection.md`. |
| States | loaded · empty · loading · error · access denied |
| Storybook | `Oxagen / … / skills`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `skills.audit-prompt.md` |

## Job

Skills is the second tab of Steering. Skills are steering, and they are files: governed like a record through a pull request, delivered by **sync** (materializing files in the checkout), and loaded by the harness’s own progressive disclosure. Oxagen cannot put a skill in the prompt. Only the skill’s description line competes in the assembler, as an `info` item in the volatile selection, like any other item.

Oxagen does not run a skill; the harness does. This page governs **resolution**: which skills the workspace's config (`.oxagen/skills.toml`) lets an agent find, which it may load, what that cost, and what was held back and why. It reports how often a loaded skill was cited, never a proof rate. It also shows the two things Oxagen does with its seat in the loop, interjecting (stopping a run to ask a person) and reflection (asking the agent to grade its own sealed run, quarantined), and the config file's history, each version a pull request.

## What is on the page

**Header**: the Steering hub header (eyebrow the workspace name, h1 “Steering”, the one-sentence subtext), the governance chip **Governance: team**, and **Add a skill** (gold; opens the skill wizard). The seven tabs with Skills (6) selected. Under the tabs, the lead note, verbatim: “Skills are steering, and they are files. A skill is procedure written down: a file in a repo, with a version and a digest. It is authored through the same pull request flow as a record, delivered by sync into the checkout, and loaded by the harness’s own progressive disclosure. Oxagen does not run it and cannot put it in the prompt. Only its description line competes in the assembler, like any other item.”

- **Views** (a segmented control under the note, `aria-pressed`, each a URL `/steering/skills/<view>`): Catalog (7: every skill not held for scope) · Search · In the loop (1 while an interjection is open) · Reflection (4 axes) · Versions (5).
- **Catalog**. First the panel **Delivered by sync** (badge “files in the checkout · one row per repository”): Repository (with a note under it) · Sync (`in sync`, `behind`, `not bound`) · Synced at (the synced commit, then “head <sha> · <time>”, or “never”) · Skills (with “N files”) · Checkouts · Written to (“.claude/skills/ and .codex/skills/”, or “nothing to write”). `a-intel/platform` is in sync, `a-intel/billing` is behind by one version of one skill, and `a-intel/mobile` is not bound because it carries no `.oxagen/` tree. Under it a note: sync materializes the merged files into each enrolled checkout; the skill body never enters the assembler and is never budgeted there; the description line is what competes, as an `info` item in the volatile selection; **See it compete in Preview** opens the Preview tab. Then four tiles: **In scope here** (6, “of 8 the sources hold”) · **Held back** (2, “scope, or an unapproved digest”) · **If all loaded** (8,650, “tokens · $0.0260 a turn”; the sum of the in-scope rows' load costs) · **Actually loaded** (1.4, “skills a run, median · the belt is searchable”). A note on the searchable belt against the pinned belt before `skl_v4` (seven skills, 9,650 tokens a turn, cited in under a fifth of runs). Panel **Resolved by `skl_v7`** (button **Open .oxagen/skills.toml** → `skcfg`) listing each in-scope skill as a row: kind glyph · `id @version` · statement · optional note · chips (source · kind · “N tok” · digest prefix · “cited in N of M runs” · “cited 62% → 81% of loads”, the cited rate before and after this version) · decision badge (allowed / needs approval / denied) · updated · **Open** (→ `skill` dialog) · **Edit** (→ `skill-source.md`). Panel **Held back** (badge “these do not appear in a search, at any rank”) with the same row shape plus “Why it is held:”, no Edit, and the note that a held skill is not a low-scoring result and the agent is told the count and reason class, never the name.
- **Search**: the `search_skills(…)` console. Note “This is not a search box for you.”; input pre-filled with `cut the first release notes`; **Ask as the agent** (Enter also runs it); result header (“N returned” · “N withheld” · `skl_v7 · top 5 · min 0.42`); a hit row per result (`id @version` · statement · chips source, tokens, decision · score); a withheld row per withholding (struck-through id · `out_of_scope` or `unapproved_digest` chip · why · “The agent is told `withheld: 1` and the reason class. It is not told this name.”); an empty result renders `[]` with a reason, never an error; “try:” chips for the canned queries; panel **Decision** (Config · Sources on · Belt mode · Cut-off · Load budget · Unbound repo); panel **Frame written** (`skills.searched · frame 4 · run <id>` as a key/value block: query, config, returned, withheld, reasons, cost, grade) and the replay note (replay resolves `skl_v7`, not today's config).
- **In the loop**: note “Oxagen sits at the harness’s hooks.” (on the `harness` tier SessionStart, UserPromptSubmit, PreToolUse, and PermissionRequest can refuse, client-attested and fail-open); tiles **Interjections, 30 days** (18, “14 answered, 3 timed out, 1 open”) · **Median answer** (4m 12s) · **On timeout** (`deny`) · **Open now**; while open, a gold-bordered panel **Interjection** (“paused mid-loop”; **Open the run and answer it** → `run-interjection.md`); once answered, **Nothing is waiting** with the answer, **Open the run**, and **reset the demo**; two panels: **Seat permissions** (Ask a person a question · Stop before a guess · Ask the agent to reflect · Record what it did) and **Denied actions** (Rewrite what the agent said · Answer on the operator’s behalf · Feed a reflection back into the work · Hide that it happened).
- **Reflection**: note “Research only, and the file says so.” (`use = "research"` is the only accepted value); tiles **Sampled** (20%, “plus every failing and tampered run”) · **Captured, 30 days** (127, “out of 611 sealed runs”) · **Cost** ($1.79, “0.09% of the month’s spend · billed as overhead, never as productive”) · **Calibration gap** (2 of 4, “axes where the agent scored itself above the record”); panel **Injected turn**: four frames, `run.sealed` solid then `control.reflect` · `model.request` · `reflection.captured` **dashed** (out of band, after the seal, not replayed on a fork); panel **Self-report**: four rubric axes, each with a self bar, a record bar, the agent's quote and “the record says: …”, the two disagreeing axes flagged “calibration gap”, and two contradiction cards citing the frame (“frame 171 · tool_call”, “frame 96 · tool_call”); the **Quarantine** box with the five rules (never enters a context frame · cannot be promoted · does not price the work · is not evidence about a person · expires) and consent chips (`use = research` · consent: organization · retain 180 days), **Turn capture off**, **Export for research** (denied without `research.read`).
- **Versions**: note that the config lives in the main repo on its production branch; panel **.oxagen/skills.toml** with the rendered file (`enabled`, `[sources]`, `[search]`, `[unbound_repo]` with `policy = "ask"` highlighted and `"allow"` documented as not available, `[reflection]`); panel **History** (badge “5 policy versions”): one row per policy version (`skl_v7` … `skl_v1`) with what changed, the PR, the author, the date, and **in effect** / **superseded**; closing note: core-platform was created on 2026-07-30 with skills off and stayed off until `a-intel/platform#402`.

**Dialogs this page opens:** `govmode`, `skenable` (turn skills on: the switch rendered as the outcome, the pull request as the control; the config it writes; runs in flight finish without skills), `skcfg` (the config file and its sources, on or off, with the skill count each contributes), `skill` (Version · Digest · Kind · Load cost · Decision · Owner · Cited · Cited rate (“62% of loads cited before this version → 81% after · measured over N runs from the token record”); the SKILL.md body; **Retire** (red; opens `skretire`) and then **Send the digest for approval** on an unapproved marketplace skill, else **Edit the file**), `skretire` (a skill written here is a file, so retiring it is a pull request that removes its `SKILL.md`; one installed from a registry or the marketplace is a line, so it is a pull request that takes the install line out of `.oxagen/workspace.toml` and leaves it published where it came from; either way a search still returns it until the merge, the runs that cited it keep the digests they recorded, and the row reads `retiring` while the pull request is open), `wz` (the skill wizard: search the registry and pin a version by its digest, describe it and let Oxagen draft the `SKILL.md`, or upload a `.skill`/`.zip` bundle; then the file in the editor, then a pull request). Every creation wizard is `DLG_EXT.wz`; its spec is `docs/creation-spec.md`.

**Shell.** As `steering.md`: sidebar with Steering lit and Repositories between Steering and Spend, top bar with breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button (count of everything waiting on you across the organization, an open interjection included) that opens the drawer `#apdrawer`, and the account avatar. No assistant button in the top bar. Skills carries no nav entry of its own; Steering's nav count includes 1 while an interjection waits on a person.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production). The *mockup collection* column names the file in `mockups/fixtures/` (as `FIXTURES.<NAME>`) the design renders from. Nothing on this page is in Appendix A yet; every target store below is a proposal the spec has to accept or rename.

| Element | Mockup collection | Target store (proposed) | Backing today (repo) | Status |
|---|---|---|---|---|
| Skills on/off per workspace | `SK_ON`, `SK_CREATED` | `.oxagen/skills.toml` in the main repo (absent = off) | none | ❌ |
| Catalog, decisions, withholdings | `SKILLS` (`cited`, `runs`, `citedBefore`, `citedAfter`, `tokens`, `digest`, `tier`) | `skills.resolutions` (per config version) | none | ❌ |
| Sync per repository | `SKILL_SYNC` | per-repository sync status | none | ❌ |
| Cited rate, load cost | `SKILLS[].citedBefore`, `citedAfter`, `tokens` | `cost.run_totals` `context_frame_tokens` and the `context_cited` frame per skill digest | 🟡 ClickHouse `token_usage` | 🟡 |
| Config, sources, search cut-off, budget | `SK_CFG` | `.oxagen/skills.toml` + `skills.config_versions` | none | ❌ |
| Search console | `SK_QUERIES` | the gateway's `search_skills` answered against a pinned config version | none | ❌ |
| Interjection counts and the open one | `SKS`, `SKRUN`, `SK_FRAMES`, `SK_AFTER` | `control.interject` / `control.answer` frames in the run ledger | none | ❌ |
| Reflection capture, rubric, contradictions | `SK_REFLECT` | `reflections` (quarantined store, org grant `research.read`, 180-day retention) | none | ❌ |
| Config history | `SK_HIST` | git history of `.oxagen/skills.toml` | none | ❌ |

## Functionality

- A skill is `id@version` with a digest. A held skill (out of scope, or a digest that changed since a person approved it) is dropped **before ranking** and is not a result at any rank; the agent is told the count withheld and the reason class, never the name.
- A run resolves its config once, at the start, to a pinned version; replay resolves that version, not today's.
- The cited rate is measured from the token record: of the runs that loaded the skill, the share whose model call cited it, before and after the current version. It says nothing about whether the run's outcome held.
- Turning skills on adds one tool, `search_skills`, to every belt in the workspace and nothing else: no tool is granted, no tier changes, no budget moves. It is a pull request against the main repo, and the person who opened it is on the receipt.
- An unbound repository with skills on stops the loop before the first model call (`unbound_repo = "ask"`); at 30 minutes it times out to `deny`. There is no `allow`.
- A reflection is captured out of band after the seal, excluded from the sealed chain, not replayed on a fork, billed as overhead, readable only under `research.read`, and expires.

## States

- **loaded**: the page as described above, on the demo record (`a-intel` / `core-platform`, skills on since `skl_v1`).
- **empty**: the hub header, the chip, and the seven tabs stay; the header holds no gold. “Skills are on, and there is nothing to resolve”: “The config names five sources and none of them holds a skill yet. An agent that calls `search_skills` in this workspace gets an empty result and the reason, which is a different thing from an error. Nothing is broken; nothing has been written.” Actions: **Add a skill to a-intel/platform** (gold; the skill wizard), **Open the config** (→ `skcfg`).
- **loading**: the shell stays; the page body is the skeleton.
- **error**: “Skills could not be loaded”. “The control plane answered `503 skill_registry_unavailable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the trace line.
- **access denied**: “You cannot see the skills of this workspace”, naming `skills.read on core-platform`. Actions: **Request access**, **Back to Fleet**; Signed in as · Needed · Decided by.
- **off**: not a state of this page but a different page: when the workspace's `skills.enabled` is false the route renders the gate (`skills-off.md`).

## Mobile

As `steering.md`. Skills is not in the thumb bar; it sits inside Steering in the **More** sheet, which carries a count while an interjection waits. The seven hub tabs are one scrolling strip; the five views wrap. Tiles wrap to one column, the triptych and the two-path compare stack, skill rows drop their right column under the text.

## Permissions

- Read: `skills.read`
- Writes (each a governed action recorded in Audit): `skills.admin` (turn on / edit the config, via a pull request), `skills.digest.approve`, `skills.add` (a branch), `skills.retire` (a branch), `reflection.capture.toggle`; `research.read` (an organization grant) to read or export a reflection.

## Backend gaps this page depends on

- The spec: § 2 run-vs-resolve sentence; § 19 tables end at W12 (both decisions are open in `docs/w13-in-the-loop-scenario.md`).
- A skills resolution store and config versioning (every row above but the cited rate is ❌).
- `control.interject` / `control.answer` frame kinds in the run ledger, and `reflection.captured` behind a quarantined store.
- The cited-rate rollup per skill digest from `context_frame_tokens` and `context_cited`.

## Rules every build of this page must keep

- Status vocabulary. Hook tier: delivered, recorded, client-attested, fail-open. Never "enforced". A skill grants nothing, and the page says so where somebody might assume otherwise.
- A skill reports a cited rate and a load cost, never a proof rate, a verdict, or a score.
- Headers are rollups of the rows beneath them, never typed twice.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen. Gold is identity; it never encodes state.
- A not-loaded state replaces the page body, never the shell. Stub controls say what the product would do; nothing silently does nothing.
- A count in navigation appears only where something waits on a person.
