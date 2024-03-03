import clsx, { type ClassValue } from "clsx";
import type { ButtonHTMLAttributes } from "react";
import "./styles.css";

type ButtonVariant = "default" | "primary" | "danger" | "active" | "custom";

type ButtonShape = "rounded" | "square";

type ButtonSize = "small" | "medium" | "large" | "custom";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  className?: ClassValue;
  /** Default to 'default' */
  variant?: ButtonVariant;
  /** Default to 'rounded' */
  shape?: ButtonShape;
  /** Default to 'medium' */
  size?: ButtonSize;
  icon?: React.ReactNode;
  /** Default to 'start' */
  iconPosition?: "start" | "end";
}

export function Button({
  variant = "default",
  shape = "rounded",
  size = "medium",
  icon,
  iconPosition = "start",
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = [
    `ron-flex-center ron-button ron-button-${shape}`,
    variant !== "custom" && `ron-button-${variant}`,
    rest.disabled ? "ron-disabled" : "ron-glow-on-hover",
    className,
  ];

  return (
    <button
      type="button"
      className={clsx(
        classes,
        iconPosition === "end" && "ron-button-icon-last",
        size !== "custom" ? (children ? `ron-button-${size}` : `ron-icon-button-${size}`) : ""
      )}
      {...rest}
    >
      {icon ? <span className="ron-button-icon">{icon}</span> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}
