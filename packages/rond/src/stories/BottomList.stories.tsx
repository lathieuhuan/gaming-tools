import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
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
    onClose: fn(),
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
    items: [{ label: "Lorem ipsum dolor sit amet consectetur adipisicing elit.", value: -1 }].concat(genSequence(5)),
    onClose: fn(),
  },
};

export const Actions: Story = {
  args: {
    active: true,
    height: "70%",
    title: "Select",
    value: 3,
    hasSearch: false,
    align: "left",
    items: genSequence(10),
    actions: [{ children: "Confirm", variant: "primary" }],
    onClose: fn(),
  },
};

export const CustomRender: Story = {
  args: {
    active: true,
    height: "70%",
    title: "Select",
    value: 3,
    hasSearch: false,
    align: "left",
    items: genSequence(10),
    renderItem: (item) => {
      return (
        <div>
          Suffix {item.label} / Value: {item.value}
        </div>
      );
    },
    onClose: fn(),
  },
};
