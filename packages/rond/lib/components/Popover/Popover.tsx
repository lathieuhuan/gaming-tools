import clsx, { type ClassValue } from "clsx";
import "./Popover.styles.scss";

// Improvement: make Popover a wrapper

export interface PopoverProps {
  className?: ClassValue;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
  active?: boolean;
  withTooltipStyle?: boolean;
  /** style transformOrigin Default to 'bottom right' */
  origin?: string;
  children: React.ReactNode;
}
export const Popover = ({
  className,
  style = {},
  as: Tag = "span",
  active,
  withTooltipStyle,
  origin = "bottom right",
  children,
}: PopoverProps) => {
  return (
    <Tag
      className={clsx(
        `ron-popover`,
        active && "ron-popover--active",
        withTooltipStyle && "bg-black text-light-400 rounded-lg text-sm cursor-default",
        className
      )}
      style={Object.assign(style, { transformOrigin: origin })}
    >
      {children}
    </Tag>
  );
};
