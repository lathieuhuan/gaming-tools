import { useState } from "react";
import { clsx, type ClassValue } from "rond";

interface TabConfig {
  text: string;
}
interface UseTabArgs {
  level?: number;
  defaultIndex?: number;
  configs: TabConfig[];
}
export function useTabs({ level = 1, defaultIndex = 0, configs }: UseTabArgs) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const renderTabs = (className?: ClassValue, disabled: (boolean | undefined)[] = []) => {
    return (
      <div className={clsx("w-full flex divide-x-2 rounded-full divide-surface-3 shrink-0 overflow-hidden", className)}>
        {configs.map((config, index) => {
          const isDisabled = disabled[index];

          return (
            <button
              key={index}
              type="button"
              disabled={isDisabled}
              className={clsx(
                "py-0.5 w-1/2 flex-center text-black font-bold",
                index === activeIndex ? (level === 1 ? "bg-heading-color" : "bg-secondary-1") : "bg-light-default glow-on-hover",
                isDisabled && "opacity-50"
              )}
              onClick={() => setActiveIndex(index)}
            >
              {config.text}
            </button>
          );
        })}
      </div>
    );
  };

  return {
    activeIndex,
    setActiveIndex,
    renderTabs,
  };
}
