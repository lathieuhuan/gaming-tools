import type { ClassValue } from "clsx";
import { forwardRef } from "react";

import { cn } from "@lib/utils";

// Improvement: make Popover a wrapper

export type PopoverProps = Omit<React.HTMLAttributes<HTMLDivElement>, "className"> & {
  className?: ClassValue;
  active?: boolean;
  withTooltipStyle?: boolean;
  /** style transformOrigin Default 'bottom right' */
  origin?: string;
};

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  (
    { className, active, withTooltipStyle, origin = "bottom right", style, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="popover"
        className={cn(
          "absolute z-10 transition duration-200 ease-linear cursor-default",
          active ? "scale-100" : "scale-0",
          withTooltipStyle && "rounded-lg text-sm bg-black text-light-2",
          className
        )}
        style={{ ...style, transformOrigin: origin }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
