import { formatNumber } from "ron-utils";

import { selectProcessor, useSimulatorStore } from "../store";

type AnalyticsViewProps = {
  className?: string;
};

export function AnalyticsView({ className }: AnalyticsViewProps) {
  const hitLogs = useSimulatorStore((state) => selectProcessor(state).hitLogs);

  const totalDMG = hitLogs.reduce((acc, log) => acc + log.value, 0);

  return (
    <div className={className}>
      <div className="flex items-end justify-between">
        <span className="text-sm text-light-4">Total DMG</span>
        <span className="text-2xl font-bold">{formatNumber(totalDMG)}</span>
      </div>
    </div>
  );
}
