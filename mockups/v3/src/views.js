/* ============================== views.js ==============================
   The shell and the six areas: Work, Sessions (and one session), Agents, Steering, MCP servers and
   Spend. Each view returns {crumb, html, after}. Dialogs and drawers register by name. */

/* ---- the shell ---- */
function navItems() {
  var inbox = workItems().filter(function (w) { return w.state === "inbox"; }).length;
  var sugg = S.empty ? 0 : STEERING.suggestions.filter(function (s) { return !S.accepted[s.id] && !S.dismissed[s.id]; }).length;
  return [
    ["work", "Work", inbox ? { n: inbox } : null],
    ["sessions", "Sessions", needsYou().length ? { n: needsYou().length, hot: true } : null],
    ["agents", "Agents", null],
    ["steering", "Steering", sugg ? { n: sugg } : null],
    ["servers", "MCP servers", null],
    ["spend", "Spend", null],
  ];
}
function shell(view) {
  var nav = navItems().map(function (n) {
    return '<a class="navitem" href="' + href(n[0]) + '" data-go="' + n[0] + '"' + (S.area === n[0] ? ' aria-current="page"' : "") + '><span class="ic">' + g(n[0]) + "</span>" + n[1] +
      (n[2] ? '<span class="ct' + (n[2].hot ? " hot" : "") + '">' + n[2].n + "</span>" : "") + "</a>";
  }).join("");
  var tabs = navItems().map(function (n) {
    return '<a class="tb" href="' + href(n[0]) + '" data-go="' + n[0] + '"' + (S.area === n[0] ? ' aria-current="page"' : "") + '><span class="ic">' + g(n[0], 20) + "</span><span>" + (n[0] === "servers" ? "Servers" : n[1]) + "</span>" +
      (n[2] ? '<span class="ct' + (n[2].hot ? " hot" : "") + '">' + n[2].n + "</span>" : "") + "</a>";
  }).join("");
  var me = PEOPLE[ME], ny = needsYou();
  var crumbs = '<span>' + h(ORG.name) + '</span><span class="sep">/</span><span>' + h(WS.name) + "</span>" + (view.crumb || []).map(function (c, i, a) {
    return '<span class="sep">/</span>' + (i === a.length - 1 ? "<b>" + h(c[0]) + "</b>" : '<a href="' + href(c[1]) + '" data-go="' + c[1] + '">' + h(c[0]) + "</a>");
  }).join("");
  return '<div class="app">' +
    '<aside class="side"><div class="side-top"><div class="brandmark">' + LOGO + "</div>" +
      '<button class="switcher" data-act="stub" data-what="Switching organizations"><span class="av">' + h(ORG.initial) + '</span><span class="tx"><b>' + h(ORG.name) + "</b><span>" + h(ORG.slug) + "</span></span></button>" +
      '<button class="switcher" data-act="stub" data-what="Switching workspaces"><span class="av ws">CP</span><span class="tx"><b>' + h(WS.name) + "</b><span>" + h(WS.repo) + "</span></span></button></div>" +
      '<nav aria-label="Workspace">' + nav + "</nav>" +
      '<div class="side-foot"><button class="userbtn" data-act="account">' + personAv(ME, 26) + '<span class="tx"><b>' + h(me.name) + "</b><span>" + h(me.role) + "</span></span></button></div></aside>" +
    '<div class="main"><header class="top"><div class="crumbs">' + crumbs + '</div><span class="sp"></span>' +
      (ny.length ? '<a class="needs" href="' + href("sessions", ny[0].id) + '" data-go="sessions|' + ny[0].id + '"><span class="d"></span>' + ny.length + " waiting on you</a>" : "") +
    '</header><main class="page">' + view.html + "</main></div>" +
    '<nav class="tabbar" aria-label="Workspace">' + tabs + "</nav></div>";
}
function phead(title, sub, acts) {
  return '<div class="phead"><div class="t"><p class="eyebrow">' + h(WS.name) + "</p><h1>" + h(title) + "</h1>" + (sub ? "<p>" + sub + "</p>" : "") + "</div>" + (acts ? '<div class="acts">' + acts + "</div>" : "") + "</div>";
}
function stat(k, v, s) { return '<div class="stat"><span class="k">' + h(k) + '</span><span class="v">' + v + "</span>" + (s ? '<span class="s">' + s + "</span>" : "") + "</div>"; }
function empty(icon, title, text, acts) {
  return '<div class="panel"><div class="state-wrap"><div class="ico">' + g(icon, 20) + "</div><h2>" + h(title) + "</h2><p>" + text + '</p><div class="acts">' + (acts || "") + "</div></div></div>";
}
function badge(cls, text, dot) { return '<span class="b ' + cls + '">' + (dot ? '<span class="d"></span>' : "") + h(text) + "</span>"; }
function statusBadge(s) {
  if (s.status === "needs-you") return badge("b-approval", "Needs you", true);
  if (s.status === "running" || s.status === "starting") return '<span class="live"><span class="p"></span>Running</span>';
  if (s.status === "stopped") return badge("b-q", "Stopped");
  if (s.status === "failed") return badge("b-failed", "Failed");
  return badge("b-q", "Done");
}
function agentCell(a, sub) {
  return '<span class="agc">' + agentAv(a, 26) + '<span class="agid"><b>' + h(a.name) + '</b><span class="sub">' + hxIcon(a.harness, 12) + " " + h(sub || hxLabel(a.harness)) + "</span></span></span>";
}
function wiCell(w) {
  return '<span class="wic"><span class="wik">' + ipLogo(w.src, 13) + '<span class="mono">' + h(w.key) + "</span></span><span class=\"wit\">" + h(w.title) + "</span></span>";
}
function labelChips(ls) { return (ls || []).map(function (l) { return '<span class="lab lab-' + h(l.toLowerCase()) + '">' + h(l) + "</span>"; }).join(""); }

ACTS.stub = function (el) { toast((el.getAttribute("data-what") || "That") + " is not in this mockup."); };
ACTS.account = function () { openDialog("account"); };

/* ============================== Work ============================== */
VIEWS.work = function () {
  var items = workItems();
  var tabs = [["inbox", "Inbox"], ["running", "Running"], ["review", "Review"], ["done", "Done"]];
  var by = { inbox: [], running: [], review: [], done: doneWork() };
  items.forEach(function (w) { if (by[w.state]) by[w.state].push(w); });
  if (S.empty) {
    return { crumb: [["Work"]], html: phead("Work", "Work arrives from your trackers. You send an item to an agent.") + onboarding() };
  }
  var ny = needsYou();
  var head = phead("Work", "Work arrives from GitHub, Linear and Jira. Send an item to an agent.",
    '<button class="btn" data-act="newwork">' + g("plus", 14) + ' New work item</button><button class="btn primary" data-act="send" data-key="">' + g("send", 14) + " Send to an agent</button>");
  var banner = ny.map(function (s) {
    var a = agentBy(s.agent);
    return '<div class="banner needs-b"><span class="d"></span><div class="grow"><b>' + h(a.name) + " is waiting on you</b>" + h(s.title) + ": oxagen asks a person before github create_release.</div>" +
      '<button class="btn sm primary-soft" data-go="sessions|' + s.id + '">Open the session</button></div>';
  }).join("");
  var monthWork = sessions().filter(function (s) { return s.wi; });
  var tiles = '<div class="grid g3 tiles">' +
    stat("Inbox", num(by.inbox.length), plural(by.inbox.filter(function (w) { return dayLabel(w.opened) === "Today"; }).length, "item") + " arrived today") +
    stat("Running", num(by.running.length), ny.length ? plural(ny.length, "session") + " waiting on you" : "Nothing waiting on you") +
    stat("Spent on work this month", money(monthWork.reduce(function (t, s) { return t + s.cost.total; }, 0)), "Across " + plural(new Set(monthWork.map(function (s) { return s.wi.key; })).size, "work item")) + "</div>";
  var tabbar = '<div class="tabs" role="tablist">' + tabs.map(function (t) {
    return '<button class="tab" role="tab" data-act="worktab" data-tab="' + t[0] + '" aria-selected="' + (S.workTab === t[0]) + '">' + t[1] + '<span class="n">' + by[t[0]].length + "</span></button>";
  }).join("") + "</div>";
  var list = by[S.workTab] || [], rows;
  if (S.workTab === "inbox") {
    rows = list.map(function (w) {
      return '<tr class="click" data-act="wi" data-key="' + h(w.key) + '"><td>' + wiCell(w) + "</td><td class=\"mh\">" + labelChips(w.labels) + '</td><td class="muted nowrap mh">' + ago(w.opened) + '</td><td class="num"><button class="btn sm" data-act="send" data-key="' + h(w.key) + '">' + g("send", 13) + " Send</button></td></tr>";
    });
    rows = '<table><thead><tr><th>Work item</th><th class="mh">Labels</th><th class="mh">Opened</th><th></th></tr></thead><tbody>' + rows.join("") + "</tbody></table>";
  } else if (S.workTab === "running" || S.workTab === "review") {
    rows = list.map(function (w) {
      var s = sessionBy(w.session), a = agentBy(w.agent);
      var third = S.workTab === "running" ? statusBadge(s) : (w.release ? badge("b-allowed", "Draft release " + w.release, true) : w.held ? badge("b-approval", "Release " + w.held + " held", true) : '<span class="prc">' + g("pr", 13) + '<span class="mono">' + h(w.pr) + "</span> " + badge(w.checks === "passing" ? "b-allowed" : "b-approval", w.checks === "passing" ? "Checks passing" : "Checks running", true) + "</span>");
      return '<tr class="click" data-go="sessions|' + h(w.session) + '"><td>' + wiCell(w) + "</td><td class=\"mh\">" + agentCell(a) + "</td><td>" + third + '</td><td class="num">' + money(s.cost.total) + '</td><td class="muted nowrap mh">' + when(s.started) + "</td></tr>";
    });
    rows = '<table><thead><tr><th>Work item</th><th class="mh">Agent</th><th>' + (S.workTab === "running" ? "Status" : "Result") + '</th><th class="num">Cost</th><th class="mh">Started</th></tr></thead><tbody>' + rows.join("") + "</tbody></table>";
  } else {
    rows = list.slice(0, 40).map(function (w) {
      return '<tr class="click" data-go="sessions|' + h(w.sessions[0].id) + '"><td>' + wiCell(w) + "</td><td class=\"mh\">" + agentCell(agentBy(w.agent)) + '</td><td class="num mh">' + w.sessions.length + '</td><td class="num">' + money(w.cost) + '</td><td class="muted nowrap mh">' + when(w.last) + "</td></tr>";
    });
    rows = '<table><thead><tr><th>Work item</th><th class="mh">Agent</th><th class="num mh">Sessions</th><th class="num">Cost</th><th class="mh">Last session</th></tr></thead><tbody>' + rows.join("") + "</tbody></table>";
  }
  if (!list.length) rows = '<div class="state-wrap small"><p>Nothing here.</p></div>';
  return { crumb: [["Work"]], html: head + banner + tiles + tabbar + '<div class="panel"><div class="tw">' + rows + "</div></div>" };
};
ACTS.worktab = function (el) { S.workTab = el.getAttribute("data-tab"); render(); };
ACTS.wi = function (el, ev) { if (ev.target.closest("button")) return; openDrawer("workitem", el.getAttribute("data-key")); };
ACTS.send = function (el, ev) {
  if (ev) ev.stopPropagation();
  var first = workItems().filter(function (w) { return w.state === "inbox"; })[0];
  var key = el.getAttribute("data-key") || (first && first.key);
  if (!key) { toast("The inbox is empty. New work arrives from your trackers."); return; }
  openDialog("send", key);
};
ACTS.newwork = function () { openDialog("newwork"); };

