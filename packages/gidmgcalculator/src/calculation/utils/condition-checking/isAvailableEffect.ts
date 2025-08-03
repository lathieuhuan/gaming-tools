import type { EffectGrantedAt } from "@Src/calculation/types";
import { Character } from "@Src/types";
import { CharacterCalc } from "../calc-utils";
import { isPassedComparison } from "./isPassedComparison";

export function isAvailableEffect(
  condition: EffectGrantedAt | undefined,
  character: Character,
  inputs: number[],
  fromSelf: boolean
): boolean {
  if (condition) {
    const {
      value,
      altIndex = undefined,
      compareValue = 1,
      comparison = "EQUAL",
    } = typeof condition === "string" ? { value: condition } : condition;

    if (fromSelf) {
      return CharacterCalc.isGrantedEffect(value, character);
    }
    return altIndex === undefined || isPassedComparison(inputs[altIndex] ?? 0, compareValue, comparison);
  }

  return true;
}
