import { ArtifactBonusCore, ArtifactBuff } from "@Src/backend/types";
import { EntityCalc } from "../utils";
import { BuffInfoWrap, StackableCheckCondition } from "./getCalculationStats.types";
import { AppliedBonus, applyBonuses } from "./getCalculationStats.utils";
import { toArray } from "@Src/utils";

class ApplierArtifactBuff {
  info: BuffInfoWrap;

  constructor(info: BuffInfoWrap) {
    this.info = info;
  }

  private getBonus(
    bonus: ArtifactBonusCore,
    inputs: number[],
    fromSelf: boolean,
    preCalcStacks: number[]
  ): AppliedBonus {
    let bonusValue = 0;
    let isStable = true;

    if (typeof bonus.value === "number") {
      bonusValue = bonus.value;
    } else {
      // not used yet
    }

    // ========== APPLY STACKS ==========
    if (bonus.stackIndex !== undefined) {
      bonusValue *= preCalcStacks[bonus.stackIndex] ?? 1;
    }
    if (bonus.stacks) {
      for (const stack of toArray(bonus.stacks)) {
        if (stack.type === "ELEMENT" && !this.info.partyData.length) {
          return {
            value: 0,
            isStable,
          };
        }
        bonusValue *= EntityCalc.getStackValue(stack, this.info, inputs, fromSelf);
      }
    }

    if (typeof bonus.sufExtra === "number") {
      bonusValue += bonus.sufExtra;
    } else if (bonus.sufExtra && EntityCalc.isApplicableEffect(bonus.sufExtra, this.info, inputs)) {
      bonusValue += this.getBonus(bonus.sufExtra, inputs, fromSelf, preCalcStacks).value;
    }

    if (bonus.max && bonusValue > bonus.max) bonusValue = bonus.max;

    return {
      value: Math.max(bonusValue, 0),
      isStable,
    };
  }

  apply(args: {
    description: string;
    buff: Pick<ArtifactBuff, "trackId" | "cmnStacks" | "effects">;
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
      getBonus: (config, commonStacks) => this.getBonus(config, args.inputs, args.fromSelf, commonStacks),
    });
  }
}

export default ApplierArtifactBuff;
