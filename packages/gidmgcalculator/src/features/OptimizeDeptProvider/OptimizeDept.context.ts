import { createContext } from "react";

import type { OptimizerAllArtifactModConfigs } from "@Backend";
import type { CalcSetup, Target } from "@Src/types";
import type { OptimizeResult } from "./OptimizeDept.types";
import type { OptimizeManager } from "./hooks/useOptimizeManager/optimize-manager";

type OptimizerStatus = "IDLE" | "OPTIMIZING" | "CANCELLED";

type OptimizeDeptState = {
  introducing: boolean;
  /** Front desk 'active' & Optimizer 'status' are seperate things */
  active: boolean;
  /** Optimizer 'status' & Front desk 'active' are seperate things */
  status: OptimizerStatus;
  testMode: boolean;
  pendingResult: boolean;
  result: OptimizeResult;
  setup?: CalcSetup;
  artifactModConfigs: OptimizerAllArtifactModConfigs;
  recreationData: {
    // manageInfo: CalcSetupManageInfo;
    target?: Target;
  };
};

type OptimizeDept = {
  state: OptimizeDeptState;
  optimizer: Pick<OptimizeManager, "init" | "load" | "optimize" | "end" | "subscribeCompletion" | "subscribeProcess">;
  onContacted: () => void;
  closeDept: (keepResult: boolean) => void;
  cancelProcess: () => void;
};

export type { OptimizeDept, OptimizeDeptState, OptimizeResult, OptimizerStatus };

export const OptimizeDeptContext = createContext<OptimizeDept | null>(null);
