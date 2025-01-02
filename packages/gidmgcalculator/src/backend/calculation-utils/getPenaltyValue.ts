import type { EntityPenaltyCore } from "../types";
import type { CharacterData } from "../common-utils/character-data";
import { isApplicableEffect } from "./isApplicableEffect";

export function getPenaltyValue(
  debuff: EntityPenaltyCore,
  characterData: CharacterData,
  inputs: number[],
  fromSelf = true
) {
  const { preExtra } = debuff;
  let result = debuff.value * characterData.getLevelScale(debuff.lvScale, inputs, fromSelf);

  if (typeof preExtra === "number") {
    result += preExtra;
  } else if (preExtra && isApplicableEffect(preExtra, characterData, inputs, fromSelf)) {
    result += getPenaltyValue(preExtra, characterData, inputs, fromSelf);
  }
  if (debuff.max) result = Math.min(result, debuff.max);

  return Math.max(result, 0);
}
