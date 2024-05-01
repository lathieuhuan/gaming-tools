import type { CharacterBonusCore, CharacterBuff } from "@Src/backend/types";
import type { CalcUltilInfo } from "../calculation.types";
import type { BuffInfoWrap } from "./getCalculationStats.types";

import { toArray } from "@Src/utils";
import { CharacterCalc, GeneralCalc, EntityCalc } from "../utils";
import { meetIsFinal, applyBonuses, type AppliedBonus } from "./getCalculationStats.utils";

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

  if (value.extra && EntityCalc.isApplicableEffect(value.extra, info, inputs, fromSelf)) {
    index += value.extra.value;
  }
  if (value.max) {
    const max = EntityCalc.getMax(value.max, info, inputs, fromSelf);
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
  } else if (preExtra && EntityCalc.isApplicableEffect(preExtra, info, inputs, fromSelf)) {
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
      bonusValue *= EntityCalc.getStackValue(stack, info, inputs, fromSelf);

      if (stack.type === "ATTRIBUTE") isStable = false;
    }
  }

  // ========== APPLY MAX ==========
  if (typeof bonus.max === "number") {
    bonusValue = Math.min(bonusValue, bonus.max);
  } else if (bonus.max) {
    let finalMax = bonus.max.value;

    if (bonus.max.stacks) {
      finalMax *= EntityCalc.getStackValue(bonus.max.stacks, info, inputs, fromSelf);
    }
    if (bonus.max.extras) {
      finalMax += EntityCalc.getTotalExtraMax(bonus.max.extras, info, inputs, fromSelf);
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
  const commonStacks = cmnStacks.map((cmnStack) => EntityCalc.getStackValue(cmnStack, info, inputs, fromSelf));

  applyBonuses({
    buff,
    info,
    inputs,
    description,
    isApplicable: (config) => {
      return meetIsFinal(isFinal, config, cmnStacks) && EntityCalc.isApplicableEffect(config, info, inputs, fromSelf);
    },
    getBonus: (config) => getBonus(config, info, inputs, fromSelf, commonStacks),
  });
}

export default applyCharacterBuff;
