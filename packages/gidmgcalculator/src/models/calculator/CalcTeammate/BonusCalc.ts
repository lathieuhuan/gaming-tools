import type {
  CharacterEffectLevelIncrement,
  EntityBonusBasedOn,
  InputStack,
  TalentLevelScaleConfig,
} from "@/types";

import { AbstractBonusCalc } from "@/models/base";

export class BonusCalc extends AbstractBonusCalc {
  protected getLvIncre(incre?: CharacterEffectLevelIncrement) {
    return incre ? this.getInput(incre.altIndex) * incre.value : 0;
  }

  protected getBasedOn(config: EntityBonusBasedOn) {
    const { field, altIndex, baseline = 0 } = this.parseBasedOn(config);
    const basedOnValue = this.getInput(altIndex);

    return {
      field,
      value: Math.max(basedOnValue - baseline, 0),
    };
  }

  protected getTalentLevel(config: TalentLevelScaleConfig) {
    return this.getInput(config.altIndex);
  }

  protected getInputIndex(stack: InputStack) {
    return stack.altIndex ?? stack.index ?? 0;
  }
}
