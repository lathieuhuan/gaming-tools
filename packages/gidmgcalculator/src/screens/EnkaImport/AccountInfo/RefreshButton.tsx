import { useEffect } from "react";
import { FaRedoAlt } from "react-icons/fa";
import { Button } from "rond";

import { useTimer } from "@/hooks/useTimer";
import { secondsToTimeString } from "@/utils";
import { useDataImportState } from "../DataImportProvider";
import { STALE_TIME } from "../_hooks/useGenshinUser";

export function RefreshButton() {
  const { dataUpdatedAt, isRefetching, isError, refetch } = useDataImportState();
  const { seconds, start } = useTimer();

  const actionText = isError ? "Retry" : "Refresh";

  useEffect(() => {
    start(STALE_TIME / 1000, dataUpdatedAt || Date.now());
  }, [dataUpdatedAt]);

  return (
    <Button icon={<FaRedoAlt />} disabled={seconds > 0 || isRefetching} onClick={() => refetch()}>
      {seconds > 0 ? `${actionText} in ${secondsToTimeString(seconds)}` : actionText}
    </Button>
  );
}
