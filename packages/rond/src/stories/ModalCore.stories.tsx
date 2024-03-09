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
    closable: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof ModalCore>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    preset: "large",
    closeOnMaskClick: true,
    children: <MountAnnouncer />,
  },
};
