// Agent card: the one way an agent identity is drawn, anywhere. See tools/build-components.mjs for
// the shape of this module.
export default {
  slug: "agent-card",
  name: "Agent card",
  group: "Data display",
  order: 70,
  summary: "The one way an agent identity is drawn: an avatar, its key, and a second line, in one of three layouts.",
  lead: "An agent card is an agent's identity wherever it appears: a table row, a run's header, an approval, a mandate. One markup and one CSS family draw it in three layouts so an agent looks the same everywhere it shows up. The identity block is the only part allowed to give way. It ellipsises before anything else moves.",
  root: ".agc",
  css: "lines 1308 to 1338 (agent card, its three layouts, and the rule comment above them), 1342 (a steer-list override)",
  usedOn: ["Agents", "Work", "Run", "Approvals", "Spend", "Tools", "Steering"],
  stories: [
    {
      id: "list",
      name: "List layout",
      note: "The default: a table cell, a picker, a drill-down. A 26px avatar and the harness as the only second line.",
      html: `
        <table class="narrow"><tbody>
          <tr><td><span class="agc agc-list"><span class="avx agent ic tn-soft" style="width:26px;height:26px" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/></svg></span><span class="agid"><span class="tkey">a-intel.core.release-manager</span><span class="sub">Claude Code</span></span></span></td></tr>
          <tr><td><a class="agc agc-list" href="#/a-intel/core-platform/agents/triage"><span class="avx agent ic tn-soft" style="width:26px;height:26px" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></span><span class="agid"><span class="tkey">a-intel.core.triage</span><span class="sub">Codex CLI</span></span></a></td></tr>
        </tbody></table>`,
    },
    {
      id: "compact",
      name: "Compact layout",
      note: "One agent on a record about something else: a run, an approval, a mandate. Bordered so it reads as a card, and linked to the agent by default.",
      html: `
        <a class="agc agc-compact" href="#/a-intel/core-platform/agents/release-manager"><span class="avx agent ic tn-soft" style="width:30px;height:30px" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/></svg></span><span class="agid"><span class="tkey">a-intel.core.release-manager</span><span class="sub">Claude Code · 412 runs 30d · $186.40</span></span></a>`,
    },
    {
      id: "detail",
      name: "Detail layout",
      note: "The agent's own page: the key is the page title, set inside the `h1` itself, at 60px.",
      html: `
        <h1 class="mono" style="font-size:20px;margin:0"><span class="agc agc-detail"><span class="avx agent ic tn-soft" style="width:60px;height:60px" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/></svg></span><span class="agid"><span class="tkey">a-intel.core.release-manager</span><span class="sub">Claude Code</span></span></span></h1>`,
    },
  ],
  anatomy: [
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
      { kind: "use", html: `<span class="agc agc-list"><span class="avx agent tn-soft" style="width:26px;height:26px">RM</span><span class="agid"><span class="tkey">a-intel.core.release-manager</span><span class="sub">Claude Code</span></span></span>`, why: "The shared component. Every agent identity drawn this way looks and behaves alike, and an audit can find every copy that doesn't." },
    ],
    rules: [
      "An agent is drawn only by `agentCard()`. A page that needs the key alone still wraps it in `.agc` so the identity block's ellipsis rule applies.",
      "The identity block gives way before anything else on the row. A layout that lets the second line push the row wider instead of ellipsizing is wrong.",
      "The compact layout links to the agent by default. The list and detail layouts do not, since the row or the page already is the link.",
    ],
  },
  content: [
    "**Key**: the agent's key verbatim, in mono, never a display name in its place.",
    "**Second line, list and detail**: the harness label alone (\"Claude Code\", \"Codex CLI\").",
    "**Second line, compact**: the harness label, the 30-day run count, and the 30-day spend, joined with a mid-dot, since this is a caption under an identity, not sentence prose.",
    "**Missing agent**: when no record backs the key, the card still renders the key alone in a plain `.agc`, so a stale reference never disappears silently.",
  ],
  a11y: [
    "A linked agent card is a real `a` with the key as its visible text, so a screen reader announces the destination by name, not by a generic \"link\".",
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
    ["agentCard(a, o)", "engine.js:10050", "The one function that draws an agent identity. `o.layout` picks list, compact, or detail. 17 calls."],
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
