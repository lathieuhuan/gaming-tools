import type { EffectGrantedAt } from "@/calculation/types";
import { Character } from "@/types";
import { CharacterCalc } from "@/calculation/utils";
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
