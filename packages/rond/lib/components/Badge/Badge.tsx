import clsx, { type ClassValue } from "clsx";
import "./Badge.styles.scss";

export interface BadgeProps {
  active?: boolean;
  className?: ClassValue;
  style?: React.CSSProperties;
  children: React.ReactNode;
}
export function Badge({ active = true, className, children, ...rest }: BadgeProps) {
  if (!active) return null;

  return (
    <div className={clsx("ron-badge", className)} {...rest}>
      <span>{children}</span>
    </div>
  );
}
