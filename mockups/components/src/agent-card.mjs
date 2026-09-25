// Agent card: the one way an agent identity is drawn, anywhere. See tools/build-components.mjs for
// the shape of this module.
export default {
  slug: "agent-card",
  name: "Agent card",
  group: "Data display",
  order: 70,
  summary: "The one way an agent identity is drawn: a harness mark, an avatar, its key, and a second line, in one of three layouts.",
  lead: "An agent card is an agent's identity wherever it appears: a table row, a run's header, an approval, a mandate. One markup and one CSS family draw it in three layouts so an agent looks the same everywhere it shows up. The identity block is the only part allowed to give way. It ellipsises before anything else moves.",
  root: ".agc",
  css: "lines 1311 to 1341 (agent card, its three layouts, and the rule comment above them), 1345 (a steer-list override), 2173 to 2174 (the harness mark inside the card)",
  usedOn: ["Agents", "Work", "Run", "Approvals", "Spend", "Tools", "Steering"],
  stories: [
    {
      id: "list",
      name: "List layout",
      note: "The default: a table cell, a picker, a drill-down. The harness mark, a 26px avatar, and the harness as the only second line.",
      html: `
        <table class="narrow"><tbody>
          <tr><td><span class="agc agc-list"><span class="hx" style="width:15px;height:15px" title="Claude Code"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#D97757" d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg></span><span class="avx agent ic tn-soft" style="width:26px;height:26px" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/></svg></span><span class="agid"><span class="tkey">a-intel.core.release-manager</span><span class="sub">Claude Code</span></span></span></td></tr>
          <tr><td><a class="agc agc-list" href="#/a-intel/core-platform/agents/triage"><span class="hx" style="width:15px;height:15px" title="Codex CLI"><svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="16" rx="3.5"/><path d="m7 9.5 3 2.5-3 2.5M12.5 15H17"/></g></svg></span><span class="avx agent ic tn-soft" style="width:26px;height:26px" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></span><span class="agid"><span class="tkey">a-intel.core.triage</span><span class="sub">Codex CLI</span></span></a></td></tr>
        </tbody></table>`,
    },
    {
      id: "compact",
      name: "Compact layout",
      note: "One agent on a record about something else: a run, an approval, a mandate. Bordered so it reads as a card, and linked to the agent by default.",
      html: `
        <a class="agc agc-compact" href="#/a-intel/core-platform/agents/release-manager"><span class="hx" style="width:16px;height:16px" title="Claude Code"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#D97757" d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg></span><span class="avx agent ic tn-soft" style="width:30px;height:30px" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/></svg></span><span class="agid"><span class="tkey">a-intel.core.release-manager</span><span class="sub">Claude Code · 412 runs 30d · $186.40</span></span></a>`,
    },
    {
      id: "detail",
      name: "Detail layout",
      note: "The agent's own page: the key is the page title, set inside the `h1` itself, at 60px. The harness mark leads the harness name under it.",
      html: `
        <h1 class="mono" style="font-size:20px;margin:0"><span class="agc agc-detail"><span class="avx agent ic tn-soft" style="width:60px;height:60px" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/></svg></span><span class="agid"><span class="tkey">a-intel.core.release-manager</span><span class="sub"><span class="hx" style="width:15px;height:15px" title="Claude Code"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#D97757" d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg></span> Claude Code</span></span></span></h1>`,
    },
  ],
  anatomy: [
    ["Harness mark", "`.agc>.hx`", "The harness logo from `hxIcon()`, 15px (16px in the compact layout), 6px before the avatar. In the detail layout it leads the second line instead, where a 60px avatar would dwarf it."],
    ["Card", "`.agc`", "A flex row with a 10px gap. `color:inherit` and no underline, so it reads the same as a link or a static span."],
    ["Identity block", "`.agc .agid`", "A column holding the key and its second line, 240px max, each line ellipsized on its own. The only part allowed to shrink."],
    ["Key", "`.agc .agid .tkey`", "The agent's key in Monaspace Neon."],
    ["Second line", "`.agc .agid .sub`", "One line under the key: the harness by default, or the 30-day figures in the compact layout."],
    ["List layout", "`.agc-list`", "The default. A 26px avatar, the key, and the harness alone."],
    ["Compact layout", "`.agc-compact`", "A bordered `--ink` box, padded, linked by default, with a gold border and `--hl` ground on hover."],
    ["Detail layout", "`.agc-detail`", "A 60px avatar and a 20px key, meant to sit inside the page's own `h1`."],
    ["Score slot", "`.agc>.scs`, `.agc-detail .sc`", "Reserved flex:none space to the right for a trust or spend score. No emitter today. See Findings."],
  ],
  usage: {
    when: [
      "Any place an agent's identity needs to be drawn: a table, a run, an approval, a mandate, the agent's own page.",
    ],
    not: [
      "A person's identity: use [avatar](avatar.html) with a person shape directly, since people have no harness or key.",
      "A tool's identity: use [tool cell](tool-cell.html).",
    ],
    examples: [
      { kind: "avoid", html: `<div style="display:flex;align-items:center;gap:8px"><span class="avx agent tn-soft" style="width:26px;height:26px">RM</span><b>a-intel.core.release-manager</b><span class="dim">Claude Code</span></div>`, why: "A hand-built identity row with its own markup. It cannot ellipsize the same way, carry the link the same way, or be told apart from a one-off in an audit." },
      { kind: "use", html: `<span class="agc agc-list"><span class="hx" style="width:15px;height:15px" title="Claude Code"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#D97757" d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg></span><span class="avx agent tn-soft" style="width:26px;height:26px">RM</span><span class="agid"><span class="tkey">a-intel.core.release-manager</span><span class="sub">Claude Code</span></span></span>`, why: "The shared component. Every agent identity drawn this way looks and behaves alike, and an audit can find every copy that doesn't." },
    ],
    rules: [
      "An agent is drawn only by `agentCard()`. A page that needs the key alone still wraps it in `.agc` so the identity block's ellipsis rule applies.",
      "The identity block gives way before anything else on the row. A layout that lets the second line push the row wider instead of ellipsizing is wrong.",
      "The compact layout links to the agent by default. The list and detail layouts do not, since the row or the page already is the link.",
    ],
  },
  content: [
    "**Harness mark**: the logo of the agent's harness (Claude Code, Codex CLI, stella, and the rest), in the brand colour where the brand has one. A harness with no mark falls back to the bot glyph, titled with the harness name.",
    "**Key**: the agent's key verbatim, in mono, never a display name in its place.",
    "**Second line, list and detail**: the harness label alone (\"Claude Code\", \"Codex CLI\").",
    "**Second line, compact**: the harness label, the 30-day run count, and the 30-day spend, joined with a mid-dot, since this is a caption under an identity, not sentence prose.",
    "**Missing agent**: when no record backs the key, the card still renders the key alone in a plain `.agc`, so a stale reference never disappears silently.",
  ],
  a11y: [
    "A linked agent card is a real `a` with the key as its visible text, so a screen reader announces the destination by name, not by a generic \"link\".",
    "The harness mark is `aria-hidden` when the second line names the harness. When a caller replaces the second line, the mark carries `role=\"img\"` and the harness name as its `aria-label`.",
    "The avatar is `aria-hidden`. The key and the second line carry the full identity in text.",
    "The detail layout's card sits inside the page's own `h1`, so the agent's key is announced as the page's heading, not as a caption beside it.",
  ],
  phone: [
    "The detail layout wraps at 390px: the score slot (`.agc-detail>.scs`), when present, drops to its own row instead of squeezing the avatar.",
    "The list and compact layouts keep their sizes. The identity block's ellipsis is what keeps them inside a narrow card or cell.",
  ],
  tokens: [
    ["--hl, --border", "Compact layout's ground and border, and its hover border"],
    ["--gold", "Compact layout's hover border and the focus ring on any linked card"],
    ["--fg", "Key text and the detail layout's larger key"],
    ["--muted", "Detail layout's second line"],
    ["--dim", "List and compact layouts' second line"],
  ],
  helpers: [
    ["hxIcon(harness, size, alone)", "engine.js:14925", "The harness mark, found by key or by label. `alone` adds `role=\"img\"` and an `aria-label` when no text beside the mark names the harness."],
    ["agentCard(a, o)", "engine.js:10069", "The one function that draws an agent identity. `o.layout` picks list, compact, or detail. 17 calls."],
  ],
  sourceNotes: [
    "`o.sub` overrides the second line outright, so a caller can put a run's turn number or a mandate's toolbelt count there instead of the harness. Several call sites do.",
    "`o.link` overrides the default per layout, and `o.onclick` lets a card inside an already-clickable row stop its own click from double-firing.",
  ],
  findings: [
    { tag: "note", title: "The score slot has no emitter", body: "`.agc>.scs` and `.agc-detail .sc` reserve space and set type for a trust or a spend score beside the identity, and `.steer-list .check>.scs` (engine.css 1342) repeats the reservation. `agentCard()` never fills any of them. Scores were part of the first version and were removed from rev1." },
    { tag: "note", title: "One helper, seventeen call sites, no drift found", body: "Unlike [stat box](stat-box.html) or [panel](panel.html), no hand-written copy of the agent card turned up in engine.js or wedge.js. Every identity on every sampled page goes through `agentCard()`." },
  ],
  audit: {
    checks: [
      "One implementation. Find every place the build draws an agent's key, avatar, and harness together. Each must be the same component. A hand-built identity row with the same information is a FAIL. List every copy.",
      "Harness mark. Every card shows its agent's harness mark: before the avatar in the list and compact layouts, before the harness name in the detail layout. A card without the mark, or a mark that disagrees with the harness name, is a FAIL.",
      "Layouts. List (26px avatar, harness only), compact (30px, bordered, harness plus 30-day runs and spend, linked), and detail (60px, inside the page `h1`) each render as specified. A layout with the wrong avatar size or the wrong default link is a FAIL.",
      "Ellipsis. The identity block, not the avatar or any reserved score space, is what gives way when the row narrows. Shrink the container and report what breaks first.",
      "Key fidelity. The key renders verbatim in mono. A display name substituted for the key, or the key re-cased, is a FAIL.",
      "Compact link. The compact layout is a real `a` to the agent's page, with the gold focus ring on keyboard focus and a `--hl` hover with a `--gold` border. A compact card with no link, or a `div` standing in for the `a`, is a FAIL.",
      "Detail heading. The detail layout sits inside the page's `h1`, so the agent's key is the page's one heading. A detail card outside any heading is a FAIL.",
      "Missing agent. A stale key with no backing record still renders the key in a plain, unlinked card rather than disappearing or throwing.",
      "Score slot. If the build ships a trust or spend score beside an agent's identity, confirm it reuses `.agc`'s reserved score slot rather than a new layout. If it ships none, this is a known gap, not a new one.",
    ],
  },
};
