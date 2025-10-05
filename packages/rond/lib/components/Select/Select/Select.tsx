import type { SelectProps, SelectValueType } from "./types";
import { ChildrenRenderProps, SelectWithAction } from "../SelectWithAction";
import { SelectCore } from "./SelectCore";

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
  const renderSelect = (props?: ChildrenRenderProps<TValue>) => {
    return (
      <SelectCore
        className={[props?.className, className]}
        style={style}
        size={size}
        onChange={(value, option) => {
          props?.onChange?.(value);
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
        {renderSelect}
      </SelectWithAction>
    );
  }

  return renderSelect();
}
