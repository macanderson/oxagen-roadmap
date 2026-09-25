## Header

The top of one skill's page: its id, its badges, and the one action that changes it.

### Purpose

It tells you which skill this is, where it comes from, which version and digest the workspace pins, whether the assembler resolves it, and what it costs to load. From here you edit `SKILL.md` and propose the change, or, for a withheld skill, ask a person to approve its digest.

### Rationale

A skill is a Steering Source (D12). It is a bundle in `.oxagen/skills/<name>/`: its instructions in `SKILL.md`, its reference files, and the entrypoints its manifest declares. This page replaced the Skills console that the wedge cut. The h1 is the id in mono because a run records a skill by id and digest, and every frame row that names the skill links back here.

Oxagen resolves a skill and never runs it (ADR-043, ADR-090). It describes each entrypoint to the agent as a `capability` frame, a descriptor with its arguments and result. The harness runs the entrypoint, under the policy on that call. So nothing on this page executes, tests or previews a skill's code.

A withheld skill emits nothing. The agent is told how many skills were withheld and for which reason, and never their names, so a withheld skill cannot reach a run even as a label. The lead that used to state these rules is gone. The header now carries data only: the badges, and a lead on a withheld skill that gives its reason.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Id, version and digest | `SKILLS` via `skillOf()` | A pin in `.oxagen/skills.toml`, read by `get_skill_config` | shipped |
| Source badge | `SKILLS[].srcLabel` | The config's sources | partial |
| Status and resolution decision | `srcStatus()` over `steeringSources()`, `skTier(SKILLS[].tier)` | The resolution at a published config version (`preview_skill_search`) | partial |
| Load cost | `SOURCES.bundles[id].instructions.tok`, else `SKILLS[].tokens` | `tokenCost` from `preview_skill_search` | shipped |
| Withheld reason key | `SOURCES.withheld[].reason` | `withheld[].reason` from `preview_skill_search` | shipped |
| Withheld reason in words | `SOURCES.withheld[].why` | A field on the resolution | future-only |
| Request approval | `act()` in `pSkillWithheld` | A pull request through `update_skill_config` that pins the new digest | partial |

### Logic

- `pSource` sends `/steering/sources/skill/<id>` to `pSkillSource` when `skillOf(id)` finds a pinned skill, and to `pSkillWithheld` when it does not.
- The eyebrow reads "Steering · Skill". Steering links to Sources at `?kind=skill`.
- The badges, in order: the status from the skill's Sources row (`approved`, `unapproved`, `out of scope` or `retiring`, with "pull request open" beside `retiring`), the source label, `@<version>`, the first 18 characters of the digest, the decision from `skTier` (`allowed`, "needs approval" or `denied`), and "<n> tok to load".
- The load cost is the bundle's instructions tokens when `SOURCES.bundles` holds the skill. Otherwise it is the fixture's `tokens`, and failing that the file's characters divided by 3.6, never under 120.
- **Discard edits** carries `data-ced-dirty`. It stays disabled until the editor differs from the merged bytes, and it calls `cedRevert`.
- **Propose a change** (gold) calls `skSrcSave`, which opens `srcpr`.
- A withheld skill (`pSkillWithheld`) reads `SOURCES.withheld`. Its badges are `withheld` in the denied hue, `@<version>` and the reason key in mono. Its lead is the reason in words. **Request approval** (gold) shows only for `unapproved_digest`. It reports "Approval requested for <id>@<version>." and the skill stays withheld until a person approves the digest. An `out_of_scope` skill offers no action.
- `oxagen.pdf-extract`, installed from the marketplace, renders the full page with `unapproved`, `marketplace` and `denied`.

### States

- Loaded only. `pSource` answers loading, error and denied before it dispatches, so a skill page shows the skeleton, "503 record_index_unavailable", or a denied panel naming `steering.read on <workspace>`. The error and denied branches inside `pSkillSource` (`502 git_read_unreachable`, `skills.admin`) never render from this route.
- An id nothing holds renders "No skill here" with **Back to Sources**.
- The mockup's lead for `a-intel.mobile-release-notes` ends with a sentence written for a run ("This run works in a-intel/platform."). A build states the scope against the workspace's repositories.
- Mobile: the badges wrap under the h1, and the actions wrap under them.

## Skill file

The skill's `SKILL.md` in the shared source editor, exactly as merged.

### Purpose

You read the instructions every agent that loads this skill reads, and you edit them in place. An edit is a draft until **Propose a change** turns it into a pull request.

### Rationale

The file is the record. The editor holds the bytes, not a rendering of them, so the frontmatter fences survive a round trip and what merges is what the person saw. A build that edits a parsed form and writes it back out fails that rule.

A change to the words changes the digest, and the digest is what a run records when it loads the skill. So an edit goes through a pull request that bumps the version, the same road every other source takes. A run resolves a skill once, at its start, so runs in flight keep the version they resolved.

