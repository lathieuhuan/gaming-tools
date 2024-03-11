import type { Meta, StoryObj } from "@storybook/react";
import { Drawer } from "@lib/components";
import { MountAnnouncer } from "../components";

const meta = {
  title: "Drawer",
  component: Drawer,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: { control: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: false,
    activeWidth: 300,
    destroyOnClose: false,
    children: <MountAnnouncer style={{ height: 200, background: "red" }} />,
  },
};
