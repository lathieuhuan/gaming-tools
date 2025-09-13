import { createContext, useContext } from "react";
import type { OptimizeDeptState } from "./types";
import type { OptimizeManager } from "./logic/OptimizeManager";

export type OptimizeSystem = {
  state: OptimizeDeptState;
  contact: () => void;
  cancelProcess: () => void;
  subscribeProcess: OptimizeManager["subscribeProcess"];
  expectSetups: (ids: number[]) => void;
};

export const OptimizeSystemContext = createContext<OptimizeSystem | null>(null);

export const useOptimizeSystem = () => {
  const context = useContext(OptimizeSystemContext);

  if (!context) {
    throw new Error("useOptimizeSystem must be used inside OptimizeDeptProvider");
  }
  return context;
};
