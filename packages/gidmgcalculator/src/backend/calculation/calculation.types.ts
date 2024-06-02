import type { ActualAttackElement, ActualAttackPattern, CalcItemType } from "@Src/backend/types";
import type { CalculationFinalResultKey } from "@Src/backend/controls";

export type CalculationAspect = "nonCrit" | "crit" | "average";

type CalculationFinalResultAttackItem = {
  type: Extract<CalcItemType, "attack">;
  attElmt: ActualAttackElement;
  attPatt: ActualAttackPattern;
};

type CalculationFinalResultOtherItem = {
  type: Exclude<CalcItemType, "attack">;
};

export type CalculationFinalResultItem = Record<CalculationAspect, number | number[]> &
  (CalculationFinalResultAttackItem | CalculationFinalResultOtherItem);

export type CalculationFinalResultGroup = Record<string, CalculationFinalResultItem>;

export type CalculationFinalResult = Record<CalculationFinalResultKey, CalculationFinalResultGroup>;
