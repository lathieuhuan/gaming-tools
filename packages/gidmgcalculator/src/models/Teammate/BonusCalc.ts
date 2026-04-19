import type { BonusAttributeBaseSpec, InputStack, TalentLevelScaleSpec } from "@/types";

import { AbstractBonusCalc } from "../AbstractBonusCalc";

export class BonusCalc extends AbstractBonusCalc {
  protected getBasedOn(config: BonusAttributeBaseSpec) {
    const { field, altIndex, baseline = 0, isDynamic = true } = this.parseBasedOn(config);
    const basedOnValue = this.getInput(altIndex);

    return {
      field,
      value: Math.max(basedOnValue - baseline, 0),
      isDynamic,
    };
  }

  protected getTalentLevel(config: TalentLevelScaleSpec) {
    return this.getInput(config.altIndex);
  }

  protected getInputIndex(stack: InputStack) {
    return stack.altIndex ?? stack.index ?? 0;
  }
}
