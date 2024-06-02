import type { WeaponBonusCore, WeaponBuff } from "@Src/backend/types";
import type { BuffInfoWrap, StackableCheckCondition } from "./getCalculationStats.types";
import type { GetTotalAttributeType } from "../../controls";

import { toArray } from "@Src/utils";
import { EntityCalc } from "../../utils";
import { applyBonuses, type AppliedBonus } from "./getCalculationStats.utils";

class ApplierWeaponBuff {
  info: BuffInfoWrap;

  constructor(info: BuffInfoWrap) {
    this.info = info;
  }

  private getBonus(
    bonus: WeaponBonusCore,
    totalAttrType: GetTotalAttributeType,
    inputs: number[],
    refi: number,
    fromSelf: boolean
  ): AppliedBonus {
    let bonusValue = 0;
    let isStable = true;
    const scaleRefi = (base: number, increment = base / 3) => base + increment * refi;

    if (typeof bonus.value === "number") {
      bonusValue = scaleRefi(bonus.value, bonus.incre);
    } else {
      const { options } = bonus.value;
      const index = EntityCalc.getBonusValueOptionIndex(bonus.value, this.info, inputs);

      bonusValue = options[index] ?? (index > 0 ? options[options.length - 1] : 0);
      bonusValue = scaleRefi(bonusValue, bonus.incre);
    }

    // ========== APPLY STACKS ==========
    if (bonus.stacks) {
      for (const stack of toArray(bonus.stacks)) {
        if (!this.info.partyData.length && ["VISION", "ENERGY", "NATION"].includes(stack.type)) {
          return {
            value: 0,
            isStable,
          };
        }
        bonusValue *= EntityCalc.getStackValue(stack, totalAttrType, this.info, inputs, fromSelf);
        if (stack.type === "ATTRIBUTE") isStable = false;
      }
    }

    // ========== ADD SUF-EXTRA ==========
    if (typeof bonus.sufExtra === "number") {
      bonusValue += scaleRefi(bonus.sufExtra);
    } else if (bonus.sufExtra && EntityCalc.isApplicableEffect(bonus.sufExtra, this.info, inputs)) {
      bonusValue += this.getBonus(bonus.sufExtra, totalAttrType, inputs, refi, fromSelf).value;
    }

    // ========== APPLY MAX ==========
    let max = 0;
    if (typeof bonus.max === "number") {
      max = scaleRefi(bonus.max);
    } else if (bonus.max) {
      max = scaleRefi(bonus.max.value, bonus.max.incre);
    }
    if (max) bonusValue = Math.min(bonusValue, max);

    return {
      value: Math.max(bonusValue, 0),
      isStable,
    };
  }

  apply(args: {
    description: string;
    buff: Pick<WeaponBuff, "trackId" | "effects">;
    inputs: number[];
    refi: number;
    fromSelf: boolean;
    isFinal?: boolean;
    isStackable?: (effect: StackableCheckCondition) => boolean;
  }) {
    const isStackable = args.isStackable || (() => true);

    applyBonuses({
      ...args,
      info: this.info,
      isStackable: (paths: string | string[]) => isStackable({ trackId: args.buff.trackId, paths }),
      getBonus: (config, totalAttrType) => this.getBonus(config, totalAttrType, args.inputs, args.refi, args.fromSelf),
    });
  }
}

export default ApplierWeaponBuff;
