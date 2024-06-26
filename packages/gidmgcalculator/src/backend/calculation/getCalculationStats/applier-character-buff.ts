import type { CharacterBonusCore, CharacterBuff } from "@Src/backend/types";
import type { CalcUltilInfo } from "../calculation.types";
import type { GetTotalAttributeType } from "../controls";
import type { BuffInfoWrap } from "./getCalculationStats.types";

import { toArray } from "@Src/utils";
import { CharacterCalc, EntityCalc } from "../utils";
import { applyBonuses, type AppliedBonus } from "./getCalculationStats.utils";

export function getIntialBonusValue(
  value: CharacterBonusCore["value"],
  info: CalcUltilInfo,
  inputs: number[],
  fromSelf: boolean
) {
  if (typeof value === "number") return value;
  const { preOptions, options } = value;
  let index = -1;

  /** Navia */
  if (preOptions && !inputs[1]) {
    const preIndex = preOptions[inputs[0]];
    index += preIndex ?? preOptions[preOptions.length - 1];
  } else {
    index = EntityCalc.getBonusValueOptionIndex(value, info, inputs);
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

class ApplierCharacterBuff {
  info: BuffInfoWrap;

  constructor(info: BuffInfoWrap) {
    this.info = info;
  }

  private getBonus(
    bonus: CharacterBonusCore,
    totalAttrType: GetTotalAttributeType,
    inputs: number[],
    fromSelf: boolean
  ): AppliedBonus {
    const { preExtra } = bonus;
    let bonusValue = getIntialBonusValue(bonus.value, this.info, inputs, fromSelf);
    let isStable = true;

    // ========== APPLY LEVEL SCALE ==========
    bonusValue *= CharacterCalc.getLevelScale(bonus.lvScale, this.info, inputs, fromSelf);

    // ========== ADD PRE-EXTRA ==========
    if (typeof preExtra === "number") {
      bonusValue += preExtra;
    } else if (preExtra && EntityCalc.isApplicableEffect(preExtra, this.info, inputs, fromSelf)) {
      // if preExtra is not stable, this whole bonus is not stable
      const { value, isStable: isStablePreExtra } = this.getBonus(preExtra, totalAttrType, inputs, fromSelf);
      bonusValue += value;
      if (!isStablePreExtra) isStable = false;
    }

    // ========== APPLY STACKS ==========
    if (bonus.stacks) {
      for (const stack of toArray(bonus.stacks)) {
        if (["nation", "resolve"].includes(stack.type) && !this.info.partyData.length) {
          return {
            value: 0,
            isStable: true,
          };
        }
        bonusValue *= EntityCalc.getStackValue(stack, totalAttrType, this.info, inputs, fromSelf);

        if (stack.type === "ATTRIBUTE") isStable = false;
      }
    }

    // ========== APPLY MAX ==========
    if (typeof bonus.max === "number") {
      bonusValue = Math.min(bonusValue, bonus.max);
    } else if (bonus.max) {
      let finalMax = bonus.max.value;

      if (bonus.max.stacks) {
        finalMax *= EntityCalc.getStackValue(bonus.max.stacks, totalAttrType, this.info, inputs, fromSelf);
      }
      if (bonus.max.extras) {
        finalMax += EntityCalc.getTotalExtraMax(bonus.max.extras, this.info, inputs, fromSelf);
      }

      bonusValue = Math.min(bonusValue, finalMax);
    }

    return {
      value: bonusValue,
      isStable,
    };
  }

  apply(args: {
    description: string;
    buff: Pick<CharacterBuff, "trackId" | "effects">;
    inputs: number[];
    fromSelf: boolean;
    isFinal?: boolean;
  }) {
    applyBonuses({
      ...args,
      info: this.info,
      getBonus: (config, totalAttrType) => this.getBonus(config, totalAttrType, args.inputs, args.fromSelf),
    });
  }
}

export default ApplierCharacterBuff;
