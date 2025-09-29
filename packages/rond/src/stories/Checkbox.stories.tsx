import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "@lib/components";

const meta = {
  title: "Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: { control: "radio", options: ["small", "medium"] },
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
  },
  tags: ["autodocs"],
  render: (args) => {
    return (
      <div style={{ color: "var(--ron-color-on-dark)" }}>
        <Checkbox {...args} />
      </div>
    );
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "small",
    checked: false,
    indeterminate: false,
    disabled: false,
    children: "Checkbox",
  },
};
