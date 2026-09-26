// List table: a table in a panel with the search, filters, rows, sort, and pager the engine adds at render.
export default {
  slug: "list-table",
  name: "List table",
  group: "Data display",
  order: 25,
  summary: "A table in a panel with search, filters, sortable columns, a rows select, and a pager.",
  lead: "Every list in the product gets the same controls: a search box, up to three filters, sortable columns, a rows-per-page select, and a pager. Pages write a plain table, and the engine's `listify()` adds the controls after each render, so no page writes its own and no list shows two search boxes. This is the table panel in the screenshot that started this reference: the Agents list.",
  root: ".lt, .lp",
  css: "lines 898 to 942",
  usedOn: ["Agents", "Work orders", "Backlog", "Tools", "Spend budgets", "Repositories", "Runtimes", "Audit", "Organization"],
  stories: [
    {
      id: "loaded",
      name: "Loaded list",
      note: "The Agents panel with two filters the engine chose, a column sorted descending, and page 1 of 3.",
      canvas: "panel",
      html: `
        <div class="panel">
          <div class="panel-h"><div style="flex:1;min-width:0"><h3>Registered in Core platform</h3><p class="muted" style="margin:2px 0 0;font-size:12px">Each row names the reusable objects this agent holds a reference to.</p></div></div>
          <div class="lt">
            <input class="lt-q" type="search" placeholder="Search this list" aria-label="Search this list" value="">
            <select class="lt-f" data-k="4" aria-label="Filter by Health"><option value="">Any health</option><option value="healthy">Healthy</option><option value="degraded">Degraded</option></select>
            <select class="lt-f" data-k="5" aria-label="Filter by Runtime"><option value="">Any runtime</option><option value="gateway">Gateway</option><option value="harness">Harness</option></select>
            <label class="lt-rows">Rows<select class="lt-per" aria-label="Rows per page"><option value="5">5</option><option value="10" selected>10</option><option value="25">25</option><option value="50">50</option><option value="0">All</option></select></label>
          </div>
          <div class="tw"><table>
            <thead><tr>
              <th class="sortable" tabindex="0" role="button" aria-sort="none">Agent</th>
              <th class="sortable" tabindex="0" role="button" aria-sort="none">Owner</th>
              <th class="num sortable" tabindex="0" role="button" aria-sort="descending">Runs</th>
              <th class="num sortable" tabindex="0" role="button" aria-sort="none">Spend</th>
              <th class="sortable" tabindex="0" role="button" aria-sort="none">Health</th>
              <th class="sortable" tabindex="0" role="button" aria-sort="none">Runtime</th>
            </tr></thead>
            <tbody>
              <tr><td class="tkey">a-intel.core.triage</td><td>Priya Natarajan</td><td class="num">1,340</td><td class="num">$402.11</td><td><span class="b b-allowed"><span class="d"></span>healthy</span></td><td><span class="b b-tier b-allowed">gateway</span></td></tr>
              <tr><td class="tkey">a-intel.core.release-manager</td><td>Marcus Bell</td><td class="num">412</td><td class="num">$186.40</td><td><span class="b b-allowed"><span class="d"></span>healthy</span></td><td><span class="b b-tier b-allowed">gateway</span></td></tr>
              <tr><td class="tkey">a-intel.core.pr-reviewer</td><td>Marcus Bell</td><td class="num">288</td><td class="num">$94.02</td><td><span class="b b-denied"><span class="d"></span>degraded</span></td><td><span class="b b-tier b-q">harness</span></td></tr>
            </tbody>
          </table></div>
          <div class="lp"><span class="lp-n">1–10 of 23 (page 1 of 3)</span><span class="lp-pg"><button class="btn sm" data-p="prev" aria-label="Previous page" disabled>‹</button><button class="btn sm" data-p="1" aria-label="Page 1 of 3" aria-current="page">1</button><button class="btn sm" data-p="2" aria-label="Page 2 of 3">2</button><button class="btn sm" data-p="3" aria-label="Page 3 of 3">3</button><button class="btn sm" data-p="next" aria-label="Next page">›</button></span></div>
        </div>`,
    },
    {
      id: "multi",
      name: "Multi-select filter",
      note: "A column whose header carries `data-facet=\"multi\"` filters on every value in its cells. The button shows the first pick as the table draws it and +N, and the list opens in the top layer. Here it is drawn open in place.",
      canvas: "panel",
      html: `
        <div class="panel">
          <div class="lt">
            <input class="lt-q" type="search" placeholder="Search this list" aria-label="Search this list" value="">
            <span class="lt-m" data-k="2"><button type="button" class="lt-mb" aria-haspopup="true" aria-expanded="true" data-on aria-label="Filter by Labels, 2 selected"><span class="lt-mv"><span class="lbl" style="--lc:#E0803A" data-fv="p1" data-fo="1"><i aria-hidden="true"></i>P1</span></span><span class="lt-mn">+1</span></button></span>
            <select class="lt-f" data-k="3" aria-label="Filter by Status"><option value="">Any status</option><option value="Open">Open</option><option value="Blocked">Blocked</option></select>
            <span class="lt-m" data-k="5"><button type="button" class="lt-mb" aria-haspopup="true" aria-expanded="false" aria-label="Filter by Owner"><span class="lt-mt">Any owner</span></button></span>
            <label class="lt-rows">Rows<select class="lt-per" aria-label="Rows per page"><option value="10" selected>10</option></select></label>
          </div>
          <div class="lt-pop" role="group" aria-label="Labels" style="position:static;margin:10px 12px 12px">
            <label class="lt-o"><input type="checkbox" value="p0"><span class="lt-ov"><span class="lbl" style="--lc:#D6455E" data-fv="p0" data-fo="0"><i aria-hidden="true"></i>P0</span></span><span class="lt-on">1</span></label>
            <label class="lt-o"><input type="checkbox" value="p1" checked><span class="lt-ov"><span class="lbl" style="--lc:#E0803A" data-fv="p1" data-fo="1"><i aria-hidden="true"></i>P1</span></span><span class="lt-on">3</span></label>
            <label class="lt-o"><input type="checkbox" value="bug" checked><span class="lt-ov"><span class="lbl" style="--lc:#C0453C" data-fv="bug" data-fo="4"><i aria-hidden="true"></i>Bug</span></span><span class="lt-on">7</span></label>
            <label class="lt-o"><input type="checkbox" value="chore"><span class="lt-ov"><span class="lbl" style="--lc:#A1A1AA" data-fv="chore" data-fo="9"><i aria-hidden="true"></i>Chore</span></span><span class="lt-on">1</span></label>
            <div class="lt-pf"><button type="button" class="btn sm" data-clear>Clear</button></div>
          </div>
        </div>`,
    },
    {
      id: "empty",
      name: "No match",
      note: "A search that matches nothing keeps the headers and says so in one row. The pager reads None.",
      canvas: "panel",
      html: `
        <div class="panel">
          <div class="lt">
            <input class="lt-q" type="search" placeholder="Search this list" aria-label="Search this list" value="stale-closer">
            <label class="lt-rows">Rows<select class="lt-per" aria-label="Rows per page"><option value="10" selected>10</option></select></label>
          </div>
          <div class="tw"><table>
            <thead><tr><th class="sortable" tabindex="0" role="button" aria-sort="none">Agent</th><th class="sortable" tabindex="0" role="button" aria-sort="none">Owner</th><th class="num sortable" tabindex="0" role="button" aria-sort="none">Runs</th></tr></thead>
            <tbody><tr class="lt-empty"><td colspan="3">No rows match.</td></tr></tbody>
          </table></div>
          <div class="lp"><span class="lp-n">None</span><span class="lp-pg"><button class="btn sm" data-p="prev" aria-label="Previous page" disabled>‹</button><button class="btn sm" data-p="1" aria-label="Page 1 of 1" aria-current="page">1</button><button class="btn sm" data-p="next" aria-label="Next page" disabled>›</button></span></div>
        </div>`,
    },
    {
      id: "long",
      name: "Long pager",
      note: "Past seven pages the pager keeps the first, the last, and the pages around the current one.",
      canvas: "panel",
      html: `
        <div class="panel">
          <div class="lp"><span class="lp-n">41–50 of 703 (page 5 of 71)</span><span class="lp-pg"><button class="btn sm" data-p="prev" aria-label="Previous page">‹</button><button class="btn sm" data-p="1" aria-label="Page 1 of 71">1</button><span class="el">…</span><button class="btn sm" data-p="4" aria-label="Page 4 of 71">4</button><button class="btn sm" data-p="5" aria-label="Page 5 of 71" aria-current="page">5</button><button class="btn sm" data-p="6" aria-label="Page 6 of 71">6</button><span class="el">…</span><button class="btn sm" data-p="71" aria-label="Page 71 of 71">71</button><button class="btn sm" data-p="next" aria-label="Next page">›</button></span></div>
        </div>`,
    },
    {
      id: "free",
      name: "Outside a panel",
      note: "When the host is not a panel, the bar and pager take `.free`: their own border, radius, and spacing.",
      html: `
        <div>
          <div class="lt free">
            <input class="lt-q" type="search" placeholder="Search findings" aria-label="Search findings" value="">
            <label class="lt-sort">Sort<select class="lt-s"><option value="0" selected>Rank</option><option value="1">Savings, high first</option><option value="2">Savings, low first</option><option value="3">Finding A–Z</option></select></label>
            <label class="lt-rows">Rows<select class="lt-per" aria-label="Rows per page"><option value="10" selected>10</option></select></label>
          </div>
          <p class="muted" style="margin:0;font-size:12.5px">Cards sit here. A card list has no column headers, so it sorts from the Sort select.</p>
          <div class="lp free"><span class="lp-n">1–7 of 7</span><span class="lp-pg"><button class="btn sm" data-p="prev" aria-label="Previous page" disabled>‹</button><button class="btn sm" data-p="1" aria-label="Page 1 of 1" aria-current="page">1</button><button class="btn sm" data-p="next" aria-label="Next page" disabled>›</button></span></div>
        </div>`,
    },
  ],
  anatomy: [
    ["Control bar", "`.lt`", "A wrapping row on `--panel` under the panel header, 9px by 12px padding, with a `--border` underline."],
    ["Search", "`.lt .lt-q`", "A `type=search` input on `--ink`, 12.5px, growing from 200px. Its border turns gold on focus."],
    ["Filter", "`.lt select.lt-f`", "A select per filtered column, labelled \"Filter by\" the column. Its first option reads \"Any\" and the column name."],
    ["Multi-select filter", "`.lt .lt-mb`", "A button styled as a filter select. It reads \"Any\" and the column name, or shows the first pick as the table draws it with \"+N\" in mono. With a pick, its border takes gold at 55%."],
    ["Filter list", "`.lt-pop`, `.lt-o`", "A popover in the top layer, on `--panel` with a `--rule` border and the shadow. One row per value: a checkbox, the value as the table draws it, and its row count in `--dim` mono. **Clear** sits under a `--border` rule."],
    ["Sort", "`.lt .lt-sort`", "A Sort select, only on card lists, which have no headers to click."],
    ["Rows", "`.lt .lt-rows`", "Rows per page: 5, 10, 25, 50, or All. Default 10. It sits at the right end of the bar."],
    ["Sortable header", "`th.sortable`", "A header with a ↕ mark in `--rule`. Sorted, it shows ↑ or ↓ in gold and its text turns `--fg`."],
    ["Empty row", "`tr.lt-empty`", "One row across every column reading \"No rows match.\" in `--dim`."],
    ["Pager", "`.lp`", "The range in 11.5px Monaspace Neon, then previous, page numbers, and next. The current page has a gold border and gold text."],
    ["Free form", "`.lt.free`, `.lp.free`", "The bar and pager outside a panel, each with its own border and a 10px radius."],
  ],
  usageNote: "Write a plain table in a panel. The engine does the rest.",
  usage: {
    when: [
      "Any list of records inside a [panel](panel.html): agents, work orders, tools, budgets, audit events.",
      "A list of cards that needs search and paging: findings, records, rules. `ltCards()` adds the same bar with a Sort select.",
    ],
    not: [
      "A table of three to five fixed rows that never grows, such as a key and label map: add `data-lt=\"off\"` to the table.",
      "A table with grouped headers. `ltTable()` skips a table whose header uses `colspan`.",
      "Values about one record: use a [key-value list](key-value-list.html).",
    ],
    examples: [
      { kind: "avoid", row: false, html: `<div class="panel" style="width:100%"><div class="panel-b" style="padding:10px 12px"><div class="field" style="margin:0"><input placeholder="Search agents" aria-label="Search agents"></div></div><div class="lt"><input class="lt-q" type="search" placeholder="Search this list" aria-label="Search this list"></div></div>`, why: "A page-level search above the list's own. `ltTable()` absorbs a lone search field placed directly above the table, so write one or neither." },
      { kind: "use", row: false, html: `<div class="panel" style="width:100%"><div class="lt"><input class="lt-q" type="search" placeholder="Search agents" aria-label="Search agents"></div></div>`, why: "One search box. Its placeholder came from the page's field, which the engine removed." },
    ],
    rules: [
      "**Filters are chosen, not written.** A column earns a filter when it holds 2 to 8 distinct short values (28 characters or fewer) across at least 4 rows, and the values are not unique per row. At most three per list, and columns whose names match status, state, tier, kind, role, risk, or a similar word come first.",
      "**Sorting** cycles ascending, descending, and back to the page's order. A column is numeric when 60% of its filled cells are numbers, so a column of counts with a few dashes still sorts as numbers.",
      "**Several values.** `data-facet=\"multi\"` on a header filters that column on every element in a cell that carries `data-fv`, and each option is that element as the table draws it. `data-fo` orders the options, and the rest sort by name. A row matches any value picked. The bar then holds four filters at most, in column order. `lblChip()` and `tkPerson()` carry `data-fv`, and two accounts mapped to one member share it.",
      "**Opting a column out.** `data-facet=\"off\"` on a header keeps an automatic filter off that column.",
      "**Cell values.** A cell may carry `data-v` to override its sort and filter value. A cell's filter value is its first readable text, skipping avatar initials, a status dot, and the second line.",
      "**Selection.** A row the address selects (`aria-selected=\"true\"`) opens on its own page once, and paging stays yours after that.",
      "**State per list.** Search, filters, sort, rows, and page are kept per list until the page reloads.",
      "**Opting out.** `data-lt=\"off\"` on the table. Use it for short fixed tables only.",
    ],
  },
  content: [
    "**Search placeholder**: \"Search this list\", or the page's own wording when a page field was absorbed (\"Search findings\").",
    "**Multi-select face**: \"Any labels\", \"Any owner\", or the first pick and \"+N\". Its `aria-label` adds the count: \"Filter by Labels, 2 selected\".",
    "**Filter first option**: \"Any\" and the column name in lowercase: \"Any health\", \"Any runtime\". Option text is sentence case, and provider ids read as the provider's name (\"GitHub\").",
    "**Stored keys** in a filter show their label from `KEY_LABEL`, such as \"Observed by gateway\".",
    "**Range**: `1–10 of 23 (page 1 of 3)`. The en dash here is a range in data, and the page count shows only when there is more than one page. Thousands take separators: `41–50 of 1,703`.",
    "**Empty**: \"No rows match.\" for a table and \"Nothing matches.\" for a card list. The pager reads \"None\".",
  ],
  a11y: [
    "The search has an `aria-label` equal to its placeholder, each filter has \"Filter by\" and the column name, and the rows select has \"Rows per page\".",
    "A multi-select filter is a `button` with `aria-haspopup` and `aria-expanded`. Its list is a `role=\"group\"` of labelled checkboxes, reached by Tab, and Escape or a click outside closes it.",
    "Each sortable header is focusable and sorts on Enter or Space. Its `aria-sort` reads ascending, descending, or none.",
    "The mockup puts `role=\"button\"` on the `th` itself, which replaces its column header role, and `aria-sort` is only valid on a column header. A build should keep the `th` and put a `button` inside it. See Findings.",
    "Each pager button is labelled with its page and the total (\"Page 2 of 3\"), and the current one has `aria-current=\"page\"`. Previous and next are disabled at the ends.",
    "The range text is plain text a screen reader reaches. A build should also announce the new range after a search or a filter, such as through a polite live region.",
  ],
  phone: [
    "The search takes the full width of the bar, and the rows select stops pushing right.",
    "Tables become labelled cards (`cardTables()`). The bar and pager stay above and below the cards.",
    "Controls take the phone sizes: inputs and selects at 16px, pager buttons 36px tall.",
    "A multi-select filter is 44px tall with 16px text, and each row in its list is 44px tall.",
  ],
  tokens: [
    ["--panel", "Bar and pager ground"],
    ["--ink", "Search and select ground"],
    ["--border", "Bar underline, input borders"],
    ["--gold", "Focus border, sort arrow, current page (see Findings)"],
    ["--muted", "Rows and Sort labels, pager text"],
    ["--dim", "Range, placeholder, empty row"],
    ["--rule", "Unsorted ↕ mark"],
    ["--fg", "Sorted header text"],
  ],
  helpers: [
    ["listify()", "engine.js:14006", "After every render, runs `ltTable()` on each table in the page and the dialog layer, and `ltCards()` on each card list."],
    ["ltTable(table, prefix)", "engine.js:13901", "Reads the table, picks filters, makes headers sortable, and inserts the bar and pager."],
    ["ltBar(st, opts, apply)", "engine.js:13827", "Writes the control bar: search, filters, an optional Sort, and Rows."],
    ["ltMultiFacets(cols, rows, vals)", "engine.js:13871", "Reads each `data-facet=\"multi\"` column's `data-fv` values into options with their row counts."],
    ["ltMulti(st, f)", "engine.js:13788", "Writes a multi-select filter: the button and its popover list."],
    ["ltMultiWire(m, st, f, apply)", "engine.js:13798", "Places the list under its button, closes it on scroll, and applies each pick."],
    ["ltPager(st, total, onPage)", "engine.js:13755", "Writes the range and the page buttons, with ellipses past seven pages."],
    ["ltCards(cfg)", "engine.js:13975", "The same bar and pager for card lists, configured in `LT_CARDS`."],
    ["cardTables()", "engine.js:14069", "Turns tables into labelled cards in the phone shell."],
  ],
  sourceNotes: [
    "`LT_PER` (engine.js 13583) holds the row choices, and `LT_FACET` (13585) the column names that sort first as filters.",
    "34 tables opt out with `data-lt=\"off\"`.",
  ],
  findings: [
    { tag: "fixed", title: "Filter labels had a mid-dot", body: "The first filter option read `All · State`. PR #101 changed it to \"Any state\", which follows the label rule." },
    { tag: "open", title: "A button role on the header cell", body: "`th.sortable` carries `role=\"button\"`, which removes its column header role, so its `aria-sort` has no effect for a screen reader. A `button` inside the `th` keeps both." },
    { tag: "open", title: "Gold marks the sort and the current page", body: "The sort arrow and the current page button are gold. Both are state, which the brand keeps off gold. `--fg` carries the same meaning." },
    { tag: "open", title: "Range and empty row contrast", body: "The range and the empty row are `--dim`: 3.67:1 on `--panel` in dark and 2.56:1 in light. Both are words a person reads." },
    { tag: "note", title: "Sort select has no own label", body: "The card-list Sort select is named by its wrapping `label`, which works. The Rows select carries both, so the two differ for no reason." },
  ],
  audit: {
    checks: [
      "Coverage. Every list of records in the build has the search, the filters, sortable columns, the rows select, and the pager. List any list that lacks one, and any list that draws its own copy of these controls.",
      "One search. No list shows two search boxes. A page search above a list is the list's search.",
      "Filters. Each filter's options are the column's distinct values, the first option reads Any and the column name, options are sentence case, and stored keys show their labels. Report each list's filters and whether the rule (2 to 8 values over 4 or more rows, at most three) chose them.",
      "Sorting. Clicking a header, or Enter or Space on it, cycles ascending, descending, and the original order. Numbers sort as numbers, with dashes treated as empty. aria-sort is exposed on a column header element.",
      "Rows and pager. Rows offers 5, 10, 25, 50, and All, defaulting to 10. The range reads exactly as the reference (1–10 of 23 (page 1 of 3)), with separators, and past seven pages the pager keeps the first, the last, and the neighbors of the current page.",
      "Empty result. A search that matches nothing keeps the headers and shows one row reading No rows match., and the pager reads None.",
      "State. Search, filters, sort, rows, and page survive a re-render of the same list.",
      "Selection. A row selected by the address opens on the page that holds it.",
      "Announcements. After a search or filter, the new range is announced to a screen reader.",
    ],
  },
};
