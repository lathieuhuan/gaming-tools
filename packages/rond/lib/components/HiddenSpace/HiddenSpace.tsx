import clsx, { type ClassValue } from "clsx";

interface HiddenSpaceProps {
  className?: ClassValue;
  active: boolean;
  activeWidth: string | number;
  /** Default to 200 */
  duration?: number;
  children: React.ReactNode;
  onTransitionEnd?: () => void;
}
export function HiddenSpace({
  className,
  active,
  activeWidth,
  duration = 250,
  children,
  onTransitionEnd,
}: HiddenSpaceProps) {
  return (
    <div
      className={clsx("ron-hide-scrollbar", className)}
      style={{
        width: active ? activeWidth : 0,
        transition: `width ${duration}ms ease-in-out`,
      }}
      onTransitionEnd={onTransitionEnd}
    >
      {children}
    </div>
  );
}
