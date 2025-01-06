import { AttackPattern, TalentCalcItem } from "@Backend";
import { OptimizationGuideControl as GuideControl, StepConfig } from "./components/OptimizationGuide";

export type OptimizationModalType = "GUIDE" | "PIECE_SELECT" | "RESULT" | "EXIT_CONFIRM" | "";

export type OptimizationStepKey = "ARTIFACT_SELECT" | "MODIFIER_CONFIG" | "OUTPUT_SELECT" | "LAUNCH";

export type OptimizationStepConfig = StepConfig<OptimizationStepKey>;

export type OptimizationGuideControl = GuideControl<OptimizationStepKey>;

export type OptimizedOutput = {
  attPatt: AttackPattern;
  item: TalentCalcItem;
};
