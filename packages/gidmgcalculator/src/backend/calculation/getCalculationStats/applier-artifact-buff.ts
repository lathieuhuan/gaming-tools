import type { ArtifactBonusCore, ArtifactBuff } from "@Src/backend/types";
import type { GetTotalAttributeType } from "../../controls";
import type { BuffInfoWrap, StackableCheckCondition } from "./getCalculationStats.types";

import { toArray } from "@Src/utils";
import { EntityCalc } from "../../utils";
import { AppliedBonus, applyBonuses } from "./getCalculationStats.utils";

class ApplierArtifactBuff {
  info: BuffInfoWrap;

  constructor(info: BuffInfoWrap) {
    this.info = info;
  }

  private getBonus(
    bonus: ArtifactBonusCore,
    totalAttrType: GetTotalAttributeType,
    inputs: number[],
    fromSelf: boolean
  ): AppliedBonus {
    let bonusValue = 0;
    let isStable = true;

    if (typeof bonus.value === "number") {
      bonusValue = bonus.value;
    } else {
      const { options } = bonus.value;
      const index = EntityCalc.getBonusValueOptionIndex(bonus.value, this.info, inputs);

      bonusValue = options[index] ?? (index > 0 ? options[options.length - 1] : 0);
    }

    // ========== APPLY STACKS ==========
    if (bonus.stacks) {
      for (const stack of toArray(bonus.stacks)) {
        if (stack.type === "ELEMENT" && !this.info.partyData.length) {
          return {
            value: 0,
            isStable,
          };
        }
        bonusValue *= EntityCalc.getStackValue(stack, totalAttrType, this.info, inputs, fromSelf);
      }
    }

    if (typeof bonus.sufExtra === "number") {
      bonusValue += bonus.sufExtra;
    } else if (bonus.sufExtra && EntityCalc.isApplicableEffect(bonus.sufExtra, this.info, inputs)) {
      bonusValue += this.getBonus(bonus.sufExtra, totalAttrType, inputs, fromSelf).value;
    }

    if (bonus.max && bonusValue > bonus.max) bonusValue = bonus.max;

    return {
      value: Math.max(bonusValue, 0),
      isStable,
    };
  }

  apply(args: {
    description: string;
    buff: Pick<ArtifactBuff, "trackId" | "effects">;
    inputs: number[];
    fromSelf: boolean;
    isFinal?: boolean;
    isStackable?: (effect: StackableCheckCondition) => boolean;
  }) {
    const isStackable = args.isStackable || (() => true);

    applyBonuses({
      ...args,
      info: this.info,
      isStackable: (paths: string | string[]) => isStackable({ trackId: args.buff.trackId, paths }),
      getBonus: (config, totalAttrType) => this.getBonus(config, totalAttrType, args.inputs, args.fromSelf),
    });
  }
}

export default ApplierArtifactBuff;
