import { FaFilter, FaTimes } from "react-icons/fa";
import { clsx } from "rond";

type ComplexFilterButtonProps = {
  active?: boolean;
  onClick?: () => void;
  onClear?: () => void;
};

export function CompoundFilterButton({ active, onClick, onClear }: ComplexFilterButtonProps) {
  return (
    <div className="flex cursor-pointer">
      <button
        className={clsx(
          "pl-3 py-1.5 text-sm text-black rounded-2xl glow-on-hover flex items-center gap-1",
          active ? "pr-2 bg-active rounded-r-none" : "pr-3 bg-light-1"
        )}
        onClick={onClick}
      >
        <FaFilter className="shrink-0" />
        <p className="font-bold">Filter</p>
      </button>

      {active && (
        <div
          className="pl-2 pr-3 rounded-r-2xl text-black bg-light-1 flex-center glow-on-hover"
          onClick={onClear}
        >
          <FaTimes />
        </div>
      )}
    </div>
  );
}
