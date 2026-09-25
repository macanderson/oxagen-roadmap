#!/usr/bin/env node
// `pnpm dev`: Storybook on :6006 and Mission Control on :4400, together. Mission Control is
// rebuilt from mockups/src and mockups/fixtures on every request, so a reload shows an edit.
// Extra arguments go to Storybook (`pnpm dev --no-open`). Ctrl-C stops both.
//
//   http://localhost:4400/                                         rev1, the authoritative design
//   http://localhost:4400/future_state_mockups/missioncontrol.html the first version
//   http://localhost:4400/v2/missioncontrol.html                   the shelved redesign
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mockupMiddleware } from "../.storybook/mockup-plugin.mjs";

const PORT = Number(process.env.MISSIONCONTROL_PORT || 4400);

const server = createServer((req, res) => {
  if (req.url === "/" || req.url?.startsWith("/?")) req.url = "/missioncontrol.html" + req.url.slice(1);
  try {
    mockupMiddleware(req, res, () => { res.statusCode = 404; res.end("not found"); });
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end(String(err?.stack || err));
  }
});
server.listen(PORT, () => console.log(`Mission Control  http://localhost:${PORT}/`));

const storybook = spawn("pnpm", ["exec", "storybook", "dev", "-p", "6006", ...process.argv.slice(2)], { stdio: "inherit" });

const stop = code => {
  server.close();
  if (storybook.exitCode === null) storybook.kill("SIGTERM");
  process.exit(code);
};
storybook.on("exit", code => stop(code ?? 0));
process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
