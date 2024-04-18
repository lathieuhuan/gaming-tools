import { type ClassValue } from "clsx";
import type { SelectProps, SelectValueType } from "./Select.types";
import { SelectCore } from "./SelectCore";
import { SelectWithAction } from "./SelectWithAction";

type OnLocalChange = (value: SelectValueType) => void;

export function Select({ className, style, size = "small", action, onChange, ...rest }: SelectProps) {
  const renderSelect = (localCls?: ClassValue, localStyle?: React.CSSProperties, onLocalChange?: OnLocalChange) => {
    return (
      <SelectCore
        className={localCls}
        style={localStyle}
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
      <SelectWithAction {...{ className, style, size, action }} initialValue={rest.value ?? rest.defaultValue}>
        {(onChange) => renderSelect("ron-select--half", undefined, onChange)}
      </SelectWithAction>
    );
  }

  return renderSelect(className, style);
}
