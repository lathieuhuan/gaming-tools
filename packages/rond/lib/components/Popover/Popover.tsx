import clsx, { type ClassValue } from "clsx";
import "./Popover.styles.scss";

// Improvement: make Popover a wrapper

export interface PopoverProps {
  className?: ClassValue;
  style?: React.CSSProperties;
  /** Default to div */
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
  as: Tag = "div",
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
        withTooltipStyle && "ron-popover--tooltip",
        className
      )}
      style={Object.assign(style, { transformOrigin: origin })}
    >
      {children}
    </Tag>
  );
};
