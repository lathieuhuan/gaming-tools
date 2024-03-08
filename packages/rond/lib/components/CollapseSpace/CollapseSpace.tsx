import { useElementSize } from "@lib/hooks";
import { CSSProperties, useEffect, useState } from "react";

interface CollapseSpaceProps {
  active: boolean;
  /** Default to 250 */
  moveDuration?: number;
  /** Default to false */
  destroyOnClose?: boolean;
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  afterClose?: () => void;
}
export const CollapseSpace = ({
  className,
  active,
  moveDuration = 250,
  destroyOnClose = false,
  style,
  children,
  afterClose,
}: CollapseSpaceProps) => {
  const [state, setState] = useState({
    active: false,
    mounted: false,
  });
  const [ref, { height }] = useElementSize<HTMLDivElement>();

  useEffect(() => {
    if (!destroyOnClose || active === state.active) return;

    setState((prevState) => ({
      ...prevState,
      active,
      mounted: true,
    }));

    if (!active) {
      setTimeout(() => {
        setState((prevState) =>
          prevState.active
            ? prevState
            : {
                ...prevState,
                mounted: false,
              }
        );
      }, moveDuration);
    }
  }, [active]);

  const mergedActive = destroyOnClose ? state.active : active;
  const mergedMounted = destroyOnClose ? state.mounted : true;

  return (
    <div
      className={className}
      style={{
        ...style,
        height: mergedActive ? height : 0,
        transition: `height ${moveDuration}ms ease-in-out`,
        overflow: "hidden",
      }}
      onTransitionEnd={() => {
        if (!mergedActive) afterClose?.();
      }}
    >
      <div ref={ref}>{mergedMounted && children}</div>
    </div>
  );
};
