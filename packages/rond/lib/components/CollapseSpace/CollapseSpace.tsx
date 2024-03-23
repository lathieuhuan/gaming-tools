import { type CSSProperties, useEffect, useState } from "react";
import { useElementSize } from "../../hooks";

export interface CollapseSpaceProps {
  active: boolean;
  activeHeight?: string | number;
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
  activeHeight,
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
    if (destroyOnClose && active !== state.active) {
      setState((prevState) => ({
        ...prevState,
        active,
        mounted: true,
      }));
    }
  }, [active]);

  const mergedActive = destroyOnClose ? state.active : active;
  const mergedHeight = activeHeight ?? height;
  const mergedMounted = destroyOnClose ? state.mounted : true;

  return (
    <div
      className={className}
      style={{
        ...style,
        height: mergedActive ? mergedHeight : 0,
        transition: `height ${moveDuration}ms ease-in-out`,
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
      <div ref={ref}>{mergedMounted && children}</div>
    </div>
  );
};
