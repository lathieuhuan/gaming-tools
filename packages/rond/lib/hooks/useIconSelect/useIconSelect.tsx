import clsx, { type ClassValue } from "clsx";
import { useState } from "react";
import { Image, type ImageProps } from "../../components/Image";
import "./IconSelect.styles.scss";

type IconOption<T> = {
  value: T;
  icon: string | JSX.Element;
};

export interface IconSelectProps<T> {
  className?: ClassValue;
  iconCls?: ClassValue;
  selectedCls?: ClassValue;
  imageProps?: Omit<ImageProps, "src">;
  /** Default to 'medium' */
  size?: "medium" | "large";
  options: IconOption<T>[];
  selectedIcons: T[];
  onClickOption?: (value: T, selected: boolean) => void;
}
function IconSelect<T>(props: IconSelectProps<T>) {
  const { size = "medium" } = props;

  return (
    <div className={clsx("ron-icon-select", props.className)}>
      {props.options.map((option, i) => {
        const index = props.selectedIcons.indexOf(option.value);
        const selected = index !== -1;

        return (
          <button
            key={i}
            type="button"
            className={clsx(
              `ron-icon-select-option ron-icon-select-option-${size} flex-center glow-on-hover`,
              props?.iconCls,
              selected && props?.selectedCls
            )}
            onClick={() => props.onClickOption?.(option.value, selected)}
          >
            {typeof option.icon === "string" ? <Image src={option.icon} {...props.imageProps} /> : option.icon}
          </button>
        );
      })}
    </div>
  );
}

export type IconSelectInitialValues<T> = T | T[] | null;

export type IconSelectConfig<T> = {
  multiple?: boolean;
  required?: boolean;
  onChange?: (selectedIcons: T[]) => void;
};

export function useIconSelect<T>(
  options: IconOption<T>[],
  initialValues?: IconSelectInitialValues<T>,
  config?: IconSelectConfig<T>
) {
  const [selectedIcons, setSelectedIcons] = useState<T[]>(
    initialValues ? (Array.isArray(initialValues) ? initialValues : [initialValues]) : []
  );

  const updateSelectedIcons = (newTypes: T[]) => {
    if (!config?.required || newTypes.length) {
      setSelectedIcons(newTypes);
      config?.onChange?.(newTypes);
    }
  };

  const onClickOption = (value: T, currentSelected: boolean) => {
    const newTypes = config?.multiple
      ? currentSelected
        ? selectedIcons.filter((type) => type !== value)
        : selectedIcons.concat(value)
      : [value];

    updateSelectedIcons(newTypes);
  };

  const selectProps = {
    options,
    selectedIcons,
    onClickOption,
  } satisfies IconSelectProps<T>;

  return {
    selectedIcons,
    selectProps,
    updateSelectedIcons,
    IconSelect,
  };
}
