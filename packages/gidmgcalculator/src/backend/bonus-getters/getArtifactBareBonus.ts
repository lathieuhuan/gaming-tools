import type { ArtifactBonusCore } from "../types";
import type { BareBonus, GetBonusArgs } from "./bonus-getters.types";
import { EntityCalc } from "@Src/backend/utils";

export function getArtifactBareBonus(args: GetBonusArgs<ArtifactBonusCore>): BareBonus {
  const { config, info, inputs, fromSelf } = args;
  const { basedOn } = config;
  let bonusValue = 0;
  let isStable = true;

  if (typeof config.value === "number") {
    bonusValue = config.value;
  } else {
    const { options } = config.value;
    const index = EntityCalc.getBonusValueOptionIndex(config.value, info, inputs);

    bonusValue = options[index] ?? (index > 0 ? options[options.length - 1] : 0);
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

  // ========== APPLY SUF-EXTRA ==========
  if (typeof config.sufExtra === "number") {
    bonusValue += config.sufExtra;
  } else if (config.sufExtra && EntityCalc.isApplicableEffect(config.sufExtra, info, inputs)) {
    bonusValue += getArtifactBareBonus({ ...args, config: config.sufExtra }).value;
  }

  if (config.max && bonusValue > config.max) bonusValue = config.max;

  return {
    id: config.id,
    value: Math.max(bonusValue, 0),
    isStable,
  };
}
