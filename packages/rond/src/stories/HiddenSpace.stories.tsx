import type { Meta, StoryObj } from "@storybook/react";
import { HiddenSpace } from "@lib/components";
import { MountAnnouncer } from "../components";

const meta = {
  title: "HiddenSpace",
  component: HiddenSpace,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: { control: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HiddenSpace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: true,
    children: <MountAnnouncer style={{ width: 300, height: 200, background: "red" }} />,
  },
};
