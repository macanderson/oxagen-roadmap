# Creating things in Oxagen: agents, tools, skills and Steering records

| | |
|---|---|
| **Status** | Spec v1, for build, rev 1 scope. Amended 2026-09-24 by the fleet operations wedge (`fleet-operations-wedge.md`): a context record is a Steering record, skills are a kind on Steering › Sources, and the editing pages are the Steering source pages |
| **Date** | 2026-09-15 |
| **Owner** | Mac Anderson |
| **Source** | `mockups/src/engine.js` → `DLG_EXT.create`, `DLG_EXT.wz`, `wzTool`, `wzSkill`, `wzAgent`, `wzRecord`, `wzImport`, `wzImpPublish`, `pRecord`, `pSkillSource`; rendered in `mockups/missioncontrol.html` |
| **Builds on** | ADR-043 (Oxagen governs, it does not run); `mission-control-spec.md` §10 (context and steering), §14 (Mission Control); `w13-in-the-loop-scenario.md` |
| **Related** | `pages/steering-source.md`, `pages/steering-source-skill.md`, `pages/tools.md`, `pages/agents.md`, `pages/steering.md`, `pages/steering-prs.md`, `pages/repositories-changes.md` |

## 1. One shape, four things

There are four things an operator creates in Oxagen — an agent, a tool, a skill and a context
record — and all four are the same kind of object: **a file in a repository**. So all four are
created the same way:

> describe it → Oxagen drafts the file → you read the file → a pull request → it exists on merge

Nothing in this feature writes a row. No wizard has a Save button that ends in a database. The last
step of every one of them opens a pull request against the workspace's main repo, and the thing
exists when somebody merges it — which is also the only place a reviewer can stop it.

That is not ceremony. It is the same argument the Steering page has always made: people trust pull
requests, and a thing that can appear in a product by somebody clicking Save is a thing nobody
reviewed. It is also what lets the tool wizard offer to generate Rust: the code is yours, in your
repository, under your review. What Oxagen governs is the call, not the source.

**The drafting turn belongs to `oxagen.assistant`.** It is recorded with frames and a receipt like
any turn, and it is billed to Oxagen, never to the tenant: it is not one of your runs and it never
appears in Work or in Spend. Every line it drafts is the operator's to change before anybody
reviews it, and the wizard says so on every drafting step.

**The Markdown import is the one exception.** It reads CLAUDE.md, AGENTS.md, and any Markdown file
into records and memories. The records it accepts take the same road, one pull request per source
file. A line it accepts as a memory is written when the import publishes, steers at `may` or
`info`, and opens no pull request. The `create` chooser says so in its note. The wizard is
specified under Markdown import in `mockups/pages/steering.md`.

### Entry points

`Create` in ⌘K opens the chooser (`DLG_EXT.create`), and each page carries its own:

| Page | Action | Opens |
|---|---|---|
| Agents | **New agent** | `wzOpen("agent")` |
| Tools | **New tool** | `wzOpen("tool")` |
| Steering › Sources | **New source**, then **Write one** on the Steering record card | `DLG_EXT.newsrc`, then `wzOpen("record")` |
| Steering › Sources | **New source**, then **Add one** on the Skill card | `DLG_EXT.newsrc`, then `wzOpen("skill")` |
| Steering (header, every tab) | **Import Markdown** | `wzOpen("import")` |

Skills are a kind of Steering Source, not a page of their own. Sources lists every kind in one list
with a kind filter (`mockups/pages/steering.md`). The New source chooser also registers a document
and defines a glossary term, which are dialogs of their own and not wizards of this spec.

**New agent** is not **Register an agent**. Register wraps an agent that already runs on a machine
or in CI; New agent writes one that does not exist yet. Both end on a pull request; they start from
opposite ends.

## 2. The wizard shell

`S.wz` holds the draft. `wzSteps()` returns the step list, which is a function of the kind and — for
a tool — of the path the operator took at the recommendation. The rail shows every step, the one you
are on in gold, the ones behind you ticked.

A description field does not re-render the dialog on every keystroke; that would rebuild the textarea
and take the caret with it. The input event writes the draft and enables the one control the
description gates (`wzDescIn`), and nothing else.

## 3. A tool

There are two honest answers to "I want a tool that does X": somebody already wrote it, or nobody
did. Oxagen gives the first one where it can, because an imported tool arrives with a schema, a
publisher and a credential story, and a tool you write arrives with none of those until you write
them too.

1. **Describe** — the capability, not the implementation.
2. **Recommendation** — `mcpMatch()` scores the description against `MCP_CATALOG` on **whole words,
   never substrings**: "admin" contains "dm", and a matcher that does not know that will offer to
   import Slack for a feature-flag tool, which is worse than offering nothing because the operator
   cannot tell a real match from a spelling accident. Both paths are always shown; one is marked
   recommended, with the matched tools, their hazards, the publisher's verification state, the
   credential kind and what downscoping the provider allows.
3. **Import** — hands off to the existing importer with the server chosen. A server that moves money
   carries the warning that its financial tools are denied by construction until a named human owner
   with a finance role holds the connection and every agent that may call them holds a mandate.
   Import grants nothing.
