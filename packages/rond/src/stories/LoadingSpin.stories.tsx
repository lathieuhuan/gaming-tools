import type { Meta, StoryObj } from "@storybook/react";
import { LoadingSpin } from "@lib/components";

const meta = {
  title: "LoadingSpin",
  component: LoadingSpin,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["small", "medium", "large"] },
  },
} satisfies Meta<typeof LoadingSpin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: true,
    size: "medium",
  },
};
