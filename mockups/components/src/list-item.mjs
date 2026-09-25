// List item: one row in a bordered list of short records, an icon and two lines of text. See
// tools/build-components.mjs for the shape of this module, and stat-box.mjs as the reference.
export default {
  slug: "list-item",
  name: "List item",
  group: "Data display",
  order: 80,
  summary: "One row in a bordered list: an icon, two lines of text, and a timestamp.",
  lead: "A list item is a compact record inside a `.lst`: a notification, a security method, an active session. It leads with a tone icon, carries a title and one line of detail, and ends in a timestamp or an action. An unread item is a button that marks itself read. A read item is plain text.",
  root: ".lst",
  css: "lines 551 to 561, 589 to 608",
  usedOn: ["Notifications", "Account (Security tab)"],
  stories: [
    {
      id: "notifications",
      name: "Notification list",
      note: "From `notifsBody()`. The unread rows are buttons, and the read rows are plain `div`s. Every `.ic` tone the CSS defines appears once.",
      html: `
        <div class="lst">
          <div class="li unread" role="button" tabindex="0" aria-label="Mark read: Approval waiting · github__merge_pull_request@3"><span class="ic t-approval"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
            <div class="bd2"><div class="t1">Approval waiting · github__merge_pull_request@3</div><div class="t2">a-intel.core.release-manager on run_01K5ZB4T8P wants to merge a-intel/platform#1893 into main. Rule merge.requires_approval. Expires 15:54.</div>
            <div class="mono dim" style="font-size:11px;margin-top:3px">approval.requested</div></div>
            <time>15:44</time></div>
          <div class="li unread" role="button" tabindex="0" aria-label="Mark read: Hard budget reached · a-intel.core.docs-writer"><span class="ic t-failed"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5v.5"/></svg></span>
            <div class="bd2"><div class="t1">Hard budget reached · a-intel.core.docs-writer</div><div class="t2">$0.80 per run reached at turn 3 of run_01K5ZA0J2M. The run was paused at the next checkpoint.</div>
            <div class="mono dim" style="font-size:11px;margin-top:3px">budget.breached</div></div>
            <time>15:21</time></div>
          <div class="li"><span class="ic t-gold"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="8" r="2.5"/><path d="M6 7.5v9M18 10.5c0 4-12 2-12 6"/></svg></span>
            <div class="bd2"><div class="t1">Context PR opened · a-intel/platform#519</div><div class="t2">The promoter proposed a rule on lineage ctx.release.no-reread-changelog. Supported by 682 duplicate tool calls across 212 runs.</div>
            <div class="mono dim" style="font-size:11px;margin-top:3px">context_pr.opened</div></div>
            <time>13:02</time></div>
          <div class="li"><span class="ic t-allowed"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg></span>
            <div class="bd2"><div class="t1">Run sealed · run_01K5YX2D6R</div><div class="t2">a-intel.core.stella-ci sealed a-intel/platform#1887: 212 frames, 38,400 tokens, $2.41 observed by gateway.</div>
            <div class="mono dim" style="font-size:11px;margin-top:3px">run.sealed</div></div>
            <time>15:09</time></div>
          <div class="li"><span class="ic t-critical"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5v.5"/></svg></span>
            <div class="bd2"><div class="t1">Kill switch flipped · tool version</div><div class="t2">Priya Natarajan disabled slack__post_message@7 across a-intel after a schema regression.</div>
            <div class="mono dim" style="font-size:11px;margin-top:3px">kill_switch.flipped</div></div>
            <time>2026-09-09</time></div>
        </div>`,
    },
    {
      id: "security",
      name: "Security list",
      note: "From the account dialog's Security tab. Every row is plain text, and the icon tone is a hand-written inline `style`, not a `.ic.t-*` class (see Findings).",
      html: `
        <div class="lst">
          <div class="li"><div class="ic" style="background:color-mix(in srgb,var(--st-allowed) 14%,transparent);color:var(--st-allowed)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg></div>
            <div class="bd2"><div class="t1">Authenticator app</div><div class="t2">TOTP, added 2026-08-22. 8 of 10 recovery codes unused.</div></div>
            <button class="btn sm">Regenerate codes</button></div>
          <div class="li"><div class="bd2"><div class="t1">MacBook Pro · Chrome 141<span class="b b-allowed"><span class="d"></span>this device</span></div><div class="t2">San Francisco · 73.15.240.8</div></div><time>now, this session</time></div>
          <div class="li"><div class="bd2"><div class="t1">iPhone 17 · Safari</div><div class="t2">San Francisco · 73.15.240.8</div></div><time>2026-09-11 08:12Z</time><button class="btn sm">Revoke</button></div>
        </div>`,
    },
  ],
  anatomy: [
    ["List", "`.lst`", "A bordered, radius-10px column. Its children each carry a 1px bottom border, and the last one drops it."],
    ["Row", "`.li`", "10px by 12px padding on `--ink`, a flex row with a 10px gap, aligned to the top. Hovers to `--hl` when it is a button."],
    ["Icon", "`.li .ic`", "A 22px tile with a 6px radius, holding a 12px icon."],
    ["Icon tone", "`.li .ic.t-approval` / `.t-failed` / `.t-critical` / `.t-allowed` / `.t-gold`", "A 14% tint of the matching state token, or 13% gold, behind the icon."],
    ["Body", "`.li .bd2`", "A column with a 2px gap, holding the title and the detail line."],
    ["Title", "`.li .t1`", "12.5px Geist 500, `--fg`."],
    ["Detail", "`.li .t2`", "11.5px `--muted` at a 1.45 line height."],
    ["Timestamp", "`.li time`", "10px Monaspace Neon, `--dim`, never wraps."],
    ["Unread marker", "`.li.unread`", "A 5% gold tint on the row and a 5px gold dot before the title (see Findings)."],
    ["Keyboard row", "`.li[role=button]`", "A pointer cursor and an inset focus ring. The row itself takes Enter and Space."],
  ],
  usage: {
    when: [
      "A short list of similar-shaped records where each row is mostly text: notifications, security methods, active sessions.",
      "A row that a person marks done or read by activating it, as an unread notification does.",
    ],
    not: [
      "Records with several columns of figures: use a [table](table.html).",
      "One record's fields: use a [key-value list](key-value-list.html).",
      "A row that opens a full record page: use a [table](table.html) row or a [record card](record-card.html).",
    ],
    examples: [
      { kind: "avoid", html: `<div class="lst" style="width:100%"><div class="li"><div class="ic" style="background:#3a2f0f;color:#e6b800"><svg width="12" height="12" viewBox="0 0 24 24"></svg></div><div class="bd2"><div class="t1">Approval waiting</div></div></div></div>`, why: "A raw hex background and color, and no detail line or timestamp. The tone carries no state class an audit can find." },
      { kind: "use", html: `<div class="lst" style="width:100%"><div class="li"><span class="ic t-approval"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></span><div class="bd2"><div class="t1">Approval waiting</div><div class="t2">Expires in 10 minutes.</div></div><time>15:44</time></div></div>`, why: "A named tone class, a detail line, and a timestamp: the full anatomy." },
    ],
    rules: [
      "An icon's tone is one of the five `.ic.t-*` classes, never an inline `style` (see Findings).",
      "An unread item is a real button with an `aria-label` naming what activating it does. A read item is plain text with no click handler.",
      "A row's detail line states one fact. A second fact goes on the mono line under it, not after a mid-dot.",
    ],
  },
  content: [
    "**Title**: the event or the record, in sentence case, with an id in mono where one is load-bearing (\"Approval waiting · github__merge_pull_request@3\").",
    "**Detail**: one or two sentences of what happened and what it means, in the present or past tense.",
    "**Kind line**: the machine event name in mono and `--dim`, for a person who needs to match it to a log (\"approval.requested\").",
    "**Timestamp**: a time for today, a date for anything older, never a relative phrase like \"3 minutes ago\" that goes stale on screen.",
  ],
  a11y: [
    "An unread row is `role=\"button\"`, `tabindex=\"0\"`, and carries an `aria-label` that names the action (\"Mark read: …\"). It answers Enter and Space.",
    "A read row is plain text with no role and no handler, so a screen reader does not announce it as interactive when there is nothing to activate.",
    "The unread dot (`.li.unread .t1::before`) is CSS-generated content with no text, so the row's own label is the only way a screen reader knows it is unread. The `aria-label` carries that. The dot alone would not.",
    "`.li[role=button]:focus-visible` draws an inset ring rather than the standard offset gold ring used elsewhere. Confirm it stays visible against `--hl`.",
  ],
  phone: [
    "The row keeps its horizontal layout and 10px by 12px padding. Nothing about `.li` changes at 390px.",
    "A row with both a detail line and a trailing button can crowd at narrow widths since neither wraps to its own line. Confirm the button stays reachable.",
  ],
  tokens: [
    ["--ink", "Row ground"],
    ["--hl", "Row hover, and the security list's icon fallback ground"],
    ["--border", "List and row dividers"],
    ["--fg", "Title"],
    ["--muted", "Detail line"],
    ["--dim", "Kind line, timestamp"],
    ["--gold", "Unread tint, unread dot, `.ic.t-gold`"],
    ["--st-approval, --st-failed, --st-critical, --st-allowed", "Icon tones"],
  ],
  helpers: [
    ["notifsBody()", "engine.js:1682", "Writes the notification list, one `.li` per entry, unread ones as buttons via `notifRead()`."],
    ["notifIcon(tone)", "engine.js:1675", "The tone's icon: a check for allowed, a clock for approval, a confetti mark for gold, a triangle for anything else, including failed and critical."],
    ["accountBody()", "engine.js:9831", "The Security tab's two `.lst` lists, with an inline-styled `.ic` instead of a tone class."],
  ],
  sourceNotes: [
    "`.lst` and `.li` are defined twice in engine.css: once at lines 551 to 561, and again at 589 to 608. The second definition wins the cascade and is the one that actually renders, since it adds `:hover`, the five `.ic.t-*` tones, `.unread`, and `[role=button]`. The first definition draws nothing a person can see that the second does not already draw.",
    "notifIcon()'s default branch (the triangle) fires for both `failed` and `critical` tones, so the two states share one icon shape and differ only by their tint color.",
  ],
  findings: [
    { tag: "open", title: "Rules defined twice", body: "`.lst` and `.li` (engine.css 551 to 561 and again 589 to 608) are two full definitions of the same classes. The second wins by cascade order, which is also called out on the components index. A build should carry one definition, not rely on source order to pick the right one." },
    { tag: "open", title: "Gold as an unread marker", body: "`.li.unread` (engine.css 605) tints the row and its dot with `--gold`. Unread is a state, not an identity or the one action on the screen, and a busy notification list can carry several unread rows at once, which is more than one gold mark on a screen." },
    { tag: "note", title: "A second icon-tone idiom", body: "`accountBody()`'s Security tab (engine.js 9850 to 9853) sets each icon's background and color with an inline `style=\"background:…;color:…\"` instead of one of the five `.ic.t-*` classes the second `.li` definition already provides. An audit that greps for `.ic.t-` misses these rows entirely." },
  ],
  audit: {
    checks: [
      "Anatomy. Every list item renders an icon tile, a title, a detail line, and either a timestamp or an action, inside a `.lst` with a 1px border between rows.",
      "Icon tone. Every icon tone is one of the five named classes (`t-approval`, `t-failed`, `t-critical`, `t-allowed`, `t-gold`) and resolves to a 14% tint of its matching state token, or 13% gold. A raw hex or an inline `style` in place of a tone class is a FAIL.",
      "Unread state. An unread row is a real button with `tabindex=\"0\"`, `role=\"button\"`, and an `aria-label` naming the action. It answers Enter and Space and marks itself read on activation. A read row has no button role and no click handler.",
      "One definition. `.lst` and `.li` are defined once in the build's stylesheet. A second, shadowed definition of either is a FAIL.",
      "Content. The title states the event with any load-bearing id in mono. The detail line is one or two sentences. A kind or event name, where shown, is in mono and `--dim`.",
      "Gold. Report every row with a gold-tinted marker and what state it marks. More than one such row visible on screen at once is a FAIL against the one-gold-action rule.",
      "Timestamp. An absolute time or date, never a relative phrase that goes stale without a re-render.",
      "One implementation. List every place the build draws a list item by hand outside a shared component, with its file and line.",
    ],
  },
};
