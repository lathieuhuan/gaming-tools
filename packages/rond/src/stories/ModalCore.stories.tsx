import type { Meta, StoryObj } from "@storybook/react-vite";
import { Modal } from "@lib/components";
import { MountAnnouncer } from "../components";
import { fn } from "storybook/internal/test";

const meta = {
  title: "ModalCore",
  component: Modal.Core,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    preset: { control: "select", options: ["small", "large", "custom"] },
    state: { control: "inline-radio", options: ["open", "close", "hidden"] },
    closable: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Modal.Core>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    preset: "large",
    state: "close",
    closeOnMaskClick: true,
    children: <MountAnnouncer />,
    onClose: fn(),
  },
};
