// One outline page per SCENARIOS entry in ../mockups/src/engine.js, written to
// .generated/content/scenarios/. The engine stays the source: the SCENARIOS block is evaluated in a
// vm sandbox with the dataset the build inlines (FIXTURES, from mockups/fixtures), and any global it
// reaches for that the block does not define (render helpers, state) is stood in by an inert
// value, so a step's text is exactly what the scenario rail shows.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { pathToFileURL } from "node:url";
import { fixtures } from "../../tools/build-mockup.mjs";
import { GEN_CONTENT, ORG, REPO, mdxText, mockHref, readPages, readScenarioCatalog, writeGenerated, yamlString } from "./lib.mjs";

const ENGINE = "mockups/src/engine.js";

/** A value that absorbs any property read, call or write and prints as an ellipsis. */
function inert() {
  const target = function () {};
  return new Proxy(target, {
    get(_t, key) {
      if (key === Symbol.toPrimitive || key === "toString" || key === "valueOf") return () => "…";
      if (typeof key === "symbol") return undefined;
      return inert();
    },
    apply: () => inert(),
    construct: () => inert(),
    set: () => true,
  });
}

/** The statement starting at line `start`, grown line by line until it parses. */
function statementAt(lines, start) {
  for (let end = start + 1; end <= Math.min(lines.length, start + 600); end++) {
    const code = lines.slice(start, end).join("\n");
    try {
      new vm.Script(code);
      return code;
    } catch {
      /* keep growing */
    }
  }
  throw new Error(`engine.js: the statement at line ${start + 1} never parses`);
}

const missingName = (err) => (err?.name === "ReferenceError" ? /^(\S+) is not defined/.exec(err.message ?? "")?.[1] : undefined);

/**
 * Evaluates the SCENARIOS block. A global the block reaches for is first looked up as a top-level
 * `function NAME(` or `var|let|const NAME =` statement in engine.js and evaluated for real (so a
 * step's text carries the demo record's values); a name with no such statement, or whose statement
 * cannot run outside the browser, gets an inert stand-in. With `real: false` every missing global
 * is inert, which is the fallback when the real definitions do not hold together.
 */
const FIXTURE_DATA = fixtures();

function evaluate(lines, start, end, real) {
  const block = `${lines.slice(start, end).join("\n")}\n;__out.value = SCENARIOS;`;
  const definitionOf = (name) => {
    if (!real) return undefined;
    const esc = name.replace(/[$]/g, "\\$");
    const i = lines.findIndex((l, n) => (n < start || n >= end) && new RegExp(`^(function\\s+${esc}\\s*\\(|(var|let|const)\\s+${esc}\\s*=)`).test(l));
    if (i < 0) return undefined;
    try {
      return statementAt(lines, i);
    } catch {
      return undefined;
    }
  };
  const prelude = []; // [name, code], dependencies first
  const stood = new Set();
  const learn = (name, before) => {
    const code = stood.has(name) || prelude.some(([n]) => n === name) ? undefined : definitionOf(name);
    if (code) prelude.splice(before ?? prelude.length, 0, [name, code]);
    else stood.add(name);
  };
  const deadline = Date.now() + 60_000;
  for (let attempt = 0; attempt < 2000 && Date.now() < deadline; attempt++) {
    const out = {};
    const ctx = { __out: out, FIXTURES: FIXTURE_DATA };
    for (const name of stood) ctx[name] = inert();
    vm.createContext(ctx);
    let restart = false;
    for (let p = 0; p < prelude.length && !restart; p++) {
      const [name, code] = prelude[p];
      try {
        vm.runInContext(code, ctx, { filename: `engine.js#${name}`, timeout: 5000 });
      } catch (err) {
        const missing = missingName(err);
        if (missing && missing !== name && !stood.has(missing) && !prelude.some(([n]) => n === missing)) learn(missing, p);
        else {
          prelude.splice(p, 1);
          stood.add(name);
        }
        restart = true;
      }
    }
    if (restart) continue;
    try {
      vm.runInContext(block, ctx, { filename: "engine.js#SCENARIOS", timeout: 5000 });      return { scenarios: out.value, ctx, learn: (name) => defineInto(ctx, name, definitionOf(name)) };
    } catch (err) {
      const missing = missingName(err);
      if (missing && !stood.has(missing)) {
        learn(missing);
        continue;
      }
      // A real definition that does not hold together outside the browser (a lookup that returns
      // nothing here): the most recently learned one gives way to a stand-in, and the block reruns.
      const last = prelude.pop();
      if (last) {
        stood.add(last[0]);
        continue;
      }
      throw new Error(`engine.js: SCENARIOS did not evaluate: ${err?.message ?? err}`);
    }
  }
  throw new Error("engine.js: SCENARIOS reaches for too many undefined globals");
}

