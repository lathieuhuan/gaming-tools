import { useEffect, useRef, useState } from "react";
import { OptimizeProgress, OptimizerManager } from "../utils/optimizer-manager";

export function useOptimizer(...args: ConstructorParameters<typeof OptimizerManager>) {
  const ref = useRef<OptimizerManager>();

  if (!ref.current) {
    ref.current = new OptimizerManager(...args);
  }
  const [progress, setProgress] = useState<OptimizeProgress>({
    loading: false,
    result: [],
  });

  useEffect(() => {
    return ref.current?.subscribe(setProgress);
  }, []);

  return {
    ...progress,
    optimizer: ref.current,
  };
}
