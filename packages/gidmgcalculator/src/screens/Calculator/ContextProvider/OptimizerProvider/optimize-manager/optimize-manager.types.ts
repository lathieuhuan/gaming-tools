import type { AttackPattern, CalcItem } from "@Backend";
import type { CalcArtifacts, ElementModCtrl } from "@Src/types";
import type { SetupOptimizer } from "./setup-optimizer";

export type OptimizeCalculation = {
  damage: number | number[];
  artifacts: CalcArtifacts;
};

// export type OptimizeResult = { bests: OptimizeCalculation[]; calculations: OptimizeCalculation[] };
export type OptimizeResult = OptimizeCalculation[];

// ========== REQUEST ==========

export type OTM_InitRequest = {
  type: "INIT";
  params: ConstructorParameters<typeof SetupOptimizer>;
};

export type OTM_LoadRequest = {
  type: "LOAD";
  params: Parameters<SetupOptimizer["load"]>;
};

export type OTM_OptimizeRequest = {
  type: "OPTIMIZE";
  calcItemParams: {
    pattern: AttackPattern;
    calcItem: CalcItem;
    elmtModCtrls: ElementModCtrl;
  };
  optimizeParams: Parameters<SetupOptimizer["optimize"]>;
};

export type OTM_ManagerRequest = OTM_InitRequest | OTM_LoadRequest | OTM_OptimizeRequest;

// ========== RESPONSE ==========

export type OTM_ProcessInfo = Parameters<SetupOptimizer["onReachMilestone"]>[0];

export type OTM_ProcessResponse = {
  type: "PROCESS";
  info: OTM_ProcessInfo;
};

type OTM_CompleteResponse = {
  type: "COMPLETE";
  runTime: number;
  result: OptimizeResult;
};

export type OTM_WorkerResponse = OTM_ProcessResponse | OTM_CompleteResponse;
