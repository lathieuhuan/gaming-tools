import { clsx } from "rond";
import type { AppScreen } from "@Store/ui-slice";
import { useSelector } from "@Store/hooks";

export type ScreenOption = {
  label: string;
  value: AppScreen;
  path: string;
};

export interface NavTabsProps {
  ready?: boolean;
  className?: string;
  screens: ScreenOption[];
  activeClassName?: string;
  idleClassName?: string;
  onSelect?: (option: ScreenOption) => void;
}
export function NavTabs({ ready, className = "", screens, activeClassName, idleClassName, onSelect }: NavTabsProps) {
  const atScreen = useSelector((state) => state.ui.atScreen);

  return (
    <>
      {screens.map((screen, i) => (
        <button
          key={i}
          className={clsx(
            "flex items-center whitespace-nowrap",
            screen.value === atScreen ? activeClassName : ready ? idleClassName : "text-hint-color",
            className
          )}
          disabled={!ready}
          onClick={() => onSelect?.(screen)}
        >
          {screen.label}
        </button>
      ))}
    </>
  );
}
