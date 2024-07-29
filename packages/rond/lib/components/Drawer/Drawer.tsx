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
  activeWidth?: string | number;
  /** Default to true */
  destroyOnClose?: boolean;
  children: React.ReactNode;
}
export const Drawer = ({
  className,
  style,
  position = "right",
  active,
  activeWidth = "20rem",
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
              width: direction === "out" ? activeWidth : 0,
              transitionProperty: "width",
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
