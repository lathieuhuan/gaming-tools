import type { Meta, StoryObj } from "@storybook/react";
import { HiddenSpace } from "@lib/components";

const meta = {
  title: "HiddenSpace",
  component: HiddenSpace,
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  tags: ["autodocs"],
} satisfies Meta<typeof HiddenSpace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: true,
    activeWidth: 360,
    children: (
      <div style={{ height: 120, background: "red" }}>
        <p>Content</p>
      </div>
    ),
  },
};
