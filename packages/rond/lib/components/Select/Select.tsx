import { type ClassValue } from "clsx";
import type { SelectProps, SelectValueType } from "./Select.types";
import { SelectCore } from "./SelectCore";
import { SelectWithAction } from "./SelectWithAction";

type OnLocalChange = (value: SelectValueType) => void;

export function Select({
  wrapperCls,
  className,
  wrapperStyle,
  style,
  size = "small",
  action,
  onChange,
  ...rest
}: SelectProps) {
  const renderSelect = (localCls?: ClassValue, onLocalChange?: OnLocalChange) => {
    return (
      <SelectCore
        className={[className, localCls]}
        style={style}
        size={size}
        onChange={(value) => {
          onLocalChange?.(value);
          onChange?.(value);
        }}
        {...rest}
      />
    );
  };

  if (action) {
    return (
      <SelectWithAction
        className={wrapperCls}
        style={wrapperStyle}
        size={size}
        initialValue={rest.value ?? rest.defaultValue}
        action={action}
      >
        {(onChange) => renderSelect("ron-select--half", onChange)}
      </SelectWithAction>
    );
  }

  return renderSelect();
}
