import { ELEMENT_TYPES } from "@Src/constants";
import {
  Bonus_Character,
  BonusStack_Character,
  InnateBuff_Character,
  AttackPatternInfoKey,
  BuffInfoWrap,
  CalcItemBuff,
  DynamicMax_Character,
  ExtraMax_Character,
  BonusConfig_Character,
} from "@Src/types";
import { toArray, CalculationUtils, CharacterUtils } from "@Src/utils";
import { CalcUltilInfo } from "../calculation.types";
import { CharacterCal, applyModifier } from "../utils";
import { isFinalBonus } from "./getCalculationStats.utils";

const genExclusiveBuff = (
  desc: string,
  ids: string | string[],
  key: AttackPatternInfoKey,
  buffValue: number
): CalcItemBuff => {
  return {
    ids,
    bonus: {
      [key]: { desc, value: buffValue },
    },
  };
};

const getTotalExtraMax = (
  extras: ExtraMax_Character | ExtraMax_Character[],
  info: CalcUltilInfo,
  inputs: number[],
  fromSelf: boolean
) => {
  let result = 0;

  for (const extra of toArray(extras)) {
    if (CharacterCal.isUsable(extra, info, inputs, fromSelf)) {
      result += extra.value;
    }
  }
  return result;
};

const getMax = (max: number | DynamicMax_Character, info: CalcUltilInfo, inputs: number[], fromSelf: boolean) => {
  return typeof max === "number" ? max : max.value + getTotalExtraMax(max.extras, info, inputs, fromSelf);
};

const getStackValue = (
  stack: BonusStack_Character,
  info: BuffInfoWrap,
  inputs: number[],
  fromSelf: boolean
): number => {
  let result = 1;

  switch (stack.type) {
    case "input": {
      const { index = 0, alterIndex } = stack;
      const finalIndex = alterIndex !== undefined && !fromSelf ? alterIndex : index;
      let input = inputs[finalIndex] ?? 0;

      if (stack.capacity) {
        const { value, extra } = stack.capacity;
        input = value - input;
        if (CharacterCal.isUsable(extra, info, inputs, fromSelf)) input += extra.value;
        input = Math.max(input, 0);
      }
      result = input;
      break;
    }
    case "attribute": {
      const { field, alterIndex = 0 } = stack;
      result = fromSelf ? info.totalAttr[field] : inputs[alterIndex] ?? 1;
      break;
    }
    case "nation": {
      let count = info.partyData.reduce((total, teammate) => {
        return total + (teammate?.nation === info.appChar.nation ? 1 : 0);
      }, 0);
      if (stack.nation === "different") {
        count = info.partyData.filter(Boolean).length - count;
      }
      result = count;
      break;
    }
    case "energy": {
      result = info.appChar.EBcost;
      break;
    }
    case "resolve": {
      let [totalEnergy = 0, electroEnergy = 0] = inputs;
      if (info.char.cons >= 1 && electroEnergy <= totalEnergy) {
        totalEnergy += electroEnergy * 0.8 + (totalEnergy - electroEnergy) * 0.2;
      }
      const level = CharacterUtils.getFinalTalentLv({
        talentType: "EB",
        char: info.char,
        appChar: info.appChar,
        partyData: info.partyData,
      });
      const stackPerEnergy = Math.min(Math.ceil(14.5 + level * 0.5), 20);
      const stacks = Math.round(totalEnergy * stackPerEnergy) / 100;
      // const countResolve = (energyCost: number) => Math.round(energyCost * stackPerEnergy) / 100;

      result = Math.min(stacks, 60);
      break;
    }
  }

  if (stack.baseline) {
    if (result <= stack.baseline) return 0;
    result -= stack.baseline;
  }
  if (stack.extra && CharacterCal.isAvailable(stack.extra, info.char, inputs, fromSelf)) {
    result += stack.extra.value;
  }
  if (stack.max) {
    const max = getMax(stack.max, info, inputs, fromSelf);
    if (result > max) result = max;
  }

  return Math.max(result, 0);
};

export const getIntialBonusValue = (
  value: BonusConfig_Character["value"],
  info: CalcUltilInfo,
  inputs: number[],
  fromSelf: boolean
) => {
  if (typeof value === "number") return value;
  const { preOptions, options, indexSrc } = value;
  let index = -1;

  /** Navia */
  if (preOptions && !inputs[1]) {
    const preIndex = preOptions[inputs[0]];
    index += preIndex ?? preOptions[preOptions.length - 1];
  }

  switch (indexSrc.type) {
    case "vision":
      const { visionType: elementType } = indexSrc;
      const elementCount = info.partyData.length ? CalculationUtils.countElements(info.partyData, info.appChar) : {};
      const input =
        elementType === "various"
          ? Object.keys(elementCount).length
          : typeof elementType === "string"
          ? elementCount[elementType] ?? 0
          : elementType.reduce((total, type) => total + (elementCount[type] ?? 0), 0);

      index += input;
      break;
    case "input":
      index += inputs[indexSrc.index ?? 0];
      break;
    case "level":
      index += CharacterUtils.getFinalTalentLv({
        talentType: indexSrc.talent,
        char: info.char,
        appChar: info.appChar,
        partyData: info.partyData,
      });
      break;
  }

  if (value.extra && CharacterCal.isAvailable(value.extra, info.char, inputs, fromSelf)) {
    index += value.extra.value;
  }
  if (value.max) {
    const max = getMax(value.max, info, inputs, fromSelf);
    if (index > max) index = max;
  }

  return options[index] ?? (index > 0 ? options[options.length - 1] : 0);
};

