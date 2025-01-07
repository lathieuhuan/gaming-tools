import type { AttackPattern, TalentCalcItem } from "@Backend";
import type { StepConfig, OptimizationGuideProps } from "./components/OptimizationGuide";

export type OptimizationModalType = "GUIDE" | "PIECE_SELECT" | "OPTIMIZER" | "EXIT_CONFIRM" | "";

type OptimizationStepKey = "ARTIFACT_SELECT" | "MODIFIER_CONFIG" | "OUTPUT_SELECT" | "LAUNCH";

export type OptimizationStepConfig = StepConfig<OptimizationStepKey>;

export type OnChangeStep = OptimizationGuideProps<OptimizationStepKey>["onChangStep"];

export type OptimizedOutput = {
  attPatt: AttackPattern;
  item: TalentCalcItem;
};
