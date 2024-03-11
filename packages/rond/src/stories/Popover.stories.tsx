import type { Meta, StoryObj } from "@storybook/react";
import { Button, Popover } from "@lib/components";

const meta = {
  title: "Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    as: { control: false },
    children: { control: false },
    origin: { control: "select", options: ["bottom-right", "top-left", "top-right"] },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: false,
    origin: "bottom-right",
    children: <div style={{ background: "#fff" }}>Popover content</div>,
  },
  render: (args) => {
    return (
      <div style={{ position: "relative" }}>
        <Button>Button</Button>
        <Popover {...args} style={{ bottom: "100%", right: "1rem", marginBottom: "0.5rem" }} />
      </div>
    );
  },
};
