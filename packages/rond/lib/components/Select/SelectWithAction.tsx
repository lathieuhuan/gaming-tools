import clsx from "clsx";
import { useRef } from "react";
import { useElementSize } from "../../hooks";
import { Button } from "../Button";
import type { SelectProps, SelectValueType } from "./Select";

export type ChildrenRenderProps<TValue extends SelectValueType = SelectValueType> = {
  className?: string;
  onChange: (value: TValue) => void;
};

type SelectWithActionProps<
  TValue extends SelectValueType = SelectValueType,
  TData extends Record<string, unknown> = Record<string, unknown>
> = Pick<SelectProps<TValue, TData>, "className" | "style" | "size" | "action"> & {
  initialValue?: SelectProps<TValue, TData>["value"];
  children: (props: ChildrenRenderProps<TValue>) => React.ReactNode;
};

export function SelectWithAction<
  TValue extends SelectValueType = SelectValueType,
  TData extends Record<string, unknown> = Record<string, unknown>
>({
  className,
  style,
  size = "small",
  initialValue,
  action,
  children,
}: SelectWithActionProps<TValue, TData>) {
  const valueRef = useRef<TValue | undefined>(initialValue);
  const [ref, { height }] = useElementSize<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={clsx(
        "flex [&>:first-child]:!rounded-tr-none [&>:first-child]:!rounded-br-none",
        className
      )}
      style={style}
    >
      {children({
        onChange: (value) => (valueRef.current = value),
      })}

      {height ? (
        <Button
          {...action}
          className="rounded-tr-sm rounded-br-sm shrink-0"
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
