import clsx, { ClassValue } from "clsx";
import { useRef } from "react";

import { useElementSize } from "../../hooks";
import { Button } from "../Button";
import type { SelectProps, SelectValueType } from "./Select.types";
import { SelectCore } from "./SelectCore";

import "./Select.styles.scss";

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

interface SelectWithActionProps extends Pick<SelectProps, "className" | "style" | "size" | "action"> {
  initialValue?: SelectProps["value"];
  children: (onChange: (value: SelectValueType) => void) => React.ReactNode;
}
function SelectWithAction({
  className,
  style,
  size = "small",
  initialValue = "",
  action,
  children,
}: SelectWithActionProps) {
  const valueRef = useRef<SelectValueType>(initialValue);
  const [ref, { height }] = useElementSize<HTMLDivElement>();

  return (
    <div ref={ref} className={clsx("ron-select__wrapper", className)} style={style}>
      {children((value) => (valueRef.current = value))}

      {height ? (
        <Button
          {...action}
          className={`ron-select__action ron-select__action--${size}`}
          style={{ height, width: height }}
          size="custom"
          shape="custom"
          withShadow={false}
          onClick={() => action?.onClick?.(valueRef.current)}
        />
      ) : null}
    </div>
  );
}
