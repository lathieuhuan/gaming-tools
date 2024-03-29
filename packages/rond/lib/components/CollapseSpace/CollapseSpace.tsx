import { useEffect, useState } from "react";
import { useElementSize } from "../../hooks";
import { PartiallyRequired } from "@lib/types";

export interface CollapseSpaceProps {
  active: boolean;
  activeHeight?: string | number;
  /** Default to 250 */
  moveDuration?: number;
  /** Default to false */
  destroyOnClose?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  afterClose?: () => void;
}
export const CollapseSpace = ({
  // active,
  // className,
  // activeHeight,
  moveDuration = 250,
  destroyOnClose = false,
  // style,
  // children,
  // afterClose,
  ...props
}: CollapseSpaceProps) => {
  // const [ready, setReady] = useState(!active);
  // const [state, setState] = useState({
  //   active: false,
  //   mounted: false,
  // });
  // const [ref, { height }] = useElementSize<HTMLDivElement>();

  // useEffect(() => {
  //   if (!ready && height) {
  //     setReady(true);
  //   }
  // }, [ready, height]);

  // useEffect(() => {
  //   if (destroyOnClose && active !== state.active) {
  //     setState((prevState) => ({
  //       ...prevState,
  //       active,
  //       mounted: true,
  //     }));
  //   }
  // }, [active]);

  if (destroyOnClose) {
    return <CollapseSpaceDestroy {...props} moveDuration={moveDuration} />;
  }
  return <CollapseSpacePersist {...props} moveDuration={moveDuration} />;

  // const mergedActive = destroyOnClose ? state.active : active;
  // const mergedHeight = activeHeight ?? height;
  // const mergedMounted = destroyOnClose ? state.mounted : true;

  // return (
  //   <div
  //     className={className}
  //     style={{
  //       ...style,
  //       height: ready ? (mergedActive ? mergedHeight : 0) : "auto",
  //       transition: `height ${moveDuration}ms ease-in-out`,
  //       overflow: "hidden",
  //     }}
  //     onTransitionEnd={() => {
  //       if (!mergedActive) {
  //         afterClose?.();

  //         if (destroyOnClose) {
  //           setState((prevState) => ({
  //             ...prevState,
  //             mounted: false,
  //           }));
  //         }
  //       }
  //     }}
  //   >
  //     <div ref={ref} style={{ height: activeHeight ? "100%" : "auto" }}>
  //       {mergedMounted && children}
  //     </div>
  //   </div>
  // );
};

function CollapseSpacePersist({
  className,
  active,
  activeHeight,
  moveDuration,
  style,
  children,
  afterClose,
}: PartiallyRequired<Omit<CollapseSpaceProps, "destroyOnClose">, "moveDuration">) {
  const [ready, setReady] = useState(!active);
  const [ref, { height }] = useElementSize<HTMLDivElement>();

  console.log(height);

  useEffect(() => {
    if (height) setReady(true);
  }, [height]);

  const mergedHeight = activeHeight ?? height;

  return (
    <div
      className={className}
      style={{
        ...style,
        height: ready ? (active ? mergedHeight : 0) : "auto",
        transition: `height ${moveDuration}ms ease-in-out`,
        overflow: "hidden",
      }}
      onTransitionEnd={() => {
        if (!active) {
          afterClose?.();
        }
      }}
    >
      <div ref={ref} style={{ height: activeHeight ? "100%" : "auto" }}>
        {children}
      </div>
    </div>
  );
}

function CollapseSpaceDestroy({
  className,
  active,
  activeHeight,
  moveDuration,
  style,
  children,
  afterClose,
}: PartiallyRequired<Omit<CollapseSpaceProps, "destroyOnClose">, "moveDuration">) {
  const [ready, setReady] = useState(!active);
  const [state, setState] = useState({
    active,
    mounted: active,
  });
  const [ref, { height }] = useElementSize<HTMLDivElement>();

  useEffect(() => {
    if (active !== state.active) {
      setState((prevState) => ({
        ...prevState,
        active,
        mounted: true,
      }));
    }
  }, [active]);

  useEffect(() => {
    if (height) setReady(true);
  }, [height]);

  const mergedHeight = activeHeight ?? height;

  return (
    <div
      className={className}
      style={{
        ...style,
        height: ready ? (state.active ? mergedHeight : 0) : "auto",
        transition: `height ${moveDuration}ms ease-in-out`,
        overflow: "hidden",
      }}
      onTransitionEnd={() => {
        if (!active) {
          afterClose?.();

          setState((prevState) => ({
            ...prevState,
            mounted: false,
          }));
        }
      }}
    >
      <div ref={ref} style={{ height: activeHeight ? "100%" : "auto" }}>
        {state.mounted && children}
      </div>
    </div>
  );
}
