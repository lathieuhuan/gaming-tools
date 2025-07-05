import { isApplicableEffect } from "@Src/calculation/common";
import { EntityPenaltyCore } from "@Src/calculation/types";
import { EffectValueGetter } from "../EffectValueGetter";

export class PenaltiesGetter extends EffectValueGetter {
  //

  protected getInitialPenaltyValue = (config: EntityPenaltyCore["value"], inputs: number[] = []) => {
    if (typeof config === "number") {
      return config;
    }
    const { options } = config;
    const index = this.getIndexOfEffectValue(config, inputs);

    return options[index] ?? (index > 0 ? options[options.length - 1] : 0);
  };

  protected getPenaltyValue = (debuff: EntityPenaltyCore, inputs: number[], fromSelf = true) => {
    const { preExtra } = debuff;
    let result = this.getInitialPenaltyValue(debuff.value, inputs);

    result *= this.characterData.getLevelScale(debuff.lvScale, inputs, fromSelf);

    if (typeof preExtra === "number") {
      result += preExtra;
    } else if (preExtra && isApplicableEffect(preExtra, this.characterData, inputs, fromSelf)) {
      result += this.getPenaltyValue(preExtra, inputs, fromSelf);
    }
    if (debuff.max) result = Math.min(result, debuff.max);

    return Math.max(result, 0);
  };
}
