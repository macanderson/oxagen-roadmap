// The canvas is the mockup itself; the frame around it stays out of the way.
export default {
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
    controls: { expanded: true },
    options: {
      storySort: {
        order: ["Mission Control", ["Product", "Workspace", "Organization", "Register", "Onboarding", "Auth"], "Scenarios"],
      },
    },
  },
};
