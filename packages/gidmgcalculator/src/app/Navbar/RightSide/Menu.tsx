import { clsx } from "rond";
import { MENU_OPTIONS, MenuOptionValue } from "./config";

const ALWAYS_ENABLED_OPTIONS: MenuOptionValue[] = ["INTRO", "GUIDES", "VERSIONS"];

type MenuProps = {
  appReady?: boolean;
  onSelect: (value: MenuOptionValue) => void;
};

export function Menu({ appReady, onSelect }: MenuProps) {
  return (
    <ul className="bg-light-1 text-black rounded-md overflow-hidden shadow-common">
      {MENU_OPTIONS.map((option) => {
        const disabled = !appReady && !ALWAYS_ENABLED_OPTIONS.includes(option.value);

        return (
          <li key={option.value}>
            <button
              className={clsx(
                "w-full px-4 py-2 flex items-center font-bold cursor-default",
                disabled ? "text-light-hint" : "hover:text-light-1 hover:bg-dark-1",
              )}
              disabled={disabled}
              onClick={() => onSelect(option.value)}
            >
              {option.icon}
              <span className="ml-2 whitespace-nowrap">{option.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
