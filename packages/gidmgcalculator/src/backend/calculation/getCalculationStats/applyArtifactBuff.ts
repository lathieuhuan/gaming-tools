import { ArtifactBonusCore, ArtifactBuff } from "@Src/backend/types";
import { EntityCalc } from "../utils";
import { BuffInfoWrap, StackableCheckCondition } from "./getCalculationStats.types";
import { AppliedBonus, applyBonuses, meetIsFinal } from "./getCalculationStats.utils";
import { toArray } from "@Src/utils";

function getBonus(
  bonus: ArtifactBonusCore,
  info: BuffInfoWrap,
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
      if (stack.type === "ELEMENT" && !info.partyData.length) {
        return {
          value: 0,
          isStable,
        };
      }
      bonusValue *= EntityCalc.getStackValue(stack, info, inputs, fromSelf);
    }
  }

  if (typeof bonus.sufExtra === "number") {
    bonusValue += bonus.sufExtra;
  } else if (bonus.sufExtra && EntityCalc.isApplicableEffect(bonus.sufExtra, info, inputs)) {
    bonusValue += getBonus(bonus.sufExtra, info, inputs, fromSelf, preCalcStacks).value;
  }

  if (bonus.max && bonusValue > bonus.max) bonusValue = bonus.max;

  return {
    value: Math.max(bonusValue, 0),
    isStable,
  };
}

interface ApplyArtifactBuffArgs {
  description: string;
  buff: Pick<ArtifactBuff, "trackId" | "cmnStacks" | "effects">;
  infoWrap: BuffInfoWrap;
  inputs: number[];
  fromSelf: boolean;
  isFinal?: boolean;
  isStackable?: (effect: StackableCheckCondition) => boolean;
}
function applyArtifactBuff({
  description,
  buff,
  infoWrap: info,
  inputs,
  fromSelf,
  isFinal,
  isStackable = () => true,
}: ApplyArtifactBuffArgs) {
  if (!buff.effects) return;
  const cmnStacks = buff.cmnStacks ? toArray(buff.cmnStacks) : [];
  const commonStacks = cmnStacks.map((cmnStack) => EntityCalc.getStackValue(cmnStack, info, inputs, fromSelf));

  applyBonuses({
    buff,
    info,
    inputs,
    description,
    isApplicable: (config) => {
      return meetIsFinal(isFinal, config, cmnStacks) && EntityCalc.isApplicableEffect(config, info, inputs);
    },
    isStackable: (paths: string | string[]) => isStackable({ trackId: buff.trackId, paths }),
    getBonus: (config) => getBonus(config, info, inputs, fromSelf, commonStacks),
  });
}

export default applyArtifactBuff;
