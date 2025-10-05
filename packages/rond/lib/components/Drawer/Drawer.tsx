import clsx, { type ClassValue } from "clsx";
import { Overlay, type OverlayProps } from "../Overlay";

export type DrawerProps = Pick<
  OverlayProps,
  "active" | "transitionDuration" | "closable" | "closeOnMaskClick" | "getContainer" | "onClose"
> & {
  className?: ClassValue;
  style?: React.CSSProperties;
  /** Default to 'right' */
  position?: "right" | "left";
  /** Default to '20rem' */
  width?: string | number;
  /** Default to true */
  destroyOnClose?: boolean;
  children: React.ReactNode;
};

export const Drawer = ({
  className,
  style,
  position = "right",
  active,
  width = "20rem",
  destroyOnClose = true,
  children,
  ...overlayProps
}: DrawerProps) => {
  return (
    <Overlay state={active ? "open" : destroyOnClose ? "close" : "hidden"} {...overlayProps}>
      {(direction, transitionStyle) => {
        return (
          <div
            className={clsx(
              "absolute top-0 z-10 h-full overflow-hidden",
              position === "left" ? "left-0" : "right-0",
              className
            )}
            style={{
              width,
              transitionProperty: "transform",
              transform:
                direction === "out"
                  ? "translateX(0)"
                  : position === "left"
                  ? "translateX(-100%)"
                  : "translateX(100%)",
              ...transitionStyle,
              ...style,
            }}
          >
            {children}
          </div>
        );
      }}
    </Overlay>
  );
};
