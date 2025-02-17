import clsx from "clsx";
import { default as RcSelect } from "rc-select";
import { ChevronDownSvg } from "../svg-icons";
import type { SelectCoreProps, SelectOption, SelectValueType } from "./Select.types";
import "./SelectCore.styles.scss";

export function SelectCore<
  TValue extends SelectValueType = SelectValueType,
  TData extends Record<string, unknown> = Record<string, unknown>
>({
  className,
  dropdownCls,
  size = "small",
  align = "left",
  arrowAt = "end",
  transparent,
  showAllOptions,
  onChange,
  ...rest
}: SelectCoreProps<TValue, TData>) {
  return (
    <RcSelect
      prefixCls="ron-select"
      className={clsx(
        `ron-select--${size} ron-select--${align} ron-select--arrow-${arrowAt}`,
        transparent && "ron-select--transparent",
        className
      )}
      dropdownClassName={clsx(
        `ron-select__dropdown--${align} ron-select__dropdown--${arrowAt}`,
        transparent && "ron-select__dropdown--transparent",
        showAllOptions && "ron-select__dropdown--show-all",
        dropdownCls
      )}
      suffixIcon={<ChevronDownSvg />}
      optionFilterProp="label"
      virtual={false}
      menuItemSelectedIcon={null}
      onChange={(value, option) => onChange?.(value, option as SelectOption<TValue, TData>)}
      {...rest}
    />
  );
}
