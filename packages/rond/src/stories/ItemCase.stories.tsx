import type { Meta, StoryObj } from "@storybook/react";
import { ExclamationTriangleSvg, ItemCase } from "@lib/components";

const meta = {
  title: "ItemCase",
  component: ItemCase,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof ItemCase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    chosen: false,
    children: (cls, imgCls) => {
      return (
        <div
          className={cls}
          style={{
            width: 96,
            height: 144,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "red",
            borderRadius: "0.25rem",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-0.5rem",
              right: "-0.5rem",
              padding: "0.25rem 0.5rem",
              background: "yellow",
              borderRadius: "0.25rem",
            }}
          >
            Label
          </div>

          <ExclamationTriangleSvg className={imgCls} width="3rem" height="3rem" fill="white" />
        </div>
      );
    },
  },
};