function onboarding() {
  var steps = [
    ["Connect an agent", "Run one command where the agent runs. Claude Code, Codex, Cursor and stella all connect the same way.", '<button class="btn primary" data-act="connect">Connect an agent</button>', S.connected],
    ["Import your steering", "oxagen reads CLAUDE.md, AGENTS.md and Cursor rules from your repositories and merges them into one list.", '<button class="btn" data-act="steerimport">Import steering</button>', S.imported.steering],
    ["Import your MCP servers", "oxagen finds the servers in each harness's config, takes their keys, and points every harness at one gateway.", '<button class="btn" data-act="serverimport">Import MCP servers</button>', S.imported.servers],
    ["Connect a tracker", "Issues from GitHub, Linear or Jira arrive in the inbox.", '<button class="btn" data-act="stub" data-what="Connecting a tracker">Connect GitHub</button>', false],
  ];
  return '<div class="panel onb"><div class="panel-h"><h3>Set up Core platform</h3><span class="sp muted">' + steps.filter(function (s) { return s[3]; }).length + " of 4 done</span></div>" +
    steps.map(function (s, i) {
      return '<div class="onb-step' + (s[3] ? " done" : "") + '"><span class="onb-n">' + (s[3] ? g("check", 14) : i + 1) + '</span><div class="grow"><b>' + h(s[0]) + "</b><p>" + h(s[1]) + "</p></div>" + (s[3] ? badge("b-allowed", "Done", true) : s[2]) + "</div>";
    }).join("") + "</div>";
}

/* ---- Send to an agent ---- */
function suggestAgent(w) {
  var l = (w.labels || []).join(" ");
  if (/release/.test(l)) return "release-manager";
  if (/docs/.test(l)) return "docs-writer";
  if (/ci|flaky/.test(l)) return "stella-ci";
  return "triage";
}
DIALOGS.send = function (key, d) {
  var inbox = workItems().filter(function (w) { return w.state === "inbox"; });
  var w = workBy(key) || inbox[0];
  d.agent = d.agent || suggestAgent(w);
  var a = agentBy(d.agent);
  var picker = '<div class="field"><label for="send-item">Work item</label><select id="send-item" data-change="send-item">' + inbox.map(function (x) { return '<option value="' + h(x.key) + '"' + (x.key === w.key ? " selected" : "") + ">" + h(x.key + "  " + x.title) + "</option>"; }).join("") + "</select></div>";
  var agents = '<div class="field"><label>Agent</label><div class="pick">' + AGENTS.filter(function (x) { return x.key !== "amara-claude"; }).map(function (x) {
    var sp = sessions().filter(function (s) { return s.agent === x.key; }).reduce(function (t, s) { return t + s.cost.total; }, 0);
    return '<button class="pick-i' + (x.key === d.agent ? " on" : "") + '" data-act="send-agent" data-agent="' + x.key + '" aria-pressed="' + (x.key === d.agent) + '">' + agentAv(x, 30) +
      '<span class="pick-t"><b>' + h(x.name) + '</b>' + pts([hxIcon(x.harness, 12) + " " + h(hxLabel(x.harness)), h(modelLabel(x.model))]) + pts([h(x.where), money(sp) + " this month"]) + "</span></button>";
  }).join("") + "</div></div>";
  var st = steeringNext(a), stTok = st.reduce(function (t, i) { return t + i.tok; }, 0);
  var gets = '<div class="gets"><div><span class="k">Steering</span><b>' + plural(st.length, "item") + "</b> <span class=\"muted\">" + num(stTok) + ' tokens</span> <a href="' + href("steering") + '" data-go="steering">Change</a></div>' +
    '<div><span class="k">MCP servers</span><b>' + a.servers.map(function (id) { return serverBy(id).name; }).join(", ") + '</b> <a href="' + href("servers") + '" data-go="servers">Change</a></div>' +
    '<div><span class="k">Runs on</span><b>' + h(a.where) + '</b> <span class="muted mono">' + h(a.host) + "</span></div></div>";
  return {
    title: "Send to an agent", wide: true,
    sub: "The agent gets the work item as its first prompt, with the steering and MCP servers you set in one place.",
    body: picker + '<div class="wi-prev">' + wiCell(w) + '<p class="muted">' + h(w.body) + "</p></div>" + agents +
      '<div class="field"><label for="send-note">Note for the agent</label><textarea id="send-note" rows="2" data-input="send-keep" placeholder="Anything to add to the brief">' + h(d.note || "") + "</textarea></div>" +
      '<div class="fields"><div class="field"><label for="send-cap">Stop the session at</label><input id="send-cap" data-input="send-keep" value="' + h(d.cap != null ? d.cap : money(a.cap)) + '"><div class="hint">The session stops when its cost reaches this.</div></div><div class="field"><label>What it gets</label>' + gets + "</div></div>",
    foot: '<span class="grow">' + h(a.name) + " starts on " + h(a.host) + ".</span><button class=\"btn\" data-act=\"close\">Cancel</button><button class=\"btn primary\" data-act=\"send-go\" data-key=\"" + h(w.key) + '">' + g("send", 14) + " Send</button>",
  };
};
/* What a person typed survives picking another agent or work item. A cap they did not touch
   follows the agent. */
