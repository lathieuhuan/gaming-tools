import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "@lib/components";

const meta = {
  title: "Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: { control: "select", options: ["info", "success", "error", "warn"] },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "info",
    content: "Hello World",
    style: {
      minWidth: 300,
    },
  },
};
