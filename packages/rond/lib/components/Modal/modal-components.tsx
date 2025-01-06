import clsx, { type ClassValue } from "clsx";
import { ButtonGroup, type ButtonGroupItem, type ButtonGroupProps } from "../Button";

export interface ModalHeaderProps {
  className?: ClassValue;
  withDivider?: boolean;
  children?: React.ReactNode;
}
export function ModalHeader({ className, children, withDivider }: ModalHeaderProps) {
  return (
    <div className={clsx("ron-modal__header", className)}>
      <div className={clsx("ron-modal__header__inner", withDivider && "ron-modal__header--with-divider")}>
        {children}
      </div>
    </div>
  );
}

export interface ModalActionsProps extends Pick<ButtonGroupProps, "className" | "justify"> {
  withDivider?: boolean;
  disabledConfirm?: boolean;
  focusConfirm?: boolean;
  /** Default to true */
  showCancel?: boolean;
  /** For inside form */
  formId?: string;
  /** Default to 'Cancel' */
  cancelText?: string;
  /** Default to 'Confirm' */
  confirmText?: string;
  cancelButtonProps?: Omit<ButtonGroupItem, "text" | "onClick">;
  confirmButtonProps?: Omit<ButtonGroupItem, "text" | "onClick">;
  moreActions?: ButtonGroupItem[];
  onCancel?: () => void;
  onConfirm?: () => void;
}
export const ModalActions = ({
  className,
  justify = "end",
  withDivider,
  disabledConfirm,
  focusConfirm,
  showCancel = true,
  cancelText = "Cancel",
  confirmText = "Confirm",
  formId,
  cancelButtonProps,
  confirmButtonProps,
  moreActions = [],
  onCancel,
  onConfirm,
}: ModalActionsProps) => {
  const buttons: ButtonGroupItem[] = [
    ...moreActions,
    {
      children: confirmText,
      variant: "primary",
      type: formId ? "submit" : "button",
      form: formId,
      disabled: disabledConfirm,
      autoFocus: focusConfirm,
      onClick: onConfirm,
      ...confirmButtonProps,
    },
  ];

  if (showCancel) {
    buttons.unshift({
      children: cancelText,
      onClick: () => onCancel?.(),
      ...cancelButtonProps,
    });
  }

  return (
    <ButtonGroup
      className={clsx("ron-modal__actions", withDivider && "ron-modal__actions--with-divider", className)}
      justify={justify}
      buttons={buttons}
    />
  );
};
