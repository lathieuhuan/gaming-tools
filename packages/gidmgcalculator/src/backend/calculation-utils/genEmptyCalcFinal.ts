import type { ActualAttackElement, ActualAttackPattern, CalcItemType, CalculationFinalResultItem } from "../types";

export function genEmptyCalcFinalResultItem(
  type: CalcItemType,
  attPatt: ActualAttackPattern,
  attElmt: ActualAttackElement
): CalculationFinalResultItem {
  return type === "attack"
    ? {
        type,
        nonCrit: 0,
        crit: 0,
        average: 0,
        attPatt,
        attElmt,
      }
    : {
        type,
        nonCrit: 0,
        crit: 0,
        average: 0,
      };
}
