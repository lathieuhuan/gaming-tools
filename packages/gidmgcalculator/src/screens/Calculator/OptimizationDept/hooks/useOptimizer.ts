import { useRef } from "react";
import { OptimizerManager } from "../utils/optimizer-manager/optimizer-manager";

export function useOptimizer(...args: ConstructorParameters<typeof OptimizerManager>) {
  const ref = useRef<OptimizerManager>();

  if (!ref.current) {
    ref.current = new OptimizerManager(...args);
  }
  return ref.current;
}
