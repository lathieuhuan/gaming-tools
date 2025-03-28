import { type ClassValue } from "clsx";
import { type SelectProps as RcProps } from "rc-select";
import { type ButtonProps } from "../Button";

export type SelectValueType = string | number;

export type SelectOption<
  TValue extends SelectValueType = SelectValueType,
  TData extends Record<string, unknown> = Record<string, unknown>
> = {
  label: SelectValueType;
  value: TValue;
  data?: TData;
  disabled?: boolean;
  className?: string;
};

export type SelectAction<TValue extends SelectValueType = SelectValueType> = Pick<
  ButtonProps,
  "variant" | "icon" | "disabled"
> & {
  onClick?: (value: TValue) => void;
};

export interface SelectCoreProps<
  TValue extends SelectValueType = SelectValueType,
  TData extends Record<string, unknown> = Record<string, unknown>
> extends Pick<RcProps, "id" | "open" | "disabled" | "placeholder" | "showSearch" | "getPopupContainer"> {
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
  options?: SelectOption<TValue, TData>[];
  value?: TValue;
  defaultValue?: TValue;
  onChange?: (value: TValue, option: SelectOption<TValue, TData>) => void;
}

export interface SelectProps<
  TValue extends SelectValueType = SelectValueType,
  TData extends Record<string, unknown> = Record<string, unknown>
> extends SelectCoreProps<TValue, TData>,
    Pick<RcProps, "title"> {
  /** Only when select has action */
  wrapperCls?: string;
  /** Only when select has action */
  wrapperStyle?: React.CSSProperties;
  action?: SelectAction<TValue>;
}
