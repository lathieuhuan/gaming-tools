import type { AppCharacter, EffectReceiverConditions } from "@/calculation/types";
import { isPassedComparison } from "./isPassedComparison";

export function isValidCharProps(condition: EffectReceiverConditions, character: AppCharacter, enhanced = false) {
  if (condition.forNation && condition.forNation !== character.nation) {
    return false;
  }
  if (condition.forWeapons && !condition.forWeapons.includes(character.weaponType)) {
    return false;
  }
  if (condition.forElmts && !condition.forElmts.includes(character.vision)) {
    return false;
  }
  if (condition.forName && !character.name.includes(condition.forName)) {
    return false;
  }
  if (condition.forEnergyCap) {
    const { value, comparison } = condition.forEnergyCap;
    if (!isPassedComparison(character.EBcost, value, comparison)) {
      return false;
    }
  }
  if (condition.forEnhanced && !enhanced) {
    return false;
  }
  return true;
}
