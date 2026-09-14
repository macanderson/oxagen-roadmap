// Serves the master mockup to Storybook's dev server without a build: /missioncontrol.html is
// assembled from mockups/src and mockups/fixtures on every request, so the sources are what the
// stories show. The hand-written W13 file is served beside it. The static build gets both files
// copied in by `npm run build-storybook`.
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildMockup, root } from "../tools/build-mockup.mjs";

export function mockupPlugin() {
  return {
    name: "oxagen-mockup",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || "").split("?")[0];
        if (url === "/missioncontrol.html") {
          res.setHeader("content-type", "text/html; charset=utf-8");
          res.end(buildMockup());
          return;
        }
        if (url === "/w13-in-the-loop.html") {
          res.setHeader("content-type", "text/html; charset=utf-8");
          res.end(readFileSync(path.join(root, "mockups/w13-in-the-loop.html")));
          return;
        }
        next();
      });
    },
  };
}
