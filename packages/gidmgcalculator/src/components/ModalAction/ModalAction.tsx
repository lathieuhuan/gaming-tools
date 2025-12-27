import { cloneElement } from "react";
import { Modal, ModalProps } from "rond";

import { useControllableState } from "@/hooks/useControllableState";

type ModalActionProps = Omit<ModalProps, "children" | "onClose"> & {
  content: ModalProps["children"];
  children: React.ReactElement;
  onOpenChange?: (open: boolean) => void;
};

export function ModalAction({
  active,
  content,
  children,
  onOpenChange,
  ...modalProps
}: ModalActionProps) {
  const [open, setOpen] = useControllableState({
    prop: active,
    defaultProp: false,
    onChange: (value) => {
      onOpenChange?.(value);
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);

    const { onClick } = children.props;

    if (typeof onClick === "function") {
      onClick(e);
    }
  };

  return (
    <>
      {cloneElement(children, {
        onClick: handleClick,
      })}

      <Modal active={open} onClose={() => setOpen(false)} {...modalProps}>
        {content}
      </Modal>
    </>
  );
}
