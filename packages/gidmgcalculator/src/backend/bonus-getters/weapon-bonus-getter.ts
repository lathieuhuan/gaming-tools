import type { WeaponBonusCore } from "../types";
import type { BareBonus } from "./bonus-getters.types";
import { EntityCalc } from "../utils";
import { BonusGetterCore } from "./bonus-getter-core";

export class WeaponBonusGetter extends BonusGetterCore {
  private scaleRefi(base: number, refi: number, increment = base / 3) {
    return base + increment * refi;
  }

  private applyExtra(
    bonus: BareBonus,
    config: number | WeaponBonusCore | undefined,
    inputs: number[],
    fromSelf: boolean,
    refi: number
  ) {
    if (typeof config === "number") {
      bonus.value += config;
    } //
    else if (config && EntityCalc.isApplicableEffect(config, this.info, inputs, fromSelf)) {
      const extra = this.getBonus(config, refi, inputs, fromSelf);

      if (extra) {
        bonus.value += extra.value;
        // if extra is not stable, this whole bonus is not stable
        if (!extra.isStable) bonus.isStable = false;
      }
    }
  }

  private applyMax(bonus: BareBonus, config: WeaponBonusCore["max"], refi: number) {
    if (config) {
      const { value, incre = undefined } = typeof config === "number" ? { value: config } : config;
      const max = this.scaleRefi(value, refi, incre);
      bonus.value = Math.min(bonus.value, max);
    }
  }

  getBonus(config: WeaponBonusCore, refi: number, inputs: number[], fromSelf: boolean): BareBonus {
    const initial: BareBonus = {
      id: config.id,
      value: 0,
      isStable: true,
    };

    if (typeof config.value === "number") {
      initial.value = this.scaleRefi(config.value, refi, config.incre);
    } else {
      const { options } = config.value;
      const index = BonusGetterCore.getBonusValueByOption(config.value, this.info, inputs);

      initial.value = options[index] ?? (index > 0 ? options[options.length - 1] : 0);
      initial.value = this.scaleRefi(initial.value, refi, config.incre);
    }

    this.applyExtra(initial, config.preExtra, inputs, fromSelf, refi);

    this.applyBasedOn(initial, config.basedOn, inputs, fromSelf);

    initial.value *= this.getStackValue(config.stacks, inputs, fromSelf);

    this.applyExtra(initial, config.sufExtra, inputs, fromSelf, refi);

    this.applyMax(initial, config.max, refi);

    return initial;
  }
}
