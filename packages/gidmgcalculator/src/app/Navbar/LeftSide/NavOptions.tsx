import { clsx } from "rond";

import { SCREENS, type ScreenConfig } from "./_config";

export type NavOptionsProps = {
  className?: string;
  itemClassName?: string;
  disabled?: boolean;
  isOptionActive?: (option: ScreenConfig) => boolean;
  onSelect?: (option: ScreenConfig) => void;
};

export function NavOptions({ disabled, className, itemClassName, isOptionActive, onSelect }: NavOptionsProps) {
  return (
    <ul className={className}>
      {SCREENS.map((screen, i) => (
        <button
          key={i}
          className={clsx(
            "w-full px-2 py-1 font-semibold text-start whitespace-nowrap disabled:opacity-50",
            isOptionActive?.(screen) ? "bg-surface-1" : "bg-surface-3 glow-on-hover",
            itemClassName
          )}
          disabled={disabled}
          onClick={() => onSelect?.(screen)}
        >
          {screen.label}
        </button>
      ))}
    </ul>
  );
}
