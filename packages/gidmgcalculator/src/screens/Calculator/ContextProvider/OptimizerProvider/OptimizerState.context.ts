import { createContext } from "react";
import type { CalcSetup, CalcSetupManageInfo } from "@Src/types";
import type { OptimizeResult, OptimizeManager } from "./optimize-manager";

type OptimizedSetup = CalcSetup & CalcSetupManageInfo;

export type OptimizerStatus = {
  active: boolean;
  loading: boolean;
  testMode: boolean;
  setup?: OptimizedSetup;
  result: OptimizeResult;
};

export type OptimizerState = {
  status: OptimizerStatus;
  optimizer: Pick<OptimizeManager, "init" | "load" | "optimize" | "end" | "subscribeCompletion" | "onProcess">;
  setActive: (value: boolean, setup?: OptimizedSetup, testMode?: boolean) => void;
  setLoading: (value: boolean) => void;
};

export const OptimizerStateContext = createContext<OptimizerState | null>(null);
