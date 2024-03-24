import { useState } from "react";
import { FaCopy } from "react-icons/fa";
import { clsx } from "rond";

export type Option = {
  value: string | number;
  label: string;
};

interface CopySectionProps<TOption> {
  className?: string;
  options: TOption[];
  defaultIndex?: number;
  onClickCopy: (option: TOption) => void;
}
export function CopySection<TOption extends Option>({
  className,
  options,
  defaultIndex = 0,
  onClickCopy,
}: CopySectionProps<TOption>) {
  const [chosenLabel, setChosenLabel] = useState(options[defaultIndex]?.label);

  const onClick = () => {
    const chosen = options.find(({ label }) => label === chosenLabel);

    if (chosen) {
      onClickCopy(chosen);
    }
  };

  return (
    <div className={clsx("flex justify-end", className)}>
      <select
        className="px-1 rounded-l bg-light-default font-bold text-black"
        value={chosenLabel}
        onChange={(e) => setChosenLabel(e.target.value)}
      >
        {options.map((option, i) => (
          <option key={i} value={option.label}>
            {option.label}
          </option>
        ))}
      </select>
      <button className="w-8 h-8 bg-primary-1 text-black rounded-r flex-center glow-on-hover" onClick={onClick}>
        <FaCopy />
      </button>
    </div>
  );
}
