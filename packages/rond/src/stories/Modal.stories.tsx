import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "@lib/components";

const meta = {
  title: "Modal",
  component: Modal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    preset: { control: "select", options: ["small", "large", "custom"] },
    closable: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Modal Title",
    preset: "large",
    active: false,
    withHeaderDivider: true,
    withFooterDivider: true,
    withActions: true,
    confirmText: "Ok",
    cancelText: "Not Ok",
    disabledConfirm: false,
    moreActions: [],
    closeOnMaskClick: true,
    children: <div>Hello World</div>,
  },
};
