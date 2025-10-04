import type { ClassValue } from "clsx";
import { cn } from "@lib/utils";

// Improvement: make Popover a wrapper

export type PopoverProps = {
  className?: ClassValue;
  style?: React.CSSProperties;
  /** Default to div */
  as?: keyof JSX.IntrinsicElements;
  active?: boolean;
  withTooltipStyle?: boolean;
  /** style transformOrigin Default to 'bottom right' */
  origin?: string;
  children: React.ReactNode;
};

export const Popover = ({
  className,
  style = {},
  as: Tag = "div",
  active,
  withTooltipStyle,
  origin = "bottom right",
  children,
}: PopoverProps) => {
  return (
    <Tag
      data-active={active}
      className={cn(
        'absolute z-10 transition duration-200 ease-linear scale-0 data-[active=true]:scale-100 cursor-default',
        withTooltipStyle && "rounded-lg text-sm bg-black text-light-3",
        className
      )}
      style={{ ...style, transformOrigin: origin }}
    >
      {children}
    </Tag>
  );
};
