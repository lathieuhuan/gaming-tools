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
  ...rest
}: SelectCoreProps) {
  return (
    <RcSelect
      prefixCls="ron-select"
      // showSearch
      // placeholder='select...'
      className={clsx(
        `ron-select--${size} ron-select--${align} ron-select--arrow-${arrowAt}`,
        transparent && "ron-select--transparent",
        className
      )}
      dropdownClassName={clsx(
        `ron-select__dropdown--${align} ron-select__dropdown--${arrowAt}`,
        transparent && "ron-select__dropdown--transparent",
        dropdownCls
      )}
      suffixIcon={<ChevronDownSvg />}
      virtual={false}
      menuItemSelectedIcon={null}
      {...rest}
    />
  );
}
