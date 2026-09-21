#!/usr/bin/env node
// The hosted functions' auth layer, as pure functions.
//
// This is the part of the deployment where a mistake is silent: a cookie parser that mishandles a
// value, or a comparison that says yes on the empty string, opens the roadmap's writes and its
// model budget to anyone with the link. None of it needs a browser or a network, so it is checked
// here rather than trusted.
//
//   node tools/check-api.mjs
import { readFile } from "node:fs/promises";
import { cookies, passwordOk, signedIn, SESSION_COOKIE, PASSWORD_HEADER } from "../api/_lib.js";
import { draftParams } from "../api/_model.js";

let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log("FAIL " + m); } };
const req = (headers) => ({ headers });

// --- cookie parsing -------------------------------------------------------
ok(cookies("a=1; b=2").a === "1" && cookies("a=1; b=2").b === "2", "two cookies parse");
ok(cookies("").rm_session === undefined, "an empty header yields no cookies");
ok(cookies(undefined).rm_session === undefined, "a missing header yields no cookies");
// Set-Cookie percent-encodes the value, so the parser has to decode it back.
ok(cookies(`${SESSION_COOKIE}=${encodeURIComponent("p@ss w/rd=;")}`)[SESSION_COOKIE] === "p@ss w/rd=;", "an encoded value round-trips");
// A value containing "=" must keep everything after the first one.
ok(cookies("x=a=b=c").x === "a=b=c", "only the first = splits");
ok(cookies("novalue; y=2").y === "2", "a malformed pair does not eat the next one");

// --- the password comparison ---------------------------------------------
const WAS = process.env.ROADMAP_PASSWORD;
delete process.env.ROADMAP_PASSWORD;
ok(passwordOk("") === false, "no password set, empty guess refused");
ok(passwordOk("anything") === false, "no password set, every guess refused");
ok(signedIn(req({ cookie: `${SESSION_COOKIE}=anything` })) === false, "no password set, a cookie is not enough");

process.env.ROADMAP_PASSWORD = "correct horse";
ok(passwordOk("correct horse") === true, "the right password passes");
ok(passwordOk("correct hors") === false, "a shorter guess is refused without throwing");
ok(passwordOk("correct horses") === false, "a longer guess is refused without throwing");
ok(passwordOk("CORRECT HORSE") === false, "case matters");
ok(passwordOk("") === false, "an empty guess is refused");
ok(passwordOk(undefined) === false, "a missing guess is refused");

// --- signedIn reads both carriers ----------------------------------------
ok(signedIn(req({ cookie: `${SESSION_COOKIE}=${encodeURIComponent("correct horse")}` })) === true, "the session cookie signs in");
ok(signedIn(req({ [PASSWORD_HEADER]: "correct horse" })) === true, "the header signs in, for scripts with no cookie jar");
ok(signedIn(req({})) === false, "a bare request is signed out");
ok(signedIn(req({ cookie: "other=1" })) === false, "an unrelated cookie is signed out");
ok(signedIn(req({ cookie: `${SESSION_COOKIE}=wrong`, [PASSWORD_HEADER]: "correct horse" })) === true, "a stale cookie does not veto a good header");

// An OpenRouter key is not the password. /api/session names that mistake, and it must never pass.
ok(passwordOk("sk-or-v1-" + "0".repeat(64)) === false, "an OpenRouter key is not the password");

if (WAS === undefined) delete process.env.ROADMAP_PASSWORD; else process.env.ROADMAP_PASSWORD = WAS;

// --- the drafting request -------------------------------------------------
// Kimi spends its thinking out of max_tokens. With thinking on, a 700-token budget went entirely
// to reasoning, the reply came back empty, and every decision record silently fell to the template.
const dp = draftParams({ system: "s", prompt: "p" });
ok(dp.reasoning?.enabled === false, "a draft asks for no reasoning, so the budget buys the answer");
ok(dp.max_tokens >= 1200, "a draft has room even if a provider ignores the reasoning switch");
ok(dp.messages.length === 2 && dp.messages[0].role === "system" && dp.messages[1].role === "user", "a draft is one system turn and one user turn");
ok(typeof dp.model === "string" && dp.model.length > 0, "a draft names a model");
ok(draftParams({ tier: "nonsense", prompt: "p" }).model === dp.model, "an unknown tier falls back rather than sending undefined");

