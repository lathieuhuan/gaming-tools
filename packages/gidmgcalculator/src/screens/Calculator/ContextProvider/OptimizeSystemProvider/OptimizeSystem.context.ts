import { createContext } from "react";
import type { OptimizerAllArtifactModConfigs } from "@Backend";
import type { CalcSetup, CalcSetupManageInfo, Target } from "@Src/types";
import type { OptimizeResult, OptimizeManager } from "./optimize-manager";

type OptimizedSetup = CalcSetup & CalcSetupManageInfo;

type OptimizerStatus = "IDLE" | "OPTIMIZING" | "CANCELLED";

type OptimizeSystemState = {
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

type OptimizeSystem = {
  state: OptimizeSystemState;
  optimizer: Pick<OptimizeManager, "init" | "load" | "optimize" | "end" | "subscribeCompletion" | "subscribeProcess">;
  onContacted: () => void;
  closeDept: (keepResult: boolean) => void;
  cancelProcess: () => void;
};

export type { OptimizerStatus, OptimizeResult, OptimizeSystemState, OptimizeSystem };

export const OptimizeSystemContext = createContext<OptimizeSystem | null>(null);
