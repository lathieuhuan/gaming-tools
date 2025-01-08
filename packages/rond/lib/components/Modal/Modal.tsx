import clsx, { type ClassValue } from "clsx";
import { LARGE_HEIGHT_CLS, ModalCore, type ModalCoreProps } from "./ModalCore";
import { ModalActions, type ModalActionsProps, ModalHeader } from "./modal-components";
import { CloseButton } from "../Button";
import "./Modal.styles.scss";

const CLOSE_BTN_CLS = "ron-modal__close-button";

export interface ModalProps
  extends ModalCoreProps,
    Omit<ModalActionsProps, "className" | "justify" | "withDivider" | "onCancel"> {
  title?: React.ReactNode;
  /** Default to true */
  withCloseButton?: boolean;
  withHeaderDivider?: boolean;
  withFooterDivider?: boolean;
  withActions?: boolean;
  bodyCls?: ClassValue;
}
const Modal = ({
  className,
  title,
  withCloseButton = true,
  withHeaderDivider = true,
  withActions,
  closable = true,
  bodyCls,
  children,
  //
  disabledConfirm,
  focusConfirm,
  withFooterDivider = true,
  showCancel,
  cancelText,
  confirmText,
  formId,
  cancelButtonProps,
  confirmButtonProps,
  moreActions = [],
  onConfirm,
  ...coreProps
}: ModalProps) => {
  return (
    <ModalCore {...coreProps} className={clsx("ron-modal--standard", className)} closable={closable}>
      <ModalHeader withDivider={withHeaderDivider}>{title}</ModalHeader>

      <div className={clsx("ron-modal__body", bodyCls)}>{typeof children === "function" ? children() : children}</div>

      {withActions && (
        <div className="ron-modal__footer">
          <ModalActions
            {...{
              withDivider: withFooterDivider,
              disabledConfirm,
              focusConfirm,
              showCancel,
              cancelText,
              confirmText,
              formId,
              cancelButtonProps,
              confirmButtonProps,
              moreActions,
              onCancel: coreProps.onClose,
              onConfirm,
            }}
          />
        </div>
      )}

      {withCloseButton ? (
        <CloseButton
          aria-label="Close"
          className={CLOSE_BTN_CLS}
          boneOnly
          disabled={!closable}
          onClick={() => coreProps.onClose()}
        />
      ) : null}
    </ModalCore>
  );
};

type WithModalPropsKey =
  | "preset"
  | "title"
  | "id"
  | "className"
  | "style"
  | "bodyCls"
  | "formId"
  | "withActions"
  | "withCloseButton"
  | "withHeaderDivider"
  | "withFooterDivider";

function withModal<T>(
  Component: (props: T) => JSX.Element | null,
  modalProps?: Partial<Pick<ModalProps, WithModalPropsKey>>
) {
  return (props: Pick<ModalProps, "active" | "closable" | "closeOnMaskClick" | "onClose"> & T): JSX.Element => {
    return (
      <Modal active={props.active} onClose={props.onClose} {...modalProps}>
        <Component {...props} />
      </Modal>
    );
  };
}

function withCoreModal<T>(
  Component: (props: T) => JSX.Element | null,
  modalProps?: Partial<Pick<ModalCoreProps, "preset" | "className" | "style">>
) {
  return (props: Pick<ModalProps, "active" | "closable" | "closeOnMaskClick" | "onClose"> & T): JSX.Element => {
    return (
      <ModalCore active={props.active} onClose={props.onClose} {...modalProps}>
        <Component {...props} />
      </ModalCore>
    );
  };
}

Modal.LARGE_HEIGHT_CLS = LARGE_HEIGHT_CLS;
Modal.MAX_SIZE_CLS = "ron-modal--max-size";
Modal.CLOSE_BTN_CLS = CLOSE_BTN_CLS;
Modal.Core = ModalCore;
Modal.Header = ModalHeader;
Modal.Actions = ModalActions;
Modal.wrap = withModal;
Modal.coreWrap = withCoreModal;

export { Modal };
