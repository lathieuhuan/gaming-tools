import type { ClassValue } from "clsx";
import type { RefObject } from "react";
import { Button, type ButtonProps } from "./Button";
import { cn } from "@lib/utils";

type Justify = "start" | "center" | "end";

export type ButtonGroupItem = ButtonProps;

export type ButtonGroupProps = {
  groupRef?: RefObject<HTMLDivElement>;
  className?: ClassValue;
  /** Default to 'center' */
  justify?: Justify;
  buttons: ButtonGroupItem[];
};

function ButtonGroup({ groupRef, className, justify = "center", buttons }: ButtonGroupProps) {
  return (
    <div
      ref={groupRef}
      className={cn(
        `flex gap-3`,
        justify === "center" && "justify-center",
        justify === "end" && "justify-end",
        className
      )}
    >
      {buttons.map(({ className, ...others }, i) => {
        return (
          <Button
            key={i}
            // TODO: check if this shadow is overwritten shadow-common in consuming app
            className={cn("focus:shadow-[0_0_3px_2px_black,_0_0_2px_3px_white]", className)}
            {...others}
          />
        );
      })}
    </div>
  );
}

export type ConfirmButtonGroupProps = Pick<ButtonGroupProps, "className" | "justify"> & {
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
};

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
