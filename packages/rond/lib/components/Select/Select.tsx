import clsx, { type ClassValue } from "clsx";
import { default as RcSelect, SelectProps as RcProps } from "rc-select";
import { ChevronDownSvg } from "../svg-icons";

import "rc-select/assets/index.css";
import "./Select.styles.scss";

export type SelectOption = {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
  className?: string;
};

export interface SelectProps extends Pick<RcProps, "open" | "disabled" | "defaultValue" | "getPopupContainer"> {
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
  onChange?: (value: string | number) => void;
}
export function Select({
  className,
  dropdownCls,
  size = "small",
  align = "left",
  arrowAt = "end",
  transparent,
  ...rest
}: SelectProps) {
  return (
    <RcSelect
      className={clsx(
        `ron-select ron-select--${size} ron-select--${align} ron-select--arrow-${arrowAt}`,
        transparent && "ron-select--transparent",
        className
      )}
      dropdownClassName={clsx(
        `ron-select__dropdown ron-select__dropdown--${align} ron-select__dropdown--${arrowAt}`,
        dropdownCls
      )}
      {...rest}
      suffixIcon={<ChevronDownSvg />}
      showSearch={false}
      virtual={false}
      menuItemSelectedIcon={null}
    />
  );
}
