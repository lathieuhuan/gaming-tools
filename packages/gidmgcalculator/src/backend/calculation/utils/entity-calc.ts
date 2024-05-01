import type { Character } from "@Src/types";
import type { ApplicableCondition, ElementType, InputCheck } from "@Src/backend/types";
import type { CalcUltilInfo } from "../calculation.types";
import { GeneralCalc } from "./general-calc";

export class EntityCalc {
  static isGrantedEffect(condition: ApplicableCondition, char: Character) {
    if (condition.grantedAt) {
      const [prefix, level] = condition.grantedAt;
      return (prefix === "A" ? GeneralCalc.getAscension(char.level) : char.cons) >= +level;
    }
    return true;
  }

  /**
   * @param fromSelf only on character effect
   */
  static isApplicableEffect(
    condition: ApplicableCondition,
    info: CalcUltilInfo,
    inputs: number[],
    fromSelf = false
  ): boolean {
    if (!isUsableEffect(info, inputs, condition.checkInput)) {
      return false;
    }
    if (!isAvailableEffect(condition, info.char, inputs, fromSelf)) {
      return false;
    }

    const { partyElmtCount, partyOnlyElmts } = condition;

    if (condition.forWeapons && !condition.forWeapons.includes(info.appChar.weaponType)) {
      return false;
    }
    if (condition.forElmts && !condition.forElmts.includes(info.appChar.vision)) {
      return false;
    }
    const elementCount = GeneralCalc.countElements(info.partyData, info.appChar);

    if (partyElmtCount) {
      for (const key in partyElmtCount) {
        const currentCount = elementCount[key as ElementType] ?? 0;
        const requiredCount = partyElmtCount[key as ElementType] ?? 0;
        if (currentCount < requiredCount) return false;
      }
    }
    if (partyOnlyElmts) {
      for (const type in elementCount) {
        if (!partyOnlyElmts.includes(type as ElementType)) return false;
      }
    }
    return true;
  }
}

function isUsableEffect(info: CalcUltilInfo, inputs: number[], checkInput?: number | InputCheck) {
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
  return true;
}

function isAvailableEffect(
  condition: ApplicableCondition,
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
