import type { ClassValue } from "clsx";
import { cn } from "@lib/utils";
import "./ItemCase.styles.scss";

export type ItemCaseProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  className?: ClassValue;
  selected?: boolean;
  muted?: boolean;
  children: (className: string, imgCls: string) => React.ReactNode;
};

export function ItemCase({
  className,
  selected,
  muted,
  children,
  onMouseDown,
  onMouseUp,
  ...rest
}: ItemCaseProps) {
  return (
    <div
      className={cn(!muted && ["ron-item-case", selected && "ron-item-case--selected"], className)}
      onMouseDown={(e) => {
        e.currentTarget.classList.add("ron-item-case--clicked");
        onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        e.currentTarget.classList.remove("ron-item-case--clicked");
        onMouseUp?.(e);
      }}
      {...rest}
    >
      {children("ron-item-case__content", "ron-item-case__img")}
    </div>
  );
}
