import { useLayoutEffect } from "react";
import { selectSetupManageInfos } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";
import { notification } from "rond";

interface LoadReporterProps {
  expectedSetupIds: number[];
  onDoneExpect: () => void;
}
export function LoadReporter({ expectedSetupIds, onDoneExpect }: LoadReporterProps) {
  const setups = useSelector(selectSetupManageInfos);

  useLayoutEffect(() => {
    if (expectedSetupIds.length) {
      const failedIds: number[] = [];

      for (const id of expectedSetupIds) {
        if (setups.every((setup) => setup.ID !== id)) {
          failedIds.push(id);
        }
      }

      if (failedIds.length !== expectedSetupIds.length) {
        notification.success({
          content: "Loaded optimized setups to Calculator.",
        });
      }
      if (failedIds.length) {
        notification.error({
          content: "Failed to load some setups.",
          duration: 0,
        });
      }

      onDoneExpect();
    }
  }, [setups]);

  return null;
}
