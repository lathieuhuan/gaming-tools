import type { WeaponBonusCore } from "@Src/backend/types";
import type { BareBonus, GetBonusArgs } from "./bonus-getters.types";
import { EntityCalc } from "@Src/backend/utils";
import { toArray } from "@Src/utils";

const scaleRefi = (base: number, increment = base / 3, refi: number) => base + increment * refi;

export function getWeaponBareBonus(args: GetBonusArgs<WeaponBonusCore> & { refi: number }): BareBonus {
  const { config, info, refi, inputs, fromSelf } = args;
  let bonusValue = 0;
  let isStable = true;

  if (typeof config.value === "number") {
    bonusValue = scaleRefi(config.value, config.incre, refi);
  } else {
    const { options } = config.value;
    const index = EntityCalc.getBonusValueOptionIndex(config.value, info, inputs);

    bonusValue = options[index] ?? (index > 0 ? options[options.length - 1] : 0);
    bonusValue = scaleRefi(bonusValue, config.incre, refi);
  }

  // ========== APPLY STACKS ==========
  if (config.stacks) {
    for (const stack of toArray(config.stacks)) {
      if (!info.partyData.length && ["VISION", "ENERGY", "NATION"].includes(stack.type)) {
        return {
          id: "",
          value: 0,
          isStable,
        };
      }
      bonusValue *= EntityCalc.getStackValue(stack, info, inputs, fromSelf, args.getTotalAttrFromSelf);
      if (stack.type === "ATTRIBUTE") isStable = false;
    }
  }

  // ========== ADD SUF-EXTRA ==========
  if (typeof config.sufExtra === "number") {
    bonusValue += scaleRefi(config.sufExtra, undefined, refi);
  } else if (config.sufExtra && EntityCalc.isApplicableEffect(config.sufExtra, info, inputs)) {
    bonusValue += getWeaponBareBonus({ ...args, config: config.sufExtra }).value;
  }

  // ========== APPLY MAX ==========
  let max = 0;
  if (typeof config.max === "number") {
    max = scaleRefi(config.max, undefined, refi);
  } else if (config.max) {
    max = scaleRefi(config.max.value, config.max.incre, refi);
  }
  if (max) bonusValue = Math.min(bonusValue, max);

  return {
    id: config.id,
    value: Math.max(bonusValue, 0),
    isStable,
  };
}
