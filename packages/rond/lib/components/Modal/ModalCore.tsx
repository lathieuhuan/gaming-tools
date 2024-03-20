import clsx, { type ClassValue } from "clsx";
import ReactDOM from "react-dom";
import { useEffect, useState, useRef } from "react";

type ModalPreset = "small" | "large" | "custom";

export const LARGE_HEIGHT_CLS = "ron-modal-content-large-height";

export interface ModalControl {
  active?: boolean;
  onClose: () => void;
}

type ModalState = {
  mounted: boolean;
  visible: boolean;
  movingDir: "out" | "in";
};

export interface ModalCoreProps extends ModalControl {
  state?: "open" | "close" | "hidden";
  /** Default to 'custom' */
  preset?: ModalPreset;
  /** Default to true */
  closable?: boolean;
  /** Default to true */
  closeOnMaskClick?: boolean;
  className?: ClassValue;
  style?: React.CSSProperties;
  children: React.ReactNode | (() => JSX.Element | null);
}
export const ModalCore = ({
  active,
  closable = true,
  closeOnMaskClick = true,
  className,
  preset = "custom",
  style,
  state: stateProp,
  children,
  onClose,
}: ModalCoreProps) => {
  const [state, setState] = useState<ModalState>({
    mounted: false,
    visible: true,
    movingDir: "in",
  });
  const modalState = stateProp || (active ? "open" : "close");

  const closeModal = () => {
    if (closable) {
      setState((prev) => ({ ...prev, movingDir: "in" }));

      setTimeout(() => {
        setState((prev) => ({ ...prev, mounted: false }));
        onClose();
      }, 150);
    }
  };

  useEffect(() => {
    if (modalState === "open") {
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
      if (modalState === "close") {
        closeModal();
      } else if (modalState === "hidden") {
        setState((prev) => ({ ...prev, movingDir: "in" }));

        setTimeout(() => {
          setState((prev) => ({ ...prev, visible: false }));
        }, 150);
      }
    }

    const handlePressEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalState === "open") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handlePressEsc, true);

    return () => {
      document.removeEventListener("keydown", handlePressEsc, true);
    };
  }, [modalState]);

  const modalManager = useModalManager();

  return state.mounted
    ? ReactDOM.createPortal(
        <div className={clsx("ron-modal-core", !state.visible && "ron-modal-core-invisible")}>
          <div
            className={`ron-modal-mask ron-modal-mask-${state.movingDir} ron-modal-transition`}
            onClick={closeOnMaskClick ? closeModal : undefined}
          />

          <div
            className={clsx(
              `ron-modal-content ron-modal-content-${preset} ron-modal-content-${state.movingDir} ron-modal-transition`,
              preset === "large" && LARGE_HEIGHT_CLS,
              className
            )}
            style={style}
          >
            {typeof children === "function" ? children() : children}
          </div>
        </div>,
        modalManager
      )
    : null;
};

function useModalManager() {
  const modalManagerRef = useRef(document.getElementById("ron-modal-manager") as HTMLDivElement | null);

  if (!modalManagerRef.current) {
    const manager = document.createElement("div");
    manager.id = "ron-modal-manager";
    document.body.append(manager);
    modalManagerRef.current = manager;
  } else if (!document.body.querySelector("#ron-modal-manager")) {
    document.body.append(modalManagerRef.current);
  }

  return modalManagerRef.current;
}
