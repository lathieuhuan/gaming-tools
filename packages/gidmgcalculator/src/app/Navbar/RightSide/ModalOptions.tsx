import { clsx } from "rond";
import { MODAL_OPTIONS, type ModalOption } from "./_config";

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
            <button
              className={clsx(
                "w-full px-4 py-2 flex items-center font-bold cursor-default",
                disabled ? "text-hint-color" : "hover:text-light-default hover:bg-surface-1"
              )}
              disabled={disabled}
              onClick={() => onSelect(option)}
            >
              {option.icon}
              <span className="ml-2">{option.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
