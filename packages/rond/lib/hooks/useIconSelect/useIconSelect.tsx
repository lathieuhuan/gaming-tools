import clsx, { type ClassValue } from "clsx";
import { useState } from "react";
import { Image, type ImageProps } from "../../components/Image";
import "./IconSelect.styles.scss";

type IconOption<T> = {
  value: T;
  icon: string | JSX.Element;
};

type SelectSize = "medium" | "large";

export type IconSelectInitialValues<T> = T | T[] | null;

export type IconSelectConfig<T> = {
  size?: SelectSize;
  iconCls?: ClassValue;
  selectedCls?: ClassValue;
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
  const { size = "medium" } = config || {};

  const updateSelectedIcons = (newTypes: T[]) => {
    if (!config?.required || newTypes.length) {
      setSelectedIcons(newTypes);
      config?.onChange?.(newTypes);
    }
  };

  const onClickIcon = (value: T, currentSelected: boolean) => {
    const newTypes = config?.multiple
      ? currentSelected
        ? selectedIcons.filter((type) => type !== value)
        : selectedIcons.concat(value)
      : [value];

    updateSelectedIcons(newTypes);
  };

  const renderIconSelect = (className?: ClassValue, imageProps?: Omit<ImageProps, "src">) => (
    <div className={clsx("ron-icon-select", className)}>
      {options.map((option, i) => {
        const index = selectedIcons.indexOf(option.value);
        const selected = index !== -1;

        return (
          <button
            key={i}
            type="button"
            className={clsx(
              `ron-icon-select-option ron-icon-select-option-${size} ron-flex-center ron-glow-on-hover`,
              config?.iconCls,
              selected && config?.selectedCls
            )}
            onClick={() => onClickIcon(option.value, selected)}
          >
            {typeof option.icon === "string" ? <Image src={option.icon} {...imageProps} /> : option.icon}
          </button>
        );
      })}
    </div>
  );

  return {
    selectedIcons,
    updateSelectedIcons,
    renderIconSelect,
  };
}
