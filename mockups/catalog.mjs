// The catalog of mockups/missioncontrol.html, the authoritative design of rev1: every page with the states its renderer implements,
// and every guided scenario. Storybook (mockups/stories) and tools/check-mockup.mjs both read
// this file, so the catalog and the checks cannot disagree.
//
// A page gets a state only if its renderer branches on it (the S.state checks in its pX / obX
// function in src/engine.js); a state a page does not implement is not listed, so no story shows
// a state the design lacks. The auth screens have no empty state; the installer has only
// loaded; the gate steps have loading and denied, and the first-run step an error.

export const ORG = "a-intel";
export const HOME = `#/${ORG}/core-platform`;

export const ALL = ["loaded", "empty", "loading", "error", "denied"];
const NO_EMPTY = ["loaded", "loading", "error", "denied"];

export const PAGES = [
  // The unique views of the fleet operations wedge (docs/fleet-operations-ia.md, Unique views). A view
  // this change added or redesigned is designed loaded only; `future` marks a view with future-only
  // fields, which gets a second story with ?future=1 outlining them. `drawer` opens a global drawer.
  { id: "work-backlog",      title: "Backlog",                     group: "Work",         hash: `#/${ORG}/core-platform/work`,                             states: ["loaded"], future: true },
  { id: "work-in-progress",  title: "In progress",                 group: "Work",         hash: `#/${ORG}/core-platform/work/in-progress`,                 states: ["loaded"], future: true },
  { id: "work-intake",       title: "Intake",                     group: "Work",         hash: `#/${ORG}/core-platform/work?intake=providers`,            states: ["loaded"] },
  { id: "work-item",         title: "Work item",                   group: "Work",         hash: `#/${ORG}/core-platform/work/items/tsk_01K5RS482Q`,        states: ["loaded"], future: true },
  { id: "work-orders",       title: "Work orders",                 group: "Work",         hash: `#/${ORG}/core-platform/work/orders`,                      states: ["loaded"], future: true },
  { id: "work-order",        title: "Work order",                  group: "Work",         hash: `#/${ORG}/core-platform/work/orders/wo_01K5RS7M4N`,        states: ["loaded"], future: true },
  { id: "work-workflows",    title: "Workflows",                   group: "Work",         hash: `#/${ORG}/core-platform/work/workflows`,                   states: ["loaded"], future: true },
  { id: "work-findings",     title: "Findings",                    group: "Work",         hash: `#/${ORG}/core-platform/work/findings`,                    states: ["loaded"], future: true },
  { id: "run",               title: "Decision trace",              group: "Runs",         hash: `#/${ORG}/core-platform/runs/run_01K5RS7M2E8FJ3QW`,         states: ["loaded"], future: true },
  { id: "run-transcript",    title: "Transcript",                  group: "Runs",         hash: `#/${ORG}/core-platform/runs/run_01K5RS7M2E8FJ3QW/transcript`, states: ["loaded"] },
  { id: "run-cost",          title: "Cost",                        group: "Runs",         hash: `#/${ORG}/core-platform/runs/run_01K5RS7M2E8FJ3QW/cost`,    states: ["loaded"] },
  { id: "run-evidence",      title: "Evidence",                    group: "Runs",         hash: `#/${ORG}/core-platform/runs/run_01K5RS7M2E8FJ3QW/evidence`, states: ["loaded"], future: true },
  { id: "run-memories",      title: "Memories",                    group: "Runs",         hash: `#/${ORG}/core-platform/runs/run_01K5RK7C2V8BNM3X/memory`, states: ["loaded"] },
  { id: "run-interjection",  title: "Held for an answer",          group: "Runs",         hash: `#/${ORG}/core-platform/runs/run_01K6QW3D5N7TYBA2`,        states: NO_EMPTY },
  { id: "agents",            title: "Agents",                      group: "Agents",       hash: `#/${ORG}/core-platform/agents`,                           states: ["loaded"] },
  { id: "agent",             title: "Overview",                    group: "Agents",       hash: `#/${ORG}/core-platform/agents/triage`,                    states: ALL },
  { id: "agent-identity",    title: "Identity",                    group: "Agents",       hash: `#/${ORG}/core-platform/agents/triage/identity`,           states: NO_EMPTY },
  { id: "agent-steering",    title: "Steering",                    group: "Agents",       hash: `#/${ORG}/core-platform/agents/release-manager/steering`,  states: ["loaded"], future: true },
  { id: "agent-toolbelt",    title: "Toolbelt",                    group: "Agents",       hash: `#/${ORG}/core-platform/agents/triage/toolbelt`,           states: NO_EMPTY },
  { id: "agent-runtime",     title: "Runtime",                     group: "Agents",       hash: `#/${ORG}/core-platform/agents/triage/runtime`,            states: NO_EMPTY },
  { id: "agent-permissions", title: "Permissions",                 group: "Agents",       hash: `#/${ORG}/finops/agents/invoice-bot/permissions`,          states: ["loaded"], future: true },
  { id: "agent-activity",    title: "Activity",                    group: "Agents",       hash: `#/${ORG}/core-platform/agents/triage/activity`,           states: ["loaded"], future: true },
  { id: "agent-source",      title: "Source",                      group: "Agents",       hash: `#/${ORG}/core-platform/agents/release-manager/source`,    states: ["loaded"] },
  { id: "tools",             title: "Tools",                       group: "Tools",        hash: `#/${ORG}/core-platform/tools`,                            states: ALL },
  { id: "tools-toolbelts",   title: "Toolbelts",                   group: "Tools",        hash: `#/${ORG}/core-platform/tools/toolbelts`,                  states: ALL },
  { id: "tools-providers",   title: "Providers",                   group: "Tools",        hash: `#/${ORG}/core-platform/tools/providers`,                  states: ALL },
  { id: "tools-policy",      title: "Policy",                      group: "Tools",        hash: `#/${ORG}/core-platform/tools/policy`,                     states: ALL },
  { id: "tools-switches",    title: "Kill switches",               group: "Tools",        hash: `#/${ORG}/core-platform/tools/switches`,                   states: ALL },
  { id: "steering",          title: "Sources",                     group: "Steering",     hash: `#/${ORG}/core-platform/steering`,                         states: ["loaded"], future: true },
  { id: "steering-source",   title: "Steering record",             group: "Steering",     hash: `#/${ORG}/core-platform/steering/sources/record/ctx.release.notes-format`, states: ["loaded"], future: true },
  { id: "steering-source-skill", title: "Skill",                   group: "Steering",     hash: `#/${ORG}/core-platform/steering/sources/skill/a-intel.release-notes-from-prs`, states: ["loaded"], future: true },
  { id: "steering-assignments", title: "Assignments",              group: "Steering",     hash: `#/${ORG}/core-platform/steering/assignments`,             states: ["loaded"], future: true },
  { id: "steering-compiler", title: "Compiler",                    group: "Steering",     hash: `#/${ORG}/core-platform/steering/compiler/release-manager`,states: ["loaded"], future: true },
  { id: "steering-proposals",title: "Proposals",                   group: "Steering",     hash: `#/${ORG}/core-platform/steering/proposals`,               states: ["loaded"] },
  { id: "steering-prs",      title: "Pull requests",               group: "Steering",     hash: `#/${ORG}/core-platform/steering/proposals/prs`,           states: ["loaded"] },
  { id: "runtimes",          title: "Runtimes",                    group: "Runtimes",     hash: `#/${ORG}/core-platform/runtimes`,                         states: ALL },
  { id: "runtime",           title: "Runtime",                     group: "Runtimes",     hash: `#/${ORG}/core-platform/runtimes/mbell-mbp-16`,            states: NO_EMPTY },
  { id: "spend",             title: "Overview",                    group: "Spend",        hash: `#/${ORG}/core-platform/spend`,                            states: ["loaded"], future: true },
  { id: "spend-budgets",     title: "Budgets",                     group: "Spend",        hash: `#/${ORG}/core-platform/spend/budgets`,                    states: ["loaded"] },
  { id: "spend-optimization",title: "Optimization",                group: "Spend",        hash: `#/${ORG}/core-platform/spend/optimization`,               states: ["loaded"] },
  { id: "repositories",      title: "Repositories",                group: "Repositories", hash: `#/${ORG}/core-platform/repositories`,                     states: ALL },
  { id: "repositories-copies", title: "Working copies",            group: "Repositories", hash: `#/${ORG}/core-platform/repositories/working-copies`,      states: ALL },
  { id: "repositories-changes", title: "Changes",                  group: "Repositories", hash: `#/${ORG}/core-platform/repositories/changes`,             states: ALL },
  { id: "repositories-config", title: "Configuration",             group: "Repositories", hash: `#/${ORG}/core-platform/repositories/configuration`,       states: ALL },
  { id: "approvals-drawer",  title: "Approvals",                   group: "Drawers",      hash: `#/${ORG}/core-platform/work`, drawer: "approvals",        states: ["loaded"] },
  { id: "stella-drawer",     title: "Stella",                      group: "Drawers",      hash: `#/${ORG}/core-platform/runs/run_01K5RS7M2E8FJ3QW`, drawer: "stella", states: ["loaded"] },
  // organization scope (pages 8–10)
  { id: "organization",      title: "Organization",                group: "Organization", hash: `#/${ORG}`,                                                states: ALL },
  { id: "organization-api-keys", title: "Organization · API keys", group: "Organization", hash: `#/${ORG}/api-keys`,                                       states: ALL },
  { id: "organization-roles",    title: "Organization · Roles",    group: "Organization", hash: `#/${ORG}/roles`,                                          states: ALL },
  { id: "billing",           title: "Billing",                     group: "Organization", hash: `#/${ORG}/billing`,                                        states: ALL },
  { id: "audit",             title: "Audit",                       group: "Organization", hash: `#/${ORG}/audit`,                                          states: ALL },
  // register an agent (the gate Register agent opens on Agents; three steps)
  { id: "register-name",     title: "Register agent · Name",       group: "Register",     hash: `#/${ORG}/core-platform/register/name`,                    states: ["loaded", "loading", "denied"] },
  { id: "register-wrap",     title: "Register agent · Wrap",       group: "Register",     hash: `#/${ORG}/core-platform/register/wrap`,                    states: ["loaded", "loading", "denied"] },
  { id: "register-run",      title: "Register agent · First run",  group: "Register",     hash: `#/${ORG}/core-platform/register/run`,                     states: ["loaded", "loading", "error", "denied"] },
  // sign-in flows (Appendix F: seven of them, not counted as pages) and the onboarding gate
  { id: "signup",            title: "Sign up",                     group: "Auth",         hash: "#/welcome/signup",                                        states: ["loaded", "loading", "error"] },
  { id: "verify-email",      title: "Verify email",                group: "Auth",         hash: "#/welcome/verify",                                        states: ["loaded", "loading", "error"] },
  { id: "login",             title: "Log in",                      group: "Auth",         hash: "#/welcome/login",                                         states: ["loaded", "loading", "error", "denied"] },
  { id: "two-factor",        title: "Two-factor",                  group: "Auth",         hash: "#/welcome/two-factor",                                    states: ["loaded", "loading", "error"] },
  { id: "forgot-password",   title: "Forgot password",             group: "Auth",         hash: "#/welcome/forgot",                                        states: ["loaded", "loading", "error"] },
  { id: "reset-password",    title: "Reset password",              group: "Auth",         hash: "#/welcome/reset",                                         states: ["loaded", "loading", "error", "denied"] },
  { id: "accept-invitation", title: "Accept invitation",           group: "Auth",         hash: "#/welcome/invite",                                        states: ["loaded", "loading", "error", "denied"] },
  { id: "onboarding-organization", title: "Onboarding · Organization", group: "Onboarding", hash: "#/welcome/organization",                              states: ["loaded", "loading", "error", "denied"] },
  { id: "onboarding-wrap",   title: "Onboarding · Wrap an agent",  group: "Onboarding",   hash: "#/welcome/wrap",                                          states: ["loaded", "loading", "denied"] },
  { id: "onboarding-run",    title: "Onboarding · First run",      group: "Onboarding",   hash: "#/welcome/run",                                           states: ["loaded", "loading", "error", "denied"] },
  { id: "installer",         title: "Installer",                   group: "Onboarding",   hash: "#/welcome/installer",                                     states: ["loaded", "error"] },
];

