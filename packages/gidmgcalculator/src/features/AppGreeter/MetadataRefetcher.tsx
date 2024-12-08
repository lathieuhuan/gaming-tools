import { useEffect, useRef, useState } from "react";
import { Button } from "rond";

interface MetadataRefetcherProps {
  className?: string;
  cooldown?: number;
  isLoading: boolean;
  isError: boolean;
  error?: string;
  onRefetch: () => void;
}
export function MetadataRefetcher({
  className = "",
  cooldown = 10,
  isLoading,
  isError,
  error = "Failed to fetch App Data.",
  onRefetch,
}: MetadataRefetcherProps) {
  const startTime = useRef(0);
  const [time, setTime] = useState(0);

  const intervalId = useRef<NodeJS.Timeout>();
  const timeRef = useRef(time);
  const triesRef = useRef(0);
  timeRef.current = time;

  const startCountdown = () => {
    startTime.current = Date.now();
    setTime(cooldown);

    intervalId.current = setInterval(() => {
      const currentTime = Date.now();
      const secElapsed = (currentTime - startTime.current) / 1000;

      if (secElapsed < cooldown) {
        const newTime = Math.round(cooldown - secElapsed);

        setTime(newTime);
      } else {
        setTime(0);
        clearInterval(intervalId.current);
      }
    }, 1000);
  };

  useEffect(() => {
    if (isError) {
      triesRef.current++;
      startCountdown();
    }

    return () => {
      clearInterval(intervalId.current);
    };
  }, [isError]);

  if (isLoading) {
    return <p className={"text-base text-light-default text-center font-normal " + className}>Loading App Data...</p>;
  }

  const secondsToTime = (time: number) => {
    const minutes = time > 60 ? Math.floor(time / 60) : 0;
    const seconds = time - minutes * 60;
    return `${minutes}:${seconds > 0 ? "" : "0"}${seconds}`;
  };

  if (isError) {
    return (
      <div className={"flex flex-col items-center " + className}>
        <p className="text-base text-danger-3 font-normal">
          {error} <span>{time ? `Try again after ${secondsToTime(time)}s.` : "Please try again."}</span>
        </p>
        <Button
          className="mt-1"
          variant="primary"
          size="small"
          shape="square"
          disabled={time !== 0}
          onClick={onRefetch}
        >
          Refetch
        </Button>
      </div>
    );
  }
  return null;
}
