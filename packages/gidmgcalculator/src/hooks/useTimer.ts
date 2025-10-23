import { useEffect, useRef, useState } from "react";

export function useTimer() {
  /** Remaining seconds */
  const [seconds, setSeconds] = useState(0);
  const startTime = useRef(0);
  const intervalId = useRef<NodeJS.Timeout>();

  const getElapsedSeconds = () => {
    return (Date.now() - startTime.current) / 1000;
  };

  const getRemainingSeconds = (cooldown: number) => {
    const elapsedSeconds = getElapsedSeconds();

    if (elapsedSeconds < cooldown) {
      return Math.round(cooldown - elapsedSeconds);
    }

    return 0;
  };

  /**
   * @param cooldown - The cooldown time in seconds.
   */
  const start = (cooldown: number, at = Date.now()) => {
    clearInterval(intervalId.current);

    startTime.current = at;

    setSeconds(getRemainingSeconds(cooldown));

    intervalId.current = setInterval(() => {
      const remainingSeconds = getRemainingSeconds(cooldown);

      setSeconds(remainingSeconds);

      if (remainingSeconds === 0) {
        clearInterval(intervalId.current);
      }
    }, 1000);
  };

  const stop = () => {
    setSeconds(0);
    clearInterval(intervalId.current);
  };

  useEffect(() => stop, []);

  return { seconds, startTime, start, stop, getElapsedSeconds };
}
