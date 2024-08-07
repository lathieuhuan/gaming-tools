import type { CharacterBonusCore } from "@Src/backend/types";
import type { BareBonus, GetBonusArgs } from "./bonus-getters.types";
import { CharacterCalc, EntityCalc, type CalculationInfo } from "@Src/backend/utils";
import { toArray } from "@Src/utils";

export function getCharacterBareBonus(args: GetBonusArgs<CharacterBonusCore>): BareBonus {
  const { config, info, inputs, fromSelf } = args;
  const { preExtra, basedOn } = config;
  let bonusValue = getIntialCharacterBonusValue(config.value, info, inputs, fromSelf);
  let isStable = true;

  // ========== APPLY LEVEL SCALE ==========
  bonusValue *= CharacterCalc.getLevelScale(config.lvScale, info, inputs, fromSelf);

  // ========== ADD PRE-EXTRA ==========
  if (typeof preExtra === "number") {
    bonusValue += preExtra;
  } else if (preExtra && EntityCalc.isApplicableEffect(preExtra, info, inputs, fromSelf)) {
    // if preExtra is not stable, this whole bonus is not stable
    const { value, isStable: isStablePreExtra } = getCharacterBareBonus({
      ...args,
      config: preExtra,
    });
    bonusValue += value;
    if (!isStablePreExtra) isStable = false;
  }

  // ========== APPLY BASED ON ==========
  if (basedOn) {
    const { field, alterIndex = 0, baseline = 0 } = typeof basedOn === "string" ? { field: basedOn } : basedOn;
    const basedOnValue = fromSelf ? args.getTotalAttrFromSelf(field) : inputs[alterIndex] ?? 1;
    bonusValue *= Math.max(basedOnValue - baseline, 0);

    if (field !== "base_atk") isStable = false;
  }

  // ========== APPLY STACKS ==========
  if (config.stacks) {
    for (const stack of toArray(config.stacks)) {
      if (["NATION", "RESOLVE"].includes(stack.type) && !info.partyData.length) {
        return {
          id: "",
          value: 0,
          isStable: true,
        };
      }
      bonusValue *= EntityCalc.getStackValue(stack, info, inputs, fromSelf);
    }
  }

  // ========== APPLY MAX ==========
  if (typeof config.max === "number") {
    bonusValue = Math.min(bonusValue, config.max);
  } else if (config.max) {
    const { basedOn } = config.max;
    let finalMax = config.max.value;

    if (basedOn) {
      const { field, alterIndex = 0, baseline = 0 } = typeof basedOn === "string" ? { field: basedOn } : basedOn;
      const basedOnValue = fromSelf ? args.getTotalAttrFromSelf(field) : inputs[alterIndex] ?? 1;
      finalMax *= Math.max(basedOnValue - baseline, 0);
    }

    if (config.max.extras) {
      finalMax += EntityCalc.getTotalExtraMax(config.max.extras, info, inputs, fromSelf);
    }

    bonusValue = Math.min(bonusValue, finalMax);
  }

  return {
    id: config.id,
    value: bonusValue,
    isStable,
  };
}

export function getIntialCharacterBonusValue(
  value: CharacterBonusCore["value"],
  info: CalculationInfo,
  inputs: number[],
  fromSelf: boolean
) {
  if (typeof value === "number") return value;
  const { preOptions, options } = value;
  let index = -1;

  /** Navia */
  if (preOptions && !inputs[1]) {
    const preIndex = preOptions[inputs[0]];
    index += preIndex ?? preOptions[preOptions.length - 1];
  } else {
    index = EntityCalc.getBonusValueOptionIndex(value, info, inputs);
  }

  if (value.extra && EntityCalc.isApplicableEffect(value.extra, info, inputs, fromSelf)) {
    index += value.extra.value;
  }
  if (value.max) {
    const max = EntityCalc.getMax(value.max, info, inputs, fromSelf);
    if (index > max) index = max;
  }

  return options[index] ?? (index > 0 ? options[options.length - 1] : 0);
}
