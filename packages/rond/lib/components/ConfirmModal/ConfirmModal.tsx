import { useRef } from "react";
import { Modal, type ModalControl } from "../Modal";
import type { ModalActionsProps } from "../Modal/modal-components";
import "./ConfirmModal.styles.scss";

export interface ConfirmModalBodyProps extends Omit<ModalActionsProps, "className" | "justify" | "formId"> {
  danger?: boolean;
  message: string | JSX.Element;
}
const ConfirmModalBody = ({ message, ...actionsProps }: ConfirmModalBodyProps) => {
  const contentRef = useRef(
    <>
      <p className="ron-modal-confirm-message">{message}</p>
      <Modal.Actions justify="center" {...actionsProps} />
    </>
  );
  return <div className="ron-modal-confirm-body">{contentRef.current}</div>;
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
