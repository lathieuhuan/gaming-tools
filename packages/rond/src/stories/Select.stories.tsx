import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterSvg, Select, SelectProps, VersatileSelect } from "@lib/components";
import { ScreenSizeWatcher } from "@lib/providers";

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
      <div className="w-60 flex flex-col gap-4">
        <Select {...args} />
        <Select {...args} action={{ icon: <FilterSvg /> }} />
      </div>
    );
  },
};

export const Versatile: Story = {
  argTypes: {
    options: { control: false },
    transparent: { control: false },
    defaultValue: { control: false },
    value: { control: false },
  },
  args: {
    options: [
      { label: "Option 1", value: 1 },
      { label: "Option 2", value: 2 },
    ],
    defaultValue: 2,
    size: "small",
    align: "left",
    arrowAt: "end",
    transparent: false,
    disabled: false,
  },
  render: (props) => {
    return (
      <ScreenSizeWatcher>
        <div className="text-white flex flex-wrap gap-4">
          <div className="min-w-40">
            <span>Select</span>
            <Select {...props} />
          </div>
          <div className="min-w-40">
            <span>VersatileSelect</span>
            <VersatileSelect {...props} title="Select" />
          </div>
        </div>
      </ScreenSizeWatcher>
    );
  },
};
