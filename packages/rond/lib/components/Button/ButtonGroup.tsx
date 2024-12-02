import clsx, { type ClassValue } from "clsx";
import type { RefObject } from "react";
import { Button, type ButtonProps } from "./Button";
import "./ButtonGroup.styles.scss";

type Justify = "start" | "center" | "end";

export type ButtonGroupItem = ButtonProps;

export interface ButtonGroupProps {
  groupRef?: RefObject<HTMLDivElement>;
  className?: ClassValue;
  /** Default to 'center' */
  justify?: Justify;
  buttons: ButtonGroupItem[];
}
function ButtonGroup({ groupRef, className, justify = "center", buttons }: ButtonGroupProps) {
  return (
    <div ref={groupRef} className={clsx(`ron-button-group ron-button-group--${justify}`, className)}>
      {buttons.map(({ className, ...others }, i) => {
        return <Button key={i} className={clsx("ron-button--focus-shadow", className)} {...others} />;
      })}
    </div>
  );
}

export interface ConfirmButtonGroupProps extends Pick<ButtonGroupProps, "className" | "justify"> {
  danger?: boolean;
  disabledConfirm?: boolean;
  focusConfirm?: boolean;
  /** Default to 'Cancel' */
  cancelText?: string;
  /** Default to 'Confirm' */
  confirmText?: string;
  cancelButtonProps?: Omit<ButtonGroupItem, "children" | "onClick">;
  confirmButtonProps?: Omit<ButtonGroupItem, "children" | "onClick">;
  onCancel?: () => void;
  onConfirm?: () => void;
}
ButtonGroup.Confirm = ({
  danger,
  disabledConfirm,
  focusConfirm,
  cancelText = "Cancel",
  confirmText = "Confirm",
  cancelButtonProps,
  confirmButtonProps,
  onCancel,
  onConfirm,
  ...props
}: ConfirmButtonGroupProps) => {
  return (
    <ButtonGroup
      buttons={[
        { children: cancelText, onClick: onCancel, ...cancelButtonProps },
        {
          children: confirmText,
          variant: danger ? "danger" : "primary",
          disabled: disabledConfirm,
          autoFocus: focusConfirm,
          onClick: onConfirm,
          ...confirmButtonProps,
        },
      ]}
      {...props}
    />
  );
};

export { ButtonGroup };
