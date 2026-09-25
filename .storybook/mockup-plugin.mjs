// Serves the master mockup to Storybook's dev server without a build: /missioncontrol.html is
// assembled from mockups/src and mockups/fixtures on every request, so the sources are what the
// stories show. The static build gets it written in by `npm run build-storybook`.
// tools/dev.mjs reuses mockupMiddleware to serve the same files on their own port.
import { buildMockup } from "../tools/build-mockup.mjs";

import { buildMockupV2 } from "../tools/build-mockup-v2.mjs";
import { buildMockupFuture } from "../tools/build-mockup-future.mjs";

const ROUTES = {
  "/missioncontrol.html": buildMockup,
  "/future_state_mockups/missioncontrol.html": buildMockupFuture,
  "/v2/missioncontrol.html": buildMockupV2,
};

export function mockupMiddleware(req, res, next) {
  const build = ROUTES[(req.url || "").split("?")[0]];
  if (!build) return next();
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.end(build());
}

export function mockupPlugin() {
  return {
    name: "oxagen-mockup",
    configureServer(server) {
      server.middlewares.use(mockupMiddleware);
    },
  };
}
