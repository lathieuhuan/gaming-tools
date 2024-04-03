import { CloseButton } from "../Button";
import { Overlay, type OverlayProps } from "../Overlay";
import "./BottomSheet.styles.scss";

export interface BottomSheetProps extends Pick<OverlayProps, "active" | "onClose" | "closable" | "closeOnMaskClick"> {
  title: React.ReactNode;
  height?: "auto" | "30%" | "50%" | "70%" | "90%";
  children?: React.ReactNode;
}
export function BottomSheet({ title, height, children, ...overlayProps }: BottomSheetProps) {
  return (
    <Overlay {...overlayProps}>
      {(direction) => (
        <div className={`ron-bottomsheet ron-bottomsheet-${direction} ron-overlay-transition`} style={{ height }}>
          <div className="ron-bottomsheet__header">
            <div className="ron-bottomsheet__title">{title}</div>
            <CloseButton boneOnly className="ron-bottomsheet__close" onClick={overlayProps.onClose} />
          </div>
          <div className="ron-bottomsheet__body">{children}</div>
        </div>
      )}
    </Overlay>
  );
}
