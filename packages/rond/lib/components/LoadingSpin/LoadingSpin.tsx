import clsx, { type ClassValue } from "clsx";
import type { CSSProperties } from "react";
import "./LoadingSpin.styles.scss";

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
      width="1em"
      height="1em"
      viewBox="0 0 512 512"
      className={clsx(`ron-loading-spin ron-loading-spin--${size}`, className)}
      {...rest}
    >
      <path
        fill="currentColor"
        d="M240.5 32.6c-39.3 4.1-74.2 16.4-105.4 37.1-54 35.9-89.4 92.9-98.2 158.3-1.7 12.2-1.7 43.9-.1 55.5 8.2 58.2 35.1 107.7 78.1 143.7 88.7 74 216.8 69.7 299.5-10.2 26.3-25.4 45.8-56.3 57.2-90.5 5.9-17.6 6.4-25.7 2.3-34.6-10.4-22.2-40.6-25.4-54.8-5.9-1.7 2.3-4.7 9.6-7 16.8-18.8 58.1-63.9 98.5-123.3 110.4-15.1 3-42.3 3.2-57.3.4-50.6-9.4-92.6-40.8-115.4-86.5-37.5-74.7-10.5-165.9 61.7-208.8 15-9 33.2-15.8 51.5-19.5 9.1-1.8 14.6-2.2 29.2-2.3 18.1 0 24.5.7 41.5 4.7 12.6 2.9 22.4.8 30.8-6.7 15.6-14 13.7-39.3-3.8-50.5-5.3-3.4-18.2-7-34.2-9.5-9.9-1.5-43.8-2.8-52.3-1.9"
      >
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="rotate"
          from="0 256 256"
          to="360 256 256"
          dur="0.7s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  ) : null;
};
