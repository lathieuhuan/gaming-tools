import type { CalculationInfo, EntityPenaltyCore } from "../types";
import { CharacterCalc } from "../common-utils";
import { isApplicableEffect } from "./isApplicableEffect";

export function getPenaltyValue(debuff: EntityPenaltyCore, info: CalculationInfo, inputs: number[], fromSelf = true) {
  const { preExtra } = debuff;
  let result = debuff.value * CharacterCalc.getLevelScale(debuff.lvScale, info, inputs, fromSelf);

  if (typeof preExtra === "number") {
    result += preExtra;
  } else if (preExtra && isApplicableEffect(preExtra, info, inputs, fromSelf)) {
    result += getPenaltyValue(preExtra, info, inputs, fromSelf);
  }
  if (debuff.max) result = Math.min(result, debuff.max);

  return Math.max(result, 0);
}
