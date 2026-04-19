import type { PenaltyCoreSpec, TeamMember } from "@/types";

import { AbstractEffectValueCalc, EffectToGetInitialValue } from "./AbstractEffectValueCalc";

export abstract class AbstractPenaltyCalc<
  TPerformer extends TeamMember = TeamMember
> extends AbstractEffectValueCalc<TPerformer> {
  //
  getInitialValue(effect: EffectToGetInitialValue) {
    const config = effect.value;
    const incre = this.getLevelIncre(effect.lvIncre);

    if (typeof config === "number") {
      return config * incre.multiplier + incre.extra;
    }
    const { options } = config;
    const index = this.getIndexOfEffectValue(config);

    const value = options[index] ?? (index > 0 ? options[options.length - 1] : 0);

    return value * incre.multiplier + incre.extra;
  }

  makePenalty(debuff: PenaltyCoreSpec) {
    const { preExtra } = debuff;
    let result = this.getInitialValue(debuff);

    if (typeof preExtra === "number") {
      result += preExtra;
    } else if (preExtra) {
      if (
        this.team.isAvailableEffect(preExtra) &&
        this.performer.canPerformEffect(preExtra, this.inputs)
      ) {
        result += this.makePenalty(preExtra);
      }
    }
    if (debuff.max) result = Math.min(result, debuff.max);

    return Math.max(result, 0);
  }
}
