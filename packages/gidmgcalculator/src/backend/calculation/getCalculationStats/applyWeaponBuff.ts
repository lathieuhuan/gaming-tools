import type { WeaponBonusCore, WeaponBuff } from "@Src/backend/types";
import type { BuffInfoWrap, StackableCheckCondition } from "./getCalculationStats.types";

import { toArray } from "@Src/utils";
import { EntityCalc } from "../utils";
import { meetIsFinal, applyBonuses, type AppliedBonus } from "./getCalculationStats.utils";

function getBonus(
  bonus: WeaponBonusCore,
  info: BuffInfoWrap,
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
      if (!info.partyData.length && ["VISION", "ENERGY", "NATION"].includes(stack.type)) {
        return {
          value: 0,
          isStable,
        };
      }
      bonusValue *= EntityCalc.getStackValue(stack, info, inputs, fromSelf);
      if (stack.type === "ATTRIBUTE") isStable = false;
    }
  }

  // ========== ADD SUF-EXTRA ==========
  if (typeof bonus.sufExtra === "number") {
    bonusValue += scaleRefi(bonus.sufExtra);
  } else if (bonus.sufExtra && EntityCalc.isApplicableEffect(bonus.sufExtra, info, inputs)) {
    bonusValue += getBonus(bonus.sufExtra, info, inputs, refi, fromSelf, preCalcStacks).value;
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

interface ApplyWeaponBuffArgs {
  description: string;
  buff: Pick<WeaponBuff, "trackId" | "cmnStacks" | "effects">;
  infoWrap: BuffInfoWrap;
  inputs: number[];
  refi: number;
  fromSelf: boolean;
  isFinal?: boolean;
  isStackable?: (effect: StackableCheckCondition) => boolean;
}
function applyWeaponBuff({
  description,
  buff,
  infoWrap: info,
  inputs,
  refi,
  fromSelf,
  isFinal,
  isStackable = () => true,
}: ApplyWeaponBuffArgs) {
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
    getBonus: (config) => getBonus(config, info, inputs, refi, fromSelf, commonStacks),
  });
}

export default applyWeaponBuff;
