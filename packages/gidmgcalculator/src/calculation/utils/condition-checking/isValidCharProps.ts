import type { AppCharacter, CharacterPropertyCondition } from "@Src/calculation/types";

export function isValidCharProps(condition: CharacterPropertyCondition, character: AppCharacter) {
  if (condition.forWeapons && !condition.forWeapons.includes(character.weaponType)) {
    return false;
  }
  if (condition.forElmts && !condition.forElmts.includes(character.vision)) {
    return false;
  }
  if (condition.forName && !character.name.includes(condition.forName)) {
    return false;
  }
  return true;
}
