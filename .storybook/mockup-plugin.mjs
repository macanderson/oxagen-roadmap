// Serves the master mockup to Storybook's dev server without a build: /missioncontrol.html is
// assembled from mockups/src and mockups/fixtures on every request, so the sources are what the
// stories show. The static build gets it written in by `npm run build-storybook`.
import { buildMockup } from "../tools/build-mockup.mjs";

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
        next();
      });
    },
  };
}
