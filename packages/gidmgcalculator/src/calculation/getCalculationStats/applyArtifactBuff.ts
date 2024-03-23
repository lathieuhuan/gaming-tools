import type { ArtifactBonus, BuffInfoWrap } from "@Src/types";
import type { StackableCheckCondition } from "../calculation.types";
import { ELEMENT_TYPES } from "@Src/constants";
import { toArray, Calculation_ } from "@Src/utils";
import { applyModifier } from "../utils";
import { isFinalBonus } from "./getCalculationStats.utils";

type CountResult = ReturnType<typeof Calculation_.countElements>;

const isUsableBonus = (
  condition: Pick<ArtifactBonus, "checkInput" | "forWeapons">,
  info: BuffInfoWrap,
  inputs: number[]
) => {
  if (condition.checkInput !== undefined && inputs[0] !== condition.checkInput) {
    return false;
  }
  if (condition.forWeapons && !condition.forWeapons.includes(info.appChar.weaponType)) {
    return false;
  }
  return true;
};

const getStackValue = (stack: NonNullable<ArtifactBonus["stacks"]>, info: BuffInfoWrap, inputs: number[]) => {
  switch (stack.type) {
    case "INPUT":
      return inputs[stack.index ?? 0];
    case "ATTRIBUTE":
      return info.totalAttr[stack.field];
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
};

const getBonusValue = (bonus: Omit<ArtifactBonus, "targets">, info: BuffInfoWrap, inputs: number[]) => {
  let bonusValue = 0;

  if (typeof bonus.value === "number") {
    bonusValue += bonus.value;

    if (bonus.stacks) {
      if (bonus.stacks.type === "ELEMENT" && !info.partyData.length) {
        return 0;
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
    bonusValue += getBonusValue(bonus.sufExtra, info, inputs);
  }

  if (bonus.max && bonusValue > bonus.max) bonusValue = bonus.max;

  return Math.max(bonusValue, 0);
};

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
const applyArtifactBuff = ({
  description,
  buff,
  infoWrap: info,
  inputs,
  isFinal,
  isStackable = () => true,
}: ApplyArtifactBuffArgs) => {
  const noIsFinal = isFinal === undefined;

  for (const bonus of toArray(buff.effects)) {
    if ((noIsFinal || isFinal === isFinalBonus(bonus.stacks)) && isUsableBonus(bonus, info, inputs)) {
      const bonusValue = getBonusValue(bonus, info, inputs);

      if (bonusValue) {
        for (const [key, value] of Object.entries(bonus.targets)) {
          const mixed = value as any;

          const apply = (recipient: any, targets: any) => {
            if (isStackable({ trackId: buff.trackId, targets })) {
              applyModifier(description, recipient, targets, bonusValue, info.tracker);
            }
          };

          switch (key) {
            case "ATTR":
              apply(info.totalAttr, mixed);
              break;
            case "PATT":
              apply(info.attPattBonus, mixed);
              break;
            case "RXN":
              apply(info.rxnBonus, mixed);
              break;
            case "INP_ELMT": {
              const elmtIndex = inputs[mixed ?? 0];
              apply(info.totalAttr, ELEMENT_TYPES[elmtIndex]);
              break;
            }
          }
        }
      }
    }
  }
};

export default applyArtifactBuff;
