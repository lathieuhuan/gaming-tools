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
      <div className={clsx("w-full flex divide-x-2 rounded-full divide-dark-500 shrink-0 overflow-hidden", className)}>
        {configs.map((config, index) => {
          const isDisabled = disabled[index];

          return (
            <button
              key={index}
              type="button"
              disabled={isDisabled}
              className={clsx(
                "py-0.5 w-1/2 flex-center text-black font-bold",
                index === activeIndex ? (level === 1 ? "bg-orange-500" : "bg-mint-600") : "bg-light-400 glow-on-hover",
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
