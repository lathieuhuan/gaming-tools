import { ReactNode } from "react";
import { clsx } from "rond";

type MenuOptionProps = {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  onSelect: () => void;
};

export function MenuOption({ icon, label, disabled, onSelect }: MenuOptionProps) {
  return (
    <button
      className={clsx(
        "w-full px-4 py-2 flex items-center font-bold cursor-default",
        disabled ? "text-hint-color" : "hover:text-light-default hover:bg-surface-1"
      )}
      disabled={disabled}
      onClick={onSelect}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );
}
