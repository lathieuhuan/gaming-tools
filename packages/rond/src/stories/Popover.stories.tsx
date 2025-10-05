import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover } from "@lib/components";

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
    className: "bottom-full right-4 mb-2",
    withTooltipStyle: true,
    children: <span>Popover content</span>,
  },
  render: (args) => {
    return (
      <div className="relative">
        <p className="text-white">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
        <Popover {...args} />
      </div>
    );
  },
};
