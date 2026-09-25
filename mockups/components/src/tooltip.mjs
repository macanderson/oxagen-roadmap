// Tooltip: one hover layer, text only, for the charts and instruments that need more than a native
// title can hold. See tools/build-components.mjs for the shape of this module, and stat-box.mjs for
// the depth and tone every module matches.
export default {
  slug: "tooltip",
  name: "Tooltip",
  group: "Overlays",
  order: 40,
  summary: "One hover layer, text only, the same content on focus.",
  lead: "A tooltip explains a mark that has no room for its own label: a bar in a chart, a segment in a stacked meter, a step in the run timeline. One node in the whole page shows the text, positioned over the element on hover or keyboard focus, and hides again on mouseleave or blur. A short, static label uses the browser's own `title` attribute instead.",
  root: ".rtip",
  css: "lines 1436 to 1437",
  usedOn: ["Run (instruments, cost and step charts)", "Spend (basis and category charts)"],
  stories: [
    {
      id: "node",
      name: "The tooltip node",
      note: "`#rtip` is `position:fixed`, so this example fixes it in place with an inline override to keep it inside the canvas.",
      canvas: "panel",
      html: `
        <div style="position:relative;height:64px">
          <div class="meter" style="width:220px">
            <div class="lab">Input tokens<b>41,200 <span class="dim" style="font-weight:500">&middot; 62%</span></b></div>
          </div>
          <div id="rtip" class="rtip" role="tooltip" style="position:absolute;left:8px;top:38px">41,200 tokens &middot; 62% of the call</div>
        </div>`,
    },
    {
      id: "chart",
      name: "On a chart segment",
      note: "Every segment in a stacked or column chart carries `tipAttr()`: the same text on hover and on keyboard focus.",
      row: true,
      html: `
        <div class="stk" style="width:220px">
          <i class="fk-model" style="flex:6" data-tip="6 steps advanced the task"></i>
          <i style="flex:2;background:var(--rule)" data-tip="2 steps did not: retries, re-reads and waits"></i>
        </div>
        <div id="rtip" class="rtip" role="tooltip" style="position:relative;left:auto;top:auto">2 steps did not: retries, re-reads and waits</div>`,
    },
    {
      id: "native-title",
      name: "Native title",
      note: "A badge or a chip that only needs one line of static text uses the browser's own `title`, not `rtip`.",
      row: true,
      html: `
        <span class="basis" title="gateway_observed">Observed by gateway</span>
        <span class="b b-tier b-allowed" title="Every call runs at a broker the gateway controls.">gateway</span>`,
    },
  ],
  anatomy: [
    ["Node", "`.rtip` (`#rtip`)", "A `--fg` ground with `--ink` text, mono, 11px, 5px by 8px padding, a 6px radius, `--shadow-sm`, at most 340px wide, `pointer-events:none`, `position:fixed`."],
    ["Content", "text only", "`textContent`, never HTML. Line breaks are literal `\\n` in the source string, rendered by `white-space:pre-line`."],
  ],
  usage: {
    when: [
      "A chart bar, a stacked segment, or a frame marker whose value or breakdown has no room to print beside it.",
      "The exact same fact belongs on hover and on keyboard focus, such as a cost breakdown per turn.",
    ],
    not: [
      "A short, static label on a badge or chip: use the native `title` attribute.",
      "Text a person needs to read without hovering: print it in the layout.",
      "Rich content (a mini card, a list, an image): open a [dialog](dialog.html) or a [menu](menu.html) instead.",
    ],
    examples: [
      { kind: "avoid", html: `<i class="fk-model" style="flex:6" title="6 steps advanced the task"></i>`, why: "A native title on a chart segment shows late, has no keyboard-focus equivalent on a non-focusable element, and cannot be positioned to avoid the viewport edge." },
      { kind: "use", html: `<i class="fk-model" tabindex="0" style="flex:6" data-tip="6 steps advanced the task"></i>`, why: "The engine's hover layer: one shared node, shown the same way on hover and focus." },
    ],
    rules: [
      "One tooltip node per page. Every hover target updates the same `#rtip` rather than creating its own.",
      "Text only, one line or a few short lines. A tooltip that needs a heading or a list is a [dialog](dialog.html) or a [menu](menu.html), not a bigger tooltip.",
      "The content on focus is identical to the content on hover. A tooltip that only shows on mouse events leaves a keyboard reader with less information than a pointer gets.",
    ],
  },
  content: [
    "**Wording**: the value, then its basis or breakdown, joined with a mid-dot: \"6 steps · $1.42 · cache 62%\". No sentence case requirement beyond the page's own numbers and labels.",
    "**Length**: short enough to read at a glance. A tooltip that needs scrolling belongs on the page instead.",
  ],
  a11y: [
    "The node carries `role=\"tooltip\"`.",
    "`tipAttr()` wires `onmouseenter`, `onmousemove`, `onmouseleave`, `onfocus`, and `onblur` to the same show and hide functions, so the content on focus matches the content on hover exactly.",
    "Escape does not hide the tooltip. Tabbing past the element is the only way to dismiss it today. See Findings.",
    "The node is `pointer-events:none`, so it never blocks the element or its neighbors from being clicked.",
  ],
  phone: [
    "Hover has no equivalent on a touch pointer. A chart segment's value should also be reachable without the tooltip on a touch device. The mockup does not provide one today.",
  ],
  tokens: [
    ["--fg, --ink", "Node ground and text"],
    ["--shadow-sm", "Node shadow"],
    ["--mono", "Node type"],
  ],
  helpers: [
    ["tipAttr(s)", "engine.js:2127", "Writes the `data-tip` attribute and the four event handlers. 16 calls, across the run instruments, the calls panel, the token bars, the step stack, and the Spend charts."],
    ["rtTip(node, ev)", "engine.js:2127", "Creates `#rtip` once, sets its text from `data-tip`, and positions it above the target, flipping below when it would clip the top of the viewport."],
    ["rtTipHide()", "engine.js:2138", "Hides `#rtip` on mouseleave or blur."],
  ],
  findings: [
    { tag: "open", title: "No Escape to dismiss", body: "Nothing in `engine.js` calls `rtTipHide()` on Escape. The dialog, the drawer, and the mention list all close on Escape. The tooltip only hides on `mouseleave` or `blur`, so a keyboard reader must tab away to clear it." },
    { tag: "note", title: "Two hover idioms, correctly split", body: "16 sites use `tipAttr()` for dynamic, computed text on charts and instruments. Dozens more use a native `title` for a short, static label on a badge, a chip, or an icon button. The split matches the usage rule above. Neither idiom is misapplied today." },
  ],
  audit: {
    checks: [
      "One node. The whole page shares one `#rtip`. Two tooltips open on screen at once, or a second node created per hover target, is a FAIL.",
      "Same content on focus. Tab to a chart segment or frame marker and confirm the tooltip text matches what hovering it shows, word for word.",
      "Text only. The tooltip renders as plain text, never HTML, never an image, never an interactive control.",
      "Positioning. The tooltip stays inside the viewport, flipping below the target when it would clip the top edge, and never covers the element it explains.",
      "Native title. Every badge or chip with a short static label uses `title`, not `data-tip`. A static label reimplemented with the tooltip layer is a FAIL.",
      "Dismiss. Hovering away, blurring the element, or tabbing past it hides the tooltip. If the build adds Escape-to-dismiss, confirm it does not also close a dialog or the drawer behind it.",
      "Pointer events. The node does not block clicks on the element underneath it or its neighbors.",
    ],
  },
};