/** Late definition for a global a step function reaches for when it is called. */
function defineInto(ctx, name, code) {
  if (code) {
    try {
      vm.runInContext(code, ctx, { filename: `engine.js#${name}`, timeout: 5000 });
      if (name in ctx) return;
    } catch {
      /* falls through to the stand-in */
    }
  }
  ctx[name] = inert();
}

export function loadScenarios() {
  const lines = fs.readFileSync(path.join(REPO, ENGINE), "utf8").split("\n");
  const start = lines.findIndex((l) => /^var SCENARIOS\s*=\s*\{/.test(l));
  const end = lines.findIndex((l, i) => i > start && /^function scnHref\(/.test(l));
  if (start < 0 || end < 0) throw new Error('engine.js: SCENARIOS block not found (it opens with "var SCENARIOS={" and ends before "function scnHref(")');
  try {
    return evaluate(lines, start, end, true);
  } catch {
    return evaluate(lines, start, end, false);
  }
}

/** Calls a step function in the sandbox, defining any global it reaches for on the way. */
function callStep(loaded, fn, ...args) {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      return fn(...args);
    } catch (err) {
      const missing = missingName(err);
      if (!missing || (missing in loaded.ctx && attempt > 0)) return null;
      loaded.learn(missing);
    }
  }
  return null;
}

const decode = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
const stripTags = (s) => decode(String(s).replace(/<[^>]+>/g, ""));

