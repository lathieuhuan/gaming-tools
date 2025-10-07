import type { ClassValue } from "clsx";
import { useEffect, useState } from "react";

import { cn } from "@lib/utils";
import { bottomList } from "../../utils";
import { ChevronDownSvg } from "../svg-icons";
import type { SelectProps, SelectValueType } from "./Select";
import { getSelectVariantCls } from "./Select/config";
import { SelectWithAction } from "./SelectWithAction";

export function MobileSelect<
  TValue extends SelectValueType = SelectValueType,
  TData extends Record<string, unknown> = Record<string, unknown>
>(props: SelectProps<TValue, TData>) {
  const {
    options = [],
    value,
    defaultValue,
    size = "small",
    align = "left",
    arrowAt = "end",
    disabled,
    action,
  } = props;

  const [localValue, setLocalValue] = useState<TValue | undefined>(value ?? defaultValue);

  const isControlled = "value" in props;
  const selected = options.find((option) => option.value === localValue);

  useEffect(() => {
    if (isControlled && value !== undefined && value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleClick = () => {
    if (!disabled) {
      const optionsCount = options.length + (props.showSearch ? 1 : 0);

      bottomList.show({
        title: props.title,
        items: options,
        align,
        value: localValue,
        height:
          optionsCount > 10 ? "90%" : optionsCount > 7 ? "70%" : optionsCount > 3 ? "50%" : "30%",
        hasSearch: props.showSearch,
        onSelect: (value, item) => {
          if (!isControlled) {
            setLocalValue(value);
          }
          props.onChange?.(value, {
            ...item,
            label: item.label || item.value,
          });
        },
      });
    }
  };

  const renderSelect = (localCls?: ClassValue) => {
    return (
      <div
        id={props.id}
        className={cn(
          `ron-select ron-select-single ron-select-show-arrow`,
          getSelectVariantCls({ size, align, arrowAt, transparent: props.transparent }),
          disabled && "ron-select-disabled",
          localCls,
          props.className
        )}
        style={props.style}
        onClick={handleClick}
      >
        <div className="ron-select-selector">
          <span className="ron-select-selection-search">
            <div className="ron-select-selection-search-input" style={{ opacity: 0 }} />
          </span>
          {selected?.label !== undefined ? (
            <span className="ron-select-selection-item">{selected?.label}</span>
          ) : (
            <span className="ron-select-selection-placeholder">{props.placeholder}</span>
          )}
        </div>
        <span className="ron-select-arrow">
          <ChevronDownSvg />
        </span>
      </div>
    );
  };

  if (action) {
    return (
      <SelectWithAction
        className={props.wrapperCls}
        style={props.wrapperStyle}
        size={size}
        action={{
          ...action,
          onClick: () => {
            if (localValue !== undefined) action.onClick?.(localValue);
          },
        }}
        initialValue={value ?? defaultValue}
      >
        {(props) => renderSelect(props.className)}
      </SelectWithAction>
    );
  }

  return renderSelect();
}
