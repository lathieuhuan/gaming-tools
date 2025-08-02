import { CalcTeamData } from "@Src/calculation/utils/CalcTeamData";
import { EntityPenaltyEffect } from "@Src/calculation/types";
import { getIndexOfEffectValue } from "../utils/getIndexOfEffectValue";
import { getLevelScale } from "../utils/getLevelScale";

export class PenaltiesGetter {
  constructor(protected teamData: CalcTeamData) {}

  protected getInitialPenaltyValue = (config: EntityPenaltyEffect["value"], inputs: number[] = []) => {
    if (typeof config === "number") {
      return config;
    }
    const { options } = config;
    const index = getIndexOfEffectValue(config.optIndex, this.teamData, inputs);

    return options[index] ?? (index > 0 ? options[options.length - 1] : 0);
  };

  protected getPenaltyValue = (debuff: EntityPenaltyEffect, inputs: number[], fromSelf = true) => {
    const { preExtra } = debuff;
    let result = this.getInitialPenaltyValue(debuff.value, inputs);

    result *= getLevelScale(debuff.lvScale, this.teamData, inputs, fromSelf);

    if (typeof preExtra === "number") {
      result += preExtra;
    } else if (preExtra && this.teamData.isApplicableEffect(preExtra, inputs, fromSelf)) {
      result += this.getPenaltyValue(preExtra, inputs, fromSelf);
    }
    if (debuff.max) result = Math.min(result, debuff.max);

    return Math.max(result, 0);
  };
}
