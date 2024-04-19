import { type ClassValue } from "clsx";
import { type SelectProps as RcProps } from "rc-select";
import { type ButtonProps } from "../Button";

export type SelectValueType = string | number;

export type SelectOption = {
  label: SelectValueType;
  value: SelectValueType;
  disabled?: boolean;
  className?: string;
};

export type SelectAction = Pick<ButtonProps, "variant" | "icon" | "disabled"> & {
  onClick?: (value: SelectValueType) => void;
};

export interface SelectCoreProps
  extends Pick<RcProps, "open" | "disabled" | "placeholder" | "showSearch" | "getPopupContainer"> {
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
  options?: SelectOption[];
  value?: SelectValueType;
  defaultValue?: SelectValueType;
  onChange?: (value: SelectValueType) => void;
}

export interface SelectProps extends SelectCoreProps, Pick<RcProps, "title"> {
  action?: SelectAction;
}
