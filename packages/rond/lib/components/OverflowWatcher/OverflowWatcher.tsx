import type { ClassValue } from "clsx";

import { useElementSize } from "@lib/hooks";
import { useScreenWatcher } from "@lib/providers";
import { cn } from "@lib/utils";

export type OverflowWatcherProps = {
  className?: ClassValue;
  overflowedCls: ClassValue;
  wrapCls?: string;
  children: React.ReactNode;
};

export function OverflowWatcher(props: OverflowWatcherProps) {
  const screen = useScreenWatcher();
  const [childRef, { height: childHeight }] = useElementSize<HTMLDivElement>();
  const [parentRef, { height: parentHeight }] = useElementSize<HTMLDivElement>();

  return (
    <div
      ref={parentRef}
      className={cn(
        props.className,
        screen.isFromSize("xm") && parentHeight < childHeight && props.overflowedCls
      )}
    >
      <div ref={childRef} className={props.wrapCls}>
        {props.children}
      </div>
    </div>
  );
}
