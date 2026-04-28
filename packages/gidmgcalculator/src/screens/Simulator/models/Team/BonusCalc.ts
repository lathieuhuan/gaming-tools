import { Array_ } from "ron-utils";

import type { Member } from "@/screens/Simulator/models/Member";
import type {
  BareBonus,
  BonusAttributeScalingSpec,
  BonusCoreSpec,
  BonusPerformTools,
  EffectMaxSpec,
  ExtraBonusSpec,
} from "@/types";
import type { Team } from "./Team";

import { baseStatToCoreStat, isBaseStat } from "@/logic/stat.logic";
import { AbstractEffectValueCalc, EffectToGetInitialValue } from "./AbstractEffectValueCalc";

export class BonusCalc extends AbstractEffectValueCalc {
  protected basedOnFixed = false;
  protected refi = 0;

  constructor(
    protected performer: Member,
    protected team: Team,
    { inputs = [], refi = 0, basedOnFixed = false }: Partial<BonusPerformTools>
  ) {
    super(performer, team, inputs);

    this.refi = refi;
    this.basedOnFixed = basedOnFixed;
  }

  protected getBasedOn(config: BonusAttributeScalingSpec) {
    const { field, baseline = 0, isDynamic = true } = this.parseBasedOn(config);
    const { attrsCtrl } = this.performer;

    let basedOnValue: number;

    if (isBaseStat(field)) {
      const attr = attrsCtrl.get(baseStatToCoreStat(field));

      // base stats should not have dynamic bonus
      basedOnValue = attr.base + attr.fiBonus;
    } else {
      basedOnValue = attrsCtrl.getTotal(field, this.basedOnFixed);
    }

    return {
      field,
      value: Math.max(basedOnValue - baseline, 0),
      isDynamic,
    };
  }

  protected scaleRefi(base: number, increment = base / 3) {
    return base + increment * this.refi;
  }

  protected parseBasedOn(config: BonusAttributeScalingSpec) {
    return typeof config === "string" ? { field: config } : config;
  }

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

  getInitialValue(effect: EffectToGetInitialValue) {
    const spec = effect.value;
    const incre = this.getLevelIncre(effect.lvIncre);

    if (typeof spec === "number") {
      return spec * incre.multiplier + incre.extra;
    }

    const index = this.getIndexOfEffectValue(spec);

    return this.itemAt(index, spec.options) * incre.multiplier + incre.extra;
  }

  protected applyExtra(bonus: BareBonus, spec?: number | ExtraBonusSpec) {
    if (typeof spec === "number") {
      bonus.value += this.scaleRefi(spec);
    } //
    else if (spec && this.isPerformableEffect(spec)) {
      const extra = this.makeBonus(spec);

      if (extra) {
        bonus.value += extra.value;
        // if extra is dynamic, this whole bonus is dynamic
        if (extra.isDynamic) bonus.isDynamic = true;
      }
    }
  }

  makeBonus(spec: BonusCoreSpec): BareBonus {
    const bonus: BareBonus = {
      // id: spec.id,
      value: this.getInitialValue(spec),
      isDynamic: false,
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
