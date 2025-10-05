import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table } from "@lib/components";

const meta = {
  title: "Table",
  component: Table,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    children: { control: false },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    colAttrs: [{ width: 80 }, { width: 120 }, { width: 120 }],
    children: (
      <>
        <Table.Tr>
          <Table.Th />
          <Table.Th>Title 1</Table.Th>
          <Table.Th>Title 2</Table.Th>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>Row 1</Table.Td>
          <Table.Td>1A</Table.Td>
          <Table.Td>1B</Table.Td>
        </Table.Tr>
        <Table.Tr>
          <Table.Td>Row 2</Table.Td>
          <Table.Td>2A</Table.Td>
          <Table.Td>2B</Table.Td>
        </Table.Tr>
      </>
    ),
  },
};
