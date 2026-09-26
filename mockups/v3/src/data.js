/* ============================== data.js ==============================
   Every figure on the page is derived here from the fixtures, at load. A session's cost is its
   ledger flows priced at its model's list price (fixtures/prices.json). The four sessions with a
   transcript get their flows from their own events, request by request, through the same ledger
   as the generated ones (gen-sessions.mjs). Spend sums session rows, so every grouping adds up to
   the month total by construction. */
var PRICES = F.PRICES, AGENTS = F.AGENTS, HARNESSES = F.HARNESSES, SERVERS = F.SERVERS.servers, STEERING = F.STEERING;
var LEDGER_F = { HARNESSES: HARNESSES, SERVERS: F.SERVERS, STEERING: STEERING };
var FLAGSHIP = "ses_01K5RS7M2E8FJ3QW";

function agentBy(key) { for (var i = 0; i < AGENTS.length; i++) if (AGENTS[i].key === key) return AGENTS[i]; return null; }
function serverBy(id) { for (var i = 0; i < SERVERS.length; i++) if (SERVERS[i].id === id) return SERVERS[i]; return null; }
function priceOf(model) { return PRICES[model]; }
function modelLabel(model) { return (PRICES[model] || { label: model }).label; }

/* A tool's mode after any change made on the page. */
function toolMode(serverId, t) { var k = serverId + "." + t.n; return S.toolMode[k] || t.mode; }

/* ---- transcripts: events → ledger steps → requests ---- */
function transcriptSteps(T, events) {
  var agent = agentBy(T.agent), steps = Ledger.context0(agent, LEDGER_F).map(function (c) { return { add: c }; });
  var calls = {};
  events.forEach(function (e) {
    if (e.k === "call") calls[e.id] = e;
    if (e.k === "prompt" || e.k === "steer") steps.push({ add: ["prompt", e.tok] });
    else if (e.k === "req") steps.push({ req: e.out, n: e.n, t: e.t });
    else if (e.k === "res") {
      var c = calls[e.id], key = e.src;
      if (c && c.tool.kind === "skill") key = "skill:" + c.tool.name;
      else if (/^mcp:/.test(key)) key = key + "#res";
      steps.push({ add: [key, e.tok] });
    }
  });
  return steps;
}
/* The events a transcript holds right now: its fixture, plus the answer to its question when a
   person answered it on this page. */
function transcriptEvents(T) {
  var ans = S.answered[T.id];
  if (!ans) return T.events;
  var ask = T.events.filter(function (e) { return e.k === "ask"; })[0];
  var tail = (ans.verdict === "approve" ? T.onApprove : T.onDeny).map(function (e) {
    var c = {}; for (var k in e) if (k !== "dt") c[k] = e[k];
    c.t = ans.t + e.dt; return c;
  });
  return T.events.concat([{ t: ans.t, k: "answer", id: ask.id, verdict: ans.verdict, by: ME, via: "oxagen" }]).concat(tail);
}
function transcriptLedger(T) {
  var ev = transcriptEvents(T), led = Ledger.run(transcriptSteps(T, ev)), p = priceOf(T.model);
  led.reqs.forEach(function (q) { q.cost = Ledger.reqCost(q, p); });
  return led;
}
function transcriptStatus(T) {
  var ans = S.answered[T.id];
  if (T.status === "needs-you" && ans) return "done";
  return T.status;
}

