import type { Character } from "@Src/types";
import type { ConditionComparison, EffectApplicableCondition, EffectUsableCondition } from "@Src/backend/types";
import type { CharacterData } from "./character-data";

import TypeCounter from "@Src/utils/type-counter";
import { CharacterCalc } from "./character-calc";

function isPassedComparison(value: number, condition: number, comparision: ConditionComparison = "EQUAL"): boolean {
  switch (comparision) {
    case "EQUAL":
      return value === condition;
    case "MIN":
      return value >= condition;
    case "MAX":
      return value <= condition;
  }
}

function isUsableEffect(condition: EffectUsableCondition, characterData: CharacterData, inputs: number[]) {
  const { checkInput, checkParty } = condition;

  if (checkInput !== undefined) {
    const {
      value,
      inpIndex = 0,
      comparison = "EQUAL",
    } = typeof checkInput === "number" ? { value: checkInput } : checkInput;
    const input = inputs[inpIndex];

    if (input === undefined || !isPassedComparison(input, value, comparison)) {
      return false;
    }
  }
  if (checkParty !== undefined) {
    let input = 0;

    switch (checkParty.type) {
      case "DISTINCT_ELMT":
        input = characterData.allElmtCount.keys.length;
        break;
      case "MIXED":
        input = characterData.appCharacter.nation === "natlan" ? 1 : 0;

        characterData.forEachTeammate((data) => {
          input += data.nation === "natlan" || data.vision !== characterData.appCharacter.vision ? 1 : 0;
        });
        break;
    }
    if (!isPassedComparison(input, checkParty.value, checkParty.comparison)) {
      return false;
    }
  }
  return true;
}

function isAvailableEffect(
  condition: EffectApplicableCondition,
  character: Character,
  inputs: number[],
  fromSelf: boolean
): boolean {
  if (fromSelf) {
    if (!CharacterCalc.isGrantedEffect(condition, character)) return false;
  } else if (condition.altIndex !== undefined && !inputs[condition.altIndex]) {
    return false;
  }
  return true;
}

export function isApplicableEffect(
  condition: EffectApplicableCondition,
  characterData: CharacterData,
  inputs: number[],
  fromSelf = false
): boolean {
  const allElmtCount = characterData.allElmtCount;

  if (!isUsableEffect(condition, characterData, inputs)) {
    return false;
  }
  if (!isAvailableEffect(condition, characterData.character, inputs, fromSelf)) {
    return false;
  }

  const { totalPartyElmtCount, partyElmtCount, partyOnlyElmts } = condition;

  if (condition.forWeapons && !condition.forWeapons.includes(characterData.appCharacter.weaponType)) {
    return false;
  }
  if (condition.forElmts && !condition.forElmts.includes(characterData.appCharacter.vision)) {
    return false;
  }

  if (totalPartyElmtCount) {
    const { elements, value, comparison } = totalPartyElmtCount;

    switch (comparison) {
      case "MAX":
        if (allElmtCount.get(elements) > value) return false;
    }
  }
  if (partyElmtCount) {
    const requiredEntries = new TypeCounter(partyElmtCount).entries;

    if (requiredEntries.some(([type, value]) => allElmtCount.get(type) < value)) {
      return false;
    }
  }
  if (partyOnlyElmts && allElmtCount.keys.some((elementType) => !partyOnlyElmts.includes(elementType))) {
    return false;
  }
  return true;
}
