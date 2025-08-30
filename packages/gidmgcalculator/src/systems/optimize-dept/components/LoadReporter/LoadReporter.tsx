import { useLayoutEffect } from "react";
import { notification } from "rond";

import { selectSetupManageInfos } from "@Store/calculator-slice";
import { useSelector } from "@Store/hooks";

type LoadReporterProps = {
  expectedSetupIds: number[];
  afterChecking: () => void;
};

/** Check if setups are loaded to the Calculator*/
export function LoadReporter({ expectedSetupIds, afterChecking }: LoadReporterProps) {
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

      afterChecking();
    }
  }, [setups]);

  return null;
}
