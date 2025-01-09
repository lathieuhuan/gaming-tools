import { useLayoutEffect, useState } from "react";
import { useOptimizeSystem } from "../useOptimizeSystem";

export function useOptimizeProcess(onUnmounted?: () => void) {
  const [process, setProcess] = useState({
    percent: 0,
    time: 0,
  });
  const system = useOptimizeSystem();

  useLayoutEffect(() => {
    const { currentProcess, unsubscribe } = system.subscribeProcess((info) => {
      setProcess({
        percent: info.percent,
        time: Math.round(info.time / 100) / 10,
      });
    });

    setProcess({
      percent: currentProcess.percent,
      time: Math.round(currentProcess.time / 100) / 10,
    });

    return () => {
      onUnmounted?.();
      unsubscribe();
    };
  }, []);

  return process;
}
