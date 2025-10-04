import type { PartiallyRequired } from "../../types";
import type { AlertProps } from "../../components";

export type NotificationRequest = Omit<AlertProps, "onClose"> & {
  id: number;
  duration?: number;
  isClosing?: boolean;
  onClose?: (id: number) => void;
  afterClose?: (id: number) => void;
};

export type NotificatioProps = Omit<NotificationRequest, "id" | "type">;

export type NotificationAnimatorProps = PartiallyRequired<NotificationRequest, "afterClose"> & {
  children: (operation: { onClose: () => void }) => React.ReactElement;
  onMount: (info: HTMLDivElement) => void;
};

export type NotificationCenterProps = {
  requests: NotificationRequest[];
  afterCloseNoti: (id: number) => void;
};
