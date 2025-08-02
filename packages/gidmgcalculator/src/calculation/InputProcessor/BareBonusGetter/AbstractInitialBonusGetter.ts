import type {
  CharacterEffectLevelIncrement,
  CharacterEffectLevelScale,
  EffectExtra,
  EffectMax,
  EffectValueByOption,
  EntityBonusBasedOn,
  EntityBonusBasedOnField,
  EntityBonusEffect,
} from "@Src/calculation/types";
import { BonusGetterSupport } from "./BareBonusGetter.types";

export abstract class AbstractInitialBonusGetter {
  // ========== UTILS ==========

  protected scaleRefi(base: number, refi = 0, increment = base / 3) {
    return base + increment * refi;
  }

  abstract getLvIncre(incre: CharacterEffectLevelIncrement | undefined, inputs: number[]): number;
  abstract getLevelScale(scale: CharacterEffectLevelScale | undefined, inputs: number[]): number;
  protected abstract getExtra(extras: EffectExtra | EffectExtra[] | undefined, inputs: number[]): number;
  protected abstract getBasedOn(
    config: EntityBonusBasedOn,
    support: BonusGetterSupport
  ): {
    field: EntityBonusBasedOnField;
    value: number;
  };
  protected abstract getIndexOfEffectValue(config: Pick<EffectValueByOption, "optIndex">, inputs: number[]): number;

  protected parseBasedOn = (config: EntityBonusBasedOn) => {
    return typeof config === "string" ? { field: config } : config;
  };

  /**
   * @param support must have when config is EffectDynamicMax
   */
  protected applyMax = (value: number, config: EffectMax | undefined, support?: BonusGetterSupport) => {
    if (typeof config === "number") {
      return Math.min(value, this.scaleRefi(config, support?.refi));
    } //
    else if (config && support) {
      let finalMax = config.value;

      if (config.basedOn) {
        finalMax *= this.getBasedOn(config.basedOn, support).value;
      }
      finalMax += this.getExtra(config.extras, support.inputs);
      finalMax = this.scaleRefi(finalMax, support.refi, config.incre);
      finalMax += this.getLvIncre(config.lvIncre, support.inputs);

      return Math.min(value, finalMax);
    }
    return value;
  };

  // ========== MAIN ==========

  getInitialBonusValue = (config: EntityBonusEffect["value"], support: BonusGetterSupport) => {
    if (typeof config === "number") {
      return config;
    }
    const { options } = config;
    let index = this.getIndexOfEffectValue(config, support.inputs);

    index += this.getExtra(config.extra, support.inputs);
    index = this.applyMax(index, config.max, support);

    return options[index] ?? (index > 0 ? options[options.length - 1] : 0);
  };
}
