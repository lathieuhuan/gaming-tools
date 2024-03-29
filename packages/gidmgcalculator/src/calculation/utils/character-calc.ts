import type {
  CharacterEffectAvailableCondition,
  Character,
  CharacterMilestone,
  ElementType,
  CharacterEffectExtendedUsableCondition,
  CharacterEffectLevelScale,
  CharacterEffectUsableCondition,
} from "@Src/types";
import type { CalcUltilInfo } from "../calculation.types";
import { Character_, Calculation_ } from "@Src/utils";

export class CharacterCal {
  static isGranted({ grantedAt }: { grantedAt?: CharacterMilestone }, char: Character) {
    if (grantedAt) {
      const [prefix, level] = grantedAt;
      return (prefix === "A" ? Calculation_.getAscension(char.level) : char.cons) >= +level;
    }
    return true;
  }

  static isAvailable = (
    condition: CharacterEffectAvailableCondition,
    char: Character,
    inputs: number[],
    fromSelf: boolean
  ): boolean => {
    if (fromSelf) {
      if (!this.isGranted(condition, char)) return false;
    } else if (condition.alterIndex !== undefined && !inputs[condition.alterIndex]) {
      return false;
    }
    return true;
  };

  static isUsable = (
    condition: CharacterEffectUsableCondition,
    info: CalcUltilInfo,
    inputs: number[],
    fromSelf: boolean
  ): boolean => {
    if (!this.isAvailable(condition, info.char, inputs, fromSelf)) {
      return false;
    }
    const { checkInput } = condition;

    if (checkInput !== undefined) {
      const { value, index = 0, type = "equal" } = typeof checkInput === "number" ? { value: checkInput } : checkInput;
      const input = inputs[index] ?? 0;
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
        case "included":
          if (!inputs.includes(value)) return false;
          else break;
      }
    }
    return true;
  };

  static isExtensivelyUsable = (
    condition: CharacterEffectExtendedUsableCondition,
    info: CalcUltilInfo,
    inputs: number[],
    fromSelf: boolean
  ): boolean => {
    if (!this.isUsable(condition, info, inputs, fromSelf)) {
      return false;
    }
    const { partyElmtCount, partyOnlyElmts } = condition;

    if (condition.forWeapons && !condition.forWeapons.includes(info.appChar.weaponType)) {
      return false;
    }
    if (condition.forElmts && !condition.forElmts.includes(info.appChar.vision)) {
      return false;
    }
    const elementCount = Calculation_.countElements(info.partyData, info.appChar);

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
  };

  static getLevelScale = (
    scale: CharacterEffectLevelScale | undefined,
    info: CalcUltilInfo,
    inputs: number[],
    fromSelf: boolean
  ): number => {
    if (scale) {
      const { talent, value, alterIndex = 0, max } = scale;
      const level = fromSelf
        ? Character_.getFinalTalentLv({
            talentType: talent,
            char: info.char,
            appChar: info.appChar,
            partyData: info.partyData,
          })
        : inputs[alterIndex] ?? 0;

      const result = value ? Character_.getTalentMult(value, level) : level;
      return max && result > max ? max : result;
    }
    return 1;
  };
}
