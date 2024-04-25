import type {
  CharacterBonusCore,
  CharacterBonusStack,
  CharacterBuff,
  CharacterEffectExtraMax,
  CharacterEffectMax,
} from "@Src/backend/types";
import type { CalcUltilInfo } from "../calculation.types";
import type { BuffInfoWrap } from "./getCalculationStats.types";

import { toArray } from "@Src/utils";
import { CharacterCalc, GeneralCalc } from "../utils";
import { meetIsFinal, applyBonuses, type AppliedBonus } from "./getCalculationStats.utils";

function getTotalExtraMax(
  extras: CharacterEffectExtraMax | CharacterEffectExtraMax[],
  info: CalcUltilInfo,
  inputs: number[],
  fromSelf: boolean
) {
  let result = 0;

  for (const extra of toArray(extras)) {
    if (CharacterCalc.isUsableEffect(extra, info, inputs, fromSelf)) {
      result += extra.value;
    }
  }
  return result;
}

function getMax(max: CharacterEffectMax, info: CalcUltilInfo, inputs: number[], fromSelf: boolean) {
  return typeof max === "number"
    ? max
    : max.value + (max.extras ? getTotalExtraMax(max.extras, info, inputs, fromSelf) : 0);
}

function getStackValue(stack: CharacterBonusStack, info: BuffInfoWrap, inputs: number[], fromSelf: boolean): number {
  let result = 1;

  switch (stack.type) {
    case "INPUT": {
      const { index = 0, alterIndex } = stack;
      const finalIndex = alterIndex !== undefined && !fromSelf ? alterIndex : index;
      let input = inputs[finalIndex] ?? 0;

      if (stack.capacity) {
        const { value, extra } = stack.capacity;
        input = value - input;
        if (CharacterCalc.isUsableEffect(extra, info, inputs, fromSelf)) input += extra.value;
        input = Math.max(input, 0);
      }
      result = input;
      break;
    }
    case "ATTRIBUTE": {
      const { field, alterIndex = 0 } = stack;
      result = fromSelf ? info.totalAttr.getTotalStable(field) : inputs[alterIndex] ?? 1;
      break;
    }
    case "NATION": {
      let count = info.partyData.reduce((total, teammate) => {
        return total + (teammate?.nation === info.appChar.nation ? 1 : 0);
      }, 0);
      if (stack.nation === "different") {
        count = info.partyData.filter(Boolean).length - count;
      }
      result = count;
      break;
    }
    case "ENERGY": {
      result = info.appChar.EBcost;
      break;
    }
    case "C_STATUS":
      result = info.charStatus[stack.status];
      break;
    case "RESOLVE": {
      let [totalEnergy = 0, electroEnergy = 0] = inputs;
      if (info.char.cons >= 1 && electroEnergy <= totalEnergy) {
        totalEnergy += electroEnergy * 0.8 + (totalEnergy - electroEnergy) * 0.2;
      }
      const level = CharacterCalc.getFinalTalentLv({
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
  if (stack.extra && CharacterCalc.isAvailableEffect(stack.extra, info.char, inputs, fromSelf)) {
    result += stack.extra.value;
  }
  if (stack.max) {
    const max = getMax(stack.max, info, inputs, fromSelf);
    if (result > max) result = max;
  }

  return Math.max(result, 0);
}

export function getIntialBonusValue(
  value: CharacterBonusCore["value"],
  info: CalcUltilInfo,
  inputs: number[],
  fromSelf: boolean
) {
  if (typeof value === "number") return value;
  const { preOptions, options, optIndex = 0 } = value;
  let index = -1;

  /** Navia */
  if (preOptions && !inputs[1]) {
    const preIndex = preOptions[inputs[0]];
    index += preIndex ?? preOptions[preOptions.length - 1];
  } else if (typeof optIndex === "number") {
    index = inputs[optIndex];
  } else {
    switch (optIndex.source) {
      case "ELEMENT": {
        const { element } = optIndex;
        const elementCount = info.partyData.length ? GeneralCalc.countElements(info.partyData, info.appChar) : {};
        const input =
          element === "various"
            ? Object.keys(elementCount).length
            : typeof element === "string"
            ? elementCount[element] ?? 0
            : element.reduce((total, type) => total + (elementCount[type] ?? 0), 0);

        index += input;
        break;
      }
      case "INPUT":
        index += inputs[optIndex.inpIndex ?? 0];
        break;
      case "LEVEL":
        index += CharacterCalc.getFinalTalentLv({
          talentType: optIndex.talent,
          char: info.char,
          appChar: info.appChar,
          partyData: info.partyData,
        });
        break;
    }
  }

  if (value.extra && CharacterCalc.isAvailableEffect(value.extra, info.char, inputs, fromSelf)) {
    index += value.extra.value;
  }
  if (value.max) {
    const max = getMax(value.max, info, inputs, fromSelf);
    if (index > max) index = max;
  }

  return options[index] ?? (index > 0 ? options[options.length - 1] : 0);
}

function getBonus(
  bonus: CharacterBonusCore,
  info: BuffInfoWrap,
  inputs: number[],
  fromSelf: boolean,
  preCalcStacks: number[]
): AppliedBonus {
  const { preExtra } = bonus;
  let bonusValue = getIntialBonusValue(bonus.value, info, inputs, fromSelf);
  let isStable = true;

  // ========== APPLY LEVEL SCALE ==========
  bonusValue *= CharacterCalc.getLevelScale(bonus.lvScale, info, inputs, fromSelf);

  // ========== ADD PRE-EXTRA ==========
  if (typeof preExtra === "number") {
    bonusValue += preExtra;
  } else if (preExtra && CharacterCalc.isUsableEffect(preExtra, info, inputs, fromSelf)) {
    // #to-check: if isStable not change to false below, but this getBonus return isStable false
    // in other world, the original bonus is stable but the preExtra is not
    bonusValue += getBonus(preExtra, info, inputs, fromSelf, preCalcStacks).value;
  }

  // ========== APPLY STACKS ==========
  if (bonus.stackIndex !== undefined) {
    bonusValue *= preCalcStacks[bonus.stackIndex] ?? 1;
  }
  if (bonus.stacks) {
    for (const stack of toArray(bonus.stacks)) {
      if (["nation", "resolve"].includes(stack.type) && !info.partyData.length) {
        return {
          value: 0,
          isStable: true,
        };
      }
      bonusValue *= getStackValue(stack, info, inputs, fromSelf);

      if (stack.type === "ATTRIBUTE") isStable = false;
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

  return {
    value: bonusValue,
    isStable,
  };
}

interface ApplyAbilityBuffArgs {
  description: string;
  buff: Pick<CharacterBuff, "trackId" | "cmnStacks" | "effects">;
  infoWrap: BuffInfoWrap;
  inputs: number[];
  fromSelf: boolean;
  isFinal?: boolean;
}
function applyCharacterBuff({ description, buff, infoWrap: info, inputs, fromSelf, isFinal }: ApplyAbilityBuffArgs) {
  if (!buff.effects) return;
  const cmnStacks = buff.cmnStacks ? toArray(buff.cmnStacks) : [];
  const commonStacks = cmnStacks.map((cmnStack) => getStackValue(cmnStack, info, inputs, fromSelf));

  applyBonuses({
    buff,
    info,
    inputs,
    description,
    isApplicable: (config) => {
      return (
        meetIsFinal(isFinal, config, cmnStacks) &&
        CharacterCalc.isExtensivelyUsableEffect(config, info, inputs, fromSelf)
      );
    },
    getBonus: (config) => getBonus(config, info, inputs, fromSelf, commonStacks),
  });
}

export default applyCharacterBuff;
