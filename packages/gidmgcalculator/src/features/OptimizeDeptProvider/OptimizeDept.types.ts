import type { CalcArtifacts, CalcSetup, Target } from "@Src/types";
import type { AppCharacter, OptimizerAllArtifactModConfigs } from "@Backend";

export type OptimizeCalculation = {
  damage: number | number[];
  artifacts: CalcArtifacts;
};

// export type OptimizeResult = { bests: OptimizeCalculation[]; calculations: OptimizeCalculation[] };
export type OptimizeResult = OptimizeCalculation[];

export type OptimizerStatus = "IDLE" | "OPTIMIZING" | "CANCELLED";

export type OptimizeDeptState = {
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
  calcList: AppCharacter["calcList"];
  runCount: number;
};
