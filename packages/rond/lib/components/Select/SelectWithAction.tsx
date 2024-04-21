import clsx from "clsx";
import { useRef } from "react";
import { useElementSize } from "../../hooks";
import { Button } from "../Button";
import type { SelectProps, SelectValueType } from "./Select.types";
import "./Select.styles.scss";

interface SelectWithActionProps extends Pick<SelectProps, "className" | "style" | "size" | "action"> {
  initialValue?: SelectProps["value"];
  children: (onChange: (value: SelectValueType) => void) => React.ReactNode;
}
export function SelectWithAction({
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
