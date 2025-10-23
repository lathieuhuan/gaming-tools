import { clsx } from "rond";
import { MODAL_OPTIONS, type ModalOption } from "./_config";
import { ReactNode } from "react";

export type ModalOptionsProps = {
  className?: string;
  disabledTypes?: ModalOption["modalType"][];
  onSelect: (option: ModalOption) => void;
};

export function ModalOptions({ className, disabledTypes, onSelect }: ModalOptionsProps) {
  return (
    <ul className={className}>
      {MODAL_OPTIONS.map((option) => {
        const { modalType } = option;
        const disabled = disabledTypes?.includes(modalType);

        return (
          <li key={modalType}>
            <MenuOption {...option} disabled={disabled} onSelect={() => onSelect(option)} />
          </li>
        );
      })}
    </ul>
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
    <button
      className={clsx(
        "w-full px-4 py-2 flex items-center font-bold cursor-default",
        props.disabled ? "text-light-hint" : "hover:text-light-1 hover:bg-dark-1"
      )}
      disabled={props.disabled}
      onClick={() => props.onSelect()}
    >
      {props.icon}
      <span className="ml-2 whitespace-nowrap">{props.label}</span>
    </button>
  );
}
