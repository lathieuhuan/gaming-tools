import { cn } from "@lib/utils";
import type { ClassValue } from "clsx";

export type BadgeProps = {
  active?: boolean;
  className?: ClassValue;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

export function Badge({ active, className, children, ...rest }: BadgeProps) {
  if (!active) return null;

  return (
    <div
      className={cn(
        "rounded-sm px-1.5 py-px text-xs font-semibold cursor-default text-white bg-danger-1",
        className
      )}
      {...rest}
    >
      <span>{children}</span>
    </div>
  );
}
