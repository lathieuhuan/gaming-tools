import type { ClassValue } from "clsx";
import { cn } from "@lib/utils";
import { ButtonGroup, type ButtonGroupItem, type ButtonGroupProps } from "../Button";

export type ModalHeaderProps = {
  className?: ClassValue;
  withDivider?: boolean;
  children?: React.ReactNode;
};

export function ModalHeader({ className, children, withDivider }: ModalHeaderProps) {
  return (
    <div className={cn("px-4 pt-4 text-xl text-heading font-semibold", className)}>
      <div className={cn("pb-2", withDivider && "border-b border-dark-line/80")}>{children}</div>
    </div>
  );
}

export type ModalActionsProps = Pick<ButtonGroupProps, "className" | "justify"> & {
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
};

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
      className={cn("pt-4", withDivider && "border-t border-dark-line/80", className)}
      justify={justify}
      buttons={buttons}
    />
  );
};
