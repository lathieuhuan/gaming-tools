import clsx, { type ClassValue } from "clsx";
import type { ButtonHTMLAttributes } from "react";
import "./Button.styles.scss";

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
  /** Default to true */
  withShadow?: boolean;
}

export function Button({
  variant = "default",
  shape = "rounded",
  size = "medium",
  icon,
  iconPosition = "start",
  withShadow = true,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = [
    `ron-flex-center ron-button ron-button-${shape}`,
    withShadow && "ron-button-shadow",
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

interface CloseButtonProps extends Pick<ButtonProps, "className" | "size" | "onClick" | "disabled"> {
  circled?: boolean;
}
export function CloseButton({ circled, className, size = "medium", ...rest }: CloseButtonProps) {
  return (
    <Button
      variant={circled ? "danger" : "custom"}
      icon={
        <svg className={`ron-close-button-${size}`} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
        </svg>
      }
      size={size}
      className={["ron-close-button-default", className]}
      {...rest}
    />
  );
}
