import type { Meta, StoryObj } from "@storybook/react-vite";
import { Rarity } from "@lib/components";

const meta = {
  title: "Rarity",
  component: Rarity,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["small", "medium", "large"] },
  },
} satisfies Meta<typeof Rarity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "medium",
    value: 4,
  },
};

export const Mutable: Story = {
  args: {
    size: "medium",
    value: 4,
    mutable: {
      max: 5,
      min: 0,
    },
  },
};
