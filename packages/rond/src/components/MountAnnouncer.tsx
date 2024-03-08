import { notification } from "@lib/utils";
import { type CSSProperties, useEffect } from "react";

interface MountAnnouncerProps {
  className?: string;
  mountMsg?: string;
  unmountMsg?: string;
  style?: CSSProperties;
}
export function MountAnnouncer({
  mountMsg = "Component mounted",
  unmountMsg = "Component unmounted",
  ...divProps
}: MountAnnouncerProps) {
  //
  useEffect(() => {
    notification.info({ content: mountMsg });

    return () => {
      notification.warn({ content: unmountMsg });
    };
  }, []);

  return <div {...divProps}>Hello from Announcer</div>;
}
