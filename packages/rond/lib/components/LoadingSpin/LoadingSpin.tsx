import clsx, { type ClassValue } from "clsx";
import type { CSSProperties } from "react";
import "./styles.scss";

export interface LoadingSpinProps {
  className?: ClassValue;
  style?: CSSProperties;
  /** Default to true */
  active?: boolean;
  /** Default to 'medium' */
  size?: "small" | "medium" | "large";
}
export const LoadingSpin = ({ active = true, size = "medium", className, ...rest }: LoadingSpinProps) => {
  return active ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlSpace="preserve"
      x="0px"
      y="0px"
      width="1em"
      height="1em"
      viewBox="0 0 50 50"
      className={clsx(`ron-loading-spin ron-loading-spin-${size}`, className)}
      {...rest}
    >
      <path
        fill="currentColor"
        d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"
      >
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="0.6s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  ) : null;
};
