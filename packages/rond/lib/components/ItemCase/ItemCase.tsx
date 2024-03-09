import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import "./styles.scss";

export interface ItemCaseProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: (className: string, imgCls: string) => ReactNode;
  chosen?: boolean;
}
export function ItemCase({ className, chosen, children, onMouseDown, onMouseUp, ...rest }: ItemCaseProps) {
  return (
    <div
      className={clsx("ron-item-case", chosen && "ron-item-case-chosen", className)}
      onMouseDown={(e) => {
        e.currentTarget.classList.add("ron-item-case-clicked");
        onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        e.currentTarget.classList.remove("ron-item-case-clicked");
        onMouseUp?.(e);
      }}
      {...rest}
    >
      {children("ron-item-case-content", "ron-item-case-img")}
    </div>
  );
}
