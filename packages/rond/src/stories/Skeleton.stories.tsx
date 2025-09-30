import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "@lib/components";

const meta = {
  title: "Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    style: {
      width: 100,
      height: 22,
    },
  },
};
