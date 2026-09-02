import type { EffectMaxSpec, PenaltyCoreSpec, TeamMember } from "@/types";

import { AbstractEffectCalc, EffectToGetInitialValue } from "./AbstractEffectCalc";

export abstract class AbstractPenaltyCalc<
  TPerformer extends TeamMember = TeamMember,
> extends AbstractEffectCalc<TPerformer> {
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

  protected getMax(spec?: EffectMaxSpec) {
    if (typeof spec === "number") {
      return spec;
    }

    // penalty is only number for now, not support EffectDynamicMaxSpec yet

    return Infinity;
  }

  makePenalty(debuff: PenaltyCoreSpec) {
    const { preExtra } = debuff;
    let result = this.getInitialValue(debuff);

    if (typeof preExtra === "number") {
      result += preExtra;
    } //
    else if (preExtra && this.isEffectPerformable(preExtra)) {
      result += this.makePenalty(preExtra);
    }

    const stacks = this.getStacks(debuff.stacks);
    const { stacksBonus } = debuff;

    result *= stacks?.value ?? 1;

    if (debuff.max) {
      result = Math.min(result, this.getMax(debuff.max));
    }

    if (stacks && stacksBonus && this.isEffectPerformable(stacksBonus)) {
      result += this.getStacksBonus(stacksBonus, stacks);
    }

    return Math.max(result, 0);
  }
}
