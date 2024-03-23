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
}

interface NavTabsProps {
  ready?: boolean;
  className?: string;
  activeClassName?: string;
  idleClassName?: string;
  onClickTab?: (tab: AppScreen) => void;
}
export function NavTabs({ ready, className = "", activeClassName, idleClassName, onClickTab }: NavTabsProps) {
  const atScreen = useSelector((state) => state.ui.atScreen);
  const screens: Array<{
    label: string;
    value: AppScreen;
  }> = [
    { label: "My Characters", value: "MY_CHARACTERS" },
    { label: "My Weapons", value: "MY_WEAPONS" },
    { label: "My Artifacts", value: "MY_ARTIFACTS" },
    { label: "My Setups", value: "MY_SETUPS" },
    { label: "Calculator", value: "CALCULATOR" },
  ];

  return (
    <>
      {screens.map((screen, i) => (
        <button
          key={i}
          className={clsx(
            "flex items-center",
            screen.value === atScreen ? activeClassName : ready ? idleClassName : "text-light-800",
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
