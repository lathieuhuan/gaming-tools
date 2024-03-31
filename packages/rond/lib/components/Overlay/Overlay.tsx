import clsx from "clsx";
import ReactDOM from "react-dom";
import { useEffect, useRef, useState } from "react";
import "./Overlay.styles.scss";

type OverlayState = {
  mounted: boolean;
  visible: boolean;
  movingDir: "out" | "in";
};

export interface OverlayProps {
  active?: boolean;
  state?: "open" | "close" | "hidden";
  /** Default to true */
  closable?: boolean;
  /** Default to true */
  closeOnMaskClick?: boolean;
  children: (moving: OverlayState["movingDir"]) => React.ReactNode;
  onClose: () => void;
}
export function Overlay({
  active,
  state: stateProps,
  closable = true,
  closeOnMaskClick = true,
  children,
  onClose,
}: OverlayProps) {
  const [state, setState] = useState<OverlayState>({
    mounted: false,
    visible: true,
    movingDir: "in",
  });
  const overlayState = stateProps || (active ? "open" : "close");

  const closeOverlay = () => {
    if (closable) {
      setState((prev) => ({ ...prev, movingDir: "in" }));

      setTimeout(() => {
        setState((prev) => ({ ...prev, mounted: false }));
        onClose();
      }, 150);
    }
  };

  useEffect(() => {
    if (overlayState === "open") {
      setState((prev) => ({
        ...prev,
        mounted: true,
        visible: true,
      }));

      setTimeout(() => {
        setState((prev) => ({ ...prev, movingDir: "out" }));
      }, 50);
    } //
    else if (state.mounted) {
      if (overlayState === "close") {
        closeOverlay();
      } else if (overlayState === "hidden") {
        setState((prev) => ({ ...prev, movingDir: "in" }));

        setTimeout(() => {
          setState((prev) => ({ ...prev, visible: false }));
        }, 150);
      }
    }

    const handlePressEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && overlayState === "open") {
        closeOverlay();
      }
    };
    document.addEventListener("keydown", handlePressEsc, true);

    return () => {
      document.removeEventListener("keydown", handlePressEsc, true);
    };
  }, [overlayState]);

  const overlayManager = useOverlayManager();

  return state.mounted
    ? ReactDOM.createPortal(
        <div className={clsx("ron-overlay-core", !state.visible && "ron-overlay-core-invisible")}>
          <div
            className={`ron-overlay-mask ron-overlay-mask-${state.movingDir} ron-overlay-transition`}
            onClick={closeOnMaskClick ? closeOverlay : undefined}
          />

          {children(state.movingDir)}
        </div>,
        overlayManager
      )
    : null;
}

function useOverlayManager() {
  const overlayManagerRef = useRef(document.getElementById("ron-overlay-manager") as HTMLDivElement | null);

  if (!overlayManagerRef.current) {
    const manager = document.createElement("div");
    manager.id = "ron-overlay-manager";
    document.body.append(manager);
    overlayManagerRef.current = manager;
  }
  return overlayManagerRef.current;
}