/* ---- sessions: the generated month, the four transcripts, and any sent from this page ---- */
function sessionFromTranscript(T) {
  var led = transcriptLedger(T), ev = transcriptEvents(T), last = ev[ev.length - 1];
  var calls = {}, byId = {};
  ev.forEach(function (e) {
    if (e.k === "call") byId[e.id] = e;
    if (e.k === "call" && e.tool.kind === "mcp") { var k = e.tool.server + "." + e.tool.name; calls[k] = (calls[k] || 0) + 1; }
  });
  var status = transcriptStatus(T), live = status === "running" || status === "needs-you";
  var elapsed = live ? (NOW - dt(T.started)) / 1000 : last.t;
  return {
    id: T.id, title: T.title, agent: T.agent, person: T.person, started: T.started, dur: elapsed, status: status,
    wi: T.wi ? { key: T.wi, src: workBy(T.wi) ? workBy(T.wi).src : "github", title: workBy(T.wi) ? workBy(T.wi).title : T.title } : null,
    req: led.reqs.length, out: led.out, flows: led.flows, calls: calls, transcript: true, basis: T.basis,
  };
}
function workBy(key) { for (var i = 0; i < F.WORK.length; i++) if (F.WORK[i].key === key) return F.WORK[i]; return null; }
function transcriptBy(id) { return F.TRANSCRIPTS[id] || S.sentTranscripts && S.sentTranscripts[id] || null; }

var _sessions = null, _sessionsKey = "";
function sessions() {
  var key = JSON.stringify(S.answered) + "|" + Object.keys(S.sent).join(",") + "|" + S.empty;
  if (_sessions && key === _sessionsKey) return _sessions;
  if (S.empty) { _sessions = []; _sessionsKey = key; return _sessions; }
  var rows = F.SESSIONS.map(function (s) { var c = {}; for (var k in s) c[k] = s[k]; c.basis = agentBy(s.agent).harness === "cursor" ? "harness" : "gateway"; return c; });
  Object.keys(F.TRANSCRIPTS).forEach(function (id) { rows.push(sessionFromTranscript(F.TRANSCRIPTS[id])); });
  Object.keys(S.sent).forEach(function (k) { rows.push(S.sent[k].session); });
  rows.forEach(function (s) {
    var a = agentBy(s.agent);
    s.model = a.model; s.harness = a.harness;
    s.cost = Ledger.cost(s.flows, s.out, priceOf(a.model));
    s.tokens = Object.keys(s.flows).reduce(function (t, k) { return t + s.flows[k][0] + s.flows[k][1]; }, 0) + s.out;
  });
  rows.sort(function (a, b) { return a.started < b.started ? 1 : -1; });
  _sessions = rows; _sessionsKey = key;
  return rows;
}
function sessionBy(id) { var all = sessions(); for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i]; return null; }
function isLive(s) { return s.status === "running" || s.status === "needs-you" || s.status === "starting"; }

/* ---- where a session's money went: sources folded into the rows a person reads ---- */
function sourceGroup(src, harness) {
  if (src === "output") return { key: "output", label: "Model output" };
  if (src === "system" || src === "tools") return { key: "harness", label: hxLabel(harness) + " prompt and tools" };
  if (src === "steering" || /^skill:/.test(src)) return { key: "steering", label: "Steering" };
  if (/^mcp:/.test(src)) { var sv = serverBy(src.slice(4)); return { key: src, label: (sv ? sv.name : src.slice(4)) + " server", server: src.slice(4) }; }
  if (src === "local") return { key: "local", label: "Files and commands" };
  return { key: "conversation", label: "Conversation" };
}
function whereItWent(by, harness) {
  var rows = {}, order = [];
  Object.keys(by).forEach(function (src) {
    var gr = sourceGroup(src, harness);
    if (!rows[gr.key]) { rows[gr.key] = { key: gr.key, label: gr.label, cost: 0, server: gr.server }; order.push(gr.key); }
    rows[gr.key].cost += by[src];
  });
  return order.map(function (k) { return rows[k]; }).sort(function (a, b) { return b.cost - a.cost; });
}

