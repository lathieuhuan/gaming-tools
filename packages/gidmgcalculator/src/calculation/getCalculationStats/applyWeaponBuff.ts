import type { WeaponBonus, BuffInfoWrap, WeaponBonusStack, WeaponBuff } from "@Src/types";
import type { StackableCheckCondition } from "../calculation.types";
import { toArray, Calculation_ } from "@Src/utils";
import { CommonCalc, applyModifier } from "../utils";
import { isFinalBonus } from "./getCalculationStats.utils";

const isUsableBonus = (bonus: Pick<WeaponBonus, "checkInput">, info: BuffInfoWrap, inputs: number[]) => {
  return CommonCalc.isValidInput(info, inputs, bonus.checkInput);
};

const getStackValue = (stack: WeaponBonusStack, { appChar, partyData, totalAttr }: BuffInfoWrap, inputs: number[]) => {
  switch (stack.type) {
    case "INPUT": {
      const { index = 0, doubledAt } = stack;

      if (typeof index === "number") {
        let stackValue = inputs[index] ?? 0;

        if (doubledAt !== undefined && inputs[doubledAt]) {
          stackValue *= 2;
        }
        return stackValue;
      }
      return index.reduce((total, { value, ratio = 1 }) => total + (inputs[value] ?? 0) * ratio, 0);
    }
    case "ATTRIBUTE": {
      const stackValue = totalAttr[stack.field];

      if (stack.baseline) {
        if (stackValue <= stack.baseline) return 0;
        return stackValue - stack.baseline;
      }
      return stackValue;
    }
    case "ELEMENT": {
      const { element, max } = stack;
      const { [appChar.vision]: sameCount = 0, ...others } = Calculation_.countElements(partyData);
      let stackValue = 0;

      if (element === "different") {
        stackValue = Object.values(others as Record<string, number>).reduce((total, count) => total + count, 0);
      } else {
        stackValue = sameCount + (element === "same_included" ? 1 : 0);
      }

      return max ? Math.min(stackValue, max) : stackValue;
    }
    case "ENERGY": {
      return partyData.reduce((result, data) => result + (data?.EBcost ?? 0), appChar.EBcost);
    }
    case "NATION": {
      return partyData.reduce(
        (result, data) => result + (data?.nation === "liyue" ? 1 : 0),
        appChar.nation === "liyue" ? 1 : 0
      );
    }
  }
};

const getBonusValue = (
  bonus: Omit<WeaponBonus, "targets">,
  info: BuffInfoWrap,
  inputs: number[],
  refi: number,
  preCalcStacks: number[]
) => {
  let bonusValue = 0;
  const scaleRefi = (base: number, increment = base / 3) => base + increment * refi;

  if (typeof bonus.value === "number") {
    bonusValue = scaleRefi(bonus.value, bonus.incre);

    // ========== APPLY STACKS ==========
    for (const stackValue of preCalcStacks) {
      bonusValue *= stackValue;
    }
    if (bonus.stacks) {
      for (const stack of toArray(bonus.stacks)) {
        if (!info.partyData.length && ["VISION", "ENERGY", "NATION"].includes(stack.type)) {
          return 0;
        }
        bonusValue *= getStackValue(stack, info, inputs);
      }
    }
  } else {
    const { options, inpIndex = 0 } = bonus.value;
    const index = (inputs[inpIndex] ?? 0) - 1;

    if (options[index]) {
      bonusValue = scaleRefi(options[index]);
    }
  }

  // ========== ADD SUF-EXTRA ==========
  if (typeof bonus.sufExtra === "number") {
    bonusValue += scaleRefi(bonus.sufExtra);
  } else if (bonus.sufExtra && isUsableBonus(bonus.sufExtra, info, inputs)) {
    bonusValue += getBonusValue(bonus.sufExtra, info, inputs, refi, preCalcStacks);
  }

  // ========== APPLY MAX ==========
  let max = 0;
  if (typeof bonus.max === "number") {
    max = scaleRefi(bonus.max);
  } else if (bonus.max) {
    max = scaleRefi(bonus.max.value, bonus.max.incre);
  }
  if (max) bonusValue = Math.min(bonusValue, max);

  return Math.max(bonusValue, 0);
};

const isTrulyFinalBonus = (bonus: WeaponBonus, cmnStacks: WeaponBonus["stacks"]) => {
  return (
    isFinalBonus(bonus.stacks) ||
    isFinalBonus(cmnStacks) ||
    (typeof bonus.checkInput === "object" && bonus.checkInput.source === "BOL")
  );
};

interface ApplyWeaponBuffArgs {
  description: string;
  buff: Pick<WeaponBuff, "trackId" | "cmnStacks" | "effects">;
  infoWrap: BuffInfoWrap;
  inputs: number[];
  refi: number;
  isFinal?: boolean;
  isStackable?: (effect: StackableCheckCondition) => boolean;
}
const applyWeaponBuff = ({
  description,
  buff,
  infoWrap: info,
  inputs,
  refi,
  isFinal,
  isStackable = () => true,
}: ApplyWeaponBuffArgs) => {
  const cmnStacks = buff.cmnStacks ? toArray(buff.cmnStacks) : [];
  const commonStacks = cmnStacks.map((cmnStack) => getStackValue(cmnStack, info, inputs));
  const noIsFinal = isFinal === undefined;

  for (const bonus of toArray(buff.effects)) {
    if ((noIsFinal || isFinal === isTrulyFinalBonus(bonus, cmnStacks)) && isUsableBonus(bonus, info, inputs)) {
      const bonusValue = getBonusValue(bonus, info, inputs, refi, commonStacks);

      if (bonusValue) {
        const { ATTR, PATT, C_STATUS } = bonus.targets;
        if (ATTR) {
          const attributeKey = ATTR === "own_elmt" ? info.appChar.vision : ATTR;

          if (isStackable({ trackId: buff.trackId, targets: attributeKey })) {
            applyModifier(description, info.totalAttr, attributeKey, bonusValue, info.tracker);
          }
        }
        if (PATT && isStackable({ trackId: buff.trackId, targets: PATT })) {
          applyModifier(description, info.attPattBonus, PATT, bonusValue, info.tracker);
        }
        if (C_STATUS) {
          // #to-do use applyModifier
          info.charStatus.BOL += bonusValue;
        }
      }
    }
  }
};

export default applyWeaponBuff;