ACTS["send-keep"] = function (el) { if (el.id === "send-note") S.dialog.note = el.value; else S.dialog.cap = el.value; };
ACTS["send-agent"] = function (el) { S.dialog.agent = el.getAttribute("data-agent"); renderLayer(); };
ACTS["send-item"] = function (el) { S.dialog.arg = el.value; S.dialog.agent = null; renderLayer(); };
ACTS["send-go"] = function (el) {
  var w = workBy(el.getAttribute("data-key")), a = agentBy(S.dialog.agent || suggestAgent(w));
  var note = (document.getElementById("send-note") || {}).value || "";
  var capIn = parseFloat(((document.getElementById("send-cap") || {}).value || "").replace(/[^0-9.]/g, ""));
  var id = "ses_01K5S" + Math.random().toString(36).slice(2, 12).toUpperCase().padEnd(10, "0");
  var h0 = HARNESSES[a.harness];
  var T = { id: id, title: w.title, harness: a.harness, harnessV: a.harnessV, model: a.model, modelLabel: modelLabel(a.model), agent: a.key, person: ME, wi: w.key,
    host: a.host, cwd: "~/src/platform", started: F.ORG.now, status: "running", basis: a.harness === "cursor" ? "harness" : "gateway", cap: capIn > 0 ? capIn : a.cap,
    events: [
      { t: 0, k: "prompt", by: ME, via: "work", tok: 60 + Math.round(w.body.length / 4), text: w.key + ": " + w.title + "\n\n" + w.body + (note ? "\n\n" + note : "") },
      { t: 5.8, k: "req", n: 1, out: 140 },
      { t: 6.1, k: "say", text: "I'll read the work item and the code it points at first." },
      { t: 6.3, k: "call", id: "n1", tool: { kind: "mcp", server: a.servers.indexOf("linear") >= 0 && w.src === "linear" ? "linear" : "github", name: w.src === "linear" && a.servers.indexOf("linear") >= 0 ? "get_issue" : "get_issue", args: { id: w.key } } },
    ] };
  S.sentTranscripts = S.sentTranscripts || {};
  S.sentTranscripts[id] = T;
  S.sent[w.key] = { agent: a.key, session: null };
  _sessions = null;
  S.sent[w.key].session = sessionFromTranscript(T);
  _sessions = null;
  closeDialog();
  toast("Sent to " + a.name + ". It starts on " + a.host + ".");
  go("sessions", id);
  setTimeout(function () { if (S.id === id) { RP.vt = 0; rpPlay(); } }, 50);
};
DIALOGS.newwork = function () {
  return { title: "New work item", sub: "Write it here when it does not come from a tracker.",
    body: '<div class="field"><label for="nw-title">Title</label><input id="nw-title" autofocus placeholder="Write the 4.11.0 upgrade guide"></div><div class="field"><label for="nw-body">Description</label><textarea id="nw-body" rows="4"></textarea></div>',
    foot: '<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="stub" data-what="Saving a new work item">Add to the inbox</button>' };
};
DRAWERS.workitem = function (key) {
  var w = workBy(key), ss = sessions().filter(function (s) { return s.wi && s.wi.key === key; });
  return { title: w.title,
    head: '<div class="grow">' + wiCell(w) + "</div>",
    body: '<div class="row">' + labelChips(w.labels) + '<span class="muted">Opened ' + ago(w.opened) + " by " + h(PEOPLE[w.by] ? PEOPLE[w.by].name : w.by) + "</span></div><p>" + h(w.body) + "</p>" +
      (w.state === "inbox" ? '<button class="btn primary" data-act="send" data-key="' + h(w.key) + '">' + g("send", 14) + " Send to an agent</button>" : "") +
      '<h3 class="sec">Sessions</h3>' + (ss.length ? '<div class="lst">' + ss.map(sessRowCompact).join("") + "</div>" : '<p class="muted">No session has worked on this yet.</p>') };
};
function sessRowCompact(s) {
  var a = agentBy(s.agent);
  return '<a class="li" href="' + href("sessions", s.id) + '" data-go="sessions|' + s.id + '">' + agentAv(a, 24) + '<span class="bd2"><span class="t1">' + h(s.title) + " " + statusBadge(s) + '</span><span class="t2">' + pts([h(a.name), when(s.started), dur(s.dur)]) + '</span></span><b class="num">' + money(s.cost.total) + "</b></a>";
}

/* ============================== Sessions ============================== */
VIEWS.sessions = function () {
  if (S.id) return sessionView(S.id);
  if (S.empty) return { crumb: [["Sessions"]], html: phead("Sessions", "Every session your agents run, with its transcript and its cost.") + empty("sessions", "No sessions yet", "Connect an agent. Every session it runs shows up here, with a replay of its transcript and what each request cost.", '<button class="btn primary" data-act="connect">Connect an agent</button>') };
  var all = sessions(), live = all.filter(isLive), ny = needsYou();
  var list = S.sessFilter === "live" ? live : S.sessFilter === "needs" ? ny : S.sessAgent ? all.filter(function (s) { return s.agent === S.sessAgent; }) : all;
  S.sessLimit = S.sessLimit || 60;
  var seg = '<div class="seg">' + [["all", "All", all.length], ["live", "Live", live.length], ["needs", "Needs you", ny.length]].map(function (f) {
    return '<button class="btn sm" data-act="sessfilter" data-f="' + f[0] + '" aria-pressed="' + (S.sessFilter === f[0]) + '">' + f[1] + ' <span class="n">' + f[2] + "</span></button>";
  }).join("") + "</div>";
  var agentSel = '<select class="sel" data-change="sessagent" aria-label="Agent"><option value="">Every agent</option>' + AGENTS.map(function (a) { return '<option value="' + a.key + '"' + (S.sessAgent === a.key ? " selected" : "") + ">" + h(a.name) + "</option>"; }).join("") + "</select>";
  var rows = "", day = "";
  list.slice(0, S.sessLimit).forEach(function (s) {
    var a = agentBy(s.agent), dk = dayKey(s.started);
    if (dk !== day) { day = dk; rows += '<tr class="dayrow"><td colspan="7">' + dayLabel(s.started) + "</td></tr>"; }
    rows += '<tr class="click' + (s.transcript ? " has-tx" : "") + '" data-go="sessions|' + s.id + '"><td><span class="sesc"><b>' + h(s.title) + "</b>" + '<span class="sub">' + (s.wi ? ipLogo(s.wi.src, 11) + '<span class="mono">' + h(s.wi.key) + "</span>" : "Started in a terminal") + "</span></span></td>" +
      '<td class="mh">' + agentCell(a) + '</td><td class="nowrap mh">' + personAv(s.person, 20) + " " + h(personName(s.person)) + "</td><td>" + statusBadge(s) + '</td><td class="num nowrap muted mh">' + hhmm(s.started) + '</td><td class="num nowrap muted mh">' + dur(s.dur) + '</td><td class="num"><b>' + money(s.cost.total) + "</b></td></tr>";
  });
  var more = list.length > S.sessLimit ? '<div class="more"><button class="btn" data-act="sessmore">Show ' + Math.min(60, list.length - S.sessLimit) + " more</button><span class=\"muted\">" + num(S.sessLimit) + " of " + num(list.length) + "</span></div>" : "";
  return { crumb: [["Sessions"]], html: phead("Sessions", "Every session your agents ran, with its transcript and its cost.") +
    '<div class="toolbar">' + seg + agentSel + '<span class="sp muted">' + plural(list.length, "session") + ", " + money(list.reduce(function (t, s) { return t + s.cost.total; }, 0)) + "</span></div>" +
    '<div class="panel"><div class="tw"><table class="sess"><thead><tr><th>Session</th><th class="mh">Agent</th><th class="mh">Person</th><th>Status</th><th class="num mh">Started</th><th class="num mh">Length</th><th class="num">Cost</th></tr></thead><tbody>' + (rows || '<tr><td colspan="7" class="muted">No sessions match.</td></tr>') + "</tbody></table></div>" + more + "</div>" };
};
ACTS.sessfilter = function (el) { S.sessFilter = el.getAttribute("data-f"); S.sessAgent = null; render(); };
ACTS.sessagent = function (el) { S.sessAgent = el.value || null; S.sessFilter = "all"; render(); };
ACTS.sessmore = function () { S.sessLimit += 60; render(); };