function getBonusValue(
  bonus: BonusConfig_Character,
  info: BuffInfoWrap,
  inputs: number[],
  fromSelf: boolean,
  preCalcStacks: number[]
) {
  const { preExtra } = bonus;
  let bonusValue = getIntialBonusValue(bonus.value, info, inputs, fromSelf);

  // ========== APPLY LEVEL SCALE ==========
  bonusValue *= CharacterCal.getLevelScale(bonus.lvScale, info, inputs, fromSelf);

  // ========== ADD PRE-EXTRA ==========
  if (typeof preExtra === "number") {
    bonusValue += preExtra;
  } else if (preExtra && CharacterCal.isUsable(preExtra, info, inputs, fromSelf)) {
    bonusValue += getBonusValue(preExtra, info, inputs, fromSelf, preCalcStacks);
  }

  // ========== APPLY STACKS ==========
  if (bonus.stackIndex !== undefined) {
    bonusValue *= preCalcStacks[bonus.stackIndex] ?? 1;
  }
  if (bonus.stacks) {
    for (const stack of toArray(bonus.stacks)) {
      if (["nation", "resolve"].includes(stack.type) && !info.partyData.length) {
        return 0;
      }
      bonusValue *= getStackValue(stack, info, inputs, fromSelf);
    }
  }

  // ========== APPLY MAX ==========
  if (typeof bonus.max === "number") {
    bonusValue = Math.min(bonusValue, bonus.max);
  } else if (bonus.max) {
    let finalMax = bonus.max.value;

    if (bonus.max.stacks) {
      finalMax *= getStackValue(bonus.max.stacks, info, inputs, fromSelf);
    }
    if (bonus.max.extras) {
      finalMax += getTotalExtraMax(bonus.max.extras, info, inputs, fromSelf);
    }

    bonusValue = Math.min(bonusValue, finalMax);
  }

  return bonusValue;
}

const isTrulyFinalBonus = (bonus: Bonus_Character, cmnStacks: BonusStack_Character[]) => {
  return (
    isFinalBonus(bonus.stacks) ||
    (typeof bonus.preExtra === "object" && isFinalBonus(bonus.preExtra.stacks)) ||
    (bonus.stackIndex !== undefined && isFinalBonus(cmnStacks[bonus.stackIndex]))
  );
};

interface ApplyAbilityBuffArgs {
  description: string;
  buff: InnateBuff_Character;
  infoWrap: BuffInfoWrap;
  inputs: number[];
  fromSelf: boolean;
  isFinal?: boolean;
}
const applyAbilityBuff = ({ description, buff, infoWrap: info, inputs, fromSelf, isFinal }: ApplyAbilityBuffArgs) => {
  if (!buff.effects) return;
  const cmnStacks = buff.cmnStacks ? toArray(buff.cmnStacks) : [];
  const commonStacks = cmnStacks.map((cmnStack) => getStackValue(cmnStack, info, inputs, fromSelf));
  const noIsFinal = isFinal === undefined;

  for (const bonus of toArray(buff.effects)) {
    if (
      (noIsFinal || isFinal === isTrulyFinalBonus(bonus, cmnStacks)) &&
      CharacterCal.isExtensivelyUsable(bonus, info, inputs, fromSelf)
    ) {
      const bonusValue = getBonusValue(bonus, info, inputs, fromSelf, commonStacks);
      if (!bonusValue) continue;

      for (const [key, value] of Object.entries(bonus.targets)) {
        const mixed = value as any;

        switch (key) {
          case "ATTR":
            applyModifier(description, info.totalAttr, mixed, bonusValue, info.tracker);
            break;
          case "PATT":
            applyModifier(description, info.attPattBonus, mixed, bonusValue, info.tracker);
            break;
          case "ELMT":
            applyModifier(description, info.attElmtBonus, mixed, bonusValue, info.tracker);
            break;
          case "RXN":
            applyModifier(description, info.rxnBonus, mixed, bonusValue, info.tracker);
            break;
          case "ITEM":
            info.calcItemBuffs.push(genExclusiveBuff(description, mixed.id, mixed.path, bonusValue));
            break;
          case "INP_ELMT":
            const elmtIndex = inputs[mixed ?? 0];
            applyModifier(description, info.totalAttr, ELEMENT_TYPES[elmtIndex], bonusValue, info.tracker);
            break;
          case "ELM_NA":
            if (info.appChar.weaponType === "catalyst" || info.infusedElement !== "phys") {
              applyModifier(description, info.attPattBonus, "NA.pct_", bonusValue, info.tracker);
            }
            break;
        }
      }
    }
  }
};

export default applyAbilityBuff;
