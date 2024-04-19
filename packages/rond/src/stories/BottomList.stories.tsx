import type { Meta, StoryObj } from "@storybook/react";
import { BottomList } from "@lib/components";
import { genSequence } from "../utils";

const meta = {
  title: "BottomList",
  component: BottomList,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    active: { control: "boolean" },
    hasSearch: { control: "boolean" },
    height: { control: "inline-radio", options: ["auto", "30%", "50%", "70%"] },
    align: { control: "inline-radio", options: ["left", "right"] },
    items: { control: false },
    actions: { control: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BottomList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: true,
    height: "auto",
    title: "Select",
    value: 2,
    hasSearch: false,
    align: "left",
    items: genSequence(3),
  },
};

export const Overflow: Story = {
  args: {
    active: true,
    height: "50%",
    title: "Select",
    value: 2,
    hasSearch: false,
    align: "left",
    items: genSequence(5).concat({ label: "Lorem ipsum dolor sit amet consectetur adipisicing elit.", value: -1 }),
  },
};
