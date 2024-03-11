import { useEffect, useRef } from "react";
import type { NotificationAnimatorProps } from "./types";

const ANIMATION_DURATION = 200;

export const NotificationAnimator = ({
  id,
  duration,
  isClosing,
  children,
  onMount,
  afterClose,
  ...noti
}: NotificationAnimatorProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const onClose = () => {
    if (ref.current) {
      ref.current.classList.remove("ron-notification-animator-mounted");
    }

    noti.onClose?.(id);

    setTimeout(afterClose, ANIMATION_DURATION);
  };

  useEffect(() => {
    let isUnmounted = false;

    if (ref.current) {
      onMount?.(ref.current);
      ref.current.classList.add("ron-notification-animator-mounted");
    }

    if (duration) {
      setTimeout(() => {
        if (!isUnmounted) {
          onClose();
        }
      }, duration * 1000);
    }

    return () => {
      isUnmounted = true;
    };
  }, []);

  useEffect(() => {
    if (isClosing) {
      onClose();
    }
  }, [isClosing]);

  return (
    <div ref={ref} className="ron-notification-animator" style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}>
      {children({ onClose })}
    </div>
  );
};
