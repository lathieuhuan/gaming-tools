import type { OptimizeResult, OptimizerManager } from "./optimizer-manager";

export type OptimizerStatus = {
  active: boolean;
  loading: boolean;
  result: OptimizeResult;
};

export type OptimizerState = {
  status: OptimizerStatus;
  optimizer: Pick<OptimizerManager, "init" | "load" | "optimize" | "subscribeCompletion" | "onProcess">;
  toggle: (key: keyof OptimizerStatus, active?: boolean) => void;
};
