import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "@lib/components";

const meta = {
  title: "Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    configs: { control: false },
    level: { control: "inline-radio", options: [1, 2] },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    level: 1,
    configs: ["Tab 1", "Tab 2"],
    activeIndex: 0,
  },
  render: (args) => (
    <div className="w-60">
      <Tabs {...args} />
    </div>
  ),
};
