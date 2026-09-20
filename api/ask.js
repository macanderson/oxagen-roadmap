// POST /api/ask   one model round for the roadmap's assistant drawer, streamed as server-sent events.
//
// The page owns the tool loop: its tools read and change page state, so they run in the browser.
// This function runs ONE round: it streams text deltas as they are written, then sends the whole
// assistant message (`done`). When that message stops on `tool_use`, the page runs the tools,
// appends the assistant content plus the tool results, and calls again. Needs the edit key, so a
// public link cannot spend the model budget.
//
//   event: text   {"delta": "..."}
//   event: done   {"message": {content, stop_reason, model, usage}}
//   event: error  {"code": "...", "message": "..."}
//
// The model runs on OpenRouter. The page speaks Anthropic content blocks, so this function
// translates in both directions: blocks in, OpenAI chat messages out, and the reply back into
// blocks. Reasoning tokens are read and dropped. They are never shown and never replayed, because
// a model handed its own reasoning back as assistant text repeats it on every tool turn.
import { json, canEdit, readBody } from "./_lib.js";

const OPENROUTER = "https://openrouter.ai/api/v1/chat/completions";

// The drawer's tier selector is the viewer's explicit model choice.
//
// Kimi K3 is pinned as the primary, and `~moonshotai/kimi-latest` sits behind it in OpenRouter's
// fallback list. The floating slug is not a safe primary: it follows whatever Moonshot serves on
// their own `kimi-latest` endpoint, which answered as kimi-k2.6 on 2026-09-20, a generation back
// from K3. As a fallback it earns its place, because it keeps answering after a pinned slug is
// retired. Set OPENROUTER_MODEL to move the primary without a deploy.
const MODELS = {
  complex: { model: process.env.OPENROUTER_MODEL || "moonshotai/kimi-k3", models: ["~moonshotai/kimi-latest"] },
  default: { model: process.env.OPENROUTER_MODEL || "moonshotai/kimi-k3", models: ["~moonshotai/kimi-latest"] },
  quick: { model: process.env.OPENROUTER_MODEL_QUICK || "moonshotai/kimi-k2.5", models: ["moonshotai/kimi-k2-0905"] },
};

// Anthropic content blocks -> OpenAI chat messages.
// A user turn carrying tool results becomes one `tool` message per result, which is where the
// OpenAI shape puts them. The assistant turn that asked for them already sits in front.
export function toChatMessages(system, messages) {
  const out = system ? [{ role: "system", content: system }] : [];
  for (const m of messages) {
    if (typeof m.content === "string") { out.push({ role: m.role, content: m.content }); continue; }
    const blocks = Array.isArray(m.content) ? m.content : [];
    const text = blocks.filter((b) => b?.type === "text").map((b) => b.text || "").join("");
    if (m.role === "assistant") {
      const calls = blocks.filter((b) => b?.type === "tool_use").map((b) => ({
        id: String(b.id), type: "function",
        function: { name: String(b.name), arguments: JSON.stringify(b.input ?? {}) },
      }));
      out.push({ role: "assistant", content: text || null, ...(calls.length ? { tool_calls: calls } : {}) });
      continue;
    }
    for (const b of blocks) {
      if (b?.type !== "tool_result") continue;
      out.push({ role: "tool", tool_call_id: String(b.tool_use_id), content: String(b.content ?? "") });
    }
    if (text) out.push({ role: "user", content: text });
  }
  return out;
}

// OpenAI finish reasons -> the stop reasons the page branches on.
export function toStopReason(finish, hasCalls) {
  if (hasCalls) return "tool_use";
  if (finish === "length") return "max_tokens";
  if (finish === "content_filter") return "refusal";
  return "end_turn";
}

