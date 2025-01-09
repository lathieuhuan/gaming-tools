import { createContext } from "react";
import type { OptimizeDeptState } from "./OptimizeDept.types";
import type { OptimizeManager } from "./hooks/useOptimizeManager";

export type OptimizeSystem = {
  state: OptimizeDeptState;
  contact: () => void;
  cancelProcess: () => void;
  subscribeProcess: OptimizeManager["subscribeProcess"];
};

export const OptimizeSystemContext = createContext<OptimizeSystem | null>(null);
