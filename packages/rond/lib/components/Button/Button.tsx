import { cn } from "@lib/utils";
import type { ClassValue } from "clsx";
import type { ButtonHTMLAttributes } from "react";
import {
  ButtonShape,
  ButtonSize,
  ButtonVariant,
  CLOSE_ICON_CN_BY_SIZE,
  CN_BY_BONE_VARIANT,
  CN_BY_ICON_SIZE,
  CN_BY_SHAPE,
  CN_BY_SIZE,
  CN_BY_VARIANT,
} from "./config";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  className?: ClassValue;
  /** Default 'default' */
  variant?: ButtonVariant | "custom";
  /** Default 'rounded' */
  shape?: ButtonShape | "custom";
  /** Default 'medium' */
  size?: ButtonSize | "custom";
  boneOnly?: boolean;
  icon?: React.ReactNode;
  /** Default 'start' */
  iconPosition?: "start" | "end";
  /** Default true */
  withShadow?: boolean;
};

export function Button({
  variant = "default",
  shape = "rounded",
  size = "medium",
  boneOnly,
  icon,
  iconPosition = "start",
  withShadow = !boneOnly,
  children,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex-center font-bold text-sm whitespace-nowrap not-disabled:cursor-pointer disabled:is-disabled ron-glow-on-hover",
        variant !== "custom" && (boneOnly ? CN_BY_BONE_VARIANT[variant] : CN_BY_VARIANT[variant]),
        shape !== "custom" && CN_BY_SHAPE[shape],
        withShadow && "shadow-common",
        iconPosition === "end" && "flex-row-reverse",
        size !== "custom" && (children ? CN_BY_SIZE[size] : CN_BY_ICON_SIZE[size]),
        className
      )}
      {...rest}
    >
      {icon ? <span className="flex shrink-0">{icon}</span> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}

export type CloseButtonProps = Pick<
  ButtonProps,
  "className" | "boneOnly" | "onClick" | "disabled"
> &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: ButtonSize;
  };

export function CloseButton({ boneOnly, className, size = "medium", ...rest }: CloseButtonProps) {
  return (
    <Button
      variant={boneOnly ? "default" : "danger"}
      icon={
        <svg
          className={CLOSE_ICON_CN_BY_SIZE[size]}
          viewBox="0 0 24 24"
          width="1em"
          height="1em"
          fill="currentColor"
        >
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
        </svg>
      }
      size={size}
      boneOnly={boneOnly}
      className={["text-white", className]}
      {...rest}
    />
  );
}
