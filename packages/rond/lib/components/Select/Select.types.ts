import { type ClassValue } from "clsx";
import { type SelectProps as RcProps } from "rc-select";
import { type ButtonProps } from "../Button";

export type SelectValueType = string | number;

export type SelectOption<T extends Record<string, unknown> = Record<string, unknown>> = {
  label: SelectValueType;
  value: SelectValueType;
  data?: T;
  disabled?: boolean;
  className?: string;
};

export type SelectAction = Pick<ButtonProps, "variant" | "icon" | "disabled"> & {
  onClick?: (value: SelectValueType) => void;
};

export interface SelectCoreProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends Pick<RcProps, "id" | "open" | "disabled" | "placeholder" | "showSearch" | "getPopupContainer"> {
  className?: ClassValue;
  dropdownCls?: ClassValue;
  style?: React.CSSProperties;
  /** Default to 'small' */
  size?: "small" | "medium";
  /** Default to 'left' */
  align?: "left" | "right";
  /** Default to 'end' */
  arrowAt?: "start" | "end";
  transparent?: boolean;
  showAllOptions?: boolean;
  options?: SelectOption<T>[];
  value?: SelectValueType;
  defaultValue?: SelectValueType;
  onChange?: (value: SelectValueType, option: SelectOption<T>) => void;
}

export interface SelectProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends SelectCoreProps<T>,
    Pick<RcProps, "title"> {
  /** Only when select has action */
  wrapperCls?: string;
  /** Only when select has action */
  wrapperStyle?: React.CSSProperties;
  action?: SelectAction;
}
