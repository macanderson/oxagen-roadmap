# Steering · Skills · off (the default)

| | |
|---|---|
| Route | `#/a-intel/finops/steering/skills` (the old `#/a-intel/finops/skills` still resolves): any workspace whose `skills.enabled` is false (absent) |
| Scope | workspace |
| Spec | see `skills.md`; `steering.md` is the hub this tab belongs to |
| Design | `mockups/src/engine.js` → `pSkills()` → `skGate()`, rendered inside `stgHub()`, built into `mockups/missioncontrol.html` by `tools/build-mockup.mjs` |
| States | loaded (the gate renders in place of every view; loading, error, and denied are the Skills page's own, in `skills.md`) |
| Storybook | `Oxagen / … / skills-off`: one story per state, desktop and mobile (`npm run storybook`); the URL is `mockups/missioncontrol.html?product=1&state=<state>&mobile=<0|1>#<route>` |
| Audit | `skills-off.audit-prompt.md` |

## Job

Show that skills ship **off**: `skills.enabled = false` is the value a workspace is created with, not a value somebody set afterwards, and say exactly what turning it on would and would not do before offering to.

## What is on the page

**Header**: the Steering hub header (eyebrow “FinOps”, h1 “Steering”, the one-sentence subtext), the governance chip **Governance: regulated** (FinOps runs in regulated mode), and the seven tabs with Skills selected and no count on it (Records 59 · Skills · Memory · Ontology 1 · Policy 3 · Proposals 15 · Preview). The hub header carries no gold action here, because the gate holds the one primary action.

- **The gate**: lock glyph, h2 “Skills are off in FinOps”, sub “Every workspace ships this way. `skills.enabled = false` is the value a workspace is created with, not a value somebody set afterwards.”, badge **off**.
  - **What turning it on does**, four bullets: adds one tool to every agent’s belt in this workspace, `search_skills` (“Not a list of skills. A door.”); lets the harness load a skill file into the agent’s context, at a token cost this page prices to the cent; starts a `skills.searched` and a `skills.loaded` frame on every run that uses one, so a sealed run says exactly what procedure it was carrying; makes `.oxagen/skills.toml` a governed file, changed by a Context PR and not a settings screen.
  - **What it does not do**, four bullets: it grants no tool (a skill that describes a deploy still cannot deploy); it raises no tier (a skill on a `harness` tier agent is still delivered and recorded, never enforced); it does not reach into an unbound repo (the loop **stops and asks** rather than guessing); it does not turn on reflection (a second switch, with its own consent, on the Reflection tab).
  - Note “Why off, and not on.”: a skill is the one kind of context that tells an agent what to *do* rather than what is true; shipping that on by default would mean every new workspace inherits procedure nobody in it has read; so the first person to turn it on is named on the receipt, and the config they turn on is a file in the repo.
  - Footer: **Turn skills on for FinOps** (gold; → `skenable`) · **Read the config it would write** (→ `skcfg`) · “needs `skills.admin` on finops”.
- **Every workspace in Anderson Intelligence Corp.** (badge “the default is visible, not implied”): one row per workspace: slug · “<main repo> · created <date> with `skills.enabled = false`” · chips (“N agents” · owner · “turned on <date> by <person>” or “never turned on”) · badge **on** / **off**. core-platform reads “turned on 2026-08-02 by Marcus Bell” and **on**; the eight others read “never turned on” and **off**. A workspace with no recorded creation date shows “—”.

**Dialogs this page opens:** `govmode` (see `steering.md`), `skenable`, `skcfg` (both in `skills.md`).

**Shell.** As `steering.md`, on the FinOps workspace: sidebar with Steering lit (Fleet 1, Agent IAM 21, Steering 9), top bar with breadcrumbs ending on Skills, ⌘K search-or-run, notifications, the **Approvals** button (count of everything waiting on you across the organization) that opens the drawer `#apdrawer`, and the account avatar. No assistant button in the top bar.

## Data sources

Legend: ✅ backed today · 🟡 partial · ❌ no store (fixture in dev, `NotBacked` in production).

| Element | Mockup collection | Target store (proposed) | Backing today | Status |
|---|---|---|---|---|
| On/off and creation date per workspace | `SK_ON`, `SK_CREATED`, `WS` | `.oxagen/skills.toml` presence per workspace; `workspaces.created_at` | `workspaces` (Postgres) for the date | 🟡 |
| Who turned it on, and when | the `skenable` pull request | the merge of the pull request that set `enabled = true` | none | ❌ |
| Governance mode | `WS[].governance` via `wsGov()` | `.oxagen/rules/governance.toml` | read by `context.steering.policy.ts`; nothing writes it | 🟡 |

## Functionality

- Confirming `skenable` opens (and, in the mockup, merges) a pull request against the workspace's main repo; the page then renders the Skills views for that workspace, and the person is on the receipt. Runs already in flight finish without skills.
- The switch in `skenable` is `role=switch` and reads as the outcome; pressing it says so. The control is the pull request.

## States

- **loaded**: as above, on `finops` (created 2026-08-19, never turned on).

## Mobile

The seven hub tabs are one scrolling strip; the two gate columns stack; the footer buttons go full width; workspace rows drop the badge under the text. Top bar collapses to hamburger · current crumb · search glyph · notifications · approvals · avatar; the thumb bar is Fleet, Agents, Tools, Spend, More.

## Permissions

- Read: `skills.read` · Turn on: `skills.admin` on the workspace.

## Backend gaps this page depends on

- `.oxagen/skills.toml` presence per workspace, read through the repo binding.
- The receipt for the pull request that turned skills on, to fill “turned on <date> by <person>”.

## Rules every build of this page must keep

- The default is real: a new workspace comes up with this gate. A workspace that comes up with skills on is the most severe failure this page can show.
- A skill grants nothing, raises no tier, and the gate says so before offering the switch.
- Plain nouns. A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot, or a not/never contrast. Subtext under a heading is one sentence or nothing.
- Exactly one gold action per screen: the gate's.
- Nothing here writes a row. Turning skills on ends on a pull request.
