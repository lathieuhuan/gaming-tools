import type { Character } from "@Src/types";
import type {
  ConditionComparison,
  EffectApplicableCondition,
  EffectUsableCondition,
  InputCheck,
} from "@Src/calculation/types";

import { CharacterCalc } from "./CharacterCalc";
import type { CharacterReadData } from "./CharacterReadData";

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

function isUnqualifiedInput(checkInput: InputCheck, inputs: number[]) {
  const {
    value,
    inpIndex = 0,
    comparison = "EQUAL",
  } = typeof checkInput === "number" ? { value: checkInput } : checkInput;
  const input = inputs[inpIndex];
  return input === undefined || !isPassedComparison(input, value, comparison);
}

function isUsableEffect(condition: EffectUsableCondition, characterData: CharacterReadData, inputs: number[]) {
  const { checkInput, checkParty } = condition;

  if (checkInput !== undefined) {
    if (Array.isArray(checkInput)) {
      if (checkInput.some((check) => isUnqualifiedInput(check, inputs))) {
        return false;
      }
    } else {
      const singleCheckInput: InputCheck = typeof checkInput === "number" ? { value: checkInput } : checkInput;

      if (isUnqualifiedInput(singleCheckInput, inputs)) {
        return false;
      }
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
  characterData: CharacterReadData,
  inputs: number[],
  fromSelf = false
): boolean {
  const { appCharacter } = characterData;

  if (!isUsableEffect(condition, characterData, inputs)) {
    return false;
  }
  if (!isAvailableEffect(condition, characterData.character, inputs, fromSelf)) {
    return false;
  }
  if (condition.forWeapons && !condition.forWeapons.includes(appCharacter.weaponType)) {
    return false;
  }
  if (condition.forElmts && !condition.forElmts.includes(appCharacter.vision)) {
    return false;
  }
  if (condition.forName && !appCharacter.name.includes(condition.forName)) {
    return false;
  }
  if (!characterData.isValidPartyElmt(condition)) {
    return false;
  }

  return true;
}
