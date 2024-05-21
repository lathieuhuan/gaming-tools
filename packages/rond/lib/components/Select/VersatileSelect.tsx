import clsx, { type ClassValue } from "clsx";
import { useEffect, useState } from "react";
import { useScreenWatcher } from "../../providers";
import { bottomList } from "../../utils";
import { ChevronDownSvg } from "../svg-icons";
import type { SelectProps } from "./Select.types";
import { Select } from "./Select";
import { SelectWithAction } from "./SelectWithAction";

export interface VersatileSelectProps extends SelectProps {}

export function VersatileSelect(props: VersatileSelectProps) {
  const screenWatcher = useScreenWatcher();
  return screenWatcher.isFromSize("sm") ? <Select {...props} title={undefined} /> : <MobileSelect {...props} />;
}

export interface MobileSelectProps
  extends Pick<
    VersatileSelectProps,
    "options" | "value" | "defaultValue" | "size" | "align" | "arrowAt" | "disabled" | "action"
  > {}

export function MobileSelect(props: VersatileSelectProps) {
  const {
    options = [],
    value,
    defaultValue = "",
    size = "small",
    align = "left",
    arrowAt = "end",
    disabled,
    action,
  } = props;

  const [localValue, setLocalValue] = useState<string | number>(value ?? defaultValue);

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
        height: optionsCount > 10 ? "90%" : optionsCount > 7 ? "70%" : optionsCount > 3 ? "50%" : "30%",
        hasSearch: props.showSearch,
        onSelect: (value) => {
          if (!isControlled) {
            setLocalValue(value);
          }
          props.onChange?.(value);
        },
      });
    }
  };

  const renderSelect = (localCls?: ClassValue) => {
    return (
      <div
        id={props.id}
        className={clsx(
          `ron-select ron-select--${size} ron-select--${align} ron-select--arrow-${arrowAt} ron-select ron-select-single ron-select-show-arrow`,
          props.transparent && "ron-select--transparent",
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
          onClick: () => action.onClick?.(localValue),
        }}
        initialValue={value ?? defaultValue}
      >
        {() => renderSelect("ron-select--half")}
      </SelectWithAction>
    );
  }

  return renderSelect();
}
