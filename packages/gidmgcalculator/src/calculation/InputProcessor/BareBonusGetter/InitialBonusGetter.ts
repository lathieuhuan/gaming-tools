import type { CalcTeamData } from "@Src/calculation/utils/CalcTeamData";
import type {
  CharacterEffectLevelIncrement,
  CharacterEffectLevelScale,
  EffectExtra,
  EffectMax,
  EffectValue,
  EffectValueByOption,
  EntityBonusBasedOn,
} from "@Src/calculation/types";
import type { TotalAttributeControl } from "../TotalAttributeControl";
import type { BonusGetterSupport, SupportInfo } from "./BareBonusGetter.types";

import Array_ from "@Src/utils/array-utils";
import { getLevelScale } from "../utils/getLevelScale";
import { getIndexOfEffectValue } from "../utils/getIndexOfEffectValue";

export class InitialBonusGetter<T extends CalcTeamData = CalcTeamData> {
  //
  constructor(protected teamData: T, protected totalAttrCtrl?: TotalAttributeControl) {}

  protected scaleRefi(base: number, refi = 0, increment = base / 3) {
    return base + increment * refi;
  }

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
      finalMax += this.getExtra(config.extras, support);
      finalMax = this.scaleRefi(finalMax, support.refi, config.incre);
      finalMax += this.getLvIncre(config.lvIncre, support);

      return Math.min(value, finalMax);
    }
    return value;
  };

  getLvIncre(incre: CharacterEffectLevelIncrement | undefined, support: SupportInfo) {
    if (incre) {
      const { talent, value, altIndex = 0 } = incre;
      const level = support.fromSelf ? this.teamData.getFinalTalentLv(talent) : support.inputs[altIndex] ?? 0;
      return level * value;
    }
    return 0;
  }

  getLevelScale = (scale: CharacterEffectLevelScale | undefined, support: SupportInfo): number => {
    return getLevelScale(scale, this.teamData, support.inputs, support.fromSelf);
  };

  protected getExtra = (extras: EffectExtra | EffectExtra[] | undefined, support: SupportInfo) => {
    if (!extras) return 0;
    let result = 0;

    for (const extra of Array_.toArray(extras)) {
      if (this.teamData.isApplicableEffect(extra, support.inputs, support.fromSelf)) {
        result += extra.value;
      }
    }
    return result;
  };

  protected getBasedOn = (config: EntityBonusBasedOn, support: BonusGetterSupport) => {
    const { field, altIndex = 0, baseline = 0 } = this.parseBasedOn(config);
    let basedOnValue = 1;

    if (support.fromSelf) {
      if (this.totalAttrCtrl) {
        basedOnValue = support.basedOnStable
          ? this.totalAttrCtrl.getTotalStable(field)
          : this.totalAttrCtrl.getTotal(field);
      }
    } else {
      basedOnValue = support.inputs[altIndex] ?? 1;
    }
    return {
      field,
      value: Math.max(basedOnValue - baseline, 0),
    };
  };

  protected getIndexOfEffectValue(config: EffectValueByOption, support: SupportInfo): number {
    const { preOptions } = config;
    const { inputs } = support;
    let index = -1;

    /** Navia */
    if (preOptions && !inputs[1]) {
      const preIndex = preOptions[inputs[0]];
      index += preIndex ?? preOptions[preOptions.length - 1];
    } else {
      index = getIndexOfEffectValue(config.optIndex, this.teamData, inputs, support.fromSelf);
    }

    return index;
  }

  getInitialValue = (config: EffectValue, support: BonusGetterSupport) => {
    if (typeof config === "number") {
      return config;
    }
    const { options } = config;
    let index = this.getIndexOfEffectValue(config, support);

    index += this.getExtra(config.extra, support);
    index = this.applyMax(index, config.max, support);

    return options[index] ?? (index > 0 ? options[options.length - 1] : 0);
  };
}
