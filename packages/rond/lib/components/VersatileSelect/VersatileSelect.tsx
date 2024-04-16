import clsx from "clsx";
import { useScreenWatcher } from "../../providers";
import { bottomList } from "../../utils";
import { Select, type SelectProps } from "../Select";
import { ChevronDownSvg } from "../svg-icons";

interface VersatileSelectProps extends SelectProps {
  title: string;
}

export function VersatileSelect(props: VersatileSelectProps) {
  const screenWatcher = useScreenWatcher();
  return screenWatcher.isFromSize("sm") ? <Select {...props} title={undefined} /> : <MobileSelect {...props} />;
}

function MobileSelect({
  title,
  options,
  value,
  defaultValue,
  className,
  style,
  size = "small",
  align = "left",
  arrowAt = "end",
  transparent,
  disabled,
  onChange,
}: VersatileSelectProps) {
  const localValue = value ?? defaultValue;
  const selected = options.find((option) => option.value === localValue);

  const handleClick = () => {
    if (!disabled) {
      const optionsCount = options.length;

      bottomList.show({
        title,
        items: options,
        align,
        value: localValue,
        height: optionsCount > 10 ? "90%" : optionsCount > 7 ? "70%" : optionsCount > 3 ? "50%" : "30%",
        onSelect: onChange,
      });
    }
  };

  return (
    <div
      className={clsx(
        `ron-select ron-select--${size} ron-select--${align} ron-select--arrow-${arrowAt} rc-select rc-select-single rc-select-show-arrow`,
        transparent && "ron-select--transparent",
        disabled && "rc-select-disabled",
        className
      )}
      style={style}
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
