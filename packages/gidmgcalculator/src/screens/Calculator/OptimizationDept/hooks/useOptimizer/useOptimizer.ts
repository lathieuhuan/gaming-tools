import { useRef } from "react";
import { OptimizerManager } from "./optimizer-manager";

export function useOptimizer() {
  const ref = useRef<OptimizerManager>();

  if (!ref.current) {
    ref.current = new OptimizerManager();
  }
  return ref.current;
}
