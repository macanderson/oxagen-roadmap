# v3 mockup

A person running coding agents today keeps their instructions in a CLAUDE.md here, an AGENTS.md there and Cursor rules somewhere else. Their MCP servers sit in three config files on three laptops, some with keys in plaintext. Their work lives in GitHub, Linear and Jira. Nobody can say what an agent did last night or what it cost, because the transcript is a file on one machine and the bill is one number.

v3 is the product cut down to that problem. It is a target for finding the wedge, built beside the rev1 master (`mockups/missioncontrol.html`), which it does not change. It clones the master's design system and its demo record: Anderson Intelligence Corp. (`a-intel`), workspace Core platform, operator Marcus Bell.

Open `mockups/v3/index.html` from disk. Issue #133 tracks it.

## The wedge

Five jobs, in the brief's words:

1. **Steering in one place.** One list of instructions, rules, skills and memories. oxagen writes each item into the file every harness reads.
2. **MCP servers in one place.** One list of servers. oxagen holds the keys, and every harness points at one gateway.
3. **Work comes in, and you give it to an agent.** Items arrive from trackers. Send one to an agent in two clicks.
4. **Full spend attribution.** Every dollar traces to a model request, and every request to a session, a work item, an agent, a person, a model and the MCP server whose tokens it carried.
5. **Transcript replay.** A session replays the way its harness showed it. A Claude Code session looks like Claude Code.

## Areas

Six navigation items, and no area has more than one row of tabs.

| Area | What it answers | Route |
|---|---|---|
| Work | What is waiting, what is running, what is ready to review | `#/a-intel/core-platform/work` |
| Sessions | What each agent did, replayed, and what it cost | `#/a-intel/core-platform/sessions`, `.../sessions/<id>` |
| Agents | Who runs where, on which harness and model, and against which budget | `#/a-intel/core-platform/agents` |
| Steering | What every agent is told, where it lands, and what it costs | `#/a-intel/core-platform/steering` |
| MCP servers | Which servers every agent gets, who holds the keys, and which tools need a person | `#/a-intel/core-platform/servers` |
| Spend | The month, grouped by work item, agent, person, model or MCP server | `#/a-intel/core-platform/spend` |

A bare word also works as the hash (`#work`, `#sessions`, `#replay`, `#agents`, `#steering`, `#servers`, `#spend`), for a host that passes only a plain anchor.

## The session page

The transcript starts in the first viewport. Above it sit one heading, one line of facts (harness, agent, person, model, work item, start) and the replay bar. The terminal is the harness's own screen, and nothing oxagen adds is drawn inside it:

- **Claude Code** draws its banner with the mascot, `>` prompts, `⏺` replies and tool calls, `⎿` results, `Update Todos`, `Read`, `Write` with numbered lines, `Update` with the red and green diff, `∴ Thinking…`, the orange spinner, and its own permission prompt.
- **Codex CLI** draws its boxed banner, `›` prompts, `• Explored`, `• Ran`, `• Edited (+a -b)`, `• Called server.tool(...)` and the `Worked for` rule.
- **Cursor** draws its agent panel: the message box, `Thought for`, file and terminal cards, and the composer.
- **stella** draws its black-and-gold TUI: the turn rule, the rails, `▸ read`, `● edit`, `● run`, `✦ skill` and the status bar.

oxagen's additions sit in a gutter and a margin beside the terminal: the time of each row, the cost of each model request, the MCP server a call went to, whether policy allowed it, who sent a message from oxagen, and how long the session waited. The rail on the right holds the cost, the cost of each request, where the money went, and what changed.

The replay bar plays, pauses, steps and scrubs at 1× to 16×. Space plays and pauses, the arrow keys step, and `o` shows thinking, the way `ctrl+o` does in Claude Code. The cost, the request count, the token count, where it went and the changes all follow the replay clock. A gap over 12 seconds plays as three, and a gap over a minute is marked in the margin with how long the session waited.

The Claude Code session is waiting on a question: oxagen's policy asks a person before `github create_release`. The terminal shows Claude Code's own permission prompt, and the margin carries Approve and Deny. Either answer reaches the transcript and finishes the session. Approve moves the work item to Review with its draft release, and Deny moves it to Review with the release held.

Sending a work item to an agent opens its new session, which starts replaying at once. The four sessions with a full transcript carry a Replay badge in the Sessions list. Every other session shows its record and cost and says the transcript is not in this mockup.

## Spend attribution

One rule prices every session (`src/ledger.js`). A model request re-reads everything already in the context at the cache-read price, writes what was added since the last request at the cache-write price, and generates its output at the output price. Every token has a source:

| Source | What it is |
|---|---|
| Model output | What the model wrote |
| The harness's prompt and tools | Claude Code's, Codex's, Cursor's or stella's own system prompt and tool list |
| Steering | The items delivered at session start, and each skill a session loaded |
| An MCP server | The definitions of the tools it leaves on, and every result it returned |
| Files and commands | Reads, edits and command output |
| Conversation | The person's messages and the model's earlier replies |

