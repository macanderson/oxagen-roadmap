// One story is one URL of the master file, framed. The controls are what the URL pins: the state,
// the shell (desktop, or a phone frame with the mobile shell inside it), the theme, and whether
// the mockup chrome (state bar, scenario rail, onboarding demo) is hidden. Nothing here is
// product UI; the product is inside the frame.
import { mockupUrl, STATE_WORD } from "../catalog.mjs";

const MASTER = "./missioncontrol.html";

export const argTypes = {
  state: { control: "select", options: ["loaded", "empty", "loading", "error", "denied"], description: "S.state, pinned" },
  shell: { control: "inline-radio", options: ["desktop", "mobile"], description: "S.mobile, pinned; mobile draws a 390×844 phone" },
  theme: { control: "inline-radio", options: ["system", "dark", "light"] },
  product: { control: "boolean", description: "?product=1: no state bar, scenario rail or onboarding demo" },
  hash: { control: "text", description: "the route the frame opens on" },
};

export function view({ state, shell, theme, product, hash, file = MASTER }) {
  const mobile = shell === "mobile";
  const src = mockupUrl(file, { product, state: state || null, mobile: shell ? mobile : null, theme: theme === "system" ? null : theme, hash });
  const wrap = document.createElement("div");
  wrap.style.cssText = mobile
    ? "min-height:100vh;display:grid;place-items:center;background:#F4F4F5;padding:24px 16px"
    : "height:100vh;background:#000000";
  const frame = document.createElement("iframe");
  frame.src = src;
  frame.title = hash || "Oxagen";
  frame.setAttribute("loading", "eager");
  frame.style.cssText = mobile
    ? "width:390px;height:844px;max-width:100%;border:10px solid #09090B;border-radius:38px;background:#000000;box-shadow:0 20px 60px rgba(0,0,0,.35)"
    : "width:100%;height:100%;border:0;display:block";
  wrap.appendChild(frame);
  return wrap;
}
