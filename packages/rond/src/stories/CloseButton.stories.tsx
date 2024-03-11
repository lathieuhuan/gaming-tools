import type { Meta, StoryObj } from "@storybook/react";
import { CloseButton } from "@lib/components";

const meta = {
  title: "CloseButton",
  component: CloseButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["small", "medium", "large", "custom"] },
  },
} satisfies Meta<typeof CloseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    circled: false,
    size: "medium",
  },
};
