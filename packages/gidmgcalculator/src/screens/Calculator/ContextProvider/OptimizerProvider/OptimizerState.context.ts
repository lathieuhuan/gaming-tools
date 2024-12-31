import { createContext } from "react";
import type { OptimizeResult, OptimizeManager } from "./optimize-manager";

export type OptimizerStatus = {
  active: boolean;
  loading: boolean;
  testMode: boolean;
  result: OptimizeResult;
};

export type OptimizerState = {
  status: OptimizerStatus;
  optimizer: Pick<OptimizeManager, "init" | "load" | "optimize" | "end" | "subscribeCompletion" | "onProcess">;
  toggle: (key: keyof OptimizerStatus, active?: boolean) => void;
};

export const OptimizerStateContext = createContext<OptimizerState | null>(null);
