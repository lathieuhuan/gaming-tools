import { useEffect } from "react";
import { FaRedoAlt } from "react-icons/fa";
import { Button } from "rond";

import { useTimer } from "@/hooks/useTimer";
import { secondsToTimeString } from "@/utils";
import { useDataImportState } from "../DataImportProvider";
import { STALE_TIME } from "../_hooks/useGenshinUser";

export function RefreshButton() {
  const { dataUpdatedAt, isRefetching, refetch } = useDataImportState();
  const { seconds, start } = useTimer();

  useEffect(() => {
    start(STALE_TIME / 1000, dataUpdatedAt);
  }, [dataUpdatedAt]);

  return (
    <Button icon={<FaRedoAlt />} disabled={seconds > 0 || isRefetching} onClick={() => refetch()}>
      {seconds > 0 ? `Refresh in ${secondsToTimeString(seconds)}` : "Refresh"}
    </Button>
  );
}
