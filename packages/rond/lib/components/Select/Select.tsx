import { type ClassValue } from "clsx";
import type { SelectProps, SelectValueType } from "./Select.types";
import { SelectCore } from "./SelectCore";
import { SelectWithAction } from "./SelectWithAction";

export function Select<
  TValue extends SelectValueType = SelectValueType,
  TData extends Record<string, unknown> = Record<string, unknown>
>({
  wrapperCls,
  className,
  wrapperStyle,
  style,
  size = "small",
  action,
  onChange,
  ...rest
}: SelectProps<TValue, TData>) {
  const renderSelect = (localCls?: ClassValue, onLocalChange?: (value: TValue) => void) => {
    return (
      <SelectCore
        className={[className, localCls]}
        style={style}
        size={size}
        onChange={(value, option) => {
          onLocalChange?.(value);
          onChange?.(value, option);
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
