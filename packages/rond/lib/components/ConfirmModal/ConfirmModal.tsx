import { useRef } from "react";
import { Modal, type ModalControl } from "../Modal";
import type { ModalActionsProps } from "../Modal/modal-components";

export type ConfirmModalBodyProps = Omit<ModalActionsProps, "className" | "justify" | "formId"> & {
  danger?: boolean;
  message: string | JSX.Element;
};

const ConfirmModalBody = ({ message, ...actionsProps }: ConfirmModalBodyProps) => {
  const contentRef = useRef(
    <>
      <div className="px-0.5 text-center text-xl text-white">{message}</div>
      <Modal.Actions justify="center" {...actionsProps} />
    </>
  );
  return <div className="p-4 bg-dark-2">{contentRef.current}</div>;
};

const ConfirmModal = ({
  active,
  danger,
  confirmButtonProps,
  onClose,
  onCancel,
  onConfirm,
  ...bodyProps
}: ConfirmModalBodyProps & ModalControl) => {
  return (
    <Modal.Core active={active} preset="small" onClose={onClose}>
      <ConfirmModalBody
        {...bodyProps}
        confirmButtonProps={{
          variant: danger ? "danger" : "primary",
          ...confirmButtonProps,
        }}
        onCancel={() => {
          onCancel?.();
          onClose();
        }}
        onConfirm={() => {
          onConfirm?.();
          onClose();
        }}
      />
    </Modal.Core>
  );
};

ConfirmModal.Body = ConfirmModalBody;

export { ConfirmModal };
