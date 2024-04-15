import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "@lib/components";

const meta = {
  title: "Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    size: { control: "select", options: ["small", "medium"] },
    align: { control: "select", options: ["left", "right"] },
    arrowAt: { control: "select", options: ["start", "end"] },
    value: { control: false },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    disabled: false,
    options: [
      { label: "Option 1", value: 1 },
      { label: "Option 2", value: 2 },
    ],
    defaultValue: 2,
    size: "small",
    align: "left",
    arrowAt: "end",
  },
};
