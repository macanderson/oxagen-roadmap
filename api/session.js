// POST   /api/session   {password}  sign in. Sets the session cookie.
// DELETE /api/session               sign out. Clears it.
// GET    /api/session               {signed_in}
//
// The cookie is httpOnly, so the page cannot read the password back out of the browser. It is the
// only thing the page keeps: every later call to /api/state, /api/ask and /api/record-decision
// carries it, and signing out on one tab ends it everywhere that tab's browser goes.
import { json, readBody, passwordOk, signedIn, SESSION_COOKIE } from "./_lib.js";

const DAYS = 30;
const attrs = (maxAge) => `Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;

// A wrong password costs a second. That is slow enough to make guessing pointless and short enough
// that a person who typed it correctly does not notice.
const slow = () => new Promise((r) => setTimeout(r, 1000));

export default async function handler(req, res) {
  if (req.method === "GET") return json(res, 200, { signed_in: signedIn(req) });

  if (req.method === "DELETE") {
    return json(res, 200, { signed_in: false }, { "set-cookie": `${SESSION_COOKIE}=; ${attrs(0)}` });
  }

  if (req.method !== "POST") return json(res, 405, { error: "method" });
  if (!process.env.ROADMAP_PASSWORD) return json(res, 503, { error: "no_password", message: "This deployment has no password set, so nothing can be changed here." });

  let body;
  try { body = await readBody(req, 4 * 1024); } catch { return json(res, 400, { error: "body" }); }
  const given = String(body.password || "");

  // The one mistake worth naming: an OpenRouter key is not the password. The model credential
  // lives on the server and is never typed into this page.
  if (given.startsWith("sk-or-v1-")) {
    await slow();
    return json(res, 401, { error: "model_key", message: "That is an OpenRouter key, not the roadmap password. The model credential lives on the server. Enter the password instead." });
  }
  if (!passwordOk(given)) {
    await slow();
    return json(res, 401, { error: "password", message: "That password was not accepted." });
  }
  return json(res, 200, { signed_in: true }, { "set-cookie": `${SESSION_COOKIE}=${encodeURIComponent(given)}; ${attrs(DAYS * 86400)}` });
}
