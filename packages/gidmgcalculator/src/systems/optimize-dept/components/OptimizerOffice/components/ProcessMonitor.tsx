import { useRef, useState } from "react";
import { FaCaretRight, FaTimes } from "react-icons/fa";
import { Button, clsx } from "rond";

import { useOptimizeProcess } from "@OptimizeDept/hooks";

type ProcessMonitorProps = {
  className?: string;
  style?: React.CSSProperties;
  cancelled: boolean;
  onCancelProcess: () => void;
};

export function ProcessMonitor({ cancelled, onCancelProcess, ...restProps }: ProcessMonitorProps) {
  const [waitingCancel, setWaitingCancel] = useState(false);
  const mounted = useRef(true);
  const process = useOptimizeProcess(() => (mounted.current = false));

  const handleClickCancel = () => {
    if (waitingCancel) {
      setWaitingCancel(false);
      onCancelProcess();
      return;
    }

    setWaitingCancel(true);

    setTimeout(() => mounted.current && setWaitingCancel(false), 5000);
  };

  return (
    <div {...restProps}>
      <p className="text-lg text-center font-medium">{cancelled ? "Calculation cancelled" : "Calculating..."}</p>

      <div className="w-full h-3 mt-4 bg-dark-1 shadow-dark-3 shadow-hightlight-2 rounded-md">
        <div
          className={clsx(
            "h-full rounded-l-md transition-size duration-150 relative",
            process.percent && "shadow-hightlight-1",
            process.percent === 100 && "rounded-r-md",
            cancelled ? "bg-light-4 opacity-80" : "bg-active shadow-active"
          )}
          style={{ width: `${process.percent}%` }}
        >
          {process.time ? (
            <span
              className={clsx(
                "mt-2 absolute left-full top-full -translate-x-1/2 font-semibold",
                cancelled ? "text-light-4 opacity-80" : "text-active"
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
            onClick={handleClickCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
