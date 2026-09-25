// Drawer: the approvals drawer. One global instance, behind one button in the topbar of every page,
// so a decision never needs another page. See tools/build-components.mjs for the shape of this
// module, and stat-box.mjs for the depth and tone every module matches.
export default {
  slug: "drawer",
  name: "Drawer",
  group: "Overlays",
  order: 20,
  summary: "Every call parked for a person, one drawer, opened from any page.",
  lead: "The drawer lists every call parked for a decision across the organization: pending approvals and a paused agent waiting on an answer. Picking a row opens the full approval card in place, with approve and deny, so a decision never needs another page. One drawer exists at a time, and it opens from the topbar button on every page.",
  root: ".apd",
  css: "lines 2072 to 2099, countdown 818 to 831",
  usedOn: ["every page (topbar)"],
  stories: [
    {
      id: "trigger",
      name: "Trigger button",
      note: "The topbar button. The count is pending approvals plus an open interjection, and it drives the badge and the `aria-label`.",
      row: true,
      html: `
        <button class="iconbtn apd-btn" aria-pressed="false" aria-controls="apdrawer" aria-label="Approvals, 4 waiting on you across all workspaces">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6z"/><path d="M12 8v4l2.5 1.5"/></svg>
          <span class="cnt">4</span>
        </button>
        <button class="iconbtn apd-btn" aria-pressed="true" aria-controls="apdrawer" aria-label="Approvals, 4 waiting on you across all workspaces">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6z"/><path d="M12 8v4l2.5 1.5"/></svg>
          <span class="cnt">4</span>
        </button>`,
    },
    {
      id: "list",
      name: "Open drawer",
      note: "`.apd` is `position:fixed`. The inline `position:relative` and `inset:auto` below keep it in this canvas. The product draws it pinned to the right edge of the window.",
      canvas: "panel",
      html: `
        <div class="apd-scrim open" style="position:relative;inset:auto;background:none"></div>
        <aside id="apdrawer" class="apd open" role="complementary" aria-label="Approvals" style="position:relative;top:auto;bottom:auto;right:auto;width:100%;max-width:420px;border-left:1px solid var(--border);border-radius:12px;overflow:hidden">
          <div class="apd-h"><h3>Approvals</h3><span class="b b-approval"><span class="d"></span>4 waiting on you in all workspaces</span>
            <button class="iconbtn" style="margin-left:auto" aria-label="Close approvals">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
          </div>
          <div class="apd-b">
            <p class="eyebrow q" style="margin:0 0 8px">4 waiting on you</p>
            <div class="apd-list">
              <div class="apd-row inter" style="cursor:default">
                <span class="g"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/></svg></span>
                <span class="tt"><b>a-intel.core.triage is paused and needs a decision</b><span>It's working in <span class="mono">a-intel/edge-config</span>, which isn't linked to any workspace, so there's no skill configuration to apply. No cost since 09:14. If nobody answers within 30 min, the request is denied.</span></span>
                <button class="btn sm primary" style="flex:none">Answer</button>
              </div>
              <button class="apd-row crit" aria-label="Open approval ap_stripe_9f21">
                <span class="g"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6z"/></svg></span>
                <span class="tt"><b>$1,240.00 USD &middot; stripe__create_payment@5</b><span>invoice-bot &middot; pay Q3 vendor invoice &middot; Core platform</span>
                  <span class="mono" style="font-size:11px">work order &middot; wo_01K6TF3Q</span>
                  <span class="m"><span class="b b-critical">critical</span><span class="b b-denied">Irreversible</span></span></span>
                <span class="apsm-clk warn" data-countdown="ap_stripe_9f21" data-pre="Expires in " style="flex:none">Expires in 1:48</span>
              </button>
              <button class="apd-row" aria-label="Open approval ap_gh_4410">
                <span class="g"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6z"/></svg></span>
                <span class="tt"><b>github__create_release@2</b><span>release-manager &middot; cut v0.6.0 &middot; Core platform</span>
                  <span class="m"><span class="b b-approval">medium</span></span></span>
                <span class="apsm-clk" data-countdown="ap_gh_4410" data-pre="Expires in " style="flex:none">Expires in 8:32</span>
              </button>
            </div>
            <p class="eyebrow q" style="margin:18px 0 8px">1 resolved today</p>
            <div class="apd-list">
              <button class="apd-row done" aria-label="Open approval ap_stripe_7f02">
                <span class="g"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6z"/></svg></span>
                <span class="tt"><b>$412.00 USD &middot; stripe__create_payment@5</b><span>invoice-bot &middot; Core platform</span></span>
                <span class="b b-allowed" style="flex:none"><span class="d"></span>approved</span>
              </button>
            </div>
            <div class="note" style="margin-top:14px;font-size:11.5px">Approving allows this exact call once. When the approval expires, the call ends and the agent is told why.</div>
          </div>
        </aside>`,
    },
    {
      id: "detail",
      name: "Row selected",
      note: "Picking a row keeps the drawer open and shows the full approval card in its place, with a back link to the list.",
      canvas: "panel",
      html: `
        <aside id="apdrawer" class="apd open" role="complementary" aria-label="Approvals" style="position:relative;top:auto;bottom:auto;right:auto;width:100%;max-width:420px;border-left:1px solid var(--border);border-radius:12px;overflow:hidden">
          <div class="apd-h"><h3>Approvals</h3><span class="b b-approval"><span class="d"></span>4 waiting on you in all workspaces</span>
            <button class="iconbtn" style="margin-left:auto" aria-label="Close approvals">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
          </div>
          <div class="apd-b">
            <button class="btn sm" style="margin-bottom:12px">&lsaquo; All approvals</button>
            <div class="apcard crit" id="ap-ap_stripe_9f21">
              <div class="aphead">
                <div style="min-width:0">
                  <p class="eyebrow" style="margin-bottom:6px">Approval required</p>
                  <div class="amt">$1,240.00 <span class="cur">USD</span></div>
                  <div class="muted" style="font-size:12.5px;margin-top:4px"><span class="mono">stripe__create_payment@5</span> &rarr; <span class="mono">Northwind Textiles</span></div>
                  <div class="row" style="margin-top:9px"><span class="b b-critical">critical</span><span class="b b-denied">Irreversible</span></div>
                </div>
                <div class="r"><span class="eyebrow q" style="font-size:10px;margin:0">times out in</span><span class="clock warn" data-countdown="ap_stripe_9f21">1:48</span></div>
              </div>
              <div class="apbody">
                <p class="muted" style="font-size:11.5px;flex:1;min-width:220px">Approving allows this exact call once. Denying ends the call, and the agent is told your reason.</p>
              </div>
              <div class="apfoot">
                <span class="muted" style="font-size:11.5px;flex:1;min-width:220px">Approving allows this exact call once. Denying ends the call, and the agent is told your reason.</span>
                <span class="r"><button class="btn ghost sm">Open run</button><button class="btn danger">Deny payment</button><button class="btn primary">Approve $1,240.00 USD</button></span>
              </div>
            </div>
          </div>
        </aside>`,
    },
    {
      id: "empty",
      name: "Nothing waiting",
      note: "Nothing is parked. The text says what would park here.",
      canvas: "panel",
      html: `
        <aside id="apdrawer" class="apd open" role="complementary" aria-label="Approvals" style="position:relative;top:auto;bottom:auto;right:auto;width:100%;max-width:420px;border-left:1px solid var(--border);border-radius:12px;overflow:hidden">
          <div class="apd-h"><h3>Approvals</h3><span class="b b-q"><span class="d"></span>0 waiting on you in all workspaces</span>
            <button class="iconbtn" style="margin-left:auto" aria-label="Close approvals">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
          </div>
          <div class="apd-b">
            <div style="text-align:center;padding:26px 6px">
              <p class="muted" style="font-size:12.5px;margin:0">Nothing is waiting on you.</p>
              <p class="dim" style="font-size:11.5px;margin:8px 0 0">A call parks here when policy returns <span class="mono">approve</span>. A denied call never parks. It ends at once and costs nothing.</p>
            </div>
          </div>
        </aside>`,
    },
  ],
  anatomy: [
    ["Scrim", "`.apd-scrim`", "The fixed backdrop, `rgba(0,0,0,.42)`, that fades in with `.open` and closes the drawer on click."],
    ["Panel", "`.apd`", "A `--panel` box 680px wide (`min(680px, 100vw - 56px)`), pinned to the right edge, full height, with a 1px `--border` left edge. Phone drops it to full width."],
    ["Header", "`.apd-h`", "The h3 title (14px), the total badge, and the close button, 14px by 16px padding, with a bottom border."],
    ["Body", "`.apd-b`", "The rows, 14px by 16px padding. It scrolls on its own when the list is taller than the window."],
    ["List", "`.apd-list`", "An 8px grid of rows, one per section (waiting on you, resolved today)."],
    ["Row", "`.apd-row`", "A full-width button: a 26px icon tile (`.g`), the title block (`.tt`), and a clock or a resolved badge, in a `--panel` card with a 1px `--border`. Hover lifts the border to `--rule`."],
    ["Critical row", "`.apd-row.crit`", "The border tints toward `--st-critical` at 45%, for a critical, irreversible, or tainted call."],
    ["Interjection row", "`.apd-row.inter`", "A paused agent waiting on an answer. Its border tints toward `--st-approval`, it is not a button (`cursor:default`), and it carries its own Answer button rather than opening a card."],
    ["Resolved row", "`.apd-row.done`", "72% opacity, its clock replaced by an approved or denied badge."],
    ["Title block", "`.apd-row .tt`", "The call and its context: a bold 12.5px title, an 11.5px `--muted` line, and `.m`, a wrapped row of risk and taint badges."],
    ["Countdown", "`.apsm-clk`", "13px mono, `--st-approval`, tabular figures. Past two minutes left it turns `.warn` (`--st-critical`). A resolved call shows `.done` (`--dim`, an em dash)."],
    ["Selected card", "`.apd .apcard`", "The full approval card, margin removed to sit flush in the body, with a `‹ All approvals` back button above it."],
  ],
  usage: {
    when: [
      "Every call parked for a person across the organization: pending approvals and a paused agent waiting on an answer.",
      "A quick decision that should not cost a page navigation: approve, deny, or open the run for more context.",
    ],
    not: [
      "A task or a decision scoped to the page you are on: use a [dialog](dialog.html).",
      "The result of a decision already made: use a [toast](toast.html).",
      "A record's own approvals history: link to the run.",
    ],
    examples: [
      { kind: "avoid", html: `<div class="apd-row" style="cursor:default"><span class="tt"><b>3 things need you</b></span></div>`, why: "One row standing in for three calls. Each call is its own row, its own clock, and its own decision." },
      { kind: "use", html: `<button class="apd-row" aria-label="Open approval ap_gh_4410" style="width:auto"><span class="g"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 5 6v6c0 4 3 7.5 7 9 4-1.5 7-5 7-9V6z"/></svg></span><span class="tt"><b>github__create_release@2</b><span>release-manager &middot; Core platform</span></span><span class="apsm-clk">Expires in 8:32</span></button>`, why: "One call, one row, its own countdown." },
    ],
    rules: [
      "One drawer. It opens from the topbar button on every page, and only one selected card shows at a time.",
      "A row's clock keeps running while the drawer is open. `tick()` updates every `[data-countdown]` node once a second.",
      "Selecting a row keeps the drawer open. Closing the drawer while a row is selected forgets the selection, so it reopens on the list.",
    ],
  },
  content: [
    "**Title**: the h3 reads \"Approvals\" always. The badge states the count and its scope: \"4 waiting on you in all workspaces\".",
    "**Row title**: the amount and tool for a payment (\"$1,240.00 USD · stripe__create_payment@5\"), or the tool alone otherwise.",
    "**Row subline**: the agent, the task, and the workspace, joined with a mid-dot, matching the rest of the run vocabulary.",
    "**Countdown**: \"Expires in \" plus `m:ss`, read from the record's deadline. A resolved row reads its outcome instead: \"approved\" or \"denied\".",
    "**Empty state**: names what would park here and why nothing has: \"A call parks here when policy returns `approve`. A denied call never parks.\"",
    "**Interjection copy**: names the agent, what it is doing, the cost so far, and what happens if nobody answers in time.",
  ],
  a11y: [
    "The trigger is `aria-controls=\"apdrawer\"` with `aria-pressed` for open state, and its `aria-label` states the count so a screen reader hears it without opening the drawer.",
    "The panel is `role=\"complementary\"` with `aria-label=\"Approvals\"`, and carries `inert` and `aria-hidden=\"true\"` while closed.",
    "Escape closes the drawer when no dialog is open, and a click on the scrim closes it.",
    "Every row is a real `button` with an `aria-label` naming the approval it opens, except the interjection row, which is not clickable and carries its own labelled Answer button.",
  ],
  phone: [
    "`.apd.phone` becomes full width with no left border, and is removed from the layout entirely (`display:none`) rather than just hidden while closed.",
    "The scrim, header, and footer actions keep their sizes. Only the panel width changes.",
  ],
  tokens: [
    ["--panel", "Panel and row ground"],
    ["--border", "Row border and header divider"],
    ["--rule", "Row border on hover"],
    ["--hl", "Row icon tile ground"],
    ["--muted", "Row icon tile color and sublines"],
    ["--st-critical", "Critical row border tint and the critical badge"],
    ["--st-approval", "Interjection row border tint and the countdown"],
    ["--dim", "Resolved countdown"],
  ],
  helpers: [
    ["apdButton()", "engine.js:1681", "The topbar trigger, with the live count."],
    ["apdToggle(v)", "engine.js:1687", "Opens or closes the drawer and clears the selection on close."],
    ["apdRow(a)", "engine.js:1690", "One approval row, pending or resolved."],
    ["apdInterjectionRow(x)", "engine.js:1702", "The paused-agent row, with its own Answer button."],
    ["apdBody(a)", "engine.js:1708", "The list, or the selected approval's card when `S.apd.sel` is set."],
    ["apdHtml()", "engine.js:1722", "The scrim and the panel, assembled from `apdBody()`."],
    ["approvalCard(a)", "engine.js:1894", "The full card shown for a selected row, shared with the Run page."],
  ],
  sourceNotes: [
    "Escape closes the drawer through the document key handler at engine.js 1673, guarded on no dialog being open.",
    "`approvalCardSm()` (engine.js 1810) is a second, compact card that nothing in the mockup calls, so its `.apsm*` rules draw only the countdown class this page documents. See Findings.",
  ],
  findings: [
    { tag: "open", title: "Stale comment names a tile that does not exist", body: "The section comment at engine.js 1618 says \"The Agents page keeps a 'Waiting on you' tile that opens it.\" No stat, button, or link anywhere in engine.js calls `apdToggle`. The topbar trigger is the only way to open the drawer today." },
    { tag: "note", title: "A card with no caller", body: "`approvalCardSm()` (engine.js 1810) draws a second, compact approval card. Nothing calls it, so of its rules only `.apsm-clk` renders, through the drawer's own countdown. The rest of `.apsm*` is unused." },
    { tag: "note", title: "Hard-coded scrim", body: "`.apd-scrim` sets `rgba(0,0,0,.42)` in both themes, matching `.scrim`'s own hard-coded color on the [dialog](dialog.html) page. Neither follows a token." },
    { tag: "note", title: "Retired word still on screen", body: "The word \"interjection\" appears only in code names and this reference. The drawer's own copy reads \"is paused and needs a decision,\" which already avoids it. Mac still owns whether \"interjection\" is retired as a term everywhere it appears in source." },
  ],
  audit: {
    checks: [
      "Trigger. The topbar carries one button with `aria-controls=\"apdrawer\"`, an `aria-label` stating the live count, and `aria-pressed` reflecting open state. A count of zero shows no badge.",
      "Panel. `role=\"complementary\"`, `aria-label=\"Approvals\"`, 680px wide capped at `100vw - 56px`, pinned to the right edge, over a scrim that closes it on click.",
      "Rows. Each pending or resolved row is a `button` with an `aria-label` naming the approval. A critical, irreversible, or tainted call shows the critical border tint. A resolved row shows its outcome badge, not a clock.",
      "Countdown. Every open row's clock updates once a second and turns to the warn color under two minutes remaining. A resolved row shows an em dash, never a stale time.",
      "Selection. Picking a row replaces the list with the full approval card and a back control. The drawer stays open, and closing it during selection clears the selection for next time.",
      "Interjection. A paused agent renders as a non-clickable row with its own Answer button, distinct from an approval row, and never shows a clock.",
      "Focus and close. Escape and a scrim click close the drawer when no dialog is open. The panel is `inert` and `aria-hidden` while closed.",
      "One instance. Only one drawer exists on the page at once, shared across every route. Any second copy is a FAIL.",
    ],
  },
};
