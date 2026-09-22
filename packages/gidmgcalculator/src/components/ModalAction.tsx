import {
  cloneElement,
  forwardRef,
  MouseEvent,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  useImperativeHandle,
} from "react";
import { isFunction } from "ron-utils";
import { Modal, ModalProps } from "rond";

import { useControllableState } from "@/hooks/useControllableState";

export type ModalActionProps = Omit<ModalProps, "active" | "children" | "onClose"> & {
  open?: boolean;
  content: ReactNode | ((open: boolean, setOpen: (open: boolean) => void) => ReactNode);
  children: ReactElement;
  onOpenChange?: (open: boolean) => void;
};

export type ModalActionRef = {
  open: () => void;
  close: () => void;
};

export const ModalAction = forwardRef<ModalActionRef, ModalActionProps>(
  ({ open: openProp, content, children, onOpenChange, ...modalProps }, ref) => {
    const [open, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: false,
      onChange: (value) => {
        onOpenChange?.(value);
      },
    });

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
    }));

    const handleClick = (e: MouseEvent) => {
      const { onClick } = children.props;

      if (isFunction<MouseEventHandler>(onClick)) {
        onClick(e);
      }

      if (!e.defaultPrevented) {
        setOpen(true);
      }
    };

    return (
      <>
        {cloneElement(children, {
          onClick: handleClick,
        })}

        <Modal active={open} onClose={() => setOpen(false)} {...modalProps}>
          {typeof content === "function" ? content(open, setOpen) : content}
        </Modal>
      </>
    );
  },
);
