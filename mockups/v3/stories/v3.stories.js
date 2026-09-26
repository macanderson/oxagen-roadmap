// The v3 mockup (mockups/v3/README.md), one story per view, each a framed URL of mockups/v3/index.html.
// Storybook's dev server builds that page fresh from mockups/v3/src and mockups/v3/fixtures on every
// request (.storybook/mockup-plugin.mjs); `npm run build-storybook` writes it into the static build.
const FILE = "./v3/index.html";
const BASE = "/a-intel/core-platform/";

export const argTypes = {
  shell: { control: "inline-radio", options: ["desktop", "mobile"], description: "mobile draws a 390×844 phone, which gets the phone layout" },
  theme: { control: "inline-radio", options: ["system", "dark", "light"] },
  first: { control: "boolean", description: "?state=empty: the first run, before anything is connected" },
  route: { control: "text", description: "the view the frame opens on" },
};

function render({ shell, theme, first, route }) {
  const q = ["island=0", theme && theme !== "system" ? "theme=" + theme : "", first ? "state=empty" : ""].filter(Boolean).join("&");
  const mobile = shell === "mobile";
  const wrap = document.createElement("div");
  wrap.style.cssText = mobile ? "min-height:100vh;display:grid;place-items:center;background:#F4F4F5;padding:24px 16px" : "height:100vh;background:#000000";
  const frame = document.createElement("iframe");
  frame.src = `${FILE}?${q}#${BASE}${route}`;
  frame.title = "Oxagen v3: " + route;
  frame.style.cssText = mobile
    ? "width:390px;height:844px;max-width:100%;border:10px solid #09090B;border-radius:38px;background:#000000;box-shadow:0 20px 60px rgba(0,0,0,.35)"
    : "width:100%;height:100%;border:0;display:block";
  wrap.appendChild(frame);
  return wrap;
}

export default { title: "Oxagen v3", argTypes, args: { shell: "desktop", theme: "system", first: false, route: "work" }, render };

export const Work = { args: { route: "work" } };
export const Sessions = { args: { route: "sessions" } };
export const ReplayClaudeCode = { name: "Replay, Claude Code", args: { route: "sessions/ses_01K5RS7M2E8FJ3QW" } };
export const ReplayCodex = { name: "Replay, Codex CLI", args: { route: "sessions/ses_01K5QX4B9C7XTN2P" } };
export const ReplayCursor = { name: "Replay, Cursor", args: { route: "sessions/ses_01K5RP2D6H4KLM8V" } };
export const ReplayStella = { name: "Replay, stella", args: { route: "sessions/ses_01K5RN8F3J2GHY6T" } };
export const Agents = { args: { route: "agents" } };
export const Steering = { args: { route: "steering" } };
export const McpServers = { name: "MCP servers", args: { route: "servers" } };
export const Spend = { args: { route: "spend" } };
export const FirstRun = { name: "First run", args: { route: "work", first: true } };
export const Mobile = { args: { route: "sessions/ses_01K5RS7M2E8FJ3QW", shell: "mobile" } };
