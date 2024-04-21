import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { clsx, useClickOutside } from "rond";

interface ComplexSelectProps {
  className?: string;
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
  selectId,
  value,
  options = [],
  onChange,
  onToggleDropdown,
}: ComplexSelectProps) {
  const [isDropped, setIsDropped] = useState(false);

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
  const dropHeight = options.reduce((accumulator, option) => accumulator + (option.renderActions ? 72 : 36), 0);

  const renderKit = {
    closeSelect: () => toggleDropdown(false),
  };

  return (
    <div ref={ref} className={clsx("shrink-0 relative", className)}>
      <button
        id={`complex-select-${selectId}_select`}
        className="w-full px-8 py-0.5 bg-heading-color text-black rounded-t-2.5xl rounded-b-2.5xl relative cursor-default"
        onClick={() => toggleDropdown(!isDropped)}
      >
        <div className="w-full truncate text-lg font-bold text-center relative z-10">{label}</div>
        <FaChevronDown className="absolute top-1/2 right-4 -translate-y-1/2" />
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
                  className="px-2 py-1 w-full text-lg text-left font-bold truncate cursor-default hover:bg-surface-1"
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
