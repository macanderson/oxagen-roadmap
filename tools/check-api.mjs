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

// --- the page and the functions agree on the names ------------------------
const app = await readFile(new URL("../roadmap/app.html", import.meta.url), "utf8");
ok(!/x-edit-key|S\.editKey|EDIT_KEY/.test(app), "the page carries no trace of the old edit key");
ok(app.includes('fetch("/api/session"'), "the page signs in through /api/session");
ok(app.includes('fetch("/api/record-decision"'), "the page records decisions through /api/record-decision");
// The password must never be written to storage: an httpOnly cookie is the whole point.
ok(!/lsSet\(\s*["'`]rm\.(password|pw)/.test(app), "the page never stores the password");

console.log(`${passes} checks passed${fails ? `, ${fails} FAILED` : ""}`);
process.exit(fails ? 1 : 0);
