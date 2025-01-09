import type { CalcArtifacts } from "@Src/types";

export type OptimizeCalculation = {
  damage: number | number[];
  artifacts: CalcArtifacts;
};

// export type OptimizeResult = { bests: OptimizeCalculation[]; calculations: OptimizeCalculation[] };
export type OptimizeResult = OptimizeCalculation[];
