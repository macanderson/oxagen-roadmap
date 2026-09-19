# Skill source

| | |
|---|---|
| Route | `#/a-intel/core-platform/steering/skills/<id>/source` (the old `#/a-intel/core-platform/skills/<id>/source` still resolves) |
| Scope | workspace |
| Spec | `docs/w13-in-the-loop-scenario.md`; `docs/creation-spec.md` §4 |
| Design | `mockups/src/engine.js` → `pSkillSource(r)`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded · loading · error · access denied |
| Storybook | `Oxagen / Workspace / Skill source`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `skill-source.audit-prompt.md` |

## Job

One skill’s `SKILL.md`, in a source editor. A skill is a file with a version and a digest, and the digest is what a run records when it loads it — so changing the words is a pull request that bumps the version, not a save button.

## What is on the page

**Header** — eyebrow “**Steering · Skills** · source” (the link goes back to the Skills tab of Steering); breadcrumbs Steering / Skills / source, h1 the file path in mono. Chips: the source label (repo, linked repo, registry or marketplace), `@version`, the digest prefix, the resolution tier (`allowed` / `needs approval` / `denied`), and the load cost in tokens. A line under it: a skill has no code to run and no credential to hold — it is prose an agent reads, and every action it describes still goes through the toolbelt and the policy that governs it.
Actions: **Back to the catalog** · **Discard** (enabled only when modified) · **Propose a change** (gold)

- **Editor** — the shared code editor (`cedHtml`) over the file. Line-number gutter, markdown highlighting that knows the frontmatter block (keys, values and the `---` fences read as one grammar, fenced code as another), current-line band, **Find ⌘F** with a match count, and a status line with `Ln/Col`, the grammar, a line and character count and the key hints. The bar carries the file’s load cost.
- **A note under the editor** — every token in the file is paid for on every turn it is loaded into, by every agent that loads it, so cutting it is the cheapest optimisation on the page.

**Dialogs this page opens:** `srcpr` — Propose a change: the diff against the merged file, the branch, and six checks (frontmatter name still matches the directory; the version bumps and a changed body with an unchanged version fails; the digest is recomputed at merge while every run that loaded the old version keeps naming the old digest; the file still names no authority it does not have; secret and PII scan; the new body is inside the workspace’s search budget).

**Shell.** As every workspace page.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production).

| Element | Mockup collection | Target store (spec) | Backing today (repo) | Status |
|---|---|---|---|---|
| The skill row | `SKILLS` (`fixtures/skills.json`) via `skillOf(id)` | `.oxagen/skills/<name>/SKILL.md` at a path, version and digest | — | ❌ |
| The file body | `skPlain(s)` over `skBody(s)` | the file at the pinned ref | — | ❌ |
| Draft | `S.cedVal["skill:<id>"]` | the working tree of a branch, never a row | — | ❌ |
| Search budget | `SK_CFG.search.budget` | `.oxagen/skills.toml` | — | ❌ |

## Functionality

- The editor holds the file, not a rendering of it: the frontmatter fences survive a round trip, and nothing in the textarea is markup.
- **Discard** is disabled until the draft differs from the merged file.
- **Propose a change** computes the next patch version from the current one and shows it in the checks, so the version bump is visible before anybody merges. Opening the pull request takes the draft as the new base and records the pending branch.
- Runs in flight keep the version they resolved. A skill is resolved once, at the start of a run.

## States

- **loaded** — the page as described above, on the demo record.
- **loading** — the shell stays; the body is the skeleton.
- **error** — “This skill could not be loaded” — `502 git_read_unreachable`. Nothing was changed. Actions: **Try again**, **Open an incident**; a trace id, region and timestamp line.
- **access denied** — “You cannot see this skill’s source” — the signed-in person does not hold `skills.admin on core-platform`. Actions: **Request access**, **Back to Fleet**.

There is no empty state: the route names one skill.

## Mobile

As every workspace page: thumb bar, bottom-sheet dialogs, no sideways scroll. The editor keeps its gutter and drops the key hints from the status line.

## Permissions

- Read: `skills.read`
- Writes (each a governed action recorded in Audit): `skills.admin (commit to a branch)`, `repo.pr.open`

## Backend gaps this page depends on

- Skills have no store at all today. The whole page depends on the skill index (path, version, digest, source, resolution tier) and on reading the file through the repo binding.

## Rules every build of this page must keep

- The file is the record. A build that edits a parsed representation and re-serialises it is a FAIL: what merges must be the bytes the operator saw.
- The version bump is shown before the merge, not after.
- A skill grants nothing, and the page says so where somebody might assume otherwise.
- Exactly one gold action per screen.
- Nothing here writes a row.
