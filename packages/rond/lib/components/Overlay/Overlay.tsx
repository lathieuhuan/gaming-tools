import clsx from "clsx";
import ReactDOM from "react-dom";
import { useEffect, useRef, useState } from "react";
import "./Overlay.styles.scss";

type OverlayState = {
  mounted: boolean;
  visible: boolean;
  movingDir: "out" | "in";
};

type TransitionStyle = Pick<React.CSSProperties, "transitionDuration" | "transitionTimingFunction">;

export interface OverlayProps {
  active?: boolean;
  state?: "open" | "close" | "hidden";
  /** Default to true. Dynamic change of this value will not  */
  closable?: boolean;
  /** Default to true */
  closeOnMaskClick?: boolean;
  /** Default to true */
  closeOnEscape?: boolean;
  /** Default to '200' (ms) */
  transitionDuration?: number;
  children: (moving: OverlayState["movingDir"], transitionStyle: TransitionStyle) => React.ReactNode;
  onClose: () => void;
  onTransitionEnd?: (open: boolean) => void;
  getContainer?: () => HTMLElement | null;
}
export function Overlay({
  active,
  state: stateProps,
  closable = true,
  closeOnMaskClick = true,
  closeOnEscape = true,
  transitionDuration = 200,
  children,
  onClose,
  onTransitionEnd,
  getContainer,
}: OverlayProps) {
  const overlayState = stateProps || (active ? "open" : "close");

  const [state, setState] = useState<OverlayState>({
    mounted: false,
    visible: true,
    movingDir: "in",
  });
  const _ = useRef({
    overlayState,
    closable,
    closeOnEscape,
  });

  _.current = {
    overlayState,
    closable,
    closeOnEscape,
  };

  const closeOverlay = (shouldSync = true) => {
    if (_.current.closable) {
      setState((prev) => ({ ...prev, movingDir: "in" }));

      setTimeout(() => {
        setState((prev) => ({ ...prev, mounted: false }));
        onTransitionEnd?.(false);

        if (shouldSync) {
          onClose();
        }
      }, transitionDuration);
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
        closeOverlay(false);
      } else if (overlayState === "hidden") {
        setState((prev) => ({ ...prev, movingDir: "in" }));

        setTimeout(() => {
          setState((prev) => ({ ...prev, visible: false }));
          onTransitionEnd?.(false);
        }, transitionDuration);
      }
    }
  }, [overlayState]);

  useEffect(() => {
    const handlePressEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && _.current.overlayState === "open" && _.current.closeOnEscape) {
        closeOverlay();
      }
    };
    document.addEventListener("keydown", handlePressEsc, true);

    return () => {
      document.removeEventListener("keydown", handlePressEsc, true);
    };
  }, []);

  const overlayManager = useOverlayManager();

  const transitionStyle: TransitionStyle = {
    transitionTimingFunction: "ease-in-out",
    transitionDuration: `${transitionDuration}ms`,
  };

  return state.mounted
    ? ReactDOM.createPortal(
        <div className={clsx("ron-overlay", !state.visible && "ron-overlay--invisible")}>
          <div
            className={`ron-overlay__mask ron-overlay__mask--${state.movingDir} ron-overlay-transition`}
            style={{
              transitionProperty: "opacity, transform",
              ...transitionStyle,
            }}
            onTransitionEnd={() => {
              if (state.movingDir === "out") onTransitionEnd?.(true);
            }}
            onClick={() => {
              if (closeOnMaskClick) closeOverlay();
            }}
          />

          {children(state.movingDir, transitionStyle)}
        </div>,
        getContainer?.() ?? overlayManager
      )
    : null;
}

export function findParentOverlay(selectElmt: HTMLElement) {
  const overlays = Array.from(document.querySelectorAll(".ron-overlay"));
  return overlays.find((elmt) => elmt.contains(selectElmt)) as HTMLElement;
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
