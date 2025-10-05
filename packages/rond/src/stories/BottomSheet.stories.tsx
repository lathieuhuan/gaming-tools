import type { Meta, StoryObj } from "@storybook/react-vite";
import { BottomSheet } from "@lib/components";
import { MountAnnouncer } from "../components";

const meta = {
  title: "BottomSheet",
  component: BottomSheet,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: { control: false },
    height: { control: "select", options: ["auto", "30%", "50%", "70%"] },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: false,
    title: "Title",
    height: "auto",
    children: <MountAnnouncer className="bg-light-2 text-black h-16" />,
  },
};

export const Overflow: Story = {
  argTypes: {
    children: { control: false },
    height: { control: false },
  },
  args: {
    active: false,
    title: "Title",
    height: "50%",
    children: <MountAnnouncer className="bg-light-2 text-black h-200" />,
  },
};
