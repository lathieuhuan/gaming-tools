import { useRef } from "react";
import { OptimizeManager } from "./optimize-manager";

export function useOptimizer() {
  const ref = useRef<OptimizeManager>();

  if (!ref.current) {
    ref.current = new OptimizeManager();
  }
  return ref.current;
}
