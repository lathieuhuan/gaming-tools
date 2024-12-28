import clsx from "clsx";
import { useEffect, useState } from "react";
import { useElementSize } from "@lib/hooks";
import { useScreenWatcher } from "@lib/providers";

export function OverflowTrackingContainer(props: {
  className?: string;
  overflowedCls: string;
  wrapCls?: string;
  children: React.ReactNode;
}) {
  const screen = useScreenWatcher();
  const [ref, size] = useElementSize<HTMLDivElement>();
  const [overflowed, setOverflowed] = useState(false);

  useEffect(() => {
    const parentHeight = ref.current?.parentElement?.clientHeight || Infinity;
    setOverflowed(parentHeight < size.height);
  }, [size.height]);

  return (
    <div className={clsx(props.className, screen.isFromSize("xm") && overflowed && props.overflowedCls)}>
      <div ref={ref} className={props.wrapCls}>
        {props.children}
      </div>
    </div>
  );
}