The token figure sits on the editor's bar because every token in the file is paid for on every turn it is loaded into, by every agent that loads it. Cutting lines lowers the figure, and the Load cost check holds it against the workspace's search budget.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| `SKILL.md` bytes | `skBody()` via `skPlain()` | The file at the pinned commit | future-only |
| Path label | `SKILLS[].path` | The pin's path in `.oxagen/skills/` | shipped |
| Token figure | `SOURCES.bundles[id].instructions.tok`, else `SKILLS[].tokens` | `tokenCost` from `preview_skill_search` | shipped |
| Draft | `S.cedVal["skill:<id>"]` | Nothing. A draft is not stored | shipped |
| Propose a change | `skSrcSave()`, `DLG_EXT.srcpr` | `propose_skill`, a pull request on `skills/<name>` | shipped |
| Search budget in the Load cost check | `SK_CFG.search.budget` | `[search] budget` in `.oxagen/skills.toml` | shipped |

### Logic

- `pSkillSource` seeds the editor key `skill:<id>` with `cedSeed(key, skPlain(s))`. `skPlain` turns the highlighted `skBody(s)` back into plain text.
- `cedHtml(key, s.path, "md", …)` draws the editor with the path label, the change state ("unchanged" or "modified") and "<n> tok" on its bar. The editor root carries the help key.
- The editor has the line gutter, frontmatter and Markdown highlighting, the current-line band, **Find ⌘F** with a match count, and a status line: line and column, "Markdown", lines and characters, "LF" and "UTF-8".
- A change marks the editor "modified" and enables **Discard edits** in the header.
- `skSrcSave` bumps the patch version (`2.1.0` becomes `2.1.1`), names the branch `skills/<name>-<next>`, and lists six checks: Frontmatter, Version, Digest, Grants, Secret and PII scan, and Load cost against the 6,000-token budget. It opens `srcpr`. Opening the pull request reports "a-intel/platform#529 opened. <id> becomes <next> when it merges."
- The build opens the pull request on `skills/<name>`, as `propose_skill` does, not on the mockup's versioned branch.

### States

- A withheld skill has no editor.
- Mobile: the editor keeps its gutter, and its status line wraps.

## Bundle

The parts of the skill, one row each, with what each part emits and what it costs.

### Purpose

It answers what the agent gets from this skill: the instructions, each reference file and each entrypoint, each with the frame type it becomes. You use it to see why a skill costs what it costs and which callable it describes.

### Rationale

D12 makes a skill a bundle, and the Emissions table in `docs/fleet-operations-wedge.md` gives each part a frame type: `SKILL.md` emits `procedure`, each reference emits `context`, and each declared entrypoint emits a `capability` descriptor. Oxagen reads those parts from the manifest, never from a model reading the files. The same skill at the same version always yields the same parts.

An entrypoint is a descriptor only. Oxagen describes it and never runs it, so its Tokens cell is a dash and its Emits cell says "descriptor only". Its digest sits under the file, because the digest is what a run records for it.

### Data sources

| Field | Mockup source | Target store | Status |
|---|---|---|---|
| Manifest path | `SOURCES.bundles[id].manifest` | `.oxagen/skills/<name>/skill.toml` | future-only |
| Instructions row | `SOURCES.bundles[id].instructions` | `SKILL.md` and its token cost | partial |
| Reference rows | `SOURCES.bundles[id].references` | The files the manifest declares | future-only |
| Entrypoint rows | `SOURCES.bundles[id].entrypoints` | An entrypoint descriptor per declared script | future-only |
| Emits badges | fixed per part in `skBundlePanel` | Frame types on SteeringFrames | future-only |

### Logic

- `skBundlePanel(s, B)` reads `SOURCES.bundles[s.id]`. File paths join the skill's directory to each part's path.
- With a bundle, the panel carries the `skill bundles` future mark. Its caption names the manifest: "Declared in .oxagen/skills/release-notes-from-prs/skill.toml."
- Columns: Part, File, Emits and Tokens. The rows are the instructions, then one row per reference with its description under the part, then one row per entrypoint with its description and "<runtime> · <arguments> → <result>" under it.
- The Tokens figures are the ones the Frames it emits panel carries for the same parts.
- The table is `data-lt="off"`, so it has no list controls.

### States

- No bundle: the panel shows "SKILL.md only. The manifest declares no references and no entrypoints." (`a-intel.triage-a-flaky-test`, `oxagen.pdf-extract`).
- A withheld skill has no Bundle panel.
- In a build, until a manifest ships, the panel lists `SKILL.md` alone and says the bundle is not recorded. It shows no entrypoint row and no `capability` badge.
- Mobile: each part becomes a card with File, Emits and Tokens labeled.
