import type { ArtifactBonusCore, ArtifactBonusStack, ArtifactBuff } from "@Src/types";
import type { BuffInfoWrap, StackableCheckCondition } from "../types";
import { Calculation_ } from "@Src/utils";
import { AppliedBonus, applyBonuses, isFinalBonus } from "./getCalculationStats.utils";

type CountResult = ReturnType<typeof Calculation_.countElements>;

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
      const { [info.appChar.vision]: sameCount = 0, ...others } = Calculation_.countElements(info.partyData);

      switch (stack.element) {
        case "same_excluded":
          return sameCount;
        case "different":
          return Object.values(others as CountResult).reduce((total, item) => total + item, 0);
      }
    }
  }
}

function getBonus(bonus: ArtifactBonusCore, info: BuffInfoWrap, inputs: number[]): AppliedBonus {
  let bonusValue = 0;
  let isStable = true;

  if (typeof bonus.value === "number") {
    bonusValue += bonus.value;

    if (bonus.stacks) {
      if (bonus.stacks.type === "ELEMENT" && !info.partyData.length) {
        return {
          value: 0,
          isStable,
        };
      }
      bonusValue *= getStackValue(bonus.stacks, info, inputs);
    }
  } else {
    const { options, inpIndex = 0 } = bonus.value;
    const input = inputs[inpIndex] ?? 1;
    bonusValue = options[input - 1] || options[options.length - 1];
  }
  if (typeof bonus.sufExtra === "number") {
    bonusValue += bonus.sufExtra;
  } else if (bonus.sufExtra && isUsableBonus(bonus.sufExtra, info, inputs)) {
    bonusValue += getBonus(bonus.sufExtra, info, inputs).value;
  }

  if (bonus.max && bonusValue > bonus.max) bonusValue = bonus.max;

  return {
    value: Math.max(bonusValue, 0),
    isStable,
  };
}

interface ApplyArtifactBuffArgs {
  description: string;
  buff: Pick<ArtifactBuff, "trackId" | "effects">;
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
  const noIsFinal = isFinal === undefined;

  applyBonuses({
    buff,
    info,
    inputs,
    description,
    isApplicable: (config) => {
      return (noIsFinal || isFinal === isFinalBonus(config.stacks)) && isUsableBonus(config, info, inputs);
    },
    isStackable: (paths: string | string[]) => isStackable({ trackId: buff.trackId, paths }),
    getBonus: (config) => getBonus(config, info, inputs),
  });
}

export default applyArtifactBuff;
