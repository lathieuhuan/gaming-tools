import type { AttackPattern, CalcItem, SetupOptimizer } from "@Backend";
import type { CalcArtifacts, ElementModCtrl } from "@Src/types";

export type OptimizeCalculation = {
  damage: number | number[];
  artifacts: CalcArtifacts;
};

export type OptimizeResult = { best: OptimizeCalculation; calculations: OptimizeCalculation[] };

// ========== REQUEST ==========

export type InitRequest = {
  type: "INIT";
  params: ConstructorParameters<typeof SetupOptimizer>;
};

export type LoadRequest = {
  type: "LOAD";
  params: Parameters<SetupOptimizer["load"]>;
};

export type OptimizeRequest = {
  type: "OPTIMIZE";
  calculateParams: {
    pattern: AttackPattern;
    calcItem: CalcItem;
    elmtModCtrls: ElementModCtrl;
  };
  params: Parameters<SetupOptimizer["optimize"]>;
};

export type OptimizeMessage = InitRequest | LoadRequest | OptimizeRequest;