// K3 does not answer this deployment's tool payload. It thinks and never writes: 816 seconds,
// 20,000 reasoning tokens, zero content, on 2026-09-20. Bounding the thinking did not help and
// switching it off made it emit control tokens as prose. Pinning it again is the way the drawer
// hangs, so the pin is checked rather than remembered.
const cfg = await readFile(new URL("../api/_model.js", import.meta.url), "utf8");
ok(!/model: process\.env\.[A-Z_]+ \|\| "moonshotai\/kimi-k3"/.test(cfg), "no tier defaults to K3, which never finishes a round with tools");

// --- the recorder's prompt keeps its limits -------------------------------
// The comment goes onto a real issue under the decider's name, so the model's licence is the
// wording and nothing else. An earlier draft added "No further changes to the integration are
// needed" to a decision that said no such thing. These three rules are what stopped that.
const rec = await readFile(new URL("../api/record-decision.js", import.meta.url), "utf8");
const SYSTEM = rec.split("const SYSTEM = `")[1]?.split("`;")[0] || "";
ok(SYSTEM.length > 0, "the recorder has a system prompt");
ok(/Every clause restates something in the decision text/.test(SYSTEM), "the prompt forbids inventing a consequence");
ok(/No closing or summary sentence/.test(SYSTEM), "the prompt forbids the closing sentence the invention arrives in");
ok(/Name no actor the decision does not name/.test(SYSTEM), "the prompt forbids inventing who decided");
ok(/Never claim the work is done/.test(SYSTEM), "the prompt forbids calling the build finished");

// --- nothing is allowed to wait forever -----------------------------------
// The drawer hung on "Thinking..." with no error because two waits were unbounded: the function
// waited on an upstream that had gone quiet, and the page waited on a tool that was waiting on a
// person. Both are timed now, and both say which one it was.
const ask = await readFile(new URL("../api/ask.js", import.meta.url), "utf8");
ok(/res\.flushHeaders\?\.\(\)/.test(ask), "headers go out before the first token, so a tool-only round is not silent");
ok(/setInterval\(.*": ping\\n\\n"/s.test(ask), "the function heartbeats while the model thinks");
ok(/FIRST_BYTE_MS\s*=\s*\d+/.test(ask) && /IDLE_MS\s*=\s*\d+/.test(ask) && /ROUND_MS\s*=\s*\d+/.test(ask), "the round is bounded three ways");
ok(/code = "timeout"/.test(ask), "a timeout reaches the page as its own code, not as a generic failure");
ok(/clearInterval\(beat\)/.test(ask), "the heartbeat is cleared when the round ends");
// OpenRouter writes ": OPENROUTER PROCESSING" while it waits on a provider. A watchdog reset by any
// byte is reset forever by a model that never writes a token, which is exactly the hang being fixed.
ok(!/if \(done\) break;\s*alive\(\);/.test(ask), "a keep-alive byte does not count as the model making progress");
ok(/JSON\.parse\(raw\); } catch { continue; }\s*alive\(\);/.test(ask), "only a parsed chunk resets the watchdog");

// --- the page and the functions agree on the names ------------------------
const app = await readFile(new URL("../roadmap/app.html", import.meta.url), "utf8");
ok(!/x-edit-key|S\.editKey|EDIT_KEY/.test(app), "the page carries no trace of the old edit key");
ok(app.includes('fetch("/api/session"'), "the page signs in through /api/session");
ok(app.includes('fetch("/api/record-decision"'), "the page records decisions through /api/record-decision");
// The password must never be written to storage: an httpOnly cookie is the whole point.
ok(!/lsSet\(\s*["'`]rm\.(password|pw)/.test(app), "the page never stores the password");
ok(/waits: "A draft issue is open/.test(app), "the tool that waits for a person says what it waits for");
ok(/Waiting for you/.test(app), "the status line names the wait instead of showing a spinner");
ok(/ctx\?\.signal\?\.addEventListener\("abort"/.test(app), "Stop reaches the dialog the round is waiting on");
ok(/timeout: "The model went quiet/.test(app), "a timeout prints a sentence rather than nothing");
ok(/dead = true; ctl\.abort\(\)/.test(app), "the page gives up on a silent socket");
ok(/async function readSse\(body, onEvent\)/.test(app), "the page's reader has no byte-level callback left to feed the watchdog");

console.log(`${passes} checks passed${fails ? `, ${fails} FAILED` : ""}`);
process.exit(fails ? 1 : 0);
