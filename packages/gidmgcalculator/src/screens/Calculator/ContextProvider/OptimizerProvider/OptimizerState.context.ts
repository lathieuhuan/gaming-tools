import { createContext } from "react";
import type { OptimizeResult, OptimizerManager } from "./optimize-manager";

export type OptimizerStatus = {
  active: boolean;
  loading: boolean;
  result: OptimizeResult;
};

export type OptimizerState = {
  status: OptimizerStatus;
  optimizer: Pick<OptimizerManager, "init" | "load" | "optimize" | "end" | "subscribeCompletion" | "onProcess">;
  toggle: (key: keyof OptimizerStatus, active?: boolean) => void;
};

export const OptimizerStateContext = createContext<OptimizerState | null>(null);
