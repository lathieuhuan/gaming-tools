import type { WeaponBonusCore } from "../types";
import type { BareBonus, GetBonusArgs } from "./bonus-getters.types";
import { EntityCalc } from "@Src/backend/utils";

const scaleRefi = (base: number, increment = base / 3, refi: number) => base + increment * refi;

export function getWeaponBareBonus(args: GetBonusArgs<WeaponBonusCore> & { refi: number }): BareBonus {
  const { config, info, refi, inputs, fromSelf } = args;
  const { basedOn } = config;
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

  // ========== APPLY BASED ON ==========
  if (basedOn) {
    const { basedOnField, basedOnValue } = EntityCalc.getBasedOn(basedOn, inputs, fromSelf, args.getTotalAttrFromSelf);

    bonusValue *= basedOnValue;
    if (basedOnField !== "base_atk") isStable = false;
  }

  // ========== APPLY STACKS ==========
  const stackValue = EntityCalc.getStackValue(config.stacks, info, inputs, fromSelf);

  if (!stackValue) {
    return {
      id: "",
      value: 0,
      isStable,
    };
  }
  bonusValue *= stackValue;

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
    value: bonusValue, // bonusValue can be negative (Rust)
    isStable,
  };
}
