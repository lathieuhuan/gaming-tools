import clsx, { type ClassValue } from "clsx";
import { useRef } from "react";
import { default as RcSelect, SelectProps as RcProps } from "rc-select";
import { ChevronDownSvg } from "../svg-icons";

import "rc-select/assets/index.css";
import "./Select.styles.scss";
// import { Button, ButtonProps } from "../Button";

import { SelectProps, SelectValueType } from "./Select.types";
import { SelectWrap } from "./SelectWrap";

// export type SelectOption = {
//   label: React.ReactNode;
//   value: string | number;
//   disabled?: boolean;
//   className?: string;
// };

// type ValueType = RcProps["value"];

// type SelectAction = Pick<ButtonProps, "variant" | "icon" | "disabled"> & {
//   onClick?: (localValue: ValueType) => void;
// };

// export interface SelectProps extends Pick<RcProps, "title" | "open" | "disabled" | "getPopupContainer"> {
//   className?: ClassValue;
//   dropdownCls?: ClassValue;
//   style?: React.CSSProperties;
//   /** Default to 'small' */
//   size?: "small" | "medium";
//   /** Default to 'left' */
//   align?: "left" | "right";
//   /** Default to 'end' */
//   arrowAt?: "start" | "end";
//   transparent?: boolean;
//   options: SelectOption[];
//   value?: string | number;
//   defaultValue?: string | number;
//   action?: SelectAction;
//   onChange?: (value: string | number) => void;
// }
export function Select({
  className,
  style,
  dropdownCls,
  size = "small",
  align = "left",
  arrowAt = "end",
  transparent,
  action,
  onChange,
  ...rest
}: SelectProps) {
  const valueRef = useRef<SelectValueType>(rest.value ?? rest.defaultValue);

  // const renderSelect = (extraCls?: ClassValue, style?: React.CSSProperties) => (
  //   <RcSelect
  //     className={clsx(
  //       `ron-select ron-select--${size} ron-select--${align} ron-select--arrow-${arrowAt}`,
  //       transparent && "ron-select--transparent",
  //       extraCls,
  //       className
  //     )}
  //     style={style}
  //     dropdownClassName={clsx(
  //       `ron-select__dropdown ron-select__dropdown--${align} ron-select__dropdown--${arrowAt}`,
  //       transparent && "ron-select__dropdown--transparent",
  //       dropdownCls
  //     )}
  //     {...rest}
  //     suffixIcon={<ChevronDownSvg />}
  //     showSearch={false}
  //     virtual={false}
  //     menuItemSelectedIcon={null}
  //     onChange={(value) => {
  //       valueRef.current = value;
  //       onChange?.(value);
  //     }}
  //   />
  // );

  // if (action) {
  //   return (
  //     <div className="ron-select__wrapper" style={style}>
  //       {renderSelect("ron-select--half")}
  //       <Button
  //         {...action}
  //         className={`ron-select__action ron-select__action--${size}`}
  //         size="custom"
  //         shape="custom"
  //         withShadow={false}
  //         onClick={() => action.onClick?.(valueRef.current)}
  //       />
  //     </div>
  //   );
  // }

  // return renderSelect(null, style);

  return (
    <SelectWrap
      style={style}
      size={size}
      action={
        action
          ? {
              ...action,
              onClick: () => action?.onClick?.(valueRef.current),
            }
          : undefined
      }
    >
      {(extraCls, selectStyle) => {
        return (
          <RcSelect
            className={clsx(
              `ron-select ron-select--${size} ron-select--${align} ron-select--arrow-${arrowAt}`,
              transparent && "ron-select--transparent",
              extraCls,
              className
            )}
            style={selectStyle}
            dropdownClassName={clsx(
              `ron-select__dropdown ron-select__dropdown--${align} ron-select__dropdown--${arrowAt}`,
              transparent && "ron-select__dropdown--transparent",
              dropdownCls
            )}
            {...rest}
            suffixIcon={<ChevronDownSvg />}
            showSearch={false}
            virtual={false}
            menuItemSelectedIcon={null}
            onChange={(value) => {
              valueRef.current = value;
              onChange?.(value);
            }}
          />
        );
      }}
    </SelectWrap>
  );

  // return (
  //   <RcSelect
  //     className={clsx(
  //       `ron-select ron-select--${size} ron-select--${align} ron-select--arrow-${arrowAt}`,
  //       transparent && "ron-select--transparent",
  //       className
  //     )}
  //     dropdownClassName={clsx(
  //       `ron-select__dropdown ron-select__dropdown--${align} ron-select__dropdown--${arrowAt}`,
  //       transparent && "ron-select__dropdown--transparent",
  //       dropdownCls
  //     )}
  //     {...rest}
  //     suffixIcon={<ChevronDownSvg />}
  //     showSearch={false}
  //     virtual={false}
  //     menuItemSelectedIcon={null}
  //   />
  // );
}
