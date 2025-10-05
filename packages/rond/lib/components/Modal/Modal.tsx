import type { ClassValue } from "clsx";
import { cn } from "@lib/utils";
import { CloseButton } from "../Button";
import { LARGE_HEIGHT_CLS, ModalCore, type ModalCoreProps } from "./ModalCore";
import { ModalActions, type ModalActionsProps, ModalHeader } from "./modal-components";

const CLOSE_BTN_CLS = "absolute top-2 right-2 z-20";

export type ModalProps = ModalCoreProps &
  Omit<ModalActionsProps, "className" | "justify" | "withDivider" | "onCancel"> & {
    title?: React.ReactNode;
    /** Default to true */
    withCloseButton?: boolean;
    withHeaderDivider?: boolean;
    withFooterDivider?: boolean;
    withActions?: boolean;
    bodyCls?: ClassValue;
  };

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
    <ModalCore
      {...coreProps}
      className={cn("flex flex-col rounded-lg shadow-popup", className)}
      closable={closable}
    >
      <ModalHeader withDivider={withHeaderDivider}>{title}</ModalHeader>

      <div className={cn("p-4 grow overflow-auto", bodyCls)}>
        {typeof children === "function" ? children() : children}
      </div>

      {withActions && (
        <div className="px-4 pb-4">
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

type WithModalProps = Pick<
  ModalProps,
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
  | "withFooterDivider"
>;

function withModal<T>(
  Component: (props: T) => JSX.Element | null,
  modalProps?: Partial<WithModalProps>
) {
  return (
    props: Pick<ModalProps, "active" | "closable" | "closeOnMaskClick" | "onClose"> & T
  ): JSX.Element => {
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
  return (
    props: Pick<ModalProps, "active" | "closable" | "closeOnMaskClick" | "onClose"> & T
  ): JSX.Element => {
    return (
      <ModalCore active={props.active} onClose={props.onClose} {...modalProps}>
        <Component {...props} />
      </ModalCore>
    );
  };
}

Modal.LARGE_HEIGHT_CLS = LARGE_HEIGHT_CLS;
Modal.MAX_SIZE_CLS =
  "h-95/100 max-[380px]:h-full max-[380px]:max-h-208 max-[380px]:w-full max-[380px]:max-w-full";
Modal.CLOSE_BTN_CLS = CLOSE_BTN_CLS;
Modal.Core = ModalCore;
Modal.Header = ModalHeader;
Modal.Actions = ModalActions;
Modal.wrap = withModal;
Modal.coreWrap = withCoreModal;

export { Modal };
