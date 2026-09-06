import { ReactNode } from "react";
import { clsx } from "rond";

export function Menu({ children }: { children: ReactNode }) {
  return (
    <ul className="bg-light-1 text-black rounded-md overflow-hidden shadow-common">{children}</ul>
  );
}

export type MenuOptionProps = {
  icon: ReactNode;
  label: string;
  disabled?: boolean;
  onSelect: () => void;
};

export function MenuOption(props: MenuOptionProps) {
  return (
    <li>
      <button
        className={clsx(
          "w-full px-4 py-2 flex items-center font-bold cursor-default",
          props.disabled ? "text-light-hint" : "hover:text-light-1 hover:bg-dark-1",
        )}
        disabled={props.disabled}
        onClick={() => props.onSelect()}
      >
        {props.icon}
        <span className="ml-2 whitespace-nowrap">{props.label}</span>
      </button>
    </li>
  );
}
