import type { Meta, StoryObj } from "@storybook/react";
import { CollapseList } from "@lib/components";
import { PlainGround } from "../components";

const meta = {
  title: "CollapseList",
  component: CollapseList,
  argTypes: {
    items: { control: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CollapseList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      {
        heading: "Heading 1",
        body: <PlainGround height={200}>Body 1</PlainGround>,
      },
      {
        heading: "Heading 2",
        body: <PlainGround height={300}>Body 2</PlainGround>,
      },
    ],
  },
};
