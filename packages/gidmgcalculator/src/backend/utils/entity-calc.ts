import type { Character } from "@Src/types";
import type {
  EffectApplicableCondition,
  EffectExtra,
  EffectMax,
  EffectUsableCondition,
  EntityBonusBasedOn,
  EntityBonusBasedOnField,
  EntityBonusStack,
  EntityBonusValueByOption,
} from "../types";
import type { CalculationInfo } from "../utils";

import { CountMap, toArray } from "@Src/utils";
import { GeneralCalc } from "./general-calc";
import { CharacterCalc } from "./character-calc";

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

  static getBonusValueOptionIndex(config: EntityBonusValueByOption, info: CalculationInfo, inputs: number[]) {
    const { optIndex = 0 } = config;
    const indexConfig =
      typeof optIndex === "number"
        ? ({ source: "INPUT", inpIndex: optIndex } satisfies EntityBonusValueByOption["optIndex"])
        : optIndex;
    let indexValue = -1;

    switch (indexConfig.source) {
      case "INPUT":
        indexValue += inputs[indexConfig.inpIndex];
        break;
      case "ELEMENT": {
        const { element } = indexConfig;
        const elementCount = GeneralCalc.countElements(info.partyData, info.appChar);

        switch (element) {
          case "various_types":
            indexValue += elementCount.keys.length;
            break;
          case "different":
            elementCount.forEach((elementType) => {
              if (elementType !== info.appChar.vision) indexValue++;
            });
            break;
          default:
            if (typeof element === "string") {
              indexValue += elementCount.get(element);
            } else if (indexConfig.distinct) {
              indexValue += element.reduce((total, elementType) => total + (elementCount.has(elementType) ? 1 : 0), 0);
            } else {
              indexValue += element.reduce((total, type) => total + elementCount.get(type), 0);
            }
        }
        break;
      }
      case "LEVEL": {
        indexValue += CharacterCalc.getFinalTalentLv({
          talentType: indexConfig.talent,
          char: info.char,
          appChar: info.appChar,
          partyData: info.partyData,
        });
        break;
      }
    }
    return indexValue;
  }

  static getTotalExtraMax(
    extras: EffectExtra | EffectExtra[],
    info: CalculationInfo,
    inputs: number[],
    fromSelf: boolean
  ) {
    let result = 0;

    for (const extra of toArray(extras)) {
      if (EntityCalc.isApplicableEffect(extra, info, inputs, fromSelf)) {
        result += extra.value;
      }
    }
    return result;
  }

  static getMax(max: EffectMax, info: CalculationInfo, inputs: number[], fromSelf: boolean) {
    return typeof max === "number"
      ? max
      : max.value + (max.extras ? this.getTotalExtraMax(max.extras, info, inputs, fromSelf) : 0);
  }

  static getBasedOn(
    basedOn: EntityBonusBasedOn,
    inputs: number[],
    fromSelf: boolean,
    getTotalAttrFromSelf: (field: EntityBonusBasedOnField) => number
  ) {
    const { field, alterIndex = 0, baseline = 0 } = typeof basedOn === "string" ? { field: basedOn } : basedOn;
    const basedOnValue = fromSelf ? getTotalAttrFromSelf(field) : inputs[alterIndex] ?? 1;
    return {
      basedOnField: field,
      basedOnValue: Math.max(basedOnValue - baseline, 0),
    };
  }

  // static getStackValue(
  //   stack: EntityBonusStack | undefined,
  //   info: CalculationInfo,
  //   inputs: number[],
  //   fromSelf: boolean
  // ): number | null {
  //   if (!stack) {
  //     return 1;
  //   }
  //   const { appChar, partyData } = info;
  //   const partyDependentStackTypes: EntityBonusStack["type"][] = ["ELEMENT", "ENERGY", "NATION", "RESOLVE", "MIX"];

  //   if (partyDependentStackTypes.includes(stack.type) && !partyData.length) {
  //     return null;
  //   }
  //   let result = 0;

  //   switch (stack.type) {
  //     case "INPUT": {
  //       const finalIndex = stack.alterIndex !== undefined && !fromSelf ? stack.alterIndex : stack.index ?? 0;
  //       let input = 0;

  //       if (typeof finalIndex === "number") {
  //         input = inputs[finalIndex] ?? 0;

  //         if (stack.doubledAt !== undefined && inputs[stack.doubledAt]) {
  //           input *= 2;
  //         }
  //       } else {
  //         input = finalIndex.reduce((total, { value, ratio = 1 }) => total + (inputs[value] ?? 0) * ratio, 0);
  //       }

  //       if (stack.capacity) {
  //         const { value, extra } = stack.capacity;
  //         input = value - input;
  //         if (EntityCalc.isApplicableEffect(extra, info, inputs, fromSelf)) input += extra.value;
  //         input = Math.max(input, 0);
  //       }
  //       result = input;
  //       break;
  //     }
  //     case "ELEMENT": {
  //       const { element } = stack;
  //       const elementsCount = GeneralCalc.countElements(partyData);

  //       switch (element) {
  //         case "different":
  //           elementsCount.forEach((type, value) => {
  //             result += type !== appChar.vision ? value : 0;
  //           });
  //           break;
  //         case "same_excluded":
  //           elementsCount.forEach((type, value) => {
  //             result += type === appChar.vision ? value : 0;
  //           });
  //           break;
  //         case "same_included":
  //           elementsCount.forEach((type, value) => {
  //             result += type === appChar.vision ? value : 0;
  //           });
  //           result++;
  //           break;
  //         default:
  //           elementsCount.forEach((type, value) => {
  //             result += type === element ? value : 0;
  //           });
  //           if (appChar.vision === element) result++;
  //       }
  //       break;
  //     }
  //     case "ENERGY": {
  //       result = appChar.EBcost;

  //       if (stack.scope === "PARTY") {
  //         result += partyData.reduce((result, data) => result + (data?.EBcost ?? 0), 0);
  //       }
  //       break;
  //     }
  //     case "NATION": {
  //       if (stack.nation === "liyue") {
  //         result = partyData.reduce(
  //           (result, data) => result + (data?.nation === "liyue" ? 1 : 0),
  //           appChar.nation === "liyue" ? 1 : 0
  //         );
  //       } else {
  //         result = partyData.reduce((total, teammate) => total + (teammate?.nation === appChar.nation ? 1 : 0), 0);

  //         if (stack.nation === "different") {
  //           result = partyData.filter(Boolean).length - result;
  //         }
  //       }
  //       break;
  //     }
  //     case "RESOLVE": {
  //       let [totalEnergy = 0, electroEnergy = 0] = inputs;
  //       if (info.char.cons >= 1 && electroEnergy <= totalEnergy) {
  //         totalEnergy += electroEnergy * 0.8 + (totalEnergy - electroEnergy) * 0.2;
  //       }
  //       const level = CharacterCalc.getFinalTalentLv({
  //         talentType: "EB",
  //         char: info.char,
  //         appChar,
  //         partyData,
  //       });
  //       const stackPerEnergy = Math.min(Math.ceil(14.5 + level * 0.5), 20);
  //       const stacks = Math.round(totalEnergy * stackPerEnergy) / 100;
  //       // const countResolve = (energyCost: number) => Math.round(energyCost * stackPerEnergy) / 100;

  //       result = Math.min(stacks, 60);
  //       break;
  //     }
  //     case "MIX": {
  //       if (info.appChar.nation === "natlan") result += 1;

  //       for (const teammate of info.partyData) {
  //         if (teammate && (teammate.nation === "natlan" || teammate.vision !== info.appChar.vision)) {
  //           result += 1;
  //         }
  //       }
  //       break;
  //     }
  //   }

  //   if (stack.baseline) {
  //     if (result <= stack.baseline) return 0;
  //     result -= stack.baseline;
  //   }
  //   if (stack.extra && EntityCalc.isApplicableEffect(stack.extra, info, inputs, fromSelf)) {
  //     result += stack.extra.value;
  //   }
  //   if (stack.max) {
  //     const max = this.getMax(stack.max, info, inputs, fromSelf);
  //     if (result > max) result = max;
  //   }

  //   return Math.max(result, 0);
  // }
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
