import { type CSSProperties, useEffect, useState } from "react";
import { useElementSize } from "../../hooks";

export type HiddenSpaceProps = {
  active: boolean;
  /** Default 250 */
  moveDuration?: number;
  /** Default false */
  destroyOnClose?: boolean;
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
  afterClose?: () => void;
};

export const HiddenSpace = ({
  className,
  active,
  moveDuration = 250,
  destroyOnClose = false,
  style,
  children,
  afterClose,
}: HiddenSpaceProps) => {
  const [state, setState] = useState({
    active: false,
    mounted: false,
  });
  const [ref, { width }] = useElementSize<HTMLDivElement>();

  useEffect(() => {
    if (destroyOnClose && active !== state.active) {
      setState((prevState) => ({
        ...prevState,
        active,
        mounted: true,
      }));
    }
  }, [active]);

  const mergedActive = destroyOnClose ? state.active : active;
  const mergedMounted = destroyOnClose ? state.mounted : true;

  return (
    <div
      className={className}
      style={{
        ...style,
        width: mergedActive ? width : 0,
        transition: `width ${moveDuration}ms ease-in-out`,
        overflow: "hidden",
      }}
      onTransitionEnd={() => {
        if (!mergedActive) {
          afterClose?.();

          if (destroyOnClose) {
            setState((prevState) => ({
              ...prevState,
              mounted: false,
            }));
          }
        }
      }}
    >
      <div ref={ref} className="w-fit">
        {mergedMounted && children}
      </div>
    </div>
  );
};
