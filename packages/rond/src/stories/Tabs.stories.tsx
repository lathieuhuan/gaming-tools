import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "@lib/components";

const meta = {
  title: "Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    items: { control: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: "Tab 1", value: 1 },
      { label: "Tab 2", value: 2 },
    ],
    value: 1,
  },
  render: (args) => (
    <div className="w-60">
      <Tabs {...args} />
    </div>
  ),
};
