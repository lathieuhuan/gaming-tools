import type { ClassValue } from "clsx";
import { cn } from "@lib/utils";

export type IconSelectOption<T> = {
  title?: string;
  value: T;
  icon: JSX.Element;
};

type IconSelectSize = "medium" | "large";

const OPTION_CN_BY_SIZE: Record<IconSelectSize, string> = {
  medium: "size-8",
  large: "size-10",
};

export type IconSelectProps<T> = {
  className?: ClassValue;
  classNames?: {
    item?: ClassValue;
    selected?: ClassValue;
  };
  /** Default 'medium' */
  size?: IconSelectSize;
  options: IconSelectOption<T>[];
  values: T[];
  onSelect?: (value: T, selected: boolean) => void;
};

export function IconSelect<T>(props: IconSelectProps<T>) {
  const { size = "medium", classNames } = props;

  return (
    <div className={cn("flex items-center gap-4", props.className)}>
      {props.options.map((option, i) => {
        const selected = props.values.includes(option.value);

        return (
          <button
            key={i}
            type="button"
            title={option.title}
            className={cn(
              `rounded-circle transition-all ${OPTION_CN_BY_SIZE[size]} flex-center glow-on-hover`,
              classNames?.item,
              selected && classNames?.selected,
            )}
            onClick={() => props.onSelect?.(option.value, selected)}
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}
