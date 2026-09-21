# Skill source

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/skills/<id>/source` (the old `#/a-intel/core-platform/skills/<id>/source` still resolves) |
| Scope | workspace |
| Spec | `docs/w13-in-the-loop-scenario.md`; `docs/creation-spec.md` §4; §12.6 token classes (context frames) |
| Design | `mockups/src/engine.js` → `pSkillSource(r)`, `skSrcSave()`, `DLG_EXT.srcpr`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / Workspace / Skill source`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `skill-source.audit-prompt.md` |

## Job

One skill’s `SKILL.md`, in a source editor. A skill is a file with a version and a digest, and the digest is what a run records when it loads it, so changing the words is a pull request that bumps the version, not a save button.

## What is on the page

**Header**: eyebrow “**Steering · Skills** · source” (the link goes back to the Skills tab of Steering); breadcrumbs Steering / Skills / source; h1 the file path in mono (`.oxagen/skills/release-notes-from-prs/SKILL.md`). Chips, in order: the source label (`a-intel/platform`; a repo, linked repo, registry, or marketplace), `@2.1.0`, the digest prefix (`sha256:4b1e90c7ad3…`), the resolution tier (`allowed` / `needs approval` / `denied`), and the load cost in tokens (“146 tok to load”, computed from the file's length). Subtext, one sentence pair as rendered: “A skill has no code to run and no credential to hold. It is prose an agent reads, and every action it describes still goes through the toolbelt and the policy that governs it.”
Actions: **Back to the catalog** · **Discard** (enabled only when modified) · **Propose a change** (gold).

- **Editor**: the shared code editor (`cedHtml`) over the file, path label the file path, bar “unchanged” (or the change state) and “146 tok”. Line-number gutter, markdown highlighting that knows the frontmatter block (keys, values, and the `---` fences read as one grammar, fenced code as another), current-line band, **Find ⌘F** with a match count, and a status line: “Ln 14, Col 35 · Markdown · 14 lines · 525 chars · LF · UTF-8 · Tab indent · ⇧Tab outdent · ⌘F find”.
- **A note under the editor**, verbatim: “Every token in this file is paid for on every turn it is loaded into, by every agent that loads it. Cutting it is the cheapest optimisation on this page.”

**Dialogs this page opens:** `srcpr`, **Propose a change to this skill**: the lead (“A skill is a file with a digest, and the digest is what a run records when it loads it. Changing the words changes the digest, so this goes through a pull request like everything else.”), the diff against the merged file with a `+n / −n` count (“Nothing changed yet.” when equal), the branch `skills/<name>-<next version>`, and six checks: **Frontmatter** (`name` still matches the directory); **Version** (`2.1.0 → 2.1.1` · a changed body with an unchanged version fails); **Digest** (recomputed at merge · every run that loaded 2.1.0 keeps naming that digest, not this one); **Grants** (the file still names no authority it does not have); **Secret and PII scan** (the body and every example are scanned); **Load cost** (the new body is inside this workspace’s 6,000-token search budget). Footer **Cancel** · **Open the pull request** (gold; disabled when nothing changed). Opening reports “a-intel/platform#529 opened. <id> becomes <next> when it merges; runs in flight keep <current>.”

**Shell.** As `steering.md`: sidebar with Steering lit, top bar with breadcrumbs, ⌘K search-or-run, notifications, the **Approvals** button (count of everything waiting on you across the organization) that opens the drawer `#apdrawer`, and the account avatar. No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production).

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| The skill row | `SKILLS` (`fixtures/skills.json`) via `skillOf(id)` | `.oxagen/skills/<name>/SKILL.md` at a path, version and digest | none | ❌ |
| The file body | `skPlain(s)` over `skBody(s)` | the file at the pinned ref | none | ❌ |
| Draft | `S.cedVal["skill:<id>"]` | the working tree of a branch, never a row | none | ❌ |
| Load cost | the editor text length at 3.6 chars a token | `cost.run_totals` `context_frame_tokens` on a run that loaded it | 🟡 ClickHouse `token_usage` | 🟡 |
| Search budget | `SK_CFG.search.budget` | `.oxagen/skills.toml` | none | ❌ |

## Functionality

- The editor holds the file, not a rendering of it: the frontmatter fences survive a round trip, and nothing in the textarea is markup.
- **Discard** is disabled until the draft differs from the merged file, and returns it to the merged bytes.
- **Propose a change** computes the next patch version from the current one and shows it in the checks, so the version bump is visible before anybody merges. Opening the pull request takes the draft as the new base and records the pending branch.
- The load cost in the bar follows the draft, so cutting lines lowers it before the merge.
- Runs in flight keep the version they resolved. A skill is resolved once, at the start of a run.

## States

- **loaded**: the page as described above, on the demo record.
- **loading**: the shell stays; the body is the skeleton.
- **error**: “This skill could not be loaded”. “The control plane answered `502 git_read_unreachable`. Nothing was changed. Runs kept recording while this page was down. Frames are written by the collector on each host, not by Oxagen.” Actions: **Try again**, **Open an incident**; the trace line.
- **access denied**: “You cannot see this skill’s source”, naming `skills.admin on core-platform`. Actions: **Request access**, **Back to Fleet**. Below: *Signed in as*, *Needed*, *Decided by*.

There is no empty state: the route names one skill.

## Mobile

As every workspace page: thumb bar, bottom-sheet dialogs, no sideways scroll. The h1 wraps. The editor keeps its gutter and drops the key hints from the status line.

## Permissions

- Read: `skills.read`
- Writes (each a governed action recorded in Audit): `skills.admin (commit to a branch)`, `repo.pr.open`

## Backend gaps this page depends on

- Skills have no store at all today. The whole page depends on the skill index (path, version, digest, source, resolution tier) and on reading the file through the repo binding.

## Rules every build of this page must keep

- The file is the record. A build that edits a parsed representation and re-serialises it is a FAIL: what merges must be the bytes you saw.
- The version bump is shown before the merge, not after.
- A skill grants nothing, and the page says so where somebody might assume otherwise.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast.
- Exactly one gold action per screen.
- Nothing here writes a row.
