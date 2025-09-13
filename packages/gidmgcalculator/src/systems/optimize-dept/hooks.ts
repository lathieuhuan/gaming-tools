import { useLayoutEffect, useRef, useState } from "react";

import { useOptimizeSystem } from "./context";
import { ArtifactManager } from "./logic/ArtifactManager";
import { OptimizeManager } from "./logic/OptimizeManager";

export function useArtifactManager(...args: ConstructorParameters<typeof ArtifactManager>) {
  const ref = useRef<ArtifactManager>();

  if (!ref.current) {
    ref.current = new ArtifactManager(...args);
  }
  return ref.current;
}

export function useOptimizerManager() {
  const ref = useRef<OptimizeManager>();

  if (!ref.current) {
    ref.current = new OptimizeManager();
  }
  return ref.current;
}

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
