import clsx, { type ClassValue } from "clsx";
import { Overlay, type OverlayProps } from "../Overlay";

type ModalPreset = "small" | "large" | "custom";

export const LARGE_HEIGHT_CLS = "ron-modal--large-height";

export interface ModalControl {
  active?: boolean;
  onClose: () => void;
}

export interface ModalCoreProps
  extends ModalControl,
    Pick<
      OverlayProps,
      "state" | "transitionDuration" | "closable" | "closeOnMaskClick" | "closeOnEscape" | "onTransitionEnd"
    > {
  /** Default to 'custom' */
  preset?: ModalPreset;
  /** Default to true */
  centered?: boolean;
  id?: string;
  className?: ClassValue;
  style?: React.CSSProperties;
  children: React.ReactNode | (() => JSX.Element | null);
}
export const ModalCore = ({
  closable = true,
  closeOnMaskClick = true,
  id,
  className,
  preset = "custom",
  centered = true,
  style,
  children,
  ...overlayProps
}: ModalCoreProps) => {
  return (
    <Overlay {...overlayProps} closable={closable} closeOnMaskClick={closeOnMaskClick}>
      {(direction, transitionStyle) => {
        return (
          <div
            role="dialog"
            aria-modal="true"
            id={id}
            className={clsx(
              `ron-modal ron-modal--${preset} ron-modal--${direction}`,
              preset === "large" && LARGE_HEIGHT_CLS,
              centered && 'ron-modal--centered',
              className
            )}
            style={{
              transitionProperty: "opacity, transform",
              ...transitionStyle,
              ...style,
            }}
          >
            {typeof children === "function" ? children() : children}
          </div>
        );
      }}
    </Overlay>
  );
};
