# Mission Control v2

A separate, interactive redesign built on the current Oxagen app's shell, house colors, typography, route structure, and Fleet data concepts. V1 and its creation wizards remain unchanged.

## Open

- `npm run storybook -- --port 6016`: choose **Oxagen V2 / Mission Control**.
- `npm run mockups:v2`: rebuild `mockups/v2/missioncontrol.html`, which opens directly from disk.
- `npm run build-storybook`: includes v2 in the static Storybook output.
- `npm run check:v2`: targeted regression checks.

Storybook's development server assembles `/v2/missioncontrol.html` from the current sources on each request. Static builds include the same document. All harness SVGs are embedded, so they work from disk and in Storybook without a remote image service.

## Design

- Fleet: 3/5 run table, 2/5 secondary rail, stacking on narrow screens. Approvals show two requests initially, with access to the complete list. Coaching and context follow in the rail.
- Runs: active first, then recent; 25 rows by default; 10/25/50 page sizes; combined search/operator/harness/repository filters; page selection and mass steering. Filtering resets pagination and selection.
- Each row includes a human task title, work summary, operator avatar, named harness with its SVG, model, effort when provided, repo, PR where present, file and line counts, spend, token count and cache reuse. The table scrolls within its panel; the pager stays outside that scroll area.
- Run details: overview, trace summary, changes, and access to the original full trace/replay view.
- Coaching: trace review and editable notes, stored independently per run for the current browser session.
- Spend: operator, agent, harness and call-category attribution, with a run drilldown.
- Shared context: a quiet overview linking to the retained records, skills, memory and context preview flows.
- Timestamps: `Aug 4 2026 11:33 AM`, using separate unbreakable date and time spans; the only allowed wrap is between them. Fixture timestamps are displayed in UTC, identified in run details and time tooltips.
- Registration and record/skill/agent creation reuse the original engine functions. V2 does not copy or edit wizard implementations.

## Data boundary

These are interactive mockups, not connected telemetry. Existing run IDs, operators, task titles, summaries, statuses, cost fixtures and cache ratios are reused. The v2 data layer supplements them with illustrative file/line counts, token counts, effort settings, tool-cost allocation and absolute timestamps. The additional harness assignments for legacy custom runtimes demonstrate Cursor, Claude Desktop and ChatGPT; they are not migration rules for real records. Coaching examples and compact trace summaries are presentation fixtures; the full trace opens the retained source mockup.

Token efficiency is explicitly **cached input tokens / total input tokens**, weighted by token count. It does not claim that cached work was useful. Cursor spend is unmetered and excluded from dollar totals, rather than displayed as zero. Other dollar figures are client-reported estimates. Tool-category amounts partition the same run total. No mockup action sends data to a real agent or provider.

## Sources

- App baseline: `oxagen/apps/app/src/features/{shell,fleet}`, `apps/app/src/app/globals.css` and `packages/ui` house tokens.
- Original mocks and unchanged wizards: `mockups/src`, `mockups/fixtures`.
- Stella: `oxagen-brand/logo/svg/stella-icon-light.svg` and `stella-icon-dark.svg`, copied unchanged.
- Claude Code, Claude Desktop, Codex, Cursor and ChatGPT: [Lobe Icons SVG collection](https://github.com/lobehub/lobe-icons/tree/master/packages/static-svg/icons). Original filenames: `claudecode-color.svg`, `claude-color.svg`, `codex-color.svg`, `cursor.svg`, `openai.svg`. Retrieved September 19, 2026. MIT license retained in `assets/LICENSE-lobe-icons.txt`; brand marks remain their owners' trademarks.
- Brand references checked: [Cursor](https://cursor.com/brand), [Anthropic](https://brandfolder.com/anthropic/), [OpenAI](https://openai.com/brand/).

Claude and Codex retain the source coloring. Cursor and ChatGPT use their monochrome source marks, with `currentColor` resolved to ink/white for light/dark backgrounds. Colored marks have identical files for both themes where the brand colors already work on each surface. Assets have recorded SHA-256 checksums.
