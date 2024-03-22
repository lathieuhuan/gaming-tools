import { useRef } from "react";
import type { NotificationCenterProps } from "./notification.types";
import { NotificationAnimator } from "./NotificationAnimator";
import { Alert } from "../../components";

export const NotificationCenter = (props: NotificationCenterProps) => {
  const heights = useRef<number[]>([]);

  return (
    <div className="ron-notification-center">
      {props.requests.map((request, i, all) => {
        const { id } = request;

        const extraDistance = all.slice(0, i).reduce((total, ctrl) => {
          return total + (heights.current[ctrl.id] || 0);
        }, 0);

        return (
          <div
            key={id}
            className="ron-notification-center-item"
            style={{
              top: 16 * (i + 1) + extraDistance,
            }}
          >
            <NotificationAnimator
              {...request}
              onMount={(element) => {
                heights.current[id] = element.clientHeight;
              }}
              afterClose={() => {
                request.afterClose?.(id);
                props.afterCloseNoti(id);
              }}
            >
              {({ onClose }) => (
                <Alert {...request} className={["ron-notification-alert", request.className]} onClose={onClose} />
              )}
            </NotificationAnimator>
          </div>
        );
      })}
    </div>
  );
};
