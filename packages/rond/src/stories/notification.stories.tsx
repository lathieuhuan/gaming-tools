import type { Meta, StoryObj } from "@storybook/react";
import { AlertProps, Button } from "@lib/components";
import { notification, type NotificatioProps } from "@lib/utils";
import { useRef } from "react";

interface NotificationDemoProps extends Pick<NotificatioProps, "content" | "duration"> {
  notiType: AlertProps["type"];
}
const NotificationDemo = ({ notiType, ...notiProps }: NotificationDemoProps) => {
  const notiId = useRef<number>();

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Button onClick={() => notification[notiType](notiProps)}>Notify</Button>
        <Button variant="danger" onClick={() => notification.destroy()}>
          Close latest
        </Button>
        <Button variant="danger" onClick={() => notification.destroy("ALL")}>
          Close all
        </Button>
      </div>

      <div style={{ marginTop: "1rem", marginBottom: "0.25rem", display: "flex", gap: "1rem" }}>
        <Button
          variant="primary"
          onClick={() => {
            notiId.current = notification[notiType]({
              ...notiProps,
              content: <>{notiProps.content} (persistent)</>,
              duration: 0,
            });
          }}
        >
          Notify persist
        </Button>
        <Button variant="danger" onClick={() => notification.destroy(notiId.current)}>
          Close persistent noti
        </Button>
      </div>

      <p style={{ color: "var(--ron-color-primary-1)"}}>(not auto close, duration 0)</p>
    </div>
  );
};

const meta = {
  title: "Notification",
  component: NotificationDemo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    notiType: { control: "select", options: ["info", "success", "error", "warn"] },
    duration: { control: "number" },
  },
} satisfies Meta<typeof NotificationDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    notiType: "success",
    content: "Hello World",
    duration: 3,
  },
};
