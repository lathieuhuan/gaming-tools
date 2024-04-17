import clsx from "clsx";
import { useEffect, useState } from "react";
import { useScreenWatcher } from "../../providers";
import { bottomList } from "../../utils";
import { Select } from "./Select";
import { type SelectProps } from "./Select.types";
import { ChevronDownSvg } from "../svg-icons";

interface VersatileSelectProps extends SelectProps {
  title: string;
}

export function VersatileSelect(props: VersatileSelectProps) {
  const screenWatcher = useScreenWatcher();
  return screenWatcher.isFromSize("sm") ? <Select {...props} title={undefined} /> : <MobileSelect {...props} />;
}

function MobileSelect(props: VersatileSelectProps) {
  const { options, value, defaultValue = "", size = "small", align = "left", arrowAt = "end", disabled } = props;

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

  return (
    <div
      className={clsx(
        `ron-select ron-select--${size} ron-select--${align} ron-select--arrow-${arrowAt} rc-select rc-select-single rc-select-show-arrow`,
        props.transparent && "ron-select--transparent",
        disabled && "rc-select-disabled",
        props.className
      )}
      style={props.style}
      onClick={handleClick}
    >
      <div className="rc-select-selector">
        <span className="rc-select-selection-search">
          <div className="rc-select-selection-search-input" style={{ opacity: 0 }} />
        </span>
        <span className="rc-select-selection-item">{selected?.label}</span>
      </div>
      <span className="rc-select-arrow">
        <ChevronDownSvg />
      </span>
    </div>
  );
}
