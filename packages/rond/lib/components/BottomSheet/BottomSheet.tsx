import { CloseButton } from "../Button";
import { Overlay, type OverlayProps } from "../Overlay";
import "./BottomSheet.styles.scss";

export interface BottomSheetProps
  extends Pick<OverlayProps, "active" | "transitionDuration" | "closable" | "closeOnMaskClick" | "onClose"> {
  title: React.ReactNode;
  bodyCls?: string;
  height?: "auto" | "30%" | "50%" | "70%" | "90%";
  children?: React.ReactNode;
}
export function BottomSheet({ title, bodyCls, height, children, ...overlayProps }: BottomSheetProps) {
  return (
    <Overlay {...overlayProps}>
      {(direction, transitionStyle) => (
        <div
          className={`ron-bottomsheet ron-bottomsheet-${direction}`}
          style={{ height, transitionProperty: "transform", ...transitionStyle }}
        >
          <div className="ron-bottomsheet__heading">
            <div className="ron-bottomsheet__title">{title}</div>
            <CloseButton boneOnly className="ron-bottomsheet__close" onClick={overlayProps.onClose} />
          </div>
          <div className={`ron-bottomsheet__body ${bodyCls ?? ""}`}>{children}</div>
        </div>
      )}
    </Overlay>
  );
}
