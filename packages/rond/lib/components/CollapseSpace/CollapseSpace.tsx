import clsx, { type ClassValue } from "clsx";
import { useElementSize } from "../../hooks";

export interface CollapseSpaceProps {
  className?: ClassValue;
  active: boolean;
  children: React.ReactNode;
  onTransitionEnd?: () => void;
}
export function CollapseSpace({ active, className, children, onTransitionEnd }: CollapseSpaceProps) {
  const [ref, { height }] = useElementSize<HTMLDivElement>();
  const duration = Math.max(Math.min(Math.round(height) / 2, 300), 150);

  return (
    <div
      className={clsx("ron-hide-scrollbar", className)}
      style={{
        height: active ? Math.ceil(height) : 0,
        transition: `height ${duration}ms ease-in-out`,
      }}
      onTransitionEnd={onTransitionEnd}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}
