// The catalog of mockups/missioncontrol.html: every page with the states its renderer implements,
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
  // workspace scope (spec Appendix F, pages 1–7)
  { id: "fleet",             title: "Fleet",                       group: "Workspace",    hash: `#/${ORG}/core-platform`,                                  states: ALL },
  { id: "run",               title: "Run",                         group: "Workspace",    hash: `#/${ORG}/core-platform/runs/run_01K5RS7M2E8FJ3QW`,         states: ALL },
  { id: "agents",            title: "Agent IAM",                   group: "Workspace",    hash: `#/${ORG}/core-platform/agents`,                           states: ALL },
  { id: "agent",             title: "Agent",                       group: "Workspace",    hash: `#/${ORG}/core-platform/agents/triage`,                    states: ALL },
  { id: "agent-source",      title: "Agent source",                group: "Workspace",    hash: `#/${ORG}/core-platform/agents/release-manager/source`,    states: NO_EMPTY },
  { id: "mandate",           title: "Mandate",                     group: "Workspace",    hash: `#/${ORG}/finops/agents/invoice-bot/mandates/mnd_7K2ETQ4`, states: ALL },
  { id: "tools",             title: "Tools",                       group: "Workspace",    hash: `#/${ORG}/core-platform/tools`,                            states: ALL },
  // Steering is the hub: seven tabs, each a URL segment (#/:org/:ws/steering/<tab>). Records is the
  // page itself; Skills keeps its three page ids; the other five tabs are pages of their own here so
  // every tab is checked in every state and both shells.
  { id: "steering",          title: "Steering · Records",          group: "Workspace",    hash: `#/${ORG}/core-platform/steering/records`,                 states: ALL },
  { id: "steering-memory",   title: "Steering · Memory",           group: "Workspace",    hash: `#/${ORG}/core-platform/steering/memory`,                  states: ALL },
  { id: "steering-ontology", title: "Steering · Ontology",         group: "Workspace",    hash: `#/${ORG}/core-platform/steering/ontology`,                states: ALL },
  { id: "steering-policy",   title: "Steering · Policy",           group: "Workspace",    hash: `#/${ORG}/core-platform/steering/policy`,                  states: ALL },
  { id: "steering-proposals",title: "Steering · Proposals",        group: "Workspace",    hash: `#/${ORG}/core-platform/steering/proposals`,               states: ALL },
  { id: "steering-preview",  title: "Steering · Preview",          group: "Workspace",    hash: `#/${ORG}/core-platform/steering/preview/release-manager`, states: ALL },
  { id: "repositories",      title: "Repositories",                group: "Workspace",    hash: `#/${ORG}/core-platform/repositories`,                     states: ALL },
  { id: "record",            title: "Context record",              group: "Workspace",    hash: `#/${ORG}/core-platform/steering/records/ctx.release.never-merge`, states: NO_EMPTY },
  { id: "spend",             title: "Spend",                       group: "Workspace",    hash: `#/${ORG}/core-platform/spend`,                            states: ALL },
  // skills (W13), now the Skills tab of Steering: sync, resolution, the seat in the loop, reflection;
  // the off-by-default gate; the interjected run. The old #/:org/:ws/skills… routes still resolve.
  { id: "skills",            title: "Steering · Skills",           group: "Workspace",    hash: `#/${ORG}/core-platform/steering/skills`,                  states: ALL },
  { id: "skills-off",        title: "Steering · Skills · off (the default)", group: "Workspace", hash: `#/${ORG}/finops/steering/skills`,                 states: ["loaded"] },
  { id: "skill-source",      title: "Skill source",                group: "Workspace",    hash: `#/${ORG}/core-platform/steering/skills/a-intel.release-notes-from-prs/source`, states: NO_EMPTY },
  { id: "run-interjection",  title: "Run · interjection",          group: "Workspace",    hash: `#/${ORG}/core-platform/runs/run_01K6QW3D5N7TYBA2`,        states: NO_EMPTY },
  // organization scope (pages 8–10)
  { id: "organization",      title: "Organization",                group: "Organization", hash: `#/${ORG}`,                                                states: ALL },
  { id: "organization-api-keys", title: "Organization · API keys", group: "Organization", hash: `#/${ORG}/api-keys`,                                       states: ALL },
  { id: "organization-roles",    title: "Organization · Roles",    group: "Organization", hash: `#/${ORG}/roles`,                                          states: ALL },
  { id: "billing",           title: "Billing",                     group: "Organization", hash: `#/${ORG}/billing`,                                        states: ALL },
  { id: "audit",             title: "Audit",                       group: "Organization", hash: `#/${ORG}/audit`,                                          states: ALL },
  // register an agent (the gate Fleet opens; three steps)
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
  { id: "installer",         title: "Installer",                   group: "Onboarding",   hash: "#/welcome/installer",                                     states: ["loaded"] },
];

// The guided scenarios (the W flows). id is the SCENARIOS key in src/engine.js; ws the workspace
// the scenario lives in (its steps' routes), declared here so a story can open step 1 directly.
export const SCENARIOS = [
  { n: 1,  id: "sixty-seconds-to-governed",   ws: "core-platform", title: "Sixty Seconds to Governed" },
  { n: 2,  id: "stop-it-steer-it",            ws: "core-platform", title: "Stop It. Steer It." },
  { n: 3,  id: "money-asked",                 ws: "finops",        title: "Money Asked, A Human Answered" },
  { n: 4,  id: "flight-recorder",             ws: "core-platform", title: "Oxagen Flight Recorder" },
  { n: 5,  id: "proven-not-claimed",          ws: "core-platform", title: "Proven, Not Claimed" },
  { n: 6,  id: "learned-approved-changed",    ws: "core-platform", title: "It learned, you approved, it changed" },
  { n: 8,  id: "every-dollar-every-operator", ws: "core-platform", title: "Every Dollar, Every Operator" },
  { n: 9,  id: "toolbelt-governed",           ws: "core-platform", title: "The Toolbelt, Governed" },
  { n: 10, id: "cio-console",                 ws: "core-platform", title: "The CIO's Console" },
  { n: 11, id: "the-account",                 ws: "core-platform", title: "The Account" },
  { n: 13, id: "in-the-loop",                 ws: "core-platform", title: "In the Loop" },
  { n: 14, id: "done-means-done",             ws: "core-platform", title: "Done Means Done" },
];

export const STATE_WORD = { loaded: "loaded", empty: "empty", loading: "loading", error: "error", denied: "access denied" };

// The URL of one view of the master file. `file` is the path or URL of missioncontrol.html.
export function mockupUrl(file, { product = true, state = null, mobile = null, theme = null, hash = HOME } = {}) {
  const q = new URLSearchParams();
  if (product) q.set("product", "1");
  if (state) q.set("state", state);
  if (mobile != null) q.set("mobile", mobile ? "1" : "0");
  if (theme) q.set("theme", theme);
  const qs = q.toString();
  return file + (qs ? "?" + qs : "") + (hash || "");
}

export function scenarioHash(s, step = 1) {
  return `#/${ORG}/${s.ws}/scenarios/${s.id}/${step}`;
}
