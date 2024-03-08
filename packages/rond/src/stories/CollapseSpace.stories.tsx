import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CollapseSpace } from "@lib/components";

const Children = () => {
  useEffect(() => {
    console.log("MOUNT");

    return () => {
      console.log("UNMOUNT");
    };
  }, []);

  return <div style={{ width: 300, height: 200, background: "red" }}>Hello from Children</div>;
};

const meta = {
  title: "CollapseSpace",
  component: CollapseSpace,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: { control: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CollapseSpace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: true,
    children: <Children />,
  },
};
