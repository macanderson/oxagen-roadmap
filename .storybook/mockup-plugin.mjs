// Serves the master mockup to Storybook's dev server without a build: /missioncontrol.html is
// assembled from mockups/src and mockups/fixtures on every request, so the sources are what the
// stories show. The static build gets it written in by `npm run build-storybook`.
import { buildMockup } from "../tools/build-mockup.mjs";

import { buildMockupV2 } from "../tools/build-mockup-v2.mjs";
import { buildMockupFuture } from "../tools/build-mockup-future.mjs";

export function mockupPlugin() {
  return {
    name: "oxagen-mockup",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || "").split("?")[0];
        if (url === "/v2/missioncontrol.html") {
          res.setHeader("content-type", "text/html; charset=utf-8");
          res.end(buildMockupV2());
          return;
        }
        if (url === "/future_state_mockups/missioncontrol.html") {
          res.setHeader("content-type", "text/html; charset=utf-8");
          res.end(buildMockupFuture());
          return;
        }
        if (url === "/missioncontrol.html") {
          res.setHeader("content-type", "text/html; charset=utf-8");
          res.end(buildMockup());
          return;
        }
        next();
      });
    },
  };
}
