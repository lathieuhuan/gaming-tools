import type { Meta, StoryObj } from "@storybook/react";
import { Radio } from "@lib/components";

const meta = {
  title: "Radio",
  component: Radio,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["small", "medium", "large"] },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "small",
    checked: false,
  },
};