/** Scenario rail HTML (mono spans, entities) as MDX text. */
function railToMdx(html) {
  const s = String(html ?? "");
  let out = "";
  let last = 0;
  for (const m of s.matchAll(/<span class="mono">([\s\S]*?)<\/span>|<code>([\s\S]*?)<\/code>/g)) {
    out += mdxText(stripTags(s.slice(last, m.index)));
    out += "`" + stripTags(m[1] ?? m[2]).replace(/`/g, "'") + "`";
    last = m.index + m[0].length;
  }
  return (out + mdxText(stripTags(s.slice(last)))).trim();
}

/** The generated page a step's route renders. */
function pageForRoute(route, pages) {
  if (!route || typeof route.page !== "string") return null;
  const has = (id) => pages.find((p) => p.id === id);
  if (route.page === "welcome") {
    const byStep = {
      signup: "signup", verify: "verify-email", login: "login", "two-factor": "two-factor", forgot: "forgot-password",
      reset: "reset-password", invite: "accept-invitation", organization: "onboarding-organization", wrap: "onboarding-wrap",
      run: "onboarding-run", installer: "installer",
    };
    return has(byStep[route.step]) ?? null;
  }
  const id = typeof route.id === "string" ? route.id : "";
  // A page file pinned to this exact record (run-interjection is one run) wins over the generic page.
  const pinned = id && pages.find((p) => p.id.startsWith(route.page) && p.hash?.endsWith(`/${id}`) && p.id !== route.page);
  if (pinned) return pinned;
  if (route.page === "skills" && route.ws && route.ws !== "core-platform") return has("skills-off") ?? has("skills");
  return has(route.page) ?? null;
}

export function generateScenarios({ pages = readPages() } = {}) {
  const loaded = loadScenarios();
  const { scenarios } = loaded;
  const wFiles = readScenarioCatalog();
  const ids = Object.keys(scenarios);
  const wOrder = (id) => {
    const i = wFiles.findIndex((w) => w.scenario === id);
    return i === -1 ? wFiles.length + ids.indexOf(id) : i;
  };
  ids.sort((a, b) => wOrder(a) - wOrder(b));
  fs.rmSync(path.join(GEN_CONTENT, "scenarios"), { recursive: true, force: true });

  const summaries = ids.map((id) => {
    const s = scenarios[id];
    const w = wFiles.find((x) => x.scenario === id) ?? null;
    const ws = String(s.ws ?? "core-platform");
    const stepHash = (n) => `#/${ORG}/${ws}/scenarios/${id}/${n}`;
    const steps = (s.steps ?? []).map((step, i) => {
      const route = typeof step.route === "function" ? callStep(loaded, step.route, ORG) : null;
      const setup = typeof step.setup === "function" ? step.setup.toString() : "";
      const tabs = [...setup.matchAll(/S\.tab\.(\w+)\s*=\s*"([\w-]+)"/g)].map((m) => m[2]);
      return {
        n: i + 1,
        page: pageForRoute(route, pages),
        tabs,
        say: railToMdx(step.say),
        note: step.note ? railToMdx(step.note) : "",
        act: Array.isArray(step.act) ? stripTags(step.act[0]) : "",
        hash: stepHash(i + 1),
      };
    });

    const open = (n) => mockHref({ product: false, hash: stepHash(n) });
    const body = [
      "---",
      `title: ${yamlString(stripTags(s.title))}`,
      `description: ${yamlString(stripTags(s.blurb ?? ""))}`,
      "---",
      "",
      `**Workspace** \`${ws}\` · **Steps** ${steps.length}${w ? ` · **Flow** ${w.label}` : ""}`,
      "",
      `[${w ? `Open ${w.label} · ${mdxText(w.title)}` : "Open the scenario"}](${open(1)})`,
      "",
      "## Steps",
      "",
      ...steps.flatMap((st) => {
        const pageLinks = st.page
          ? `[${mdxText(st.page.title)} spec](/pages/${st.page.id}/) · [desktop mock](${mockHref({ state: "loaded", mobile: false, hash: st.page.hash })}) · [mobile mock](${mockHref({ state: "loaded", mobile: true, hash: st.page.hash })})`
          : "no catalogued page";
        return [
          `### ${st.n}. ${st.page ? mdxText(st.page.shortTitle) : "Step"}`,
          "",
          st.say,
          "",
          ...(st.note ? [`> ${st.note}`, ""] : []),
          `- Page: ${pageLinks}`,
          ...(st.tabs.length ? [`- Tab: ${st.tabs.map((t) => `\`${t}\``).join(", ")}`] : []),
          ...(st.act ? [`- Action on this step: ${mdxText(st.act)}`] : []),
          `- [Open step ${st.n} in the mockup](${open(st.n)})`,
          "",
        ];
      }),
    ].join("\n");
    writeGenerated(`scenarios/${id}.mdx`, body);

    return {
      id,
      title: stripTags(s.title),
      blurb: stripTags(s.blurb ?? ""),
      ws,
      w: w ? { label: w.label, title: w.title } : null,
      steps: steps.map((st) => ({ n: st.n, page: st.page?.id ?? null })),
    };
  });

  const card = (s) =>
    `- [${mdxText(s.title)}](/scenarios/${s.id}/)${s.w ? ` (${s.w.label})` : ""}, ${s.steps.length} steps: ${mdxText(s.blurb)}`;
  writeGenerated(
    "scenarios/index.mdx",
    [
      "---",
      'title: "Scenarios"',
      `description: ${yamlString(`${summaries.length} guided walks through the real screens, read from SCENARIOS in mockups/src/engine.js.`)}`,
      "---",
      "",
      ...summaries.map(card),
      "",
    ].join("\n"),
  );
  return summaries;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const summaries = generateScenarios();
  console.log(`gen-scenarios: ${summaries.length} scenarios → ${path.relative(process.cwd(), path.join(GEN_CONTENT, "scenarios"))}`);
}
