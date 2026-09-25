// Avatar: the one shape that stands for a person or an agent, wherever a record names one. See
// tools/build-components.mjs for the shape of this module, and stat-box.mjs as the reference.
export default {
  slug: "avatar",
  name: "Avatar",
  group: "Data display",
  order: 55,
  summary: "The shape that stands for a person or an agent, everywhere a record names one.",
  lead: "An avatar carries a kind (icon, initials, or photo) and a tone, both stored on the record it represents, never chosen at the point of display. People render round. Agents render as squircles, so the two never read alike at a glance. Every tone comes from the same three-step house scale, so no avatar can carry a color the palette does not already have.",
  root: ".avx",
  css: "lines 491, 496 to 506",
  usedOn: ["Agents", "Agent card", "Approvals", "Organization (people)", "Account", "Spend (evidence dialog)", "Work orders (Stages)"],
  stories: [
    {
      id: "person",
      name: "Person",
      note: "Two people, from `personAv()`: Priya Natarajan (serif initials, solid tone) and Marcus Bell (sans initials, soft tone).",
      html: `
        <div class="row" style="gap:14px">
          <span class="avx person f-serif tn-solid" style="width:44px;height:44px;font-size:16px" aria-hidden="true">PN</span>
          <span class="avx person f-sans tn-soft" style="width:44px;height:44px;font-size:16px" aria-hidden="true">MB</span>
        </div>`,
    },
    {
      id: "agent",
      name: "Agent",
      note: "Two agents, from `agentAv()`: the release manager (a rocket icon, solid tone) and stella CI (mono initials, soft tone).",
      html: `
        <div class="row" style="gap:14px">
          <span class="avx agent ic tn-solid" style="width:44px;height:44px" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/></svg></span>
          <span class="avx agent f-mono tn-soft" style="width:44px;height:44px;font-size:16px" aria-hidden="true">CI</span>
        </div>`,
    },
    {
      id: "tones",
      name: "Three tones",
      note: "Solid, soft, and line, the only three an avatar may carry, on the triage agent's stethoscope icon.",
      html: `
        <div class="row" style="gap:14px">
          <span class="avx agent ic tn-solid" style="width:36px;height:36px" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/></svg></span>
          <span class="avx agent ic tn-soft" style="width:36px;height:36px" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/></svg></span>
          <span class="avx agent ic tn-line" style="width:36px;height:36px" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/></svg></span>
        </div>`,
    },
    {
      id: "photo",
      name: "Photo",
      note: "`kind:\"photo\"` renders an `img`, cropped to the shape's radius, from Dana Okafor's record.",
      html: `
        <span class="avx person tn-soft" style="width:44px;height:44px" aria-hidden="true"><img src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2096%2096%22%3E%3Crect%20width%3D%2296%22%20height%3D%2296%22%20fill%3D%22%23292722%22%2F%3E%3Cpath%20d%3D%22M14%2098c2-24%2016-34%2034-34s32%2010%2034%2034z%22%20fill%3D%22%239B958A%22%2F%3E%3Ccircle%20cx%3D%2248%22%20cy%3D%2238%22%20r%3D%2217%22%20fill%3D%22%23DDD8CD%22%2F%3E%3Cpath%20d%3D%22M31%2036c0-14%208-21%2017-21s17%207%2017%2021c-4-6-9-9-17-9s-13%203-17%209z%22%20fill%3D%22%2310100F%22%2F%3E%3C%2Fsvg%3E" alt=""></span>`,
    },
    {
      id: "sizes",
      name: "Sizes in context",
      note: "The same person avatar at the three sizes the mockup actually uses: 18px in a stage card, 38px beside a name, 52px in the account profile header.",
      html: `
        <div class="row" style="gap:14px;align-items:center">
          <span class="avx person f-sans tn-soft" style="width:18px;height:18px;font-size:8px" aria-hidden="true">MB</span>
          <span class="avx person f-sans tn-soft" style="width:38px;height:38px;font-size:14px" aria-hidden="true">MB</span>
          <span class="avx person f-sans tn-soft" style="width:52px;height:52px;font-size:19px" aria-hidden="true">MB</span>
        </div>`,
    },
  ],
  anatomy: [
    ["Shape", "`.avx`", "An inline grid, centered content, 1px border, fixed inline size set by `style`."],
    ["Person shape", "`.avx.person`", "A full circle, `border-radius:50%`."],
    ["Agent shape", "`.avx.agent`", "A squircle, `border-radius:27%`."],
    ["Solid tone", "`.avx.tn-solid`", "`--fg` fill, `--ink` glyph: the foreground color as a disc."],
    ["Soft tone", "`.avx.tn-soft`", "`--hl` fill, `--fg` glyph, `--border` edge: a lifted panel."],
    ["Line tone", "`.avx.tn-line`", "Transparent fill, `--fg` glyph, `--rule` edge: a hairline outline."],
    ["Icon glyph", "`.avx svg`", "A Lucide icon at 56% of the box, one line weight, drawn in `currentColor`."],
    ["Initials glyph", "`.avx.f-sans` / `.f-serif` / `.f-mono`", "One to three letters, sized down as the string gets longer, in one of three faces."],
    ["Photo", "`.avx img`", "Fills the box, `object-fit:cover`, cropped to the shape's radius."],
    ["Flat circle (legacy)", "`.avat`", "A fixed 52px circle with no tone system: `--hl` fill, `--border` edge. Has exactly one caller (see Findings)."],
  ],
  usage: {
    when: [
      "Any place a record names a person or an agent: a table row, a card, a chain, an approval.",
      "A place that needs to tell at a glance whether the actor is a person or an agent, by shape alone.",
    ],
    not: [
      "A tool or a provider: use its own logo mark, not an avatar shape.",
      "A state or an outcome: use a [badge](badge.html), never a colored avatar tone.",
    ],
    examples: [
      { kind: "avoid", html: `<span style="display:inline-grid;place-items:center;width:32px;height:32px;border-radius:50%;background:#f4b400;color:#111" aria-hidden="true">MB</span>`, why: "A free color outside the three tones, and a radius chosen by hand instead of the person/agent rule." },
      { kind: "use", html: `<span class="avx person f-sans tn-soft" style="width:32px;height:32px;font-size:12px" aria-hidden="true">MB</span>`, why: "A tone from the house scale and a shape that says \"person\" before the initials are even read." },
    ],
    rules: [
      "Shape follows subject, not context: a person is always round, an agent is always a squircle, wherever it renders.",
      "Tone, icon, font, and photo are stored on the record and read by `avatarHtml()`. A page never picks a color for an avatar itself.",
      "An avatar beside a name is decorative. The visible text carries the identity, so the avatar itself needs no separate label.",
    ],
  },
  content: [
    "**Initials**: one to three characters from the record's own text, never invented at render time.",
    "**Icon**: one glyph from the shared Lucide set, chosen to suggest the agent's job (a rocket for a release manager, a stethoscope for triage), never a literal logo.",
    "**Alt text**: a photo avatar's `img` carries `alt=\"\"`, since the avatar is decoration next to a visible name.",
  ],
  a11y: [
    "Every avatar, in every kind, renders with `aria-hidden=\"true\"`, including a photo. A screen reader relies on the name printed beside it, never on the avatar.",
    "Tone is never the only signal for anything: it decorates identity, and identity is also carried by the visible initials, icon, or photo, not by color alone.",
    "The icon and initials glyphs use `currentColor`, so they always meet the tone's own contrast pair (`--fg` on `--ink`, `--fg` on `--hl`, `--fg` on transparent).",
  ],
  phone: [
    "An avatar keeps its stored size on a phone. Nothing about `.avx` has a phone rule of its own.",
    "In a card that reflows to a phone width, the avatar stays the same pixel size while the text around it wraps.",
  ],
  tokens: [
    ["--fg", "Solid tone fill and glyph on the other two tones"],
    ["--ink", "Solid tone glyph, agent shape's squircle background context"],
    ["--hl", "Soft tone fill"],
    ["--border", "Soft tone edge"],
    ["--rule", "Line tone edge"],
    ["--font", "`.f-sans` initials"],
    ["--mono", "`.f-mono` initials"],
  ],
  helpers: [
    ["avatarHtml(av, size, shape, extra)", "engine.js:327", "The one avatar renderer: reads `{kind, icon|text|src, font, tone}` off a record and writes the `.avx` span."],
    ["personAv(key, size)", "engine.js:336", "Looks up a person by key and renders them round. 11 calls."],
    ["agentAv(a, size)", "engine.js:337", "Takes an agent object or key and renders it as a squircle. 8 calls."],
  ],
  sourceNotes: [
    "Rule, in the CSS comment at engine.css 492 to 495: people are round, agents are squircles. Three tones, all from the house scale and nothing else: solid, soft, line. No free color, no gradient.",
    "`.avx.f-serif` sets Georgia (with system serif fallbacks), which is the one font family anywhere in the product outside Geist, Space Grotesk, and Monaspace Neon. It is not a departure: it is the operator's own choice of initials font for their avatar, the same way a person picks a photo.",
    "`.avat` (engine.css 491) predates the tone system and has exactly one caller, a fallback avatar in the evidence dialog for an agent id the fixtures do not carry a record for (engine.js 9459). That caller overrides `.avat`'s own circular radius with an inline `border-radius:9px`, so `.avat`'s own shape never actually appears on screen.",
  ],
  findings: [
    { tag: "open", title: "A dead shape with a live caller", body: "The components index lists `.avat` among the rules with no emitter. That is stale: `.avat` has exactly one caller, the evidence dialog's placeholder avatar for an agent id with no matching record (engine.js 9459). The caller overrides the class's own 52px circular radius with an inline `border-radius:9px`, so `.avat`'s own definition still renders nothing a person can see. The index's finding should read \"one caller, and it overrides the class\" rather than \"no emitter\"." },
    { tag: "note", title: "One legacy shape beside the tone system", body: "`.avat` is a flat circle with no kind, no tone, and no shape rule, left over from before `avatarHtml()`. Its one caller could use `agentAv()` with a fallback record instead, retiring `.avat` entirely." },
  ],
  audit: {
    checks: [
      "Shape by subject. Every avatar representing a person is a circle, and every avatar representing an agent is a squircle, with no exception by page or context. Report any avatar whose shape does not match its subject.",
      "Tone. Every avatar's fill, glyph color, and border resolve to one of the three tones (solid, soft, line), each built from `--fg`, `--ink`, `--hl`, `--border`, or `--rule`. A raw hex, an rgba, or a gradient on an avatar is a FAIL.",
      "One implementation. Every avatar is drawn by one shared component that reads `{kind, tone, shape}` off the record. An avatar assembled inline with its own markup is a FAIL. List every hand-drawn copy, including a flat, toneless fallback circle like `.avat`.",
      "Icon set. An icon avatar uses one glyph from the shared icon set, one line weight, in `currentColor`, never a literal brand logo standing in for an agent.",
      "Initials. One to three characters from the record's own name or key, sized down as the string lengthens, never invented or truncated inconsistently between call sites.",
      "Photo. A photo avatar crops to the shape's radius with `object-fit:cover` and carries `alt=\"\"`, since the name beside it carries the identity.",
      "Accessibility. Every avatar is `aria-hidden` or otherwise excluded from the accessibility tree, and the identity it stands for is always also present as visible text beside it.",
      "Fonts outside the three faces. Report every font family used inside an avatar. Only Geist, Monaspace Neon, and the operator's own initials-font choice (if the build offers one, as Georgia does here) are expected. Anything else is a FAIL.",
    ],
  },
};
