import type { EntityPenaltyCore } from "../types";
import type { CalcCharacterRecord } from "../common-utils/calc-character-record";
import { CharacterCalc } from "../common-utils";
import { isApplicableEffect } from "./isApplicableEffect";

export function getPenaltyValue(
  debuff: EntityPenaltyCore,
  record: CalcCharacterRecord,
  inputs: number[],
  fromSelf = true
) {
  const { preExtra } = debuff;
  let result = debuff.value * CharacterCalc.getLevelScale(debuff.lvScale, record, inputs, fromSelf);

  if (typeof preExtra === "number") {
    result += preExtra;
  } else if (preExtra && isApplicableEffect(preExtra, record, inputs, fromSelf)) {
    result += getPenaltyValue(preExtra, record, inputs, fromSelf);
  }
  if (debuff.max) result = Math.min(result, debuff.max);

  return Math.max(result, 0);
}
