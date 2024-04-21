import clsx, { type ClassValue } from "clsx";
import type { ButtonHTMLAttributes } from "react";
import "./Button.styles.scss";

type ButtonVariant = "default" | "primary" | "danger" | "active" | "custom";

type ButtonShape = "rounded" | "square" | "custom";

type ButtonSize = "small" | "medium" | "large" | "custom";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  className?: ClassValue;
  /** Default to 'default' */
  variant?: ButtonVariant;
  /** Default to 'rounded' */
  shape?: ButtonShape;
  /** Default to 'medium' */
  size?: ButtonSize;
  boneOnly?: boolean;
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
  boneOnly,
  icon,
  iconPosition = "start",
  withShadow = !boneOnly,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = [
    `ron-flex-center ron-button`,
    variant !== "custom" && (boneOnly ? `ron-bone-button--${variant}` : `ron-button--${variant}`),
    shape !== "custom" && `ron-button--${shape}`,
    withShadow && "ron-common-shadow",
    rest.disabled ? "ron-disabled" : "ron-glow-on-hover",
    className,
  ];

  return (
    <button
      type="button"
      className={clsx(
        classes,
        iconPosition === "end" && "ron-button__icon--last",
        size !== "custom" ? (children ? `ron-button--${size}` : `ron-icon-button--${size}`) : ""
      )}
      {...rest}
    >
      {icon ? <span className="ron-button__icon">{icon}</span> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}

interface CloseButtonProps extends Pick<ButtonProps, "className" | "size" | "boneOnly" | "onClick" | "disabled"> {}
export function CloseButton({ boneOnly, className, size = "medium", ...rest }: CloseButtonProps) {
  return (
    <Button
      variant={boneOnly ? "default" : "danger"}
      icon={
        <svg className={`ron-close-button--${size}`} viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
        </svg>
      }
      size={size}
      boneOnly={boneOnly}
      className={["ron-close-button--default", className]}
      {...rest}
    />
  );
}
