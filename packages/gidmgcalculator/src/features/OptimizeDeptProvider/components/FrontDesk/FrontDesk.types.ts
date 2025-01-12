import type { OptimizeManager } from "@OptimizeDept/hooks/useOptimizeManager";
import type { OptimizeDeptGuideProps, StepConfig } from "./OptimizeDeptGuide";

export type OptimizeDeptModalType = "GUIDE" | "PIECE_SELECT" | "OPTIMIZER" | "EXIT_CONFIRM" | "";

type OptimizeStepKey = "ARTIFACT_SELECT" | "MODIFIER_CONFIG" | "OUTPUT_SELECT" | "LAUNCH";

export type OptimizeStepConfig = StepConfig<OptimizeStepKey>;

export type OnChangeStep = OptimizeDeptGuideProps<OptimizeStepKey>["onChangStep"];

export type Optimizer = Pick<OptimizeManager, "init" | "load" | "optimize">;
