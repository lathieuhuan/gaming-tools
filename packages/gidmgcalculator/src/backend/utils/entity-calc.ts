import type { Character } from "@Src/types";
import type { EffectApplicableCondition, EffectUsableCondition } from "../types";
import type { CalculationInfo } from "../utils";

import { CountMap } from "@Src/utils";
import { GeneralCalc } from "./general-calc";

export class EntityCalc {
  static isGrantedEffect(condition: EffectApplicableCondition, char: Character) {
    if (condition.grantedAt) {
      const [prefix, level] = condition.grantedAt;
      return (prefix === "A" ? GeneralCalc.getAscension(char.level) : char.cons) >= +level;
    }
    return true;
  }

  static isApplicableEffect(
    condition: EffectApplicableCondition,
    info: CalculationInfo,
    inputs: number[],
    fromSelf = false
  ): boolean {
    try {
      if (!isUsableEffect(info, inputs, condition)) {
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
        const requiredEntries = new CountMap(partyElmtCount).entries;

        if (requiredEntries.some(([type, value]) => elementCountMap.get(type) < value)) {
          return false;
        }
      }
      if (partyOnlyElmts && elementCountMap.keys.some((elementType) => !partyOnlyElmts.includes(elementType))) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}

function isUsableEffect(info: CalculationInfo, inputs: number[], usableCondition: EffectUsableCondition) {
  const { checkInput, checkChar } = usableCondition;

  if (checkInput !== undefined) {
    const { value, source = 0, type = "equal" } = typeof checkInput === "number" ? { value: checkInput } : checkInput;
    let input = 0;

    switch (source) {
      case "various_vision":
        if (info.partyData.length) {
          input = Object.keys(GeneralCalc.countElements(info.partyData, info.appChar)).length;
        } else {
          return false;
        }
        break;
      case "mixed":
        if (info.appChar.nation === "natlan") input += 1;

        for (const teammate of info.partyData) {
          if (teammate && (teammate.nation === "natlan" || teammate.vision !== info.appChar.vision)) {
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
        if (info.appChar.vision !== checkChar.value) return false;
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
    if (!EntityCalc.isGrantedEffect(condition, char)) return false;
  } else if (condition.alterIndex !== undefined && !inputs[condition.alterIndex]) {
    return false;
  }
  return true;
}
