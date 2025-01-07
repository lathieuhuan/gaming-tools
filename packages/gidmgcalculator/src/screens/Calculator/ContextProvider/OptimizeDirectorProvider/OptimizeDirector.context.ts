import { createContext } from "react";
import type { CalcSetup, CalcSetupManageInfo } from "@Src/types";
import type { OptimizeResult, OptimizeManager } from "./optimize-manager";

type OptimizedSetup = CalcSetup & CalcSetupManageInfo;

type OptimizerStatus = "IDLE" | "WORKING" | "CANCELLED";

type OptimizeDirectorState = {
  active: boolean;
  optimizerStatus: OptimizerStatus;
  testMode: boolean;
  pendingResult: boolean;
  setup?: OptimizedSetup;
  result: OptimizeResult;
};

type OptimizeDirector = {
  state: OptimizeDirectorState;
  optimizer: Pick<OptimizeManager, "init" | "load" | "optimize" | "end" | "subscribeCompletion" | "subscribeProcess">;
  open: (setup?: OptimizedSetup, testMode?: boolean) => void;
  close: (keepResult: boolean) => void;
  cancel: () => void;
  // setLoading: (value: boolean) => void;
};

export type { OptimizerStatus, OptimizeResult, OptimizeDirectorState, OptimizeDirector };

export const OptimizeDirectorContext = createContext<OptimizeDirector | null>(null);
