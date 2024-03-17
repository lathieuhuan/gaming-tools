import clsx from "clsx";
import type { ReactNode } from "react";

import type { AppScreen } from "@Store/ui-slice";
import { useSelector } from "@Store/hooks";

interface ActionButtonProps {
  className?: string;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}
export const ActionButton = ({ className = "", icon, label, disabled, onClick }: ActionButtonProps) => {
  return (
    <button
      className={clsx(
        "px-4 py-2 flex items-center font-bold cursor-default",
        disabled ? "text-light-800" : "hover:text-light-400 hover:bg-dark-900",
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );
};

interface NavTabsProps {
  ready?: boolean;
  className?: string;
  activeClassName?: string;
  idleClassName?: string;
  onClickTab?: (tab: AppScreen) => void;
}
export function NavTabs({ ready, className = "", activeClassName, idleClassName, onClickTab }: NavTabsProps) {
  const atScreen = useSelector((state) => state.ui.atScreen);
  const screens: AppScreen[] = ["MY_CHARACTERS", "MY_WEAPONS", "MY_ARTIFACTS", "CALCULATOR"];

  return (
    <>
      {screens.map((screen, i) => (
        <button
          key={i}
          className={clsx(
            "flex items-center",
            screen === atScreen ? activeClassName : ready ? idleClassName : "text-light-800",
            className
          )}
          disabled={!ready}
          onClick={() => onClickTab?.(screen)}
        >
          {screen}
        </button>
      ))}
    </>
  );
}
