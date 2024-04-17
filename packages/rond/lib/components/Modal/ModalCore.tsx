import clsx, { type ClassValue } from "clsx";
import { Overlay, type OverlayProps } from "../Overlay";

type ModalPreset = "small" | "large" | "custom";

export const LARGE_HEIGHT_CLS = "ron-modal--large-height";

export interface ModalControl {
  active?: boolean;
  onClose: () => void;
}

export interface ModalCoreProps extends ModalControl, Pick<OverlayProps, "closable" | "closeOnMaskClick" | "state"> {
  /** Default to 'custom' */
  preset?: ModalPreset;
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
  style,
  children,
  ...overlayProps
}: ModalCoreProps) => {
  return (
    <Overlay {...overlayProps} closable={closable} closeOnMaskClick={closeOnMaskClick}>
      {(direction) => {
        return (
          <div
            id={id}
            className={clsx(
              `ron-modal ron-modal--${preset} ron-modal--${direction} ron-overlay-transition`,
              preset === "large" && LARGE_HEIGHT_CLS,
              className
            )}
            style={style}
          >
            {typeof children === "function" ? children() : children}
          </div>
        );
      }}
    </Overlay>
  );
};
