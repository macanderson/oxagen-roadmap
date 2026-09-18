# The Agent Portability Atlas

| | |
|---|---|
| **Status** | Research, step 1 of 3 |
| **Date** | 2026-09-13 |
| **Owner** | Mac Anderson |
| **Related** | ADR-090 (skill resolution), ADR-043 (Oxagen governs agents, does not run them), `mission-control-spec.md` (Skills, §14, App. E) |
| **Interactive version** | [claude.ai/artifact/YYawKKCKLASpWHcegLyXpC](https://claude.ai/artifact/YYawKKCKLASpWHcegLyXpC) — same content, comparison tables and full source citations |

A mandate's Equipment clause hands an agent "the knowledge it is handed at the start of a job, the skills and tools it may use" — set by engineering, enforced by Oxagen. Today that equipment is defined once, inside whichever harness happens to run the agent: a Claude Code subagent lives only in `.claude/agents/`, a skill only in the format the harness that wrote it understands. Move the workspace from Claude Code to Codex and the agent, the skill and its memory don't move with it — they were never Oxagen's to carry.

The ask this atlas answers: store the **raw**, native form of an agent, a skill and a memory record — not Oxagen's interpretation of it — in a shape that is Anthropic's own on-disk format first, and deliver it to any other code agent, including Codex, in the shape that agent already expects. This is inventory, not design: it establishes what the three formats actually contain today so a later spec can define the canonical store and the export renderers on solid ground.

## Method and caveats

Three parallel research passes against each vendor's live documentation, run 2026-09-18. Findings below are dated to that day — all three ecosystems ship weekly, and this table will drift.

Two gaps surfaced and are called out inline where they matter: Cursor's `environment.json` JSON Schema URL returned a 404 on direct fetch (documented as a pointer, not verified byte-for-byte); Cursor's official Memories doc page did not render fetchable content, so that section is synthesized from forum posts and staff replies, not a primary doc quote. Codex's `[agents]` table has two fields (`max_depth`, `job_max_runtime_seconds`) sourced only from a third-party writeup and flagged below.

## At a glance

- **Skills converge.** `SKILL.md` + YAML frontmatter is now the shared atomic unit across all three vendors. `name` and `description` are the only fields guaranteed to round-trip everywhere.
- **Agents don't.** Anthropic and Codex both define a real named agent (prompt + model + tool scope). Cursor has no such file — its one custom-persona feature was removed in 2.1.
- **Instructions converge.** `AGENTS.md` is read natively by Cursor and Codex; Anthropic's own convention — used in this repo — is a `CLAUDE.md` that `@`-imports it.
- **Memory doesn't.** Only Anthropic publishes a typed, file-based memory schema. Cursor's is undisclosed; Codex's is deliberately unstructured, plain-text and opt-in.

## 1. Agents — named, invocable personas with a system prompt

A named identity with a system prompt, a model, and a tool or sandbox scope — the thing Oxagen's `agent.definition.*` capabilities already model as an in-app governed agent.

| Field | Claude Code | Cursor | Codex |
|---|---|---|---|
| Primary artifact | `.claude/agents/<name>.md` — YAML frontmatter + Markdown body; or SDK `AgentDefinition` object | *None.* `.cursor/environment.json` configures a Cloud Agent's sandbox/VM, not a persona | `.codex/agents/<name>.toml` (project) or `~/.codex/agents/<name>.toml` (user) — flat TOML |
| Required fields | `name`, `description` | n/a | `name`, `description`, `developer_instructions` |
| System prompt | Markdown body, below the frontmatter fence | n/a | `developer_instructions` — a TOML string field carrying the same content inline |
| Model / effort | `model` (alias, full ID, or `inherit`), `effort` (low/medium/high/xhigh/max) | n/a (Cloud Agents inherit the session's model) | `model`, `model_reasoning_effort` (low/medium/high) |
| Tool scope | `tools` allow-list, `disallowedTools` deny-list, `mcpServers` — fine-grained, per tool name | n/a — no tool-scoping field found on any agent-adjacent config | `sandbox_mode` (read-only / workspace-write / danger-full-access — narrows only), `mcp_servers` |
| Isolation / runtime | `isolation: worktree`, `permissionMode`, `background` | `environment.json`: `snapshot`, `build.dockerfile`, `install`, `start`, `terminals[]` — a full container spec | `sandbox_mode` only; inherits the parent session's runtime otherwise |
| Built-in types | `general-purpose`, `Explore`, `Plan` — overridable by a same-named custom agent | n/a | `default`, `worker`, `explorer` — overridable by a same-named custom agent |
| Discovery precedence | managed settings → `--agents` CLI flag → project `.claude/agents/` → user `~/.claude/agents/` → plugin | repo `environment.json` → personal saved → team saved (config only — no persona to resolve) | project `.codex/agents/` and user `~/.codex/agents/`; global tuning via `[agents]` in `config.toml` |
| Packaging / versioning | `plugin.json` `agents` field bundles many, with dependency metadata; no per-file version | None found | None found — loose files, no manifest |

**Where they agree:** Anthropic and Codex both express an agent as `{name, description, prompt-as-string, model, tool/sandbox scope, MCP bindings}` — a near 1:1 structural match; YAML+Markdown vs. pure TOML is a serialization choice, not a conceptual one. Both support project- and user-level definition directories, project taking precedence, both ship built-in default agents a custom file can override.

**Where they don't:** Cursor has no portable persona concept at all — Custom Modes, the one feature that matched, was removed in Cursor 2.1, so there is no like-for-like target to deliver an Oxagen agent *to* Cursor. Tool authority is expressed oppositely — Anthropic's named allow/deny list vs. Codex's coarse three-tier sandbox bucket that can only narrow — so folding one into the other is lossy in one direction. Only Anthropic has a manifest layer (`plugin.json`) that bundles and versions multiple agents together.

## 2. Skills — packaged, invocable procedure

A folder describing one reusable procedure, with progressive disclosure into scripts, references and assets. This is the concept nearest to convergence, and the one `.oxagen/skills.toml` already governs the *resolution* of (ADR-090) — without storing the raw file itself.

| Field | Claude Code | Cursor | Codex |
|---|---|---|---|
| Primary artifact | `<skill>/SKILL.md` + `scripts/`, `references/`, `assets/` | Same shape | Same shape, plus a sidecar `agents/openai.yaml` for UI/behavior metadata |
| Required frontmatter | `description` recommended (`name` defaults to folder); the portable Agent Skills spec requires `name` + `description` | `name`, `description` | `name`, `description` — nothing else in-file |
| Full optional set | **CLI superset, ~19 fields:** `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`, `effort`, `context: fork` + `agent`, `background`, `hooks`, `paths`, `shell`, `metadata`, `license`, `compatibility`. **Portable spec, 6 fields, upload-enforced:** `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools` — anything else is rejected on upload | `paths`, `disable-model-invocation`, `icon`, `color`, `metadata` — 6 fields | None in SKILL.md — UI/behavior metadata lives in `agents/openai.yaml` instead |
| Discovery root | `.claude/skills/` (project), `~/.claude/skills/` (user), plugin, synced | `.cursor/skills/` *or* `.agents/skills/` (project); user equivalents — dual path | `.agents/skills/` primary — walks CWD to repo root, then `$HOME/.agents/skills`, then admin `/etc/codex/skills`, then built-in. Not `.codex/skills/` |
| Invocation gating | `disable-model-invocation`, `user-invocable` | `disable-model-invocation` — same field name | `policy.allow_implicit_invocation` (sidecar, inverted polarity) |
| Tool restriction | `allowed-tools` / `disallowed-tools` | None | `dependencies.tools` (sidecar) — a requirement, not an allow-list |
| Packaging / distribution | `plugin.json` `skills` field; Skills API zip upload, immutable slug, full-snapshot versions, 30 MB cap | `.cursor-plugin/marketplace.json` | None in-repo; OpenAI's curated catalog repo (`github.com/openai/skills`), no per-skill version field |

**Where they agree:** All three converge on `SKILL.md` + YAML frontmatter as the atomic unit, with the same three-tier progressive-disclosure shape underneath. `name` + `description` is the one pair every skill can carry losslessly everywhere. All three support explicit and implicit invocation with a boolean to disable the implicit path. Cursor is actively migrating its own legacy formats into this shape (`/migrate-to-skills`, 2.4+) — Skills, not Rules, is Cursor's own durable target.

**Where they don't:** Frontmatter richness spans roughly 9× (Anthropic ~19 fields, Cursor 6, Codex 2). Codex is the only one that pushes UI/behavior metadata into a separate sidecar file rather than SKILL.md frontmatter — a Codex-targeted exporter writes two files, not one. Discovery root differs by vendor, though `.agents/skills/` is shared by two of the three. Only Anthropic runs a formally versioned, validating upload endpoint outside a single repo.

## 3. Memory — instructions vs. what the agent learned

Every vendor ships *two* layers under "memory": a deterministic, human-authored, version-controlled **instructions** layer, and a separately generated, personal **session memory** layer that is not synced or shared by default.

| Field | Claude Code | Cursor | Codex |
|---|---|---|---|
| Instructions layer | `CLAUDE.md` hierarchy — managed → user → project → local (`CLAUDE.local.md`, gitignored); `@path` imports (max depth 4); 4 MiB cap. No native `AGENTS.md` read — the convention (used in this repo) is a `CLAUDE.md` that `@`-imports it | `.cursor/rules/*.mdc` (+ legacy `.cursorrules`), and native `AGENTS.md` as "a simple alternative to `.cursor/rules`" | Native `AGENTS.md` — root-to-CWD walk, `AGENTS.override.md` per directory, concatenated; `project_doc_max_bytes` (32 KiB default), `project_doc_fallback_filenames` |
| Generated session memory | **Auto memory** — `~/.claude/projects/<project>/memory/`: `MEMORY.md` index (200 lines / 25 KB cap) + topic files with typed YAML frontmatter (`name`, `description`, `metadata.type` ∈ `user \| feedback \| project \| reference`). Machine-local. Toggle: `/memory`, `autoMemoryEnabled` | **Memories (beta)** — auto or manual, approval-gated before saving. Personal *and* project scoped at once; not synced to teammates. Storage format undisclosed — no official schema page renders as of this research | **Memories** — off by default; EEA/UK/CH require explicit opt-in. `[features].memories = true` + `[memories]` sub-table. Storage: plain markdown, `~/.codex/memories/` |
| Raw session log | Not published as a portable schema in this research | Not found | Full JSONL rollouts — `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`, distinct from Memories |
| Structure of the generated layer | Typed, closed taxonomy (4 kinds), file-based, documented | Undisclosed | Deliberately unstructured — "no embedding store, no similarity search — plain text and substring matching, by design" |
| Portability today | Most portable — documented format, typed frontmatter, plain files a script can read and write | Least portable — no disclosed storage, no read path outside the Cursor UI | Portable in principle (plain markdown) but regulated and explicitly non-semantic |

The auto-memory row above is not a secondhand description — it is exactly the mechanism the research for this atlas ran under, confirmed live against `code.claude.com/docs/en/memory` as Anthropic's current canonical structured-memory schema.

**Where they agree:** All three separate a deterministic instructions layer from a separately generated, personal memory layer not synced team-wide by default. None treats its generated memory as something a person hand-edits and expects to survive. The instructions layer is converging on `AGENTS.md`.

**Where they don't:** Only Anthropic publishes a typed schema for generated memory — a converter can round-trip it faithfully, can only approximate Cursor's, and must flatten Codex's taxonomy into plain paragraphs. Codex gates memory generation behind a feature flag and, in some jurisdictions, a legal opt-in. Codex alone has a separately documented raw-transcript store, a richer source to derive memory from but not itself "memory" in the other two vendors' sense.

## Cross-cutting convergence

**`AGENTS.md` is becoming the shared instructions file.** Cursor reads it natively as an alternative to `.cursor/rules`. Codex defines its entire instructions layer around it, with override files and a documented merge order. Claude Code does not read it directly, but its own convention — a `CLAUDE.md` that `@`-imports `AGENTS.md` — is precisely the pattern this repository's own Oxagen monorepo already uses.

**`.agents/skills/` is forming as a shared skill root.** Codex's primary skill-discovery path is `.agents/skills/`, not a Codex-specific directory. Cursor supports the same path as an alternative to `.cursor/skills/`. Anthropic has not adopted it — `.claude/skills/` remains its only path — but two of the three vendors already treat `.agents/` as the vendor-neutral root.

**Anthropic already ships the converter's mirror image.** Claude Code's own `/import` command (v2.1.213+) reads another coding agent's AGENTS.md, MCP servers, commands, subagents and skills and writes them into Claude Code's native format in one pass; `/init` normalizes against Cursor, GitHub Copilot, Devin, Windsurf and Cline formats by name. That is Anthropic's own precedent for exactly the machinery this atlas is scoping, in the opposite direction.

**MCP server config: same protocol, three unrelated files.** All three are MCP clients, and none of their config schemas match — `.mcp.json`, `.cursor/mcp.json`, and TOML `[mcp_servers.<id>]` tables all differ in field names and structure. Out of scope for this atlas (the Equipment clause's *tools* half, not agents/skills/memory) but adjacent enough to flag for whoever scopes that spec next.

## Where Oxagen stands today

Oxagen already has a shape for all three concepts — none of them store or emit the vendor-native raw form the ask requires.

- **`agent.definition.*` — an in-app agent, not a portable one.** `create_agent_def` and its siblings store `{slug, name, description, agentType, avatarUrl, config: {graph, agentTools, instructions}}`. `instructions` is a single string — no field for a raw source document, a vendor tag, or a body that round-trips back to a `.claude/agents/*.md` file or a Codex `.toml`.
- **`.oxagen/skills.toml` — resolution is governed, content is not stored.** ADR-090 makes Oxagen the authority over which skills a wrapped harness may find and load, with versioning, digests and evidence — but it deliberately never runs a skill, and does not store the skill's raw `SKILL.md` content. `list_skills` is a read-only inventory of the *names* a harness reported at session start: no version, digest, source or content travels with it.
- **`agent.memory_import.parse` / `.commit` — a one-way, lossy funnel.** This capability already ingests uploaded markdown — "skill files, rule docs, playbooks" — but by design an AI model reads each document and writes atomic `AgentMemory` records into Oxagen's own kind+weight taxonomy. The original file's raw bytes, its exact frontmatter, and its vendor-native shape are not retained anywhere the system can later hand back out.

Every surface Oxagen has today re-interprets the source into its own internal shape at ingest time, and none has an export path back to any vendor's native format — Anthropic's included. That is the specific gap this atlas exists to name.

## Proposed direction

Not a design — the shape the next spec should start from, given what this inventory found.

- **Store raw bytes alongside the interpreted record.** Every ingest path (agent create, skill resolution, memory import) keeps the verbatim source plus a `sourceFormat` tag (`anthropic-agent-md`, `anthropic-skill-md`, `cursor-skill-md`, `codex-skill-md`, `codex-agent-toml`, …) so nothing is lost even where Oxagen's own model only understands a subset today.
- **Anthropic's shape is the canonical native store, per the ask.** It is the widest of the three for both agents and skills — a near-superset of Cursor's and roughly isomorphic to Codex's — so the other two become renderers *of* it rather than three independent schemas Oxagen has to keep in sync by hand.
- **Exporters are per-format renderers with declared fidelity, not one shared schema.** Codex agent export: lossless. Codex skill export: lossless content, split into two files. Cursor skill export: lossless. Cursor agent export: no target exists — the renderer has to say so rather than silently drop the persona.
- **Leave memory export out of the first cut.** Cursor's format is unpublished, so there is no safe canonical superset yet. Anthropic ↔ Codex memory portability is buildable now — both are plain, typed-or-typable files — and should land first.

## Open questions

1. Where does a customer-facing "deliver this agent to `<harness>`" action live — a new `agent.definition.export`-shaped capability, or a projection through the existing `.oxagen/skills.toml` resolution and evidence pipeline? This is an architecture decision under SCR-002 and needs an ADR, not a default.
2. Does raw-source retention change the shape of `skills.config_versions` (ADR-090 §8), or does it need its own store?
3. Who owns keeping this atlas current as all three vendors ship weekly — a scheduled re-audit, or a drift check tied to a specific doc URL per vendor?

## Sources

- [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents), [agent-sdk/subagents](https://code.claude.com/docs/en/agent-sdk/subagents)
- [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills), [agent-sdk/skills](https://code.claude.com/docs/en/agent-sdk/skills), [plugins-reference](https://code.claude.com/docs/en/plugins-reference), [memory](https://code.claude.com/docs/en/memory)
- [platform.claude.com — Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview), [Skills guide](https://platform.claude.com/docs/en/build-with-claude/skills-guide)
- [cursor.com/docs/rules](https://cursor.com/docs/rules), [skills](https://cursor.com/docs/skills), [mcp](https://cursor.com/docs/mcp), [cloud-agent](https://cursor.com/docs/cloud-agent), [cloud-agent/setup](https://cursor.com/docs/cloud-agent/setup), [changelog/2-1](https://cursor.com/changelog/2-1)
- [forum.cursor.com — Custom Agents removed](https://forum.cursor.com/t/custom-agents-feature-removed/143897), [Memories](https://forum.cursor.com/t/about-cursors-memory-record-feature/107355)
- [learn.chatgpt.com — Codex config reference](https://learn.chatgpt.com/docs/config-file/config-reference), [subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [skills](https://learn.chatgpt.com/docs/build-skills), [MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), [memories](https://learn.chatgpt.com/docs/customization/memories)
- [github.com/openai/skills](https://github.com/openai/skills)
