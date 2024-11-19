import type { Character, PartyData } from "@Src/types";
import type {
  AppCharacter,
  CalculationInfo,
  EffectApplicableCondition,
  EffectUsableCondition,
} from "@Src/backend/types";

import { TypeCounter } from "@Src/utils/type-counter";
import { GeneralCalc } from "@Src/backend/common-utils";
import { isGrantedEffect } from "./isGrantedEffect";
import { isPassedComparison } from "./isPassedComparison";

function isUsableEffect(
  condition: EffectUsableCondition,
  appChar: AppCharacter,
  partyData: PartyData,
  inputs: number[],
  elmtCounter = GeneralCalc.countElements(partyData, appChar)
) {
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
        input = elmtCounter.keys.length;
        break;
      case "MIXED":
        if (appChar.nation === "natlan") input += 1;

        for (const teammate of partyData) {
          if (teammate && (teammate.nation === "natlan" || teammate.vision !== appChar.vision)) {
            input += 1;
          }
        }
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
  char: Character,
  inputs: number[],
  fromSelf: boolean
): boolean {
  if (fromSelf) {
    if (!isGrantedEffect(condition, char)) return false;
  } else if (condition.altIndex !== undefined && !inputs[condition.altIndex]) {
    return false;
  }
  return true;
}

export function isApplicableEffect(
  condition: EffectApplicableCondition,
  info: CalculationInfo,
  inputs: number[],
  fromSelf = false
): boolean {
  const elmtCounter = GeneralCalc.countElements(info.partyData, info.appChar);

  if (!isUsableEffect(condition, info.appChar, info.partyData, inputs, elmtCounter)) {
    return false;
  }
  if (!isAvailableEffect(condition, info.char, inputs, fromSelf)) {
    return false;
  }

  const { totalPartyElmtCount, partyElmtCount, partyOnlyElmts } = condition;

  if (condition.forWeapons && !condition.forWeapons.includes(info.appChar.weaponType)) {
    return false;
  }
  if (condition.forElmts && !condition.forElmts.includes(info.appChar.vision)) {
    return false;
  }

  if (totalPartyElmtCount) {
    const { elements, value, type } = totalPartyElmtCount;

    switch (type) {
      case "MAX":
        if (elmtCounter.get(elements) > value) return false;
    }
  }
  if (partyElmtCount) {
    const requiredEntries = new TypeCounter(partyElmtCount).entries;

    if (requiredEntries.some(([type, value]) => elmtCounter.get(type) < value)) {
      return false;
    }
  }
  if (partyOnlyElmts && elmtCounter.keys.some((elementType) => !partyOnlyElmts.includes(elementType))) {
    return false;
  }
  return true;
}
