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

  override get resolveStacks() {
    let [totalEnergy = 0, electroEnergy = 0] = this.inputs;
    if (this.performer.cons >= 1 && electroEnergy <= totalEnergy) {
      totalEnergy += electroEnergy * 0.8 + (totalEnergy - electroEnergy) * 0.2;
    }
    const level = this.performer.getFinalTalentLv("EB");
    const stackPerEnergy = Math.min(Math.ceil(14.5 + level * 0.5), 20);
    const stacks = Math.round(totalEnergy * stackPerEnergy) / 100;

    return Math.min(stacks, 60);
  }

  protected getInputIndex(stack: InputStackSpec) {
    return stack.index ?? 0;
  }
}
