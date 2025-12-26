import type { CalcCharacter } from "@/models/base";
import type {
  CharacterEffectLevelIncrement,
  EffectValueByOption,
  EntityBonusBasedOn,
  InputStack,
  TalentLevelScaleConfig,
} from "@/types";

import { AbstractBonusCalc } from "../AbstractBonusCalc";

export class BonusCalc extends AbstractBonusCalc<CalcCharacter> {
  protected getLvIncre(incre?: CharacterEffectLevelIncrement) {
    return incre ? this.performer.getFinalTalentLv(incre.talent) * incre.value : 0;
  }

  protected getBasedOn(config: EntityBonusBasedOn) {
    const { field, baseline = 0 } = this.parseBasedOn(config);
    const basedOnValue = this.performer.getTotalAttr(field, this.basedOnFixed) || 0;

    return {
      field,
      value: Math.max(basedOnValue - baseline, 0),
    };
  }

  protected getTalentLevel(config: TalentLevelScaleConfig): number {
    return this.performer.getFinalTalentLv(config.talent);
  }

  protected override getIndexOfEffectValue(config: EffectValueByOption): number {
    const { preOptions } = config;
    let index = -1;
    const [useOptions = 0, preOptionIndex = 0] = this.inputs;

    /** Navia */
    if (preOptions && !useOptions) {
      const preIndex = preOptions[preOptionIndex];
      index += preIndex ?? preOptions[preOptions.length - 1];
    } else {
      index = super.getIndexOfEffectValue(config);
    }

    return index;
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

  protected getInputIndex(stack: InputStack) {
    return stack.index ?? 0;
  }
}
