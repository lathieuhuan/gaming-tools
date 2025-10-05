import clsx, { type ClassValue } from "clsx";
import { cn } from "@lib/utils";
import { Image, type ImageProps } from "../Image";

type IconOption<T> = {
  value: T;
  icon: string | JSX.Element;
};

type IconSelectSize = "medium" | "large";

const OPTION_CN_BY_SIZE: Record<IconSelectSize, string> = {
  medium: "size-8",
  large: "size-10",
};

export type IconSelectProps<T> = {
  className?: ClassValue;
  iconCls?: ClassValue;
  selectedCls?: ClassValue;
  imageProps?: Omit<ImageProps, "src">;
  /** Default to 'medium' */
  size?: IconSelectSize;
  options: IconOption<T>[];
  values: T[];
  onSelect?: (value: T, selected: boolean) => void;
};

export function IconSelect<T>(props: IconSelectProps<T>) {
  const { size = "medium" } = props;

  return (
    <div className={cn("flex items-center gap-4", props.className)}>
      {props.options.map((option, i) => {
        const selected = props.values.indexOf(option.value) !== -1;

        return (
          <button
            key={i}
            type="button"
            className={clsx(
              `rounded-circle transition-all ${OPTION_CN_BY_SIZE[size]} flex-center glow-on-hover`,
              props?.iconCls,
              selected && props?.selectedCls
            )}
            onClick={() => props.onSelect?.(option.value, selected)}
          >
            {typeof option.icon === "string" ? (
              <Image src={option.icon} {...props.imageProps} />
            ) : (
              option.icon
            )}
          </button>
        );
      })}
    </div>
  );
}
