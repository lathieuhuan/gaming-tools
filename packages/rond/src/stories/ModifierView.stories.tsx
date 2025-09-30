import type { Meta, StoryObj } from "@storybook/react-vite";
import { ModifierView } from "@lib/components";

const meta = {
  title: "ModifierView",
  component: ModifierView,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    inputConfigs: { control: false },
  },
  render: (args) => {
    return (
      <div style={{ width: 320 }}>
        <ModifierView {...args} />
      </div>
    );
  },
} satisfies Meta<typeof ModifierView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    mutable: true,
    checked: false,
    heading: "A Modifier",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore vero quis amet, voluptates ducimus consequuntur mollitia! Assumenda, quod eos qui ratione voluptatem excepturi magni alias reiciendis deleniti nobis in dolorum.",
    inputs: [1, 1, 1],
    inputConfigs: [
      {
        label: "Text input",
        type: "text",
      },
      {
        label: "Check input",
        type: "check",
      },
      {
        label: "Select input",
        type: "select",
        options: [
          {
            label: "Option 1",
            value: 1,
          },
          {
            label: "Option 2",
            value: 2,
          },
        ],
      },
    ],
  },
};
