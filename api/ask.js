// POST /api/ask   one model round for the roadmap's Claude drawer, streamed as server-sent events.
//
// The page owns the tool loop: its tools read and change page state, so they run in the browser.
// This function runs ONE round: it streams text deltas as they are written, then sends the whole
// assistant message (`done`). When that message stops on `tool_use`, the page runs the tools,
// appends the assistant content UNCHANGED (thinking blocks included) plus the tool results, and
// calls again. Needs the edit key, so a public link cannot spend the Anthropic key.
//
//   event: text   {"delta": "..."}
//   event: done   {"message": {content, stop_reason, model, usage}}
//   event: error  {"code": "...", "message": "..."}
import Anthropic from "@anthropic-ai/sdk";
import { json, canEdit, readBody } from "./_lib.js";

// The drawer's tier selector is the viewer's explicit model choice; the default tier is Opus.
const MODELS = { complex: "claude-opus-5", default: "claude-sonnet-5", quick: "claude-haiku-4-5" };

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "method" });
  if (!canEdit(req)) return json(res, 401, { error: "edit_key", message: "A valid edit key is required to ask Claude here." });
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return json(res, 503, { error: "not_configured", message: "No Anthropic credential is configured for this deployment." });

  let body;
  try { body = await readBody(req, 1024 * 1024); } catch { return json(res, 400, { error: "body" }); }
  const tier = MODELS[body.tier] ? body.tier : "complex";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length || messages[0]?.role !== "user") return json(res, 400, { error: "messages", message: "messages must start with a user turn" });
  const tools = (Array.isArray(body.tools) ? body.tools : []).slice(0, 16).map((t) => ({
    name: String(t.name), description: String(t.description || "").slice(0, 1024),
    input_schema: t.input_schema && typeof t.input_schema === "object" ? t.input_schema : { type: "object", properties: {} },
  }));

  const params = {
    model: MODELS[tier],
    max_tokens: 16000,
    system: String(body.system || "").slice(0, 60000),
    messages,
    ...(tools.length ? { tools } : {}),
    // Adaptive thinking on the current Opus and Sonnet; Haiku 4.5 does not take it.
    ...(tier === "quick" ? {} : { thinking: { type: "adaptive" } }),
  };

  res.statusCode = 200;
  res.setHeader("content-type", "text/event-stream; charset=utf-8");
  res.setHeader("cache-control", "no-store, no-transform");
  res.setHeader("x-accel-buffering", "no");
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  const client = new Anthropic();
  let stream = null, wrote = false;
  req.on("close", () => { try { stream?.abort(); } catch {} });

  const run = async (useFallbacks) => {
    stream = useFallbacks
      // A policy decline on Opus re-runs the same request on the fallback the API picks.
      ? client.beta.messages.stream({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" })
      : client.messages.stream(params);
    stream.on("text", (delta) => { wrote = true; send("text", { delta }); });
    const message = await stream.finalMessage();
    send("done", { message: { content: message.content, stop_reason: message.stop_reason, model: message.model, usage: message.usage } });
  };

  try {
    try { await run(tier === "complex"); }
    catch (e) {
      // If the fallbacks form is refused before anything streamed, run the plain request once.
      if (tier === "complex" && !wrote && e instanceof Anthropic.BadRequestError) await run(false);
      else throw e;
    }
  } catch (e) {
    let code = "upstream_error";
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) code = "auth";
    else if (e instanceof Anthropic.RateLimitError) code = "rate_limited";
    else if (e instanceof Anthropic.BadRequestError) code = "bad_request";
    else if (e instanceof Anthropic.APIUserAbortError) code = "cancelled";
    console.error("ask failed", code, e?.status, e?.message);
    send("error", { code, message: String(e?.message || e).slice(0, 400) });
  } finally { res.end(); }
}
