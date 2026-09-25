# Skill source

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/sources/skill/a-intel.release-notes-from-prs`. The same address serves every skill in the workspace: the withheld `…/sources/skill/a-intel.changelog-bot` (an unapproved digest) and `…/sources/skill/a-intel.mobile-release-notes` (out of scope), and the unapproved marketplace skill `…/sources/skill/oxagen.pdf-extract`. Old route: `/steering/skills/{skill}/source` (308 to `/steering/sources/skill/{skill}`); the mockup rewrites `#/:org/:ws/steering/skills/<id>/source` in place. `/{org}/{ws}/skills/{…}` lands on Sources filtered to skills, not on one skill (`docs/fleet-operations-routes.md`) |
| Scope | workspace |
| Spec | `docs/fleet-operations-wedge.md`: D4 (a source and a frame are two objects), D5 (eight frame types), D6 (provenance and hash), D12 (a skill is a Steering Source: instructions, references and optional entrypoints; an entrypoint becomes a capability descriptor and Oxagen never runs it); the Steering sections Emissions (Skill), Reading a source and Shipped today; the Cuts rows for the Skills console and skill reflection. ADR-043 and ADR-090 in `macanderson/oxagen`. `docs/creation-spec.md` §4 for the skill wizard |
| Design | `mockups/src/engine.js`: `pSkillSource`, `skBundlePanel`, `skSrcSave`, `DLG_EXT.srcpr`, `skBody`; `mockups/src/wedge.js`: `pSource`, `pSkillWithheld`, `srcHead`, `srcFramesOf`, `srcFramesPanel`, `srcReachPanel`. Built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs`. Fixture: `mockups/fixtures/sources.json` (`bundles`, `withheld`) |
| States | loaded |
| Storybook | `Oxagen / Steering / Skill`: Loaded, Loaded · mobile, and Loaded · future-only fields marked |
| Audit | `steering-source-skill.audit-prompt.md` |

## Job

One skill, read as a Steering Source. A skill is a bundle in `.oxagen/skills/<name>/`: its instructions (`SKILL.md`), its reference files, and the entrypoints its manifest declares. It has a version and a digest, and the digest is what a run records when it loads the skill. The page shows the file in an editor, the bundle part by part with what each part emits, the SteeringFrames the skill emits at this version, and the agents its scope reaches.

Oxagen resolves a skill and never runs it (ADR-043, ADR-090). An entrypoint is described to the agent as a `capability` frame, a descriptor with its arguments and result, and the harness runs it under the policy on the call. A change to the words is a pull request that bumps the version. A withheld skill emits nothing, and its page says why.

## What is on the page

**Shell.** As `steering.md`, with Steering lit. The breadcrumbs read "Anderson Intelligence Corp. / Core platform / Steering / a-intel.release-notes-from-prs", the id in mono.

**Header.**

- Eyebrow "Steering · Skill", where Steering links back to Sources filtered to skills (`?kind=skill`).
- h1: the skill's id in mono, "a-intel.release-notes-from-prs".
- Badges, in order: the status ("approved" with a dot), the source ("a-intel/platform"; a linked repository, the organization registry or "marketplace" for others), the version ("@2.1.0"), the digest prefix ("sha256:4b1e90c7ad3…"), the resolution decision ("allowed") and the load cost ("1,840 tok to load").
- No lead. What a bundle holds, and who runs an entrypoint, are in the component help (`mockups/help/steering-source-skill.md`, Header).
- Actions: **Discard** (disabled until the file changes, and it returns the editor to the merged bytes) and **Propose a change** (gold; opens `srcpr`).

**Left column.**

- **The editor.** The shared source editor over `SKILL.md`. Its path label reads ".oxagen/skills/release-notes-from-prs/SKILL.md", its change state "unchanged", and its bar "1,840 tok". The highlighting reads the frontmatter block (the `---` fences, `name: release-notes-from-prs` and `scope: workspace:core-platform`) as one grammar and the markdown body as another. It has the line-number gutter, the current-line band, **Find ⌘F** with a match count, and a status line: "Ln 14, Col 35", "Markdown", "14 lines · 525 chars", "LF", "UTF-8" and the key hints. The body is the procedure "# Cutting release notes" in five numbered steps, the fifth of which says never to publish the release.
- **Bundle** panel. Heading "Bundle", caption "Declared in .oxagen/skills/release-notes-from-prs/skill.toml." Columns: Part, File, Emits and Tokens.

| Part | File | Emits | Tokens |
|---|---|---|---|
| Instructions | `.oxagen/skills/release-notes-from-prs/SKILL.md` | `procedure` | 1,840 |
| Reference, "The house format: Features, Breaking, Fixes. One line per pull request, past tense, linked." | `…/references/format.md` | `context` | 420 |
| Reference, "Labels that decide a section: feature, breaking, fix. An unlabelled pull request goes under Fixes and is flagged." | `…/references/labels.md` | `context` | 180 |
| Entrypoint `group-prs`, "Groups merged pull requests by label into Features, Breaking and Fixes.", with its runtime and signature under it: `node`, `{ since: string, repo: string }` to `{ features: PR[], breaking: PR[], fixes: PR[] }` | `…/scripts/group-prs.ts`, with its digest `sha256:9c41e07ab2d53f18` under it | `capability`, with "descriptor only" under it | a dash |

A skill whose manifest declares no references and no entrypoints shows the heading and "SKILL.md only. The manifest declares no references and no entrypoints." (`a-intel.triage-a-flaky-test`, `oxagen.pdf-extract`).

**Right column.**

- **Frames it emits.** Caption "4 at this version." Four items, each with its type badge, force, injection point, tokens, body and frame id:
  - `procedure`, `info`, Checkout files, 1,840 tok, "SKILL.md: Groups merged pull requests into Features, Fixes and Breaking, and writes the draft to a release branch. Never publishes.", `procedure:a-intel.release-notes-from-prs@4b1e90c7ad38`;
  - `context`, `info`, Checkout files, 420 tok, "references/format.md: The house format: …", `context:a-intel.release-notes-from-prs@f931e83914a8`;
  - `context`, `info`, Checkout files, 180 tok, "references/labels.md: Labels that decide a section: …", `context:a-intel.release-notes-from-prs@bd867dc84a48`;
  - `capability`, `info`, Checkout files, "descriptor" in place of a token cost, "group-prs { since: string, repo: string } → { features: PR[], breaking: PR[], fixes: PR[] }. Groups merged pull requests by label into Features, Breaking and Fixes.", `capability:a-intel.release-notes-from-prs@9c41e07ab2d5`.
  - The Compiler also shows a fifth frame for this skill: its description line, a `procedure` at `info` in Prompt submit. This page does not list it, and the wedge spec's Emissions table does not name it. The design has to settle whether it is a frame; until it does, a build keeps this page and the envelope in agreement (`steering-compiler.md`).
- **Agents it reaches.** "68 in Core platform by its scope, workspace." The first five agents, each with a Compiler link, and "63 more on Assignments".

**A withheld skill.** `a-intel.changelog-bot` renders a smaller page with no editor and no bundle.

- Eyebrow "Steering · Skill", h1 the id.
- Badges: "withheld" (a dot, in the denied hue), "@1.4.0" and the reason in mono, `unapproved_digest`.
- Lead: the reason in words: "Its digest changed on 2026-09-09 after Priya Natarajan approved 1.3.2. Nobody has approved the new one." What a withheld skill tells the agent is in the component help.
- Action: **Request approval** (gold), which reports "Approval requested for a-intel.changelog-bot@1.4.0."
- **Frames it emits** reads "None." with "withheld as unapproved_digest", and **Agents it reaches** reads "None while it emits nothing."

`a-intel.mobile-release-notes` is withheld as `out_of_scope` and offers no action. Its lead gives the scope, "Scoped to a-intel/mobile.", then a sentence written for a run ("This run works in a-intel/platform."), which a source page does not have; a build states the scope against the workspace's repositories instead.

**An unapproved skill.** `oxagen.pdf-extract`, installed from the marketplace, renders the full page with "unapproved", "marketplace", "@0.9.3", its digest, "denied" and "3,100 tok to load". Its bundle is SKILL.md only, and Frames it emits reads "None." with "no person approved its digest".

### Dialog

**`srcpr`**, "Propose a change to this skill", subtitle ".oxagen/skills/release-notes-from-prs/SKILL.md".

- No lead. The primary action names what it does.
- The change: the main repository and the branch ("a-intel/platform ← skills/release-notes-from-prs-2.1.1"), the added and removed line counts, and the line diff, or "Nothing changed yet."
- "What the checks will assert", six rows: Frontmatter ("name still matches the directory"), Version ("2.1.0 → 2.1.1 · a changed body with an unchanged version fails"), Digest ("recomputed at merge"), Grants ("the file still names no authority it does not have"), Secret and PII scan ("the body and every example are scanned") and Load cost ("the new body is inside this workspace’s 6,000-token search budget").
- Footer: Cancel and **Open the pull request** (gold; disabled while nothing changed). Opening reports "a-intel/platform#529 opened. a-intel.release-notes-from-prs becomes 2.1.1 when it merges."

## Data sources

Legend: ✅ shipped · 🟡 partial · ❌ future-only. A fixture is not evidence that anything ships.

| Element | Mockup collection | Target store or contract | Backing today in `macanderson/oxagen` | Status |
|---|---|---|---|---|
| The skill's id, version and digest | `SKILLS` via `skillOf()` | A pin in `.oxagen/skills.toml` | `get_skill_config`: each pin carries id, version and digest (`packages/oxagen/src/skills.ts:3-12`, `skill.config.get.ts:6`) | ✅ |
| The source badge | `SKILLS[].srcLabel` | The config's sources | The config has one source, `.oxagen/skills` on the main repository (`skills.ts:18-31`). Linked repositories, the registry and the marketplace are not sources in the schema | 🟡 |
| Status and the resolution decision | `SKILLS[].state`, `tier` | Resolution at a published config version | `preview_skill_search` returns the resolved candidates and the withheld ones with `out_of_scope` or `unapproved_digest` (`skill.search.preview.ts:14`, `:46`). No "needs approval" or "denied" decision exists | 🟡 |
| Load cost | `SOURCES.bundles[].instructions.tok` | The skill's token cost | `preview_skill_search` `tokenCost` (`skills.ts:75-79`); `propose_skill` estimates it at four characters a token (`skill.propose.ts:96`) | ✅ |
| The `SKILL.md` bytes in the editor | `skBody()` | The file at the pinned commit | No capability returns a skill's file. `propose_skill` reads the merged file inside its handler only | ❌ |
| The draft | `S.cedVal["skill:<id>"]` | The working tree of a branch | Nothing stores a draft, as intended | ✅ |
| Propose a change and its six checks | `skSrcSave()`, `DLG_EXT.srcpr` | A pull request against the main repository | `propose_skill` (`skill.propose.ts:183`) runs frontmatter, version, digest, grants, secrets and load cost (`:157-164`) and opens the pull request on `skills/<name>` (`:65`), not the mockup's versioned branch | ✅ |
| The search budget in the Load cost check | `SK_CFG.search.budget` | `[search] budget` in `.oxagen/skills.toml` | `get_skill_config` `search.budget`, 6,000 by default (`skills.ts:37`, `skill.propose.ts:34`) | ✅ |
| The bundle: manifest, references and entrypoints | `SOURCES.bundles` | `.oxagen/skills/<name>/skill.toml` and the files it declares | No manifest and no entrypoint descriptor. `propose_skill` accepts up to 16 files beside `SKILL.md` (`skill.propose.ts:38`, `:219-229`), with no declared parts | ❌ |
| Frames it emits | `srcFramesOf()` | SteeringFrames with type, provenance and hash | No skill item is produced in `steering.manifest`; items carry no type or hash (`packages/tacho/src/wire.ts:626-697`) | ❌ |
| Agents it reaches | `srcReachPanel()` | The skill's scope against the agent registry | `list_agents` (`agent.list.ts:142`). A skill's reach is the workspace whose config pins it | 🟡 |
| A withheld skill's reason | `SOURCES.withheld[].reason` | The resolution's withheld list | `preview_skill_search` `withheld[].reason` (`skill.search.preview.ts:46`) | ✅ |
| A withheld skill's reason in words, and the approver | `SOURCES.withheld[].why` | A field on the resolution | None | ❌ |
| What the agent is told | the lead's rule | Counts by reason, never names | `summarize_skill_search` answers the agent with counts only (`skill.search.summarize.ts:12`, `:47`) | ✅ |
| Request approval | `act()` in `pSkillWithheld` | Approving the new digest | No approval request. Approving a digest is pinning it: a pull request through `update_skill_config` (`skill.config.update.ts:6`) | 🟡 |

## Future-only fields

| Mark | Reason | What a build shows today |
|---|---|---|
| The **Bundle** panel, when the skill has references or entrypoints | `skill bundles` | The panel lists `SKILL.md` alone and says the bundle is not recorded. No entrypoint row and no `capability` badge |
| **Frames it emits**, on the full page and on a withheld skill's page | `frame types and per-frame provenance` | The panel with "not recorded" in place of the list |

These are future-only in `macanderson/oxagen` and carry no mark in the mockup: the editor's `SKILL.md` bytes (no read path), the manifest named in "SKILL.md only. The manifest declares no references and no entrypoints.", a withheld skill's reason in words, and the "needs approval" and "denied" decisions. A build renders each as not recorded.

## Functionality

- The editor holds the file, not a rendering of it. The frontmatter fences survive a round trip, and what merges is the bytes the person saw.
- Discard is disabled until the draft differs from the merged file, and it returns the merged bytes.
- Propose a change computes the next patch version and shows it in the Version check before anybody merges. Opening the pull request records the pending change. Runs in flight keep the version they resolved, because a run resolves a skill once, at its start.
- The load cost is a figure of the file. Cutting lines lowers it, and the Load cost check holds it against the workspace's search budget.
- A skill grants nothing. An entrypoint is a descriptor: the page never runs it, and the Emits cell says "descriptor only".
- A withheld skill emits nothing. The agent learns how many skills were withheld and for which reason, and never their names. Request approval, for an unapproved digest, leaves it withheld until a person approves the digest.

## States

Loaded only. This change designs the loaded state. The build uses the shell's standard loading, error, empty and denied panels until they are designed.

## Mobile

The thumb bar holds Work, Agents, Tools, Spend and More, with More lit. More holds Steering, Runtimes, Repositories, Organization, Billing, Audit, Stella, search, notifications, the account and both switchers. The top bar shows the id, truncated. The two columns become one: the editor, the Bundle panel, Frames it emits, then Agents it reaches. The badges wrap under the h1, and the actions wrap under the lead. The editor keeps its gutter and its status line wraps. The Bundle table becomes a card per part, each cell labelled: File, Emits and Tokens. The dialog rises from the bottom edge as a sheet with full-width footer buttons. Nothing scrolls sideways; touch targets are at least 44 px and inputs are 16 px.

## Permissions

- Read: the mockup's denied panel names `steering.read on core-platform`, because `pSource` answers the loading, error and denied states before it hands a skill to `pSkillSource`. In `macanderson/oxagen`, `get_skill_config` and `preview_skill_search` allow an organization Owner, Admin or Member and a workspace Owner or Member.
- Write: Propose a change is `propose_skill`, an organization Owner or Admin; no workspace role reaches it on its own (`skill.propose.ts:202-205`). Approving a digest is `update_skill_config`, an organization Owner or Admin. Each is a governed action recorded in Audit.

## Backend gaps this page depends on

- A read of a skill's files at its pinned commit.
- A skill manifest that declares references and entrypoints, and a capability descriptor per entrypoint (D12).
- Skill items in `steering.manifest`, with frame types and hashes (wedge spec, Shipped today).
- A withheld skill's reason in words, and the person who approved the last digest.
- Sources beyond the main repository: linked repositories, the organization registry and the marketplace.

## Rules every build of this page must keep

- A Steering Source and a SteeringFrame are never shown as each other. The page lists the SteeringFrames the skill emits, each with its own id, and a frame row elsewhere links here at the version it names.
- A frame (a recorded event) and a SteeringFrame (a resolved input) never share a name on screen.
- Oxagen never runs an entrypoint. Nothing on this page executes, tests or previews a skill's code.
- A skill grants nothing, and raises no tier. Every enforcement claim states the tier, and "enforced" is said only of calls routed through Oxagen.
- The file is the record. A build that edits a parsed representation and re-serialises it fails: what merges is the bytes the person saw.
- The version bump shows before the merge.
- A withheld skill's name never reaches an agent.
- No person is scored or ranked.
- Headers are rollups of the rows beneath them: the Frames it emits count is its items, and the Bundle's token figures are the ones the frames carry.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing. The skill page has no lead, and the Frames it emits caption is one sentence.
- Exactly one gold action per screen: Propose a change, or Request approval on a withheld skill.
- A future-only field is marked in the design and renders as not recorded in a build until its contract ships.
- Nothing on this page writes a row. Every change ends on a pull request.
