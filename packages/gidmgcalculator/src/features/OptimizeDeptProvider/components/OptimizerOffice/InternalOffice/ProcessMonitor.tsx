import { useRef, useState } from "react";
import { FaCaretRight, FaTimes } from "react-icons/fa";
import { Button, clsx } from "rond";

import { useOptimizeProcess } from "@OptimizeDept/hooks/useOptimizeProcess";

interface ProcessMonitorProps {
  className?: string;
  style?: React.CSSProperties;
  cancelled: boolean;
  onRequestCancel: () => void;
}
export function ProcessMonitor({ cancelled, onRequestCancel, ...divProps }: ProcessMonitorProps) {
  const [waitingCancel, setWaitingCancel] = useState(false);
  const mounted = useRef(true);
  const process = useOptimizeProcess(() => (mounted.current = false));

  const timeout = (callback: () => void, time: number) => {
    setTimeout(() => mounted.current && callback(), time);
  };

  const onClickCancel = () => {
    if (waitingCancel) {
      setWaitingCancel(false);
      onRequestCancel();
      return;
    }

    setWaitingCancel(true);
    timeout(() => setWaitingCancel(false), 5000);
  };

  return (
    <div {...divProps}>
      <p className="text-lg text-center font-medium">{cancelled ? "Calculation cancelled" : "Calculating..."}</p>

      <div className="w-full h-3 mt-4 bg-surface-1 shadow-surface-3 shadow-3px-2px rounded-md">
        <div
          className={clsx(
            "h-full rounded-l-md transition-size duration-150 relative",
            process.percent && "shadow-5px-1px",
            process.percent === 100 && "rounded-r-md",
            cancelled ? "bg-light-disabled opacity-80" : "bg-active-color shadow-active-color"
          )}
          style={{ width: `${process.percent}%` }}
        >
          {process.time ? (
            <span
              className={clsx(
                "mt-2 absolute left-full top-full -translate-x-1/2 font-semibold",
                cancelled ? "text-light-disabled opacity-80" : "text-active-color"
              )}
            >
              {process.time}s
            </span>
          ) : null}
        </div>
      </div>

      <div className="h-6" />

      <div className="mt-4 flex justify-end items-center gap-1">
        {waitingCancel && (
          <>
            <span className="text-sm">Tap again to cancel the process</span>
            <FaCaretRight />
          </>
        )}
        {!cancelled && (
          <Button
            variant={waitingCancel ? "danger" : "default"}
            icon={<FaTimes className="text-base" />}
            iconPosition="end"
            onClick={onClickCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
