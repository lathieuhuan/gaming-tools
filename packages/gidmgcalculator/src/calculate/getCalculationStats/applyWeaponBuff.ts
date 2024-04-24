import type { WeaponBonusCore, WeaponBonusStack, WeaponBuff } from "@Src/types/app-weapon.types";
import type { StackableCheckCondition, BuffInfoWrap } from "../types";
import { toArray, Calculation_ } from "@Src/utils";
import { CommonCalc } from "../utils";
import { AppliedBonus, applyBonuses, isFinalBonus } from "./getCalculationStats.utils";

function isUsableBonus(bonus: Pick<WeaponBonusCore, "checkInput">, info: BuffInfoWrap, inputs: number[]) {
  return CommonCalc.isValidInput(info, inputs, bonus.checkInput);
}

function getStackValue(stack: WeaponBonusStack, { appChar, partyData, totalAttr }: BuffInfoWrap, inputs: number[]) {
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
      const stackValue = totalAttr.getTotalStable(stack.field);

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
}

function getBonus(
  bonus: WeaponBonusCore,
  info: BuffInfoWrap,
  inputs: number[],
  refi: number,
  preCalcStacks: number[]
): AppliedBonus {
  let bonusValue = 0;
  let isStable = true;
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
          return {
            value: 0,
            isStable,
          };
        }
        bonusValue *= getStackValue(stack, info, inputs);
        if (stack.type === "ATTRIBUTE") isStable = false;
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
    bonusValue += getBonus(bonus.sufExtra, info, inputs, refi, preCalcStacks).value;
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

function isTrulyFinalBonus(bonus: WeaponBonusCore, cmnStacks: WeaponBonusStack[]) {
  return (
    isFinalBonus(bonus.stacks) ||
    isFinalBonus(cmnStacks) ||
    (typeof bonus.checkInput === "object" && bonus.checkInput.source === "BOL")
  );
}

interface ApplyWeaponBuffArgs {
  description: string;
  buff: Pick<WeaponBuff, "trackId" | "cmnStacks" | "effects">;
  infoWrap: BuffInfoWrap;
  inputs: number[];
  refi: number;
  isFinal?: boolean;
  isStackable?: (effect: StackableCheckCondition) => boolean;
}
function applyWeaponBuff({
  description,
  buff,
  infoWrap: info,
  inputs,
  refi,
  isFinal,
  isStackable = () => true,
}: ApplyWeaponBuffArgs) {
  if (!buff.effects) return;
  const cmnStacks = buff.cmnStacks ? toArray(buff.cmnStacks) : [];
  const commonStacks = cmnStacks.map((cmnStack) => getStackValue(cmnStack, info, inputs));
  const noIsFinal = isFinal === undefined;

  applyBonuses({
    buff,
    info,
    inputs,
    description,
    isApplicable: (config) => {
      return (noIsFinal || isFinal === isTrulyFinalBonus(config, cmnStacks)) && isUsableBonus(config, info, inputs);
    },
    isStackable: (paths: string | string[]) => isStackable({ trackId: buff.trackId, paths }),
    getBonus: (config) => getBonus(config, info, inputs, refi, commonStacks),
  });
}

export default applyWeaponBuff;
