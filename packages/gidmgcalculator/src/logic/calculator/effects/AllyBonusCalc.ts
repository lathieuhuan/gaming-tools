import type {
  BonusAttributeScalingSpec,
  InputStackSpec,
  TalentLevelIncrementBaseSpec,
} from "@/types";

import { AbstractBonusCalc } from "./AbstractBonusCalc";

export class AllyBonusCalc extends AbstractBonusCalc {
  protected getBasedOn(config: BonusAttributeScalingSpec) {
    const { field, altIndex, baseline = 0, isDynamic = true, max } = this.parseBasedOn(config);
    let basedOnValue = this.getInput(altIndex);

    if (max) {
      basedOnValue = Math.min(basedOnValue, max);
    }

    return {
      field,
      value: Math.max(basedOnValue - baseline, 0),
      isDynamic,
    };
  }

  protected getTalentLevel(config: TalentLevelIncrementBaseSpec) {
    return this.getInput(config.altIndex);
  }

  protected getInputIndex(stack: InputStackSpec) {
    return stack.altIndex ?? stack.index ?? 0;
  }
}
