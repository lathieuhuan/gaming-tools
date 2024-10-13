import type { Character } from "@Src/types";
import type {
  EntityBonusStack,
  EntityEffectExtraMax,
  EntityEffectMax,
  ApplicableCondition,
  ElementType,
  EntityBonusValueOption,
  EffectUsableCondition,
  EntityBonusBasedOn,
  EntityBonusBasedOnField,
} from "@Src/backend/types";
import type { CalculationInfo } from "@Src/backend/utils";

import { toArray, Utils_ } from "@Src/utils";
import { GeneralCalc } from "./general-calc";
import { CharacterCalc } from "./character-calc";

export class EntityCalc {
  static isGrantedEffect(condition: ApplicableCondition, char: Character) {
    if (condition.grantedAt) {
      const [prefix, level] = condition.grantedAt;
      return (prefix === "A" ? GeneralCalc.getAscension(char.level) : char.cons) >= +level;
    }
    return true;
  }

  static isApplicableEffect(
    condition: ApplicableCondition,
    info: CalculationInfo,
    inputs: number[],
    fromSelf = false
  ): boolean {
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
    const elementCount = GeneralCalc.countElements(info.partyData, info.appChar);

    if (totalPartyElmtCount) {
      const { elements, value, type } = totalPartyElmtCount;
      const totalCount = elements.reduce((total, element) => total + (elementCount[element] ?? 0), 0);

      switch (type) {
        case "max":
          if (totalCount > value) return false;
      }
    }
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

  static getBonusValueOptionIndex(config: EntityBonusValueOption, info: CalculationInfo, inputs: number[]) {
    const { optIndex = 0 } = config;
    const indexConfig =
      typeof optIndex === "number"
        ? ({ source: "INPUT", inpIndex: optIndex } satisfies EntityBonusValueOption["optIndex"])
        : optIndex;
    let indexValue = -1;

    switch (indexConfig.source) {
      case "INPUT":
        indexValue += inputs[indexConfig.inpIndex];
        break;
      case "ELEMENT": {
        const { element } = indexConfig;
        const elementCount = info.partyData.length ? GeneralCalc.countElements(info.partyData, info.appChar) : {};

        switch (element) {
          case "various":
            indexValue += Object.keys(elementCount).length;
            break;
          case "different":
            indexValue += Object.keys(elementCount).reduce((total, type) => {
              return type !== info.appChar.vision ? total + 1 : total;
            }, 0);
            break;
          default:
            indexValue +=
              typeof element === "string"
                ? elementCount[element] ?? 0
                : element.reduce((total, type) => total + (elementCount[type] ?? 0), 0);
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
    extras: EntityEffectExtraMax | EntityEffectExtraMax[],
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

  static getMax(max: EntityEffectMax, info: CalculationInfo, inputs: number[], fromSelf: boolean) {
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

  static getStackValue(
    stack: EntityBonusStack | undefined,
    info: CalculationInfo,
    inputs: number[],
    fromSelf: boolean
  ): number | null {
    if (!stack) {
      return 1;
    }
    const { appChar, partyData } = info;
    const partyDependentStackTypes: EntityBonusStack["type"][] = ["ELEMENT", "ENERGY", "NATION", "RESOLVE", "MIX"];

    if (partyDependentStackTypes.includes(stack.type) && !partyData.length) {
      return null;
    }
    let result = 0;

    switch (stack.type) {
      case "INPUT": {
        const finalIndex = stack.alterIndex !== undefined && !fromSelf ? stack.alterIndex : stack.index ?? 0;
        let input = 0;

        if (typeof finalIndex === "number") {
          input = inputs[finalIndex] ?? 0;

          if (stack.doubledAt !== undefined && inputs[stack.doubledAt]) {
            input *= 2;
          }
        } else {
          input = finalIndex.reduce((total, { value, ratio = 1 }) => total + (inputs[value] ?? 0) * ratio, 0);
        }

        if (stack.capacity) {
          const { value, extra } = stack.capacity;
          input = value - input;
          if (EntityCalc.isApplicableEffect(extra, info, inputs, fromSelf)) input += extra.value;
          input = Math.max(input, 0);
        }
        result = input;
        break;
      }
      case "ELEMENT": {
        const { element } = stack;
        const elementsCount = GeneralCalc.countElements(partyData);

        switch (element) {
          case "different":
            result = Utils_.keysOf(elementsCount).reduce((total, type) => {
              return total + (type !== appChar.vision ? elementsCount[type] ?? 0 : 0);
            }, 0);
            break;
          case "same_excluded":
            result = Utils_.keysOf(elementsCount).reduce((total, type) => {
              return total + (type === appChar.vision ? elementsCount[type] ?? 0 : 0);
            }, 0);
            break;
          case "same_included":
            result = Utils_.keysOf(elementsCount).reduce((total, type) => {
              return total + (type === appChar.vision ? elementsCount[type] ?? 0 : 0);
            }, 1);
            break;
          default:
            result = Utils_.keysOf(elementsCount).reduce(
              (total, type) => total + (type === element ? elementsCount[type] ?? 0 : 0),
              appChar.vision === element ? 1 : 0
            );
        }
        break;
      }
      case "ENERGY": {
        result = appChar.EBcost;

        if (stack.scope === "PARTY") {
          result += partyData.reduce((result, data) => result + (data?.EBcost ?? 0), 0);
        }
        break;
      }
      case "NATION": {
        if (stack.nation === "liyue") {
          result = partyData.reduce(
            (result, data) => result + (data?.nation === "liyue" ? 1 : 0),
            appChar.nation === "liyue" ? 1 : 0
          );
        } else {
          result = partyData.reduce((total, teammate) => total + (teammate?.nation === appChar.nation ? 1 : 0), 0);

          if (stack.nation === "different") {
            result = partyData.filter(Boolean).length - result;
          }
        }
        break;
      }
      case "RESOLVE": {
        let [totalEnergy = 0, electroEnergy = 0] = inputs;
        if (info.char.cons >= 1 && electroEnergy <= totalEnergy) {
          totalEnergy += electroEnergy * 0.8 + (totalEnergy - electroEnergy) * 0.2;
        }
        const level = CharacterCalc.getFinalTalentLv({
          talentType: "EB",
          char: info.char,
          appChar,
          partyData,
        });
        const stackPerEnergy = Math.min(Math.ceil(14.5 + level * 0.5), 20);
        const stacks = Math.round(totalEnergy * stackPerEnergy) / 100;
        // const countResolve = (energyCost: number) => Math.round(energyCost * stackPerEnergy) / 100;

        result = Math.min(stacks, 60);
        break;
      }
      case "MIX": {
        if (info.appChar.nation === "natlan") result += 1;

        for (const teammate of info.partyData) {
          if (teammate && (teammate.nation === "natlan" || teammate.vision !== info.appChar.vision)) {
            result += 1;
          }
        }
        break;
      }
    }

    if (stack.baseline) {
      if (result <= stack.baseline) return 0;
      result -= stack.baseline;
    }
    if (stack.extra && EntityCalc.isApplicableEffect(stack.extra, info, inputs, fromSelf)) {
      result += stack.extra.value;
    }
    if (stack.max) {
      const max = this.getMax(stack.max, info, inputs, fromSelf);
      if (result > max) result = max;
    }

    return Math.max(result, 0);
  }
}

function isUsableEffect(info: CalculationInfo, inputs: number[], usableCondition: EffectUsableCondition) {
  const { checkInput, checkInfo } = usableCondition;

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
  if (checkInfo !== undefined) {
    switch (checkInfo.type) {
      case "vision":
        if (info.appChar.vision !== checkInfo.value) return false;
        break;
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
