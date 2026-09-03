import type { Character } from "@/models/Character";
import type {
  BonusAttributeScalingSpec,
  InputStackSpec,
  TalentLevelIncrementBaseSpec,
} from "@/types";

import { AbstractBonusCalc } from "./AbstractBonusCalc";

export class BonusCalc extends AbstractBonusCalc<Character> {
  protected getBasedOn(config: BonusAttributeScalingSpec) {
    const { field, baseline = 0, isDynamic = true, max } = this.parseBasedOn(config);
    let basedOnValue = this.performer.attrCtrl.total(field, this.basedOnStatic);

    if (max) {
      basedOnValue = Math.min(basedOnValue, max);
    }

    return {
      field,
      value: Math.max(basedOnValue - baseline, 0),
      isDynamic,
    };
  }

  protected getTalentLevel(config: TalentLevelIncrementBaseSpec): number {
    return this.performer.finalTalentLv(config.talent);
  }

  protected getInputIndex(stack: InputStackSpec) {
    return stack.index ?? 0;
  }
}
