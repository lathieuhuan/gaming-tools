import { ArtifactBonusCore, ArtifactBonusStack, ArtifactBuff } from "@Src/backend/types";
import { GeneralCalc } from "../utils";
import { BuffInfoWrap, StackableCheckCondition } from "./getCalculationStats.types";
import { AppliedBonus, applyBonuses, meetIsFinal } from "./getCalculationStats.utils";
import { toArray } from "@Src/utils";

type CountResult = ReturnType<typeof GeneralCalc.countElements>;

function isUsableBonus(
  condition: Pick<ArtifactBonusCore, "checkInput" | "forWeapons">,
  info: BuffInfoWrap,
  inputs: number[]
) {
  if (condition.checkInput !== undefined && inputs[0] !== condition.checkInput) {
    return false;
  }
  if (condition.forWeapons && !condition.forWeapons.includes(info.appChar.weaponType)) {
    return false;
  }
  return true;
}

function getStackValue(stack: ArtifactBonusStack, info: BuffInfoWrap, inputs: number[]) {
  switch (stack.type) {
    case "INPUT":
      return inputs[stack.index ?? 0];
    case "ATTRIBUTE":
      return info.totalAttr.getTotalStable(stack.field);
    case "ELEMENT": {
      const { [info.appChar.vision]: sameCount = 0, ...others } = GeneralCalc.countElements(info.partyData);

      switch (stack.element) {
        case "same_excluded":
          return sameCount;
        case "different":
          return Object.values(others as CountResult).reduce((total, item) => total + item, 0);
        default:
          return 1;
      }
    }
    default:
      return 1;
  }
}

function getBonus(
  bonus: ArtifactBonusCore,
  info: BuffInfoWrap,
  inputs: number[],
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
      bonusValue *= getStackValue(stack, info, inputs);
    }
  }

  if (typeof bonus.sufExtra === "number") {
    bonusValue += bonus.sufExtra;
  } else if (bonus.sufExtra && isUsableBonus(bonus.sufExtra, info, inputs)) {
    bonusValue += getBonus(bonus.sufExtra, info, inputs, preCalcStacks).value;
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
  isFinal?: boolean;
  isStackable?: (effect: StackableCheckCondition) => boolean;
}
function applyArtifactBuff({
  description,
  buff,
  infoWrap: info,
  inputs,
  isFinal,
  isStackable = () => true,
}: ApplyArtifactBuffArgs) {
  if (!buff.effects) return;
  const cmnStacks = buff.cmnStacks ? toArray(buff.cmnStacks) : [];
  const commonStacks = cmnStacks.map((cmnStack) => getStackValue(cmnStack, info, inputs));

  applyBonuses({
    buff,
    info,
    inputs,
    description,
    isApplicable: (config) => {
      return meetIsFinal(isFinal, config, cmnStacks) && isUsableBonus(config, info, inputs);
    },
    isStackable: (paths: string | string[]) => isStackable({ trackId: buff.trackId, paths }),
    getBonus: (config) => getBonus(config, info, inputs, commonStacks),
  });
}

export default applyArtifactBuff;
