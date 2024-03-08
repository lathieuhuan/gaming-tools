import type { Meta, StoryObj } from "@storybook/react";
import { CollapseSpace } from "@lib/components";
import { MountAnnouncer } from "../components";

const meta = {
  title: "CollapseSpace",
  component: CollapseSpace,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: { control: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CollapseSpace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: true,
    children: <MountAnnouncer style={{ width: 300, height: 200, background: "red" }} />,
  },
};
