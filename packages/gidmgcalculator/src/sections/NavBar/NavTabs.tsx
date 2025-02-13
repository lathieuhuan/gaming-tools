import { clsx } from "rond";
import type { AppScreen } from "@Store/ui-slice";
import { useSelector } from "@Store/hooks";

export interface NavTabsProps {
  ready?: boolean;
  className?: string;
  screens: Array<{
    label: string;
    value: AppScreen;
  }>;
  activeClassName?: string;
  idleClassName?: string;
  onClickTab?: (tab: AppScreen) => void;
}
export function NavTabs({ ready, className = "", screens, activeClassName, idleClassName, onClickTab }: NavTabsProps) {
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
          onClick={() => onClickTab?.(screen.value)}
        >
          {screen.label}
        </button>
      ))}
    </>
  );
}
