import type { Meta, StoryObj } from "@storybook/react";

import { Button, ButtonProps } from "@lib/components/Button";

const variants: ButtonProps["variant"][] = ["default", "primary", "active", "danger", "custom"];
const shapes: ButtonProps["shape"][] = ["square", "rounded"];
const sizes: ButtonProps["size"][] = ["small", "medium", "large", "custom"];

const icon = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 448 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path>
  </svg>
);

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Button",
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    variant: { control: "select", options: variants },
    shape: { control: "select", options: shapes },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    variant: "default",
    shape: "rounded",
    size: "medium",
    children: "Button",
  },
};

export const WithIcon: Story = {
  args: {
    variant: "default",
    shape: "rounded",
    size: "medium",
    icon,
    iconPosition: "start",
    children: "Button",
  },
  argTypes: {
    icon: { control: false },
    iconPosition: { control: "select", options: ["start", "end"] },
  },
};

export const IconButton: Story = {
  args: {
    variant: "default",
    shape: "rounded",
    size: "medium",
    icon,
  },
  argTypes: {
    icon: { control: false },
    children: { control: false },
  },
};
