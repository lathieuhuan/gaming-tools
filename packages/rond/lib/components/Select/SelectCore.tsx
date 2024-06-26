import clsx from "clsx";
import { default as RcSelect } from "rc-select";
import { ChevronDownSvg } from "../svg-icons";
import type { SelectCoreProps } from "./Select.types";
import "./SelectCore.styles.scss";

export function SelectCore({
  className,
  dropdownCls,
  size = "small",
  align = "left",
  arrowAt = "end",
  transparent,
  showAllOptions,
  ...rest
}: SelectCoreProps) {
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
      {...rest}
    />
  );
}
