import type { Character, PartyData } from "@Src/types";
import type {
  AppCharacter,
  CalculationInfo,
  EffectApplicableCondition,
  EffectUsableCondition,
} from "@Src/backend/types";
import { TypeCounter } from "@Src/utils";
import { GeneralCalc } from "@Src/backend/common-utils";
import { isGrantedEffect } from "./isGrantedEffect";

function isUsableEffect(
  condition: EffectUsableCondition,
  appChar: AppCharacter,
  partyData: PartyData,
  inputs: number[]
) {
  const { checkInput, checkChar } = condition;

  if (checkInput !== undefined) {
    const { value, source = 0, type = "equal" } = typeof checkInput === "number" ? { value: checkInput } : checkInput;
    let input = 0;

    switch (source) {
      case "various_vision":
        if (partyData.length) {
          input = GeneralCalc.countElements(partyData, appChar).keys.length;
        } else {
          return false;
        }
        break;
      case "mixed":
        if (appChar.nation === "natlan") input += 1;

        for (const teammate of partyData) {
          if (teammate && (teammate.nation === "natlan" || teammate.vision !== appChar.vision)) {
            input += 1;
          }
        }
        break;
      default:
        input = inputs[source];
    }

    switch (type) {
      case "equal":
        if (input !== value) return false;
        else break;
      case "min":
        if (input < value) return false;
        else break;
      case "max":
        if (input > value) return false;
        else break;
    }
  }
  if (checkChar !== undefined) {
    switch (checkChar.type) {
      case "vision":
        if (appChar.vision !== checkChar.value) return false;
        break;
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
  } else if (condition.alterIndex !== undefined && !inputs[condition.alterIndex]) {
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
  if (!isUsableEffect(condition, info.appChar, info.partyData, inputs)) {
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
  const elementCountMap = GeneralCalc.countElements(info.partyData, info.appChar);

  if (totalPartyElmtCount) {
    const { elements, value, type } = totalPartyElmtCount;

    switch (type) {
      case "max":
        if (elementCountMap.get(elements) > value) return false;
    }
  }
  if (partyElmtCount) {
    const requiredEntries = new TypeCounter(partyElmtCount).entries;

    if (requiredEntries.some(([type, value]) => elementCountMap.get(type) < value)) {
      return false;
    }
  }
  if (partyOnlyElmts && elementCountMap.keys.some((elementType) => !partyOnlyElmts.includes(elementType))) {
    return false;
  }
  return true;
}
