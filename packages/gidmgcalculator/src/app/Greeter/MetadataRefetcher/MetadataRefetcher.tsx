import { useEffect } from "react";
import { Button } from "rond";

import { useTimer } from "@/hooks/useTimer";
import { secondsToTimeString } from "@/utils";

type MetadataRefetcherProps = {
  className?: string;
  cooldown?: number;
  isLoading: boolean;
  isError: boolean;
  error?: string;
  onRefetch: () => void;
};

export function MetadataRefetcher({
  className = "",
  cooldown = 10,
  isLoading,
  isError,
  error = "Failed to fetch App Data.",
  onRefetch,
}: MetadataRefetcherProps) {
  const { seconds, start } = useTimer();

  useEffect(() => {
    if (isError) {
      start(cooldown);
    }
  }, [isError]);

  if (isLoading) {
    return (
      <p className={"text-base text-light-1 text-center font-normal " + className}>
        Loading App Data...
      </p>
    );
  }

  if (isError) {
    return (
      <div className={"flex flex-col items-center " + className}>
        <p className="text-base text-danger-2 text-center font-normal">
          {seconds
            ? `${error} Try again after ${secondsToTimeString(seconds)}s.`
            : "You can try fetching the data again."}
        </p>
        <Button
          className="mt-1"
          variant="primary"
          size="small"
          shape="square"
          disabled={seconds !== 0}
          onClick={onRefetch}
        >
          Retry
        </Button>
      </div>
    );
  }
  return null;
}
