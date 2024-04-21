import type { Meta, StoryObj } from "@storybook/react";
import { CarouselSpace } from "@lib/components";
import { PlainGround } from "../components";

const meta = {
  title: "CarouselSpace",
  component: CarouselSpace,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: { control: false },
  },
  tags: ["autodocs"],
  render: (args) => {
    return (
      <div style={{ width: 200, height: 300 }}>
        <CarouselSpace {...args} />
      </div>
    );
  },
} satisfies Meta<typeof CarouselSpace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    current: 0,
    children: [
      <PlainGround height={300}>Content 1</PlainGround>,
      <PlainGround height={300}>Content 2</PlainGround>,
      <PlainGround height={200}>Content 3</PlainGround>,
    ],
  },
  argTypes: {
    current: { control: { type: "number", min: 0, max: 2 } },
  },
};
