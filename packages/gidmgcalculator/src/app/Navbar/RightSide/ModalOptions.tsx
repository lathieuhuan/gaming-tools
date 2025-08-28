import { MODAL_OPTIONS, type ModalOption } from "./config";
import { MenuOption } from "./MenuOption";

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
            <MenuOption icon={option.icon} label={option.label} disabled={disabled} onSelect={() => onSelect(option)} />
          </li>
        );
      })}
    </ul>
  );
}