function sessionView(id) {
  var s = sessionBy(id);
  if (!s) return { crumb: [["Sessions", "sessions"], ["Not found"]], html: empty("sessions", "No session with that id", "It may be from another workspace.", '<button class="btn" data-go="sessions">All sessions</button>') };
  var a = agentBy(s.agent), T = transcriptBy(id);
  if (T) rpOpen(T);
  var meta = '<div class="smeta">' + '<span class="hxn">' + hxIcon(a.harness, 14) + " " + h(hxLabel(a.harness)) + (T ? " " + h(T.harnessV) : "") + "</span>" +
    '<span class="agc-mini">' + agentAv(a, 18) + " " + h(a.name) + "</span>" +
    '<span>' + personAv(s.person, 18) + " " + h(personName(s.person)) + "</span>" +
    "<span>" + h(modelLabel(s.model)) + "</span>" +
    (s.wi ? '<span class="wik">' + ipLogo(s.wi.src, 12) + '<span class="mono">' + h(s.wi.key) + "</span></span>" : "<span>Started in a terminal</span>") +
    "<span>" + when(s.started) + "</span></div>";
  var head = '<div class="shead"><div class="t"><p class="eyebrow">Session</p><h1>' + h(s.title) + "</h1>" + meta + '</div><div class="acts">' + statusBadge(s) +
    (isLive(s) ? '<button class="btn" data-act="steer">' + g("send", 14) + ' <span class="lbl">Steer</span></button><button class="btn danger" data-act="stub" data-what="Stopping a session" aria-label="Stop">' + g("stop", 13) + ' <span class="lbl">Stop</span></button>' : "") + "</div></div>";
  var rail = sessionRail(s, T);
  if (!T) {
    return { crumb: [["Sessions", "sessions"], [s.title]], html: head + '<div class="sgrid"><div class="panel stub"><div class="state-wrap"><div class="ico">' + g("sessions", 20) + "</div><h2>Not in this mockup</h2><p>Four sessions carry a full transcript, one on each harness. Every other session shows its record and its cost.</p><div class=\"acts\">" +
      Object.keys(F.TRANSCRIPTS).slice(0, 4).map(function (tid) { var TT = F.TRANSCRIPTS[tid]; return '<button class="btn" data-go="sessions|' + tid + '">' + hxIcon(TT.harness, 14) + " " + h(hxLabel(TT.harness)) + "</button>"; }).join("") +
      "</div></div><div class=\"kv stub-kv\"><dt>Model requests</dt><dd>" + num(s.req) + "</dd><dt>Tokens</dt><dd>" + num(s.tokens) + "</dd><dt>Length</dt><dd>" + dur(s.dur) + "</dd><dt>Prompts</dt><dd>" + num(s.prompts || 1) + "</dd></div></div>" + rail + "</div>" };
  }
  var skin = SKINS[T.harness];
  var markers = RP.ev.map(function (e, i) {
    var cls = e.k === "prompt" || e.k === "steer" ? "m-user" : e.k === "ask" ? "m-ask" : e.k === "res" && e.ok === false ? "m-err" : e.k === "call" ? "m-tool" : "";
    return cls ? '<i class="' + cls + '" style="left:' + (RP.vts[i] / RP.total * 100).toFixed(2) + '%" data-act="rp-jump" data-vt="' + RP.vts[i] + '" title="' + h(e.k === "call" ? (e.tool.name || e.tool.kind) : e.k) + '"></i>' : "";
  }).join("");
  var bar = '<div class="rpbar" role="group" aria-label="Replay">' +
    '<button class="iconbtn" data-act="rp-restart" aria-label="Replay from the start">' + g("restart", 15) + "</button>" +
    '<button class="iconbtn" data-act="rp-prev" aria-label="Previous step">' + g("prev", 14) + "</button>" +
    '<button class="iconbtn play" id="rp-play" data-act="rp-play" aria-label="Play">' + g("play", 16) + "</button>" +
    '<button class="iconbtn" data-act="rp-next" aria-label="Next step">' + g("next", 14) + "</button>" +
    '<div class="rp-track"><div class="rp-rail"><div class="rp-fill" id="rp-fill"></div>' + markers + '</div><input type="range" id="rp-scrub" min="0" max="' + RP.total.toFixed(2) + '" step="any" value="' + RP.vt + '" data-input="rp-scrub" aria-label="Replay position"></div>' +
    '<span class="rp-time"><b id="rp-time" class="num"></b><span class="muted" id="rp-el"></span></span>' +
    '<select class="sel sm" data-change="rp-speed" aria-label="Replay speed">' + [1, 2, 4, 8, 16].map(function (x) { return '<option value="' + x + '"' + (RP.speed === x ? " selected" : "") + ">" + x + "×</option>"; }).join("") + "</select>" +
    (T.harness === "claude-code" || T.harness === "cursor" ? '<button class="btn sm" id="rp-thinking" data-act="rp-think" aria-pressed="' + RP.thinking + '">Thinking</button>' : "") + "</div>";
  var term = '<div class="term ' + skin.cls + '"><div class="term-top"><div></div><div class="term-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="term-t">' + h(skin.title(T)) + '</span><span class="term-h">' + h(T.host) + "</span></div><div></div></div>" +
    '<div class="rp-body" id="rp-body" tabindex="0" aria-label="Transcript"></div></div>';
  return { crumb: [["Sessions", "sessions"], [s.title]], html: head + bar + '<div class="sgrid"><div class="sterm">' + term + "</div>" + rail + "</div>",
    after: function () {
      var b = document.getElementById("rp-body");
      if (b) b.addEventListener("scroll", function () { RP.follow = b.scrollHeight - b.scrollTop - b.clientHeight < 60; }, { passive: true });
      rpDraw(true);
    } };
}
function sessionRail(s, T) {
  var a = agentBy(s.agent), chart = "", cap = T ? T.cap : a.cap;
  if (T) {
    var max = RP.led.reqs.reduce(function (m, q) { return Math.max(m, q.cost.total); }, 0) || 1;
    chart = '<div class="panel pad"><div class="rl-h"><h3>Cost by request</h3><span class="muted">' + plural(RP.led.reqs.length, "request") + '</span></div><div class="reqchart" id="rp-chart">' + RP.led.reqs.map(function (q) {
      return '<button data-n="' + q.n + '" data-act="rp-seek-req" style="height:' + Math.max(6, q.cost.total / max * 100).toFixed(1) + '%" title="Request ' + q.n + ": " + money3(q.cost.total) + '"><span class="sr">Request ' + q.n + " " + money3(q.cost.total) + "</span></button>";
    }).join("") + "</div></div>";
  }
  var basis = s.basis === "harness" ? "Reported by " + hxLabel(a.harness) + ". Its model calls do not pass through the oxagen gateway." : "Metered by the oxagen gateway, at list price.";
  var changes = T ? '<div class="panel pad"><div class="rl-h"><h3>Changes</h3></div><div id="rp-changes">' + changesFor(T, null) + "</div></div>" : "";
  return '<aside class="srail">' +
    '<div class="panel pad costcard"><div class="rl-h"><h3>Cost</h3><span class="muted" id="rp-so">' + (isLive(s) ? "So far, live" : "Whole session") + '</span></div><div class="big num" id="rp-cost">' + money(s.cost.total) + "</div>" +
      '<div class="capbar"><i id="rp-cap" style="width:' + Math.min(100, s.cost.total / (cap || 1) * 100) + '%"></i></div><div class="muted small">' + (cap ? "The session stops at " + money(cap) + "." : "") + '</div><div class="muted small"><span id="rp-reqs">' + plural(s.req, "model request") + ", " + tok(s.tokens) + " tokens</span></div>" +
      '<div class="basis">' + h(basis) + "</div></div>" + chart +
    '<div class="panel pad"><div class="rl-h"><h3>Where it went</h3></div><div id="rp-where">' + whereRows(s.cost.by, a.harness, s.cost.total) + "</div></div>" +
    changes + "</aside>";
}
/* What the session changed, as of replay time vt (null for the whole session). */
function changesFor(T, vt) {
  // The replay's own event list when it is on screen, so each event has its clock time by index.
  // transcriptEvents() builds fresh copies of an answer's events on every call.
  var live = RP.sid === T.id && RP.ev.length, ev = live ? RP.ev : transcriptEvents(T), files = {}, order = [], out = [], res = {};
  var seen = function (i) { return vt == null || !live || RP.vts[i] <= vt + 1e-6; };
  ev.forEach(function (e, i) { if (e.k === "res" && seen(i)) res[e.id] = e; });
  ev.forEach(function (e, i) {
    if (e.k !== "call" || !seen(i)) return;
    var t = e.tool;
    if (t.kind === "write" || t.kind === "edit") {
      if (!files[t.path]) { files[t.path] = { add: 0, del: 0, isNew: t.kind === "write" }; order.push(t.path); }
      files[t.path].add += t.kind === "write" ? t.content.length : t.add; files[t.path].del += t.kind === "write" ? 0 : t.del;
    }
    if (t.kind === "bash" && /git push/.test(t.cmd) && res[e.id]) out.push('<div class="chg">' + g("branch", 14) + ' <span class="mono">' + h(t.cmd.match(/origin (\S+)/)[1]) + '</span><span class="muted">pushed</span></div>');
    if (t.kind === "mcp" && t.name === "create_pull_request" && res[e.id]) out.push('<div class="chg">' + g("pr", 14) + " <span>" + h((res[e.id].lines || [""])[0].replace(/^Opened /, "")) + "</span></div>");
    if (t.kind === "mcp" && t.name === "create_release") out.push('<div class="chg">' + g("tag", 14) + ' <span class="mono">' + h(t.args.tag_name) + '</span><span class="muted">' + (res[e.id] ? (res[e.id].ok ? "draft created" : "not created") : "waiting on you") + "</span></div>");
  });
  var fl = order.map(function (p) { var f = files[p]; return '<div class="chg">' + g("file", 14) + ' <span class="mono">' + h(p) + '</span><span class="add">+' + f.add + "</span>" + (f.del ? '<span class="del">-' + f.del + "</span>" : "") + "</div>"; }).join("");
  return fl + out.join("") || '<p class="muted small">Nothing changed yet.</p>';
}
ACTS.steer = function () { openDialog("steer", S.id); };
DIALOGS.steer = function (id) {
  var s = sessionBy(id), a = agentBy(s.agent);
  return { title: "Steer this session", sub: h(a.name) + " gets your message at its next turn, the same as if you typed it in " + h(hxLabel(a.harness)) + ".",
    body: '<div class="field"><label for="steer-m">Message</label><textarea id="steer-m" rows="3" autofocus placeholder="Skip the mobile repo this cycle"></textarea></div>',
    foot: '<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="steer-go">' + g("send", 14) + " Send</button>" };
};
ACTS["steer-go"] = function () { closeDialog(); toast("Queued. The agent gets it at its next turn."); };

