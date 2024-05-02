import type { WeaponBonusCore, WeaponBuff } from "@Src/backend/types";
import type { BuffInfoWrap, StackableCheckCondition } from "./getCalculationStats.types";

import { toArray } from "@Src/utils";
import { EntityCalc } from "../utils";
import { applyBonuses, type AppliedBonus } from "./getCalculationStats.utils";

class ApplierWeaponBonus {
  info: BuffInfoWrap;

  constructor(info: BuffInfoWrap) {
    this.info = info;
  }

  private getBonus(
    bonus: WeaponBonusCore,
    inputs: number[],
    refi: number,
    fromSelf: boolean,
    preCalcStacks: number[]
  ): AppliedBonus {
    let bonusValue = 0;
    let isStable = true;
    const scaleRefi = (base: number, increment = base / 3) => base + increment * refi;

    if (typeof bonus.value === "number") {
      bonusValue = scaleRefi(bonus.value, bonus.incre);
    } else {
      // not used yet
    }

    // ========== APPLY STACKS ==========
    if (bonus.stackIndex !== undefined) {
      bonusValue *= preCalcStacks[bonus.stackIndex] ?? 1;
    }
    if (bonus.stacks) {
      for (const stack of toArray(bonus.stacks)) {
        if (!this.info.partyData.length && ["VISION", "ENERGY", "NATION"].includes(stack.type)) {
          return {
            value: 0,
            isStable,
          };
        }
        bonusValue *= EntityCalc.getStackValue(stack, this.info, inputs, fromSelf);
        if (stack.type === "ATTRIBUTE") isStable = false;
      }
    }

    // ========== ADD SUF-EXTRA ==========
    if (typeof bonus.sufExtra === "number") {
      bonusValue += scaleRefi(bonus.sufExtra);
    } else if (bonus.sufExtra && EntityCalc.isApplicableEffect(bonus.sufExtra, this.info, inputs)) {
      bonusValue += this.getBonus(bonus.sufExtra, inputs, refi, fromSelf, preCalcStacks).value;
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
    buff: Pick<WeaponBuff, "trackId" | "cmnStacks" | "effects">;
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
      getBonus: (config, commonStacks) => this.getBonus(config, args.inputs, args.refi, args.fromSelf, commonStacks),
    });
  }
}

export default ApplierWeaponBonus;
