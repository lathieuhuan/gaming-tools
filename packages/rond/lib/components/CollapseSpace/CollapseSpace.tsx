import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { useElementSize } from "../../hooks";

export type CollapseSpaceProps = ComponentProps<"div"> & {
  active: boolean;
  activeHeight?: string | number;
  /** Default 250 */
  moveDuration?: number;
  /** Default false */
  destroyOnClose?: boolean;
  contentClassName?: string;
  afterClose?: () => void;
};

export const CollapseSpace = ({
  active,
  activeHeight,
  moveDuration = 250,
  destroyOnClose = false,
  style,
  children,
  contentClassName,
  afterClose,
  ...props
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
      style={{
        ...style,
        height: ready ? (mergedActive ? mergedHeight : 0) : "auto",
        transition: `height ${moveDuration}ms ease-in-out`,
        overflow: "hidden",
      }}
      onTransitionEnd={(e) => {
        if (!mergedActive) {
          afterClose?.();

          if (destroyOnClose) {
            setState((prevState) => ({
              ...prevState,
              mounted: false,
            }));
          }
        }

        props.onTransitionEnd?.(e);
      }}
      {...props}
    >
      <div
        className={contentClassName}
        ref={ref}
        style={{
          height: activeHeight ? "100%" : "auto",
        }}
      >
        {mergedMounted && children}
      </div>
    </div>
  );
};
