import type { Meta, StoryObj } from "@storybook/react";
import { ModalCore } from "@lib/components";
import { MountAnnouncer } from "../components";

const meta = {
  title: "ModalCore",
  component: ModalCore,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    preset: { control: "select", options: ["small", "large", "custom"] },
    state: { control: "select", options: ["open", "close", "hidden"] },
    closable: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof ModalCore>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    preset: "large",
    state: "close",
    closeOnMaskClick: true,
    children: <MountAnnouncer />,
  },
};
