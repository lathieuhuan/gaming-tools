import clsx from "clsx";
import { useRef } from "react";
import { useElementSize } from "../../hooks";
import { Button } from "../Button";
import type { SelectProps, SelectValueType } from "./Select.types";
import "./Select.styles.scss";

interface SelectWithActionProps<
  TValue extends SelectValueType = SelectValueType,
  TData extends Record<string, unknown> = Record<string, unknown>
> extends Pick<SelectProps<TValue, TData>, "className" | "style" | "size" | "action"> {
  initialValue?: SelectProps<TValue, TData>["value"];
  children: (onChange: (value: TValue) => void) => React.ReactNode;
}
export function SelectWithAction<
  TValue extends SelectValueType = SelectValueType,
  TData extends Record<string, unknown> = Record<string, unknown>
>({ className, style, size = "small", initialValue, action, children }: SelectWithActionProps<TValue, TData>) {
  const valueRef = useRef<TValue | undefined>(initialValue);
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
          onClick={() => {
            if (valueRef.current !== undefined) action?.onClick?.(valueRef.current);
          }}
        />
      ) : null}
    </div>
  );
}
