import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@lib/components";

const meta = {
  title: "Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    size: { control: "select", options: ["small", "medium", "large"] },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    disabled: false,
    size: "small",
  },
};
