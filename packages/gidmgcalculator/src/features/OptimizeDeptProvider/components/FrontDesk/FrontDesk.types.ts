import type { AttackPattern, TalentCalcItem } from "@Backend";
import type { StepConfig, OptimizeDeptGuideProps } from "./OptimizeDeptGuide";

export type OptimizeDeptModalType = "GUIDE" | "PIECE_SELECT" | "OPTIMIZER" | "EXIT_CONFIRM" | "";

type OptimizeStepKey = "ARTIFACT_SELECT" | "MODIFIER_CONFIG" | "OUTPUT_SELECT" | "LAUNCH";

export type OptimizeStepConfig = StepConfig<OptimizeStepKey>;

export type OnChangeStep = OptimizeDeptGuideProps<OptimizeStepKey>["onChangStep"];

export type OptimizedOutput = {
  attPatt: AttackPattern;
  item: TalentCalcItem;
};
