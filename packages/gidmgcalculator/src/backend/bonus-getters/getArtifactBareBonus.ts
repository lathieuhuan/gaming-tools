import type { ArtifactBonusCore } from "@Src/backend/types";
import type { BareBonus, GetBonusArgs } from "./bonus-getters.types";
import { EntityCalc } from "@Src/backend/utils";
import { toArray } from "@Src/utils";

export function getArtifactBareBonus(args: GetBonusArgs<ArtifactBonusCore>): BareBonus {
  const { config, info, inputs, fromSelf } = args;
  let bonusValue = 0;
  let isStable = true;

  if (typeof config.value === "number") {
    bonusValue = config.value;
  } else {
    const { options } = config.value;
    const index = EntityCalc.getBonusValueOptionIndex(config.value, info, inputs);

    bonusValue = options[index] ?? (index > 0 ? options[options.length - 1] : 0);
  }

  // ========== APPLY STACKS ==========
  if (config.stacks) {
    for (const stack of toArray(config.stacks)) {
      if (stack.type === "ELEMENT" && !info.partyData.length) {
        return {
          id: "",
          value: 0,
          isStable,
        };
      }
      bonusValue *= EntityCalc.getStackValue(stack, info, inputs, fromSelf, args.getTotalAttrFromSelf);
    }
  }

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
