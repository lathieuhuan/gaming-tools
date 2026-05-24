import type {
  BonusAttributeScalingSpec,
  InputStackSpec,
  TalentLevelIncrementBaseSpec,
} from "@/types";
import type { Character } from "./Character";

import { AbstractBonusCalc } from "../AbstractBonusCalc";

export class BonusCalc extends AbstractBonusCalc<Character> {
  protected getBasedOn(config: BonusAttributeScalingSpec) {
    const { field, baseline = 0, isDynamic = true } = this.parseBasedOn(config);
    const basedOnValue = this.performer.allAttrsCtrl.getTotal(field, this.basedOnFixed);

    return {
      field,
      value: Math.max(basedOnValue - baseline, 0),
      isDynamic,
    };
  }

  protected getTalentLevel(config: TalentLevelIncrementBaseSpec): number {
    return this.performer.getFinalTalentLv(config.talent);
  }

  protected getInputIndex(stack: InputStackSpec) {
    return stack.index ?? 0;
  }
}
