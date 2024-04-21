import type { Meta, StoryObj } from "@storybook/react";
import { FilterSvg, Select, SelectProps, VersatileSelect } from "@lib/components";

const meta = {
  title: "Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    size: { control: "inline-radio", options: ["small", "medium"] },
    align: { control: "inline-radio", options: ["left", "right"] },
    arrowAt: { control: "inline-radio", options: ["start", "end"] },
    transparent: { control: "boolean" },
    value: { control: false },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    disabled: false,
    options: [
      { label: "Option 1", value: 1 },
      { label: "Option 2", value: 2 },
    ],
    defaultValue: 2,
    size: "small",
    align: "left",
    arrowAt: "end",
    transparent: false,
  },
  render: (args) => {
    return (
      <div className="color-on-dark grid grid-col-2 gap-4" style={{ width: 300 }}>
        <Select {...args} />
      </div>
    );
  },
};

export const Versatile: Story = {
  argTypes: {
    options: { control: false },
    size: { control: false },
    align: { control: false },
    arrowAt: { control: false },
    transparent: { control: false },
    disabled: { control: false },
    defaultValue: { control: false },
    value: { control: false },
  },
  args: {
    options: [
      { label: "Option 1", value: 1 },
      { label: "Option 2", value: 2 },
    ],
  },
  render: () => {
    const args: SelectProps = {
      disabled: false,
      options: [
        { label: "Option 1", value: 1 },
        { label: "Option 2", value: 2 },
      ],
      defaultValue: 2,
      size: "small",
      align: "left",
      arrowAt: "end",
      transparent: false,
    };
    return (
      <div className="color-on-dark grid grid-col-2 gap-4" style={{ width: 288 }}>
        <span>Select</span>
        <span>VersatileSelect</span>
        <Select {...args} />
        <VersatileSelect {...args} title="Select" />
        <Select {...args} action={{ icon: <FilterSvg /> }} />
        <VersatileSelect {...args} title="Select" action={{ icon: <FilterSvg /> }} />
      </div>
    );
  },
};
