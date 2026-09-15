// The docs/*.md files the site shows under Specs & plans, in sidebar order, and the URL slug each
// one gets. A docs/*.md file missing from this list still renders: its slug is its file name
// without the date prefix, and it sorts after these.
export const DOCS = [
  ["2026-09-11-oxagen-mission-control-spec.md", "mission-control-spec"],
  ["2026-09-12-mission-control-app-implementation-plan.md", "implementation-plan"],
  ["2026-09-13-oxagen-desktop-spec.md", "desktop-spec"],
  ["2026-09-11-oxagen-demo-mockup-prompts.md", "demo-prompts"],
  ["2026-09-14-scale-back-prompt.md", "scale-back-prompt"],
  ["w13-in-the-loop-scenario.md", "w13-in-the-loop"],
];

export function docSlug(file) {
  const hit = DOCS.find(([name]) => name === file);
  if (hit) return hit[1];
  return file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
}