/* ============================== Agents ============================== */
VIEWS.agents = function () {
  var head = phead("Agents", "The agents you run, on any harness. Each gets its steering and MCP servers from one place.", '<button class="btn primary" data-act="connect">' + g("plus", 14) + " Connect an agent</button>");
  if (S.empty) return { crumb: [["Agents"]], html: head + empty("agents", "No agents yet", "Connect Claude Code, Codex, Cursor or stella with one command. The agent keeps running where it runs today.", '<button class="btn primary" data-act="connect">Connect an agent</button>') };
  var all = sessions();
  var cards = AGENTS.map(function (a) {
    var ss = all.filter(function (s) { return s.agent === a.key; }), spent = ss.reduce(function (t, s) { return t + s.cost.total; }, 0), last = ss[0];
    var st = steeringNext(a);
    var live = ss.filter(isLive)[0];
    return '<button class="panel acard" data-act="agent" data-key="' + a.key + '"><div class="acard-h">' + agentAv(a, 36) + '<div class="grow"><b>' + h(a.name) + '</b><span class="sub">' + pts([hxIcon(a.harness, 12) + " " + h(hxLabel(a.harness)), h(modelLabel(a.model))]) + "</span></div>" + (live ? statusBadge(live) : "") + "</div>" +
      '<p class="muted">' + h(a.desc) + "</p>" +
      '<div class="acard-m"><div><span class="k">This month</span><b class="num">' + money(spent) + '</b><span class="muted">of ' + money(a.budget) + '</span></div><div class="capbar"><i style="width:' + Math.min(100, spent / a.budget * 100) + '%"></i></div></div>' +
      '<dl class="kv"><dt>Runs on</dt><dd>' + h(a.where) + '</dd><dt>Operator</dt><dd>' + h(personName(a.operator)) + "</dd><dt>Sessions</dt><dd>" + num(ss.length) + (last ? ", last " + when(last.started) : "") + "</dd><dt>Gets</dt><dd>" + plural(st.length, "steering item") + ", " + a.servers.map(function (id) { return serverBy(id).name; }).join(", ") + "</dd></dl></button>";
  }).join("");
  return { crumb: [["Agents"]], html: head + '<div class="grid acards">' + cards + "</div>" };
};
ACTS.agent = function (el) { openDrawer("agent", el.getAttribute("data-key")); };
DRAWERS.agent = function (key) {
  var a = agentBy(key), ss = sessions().filter(function (s) { return s.agent === key; }), st = steeringNext(a);
  var spent = ss.reduce(function (t, s) { return t + s.cost.total; }, 0);
  return { title: a.name,
    head: '<div class="grow row">' + agentAv(a, 34) + '<div><h2>' + h(a.name) + '</h2><span class="muted">' + pts([hxIcon(a.harness, 12) + " " + h(hxLabel(a.harness)) + " " + h(a.harnessV), h(modelLabel(a.model))]) + "</span></div></div>",
    body: '<p>' + h(a.desc) + '</p><div class="grid g3 tiles">' + stat("This month", money(spent), "of " + money(a.budget)) + stat("Sessions", num(ss.length), "in September") + stat("Stops each session at", a.cap ? money(a.cap) : "No limit", "") + "</div>" +
      '<h3 class="sec">Steering it gets</h3><div class="lst">' + st.map(function (i) { return '<div class="li"><span class="kind k-' + i.kind + '">' + h(kindLabel(i.kind)) + '</span><span class="bd2"><span class="t1">' + h(i.title || i.text) + '</span></span><span class="muted num">' + num(i.tok) + " tok</span></div>"; }).join("") + "</div>" +
      '<h3 class="sec">MCP servers it gets</h3><div class="lst">' + a.servers.map(function (id) { var sv = serverBy(id); return '<div class="li">' + serverMark(sv, 22) + '<span class="bd2"><span class="t1">' + h(sv.name) + '</span><span class="t2">' + h(sv.auth) + "</span></span></div>"; }).join("") + "</div>" +
      '<h3 class="sec">Recent sessions</h3><div class="lst">' + ss.slice(0, 6).map(sessRowCompact).join("") + "</div>" +
      '<h3 class="sec">Where it runs</h3><dl class="kv"><dt>Host</dt><dd class="mono">' + h(a.host) + "</dd><dt>Operator</dt><dd>" + h(personName(a.operator)) + "</dd><dt>Connected</dt><dd>" + h(a.enrolled) + "</dd></dl>" };
};
function kindLabel(k) { return { instructions: "Instructions", rule: "Rule", skill: "Skill", memory: "Memory" }[k] || k; }
ACTS.connect = function () { openDialog("connect"); };
DIALOGS.connect = function (arg, d) {
  d.h = d.h || "claude-code";
  var cmd = "oxagen agent enroll --token otk_7Q2M4XJ9 --harness " + (d.h === "codex-cli" ? "codex" : d.h);
  return { title: "Connect an agent", sub: "Run this where the agent runs: a laptop, a CI runner or a server. The agent keeps running there.",
    body: '<div class="field"><label>Harness</label><div class="seg wide">' + ["claude-code", "codex-cli", "cursor", "stella"].map(function (k) {
      return '<button class="btn sm" data-act="connect-h" data-h="' + k + '" aria-pressed="' + (d.h === k) + '">' + hxIcon(k, 14) + " " + h(hxLabel(k)) + "</button>";
    }).join("") + '</div></div><div class="field"><label>Command</label><div class="cmdline"><code>' + h(cmd) + "</code>" + copyBtn(cmd) + '</div><div class="hint">The token works once and expires in 24 hours.</div></div>' +
      '<div class="note">oxagen writes the steering and the MCP servers into ' + h(hxLabel(d.h)) + "'s own files, and records every session from then on.</div>",
    foot: '<span class="grow muted">Waiting for the first session…</span><button class="btn" data-act="close">Close</button><button class="btn primary" data-act="connect-done">I ran it</button>' };
};
ACTS["connect-h"] = function (el) { S.dialog.h = el.getAttribute("data-h"); renderLayer(); };
ACTS["connect-done"] = function () { S.connected = true; closeDialog(); toast("Connected. The first session will show up in Sessions."); render(); };

