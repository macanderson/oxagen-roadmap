/* ============================== ledger.js ==============================
   The one accounting rule for every session in v3, shared by the page and by gen-sessions.mjs.

   A session is a list of steps. Each step adds tokens to the context from one source, or makes a
   model request. A request re-reads everything already in the context (billed at the cache-read
   price), writes everything added since the last request (billed at the cache-write price, or the
   input price for a model with no write surcharge), and generates its output. What the model wrote
   joins the context as "conv" for the next request. A compaction keeps the fixed prefix, drops
   the conversation and the tool results, and adds a summary.

   Sources: system and tools (the harness's own prompt and tool list), steering, skill:<id>,
   mcp:<server> (a server's tool definitions and its results), local (file reads, edits and
   commands), prompt (the person's messages), and conv (the model's earlier output). Inside the
   ledger a server's results are keyed mcp:<server>#res so a compaction can drop them and keep the
   definitions. Every figure it returns folds #res back into mcp:<server>. */
var Ledger = (function () {
  var FIXED = { system: 1, tools: 1, steering: 1 };
  function keep(key) { return FIXED[key] === 1 || (/^mcp:/.test(key) && !/#res$/.test(key)); }
  function base(key) { return key.replace(/#res$/, ""); }
  function add(map, key, tok) { map[key] = (map[key] || 0) + tok; }

  /* steps: [{add:[key, tok]}, {req:outTok, t, n}, {compact:summaryTok}]. Returns every request's
     reads and writes by source, the session's flows ({src:[written, read]}), and its output. */
  function run(steps) {
    var prefix = {}, pending = {}, reqs = [], flows = {}, out = 0;
    steps.forEach(function (s) {
      var k;
      if (s.add) { add(pending, s.add[0], s.add[1]); return; }
      if (s.compact != null) {
        var kept = {};
        for (k in prefix) if (keep(k)) kept[k] = prefix[k];
        prefix = kept; pending = {}; add(pending, "conv", s.compact);
        return;
      }
      if (s.req == null) return;
      var read = {}, write = {};
      for (k in prefix) { add(read, base(k), prefix[k]); }
      for (k in pending) { add(write, base(k), pending[k]); add(prefix, k, pending[k]); }
      for (k in read) { flows[k] = flows[k] || [0, 0]; flows[k][1] += read[k]; }
      for (k in write) { flows[k] = flows[k] || [0, 0]; flows[k][0] += write[k]; }
      pending = {}; add(pending, "conv", s.req); out += s.req;
      reqs.push({ n: s.n || reqs.length + 1, t: s.t, read: read, write: write, out: s.req });
    });
    return { reqs: reqs, flows: flows, out: out };
  }

  /* Price a session's flows at a model's list price, in USD per million tokens: {out, cw, cr}. */
  function cost(flows, out, p) {
    var by = { output: out * p.out / 1e6 }, total = by.output;
    for (var src in flows) {
      var c = (flows[src][0] * p.cw + flows[src][1] * p.cr) / 1e6;
      by[src] = (by[src] || 0) + c; total += c;
    }
    return { total: total, by: by };
  }

  /* One request's cost, split the same way. */
  function reqCost(q, p) {
    var by = { output: q.out * p.out / 1e6 }, total = by.output, k, c;
    for (k in q.read) { c = q.read[k] * p.cr / 1e6; by[k] = (by[k] || 0) + c; total += c; }
    for (k in q.write) { c = q.write[k] * p.cw / 1e6; by[k] = (by[k] || 0) + c; total += c; }
    return { total: total, by: by };
  }

  /* What an agent's context holds before its first prompt: the harness's prompt and tools, the
     definitions of every tool its MCP servers leave on, and the steering delivered every session
     (instructions, rules and memories; a skill loads only when the session uses it). */
  function context0(agent, F) {
    var h = F.HARNESSES[agent.harness], out = [["system", h.system], ["tools", h.tools]];
    agent.servers.forEach(function (id) {
      var s = F.SERVERS.servers.filter(function (x) { return x.id === id; })[0];
      var tok = s.tools.reduce(function (a, t) { return a + (t.mode === "off" ? 0 : t.tok); }, 0);
      out.push(["mcp:" + id, tok]);
    });
    out.push(["steering", steeringFor(agent, F).reduce(function (a, i) { return a + i.tok; }, 0)]);
    return out;
  }
  /* The steering items delivered to an agent at the start of every session. */
  function steeringFor(agent, F) {
    return F.STEERING.items.filter(function (i) {
      return i.kind !== "skill" && (i.agents === "all" || i.agents.indexOf(agent.key) >= 0);
    });
  }

  return { run: run, cost: cost, reqCost: reqCost, context0: context0, steeringFor: steeringFor };
})();
