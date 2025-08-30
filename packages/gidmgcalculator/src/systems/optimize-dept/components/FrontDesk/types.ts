import type { OptimizeManager } from "@OptimizeDept/logic/OptimizeManager";

export type OptimizeDeptModalType = "GUIDE" | "PIECE_SELECT" | "OPTIMIZER" | "EXIT_CONFIRM" | "";

export type OptimizeStepKey = "ARTIFACT_SELECT" | "MODIFIER_CONFIG" | "OUTPUT_SELECT" | "LAUNCH";

export type Optimizer = Pick<OptimizeManager, "init" | "load" | "optimize">;