/* ---- Spend: one month, five groupings ---- */
function monthTotal() { return sessions().reduce(function (t, s) { return t + s.cost.total; }, 0); }
var SPEND_BY = [
  { key: "work", label: "Work item" }, { key: "agent", label: "Agent" }, { key: "person", label: "Person" },
  { key: "model", label: "Model" }, { key: "server", label: "MCP server" },
];
function spendRows(by) {
  var map = {}, order = [], all = sessions();
  function row(key, label, extra) {
    if (!map[key]) { map[key] = { key: key, label: label, cost: 0, sessions: [], tokens: 0 }; for (var k in extra || {}) map[key][k] = extra[k]; order.push(key); }
    return map[key];
  }
  if (by === "server") {
    var total = 0;
    all.forEach(function (s) {
      Object.keys(s.cost.by).forEach(function (src) {
        if (!/^mcp:/.test(src)) return;
        var id = src.slice(4), sv = serverBy(id), r = row(id, sv ? sv.name : id, { server: id });
        r.cost += s.cost.by[src]; total += s.cost.by[src];
        if (r.sessions[r.sessions.length - 1] !== s) r.sessions.push(s);
        r.tokens += s.flows[src][0] + s.flows[src][1];
      });
    });
    var rest = row("_rest", "Everything else", { rest: true });
    rest.cost = monthTotal() - total;
    rest.note = "Model output, prompts, steering, files and commands";
  } else {
    all.forEach(function (s) {
      var r;
      if (by === "agent") { var a = agentBy(s.agent); r = row(a.key, a.name, { agent: a }); }
      else if (by === "person") r = row(s.person, personName(s.person), { person: s.person });
      else if (by === "model") r = row(s.model, modelLabel(s.model), { model: s.model });
      else r = s.wi ? row(s.wi.key, s.wi.title, { wi: s.wi }) : row("_none", "No work item", { none: true, note: "Sessions started in a terminal" });
      r.cost += s.cost.total; r.sessions.push(s); r.tokens += s.tokens;
    });
  }
  return order.map(function (k) { return map[k]; }).sort(function (a, b) {
    if (a.rest) return 1; if (b.rest) return -1;
    return b.cost - a.cost;
  });
}
function dailySpend() {
  var days = [], from = new Date(F.ORG.month.from + "T00:00:00"), to = new Date(F.ORG.month.to + "T00:00:00");
  for (var d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) days.push({ date: new Date(d), cost: 0 });
  sessions().forEach(function (s) {
    var sd = dt(s.started), i = Math.round((new Date(sd.getFullYear(), sd.getMonth(), sd.getDate()) - from) / 864e5);
    if (days[i]) days[i].cost += s.cost.total;
  });
  return days;
}

/* ---- MCP servers ---- */
function serverAgents(id) {
  if (S.serverAgents[id]) return S.serverAgents[id];
  return AGENTS.filter(function (a) { return a.servers.indexOf(id) >= 0; }).map(function (a) { return a.key; });
}
function serverStats(id) {
  var sv = serverBy(id), all = sessions(), cost = 0, calls = 0, perTool = {}, reqs = 0, save = 0;
  var unused = sv.tools.filter(function (t) { return toolMode(id, t) !== "off"; });
  all.forEach(function (s) {
    if (s.cost.by["mcp:" + id]) cost += s.cost.by["mcp:" + id];
    Object.keys(s.calls || {}).forEach(function (k) {
      if (k.indexOf(id + ".") === 0) { calls += s.calls[k]; perTool[k.slice(id.length + 1)] = (perTool[k.slice(id.length + 1)] || 0) + s.calls[k]; }
    });
  });
  unused = unused.filter(function (t) { return !perTool[t.n]; });
  var unusedTok = unused.reduce(function (a, t) { return a + t.tok; }, 0);
  // Turning an unused tool off takes its definition out of every request of every session that
  // carries this server. The ledger writes it once, on the first request, at the cache-write price,
  // and every later request re-reads it at the cache-read price.
  all.forEach(function (s) {
    if (!s.flows["mcp:" + id]) return;
    var p = priceOf(s.model);
    reqs += s.req;
    save += unusedTok * (p.cw + (s.req - 1) * p.cr) / 1e6;
  });
  var defTok = sv.tools.reduce(function (a, t) { return a + (toolMode(id, t) === "off" ? 0 : t.tok); }, 0);
  return { cost: cost, calls: calls, perTool: perTool, unused: unused, unusedTok: unusedTok, save: save, defTok: defTok, reqs: reqs };
}

