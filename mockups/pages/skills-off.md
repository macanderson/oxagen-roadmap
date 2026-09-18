# Steering · Skills · off (the default)

| | |
|---|---|
| Route | `#/a-intel/finops/steering/skills` (the old `#/a-intel/finops/skills` still resolves) — any workspace whose `skills.enabled` is false (absent) |
| Scope | workspace |
| Spec | see `skills.md` |
| Design | `mockups/src/engine.js` → `pSkills()` → `skGate()` |
| States | loaded (the gate renders in place of every tab; loading / error / denied are the Skills page's own, in `skills.md`) |
| Storybook | `Mission Control / … / skills-off`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `skills-off.audit-prompt.md` |

## Job

Show that skills ship **off**: `skills.enabled = false` is the value a workspace is created with, not a value somebody set afterwards, and say exactly what turning it on would and would not do before offering to.

## What is on the page

**Header**: the Steering hub header and its seven tabs, with Skills selected and no count on it. The hub header carries no gold action here, because the gate holds the one primary action.

- **The gate** — lock glyph, h2 “Skills are off in <workspace name>”, sub “Every workspace ships this way. `skills.enabled = false` is the value a workspace is created with, not a value somebody set afterwards.”, badge **off**.
  - “What turning it on does” (four bullets: adds `search_skills` to every belt — a door, not a list; lets the harness load a skill file at a priced token cost; starts `skills.searched` / `skills.loaded` frames; makes `.oxagen/skills.toml` a governed file).
  - “What it does not do” (four bullets: grants no tool; raises no tier (a skill on a `harness` tier agent is delivered and recorded, never enforced); does not reach into an unbound repo — the loop stops and asks; does not turn on reflection).
  - Note “Why off, and not on.”
  - Footer: **Turn skills on for <workspace name>** (gold; → `skenable`) · **Read the config it would write** (→ `skcfg`) · “needs `skills.admin` on <slug>”.
- **Every workspace in <organization>** — “the default is visible, not implied”: one row per workspace: slug · main repo · “created <date> with `skills.enabled = false`” · chips (agents · owner · “turned on <date> by <person>” or “never turned on”) · badge **on** / **off**.

**Dialogs this page opens:** `skenable`, `skcfg` (both in `skills.md`).

## Data sources

| Element | Mockup collection | Target store (proposed) | Backing today | Status |
|---|---|---|---|---|
| On/off and creation date per workspace | `SK_ON`, `SK_CREATED`, `WS` | `.oxagen/skills.toml` presence per workspace; `workspaces.created_at` | `workspaces` (Postgres) for the date | 🟡 |

## Functionality

- Confirming `skenable` opens (and, in the mockup, merges) a pull request against the workspace's main repo; the page then renders the Skills tabs for that workspace, and the person is on the receipt. Runs already in flight finish without skills.

## States

- **loaded** — as above, on `finops` (created 2026-08-19, never turned on).

## Mobile

The two gate columns stack; the footer buttons go full width; workspace rows drop the badge under the text.

## Permissions

- Read: `skills.read` · Turn on: `skills.admin` on the workspace.
