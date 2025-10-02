import clsx from "clsx";
import "./ItemCase.styles.scss";

export type ItemCaseProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  children: (className: string, imgCls: string) => React.ReactNode;
  chosen?: boolean;
  muted?: boolean;
};

export function ItemCase({
  className,
  chosen,
  muted,
  children,
  onMouseDown,
  onMouseUp,
  ...rest
}: ItemCaseProps) {
  return (
    <div
      className={clsx(!muted && ["ron-item-case", chosen && "ron-item-case--chosen"], className)}
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
