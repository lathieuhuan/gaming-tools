import { useEffect, useRef } from "react";
import clsx from "clsx";
import type { NotificationAnimatorProps } from "./notification.types";

const ANIMATION_DURATION = 200;
const DEFAULT_CLASSES = ["-translate-y-8", "opacity-20"];
const MOUNTED_CLASSES = ["translate-y-0", "opacity-100"];

const replaceClasses = (element: HTMLDivElement, oldClasses: string[], newClasses: string[]) => {
  element.classList.remove(...oldClasses);
  element.classList.add(...newClasses);
};

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
      replaceClasses(ref.current, MOUNTED_CLASSES, DEFAULT_CLASSES);
    }

    noti.onClose?.(id);

    setTimeout(afterClose, ANIMATION_DURATION);
  };

  useEffect(() => {
    let isUnmounted = false;

    if (ref.current) {
      onMount?.(ref.current);
      replaceClasses(ref.current, DEFAULT_CLASSES, MOUNTED_CLASSES);
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
    <div
      ref={ref}
      className={clsx(DEFAULT_CLASSES, "transition-all")}
      style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
    >
      {children({ onClose })}
    </div>
  );
};
