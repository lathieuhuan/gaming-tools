import type { EffectApplicableCondition, EffectUsableCondition } from "../types";
import { type CalculationInfo, GeneralCalc, isGrantedEffect } from "../utils";
import { CountMap } from "@Src/utils";

export class ModifierGetterCore {
  constructor(protected info: CalculationInfo) {}

  private isUsableEffect(inputs: number[], usableCondition: EffectUsableCondition) {
    const { appChar, partyData } = this.info;
    const { checkInput, checkChar } = usableCondition;

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

  private isAvailableEffect(condition: EffectApplicableCondition, inputs: number[], fromSelf: boolean): boolean {
    if (fromSelf) {
      if (!isGrantedEffect(condition, this.info.char)) return false;
    } else if (condition.alterIndex !== undefined && !inputs[condition.alterIndex]) {
      return false;
    }
    return true;
  }

  isApplicableEffect(condition: EffectApplicableCondition, inputs: number[], fromSelf = false): boolean {
    const { appChar, partyData } = this.info;

    if (!this.isUsableEffect(inputs, condition)) {
      return false;
    }
    if (!this.isAvailableEffect(condition, inputs, fromSelf)) {
      return false;
    }

    const { totalPartyElmtCount, partyElmtCount, partyOnlyElmts } = condition;

    if (condition.forWeapons && !condition.forWeapons.includes(appChar.weaponType)) {
      return false;
    }
    if (condition.forElmts && !condition.forElmts.includes(appChar.vision)) {
      return false;
    }
    const elementCountMap = GeneralCalc.countElements(partyData, appChar);

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
  }
}
