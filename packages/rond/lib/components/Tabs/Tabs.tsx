import { cn } from "@lib/utils";
import clsx, { type ClassValue } from "clsx";
import type { ComponentProps } from "react";

const classByLevel = {
  1: "bg-heading",
  2: "bg-secondary-1",
};

export type TabValue = string | number;

export type TabOption<V extends TabValue> = {
  label: string;
  value: V;
  disabled?: boolean;
};

export type TabsProps<V extends TabValue, O extends TabOption<V> = TabOption<V>> = Omit<
  ComponentProps<"div">,
  "className" | "children" | "onChange"
> & {
  className?: ClassValue;
  level?: 1 | 2;
  options?: O[];
  value?: V;
  onChange?: (value: V, option: O) => void;
};

export function Tabs<V extends TabValue, O extends TabOption<V> = TabOption<V>>({
  className,
  level = 1,
  options,
  value,
  onChange,
  ...rest
}: TabsProps<V, O>) {
  return (
    <div
      className={cn("w-full flex rounded-full overflow-hidden divide-x-2 divide-dark-3", className)}
      {...rest}
    >
      {options?.map((option) => {
        return (
          <button
            key={option.value}
            type="button"
            data-slot="tab-option"
            data-value={option.value}
            disabled={option.disabled}
            className={clsx(
              "w-1/2 py-0.5 text-black font-bold flex-center disabled:opacity-disabled",
              option.value === value ? classByLevel[level] : "bg-light-1 glow-on-hover",
            )}
            onClick={() => onChange?.(option.value, option)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
