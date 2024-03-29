import { clsx } from "rond";

import type { AppScreen } from "@Store/ui-slice";
import { useSelector } from "@Store/hooks";

interface ActionButtonProps {
  className?: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}
export function ActionButton({ className = "", icon, label, disabled, onClick }: ActionButtonProps) {
  return (
    <button
      className={clsx(
        "px-4 py-2 flex items-center font-bold cursor-default",
        disabled ? "text-hint-color" : "hover:text-light-default hover:bg-surface-1",
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );
}

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
