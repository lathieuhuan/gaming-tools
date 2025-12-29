import { useEffect } from "react";
import { FaCaretRight, FaRedoAlt } from "react-icons/fa";
import { Button, clsx, Skeleton } from "rond";

import { useTimer } from "@/hooks/useTimer";
import { secondsToTimeString } from "@/utils/pure-utils";
import { STALE_TIME } from "../_hooks/useGenshinUser";
import { useContainerState } from "../Container";
import { useDataImportState } from "../DataImportProvider";

export type AccountInfoProps = {
  className?: string;
};

export function AccountInfo({ className }: AccountInfoProps) {
  const { isMobile, goToSection } = useContainerState();
  const { data: genshinUser, isLoading, isError, error } = useDataImportState();
  const cls = ["p-3 rounded-lg bg-dark-1", className];

  if (isLoading) {
    return (
      <div className={clsx(cls, "space-y-2")}>
        <div className="h-8 flex items-center">
          <Skeleton className="w-24 h-6 rounded-sm" />
        </div>
        <div className="h-6 flex items-center">
          <Skeleton className="w-8/10 h-4 rounded-sm" />
        </div>
      </div>
    );
  }

  const actions = (
    <div className="mt-3 flex justify-end gap-3">
      <RefreshButton />

      {isMobile && !isError && (
        <Button
          icon={<FaCaretRight className="text-2xl" />}
          onClick={() => goToSection("RESULTS")}
        />
      )}
    </div>
  );

  if (genshinUser) {
    return (
      <div className={clsx(cls, "space-y-2")}>
        <p>
          <span className="text-2xl font-bold">{genshinUser.name}</span>
          <span className="text-xl text-light-4"> | AR {genshinUser.level}</span>
        </p>
        <p className="text-light-hint">{genshinUser.signature}</p>

        {actions}
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(cls)}>
        <div className="py-4 text-danger-2 flex-center">Error: {error.message}</div>
        {actions}
      </div>
    );
  }
}

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