Because every figure is a sum of those, the numbers agree everywhere. A transcript's cost is the sum of its requests. Every Spend grouping sums to the month total to the cent, and the check fails if one does not. A steering item's cost is its share of each session's steering tokens, so the Steering list sums to the steering cost its header states. A server's cost is what its definitions and results added, which is why its drawer can price the tools that are on and never called.

Cursor's model calls do not pass through the oxagen gateway, so a Cursor session says its cost is reported by Cursor. The gateway meters the rest.

## Vocabulary

v3 uses the brief's words where rev1's glossary (`docs/fleet-operations-ia.md`, Vocabulary) chose others:

| v3 says | rev1 says | Why |
|---|---|---|
| session | run | Claude Code, Codex, Cursor and stella all call it a session, and so does the brief |
| MCP server | provider | The brief asks for "your mcp servers in one place", and every harness config calls them MCP servers |

Everything else follows rev1: oxagen and stella in lowercase, work item, no "task" in product copy, and no person scored or ranked.

## Cuts

Nothing below is deleted. Every rev1 view is still in the master, specified in `mockups/pages/`, and built. v3 asks which of it a buyer meets first.

| rev1 | Where it went in v3 |
|---|---|
| Work orders, workflows, stages, the Intake dialog, definitions of done | Work is one inbox. Send to an agent carries the brief, the note and the cost cap |
| Findings | Left out. Spend shows where the money went, and a steering suggestion carries the cost of the fix-up it would save |
| A run's five tabs: Decision trace, Transcript, Cost, Memories, Evidence | One session page: the replay, the cost in its margin, and the rail |
| Steering Sources and SteeringFrames, the envelope, injection points, the Compiler, Assignments, Proposals, Steering pull requests | One list, with who each item applies to, where it lands in each harness, and suggestions drawn from sessions |
| Tools, toolbelts, providers, policy versions, kill switches | MCP servers, with Allow, Ask or Off on each tool |
| The approvals drawer | The question in the transcript, answered from the margin, and a count in the top bar |
| An agent's tabs: identity, toolbelt, runtime, permissions, activity, source | One agent card and drawer |
| Runtimes | The agent's host |
| Repositories | The Changes panel of a session, and the work item |
| Organization, roles, API keys, billing, audit | The account menu, not in this mockup |
| The tier ladder | One line under each session's cost: metered by the gateway, or reported by the harness |
| Budgets, optimization and operator habits | Budgets on agent cards, the unused-tool saving on each server, and suggestions with their cost |
| The stella drawer and notifications | Left out. rev1 keeps the in-app agent by the maintainer's decision of 2026-09-14 |

One rev1 cut comes back. The wedge of 2026-09-24 removed the transcript playback (`docs/fleet-operations-wedge.md`, D14). v3 restores it because the brief calls it very important.

## Commands

```sh
node tools/build-mockup-v3.mjs          # write mockups/v3/index.html
node tools/build-mockup-v3.mjs --check  # the page is what the sources produce
node mockups/v3/gen-sessions.mjs        # regenerate fixtures/sessions.json
node tools/check-mockup-v3.mjs          # the headless walk, with --shots DIR for screenshots
npm run check:v3                        # all three checks
```

`npm run build` and `npm run check` run them with the rest of the repo's guards, and Storybook shows every view under Oxagen v3.

The URL takes `?theme=dark|light`, `?state=empty` (the first run, before anything is connected) and `?phone=1` (the 400 px phone preview). A floating pill in the corner switches the same three, and `?island=0` hides it. The pill is mockup chrome, not product UI.

The headless walk opens every view in both themes, desktop and phone, and fails on a script error, sideways scroll, a transcript below the first viewport, a replay that does not reach its end, a question that cannot be answered, a Send that opens no session, a drawer or dialog that does not open, money that does not reconcile, or copy that breaks the house rules.

## Data boundary

Interactive fixtures, not telemetry. The prices in `fixtures/prices.json` are illustrative list prices, and nothing here was measured. `fixtures/sessions.json` holds the 232 September sessions other than the four with a transcript, written by `gen-sessions.mjs` from a seeded generator through the same ledger the page uses. No action sends anything to a real agent, tracker or server.

## Sources

| Path | What it is |
|---|---|
| `src/v3.css` | Part 1 is copied from `mockups/src/engine.css`. Part 2 is the replay, the four skins and the six areas |
| `src/marks.js` | The wordmark, harness marks, tracker logos and glyphs, copied from `mockups/src/engine.js` |
| `src/ledger.js` | The accounting rule, shared by the page and the generator |
| `src/core.js`, `src/data.js` | State, routes, formatting, and every derived figure |
| `src/replay.js` | The event model, the four skins, the margin and the replay clock |
| `src/views.js`, `src/boot.js` | The six areas, the dialogs and drawers, and the first render |
| `fixtures/*.json` | The demo record: org, agents, harnesses, prices, work, steering, servers, transcripts and sessions |
| `stories/v3.stories.js` | The Storybook entries |
