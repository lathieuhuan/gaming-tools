import clsx, { type ClassValue } from "clsx";
import { Image, type ImageProps } from "../Image";
import "./IconSelect.styles.scss";

type IconOption<T> = {
  value: T;
  icon: string | JSX.Element;
};

export type IconSelectProps<T> = {
  className?: ClassValue;
  iconCls?: ClassValue;
  selectedCls?: ClassValue;
  imageProps?: Omit<ImageProps, "src">;
  /** Default to 'medium' */
  size?: "medium" | "large";
  options: IconOption<T>[];
  values: T[];
  onSelect?: (value: T, selected: boolean) => void;
};

export function IconSelect<T>(props: IconSelectProps<T>) {
  const { size = "medium" } = props;

  return (
    <div className={clsx("ron-icon-select", props.className)}>
      {props.options.map((option, i) => {
        const selected = props.values.indexOf(option.value) !== -1;

        return (
          <button
            key={i}
            type="button"
            className={clsx(
              `ron-icon-select-option ron-icon-select-option-${size} ron-flex-center ron-glow-on-hover`,
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
