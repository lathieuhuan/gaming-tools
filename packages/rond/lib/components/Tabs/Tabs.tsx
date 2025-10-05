import { cn } from "@lib/utils";
import clsx, { type ClassValue } from "clsx";

const classByLevel = {
  1: "bg-heading",
  2: "bg-secondary-1",
};

export type TabConfig =
  | string
  | {
      text: string;
      disabled?: boolean;
    };

export type TabsProps = {
  className?: ClassValue;
  style?: React.CSSProperties;
  level?: 1 | 2;
  activeIndex?: number;
  configs?: TabConfig[];
  onClickTab?: (index: number) => void;
};

export function Tabs({
  className,
  style,
  level = 1,
  configs,
  activeIndex = 0,
  onClickTab,
}: TabsProps) {
  return (
    <div className={cn("w-full flex rounded-full overflow-hidden divide-x-2 divide-dark-3", className)} style={style}>
      {configs?.map((config, index) => {
        const { text, disabled = false } = typeof config === "string" ? { text: config } : config;

        return (
          <button
            key={index}
            type="button"
            disabled={disabled}
            className={clsx(
              "w-1/2 py-0.5 text-black font-bold flex-center",
              index === activeIndex ? classByLevel[level] : "bg-light-1 glow-on-hover",
              disabled && "is-disabled"
            )}
            onClick={() => onClickTab?.(index)}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
