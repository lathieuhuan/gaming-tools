import { useLayoutEffect } from "react";
import { FaCaretRight } from "react-icons/fa";
import { PiCaretLineRightFill } from "react-icons/pi";
import { TbRectangleVerticalFilled } from "react-icons/tb";
import { ClassValue, cn, InputNumber } from "rond";

type JumpButtonProps = {
  disabled?: boolean;
  backward?: boolean;
  Icon?: React.ComponentType<{ className: string }>;
  onClick?: () => void;
};

function JumpButton({ disabled, backward, Icon = FaCaretRight, onClick }: JumpButtonProps) {
  return (
    <button
      className="w-7 h-7 flex-center glow-on-hover disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
    >
      {disabled ? (
        <TbRectangleVerticalFilled className="text-lg" />
      ) : (
        <Icon className={`text-2xl ${backward ? "rotate-180" : ""}`} />
      )}
    </button>
  );
}

type PaginationProps = {
  className?: ClassValue;
  total: number;
  pageIndex: number;
  pageSize: number;
  onChange?: (pageIndex: number) => void;
};

export function Pagination({ className, total, pageIndex, pageSize, onChange }: PaginationProps) {
  const lastPageIndex = Math.ceil(total / pageSize) - 1;
  const showFirstLast = lastPageIndex > 2;

  useLayoutEffect(() => {
    if (pageIndex > lastPageIndex) {
      onChange?.(lastPageIndex);
    }
  }, [total]);

  return (
    <div className={cn("h-7 flex items-center justify-between shrink-0", className)}>
      <div className="text-sm leading-none text-light-hint">{total} items</div>

      {lastPageIndex !== 0 && (
        <div className="flex-center space-x-2">
          {showFirstLast && (
            <JumpButton
              Icon={PiCaretLineRightFill}
              disabled={pageIndex <= 0}
              backward
              onClick={() => onChange?.(0)}
            />
          )}

          <JumpButton
            disabled={pageIndex <= 0}
            backward
            onClick={() => onChange?.(pageIndex - 1)}
          />

          <div className="font-semibold flex items-center">
            <div className="h-6 flex items-center border-b border-dark-line">
              <InputNumber
                className="py-0 w-10 bg-transparent! text-light-1!"
                value={pageIndex + 1}
                max={lastPageIndex + 1}
                onChange={(value) => onChange?.(value - 1)}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <span>/ {lastPageIndex + 1}</span>
          </div>

          <JumpButton
            disabled={pageIndex >= lastPageIndex}
            onClick={() => onChange?.(pageIndex + 1)}
          />

          {showFirstLast && (
            <JumpButton
              Icon={PiCaretLineRightFill}
              disabled={pageIndex >= lastPageIndex}
              onClick={() => onChange?.(lastPageIndex)}
            />
          )}
        </div>
      )}
    </div>
  );
}
