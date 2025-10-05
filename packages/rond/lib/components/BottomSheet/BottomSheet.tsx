import { cn } from "@lib/utils";
import { CloseButton } from "../Button";
import { Overlay, type OverlayProps } from "../Overlay";

export type BottomSheetProps = Pick<
  OverlayProps,
  "active" | "transitionDuration" | "closable" | "closeOnMaskClick" | "onClose"
> & {
  title: React.ReactNode;
  bodyCls?: string;
  height?: "auto" | "30%" | "50%" | "70%" | "90%";
  children?: React.ReactNode;
};

export function BottomSheet({
  title,
  bodyCls,
  height,
  children,
  ...overlayProps
}: BottomSheetProps) {
  return (
    <Overlay {...overlayProps}>
      {(direction, transitionStyle) => (
        <div
          className={cn(
            "absolute bottom-0 left-0 w-full rounded-t-xl bg-dark-2 text-white shadow-popup flex flex-col overflow-hidden",
            direction === "out" ? "translate-y-0" : "translate-y-full"
          )}
          style={{ height, transitionProperty: "translate", ...transitionStyle }}
        >
          <div className="p-1 bg-dark-1 text-heading min-h-10 flex justify-between items-center">
            <div className="px-3 text-lg leading-5.5 font-semibold">{title}</div>
            <CloseButton boneOnly onClick={overlayProps.onClose} />
          </div>
          <div className={cn("flex-grow overflow-auto", bodyCls)}>{children}</div>
        </div>
      )}
    </Overlay>
  );
}
