import { default as RcSelect } from "rc-select";

import { cn } from "@lib/utils";
import { ChevronDownSvg } from "../../svg-icons";
import { getSelectVariantCls } from "./config";
import type { SelectCoreProps, SelectOption, SelectValueType } from "./types";

import "./style.scss";

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
      className={cn(getSelectVariantCls({ size, align, arrowAt, transparent }), className)}
      dropdownClassName={cn(
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
