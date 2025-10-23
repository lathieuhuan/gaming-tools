import { useEffect, useState } from "react";
import { useElementSize } from "../../hooks";

export type CollapseSpaceProps = {
  active: boolean;
  activeHeight?: string | number;
  /** Default 250 */
  moveDuration?: number;
  /** Default false */
  destroyOnClose?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  afterClose?: () => void;
};

export const CollapseSpace = ({
  active,
  className,
  activeHeight,
  moveDuration = 250,
  destroyOnClose = false,
  style,
  children,
  afterClose,
}: CollapseSpaceProps) => {
  const [ready, setReady] = useState(!active);
  const [state, setState] = useState({
    active: false,
    mounted: false,
  });
  const [ref, { height }] = useElementSize<HTMLDivElement>();

  useEffect(() => {
    if (!ready && height) {
      setReady(true);
    }
  }, [ready, height]);

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
        height: ready ? (mergedActive ? mergedHeight : 0) : "auto",
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
      <div ref={ref} style={{ height: activeHeight ? "100%" : "auto" }}>
        {mergedMounted && children}
      </div>
    </div>
  );
};
