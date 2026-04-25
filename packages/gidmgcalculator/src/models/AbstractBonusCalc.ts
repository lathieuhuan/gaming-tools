import { Array_ } from "ron-utils";

import type {
  BareBonus,
  BonusAttributeScalingSpec,
  BonusCoreSpec,
  BonusPerformTools,
  BonusScalingAttribute,
  EffectExtraSpec,
  EffectMaxSpec,
  TeamMember,
} from "@/types";
import { Team } from "./Team";

import { AbstractEffectValueCalc, EffectToGetInitialValue } from "./AbstractEffectValueCalc";

export abstract class AbstractBonusCalc<
  TPerformer extends TeamMember = TeamMember
> extends AbstractEffectValueCalc<TPerformer> {
  //
  protected basedOnFixed = false;
  protected refi = 0;

  constructor(
    protected performer: TPerformer,
    protected team: Team,
    { inputs = [], refi = 0, basedOnFixed = false }: Partial<BonusPerformTools>
  ) {
    super(performer, team, inputs);

    this.refi = refi;
    this.basedOnFixed = basedOnFixed;
  }

  protected scaleRefi(base: number, increment = base / 3) {
    return base + increment * this.refi;
  }

  protected parseBasedOn(config: BonusAttributeScalingSpec) {
    return typeof config === "string" ? { field: config } : config;
  }

  protected abstract getBasedOn(config: BonusAttributeScalingSpec): {
    field: BonusScalingAttribute;
    value: number;
    isDynamic: boolean;
  };

  protected getMax(spec?: EffectMaxSpec) {
    if (typeof spec === "number") {
      return this.scaleRefi(spec);
    }

    if (spec) {
      let finalMax = spec.value;

      if (spec.basedOn) {
        finalMax *= this.getBasedOn(spec.basedOn).value;
      }
      finalMax += this.getExtra(spec.extras);
      finalMax = this.scaleRefi(finalMax, spec.incre);

      const incre = this.getLevelIncre(spec.lvIncre);

      finalMax = finalMax * incre.multiplier + incre.extra;

      return finalMax;
    }

    return Infinity;
  }

  protected getExtra(extras: EffectExtraSpec | EffectExtraSpec[] = []) {
    let result = 0;

    for (const extra of Array_.toArray(extras)) {
      if (this.isPerformableEffect(extra)) {
        result += extra.value;
      }
    }

    return result;
  }

  getInitialValue(effect: EffectToGetInitialValue) {
    const config = effect.value;
    const incre = this.getLevelIncre(effect.lvIncre);

    if (typeof config === "number") {
      return config * incre.multiplier + incre.extra;
    }
    const { options } = config;
    let index = this.getIndexOfEffectValue(config);

    index += this.getExtra(config.extra);

    if (config.max) {
      index = Math.min(index, this.getMax(config.max));
    }

    return this.optionAt(index, options) * incre.multiplier + incre.extra;
  }

  protected applyExtra(bonus: BareBonus, config?: number | BonusCoreSpec) {
    if (typeof config === "number") {
      bonus.value += this.scaleRefi(config);
    } //
    else if (config && this.isPerformableEffect(config)) {
      const extra = this.makeBonus(config);

      if (extra) {
        bonus.value += extra.value;
        // if extra is dynamic, this whole bonus is dynamic
        if (extra.isDynamic) bonus.isDynamic = true;
      }
    }
  }

  // ↓↓↓ STACKS ↓↓↓

  protected get resolveStacks() {
    return 0;
  }

  // ↑↑↑ STACKS ↑↑↑

  makeBonus(spec: BonusCoreSpec): BareBonus {
    const bonus: BareBonus = {
      // id: spec.id,
      value: this.getInitialValue(spec),
      isDynamic: false,
      config: spec,
    };

    bonus.value = this.scaleRefi(bonus.value, spec.incre);

    this.applyExtra(bonus, spec.preExtra);

    if (spec.basedOn) {
      const basedOn = this.getBasedOn(spec.basedOn);

      bonus.value *= basedOn.value;
      bonus.isDynamic = basedOn.isDynamic;
    }

    const stacks = this.getStacks(spec.stacks);
    const { stacksBonus } = spec;

    bonus.value *= stacks?.value ?? 1;

    if (spec.max) {
      bonus.value = Math.min(bonus.value, this.getMax(spec.max));
    }

    if (stacks && stacksBonus) {
      for (const spec of Array_.toArray(stacksBonus)) {
        if (this.isPerformableEffect(spec)) {
          bonus.value += this.scaleRefi(this.getStacksBonus(spec, stacks));
        }
      }
    }

    for (const extra of Array_.toArray(spec.extras)) {
      this.applyExtra(bonus, extra);
    }

    return bonus;
  }
}
