import type { ArtifactBonus } from "@Src/types";
import type { BuffInfoWrap, StackableCheckCondition } from "../types";
import { ELEMENT_TYPES } from "@Src/constants";
import { toArray, Calculation_ } from "@Src/utils";
import { isFinalBonus } from "./getCalculationStats.utils";

type CountResult = ReturnType<typeof Calculation_.countElements>;

function isUsableBonus(
  condition: Pick<ArtifactBonus, "checkInput" | "forWeapons">,
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

function getStackValue(stack: NonNullable<ArtifactBonus["stacks"]>, info: BuffInfoWrap, inputs: number[]) {
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

type Bonus = {
  value: number;
  isStable: boolean;
};
function getBonus(bonus: Omit<ArtifactBonus, "targets">, info: BuffInfoWrap, inputs: number[]): Bonus {
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
  buff: {
    trackId?: string;
    effects: ArtifactBonus | ArtifactBonus[];
  };
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
  const noIsFinal = isFinal === undefined;

  const isLocalStackable = (targets: string | string[]) => isStackable({ trackId: buff.trackId, targets });

  for (const bonusConfig of toArray(buff.effects)) {
    if ((noIsFinal || isFinal === isFinalBonus(bonusConfig.stacks)) && isUsableBonus(bonusConfig, info, inputs)) {
      const bonus = getBonus(bonusConfig, info, inputs);

      if (bonus.value) {
        for (const [key, value] of Object.entries(bonusConfig.targets)) {
          const mixed = value as any;

          switch (key) {
            case "ATTR":
              if (isLocalStackable(mixed)) {
                if (bonus.isStable) {
                  info.totalAttr.addStable(mixed, bonus.value, description);
                } else {
                  info.totalAttr.addUnstable(mixed, bonus.value, description);
                }
              }
              break;
            case "PATT":
            case "RXN":
              if (isLocalStackable(mixed)) {
                info.bonusCalc.add(key, mixed, bonus.value, description);
              }
              break;
            case "INP_ELMT": {
              const elmtIndex = inputs[mixed ?? 0];

              if (isLocalStackable(ELEMENT_TYPES[elmtIndex])) {
                info.totalAttr.addStable(ELEMENT_TYPES[elmtIndex], bonus.value, description);
              }
              break;
            }
          }
        }
      }
    }
  }
}

export default applyArtifactBuff;
