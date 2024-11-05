import type { CharacterBonusCore, EffectMax } from "../types";
import type { BareBonus } from "./bonus-getters.types";
import { BonusGetterCore } from "./bonus-getter-core";
import { CalculationInfo, CharacterCalc, EntityCalc } from "../utils";

export class CharacterBonusGetter extends BonusGetterCore {
  static getIntialBonusValue(
    config: CharacterBonusCore["value"],
    info: CalculationInfo,
    inputs: number[],
    fromSelf = true
  ) {
    if (typeof config === "number") {
      return config;
    }
    const { preOptions, options } = config;
    let index = -1;

    /** Navia */
    if (preOptions && !inputs[1]) {
      const preIndex = preOptions[inputs[0]];
      index += preIndex ?? preOptions[preOptions.length - 1];
    } else {
      index = this.getBonusValueByOption(config, info, inputs);
    }

    if (config.extra && EntityCalc.isApplicableEffect(config.extra, info, inputs, fromSelf)) {
      index += config.extra.value;
    }
    if (config.max) {
      const max = this.getMax(config.max, info, inputs, fromSelf);
      if (index > max) index = max;
    }

    return options[index] ?? (index > 0 ? options[options.length - 1] : 0);
  }

  private applyExtra(
    bonus: BareBonus,
    config: number | CharacterBonusCore | undefined,
    inputs: number[],
    fromSelf: boolean
  ) {
    if (typeof config === "number") {
      bonus.value += config;
    } //
    else if (config && EntityCalc.isApplicableEffect(config, this.info, inputs, fromSelf)) {
      const extra = this.getBonus(config, inputs, fromSelf);

      if (extra) {
        bonus.value += extra.value;
        // if extra is not stable, this whole bonus is not stable
        if (!extra.isStable) bonus.isStable = false;
      }
    }
  }

  private applyMax(bonus: BareBonus, config: EffectMax | undefined, inputs: number[], fromSelf: boolean) {
    if (typeof config === "number") {
      bonus.value = Math.min(bonus.value, config);
    } //
    else if (config) {
      let finalMax = config.value;

      if (config.basedOn) {
        const basedOn = this.getBasedOn(config.basedOn, inputs, fromSelf);
        finalMax *= basedOn.value;
      }

      if (config.extras) {
        finalMax += BonusGetterCore.getTotalExtraMax(config.extras, this.info, inputs, fromSelf);
      }

      bonus.value = Math.min(bonus.value, finalMax);
    }
  }

  getBonus(config: CharacterBonusCore, inputs: number[], fromSelf: boolean): BareBonus {
    const initial: BareBonus = {
      id: config.id,
      value:
        CharacterBonusGetter.getIntialBonusValue(config.value, this.info, inputs, fromSelf) *
        CharacterCalc.getLevelScale(config.lvScale, this.info, inputs, fromSelf),
      isStable: true,
    };

    this.applyExtra(initial, config.preExtra, inputs, fromSelf);

    this.applyBasedOn(initial, config.basedOn, inputs, fromSelf);

    initial.value *= this.getStackValue(config.stacks, inputs, fromSelf);

    this.applyExtra(initial, config.sufExtra, inputs, fromSelf);

    this.applyMax(initial, config.max, inputs, fromSelf);

    return initial;
  }
}
