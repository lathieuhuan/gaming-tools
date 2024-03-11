import type { Meta, StoryObj } from "@storybook/react";
import { StatsTable } from "@lib/components";

const meta = {
  title: "StatsTable",
  component: StatsTable,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: { control: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StatsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    style: {
      width: 200,
    },
    children: (
      <>
        <StatsTable.Row>
          <span>Attribute 1</span>
          <span>1,200</span>
        </StatsTable.Row>
        <StatsTable.Row>
          <span>Attribute 2</span>
          <span>15,000</span>
        </StatsTable.Row>
        <StatsTable.Row>
          <span>Attribute 3</span>
          <span>920 + 350</span>
        </StatsTable.Row>
      </>
    ),
  },
};
