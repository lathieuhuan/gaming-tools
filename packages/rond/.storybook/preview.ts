import type { Preview } from "@storybook/react-vite";
import "@lib/style.css";
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
      options: {
        dark1: { name: 'Dark 1', value: 'var(--color-dark-1)' },
        dark2: { name: 'Dark 2', value: 'var(--color-dark-2)' },
        dark3: { name: 'Dark 3', value: 'var(--color-dark-3)' },
        light: { name: 'Light', value: 'var(--color-light-1)' },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'dark1' },
  }
};

export default preview;