/* ============================== Steering ============================== */
function deliveryStrip(targets, note) {
  return '<div class="deliv"><span class="deliv-n">' + h(note) + '</span><div class="deliv-t">' + targets.map(function (t) {
    return '<span class="dt">' + hxIcon(t.harness, 14) + '<span>' + h(hxLabel(t.harness)) + '</span><code>' + h(t.file) + "</code></span>";
  }).join("") + "</div></div>";
}
VIEWS.steering = function () {
  var head = phead("Steering", "One set of instructions for every agent, on every harness.",
    '<button class="btn" data-act="steerimport">' + g("import", 14) + ' Import</button><button class="btn primary" data-act="newsteer">' + g("plus", 14) + " New item</button>");
  if (S.empty && !S.imported.steering) return { crumb: [["Steering"]], html: head + empty("steering", "Nothing here yet", "Import CLAUDE.md, AGENTS.md and Cursor rules from your repositories. oxagen merges them into one list, drops the duplicates and asks you about the conflicts.", '<button class="btn primary" data-act="steerimport">Import steering</button>') };
  var items = steeringItems(), sugg = STEERING.suggestions.filter(function (s) { return !S.accepted[s.id] && !S.dismissed[s.id]; });
  var sugHtml = sugg.map(function (sg) {
    var from = sg.from, T = F.TRANSCRIPTS[from.session], why;
    if (from.said) why = h(personName(from.by)) + " told " + h(agentBy(T.agent).name) + " “" + h(from.said) + "” in " + '<a href="' + href("sessions", from.session) + '" data-go="sessions|' + from.session + '">' + h(T.title) + "</a>.";
    else why = h(agentBy(T.agent).name) + " failed the release notes lint in " + from.sessions + " of its last 5 sessions. The fix-up in " + '<a href="' + href("sessions", from.session) + '" data-go="sessions|' + from.session + '">' + h(T.title) + "</a> cost " + money(suggestionFixup(sg)) + ".";
    return '<div class="sug"><div class="grow"><span class="kind k-' + sg.kind + '">Suggested ' + h(kindLabel(sg.kind).toLowerCase()) + '</span><p class="sug-t">' + h(sg.text) + '</p><p class="muted small">' + why + '</p></div><div class="row"><button class="btn sm primary-soft" data-act="sug-add" data-id="' + sg.id + '">Add it</button><button class="btn sm ghost" data-act="sug-dismiss" data-id="' + sg.id + '">Dismiss</button></div></div>';
  }).join("");
  var totals = AGENTS.map(function (a) { return Ledger.steeringFor(a, LEDGER_F).reduce(function (t, i) { return t + i.tok; }, 0); });
  var monthCost = sessions().reduce(function (t, s) { var c = 0; for (var k in s.cost.by) if (k === "steering" || /^skill:/.test(k)) c += s.cost.by[k]; return t + c; }, 0);
  var rows = items.map(function (it) {
    var st = steeringStats(it);
    return '<tr class="click" data-act="steeritem" data-id="' + it.id + '"><td><span class="kind k-' + it.kind + '">' + kindLabel(it.kind) + '</span></td><td><span class="stx">' + h(it.title || it.text) + "</span>" + (it.title && it.text ? '<span class="sub">' + h(it.text) + "</span>" : "") + (it.fresh ? ' <span class="b b-allowed">New</span>' : "") + "</td>" +
      '<td class="mh">' + (it.agents === "all" ? '<span class="muted">Every agent</span>' : it.agents.map(function (k) { return '<span class="chip">' + h(agentBy(k).name) + "</span>"; }).join(" ")) + "</td>" +
      '<td class="num">' + num(it.tok) + '</td><td class="num">' + (it.kind === "skill" ? plural(st.sessions, "load") : plural(st.sessions, "session")) + '</td><td class="num">' + money(st.cost) + "</td></tr>";
  }).join("");
  return { crumb: [["Steering"]], html: head + deliveryStrip(STEERING.targets, "Every session gets the current version when it starts. Nothing is committed to your repositories.") +
    (sugHtml ? '<div class="panel sugs"><div class="panel-h"><h3>Suggestions from sessions</h3><span class="sp muted">' + plural(sugg.length, "suggestion") + "</span></div>" + sugHtml + "</div>" : "") +
    '<div class="panel"><div class="panel-h"><h3>Items</h3><span class="sp muted">Each session starts with ' + num(Math.min.apply(null, totals)) + " to " + num(Math.max.apply(null, totals)) + " tokens of steering. It cost " + money(monthCost) + ' this month.</span></div><div class="tw"><table><thead><tr><th>Kind</th><th>Item</th><th class="mh">Applies to</th><th class="num mh">Tokens</th><th class="num mh">This month</th><th class="num">Cost</th></tr></thead><tbody>' + rows + "</tbody></table></div></div>" };
};
ACTS["sug-add"] = function (el) { S.accepted[el.getAttribute("data-id")] = true; toast("Added. Every session gets it from now on."); render(); };
ACTS["sug-dismiss"] = function (el) { S.dismissed[el.getAttribute("data-id")] = true; render(); };
ACTS.steeritem = function (el) { openDrawer("steeritem", el.getAttribute("data-id")); };
DRAWERS.steeritem = function (id) {
  var it = steeringItems().filter(function (i) { return i.id === id; })[0], st = steeringStats(it);
  S.landing = S.landing || "claude-code";
  var tgt = STEERING.targets.filter(function (t) { return t.harness === S.landing; })[0];
  var text = it.body || it.text;
  var landing = it.kind === "skill" ? tgt.skills + it.id + "/SKILL.md" : tgt.file;
  var preview = it.kind === "skill" ? "---\nname: " + it.id + "\ndescription: " + it.text + "\n---\n\n(" + num(it.tok) + " tokens, loaded when a session needs it)" :
    (S.landing === "cursor" ? "---\ndescription: oxagen steering for Core platform\nalwaysApply: true\n---\n\n" : "<!-- oxagen: managed block, edits here are replaced at the next session -->\n") + (it.kind === "instructions" ? text : "- " + text);
  return { title: it.title || kindLabel(it.kind),
    head: '<div class="grow"><span class="kind k-' + it.kind + '">' + kindLabel(it.kind) + "</span><h2>" + h(it.title || kindLabel(it.kind)) + "</h2></div>",
    body: '<div class="field"><label for="st-text">' + (it.kind === "instructions" ? "Instructions" : it.kind === "skill" ? "Description" : "Text") + '</label><textarea id="st-text" rows="' + (it.kind === "instructions" ? 16 : 3) + '" class="mono">' + h(it.kind === "skill" ? it.text : text) + "</textarea></div>" +
      '<div class="grid g3 tiles">' + stat("Tokens", num(it.tok), it.kind === "skill" ? "when loaded" : "in every session") + stat(it.kind === "skill" ? "Loads" : "Sessions", num(st.sessions), "this month") + stat("Cost", money(st.cost), "this month") + "</div>" +
      '<h3 class="sec">Where it lands</h3><div class="seg wide">' + STEERING.targets.map(function (t) { return '<button class="btn sm" data-act="landing" data-h="' + t.harness + '" aria-pressed="' + (S.landing === t.harness) + '">' + hxIcon(t.harness, 13) + " " + h(hxLabel(t.harness)) + "</button>"; }).join("") + "</div>" +
      '<div class="readout"><div class="rh"><span class="mono">' + h(landing) + '</span><span class="sp">written at session start</span></div><pre>' + h(preview) + "</pre></div>" +
      (it.from ? '<p class="muted small">' + h(it.from) + ". Accepted by " + h(personName(it.by)) + ".</p>" : "") +
      (it.history ? '<h3 class="sec">History</h3><div class="lst">' + it.history.map(function (v) { return '<div class="li"><span class="mono muted">v' + v.v + '</span><span class="bd2"><span class="t1">' + h(v.what) + '</span><span class="t2">' + pts([h(personName(v.by)), h(v.at)]) + "</span></span></div>"; }).join("") + "</div>" : "") +
      '<div class="dfoot"><button class="btn" data-act="close">Close</button><button class="btn primary" data-act="stub" data-what="Saving steering">Save</button></div>' };
};
ACTS.landing = function (el) { S.landing = el.getAttribute("data-h"); renderLayer(); };
ACTS.newsteer = function () { openDialog("newsteer"); };
DIALOGS.newsteer = function () {
  return { title: "New steering item", sub: "Every agent it applies to gets it at the start of its next session.",
    body: '<div class="field"><label for="ns-kind">Kind</label><select id="ns-kind"><option>Rule</option><option>Memory</option><option>Skill</option></select></div><div class="field"><label for="ns-text">Text</label><textarea id="ns-text" rows="3" autofocus placeholder="Run pnpm release:lint before you commit release notes."></textarea></div>' +
      '<div class="field"><label for="ns-to">Applies to</label><select id="ns-to"><option>Every agent</option>' + AGENTS.map(function (a) { return "<option>" + h(a.name) + "</option>"; }).join("") + "</select></div>",
    foot: '<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="stub" data-what="Saving steering">Add</button>' };
};
ACTS.steerimport = function () { openDialog("steerimport"); };
DIALOGS.steerimport = function (arg, d) {
  var im = STEERING.import, lines = im.found.reduce(function (t, f) { return t + f.lines; }, 0), dupes = im.found.reduce(function (t, f) { return t + f.dupes; }, 0);
  var personal = im.found.filter(function (f) { return f.personal; }).reduce(function (t, f) { return t + f.lines; }, 0);
  var result = lines - dupes - personal - im.conflicts.length;
  d.pick = d.pick || {};
  return { title: "Import steering", wide: true, sub: "oxagen read these files from your repositories and machines.",
    body: '<div class="tw"><table class="narrow"><thead><tr><th>File</th><th>Where</th><th class="num">Lines</th><th class="num">Duplicates</th></tr></thead><tbody>' + im.found.map(function (f) {
      return '<tr><td class="mono">' + h(f.file) + "</td><td>" + h(f.where) + (f.personal ? ' <span class="b b-q">Personal, stays on the laptop</span>' : "") + '</td><td class="num">' + f.lines + '</td><td class="num">' + (f.dupes || "") + "</td></tr>";
    }).join("") + "</tbody></table></div>" +
      '<h3 class="sec">' + plural(im.conflicts.length, "conflict") + " to settle</h3>" + im.conflicts.map(function (c, i) {
        return '<div class="conf"><label class="check"><input type="radio" name="cf' + i + '" ' + (d.pick[i] !== "b" ? "checked" : "") + ' data-change="cf" data-i="' + i + '" value="a"><span class="grow"><span class="n">' + h(c.a.text) + '</span><span class="d">' + h(c.a.file) + '</span></span></label><label class="check"><input type="radio" name="cf' + i + '" ' + (d.pick[i] === "b" ? "checked" : "") + ' data-change="cf" data-i="' + i + '" value="b"><span class="grow"><span class="n">' + h(c.b.text) + '</span><span class="d">' + h(c.b.file) + "</span></span></label></div>";
      }).join(""),
    foot: '<span class="grow">' + num(lines) + " lines, " + num(dupes) + " duplicates merged, " + num(personal) + " personal left out. " + plural(result, "item") + ' to import.</span><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="steerimport-go">Import ' + plural(result, "item") + "</button>" };
};
ACTS.cf = function (el) { S.dialog.pick[el.getAttribute("data-i")] = el.value; };
ACTS["steerimport-go"] = function () { S.imported.steering = true; closeDialog(); toast("Imported. Every agent gets these at its next session."); render(); };

