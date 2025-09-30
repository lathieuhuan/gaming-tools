import type { Meta, StoryObj } from "@storybook/react-vite";
import { InputNumber } from "@lib/components";

const meta = {
  title: "InputNumber",
  component: InputNumber,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["small", "medium"] },
    min: { control: "number" },
    max: { control: "number" },
    maxDecimalDigits: { control: "number" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "small",
    min: 0,
    max: 9999,
    maxDecimalDigits: 0,
    disabled: false,
  },
};
