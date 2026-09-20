// The model this deployment runs on, shared by the assistant drawer and the decision recorder.
export const OPENROUTER = "https://openrouter.ai/api/v1/chat/completions";

// The drawer's tier selector is the viewer's explicit model choice.
//
// Kimi K3 is pinned as the primary, and `~moonshotai/kimi-latest` sits behind it in OpenRouter's
// fallback list. The floating slug is not a safe primary: it follows whatever Moonshot serves on
// their own `kimi-latest` endpoint, which answered as kimi-k2.6 on 2026-09-20, a generation back
// from K3. As a fallback it earns its place, because it keeps answering after a pinned slug is
// retired. Set OPENROUTER_MODEL to move the primary without a deploy.
export const MODELS = {
  complex: { model: process.env.OPENROUTER_MODEL || "moonshotai/kimi-k3", models: ["~moonshotai/kimi-latest"] },
  default: { model: process.env.OPENROUTER_MODEL || "moonshotai/kimi-k3", models: ["~moonshotai/kimi-latest"] },
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

// One non-streamed round. Returns the assistant's text, or null when the model gives nothing back.
// Callers that must produce a result anyway pass their own fallback, because a model outage is not
// a reason to lose a decision.
export async function complete({ tier = "quick", system, prompt, max_tokens = 700, timeout_ms = 30000 }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout_ms);
  try {
    const r = await fetch(OPENROUTER, {
      method: "POST",
      signal: ctl.signal,
      headers: attribution(apiKey),
      body: JSON.stringify({
        ...(MODELS[tier] || MODELS.quick),
        max_tokens,
        messages: [...(system ? [{ role: "system", content: system }] : []), { role: "user", content: prompt }],
      }),
    });
    if (!r.ok) { console.error("complete: upstream", r.status, (await r.text().catch(() => "")).slice(0, 300)); return null; }
    const j = await r.json();
    const text = String(j.choices?.[0]?.message?.content || "").trim();
    return text || null;
  } catch (e) {
    console.error("complete failed", e?.name, e?.message);
    return null;
  } finally { clearTimeout(timer); }
}
