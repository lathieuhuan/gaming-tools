import type { ClassValue } from "clsx";
import { useEffect, useState } from "react";

import { useElementSize } from "@lib/hooks";
import { useScreenWatcher } from "@lib/providers";
import { cn } from "@lib/utils";

export type OverflowTrackingContainerProps = {
  className?: ClassValue;
  overflowedCls: ClassValue;
  wrapCls?: string;
  children: React.ReactNode;
};

export function OverflowTrackingContainer(props: OverflowTrackingContainerProps) {
  const screen = useScreenWatcher();
  const [ref, size] = useElementSize<HTMLDivElement>();
  const [overflowed, setOverflowed] = useState(false);

  useEffect(() => {
    const parentHeight = ref.current?.parentElement?.clientHeight || Infinity;
    setOverflowed(parentHeight < size.height);
  }, [size.height]);

  return (
    <div
      className={cn(props.className, screen.isFromSize("xm") && overflowed && props.overflowedCls)}
    >
      <div ref={ref} className={props.wrapCls}>
        {props.children}
      </div>
    </div>
  );
}
