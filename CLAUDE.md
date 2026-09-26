# Instructions

The global rules in `~/.claude/CLAUDE.md` apply here (fix over file, clear prose, plain-noun
headings, worktrees under `~/Projects/.worktrees/<repo>/<slug>`, `rg` and `fd` over `grep` and
`find`).

## Local execution

Mac set this on 2026-09-26 for every repository on this machine. Local builds, test runs, dev servers, and git hooks ran the laptop out of memory and killed agent runs partway through, and every killed run costs money. CI is the only place code is built, checked, or tested.

- Do not run the gate, a build, a typecheck, a lint, or any test, not even one test file. Push the branch and read the CI result. Read a failed job with `gh run view --job <id> --log-failed`.
- Do not start a dev server: no `next dev`, `next start`, `pnpm dev`, a server under `cargo run`, or anything else that listens on a port.
- Do not start Docker or Colima, and do not run anything that needs them.
- Do not run Biome in any form.
- Git hooks are off on this machine. `LEFTHOOK=0` and `HUSKY=0` are set for every shell and every Claude Code session. Do not reinstall a hook, turn one back on, or run a hook's commands by hand.
- Code generators and small integrity scripts that only read and write files are allowed, such as regenerating a checksum, a schema index, or a message catalogue.
- Put this rule, word for word, in the prompt of every subagent you start.

## Headings and labels: plain nouns

A heading names the thing, a caption states one fact, and no label carries a comma, a mid-dot,
or a "not / never" contrast. Subtext under a heading is one sentence or nothing. Mac banned the
aphoristic style on 2026-09-21 ("Retrieval, in numbers", "Summary · what this run changed",
"ordered by the frames, not by kind", "what Oxagen injected, and what it cut"): it is hard to
scan and too dense. This applies to UI headings, panel titles, table headers, captions, hints,
docs and mockups, every repo.

## Mockups

`mockups/` is the authoritative design of rev1 and `mockups/pages/*.md` its per-page specs and
audit prompts. `mockups/future_state_mockups/` is the first version (witness runner, proof, the
definition of done, agent scores); it is not the target.

The design reference sits beside the mockup: `mockups/typography.html`, `colors.html`,
`prose.html`, and `components.html`, with one page per component in `mockups/components/`. Those
component pages are generated. Edit the module in `mockups/components/src/`, then run
`node tools/build-components.mjs`. `node tools/check-design-docs.mjs` opens every reference page
headless in both themes. It launches a browser, so it is not run on this machine, and no CI job
runs it yet.
