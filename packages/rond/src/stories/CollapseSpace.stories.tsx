import type { Meta, StoryObj } from "@storybook/react";

import { CollapseSpace } from "@lib/components";

const meta = {
  title: "CollapseSpace",
  component: CollapseSpace,
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  tags: ["autodocs"],
} satisfies Meta<typeof CollapseSpace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: true,
    children: (
      <div style={{ width: 360, height: 120, background: "red" }}>
        <p>Content</p>
      </div>
    ),
  },
};
