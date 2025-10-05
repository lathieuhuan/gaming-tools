import { cn } from "@lib/utils";
import type { ClassValue } from "clsx";

export type CarouselSpaceProps = {
  className?: ClassValue;
  current?: number;
  children: React.ReactNode;
  onTransitionEnd?: (current: number) => void;
};

export const CarouselSpace = ({
  className,
  current = 0,
  children,
  onTransitionEnd,
}: CarouselSpaceProps) => {
  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={cn("relative size-full overflow-hidden", className)}>
      <div
        className="absolute top-0 h-full flex transition-transform duration-300 ease-linear"
        style={{
          width: `calc(${items.length} * 100%)`,
          transform: `translateX(calc(-${current / items.length} * 100%))`,
        }}
        onTransitionEnd={() => onTransitionEnd?.(current)}
      >
        {items.map((item, index) => {
          return (
            <div
              key={index}
              className="size-full shrink-0"
              style={{ width: `${100 / items.length}%` }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};