/* ============================== MCP servers ============================== */
VIEWS.servers = function () {
  var head = phead("MCP servers", "One list of servers for every agent. oxagen holds the keys.",
    '<button class="btn" data-act="serverimport">' + g("import", 14) + ' Import</button><button class="btn primary" data-act="addserver">' + g("plus", 14) + " Add a server</button>");
  if (S.empty && !S.imported.servers) return { crumb: [["MCP servers"]], html: head + empty("servers", "No servers yet", "Import the servers already set up in Claude Code, Codex and Cursor on your machines. oxagen takes their keys and points every harness at one gateway.", '<button class="btn primary" data-act="serverimport">Import MCP servers</button>') };
  var rows = SERVERS.map(function (sv) {
    var st = serverStats(sv.id), on = sv.tools.filter(function (t) { return toolMode(sv.id, t) !== "off"; }).length, ask = sv.tools.filter(function (t) { return toolMode(sv.id, t) === "ask"; }).length, ag = serverAgents(sv.id);
    return '<tr class="click" data-act="server" data-id="' + sv.id + '"><td><span class="srvc">' + serverMark(sv, 28) + '<span><b>' + h(sv.name) + '</b><span class="sub mono">' + h(sv.upstream) + "</span></span></span></td>" +
      '<td class="mh"><span class="authc">' + g(sv.authKind === "key" ? "key" : sv.authKind === "builtin" ? "check" : "lock", 13) + " " + h(sv.auth) + "</span></td>" +
      '<td class="num mh">' + on + " of " + sv.tools.length + (ask ? '<span class="sub">' + ask + " ask first</span>" : "") + "</td>" +
      '<td class="mh">' + (ag.length === AGENTS.length ? '<span class="muted">Every agent</span>' : '<span class="avs">' + ag.map(function (k) { return agentAv(agentBy(k), 22); }).join("") + "</span>") + "</td>" +
      '<td class="num mh">' + num(st.calls) + '</td><td class="num">' + money(st.cost) + "</td></tr>";
  }).join("");
  return { crumb: [["MCP servers"]], html: head + deliveryStrip(F.SERVERS.targets, "Every harness points at " + F.SERVERS.gateway + ", which holds the keys and applies your tool rules.") +
    '<div class="panel"><div class="tw"><table><thead><tr><th>Server</th><th class="mh">Key</th><th class="num mh">Tools on</th><th class="mh">Agents</th><th class="num mh">Calls this month</th><th class="num">Cost</th></tr></thead><tbody>' + rows + "</tbody></table></div></div>" +
    '<p class="muted small foot">A server\'s cost is what its tool definitions and results added to each model request.</p>' };
};
ACTS.server = function (el) { openDrawer("server", el.getAttribute("data-id")); };
DRAWERS.server = function (id) {
  var sv = serverBy(id), st = serverStats(id), ag = serverAgents(id);
  var unused = st.unused.length && id !== "oxagen" ? '<div class="banner"><div class="grow"><b>' + plural(st.unused.length, "tool") + " on but not called this month</b>" + st.unused.map(function (t) { return "<code>" + h(t.n) + "</code>"; }).join(" ") + "<br>Their definitions add " + num(st.unusedTok) + " tokens to every request. Turning them off would have saved about " + money(st.save) + " this month.</div><button class=\"btn sm\" data-act=\"tools-off\" data-id=\"" + id + '">Turn them off</button></div>' : "";
  var groups = [["Read", sv.tools.filter(function (t) { return !t.write; })], ["Write", sv.tools.filter(function (t) { return t.write; })]];
  var tools = groups.map(function (gr) {
    if (!gr[1].length) return "";
    return '<tr class="tgrp"><td colspan="3"><b>' + gr[0] + "</b></td></tr>" + gr[1].map(function (t) {
      var m = toolMode(id, t);
      return "<tr><td><span class=\"mono\">" + h(t.n) + '</span><span class="sub">' + h(t.d) + '</span></td><td class="num">' + (st.perTool[t.n] ? num(st.perTool[t.n]) : '<span class="muted">0</span>') + '</td><td><div class="seg tm-seg">' + ["allow", "ask", "off"].map(function (x) {
        return '<button class="btn sm m-' + x + '" data-act="toolmode" data-k="' + id + "." + t.n + '" data-m="' + x + '" aria-pressed="' + (m === x) + '">' + { allow: "Allow", ask: "Ask", off: "Off" }[x] + "</button>";
      }).join("") + "</div></td></tr>";
    }).join("");
  }).join("");
  return { title: sv.name,
    head: '<div class="grow row">' + serverMark(sv, 34) + "<div><h2>" + h(sv.name) + '</h2><span class="muted mono">' + h(sv.upstream) + "</span></div></div>",
    body: '<div class="grid g3 tiles">' + stat("Calls", num(st.calls), "this month") + stat("Cost", money(st.cost), "definitions and results") + stat("Definitions", num(st.defTok), "tokens in every request") + "</div>" + unused +
      '<h3 class="sec">Key</h3><div class="keyc">' + g(sv.authKind === "key" ? "key" : "lock", 15) + "<div><b>" + h(sv.auth) + '</b><span class="muted">' + h(sv.keyNote) + "</span></div></div>" +
      '<h3 class="sec">Agents that get it</h3><div class="agpick">' + AGENTS.map(function (a) { return '<label class="check"><input type="checkbox" data-change="srv-agent" data-id="' + id + '" data-a="' + a.key + '"' + (ag.indexOf(a.key) >= 0 ? " checked" : "") + (id === "oxagen" ? " disabled" : "") + '><span class="grow"><span class="n">' + h(a.name) + '</span><span class="d">' + hxIcon(a.harness, 11) + " " + h(hxLabel(a.harness)) + "</span></span></label>"; }).join("") + "</div>" +
      '<h3 class="sec">Tools</h3><p class="muted small">Ask sends the call to a person first. Off takes the tool out of every agent\'s list.</p><div class="tw"><table class="narrow tools"><thead><tr><th>Tool</th><th class="num">Calls</th><th>Rule</th></tr></thead><tbody>' + tools + "</tbody></table></div>" };
};
ACTS.toolmode = function (el) { S.toolMode[el.getAttribute("data-k")] = el.getAttribute("data-m"); renderLayer(); };
ACTS["tools-off"] = function (el) {
  var id = el.getAttribute("data-id"), st = serverStats(id);
  st.unused.forEach(function (t) { S.toolMode[id + "." + t.n] = "off"; });
  toast(plural(st.unused.length, "tool") + " turned off. Agents stop seeing them at their next session.");
  renderLayer(); render();
};
ACTS["srv-agent"] = function (el) {
  var id = el.getAttribute("data-id"), a = el.getAttribute("data-a"), cur = serverAgents(id).slice();
  if (el.checked && cur.indexOf(a) < 0) cur.push(a);
  if (!el.checked) cur = cur.filter(function (x) { return x !== a; });
  S.serverAgents[id] = cur; render(); renderLayer();
};
ACTS.serverimport = function () { openDialog("serverimport"); };
DIALOGS.serverimport = function () {
  var im = F.SERVERS.import, entries = [], keys = 0, dupes = 0, srv = {};
  im.found.forEach(function (m) { m.entries.forEach(function (e) { entries.push(e); if (e.key === "plaintext") keys++; if (e.dupe) dupes++; srv[e.server] = 1; }); });
  return { title: "Import MCP servers", wide: true, sub: "oxagen read the MCP config of each harness on " + plural(im.machines, "machine") + ".",
    body: im.found.map(function (m) {
      return '<div class="imp"><div class="imp-h">' + g("dir", 14) + ' <b class="mono">' + h(m.machine) + '</b><span class="mono muted">' + h(m.file) + "</span><span class=\"muted\">" + h(personName(m.person)) + "</span></div>" + m.entries.map(function (e) {
        return '<div class="imp-e"><span class="mono">' + h(e.name) + "</span><span class=\"muted\">" + h(e.note) + "</span>" + (e.key === "plaintext" ? badge("b-denied", "Key in plaintext", true) : "") + (e.dupe ? badge("b-q", "Duplicate") : "") + "</div>";
      }).join("") + "</div>";
    }).join("") + '<div class="note">Import moves the ' + plural(keys, "key") + " into oxagen and rewrites each config to point at " + h(F.SERVERS.gateway) + ". No key stays on a laptop.</div>",
    foot: '<span class="grow">' + plural(entries.length, "entry", "entries") + ", " + plural(Object.keys(srv).length, "server") + ", " + plural(keys, "key") + ' in plaintext.</span><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="serverimport-go">Import ' + plural(Object.keys(srv).length, "server") + "</button>" };
};
ACTS["serverimport-go"] = function () { S.imported.servers = true; closeDialog(); toast("Imported. The keys are in oxagen, and each config points at the gateway."); render(); };
ACTS.addserver = function () { openDialog("addserver"); };
DIALOGS.addserver = function (arg, d) {
  if (d.pick) {
    var c = F.SERVERS.catalog.filter(function (x) { return x.id === d.pick; })[0];
    return { title: "Add " + c.name, sub: c.d,
      body: (c.auth === "oauth" ? '<div class="field"><label>Sign in</label><button class="btn" data-act="stub" data-what="Signing in to ' + h(c.name) + '">Sign in with ' + h(c.name) + '</button><div class="hint">oxagen keeps the token and refreshes it. No laptop holds it.</div></div>' :
        '<div class="field"><label for="as-key">API key</label><input id="as-key" type="password" autofocus placeholder="Paste the key"><div class="hint">oxagen stores it and sends it only to ' + h(c.name) + ". Agents never see it.</div></div>") +
        '<div class="field"><label>Agents that get it</label><div class="agpick">' + AGENTS.map(function (a) { return '<label class="check"><input type="checkbox"><span class="grow"><span class="n">' + h(a.name) + '</span><span class="d">' + h(hxLabel(a.harness)) + "</span></span></label>"; }).join("") + "</div></div>",
      foot: '<button class="btn" data-act="as-back">Back</button><button class="btn primary" data-act="stub" data-what="Adding a server">Add ' + h(c.name) + "</button>" };
  }
  return { title: "Add a server", wide: true, sub: "Pick one, or paste the URL of any MCP server.",
    body: '<div class="catalog">' + F.SERVERS.catalog.map(function (c) { return '<button class="cat" data-act="as-pick" data-id="' + c.id + '">' + serverMark(c, 30) + "<span><b>" + h(c.name) + '</b><span class="muted">' + h(c.d) + "</span></span></button>"; }).join("") + "</div>" +
      '<div class="field"><label for="as-url">Or a URL</label><input id="as-url" placeholder="https://mcp.example.com/mcp"></div>',
    foot: '<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="stub" data-what="Adding a server by URL">Continue</button>' };
};
ACTS["as-pick"] = function (el) { S.dialog.pick = el.getAttribute("data-id"); renderLayer(); };
ACTS["as-back"] = function () { S.dialog.pick = null; renderLayer(); };

