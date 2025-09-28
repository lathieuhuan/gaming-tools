import type { Preview } from "@storybook/react";
import "@lib/styles/index.css";
import "../src/index.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "dark-1",
      values: [
        {
          name: "dark-1",
          value: "#050926",
        },
        {
          name: "dark-2",
          value: "#151a40",
        },
        {
          name: "dark-3",
          value: "#2c315c",
        },
        {
          name: "light",
          value: "#ffffff",
        },
      ],
    },
  },
};

export default preview;
