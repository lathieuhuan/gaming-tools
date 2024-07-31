import clsx, { type ClassValue } from "clsx";
import { Overlay, type OverlayProps } from "../Overlay";
import "./Drawer.styles.scss";

export interface DrawerProps
  extends Pick<
    OverlayProps,
    "active" | "transitionDuration" | "closable" | "closeOnMaskClick" | "getContainer" | "onClose"
  > {
  className?: ClassValue;
  style?: React.CSSProperties;
  /** Default to 'right' */
  position?: "right" | "left";
  /** Default to '20rem' */
  width?: string | number;
  /** Default to true */
  destroyOnClose?: boolean;
  children: React.ReactNode;
}
export const Drawer = ({
  className,
  style,
  position = "right",
  active,
  width = "20rem",
  destroyOnClose,
  children,
  ...overlayProps
}: DrawerProps) => {
  return (
    <Overlay state={active ? "open" : destroyOnClose ? "close" : "hidden"} {...overlayProps}>
      {(direction, transitionStyle) => {
        return (
          <div
            className={clsx(`ron-drawer ron-drawer--${position}`, className)}
            style={{
              width,
              transitionProperty: "transform",
              transform:
                direction === "out" ? "translateX(0)" : position === "left" ? "translateX(-100%)" : "translateX(100%)",
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
