import type { NotificatioProps, NotificationRequest } from "./notification.types";
import { notifRoot, location } from "./notification-root";
import { NotificationCenter } from "./NotificationCenter";
import "./notification.styles.scss";

let notiRequests: NotificationRequest[] = [];

function updateNotification() {
  if (!document.getElementById(location.id)) {
    document.body.append(location);
  }

  notifRoot.render(
    <NotificationCenter
      requests={notiRequests}
      afterCloseNoti={(id: number) => {
        notiRequests = notiRequests.filter((request) => request.id !== id);
        updateNotification();
      }}
    />
  );
}

function destroy(id?: number | "ALL") {
  if (id === "ALL") {
    for (const request of notiRequests) {
      request.isClosing = true;
    }
  } else if (typeof id === "number") {
    const request = notiRequests.find((request) => request.id === id);

    if (request) {
      request.isClosing = true;
    }
  } else {
    const lastRequest = notiRequests[notiRequests.length - 1];

    if (lastRequest) {
      lastRequest.isClosing = true;
    }
  }

  updateNotification();
}

const show = (type: NotificationRequest["type"]) => (noti: NotificatioProps) => {
  //
  for (let id = 0; id < 100; id++) {
    if (notiRequests.every((notification) => notification.id !== id)) {
      //
      notiRequests.push({
        id,
        type,
        duration: 3,
        ...noti,
      });

      updateNotification();

      return id;
    }
  }
  return 0;
};

export const notification = {
  info: show("info"),
  success: show("success"),
  error: show("error"),
  warn: show("warn"),
  destroy,
};
