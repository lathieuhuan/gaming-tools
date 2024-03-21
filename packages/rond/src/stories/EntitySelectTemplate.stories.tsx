import type { Meta, StoryObj } from "@storybook/react";
import { Button, EntitySelectTemplate } from "@lib/components";
import { MountAnnouncer } from "../components";
import { ScreenSizeWatcher } from "@lib/providers";

const meta = {
  title: "EntitySelectTemplate",
  component: EntitySelectTemplate,
  argTypes: {
    renderFilter: { control: false },
    children: { control: false },
  },
  render: (args) => {
    return (
      <ScreenSizeWatcher>
        <div style={{ height: 300, position: "relative" }}>
          <EntitySelectTemplate {...args} />
        </div>
      </ScreenSizeWatcher>
    );
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EntitySelectTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Title",
    hasFilter: true,
    filterToggleable: true,
    filterWrapWidth: 360,
    hasMultipleMode: true,
    hasSearch: true,
    initialFilterOn: false,
    renderFilter: (setFilterOn) => {
      return (
        <div>
          <MountAnnouncer />
          <Button onClick={() => setFilterOn(false)}>Close</Button>
        </div>
      );
    },
    children: (args) => {
      return (
        <div style={{ color: "var(--ron-color-on-dark)" }}>
          <p>isMultiSelect: {args.isMultiSelect ? "true" : "false"}</p>
          <p>keyword: [{args.keyword}]</p>
          <p>searchOn: {args.searchOn ? "true" : "false"}</p>
        </div>
      );
    },
  },
};