// The guided scenarios (the W flows). id is the SCENARIOS key in src/engine.js; ws the workspace
// the scenario lives in (its steps' routes), declared here so a story can open step 1 directly.
export const SCENARIOS = [
  { n: 1,  id: "sixty-seconds-to-governed",   ws: "core-platform", title: "Sixty Seconds to Governed" },
  { n: 2,  id: "stop-it-steer-it",            ws: "core-platform", title: "Stop It. Steer It." },
  { n: 3,  id: "money-asked",                 ws: "finops",        title: "Money Asked, A Human Answered" },
  { n: 6,  id: "learned-approved-changed",    ws: "core-platform", title: "It learned, you approved, it changed" },
  { n: 8,  id: "every-dollar-every-operator", ws: "core-platform", title: "Every Dollar, Every Operator" },
  { n: 9,  id: "toolbelt-governed",           ws: "core-platform", title: "The Toolbelt, Governed" },
  { n: 10, id: "cio-console",                 ws: "core-platform", title: "The CIO's Console" },
  { n: 11, id: "the-account",                 ws: "core-platform", title: "The Account" },
];

export const STATE_WORD = { loaded: "loaded", empty: "empty", loading: "loading", error: "error", denied: "access denied" };

// The URL of one view of the master file. `file` is the path or URL of missioncontrol.html.
// `future` outlines every future-only field; `drawer` opens the Approvals or the Stella drawer.
// The file opens as the product; `debug: true` adds ?debug=true, which brings back the mockup
// chrome — the state bar, the scenario rail and the scenario nav item.
export function mockupUrl(file, { product = true, debug = false, state = null, mobile = null, theme = null, future = false, drawer = null, hash = HOME } = {}) {
  const q = new URLSearchParams();
  if (debug) q.set("debug", "true");
  else if (product) q.set("product", "1");
  if (state) q.set("state", state);
  if (mobile != null) q.set("mobile", mobile ? "1" : "0");
  if (theme) q.set("theme", theme);
  if (future) q.set("future", "1");
  if (drawer) q.set("drawer", drawer);
  const qs = q.toString();
  return file + (qs ? "?" + qs : "") + (hash || "");
}

export function scenarioHash(s, step = 1) {
  return `#/${ORG}/${s.ws}/scenarios/${s.id}/${step}`;
}