4. **Manifest** (the build path) — `.oxagen/tools/<name>.toml`, drafted from the description, in the
   source editor. The classification chips above it are **read out of the file** by `tomlParse`, not
   out of a form: break the file and the chips say so and the step will not advance. Declare the
   worst case, not the common case — the gate a call gets is computed from category, risk, side
   effects, egress and financial class and nothing else.
5. **Code** — a handler in TypeScript, Python, Go or Rust, plus the input JSON Schema. All four do
   the same three things: read the grant off the call rather than a key out of the environment, pass
   the request id as the idempotency key so a retried call is one effect and not two, and declare
   their annotations so a server that lies about being read-only is a diff somebody can see.
6. **Pull request** — the manifest, both schemas, the handler, and a test that calls the tool with no
   grant and expects a refusal. Five checks: schema, name uniqueness, hazard fully declared, the
   financial rule (a financial tool whose input schema exposes no amount cannot be held against a
   mandate and is denied by construction), and a secret scan over all of it.

## 4. A skill

Three ways in, one way out.

1. **Source** — search the registry, describe it, or upload a bundle.
2. **Find it** (registry) — `skrMatch()` over `SKILL_REGISTRY`, showing publisher and verification,
   version, digest, load cost in tokens, install count and the proof rate somebody measured. Pinning
   takes the version and the digest, never "latest": a publisher shipping a new version is a digest
   diff somebody has to approve, which is exactly what `market = "hold"` means.
   **Describe it** — prose in, a `SKILL.md` out.
   **Upload** — a `.skill`, a `.zip` or a bare `SKILL.md`, read in the browser and hashed there.
   Choose what it replaces, and the version in the bundle becomes the pinned version: `2.1.0 →
   2.2.0`, with the digest shown before anything merges. The old version stays readable, because
   every run that loaded it named its digest.
3. **Review** — the file in the source editor, with its load cost priced to the cent. Every token is
   paid for on every turn it is loaded into, by every agent that loads it.
4. **Pull request** — six checks: frontmatter, semver strictly greater than what it replaces, digest
   recomputed at merge, grants (a skill cannot raise a tier or add a tool), secret scan, and the load
   cost against the workspace's search budget.

**Changing a skill** is `pages/steering-source-skill.md`: the same editor over `SKILL.md`, reached from
the skill's row on Steering › Sources and from the skill dialog, ending on the same kind of pull request with the
patch version bumped.

**Where it ends.** The pull request is listed on Repositories · Changes with kind `skill`. After the
merge the skill is on Steering › Sources at `?kind=skill`, and **sync** materializes its files into
each enrolled checkout. The Delivered by sync panel shows each repository’s state. The harness loads
the file by its own progressive disclosure. Only the description line competes in the assembler, and
Steering › Compiler shows it competing.

## 5. A Steering record

The kind is not a label. It decides how the statement is delivered, what the checks assert about it,
and how a run is allowed to use it — so the wizard makes you pick one before it will let you write
the sentence. What each kind can never do is in the wizard's component help
(`mockups/help/steering.md`, Steering record wizard), not on the cards.

1. **Describe** — the concern. Say the thing itself, not the reason for it: the reason belongs in the
   rationale on the pull request, where a reviewer reads it once, not in the bundle, where every
   agent pays for it on every turn.
2. **Kind** — six cards, each with the kind's description and what it is for.
3. **Statement** — the source editor over the statement, plus force, scope and, for the two
   constraining kinds, the constraint effect. Force is filtered by kind: a preference cannot be
   `must`, and a fact or a memory is `info`. A live preview shows the record card as it will read,
   and the step prices the bundle recompile.
4. **Checks** — the six, spelled out for this record. The fifth one earns the others: two people can
   each write a sensible record, six weeks apart, that together say a call must happen and must not,
   and the only place that is catchable is on the pull request, before either reaches a run. The step
   lists the checks; this reasoning is in its component help.
5. **Pull request** — merge is the publication, and the record is in force from the merge commit, not
   from when it was written.

**Reading and changing one** is `pages/steering-source.md`: the statement as the headline, a per-kind panel,
and the statement in the same editor.

**Where it ends.** The wizard closes on Steering › Proposals, on the Pull requests view
(`#/:org/:ws/steering/proposals/prs`), with the new pull request selected. After the merge the record
is on Steering › Sources at `?kind=record`, and its page shows its force, scope and token cost. A
constraint's panel says whether it carries an enforcement grant, which compiles it to a gate as well
as to text. A record written in the wizard carries no grant. Steering › Compiler shows where the record lands for an agent and a prompt: the
stable prefix for `must` and `should`, the volatile selection for `may` and `info`.

## 6. What this feature must never do

- Write a row. Every path ends on a pull request. A memory accepted in the Markdown import is the one
  exception (§1), and it steers at `may` or `info`.
- Let a record, a skill or a tool manifest grant authority. A record steers; a skill is prose; a tool
  version lands in the registry callable by nobody until a role grant puts it on a belt.
- Show a number stronger than the record holds, or a gate softer than policy would apply.
- Recommend an import on a substring match.
- Put more than one gold action on a screen. Gold is identity; it never encodes state.
