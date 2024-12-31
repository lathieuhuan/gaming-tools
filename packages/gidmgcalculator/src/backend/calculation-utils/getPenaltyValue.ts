import type { EntityPenaltyCore } from "../types";
import type { CharacterRecord } from "../common-utils/character-record";
import { isApplicableEffect } from "./isApplicableEffect";

export function getPenaltyValue(
  debuff: EntityPenaltyCore,
  record: CharacterRecord,
  inputs: number[],
  fromSelf = true
) {
  const { preExtra } = debuff;
  let result = debuff.value * record.getLevelScale(debuff.lvScale, inputs, fromSelf);

  if (typeof preExtra === "number") {
    result += preExtra;
  } else if (preExtra && isApplicableEffect(preExtra, record, inputs, fromSelf)) {
    result += getPenaltyValue(preExtra, record, inputs, fromSelf);
  }
  if (debuff.max) result = Math.min(result, debuff.max);

  return Math.max(result, 0);
}
