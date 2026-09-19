// Storybook is the catalog of mockups/missioncontrol.html: every page in every state in either
// shell, the product build, and every guided scenario, each a story that frames one URL of the
// master file. The master is served fresh from mockups/src and mockups/fixtures on every request
// (see mockup-plugin.mjs), so an edit to the sources shows on reload without a build.
import { mockupPlugin } from "./mockup-plugin.mjs";

export default {
  framework: "@storybook/html-vite",
  stories: ["../mockups/stories/**/*.mdx", "../mockups/stories/**/*.stories.js"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-vitest",
    "@chromatic-com/storybook"
  ],
  core: { disableTelemetry: true },
  async viteFinal(config) {
    config.plugins = [...(config.plugins || []), mockupPlugin()];
    return config;
  },
};
