import { type CSSProperties, useEffect } from "react";

interface MountAnnouncerProps {
  className?: string;
  style?: CSSProperties;
}
export function MountAnnouncer(props: MountAnnouncerProps) {
  useEffect(() => {
    console.log("MOUNT");

    return () => {
      console.log("UNMOUNT");
    };
  }, []);

  return <div {...props}>Hello from Announcer</div>;
}
