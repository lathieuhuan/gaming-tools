import clsx, { type ClassValue } from "clsx";
import { Button, type ButtonProps } from "./Button";
import "./ButtonGroup.styles.scss";

type Justify = "start" | "center" | "end";
type Space = "default" | "wide";

export type ButtonGroupItem = ButtonProps;

export interface ButtonGroupProps {
  className?: ClassValue;
  /** Default to 'center' */
  justify?: Justify;
  buttons: ButtonGroupItem[];
  /** Default to 'default' (12px) */
  space?: Space;
}
function ButtonGroup({ className, justify = "center", buttons }: ButtonGroupProps) {
  return (
    <div className={clsx(`ron-button-group ron-button-group-${justify}`, className)}>
      {buttons.map(({ className, ...others }, i) => {
        return <Button key={i} className={clsx("ron-button-focus-shadow", className)} {...others} />;
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
