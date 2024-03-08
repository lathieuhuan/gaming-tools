import type { PartiallyRequired } from "../../types";
import type { AlertProps } from "../../components";

export type NotificationRequest = Omit<AlertProps, "onClose"> & {
  id: number;
  duration?: number;
  isClosing?: boolean;
  onClose?: (id: number) => void;
  afterClose?: (id: number) => void;
};

export interface NotificationAnimatorProps extends PartiallyRequired<NotificationRequest, "afterClose"> {
  children: (operation: { onClose: () => void }) => React.ReactElement;
  onMount: (info: HTMLDivElement) => void;
}

export interface NotificationCenterProps {
  requests: NotificationRequest[];
  afterCloseNoti: (id: number) => void;
}