/* ============================== Spend ============================== */
VIEWS.spend = function () {
  var head = phead("Spend", "What every session cost, from its own model requests.");
  if (S.empty) return { crumb: [["Spend"]], html: head + empty("spend", "Nothing spent yet", "Spend fills in from the first session. Every figure is a sum of recorded model requests.", "") };
  var total = monthTotal(), days = dailySpend(), max = days.reduce(function (m, d) { return Math.max(m, d.cost); }, 0) || 1;
  var yMax = Math.ceil(max / 10) * 10;
  var bars = days.map(function (d, i) {
    var hgt = d.cost / yMax * 100;
    return '<div class="dbar' + (dayLabel(d.date) === "Today" ? " today" : "") + '" title="' + MON[d.date.getMonth()] + " " + d.date.getDate() + ": " + money(d.cost) + '"><i style="height:' + hgt.toFixed(1) + '%"></i><span class="dl">' + (i % 3 === 0 || i === days.length - 1 ? d.date.getDate() : "") + "</span></div>";
  }).join("");
  var chart = '<div class="panel pad spendtop"><div class="sp-total"><span class="k">' + h(F.ORG.month.label) + '</span><span class="big num">' + money(total) + '</span><span class="muted">September 1 to 25, ' + plural(sessions().length, "session") + '</span></div><div class="dchart" role="img" aria-label="Spend by day"><div class="dgrid"><span>$' + num(yMax) + "</span><span>$" + num(yMax / 2) + "</span><span>$0</span></div><div class=\"dbars\">" + bars + "</div></div></div>";
  var seg = '<div class="seg">' + SPEND_BY.map(function (b) { return '<button class="btn sm" data-act="spendby" data-by="' + b.key + '" aria-pressed="' + (S.spendBy === b.key) + '">' + b.label + "</button>"; }).join("") + "</div>";
  var rows = spendRows(S.spendBy), rmax = rows.reduce(function (m, r) { return Math.max(m, r.rest ? 0 : r.cost); }, 0) || 1;
  var sum = rows.reduce(function (t, r) { return t + r.cost; }, 0);
  var body = rows.map(function (r) {
    var open = S.spendOpen === r.key, lab;
    if (r.agent) lab = agentCell(r.agent);
    else if (r.person) lab = '<span class="nowrap">' + personAv(r.person, 22) + " " + h(r.label) + "</span>";
    else if (r.wi) lab = wiCell(r.wi);
    else if (r.server) lab = '<span class="srvc">' + serverMark(serverBy(r.server), 22) + "<b>" + h(r.label) + "</b></span>";
    else lab = "<b>" + h(r.label) + "</b>" + (r.note ? '<span class="sub">' + h(r.note) + "</span>" : "");
    var tr = '<tr class="click' + (open ? " open" : "") + '" data-act="spendrow" data-key="' + h(r.key) + '"><td>' + lab + '</td><td class="num mh">' + (r.rest ? "" : num(r.sessions.length)) + '</td><td class="num mh">' + (r.rest ? "" : tok(r.tokens)) + '</td><td class="share"><span class="shb"><i style="width:' + (r.rest ? 0 : r.cost / rmax * 100).toFixed(1) + '%"></i></span><span class="num muted">' + (r.cost / total * 100).toFixed(1) + '%</span></td><td class="num"><b>' + money(r.cost) + "</b></td></tr>";
    if (open && !r.rest) {
      var top = r.sessions.slice().sort(function (a, b) { return (r.server ? b.cost.by["mcp:" + r.server] - a.cost.by["mcp:" + r.server] : b.cost.total - a.cost.total); }).slice(0, 8);
      tr += '<tr class="drill"><td colspan="5"><div class="lst">' + top.map(function (s) {
        var a = agentBy(s.agent), c = r.server ? s.cost.by["mcp:" + r.server] : s.cost.total;
        return '<a class="li" href="' + href("sessions", s.id) + '" data-go="sessions|' + s.id + '">' + agentAv(a, 22) + '<span class="bd2"><span class="t1">' + h(s.title) + (s.transcript ? ' <span class="b b-approval">Replay</span>' : "") + '</span><span class="t2">' + pts([h(a.name), h(personName(s.person)), when(s.started)]) + '</span></span><b class="num">' + money(c) + "</b></a>";
      }).join("") + (r.sessions.length > 8 ? '<div class="li muted">' + plural(r.sessions.length - 8, "more session") + "</div>" : "") + "</div></td></tr>";
    }
    return tr;
  }).join("");
  var table = '<div class="panel"><div class="panel-h"><h3>By ' + h(SPEND_BY.filter(function (b) { return b.key === S.spendBy; })[0].label.toLowerCase()) + '</h3><span class="sp">' + seg + '</span></div><div class="tw"><table class="spend"><thead><tr><th>' + h(SPEND_BY.filter(function (b) { return b.key === S.spendBy; })[0].label) + '</th><th class="num mh">Sessions</th><th class="num mh">Tokens</th><th>Share</th><th class="num">Cost</th></tr></thead><tbody>' + body +
    '</tbody><tfoot><tr><td>Total</td><td class="mh"></td><td class="mh"></td><td></td><td class="num"><b>' + money(sum) + "</b></td></tr></tfoot></table></div></div>";
  var cursorCost = sessions().filter(function (s) { return s.basis === "harness"; }).reduce(function (t, s) { return t + s.cost.total; }, 0);
  return { crumb: [["Spend"]], html: head + chart + table + '<p class="muted small foot">Every figure is recorded model requests at list price. ' + money(cursorCost) + " came from Cursor, which reports its own usage because its model calls do not pass through the oxagen gateway. The gateway metered the rest.</p>" };
};
ACTS.spendby = function (el) { S.spendBy = el.getAttribute("data-by"); S.spendOpen = null; render(); };
ACTS.spendrow = function (el, ev) { if (ev.target.closest("a")) return; var k = el.getAttribute("data-key"); S.spendOpen = S.spendOpen === k ? null : k; render(); };

/* ---- the account dialog: theme and the settings v3 leaves out ---- */
DIALOGS.account = function () {
  var me = PEOPLE[ME];
  return { title: me.name, sub: h(me.email),
    body: '<div class="field"><label>Theme</label><div class="seg wide">' + [["", "System"], ["light", "Light"], ["dark", "Dark"]].map(function (t) { return '<button class="btn sm" data-act="theme" data-t="' + t[0] + '" aria-pressed="' + ((S.theme || "") === t[0]) + '">' + t[1] + "</button>"; }).join("") + "</div></div>" +
      '<div class="lst">' + [["Members", "Invite people and set roles"], ["Billing", "Plan, invoices and the model funding"], ["API keys", "Keys for the oxagen API"], ["Audit log", "Every action anyone took"]].map(function (x) {
        return '<button class="li linkish" data-act="stub" data-what="' + x[0] + '"><span class="bd2"><span class="t1">' + x[0] + '</span><span class="t2">' + x[1] + "</span></span>" + g("right", 14) + "</button>";
      }).join("") + "</div>",
    foot: '<button class="btn" data-act="close">Close</button>' };
};
ACTS.theme = function (el) { setTheme(el.getAttribute("data-t") || null); renderLayer(); };

/* ---- the review pill: mockup controls, never product UI ---- */
function renderPill() {
  var el = document.getElementById("pill");
  if (!S.island) { el.innerHTML = ""; return; }
  var th = effectiveTheme();
  el.innerHTML = '<div class="pill" role="toolbar" aria-label="Mockup controls"><span class="pill-l">v3 mockup</span>' +
    '<button data-act="pill-theme" title="Theme" aria-label="Switch to ' + (th === "dark" ? "light" : "dark") + ' theme">' + g(th === "dark" ? "sun" : "moon", 14) + "</button>" +
    '<button data-act="pill-empty" aria-pressed="' + S.empty + '" title="Show the first run">First run</button>' +
    '<button data-act="pill-phone" aria-pressed="' + !!S.preview + '" title="Phone width">' + g("phone", 14) + "</button>" +
    '<button data-act="pill-hide" aria-label="Hide the mockup controls">' + g("x", 13) + "</button></div>";
}
ACTS["pill-theme"] = function () { setTheme(effectiveTheme() === "dark" ? "light" : "dark"); render(); };
ACTS["pill-empty"] = function () { S.empty = !S.empty; S.imported = { steering: false, servers: false }; S.connected = false; _sessions = null; render(); };
ACTS["pill-phone"] = function () { S.preview = !S.preview; S.phone = S.preview || (function () { try { return matchMedia("(max-width: 760px)").matches; } catch (e) { return false; } })(); render(); };
ACTS["pill-hide"] = function () { S.island = false; renderPill(); };
