import { type ClassValue } from "clsx";
import { type SelectProps as RcProps } from "rc-select";
import { type ButtonProps } from "../Button";

export type SelectOption = {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
  className?: string;
};

export type SelectValueType = RcProps["value"];

export type SelectAction = Pick<ButtonProps, "variant" | "icon" | "disabled"> & {
  onClick?: (value: SelectValueType) => void;
};

export interface SelectProps extends Pick<RcProps, "title" | "open" | "disabled" | "getPopupContainer"> {
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
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  action?: SelectAction;
  onChange?: (value: string | number) => void;
}
