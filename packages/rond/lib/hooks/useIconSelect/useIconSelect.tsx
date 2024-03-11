import clsx, { type ClassValue } from "clsx";
import { useState } from "react";
import { Image } from "../../components/Image";
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
  const { size = "medium", iconCls, selectedCls, multiple, required, onChange } = config || {};

  const updateSelectedIcons = (newTypes: T[]) => {
    if (!required || newTypes.length) {
      setSelectedIcons(newTypes);
      onChange?.(newTypes);
    }
  };

  const onClickIcon = (value: T, currentSelected: boolean) => {
    const newTypes = multiple
      ? currentSelected
        ? selectedIcons.filter((type) => type !== value)
        : selectedIcons.concat(value)
      : [value];

    updateSelectedIcons(newTypes);
  };

  const renderIconSelect = (className?: ClassValue) => (
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
              iconCls,
              selected && selectedCls
            )}
            onClick={() => onClickIcon(option.value, selected)}
          >
            {typeof option.icon === "string" ? <Image src={option.icon} /> : option.icon}
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