/* ---- Steering ---- */
function steeringItems() {
  var items = STEERING.items.slice();
  STEERING.suggestions.forEach(function (s) { if (S.accepted[s.id]) items.push({ id: s.id, kind: s.kind, text: s.text, tok: s.tok, agents: "all", by: ME, edited: F.ORG.now.slice(0, 10), version: 1, fresh: true }); });
  return items;
}
function steeringStats(item) {
  var all = sessions(), cost = 0, n = 0;
  // An item added on this page reaches the next session. No recorded session carried it.
  if (item.fresh) return { cost: 0, sessions: 0 };
  all.forEach(function (s) {
    var a = agentBy(s.agent);
    if (item.kind === "skill") {
      var c = s.cost.by["skill:" + item.id];
      if (c) { cost += c; n++; }
      return;
    }
    if (item.agents !== "all" && item.agents.indexOf(a.key) < 0) return;
    var total = Ledger.steeringFor(a, LEDGER_F).reduce(function (t, i) { return t + i.tok; }, 0);
    if (s.cost.by.steering && total) cost += s.cost.by.steering * item.tok / total;
    n++;
  });
  return { cost: cost, sessions: n };
}
/* The steering an agent's next session starts with: what its recorded sessions got, plus any item
   added on this page. Pricing uses Ledger.steeringFor alone, because no recorded session had the rest. */
function steeringNext(agent) {
  return Ledger.steeringFor(agent, LEDGER_F).concat(steeringItems().filter(function (i) { return i.fresh && (i.agents === "all" || i.agents.indexOf(agent.key) >= 0); }));
}
function suggestionFixup(sug) {
  // What the lint fix-up cost in the session that prompted the suggestion: the requests it names.
  var T = F.TRANSCRIPTS[sug.from.session], led = transcriptLedger(T);
  return led.reqs.filter(function (q) { return (sug.from.fixup || []).indexOf(q.n) >= 0; }).reduce(function (t, q) { return t + q.cost.total; }, 0);
}

/* ---- Work ---- */
function workItems() {
  if (S.empty) return [];
  return F.WORK.map(function (w) {
    var c = {}; for (var k in w) c[k] = w[k];
    if (S.sent[w.key]) { c.state = "running"; c.agent = S.sent[w.key].agent; c.session = S.sent[w.key].session.id; }
    if (w.session && S.answered[w.session]) { c.state = "review"; if (S.answered[w.session].verdict === "approve") c.release = "v4.11.0"; else c.held = "v4.11.0"; }
    return c;
  });
}
/* Done work: the work items of this month's finished sessions that are no longer open. */
function doneWork() {
  var open = {}, map = {}, out = [];
  F.WORK.forEach(function (w) { open[w.key] = 1; });
  sessions().forEach(function (s) {
    if (!s.wi || open[s.wi.key] || s.status !== "done" || /^Review: /.test(s.wi.title)) return;
    if (!map[s.wi.key]) { map[s.wi.key] = { key: s.wi.key, src: s.wi.src, title: s.wi.title, sessions: [], cost: 0, agent: s.agent, last: s.started }; out.push(map[s.wi.key]); }
    map[s.wi.key].sessions.push(s); map[s.wi.key].cost += s.cost.total;
  });
  return out.sort(function (a, b) { return a.last < b.last ? 1 : -1; });
}
function workCost(key) { return sessions().filter(function (s) { return s.wi && s.wi.key === key; }).reduce(function (t, s) { return t + s.cost.total; }, 0); }

/* What a person needs to act on: a session waiting on a question. */
function needsYou() { return sessions().filter(function (s) { return s.status === "needs-you"; }); }
