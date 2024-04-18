import clsx, { type ClassValue } from "clsx";
import { useEffect, useState } from "react";
import { useScreenWatcher } from "../../providers";
import { bottomList } from "../../utils";
import { ChevronDownSvg } from "../svg-icons";
import type { SelectProps } from "./Select.types";
import { Select } from "./Select";
import { SelectWithAction } from "./SelectWithAction";

interface VersatileSelectProps extends SelectProps {
  title: string;
}

export function VersatileSelect(props: VersatileSelectProps) {
  const screenWatcher = useScreenWatcher();
  return screenWatcher.isFromSize("sm") ? <Select {...props} title={undefined} /> : <MobileSelect {...props} />;
}

function MobileSelect(props: VersatileSelectProps) {
  const {
    className,
    style,
    options,
    value,
    defaultValue = "",
    size = "small",
    align = "left",
    arrowAt = "end",
    disabled,
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
      const optionsCount = options.length;

      bottomList.show({
        title: props.title,
        items: options,
        align,
        value: localValue,
        height: optionsCount > 10 ? "90%" : optionsCount > 7 ? "70%" : optionsCount > 3 ? "50%" : "30%",
        onSelect: (value) => {
          if (!isControlled) {
            setLocalValue(value);
          }
          props.onChange?.(value);
        },
      });
    }
  };

  const renderSelect = (localCls?: ClassValue, localStyle?: React.CSSProperties) => {
    return (
      <div
        className={clsx(
          `ron-select ron-select--${size} ron-select--${align} ron-select--arrow-${arrowAt} ron-select ron-select-single ron-select-show-arrow`,
          props.transparent && "ron-select--transparent",
          disabled && "ron-select-disabled",
          localCls
        )}
        style={localStyle}
        onClick={handleClick}
      >
        <div className="ron-select-selector">
          <span className="ron-select-selection-search">
            <div className="ron-select-selection-search-input" style={{ opacity: 0 }} />
          </span>
          <span className="ron-select-selection-item">{selected?.label}</span>
        </div>
        <span className="ron-select-arrow">
          <ChevronDownSvg />
        </span>
      </div>
    );
  };

  if (props.action) {
    return (
      <SelectWithAction {...{ className, style, size }} action={props.action} initialValue={value ?? defaultValue}>
        {() => renderSelect("ron-select--half")}
      </SelectWithAction>
    );
  }

  return renderSelect(className, style);
}
