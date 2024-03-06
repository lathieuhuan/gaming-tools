import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "@lib/components";

const meta = {
  title: "Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Checkbox",
  },
};
