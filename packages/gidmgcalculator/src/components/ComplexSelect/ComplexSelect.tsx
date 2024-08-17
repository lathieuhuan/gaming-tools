import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { clsx, useClickOutside } from "rond";

const CLASS_BY_SIZE: Record<string, { option: string; icon?: string }> = {
  small: {
    option: "text-base",
    icon: "text-sm",
  },
  medium: {
    option: "text-lg",
    icon: "text-base",
  },
};

interface ComplexSelectProps {
  className?: string;
  /** Default to 'medium' */
  size?: "medium" | "small";
  selectId: string;
  value?: string | number;
  options?: Array<{
    label: React.ReactNode;
    value: string | number;
    renderActions?: (args: { closeSelect: () => void }) => JSX.Element;
  }>;
  onChange?: (value: string | number) => void;
  onToggleDropdown?: (shouldDrop: boolean) => void;
}
export function ComplexSelect({
  className,
  size = "medium",
  selectId,
  value,
  options = [],
  onChange,
  onToggleDropdown,
}: ComplexSelectProps) {
  const [isDropped, setIsDropped] = useState(false);

  const classes = CLASS_BY_SIZE[size];

  const toggleDropdown = (newIsDropped: boolean) => {
    setIsDropped(newIsDropped);
    onToggleDropdown?.(newIsDropped);

    const setupSelect = document.querySelector(`#complex-select-${selectId}_select`);

    if (newIsDropped) {
      setupSelect?.classList.remove("rounded-t-2.5xl", "rounded-b-2.5xl");
      setupSelect?.classList.add("rounded-t-lg");
    } else {
      setTimeout(() => {
        setupSelect?.classList.remove("rounded-t-lg");
        setupSelect?.classList.add("rounded-t-2.5xl", "rounded-b-2.5xl");
      }, 100);
    }
  };

  const ref = useClickOutside<HTMLDivElement>(() => toggleDropdown(false));

  const onClickOption = (newValue: string | number) => () => {
    toggleDropdown(false);

    if (newValue !== value) {
      onChange?.(newValue);
    }
  };

  const { label } = options.find((option) => option.value === value) || {};
  const nonActionOptionHeight = size === "medium" ? 32 : 28;
  const dropHeight = options.reduce(
    (accumulator, option) => accumulator + (option.renderActions ? 68 : nonActionOptionHeight),
    0
  );

  const renderKit = {
    closeSelect: () => toggleDropdown(false),
  };

  return (
    <div ref={ref} className={clsx("flex shrink-0 relative", className)}>
      <button
        id={`complex-select-${selectId}_select`}
        className="w-full px-8 py-0.5 bg-heading-color text-black rounded-t-2.5xl rounded-b-2.5xl relative cursor-default"
        onClick={() => toggleDropdown(!isDropped)}
      >
        <div className={clsx("w-full truncate font-bold text-center relative z-10", classes.option)}>{label}</div>
        <FaChevronDown className={clsx("absolute top-1/2 right-4 -translate-y-1/2", classes.icon)} />
      </button>

      <div
        className={clsx(
          "absolute top-full z-20 w-full rounded-b-md bg-light-default text-black overflow-hidden transition-size duration-100 ease-linear",
          isDropped && "border border-white"
        )}
        style={{
          height: isDropped ? dropHeight : 0,
        }}
      >
        {options.map((option, i) => {
          return (
            <div key={i} className="group">
              <div className="group-hover:bg-surface-3 group-hover:text-light-default">
                <button
                  className={clsx(
                    "px-2 py-0.5 w-full text-left font-semibold truncate cursor-default hover:bg-surface-1",
                    classes.option
                  )}
                  onClick={onClickOption(option.value)}
                >
                  {option.label}
                </button>
              </div>

              {option.renderActions?.(renderKit)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
