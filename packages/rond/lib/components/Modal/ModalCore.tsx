import type { ClassValue } from "clsx";
import { cn } from "@lib/utils";
import { Overlay, type OverlayProps } from "../Overlay";

type ModalPreset = "small" | "large" | "custom";

export const LARGE_HEIGHT_CLS = "h-90/100 max-h-192";

export type ModalControl = {
  active?: boolean;
  onClose: () => void;
};

export type ModalCoreProps = ModalControl &
  Pick<
    OverlayProps,
    | "state"
    | "transitionDuration"
    | "closable"
    | "closeOnMaskClick"
    | "closeOnEscape"
    | "onTransitionEnd"
  > & {
    /** Default to 'custom' */
    preset?: ModalPreset;
    /** Default to true */
    centered?: boolean;
    id?: string;
    className?: ClassValue;
    style?: React.CSSProperties;
    children: React.ReactNode | (() => JSX.Element | null);
  };

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
            id={id}
            role="dialog"
            aria-modal="true"
            data-direction={direction}
            className={cn(
              `fixed left-1/2 -translate-x-1/2 z-50 max-w-95/100 overflow-hidden`,
              'opacity-0 scale-95 data-[direction="out"]:opacity-100 data-[direction="out"]:scale-100',
              preset !== "custom" && "w-88 rounded-lg shadow-popup",
              preset === "large" &&
                `bg-dark-2 text-white sm:w-112 md:w-148 xm:w-180 lg:w-236 ${LARGE_HEIGHT_CLS}`,
              centered ? "top-1/2 -translate-y-1/2" : "top-0",
              className
            )}
            style={{
              transitionProperty: "all",
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
