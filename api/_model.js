// The model this deployment runs on, shared by the assistant drawer and the decision recorder.
export const OPENROUTER = "https://openrouter.ai/api/v1/chat/completions";

// The drawer's tier selector is the viewer's explicit model choice.
//
// Kimi K2.5 is the primary. K3 was, and it cannot be used here: given this deployment's tool
// definitions it thinks without ever writing an answer. Measured on 2026-09-20 against the drawer's
// own captured payload: 816 seconds, 20,000 reasoning tokens, zero content, stopped on `length`,
// and $0.14 for nothing. `reasoning: {max_tokens: 2000}` and `reasoning: {effort: "low"}` were both
// ignored, and `reasoning: {enabled: false}` made it stream raw `<|close|>[PAD]` control tokens as
// the answer. K2.5 answers the identical payload in 2 to 5 seconds with the right tool call.
// `~moonshotai/kimi-latest` sits behind it in OpenRouter's fallback list: the floating slug is not
// a safe primary, because it follows whatever Moonshot serves and answered as kimi-k2.6 on
// 2026-09-20, but it keeps answering after a pinned slug is retired. Set OPENROUTER_MODEL to move
// the primary without a deploy. Whatever goes there must be checked against tools first.
export const MODELS = {
  complex: { model: process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2.5", models: ["~moonshotai/kimi-latest"] },
  default: { model: process.env.OPENROUTER_MODEL || "moonshotai/kimi-k2.5", models: ["~moonshotai/kimi-latest"] },
  quick: { model: process.env.OPENROUTER_MODEL_QUICK || "moonshotai/kimi-k2.5", models: ["moonshotai/kimi-k2-0905"] },
};

// OpenRouter attributes spend to the referer and title, which is how the roadmap's share reads
// separately on the bill.
export const attribution = (apiKey) => ({
  authorization: `Bearer ${apiKey}`,
  "content-type": "application/json",
  "http-referer": "https://oxagen-roadmap.vercel.app",
  "x-title": "Oxagen roadmap assistant",
});

// The request for a short, non-streamed drafting job.
//
// `reasoning: {enabled: false}` is load bearing. Kimi thinks before it answers, and on these models
// the thinking is spent out of `max_tokens`: asked for a three-sentence record inside 700 tokens,
// K3 spent all 700 reasoning, stopped on `length`, and returned empty content. Every draft then
// fell back to the template and nothing said why. With thinking off the same prompt answers in
// about a second and costs a fraction. The drawer in ask.js keeps thinking on: on K2.5 it spends a
// few hundred characters on it and picks better tools for the trouble.
export function draftParams({ tier = "quick", system, prompt, max_tokens = 1200 }) {
  return {
    ...(MODELS[tier] || MODELS.quick),
    reasoning: { enabled: false },
    max_tokens,
    messages: [...(system ? [{ role: "system", content: system }] : []), { role: "user", content: prompt }],
  };
}

// One non-streamed round. Returns the assistant's text, or null when the model gives nothing back.
// Callers that must produce a result anyway pass their own fallback, because a model outage is not
// a reason to lose a decision.
export async function complete(opts) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), opts.timeout_ms ?? 30000);
  try {
    const r = await fetch(OPENROUTER, {
      method: "POST",
      signal: ctl.signal,
      headers: attribution(apiKey),
      body: JSON.stringify(draftParams(opts)),
    });
    if (!r.ok) { console.error("complete: upstream", r.status, (await r.text().catch(() => "")).slice(0, 300)); return null; }
    const j = await r.json();
    const choice = j.choices?.[0];
    const text = String(choice?.message?.content || "").trim();
    // An empty answer earns a line in the log. Silence here is what hid the reasoning trap.
    if (!text) console.error("complete: empty content", j.model, choice?.finish_reason, "reasoning chars", String(choice?.message?.reasoning || "").length);
    return text || null;
  } catch (e) {
    console.error("complete failed", e?.name, e?.message);
    return null;
  } finally { clearTimeout(timer); }
}