// A tool call the model streamed -> an Anthropic tool_use block.
// Arguments arrive as a string built up across chunks. Unparseable arguments become an empty
// input, so the tool fails with a message the model can read and retry. Dropping the call instead
// would leave the page holding a round that asked for nothing.
export function toToolUse(call) {
  let input = {};
  try {
    const parsed = JSON.parse(call.args || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) input = parsed;
  } catch {
    console.error("ask: unparseable tool arguments", call.name, String(call.args).slice(0, 200));
  }
  return { type: "tool_use", id: call.id || `call_${call.index}`, name: call.name || "", input };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "method" });
  if (!canEdit(req)) return json(res, 401, { error: "edit_key", message: "A valid edit key is required to ask here." });
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return json(res, 503, { error: "not_configured", message: "No model credential is configured for this deployment." });

  let body;
  try { body = await readBody(req, 1024 * 1024); } catch { return json(res, 400, { error: "body" }); }
  const tier = MODELS[body.tier] ? body.tier : "complex";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!messages.length || messages[0]?.role !== "user") return json(res, 400, { error: "messages", message: "messages must start with a user turn" });
  const tools = (Array.isArray(body.tools) ? body.tools : []).slice(0, 16).map((t) => ({
    type: "function",
    function: {
      name: String(t.name), description: String(t.description || "").slice(0, 1024),
      parameters: t.input_schema && typeof t.input_schema === "object" ? t.input_schema : { type: "object", properties: {} },
    },
  }));

  const params = {
    ...MODELS[tier],
    max_tokens: 16000,
    stream: true,
    stream_options: { include_usage: true },
    messages: toChatMessages(String(body.system || "").slice(0, 60000), messages),
    ...(tools.length ? { tools } : {}),
  };

  res.statusCode = 200;
  res.setHeader("content-type", "text/event-stream; charset=utf-8");
  res.setHeader("cache-control", "no-store, no-transform");
  res.setHeader("x-accel-buffering", "no");
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  const ctl = new AbortController();
  let cancelled = false;
  req.on("close", () => { cancelled = true; ctl.abort(); });

  try {
    const upstream = await fetch(OPENROUTER, {
      method: "POST",
      signal: ctl.signal,
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        // OpenRouter attributes spend to these, which is how the roadmap's share reads separately.
        "http-referer": "https://oxagen-roadmap.vercel.app",
        "x-title": "Oxagen roadmap assistant",
      },
      body: JSON.stringify(params),
    });
    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      const err = new Error(detail.slice(0, 400) || `upstream ${upstream.status}`);
      err.status = upstream.status;
      throw err;
    }

    let text = "", finish = null, model = params.model, usage = null;
    const calls = new Map();   // stream index -> {index, id, name, args}
    const reader = upstream.body.getReader(), dec = new TextDecoder();
    let buf = "", closed = false;

    while (!closed) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue;          // ": OPENROUTER PROCESSING" keep-alives
        const raw = line.slice(5).trim();
        if (raw === "[DONE]") { buf = ""; closed = true; break; }
        let chunk;
        try { chunk = JSON.parse(raw); } catch { continue; }
        if (chunk.error) {
          const e = new Error(String(chunk.error.message || "upstream error"));
          e.status = chunk.error.code;
          throw e;
        }
        if (chunk.model) model = chunk.model;
        if (chunk.usage) usage = chunk.usage;
        const choice = chunk.choices?.[0];
        if (!choice) continue;
        if (choice.finish_reason) finish = choice.finish_reason;
        const delta = choice.delta || {};
        if (delta.content) { text += delta.content; send("text", { delta: delta.content }); }
        for (const tc of delta.tool_calls || []) {
          const k = tc.index ?? calls.size;
          const cur = calls.get(k) || { index: k, id: "", name: "", args: "" };
          if (tc.id) cur.id = tc.id;
          if (tc.function?.name) cur.name = tc.function.name;
          if (tc.function?.arguments) cur.args += tc.function.arguments;
          calls.set(k, cur);
        }
      }
    }

    const blocks = [];
    if (text) blocks.push({ type: "text", text });
    for (const c of [...calls.values()].sort((a, b) => a.index - b.index)) blocks.push(toToolUse(c));
    send("done", {
      message: {
        content: blocks,
        stop_reason: toStopReason(finish, calls.size > 0),
        model,
        usage: usage
          ? { input_tokens: usage.prompt_tokens ?? 0, output_tokens: usage.completion_tokens ?? 0, cost: usage.cost ?? null }
          : null,
      },
    });
  } catch (e) {
    let code = "upstream_error";
    if (cancelled || e?.name === "AbortError") code = "cancelled";
    else if (e?.status === 401 || e?.status === 403) code = "auth";
    else if (e?.status === 402) code = "budget";
    else if (e?.status === 429) code = "rate_limited";
    else if (e?.status === 400) code = "bad_request";
    console.error("ask failed", code, e?.status, e?.message);
    if (!cancelled) send("error", { code, message: String(e?.message || e).slice(0, 400) });
  } finally { res.end(); }
}
